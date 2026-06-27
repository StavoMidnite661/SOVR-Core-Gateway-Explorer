# SOVR Core Gateway API Manifest

This document provides the complete API inventory for the SOVR Financial Operating System, documenting every REST API route, request/response schema, and development status.

---

## 🏛️ Gateway API Overview

All API routes are hosted under the prefix `/api/v1` in production. For local development and testing, standard API mock handlers are hosted directly within `server.ts`.

---

## 🛰️ REST Endpoints Inventory

### 1. System Health
* **Route**: `GET /api/health`
* **Purpose**: Retrieves node latency, system compliance indexes, and overall cluster health.
* **Authentication**: None
* **Response Payload** (`200 OK`):
  ```json
  {
    "status": "healthy",
    "version": "3.8.2-GA",
    "uptime": 384829,
    "p99LatencyMs": 14,
    "integrityCheck": "PASS"
  }
  ```
* **Status**: **Implemented**

---

### 2. Live Events Stream
* **Route**: `GET /api/events`
* **Purpose**: Fetches real-time event logs, system warnings, and ledger audit actions.
* **Authentication**: Read-Only API Key or Bearer Token
* **Response Payload** (`200 OK`):
  ```json
  {
    "success": true,
    "events": [
      {
        "id": "evt_01J1X2",
        "timestamp": "2026-06-26T19:24:50Z",
        "event": "ledger.posted",
        "params": {
          "memo": "Symmetrical double-entry audit passed for TX-982343"
        }
      }
    ]
  }
  ```
* **Status**: **Implemented** (Simulated fallback in `server.ts`)

---

### 3. Ledger Transactions Ingestion
* **Route**: `POST /api/v1/transactions`
* **Purpose**: Ingests new financial journal entries and runs algebraic double-entry validation tests.
* **Authentication**: Bearer Authorization Token (Operator Access)
* **Request Payload**:
  ```json
  {
    "id": "TX-100293",
    "debits": [
      { "account": "10.1110.01", "amountMinor": 5000000 }
    ],
    "credits": [
      { "account": "30.1200.02", "amountMinor": 5000000 }
    ],
    "denomination": "USD",
    "memo": "Treasury balance allocation transfer"
  }
  ```
* **Response Payload** (`201 Created`):
  ```json
  {
    "success": true,
    "txId": "TX-100293",
    "hash": "8c3e2195f220...a583e",
    "status": "NOMINAL_PASS"
  }
  ```
* **Error Response** (`400 Bad Request`):
  ```json
  {
    "success": false,
    "error": "INVARIANCE_CHECK_FAILED",
    "message": "Debits sum must exactly balance credit sum."
  }
  ```
* **Status**: **Partial** (Client-side validated, server mocks the endpoint)

---

### 4. Compliance Evidence Packaging
* **Route**: `POST /api/v1/compliance/export`
* **Purpose**: Compiles transaction detail receipts and cryptographic seals into standard zip files.
* **Authentication**: Bearer Authorization Token (Auditor Role)
* **Request Payload**:
  ```json
  {
    "transactionIds": ["TX-982341", "TX-982342"],
    "format": "zip"
  }
  ```
* **Response Payload** (`200 OK`):
  ```json
  {
    "success": true,
    "archiveUrl": "https://vault.sovr.local/exports/COMP-2026-06-26.zip",
    "archiveHash": "f4a0e104e1c4e12e75e11..."
  }
  ```
* **Status**: **Stub**

---

### 5. F0901 Account Master Setup
* **Route**: `POST /api/v1/accounts`
* **Purpose**: Creates new master accounts mapping to GAAP general ledgers.
* **Authentication**: Bearer Authorization Token (Admin Role)
* **Request Payload**:
  ```json
  {
    "accountCode": "BU.OBJ.SUB",
    "name": "Zurich Treasury Liquidity Vault",
    "type": "Asset"
  }
  ```
* **Response Payload** (`200 OK`):
  ```json
  {
    "success": true,
    "accountCode": "10.1100.11",
    "status": "ACTIVE"
  }
  ```
* **Status**: **Stub**
