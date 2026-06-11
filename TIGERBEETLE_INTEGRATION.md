# 🐅 TigerBeetle Integration Blueprint: SOVR Alpha Node Zero

This blueprint details the architectural roadmap, implementation processes, and data translations required to transition the **SOVR Core Gateway** from its high-fidelity client-side Web-Audio simulator to a production-grade, hyper-scale ledger network powered by **TigerBeetle**.

---

## 📌 Architectural Analysis: Simulator vs. TigerBeetle Cluster

### Is the present simulator sufficient?
* **For Prototyping & Telemetry Validation**: Yes. The current custom double-entry engine in `/src/data/seed.ts` enforces perfect GAAP algebraic balance states ($\sum \text{Debits} - \sum \text{Credits} = 0$), validates cryptographic blocks with local SHA-256 parent mining hashes, and tracks state transformations accurately.
* **For "Alpha Node Zero" Production Truth**: **No**. High-performance financial ledgers cannot rely on ephemeral browser memories or standard general-purpose transactional databases (SQL/NoSQL) at scale.

### Why TigerBeetle is the Undeniable Choice
To process real-world capital transfers, sovereign clearings, and mTLS multi-authority bridges, the system requires an immutable, crash-fault-tolerant (CFT) ledger store.

| Metric / Capacity | Current UI Simulator | TigerBeetle Production Cluster |
| :--- | :--- | :--- |
| **Execution Engine** | Single-threaded JavaScript interpreter | Standard Zig compiled binaries utilizing direct I/O |
| **Throughput (TPS)** | ~1,000 operations/sec | **Up to 1,000,000+ financial operations/sec** |
| **Consensus Protocol**| Simulated local validation state | **Viewstamped Replication (VSR)** (State machine replication) |
| **Storage Safety** | Client Memory / LocalStorage | Direct-on-disk physical sectors with **LSM-Tree storage** |
| **Double-Entry Logic**| Custom loop validations | **In-kernel hardcoded static account checking rules** |

### Split-Repo Repo vs. Mono-Cluster Deployments
* **Optimal Best Practice**: **Standalone Backend Cluster Repo**. The TigerBeetle binary engine is implemented in the **Zig Programming Language**. It should be deployed as a Dockerized cluster (3 or 5 node consensus quorum).
* **The Bridge Pattern**: This React gatekeeper console communicates with a lightweight full-stack middle tier (using `/server.ts` or a microservice) which manages the client queries and uses the official `@tigerbeetle/node` SDK driver to execute atomic ledger commits directly on TigerBeetle ports.

---

## 🗺️ Master Integration Topology

```
+────────────────────────────────────────────────────────────────────────┐
│                        SOVR FRONTEND GATEWAY                           │
│                      (React 19 + Tailwind CSS)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ WebSockets / REST API
                                    ▼
+────────────────────────────────────────────────────────────────────────┐
│                         SOVR EXPRESS SERVER                            │
│                     (Middle Tier / Bridge Node)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Native `@tigerbeetle/node` SDK client
                                    ▼
+────────────────────────────────────────────────────────────────────────┐
│                        TIGERBEETLE CLUSTER                             │
│                  (Wyoming Core Ledger Quorum)                          │
│                                                                        │
│   ┌──────────────┐          ┌──────────────┐          ┌──────────────┐ │
│   │ Node 0 (Pri) │ ◄──────► │ Node 1 (Rep) │ ◄──────► │ Node 2 (Rep) │ │
│   └──────────────┘          └──────────────┘          └──────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💾 Core Logic & Schema Bridges

TigerBeetle simplifies Ledger structures into two highly optimized primitive tables: **Accounts** and **Transfers**.

### 1. Ledger Accounts Alignment (`User Accounts` ──► `TigerBeetle Accounts`)

The system translates dynamic GAAP account definitions into standard TigerBeetle binary representations.

```typescript
// Current UI state Schema
interface LedgerAccount {
  id: string;               // Alphanumeric UUID
  code: string;             // Chart reference (e.g. "1000.ASSET")
  kind: 'asset' | 'escrow' | 'liability' | 'revenue' | 'equity';
  balanceMinor: number;     // Math balance representation
}

// TigerBeetle Database Target SDK representation (128-bit unsigned integers)
interface TigerBeetleAccount {
  id: bigint;               // 128-bit unique account identifier
  user_data_128: bigint;    // Metadata link (maps to original String UUID)
  user_data_64: bigint;     // Code reference lookup hashed representation
  user_data_32: number;     // Secondary tags metadata
  ledger: number;           // Currency classification (e.g., 840 for USD, 999 for SVT)
  code: number;             // Account Type Code mapping (e.g., 1000 for ASS, 3000 for EQY)
  flags: number;            // Bitflags (e.g., linked, credits_must_not_exceed_debits, etc.)
  debits_pending: bigint;   // Intermediary escrow states
  debits_posted: bigint;    // Settled balances
  credits_pending: bigint;
  credits_posted: bigint;
}
```

### 2. Transaction Leg Alignment (`Balanced Ledger Elements` ──► `TigerBeetle Transfers`)

Single transfers inside TigerBeetle are natively double-entry (specifying a single source, a destination, and an amount). Complex transactional distributions are chained utilizing **Linked Flags**.

```typescript
// Current Simulated Double Leg Ledger Transaction
interface LedgerTransaction {
  id: string;
  entries: { accountId: string; debitMinor: number; creditMinor: number; }[];
}

// Hashed Bridge translation to TigerBeetle SDK Transfers array:
const tigerBeetleTransfers = [
  {
    id: generateBigInt128Id(),       // Unique transfer transaction ID
    debit_account_id: BigInt(debitId),
    credit_account_id: BigInt(creditId),
    amount: BigInt(minorAmount),
    ledger: 999,                    // Ledger identifier (SVT)
    code: 1,                        // System operational transaction identifier
    flags: 0                        // Optional Link flag if compounding multi-leg logs
  }
];
```

---

## 🛠️ Step-by-Step Practical Setup Blueprint

Follow these exact configurations to spin up and bind TigerBeetle to this frontend.

### Step 1: Cluster Formulation (Local development)
Pull and compile the executable binary directly from the official repository or use standard container files.

```yaml
# docker-compose.yml
version: '3.8'

services:
  tigerbeetle-node-0:
    image: ghcr.io/tigerbeetle/tigerbeetle:latest
    container_name: sovr_tiger_primary
    volumes:
      - tb-data-0:/data
    ports:
      - "3001:3001"
    command: >
      start
      --addresses=0.0.0.0:3001
      --cluster=0
      --replica=0
      --directory=/data

volumes:
  tb-data-0:
```

### Step 2: Initialize Database Data Files
Prior to triggering the docker service daemon, you must format the ledger cluster files:
```bash
docker run --v tb-data-0:/data ghcr.io/tigerbeetle/tigerbeetle format --cluster=0 --replica=0 --directory=/data
```

### Step 3: Server Dependency Injection
Install the high-speed Node native bindings inside your full-stack middle tier:
```bash
npm install tigerbeetle-node --save
```

### Step 4: Establish Core Bridge Connection
Replace standard memory modifications or JSON logs inside `/server.ts` with direct TigerBeetle TCP channels.

```typescript
import { createClient } from "tigerbeetle-node";

// Spawns connection pool to the primary cluster nodes
const tb = createClient({
  cluster_id: 0n,
  replica_addresses: ["3001"]
});

// Example Express middleware bridging API creation calls
app.post("/api/ledger/transfer", async (req, res) => {
  const { debitId, creditId, amountMinor, transactionId } = req.body;
  
  try {
    const results = await tb.createTransfers([{
      id: BigInt(transactionId),
      debit_account_id: BigInt(debitId),
      credit_account_id: BigInt(creditId),
      amount: BigInt(amountMinor),
      pending_id: BigInt(0),   // Zero is standard for auto-post transactions
      ledger: 999,             // SVT Asset specification
      code: 101,               // System balance adjustments classification
      flags: 0,
      timestamp: BigInt(0),    // Automatically allocated by Cluster consensus quorum
    }]);

    // Check for specific system errors (e.g. insufficient funds, account offline)
    if (results.length > 0) {
      return res.status(400).json({ 
        status: "error", 
        error: `Core rejection, code: ${results[0].code}` 
      });
    }

    res.json({ status: "success", info: "Ledger commit verified by quorum" });
  } catch (error: any) {
    res.status(500).json({ status: "error", error: error.message });
  }
});
```

---

## 🤖 Prompt for the Next Coding Agent or AI Studio Workspace

*To spin up, code, and deploy the entire server-side TigerBeetle API integration system, copy and paste this complete context block in your target code channel:*

```text
TITLE: Bootstrap Standalone TigerBeetle Backend Cluster & Integration Layer for SOVR

CONVENANCES & SCOPE:
We are deploying the standalone backend system supporting TigerBeetle ledger integration for the SOVR Capital Routing network. You must construct a high-performance, modular Express middle-tier that links to our client-side dashboard console.

TASKS TO EXECUTE:
1. Initialize a server-side repository or folder containing a modular Express backend server (`server.ts` or `/server/index.ts`).
2. Add a `docker-compose.yml` configuration standardizing a 3-node TigerBeetle replica cluster (Ports 3001, 3002, 3003) utilizing replication variables.
3. Incorporate the official `tigerbeetle-node` library as a key system dependency.
4. Write robust endpoints mirroring the current simulator:
   - GET /api/accounts - Maps and returns client accounts by merging data from TigerBeetle account balances.
   - POST /api/transactions - Parses debit/credit entries, structures them as BigInt arrays, executes them within `createTransfers` transaction pools, and handles precise transactional errors.
   - GET /api/blocks - Interrogates executed transactions to pack them sequentially into consistent database heights.
5. Setup the necessary BigInt-to-JSON serialization middlewares (since native JSON does not support BigInt attributes).
6. Implement fallback mock indicators if the TigerBeetle cluster daemon is starting up, ensuring zero runtime crashes.

Style all code with rigorous TypeScript type definitions, strict error boundaries, and zero placeholder logs. Let's begin building.
```
