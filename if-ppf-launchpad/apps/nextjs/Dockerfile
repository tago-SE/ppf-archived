FROM node:20-alpine AS base
# Installing libc6-compat might be necessary for certain NPM packages that rely on native bindings
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk update
# RUN apk add --no-cache libc6-compat

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package.lock* ./
COPY src ./src
COPY public ./public
COPY next.config.mjs .
COPY tsconfig.json .
COPY .eslintrc.json .
# COPY postcss.config.mjs . 
# COPY tailwind.config.ts .

# COPY .prettierrc ./
# COPY .npmrc .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG KEY_VAULT_URL

# Sets runtime environment variables from the build-time variables
ENV KEY_VAULT_URL $KEY_VAULT_URL

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
# ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js based on the preferred package manager
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc yarn --prefer-offline --frozen-lockfile

# Builds the application
RUN yarn run build

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

# Sets environment variables for the production environment
ENV NODE_ENV=production

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]