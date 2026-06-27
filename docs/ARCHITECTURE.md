# SOVR Core Architecture Specification

This document provides a comprehensive, deep-dive specification of the SOVR Financial Operating System (FOS) architecture, detailing state transition flows, double-entry mathematical invariants, and component boundaries.

---

## 🏛️ System Overview

The SOVR FOS operates as a multi-tier, real-time capital routing network and double-entry ledger coordinator. It is designed to act as an immutable financial gateway, bridging enterprise core banking services, public ledger layers, and administrative audit interfaces.

```
+-------------------------------------------------------------------------------+
|                             CLIENT / VIEWPORT LAYER                           |
|  - Web Operator Portal (React 19, Vite, Tailwind CSS 4)                      |
|  - Mission Control Dashboard (Interactive KPIs, Live Narrative Feed)          |
|  - 3D Sovereign Globe (Three.js WebGL Geospatial Peering mapping)             |
|  - Compliance Hub (F0901 Account Master, Trial Balances, Closeout Compilers)  |
+-------------------------------------------------------------------------------+
                                        │
                         HTTP REST      │      WebSockets
                        JSON Streams    │     Event Streams
                                        ▼
+-------------------------------------------------------------------------------+
|                            GATEWAY FABRIC (API PROXY)                         |
|  - server.ts: Custom Express Server (Production ESM -> CommonJS via esbuild) |
|  - Route Mapping for Webhooks (Stripe, UnifiedPay, Sovereign Oracles)         |
|  - Static Assets Hosting and SPA Fallback Router                              |
+-------------------------------------------------------------------------------+
                                        │
                  Invariance            │            Consensus Seals
                  Verification          │            SHA-256 Hashes
                                        ▼
+-------------------------------------------------------------------------------+
|                              SOVR LEDGER MACHINE                              |
|  - GAAP Chart of Accounts & Balances (seed.ts)                                |
|  - Symmetrical Double-Entry Audit Engine (AccountsList / ManualForm)          |
|  - SHA-256 Merkle Proof Sealer & Micro-chain Generator (sha256.ts)             |
|  - Quantum Entropy Oscilloscope (Triple-layered Vector Wave Key Generator)    |
+-------------------------------------------------------------------------------+
```

---

## 🔬 Core Subsystems

### 1. **Capital Routing Command Center & 3D Spatial Globe**
* **Geospatial Mapping**: Using spherical mapping coordinates in Three.js, `SovereignGlobe` renders active routing flows across international clearing houses (New York, Zurich, Sydney, Singapore, Reykjavik, Tokyo).
* **Peering Bezier Curves**: Renders active paths, color-coded by performance thresholds, with custom particles representing individual transaction packets in transit.
* **Volume Distribution Matrix**: Computes local vault capacities against current circulating supply and maps continuous treasury movements using Area chart pipelines.

### 2. **Double-Entry Journal & Ledger Invariance Engine**
* **Algebraic Invariance Check**: Every ledger update is vetted against the balance equation:
  $$\sum \text{Debits} - \sum \text{Credits} = 0$$
  If this sum deviates from zero by even a fraction of a cent, the engine rejects the transaction, preventing fractional imbalances.
* **GAAP Ledger Account Structure**:
  * **Assets**: Checking reserves, reserve vaults, escrow accounts.
  * **Liabilities**: Operational debts, pending settlements.
  * **Escrow**: Held values pending notarization.
  * **Revenue**: Network service charges, transaction fees.
  * **Equities**: Capital investments.

### 3. **F0901 Mainframe Compliance Hub & Reporting Suite**
* **Account Master Parsing**: Supports multiple string representations of account paths, including standard period-separated structures (`BusinessUnit.ObjectAccount.Subsidiary`).
* **Enhanced Subledger Analysis (ESA)**: Organizes detail lines against subledgers mapping address registries, numeric sequences, or payee databases.
* **Statutory compilers**: Synthesizes in-memory ledgers into standard statutory reports on demand (Trial Balance, statutory GAAP closing reports, etc.).

### 4. **Quantum Entropy Key Oscillator**
* **Dynamic Waveform Generation**: Uses triple-harmonic sine-wave algorithms on a 2D HTML Canvas to model live physical entropy feeds.
* **Wave Superposition Collapse**: When triggered, collapses multiple continuous waveforms into precise, distinct binary eigenstates (`|0⟩` or `|1⟩`), mimicking real-time hardware HSM state generators for cryptographic transaction signing keys.

### 5. **Immutable Cryptographic Block Timeline**
* **Micro-Chain Structure**: Keeps a sequential array of blocks containing validation timestamps, parent hashes, payload dimensions, and active validator authority verification keys.
* **Consensus Quorum Seals**: Generates real-time verification signatures for each transaction utilizing SHA-256 bitwise digests.
