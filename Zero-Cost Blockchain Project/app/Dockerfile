FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS build
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_ALCHEMY_API_KEY
ARG VITE_CONTRACT_ADDRESS
ARG VITE_PINATA_API_KEY
ARG VITE_PINATA_SECRET_KEY
ARG VITE_PINATA_JWT
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["npm", "run", "start"]
