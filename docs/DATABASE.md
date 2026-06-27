# SOVR Database Schema Manifest

This document outlines the relational database specifications, entity-relationship diagrams, and retention schedules required to host the SOVR Financial Operating System on an enterprise PostgreSQL database (e.g. Cloud SQL).

---

## 🏛️ Entity-Relationship Diagram (GAAP Core)

```
 +------------------------+              +------------------------+
 |   F0901_AccountMaster  |              |  F0911_TransactionDetail|
 +------------------------+              +------------------------+
 | PK  account_code (text)| <──────────┐ | PK  id (uuid)          |
 |     name (text)        |            └─| FK  account_code (text)|
 |     type (text)        |              |     amount_minor (bigint)|
 |     balance (bigint)   |              |     entry_type (text)  |
 +------------------------+              | FK  batch_id (uuid)    |
                                         +------------------------+
                                                     │
                                                     ▼
                                         +------------------------+
                                         |   F0011_BatchControl   |
                                         +------------------------+
                                         | PK  batch_id (uuid)    |
                                         |     sealed_hash (text) |
                                         |     created_at (timest)|
                                         +------------------------+
```

---

## 📂 Relational Tables

### 1. `F0901_AccountMaster`
Stores the corporate general ledger account codes and current balances mapped to GAAP standard classes.
* **Fields**:
  * `account_code` (TEXT, Primary Key): Unique account path in format `BU.OBJ.SUB` (e.g. `10.1100.01`).
  * `name` (TEXT): Descriptive ledger name (e.g., "Zurich Checking Reserve").
  * `type` (TEXT): GAAP category, restricted to: `Asset`, `Liability`, `Escrow`, `Revenue`, `Equity`.
  * `balance_minor` (BIGINT): Current account balance in the minor unit (cents).
  * `updated_at` (TIMESTAMP WITH TIME ZONE): Date of last posted detail.

---

### 2. `F0911_TransactionDetail`
Individual double-entry line items representing debits and credits posted against master accounts.
* **Fields**:
  * `id` (UUID, Primary Key): Unique transaction line ID.
  * `tx_group_id` (UUID): Shared identifier linking all balanced lines within a single transaction.
  * `account_code` (TEXT, Foreign Key): References `F0901_AccountMaster`.
  * `amount_minor` (BIGINT): Value of transfer. Positive for Debits, negative for Credits.
  * `entry_type` (TEXT): Direct classification: `DEBIT` or `CREDIT`.
  * `memo` (TEXT): Audit explanation tag.
  * `created_at` (TIMESTAMP WITH TIME ZONE).

---

### 3. `F0011_BatchControl`
Chronicles closed sets of balanced transactions sealed into blocks within the horizontal chain.
* **Fields**:
  * `batch_id` (UUID, Primary Key).
  * `height` (BIGINT): Monotonically increasing height block number.
  * `block_hash` (TEXT): SHA-256 block seal digest.
  * `prev_hash` (TEXT): Parent block seal.
  * `merkle_root` (TEXT): Merkle Root proof of batch items.
  * `sealed_at` (TIMESTAMP WITH TIME ZONE).

---

### 4. `ComplianceEvidenceStore`
Audit archive registry tracking generated artifacts exported to object storage.
* **Fields**:
  * `id` (TEXT, Primary Key): Standard identifier (e.g., `SC-20260626-000021`).
  * `transaction_ids` (JSONB): List of constituent transaction IDs.
  * `file_url` (TEXT): Location on Object Storage (e.g. Google Cloud Storage).
  * `sha256_proof` (TEXT): Binary file hash.

---

## 🏛️ Data Retention Policy

To support SEC Rule 17a-4 and general financial regulations:
* **GAAP Ledger Records (`F0901`, `F0911`)**: Retain indefinitely. Deletions are forbidden. Reversals must occur via matching compensating journal entries.
* **System Heartbeat Logs**: Retain for 30 days, then compress and export to long-term cold archives.
