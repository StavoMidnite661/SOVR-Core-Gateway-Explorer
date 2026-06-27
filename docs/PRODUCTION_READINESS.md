# SOVR Production Readiness Checklist

This document acts as the definitive checklist for deploying the SOVR Financial Operating System into mission-critical, regulated production environments.

---

## 🚀 Pre-Flight Status Checklist

### 1. Build & Compilation
* [x] **Vite Bundler & esbuild Compilation**: Server-side files must bundle correctly into standard CommonJS `dist/server.cjs` format using the custom esbuild settings.
* [x] **TypeScript Compliance**: Linter (`npm run lint` or `tsc --noEmit`) must resolve 100% of compilation errors with zero active exceptions.
* [x] **Dependency Sanitization**: Remove unused development imports or orphan components from `package.json`.

### 2. Testing & Quality Assurance
* [ ] **Unit Tests (Jest/Vitest)**: Maintain a minimum 85% coverage across `/src/utils` and double-entry mathematical formulas.
* [ ] **Integration Tests**: Verify simulated network latency responses on `/api/*` endpoints.
* [ ] **E2E Tests (Playwright)**: Test full compliance workflows: F0901 account masters, printing, trial balance compilation, and manual transaction injection.

### 3. Security Hardening
* [ ] **Secrets Management**: All sensitive values (e.g. `GEMINI_API_KEY`, DB passwords, JWT secrets) must reside in a secure cloud manager (such as GCP Secret Manager) and never be committed to git.
* [ ] **HTTPS/TLS**: Enforce TLS 1.3 across all incoming API and socket gateways.
* [ ] **Rate Limiting**: Apply express-rate-limit to `/api/*` to prevent ledger denial-of-service attempts.
* [ ] **Subresource Integrity (SRI)**: Secure HTML elements loading external fonts or assets to mitigate XSS scripts.

### 4. Logging & Telemetry
* [x] **Dynamic Narratives Logs**: Core client visual logs provide full auditing trail for transaction sequences.
* [ ] **Structured Server Logging**: Replace basic `console.log` statements in `server.ts` with structured JSON Winston logs integrated with Google Cloud Logging.
* [ ] **Exception Bundling**: Connect Sentry to track uncaught middleware faults.

### 5. Monitoring & Alerts
* [ ] **Heartbeat Checks**: Setup automated probe endpoints on `/api/health` checking node health and memory limits.
* [ ] **Active Metrics Export**: Integrate Prometheus exporters to stream active transaction TPS and ledger lock statuses.
* [ ] **Escalation SLA Alerts**: Define PagerDuty triggers for consensus latency spikes beyond 1500ms or duplicate sequence IDs.

### 6. Error Handling & Invariance Protection
* [x] **Invariance Validation**: Client-side blocks mathematically double-check GAAP account balance integrity on transaction dispatching.
* [ ] **Database Transaction Rollbacks**: Enforce ACID database levels on backend databases. If any leg of a double-entry debit/credit fails, roll back the whole batch.

---

## 🏛️ Infrastructure & Deployment

### 1. High Availability Clustering
* **Primary Container Runtime**: Google Cloud Run configured with a minimum of 2 instances to avoid cold-start delays.
* **Global Load Balancing**: Configure CDN caches for static frontend assets and routing rules for real-time WebSocket connections.

### 2. Backups & Disaster Recovery
* **Database Mirroring**: Use high-availability replication with automatic failover for PostgreSQL (Cloud SQL).
* **Continuous Point-in-Time Recovery (PITR)**: Enable transactional WAL logs allowing ledger restoration within any 5-second window.
* **Ecosystem Snapshots**: Conduct daily encrypted cold-storage backups of GAAP configurations and compliance archives.

---

## ⚠️ Known Risks & Technical Debt

1. **In-Memory Ledger Fallback**: Currently, when running without active backend databases, the system state falls back to React state, which clears on page refresh. This is resolved by activating SQL integration.
2. **Deterministic Cryptographic Seeds**: The quantum oscilloscope generates random seeds using mock canvases when local hardware entropy sources are unavailable. This must be coupled with hardware HSM modules for true production key creation.
