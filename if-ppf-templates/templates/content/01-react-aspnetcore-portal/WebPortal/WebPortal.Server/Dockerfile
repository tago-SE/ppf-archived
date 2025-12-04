#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:3000
EXPOSE 3000


FROM mcr.microsoft.com/dotnet/sdk:8.0 AS with-node
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get -y install nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

FROM with-node AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["WebPortal.Server/WebPortal.Server.csproj", "WebPortal.Server/"]
COPY ["WebPortal.client/WebPortal.client.esproj", "WebPortal.client/"]
RUN dotnet restore "./WebPortal.Server/WebPortal.Server.csproj"
COPY . .
WORKDIR "/src/WebPortal.Server"
RUN dotnet build "./WebPortal.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./WebPortal.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WebPortal.Server.dll"]
