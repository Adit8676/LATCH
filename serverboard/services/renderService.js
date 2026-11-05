import { spawn } from "node:child_process";

function runRawCli(args, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const child = spawn("render", args, {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: timeoutMs,
      killSignal: "SIGKILL",
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", d => (stdout += d.toString()));
    child.stderr.on("data", d => (stderr += d.toString()));

    child.on("close", code => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim() || `Render CLI process exited with code ${code}`));
      }
    });

    child.on("error", err => {
      if (err.name === "AbortError" || err.code === "ETIMEDOUT") {
        reject(new Error(`Render CLI operation timed out after ${timeoutMs}ms`));
      } else {
        reject(err);
      }
    });
  });
}

async function runCli(args, timeoutMs = 60_000, retryOnMissingWorkspace = true) {
  try {
    return await runRawCli(args, timeoutMs);
  } catch (err) {
    if (retryOnMissingWorkspace && /no workspace set/i.test(err.message)) {
      console.warn("[renderService] No workspace set detected, auto-configuring workspace...");
      const initialized = await RenderService.ensureWorkspace();
      if (initialized) {
        return await runRawCli(args, timeoutMs);
      }
    }
    throw err;
  }
}

export const RenderService = {
  async ensureWorkspace() {
    try {
      const current = await runRawCli(["workspace", "current"]);
      if (current && !/no workspace set/i.test(current)) {
        return true;
      }
    } catch {
      // workspace not set
    }

    try {
      if (process.env.RENDER_WORKSPACE_ID) {
        await runRawCli(["workspace", "set", process.env.RENDER_WORKSPACE_ID]);
        return true;
      }
      const out = await runRawCli(["workspaces", "-o", "json"]);
      const list = JSON.parse(out);
      if (Array.isArray(list) && list.length > 0) {
        const wsId = list[0].id || list[0].name;
        if (wsId) {
          await runRawCli(["workspace", "set", wsId]);
          return true;
        }
      }
    } catch (wsErr) {
      console.warn("[renderService] Auto-workspace setup failed:", wsErr.message);
    }
    return false;
  },

  async linkEnvGroup(serviceId, envGroupId = process.env.ENV_GROUP_ID) {
    if (!serviceId || !envGroupId || serviceId.startsWith("srv-local-")) {
      return { success: true, skipped: true };
    }
    const apiKey = process.env.RENDER_API_KEY;
    if (!apiKey) {
      console.warn("[renderService] RENDER_API_KEY missing, cannot link environment group");
      return { success: false, error: "RENDER_API_KEY missing" };
    }
    try {
      const res = await fetch(`https://api.render.com/v1/env-groups/${envGroupId}/services/${serviceId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn(`[renderService] Failed to link env group ${envGroupId} to service ${serviceId}: ${res.status} ${body}`);
        return { success: false, status: res.status, error: body };
      }
      console.log(`[renderService] Successfully linked env group ${envGroupId} to service ${serviceId}`);
      return { success: true };
    } catch (err) {
      console.warn(`[renderService] linkEnvGroup error:`, err.message || err);
      return { success: false, error: err.message || String(err) };
    }
  },

  async createService({
    name,
    repo,
    branch = "main",
    region = "singapore",
    plan = "free",
    environmentId = process.env.RENDER_ENVIRONMENT_ID,
    envGroupId = process.env.ENV_GROUP_ID,
  }) {
    const args = [
      "services", "create",
      "--name", name,
      "--type", "web_service",
      "--runtime", "docker",
      "--repo", repo,
      "--branch", branch,
      "--region", region,
      "--plan", plan,
    ];
    if (environmentId) {
      args.push("--environment-id", environmentId);
    }
    args.push("-o", "json", "--confirm");
    const output = await runCli(args);
    const result = JSON.parse(output);

    const serviceId = result?.id || result?.service?.id;
    if (serviceId && envGroupId) {
      await this.linkEnvGroup(serviceId, envGroupId).catch(err => {
        console.warn("[renderService] Auto-link env group error:", err.message || err);
      });
    }

    return result;
  },

  async deleteService(serviceId) {
    if (!serviceId || serviceId.startsWith("srv-local-")) {
      return { success: true, local: true };
    }
    return await runCli(["services", "delete", serviceId, "--confirm", "-o", "json"]);
  },

  async getLogs(serviceId, { limit = 100 } = {}) {
    const output = await runCli(["logs", "--resources", serviceId, "--limit", String(limit), "-o", "json"]);
    try {
      return JSON.parse(output);
    } catch {
      return output.split("\n").map(l => ({ message: l }));
    }
  },

  async getDeploys(serviceId) {
    const output = await runCli(["deploys", "list", serviceId, "-o", "json"]);
    return JSON.parse(output);
  },

  async updateService(serviceId, { branch, name, plan } = {}) {
    if (!serviceId || serviceId.startsWith("srv-local-")) {
      return { success: true, local: true, branch, name, plan };
    }
    const args = ["services", "update", serviceId];
    if (branch) args.push("--branch", branch);
    if (name) args.push("--name", name);
    if (plan) args.push("--plan", plan);
    args.push("--confirm", "-o", "json");
    const output = await runCli(args);
    try {
      return JSON.parse(output);
    } catch {
      return { success: true, raw: output };
    }
  },
};
