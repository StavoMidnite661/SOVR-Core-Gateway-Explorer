# 📂 Cryptographic Component Directory (`/src/components`)

This directory houses the primary frontend UI interactive segments, data visualizations, and cryptographic simulators of the **SOVR Core Command Center** interface hierarchy. All items are modular, typed with standard TypeScript, and fully styled via Tailwind CSS util classes with `motion` spring states.

---

## 🏗️ Core Structural Layout

```mermaid
graph TD
    App[src/App.tsx]
    App --> SovereignLanding[SovereignLanding.tsx]
    App --> CommandCenterView[CommandCenterView.tsx]
    
    CommandCenterView --> SovereignGlobe[SovereignGlobe.tsx]
    CommandCenterView --> BlocksChain[BlocksChain.tsx]
    CommandCenterView --> AccountsList[AccountsList.tsx]
    CommandCenterView --> ConnectedAppsList[ConnectedAppsList.tsx]
    CommandCenterView --> TransactionsHistory[TransactionsHistory.tsx]
    CommandCenterView --> ManualTransactionForm[ManualTransactionForm.tsx]
    CommandCenterView --> RegisterIntegrationForm[RegisterIntegrationForm.tsx]
    CommandCenterView --> QuantumEntropyOscilloscope[QuantumEntropyOscilloscope.tsx]
```

---

## 🧩 Architectural Breakdown & Attribute API Specs

### 1. `SovereignLanding.tsx`
* **Purpose**: Implements the high-security portal splash gatekeeper. It locks navigation until the operator certifies their cryptographic authority, generating biometric/session verification sounds using the browser Web Audio API. Also displays ZKP (Zero-Knowledge Proof) agreements and immutable compliance documents.
* **Property Signature & Interface**:
  ```typescript
  interface SOVRLandingProps {
    onEnter: () => void;            // Triggered upon successful authorization certificate matching
    totalAssetsUSD: number;         // Root reference value representing active aggregated balances
    totalSVT: number;               // Consolidated state tracker for circulating SVT supply units
  }
  ```
* **Critical Subsections**:
  - `AudioSynthService`: Standard inline oscillator module synthesizing high cyber chimes (880Hz to 1400Hz saw sweep) and active sub-bass drops (90Hz drop down to 32Hz triangle waveforms). Runs fully client-side on consumer interaction.
  - Interactive canvas vector particle grid with glitching matrices representing raw byte stream entries.

---

### 2. `CommandCenterView.tsx`
* **Purpose**: Serves as the primary operational viewport for administrative commands. Houses active monitoring tiles, telemetry feeds, and houses child controls for registering assets or verifying Webhook endpoints.
* **Component Attributes / State Hierarchy**:
  - Receives complete state matrices from `App.tsx` (all ledger histories, total seed states, active webhook configs) to broadcast state events instantly.
  - Features real-time state clocks synchronizing local timezone offsets with standard UTC offsets.

---

### 3. `SovereignGlobe.tsx`
* **Purpose**: Multi-layer 3D network visualization rendered using Three.js / CSS screen space projections. Draws geographic trust markers, rotating orbit trajectories, and transaction pulse waves.
* **Property Signature & Interface**:
  ```typescript
  interface SOVRGlobeProps {
    geoNodes: GeoNode[];             // Structured coordinates mapping active regional financial anchors
    routes: Route[];                 // Global route path matrices defining cryptographic peering channels
    selectedNodeId: string | null;   // Active node highlight filter state
    onSelectNode: (id: string | null) => void;
    onSelectRoute: (id: string | null) => void;
    heatmapOn: boolean;              // Global toggle rendering local density coordinates
  }
  ```
* **Performance Parameters**:
  - Utilizes `requestAnimationFrame` for rotation math, bounded with component cleanup loops inside dedicated `useEffect` hooks to prevent memory leaks.

---

### 4. `QuantumEntropyOscilloscope.tsx`
* **Purpose**: Simulates quantum entropic coherence levels on an interactive HTML5 viewport. Mimics continuous hardware entropy accumulation used to generate cryptographically safe challenge-response hashes.
* **Features**:
  - **Superposition Collapse**: Clicking triggers manual wave-function collapsing, falling instantly into deterministic state vectors (`|0⟩` or `|1⟩`) with realistic dampening mathematics inside a 60Hz loop.

---

### 5. `AccountsList.tsx`
* **Purpose**: Modern double-entry double-entry account ledger tracker, showing category filters for:
  - Assets (`asset`)
  - Escrow (`escrow`)
  - Liabilities (`liability`)
  - Revenues (`revenue`)
  - Capital/Equities (`equity`)
* **Property Signature**:
  ```typescript
  interface AccountsListProps {
    accounts: LedgerAccount[];       // Structured double-entry ledger state
  }
  ```

---

### 6. `BlocksChain.tsx`
* **Purpose**: Fully browsable vertical and horizontal timeline displaying successive block heights sealed via consensus quorum. Detail panels expose raw block hashes, timestamps, and mathematical parent signatures.
* **Property Signature**:
  ```typescript
  interface BlocksChainProps {
    chain: HashBlock[];              // Immutable chronologically ordered blockchain nodes
    onForceSeal: () => void;         // Triggers instant block mining utilizing local transaction queues
    isSealing: boolean;              // Visual loading toggle signaling active hash search
  }
  ```

---

### 7. `ConnectedAppsList.tsx`
* **Purpose**: Exposes structural attributes of live financial gates, bridge connections, and automated audit logs. Displays continuous ping simulations and security clearance metrics.
* **Dynamic Items**:
  - Renders live system heartbeats with mutual TLS (`mTLS`) validation credentials.

---

### 8. `TransactionsHistory.tsx`
* **Purpose**: Robust transactional grid with deep sorting capabilities. Shows forensic routing trees mapping credit sources and debit dests.
* **Features**:
  - Supports search pattern filtering against specific public transaction hash addresses or transaction descriptions.

---

### 9. `ManualTransactionForm.tsx` & `RegisterIntegrationForm.tsx`
* **Purpose**: Data-entry forms verifying and executing ledger changes:
  - **Manual Transactions**: Requires debit balance balance offsets to strictly match credit values (`Debit == Credit` alignment) before firing off the state dispatch callbacks.
  - **Register Integration**: Supports entering remote API targets, token challenges, and signature credentials securely.

---

## 🔑 State & Data Binding Design Best Practices

1. **Avoid Double-State Synchronization**: Let the top parent (`App.tsx` or `CommandCenterView.tsx`) hold the absolute truth (single source of truth).
2. **Proper Cleanup**: Always release Web Audio context nodes and stop `setInterval` variables inside native React `useEffect` callback arrays to maintain zero leakage.
