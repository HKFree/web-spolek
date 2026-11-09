# --- build ---
FROM docker.io/library/node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx astro telemetry disable && npm run build \
 && mv dist/nginx-redirects.conf /tmp/redirects.conf

# --- runtime: statika na portu 80 ---
FROM docker.io/library/nginx:1-alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/redirects.conf /etc/nginx/redirects.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
