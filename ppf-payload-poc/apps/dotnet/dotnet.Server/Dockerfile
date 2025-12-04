FROM node:20-alpine AS node-base

ARG VITE_TENANT_SLUG
ARG VITE_SERVER_URL
ARG VITE_CMS_URL

ENV VITE_TENANT_SLUG=$VITE_TENANT_SLUG
ENV VITE_CMS_URL=$VITE_CMS_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN corepack enable
RUN corepack prepare yarn@4.5.1 --activate
# Or use this to install latest yarn - RUN corepack prepare yarn@stable --activate

FROM node-base as builder
# RUN apk add --no-cache libc6-compat
# RUN apk update
WORKDIR /frontend
COPY . .
RUN --mount=type=secret,id=yarnauthident \
    (ls /run/secrets/yarnauthident \
    && export authident=$(cat /run/secrets/yarnauthident) \
    && yarn config set npmAuthIdent ${authident}) || true
RUN --mount=type=secret,id=sytemauthtoken \
    (ls /run/secrets/sytemauthtoken \
    && export authtoken=$(cat /run/secrets/sytemauthtoken) \
    && yarn config set npmAuthToken ${authtoken}) || true

# Generate /outjson and /out/full for what is required to build dotnet/dotnet.client project
RUN yarn dlx turbo prune --scope=dotnet.client --docker
FROM node-base AS installer
# RUN apk add --no-cache libc6-compat
# RUN apk update
WORKDIR /frontend

# Install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /frontend/out/json/ .
COPY --from=builder /frontend/out/yarn.lock ./yarn.lock
COPY --from=builder /frontend/.yarnrc.yml ./
COPY --from=builder /frontend/out/full/ .

RUN yarn install

# Build the pruned project
RUN yarn dlx turbo run build --cache=local:r --filter=dotnet.client

# -----------------------------
# NOTE: Skipping frontend tests as there are not tests yet
# -----------------------------
# Test the project
# WORKDIR /frontend/apps/dotnet/dotnet.client
# RUN yarn test:run

#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 3000 

ENV ASPNETCORE_URLS=http://*:3000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# RUN apt-get update
# RUN apt-get install -y curl
# RUN apt-get install -y libpng-dev libjpeg-dev curl libxi6 build-essential libgl1-mesa-glx
# RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
# RUN apt-get install -y nodejs

# RUN npm install --global yarn

ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY --from=installer /frontend .

COPY ["apps/dotnet/dotnet.Server/dotnet.Server.csproj", "apps/dotnet/dotnet.Server/"]

COPY ["apps/dotnet/NuGet.Config", "apps/dotnet/"]

RUN --mount=type=secret,id=sytemauthtoken \
    (ls /run/secrets/sytemauthtoken \
    && export authtoken=$(cat /run/secrets/sytemauthtoken) \
    && sed -i 's/%Nuget_CustomFeedPassword%/'"${authtoken}"'/g' apps/dotnet/NuGet.Config) || true

COPY apps/dotnet/dotnet.Server apps/dotnet/dotnet.Server

# COPY apps/dotnet/dotnet.Server.Tests apps/dotnet/dotnet.Server.Tests

WORKDIR "/src/apps/dotnet/dotnet.Server"

RUN dotnet restore

RUN rm ../NuGet.Config

RUN dotnet build "./dotnet.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

# -----------------------------
# NOTE: Skipping backend tests as there are not tests yet
# -----------------------------
# WORKDIR "/src/apps/dotnet/dotnet.Server.Tests"
# RUN dotnet restore
# RUN dotnet test

FROM build AS publish
WORKDIR "/src/apps/dotnet/dotnet.Server"
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./dotnet.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=installer /frontend/apps/dotnet/dotnet.client/dist /app/wwwroot

ENTRYPOINT ["dotnet", "dotnet.Server.dll"]