# SOVR Backend Service Inventory

This document details the backend microservices, daemon engines, and API services necessary to support the SOVR Financial Operating System in a distributed, multi-region production environment.

---

## 🏛️ Microservice Map

The platform is structured as a collection of decoupled, domain-specific services communicating via REST APIs and a central Event Bus.

```
                  +-----------------------------------+
                  |          GATEWAY FABRIC           |
                  +-----------------------------------+
                                    │
    ┌──────────────┬────────────────┼──────────────┬──────────────┐
    ▼              ▼                ▼              ▼              ▼
+--------+    +────────+       +────────+     +────────+     +────────+
| LEDGER |    |TREASURY|       |SETTLE- |     |EVIDENCE|     |WORKFLOW|
| SERVICE|    | SERVICE|       |  MENT  |     | SERVICE|     | ENGINE |
+--------+    +--------+       +────────+     +────────+     +────────+
```

---

## 🔬 Service Detailed Specifications

### 1. Ledger Service
* **Purpose**: Coordinates double-entry accounts ledger state and implements GAAP algebraic invariant checks.
* **Inputs**: Balanced journal debit/credit lines.
* **Outputs**: Account balances, verified audit-trail sequences, double-entry status codes.
* **Events Published**: `ledger.posted`, `transaction.failed`
* **Database Tables**: `F0901_AccountMaster`, `F0911_TransactionDetail`, `F0902_AccountBalances`
* **External Dependencies**: Local Database (PostgreSQL / Cloud SQL)

### 2. Treasury Service
* **Purpose**: Manages global multi-currency pools and monitors real-time SVT reserve vault thresholds.
* **Inputs**: Re-balancing triggers, manual reserves allocation requests.
* **Outputs**: Real-time asset capacity percentages, regional supply volumes.
* **Events Published**: `treasury.rebalanced`, `reserve.threshold.reached`
* **Database Tables**: `F1201_AssetMaster`, `TreasuryVaultReserves`
* **External Dependencies**: Foreign exchange rate feeds, central bank reserves webhooks.

### 3. Settlement Engine
* **Purpose**: Executes capital clearance, liquidity transfers, and routes settlements to physical bank rails.
* **Inputs**: Liquidity routing paths, payee accounts, settlement volume totals.
* **Outputs**: Settlement receipts, gas offset indexes, ACH transfer confirmations.
* **Events Published**: `settlement.initiated`, `settlement.completed`
* **Database Tables**: `F0011_BatchControl`, `SettlementRailsConfig`
* **External Dependencies**: Clearing House API, Stripe, Plaid, Polygon Oracle APIs.

### 4. Evidence Service
* **Purpose**: Compiles, signs, and packages immutable audit-trail bundles for regulatory compliance (SEC 17a-4).
* **Inputs**: Completed transaction records, validator signatures.
* **Outputs**: Compressed evidence zip bundles, SHA-256 integrity proofs.
* **Events Published**: `proof.generated`, `package.created`
* **Database Tables**: `F0101_AddressBook`, `ComplianceEvidenceStore`
* **External Dependencies**: SHA-256 Proof Sealer Enclave, Cloud Object Storage (S3 / GCS).

### 5. Workflow Engine
* **Purpose**: Orchestrates the 7-step transaction progression stream from gateway ingestion to settlement.
* **Inputs**: Raw payment transaction payloads.
* **Outputs**: Step-by-step progress status updates, process telemetry.
* **Events Published**: `transaction.created`, `workflow.step.advanced`
* **Database Tables**: `ActiveWorkflows`, `WorkflowStateRegistry`
* **External Dependencies**: Central Event Bus.

### 6. Node Registry & Verification Service
* **Purpose**: Monitors health of validator nodes and records peer quorum cryptographic heartbeat signals.
* **Inputs**: Heartbeat pings, public keys.
* **Outputs**: Peer cluster status matrix, latency calculations.
* **Events Published**: `node.heartbeat`, `connector.online`, `validator.offline`
* **Database Tables**: `ValidatorRegistry`, `HeartbeatLogs`
* **External Dependencies**: Distributed validation node machines.
