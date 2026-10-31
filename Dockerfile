FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies first for layer caching
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
