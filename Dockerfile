# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Install libc6-compat and network tools for Next.js & ngrok
RUN apk add --no-cache libc6-compat curl wget ca-certificates

# Install ngrok binary (auto-detect architecture: amd64 / arm64)
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then NGROK_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then NGROK_ARCH="arm64"; \
    else NGROK_ARCH="amd64"; fi && \
    wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-${NGROK_ARCH}.tgz -O /tmp/ngrok.tgz && \
    tar -xzf /tmp/ngrok.tgz -C /usr/local/bin && \
    rm -f /tmp/ngrok.tgz && \
    ngrok --version

WORKDIR /app

# Step 1: Install dependencies (leveraging layer cache)
COPY package.json package-lock.json ./
COPY mission-control/package.json ./mission-control/

RUN npm ci

# Step 2: Copy necessary source code
COPY backend/ ./backend/
COPY hooks/ ./hooks/
COPY cli/ ./cli/
COPY mission-control/ ./mission-control/
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

# Step 3: Build Mission Control UI for production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w mission-control

# Step 4: Configure runtime environment
ENV NODE_ENV=production
ENV LATCH_PORT=3001
ENV LATCH_UI_ORIGIN=http://localhost:3002

EXPOSE 3001 3002 4040

ENTRYPOINT ["./docker-entrypoint.sh"]
