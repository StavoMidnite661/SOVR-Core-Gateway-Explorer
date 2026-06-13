# <p align="center"><img src="/src/assets/images/sovr_background_map_1781167617436.png" width="160" style="border-radius: 12px; box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);" alt="SOVR Logo" /><br>SOVR Core Gateway Explorer & Capital Routing Command Center</p>

<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-SOVR%20Core%20v3.8-06b6d4?style=for-the-badge&logo=chainlink&logoColor=white" alt="Protocol" />
  <img src="https://img.shields.io/badge/Consensus-Quorum%20Continuous-02c39a?style=for-the-badge&logo=shield" alt="Consensus" />
  <img src="https://img.shields.io/badge/CI%2FCD%20Pipeline-GitHub%20Pages%20Active-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white" alt="CI/CD Status" />
  <img src="https://img.shields.io/badge/Engineering-Enterprise%20Grade-indigo?style=for-the-badge&logo=typescript&logoColor=white" alt="SLA Class" />
</p>

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

### 6. **SOVR Development Holdings LLC Regulatory Compliance Hub** [NEWLY EXPANDED]
A high-fidelity compliance simulator modeled after SOVR Development Holdings LLC's enterprise corporate guidelines. It establishes robust compliance verification pipelines by mapping transactions to SOVR master ledgers:
* **F0901 Account Master Playbook**: 
  - Dynamic input formatter parsing raw account coordinates using period-point (`.`) separators. Evaluates four standard legacy representations: Standard (`BU.OBJ.SUB`), Third G/L alternate, Short UUID keys, and automated Speed Codes.
  - Interactive reorganization sweeps simulating automated mainframe restructurings of index points with custom execution logs.
  - **Enhanced Subledger Analysis (ESA)** workspace filtering records by subledger types (`A` for address books, `N` for numeric classifications, `C` for customer/payee registries) mapping against `F0101` and `F1201` master tables.
* **Journal proofing (P09301)**: Generates matrix print schedules for unposted general journals, batch sequences (F0011), and categorized accounts, compiling absolute byte sums on demand.
* **Trial Balance Audits (P09410 Series)**: Dynamic balances aggregated from active ledger rows to render *Business Unit Sequences (P09410)* or *Object Account Sequences (P094121)* with net debit/credit sums.
* **Statutory GAAP Closeouts (P10111)**: Income statement compiler calculating active Operating Revenue, COGS, gross margins, administrative OpEx, and final operating income. Paired with a Statement of Cash Flow Closing checklist tracking date patterns (F0008) and Automatic Accounting Instructions (AAI).
* **Ledger Stress Integrity validation (F0911)**: Runs deep integrity scans verifying transaction detail records (`F0911`) against balance summaries (`F0902`) to highlight exceptions. Includes an *Ampersand Audit Policy* (&) routing resolver.

### 7. **Operations Print Desk & Document Export Bureau** [NEW]
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
