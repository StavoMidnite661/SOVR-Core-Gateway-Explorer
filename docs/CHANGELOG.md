# SOVR Changelog & Release History

This document lists release notes, bug fixes, and feature additions for the SOVR Financial Operating System, structured according to SemVer standards.

---

## [3.8.2-GA] - 2026-06-26
*Enterprise Operator Consolidated Release*

### Added
* **High-Fidelity Mission Control View**: Introduced the new `MissionControlView` as the principal landing view, adding live pipeline workflow trackers, animated node paths, and a real-time UTC clock.
* **F0901 Mainframe Compliance Hub**: Expanded GAAP-compliant ledger verification tools, statutory closing compilers, and TRIAL-BALANCE sequence audits.
* **Operations Print Desk Overlay**: Custom CSS printing media templates enabling direct physical text rendering, with utilities to copy and download logs.
* **Automatic Recovery Narratives**: System logger dynamically prints heartbeat drop alerts and automatically posts resolved logs.

### Fixed
* **Linter Invariance Errors**: Repaired TS2362 type casting errors inside `MissionControlView` formatting routines.
* **Viewport scaling issues** when running on mobile handheld screens.

---

## [3.5.0] - 2026-03-12
*Cryptographic Core Update*

### Added
* **Double-Entry Balance Constraint**: Validates algebraic invariants before permitting journal additions.
* **Quantum Entropy Key Oscillator**: Interactive 2D wave canvas simulating high-entropy key creations.
* **SHA-256 Bitwise proof sealer** implementation for block validation.

---

## [1.0.0] - 2025-09-01
*Initial Core Gateway Release*

### Added
* **3D Sovereign Globe**: Global clearing house spatial tracker using Three.js.
* **Base GAAP Account list** and seed transaction pool generator.
* **JSON REST api interfaces** for network node telemetry monitoring.
