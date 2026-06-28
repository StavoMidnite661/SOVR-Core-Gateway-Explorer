# <p align="center"><img src="/src/assets/images/sovr_background_map_1781167617436.png" width="100%" style="border-radius: 12px; box-shadow: 0 10px 40px rgba(6, 182, 212, 0.25);" alt="SOVR Core Gateway Map Banner" /><br><br>🏛️ SOVR Core Gateway Explorer & Capital Routing Command Center 🏛️</p>

<p align="center">
  <img src="https://img.shields.io/badge/Protocol-SOVR%20Core%20v3.8.2-06b6d4?style=for-the-badge&logo=chainlink&logoColor=white" alt="Protocol" />
  <img src="https://img.shields.io/badge/Consensus-Quorum%20Continuous-02c39a?style=for-the-badge&logo=shield" alt="Consensus" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2F%20TigerBeetle-indigo?style=for-the-badge&logo=postgresql" alt="Database" />
  <img src="https://img.shields.io/badge/UI--UX-WebGL%20Three.js%20%2F%20Tailwind-6f42c1?style=for-the-badge&logo=three.js" alt="UI-UX" />
</p>

---

## 📁 Technical Documentation Indexes

All advanced system architectures, microservices, databases, and operational workflows are fully documented inside the local [`/docs`](/docs) directory:

*   **[Repository Manifest](/docs/MANIFEST.md)** — Canonical structure of the codebase, versions, and build guides.
*   **[Core Architecture Specification](/docs/ARCHITECTURE.md)** — Core flows, Three.js spatial globe configurations, and mathematical invariance rules.
*   **[System Coordination Specification](/docs/SYSTEM.md)** — Runtime environments, state synchronization, and UI controllers.
*   **[Services & Microservice Inventory](/docs/SERVICES.md)** — Microservices detailed roles, inputs, outputs, database tables, and dependencies.
*   **[Gateway API Manifest](/docs/API.md)** — Endpoint schema specifications, request payloads, and implementation states.
*   **[Event Catalog & Pub/Sub Schemas](/docs/EVENTS.md)** — Complete specifications for asynchronous events and failover behavior.
*   **[Database Schemas & ERD Models](/docs/DATABASE.md)** — Table mappings, relationships, keys, audit structures, and retention schemas.
*   **[System Configuration Manual](/docs/CONFIGURATION.md)** — Settings objects, policy definitions, currencies, and limits.
*   **[Environment Variables Manual](/docs/ENVIRONMENT.md)** — Database credentials, third-party keys, security policies, and `.env.example` specifications.
*   **[Production Deployment Manual](/docs/DEPLOYMENT.md)** — Container bundling, Dockerfiles, Cloud Run instructions, and scaling bounds.
*   **[Cybersecurity & Compliance Protocols](/docs/SECURITY.md)** — Symmetrical balance math, TLS levels, secrets policies, and disclosure templates.
*   **[Core Business Workflows](/docs/WORKFLOWS.md)** — Ledger posting flowcharts, compliance packages compilation, and reserve rebalancing.
*   **[Strategic Technology Roadmap](/docs/ROADMAP.md)** — Short, medium, and long-term milestones.
*   **[Changelog & Historical Releases](/docs/CHANGELOG.md)** — Pre-GA and GA historical releases tracking.
*   **[Contributing to SOVR Core](/docs/CONTRIBUTING.md)** — Developer rules, Conventional Commits styles, and branch guidelines.
*   **[Production Readiness Checklist](/docs/PRODUCTION_READINESS.md)** — Complete pre-flight deployment audits, logging configs, and risk registers.
*   **[TigerBeetle Core Database Integration](/docs/TIGERBEETLE_INTEGRATION.md)** — High-throughput hardware-accelerated ledger specifications.

---

## 🏛️ Comprehensive Architectural Blueprint

The **SOVR Core Gateway Explorer** is an advanced operational dashboard, ledger audit telemetry terminal, system coordinator, and compliance suite engineered to manage the global liquidity parameters of the **SOVR Capital Routing Network**. Designed for high-density setups, real-time operations, and international regulatory compliance, this terminal processes double-entry ledger state invariants dynamically and provides absolute cryptographic balance transparency to network operators.

```
+-------------------------------------------------------------------------+
|                        SOVR WEB OPERATOR PORTAL                         |
+-------------------------------------------------------------------------+
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
+───────────+                  +───────────+                  +───────────+
| 3D GLOBE  |                  | JOURNAL   |                  | REGULATORY|
| REGULATORY|                  | INVARIANT |                  | COMPLIANCE|
| TELEMETRY |                  | AUDITOR   |                  | SYSTEMS   |
+───────────+                  +───────────+                  +───────────+
       │                              │                              │
       │   ┌──────────────────────────┘                              │
       ▼   ▼                                                         ▼
[ Ledger Engine (seed.ts) ]  ◄──────────────────────────────────  [ Webhook Router ]
       │
       ▼
[ SHA-256 Proof Sealer (sha256.ts) ]
```

---

## 🔬 Deep Dive: Secure Settlement Certificates & Hardcopy Exports

The **Operations Print Desk & Document Export Bureau** in the SOVR FOS generates legal, print-ready accounting certificates for auditing, verification, and offline preservation. These certificates are designed to preserve GAAP-compliant double-entry ledger facts on hardcopy, acting as physical proof of settlement.

### 🎨 Visual Layout & Design Anatomy
The printed certificate layout is engineered to look exceptionally professional, mimicking traditional mainframe terminal print sheets combined with state-of-the-art cryptographic watermarking:
* **Terminal Monospace Grid**: The document renders using an rigid, high-density monospace font stack (`JetBrains Mono`, `Fira Code`, or native monospace fallback) wrapped inside solid double-lined ASCII boundaries to evoke secure corporate ledger books.
* **High-Contrast CSS Print Media Overrides**: Built-in `@media print` rules strip away all ambient background patterns, animated 3D particle globes, navigation headers, and responsive sidebars. The output instantly reformats to stark, ink-conserving black text on clean white physical sheets or PDF exports.
* **Shaded Security Elements**: Using `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`, the certificate forces modern rendering engines to preserve dark-shaded table row headers, high-contrast borders, and custom authorization stamp blocks on physical paper.
* **Regulatory Header & Stamp Card**: It positions a prominent centered title `★ SOVR FINANCIAL OPERATING SYSTEM (FOS) ★` alongside a physical-themed authorization box labeled `GM FAMILY TRUST SETTLEMENT AUTHORIZATION` and custom cryptographic validation stamps.

### 📊 Information Schema & Data Inventory
Each printed settlement certificate serves as an immutable receipt, holding the following 11 critical data points:

| # | Data Attribute | Representation in Certificate | Operational Purpose |
| :--- | :--- | :--- | :--- |
| **1** | **Core Transaction ID** | `TX-982343` / `TX-100293` | Unique identifier linking the printed document to the local database ledger records (`F0911_TransactionDetail`). |
| **2** | **Receipt Reference** | `REC-8234` / `REC-` Chronological Index | Unique chronological reference number assigned by the internal Trust Vault server upon initial ledger validation. |
| **3** | **Settlement Certificate No.** | `SC-` Sequence ID | Sovereign regulatory certification serial identifier generated for compliance audits (e.g., SEC 17a-4 compliance). |
| **4** | **Chain Notarization Proof** | Hash index reference ID | Relational database pointer identifying the precise hash validation sequence generated by the verification quorum. |
| **5** | **Execution Timestamp** | ISO standard UTC date-time string | The exact date, hour, minute, and second the transaction was written to ledger masters (`F0902`). |
| **6** | **Denominated Value** | `$2,400,000.00` / `SVT` volumes | Total value transferred, clearly separating asset currency and minor unit cents precision. |
| **7** | **Originating Vault (Source)** | `Zurich Checking Reserve` / `New York Core` | The source general ledger account mapping to corporate Asset divisions. |
| **8** | **Receiving Party (Dest)** | Target Clearing House / Node Name | The recipient escrow repository or clearing house receiving the funds. |
| **9** | **Bitwise SHA-256 Digest** | 64-character hexadecimal fingerprint | Mathematical checksum verifying that the transaction lines have remained 100% immutable since block sealing. |
| **10** | **Enclave Digital Signature** | Hexadecimal public key string | The cryptographic authority seal issued by validator enclaves confirming symmetrical GAAP balancing. |
| **11** | **Ledger Anchor Details** | `Polygon Mainnet \| Height #184` | The physical or private consensus ledger network where the transaction batch is anchored, including the block height index. |

---

## 🔬 In-Depth Functional Modules

### 1. **Strategic Capital Routing Command Center**
* **3D Global Peering Engine**: Implements a high-performance geographic projection in Three.js (`SovereignGlobe.tsx`) displaying dynamic network hubs in major global locations (Zurich, Tokyo, New York, Reykjavik, Sydney, Singapore). Geodesic bezier paths render active routing flows.
* **Supply Allocation Tracking**: Integrated real-time Area charts (powered by Recharts/D3) calculating the continuous distribution percentages of circulating **SVT (SOVR Token)** values against local regional vaults.

### 2. **Double-Entry Journal & Ledger Invariance Auditor**
* **GAAP-Compliant Ledger Verification**: The accounts ledger (`AccountsList.tsx`) tracks values across Assets, Escrow, Liabilities, Revenue, and Equities.
* **Symmetrical Balancing Check**: A double-entry transaction is rejected on injection unless it holds a perfect algebraic balance:
  $$\sum \text{Debits} - \sum \text{Credits} = 0$$
* **Forensic Auditing**: Every transaction displays its specific validator seal fingerprint, parent block height mapping, metadata string, and gas burn offset metrics inside the `TransactionsHistory.tsx` list.

### 3. **Manual Route & Transaction Injector**
* **Transaction Simulator**: Allows operators to manually compile credit and debit allocations.
* **Integrity Guard**: Checks current accounts dynamically before dispatching transfers. Demonstrates consensus state transition rules and logs active validator node attestations.

### 4. **Quantum Entropy Oscilloscope**
* **Interactive Waveform Canvas**: Draws triple-layered vector waves showing continuous noise streams. Mimics hardware telemetry feeds generating cryptographically safe nonces.
* **State Coherence & Superposition Collapse**: Includes triggers simulating quantum collapsing. When triggered, waves are instantly converted into precise binary eigenstates (`|0⟩` or `|1⟩`) with realistic harmonic decay models.

### 5. **Immutable Cryptographic Block Timeline**
* **Merkle Block Log**: Chronicles immutable block sequence seals validated via peer quorum. Exposes internal cryptographic invariants including hashes, difficulty indexes, payload lengths, and parent node verification keys.

### 6. **SOVR Development Holdings LLC Regulatory Compliance Hub**
A high-fidelity compliance simulator modeled after SOVR Development Holdings LLC's enterprise corporate guidelines. It establishes robust compliance verification pipelines by mapping transactions to SOVR master ledgers:
* **F0901 Account Master Playbook**: 
  - Dynamic input formatter parsing raw account coordinates using period-point (`.`) separators. Evaluates four standard legacy representations: Standard (`BU.OBJ.SUB`), Third G/L alternate, Short UUID keys, and automated Speed Codes.
  - Interactive reorganization sweeps simulating automated mainframe restructurings of index points with custom execution logs.
  - **Enhanced Subledger Analysis (ESA)** workspace filtering records by subledger types (`A` for address books, `N` for numeric classifications, `C` for customer/payee registries) mapping against `F0101` and `F1201` master tables.
* **Journal proofing (P09301)**: Generates matrix print schedules for unposted general journals, batch sequences (F0011), and categorized accounts, compiling absolute byte sums on demand.
* **Trial Balance Audits (P09410 Series)**: Dynamic balances aggregated from active ledger rows to render *Business Unit Sequences (P09410)* or *Object Account Sequences (P094121)* with net debit/credit sums.
* **Statutory GAAP Closeouts (P10111)**: Income statement compiler calculating active Operating Revenue, COGS, gross margins, administrative OpEx, and final operating income. Paired with a Statement of Cash Flow Closing checklist tracking date patterns (F0008) and Automatic Accounting Instructions (AAI).
* **Ledger Stress Integrity validation (F0911)**: Runs deep integrity scans verifying transaction detail records (`F0911`) against balance summaries (`F0902`) to highlight exceptions. Includes an *Ampersand Audit Policy* (&) routing resolver.

### 7. **Operations Print Desk & Document Export Bureau**
A centralized system print overlay designed to mimic a vintage matrix-layout layout, giving operators access to fast hardcopy generation:
* **Print Hardcopy**: Deploys a customized print CSS overlay rendering standard monospace reports with custom border styles directly to physical paper channels, leaving zero background noise.
* **Download TXT**: Generates dynamic plain text files formatted with strict report headers downloaded on the operator's machine.
* **Copy Plain Text**: High-speed copying utility for rapid ledger transfers.

---

## 🧩 Modularity and Folder Organization Directory

The repository is divided into highly specialized, isolated directories. Each folder contains its own specialized developer documentation:

* **[`/src/components`](/src/components)**: Dynamic React modules, UI controllers, Three.js shaders, vintage printing overlays, and user input validation forms.
* **[`/src/data`](/src/data)**: Static GAAP charts of accounts, initial balance seeding vectors, SOVR structural ledger mappings, and currency localization formatting schemas.
* **[`/src/utils`](/src/utils)**: Pure TypeScript cryptographic libraries, binary helpers (including pure bitwise SHA-256 transforms), and mathematical layout formatters.

---

## 📋 Detailed Component Spec Sheet & Attribute APIs

| Component Name | File Landmark | Target Responsibility | Supported Props & Data Interfaces |
| :--- | :--- | :--- | :--- |
| **SovereignLanding** | `src/components/SovereignLanding.tsx` | Gatekeeper auth visual screen, Web Audio synthesizer initialization. | `onEnter: () => void`<br>`totalAssetsUSD: number`<br>`totalSVT: number` |
| **SovereignGlobe** | `src/components/SovereignGlobe.tsx` | 3D WebGL render layer for geospatial peer-to-peer route tracking. | `geoNodes: GeoNode[]`<br>`routes: Route[]`<br>`selectedNodeId: string \| null`<br>`onSelectNode: (id: string \| null) => void`<br>`onSelectRoute: (id: string \| null) => void`<br>`heatmapOn: boolean` |
| **BlocksChain** | `src/components/BlocksChain.tsx` | Consensus chain horizontal visualization, trigger button for manual sealing. | `chain: HashBlock[]`<br>`onForceSeal: () => void`<br>`isSealing: boolean` |
| **AccountsList** | `src/components/AccountsList.tsx` | Searchable chart of accounts showing sub-units balances and GAAP types. | `accounts: LedgerAccount[]` |
| **ConnectedAppsList**| `src/components/ConnectedAppsList.tsx`| Exposes linked microservices, bridge routers, and automated compliance logs.| *Standalone State (Internal Sim)* |
| **QuantumEntropyOscilloscope**| `src/components/QuantumEntropyOscilloscope.tsx`| Custom 2D canvas plotting entropic waves and superposition collapse states.| *Standalone State (Internal Canvas Loop)* |
| **ComplianceHub** | `src/components/ComplianceHub.tsx` | SOVR Development Holdings LLC compliance center: Playbooks, Journal proof compilers, Trial Balance sheets, GAAP closings, ledger scanners, and Print desk overlay. | `accounts: LedgerAccount[]`<br>`transactions: Transaction[]`<br>`formatCurrency: (amountMinor: number, currency: string) => string` |

---

## 🧮 Precise Financial Data Schemas

Integrated financial transactions follow GAAP-compliant structural guidelines:

### A. Ledger Account Representation (`/src/types.ts`)
```typescript
interface LedgerAccount {
  id: string;               // Unique primary identifier
  code: string;             // Chart code (e.g., "1000.ASSET", "3000.EQUITY")
  name: string;             // Label string ("SOVR Equity", "Reykjavik Clearing")
  kind: 'asset' | 'escrow' | 'liability' | 'revenue' | 'equity';
  denomination: 'USD' | 'SVT' | 'USDC';
  balanceMinor: number;     // Absolute balanced units stored as 64-bit signed integers (Cents equivalent)
}
```

### B. Balanced Ledger Entries Definition
```typescript
interface LedgerEntry {
  accountId: string;        // Target Account relation
  accountCode: string;      // Rapid lookup index key
  debitMinor: number;       // Ingress value in base integer limits
  creditMinor: number;      // Egress value in base integer limits
}
```

---

## 🔁 Continuous Integration & Deployment Pipeline (CI/CD)

The project leverages an automated **GitHub Actions** pipeline located in [`.github/workflows/deploy.yml`](/.github/workflows/deploy.yml) matching standard devops workflows:

```
[ Push / PR Event on Main/Master ]
               │
               ▼
   [ Checkout Code Repo v4 ]
               │
               ▼
   [ Initialize Node.js Environment (v20) ]
               │
               ▼
   [ Install Dependencies (npm ci) ]
               │
               ▼
   [ Static Verification Checks (tsc --noEmit) ]
               │
               ▼
   [ Bundle Production Build (vite build) ]
               │
               ▼
 [ Deploy Static Assets directly to GitHub Pages ]
```

---

## ⚙️ Direct Deployment & Production Compiling

Execute these commands to clone, package, and deploy the application environment locally:

### 1. Initialize Node Standard packages:
```bash
npm install
```

### 2. Start local operator dashboard:
```bash
npm run dev
```
*The gatekeeper portal is rendered instantly at `http://localhost:3000` with hot-reloading active.*

### 3. Run Static Syntactic Verification:
```bash
npm run lint
```

### 4. Build Optimized Static Code Bunches:
```bash
npm run build
```
*Compiles all assets cleanly, storing them in `/dist` for easy drag-and-drop file serving.*

---

<p align="center"><i>Administered under Wyoming blockchain guidelines by the SOVR Engineering Syndicate // SECURED & SYMMETRICALLY NOMINAL</i></p>
