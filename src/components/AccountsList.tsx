import React, { useState } from 'react';
import { LedgerAccount, AccountKind } from '../types';
import { formatCurrency } from '../data/seed';
import { Search, SlidersHorizontal, Shield, Landmark, Scale, Coins, Wallet } from 'lucide-react';

interface AccountsListProps {
  accounts: LedgerAccount[];
}

export default function AccountsList({ accounts }: AccountsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKind, setSelectedKind] = useState<AccountKind | 'all'>('all');

  const filteredAccounts = (accounts || []).filter(acc => {
    if (!acc) return false;
    const nameStr = acc.name || '';
    const codeStr = acc.code || '';
    const searchStr = searchTerm || '';
    const matchesSearch = 
      nameStr.toLowerCase().includes(searchStr.toLowerCase()) ||
      codeStr.toLowerCase().includes(searchStr.toLowerCase());
    
    const matchesKind = selectedKind === 'all' ? true : acc.kind === selectedKind;
    
    return matchesSearch && matchesKind;
  });

  const getKindColor = (kind: AccountKind) => {
    switch (kind) {
      case 'asset': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'escrow': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'liability': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'revenue': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'equity': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getKindIcon = (kind: AccountKind) => {
    switch (kind) {
      case 'asset': return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 'escrow': return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'liability': return <Landmark className="w-4 h-4 text-amber-400" />;
      case 'revenue': return <Coins className="w-4 h-4 text-violet-400" />;
      case 'equity': return <Scale className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div id="accounts-card-container" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 id="accounts-panel-title" className="text-xs font-black uppercase tracking-widest text-white/90 font-display flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400 shadow-[0_0_8px_#10b981]" />
            Double-Entry Ledger Registry
          </h2>
          <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider mt-1">Real-time balances with automatic algebraic proof verification</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
          <input
            id="account-search-input"
            type="text"
            placeholder="Search code or name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-[#e0e0e0] placeholder-white/30 focus:outline-none focus:border-cyan-500/60 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Badges */}
      <div id="accounts-filters-strip" className="flex flex-wrap gap-1.5 mb-4 border-b border-[#2a2a35]/60 pb-3">
        <button
          id="filter-btn-all"
          onClick={() => setSelectedKind('all')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all uppercase tracking-wider ${
            selectedKind === 'all'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-[#050507] text-white/40 hover:text-white border border-[#2a2a35]'
          }`}
        >
          All Accounts
        </button>
        {(['asset', 'escrow', 'liability', 'revenue', 'equity'] as AccountKind[]).map((kind) => (
          <button
            key={kind}
            id={`filter-btn-${kind}`}
            onClick={() => setSelectedKind(kind)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm capitalize transition-all border uppercase tracking-wider ${
              selectedKind === kind
                ? 'bg-[#1a1a24] text-white border-[#2a2a35]'
                : 'bg-[#050507] text-white/40 hover:text-white border-[#2a2a35]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {getKindIcon(kind)}
              {kind}
            </span>
          </button>
        ))}
      </div>

      {/* Accounts List Grid */}
      <div id="accounts-grid-viewport" className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredAccounts.map((account) => (
          <div
            key={account.id}
            id={`account-card-${account.id}`}
            className="group relative bg-[#101015] border border-white/5 rounded p-3.5 hover:border-white/15 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] text-[#ffffff]/40 font-bold tracking-wider bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                    {account.code}
                  </span>
                  <span className={`text-[9px] uppercase font-mono tracking-wider border px-1.5 py-0.5 rounded-full ${getKindColor(account.kind)}`}>
                    {account.kind}
                  </span>
                </div>
                <h3 id={`account-name-${account.id}`} className="text-xs font-medium text-white/80 truncate group-hover:text-emerald-400 transition-colors">
                  {account.name}
                </h3>
              </div>
              <div className="text-right">
                <span className={`text-sm font-semibold tracking-tight font-mono ${account.balanceMinor >= 0 ? 'text-[#ffffff]' : 'text-rose-400'}`}>
                  {formatCurrency(account.balanceMinor, account.denomination)}
                </span>
                <div className="text-[9px] text-white/30 font-mono tracking-wider mt-0.5">
                  DENOM: {account.denomination}
                </div>
              </div>
            </div>

            {/* Accent microline indicator */}
            <div className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-[#2a2a35] group-hover:bg-cyan-500/50 transition-colors duration-200 rounded-b" />
          </div>
        ))}

        {filteredAccounts.length === 0 && (
          <div id="no-accounts-screen" className="col-span-2 py-8 text-center text-xs text-white/40 border border-dashed border-[#2a2a35] rounded">
            No accounts match the current query
          </div>
        )}
      </div>
    </div>
  );
}
