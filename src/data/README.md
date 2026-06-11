# 🗃️ Ledger Seeding & Static Topology Data (`/src/data`)

This directory is the source of truth for the **SOVR Capital Routing Command Center** ledger initialization parameters, geographical anchoring locations, and standard balance representations.

---

## 💾 Core File Structure

### 📝 `seed.ts`
This module defines the initial state of the financial environment, initial ledger balances, and helper format utilities used across the components.

---

## 📊 Core Data Structures & Schemas

### 1. `LedgerAccount` (`/src/types.ts`)
Standard double-entry account definition following GAAP rules:
```typescript
interface LedgerAccount {
  id: string;               // Unique primary key identifier (uUid representation)
  code: string;             // Alphanumeric ledger chart classification (e.g., "1000.ASSET")
  name: string;             // Dynamic humanoid-readable name ("SOVR Clearing", etc.)
  kind: AccountKind;        // Enum classification: 'asset' | 'escrow' | 'liability' | 'revenue' | 'equity'
  denomination: 'USD' | 'SVT' | 'USDC'; 
  balanceMinor: number;     // Absolute balance represented as prime minor units (cents / 10^-2 base)
}
```

---

### 2. `LedgerTransaction`
Represents an atomic double-entry transfer of funds:
```typescript
interface LedgerTransaction {
  id: string;               // Unique transaction identifier
  timestamp: string;        // ISO 8601 formatted timestamp string
  description: string;      // Human-readable ledger entry description
  hash: string;             // Simulated SHA-256 integrity seal fingerprint
  entries: LedgerEntry[];   // Array of debit and credit legs balancing algebraically to zero
}

interface LedgerEntry {
  accountId: string;        // Target account reference
  accountCode: string;      // Quick account chart code lookup
  debitMinor: number;       // Ingress minor amount (positive integer, otherwise zero)
  creditMinor: number;      // Egress minor amount (positive integer, otherwise zero)
}
```

### 3. Geographical Router Anchors (`GeoNode`)
Points plotted onto the 3D WebGL rotating world globe representing central peering centers:
```typescript
export const initialGeoNodes: GeoNode[] = [
  { id: 'ZRH_T', name: 'Zurich Treasury', role: 'SOVR Vault Agent', lat: 47.3769, lon: 8.5417, ...},
  { id: 'REK_V', name: 'Reykjavik Validator', role: 'Quorum Signatory', lat: 64.1466, lon: -21.9426, ...},
  { id: 'NYC_L', name: 'New York Liquidity', role: 'Clearing Bridge', lat: 40.7128, lon: -74.0060, ...},
  { id: 'TYO_S', name: 'Tokyo Settlement', role: 'Core Mint Anchor', lat: 35.6762, lon: 139.6503, ...},
  { id: 'SYD_P', name: 'Sydney Peer Channel', role: 'Dynamic Watcher', lat: -33.8688, lon: 151.2093, ...},
  { id: 'SGP_X', name: 'Singapore Cross', role: 'Audit Witness Node', lat: 1.3521, lon: 103.8198, ...}
];
```

---

## 🧮 Currency Resolution & Minor Units

To prevent standard JavaScript floating-point representation bugs (`0.1 + 0.2 === 0.30000000000000004`), **all financial calculations are resolved inside minor units (integers)**. 

### Conversion Helpers inside `seed.ts`
- **`formatCurrency(amountMinor: number, currency: string): string`**:
  Converts minor integer representations cleanly divided by `100` into localized, formatted outputs (e.g., `1850000000` balance minor is rendered as `$18,500,000.00`).
