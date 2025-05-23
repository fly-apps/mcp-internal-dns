# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
FROM node:slim AS base

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

COPY --from=flyio/flyctl /flyctl /usr/bin
ENTRYPOINT [ "/usr/bin/flyctl", "mcp", "wrap", "--" ]
EXPOSE 8080

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "start" ]
