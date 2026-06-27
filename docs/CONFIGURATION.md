# SOVR System Configuration Manifest

This document outlines settings templates, validation models, and compliance policies governing the SOVR Financial Operating System.

---

## 🏛️ Policy & Template Structures

All platform parameters are defined in structured JSON schema configs, allowing rapid changes without deploying new code.

---

## 📂 Configuration Parameters

### 1. Settlement Rails Configuration
* **Config Identifier**: `settlement_rails_config`
* **Schema**:
  ```json
  {
    "active_rails": ["Stripe", "Plaid", "PolygonOracle", "UnifiedPay"],
    "automatic_settlement_limits": {
      "SVT_holding_cap": 50000000,
      "max_single_transaction_usd": 10000000,
      "enforce_kyc_limit_usd": 100000
    },
    "routing_weights": {
      "NewYorkCore": 0.40,
      "LondonRouting": 0.25,
      "ZurichTreasury": 0.25,
      "SingaporeGate": 0.10
    }
  }
  ```

---

### 2. Double-Entry Audit Policy
* **Config Identifier**: `double_entry_audit_policy`
* **Schema**:
  ```json
  {
    "strict_balance_mode": true,
    "allow_unposted_adjustments": false,
    "rounding_tolerance_minor": 0,
    "ampersand_resolver_rules": {
      "subledger_routing_fallback": "F0101",
      "escalate_unresolved_accounts": "P0911_EXCEPTIONS"
    }
  }
  ```

---

### 3. Compliance Evidence Profiles
* **Config Identifier**: `evidence_profile_templates`
* **Schema**:
  ```json
  {
    "report_types": [
      {
        "id": "SEC-17a-4",
        "description": "SEC Monospaced Ledger Record",
        "retention_years": 7,
        "format": "TXT"
      },
      {
        "id": "GAAP-TRIAL-BALANCE",
        "description": "Monthly Trial Balance Summary",
        "retention_years": 10,
        "format": "CSV"
      }
    ]
  }
  ```

---

### 4. Active Node Clusters & Peering Keys
* **Config Identifier**: `node_clusters_registry`
* **Schema**:
  ```json
  {
    "nodes": [
      { "id": "NODE_01", "region": "North-American", "weight": 10 },
      { "id": "NODE_02", "region": "European", "weight": 10 },
      { "id": "NODE_03", "region": "Asia-Pacific", "weight": 5 }
    ]
  }
  ```
