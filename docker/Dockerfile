# Base stage for both frontend and backend
FROM node:18-alpine AS base
RUN npm install -g pnpm

# Backend development stage
FROM base AS backend-development
WORKDIR /usr/src/app
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install
COPY backend .
CMD ["pnpm", "run", "start:dev"]

# Backend production stage
FROM base AS backend-production
WORKDIR /usr/src/app
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --prod
COPY backend .
RUN pnpm run build
CMD ["pnpm", "run", "start:prod"]

# Frontend development stage
FROM base AS frontend-development
WORKDIR /usr/src/app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install
COPY frontend .
CMD ["pnpm", "run", "dev"]

# Frontend production stage
FROM base AS frontend-production
WORKDIR /usr/src/app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --prod
COPY frontend .
RUN pnpm run build
CMD ["pnpm", "run", "start"]
