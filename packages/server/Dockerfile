# dsh-relay-server —— NAS 端（Docker）
#
# 构建： docker build -t dsh-relay-server .
# 运行： 见 docker-compose.yml（推荐）

FROM node:22-alpine

WORKDIR /app
RUN addgroup -S relay && adduser -S relay -G relay

COPY package.json ./
COPY src ./src
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

USER relay
EXPOSE 8443

HEALTHCHECK --interval=60s --timeout=5s \
  CMD wget --no-check-certificate -qO- https://127.0.0.1:${RELAY_PORT:-8443}/__relay/status 2>/dev/null | grep -q '"ok":true' || exit 1

CMD ["node", "src/server.mjs"]
