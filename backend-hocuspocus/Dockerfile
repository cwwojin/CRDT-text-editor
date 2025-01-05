FROM node:20.17.0-alpine3.20 AS base

# PNPM Setup
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
RUN pnpm config set store-dir /pnpm/store &&\
  pnpm config set package-import-method copy

# Working Directory
WORKDIR /usr/src/app
COPY package.json .
COPY pnpm-lock.yaml .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm fetch --prefer-offline --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --offline --frozen-lockfile

ENV NODE_ENV=development
COPY . .

ENTRYPOINT pnpm start:dev