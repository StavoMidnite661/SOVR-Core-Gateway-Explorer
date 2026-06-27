# SOVR Event Catalog & Manifest

This document details the complete pub/sub event schemas, lifecycle transitions, and event-driven architectures powering the SOVR Financial Operating System.

---

## 🏛️ Event Pipeline Architecture

The FOS uses an asynchronous Event Bus to coordinate state transitions across isolated microservices, decoupling core financial postings from slower auxiliary pipelines (e.g. archiving or notifications).

```
+--------------------+
|  Ledger Service    | --- [ transaction.created ] ---> (Event Bus)
+--------------------+                                      │
                                             ┌──────────────┴──────────────┐
                                             ▼                             ▼
                                    +------------------+          +------------------+
                                    | Evidence Service |          | Treasury Service |
                                    +------------------+          +------------------+
                                             │                             │
                                  [ proof.generated ]           [ treasury.rebalanced ]
```

---

## 🛰️ Core Events Inventory

### 1. `transaction.created`
* **Publisher**: Ledger Service
* **Subscribers**: Workflow Engine, Notification Service
* **Trigger**: A new manual or API journal transfer is injected.
* **Payload**:
  ```json
  {
    "id": "TX-982343",
    "amountMinor": 8500000,
    "denomination": "SVT",
    "timestamp": "2026-06-26T19:24:50Z"
  }
  ```
* **Failure Behavior**: Re-attempt 3 times. If failure persists, flag state as `DRAFT` and trigger operator alert.

---

### 2. `ledger.posted`
* **Publisher**: Ledger Service
* **Subscribers**: Trust Vault, Compliance Hub, Audit Service
* **Trigger**: Double-entry debits and credits mathematically balance and are written to account masters.
* **Payload**:
  ```json
  {
    "txId": "TX-982343",
    "postedAt": "2026-06-26T19:24:51Z",
    "merkleIndex": 184
  }
  ```
* **Retry Policy**: Infinite retry with exponential backoff; double-entry state remains unposted until written to prevent out-of-sync balances.

---

### 3. `receipt.generated`
* **Publisher**: Trust Vault Service
* **Subscribers**: Evidence Service, Client Handlers
* **Trigger**: A cryptographic signature and SHA-256 seal are attached to a posted transaction.
* **Payload**:
  ```json
  {
    "txId": "TX-982343",
    "receiptId": "REC-8234",
    "validatorSignatures": ["0x9fa...ee32"],
    "gasBurnOffset": 12
  }
  ```

---

### 4. `settlement.completed`
* **Publisher**: Settlement Engine
* **Subscribers**: Ledger Service, Treasury Service, Client Notification Bus
* **Trigger**: Cleared capital is physically routed and credited to commercial bank vaults.
* **Payload**:
  ```json
  {
    "txId": "TX-982343",
    "referenceCode": "STRIPE-CHG-9842",
    "valueUSD": 85000
  }
  ```

---

### 5. `node.heartbeat`
* **Publisher**: Validator Registry Service
* **Subscribers**: System Health Monitor, Admin Dashboard
* **Trigger**: A validator node cluster broadcasts its operational metrics.
* **Payload**:
  ```json
  {
    "nodeId": "NODE_01",
    "latencyMs": 14,
    "cpuUsage": 12.5,
    "status": "ONLINE"
  }
  ```
