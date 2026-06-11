# 🧮 Cryptographic and System Utilities (`/src/utils`)

This directory houses the operational utilities and crypto core helpers running within the **SOVR Core Gateway Explorer**.

---

## 💾 Core File Structure

### 📝 `sha256.ts`
Provides a synchronous, pure TypeScript implementation of the standard **National Institute of Standards and Technology (NIST) FIPS 180-4 Secure Hash Algorithm (SHA-256)**.

---

## 🔒 Cryptographic Implementation Details

### 1. `sha256(ascii: string): string`
* **Purpose**: Generates standard 256-bit hexadecimal digest strings for ledger sealing, Merkle validation checks, and transaction tracking.
* **Signature**:
  ```typescript
  export function sha256(ascii: string): string;
  ```
* **Engine Internals**:
  - **Bitwise Bit Rotation**: Inline `rightRotate(value, amount)` operations avoid overhead from external Node/V8 crypto binding bindings.
  - **Schedule Schedule Constants**: Uses standard fractional components of the prime square and cube roots of the first 64 prime numbers to initialize hash states (`H0` to `H7` and `K0` to `K63`).
  - **Message Padding**: Correctly appends standard binary padding (a single `1` bit followed by `0` bits, concluded by the 64-bit big-endian representation of the input's original bit length).
  - **Compression Loop**: Processes message inputs in sequential 512-bit blocks to yield deterministic 32-character hex decimals.

---

## 🧪 Developer Usage Scenario

```typescript
import { sha256 } from '../utils/sha256';

// Calculate the cryptographic block integrity root
const parentHash = "8c3e21e7f3a2b1662defa0f5e712a42dd094f31cfa754ebfa05f426214227f22";
const transactionMerkle = "fbc0bc1a3ef48de76910aee76af6a7d1891d1ea0094bffeeab22cd42ff782";
const combinedBlockPayload = parentHash + transactionMerkle + Date.now().toString();

const blockHashSeal = sha256(combinedBlockPayload);
console.log(`Merkle Target Seal: 0x${blockHashSeal}`);
```
