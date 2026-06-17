export type AccountKind = 'asset' | 'escrow' | 'liability' | 'revenue' | 'equity';
export type Denomination = 'USD' | 'SVT' | 'USDC';
export type ConnectionState = 'connected' | 'disconnected';
export type AppHealth = 'healthy' | 'degraded' | 'offline';
export type TxnState = 'posted' | 'pending' | 'voided';
export type Rail = 'stripe' | 'ach' | 'fednow' | 'onchain' | 'internal' | 'svt' | 'internal_';

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  kind: AccountKind;
  denomination: Denomination;
  balanceMinor: number; // Stored in minor units (e.g. cents for USD)
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  accountCode: string;
  debitMinor: number;
  creditMinor: number;
}

export interface Transaction {
  id: string;
  hash: string;
  prevHash: string;
  state: TxnState;
  rail: Rail;
  denomination: Denomination;
  amountMinor: number;
  memo: string;
  originApp: string;
  createdAt: string; // ISO String
  entries: LedgerEntry[];
}

export interface HashBlock {
  id: string;
  height: number;
  hash: string;
  prevHash: string;
  txnCount: number;
  merkleRoot: string;
  sealedAt: string; // ISO String
  verified: boolean;
}

export interface ConnectedApp {
  id: string;
  slug: string;
  displayName: string;
  icon: string;
  tint: string; // CSS color string or class
  health: AppHealth;
  activeSessions: number;
  txnPerMin: number;
  lastHeartbeat: string; // ISO String
  version: string;
  description?: string;
  endpoint?: string;
  auth?: string;
}

export interface SystemHealth {
  ledgerOk: boolean;
  chainVerified: boolean;
  pendingTxns: number;
  p99LatencyMs: number;
  nodesOnline: number;
  nodesTotal: number;
  lastSeal: string; // ISO String
}

export interface GeoNode {
  id: string;
  name: string;
  role: string;
  region: string;
  lat: number;
  lon: number;
  status: 'ONLINE' | 'WARNING' | 'DEGRADED';
  latency: number;
  cpu: number;
  ram: number;
  disk: number;
  workers: number;
  txnsProcessed: number;
  settlementValue: string;
  lastSeal: string;
  lastConsensus: string;
  softwareVersion: string;
  trustScore: string;
  currentLoad?: string;
}

export interface Route {
  id: string;
  fromId: string;
  toId: string;
  avgTps: number;
  volume: string;
  latency: number;
  successRate: number;
  drift: number;
  loss: number;
  consensus: string;
}
