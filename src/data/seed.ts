import { LedgerAccount, ConnectedApp, HashBlock, Transaction, SystemHealth, Rail, Denomination, LedgerEntry, TxnState } from '../types';
import { sha256 } from '../utils/sha256';

export const INITIAL_ACCOUNTS: LedgerAccount[] = [
  {
    id: "acc_cash_stripe",
    code: "1000.CASH.STRIPE",
    name: "Stripe Operating",
    kind: "asset",
    denomination: "USD",
    balanceMinor: 428741200
  },
  {
    id: "acc_cash_bank",
    code: "1010.CASH.BANK",
    name: "FRB Settlement",
    kind: "asset",
    denomination: "USD",
    balanceMinor: 1290422000
  },
  {
    id: "acc_svt_treasury",
    code: "1100.SVT.TREASURY",
    name: "SVT Treasury",
    kind: "asset",
    denomination: "SVT",
    balanceMinor: 842100000
  },
  {
    id: "acc_escrow_vendor",
    code: "1200.ESCROW.VENDOR",
    name: "Vendor Escrow Pool",
    kind: "escrow",
    denomination: "USD",
    balanceMinor: 64288100
  },
  {
    id: "acc_private_credit",
    code: "1300.PC.OUTSTANDING",
    name: "Private Credit Issued",
    kind: "asset",
    denomination: "USD",
    balanceMinor: 214055000
  },
  {
    id: "acc_liab_customer",
    code: "2000.LIAB.CUSTOMER",
    name: "Customer Float",
    kind: "liability",
    denomination: "USD",
    balanceMinor: 412033000
  },
  {
    id: "acc_revenue_fees",
    code: "4000.REV.FEES",
    name: "Gateway Fees",
    kind: "revenue",
    denomination: "USD",
    balanceMinor: 9481200
  },
  {
    id: "acc_equity",
    code: "3000.EQUITY",
    name: "SOVR Equity",
    kind: "equity",
    denomination: "USD",
    balanceMinor: 1850000000
  }
];

export const INITIAL_APPS: ConnectedApp[] = [
  {
    id: "app_unifiedpay",
    slug: "unifiedpay-hub",
    displayName: "UnifiedPay Hub",
    icon: "CreditCard",
    tint: "#06b6d4", // Cyan
    health: "healthy",
    activeSessions: 1284,
    txnPerMin: 42.3,
    lastHeartbeat: new Date().toISOString(),
    version: "2.4.1"
  },
  {
    id: "app_bridge",
    slug: "rork-sovr-bridge",
    displayName: "SOVR Bridge",
    icon: "Link",
    tint: "#10b981", // Emerald
    health: "healthy",
    activeSessions: 312,
    txnPerMin: 11.8,
    lastHeartbeat: new Date().toISOString(),
    version: "1.9.0"
  },
  {
    id: "app_basalt",
    slug: "basalt-console",
    displayName: "Basalt Console",
    icon: "Database",
    tint: "#f59e0b", // Gold / Amber
    health: "healthy",
    activeSessions: 24,
    txnPerMin: 2.1,
    lastHeartbeat: new Date().toISOString(),
    version: "0.7.2"
  },
  {
    id: "app_vendor",
    slug: "vendor-oracle",
    displayName: "Vendor Oracle",
    icon: "Radio",
    tint: "#8b5cf6", // Violet
    health: "degraded",
    activeSessions: 87,
    txnPerMin: 6.4,
    lastHeartbeat: new Date().toISOString(),
    version: "1.2.0"
  },
  {
    id: "app_audit",
    slug: "audit-witness",
    displayName: "Audit Witness",
    icon: "ShieldAlert",
    tint: "#10b981", // Emerald
    health: "healthy",
    activeSessions: 4,
    txnPerMin: 0.3,
    lastHeartbeat: new Date().toISOString(),
    version: "1.0.4"
  },
  {
    id: "app_treasury",
    slug: "treasury-ops",
    displayName: "Treasury Ops",
    icon: "Building",
    tint: "#d97706", // Amber
    health: "healthy",
    activeSessions: 9,
    txnPerMin: 0.8,
    lastHeartbeat: new Date().toISOString(),
    version: "3.1.0"
  }
];

// Helper to format currency
export function formatCurrency(amountMinor: number, currency: Denomination): string {
  const main = amountMinor / 100;
  if (currency === 'SVT') {
    return main.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SVT';
  }
  if (currency === 'USDC') {
    return main.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDC';
  }
  return main.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Generate secure random strings for UUID equivalent in static environment
export function generateUUIDShort(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < 12; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

// Generate a random block Merkle root hash mock
export function generateMerkleRoot(height: number): string {
  return sha256(`merkle-${height}-${generateUUIDShort()}`);
}

// Ledger Transaction generation matching logic
export function generateRandomTxn(prevHash: string, accounts: LedgerAccount[]): Transaction {
  const rails: Rail[] = ['stripe', 'ach', 'fednow', 'onchain', 'internal', 'svt'];
  const rail = rails[Math.floor(Math.random() * rails.length)];
  
  let denom: Denomination = 'USD';
  if (rail === 'svt') {
    denom = 'SVT';
  } else if (rail === 'onchain') {
    denom = 'USDC';
  }

  const amount = Math.floor(Math.random() * (842000 - 250 + 1)) + 250; // minor units: $2.50 to $8420.00
  const origins = ["unifiedpay-hub", "rork-sovr-bridge", "basalt-console", "vendor-oracle", "treasury-ops"];
  const memos = [
    "Card capture", "ACH credit", "FedNow instant", "SVT mint",
    "Vendor payout", "Treasury rebalance", "Private credit draw",
    "Escrow release", "Refund", "On-chain settle", "Customer settlement"
  ];

  // Select two different random accounts
  const debitAcc = accounts[Math.floor(Math.random() * accounts.length)];
  let creditAcc = accounts[Math.floor(Math.random() * accounts.length)];
  while (creditAcc.id === debitAcc.id) {
    creditAcc = accounts[Math.floor(Math.random() * accounts.length)];
  }

  const entries: LedgerEntry[] = [
    {
      id: generateUUIDShort(),
      accountId: debitAcc.id,
      accountCode: debitAcc.code,
      debitMinor: amount,
      creditMinor: 0
    },
    {
      id: generateUUIDShort(),
      accountId: creditAcc.id,
      accountCode: creditAcc.code,
      debitMinor: 0,
      creditMinor: amount
    }
  ];

  const id = `txn_${generateUUIDShort()}`;
  const canonicalString = `${id}|${rail}|${amount}|${denom}|${prevHash}`;
  const txnHash = sha256(canonicalString);

  // States: posted (70%), pending (20%), voided (10%)
  const rand = Math.random();
  const state: TxnState = rand < 0.7 ? 'posted' : (rand < 0.9 ? 'pending' : 'voided');

  return {
    id,
    hash: txnHash,
    prevHash,
    state,
    rail,
    denomination: denom,
    amountMinor: amount,
    memo: memos[Math.floor(Math.random() * memos.length)],
    originApp: origins[Math.floor(Math.random() * origins.length)],
    createdAt: new Date().toISOString(),
    entries
  };
}
