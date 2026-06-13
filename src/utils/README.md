# 🧮 Cryptographic and System Utilities (`/src/utils`)

This directory houses the pure TypeScript mathematical, hashing, and blockchain utilities driving the data integrity pipelines of the **SOVR Core Gateway Explorer & Capital Routing Command Center**. By maintaining absolute separation from external Node-specific or browser-bound environment libraries, this directory ensures highly fast, deterministic execution across all runtime conditions.

---

## 💾 Core File Structure

### 📝 `sha256.ts`
Provides a synchronous, custom-optimized, pure TypeScript implementation of the **National Institute of Standards and Technology (NIST) FIPS 180-4 Secure Hash Algorithm (SHA-256)**. 

---

## 🔒 Hashing Engine Internals & Math Definitions

The core hash function transforms an arbitrary variable-length string payload into a fixed-length hexadecimal digest of **256 bits** (represented as a 64-character lowercase hex signature).

### 1. Function Signature
```typescript
/**
 * Calculates a secure 256-bit cryptographic digest.
 * @param ascii High-entropy string input (e.g., transaction payloads, block matrices)
 * @returns 64-character lowercase hexadecimal hash signature
 */
export function sha256(ascii: string): string;
```

### 2. Standard Round Constants (`k`)
The compression engine is initialized with the fractional parts of the prime square and cube roots of the first 64 prime numbers. These values are hardcoded as unsigned 32-bit integers to provide absolute computational entropy and eliminate "nothing-up-my-sleeve" numbers:
* Root Constants range from `0x428a2f98` ($P_{1}=2$) up to `0xc67178f2` ($P_{64}=311$).

### 3. Step-by-Step Processing Pipeline

#### A. Word Conversion & Padding
Standard javascript characters are packed into 32-bit integer arrays. To satisfy SHA-256 padding constraints, the payload is buffered to a multiple of 512 bits:
1. Append a single bit flag `1` (implemented via bit shifting: `0x80 << (24 - (asciiLength % 4) * 8)`).
2. Allocate necessary `0` padding bits.
3. Inject the original message bit-length parameter into the final 64-bit block segment in big-endian representation.

#### B. Bitwise Function Helpers
To optimize execution speed and prevent garbage collection bottlenecks, the engine uses raw bitwise expressions:
* **Right Rotation (Circular Right Shift)**:
  $$\text{rightRotate}(v, a) = (v \gg a) \mid (v \ll (32 - a))$$
* **Logical Choice Function (`ch`)**:
  $$\text{ch}(e, f, g) = (e \wedge f) \oplus (\neg e \wedge g)$$
* **Logical Majority Function (`maj`)**:
  $$\text{maj}(a, b, c) = (a \wedge b) \oplus (a \wedge c) \oplus (b \wedge c)$$
* **Sigma Zero and Sigma One Transform equations**:
  $$S_{0}(a) = \text{RotateRight}(a, 2) \oplus \text{RotateRight}(a, 13) \oplus \text{RotateRight}(a, 22)$$
  $$S_{1}(e) = \text{RotateRight}(e, 6) \oplus \text{RotateRight}(e, 11) \oplus \text{RotateRight}(e, 25)$$

#### C. Message Schedule Expansion (`w`)
Every 512-bit message block is expanded from 16 initial 32-bit words into an array of 64 words using:
$$w[j] = w[j-16] + s_{0} + w[j-7] + s_{1}$$
Where $s_0$ and $s_1$ are helper bit-modulators tracking neighboring words.

#### D. Core Compression Loop
The internal state registers `a` through `h` are mutated over 64 distinct mathematical compression steps utilizing the variables $S_{0}$, $S_{1}$, $\text{ch}$, $\text{maj}$, and round constants $k[j]$, producing a completely irreversible, collision-resistant cryptographic hash signature.

---

## 🧪 Real-World Use Cases inside SOVR Core

The utility tools in this module secure multiple architectural boundaries of the Capital Routing command console:

### 1. Blockchain Block Seals
When a new ledger block is forged, the `BlocksChain` component aggregates the previous block's hash, current transaction arrays, and mined nonce, feeding the final string into `sha256()` to seal the block:
```typescript
import { sha256 } from './utils/sha256';

const previousHash = "8c3e21e7f3a2b1662defa0f5e712a42dd094f31cfa754ebfa05f426214227f22";
const transactionRoot = "fbc0bc1a3ef48de76910aee76af6a7d1891d1ea0094bffeeab22cd42ff782";
const timestamp = "1781167617436";
const nonce = "1049281";

const blockHashSeal = sha256(previousHash + transactionRoot + timestamp + nonce);
console.log(`Validator Quorum Mined Block Hash: ${blockHashSeal}`);
```

### 2. Transaction Receipt Audits
Every ledger transaction injected via the manual routing or webhook systems receives an individual receipt hash derived from:
$$\text{Receipt Hash} = \text{sha256}(\text{ID} + \text{Timestamp} + \text{Amount} + \text{Accounts})$$
This allows immediate, tamper-proof audit trace tracking in the Forensic ledger view.

### 3. JDE Integrity Handshake Validation
During JDE compliance stress sweeps, active transaction detail collections are hashed and checked against historic state parameters, safeguarding the ledger against manual database manipulation.
