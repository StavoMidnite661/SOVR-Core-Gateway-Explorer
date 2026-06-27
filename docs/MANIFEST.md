# SOVR Repository Manifest

This file provides a canonical map of the SOVR Financial Operating System codebase, its repository structure, development statuses, and system limits.

---

## 🏛️ System Metadata
* **Ecosystem Name**: SOVR Financial Operating System (FOS)
* **Version**: `3.8.2-GA` (Enterprise Edition)
* **Build Status**: [![Build Status](https://img.shields.io/badge/Build-Succeeded-02c39a?style=flat-back&logo=github)]()
* **Security Seal**: Verified SHA-256 Proof-of-Authority Authority Seal
* **Primary Target Stack**: Node.js v18+, Express, React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4

---

## 📂 Repository Structure

```
sovr-fos/
├── .env.example                # Sample template for required secrets and configurations
├── .gitignore                  # Active patterns to filter local artifacts
├── README.md                   # Operator entrypoint and comprehensive user manual
├── ARCHITECTURE.md             # Core architectural guidelines and technical specifications
├── SYSTEM.md                   # Platform specifications and state coordination
├── CHANGELOG.md                # Historic releases and revision records
├── ROADMAP.md                  # Short, medium, and long term developmental vectors
├── API.md                      # Complete endpoint schema specifications
├── CONTRIBUTING.md             # Guide for contributing code and peer review standards
├── ENVIRONMENT.md              # Complete guide on environment variables
├── DEPLOYMENT.md               # Cloud Run, Kubernetes, and static distribution manual
├── SECURITY.md                 # Cybersecurity protocols and vulnerability response
├── WORKFLOWS.md                # Core business transactions workflows
├── SERVICES.md                 # Backend microservice specifications and inventory
├── DATABASE.md                 # Table schemas, subledgers, and data relations
├── EVENTS.md                   # Microservice message formats and pub/sub events
├── CONFIGURATION.md            # Settings maps and policy engine configurations
├── PRODUCTION_READINESS.md     # Pre-flight production requirements checklist
├── launch.bat                  # One-shot developer console startup script
├── setup_network.bat           # Native Windows server initiator
├── setup_network.sh            # Native Unix/Linux server initiator
├── metadata.json               # AI Studio Applet configurations
├── server.ts                   # Custom Express server and API proxy router
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite bundle configurations
├── package.json                # Project dependencies, scripts, and runtime engines
├── assets/                     # Core image visual assets and icons
└── src/                        # Main development codebase
    ├── App.tsx                 # Main application shell and tab layouts
    ├── index.css               # Global styling, Tailwind 4 directives and custom theme
    ├── main.tsx                # Client-side entrypoint
    ├── types.ts                # Consolidated GAAP types and data structures
    ├── vite-env.d.ts           # Vite global types and module declarations
    ├── components/             # Component catalog and operational widgets
    │   ├── README.md           # Developer specifications for UI modules
    │   ├── AccountsList.tsx    # GAAP account list explorer
    │   ├── AdministrationView.tsx # Entity and settings administration view
    │   ├── AuditVault.tsx      # Comprehensive trial audit logging tool
    │   ├── BlocksChain.tsx     # Micro-chain blocks horizontal visualization
    │   ├── CommandCenterView.tsx # Core operator widgets control desk
    │   ├── ComplianceHub.tsx   # F0901 account master and regulatory reports
    │   ├── ConnectedAppsList.tsx # Linked microservices checklist
    │   ├── ConnectedSystems.tsx # Linked gateways dynamic list
    │   ├── EvidencePortal.tsx  # Compliance file packaging workspace
    │   ├── GatewayFabric.tsx   # REST/WebSocket routing configurations
    │   ├── ManualTransactionForm.tsx # Perfect double-entry ledger injector
    │   ├── MissionControlView.tsx # Main high-fidelity operational overview
    │   ├── MobileTerminalView.tsx # Simulated operator handheld viewport
    │   ├── NodeRegistry.tsx    # Validator clusters health tracker
    │   ├── OrchestrationEngine.tsx # Step-by-step workflow tracking interface
    │   ├── QuantumEntropyOscilloscope.tsx # True-noise generator visualizer
    │   ├── RegisterIntegrationForm.tsx # Inbound systems linkage form
    │   ├── ServiceDependencyGraph.tsx # Reactive microservices visual link
    │   ├── SovereignGlobe.tsx  # 3D global peering geo-visualization
    │   ├── SovereignLanding.tsx # Gateway auth intro shield
    │   ├── TransactionWorkspace.tsx # Multi-step compliance sequencer
    │   ├── TransactionsHistory.tsx # Monospaced Ledger verification log
    │   ├── TreasuryCommandCenter.tsx # Currency reserves allocator
    │   └── TrustVault.tsx      # Security certificate sealer interface
    ├── data/                   # Initial seeds, local JSON mocks, ledger profiles
    │   ├── README.md           # Data module guidelines
    │   ├── evidence_db.json    # Initial compliance evidence database
    │   ├── gatewayData.ts      # Node cluster geographic coordinates
    │   └── seed.ts             # Default GAAP Chart of Accounts values
    └── utils/                  # Core math, cryptography, and formatting utilities
        ├── README.md           # Utilities developer guidelines
        └── sha256.ts           # Pure-bitwise cryptographic digest implementation
```

---

## 🛠️ Major Subsystems & Modules
1. **Strategic Capital Routing Command Center**: Visualizes high-density spatial flows via an interactive 3D WebGL globe (`SovereignGlobe`) charting major clearing houses.
2. **Double-Entry GAAP Auditor**: Formulates absolute mathematical correctness checks preventing unbalanced ledger modifications.
3. **Quantum Entropy Oscilloscope**: Implements true-entropy simulators mapping visual waveform superposition collapses into digital keys.
4. **F0901 Ledger Compliance Hub**: Mimics corporate financial ERP controls containing subledger filters and automatic GAAP statement closing calculators.
5. **Consensus Merkle Chain**: Models micro-block sequencing, tracking parent-node validation keys and cryptographic hashes.

---

## 🚨 Known Limitations
* **Client-Authoritative State Sim**: For testing ease, general transaction operations modify in-memory React states. Persistent production environments will route these through Firestore / Cloud SQL.
* **REST & WS Endpoint Mocking**: Development environment relies on API routes in `server.ts` representing true server-side responses. These must be bound to real database adapters for deployment.

---

## 🗺️ Future Developmental Roadmap
1. **True TigerBeetle Cluster integration** for hardware-accelerated ledger processing.
2. **True OAuth SSO** linked with Active Directory and Sovereign PKI hardware keys.
3. **Automated SEC & FINRA filing triggers** generating signed PDF evidence packages directly.
