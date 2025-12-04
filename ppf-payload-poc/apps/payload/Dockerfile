FROM node:20-alpine AS base
# Installing libc6-compat might be necessary for certain NPM packages that rely on native bindings
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk update
# RUN apk add --no-cache libc6-compat

# Enable Corepack for managing Yarn versions
RUN corepack enable
RUN corepack prepare yarn@4.5.1 --activate

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

COPY . .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030

ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING=""
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING=$NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING


# Build Next.js based on the preferred package manager
#RUN --mount=type=secret,id=npmrc,target=/root/.npmrc yarn --frozen-lockfile
RUN --mount=type=secret,id=yarnauthident \
    (ls /run/secrets/yarnauthident \
    && export authident=$(cat /run/secrets/yarnauthident) \
    && yarn config set npmAuthIdent ${authident}) || true
RUN --mount=type=secret,id=sytemauthtoken \
    (ls /run/secrets/sytemauthtoken \
    && export authtoken=$(cat /run/secrets/sytemauthtoken) \
    && yarn config set npmAuthToken ${authtoken}) || true

RUN yarn dlx turbo prune --scope=payload-cms --docker

RUN yarn install

# Builds the application
# RUN yarn run build
RUN yarn dlx turbo run build --cache=local:r --filter=payload-cms

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/payload/.next/standalone ./next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/apps/payload/.next/static ./next/standalone/apps/payload/.next/static
COPY --from=builder /app/apps/payload/public ./next/standalone/apps/payload/public

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

# Sets environment variables for the production environment
ENV NODE_ENV=production

EXPOSE 3000
ENV PORT 3000

CMD node next/standalone/apps/payload/server.js