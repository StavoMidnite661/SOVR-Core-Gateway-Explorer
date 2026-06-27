export interface GatewayEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  requests: number;
  latencyMs: number;
  errorRate: number;
  auth: string;
  rateLimit: string;
  payloadSize: string;
  responseSize: string;
  workflows: string[];
}

export interface GatewayWebhook {
  id: string;
  direction: 'incoming' | 'outgoing';
  name: string;
  event: string;
  retryPolicy: string;
  dlq: number;
  deliveryTimeMs: number;
  headers: Record<string, string>;
  payloadTemplate: string;
}

export interface GatewaySecret {
  id: string;
  name: string;
  type: 'API Key' | 'OAuth' | 'Certificate' | 'Private Key' | 'Webhook Token';
  value: string;
  version: string;
  created: string;
  expires: string;
  rotationPolicy: string;
  lastUsed: string;
  accessLogs: string[];
}

export interface GatewayConnector {
  id: string;
  name: string;
  category: string;
  icon: string;
  tint: string;
  desc: string;
  version: string;
  publisher: string;
  installed: boolean;
}

export interface WorkflowPipeline {
  id: string;
  name: string;
  desc: string;
  steps: string[];
  active: boolean;
}

export const INITIAL_ENDPOINTS: GatewayEndpoint[] = [
  {
    id: 'ep_settlement',
    method: 'POST',
    path: '/api/v1/settlements',
    requests: 412410,
    latencyMs: 42,
    errorRate: 0.02,
    auth: 'OAuth2 Client Credentials',
    rateLimit: '250 req/sec',
    payloadSize: '12.4 KB',
    responseSize: '3.1 KB',
    workflows: ['Settlement Chain', 'Automated Rebalancing']
  },
  {
    id: 'ep_ledger',
    method: 'GET',
    path: '/api/v1/ledger',
    requests: 1204850,
    latencyMs: 12,
    errorRate: 0.005,
    auth: 'Mutual TLS Certificates',
    rateLimit: '1000 req/sec',
    payloadSize: '0.8 KB',
    responseSize: '24.5 KB',
    workflows: ['Settlement Chain', 'Evidence Certification']
  },
  {
    id: 'ep_evidence',
    method: 'POST',
    path: '/api/v1/evidence',
    requests: 98120,
    latencyMs: 145,
    errorRate: 0.05,
    auth: 'SOVR Proof Signature',
    rateLimit: '50 req/sec',
    payloadSize: '45.1 KB',
    responseSize: '1.2 KB',
    workflows: ['Evidence Certification']
  },
  {
    id: 'ep_receipts',
    method: 'POST',
    path: '/api/v1/receipts',
    requests: 304810,
    latencyMs: 85,
    errorRate: 0.01,
    auth: 'OAuth2 Client Credentials',
    rateLimit: '200 req/sec',
    payloadSize: '8.2 KB',
    responseSize: '12.0 KB',
    workflows: ['Settlement Chain']
  },
  {
    id: 'ep_accounts',
    method: 'GET',
    path: '/api/v1/accounts',
    requests: 948120,
    latencyMs: 15,
    errorRate: 0.01,
    auth: 'Mutual TLS Certificates',
    rateLimit: '500 req/sec',
    payloadSize: '0.2 KB',
    responseSize: '8.6 KB',
    workflows: ['Automated Rebalancing']
  },
  {
    id: 'ep_nodes',
    method: 'GET',
    path: '/api/v1/nodes',
    requests: 485120,
    latencyMs: 22,
    errorRate: 0.03,
    auth: 'None (Public Discovery)',
    rateLimit: '100 req/sec',
    payloadSize: '0.1 KB',
    responseSize: '18.2 KB',
    workflows: []
  },
  {
    id: 'ep_audit',
    method: 'GET',
    path: '/api/v1/audit',
    requests: 24510,
    latencyMs: 350,
    errorRate: 0.08,
    auth: 'SOVR Proof Signature',
    rateLimit: '10 req/sec',
    payloadSize: '5.2 KB',
    responseSize: '112.4 KB',
    workflows: ['Evidence Certification']
  },
  {
    id: 'ep_dispatch',
    method: 'POST',
    path: '/api/v1/dispatch',
    requests: 14205,
    latencyMs: 98,
    errorRate: 0.04,
    auth: 'OAuth2 Client Credentials',
    rateLimit: '30 req/sec',
    payloadSize: '15.6 KB',
    responseSize: '2.5 KB',
    workflows: ['Automated Rebalancing']
  }
];

export const INITIAL_WEBHOOKS: GatewayWebhook[] = [
  {
    id: 'wh_settle_comp',
    direction: 'incoming',
    name: 'Settlement Complete',
    event: 'settlement.completed',
    retryPolicy: 'Exponential Backoff (3x, Interval: 2s)',
    dlq: 0,
    deliveryTimeMs: 42,
    headers: { 'Content-Type': 'application/json', 'X-SOVR-Signature': 'sha256=...' },
    payloadTemplate: '{\n  "id": "${settlementId}",\n  "amount": ${amount},\n  "status": "success",\n  "timestamp": "${isoTimestamp}"\n}'
  },
  {
    id: 'wh_rcpt_gen',
    direction: 'incoming',
    name: 'Receipt Generated',
    event: 'receipt.generated',
    retryPolicy: 'Fixed Retry (5x, Interval: 5s)',
    dlq: 0,
    deliveryTimeMs: 55,
    headers: { 'Content-Type': 'application/json' },
    payloadTemplate: '{\n  "receiptNo": "${receiptNo}",\n  "url": "https://vault.sovr/receipts/${receiptNo}",\n  "sealed": true\n}'
  },
  {
    id: 'wh_ev_creat',
    direction: 'incoming',
    name: 'Evidence Created',
    event: 'evidence.created',
    retryPolicy: 'Exponential Backoff (3x)',
    dlq: 0,
    deliveryTimeMs: 140,
    headers: { 'Content-Type': 'application/json', 'X-Witness-Token': '...' },
    payloadTemplate: '{\n  "evidenceId": "${evidenceId}",\n  "hash": "${merkleRoot}",\n  "signatures": ["ed25519:..."]\n}'
  },
  {
    id: 'wh_node_on',
    direction: 'incoming',
    name: 'Node Online',
    event: 'node.online',
    retryPolicy: 'No Retry',
    dlq: 0,
    deliveryTimeMs: 18,
    headers: { 'Content-Type': 'application/json' },
    payloadTemplate: '{\n  "nodeId": "${nodeId}",\n  "state": "active",\n  "heartbeatMs": 142\n}'
  },
  {
    id: 'wh_vendor',
    direction: 'outgoing',
    name: 'Vendor Settlement Push',
    event: 'vendor.disbursed',
    retryPolicy: 'Exponential Backoff (5x)',
    dlq: 1,
    deliveryTimeMs: 240,
    headers: { 'Authorization': 'Bearer ${secret}', 'Accept': 'application/json' },
    payloadTemplate: '{\n  "merchant_id": "mrc_9421",\n  "payout_amount": ${amount},\n  "currency": "${denom}",\n  "completed_at": "${isoTimestamp}"\n}'
  },
  {
    id: 'wh_treasury',
    direction: 'outgoing',
    name: 'Treasury Sync Notification',
    event: 'treasury.rebalanced',
    retryPolicy: 'Exponential Backoff (3x)',
    dlq: 0,
    deliveryTimeMs: 95,
    headers: { 'Content-Type': 'application/json' },
    payloadTemplate: '{\n  "action": "reserve_allocation",\n  "amount_allocated": ${amount},\n  "allocated_to": "${targetAccount}"\n}'
  }
];

export const INITIAL_SECRETS: GatewaySecret[] = [
  {
    id: 'sec_oauth',
    name: 'OAuth2 Client Credentials Client Secret',
    type: 'OAuth',
    value: 'sec_client_sovr_0a9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p',
    version: 'v3 (Active)',
    created: '2026-01-15',
    expires: '2027-01-15',
    rotationPolicy: '90-Day Auto rotation',
    lastUsed: '0 sec ago',
    accessLogs: [
      '00:21:42 - Read by Settlement Controller',
      '00:15:10 - Read by Evidence Seal Manager',
      'Yesterday - Rotated by admin stavogm@gmail.com'
    ]
  },
  {
    id: 'sec_stripe',
    name: 'Stripe Gateway Live secret',
    type: 'API Key',
    value: 'sk_live_stripe_51NvS82hKjUf74o1m8a2q3r4s5t6u7v8w9x',
    version: 'v1 (Active)',
    created: '2026-03-10',
    expires: 'Never',
    rotationPolicy: 'Manual only',
    lastUsed: '4 mins ago',
    accessLogs: [
      '00:24:02 - Read by Stripe Edge Router',
      '00:21:05 - Read by Stripe Edge Router',
      '00:18:15 - Read by Stripe Edge Router'
    ]
  },
  {
    id: 'sec_wh_token',
    name: 'Outgoing Webhook Signing Key',
    type: 'Webhook Token',
    value: 'whsec_sovr_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    version: 'v2 (Active)',
    created: '2026-04-20',
    expires: '2027-04-20',
    rotationPolicy: '180-Day rotation',
    lastUsed: '12 mins ago',
    accessLogs: [
      '00:15:30 - Accessed by Webhook Delivery worker',
      '00:03:12 - Accessed by Webhook Delivery worker'
    ]
  },
  {
    id: 'sec_ed25519',
    name: 'Validator Node Private Seal Key',
    type: 'Private Key',
    value: 'ed25519_prv_1f2e3d4c5b6a79887766554433221100f1e2d3c4b5a6',
    version: 'v4 (Active)',
    created: '2026-02-01',
    expires: '2027-02-01',
    rotationPolicy: 'Yearly consensus roll',
    lastUsed: '12 sec ago',
    accessLogs: [
      '00:28:01 - Core witness consensus block signed',
      '00:27:01 - Core witness consensus block signed',
      '00:26:01 - Core witness consensus block signed'
    ]
  },
  {
    id: 'sec_ssl',
    name: 'Sydney Node mTLS CA Certificate',
    type: 'Certificate',
    value: '-----BEGIN CERTIFICATE-----\nMIIFdzCCBF+gAwIBAgIUeGFicmljLWNvcmU...-----END CERTIFICATE-----',
    version: 'v1 (Active)',
    created: '2025-12-01',
    expires: '2028-12-01',
    rotationPolicy: '3-Year Roll',
    lastUsed: '1 min ago',
    accessLogs: [
      '00:27:12 - Client connection TLS handshake Sydney Node',
      '00:19:40 - Client connection TLS handshake Sydney Node'
    ]
  }
];

export const INITIAL_CONNECTORS: GatewayConnector[] = [
  { id: 'conn_stripe', name: 'Stripe Gateway', category: 'Payment Gateway', icon: 'CreditCard', tint: '#635bff', desc: 'Secure retail credit card payments and high-volume merchant capture bindings.', version: 'v3.1.2', publisher: 'Stripe Inc.', installed: true },
  { id: 'conn_fednow', name: 'FRB FedNow Bridge', category: 'Settlement Rail', icon: 'Layers', tint: '#003087', desc: 'Real-time gross settlement interface with the Federal Reserve instant payment rail.', version: 'v2.4.0', publisher: 'Federal Reserve Bank', installed: true },
  { id: 'conn_polygon', name: 'Polygon Ledger Witness', category: 'Blockchain Oracle', icon: 'Link', tint: '#8247e5', desc: 'Write legally defensible witness hash certs to Polygon blockchain state.', version: 'v1.12.1', publisher: 'Polygon Foundation', installed: true },
  { id: 'conn_openai', name: 'OpenAI Intelligence Feed', category: 'AI Gateway', icon: 'Cpu', tint: '#10a37f', desc: 'Auto-audits transaction descriptions and routes suspicious activity warnings to compliance.', version: 'v4.0.1', publisher: 'OpenAI L.P.', installed: false },
  { id: 'conn_twilio', name: 'Twilio SMS Gateway', category: 'Communications', icon: 'Radio', tint: '#f22f46', desc: 'Dispatches instant multi-factor transaction verification alerts to operators.', version: 'v5.2.0', publisher: 'Twilio Inc.', installed: false },
  { id: 'conn_sap', name: 'SAP Enterprise ERP Hub', category: 'Accounting ERP', icon: 'Database', tint: '#008fd3', desc: 'Synchronizes ledger accounting entries to central corporate business planning ledgers.', version: 'v12.2.4', publisher: 'SAP AG', installed: false },
  { id: 'conn_square', name: 'Square Cash Inbound', category: 'Payment Gateway', icon: 'CreditCard', tint: '#000000', desc: 'Incorporate merchant checkout cash accounts into the unified float register.', version: 'v2.1.0', publisher: 'Block Inc.', installed: false },
  { id: 'conn_ach', name: 'Federal Reserve ACH Rail', category: 'Settlement Rail', icon: 'Layers', tint: '#2b6cb0', desc: 'Automated Clearing House batch settlement interface for standard treasury cycles.', version: 'v1.4.1', publisher: 'Nacha Official', installed: false },
  { id: 'conn_wise', name: 'Wise Multi-currency', category: 'Payment Gateway', icon: 'Globe', tint: '#00e676', desc: 'Dispatches international wholesale cross-border wires directly.', version: 'v3.0.1', publisher: 'Wise Plc', installed: false },
  { id: 'conn_plaid', name: 'Plaid Bank Connector', category: 'Identity Provider', icon: 'ShieldAlert', tint: '#0a0a0a', desc: 'Fetches secure balances and statements from over 11,000 retail banking systems.', version: 'v4.5.2', publisher: 'Plaid Inc.', installed: false },
  { id: 'conn_coinbase', name: 'Coinbase Custody Bridge', category: 'Blockchain Oracle', icon: 'Link', tint: '#0052ff', desc: 'Settles digital asset collateral ledger transactions using secure Coinbase Prime vault keys.', version: 'v2.0.4', publisher: 'Coinbase Global', installed: false },
  { id: 'conn_ethereum', name: 'Ethereum Core Replicator', category: 'Blockchain Oracle', icon: 'Link', tint: '#3c3c3d', desc: 'Direct JSON-RPC interface with L1 mainnet nodes to clear major tokens.', version: 'v1.15.0', publisher: 'Ethereum Foundation', installed: false },
  { id: 'conn_awss3', name: 'AWS S3 Cold Archive', category: 'Storage Archiver', icon: 'Database', tint: '#ff9900', desc: 'Automatically backups legally sealed evidence zip bundles onto AWS S3 glacier pools.', version: 'v1.0.1', publisher: 'Amazon Web Services', installed: false },
  { id: 'conn_cloudflare', name: 'Cloudflare R2 Object Store', category: 'Storage Archiver', icon: 'Database', tint: '#f38020', desc: 'High-availability low-egress object storage backup mirror for immediate compliance access.', version: 'v2.0.0', publisher: 'Cloudflare Inc.', installed: false },
  { id: 'conn_sendgrid', name: 'SendGrid Email Witness', category: 'Communications', icon: 'Radio', tint: '#1a82e2', desc: 'Dispatches secure legal evidence zip receipts to registered client destinations.', version: 'v3.5.0', publisher: 'Twilio SendGrid', installed: false },
  { id: 'conn_quickbooks', name: 'Intuit QuickBooks Online', category: 'Accounting ERP', icon: 'Database', tint: '#2ca01c', desc: 'Synchronizes invoices and capital account ledgers directly into QuickBooks books.', version: 'v4.1.0', publisher: 'Intuit Inc.', installed: false },
  { id: 'conn_salesforce', name: 'Salesforce Treasury CRM', category: 'Enterprise CRM', icon: 'Database', tint: '#00a1e0', desc: 'Update merchant profile settlement states based on CRM status levels.', version: 'v9.4.0', publisher: 'Salesforce.com', installed: false },
  { id: 'conn_hubspot', name: 'HubSpot Inbound Capture', category: 'Enterprise CRM', icon: 'Database', tint: '#ff7a59', desc: 'Tracks sales capture settlements and updates marketing lead pipeline statuses.', version: 'v2.1.2', publisher: 'HubSpot Inc.', installed: false }
];

export const INITIAL_WORKFLOWS: WorkflowPipeline[] = [
  { id: 'wf_settle', name: 'Settlement Chain', desc: 'Core pipeline executing merchant settlements and archiving receipt evidence.', steps: ['Treasury', 'Settlement', 'Stripe', 'SMTP', 'Customer'], active: true },
  { id: 'wf_evidence', name: 'Evidence Certification', desc: 'Pipeline hashing ledger transactions, sealing proofs, and anchoring block hashes on Polygon.', steps: ['Treasury', 'Evidence', 'Polygon', 'Storage', 'Archive'], active: true },
  { id: 'wf_rebalance', name: 'Automated Rebalancing', desc: 'Treasury monitoring loop allocating liquid asset margins dynamically across clearing nodes.', steps: ['Treasury', 'AI', 'OpenAI', 'Identity', 'Storage'], active: false }
];
