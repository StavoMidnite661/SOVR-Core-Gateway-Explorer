# SOVR Environment Configuration Manual

This document provides a single, canonical catalog of all required and optional environment variables needed to boot and operate the SOVR Financial Operating System.

---

## 🏛️ Environment Variables Manifest

Refer to the table below for configuration names, types, default values, and usage guidelines.

| Variable Name | Purpose | Required | Default Value | Usage Scope |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Environment identifier | Yes | `development` | Server/Build |
| `PORT` | Container binding port | Yes | `3000` | Server |
| `GEMINI_API_KEY` | Server-Side Google GenAI Key | Yes | *None* | Server (Lazy Load) |
| `DATABASE_URL` | Cloud SQL Connection String | Yes | *None* | Server |
| `REDIS_URL` | Asynchronous Event Queue URI | No | *None* | Server |
| `JWT_SECRET` | Admin Sign-in Keys Cipher | Yes | *None* | Server |
| `STRIPE_SECRET_KEY`| Clearance Webhook Security Key | No | *None* | Server (Lazy Load) |
| `S3_BUCKET_NAME` | Object Storage Bucket name | Yes | `sovr-compliance` | Server |

---

## 📂 Detailed Definitions & Security Policies

### 1. `NODE_ENV`
* **Purpose**: Declares the operational scope. Set to `production` in Cloud Run to enable static distribution compression and disable dev logs.
* **Security Policy**: Do not customize manually outside standard CI/CD configurations.

---

### 2. `PORT`
* **Purpose**: Binds the Express listener.
* **Security Policy**: **Hardcoded by infrastructure** to `3000`. Attempts to customize or override this inside configurations will cause internal container ingress crashes.

---

### 3. `GEMINI_API_KEY`
* **Purpose**: Grants the server secure access to Google's GenAI model suites to power intelligence queries.
* **Security Policy**: **CRITICAL SECRET**. Must never be prefixed with `VITE_` or referenced in client-side code blocks. Always loaded lazily in API routes.

---

### 4. `DATABASE_URL`
* **Purpose**: Fully-qualified connection string for the relational database (PostgreSQL).
* **Format**: `postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require`

---

## 🛠️ Quick Setup Template (`.env.example`)

To configure a new development sandbox, create a local `.env` file referencing the following keys:

```env
# Node execution flags
NODE_ENV=development
PORT=3000

# Cryptographic and API Secrets
GEMINI_API_KEY=your_google_gen_ai_key_here
DATABASE_URL=postgresql://sovr_db_user:password@localhost:5432/sovr_ledger
JWT_SECRET=generate_a_secure_long_entropy_string_here

# Third-Party Clearance Rails
STRIPE_SECRET_KEY=sk_test_example
S3_BUCKET_NAME=sovr-compliance-dev
```
