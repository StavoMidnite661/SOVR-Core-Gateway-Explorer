# Contributing to SOVR Core

Thank you for your interest in contributing to the SOVR Financial Operating System (FOS). As a highly regulated, GAAP-compliant ledger FOS, we maintain strict code quality standards to protect financial safety and cryptographic balance invariance.

---

## 🏛️ Code Architecture Guidelines

### 1. Maintain Algebraic Double-Entry Invariance
Any contribution that adds, modifies, or interfaces with transaction-post logic **must** respect the double-entry identity:
$$\sum \text{Debits} - \sum \text{Credits} = 0$$
Never permit unbalanced journals.

### 2. Standardized Type Imports
* Always place imports at the top level of the module.
* Use named imports; do not destruct imported modules.
* Use standard TS `enum` declarations; never use `const enum`.

### 3. Server-Client Separation
* Never expose API keys, credentials, or private connection URIs to browser-facing components.
* Route third-party or sensitive operations through secure backend proxies in `server.ts`.

---

## 📂 Git Branching & Pull Requests

1. **Branch Naming**: Standardize branches based on task type:
   * `feature/` - new architectural components
   * `bugfix/` - issue resolution
   * `security/` - critical security patches
2. **Commit Style**: Use Conventional Commits format:
   * `feat: add trial balance exporter`
   * `fix: correct decimal rounding tolerance`
3. **Pull Request Validation**: All PRs must pass:
   * `npm run lint` with zero compiler errors.
   * `npm run build` producing optimized production bundles.
   * Review approval from at least one Principal Software Architect.
