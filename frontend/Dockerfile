# Frontend Dockerfile for Next.js App
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Accept build-time API URL (for Render or production builds)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build application
RUN npm run build

# Render injects PORT dynamically (default 3000 locally)
EXPOSE 3000

CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p ${PORT:-3000}"]
