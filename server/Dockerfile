# Yunto API — Node + Express + Prisma.
# Runs TypeScript directly via tsx: `npm run build` is currently broken by a
# tsconfig rootDir conflict with prisma/seed.ts, and tsx is a supported runtime.
FROM node:20-alpine

WORKDIR /app

# openssl is required by Prisma's query engine on alpine.
RUN apk add --no-cache openssl

# Dev dependencies are required at RUNTIME here: tsx executes the TypeScript
# entrypoint and the prisma CLI runs `db push` on boot. Do not use --omit=dev.
COPY package*.json ./
RUN npm ci || npm install

# Generate the client against the schema before the rest of the source lands,
# so edits to src/ do not invalidate this layer.
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
EXPOSE 3001

# entrypoint syncs the schema (and seeds on first boot) before serving.
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "tsx", "src/index.ts"]
