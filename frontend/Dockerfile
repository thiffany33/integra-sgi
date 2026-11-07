FROM node:22-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY frontend frontend
COPY packages/shared packages/shared
ARG VITE_API_URL=http://localhost:3001/api/v1
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build --workspace @integra/shared && npm run build --workspace @integra/web

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
EXPOSE 8080
