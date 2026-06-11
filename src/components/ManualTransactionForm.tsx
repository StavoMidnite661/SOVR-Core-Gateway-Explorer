import React, { useState } from 'react';
import { LedgerAccount, Rail, Denomination, ConnectedApp } from '../types';
import { PlusCircle, Wallet, ArrowDownUp, Info, AlertTriangle } from 'lucide-react';

interface ManualTransactionFormProps {
  accounts: LedgerAccount[];
  apps: ConnectedApp[];
  onPostTransaction: (params: {
    debitId: string;
    creditId: string;
    amountMinor: number;
    denomination: Denomination;
    rail: Rail;
    memo: string;
    originApp: string;
  }) => void;
}

export default function ManualTransactionForm({ accounts, apps, onPostTransaction }: ManualTransactionFormProps) {
  const [debitId, setDebitId] = useState(accounts[0]?.id || '');
  const [creditId, setCreditId] = useState(accounts[1]?.id || '');
  const [rail, setRail] = useState<Rail>('internal_');
  const [denom, setDenom] = useState<Denomination>('USD');
  const [amountMajor, setAmountMajor] = useState<string>('150.00');
  const [memo, setMemo] = useState('');
  const [originApp, setOriginApp] = useState(apps[0]?.slug || 'basalt-console');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (debitId === creditId) {
      setErrorMsg('Debit and Credit matching accounts must be distinct to complete double-entry journal balance.');
      return;
    }

    const parsedVal = parseFloat(amountMajor);
    if (isNaN(parsedVal) || parsedVal <= 0) {
      setErrorMsg('Transaction value must be a positive decimal number.');
      return;
    }

    if (!memo.trim()) {
      setErrorMsg('Please specify a transaction memo describing the journal entry.');
      return;
    }

    // Convert to minor units (e.g., multiply by 100)
    const amountMinor = Math.round(parsedVal * 100);

    onPostTransaction({
      debitId,
      creditId,
      amountMinor,
      denomination: denom,
      rail,
      memo: memo.trim(),
      originApp
    });

    setSuccessMsg(`Successfully posted ${amountMajor} ${denom} transaction with balanced audit proof.`);
    setMemo('');
    
    // Auto-clear message
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div id="manual-post-form-card" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 backdrop-blur-md">
      <div className="mb-4">
        <h2 id="manual-post-form-title" className="text-xs font-black uppercase tracking-widest text-white/90 font-display flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          Post Balanced Journal Entry
        </h2>
        <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider mt-1">Submit immediate manual debit/credit audit postings to the active core ledger</p>
      </div>

      <form id="manual-post-transaction-element" onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div id="submit-error-banner" className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded text-xs animate-shake">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div id="submit-success-banner" className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded text-xs">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Debit Entry */}
          <div>
            <label id="debit-account-label" htmlFor="debit-account-select" className="block text-[9px] uppercase font-mono tracking-widest text-[#ffffff]/40 font-bold mb-1">
              Debit Account (Funds From)
            </label>
            <select
              id="debit-account-select"
              className="w-full px-3 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors font-mono cursor-pointer"
              value={debitId}
              onChange={(e) => setDebitId(e.target.value)}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} — {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Credit Entry */}
          <div>
            <label id="credit-account-label" htmlFor="credit-account-select" className="block text-[9px] uppercase font-mono tracking-widest text-[#ffffff]/40 font-bold mb-1">
              Credit Account (Funds To)
            </label>
            <select
              id="credit-account-select"
              className="w-full px-3 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors font-mono cursor-pointer"
              value={creditId}
              onChange={(e) => setCreditId(e.target.value)}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} — {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Amount  */}
          <div>
            <label id="amount-label" htmlFor="amount-input" className="block text-[9px] uppercase font-mono tracking-widest text-[#ffffff]/40 font-bold mb-1">
              Value Amount
            </label>
            <input
              id="amount-input"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors font-mono"
              placeholder="0.00"
              value={amountMajor}
              onChange={(e) => setAmountMajor(e.target.value)}
              required
            />
          </div>

          {/* Currency */}
          <div>
            <label id="denom-label" htmlFor="denom-select" className="block text-[9px] uppercase font-mono tracking-widest text-[#ffffff]/40 font-bold mb-1">
              Currency
            </label>
            <select
              id="denom-select"
              className="w-full px-3 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors cursor-pointer"
              value={denom}
              onChange={(e) => setDenom(e.target.value as Denomination)}
            >
              <option value="USD">USD ($)</option>
              <option value="SVT">SVT (SOVR)</option>
              <option value="USDC">USDC (Coin)</option>
            </select>
          </div>

          {/* Rail */}
          <div>
            <label id="rail-label" htmlFor="rail-select" className="block text-[9px] uppercase font-mono tracking-widest text-[#ffffff]/40 font-bold mb-1">
              Payment Rail
            </label>
            <select
              id="rail-select"
              className="w-full px-3 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors cursor-pointer"
              value={rail}
              onChange={(e) => setRail(e.target.value as Rail)}
            >
              <option value="internal_">Internal</option>
              <option value="stripe">Stripe</option>
              <option value="ach">ACH Transfer</option>
              <option value="fednow">FedNow Instant</option>
              <option value="onchain">On-chain</option>
              <option value="svt">SVT Minting</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Originator App */}
          <div className="sm:col-span-1">
            <label id="origin-app-label" htmlFor="origin-app-select" className="block text-[9px] uppercase font-mono tracking-widest text-[#ffffff]/40 font-bold mb-1">
              Originating Node/App
            </label>
            <select
              id="origin-app-select"
              className="w-full px-3 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors cursor-pointer"
              value={originApp}
              onChange={(e) => setOriginApp(e.target.value)}
            >
              {apps.map(app => (
                <option key={app.id} value={app.slug}>
                  {app.displayName} ({app.version})
                </option>
              ))}
            </select>
          </div>

          {/* Memo Column */}
          <div className="sm:col-span-2">
            <label id="memo-label" htmlFor="memo-input" className="block text-[9px] uppercase font-mono tracking-widest text-[#ffffff]/40 font-bold mb-1">
              Journal Entry Description / Memo
            </label>
            <input
              id="memo-input"
              type="text"
              placeholder="e.g. Settle operational charges with FRB and Stripe"
              className="w-full px-3 py-2 text-xs bg-[#050507] border border-[#2a2a35] rounded text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[#2a2a35]/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-[#ffffff]/40 uppercase font-mono">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Posting automatically updates accounts and builds SHA-256 seal proofs.</span>
          </div>
          
          <button
            id="submit-journal-entry-button"
            type="submit"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 rounded flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-950" />
            Balance & Commit Entry
          </button>
        </div>
      </form>
    </div>
  );
}
