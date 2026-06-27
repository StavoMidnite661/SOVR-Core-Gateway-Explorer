# SOVR Production Deployment Manual

This document provides complete instructions for building, packaging, and deploying the SOVR Financial Operating System into production cloud environments.

---

## 🏛️ Target Infrastructures

The SOVR FOS is container-native, optimized for serverless hosting on **Google Cloud Run** or scale-out orchestration on **Google Kubernetes Engine (GKE)**.

---

## 📦 Containerization and Build Steps

### 1. The Production Bundle Process
The system utilizes a hybrid build pattern:
* **Frontend Assets**: Vite bundles React, Tailwind CSS 4, and Three.js elements into optimized static bundles located in `dist/`.
* **Backend Server**: esbuild bundles `server.ts` into a self-contained, single-file CommonJS server (`dist/server.cjs`), solving relative path imports and bypassing ESM runtime checks.

To execute the complete production build, run:
```bash
npm run build
```

---

## ☁️ Google Cloud Run Deployment

Cloud Run is the recommended platform for hosting the SOVR Core Gateway, offering near-instantaneous cold-start scaling and minimal server overhead.

### Step 1: Build the Container Image
Using Google Cloud Build, package the repository securely:
```bash
gcloud builds submit --tag gcr.io/sovr-platform-prod/core-gateway:3.8.2
```

### Step 2: Deploy to Cloud Run
Run the deployment command, forcing port `3000` and loading production env secrets:
```bash
gcloud run deploy sovr-core-gateway \
  --image gcr.io/sovr-platform-prod/core-gateway:3.8.2 \
  --platform managed \
  --region us-west1 \
  --port 3000 \
  --min-instances 1 \
  --max-instances 10 \
  --update-env-vars NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest
```

---

## 🛰️ Dockerfile Template

For custom deployments, reference the production multi-stage Dockerfile below:

```dockerfile
# Stage 1: Build Workspace
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Container
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```
