# 🗃️ Ledger Seeding & Static Topology Data (`/src/data`)

This directory serves as the primary cryptographic source of truth for the **SOVR Capital Routing Command Center** ledger initialization parameters, geographical peer anchoring locations, and standard balance representations. It integrates GAAP ledger schemas with the structural database mappings of SOVR Development Holdings LLC architectural schemas (incorporating `F0901`, `F0911`, and `F0902` systems).

---

## 💾 Core File Structure

### 📝 `seed.ts`
This module defines the initial state of the financial environment, including seed ledger accounts, starting transaction histories, clearing routing paths, geographical coordinate nodes, and currency and minor unit formatters. It enforces perfect thermodynamic ledger balance states upon initialization.

---

## 📊 Core Data Structures, Mappings & Schemas

The data entities inside this directory map frontend layouts directly to robust dual-entry double-accounting schemas:

### 1. `LedgerAccount` (`/src/types.ts`)
Standard double-entry account definition following GAAP classification rules:
```typescript
interface LedgerAccount {
  id: string;               // Unique primary key identifier (UUID string)
  code: string;             // Alphanumeric ledger chart classification (e.g., "1000.ASSET")
  name: string;             // Dynamic humanoid-readable name ("SOVR Clearing", "Reykjavik Clearing")
  kind: AccountKind;        // Enum classification: 'asset' | 'escrow' | 'liability' | 'revenue' | 'equity'
  denomination: 'USD' | 'SVT' | 'USDC'; 
  balanceMinor: number;     // Absolute balance represented as prime minor units (cents / 1e-2 base as integers)
}
```

---

### 2. `Transaction` & `LedgerEntry`
Represents an atomic, cryptographically validated transaction containing multiple unbalanced entries that must sum to zero algebraically across the system:
```typescript
interface Transaction {
  id: string;                 // Unique transaction address / hash signature block
  description: string;        // Human-readable transaction ledger classification
  createdAt: string;          // ISO 8601 formatted timestamp string
  hash: string;               // Simulated SHA-256 integrity seal fingerprint
  validatorId: string;        // Sovereign validator node identity that authorized the commit
  blockHeight: number;        // Immutable block sequence height index
  ledgerType?: 'AA' | 'BA' | 'AU' | 'CA'; // SOVR Ledger representation types (AA: Actual, BA: Budget)
  entries: LedgerEntry[];     // Dual-leg transaction legs balancing algebraically to zero
}

interface LedgerEntry {
  accountId: string;          // Target account relation
  accountCode: string;        // Rapid alphanumeric lookup identifier
  debitMinor: number;         // Ingress value in base integer limits (positive, otherwise zero)
  creditMinor: number;        // Egress value in base integer limits (positive, otherwise zero)
  subledgerCode?: string;     // Legacy subledger tracking identifier (e.g. F0101 address or F1201 asset keys)
}
```

---

### 3. SOVR Development Holdings LLC Schema Integration

The system includes simulated file structures correlating with SOVR Development Holdings LLC ledger operational specifications (incorporating legacy F0901, F0911, and F0902 structures):

```
                  +----------------------------------------------+
                  |           F0101 Address Book Master          |
                  |     (Addresses, Customers, Contractors)      |
                  +----------------------┬-----------------------+
                                         │ Mapped via Code
                                         ▼
+───────────────────────+       +─────────────────+       +───────────────────────+
| F0901 Account Master  | ◄────┤  F0911 Ledger   ├─────► | F0902 Balance Summary |
|   (BU.OBJ.SUB Index)  |       |   (Detail Rows) |       |   (Aggregated Buckets)|
+───────────────────────+       +─────────────────+       +───────────────────────+
           ▲                                                         │
           │                                                         ▼
+──────────┴────────────+                                 +───────────────────────+
| F1201 Asset Master    |                                 | P09410 Trial Balance  |
|  (Equipment Register) |                                 | P10111 GAAP Statements|
+───────────────────────+                                 +───────────────────────+
```

* **F0901 (General Ledger Account Master)**:
  - Establishes the physical database accounts.
  - Dictates formatting rules: `Business Unit` (1-12 chars) + `Object Account` (4-6 chars) + `Subsidiary` (1-8 chars) separated by period-dot (`.`).
  - Stores alternate accounts indices: Standard index, Alternate 3rd G/L representations, Short ID numbers, and automated speed codes.
* **F0911 (Account Ledger Detail File)**:
  - Generates unique transactional rows for all dual-leg entries.
  - Classifies records by **Ledger Type**:
    - `AA` (*Actual Amounts*): Realized ledger postings (Default).
    - `BA` (*Budget Amounts*): Intended budget allocation checkpoints.
    - `AU` (*Account Units*): Non-monetary tracking parameters if necessary.
    - `CA` (*Foreign Currency Actuals*): Cross-border clearing parameters.
  - Assigns dynamic subledgers (`subledgerCode`) categorized by **Subledger Types**:
    - Type `A` (*Address Book*): Cross-referenced with standard client files inside `F0101 Address Book Master`.
    - Type `N` (*Numeric Code*): Non-alphabetic numeric sorting IDs.
    - Type `C` (*Customer/Payee Key*): Links outgoing payments directly to corporate balances.
* **F0902 (Account Balance File)**:
  - Keeps aggregated, period-by-period balance buckets.
  - Serves as the high-speed data reservoir mapping parameters into the **P09410 Internal Trial Balance Audit Sheet** and **P10111 GAAP Statutory Core Financial Reports**.
* **GLG (Automatic Accounting Instructions / AAIs)**:
  - Encodes translation algorithms within the application, instructing the system on how to distribute operational balances (such as resolving net revenue and cost variables into gross equity reserves during month-end closing exercises).

---

### 4. Geographical Gateway Anchors (`GeoNode`) & Route Channels
Represents geographic hubs plotted on the 3D rotating globe visualization, mapping active peer routing structures:
```typescript
interface GeoNode {
  id: string;               // Unique structural system identifier (e.g. "ZRH_T")
  name: string;             // Display name (Zurich Treasury, Reykjavik Validator)
  role: string;             // Operational status classification (clearing bridge, validator)
  lat: number;              // Coordinate Latitude mapping
  lon: number;              // Coordinate Longitude mapping
  svtAllocation: number;   // Active vault supply distribution within this peer node (SVT decimals)
  pulseRate: number;        // Telemetry communication frequency (Hz equivalent)
}

interface Route {
  id: string;               // Unique connection identifier
  fromNodeId: string;       // Origin Peer ID
  toNodeId: string;         // Target Peer ID
  speedMs: number;          // Network execution velocity indicator
  active: boolean;          // Operational switch
}
```

---

## 🧮 Monetary Safety, Precision & Big-Integer Math

JavaScript's standard double-precision float engine (`IEEE 754`) is prone to compounding floating-point representation rounding bugs:
$$\text{Javascript Float: } 0.1 + 0.2 \implies 0.30000000000000004$$

To achieve flawless enterprise accounting consistency, **SOVR Core keeps all monetary balances completely within absolute integer representations (minor units / cents)**.

* **Decimal Omitting Math**: 1 USD is stored strictly as `100` (minor unit integer). 1 SVT is stores as `100` minor units.
* **Continuous Integrity Checks**: On ledger operations, the system evaluates all transactional bounds:
  $$\sum \text{debits} - \sum \text{credits} = 0$$
* **Formatting Layer**: Real-world currency symbols and standard decimal separators (`.`) are injected solely on the presentation layer inside the UI components using the `formatCurrency` and `formatMinor` algorithms to prevent precision data loss.
