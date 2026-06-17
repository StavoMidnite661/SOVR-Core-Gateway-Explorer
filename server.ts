import express from 'express';
import cors from 'cors';
import {
  LedgerAccount,
  ConnectedApp,
  HashBlock,
  Transaction,
  SystemHealth,
  Denomination,
  Rail,
  LedgerEntry,
  TxnState,
  GeoNode,
  Route
} from './src/types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_APPS,
  generateRandomTxn,
  generateUUIDShort
} from './src/data/seed';
import { sha256 } from './src/utils/sha256';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Authoritative Backend State ---
let accounts: LedgerAccount[] = [...INITIAL_ACCOUNTS];
let apps: ConnectedApp[] = [...INITIAL_APPS];

// Initialize Chain
let chain: HashBlock[] = [];
let prevBlockHash = "0".repeat(64);
for (let h = 0; h < 24; h++) {
  const merkle = sha256(`merkle-${h}-${generateUUIDShort()}`);
  const blockHash = sha256(`${h}-${prevBlockHash}-${merkle}`);
  chain.push({
    id: `blk_${h}`,
    height: h,
    hash: blockHash,
    prevHash: prevBlockHash,
    txnCount: Math.floor(Math.random() * (42 - 8 + 1)) + 8,
    merkleRoot: merkle,
    sealedAt: new Date(Date.now() - (24 - h) * 300 * 1000).toISOString(),
    verified: true
  });
  prevBlockHash = blockHash;
}
chain.reverse(); // newest first

// Initialize Transactions
let transactions: Transaction[] = [];
let prevTxHash = "0".repeat(64);
for (let t = 0; t < 14; t++) {
  const tx = generateRandomTxn(prevTxHash, INITIAL_ACCOUNTS);
  tx.createdAt = new Date(Date.now() - (14 - t) * 120 * 1000).toISOString();
  transactions.push(tx);
  prevTxHash = tx.hash;
}
transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// Volume Series
let volumeSeries = Array.from({ length: 150 }).map((_, idx) => ({
  tick: idx,
  settlementVelocity: Math.floor(Math.random() * (78 - 25 + 1)) + 25,
  treasuryFlow: Math.floor(Math.random() * (460000 - 130000 + 1)) + 130000,
  networkLoad: Math.floor(Math.random() * (85 - 35 + 1)) + 35,
  apiThroughput: Math.floor(Math.random() * (1350 - 450 + 1)) + 450
}));

// Notifications
let notifications = [
  { id: 1, type: 'API', message: 'Inbound TLS port connection handshaking initialized with SOVRPay Swedish ingress', time: '1 min ago', status: 'info' },
  { id: 2, type: 'TREASURY', message: 'Large collateral fund transfer of +120,000 SVT completed and matched algebraically', time: '4 mins ago', status: 'warning' },
  { id: 3, type: 'SYSTEM', message: 'Consensus quorum signed authority seal for ledger height #1428 matches Merkle root', time: '12 mins ago', status: 'success' },
  { id: 4, type: 'SECURITY', message: 'Scheduled algorithmic invariant check passed across all 6 validator instances', time: '35 mins ago', status: 'success' },
];

// System Health
let health: SystemHealth = {
  ledgerOk: true,
  chainVerified: true,
  pendingTxns: 2,
  p99LatencyMs: 18,
  nodesOnline: 6,
  nodesTotal: 6,
  lastSeal: new Date().toISOString()
};

// CommandCenter Specific States
let pulseCount = 0;
let pendingVerifications = 3;

let timelineEvents = [
  { id: 'ev_1', time: '02:44:11', msg: 'System blockchain seal blk_7420 finalized (100% approval rate)', type: 'CONSENSUS' },
  { id: 'ev_2', time: '02:44:05', msg: 'SGP_G requested asynchronous yield escrow adjustments [+$4,500,000 SVT]', type: 'TREASURY' },
  { id: 'ev_3', time: '02:43:52', msg: 'Stripe webhook Ingest: payload balance allocation for operating expenses', type: 'INGEST' },
  { id: 'ev_4', time: '02:43:40', msg: 'Node Frankfurt Reserve matched regulatory verification state parameters', type: 'COMMIT' },
  { id: 'ev_5', time: '02:43:12', msg: 'Slight congestion wave flagged from São Paulo Liquidity node (latency > 100ms)', type: 'ANOMALY' },
  { id: 'ev_6', time: '02:42:50', msg: 'Coinbase core vault bridge re-allocated holding reserves to Escrow accounts', type: 'TREASURY' },
  { id: 'ev_7', time: '02:42:15', msg: 'Authority validation chain synchronized globally', type: 'CONSENSUS' }
];

let ingestionItems = [
  { name: 'Stripe Pay', rate: 142, queue: 0, status: 'NOMINAL', lastSync: '100ms ago' },
  { name: 'Visa Direct', rate: 285, queue: 1, status: 'NOMINAL', lastSync: '220ms ago' },
  { name: 'Mastercard Gate', rate: 195, queue: 0, status: 'NOMINAL', lastSync: '500ms ago' },
  { name: 'FedNow Router', rate: 64, queue: 0, status: 'NOMINAL', lastSync: '120ms ago' },
  { name: 'ACH Terminal', rate: 12, queue: 0, status: 'NOMINAL', lastSync: '2.1s ago' },
  { name: 'Bank Wire Ingress', rate: 4, queue: 0, status: 'NOMINAL', lastSync: '4.5s ago' },
  { name: 'Coinbase Ledger', rate: 45, queue: 0, status: 'NOMINAL', lastSync: '240ms ago' },
  { name: 'Treasury Ops Feed', rate: 3, queue: 1, status: 'NOMINAL', lastSync: '500ms ago' },
  { name: 'Vendor Oracle Bridge', rate: 8, queue: 0, status: 'NOMINAL', lastSync: '1.2s ago' },
  { name: 'Audit Witness Node', rate: 1, queue: 0, status: 'NOMINAL', lastSync: '1s ago' }
];

let agents = [
  { name: 'Settlement Agent', status: 'ACTIVE', task: 'Polling client deposit nodes...', cpu: '1.2%', action: 'Verified invoice audit balance', score: '99.99%', logs: ['02:44:19 - Pushed lock state to NY Core', '02:44:02 - Loaded minor state balances'] },
  { name: 'Treasury Agent', status: 'ONLINE', task: 'Balancing multi-pool reserve weights...', cpu: '0.8%', action: 'Rebalanced Zurich escrow margin', score: '99.98%', logs: ['02:43:58 - Detected SVT transfer request', '02:43:10 - Released surplus pool reserve'] },
  { name: 'Risk Agent', status: 'ONLINE', task: 'Scanning for double-entry drift issues...', cpu: '2.5%', action: 'Calculated zero ledger variance', score: '100.0%', logs: ['02:44:11 - Completed general matrix check', '02:44:00 - Solved balance linear bounds'] },
  { name: 'Audit Agent', status: 'IDLE', task: 'Awaiting block Merkle leaf seal approval...', cpu: '0.1%', action: 'Verified blk_7420 digest signatures', score: '99.99%', logs: ['02:43:44 - Saved verified Block Merkle root', '02:43:12 - Handshake verified with Singapore'] },
  { name: 'Routing Agent', status: 'ACTIVE', task: 'Measuring continental round-trip p99 jitter...', cpu: '1.4%', action: 'Optimized Dublin-to-Singapore paths', score: '99.95%', logs: ['02:44:18 - Latency recalculation passed', '02:44:05 - Re-routed SP pool to NY server'] },
  { name: 'Witness Agent', status: 'ONLINE', task: 'Signing validated epoch hashes...', cpu: '0.7%', action: 'Generated cryptographic witness certification', score: '100.0%', logs: ['02:44:12 - Signed block verification pack #7420', '02:44:00 - Quorum validated 6/6 signers'] },
  { name: 'Oracle Agent', status: 'ACTIVE', task: 'Evaluating asset margin exchanges...', cpu: '1.1%', action: 'Fetched USD-to-SVT parity index from API', score: '99.97%', logs: ['02:44:15 - Updated external price parity delta', '02:43:50 - Read external vendor pool data'] },
  { name: 'Compliance Agent', status: 'ONLINE', task: 'Auditing dynamic KYC validation limits...', cpu: '0.4%', action: 'Completed continuous compliance verification', score: '99.99%', logs: ['02:44:10 - Checked high-volume limit triggers', '02:43:02 - Clean sweep of AML boundary logs'] }
];

let anomalies = [
  { id: 'an_1', text: 'São Paulo node latency spike (94ms / average 35ms)', severe: false, dismissed: false },
  { id: 'an_2', text: 'Drift correction threshold evaluation in-progress', severe: false, dismissed: false },
  { id: 'an_3', text: 'Automatic redundancy path fallback active between YTO and FRA', severe: false, dismissed: false }
];

let geoNodes: GeoNode[] = [
  { id: 'NY_LC', name: 'NY Ledger Core', role: 'Ledger Settlement Host', region: 'North America', lat: 40.7128, lon: -74.0060, status: 'ONLINE', latency: 12, cpu: 24, ram: 42, disk: 68, workers: 1522, txnsProcessed: 1824552, settlementValue: '$84.3M', lastSeal: 'blk_0', lastConsensus: '0.8 sec ago', softwareVersion: 'v5.9.2', trustScore: '99.998%', currentLoad: '42%' },
  { id: 'LDN_R', name: 'London Routing', role: 'Consensus Coordinator', region: 'Western Europe', lat: 51.5072, lon: -0.1276, status: 'ONLINE', latency: 15, cpu: 18, ram: 37, disk: 52, workers: 1140, txnsProcessed: 1420550, settlementValue: '$65.1M', lastSeal: 'blk_0', lastConsensus: '1.1 sec ago', softwareVersion: 'v5.9.2', trustScore: '100% NOM', currentLoad: '28%' },
  { id: 'ZRH_T', name: 'Zurich Treasury', role: 'SOVR Vault Agent', region: 'Central Europe', lat: 47.3769, lon: 8.5417, status: 'ONLINE', latency: 16, cpu: 31, ram: 50, disk: 61, workers: 920, txnsProcessed: 981440, settlementValue: '$112.4M', lastSeal: 'blk_0', lastConsensus: '0.9 sec ago', softwareVersion: 'v5.9.1', trustScore: '99.999%', currentLoad: '50%' },
  { id: 'SGP_G', name: 'Singapore Gate', role: 'Asynchronous Gateway', region: 'Southeast Asia', lat: 1.3521, lon: 103.8198, status: 'ONLINE', latency: 32, cpu: 48, ram: 58, disk: 74, workers: 2150, txnsProcessed: 2891460, settlementValue: '$144.8M', lastSeal: 'blk_0', lastConsensus: '1.4 sec ago', softwareVersion: 'v5.9.2', trustScore: '99.997%', currentLoad: '62%' },
  { id: 'TYO_C', name: 'Tokyo Consensus', role: 'Witness Notary Node', region: 'East Asia', lat: 35.6762, lon: 139.6503, status: 'ONLINE', latency: 41, cpu: 14, ram: 29, disk: 44, workers: 840, txnsProcessed: 1102900, settlementValue: '$48.2M', lastSeal: 'blk_0', lastConsensus: '1.2 sec ago', softwareVersion: 'v5.9.2', trustScore: '100.00%', currentLoad: '18%' },
  { id: 'DXB_T', name: 'Dubai Treasury', role: 'Liquidity Oracle Host', region: 'Middle East', lat: 25.2048, lon: 55.2708, status: 'ONLINE', latency: 22, cpu: 27, ram: 45, disk: 59, workers: 1180, txnsProcessed: 1530200, settlementValue: '$96.5M', lastSeal: 'blk_0', lastConsensus: '1.7 sec ago', softwareVersion: 'v5.9.0', trustScore: '99.995%', currentLoad: '34%' },
  { id: 'SYD_S', name: 'Sydney Settlement', role: 'Settlement Liquidator', region: 'Oceania', lat: -33.8688, lon: 151.2093, status: 'ONLINE', latency: 82, cpu: 19, ram: 36, disk: 48, workers: 610, txnsProcessed: 591320, settlementValue: '$21.9M', lastSeal: 'blk_0', lastConsensus: '2.1 sec ago', softwareVersion: 'v5.9.1', trustScore: '100% NOM', currentLoad: '21%' },
  { id: 'SAO_L', name: 'São Paulo Liquidity', role: 'Asset Pool Custodian', region: 'South America', lat: -23.5505, lon: -46.6333, status: 'WARNING', latency: 94, cpu: 82, ram: 79, disk: 88, workers: 1320, txnsProcessed: 1205300, settlementValue: '$39.2M', lastSeal: 'blk_0', lastConsensus: '2.5 sec ago', softwareVersion: 'v5.9.2', trustScore: '98.423%', currentLoad: '85%' },
  { id: 'YTO_V', name: 'Toronto Validator', role: 'Integrity Verifier Client', region: 'North America', lat: 43.6532, lon: -79.3832, status: 'ONLINE', latency: 18, cpu: 21, ram: 40, disk: 51, workers: 740, txnsProcessed: 914550, settlementValue: '$34.0M', lastSeal: 'blk_0', lastConsensus: '0.9 sec ago', softwareVersion: 'v5.9.2', trustScore: '99.999%', currentLoad: '24%' },
  { id: 'FRA_R', name: 'Frankfurt Reserve', role: 'Reserve Yield Oracle', region: 'Western Europe', lat: 50.1109, lon: 8.6821, status: 'ONLINE', latency: 14, cpu: 25, ram: 44, disk: 55, workers: 1050, txnsProcessed: 1311450, settlementValue: '$57.8M', lastSeal: 'blk_0', lastConsensus: '1.0 sec ago', softwareVersion: 'v5.9.2', trustScore: '100% NOM', currentLoad: '30%' }
];

let routes: Route[] = [
  { id: 'R1', fromId: 'LDN_R', toId: 'SGP_G', avgTps: 162, volume: '$4.8M', latency: 14, successRate: 99.97, drift: 0.002, loss: 0.00, consensus: 'Verified' },
  { id: 'R2', fromId: 'NY_LC', toId: 'LDN_R', avgTps: 245, volume: '$12.4M', latency: 8, successRate: 100.0, drift: 0.000, loss: 0.00, consensus: 'Verified' },
  { id: 'R3', fromId: 'ZRH_T', toId: 'FRA_R', avgTps: 98, volume: '$16.2M', latency: 3, successRate: 99.99, drift: 0.001, loss: 0.00, consensus: 'Verified' },
  { id: 'R4', fromId: 'DXB_T', toId: 'TYO_C', avgTps: 110, volume: '$5.1M', latency: 28, successRate: 99.95, drift: 0.004, loss: 0.01, consensus: 'Verified' },
  { id: 'R5', fromId: 'SGP_G', toId: 'SYD_S', avgTps: 76, volume: '$3.5M', latency: 42, successRate: 99.98, drift: 0.003, loss: 0.00, consensus: 'Verified' },
  { id: 'R6', fromId: 'SAO_L', toId: 'NY_LC', avgTps: 120, volume: '$2.9M', latency: 86, successRate: 99.85, drift: 0.015, loss: 0.04, consensus: 'Warning_Sync' },
  { id: 'R7', fromId: 'YTO_V', toId: 'FRA_R', avgTps: 85, volume: '$1.8M', latency: 38, successRate: 99.99, drift: 0.001, loss: 0.00, consensus: 'Verified' },
  { id: 'R8', fromId: 'DXB_T', toId: 'SGP_G', avgTps: 190, volume: '$9.2M', latency: 19, successRate: 100.0, drift: 0.001, loss: 0.00, consensus: 'Verified' }
];

// --- Authoritative Simulation Logic ---

function sealBlock() {
  const latestBlock = chain[0];
  const h = (latestBlock?.height ?? 0) + 1;
  const prev = latestBlock?.hash ?? "0".repeat(64);
  const merkle = sha256(`merkle-${h}-${generateUUIDShort()}`);
  const blockHash = sha256(`${h}-${prev}-${merkle}`);

  const nextBlock: HashBlock = {
    id: `blk_${h}`,
    height: h,
    hash: blockHash,
    prevHash: prev,
    txnCount: Math.floor(Math.random() * (42 - 8 + 1)) + 8,
    merkleRoot: merkle,
    sealedAt: new Date().toISOString(),
    verified: true
  };

  chain.unshift(nextBlock);
  if (chain.length > 48) {
    chain.pop();
  }

  health.lastSeal = new Date().toISOString();

  // Update geoNodes with the latest seal info
  geoNodes = geoNodes.map(node => ({
    ...node,
    lastSeal: nextBlock.id,
    txnsProcessed: node.txnsProcessed + Math.floor(Math.random() * 5),
    cpu: Math.max(10, Math.min(95, node.cpu + Math.floor(Math.random() * 5) - 2)),
    latency: Math.max(5, Math.min(150, node.latency + Math.floor(Math.random() * 3) - 1))
  }));
}

// 1400ms Loop (App.tsx logic)
setInterval(() => {
  const prevHash = transactions[0]?.hash ?? "0".repeat(64);
  const nextTx = generateRandomTxn(prevHash, accounts);

  // Update general ledger balances if transaction is Posted
  if (nextTx.state === 'posted') {
    accounts = accounts.map(acc => {
      let balanceMinor = acc.balanceMinor;
      const debitEntry = nextTx.entries.find(e => e.accountId === acc.id);
      const creditEntry = nextTx.entries.find(e => e.accountId === acc.id);
      if (debitEntry) balanceMinor += debitEntry.debitMinor;
      if (creditEntry) balanceMinor -= creditEntry.creditMinor;
      return { ...acc, balanceMinor };
    });
  }

  // Occasionally promote an older pending transaction to posted
  if (Math.random() < 0.25) {
    const pendingIndex = transactions.findIndex(t => t.state === 'pending');
    if (pendingIndex !== -1) {
      const promotedTx = { ...transactions[pendingIndex], state: 'posted' as TxnState };
      transactions[pendingIndex] = promotedTx;

      // Apply promoted transaction's debit/credits
      accounts = accounts.map(acc => {
        let balanceMinor = acc.balanceMinor;
        const dEntry = promotedTx.entries.find(e => e.accountId === acc.id);
        const cEntry = promotedTx.entries.find(e => e.accountId === acc.id);
        if (dEntry) balanceMinor += dEntry.debitMinor;
        if (cEntry) balanceMinor -= cEntry.creditMinor;
        return { ...acc, balanceMinor };
      });
    }
  }

  transactions.unshift(nextTx);
  if (transactions.length > 80) transactions.pop();

  // Volume Series Update
  const lastTick = volumeSeries.length ? volumeSeries[volumeSeries.length - 1].tick : 0;
  const nextPoint = {
    tick: lastTick + 1,
    settlementVelocity: Math.floor(Math.random() * (78 - 25 + 1)) + 25,
    treasuryFlow: Math.floor(Math.random() * (460000 - 130000 + 1)) + 130000,
    networkLoad: Math.floor(Math.random() * (85 - 35 + 1)) + 35,
    apiThroughput: Math.floor(Math.random() * (1350 - 450 + 1)) + 450
  };
  volumeSeries.push(nextPoint);
  if (volumeSeries.length > 150) volumeSeries.shift();

  // Jitter Apps
  apps = apps.map(app => ({
    ...app,
    activeSessions: Math.max(0, app.activeSessions + Math.floor(Math.random() * 8) - 3),
    txnPerMin: Math.max(0, app.txnPerMin + (Math.random() * 2.6) - 1.2),
    lastHeartbeat: new Date().toISOString()
  }));

  // Auto Seal
  if (Math.random() < 0.12) sealBlock();

  // Health Jitter
  health.pendingTxns = transactions.filter(t => t.state === 'pending').length;
  health.p99LatencyMs = Math.max(8, Math.min(140, health.p99LatencyMs + Math.floor(Math.random() * 7) - 3));

  // Dynamic Notifications
  if (Math.random() < 0.14) {
    const categories = ['API', 'TREASURY', 'SYSTEM', 'SECURITY', 'AUDIT'];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    let msg = '';
    let status = 'info';

    if (randomCat === 'API') {
      const apiActions = [
        'Client credential handshake resolved with Basalt Console Node #1',
        'SOVR UnifiedPay Hub webhook ingestion queue lag detected: 42ms',
        'SOVR API channel heartbeats successfully acknowledged from all 6 authorities'
      ];
      msg = apiActions[Math.floor(Math.random() * apiActions.length)];
      status = msg.includes('lag') ? 'warning' : 'success';
    } else if (randomCat === 'TREASURY') {
      msg = `Collateralized asset settlement of +${(Math.floor(Math.random() * 85000) + 15000).toLocaleString()} SVT complete; algebraic offset verified`;
      status = 'info';
    } else if (randomCat === 'SYSTEM') {
      msg = `Cryptographic sealer validator block #${Math.floor(Math.random() * 20000 + 12000)} auto-probability consensus attained`;
      status = 'success';
    } else {
      msg = 'Periodic multi-rail double-entry trial balance checked: DEBITS === CREDITS';
      status = 'success';
    }

    notifications.unshift({ id: Date.now() + Math.random(), type: randomCat, message: msg, time: 'Just now', status });
    if (notifications.length > 20) notifications.pop();
  }
}, 1400);

// 3500ms Loop (CommandCenterView.tsx logic)
setInterval(() => {
  pulseCount++;

  // Increment block height
  if (Math.random() > 0.85) {
    sealBlock();
    pendingVerifications = Math.floor(Math.random() * 4) + 1;

    timelineEvents.unshift({
      id: `ev_${Date.now()}_con`,
      time: new Date().toTimeString().split(' ')[0],
      msg: `New cryptographic block state #${chain[0].height} authority seal produced successfully.`,
      type: 'CONSENSUS'
    });
  }

  // Ingestion Fluctuation
  ingestionItems = ingestionItems.map(item => ({
    ...item,
    rate: Math.max(item.rate + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 8), 1),
    queue: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0
  }));

  // Timeline Events
  if (Math.random() > 0.7 && transactions.length > 0) {
    const randTx = transactions[Math.floor(Math.random() * transactions.length)];
    const types: any[] = ['TREASURY', 'INGEST', 'COMMIT', 'ANOMALY'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    const amountStr = (randTx.amountMinor / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    let customMsg = `Routed transactional packet [${amountStr}] via ${randTx.rail.toUpperCase()}`;
    if (selectedType === 'COMMIT') {
      customMsg = `Committed double-entry algebraic state proof for balance [${amountStr}]`;
    }

    timelineEvents.unshift({
      id: `ev_${Date.now()}_txn`,
      time: new Date().toTimeString().split(' ')[0],
      msg: customMsg,
      type: selectedType
    });
    if (timelineEvents.length > 30) timelineEvents.pop();
  }
}, 3500);

// --- End of Authoritative Backend State ---

app.get('/api/state', (req, res) => {
  /*
  // TIGERBEETLE INTEGRATION: Pipe accounts to TigerBeetle
  // To integrate, use the tigerbeetle-node SDK to fetch account balances.
  // Example:
  // const tbAccounts = await tbClient.lookupAccounts([accountIds]);
  // accounts = accounts.map(a => {
  //   const tbA = tbAccounts.find(tba => tba.id === BigInt(a.id));
  //   return { ...a, balanceMinor: Number(tbA.credits_posted - tbA.debits_posted) };
  // });
  */
  res.json({
    accounts,
    apps,
    chain,
    transactions,
    volumeSeries,
    notifications,
    health,
    pulseCount,
    pendingVerifications,
    timelineEvents,
    ingestionItems,
    agents,
    anomalies,
    geoNodes,
    routes
  });
});

app.post('/api/transactions', (req, res) => {
  const params = req.body;

  /*
  // TIGERBEETLE INTEGRATION: Pipe transfers to TigerBeetle
  // To integrate, construct a TigerBeetle transfer and commit it.
  // Example:
  // const transfer = {
  //   id: generateBigInt128Id(),
  //   debit_account_id: BigInt(params.debitId),
  //   credit_account_id: BigInt(params.creditId),
  //   amount: BigInt(params.amountMinor),
  //   ledger: 999, // SVT or appropriate ledger
  //   code: 1,
  //   flags: 0,
  // };
  // const results = await tbClient.createTransfers([transfer]);
  // if (results.length > 0) throw new Error("TigerBeetle error");
  */

  const id = `txn_${generateUUIDShort()}`;
  const latestTx = transactions[0];
  const prevHash = latestTx?.hash ?? "0".repeat(64);

  const canonicalStr = `${id}|${params.rail}|${params.amountMinor}|${params.denomination}|${prevHash}`;
  const txnHash = sha256(canonicalStr);

  const debitAccount = accounts.find(a => a.id === params.debitId);
  const creditAccount = accounts.find(a => a.id === params.creditId);

  if (!debitAccount || !creditAccount) {
    return res.status(400).json({ error: "Invalid accounts" });
  }

  const entries: LedgerEntry[] = [
    {
      id: generateUUIDShort(),
      accountId: params.debitId,
      accountCode: debitAccount.code,
      debitMinor: params.amountMinor,
      creditMinor: 0
    },
    {
      id: generateUUIDShort(),
      accountId: params.creditId,
      accountCode: creditAccount.code,
      debitMinor: 0,
      creditMinor: params.amountMinor
    }
  ];

  const newTxn: Transaction = {
    id,
    hash: txnHash,
    prevHash,
    state: 'posted',
    rail: params.rail,
    denomination: params.denomination,
    amountMinor: params.amountMinor,
    memo: params.memo,
    originApp: params.originApp,
    createdAt: new Date().toISOString(),
    entries
  };

  // Update Ledger Balances
  accounts = accounts.map(account => {
    let balanceMinor = account.balanceMinor;
    if (account.id === params.debitId) balanceMinor += params.amountMinor;
    if (account.id === params.creditId) balanceMinor -= params.amountMinor;
    return { ...account, balanceMinor };
  });

  transactions.unshift(newTxn);
  if (transactions.length > 80) transactions.pop();

  res.json(newTxn);
});

app.post('/api/chain/seal', (req, res) => {
  sealBlock();
  res.json(chain[0]);
});

app.post('/api/anomalies/trigger', (req, res) => {
  const alerts = [
    'Federal Reserve FedNow packet payload handshake pending retry',
    'Memory pool expansion limit reaching 85% capacity on Singapore Gate node',
    'API webhook ping timeout detected on Uniswap liquidity tracking Oracle',
    'Automatic block verification witness #11 delay warning: sync threshold drift alert'
  ];
  const alertText = alerts[Math.floor(Math.random() * alerts.length)];
  const newAnomaly = { id: `an_${Date.now()}_${Math.floor(Math.random() * 10000)}`, text: alertText, severe: Math.random() > 0.5, dismissed: false };
  anomalies.unshift(newAnomaly);
  res.json(newAnomaly);
});

app.post('/api/anomalies/dismiss', (req, res) => {
  const { id } = req.body;
  anomalies = anomalies.map(an => an.id === id ? { ...an, dismissed: true } : an);
  res.json({ success: true });
});

app.post('/api/apps/register', (req, res) => {
  const newApp = req.body;
  apps.push(newApp);
  res.json(newApp);
});

app.listen(port, () => {
  console.log(`SOVR Backend listening at http://localhost:${port}`);
});
