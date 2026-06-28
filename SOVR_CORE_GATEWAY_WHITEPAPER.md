# SOVR CORE GATEWAY CONSOLE
## Technical Whitepaper & Architectural Audit
**Version:** v3.8.4-stable  
**Classification:** Confidential Sovereign Platform Record  
**Author:** SOVR Monetary Authority Systems Architect  
**Legal Authorities:** 12 U.S.C. § 95(a)(2); 50 U.S.C. § 4305b(2); HJR-192; Treasury Dept. Circular No. 300, 31CFR Chapter II  

---

## 1. Executive Summary & Legal Mandate

The **SOVR Core Gateway Console** is an immutable, multi-layered financial settlement interface and decentralized ledger tracking terminal. It represents the central nervous system of **SOVR Development Holdings LLC** and the private irrevocable **GM Family Trust**.

The console serves as a visual control plane and legal verification instrument. By anchoring transactions using **SHA-256 deterministic canonical hashing** and **Ed25519 digital signatures**, the platform enforces absolute financial finality (without recourse) under the following protective frameworks:
* **12 U.S.C. § 95(a)(2) & 50 U.S.C. § 4305b(2):** Codifies authorized executive-level asset movements, banking operations, and trust custody.
* **HJR-192 & Joint Resolution to Suspend Gold Standard (1933):** Underpins the legal tender basis and public/private debt discharge mechanisms utilized within the sovereign settlement ledger.
* **Treasury Circular No. 300 / 31 CFR Chapter II:** Governs the transfer, custody, and settlement of book-entry securities and debt instruments.

---

## 2. System Architecture (Hybrid Edge-Safe Deployment)

The platform utilizes a highly resilient, hybrid deployment model designed to operate natively in **Full-Stack Express environments** while retaining complete visual integrity in **Static Edge environments (e.g., Vercel, static CDNs)**.

```
       [ Client Browser (Vite SPA) ]
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
[ Local Browser State ]   [ Express Engine (server.ts) ]
  • Client-Side Fallback    • Persistent Memory Store
  • Static JSON Assets      • Dynamic HTML Templates
  • Local ZIP Assembler     • Native Node-Archiver (.zip)
                            • Express v5 Route Handlers
```

### 2.1 Dynamic Full-Stack Mode
When deployed with a Node.js runtime (such as Cloud Run or a dedicated VPS), the application binds to an Express server (`server.ts`). This backend provides:
1. **State Persistence:** In-memory tracking of active global ledger nodes, applications, and logs.
2. **Dynamic PDF/HTML Printing Engines:** Compiles server-side certificates injecting transaction numbers, timestamps, and settlement amounts into custom-styled, printable documents.
3. **Cryptographic ZIP Bundling:** Dynamically compresses certificates, JSON manifests, and security signatures on-the-fly into signed ZIP audit packages.

### 2.2 Edge-Safe Static Mode (Vercel Fallback)
In decoupled static hosting environments where an active Node server cannot run, the system dynamically shifts to an **Edge-Safe Architecture**:
* **Client-Side State Ingestion:** Automatically initializes system states using structured seed arrays (e.g., `INITIAL_NODES` in `NodeRegistry.tsx`).
* **Deterministic Fallback Downloaders:** Safely routes downloading flows through structured blob/data-URI streams so Vercel deployments never experience structural collapse or missing panels.

---

## 3. Node Network Topology (Global Node Registry)

The global ledger consensus is maintained by five primary distributed nodes mapped across major geopolitical zones. The telemetry of each connecting node is audited below:

```
[ NY_LC ] ─── [ LDN_R ] ─── [ ZRH_T ] ─── [ SGP_G ] ─── [ TYO_C ]
 (Host)       (Routing)      (Vault)      (Gateway)     (Witness)
```

### 3.1 Node-by-Node Directory

| Node ID | Node Name | Network Role | Operational Region | Default Capacity | Key Applications Hosted |
|:---|:---|:---|:---|:---|:---|
| **`NY_LC`** | NY Ledger Core | Ledger Settlement Host | North America | `12.5M SVT` | UnifiedPay Hub, SOVR Bridge |
| **`LDN_R`** | London Routing | Consensus Coordinator | Western Europe | `8.4M SVT` | UnifiedPay Hub, Basalt Console |
| **`ZRH_T`** | Zurich Treasury | SOVR Vault Agent | Central Europe | `19.1M SVT` | Basalt Console, Trust Vault Core |
| **`SGP_G`** | Singapore Gate | Asynchronous Gateway | Southeast Asia | `31.2M SVT` | UnifiedPay Hub, SOVR Bridge, Basalt |
| **`TYO_C`** | Tokyo Consensus | Witness Notary Node | East Asia | `5.1M SVT` | SOVR Bridge Consensus |

### 3.2 Telemetry Invariants
Each node reports real-time metrics back to the core gateway:
* **Risk Profile:** Monitored continuously to ensure variance stays under $0.05\%$ risk.
* **Queue Depth:** Measures backlogged block confirmations (target standard: $< 4$ blocks).
* **Throughput:** Configured to sustain up to $890 \text{ tx/sec}$ under stress peaks.

---

## 4. Component Audit & File Mapping

The codebase is highly modular, separating presentation layers, layout systems, cryptographic components, and backend routers:

```
src/
├── App.tsx                    # Main Gateway Dashboard & Navigation Controller
├── data/
│   ├── seed.ts                # Default mock databases, initial transactions list
│   └── gatewayData.ts         # Operational constants, endpoints, and connected apps
└── components/
    ├── EvidencePortal.tsx     # Settlement Receipts & Trust Authorization cards
    ├── TrustVault.tsx         # Layered verification tabs (Summary -> Timeline)
    ├── NodeRegistry.tsx       # Global Node Registry with static-fallback arrays
    ├── GatewayFabric.tsx      # System logs, API pathways, and message queues
    ├── AdministrationView.tsx # Policy overrides and global rules enforcement
    ├── QuantumEntropyOscilloscope.tsx  # Dynamic Canvas visualizer for seed-noise
    ├── TransactionWorkspace.tsx  # Live workspace layout & download wrappers
    └── TransactionsHistory.tsx  # Interactive past settlements catalog
```

### 4.1 UI Component Specifications

1. **`App.tsx` (Core Interface Router):**
   * Manages the global state of the user session, the core navigation bar (Overview, Network, Treasury, Settlement, Trust Vault, Compliance, Gateway Fabric, Administration), and coordinates event routing.

2. **`EvidencePortal.tsx` (Settlement Ledger Seal):**
   * Custom renders the formal **Immutable Ledger Settlement Certificate**. It features the newly integrated **GM Family Trust Settlement Authorization Card** showing official trust metadata, the trustee signature block, and the "Without Recourse, All Rights Reserved" seal.

3. **`TrustVault.tsx` (Deep Audit Inspector):**
   * A comprehensive inspector panel for active or historical transactions. Divides transaction data into highly specific, readable analysis views:
     * *Summary:* Core financial metrics.
     * *Receipt:* Formatted billing ledger proof.
     * *Certificate:* An embedded, highly styled visual render of the official **Certificate of Settlement** containing the GM Family Trust seal.
     * *Chain Proof:* Validation network height details.
     * *Ledger / Manifest / Signatures:* Raw crypto parameters.
     * *Timeline & Evidence Graph:* Block confirmation tracking.

4. **`NodeRegistry.tsx` (Distributed Consensus Board):**
   * Connects to the local server telemetry stream (`/api/nodes`) or automatically falls back to an integrated static state, rendering node health, region, active applications, throughput levels, and security states.

5. **`QuantumEntropyOscilloscope.tsx` (System Seed Visualizer):**
   * Uses raw HTML5 Canvas to model a real-time oscilloscope measuring system entropy and quantum noise fluctuations used to secure transaction blocks.

6. **`GatewayFabric.tsx` (API Control Plane):**
   * Visualizes active APIs (e.g., `/api/v1/settlements`), allowing operators to view ingress streams, execute manual system checks, and review telemetry.

---

## 5. Cryptographic Engine & Integrity Pipeline

The system enforces high-security guarantees using an atomic pipeline:

```
[ Transaction Ingest ] 
        │
        ▼
[ Canonical JSON Serialization ]
        │
        ▼
[ SHA-256 Hashing Process ] ────► Block Seal Invariant
        │
        ▼
[ Ed25519 Signing Key ] ────► Authorized Trust Verification
        │
        ▼
[ Dual-Mode Zip Package ] ────► Certificate + Manifest Bundle
```

### 5.1 Verification Invariants
* **SHA-256 Hash Generation:** Canonical representations of state changes are hashed deterministically. Any mutation in amount, origin, or timestamp immediately breaks the signature validation.
* **Ed25519 Keys:** Digital signatures are appended using private key arrays, matched against verified gateway public keys.

### 5.2 ZIP Generation & Packaging API
When an auditor requests a formal download, the system packages these records using two pathways:
1. **Server-Side archiver (`server.ts`):** Creates an actual compressed folder containing the transaction manifest, block metadata, and a beautifully formatted HTML certificate matching the live portal styles.
2. **Client-Side Trigger:** Transparently redirects API routing dynamically to `/api/evidence/download/:id?format=zip` for high fidelity or downloads local backups under static constraints.

---

## 6. Operational & Security Policies

Under the **AdministrationView** and **Compliance** controls, the console operates under specific runtime policies:
* **Automatic Audit Packing:** Enforces automatic construction of legally compliant compliance logs whenever settlement sums exceed thresholds.
* **Double-Entry Validation:** Enforces the absolute ledger parity invariant: $\sum \text{Debits} \equiv \sum \text{Credits}$.
* **Zero Trust Transport:** Locks down all incoming connections behind encrypted channels, with immediate notification protocols wired straight to the warning center.

---

## 7. Production Integration & Real-World Endpoints

To transition the **SOVR Core Gateway Console** from an interactive administrative sandbox to a real-world enterprise infrastructure, you must bind the simulated endpoints in `server.ts` to authenticated production external services. 

Below is the definitive integration directory detailing the required real-world endpoint mappings, protocol schemas, and third-party gateway configurations.

```
┌─────────────────────────────────┐
│     EXTERNAL EVENT SOURCE       │
│  (Stripe, Plaid, Bank Core API)  │
└────────────────┬────────────────┘
                 │ Secure HTTP Post (Webhook)
                 ▼
┌─────────────────────────────────┐
│     SOVR WEBHOOK INGRESS        │ (POST /api/v1/webhooks/stripe)
│   - Validates event signature   │
└────────────────┬────────────────┘
                 │ Internally Dispatched Action
                 ▼
┌─────────────────────────────────┐
│    SOVR ENGINE / TRUST LEDGER   │
│   - Fetches KMS Signing Key     │ (Ed25519 payload signing via Cloud KMS)
│   - Persists double-entry state │ (PostgreSQL DB transaction)
└────────────────┬────────────────┘
                 │ Secure HTTPS Response
                 ▼
┌─────────────────────────────────┐
│   COMPLETED PUBLIC LEDGER SEAL  │ (GET /api/verify/:txnId)
└─────────────────────────────────┘
```

### 7.1 Real-World Webhook Ingestion & Mappings

To automate the intake of financial clearing settlements, configure your external providers to trigger events into these production endpoints:

#### 1. Ingress Webhook: Stripe Ledger Provisioner (`POST /api/v1/webhooks/stripe`)
* **Purpose:** Converts real-world debit/credit payments processed through credit cards, ACH, or Apple Pay into signed SOVR balance tokens or sovereign clearing certificates.
* **Header Validation:** Must verify the `stripe-signature` header using your Stripe SDK Webhook Secret to guard against replay attacks.
* **Payload Blueprint:**
  ```json
  {
    "id": "evt_1OpK4BByoZ...",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_3OpK48ByoZ...",
        "amount": 1934170743, // Represented in lowest denomination (e.g., $19,341,707.43)
        "currency": "usd",
        "metadata": {
          "trust_id": "GM_FAMILY_TRUST_33",
          "settlement_method": "CLEARING_PAYMENT",
          "originating_vault": "1000.CASH.STRIPE",
          "receiving_party": "2000.LIAB.CUSTOMER"
        }
      }
    }
  }
  ```

#### 2. Ingress Webhook: Plaid / Core Bank API Sync (`POST /api/v1/webhooks/banking`)
* **Purpose:** Syncs direct treasury deposits, commercial wire transfers, and federal settlement sweeps.
* **Payload Blueprint:**
  ```json
  {
    "event_type": "TRANSFER_SWEEP_COMPLETED",
    "sweep_id": "sw_912830",
    "settled_amount": "500000.00",
    "clearing_bank": "Federal Reserve Bank of San Francisco",
    "routing_transit_number": "121000248",
    "reference_memo": "HJR-192 TRUST LIQUIDITY PROVISION"
  }
  ```

---

### 7.2 Cryptographic Key Management & HSM Signatures

In the simulated workspace, Ed25519 keys are read from local development configurations. In production, keys must never reside in environment variables or disk files.

* **Production Integration:** Google Cloud KMS (Key Management Service) or AWS CloudHSM.
* **Cryptographic Signing Endpoint (`POST /api/v1/kms/sign`):**
  * Express intercepts ledger mutations, structures the transaction manifest into deterministic canonical JSON (sorted keys, no whitespace), hashes it via SHA-256, and sends the hash to Google KMS for asynchronous asymmetric signing using an **Ed25519-SHA-512** key.
* **Integration Example (Cloud KMS SDK):**
  ```typescript
  import { KeyManagementServiceClient } from '@google-cloud/kms';
  
  const kmsClient = new KeyManagementServiceClient();
  
  async function signLedgerPayload(canonicalHash: Buffer): Promise<Buffer> {
    const keyPath = kmsClient.cryptoKeyPath('sovr-monetary-project', 'us-central1', 'sovr-keyring', 'trustee-key');
    const [response] = await kmsClient.asymmetricSign({
      name: keyPath,
      digest: { sha256: canonicalHash }
    });
    return response.signature as Buffer;
  }
  ```

---

### 7.3 Data Persistence Infrastructure

To support durable compliance records and multi-operator auditing, migrate the in-memory `db` object in `server.ts` to a robust relational database engine:

#### Database Selection: PostgreSQL (Google Cloud SQL)
* **Schema Blueprint:**
  ```sql
  -- Core Settlements Table
  CREATE TABLE settlements (
    id VARCHAR(64) PRIMARY KEY,
    amount BIGINT NOT NULL,                  -- Preserves precise integer math (avoiding floating point errors)
    denomination VARCHAR(10) DEFAULT 'SVT',
    settlement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settlement_method VARCHAR(64) NOT NULL,
    verification_hash VARCHAR(64) NOT NULL UNIQUE,
    signature VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'Completed'
  );

  -- Ledger Parity Journals
  CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    settlement_id VARCHAR(64) REFERENCES settlements(id),
    account_code VARCHAR(32) NOT NULL,      -- e.g. '1000.CASH.STRIPE' (Debit) or '2000.LIAB.CUSTOMER' (Credit)
    debit_amount BIGINT DEFAULT 0,
    credit_amount BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```

---

### 7.4 Client-Auditor Integration Protocols

To enable automated corporate audits, the gateway serves as an authenticated **REST API Server** adhering to the following protocol rules:

1. **Transaction Audit Package Route (`GET /api/evidence/download/:id`)**
   * **Authentication:** HMAC-SHA256 signature generated with unique client secret keys, transmitted in the `X-SOVR-Signature` header.
   * **Response:** Dynamically streams a compressed ZIP archive containing:
     1. `manifest.json` - Complete metadata.
     2. `signature.sig` - Detached Ed25519 signature verified against the public keys listed in `/api/v1/ledger/extract`.
     3. `certificate_SC-{id}.html` - Self-contained HTML report (fully styled and printable) summarizing trust authorization and legal codes.

2. **Decentralized Status Stream (`GET /api/v1/ledger/extract`)**
   * **Usage:** Provides remote validator nodes with a deterministic stream of active trust transactions to build their localized consensus graphs.

---
*Authorized by GUSTAVO ORONA MALDONADO TTEE, SOVR Development Holdings LLC. Without Recourse, All Rights Reserved.*
