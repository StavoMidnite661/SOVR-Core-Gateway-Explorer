# SOVR System Coordination Specification

This document provides system-level specifications for state coordination, runtime environments, and communication fabrics within the SOVR Financial Operating System.

---

## 💻 Operating Runtime Specs
* **Server-Side Runtime**: Node.js (v18.x or higher)
* **API Development Framework**: Express (v4.21.x)
* **Bundler & Build Pipeline**: Vite 6, esbuild 0.25 (CommonJS output for maximum Node compatibility)
* **Client-Side Framework**: React 19 (Strict Mode, with functional hooks and state)
* **Styling Directives**: Tailwind CSS v4
* **Layout Animations**: Motion v12
* **Data Visualizations**: Recharts v3 & Three.js v0.184

---

## 🌐 State Coordination & Data Synchronization

The SOVR FOS manages state across three distinct layers, ensuring absolute consistency, latency buffering, and crash-recovery safeguards:

```
+-----------------------------------------------------------------------------------+
|                              1. TRANSIENT MEMORY STATE                            |
|  - React Client Context (Accounts state, Active transactions, Live workflows)     |
|  - Real-time UI updates (3D Globe rerenders, Oscilloscope waveforms)              |
+-----------------------------------------------------------------------------------+
                                          │
                        REST Pull /       │     WebSocket Events
                        JSON Posting      │     and State Pushes
                                          ▼
+-----------------------------------------------------------------------------------+
|                              2. SERVER MIDDLEWARE CACHE                           |
|  - Express memory buffers in server.ts                                            |
|  - Webhook ingestion buffers & REST endpoint schemas                              |
|  - API Proxy handling external third-party routing payloads                       |
+-----------------------------------------------------------------------------------+
                                          │
                        Commit Log /      │     ACID DB Writes
                        Wal Files         │     Point-in-Time Backups
                                          ▼
+-----------------------------------------------------------------------------------+
|                             3. IMMUTABLE RECORD LAYER                             |
|  - SHA-256 Block Seals (Micro-chain horizontal timeline)                         |
|  - GAAP Ledger Accounts Ledger records (seed.ts default Chart of Accounts)        |
|  - Compliance Evidences & audit logs database (evidence_db.json)                  |
+-----------------------------------------------------------------------------------+
```

### 1. Client-Side State
All interactive parameters (selected tabs, zoom limits, current account filters, manual transaction entries) are synchronized via React component hooks. The system maintains an in-memory duplicate of the GAAP ledger that updates instantly when balanced double-entries are posted.

### 2. Live Workflow Streams
Transactions enter the pipeline and progress through a seven-step state transition stream:
1. `INGESTED`: Transaction caught by API proxy gates.
2. `VALIDATED`: Enclave-level signature verification and double-entry validation pass.
3. `LEDGER_POSTING`: Account credit/debit balances posted to master databases.
4. `RECEIPT_GENERATED`: Cryptographic receipts signed and stored.
5. `EVIDENCE_CREATED`: Audit bundles archived inside the local compliance portal.
6. `ANCHORING`: Notarization Merkle Root anchored on-chain.
7. `COMPLETED`: Clearance and liquidation into recipient commercial clearing vaults.

### 3. Server-Side Mirroring
API endpoints proxy and mirror network metrics. In development, the custom Express server hosts routes (`/api/health`, `/api/events`, `/api/compliance`) mimicking true backend responses. In production, these calls route directly to Firestore or Cloud SQL database layers to ensure atomic consistency.
