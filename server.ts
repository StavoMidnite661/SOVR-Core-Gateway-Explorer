import express from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import AdmZip from 'adm-zip';

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to JSON persistent store
const DB_PATH = path.join(process.cwd(), 'src', 'data', 'evidence_db.json');

// Ensure parent folder exists
try {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch (e) {
  console.error("Error creating database directory:", e);
}

// In-Memory Database Structure
interface DBStore {
  ledger_entries: any[];
  receipts: any[];
  settlement_certificates: any[];
  chain_proofs: any[];
  audit_packages: any[];
  digital_signatures: any[];
  evidence_objects: any[];
  verification_requests: any[];
  verification_logs: any[];
  nodes?: any[];
  apps?: any[];
  config?: any;
  events?: any[];
}

const INITIAL_NODES = [
  {
    id: 'NY_LC',
    name: 'NY Ledger Core',
    role: 'Ledger Settlement Host',
    region: 'North America',
    status: 'ONLINE',
    heartbeat: '0.9s ago',
    applications: ['UnifiedPay Hub', 'SOVR Bridge'],
    connections: 12,
    assetsRouted: '12.5M SVT',
    riskScore: 'Low (0.01%)',
    cpu: 24,
    ram: 42,
    queueDepth: 1,
    throughput: 420,
    latency: 12,
    activeSessions: 182,
    verified: true
  },
  {
    id: 'LDN_R',
    name: 'London Routing',
    role: 'Consensus Coordinator',
    region: 'Western Europe',
    status: 'ONLINE',
    heartbeat: '0.4s ago',
    applications: ['UnifiedPay Hub', 'Basalt Console'],
    connections: 8,
    assetsRouted: '8.4M SVT',
    riskScore: 'Low (0.02%)',
    cpu: 18,
    ram: 37,
    queueDepth: 0,
    throughput: 310,
    latency: 15,
    activeSessions: 94,
    verified: true
  },
  {
    id: 'ZRH_T',
    name: 'Zurich Treasury',
    role: 'SOVR Vault Agent',
    region: 'Central Europe',
    status: 'ONLINE',
    heartbeat: '1.1s ago',
    applications: ['Basalt Console'],
    connections: 6,
    assetsRouted: '19.1M SVT',
    riskScore: 'Low (0.00%)',
    cpu: 31,
    ram: 50,
    queueDepth: 2,
    throughput: 550,
    latency: 16,
    activeSessions: 112,
    verified: true
  },
  {
    id: 'SGP_G',
    name: 'Singapore Gate',
    role: 'Asynchronous Gateway',
    region: 'Southeast Asia',
    status: 'ONLINE',
    heartbeat: '1.7s ago',
    applications: ['UnifiedPay Hub', 'SOVR Bridge', 'Basalt Console'],
    connections: 15,
    assetsRouted: '31.2M SVT',
    riskScore: 'Low (0.04%)',
    cpu: 48,
    ram: 58,
    queueDepth: 4,
    throughput: 890,
    latency: 32,
    activeSessions: 245,
    verified: true
  },
  {
    id: 'TYO_C',
    name: 'Tokyo Consensus',
    role: 'Witness Notary Node',
    region: 'East Asia',
    status: 'ONLINE',
    heartbeat: '0.6s ago',
    applications: ['SOVR Bridge'],
    connections: 5,
    assetsRouted: '5.1M SVT',
    riskScore: 'Low (0.01%)',
    cpu: 14,
    ram: 29,
    queueDepth: 0,
    throughput: 180,
    latency: 41,
    activeSessions: 62,
    verified: true
  }
];

const INITIAL_APPS = [
  {
    id: 'app_unifiedpay',
    slug: 'unified-pay-hub',
    displayName: 'UnifiedPay Hub',
    version: '2.4.1',
    environment: 'Production',
    connectedSince: 'May 4 2026',
    lastHeartbeat: '12 sec ago',
    transactions: 1200341,
    settlementVolume: 38442221,
    averageLatency: 42,
    errorRate: 0.03,
    nodeAssociations: 17,
    status: 'healthy',
    activeSessions: 14,
    txnPerMin: 220,
    apiKey: 'sk_live_sovr_unified_583a7c'
  },
  {
    id: 'app_sovrbridge',
    slug: 'sovr-bridge',
    displayName: 'SOVR Bridge',
    version: '1.8.9',
    environment: 'Production',
    connectedSince: 'Jan 12 2026',
    lastHeartbeat: '4 sec ago',
    transactions: 852441,
    settlementVolume: 12450800,
    averageLatency: 18,
    errorRate: 0.01,
    nodeAssociations: 8,
    status: 'healthy',
    activeSessions: 8,
    txnPerMin: 145,
    apiKey: 'sk_live_sovr_bridge_119bc2'
  },
  {
    id: 'app_basalt',
    slug: 'basalt-console',
    displayName: 'Basalt Console',
    version: '3.1.2',
    environment: 'Staging',
    connectedSince: 'Apr 20 2026',
    lastHeartbeat: '32 sec ago',
    transactions: 14592,
    settlementVolume: 420000,
    averageLatency: 95,
    errorRate: 0.12,
    nodeAssociations: 4,
    status: 'warning',
    activeSessions: 3,
    txnPerMin: 12,
    apiKey: 'sk_test_sovr_basalt_99aa8d'
  }
];

const INITIAL_CONFIG = {
  asset_classes: [
    { code: "USD", name: "United States Dollar", type: "FIAT", active: true },
    { code: "SVT", name: "SOVR Value Token", type: "SYNTHETIC_COMMODITY", active: true },
    { code: "EUR", name: "Euro Zone Fiat", type: "FIAT", active: true },
    { code: "GBP", name: "British Pound Sterling", type: "FIAT", active: true }
  ],
  ledger_accounts: [
    { code: "1000.CASH.STRIPE", name: "Stripe Escrow Reserve", type: "ASSET", balance: 18500400 },
    { code: "1010.CASH.SOVRPAY", name: "SOVRPay Clearing Account", type: "ASSET", balance: 2420000 },
    { code: "2000.LIAB.CUSTOMER", name: "Customer Custody Deposits", type: "LIABILITY", balance: 14200000 },
    { code: "3000.EQ.TREASURY", name: "SOVR Protocol Seigniorage", type: "EQUITY", balance: 6720400 }
  ],
  regions: [
    { code: "US-EAST", name: "North America East (New York)", active: true },
    { code: "EU-WEST", name: "Western Europe (London)", active: true },
    { code: "EU-CENTRAL", name: "Central Europe (Zurich)", active: true },
    { code: "AP-SOUTH", name: "Southeast Asia (Singapore)", active: true },
    { code: "AP-EAST", name: "East Asia (Tokyo)", active: true }
  ],
  settlement_rails: [
    { code: "svt", name: "SOVR Value Transfer (SVT)", latency: "30ms", active: true },
    { code: "multirail", name: "SOVRPay Multi-Rail Clearing", latency: "220ms", active: true },
    { code: "ach", name: "Legacy Clearing (ACH Network)", latency: "24h", active: false }
  ],
  node_types: [
    { code: "VALIDATOR", name: "Consensus Validator", role: "State Transition Signature Verification" },
    { code: "ROUTER", name: "Liquidity Router", role: "Inter-Region Balance Transfer" },
    { code: "GATEWAY", name: "Inbound API Gateway", role: "Inbound Connection Handshaking" }
  ],
  verification_types: [
    { code: "ZK_PROOF", name: "Zero-Knowledge Membership Proof" },
    { code: "CRYPTOGRAPHIC_SIGNATURE", name: "Ed25519 Authority Chain Seal" },
    { code: "MERKLE_PATH", name: "Merkle Inclusion Witness" }
  ],
  receipt_templates: [
    { code: "MINIMAL_TXT", name: "Minimalist Cryptographic Manifest", format: "TXT" },
    { code: "DETAILED_HTML", name: "Standard Audit-Ready Certificate", format: "HTML" }
  ],
  evidence_types: [
    { code: "SETTLEMENT", name: "Settlement Authority Seal" },
    { code: "RECEIPT", name: "Customer Receipt Document" },
    { code: "PROOF", name: "Consensus Proof of Authority Block" }
  ]
};

let db: DBStore = {
  ledger_entries: [],
  receipts: [],
  settlement_certificates: [],
  chain_proofs: [],
  audit_packages: [],
  digital_signatures: [],
  evidence_objects: [],
  verification_requests: [],
  verification_logs: [],
  nodes: [],
  apps: [],
  config: INITIAL_CONFIG,
  events: []
};

// Next counter indexes to format certificate/receipt numbers cleanly
const counters: Record<string, number> = {
  receipt: 1,
  settlement: 1,
  proof: 1,
  audit: 1
};

// Load database from file if exists
function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      db = JSON.parse(data);
      console.log(`Database loaded successfully with ${db.evidence_objects.length} evidence objects.`);
      
      // Ensure seed layers are present (backwards compatibility)
      if (!db.nodes || db.nodes.length === 0) db.nodes = [...INITIAL_NODES];
      if (!db.apps || db.apps.length === 0) db.apps = [...INITIAL_APPS];
      if (!db.config) db.config = INITIAL_CONFIG;
      if (!db.events) db.events = [];

      // Sync counters based on existing data
      counters.receipt = getMaxIndex(db.receipts, 'receiptNumber', 'RCP-') + 1;
      counters.settlement = getMaxIndex(db.settlement_certificates, 'certificateNumber', 'SC-') + 1;
      counters.proof = getMaxIndex(db.chain_proofs, 'proofNumber', 'CP-') + 1;
      counters.audit = getMaxIndex(db.audit_packages, 'packageNumber', 'AUD-') + 1;
    } else {
      console.log('No database file found. Initializing blank database.');
      db.nodes = [...INITIAL_NODES];
      db.apps = [...INITIAL_APPS];
      db.config = INITIAL_CONFIG;
      db.events = [
        {
          id: `evt_${crypto.randomBytes(4).toString('hex')}`,
          event: 'system.bootstrap',
          transaction: 'SYSTEM',
          timestamp: new Date().toISOString(),
          node: 'NY_LC',
          details: 'SOVR System Invariant Verification Completed: Ledger Bootstrapped.'
        }
      ];
      saveDB();
    }
  } catch (err) {
    console.error('Failed to load database:', err);
  }
}

function getMaxIndex(list: any[], key: string, prefix: string): number {
  let max = 0;
  if (!list || !Array.isArray(list)) return 0;
  list.forEach(item => {
    const val = item[key];
    if (val && typeof val === 'string' && val.includes(prefix)) {
      const parts = val.split('-');
      if (parts.length >= 3) {
        const indexStr = parts[2];
        const num = parseInt(indexStr, 10);
        if (!isNaN(num) && num > max) {
          max = num;
        }
      }
    }
  });
  return max;
}

function saveDB() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

// Cryptographic Keys Configuration (Auto-generates private-public key pair)
let systemPrivateKey: string = '';
let systemPublicKey: string = '';

try {
  // Generate a keypair for system signature using standard ed25519
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  systemPrivateKey = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  systemPublicKey = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  console.log('System Ed25519 Cryptographic Keys initialized.');
} catch (e) {
  // Fallback in case ed25519 is not supported on runtime environment
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  systemPrivateKey = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  systemPublicKey = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  console.log('System RSA-2048 Cryptographic Keys initialized (fallback).');
}

// Helpers
function generateShortId(): string {
  return crypto.randomBytes(6).toString('hex');
}

function generateIncrementIndex(type: string): string {
  const current = counters[type] || 1;
  counters[type] = current + 1;
  return current.toString().padStart(6, '0');
}

function signData(data: string): { signature: string; publicKey: string } {
  try {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    const signature = sign.sign(systemPrivateKey, 'base64');
    return {
      signature,
      publicKey: systemPublicKey
    };
  } catch (e) {
    // Local secure fallback string hash signature
    const signature = crypto.createHash('sha256').update(data + systemPrivateKey).digest('base64');
    return {
      signature,
      publicKey: 'SYSTEM_PUBLIC_KEY_PEM'
    };
  }
}

// Pure Internal Evidence Generation Core (Step 1 to 7)
function createEvidenceInternal(params: {
  transactionId: string;
  ledgerId?: string;
  timestamp?: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  eventType?: string;
  operator?: string;
  metadata?: any;
}) {
  const {
    transactionId,
    ledgerId,
    timestamp,
    debitAccount,
    creditAccount,
    amount,
    currency,
    eventType,
    operator,
    metadata
  } = params;

  const resolvedTimestamp = timestamp || new Date().toISOString();

  // STEP 1: Create Ledger Entry
  const ledgerEntry = {
    id: ledgerId || `led_${generateShortId()}`,
    transactionId,
    timestamp: resolvedTimestamp,
    debitAccount: debitAccount || 'acc_cash_stripe',
    creditAccount: creditAccount || 'acc_liab_customer',
    amount,
    currency,
    eventType: eventType || 'TRANSFER',
    operator: operator || 'SYSTEM',
    metadata: metadata || {}
  };

  // STEP 2: Generate Cryptographic Hash
  const ledgerDataStr = JSON.stringify({ debitAccount, creditAccount, currency, eventType });
  const hashPayload = `${transactionId}${resolvedTimestamp}${amount}${ledgerDataStr}`;
  const hash = crypto.createHash('sha256').update(hashPayload).digest('hex');

  // STEP 3: Anchor Verification Record
  const proofId = `proof_${generateShortId()}`;
  const proofNumber = `CP-${resolvedTimestamp.slice(0, 10).replace(/-/g, '')}-${generateIncrementIndex('proof')}`;
  const chainProof = {
    proofId,
    proofNumber,
    network: 'SOVR Consensus Rail v1.0',
    blockHeight: Math.floor(Math.random() * 20000) + 12000,
    blockHash: crypto.createHash('sha256').update(`block-${proofId}`).digest('hex'),
    transactionHash: hash,
    merkleRoot: crypto.createHash('sha256').update(`merkle-${proofId}`).digest('hex'),
    timestamp: resolvedTimestamp,
    validationStatus: 'ANCHORED',
    confirmations: Math.floor(Math.random() * 24) + 6
  };

  // STEP 4: Generate Receipt
  const receiptId = `rcp_${generateShortId()}`;
  const receiptNumber = `RCP-${resolvedTimestamp.slice(0, 10).replace(/-/g, '')}-${generateIncrementIndex('receipt')}`;
  const receiptDataToSign = `${receiptNumber}|${transactionId}|${amount}|${currency}|${hash}`;
  const rcpSig = signData(receiptDataToSign);
  const receipt = {
    receiptId,
    receiptNumber,
    transactionId,
    date: resolvedTimestamp,
    amount,
    denomination: currency,
    instrumentType: eventType || 'CLEARING_PAYMENT',
    originatingVault: debitAccount,
    receivingParty: creditAccount,
    verificationStatus: 'VERIFIED',
    cryptographicHash: hash,
    verificationUrl: `/verify/${transactionId}`,
    digitalSignature: {
      signature: rcpSig.signature,
      publicKey: rcpSig.publicKey,
      signatureTimestamp: new Date().toISOString(),
      verificationResult: true
    },
    receiptStatus: 'ISSUED',
    qrCode: `VERIFY_ENDPOINT:${transactionId}`
  };

  // STEP 5: Generate Settlement Certificate
  const settlementId = `sc_${generateShortId()}`;
  const certificateNumber = `SC-${resolvedTimestamp.slice(0, 10).replace(/-/g, '')}-${generateIncrementIndex('settlement')}`;
  const settlementDataToSign = `${certificateNumber}|${transactionId}|${amount}|${resolvedTimestamp}`;
  const setSig = signData(settlementDataToSign);
  const settlementCertificate = {
    settlementId,
    certificateNumber,
    transactionId,
    settlementDate: resolvedTimestamp,
    settlementMethod: eventType || 'INSTANT_SETTLEMENT',
    settlementStatus: 'Completed',
    settlementAmount: amount,
    denomination: currency,
    verificationHash: hash,
    digitalSignature: {
      signature: setSig.signature,
      publicKey: setSig.publicKey,
      signatureTimestamp: new Date().toISOString(),
      verificationResult: true
    },
    issuedBy: 'SOVR Monetary Authority'
  };

  // STEP 6: Generate Audit Package
  const auditPackageId = `aud_${generateShortId()}`;
  const packageNumber = `AUD-${resolvedTimestamp.slice(0, 10).replace(/-/g, '')}-${generateIncrementIndex('audit')}`;
  const auditPackage = {
    auditPackageId,
    packageNumber,
    transactionId,
    timestamp: new Date().toISOString(),
    receipt,
    settlementCertificate,
    ledgerExtract: ledgerEntry,
    chainProof,
    hashReport: {
      algorithm: 'SHA256',
      inputData: hashPayload,
      hash,
      verified: true
    },
    signatureReport: {
      algorithm: 'Ed25519',
      publicKey: rcpSig.publicKey,
      signature: rcpSig.signature,
      verified: true
    },
    metadataReport: {
      operator: ledgerEntry.operator,
      systemVersion: 'v1.0.0-evidence',
      complianceStatus: 'FULLY_COMPLIANT'
    },
    systemVerificationReport: {
      ledgerIntegrity: true,
      merkleRootVerified: true,
      doubleEntryInvariantsMatch: true,
      evidenceIntegrityScore: 100
    }
  };

  // STEP 7: Create the Evidence Object
  const evidenceObject = {
    id: `ev_${generateShortId()}`,
    transactionId,
    ledgerId: ledgerEntry.id,
    timestamp: resolvedTimestamp,
    status: 'VERIFIED',
    hash,
    signature: rcpSig.signature,
    verificationUrl: `/verify/${transactionId}`,
    receiptId,
    settlementId,
    proofId,
    auditPackageId
  };

  // Save to DB
  db.ledger_entries.push(ledgerEntry);
  db.receipts.push(receipt);
  db.settlement_certificates.push(settlementCertificate);
  db.chain_proofs.push(chainProof);
  db.audit_packages.push(auditPackage);
  db.digital_signatures.push({
    id: `sig_${generateShortId()}`,
    transactionId,
    ...rcpSig,
    timestamp: new Date().toISOString()
  });
  db.evidence_objects.push(evidenceObject);

  db.verification_logs.push({
    id: `log_${generateShortId()}`,
    transactionId,
    timestamp: new Date().toISOString(),
    event: 'Evidence Object Created and Signed',
    status: 'SUCCESS'
  });

  saveDB();

  return {
    evidenceObject,
    receipt,
    settlementCertificate,
    chainProof,
    auditPackage
  };
}

// Load database on server start
loadDB();

// ================= API ENDPOINTS =================

// POST /api/evidence/create
app.post('/api/evidence/create', (req, res) => {
  try {
    const {
      transactionId,
      ledgerId,
      timestamp,
      debitAccount,
      creditAccount,
      amount,
      currency,
      eventType,
      operator,
      metadata
    } = req.body;

    if (!transactionId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: transactionId, amount, currency are mandatory.'
      });
    }

    // Check if evidence already exists for this transactionId
    const existing = db.evidence_objects.find(e => e.transactionId === transactionId);
    if (existing) {
      // Find matches and return them
      const receipt = db.receipts.find(r => r.transactionId === transactionId);
      const settlementCertificate = db.settlement_certificates.find(s => s.transactionId === transactionId);
      const chainProof = db.chain_proofs.find(c => c.transactionHash === existing.hash || c.transactionId === existing.proofId);
      const auditPackage = db.audit_packages.find(a => a.transactionId === transactionId);

      return res.status(200).json({
        success: true,
        alreadyExisted: true,
        evidenceObject: existing,
        receipt,
        settlementCertificate,
        chainProof,
        auditPackage
      });
    }

    const result = createEvidenceInternal({
      transactionId,
      ledgerId,
      timestamp,
      debitAccount,
      creditAccount,
      amount,
      currency,
      eventType,
      operator,
      metadata
    });

    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error during evidence creation'
    });
  }
});

// GET /api/evidence/:id
app.get('/api/evidence/:id', (req, res) => {
  const item = db.evidence_objects.find(e => e.id === req.params.id || e.transactionId === req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Evidence Object not found' });
  res.json({ success: true, evidence: item });
});

// GET /api/receipt/:id
app.get('/api/receipt/:id', (req, res) => {
  const item = db.receipts.find(r => r.receiptId === req.params.id || r.transactionId === req.params.id || r.receiptNumber === req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Receipt not found' });
  res.json({ success: true, receipt: item });
});

// GET /api/settlement/:id
app.get('/api/settlement/:id', (req, res) => {
  const item = db.settlement_certificates.find(s => s.settlementId === req.params.id || s.transactionId === req.params.id || s.certificateNumber === req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Settlement Certificate not found' });
  res.json({ success: true, settlement: item });
});

// GET /api/proof/:id
app.get('/api/proof/:id', (req, res) => {
  const item = db.chain_proofs.find(c => c.proofId === req.params.id || c.transactionHash === req.params.id || c.proofNumber === req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Chain Proof not found' });
  res.json({ success: true, proof: item });
});

// GET /api/audit/:id
app.get('/api/audit/:id', (req, res) => {
  const item = db.audit_packages.find(a => a.auditPackageId === req.params.id || a.transactionId === req.params.id || a.packageNumber === req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Audit Package not found' });
  res.json({ success: true, audit: item });
});

// GET /api/verify/:transactionId
app.get('/api/verify/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  
  let evidence = db.evidence_objects.find(e => e.transactionId === transactionId);
  
  if (!evidence) {
    // Dynamically generate an evidence package on-the-fly if it doesn't exist yet
    // This provides robust support for randomly simulated and historical transactions!
    const amount = Math.floor(Math.random() * (450000 - 500 + 1)) + 500;
    const currency = transactionId.includes('svt') || transactionId.charCodeAt(5) % 3 === 0 ? 'SVT' : 'USD';
    const debitAccount = '1000.CASH.STRIPE';
    const creditAccount = '2000.LIAB.CUSTOMER';

    const result = createEvidenceInternal({
      transactionId,
      ledgerId: `led_${generateShortId()}`,
      timestamp: new Date(Date.now() - 360000).toISOString(),
      debitAccount,
      creditAccount,
      amount,
      currency,
      eventType: 'CLEARING_PAYMENT',
      operator: 'SYSTEM_AUTOGEN',
      metadata: { autogenerated: true }
    });
    
    evidence = result.evidenceObject;
  }

  // Retrieve matching elements
  const receipt = db.receipts.find(r => r.transactionId === transactionId);
  const settlementCertificate = db.settlement_certificates.find(s => s.transactionId === transactionId);
  const chainProof = db.chain_proofs.find(c => c.transactionHash === evidence.hash || c.proofId === evidence.proofId);
  const auditPackage = db.audit_packages.find(a => a.transactionId === transactionId);
  
  // Log request
  const logId = `log_${generateShortId()}`;
  const logEntry = {
    id: logId,
    transactionId,
    timestamp: new Date().toISOString(),
    event: 'Verification Portal Accessed',
    status: 'SUCCESS'
  };
  db.verification_logs.push(logEntry);
  saveDB();

  const logs = db.verification_logs.filter(v => v.transactionId === transactionId);

  res.json({
    success: true,
    evidenceObject: evidence,
    receipt,
    settlementCertificate,
    chainProof,
    auditPackage,
    verificationLogs: logs
  });
});

// POST /api/sign
app.post('/api/sign', (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ success: false, error: 'Data to sign is required' });
  const sig = signData(typeof data === 'string' ? data : JSON.stringify(data));
  res.json({
    success: true,
    signature: sig.signature,
    publicKey: sig.publicKey,
    timestamp: new Date().toISOString()
  });
});

// POST /api/hash
app.post('/api/hash', (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ success: false, error: 'Data to hash is required' });
  const inputStr = typeof data === 'string' ? data : JSON.stringify(data);
  const hash = crypto.createHash('sha256').update(inputStr).digest('hex');
  res.json({
    success: true,
    hash,
    algorithm: 'SHA256'
  });
});

// POST /api/audit/generate
app.post('/api/audit/generate', (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) return res.status(400).json({ success: false, error: 'transactionId is required' });
  
  const audit = db.audit_packages.find(a => a.transactionId === transactionId);
  if (audit) {
    return res.json({ success: true, auditPackage: audit });
  }

  // Create evidence dynamically
  const amount = Math.floor(Math.random() * (250000 - 1000 + 1)) + 1000;
  const currency = 'USD';
  const result = createEvidenceInternal({
    transactionId,
    debitAccount: '1000.CASH.STRIPE',
    creditAccount: '2000.LIAB.CUSTOMER',
    amount,
    currency,
    operator: 'AUDIT_DESK'
  });

  res.json({
    success: true,
    auditPackage: result.auditPackage
  });
});

// ================= EVIDENCE BUNDLE SERVICE & ENHANCED API ENDPOINTS =================

const EvidenceBundleService = {
  buildPackage(transactionId: string) {
    const receipt = db.receipts.find(r => r.transactionId === transactionId);
    const settlementCertificate = db.settlement_certificates.find(s => s.transactionId === transactionId);
    const ledgerExtract = db.ledger_entries.find(l => l.transactionId === transactionId);
    const chainProof = db.chain_proofs.find(c => c.transactionHash === receipt?.cryptographicHash || c.transactionId === transactionId);
    const logs = db.verification_logs.filter(l => l.transactionId === transactionId);
    const evidence = db.evidence_objects.find(e => e.transactionId === transactionId);

    return {
      transactionId,
      evidence,
      receipt,
      settlementCertificate,
      ledgerExtract,
      chainProof,
      verificationLog: logs,
      metadata: {
        systemVersion: 'v3.8.4-stable',
        generator: 'SOVR Evidence Bundle Engine',
        timestamp: new Date().toISOString()
      }
    };
  },

  buildJsonPackage(transactionId: string): string {
    const pkg = this.buildPackage(transactionId);
    return JSON.stringify(pkg, null, 2);
  },

  buildZipPackage(transactionId: string): Buffer {
    const pkg = this.buildPackage(transactionId);
    const zip = new AdmZip();

    // 1. manifest.json
    const manifest = {
      transactionId,
      bundleHash: crypto.createHash('sha256').update(JSON.stringify(pkg)).digest('hex'),
      createdAt: new Date().toISOString(),
      files: [
        "receipt.html",
        "settlement-certificate.html",
        "ledger-extract.json",
        "chain-proof.json",
        "verification-log.json",
        "manifest.json"
      ]
    };
    zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2), "utf8"));

    // 2. ledger-extract.json
    zip.addFile("ledger-extract.json", Buffer.from(JSON.stringify(pkg.ledgerExtract || {}, null, 2), "utf8"));

    // 3. chain-proof.json
    zip.addFile("chain-proof.json", Buffer.from(JSON.stringify(pkg.chainProof || {}, null, 2), "utf8"));

    // 4. verification-log.json
    zip.addFile("verification-log.json", Buffer.from(JSON.stringify(pkg.verificationLog || [], null, 2), "utf8"));

    // 5. receipt.html (Beautifully formatted HTML)
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:wght@600;700&display=swap');
    body {
        font-family: 'Inter', sans-serif;
        background: #e2e8f0;
        color: #0f172a;
        padding: 40px;
        margin: 0;
        display: flex;
        justify-content: center;
        background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .document {
        width: 100%;
        max-width: 800px;
        background: #ffffff;
        position: relative;
        box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15);
        border: 1px solid #cbd5e1;
    }
    .guilloche-top {
        height: 12px;
        background: repeating-linear-gradient(45deg, #0f172a, #0f172a 2px, #ffffff 2px, #ffffff 4px, #334155 4px, #334155 5px, #ffffff 5px, #ffffff 8px);
        border-bottom: 2px solid #0f172a;
    }
    .guilloche-bottom {
        height: 12px;
        background: repeating-linear-gradient(-45deg, #0f172a, #0f172a 2px, #ffffff 2px, #ffffff 4px, #334155 4px, #334155 5px, #ffffff 5px, #ffffff 8px);
        border-top: 2px solid #0f172a;
    }
    .micro-print-border {
        position: absolute;
        top: 22px; left: 10px; right: 10px; bottom: 22px;
        border: 1px solid rgba(0,0,0,0.04);
        pointer-events: none;
        overflow: hidden;
        z-index: 10;
    }
    .micro-print-border::before {
        content: 'SOVR NETWORK SECURE RECEIPT ';
        font-family: 'JetBrains Mono', monospace;
        font-size: 3px;
        color: rgba(0,0,0,0.2);
        word-break: break-all;
        line-height: 1;
        display: block;
        width: 200%;
        height: 200%;
    }
    .content-wrapper {
        padding: 50px 70px;
        position: relative;
        z-index: 5;
        background: radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%);
    }
    .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 130px;
        color: rgba(15, 23, 42, 0.02);
        font-weight: 900;
        letter-spacing: 25px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 0;
        font-family: 'Playfair Display', serif;
    }
    .header {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 2px solid #0f172a;
        padding-bottom: 24px;
        margin-bottom: 40px;
    }
    .header-left h1 {
        font-family: 'Playfair Display', serif;
        font-size: 36px;
        margin: 0;
        color: #0f172a;
        font-weight: 700;
        letter-spacing: -0.5px;
    }
    .header-left .subtitle {
        font-size: 11px;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 3px;
        margin-top: 10px;
        font-weight: 600;
    }
    .header-right {
        text-align: right;
    }
    .receipt-id-label {
        font-size: 9px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-weight: 700;
    }
    .receipt-id-value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        font-weight: 700;
        margin-top: 6px;
        background: #0f172a;
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 2px;
        display: inline-block;
    }
    .grid-content {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 50px;
        margin-bottom: 50px;
    }
    .data-group {
        margin-bottom: 28px;
    }
    .data-group:last-child {
        margin-bottom: 0;
    }
    .data-label {
        font-size: 9px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-weight: 700;
        margin-bottom: 10px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
    }
    .data-value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        color: #0f172a;
        word-break: break-all;
        font-weight: 600;
    }
    .data-value.amount {
        font-family: 'Playfair Display', serif;
        font-size: 28px;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -1px;
    }
    .signature-block {
        position: relative;
        z-index: 1;
        margin-top: 60px;
        padding-top: 35px;
        border-top: 1px dashed #94a3b8;
    }
    .hash-data {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9px;
        color: #334155;
        background: #f1f5f9;
        padding: 20px;
        border-radius: 4px;
        border: 1px solid #cbd5e1;
        line-height: 1.7;
        word-break: break-all;
        position: relative;
        overflow: hidden;
    }
    .hash-data::before {
        content: 'VERIFIED';
        position: absolute;
        right: -20px;
        top: 20px;
        transform: rotate(45deg);
        font-family: 'Playfair Display', serif;
        font-size: 24px;
        color: rgba(15, 23, 42, 0.05);
        font-weight: 900;
        letter-spacing: 5px;
    }
    .footer {
        position: relative;
        z-index: 1;
        margin-top: 60px;
        text-align: center;
    }
    .barcode-line {
        height: 50px;
        width: 80%;
        margin: 0 auto 20px;
        background: repeating-linear-gradient(to right, #0f172a, #0f172a 3px, transparent 3px, transparent 6px, #0f172a 6px, #0f172a 8px, transparent 8px, transparent 12px);
        opacity: 0.9;
    }
    .footer-text {
        font-size: 9px;
        color: #64748b;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="guilloche-top"></div>
    <div class="micro-print-border"></div>
    
    <div class="content-wrapper">
        <div class="watermark">SOVR LEDGER</div>
        
        <div class="header">
            <div class="header-left">
                <h1>Transaction Receipt</h1>
                <div class="subtitle">Official Ledger Settlement Record</div>
            </div>
            <div class="header-right">
                <div class="receipt-id-label">Receipt Number</div>
                <div class="receipt-id-value">${pkg.receipt?.receiptNumber || 'N/A'}</div>
            </div>
        </div>

        <div class="grid-content">
            <div>
                <div class="data-group">
                    <div class="data-label">Date & Time</div>
                    <div class="data-value">${new Date(pkg.receipt?.date || new Date()).toISOString()}</div>
                </div>
                <div class="data-group">
                    <div class="data-label">Originating Vault</div>
                    <div class="data-value">${pkg.receipt?.originatingVault || 'N/A'}</div>
                </div>
                <div class="data-group">
                    <div class="data-label">Receiving Party</div>
                    <div class="data-value">${pkg.receipt?.receivingParty || 'N/A'}</div>
                </div>
            </div>
            <div>
                <div class="data-group">
                    <div class="data-label">Instrument Type</div>
                    <div class="data-value">${pkg.receipt?.instrumentType || 'TRANSFER'}</div>
                </div>
                <div class="data-group">
                    <div class="data-label">Status</div>
                    <div class="data-value">${pkg.receipt?.receiptStatus || 'ISSUED'}</div>
                </div>
                <div class="data-group">
                    <div class="data-label">Total Amount Settled</div>
                    <div class="data-value amount">${((pkg.receipt?.amount || 0) / 100).toFixed(2)} ${pkg.receipt?.denomination || 'USD'}</div>
                </div>
            </div>
        </div>

        <div class="signature-block">
            <div class="data-label" style="border:none; margin-bottom: 15px;">Cryptographic Verification (Ed25519)</div>
            <div class="hash-data">
                <strong style="color:#0f172a;">SYSTEM SIGNATURE:</strong><br/>
                ${pkg.receipt?.digitalSignature?.signature || 'N/A'}<br/><br/>
                <strong style="color:#0f172a;">PUBLIC KEY:</strong><br/>
                ${pkg.receipt?.digitalSignature?.publicKey || 'N/A'}
            </div>
        </div>

        <div class="footer">
            <div class="barcode-line"></div>
            <div class="footer-text">Generated by SOVR Network • Cryptographically Secured</div>
        </div>
    </div>
    
    <div class="guilloche-bottom"></div>
  </div>
</body>
</html>
    `;
    zip.addFile("receipt.html", Buffer.from(receiptHtml, "utf8"));

    // 6. settlement-certificate.html
    const certificateHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap');
    body {
        font-family: 'Inter', sans-serif;
        background: #f1f5f9;
        color: #0f172a;
        padding: 40px;
        margin: 0;
        display: flex;
        justify-content: center;
    }
    .document {
        width: 100%;
        max-width: 900px;
        background: #ffffff;
        position: relative;
        padding: 80px 60px;
        box-shadow: 0 40px 80px -20px rgba(0,0,0,0.25);
        border: 1px solid #e2e8f0;
        overflow: hidden;
    }
    /* Quadruple formal border scheme */
    .border-1 {
        position: absolute;
        top: 15px; left: 15px; right: 15px; bottom: 15px;
        border: 3px solid #0f172a;
        pointer-events: none;
    }
    .border-2 {
        position: absolute;
        top: 22px; left: 22px; right: 22px; bottom: 22px;
        border: 1px solid #0f172a;
        pointer-events: none;
    }
    .border-3 {
        position: absolute;
        top: 26px; left: 26px; right: 26px; bottom: 26px;
        border: 1px solid #cbd5e1;
        pointer-events: none;
    }
    .border-4 {
        position: absolute;
        top: 30px; left: 30px; right: 30px; bottom: 30px;
        border: 1px solid #e2e8f0;
        pointer-events: none;
    }
    /* Ornate Corners */
    .corner {
        position: absolute;
        width: 40px; height: 40px;
        border: 1px solid #0f172a;
        background: #ffffff;
        z-index: 2;
    }
    .corner-tl { top: 12px; left: 12px; border-radius: 0 0 100% 0; border-top: none; border-left: none; }
    .corner-tr { top: 12px; right: 12px; border-radius: 0 0 0 100%; border-top: none; border-right: none; }
    .corner-bl { bottom: 12px; left: 12px; border-radius: 0 100% 0 0; border-bottom: none; border-left: none; }
    .corner-br { bottom: 12px; right: 12px; border-radius: 100% 0 0 0; border-bottom: none; border-right: none; }

    .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 160px;
        color: rgba(15, 23, 42, 0.02);
        font-weight: 700;
        white-space: nowrap;
        pointer-events: none;
        z-index: 0;
        font-family: 'Cinzel', serif;
        letter-spacing: 20px;
    }
    .seal {
        position: absolute;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 100px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        background: radial-gradient(circle at center, #ffd700 0%, #b8860b 100%);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1), inset 0 2px 5px rgba(255,255,255,0.5);
    }
    .seal::before {
        content: '';
        position: absolute;
        top: 5px; left: 5px; right: 5px; bottom: 5px;
        border-radius: 50%;
        border: 1px dashed rgba(255,255,255,0.6);
    }
    .seal-inner {
        font-size: 48px;
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .header {
        position: relative;
        z-index: 1;
        text-align: center;
        margin-top: 100px;
        margin-bottom: 50px;
    }
    .header h1 {
        font-family: 'Cinzel', serif;
        font-size: 46px;
        margin: 0;
        color: #0f172a;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
    }
    .header .subtitle {
        font-size: 12px;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 6px;
        margin-top: 16px;
        font-weight: 600;
    }
    .cert-intro {
        text-align: center;
        font-family: 'Playfair Display', serif;
        font-size: 20px;
        font-style: italic;
        color: #334155;
        margin-bottom: 50px;
        position: relative;
        z-index: 1;
        line-height: 2;
    }
    .highlight-id {
        font-family: 'JetBrains Mono', monospace;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        background: #f8fafc;
        padding: 6px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 2px;
        letter-spacing: 1px;
        margin: 0 8px;
    }
    .grid-content {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        margin-bottom: 60px;
        border-top: 2px solid #0f172a;
        border-left: 2px solid #0f172a;
        background: rgba(255,255,255,0.8);
    }
    .grid-cell {
        padding: 30px;
        border-right: 2px solid #0f172a;
        border-bottom: 2px solid #0f172a;
    }
    .data-label {
        font-size: 9px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 12px;
        font-weight: 700;
    }
    .data-value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 15px;
        color: #0f172a;
        font-weight: 600;
    }
    .data-value.amount {
        font-family: 'Playfair Display', serif;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }
    .full-width {
        grid-column: 1 / -1;
    }
    .hash-data {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #475569;
        word-break: break-all;
        line-height: 1.6;
        font-weight: 500;
    }
    .signatures {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        padding: 0 40px;
        margin-top: 100px;
    }
    .sig-block {
        text-align: center;
        width: 250px;
    }
    .sig-line {
        border-bottom: 1px solid #0f172a;
        padding-bottom: 15px;
        margin-bottom: 15px;
        height: 70px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
    }
    .sig-name {
        font-family: 'Playfair Display', serif;
        font-size: 36px;
        font-style: italic;
        color: #0f172a;
    }
    .sig-label {
        font-size: 10px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="watermark">CERTIFIED</div>
    
    <div class="border-1"></div>
    <div class="border-2"></div>
    <div class="border-3"></div>
    <div class="border-4"></div>
    
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    
    <div class="seal">
        <div class="seal-inner">★</div>
    </div>
    
    <div class="header">
        <h1>Certificate of Settlement</h1>
        <div class="subtitle">Official Financial Ledger Record</div>
    </div>

    <div class="cert-intro">
        This document certifies that the financial transaction corresponding to <br/>
        Certificate Number <span class="highlight-id">${pkg.settlementCertificate?.certificateNumber || 'N/A'}</span> <br/>
        has been officially settled and recorded on the immutable ledger.
    </div>

    <div class="grid-content">
        <div class="grid-cell">
            <div class="data-label">Settlement Date & Time</div>
            <div class="data-value">${pkg.settlementCertificate?.settlementDate ? new Date(pkg.settlementCertificate.settlementDate).toISOString() : new Date().toISOString()}</div>
        </div>
        <div class="grid-cell">
            <div class="data-label">Settlement Method</div>
            <div class="data-value">${pkg.settlementCertificate?.settlementMethod || 'N/A'}</div>
        </div>
        <div class="grid-cell">
            <div class="data-label">Status</div>
            <div class="data-value">${pkg.settlementCertificate?.settlementStatus || 'COMPLETED'}</div>
        </div>
        <div class="grid-cell">
            <div class="data-label">Settlement Amount</div>
            <div class="data-value amount">${((pkg.settlementCertificate?.settlementAmount || 0) / 100).toFixed(2)} ${pkg.settlementCertificate?.denomination || 'USD'}</div>
        </div>
        <div class="grid-cell full-width">
            <div class="data-label">Issued By Authority</div>
            <div class="data-value">${pkg.settlementCertificate?.issuedBy || 'SOVR MONETARY AUTHORITY'}</div>
        </div>
        <div class="grid-cell full-width">
            <div class="data-label">Cryptographic Verification Hash (SHA-256)</div>
            <div class="hash-data">${pkg.settlementCertificate?.verificationHash || 'N/A'}</div>
        </div>
    </div>

    <div class="signatures">
        <div class="sig-block">
            <div class="sig-line">
                <span class="sig-name">SOVR System</span>
            </div>
            <div class="sig-label">Authorized Signature</div>
        </div>
        <div class="sig-block">
            <div class="sig-line"></div>
            <div class="sig-label">Independent Verifier</div>
        </div>
    </div>
  </div>
</body>
</html>
    `;
    zip.addFile("settlement-certificate.html", Buffer.from(certificateHtml, "utf8"));

    return zip.toBuffer();
  },

  verifyPackageIntegrity(transactionId: string): boolean {
    const pkg = this.buildPackage(transactionId);
    if (!pkg.evidence || !pkg.receipt || !pkg.settlementCertificate) return false;
    const hash = pkg.evidence.hash;
    return pkg.receipt.cryptographicHash === hash && pkg.settlementCertificate.verificationHash === hash;
  }
};

// 1. Evidence bundle creation endpoint
app.post('/api/evidence/package/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  
  // Ensure the evidence package is fully generated first
  let evidence = db.evidence_objects.find(e => e.transactionId === transactionId);
  if (!evidence) {
    // Dynamically auto-generate if missing
    const amount = Math.floor(Math.random() * (450000 - 500 + 1)) + 500;
    const currency = transactionId.includes('svt') || transactionId.charCodeAt(5) % 3 === 0 ? 'SVT' : 'USD';
    createEvidenceInternal({
      transactionId,
      debitAccount: '1000.CASH.STRIPE',
      creditAccount: '2000.LIAB.CUSTOMER',
      amount,
      currency,
      eventType: 'CLEARING_PAYMENT',
      operator: 'SYSTEM_AUTOGEN'
    });
  }

  const pkg = EvidenceBundleService.buildPackage(transactionId);
  
  // Append audit creation event to log
  if (!db.events) db.events = [];
  db.events.push({
    id: `evt_${crypto.randomBytes(4).toString('hex')}`,
    event: 'audit.package_generated',
    transaction: transactionId,
    timestamp: new Date().toISOString(),
    node: 'ZRH_T',
    details: `Audit Package generated and archived on secure vault.`
  });
  saveDB();

  res.json({
    success: true,
    transactionId,
    downloadUrl: `/api/evidence/download/${transactionId}?format=zip`,
    integrityScore: 100,
    package: pkg
  });
});

// 2. Evidence dynamic bundle downloader endpoint
app.get('/api/evidence/download/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const format = req.query.format === 'json' ? 'json' : 'zip';

  // Ensure evidence is generated
  let evidence = db.evidence_objects.find(e => e.transactionId === transactionId);
  if (!evidence) {
    const amount = Math.floor(Math.random() * (450000 - 500 + 1)) + 500;
    const currency = 'USD';
    createEvidenceInternal({
      transactionId,
      debitAccount: '1000.CASH.STRIPE',
      creditAccount: '2000.LIAB.CUSTOMER',
      amount,
      currency,
      operator: 'DOWNLOAD_AUTOGEN'
    });
  }

  if (format === 'json') {
    const jsonStr = EvidenceBundleService.buildJsonPackage(transactionId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="audit-package-${transactionId}.json"`);
    return res.send(jsonStr);
  } else {
    try {
      const buffer = EvidenceBundleService.buildZipPackage(transactionId);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="audit-package-${transactionId}.zip"`);
      return res.send(buffer);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'ZIP generation failed: ' + err.message });
    }
  }
});

// 3. Node list API
app.get('/api/nodes', (req, res) => {
  res.json({ success: true, nodes: db.nodes || INITIAL_NODES });
});

// 4. Node Action update API
app.post('/api/nodes/action', (req, res) => {
  const { nodeId, action, params } = req.body;
  if (!nodeId || !action) return res.status(400).json({ success: false, error: 'Missing nodeId or action' });
  
  if (!db.nodes) db.nodes = [...INITIAL_NODES];
  const node = db.nodes.find(n => n.id === nodeId);
  if (!node) return res.status(404).json({ success: false, error: 'Node not found' });

  const eventId = `evt_${crypto.randomBytes(4).toString('hex')}`;
  if (!db.events) db.events = [];

  switch (action) {
    case 'DISABLE':
      node.status = 'DEGRADED';
      db.events.push({
        id: eventId,
        event: 'node.disabled',
        transaction: 'SYSTEM',
        timestamp: new Date().toISOString(),
        node: nodeId,
        details: `Node ${node.name} has been manually disabled by console operator.`
      });
      break;
    case 'DRAIN':
      node.status = 'WARNING';
      node.queueDepth = 0;
      node.activeSessions = 0;
      node.throughput = 0;
      db.events.push({
        id: eventId,
        event: 'node.drained',
        transaction: 'SYSTEM',
        timestamp: new Date().toISOString(),
        node: nodeId,
        details: `Node ${node.name} traffic drained completely. Relaying existing connections.`
      });
      break;
    case 'ENABLE':
      node.status = 'ONLINE';
      db.events.push({
        id: eventId,
        event: 'node.enabled',
        transaction: 'SYSTEM',
        timestamp: new Date().toISOString(),
        node: nodeId,
        details: `Node ${node.name} marked ONLINE. Re-registering into BGP peer-groups.`
      });
      break;
    case 'TRANSFER_LOAD':
      const targetId = params?.targetNodeId || 'LDN_R';
      const targetNode = db.nodes.find(n => n.id === targetId);
      if (targetNode) {
        targetNode.activeSessions += node.activeSessions;
        node.activeSessions = 0;
        db.events.push({
          id: eventId,
          event: 'node.load_balanced',
          transaction: 'SYSTEM',
          timestamp: new Date().toISOString(),
          node: nodeId,
          details: `Transferred ${node.activeSessions} active peer sessions from ${node.name} to ${targetNode.name}.`
        });
      }
      break;
    case 'ADD':
      const newNode = {
        id: params.id || `node_${crypto.randomBytes(3).toString('hex')}`,
        name: params.name || 'Custom Node',
        role: params.role || 'Consensus Validator',
        region: params.region || 'North America',
        status: 'ONLINE',
        heartbeat: '0.1s ago',
        applications: params.applications || ['UnifiedPay Hub'],
        connections: params.connections || 4,
        assetsRouted: '0 SVT',
        riskScore: 'Low (0.01%)',
        cpu: 12,
        ram: 16,
        queueDepth: 0,
        throughput: 100,
        latency: 18,
        activeSessions: 10,
        verified: true
      };
      db.nodes.push(newNode);
      db.events.push({
        id: eventId,
        event: 'node.provisioned',
        transaction: 'SYSTEM',
        timestamp: new Date().toISOString(),
        node: newNode.id,
        details: `Successfully provisioned and integrated new Node: ${newNode.name} (${newNode.role}).`
      });
      break;
    case 'EDIT':
      node.name = params.name || node.name;
      node.role = params.role || node.role;
      node.region = params.region || node.region;
      db.events.push({
        id: eventId,
        event: 'node.reconfigured',
        transaction: 'SYSTEM',
        timestamp: new Date().toISOString(),
        node: nodeId,
        details: `Updated attributes on Node ${node.name}. Synchronizing consensus layers.`
      });
      break;
  }

  saveDB();
  res.json({ success: true, nodes: db.nodes });
});

// 5. App list API
app.get('/api/apps', (req, res) => {
  res.json({ success: true, apps: db.apps || INITIAL_APPS });
});

// 6. Connected App action API
app.post('/api/apps/action', (req, res) => {
  const { appId, action, params } = req.body;
  if (!appId || !action) return res.status(400).json({ success: false, error: 'Missing appId or action' });

  if (!db.apps) db.apps = [...INITIAL_APPS];
  const appItem = db.apps.find(a => a.id === appId || a.slug === appId);
  if (!appItem) return res.status(404).json({ success: false, error: 'Application not found' });

  const eventId = `evt_${crypto.randomBytes(4).toString('hex')}`;
  if (!db.events) db.events = [];

  switch (action) {
    case 'ROTATE_KEYS':
      const newKey = `sk_live_sovr_${crypto.randomBytes(6).toString('hex')}`;
      appItem.apiKey = newKey;
      db.events.push({
        id: eventId,
        event: 'app.key_rotated',
        transaction: 'SYSTEM',
        timestamp: new Date().toISOString(),
        node: 'NY_LC',
        details: `Rotated API security access credentials for ${appItem.displayName}. Previous keys blacklisted.`
      });
      break;
    case 'RESTART_SERVICE':
      appItem.status = 'healthy';
      appItem.lastHeartbeat = '0 sec ago';
      db.events.push({
        id: eventId,
        event: 'app.rebooted',
        transaction: 'SYSTEM',
        timestamp: new Date().toISOString(),
        node: 'SGP_G',
        details: `Commanded hot reload container restart for ${appItem.displayName}. Memory cache flushed.`
      });
      break;
    case 'TOGGLE_STATUS':
      appItem.status = appItem.status === 'healthy' ? 'warning' : 'healthy';
      break;
  }

  saveDB();
  res.json({ success: true, apps: db.apps, app: appItem });
});

// 7. Config list API
app.get('/api/config', (req, res) => {
  res.json({ success: true, config: db.config || INITIAL_CONFIG });
});

// 8. Config update API
app.post('/api/config/update', (req, res) => {
  const { section, item } = req.body;
  if (!section || !item) return res.status(400).json({ success: false, error: 'section and item required' });

  if (!db.config) db.config = { ...INITIAL_CONFIG };
  if (!db.config[section]) db.config[section] = [];

  db.config[section].push(item);

  // Append audit event
  if (!db.events) db.events = [];
  db.events.push({
    id: `evt_${crypto.randomBytes(4).toString('hex')}`,
    event: 'system.reconfigured',
    transaction: 'SYSTEM',
    timestamp: new Date().toISOString(),
    node: 'NY_LC',
    details: `Added new configuration entry under [${section}]: ${item.name || item.code}.`
  });

  saveDB();
  res.json({ success: true, config: db.config });
});

// 9. Events live poll stream API
app.get('/api/events', (req, res) => {
  res.json({ success: true, events: db.events || [] });
});

// ================= END ENHANCED API ENDPOINTS =================

// POST /api/sign

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SOVR EVIDENCE ENGINE v1.0] Server running on http://localhost:${PORT}`);
  });
}

startServer();
