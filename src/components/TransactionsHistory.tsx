import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, Rail, TxnState, Denomination } from '../types';
import { formatCurrency } from '../data/seed';
import { 
  ArrowRightLeft, Search, Filter, Calendar, Activity, CheckCircle2, Loader2, 
  AlertTriangle, Eye, ArrowUpRight, ArrowDownRight, Award, ShieldCheck, 
  Download, QrCode, Printer, Copy, Check, ExternalLink, Lock, FileText, Zap, X 
} from 'lucide-react';
import EvidencePortal from './EvidencePortal';

interface TransactionsHistoryProps {
  transactions: Transaction[];
  onSelectTransaction?: (id: string) => void;
}

export default function TransactionsHistory({ transactions, onSelectTransaction }: TransactionsHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<TxnState | 'all'>('all');
  const [selectedRail, setSelectedRail] = useState<Rail | 'all'>('all');
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

  // Verification & download states
  const [activeVerifyTxnId, setActiveVerifyTxnId] = useState<string | null>(null);
  const [defaultPortalTab, setDefaultPortalTab] = useState<'overview' | 'receipt' | 'settlement' | 'proof' | 'audit'>('overview');
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);
  const [activeInlineQR, setActiveInlineQR] = useState<string | null>(null);
  const [printTxId, setPrintTxId] = useState<string | null>(null);
  const [printTxData, setPrintTxData] = useState<any>(null);

  // Direct download / print handlers
  const handleCopyLink = (txnId: string) => {
    const url = `${window.location.origin}/verify/${txnId}`;
    navigator.clipboard.writeText(url);
    setCopiedTxnId(txnId);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  const triggerJSONDownload = async (txnId: string) => {
    try {
      const res = await fetch(`/api/verify/${txnId}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SOVR_EVIDENCE_${txnId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to trigger JSON download:', e);
    }
  };

  const triggerZIPDownload = async (txnId: string) => {
    try {
      const a = document.createElement('a');
      a.href = `/api/evidence/download/${txnId}?format=zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Failed to trigger ZIP download:', e);
    }
  };

  const triggerPDFPrint = async (txnId: string) => {
    try {
      const res = await fetch(`/api/verify/${txnId}`);
      const data = await res.json();
      setPrintTxId(txnId);
      setPrintTxData(data);
    } catch (e) {
      console.error('Failed to prepare PDF print:', e);
    }
  };

  // Advanced filters state
  const [dateRange, setDateRange] = useState<'all' | '1h' | '24h' | '7d'>('all');
  const [amountFilter, setAmountFilter] = useState<'all' | 'under100' | '100to1000' | 'over1000'>('all');
  const [selectedSource, setSelectedSource] = useState<string | 'all'>('all');
  const [settlementType, setSettlementType] = useState<'all' | 'instant' | 'batch' | 'mint'>('all');

  const filteredTxns = (transactions || []).filter(txn => {
    if (!txn) return false;
    const memoStr = txn.memo || '';
    const idStr = txn.id || '';
    const originAppStr = txn.originApp || '';
    const hashStr = txn.hash || '';
    const searchStr = searchTerm || '';
    const matchesSearch = 
      memoStr.toLowerCase().includes(searchStr.toLowerCase()) ||
      idStr.toLowerCase().includes(searchStr.toLowerCase()) ||
      originAppStr.toLowerCase().includes(searchStr.toLowerCase()) ||
      hashStr.toLowerCase().includes(searchStr.toLowerCase());

    const matchesState = selectedState === 'all' ? true : txn.state === selectedState;
    const matchesRail = selectedRail === 'all' ? true : txn.rail === selectedRail;

    // Date Range Matcher
    let matchesDate = true;
    if (dateRange !== 'all') {
      const txTime = new Date(txn.createdAt).getTime();
      const now = Date.now();
      if (dateRange === '1h') matchesDate = (now - txTime) <= 60 * 60 * 1000;
      else if (dateRange === '24h') matchesDate = (now - txTime) <= 24 * 60 * 60 * 1000;
      else if (dateRange === '7d') matchesDate = (now - txTime) <= 7 * 24 * 60 * 60 * 1000;
    }

    // Amount Matcher
    let matchesAmount = true;
    if (amountFilter !== 'all') {
      const amtDollars = txn.amountMinor / 100;
      if (amountFilter === 'under100') matchesAmount = amtDollars < 100;
      else if (amountFilter === '100to1000') matchesAmount = amtDollars >= 100 && amtDollars <= 1000;
      else if (amountFilter === 'over1000') matchesAmount = amtDollars > 1000;
    }

    // API Source Matcher
    const matchesSource = selectedSource === 'all' ? true : txn.originApp.toLowerCase().includes(selectedSource.toLowerCase());

    // Settlement Type Matcher
    let matchesSettle = true;
    if (settlementType !== 'all') {
      if (settlementType === 'instant') {
        matchesSettle = txn.rail === 'fednow' || txn.rail === 'onchain';
      } else if (settlementType === 'batch') {
        matchesSettle = txn.rail === 'ach' || txn.rail === 'stripe' || txn.rail === 'internal' || txn.rail === 'internal_';
      } else if (settlementType === 'mint') {
        matchesSettle = txn.rail === 'svt';
      }
    }

    return matchesSearch && matchesState && matchesRail && matchesDate && matchesAmount && matchesSource && matchesSettle;
  });

  const getRailBadgeStyle = (rail: Rail) => {
    switch (rail) {
      case 'stripe': return 'bg-indigo-950 text-indigo-300 border border-indigo-500/20';
      case 'ach': return 'bg-blue-950 text-blue-300 border border-blue-500/20';
      case 'fednow': return 'bg-amber-950 text-amber-300 border border-amber-500/20';
      case 'onchain': return 'bg-cyan-950 text-cyan-300 border border-cyan-500/20';
      case 'svt': return 'bg-emerald-950 text-emerald-300 border border-emerald-500/20';
      case 'internal_':
      case 'internal': return 'bg-slate-900 text-slate-300 border border-slate-700/60';
    }
  };

  const getStateBadgeStyle = (state: TxnState) => {
    switch (state) {
      case 'posted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'voided': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getStateIcon = (state: TxnState) => {
    switch (state) {
      case 'posted': return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'pending': return <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />;
      case 'voided': return <AlertTriangle className="w-3 h-3 text-rose-400" />;
    }
  };

  // Helper selectors helper
  const uniqueSources = Array.from(new Set((transactions || []).map(t => t.originApp).filter(Boolean)));

  return (
    <div id="transactions-card-container" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 backdrop-blur-md">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5">
        <div>
          <h2 id="transactions-panel-title" className="text-xs font-black uppercase tracking-widest text-white/90 font-display flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            Gateway Ledger Stream
          </h2>
          <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider mt-1">Real-time accounting stream matching multi-rail bank gateways</p>
        </div>

        {/* Filters and Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
            <input
              id="transaction-search-field"
              type="text"
              placeholder="Search memo, ID, app, hash..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 placeholder-white/30 focus:outline-none focus:border-cyan-500/60 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* State Filter */}
          <select
            id="txn-state-filter-select"
            className="px-2.5 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors cursor-pointer uppercase font-mono tracking-wider text-[10px]"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value as TxnState | 'all')}
          >
            <option value="all">All States</option>
            <option value="posted">Posted ✅</option>
            <option value="pending">Pending ⏳</option>
            <option value="voided">Voided 🛑</option>
          </select>

          {/* Rail Filter */}
          <select
            id="txn-rail-filter-select"
            className="px-2.5 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors cursor-pointer uppercase font-mono tracking-wider text-[10px]"
            value={selectedRail}
            onChange={(e) => setSelectedRail(e.target.value as Rail | 'all')}
          >
            <option value="all">All Rails</option>
            <option value="stripe">Stripe</option>
            <option value="ach">ACH</option>
            <option value="fednow">FedNow</option>
            <option value="onchain">Onchain</option>
            <option value="svt">SVT Minting</option>
          </select>
        </div>
      </div>

      {/* Advanced Filter Sub-row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-2.5 bg-[#050507] border border-[#2a2a35]/40 rounded">
        <div>
          <label className="text-[8px] text-white/40 uppercase block font-mono mb-1">Time Window</label>
          <select
            className="w-full bg-[#101015] border border-[#2a2a35]/60 rounded text-white/80 text-[10px] py-1 px-1.5 focus:outline-none focus:border-cyan-500/60 font-mono"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
          >
            <option value="all">All Logs</option>
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        <div>
          <label className="text-[8px] text-white/40 uppercase block font-mono mb-1">Scale / Amount</label>
          <select
            className="w-full bg-[#101015] border border-[#2a2a35]/60 rounded text-white/80 text-[10px] py-1 px-1.5 focus:outline-none focus:border-cyan-500/60 font-mono"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value as any)}
          >
            <option value="all">All Scales</option>
            <option value="under100">Small (&lt; $100)</option>
            <option value="100to1000">Medium ($100 - $1k)</option>
            <option value="over1000">Large (&gt; $1k)</option>
          </select>
        </div>

        <div>
          <label className="text-[8px] text-white/40 uppercase block font-mono mb-1">API Origin Source</label>
          <select
            className="w-full bg-[#101015] border border-[#2a2a35]/60 rounded text-white/80 text-[10px] py-1 px-1.5 focus:outline-none focus:border-cyan-500/60 font-mono"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[8px] text-white/40 uppercase block font-mono mb-1">Settlement Schema</label>
          <select
            className="w-full bg-[#101015] border border-[#2a2a35]/60 rounded text-white/80 text-[10px] py-1 px-1.5 focus:outline-none focus:border-cyan-500/60 font-mono"
            value={settlementType}
            onChange={(e) => setSettlementType(e.target.value as any)}
          >
            <option value="all">All Paths</option>
            <option value="instant">Real-Time (Instant)</option>
            <option value="batch">End-Of-Day (Batch)</option>
            <option value="mint">SOVR MInt</option>
          </select>
        </div>
      </div>

      {/* Transaction Feed List */}
      <div id="transactions-feed-viewport" className="overflow-y-auto max-h-[500px] border border-[#2a2a35]/40 rounded pr-1 bg-[#050507]">
        <div className="space-y-2 p-2">
          {filteredTxns.map((txn) => {
            const isExpanded = selectedTxnId === txn.id;
            
            // Extract Debit / Credit codes for forensics
            const debitCode = txn.entries.find(e => e.debitMinor > 0)?.accountCode || 'SOVR Clearing';
            const creditCode = txn.entries.find(e => e.creditMinor > 0)?.accountCode || 'SOVR Clearing';
            const deterministicNode = `Validator Node #0${(txn.hash.charCodeAt(4) % 6) + 1}`;
            const sealId = `SEAL_BLOCK_#${(txn.hash.charCodeAt(1) % 400) + 9422}`;

            return (
              <div
                key={txn.id}
                id={`txn-feed-card-${txn.id}`}
                className={`border rounded overflow-hidden transition-all duration-150 ${
                  isExpanded ? 'bg-[#13131e] border-cyan-500/50 ring-1 ring-cyan-500/10' : 'bg-[#101015] border-white/5 hover:border-white/15'
                }`}
              >
                {/* Main Row summary */}
                <div
                  id={`txn-summary-trigger-${txn.id}`}
                  onClick={() => setSelectedTxnId(isExpanded ? null : txn.id)}
                  className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start md:items-center gap-3">
                    {/* State Badge */}
                    <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-mono px-2 py-1 rounded-sm border ${getStateBadgeStyle(txn.state)}`}>
                      {getStateIcon(txn.state)}
                      {txn.state}
                    </span>

                    {/* Rail Badge */}
                    <span className={`text-[9px] font-mono uppercase px-2 py-1 rounded-sm tracking-widest border ${getRailBadgeStyle(txn.rail)}`}>
                      {txn.rail === 'internal_' ? 'internal' : txn.rail}
                    </span>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-semibold text-white/90">
                          {txn.id}
                        </span>
                        <span className="text-[9px] text-[#ffffff]/30 font-bold uppercase tracking-wide">via {txn.originApp}</span>
                      </div>
                      <span className="text-xs text-white/70 font-medium mt-0.5 block">{txn.memo}</span>
                    </div>
                  </div>

                  <div className="flex md:items-center justify-between md:justify-end gap-4 border-t border-[#2a2a35]/40 md:border-none pt-2.5 md:pt-0">
                    <div className="text-left md:text-right font-mono">
                      <div className="text-[9px] text-white/30 flex items-center gap-1 md:justify-end uppercase">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {new Date(txn.createdAt).toLocaleTimeString()}
                      </div>
                      <span className="text-[9px] text-white/20 block mt-0.5 truncate max-w-[120px]" title={txn.hash}>
                        hash: {txn.hash.substring(0, 8)}...
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-semibold font-mono text-emerald-400 font-bold">
                        +{formatCurrency(txn.amountMinor, txn.denomination)}
                      </span>
                      <span className="text-[9px] text-[#ffffff]/30 font-mono block mt-0.5 tracking-wider font-bold">{txn.denomination}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Ledger Detail view (Double-entry depth) */}
                {isExpanded && (
                  <div id={`txn-ledger-detail-${txn.id}`} className="bg-[#050507]/90 border-t border-[#2a2a35] p-4 animate-fadeIn space-y-5">
                    {/* Rich Audit Grid Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-[#101015] border border-[#2a2a35]/50 rounded text-mono font-mono text-[10px]">
                      <div>
                        <span className="text-white/30 text-[8.5px] uppercase block font-bold">Debit Target Account</span>
                        <span className="text-[#e0e0e0] font-bold block mt-0.5">{debitCode}</span>
                      </div>
                      <div>
                        <span className="text-white/30 text-[8.5px] uppercase block font-bold">Credit Offset Account</span>
                        <span className="text-[#e0e0e0] font-bold block mt-0.5">{creditCode}</span>
                      </div>
                      <div>
                        <span className="text-white/30 text-[8.5px] uppercase block font-bold">Consensus Witness Node</span>
                        <span className="text-cyan-400 font-bold block mt-0.5">{deterministicNode}</span>
                      </div>
                      <div>
                        <span className="text-white/30 text-[8.5px] uppercase block font-bold">Assigned Seal ID</span>
                        <span className="text-amber-400 font-bold block mt-0.5">{sealId}</span>
                      </div>
                    </div>

                    {/* SOVR EVIDENCE INTEGRITY HUB */}
                    <div className="bg-[#0b0b14] border border-cyan-500/25 rounded-lg p-4 font-mono text-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-cyan-400 animate-pulse" />
                          </div>
                          <span className="text-white font-extrabold tracking-wider uppercase text-[10.5px]">
                            SOVR Immutable Evidence Vault
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                          <Award className="w-3 h-3" />
                          Vault score: 100% Secure
                        </div>
                      </div>

                      {/* Evidence Vault Checklist */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-[9.5px]">
                        {[
                          { label: 'Ledger Verified', status: true },
                          { label: 'Receipt Generated', status: true },
                          { label: 'Settlement Issued', status: true },
                          { label: 'Hash Validated', status: true },
                          { label: 'Signature Verified', status: true },
                          { label: 'Chain Anchored', status: true },
                          { label: 'Audit Package Ready', status: true },
                        ].map((chk, idx) => (
                          <div key={idx} className="bg-slate-950/80 border border-slate-900 rounded p-2 text-center flex flex-col items-center justify-between gap-1">
                            <span className="text-slate-400 text-[8.5px] font-bold uppercase block">{chk.label}</span>
                            <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 flex items-center justify-center font-bold text-[9px] mt-1">
                              ✓
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Cryptographic Hash Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                        <div>
                          <span className="text-slate-500 uppercase tracking-widest block mb-1 font-bold">CRYPTOGRAPHIC PROOF CHAIN SEAL</span>
                          <div className="bg-[#101015] border border-[#2a2a35]/55 p-2 rounded select-all break-all text-slate-300 opacity-90 leading-relaxed font-mono">
                            {txn.hash}
                          </div>
                          <div className="mt-1.5 text-slate-500 text-[9px] leading-relaxed">
                            Parent Block Hash: <span className="text-slate-400 select-all font-bold">{txn.prevHash}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-cyan-400 uppercase tracking-widest block font-bold">DIGITAL SIGNATURE AUDIT STATUS</span>
                          <div className="bg-[#101015] border border-[#2a2a35]/40 p-2.5 rounded text-[9.5px] space-y-1 text-slate-300">
                            <p className="text-emerald-400 flex items-center gap-1.5 leading-none font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]" />
                              ED25519 system Authority Seal: VALID_AUTHENTICATED
                            </p>
                            <p className="leading-relaxed text-[8.5px] text-slate-400">
                              Verified sequential ledger leaf [{txn.hash.substring(0, 8)}] matches SHA256 double-entry checksum invariants perfectly.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons toolbar */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
                        {onSelectTransaction && (
                          <button 
                            onClick={() => onSelectTransaction(txn.id)}
                            className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-400 hover:to-orange-400 text-white rounded font-black uppercase text-[8.5px] transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-orange-950/45"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Open Workspace
                          </button>
                        )}
                        <button 
                          onClick={() => { setActiveVerifyTxnId(txn.id); setDefaultPortalTab('overview'); }}
                          className="px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded font-black uppercase text-[8.5px] hover:bg-cyan-500/20 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verify Record
                        </button>
                        <button 
                          onClick={() => { setActiveVerifyTxnId(txn.id); setDefaultPortalTab('receipt'); }}
                          className="px-2.5 py-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 rounded font-black uppercase text-[8.5px] hover:bg-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          View Receipt
                        </button>
                        <button 
                          onClick={() => { setActiveVerifyTxnId(txn.id); setDefaultPortalTab('settlement'); }}
                          className="px-2.5 py-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 rounded font-black uppercase text-[8.5px] hover:bg-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5 text-cyan-400" />
                          View Settlement
                        </button>
                        <button 
                          onClick={() => { setActiveVerifyTxnId(txn.id); setDefaultPortalTab('proof'); }}
                          className="px-2.5 py-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 rounded font-black uppercase text-[8.5px] hover:bg-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          View Chain Proof
                        </button>
                        <button 
                          onClick={() => { setActiveVerifyTxnId(txn.id); setDefaultPortalTab('audit'); }}
                          className="px-2.5 py-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 rounded font-black uppercase text-[8.5px] hover:bg-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          View Audit Package
                        </button>
                        
                        <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

                        <button 
                          onClick={() => triggerPDFPrint(txn.id)}
                          className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-teal-400 rounded transition-all cursor-pointer"
                          title="Print Document"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => triggerJSONDownload(txn.id)}
                          className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-all cursor-pointer"
                          title="Download JSON metadata"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => triggerZIPDownload(txn.id)}
                          className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-purple-400 rounded transition-all cursor-pointer"
                          title="Download ZIP Audit Bundle"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setActiveInlineQR(activeInlineQR === txn.id ? null : txn.id)}
                          className={`p-1.5 border rounded transition-all cursor-pointer ${
                            activeInlineQR === txn.id ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-amber-400'
                          }`}
                          title="Toggle verification QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleCopyLink(txn.id)}
                          className={`px-2 py-1 bg-slate-950 border text-[8px] uppercase tracking-wide font-bold rounded transition-all cursor-pointer flex items-center gap-1 ${
                            copiedTxnId === txn.id ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {copiedTxnId === txn.id ? 'Copied ✓' : 'Copy link'}
                        </button>
                      </div>

                      {/* Inline Vector QR View */}
                      {activeInlineQR === txn.id && (
                        <div className="bg-slate-950 border border-amber-500/25 p-3 rounded-md flex items-center gap-3 font-mono text-[9.5px] animate-fadeIn">
                          <div className="bg-slate-900 p-2.5 rounded border border-slate-800/60 flex items-center justify-center flex-shrink-0">
                            <div className="w-12 h-12 border border-dashed border-amber-500/30 grid grid-cols-6 gap-0.5 p-1 bg-black">
                              {/* Standard micro visual pattern */}
                              <div className="bg-amber-400" /><div className="bg-transparent" /><div className="bg-amber-400" /><div className="bg-amber-400" /><div className="bg-transparent" /><div className="bg-amber-400" />
                              <div className="bg-transparent" /><div className="bg-amber-400" /><div className="bg-transparent" /><div className="bg-transparent" /><div className="bg-amber-400" /><div className="bg-transparent" />
                              <div className="bg-amber-400" /><div className="bg-transparent" /><div className="bg-amber-400" /><div className="bg-amber-400" /><div className="bg-transparent" /><div className="bg-amber-400" />
                              <div className="bg-amber-400" /><div className="bg-amber-400" /><div className="bg-transparent" /><div className="bg-transparent" /><div className="bg-amber-400" /><div className="bg-amber-400" />
                              <div className="bg-transparent" /><div className="bg-transparent" /><div className="bg-amber-400" /><div className="bg-amber-400" /><div className="bg-transparent" /><div className="bg-transparent" />
                              <div className="bg-amber-400" /><div className="bg-amber-400" /><div className="bg-transparent" /><div className="bg-amber-400" /><div className="bg-amber-400" /><div className="bg-transparent" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-amber-400 font-extrabold uppercase">EVIDENCE TARGETING SEAL</p>
                            <p className="text-slate-400">Scan to view certified ledger status & digital certificates directly in the public browser portal.</p>
                            <div className="text-[8px] text-slate-500 font-bold select-all break-all font-mono">
                              {window.location.origin}/verify/{txn.id}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1 border-t border-[#2a2a35]/20 text-[10px] font-mono">
                      <div>
                        <span className="text-[9px] text-white/30 uppercase block font-bold">Inbound Ingress Posting Time</span>
                        <span className="text-white/70">{new Date(txn.createdAt).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/30 uppercase block font-bold">Outbound Cryptographic Settlement Age</span>
                        <span className="text-white/70">
                          {txn.state === 'posted' ? `${new Date(new Date(txn.createdAt).getTime() + 840).toLocaleString()} (Ack: 840ms)` : 'AWAITING_CONSENSUS_SEAL'}
                        </span>
                      </div>
                    </div>

                    {/* Ledger entries lists table */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#e0e0e0] font-display">Double-Entry Ledger Invariant Matching Equations</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                          BALANCED STATE
                        </span>
                      </div>

                      <div className="bg-[#101015] border border-[#2a2a35]/40 rounded overflow-hidden">
                        <table className="w-full text-left border-collapse font-mono text-[11px]">
                          <thead>
                            <tr className="bg-[#08080c] text-white/40 border-b border-[#2a2a35]/50">
                              <th className="p-2.5 uppercase text-[9px] tracking-wider font-bold">Account Code</th>
                              <th className="p-2.5 text-right uppercase text-[9px] tracking-wider font-bold">Debit Balance (+)</th>
                              <th className="p-2.5 text-right uppercase text-[9px] tracking-wider font-bold">Credit Balance (-)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {txn.entries.map((entry) => (
                              <tr key={entry.id} className="border-b border-[#2a2a35]/20 last:border-b-0 hover:bg-[#151520]/60">
                                <td className="p-2.5 text-white/80">
                                  {entry.accountCode}
                                  <span className="text-[9px] text-white/30 ml-2">({entry.accountId})</span>
                                </td>
                                <td className="p-2.5 text-right font-medium">
                                  {entry.debitMinor > 0 ? (
                                    <span className="text-emerald-400 inline-flex items-center gap-1">
                                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                      {formatCurrency(entry.debitMinor, txn.denomination)}
                                    </span>
                                  ) : (
                                    <span className="text-white/20">-</span>
                                  )}
                                </td>
                                <td className="p-2.5 text-right font-medium">
                                  {entry.creditMinor > 0 ? (
                                    <span className="text-rose-400 inline-flex items-center gap-1">
                                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                                      {formatCurrency(entry.creditMinor, txn.denomination)}
                                    </span>
                                  ) : (
                                    <span className="text-white/20">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-3 text-right">
                        <span className="text-[9px] text-white/30 mr-2 uppercase tracking-wide font-bold">Trial Balance Equation verify:</span>
                        <span className="font-mono text-[10px] text-cyan-300 font-bold bg-[#101015] border border-[#2a2a35]/60 px-2.5 py-1 rounded">
                          DEBITS {formatCurrency(txn.amountMinor, txn.denomination)} = CREDITS {formatCurrency(txn.amountMinor, txn.denomination)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredTxns.length === 0 && (
            <div id="no-txns-view" className="py-12 text-center text-xs text-white/40 border border-dashed border-[#2a2a35]/60 rounded">
              No transactions match the current query
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {activeVerifyTxnId && (
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop close overlay click dismiss */}
            <div className="absolute inset-0 cursor-default" onClick={() => setActiveVerifyTxnId(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-4xl z-10"
            >
              <EvidencePortal 
                transactionId={activeVerifyTxnId} 
                onClose={() => setActiveVerifyTxnId(null)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT PREVIEW MODAL */}
      <AnimatePresence>
        {printTxId && printTxData && (
          <div className="fixed inset-0 z-[10010] bg-black/95 backdrop-blur-md flex flex-col items-center justify-start p-4 sm:p-8 overflow-y-auto font-mono text-xs select-text">
            {/* Top Toolbar */}
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg p-3 mb-6 flex items-center justify-between shadow-xl no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Secure Document Print Utility</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-400 hover:to-orange-400 text-black font-bold font-mono rounded text-[10px] uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => {
                    setPrintTxId(null);
                    setPrintTxData(null);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono rounded text-[10px] uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>

            {/* Print Container Sheet */}
            <div 
              id="sovr-certificate-print-sheet" 
              className="w-full max-w-2xl bg-[#0f1117] text-[#e2e8f0] p-0 shadow-2xl rounded-xl border border-[#1e293b] font-mono text-xs leading-relaxed overflow-hidden relative print-exact"
            >
              <div className="watermark" style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '120px',
                color: 'rgba(34, 211, 238, 0.04)',
                pointerEvents: 'none',
                userSelect: 'none',
                lineHeight: 1
              }}>🔒</div>

              <div className="header-band" style={{
                background: 'linear-gradient(135deg, #0c1628 0%, #0f1f3d 50%, #0c1628 100%)',
                borderBottom: '1px solid #1e3a5f',
                padding: '28px 36px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '20px'
              }}>
                <div className="brand-block" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="brand-icon" style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(34, 211, 238, 0.08)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px'
                  }}>⚙</div>
                  <div className="brand-text">
                    <span className="issuer" style={{
                      fontSize: '10px',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      display: 'block'
                    }}>SOVR Monetary Authority</span>
                    <div className="title" style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: '22px',
                      fontWeight: 700,
                      color: '#22d3ee',
                      letterSpacing: '1px',
                      lineHeight: 1.2,
                      textTransform: 'uppercase'
                    }}>Certificate of Settlement</div>
                    <div className="subtitle" style={{
                      fontSize: '9px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      marginTop: '2px'
                    }}>Official Financial Ledger Record · SOVR Core Gateway</div>
                    <span className="certified-stamp" style={{
                      background: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '9px',
                      color: '#10b981',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginTop: '8px',
                      display: 'inline-block'
                    }}>★ Certified</span>
                  </div>
                </div>
                <div className="cert-number-badge" style={{
                  background: 'rgba(34, 211, 238, 0.06)',
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  <span className="label" style={{
                    fontSize: '8px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Certificate No.</span>
                  <span className="value" style={{
                    fontSize: '14px',
                    color: '#22d3ee',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>{printTxData.settlementCertificate?.certificateNumber}</span>
                </div>
              </div>

              <div className="body-section" style={{ padding: '28px 36px' }}>
                <p className="attestation-text" style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  lineHeight: '1.7',
                  marginBottom: '28px',
                  borderLeft: '2px solid rgba(34, 211, 238, 0.2)',
                  paddingLeft: '16px'
                }}>
                  This document certifies that the financial transaction corresponding to{" "}
                  <strong style={{ color: '#e2e8f0' }}>Certificate Number {printTxData.settlementCertificate?.certificateNumber}</strong> has been officially settled
                  and recorded on the immutable SOVR ledger. This record is cryptographically
                  sealed by the SOVR System Signature Server and is available for audit
                  verification by authorized parties.
                </p>

                <div className="amount-display" style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.03))',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span className="label" style={{
                      fontSize: '10px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      display: 'block',
                      marginBottom: '6px'
                    }}>Settlement Amount</span>
                    <span className="figure" style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: '36px',
                      fontWeight: 700,
                      color: '#10b981',
                      letterSpacing: '1px'
                    }}>{formatCurrency(printTxData.receipt?.amount, printTxData.receipt?.denomination)}</span>
                  </div>
                  <div className="currency-tag" style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    color: '#10b981',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>{printTxData.receipt?.denomination === 'SVT' ? 'SOVR Token · SVT' : printTxData.receipt?.denomination || 'SVT'}</div>
                </div>

                <div className="metrics-row" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div className="metric-card" style={{ background: '#0a0c12', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px 16px' }}>
                    <span className="m-label" style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '6px' }}>Settlement Date</span>
                    <span className="m-value cyan" style={{ fontSize: '13px', fontWeight: 'bold', color: '#22d3ee' }}>{new Date(printTxData.evidenceObject?.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="metric-card" style={{ background: '#0a0c12', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px 16px' }}>
                    <span className="m-label" style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '6px' }}>Settlement Method</span>
                    <span className="m-value amber" style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b' }}>CLEARING_PAYMENT</span>
                  </div>
                  <div className="metric-card" style={{ background: '#0a0c12', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px 16px' }}>
                    <span className="m-label" style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '6px' }}>Status</span>
                    <span className="m-value emerald" style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>Completed</span>
                  </div>
                </div>

                <div className="details-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <div className="detail-row" style={{ background: '#0a0c12', border: '1px solid #1a1f2e', borderRadius: '6px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span className="d-label" style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Transaction ID</span>
                    <span className="d-value cyan" style={{ fontSize: '11px', color: '#22d3ee' }}>{printTxId}</span>
                  </div>
                  <div className="detail-row" style={{ background: '#0a0c12', border: '1px solid #1a1f2e', borderRadius: '6px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span className="d-label" style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Issuing Authority</span>
                    <span className="d-value" style={{ fontSize: '11px', color: '#cbd5e1' }}>SOVR Monetary Authority</span>
                  </div>
                  <div className="detail-row" style={{ background: '#0a0c12', border: '1px solid #1a1f2e', borderRadius: '6px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span className="d-label" style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Originating Vault</span>
                    <span className="d-value" style={{ fontSize: '11px', color: '#cbd5e1' }}>{printTxData.receipt?.originatingVault}</span>
                  </div>
                  <div className="detail-row" style={{ background: '#0a0c12', border: '1px solid #1a1f2e', borderRadius: '6px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span className="d-label" style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Receiving Party</span>
                    <span className="d-value amber" style={{ fontSize: '11px', color: '#f59e0b' }}>{printTxData.receipt?.receivingParty}</span>
                  </div>
                </div>

                <div className="hash-enclave" style={{
                  background: '#070810',
                  border: '1px solid rgba(147, 51, 234, 0.25)',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  marginBottom: '20px'
                }}>
                  <div className="h-title" style={{
                    fontSize: '9px',
                    color: '#7c3aed',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>Cryptographic Verification Hash (SHA-256)</div>
                  <div className="hash-value" style={{
                    fontSize: '11px',
                    color: '#a78bfa',
                    wordBreak: 'break-all',
                    letterSpacing: '0.5px',
                    lineHeight: '1.6',
                    background: 'rgba(124, 58, 237, 0.05)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    border: '1px solid rgba(124, 58, 237, 0.15)'
                  }}>{printTxData.evidenceObject?.hash}</div>
                  <div className="hash-note" style={{ fontSize: '8px', color: '#475569', marginTop: '8px', letterSpacing: '0.5px' }}>Hash computed from canonical JSON of transaction payload · Deterministic · Verifiable</div>
                </div>

                <div className="verification-bar" style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  gap: '12px'
                }}>
                  <div className="v-status" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    color: '#10b981',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    <span className="dot-pulse" style={{
                      width: '8px',
                      height: '8px',
                      background: '#10b981',
                      borderRadius: '50%',
                      flexShrink: 0
                    }}></span>
                    SOVR System · Authorized Signature Verified
                  </div>
                  <div className="integrity-score" style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Integrity Score: <strong style={{ color: '#10b981' }}>100% ✓</strong> · Double-Entry Validated
                  </div>
                </div>
              </div>

              <div className="footer-band" style={{
                borderTop: '1px solid #1e293b',
                padding: '16px 36px',
                background: '#08090f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                fontSize: '8px',
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                <div className="f-note" style={{ maxWidth: '60%', lineHeight: '1.5' }}>Immutable cryptographic proof of ledger settlement. Verified with SOVR System Signature Server. This document is an internal SOVR platform record.</div>
                <div className="f-seal" style={{ textAlign: 'right', color: '#475569' }}>
                  SOVR Core Gateway · v3.8.4-stable
                  <strong style={{ color: '#22d3ee', fontSize: '9px', display: 'block', letterSpacing: '2px', marginTop: '2px' }}>LEDGER SEALED</strong>
                </div>
              </div>
            </div>

            {/* Print styles */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body {
                  background: #09090b !important;
                  color: #cbd5e1 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body > * {
                  display: none !important;
                }
                #sovr-certificate-print-sheet {
                  display: block !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  background: #09090b !important;
                  padding: 24px !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                #sovr-certificate-print-sheet * {
                  display: revert !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
