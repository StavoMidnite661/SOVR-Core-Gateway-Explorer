import React, { useState, useEffect, useRef } from 'react';
import { 
  Landmark, Wallet, Shield, Scale, Coins, Search, ArrowRight, ArrowDown, 
  Cpu, Terminal, Activity, FileText, CheckCircle2, AlertCircle, Play, 
  HelpCircle, ChevronRight, ChevronDown, Lock, Unlock, RefreshCw, 
  Download, Eye, BarChart3, LineChart, PieChart, Layers, Settings,
  Workflow, Database, ArrowUpRight, TrendingUp, Sliders, Server, Info,
  Check, PlayCircle, Network, FileArchive, FileSpreadsheet, LockKeyhole
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LedgerAccount, Transaction, Denomination, Rail, ConnectedApp } from '../types';
import { formatCurrency } from '../data/seed';
import { AreaChart, Area, BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TreasuryCommandCenterProps {
  accounts: LedgerAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<LedgerAccount[]>>;
  transactions: Transaction[];
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

// Internal logs structure for Capital Flow Timeline
interface FlowLog {
  time: string;
  stage: string;
  message: string;
  status: 'pending' | 'success' | 'info' | 'warn';
}

export default function TreasuryCommandCenter({ 
  accounts, 
  setAccounts, 
  transactions, 
  apps, 
  onPostTransaction 
}: TreasuryCommandCenterProps) {
  
  // Workspace tabs configuration
  const workspaces = [
    { id: 'overview', name: 'Capital Overview', icon: Landmark, desc: 'Consolidated network balance sheet matrix' },
    { id: 'registry', name: 'Chart of Accounts', icon: Scale, desc: 'Interactive ledger account inspector' },
    { id: 'journal', name: 'Journal Posting', icon: FileSpreadsheet, desc: 'Double-entry balancing posting wizard' },
    { id: 'routing', name: 'Capital Routing', icon: Workflow, desc: 'Live capital flow graph & source-dest mapping' },
    { id: 'reserve', name: 'Reserve Management', icon: LockKeyhole, desc: 'Liquidity ratios & capital lock vaults' },
    { id: 'analytics', name: 'Treasury Analytics', icon: BarChart3, desc: 'System velocity & reserve utilization charts' }
  ];

  const [activeWorkspace, setActiveWorkspace] = useState('overview');

  // Interactive accounts state & selection
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccount | null>(null);
  const [accountHistoryTerm, setAccountHistoryTerm] = useState('30-Day Nominal');
  
  // Search & Filter state for Accounts Registry
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryFilterKind, setRegistryFilterKind] = useState<string>('all');

  // Windows-like Treasury Explorer structural state
  const [explorerExpanded, setExplorerExpanded] = useState<Record<string, boolean>>({
    root: true,
    assets: true,
    liabilities: true,
    equity: true
  });
  const [explorerSelectedNode, setExplorerSelectedNode] = useState<string>('cash');

  // Reserve Management local state list for locks
  const [lockedReserves, setLockedReserves] = useState([
    { id: 'res_01', accountCode: '1010-ZRH-VAULT', purpose: 'Regulatory Margin (EMEA)', amount: 5000000, date: '2026-05-12' },
    { id: 'res_02', accountCode: '1020-NYC-RESERVE', purpose: 'Operational Liquidity Collar', amount: 2500000, date: '2026-06-01' }
  ]);
  const [lockAccountSelect, setLockAccountSelect] = useState(accounts[0]?.code || '1010-ZRH-VAULT');
  const [lockAmount, setLockAmount] = useState('1000000');
  const [lockPurpose, setLockPurpose] = useState('Federal Bridge Collateral');

  // Policy Settings (Administrator Configurable)
  const [policies, setPolicies] = useState({
    reserveRatio: 20, // % required in liquid assets
    approvalThreshold: 1000000, // Dual auth above this SVT
    evidenceRequirement: 'Full Cryptographic Provenance',
    settlementPolicy: 'Real-time Net Settlement (RTNS)',
    routingPolicy: 'Lowest-Latency Node Routing',
    creditLimitMax: 15000000,
    dailyVolTrigger: 50000000
  });

  // Journal Posting wizard state
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [journalTxType, setJournalTxType] = useState('Vendor Payment');
  
  // Step 2 Form parameters (Changes according to transaction type)
  const [vendorName, setVendorName] = useState('Basalt Infrastructure');
  const [fundingAccount, setFundingAccount] = useState(accounts.find(a => a.kind === 'asset')?.id || accounts[0]?.id || '');
  const [destinationAccount, setDestinationAccount] = useState(accounts.find(a => a.kind === 'escrow' || a.kind === 'liability')?.id || accounts[1]?.id || '');
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [approvalPolicy, setApprovalPolicy] = useState('Dual Sign');
  const [reasonMemo, setReasonMemo] = useState('Q2 Node Infrastructure Settlement');
  const [selectedRail, setSelectedRail] = useState<Rail>('fednow');
  const [selectedDenom, setSelectedDenom] = useState<Denomination>('SVT');
  const [txnAmountMajor, setTxnAmountMajor] = useState('750000');
  const [preCommitChecklist, setPreCommitChecklist] = useState({
    debitCreditBalanced: true,
    accountsActive: true,
    reservesAdequate: true,
    approvalsSecured: false,
    evidenceCriteriaMet: true,
    railOnline: true,
    hashMatching: true
  });

  // Multistep commit sequence states
  const [commitStatus, setCommitStatus] = useState<'idle' | 'balancing' | 'verifying' | 'committing' | 'receipt' | 'evidence' | 'queueing' | 'completed'>('idle');
  const [generatedReceiptNo, setGeneratedReceiptNo] = useState<string>('');

  // Flow Graph State
  const [flowActive, setFlowActive] = useState(false);
  const [activeFlowNode, setActiveFlowNode] = useState<string | null>(null);
  const [flowLogs, setFlowLogs] = useState<FlowLog[]>([]);
  const [flowSpeed, setFlowSpeed] = useState<number>(1200);

  // Auto-fill account parameters for Wizard based on selected type
  useEffect(() => {
    if (journalTxType === 'Vendor Payment') {
      const assetAcc = accounts.find(a => a.kind === 'asset')?.id || accounts[0]?.id || '';
      const liabilityAcc = accounts.find(a => a.code.includes('ESCROW') || a.kind === 'escrow')?.id || accounts[1]?.id || '';
      setFundingAccount(assetAcc);
      setDestinationAccount(liabilityAcc);
      setReasonMemo('Operational Node Cleared Settlement');
      setApprovalPolicy('Dual Sign');
      setEvidenceRequired(true);
    } else if (journalTxType === 'Reserve Allocation') {
      const mainAsset = accounts.find(a => a.code === '1010')?.id || accounts.find(a => a.kind === 'asset')?.id || '';
      const reserveAsset = accounts.find(a => a.code === '1020')?.id || accounts[1]?.id || '';
      setFundingAccount(mainAsset);
      setDestinationAccount(reserveAsset);
      setReasonMemo('System Margin Allocation');
      setApprovalPolicy('Consensus Quorum');
      setEvidenceRequired(true);
    } else if (journalTxType === 'Escrow') {
      const buyerAcc = accounts.find(a => a.kind === 'asset')?.id || accounts[0]?.id || '';
      const escrowAcc = accounts.find(a => a.kind === 'escrow')?.id || accounts.find(a => a.code.includes('ESCROW'))?.id || '';
      setFundingAccount(buyerAcc);
      setDestinationAccount(escrowAcc);
      setReasonMemo('Arbitrage Liquidity Lock leg');
      setApprovalPolicy('Single Admin');
      setEvidenceRequired(true);
    } else {
      setFundingAccount(accounts[0]?.id || '');
      setDestinationAccount(accounts[1]?.id || accounts[0]?.id || '');
      setReasonMemo('Strategic Treasury Rebalancing Entry');
    }
  }, [journalTxType]);

  // Dynamically calculate pre-flight status on major parameters
  useEffect(() => {
    const parsedAmount = parseFloat(txnAmountMajor) || 0;
    const debitAccountObj = accounts.find(a => a.id === fundingAccount);
    const balanceAvailable = debitAccountObj ? debitAccountObj.balanceMinor / 100 : 0;

    const balanced = fundingAccount !== destinationAccount && parsedAmount > 0;
    const reservesOK = balanceAvailable >= parsedAmount;
    const approvalOK = parsedAmount < policies.approvalThreshold ? true : approvalPolicy !== 'Single Admin';

    setPreCommitChecklist({
      debitCreditBalanced: balanced,
      accountsActive: fundingAccount !== '' && destinationAccount !== '',
      reservesAdequate: reservesOK,
      approvalsSecured: approvalOK,
      evidenceCriteriaMet: evidenceRequired,
      railOnline: true,
      hashMatching: true
    });
  }, [fundingAccount, destinationAccount, txnAmountMajor, approvalPolicy, evidenceRequired, accounts, policies.approvalThreshold]);

  // Aggregate numbers from active accounts to build richer Capital Overview Workspace
  const totalAssetsUSD = accounts
    .filter(a => a.kind === 'asset' || a.kind === 'escrow')
    .reduce((sum, a) => sum + (a.denomination === 'USD' ? a.balanceMinor : a.balanceMinor * 1.0), 0) / 100;

  // Split calculations
  const availableCapital = totalAssetsUSD * 0.61;
  const reservedCapital = totalAssetsUSD * 0.18;
  const escrowCapital = totalAssetsUSD * 0.032;
  const outstandingCredit = totalAssetsUSD * 0.11;
  const settlementQueue = totalAssetsUSD * 0.005;
  const lockedEvidence = totalAssetsUSD * 0.001;

  // Reconcile Simulator
  const [reconciling, setReconciling] = useState(false);
  const [reconciliationReport, setReconciliationReport] = useState<string | null>(null);

  const runReconciliation = () => {
    setReconciling(true);
    setReconciliationReport(null);
    setTimeout(() => {
      setReconciling(false);
      setReconciliationReport(
        `RECONCILIATION SUCCESSFUL: Core double-entry balances verified against Merkle hashes at block height #742214. Parity variance = 0.00 SVT.`
      );
    }, 2000);
  };

  // Add Lock function
  const handleAddLock = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(lockAmount) || 0;
    if (amt <= 0) return;
    const newLock = {
      id: 'res_' + Date.now(),
      accountCode: lockAccountSelect,
      purpose: lockPurpose,
      amount: amt,
      date: new Date().toISOString().split('T')[0]
    };
    setLockedReserves(prev => [newLock, ...prev]);
    // Deduct dynamically (simulation mode only) or toast
    setLockAmount('');
    setLockPurpose('');
    triggerToast(`Capital lock successful: ${amt.toLocaleString()} SVT secured in designated vault.`);
  };

  // Remove Lock function
  const handleRemoveLock = (id: string) => {
    const target = lockedReserves.find(r => r.id === id);
    setLockedReserves(prev => prev.filter(r => r.id !== id));
    if (target) {
      triggerToast(`Capital unlocked: ${target.amount.toLocaleString()} SVT released back to operational float.`);
    }
  };

  // Flow execution animator
  const runCapitalFlow = async () => {
    if (flowActive) return;
    setFlowActive(true);
    setFlowLogs([]);

    const steps = [
      { id: 'incoming', label: 'STRIPE INCOMING', msg: 'Incoming credit webhook received via Stripe edge router.', status: 'info' as const },
      { id: 'posting', label: 'JOURNAL POSTED', msg: 'Core transaction parsed; credit leg posted to account registry.', status: 'info' as const },
      { id: 'matching', label: 'ALGEBRAIC BALANCED', msg: 'Debitleg verified against Stripe ledger; double-entry invariants check passed.', status: 'success' as const },
      { id: 'clearing', label: 'CLEARING STAGE', msg: 'Funds dispatched onto FedNow instant bridge; routing policy committed.', status: 'info' as const },
      { id: 'evidence', label: 'EVIDENCE SEALED', msg: 'Molded formal receipt & certificates with Ed25519 payload headers.', status: 'success' as const },
      { id: 'finalized', label: 'SETTLED', msg: 'Chain Merkle proof verified; ledger entries recorded permanently.', status: 'success' as const }
    ];

    for (let i = 0; i < steps.length; i++) {
      setActiveFlowNode(steps[i].id);
      const timestamp = new Date().toLocaleTimeString();
      setFlowLogs(prev => [...prev, {
        time: timestamp,
        stage: steps[i].label,
        message: steps[i].msg,
        status: steps[i].status
      }]);
      await new Promise(resolve => setTimeout(resolve, flowSpeed));
    }

    setFlowActive(false);
    setActiveFlowNode(null);
  };

  // Toast notifier helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Interactive transaction wizard submission
  const executeWizardPost = () => {
    if (commitStatus !== 'idle') return;
    
    const parsedAmount = parseFloat(txnAmountMajor) || 0;
    if (parsedAmount <= 0) {
      triggerToast("Error: Transaction amount must be positive.");
      return;
    }

    // Begin simulated multi-step commit sequence
    setCommitStatus('balancing');
    
    setTimeout(() => {
      setCommitStatus('verifying');
      setTimeout(() => {
        setCommitStatus('committing');
        setTimeout(() => {
          setCommitStatus('receipt');
          // Generate simulated receipt number
          const rNo = `RCP-${Math.floor(100000 + Math.random() * 900000)}`;
          setGeneratedReceiptNo(rNo);
          setTimeout(() => {
            setCommitStatus('evidence');
            setTimeout(() => {
              setCommitStatus('queueing');
              setTimeout(() => {
                setCommitStatus('completed');
                
                // Post actual transaction to global store
                const amountMinor = Math.round(parsedAmount * 100);
                onPostTransaction({
                  debitId: fundingAccount,
                  creditId: destinationAccount,
                  amountMinor,
                  denomination: selectedDenom,
                  rail: selectedRail,
                  memo: `${journalTxType}: ${reasonMemo}`,
                  originApp: 'basalt-console'
                });

                triggerToast(`Journal successfully committed: ${parsedAmount.toLocaleString()} ${selectedDenom} posted.`);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // Reset Wizard
  const resetWizard = () => {
    setWizardStep(1);
    setCommitStatus('idle');
    setTxnAmountMajor('750000');
    setReasonMemo('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs text-white/90">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[20000] bg-cyan-950 border border-cyan-400 text-cyan-200 px-4 py-3 rounded shadow-lg flex items-center gap-2 font-mono text-xs backdrop-blur-md"
          >
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR: Capital Command Workspaces Selector (3 columns) */}
      <div className="lg:col-span-3 bg-[#08080c] border border-[#2a2a35] rounded-lg p-4 space-y-4 shadow-xl">
        <div className="border-b border-[#2a2a35]/40 pb-3">
          <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold block">SOVR CAP PROTOCOL</span>
          <h2 className="text-xs font-black uppercase text-white tracking-widest mt-0.5 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-500 shadow-[0_0_8px_#f59e0b]" />
            Capital Command
          </h2>
          <p className="text-[9px] text-white/40 mt-1 uppercase">Treasury Operating System Workspace</p>
        </div>

        {/* WORKSPACE NAVIGATION BUTTONS */}
        <div className="space-y-1.5">
          {workspaces.map((ws) => {
            const IconComponent = ws.icon;
            const isSelected = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => {
                  setActiveWorkspace(ws.id);
                  if (ws.id !== 'registry') setSelectedAccount(null);
                }}
                className={`w-full text-left p-3 rounded border transition-all flex items-start gap-3 group relative cursor-pointer ${
                  isSelected 
                    ? 'bg-[#12121a] border-cyan-500/40 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.05)]' 
                    : 'bg-black/30 border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`p-1.5 rounded shrink-0 transition-colors ${
                  isSelected ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900/60 text-white/40 group-hover:text-white/80'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold block text-[11px] uppercase tracking-wide">{ws.name}</span>
                  <span className="text-[8.5px] text-white/30 block mt-0.5 truncate leading-tight group-hover:text-white/50">{ws.desc}</span>
                </div>
                {isSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
                )}
              </button>
            );
          })}
        </div>

        {/* POLICY SETTINGS WIDGET */}
        <div className="bg-[#0c0c14] border border-[#2a2a35]/60 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 border-b border-[#2a2a35]/30 pb-1.5">
            <Settings className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[9px] text-white/40 font-black uppercase tracking-wider">Treasury Policies</span>
          </div>

          <div className="space-y-2 font-mono text-[9px] text-white/70">
            <div className="flex justify-between">
              <span className="text-white/40">Liquid Reserve ratio:</span>
              <span className="text-cyan-400 font-bold">{policies.reserveRatio}%</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded">
              <div className="bg-cyan-500 h-full rounded" style={{ width: `${policies.reserveRatio}%` }} />
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-white/40">Approval threshold:</span>
              <span className="text-amber-500 font-bold">{(policies.approvalThreshold / 1000000).toFixed(1)}M SVT</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/40">Evidence lock policy:</span>
              <span className="text-white font-extrabold text-[8px] truncate max-w-[120px]">{policies.evidenceRequirement}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/40">Settlement mode:</span>
              <span className="text-emerald-400 font-bold text-[8px]">{policies.settlementPolicy}</span>
            </div>
          </div>
        </div>

      </div>

      {/* MAIN COMMAND SCREEN (9 columns) */}
      <div className="lg:col-span-9 bg-[#08080c] border border-[#2a2a35] rounded-lg p-6 shadow-xl min-h-[640px] flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          
          {/* ==================== WORKSPACE 1: CAPITAL OVERVIEW ==================== */}
          {activeWorkspace === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="border-b border-[#2a2a35]/40 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Capital Overview Panel</h3>
                  <span className="text-[9px] text-white/40 block mt-0.5">CONSOLIDATED MULTI-RESERVE LIQUIDITY MATRIX</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">REAL-TIME FLOAT OK</span>
                </div>
              </div>

              {/* Grand Capital Value Hero */}
              <div className="bg-[#0d0d14]/80 border border-[#2a2a35] rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-1">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest block font-bold">TOTAL NETWORK CAPITAL IN STORAGE</span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-black text-white tracking-tight">{formatCurrency(totalAssetsUSD * 100, 'USD')}</span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">+14.2% today</span>
                  </div>
                  <p className="text-[9px] text-white/40">Combined balances across all active regional clearing nodes</p>
                </div>

                {/* System Status Indicators inside Hero */}
                <div className="grid grid-cols-2 gap-4 font-mono text-[9px] bg-black/40 border border-white/5 p-3 rounded w-full md:w-auto">
                  <div>
                    <span className="text-white/30 block">Active Reserves:</span>
                    <span className="text-cyan-400 font-black block mt-0.5">{formatCurrency(reservedCapital * 100, 'USD')}</span>
                  </div>
                  <div>
                    <span className="text-white/30 block">Outstanding Credit:</span>
                    <span className="text-orange-400 font-black block mt-0.5">{formatCurrency(outstandingCredit * 100, 'USD')}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Capital Allocation Matrix Visual (Sankey-like progress bar) */}
              <div className="bg-[#050508] border border-white/5 rounded-lg p-4 space-y-3">
                <span className="text-[10px] text-white/50 uppercase font-black block tracking-wider">Dynamic Allocation Distribution</span>
                
                {/* Layered Multi-segment progress bar */}
                <div className="w-full bg-white/5 h-3.5 rounded-full overflow-hidden flex">
                  <div className="bg-[#02c39a] h-full" style={{ width: '61%' }} title="Available Available Capital" />
                  <div className="bg-cyan-500 h-full" style={{ width: '18%' }} title="Reserved Operational Margins" />
                  <div className="bg-purple-500 h-full" style={{ width: '11%' }} title="Outstanding Private Credit" />
                  <div className="bg-amber-400 h-full" style={{ width: '3.2%' }} title="Escrow Pool Assets" />
                  <div className="bg-rose-400 h-full" style={{ width: '6.8%' }} title="Pending & Evidence Locks" />
                </div>

                {/* Legend detailing the allocation splits */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                  <div className="p-2 bg-[#0d0d12] border border-white/5 rounded">
                    <span className="flex items-center gap-1.5 text-white/50 text-[9px]">
                      <span className="w-2 h-2 bg-[#02c39a] rounded-sm" /> Available
                    </span>
                    <span className="text-[11px] text-white font-extrabold block mt-1">{formatCurrency(availableCapital * 100, 'USD')}</span>
                    <span className="text-[8px] text-white/30">61.0% Float</span>
                  </div>

                  <div className="p-2 bg-[#0d0d12] border border-white/5 rounded">
                    <span className="flex items-center gap-1.5 text-white/50 text-[9px]">
                      <span className="w-2 h-2 bg-cyan-500 rounded-sm" /> Reserved
                    </span>
                    <span className="text-[11px] text-cyan-400 font-extrabold block mt-1">{formatCurrency(reservedCapital * 100, 'USD')}</span>
                    <span className="text-[8px] text-white/30">18.0% Locked</span>
                  </div>

                  <div className="p-2 bg-[#0d0d12] border border-white/5 rounded">
                    <span className="flex items-center gap-1.5 text-white/50 text-[9px]">
                      <span className="w-2 h-2 bg-purple-500 rounded-sm" /> Credit
                    </span>
                    <span className="text-[11px] text-purple-400 font-extrabold block mt-1">{formatCurrency(outstandingCredit * 100, 'USD')}</span>
                    <span className="text-[8px] text-white/30">11.0% Node Float</span>
                  </div>

                  <div className="p-2 bg-[#0d0d12] border border-white/5 rounded">
                    <span className="flex items-center gap-1.5 text-white/50 text-[9px]">
                      <span className="w-2 h-2 bg-amber-400 rounded-sm" /> Escrow
                    </span>
                    <span className="text-[11px] text-amber-400 font-extrabold block mt-1">{formatCurrency(escrowCapital * 100, 'USD')}</span>
                    <span className="text-[8px] text-white/30">3.2% Custody</span>
                  </div>

                  <div className="p-2 bg-[#0d0d12] border border-white/5 rounded">
                    <span className="flex items-center gap-1.5 text-white/50 text-[9px]">
                      <span className="w-2 h-2 bg-rose-400 rounded-sm" /> Queue
                    </span>
                    <span className="text-[11px] text-rose-400 font-extrabold block mt-1">{formatCurrency(settlementQueue * 100, 'USD')}</span>
                    <span className="text-[8px] text-white/30">0.5% In-transit</span>
                  </div>

                  <div className="p-2 bg-[#0d0d12] border border-white/5 rounded">
                    <span className="flex items-center gap-1.5 text-white/50 text-[9px]">
                      <span className="w-2 h-2 bg-rose-600 rounded-sm" /> Evidence
                    </span>
                    <span className="text-[11px] text-white/80 font-extrabold block mt-1">{formatCurrency(lockedEvidence * 100, 'USD')}</span>
                    <span className="text-[8px] text-white/30">0.1% Sealed</span>
                  </div>
                </div>
              </div>

              {/* Windows Explorer Style Treasury Explorer Panel */}
              <div className="bg-[#050508] border border-white/5 rounded-lg p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] text-white/50 uppercase font-black block tracking-wider">Windows-Style Treasury Explorer</span>
                  <span className="text-[8px] text-white/30">NAVIGATE PHYSICAL ASSETS & FLOAT RESERVES</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Tree Structure on the left (5 columns) */}
                  <div className="md:col-span-5 bg-black/40 border border-white/5 rounded p-3 font-mono space-y-1.5 overflow-y-auto max-h-[220px]">
                    
                    {/* ROOT LEVEL */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-white/80 font-bold hover:text-white cursor-pointer" onClick={() => setExplorerExpanded(prev => ({ ...prev, root: !prev.root }))}>
                        {explorerExpanded.root ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        <span>SOVR Treasury Core</span>
                      </div>

                      {explorerExpanded.root && (
                        <div className="pl-4 space-y-1 border-l border-[#2a2a35] ml-1.5">
                          {/* ASSETS NODE */}
                          <div>
                            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer" onClick={() => setExplorerExpanded(prev => ({ ...prev, assets: !prev.assets }))}>
                              {explorerExpanded.assets ? <ChevronDown className="w-3 h-3 text-emerald-400" /> : <ChevronRight className="w-3 h-3 text-white/30" />}
                              <FolderIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Assets</span>
                            </div>
                            {explorerExpanded.assets && (
                              <div className="pl-4 space-y-1 border-l border-emerald-500/25 ml-1.5">
                                <div className={`flex items-center gap-1.5 p-1 rounded cursor-pointer ${explorerSelectedNode === 'cash' ? 'bg-emerald-500/10 text-emerald-300' : 'text-white/60 hover:text-white'}`} onClick={() => setExplorerSelectedNode('cash')}>
                                  <FileText className="w-3 h-3 shrink-0" />
                                  <span>Cash & Vault Reserves</span>
                                </div>
                                <div className={`flex items-center gap-1.5 p-1 rounded cursor-pointer ${explorerSelectedNode === 'tokens' ? 'bg-emerald-500/10 text-emerald-300' : 'text-white/60 hover:text-white'}`} onClick={() => setExplorerSelectedNode('tokens')}>
                                  <FileText className="w-3 h-3 shrink-0" />
                                  <span>Treasury Tokens (SVT)</span>
                                </div>
                                <div className={`flex items-center gap-1.5 p-1 rounded cursor-pointer ${explorerSelectedNode === 'escrow_child' ? 'bg-emerald-500/10 text-emerald-300' : 'text-white/60 hover:text-white'}`} onClick={() => setExplorerSelectedNode('escrow_child')}>
                                  <FileText className="w-3 h-3 shrink-0" />
                                  <span>Escrow Custody Float</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* LIABILITIES NODE */}
                          <div>
                            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer" onClick={() => setExplorerExpanded(prev => ({ ...prev, liabilities: !prev.liabilities }))}>
                              {explorerExpanded.liabilities ? <ChevronDown className="w-3 h-3 text-rose-400" /> : <ChevronRight className="w-3 h-3 text-white/30" />}
                              <FolderIcon className="w-3.5 h-3.5 text-rose-400" />
                              <span className="text-rose-400 font-semibold">Liabilities</span>
                            </div>
                            {explorerExpanded.liabilities && (
                              <div className="pl-4 space-y-1 border-l border-rose-500/25 ml-1.5">
                                <div className={`flex items-center gap-1.5 p-1 rounded cursor-pointer ${explorerSelectedNode === 'float' ? 'bg-rose-500/10 text-rose-300' : 'text-white/60 hover:text-white'}`} onClick={() => setExplorerSelectedNode('float')}>
                                  <FileText className="w-3 h-3 shrink-0" />
                                  <span>Customer Float Float</span>
                                </div>
                                <div className={`flex items-center gap-1.5 p-1 rounded cursor-pointer ${explorerSelectedNode === 'deferred' ? 'bg-rose-500/10 text-rose-300' : 'text-white/60 hover:text-white'}`} onClick={() => setExplorerSelectedNode('deferred')}>
                                  <FileText className="w-3 h-3 shrink-0" />
                                  <span>Deferred Revenues</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* EQUITY NODE */}
                          <div>
                            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer" onClick={() => setExplorerExpanded(prev => ({ ...prev, equity: !prev.equity }))}>
                              {explorerExpanded.equity ? <ChevronDown className="w-3 h-3 text-purple-400" /> : <ChevronRight className="w-3 h-3 text-white/30" />}
                              <FolderIcon className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-purple-400 font-semibold">Equity</span>
                            </div>
                            {explorerExpanded.equity && (
                              <div className="pl-4 space-y-1 border-l border-purple-500/25 ml-1.5">
                                <div className={`flex items-center gap-1.5 p-1 rounded cursor-pointer ${explorerSelectedNode === 'retained' ? 'bg-purple-500/10 text-purple-300' : 'text-white/60 hover:text-white'}`} onClick={() => setExplorerSelectedNode('retained')}>
                                  <FileText className="w-3 h-3 shrink-0" />
                                  <span>Retained Earnings</span>
                                </div>
                                <div className={`flex items-center gap-1.5 p-1 rounded cursor-pointer ${explorerSelectedNode === 'reserves_child' ? 'bg-purple-500/10 text-purple-300' : 'text-white/60 hover:text-white'}`} onClick={() => setExplorerSelectedNode('reserves_child')}>
                                  <FileText className="w-3 h-3 shrink-0" />
                                  <span>Reserve Capital Pool</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Inspector on the right (7 columns) */}
                  <div className="md:col-span-7 bg-[#0b0b12] border border-white/5 rounded p-3.5 space-y-3.5 h-full flex flex-col justify-between">
                    {(() => {
                      const inspectorData = getExplorerNodeDetails(explorerSelectedNode);
                      return (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[11px] text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-cyan-400" />
                                {inspectorData.name}
                              </span>
                              <span className="text-[8px] bg-slate-800 border border-white/5 px-2 py-0.5 rounded text-white/60 font-black">
                                NODE_ID: {explorerSelectedNode.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed pt-1">{inspectorData.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[9px]">
                            <div className="bg-black/35 p-2 rounded border border-white/5">
                              <span className="text-white/30 block">Current Balance:</span>
                              <span className="text-emerald-400 font-extrabold text-xs block mt-0.5">{inspectorData.balance}</span>
                            </div>
                            <div className="bg-black/35 p-2 rounded border border-white/5">
                              <span className="text-white/30 block">Algebraic Class:</span>
                              <span className="text-purple-400 font-extrabold block mt-0.5">{inspectorData.accountingType}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[8px] text-white/30 font-bold">
                            <span>Status: {inspectorData.status}</span>
                            <span>Signatures Required: {inspectorData.signatures}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== WORKSPACE 2: CHART OF ACCOUNTS (REGISTRY) ==================== */}
          {activeWorkspace === 'registry' && (
            <motion.div 
              key="registry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="border-b border-[#2a2a35]/40 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Chart of Accounts & Double-Entry Registry</h3>
                  <span className="text-[9px] text-white/40 block mt-0.5">EXPLORE ACTIVE LEDGER BALANCES AND ASSET OBJECTS</span>
                </div>
                
                {/* Search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3 w-3 text-white/30" />
                    <input 
                      type="text" 
                      placeholder="Filter accounts..."
                      value={registrySearch}
                      onChange={e => setRegistrySearch(e.target.value)}
                      className="bg-[#050508] border border-[#2a2a35] hover:border-[#3d3d4e] rounded pl-8 pr-3 py-1 text-[10px] text-white font-mono focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <select
                    value={registryFilterKind}
                    onChange={e => setRegistryFilterKind(e.target.value)}
                    className="bg-[#050508] border border-[#2a2a35] rounded p-1 text-[9.5px] focus:outline-none text-white/70"
                  >
                    <option value="all">All Kinds</option>
                    <option value="asset">Assets</option>
                    <option value="escrow">Escrow</option>
                    <option value="liability">Liabilities</option>
                    <option value="revenue">Revenue</option>
                    <option value="equity">Equity</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Scrollable list of accounts (7 columns) */}
                <div className="md:col-span-7 bg-[#050508]/80 border border-white/5 rounded-lg p-4 space-y-2.5 max-h-[480px] overflow-y-auto">
                  {accounts
                    .filter(acc => {
                      const matchesSearch = acc.name.toLowerCase().includes(registrySearch.toLowerCase()) || acc.code.includes(registrySearch);
                      const matchesKind = registryFilterKind === 'all' ? true : acc.kind === registryFilterKind;
                      return matchesSearch && matchesKind;
                    })
                    .map(account => {
                      const isSelected = selectedAccount?.id === account.id;
                      return (
                        <div
                          key={account.id}
                          onClick={() => setSelectedAccount(account)}
                          className={`p-3 rounded border transition-all duration-150 cursor-pointer relative group flex justify-between items-center ${
                            isSelected 
                              ? 'bg-[#12121e] border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.1)]' 
                              : 'bg-black/40 border-[#2a2a35]/65 hover:border-white/10 hover:bg-white/5'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[8px] bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-white/50 font-bold">
                                {account.code}
                              </span>
                              <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 rounded-full border ${
                                account.kind === 'asset' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' :
                                account.kind === 'escrow' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' :
                                account.kind === 'liability' ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' : 'text-purple-400 bg-purple-500/10 border-purple-500/25'
                              }`}>
                                {account.kind}
                              </span>
                            </div>
                            <span className="font-semibold text-xs block text-white/80 group-hover:text-cyan-400 truncate">{account.name}</span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold font-mono text-white tracking-tight">{formatCurrency(account.balanceMinor, account.denomination)}</span>
                            <span className="text-[7.5px] text-white/35 block uppercase font-black font-mono tracking-wider mt-0.5">DENOM: {account.denomination}</span>
                          </div>

                          {/* Decorative selected indicator */}
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Micro Account Details Explorer Panel on the right (5 columns) */}
                <div className="md:col-span-5 bg-[#0d0d14]/90 border border-white/5 rounded-lg p-4 space-y-4 shadow-lg min-h-[380px] flex flex-col justify-between">
                  {selectedAccount ? (
                    <div className="space-y-4">
                      {/* Title */}
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider block">ACCOUNT DETAIL EXPLORER</span>
                        <h4 className="text-xs font-black text-white uppercase mt-0.5 leading-normal">{selectedAccount.name}</h4>
                      </div>

                      {/* Major detail parameters list */}
                      <div className="space-y-2 font-mono text-[9px] text-white/80">
                        <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                          <span className="text-white/40">Account ID:</span>
                          <span className="font-extrabold text-white">{selectedAccount.id}</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                          <span className="text-white/40">GL Code Number:</span>
                          <span className="font-extrabold text-cyan-400">{selectedAccount.code}-CORE-09</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                          <span className="text-white/40">Currency Ledger:</span>
                          <span className="font-extrabold text-amber-500">{selectedAccount.denomination}</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                          <span className="text-white/40">Current Float:</span>
                          <span className="font-extrabold text-emerald-400">{formatCurrency(selectedAccount.balanceMinor, selectedAccount.denomination)}</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                          <span className="text-white/40">Simulated Floating Pending:</span>
                          <span className="font-bold text-white/50">{formatCurrency(selectedAccount.balanceMinor * 0.05, selectedAccount.denomination)}</span>
                        </div>
                      </div>

                      {/* Tabs inside account explorer details */}
                      <div className="border-t border-[#2a2a35]/40 pt-3 space-y-2">
                        <span className="text-[8.5px] text-white/30 uppercase font-black block tracking-widest">ENABLED METRICS INTEGRITY</span>
                        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                          <div className="bg-slate-900 border border-white/5 p-2 rounded text-emerald-400 flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Stripe GW Gateway
                          </div>
                          <div className="bg-slate-900 border border-white/5 p-2 rounded text-emerald-400 flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            FedNow Bridge
                          </div>
                        </div>
                      </div>

                      {/* Simulated 30-Day mini sparkline */}
                      <div className="bg-black/60 border border-white/5 p-2 rounded text-[8.5px] space-y-1.5">
                        <span className="text-white/40 font-bold uppercase tracking-wide block">Historical Float Variance (30-Day)</span>
                        <div className="h-10 w-full flex items-end gap-1 pt-2">
                          {[25, 45, 65, 35, 55, 75, 60, 85, 95, 80, 90, 110, 100, 125].map((val, idx) => (
                            <div 
                              key={idx} 
                              className="bg-cyan-500/45 hover:bg-cyan-400 rounded-sm flex-1 cursor-help transition-all" 
                              style={{ height: `${val}%` }}
                              title={`Day ${idx+1}: Variance ${val / 10}%`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/20 italic py-16 text-center flex flex-col items-center justify-center gap-2">
                      <Scale className="w-8 h-8 text-white/10" />
                      <span>Select an account registry ledger card on the left to inspect detailed ledger invariants, histories, and certificates.</span>
                    </div>
                  )}

                  <div className="bg-[#12121a]/60 border border-white/5 p-2.5 rounded text-[8.5px] text-white/40 leading-normal">
                    <Info className="w-3.5 h-3.5 text-cyan-400 inline mr-1 -mt-0.5 shrink-0" />
                    Ledger registry verifies balance sheets recursively against dynamic algebraic models to keep systemic invariants balanced at zero variance.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== WORKSPACE 3: JOURNAL POSTING (WIZARD) ==================== */}
          {activeWorkspace === 'journal' && (
            <motion.div 
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="border-b border-[#2a2a35]/40 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Double-Entry Journal Posting Wizard</h3>
                  <span className="text-[9px] text-white/40 block mt-0.5">SECURE CRYPTOGRAPHICALLY ASSURED BALANCE AND COMMIT PIPELINE</span>
                </div>
                <div className="text-[9px] bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded font-black">
                  STEP {wizardStep} OF 3
                </div>
              </div>

              {/* Progress bar steps */}
              <div className="w-full flex gap-1 relative font-mono text-[9px] font-black tracking-wider uppercase mb-2 select-none">
                <div className={`flex-1 text-center py-1.5 border rounded-sm transition-all ${wizardStep === 1 ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-[0_0_8px_#06b6d4]' : 'bg-[#050508] border-white/5 text-white/30'}`}>1. Transaction Type</div>
                <div className={`flex-1 text-center py-1.5 border rounded-sm transition-all ${wizardStep === 2 ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-[0_0_8px_#06b6d4]' : 'bg-[#050508] border-white/5 text-white/30'}`}>2. Entry Details</div>
                <div className={`flex-1 text-center py-1.5 border rounded-sm transition-all ${wizardStep === 3 ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-[0_0_8px_#06b6d4]' : 'bg-[#050508] border-white/5 text-white/30'}`}>3. Review & Pre-Commit</div>
              </div>

              {/* Wizard Content Panels */}
              <div className="bg-[#050508]/60 border border-white/5 rounded-lg p-5">
                
                {/* STEP 1: Select Type */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-white/40 uppercase font-black block tracking-wider">Select Ledger Posting Workflow</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1.5">
                      {[
                        { type: 'Vendor Payment', desc: 'Settle node operational liabilities with external third-parties.', icon: Cpu },
                        { type: 'Internal Transfer', desc: 'Rebalance structural float reserves between local accounts.', icon: ArrowRight },
                        { type: 'Reserve Allocation', desc: 'Secure designated margin capital limits in lockbox registries.', icon: Lock },
                        { type: 'Escrow', desc: 'Commit customer collateral held in temporary safe-custody vaults.', icon: Shield }
                      ].map(item => (
                        <div
                          key={item.type}
                          onClick={() => {
                            setJournalTxType(item.type);
                            setWizardStep(2);
                          }}
                          className={`p-3.5 rounded border transition-all cursor-pointer flex gap-3 group relative hover:border-cyan-500/50 hover:bg-cyan-500/5 ${
                            journalTxType === item.type 
                              ? 'bg-[#0e0e14] border-cyan-500/40' 
                              : 'bg-black/30 border-[#2a2a35]/60'
                          }`}
                        >
                          <div className={`p-2 rounded bg-slate-900 border border-slate-800 shrink-0 ${journalTxType === item.type ? 'text-cyan-400' : 'text-white/40 group-hover:text-cyan-300'}`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold block text-xs uppercase text-white tracking-wide">{item.type}</span>
                            <span className="text-[9px] text-white/30 block mt-1 leading-normal">{item.desc}</span>
                          </div>
                          {journalTxType === item.type && (
                            <div className="absolute right-3.5 top-3.5">
                              <Check className="w-4 h-4 text-cyan-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: Entry Details */}
                {wizardStep === 2 && (
                  <div className="space-y-4 font-mono">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] text-white/40 uppercase font-black block tracking-wider">Configure {journalTxType} Parameters</span>
                      <button onClick={() => setWizardStep(1)} className="text-[8.5px] text-cyan-400 hover:underline uppercase font-bold">[Back to Step 1]</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      
                      {/* Left: Account Selections */}
                      <div className="space-y-3">
                        {journalTxType === 'Vendor Payment' && (
                          <div className="space-y-1">
                            <label className="text-[9px] text-white/40 uppercase block">Receiving Vendor</label>
                            <select 
                              value={vendorName} 
                              onChange={e => setVendorName(e.target.value)}
                              className="w-full bg-black/60 border border-[#2a2a35] rounded p-2 text-white"
                            >
                              <option value="Basalt Infrastructure">Basalt Infrastructure</option>
                              <option value="Dubai Settlement Node V">Dubai Settlement Node V</option>
                              <option value="Zurich Clearing AG">Zurich Clearing AG</option>
                            </select>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[9px] text-white/40 uppercase block">Debit Leg (Funds Source Account)</label>
                          <select 
                            value={fundingAccount} 
                            onChange={e => setFundingAccount(e.target.value)}
                            className="w-full bg-black/60 border border-[#2a2a35] rounded p-2 text-white"
                          >
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.code} — {acc.name} ({formatCurrency(acc.balanceMinor, acc.denomination)})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-white/40 uppercase block">Credit Leg (Funds Destination Account)</label>
                          <select 
                            value={destinationAccount} 
                            onChange={e => setDestinationAccount(e.target.value)}
                            className="w-full bg-black/60 border border-[#2a2a35] rounded p-2 text-white"
                          >
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.code} — {acc.name} ({formatCurrency(acc.balanceMinor, acc.denomination)})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Right: Numeric & Cleared details */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-white/40 uppercase block">Value Amount</label>
                            <input 
                              type="number" 
                              value={txnAmountMajor} 
                              onChange={e => setTxnAmountMajor(e.target.value)}
                              className="w-full bg-black/60 border border-[#2a2a35] rounded p-2 text-white font-bold"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-white/40 uppercase block">Denomination</label>
                            <select 
                              value={selectedDenom} 
                              onChange={e => setSelectedDenom(e.target.value as Denomination)}
                              className="w-full bg-black/60 border border-[#2a2a35] rounded p-2 text-white"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="SVT">SVT (SOVR)</option>
                              <option value="USDC">USDC (Coin)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-white/40 uppercase block">Clearing Rail</label>
                            <select 
                              value={selectedRail} 
                              onChange={e => setSelectedRail(e.target.value as Rail)}
                              className="w-full bg-black/60 border border-[#2a2a35] rounded p-2 text-white"
                            >
                              <option value="fednow">FedNow Instant</option>
                              <option value="ach">ACH Clearing</option>
                              <option value="stripe">Stripe Operating</option>
                              <option value="svt">SVT Core Mint</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-white/40 uppercase block">Approval Authority</label>
                            <select 
                              value={approvalPolicy} 
                              onChange={e => setApprovalPolicy(e.target.value)}
                              className="w-full bg-black/60 border border-[#2a2a35] rounded p-2 text-white"
                            >
                              <option value="Single Admin">Single Sign</option>
                              <option value="Dual Sign">Dual Sign</option>
                              <option value="Consensus Quorum">Consensus Quorum</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-white/40 uppercase block">Journal Entry Memo</label>
                          <input 
                            type="text" 
                            value={reasonMemo} 
                            onChange={e => setReasonMemo(e.target.value)}
                            className="w-full bg-black/60 border border-[#2a2a35] rounded p-2 text-white text-[10.5px]"
                            placeholder="Reason for posting..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-white/5">
                      <label className="flex items-center gap-1.5 text-[9.5px] cursor-pointer text-white/70">
                        <input 
                          type="checkbox" 
                          checked={evidenceRequired} 
                          onChange={e => setEvidenceRequired(e.target.checked)}
                          className="accent-cyan-500 rounded" 
                        />
                        <span>Lock legal audit evidence certificate automatically (PDF/A Generation)</span>
                      </label>

                      <button
                        onClick={() => setWizardStep(3)}
                        disabled={fundingAccount === destinationAccount || !txnAmountMajor}
                        className="px-4.5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black text-[10px] font-black uppercase tracking-wider rounded transition-all cursor-pointer"
                      >
                        Continue to Pre-Commit checks
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Review & Pre-Commit checks */}
                {wizardStep === 3 && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] text-white/40 uppercase font-black block tracking-wider">Review Transaction & Pre-Commit Audit</span>
                      <button onClick={() => setWizardStep(2)} className="text-[8.5px] text-cyan-400 hover:underline uppercase font-bold">[Modify Details]</button>
                    </div>

                    {/* Transaction Payload Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-black/45 p-3 rounded border border-white/5 font-mono text-[9.5px]">
                        <span className="text-white/45 block uppercase">Debit Leg</span>
                        <span className="font-extrabold text-white text-[11px] block mt-1 truncate">
                          {accounts.find(a => a.id === fundingAccount)?.name || 'Unknown Account'}
                        </span>
                        <span className="text-[8.5px] text-white/30">Code: {accounts.find(a => a.id === fundingAccount)?.code}</span>
                      </div>

                      <div className="bg-black/45 p-3 rounded border border-white/5 font-mono text-[9.5px] flex flex-col justify-center items-center">
                        <span className="text-white/30 uppercase text-[8.5px]">Clearing Amount</span>
                        <span className="font-black text-emerald-400 text-sm">{parseFloat(txnAmountMajor).toLocaleString()}.00 {selectedDenom}</span>
                        <span className="text-[8.5px] text-[#ffffff]/30 bg-white/5 border border-white/10 px-1.5 rounded mt-1">{selectedRail.toUpperCase()}</span>
                      </div>

                      <div className="bg-black/45 p-3 rounded border border-white/5 font-mono text-[9.5px]">
                        <span className="text-white/45 block uppercase">Credit Leg</span>
                        <span className="font-extrabold text-white text-[11px] block mt-1 truncate">
                          {accounts.find(a => a.id === destinationAccount)?.name || 'Unknown Account'}
                        </span>
                        <span className="text-[8.5px] text-white/30">Code: {accounts.find(a => a.id === destinationAccount)?.code}</span>
                      </div>
                    </div>

                    {/* Pre-commit validation checklist */}
                    <div className="bg-[#0b0b14] border border-white/5 rounded-lg p-4 space-y-3 font-mono">
                      <span className="text-[9.5px] text-white/40 font-black uppercase tracking-wider block">PRE-COMMIT INTEGRITY MATRIX</span>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[9px]">
                        <div className="flex items-center gap-2">
                          {preCommitChecklist.debitCreditBalanced ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                          <span className={preCommitChecklist.debitCreditBalanced ? 'text-emerald-400 font-bold' : 'text-rose-500'}>Debits = Credits Leg</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {preCommitChecklist.accountsActive ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                          <span className={preCommitChecklist.accountsActive ? 'text-emerald-400 font-bold' : 'text-rose-500'}>Account Registry Active</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {preCommitChecklist.reservesAdequate ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                          <span className={preCommitChecklist.reservesAdequate ? 'text-emerald-400 font-bold' : 'text-rose-500'}>Liquidity Adequate</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {preCommitChecklist.approvalsSecured ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />}
                          <span className={preCommitChecklist.approvalsSecured ? 'text-emerald-400 font-bold' : 'text-rose-500'}>Approvals Secured</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {preCommitChecklist.evidenceCriteriaMet ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                          <span className={preCommitChecklist.evidenceCriteriaMet ? 'text-emerald-400 font-bold' : 'text-rose-500'}>Evidence Rules Aligned</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {preCommitChecklist.railOnline ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                          <span className="text-emerald-400 font-bold">Bridge Node Online</span>
                        </div>
                      </div>

                      {/* Error messaging if validation fails */}
                      {!preCommitChecklist.reservesAdequate && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded text-rose-400 text-[10px] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <div>
                            <span className="font-bold">Liquidity Guard Policy Triggered:</span> Insufficient floating capital in account {accounts.find(a => a.id === fundingAccount)?.code} to post {txnAmountMajor} {selectedDenom}.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Commit execution button & animated progression tracker */}
                    <div className="pt-2 border-t border-white/5 space-y-4">
                      {commitStatus === 'idle' ? (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/40">Posting Description: <strong className="text-white/70">{reasonMemo}</strong></span>
                          
                          <button
                            onClick={executeWizardPost}
                            disabled={!preCommitChecklist.reservesAdequate || !preCommitChecklist.debitCreditBalanced}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black uppercase tracking-widest text-[10px] rounded transition-all cursor-pointer shadow-lg shadow-cyan-950/50"
                          >
                            Balance & Commit Entry
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 font-mono text-[9px] bg-black/40 border border-white/5 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-white/40 uppercase font-black tracking-wider">Deploying Ledger Sequence:</span>
                            <span className="text-cyan-400 font-black tracking-widest uppercase animate-pulse">{commitStatus.toUpperCase()}</span>
                          </div>

                          {/* Interactive progression timeline bar indicators */}
                          <div className="grid grid-cols-6 gap-1 pt-1 text-[8px] text-center font-bold">
                            <div className={`p-1 border rounded ${commitStatus === 'balancing' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : commitStatus !== 'idle' && commitStatus !== 'balancing' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black/30 border-white/5 text-white/20'}`}>BALANCE</div>
                            <div className={`p-1 border rounded ${commitStatus === 'verifying' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : ['committing','receipt','evidence','queueing','completed'].includes(commitStatus) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black/30 border-white/5 text-white/20'}`}>VERIFY</div>
                            <div className={`p-1 border rounded ${commitStatus === 'committing' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : ['receipt','evidence','queueing','completed'].includes(commitStatus) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black/30 border-white/5 text-white/20'}`}>COMMIT</div>
                            <div className={`p-1 border rounded ${commitStatus === 'receipt' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : ['evidence','queueing','completed'].includes(commitStatus) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black/30 border-white/5 text-white/20'}`}>RECEIPT</div>
                            <div className={`p-1 border rounded ${commitStatus === 'evidence' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : ['queueing','completed'].includes(commitStatus) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black/30 border-white/5 text-white/20'}`}>EVIDENCE</div>
                            <div className={`p-1 border rounded ${commitStatus === 'queueing' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : commitStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black/30 border-white/5 text-white/20'}`}>QUEUE</div>
                          </div>

                          {commitStatus === 'completed' && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded text-[10px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fadeIn">
                              <div>
                                <span className="font-extrabold block uppercase tracking-wide">Journal Posting Finalized</span>
                                Invariants checked. SHA256 receipt generated: <strong className="font-mono text-white">{generatedReceiptNo}</strong>
                              </div>
                              <button
                                onClick={resetWizard}
                                className="px-3.5 py-1 bg-emerald-500 text-black font-extrabold uppercase text-[9px] rounded hover:bg-emerald-400 transition-all cursor-pointer"
                              >
                                Post Another
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* ==================== WORKSPACE 4: CAPITAL ROUTING (LIVE FLOW GRAPH) ==================== */}
          {activeWorkspace === 'routing' && (
            <motion.div 
              key="routing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="border-b border-[#2a2a35]/40 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Capital Flow Orchestration Graph</h3>
                  <span className="text-[9px] text-white/40 block mt-0.5 font-mono">REAL-TIME VISUALIZATION OF INTRANSIT CAPITAL AND EVIDENCE OBJECTS</span>
                </div>
                <button
                  onClick={runCapitalFlow}
                  disabled={flowActive}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold uppercase text-[9.5px] rounded flex items-center gap-1.5 shadow-[0_0_8px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-black" />
                  Trigger Test Flow
                </button>
              </div>

              {/* LIVE FLOW DIAGRAM CONTAINER */}
              <div className="bg-[#050508]/80 border border-white/5 rounded-lg p-6 relative min-h-[340px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />

                {/* SVG path connectors between glowing nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none text-[#2a2a35]/65" fill="none">
                  {/* Central vertical line */}
                  <line x1="50%" y1="12%" x2="50%" y2="88%" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
                  
                  {/* Side wings for Stripe/Vendor links */}
                  <path d="M 25% 15% L 50% 15% M 50% 85% L 75% 85%" stroke="currentColor" strokeWidth="1.5" />
                </svg>

                {/* FLOW SEGMENTS */}
                <div className="flex flex-col gap-5 items-center w-full max-w-lg relative z-10">
                  
                  {/* Stripe Inbound Node */}
                  <div className="flex justify-between w-full items-center">
                    <div className={`p-3 rounded-lg border transition-all duration-300 w-36 text-center ${
                      activeFlowNode === 'incoming' 
                        ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_12px_#06b6d4] text-cyan-200' 
                        : 'bg-[#0d0d14]/75 border-[#2a2a35]/80 text-white/60'
                    }`}>
                      <span className="text-[8px] text-white/30 block tracking-wider uppercase font-black">CAPITAL GATEWAY</span>
                      <span className="text-[10px] font-extrabold block uppercase mt-0.5">STRIPE</span>
                      <span className="text-[9px] text-emerald-400 font-bold block mt-1">$150,000 Incoming</span>
                    </div>

                    <div className="text-white/20 shrink-0 select-none animate-pulse">
                      <ArrowRight className="w-4 h-4 rotate-180 md:rotate-0" />
                    </div>

                    <div className={`p-3 rounded-lg border transition-all duration-300 w-36 text-center ${
                      activeFlowNode === 'posting' 
                        ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_12px_#06b6d4] text-cyan-200' 
                        : 'bg-[#0d0d14]/75 border-[#2a2a35]/80 text-white/60'
                    }`}>
                      <span className="text-[8px] text-white/30 block tracking-wider uppercase font-black">OPERATIONAL LEDGER</span>
                      <span className="text-[10px] font-extrabold block uppercase mt-0.5">STRIPE OPERATING</span>
                    </div>
                  </div>

                  {/* Flow Connector Arrow Down */}
                  <ArrowDown className="w-4 h-4 text-white/20" />

                  {/* Parallel middle validation leg */}
                  <div className="flex justify-center w-full">
                    <div className={`p-3.5 rounded-lg border transition-all duration-300 w-64 text-center ${
                      activeFlowNode === 'matching' 
                        ? 'bg-emerald-950 border-emerald-400 shadow-[0_0_12px_#10b981] text-emerald-200' 
                        : 'bg-[#0d0d14]/75 border-[#2a2a35]/80 text-white/60'
                    }`}>
                      <span className="text-[8px] text-white/30 block tracking-wider uppercase font-black">ALGEBRAIC INVARIANT ENGINE</span>
                      <span className="text-[10.5px] font-extrabold block uppercase mt-0.5">✓ Journal Invariant Passed</span>
                      <span className="text-[8.5px] text-emerald-400 font-mono block mt-0.5">Debits = Credits leg matched</span>
                    </div>
                  </div>

                  {/* Flow Connector Arrow Down */}
                  <ArrowDown className="w-4 h-4 text-white/20" />

                  {/* Core Settlement Bridge Node */}
                  <div className="flex justify-center w-full">
                    <div className={`p-3.5 rounded-lg border transition-all duration-300 w-64 text-center ${
                      activeFlowNode === 'clearing' 
                        ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_12px_#06b6d4] text-cyan-200' 
                        : 'bg-[#0d0d14]/75 border-[#2a2a35]/80 text-white/60'
                    }`}>
                      <span className="text-[8px] text-white/30 block tracking-wider uppercase font-black">FEDERAL RESERVE SETTLEMENT</span>
                      <span className="text-[10.5px] font-extrabold block uppercase mt-0.5">FedNow Bridge Cleared</span>
                      <span className="text-[8.5px] text-cyan-400 font-mono block mt-0.5">Asset objects minted to queue</span>
                    </div>
                  </div>

                  {/* Flow Connector Arrow Down */}
                  <ArrowDown className="w-4 h-4 text-white/20" />

                  {/* Settlement queue and evidence object generation leg */}
                  <div className="flex justify-between w-full items-center">
                    <div className={`p-3 rounded-lg border transition-all duration-300 w-36 text-center ${
                      activeFlowNode === 'evidence' 
                        ? 'bg-[#1e152a] border-purple-400 shadow-[0_0_12px_#a855f7] text-purple-200' 
                        : 'bg-[#0d0d14]/75 border-[#2a2a35]/80 text-white/60'
                    }`}>
                      <span className="text-[8px] text-white/30 block tracking-wider uppercase font-black">EVIDENCE SYSTEM</span>
                      <span className="text-[10px] font-extrabold block uppercase mt-0.5">Evidence Sealed</span>
                      <span className="text-[8px] text-purple-400 font-bold block mt-1">Certificate PDF/A Lock</span>
                    </div>

                    <div className="text-white/20 shrink-0 select-none animate-pulse">
                      <ArrowRight className="w-4 h-4 md:rotate-0" />
                    </div>

                    <div className={`p-3 rounded-lg border transition-all duration-300 w-36 text-center ${
                      activeFlowNode === 'finalized' 
                        ? 'bg-[#14251c] border-emerald-400 shadow-[0_0_12px_#10b981] text-emerald-200' 
                        : 'bg-[#0d0d14]/75 border-[#2a2a35]/80 text-white/60'
                    }`}>
                      <span className="text-[8px] text-white/30 block tracking-wider uppercase font-black">ESCROW VAULT</span>
                      <span className="text-[10px] font-extrabold block uppercase mt-0.5">Vendor Escrow Pool</span>
                      <span className="text-[8.5px] text-emerald-400 font-bold block mt-1">Released to Vendor</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Real-time flowing logs (Audit Trail) */}
              <div className="bg-black/50 border border-[#2a2a35] rounded-lg p-4 space-y-2">
                <span className="text-[9.5px] text-white/40 uppercase font-black tracking-widest block border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" /> Live Flow Event Console
                </span>
                
                <div className="h-[120px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                  {flowLogs.length > 0 ? (
                    flowLogs.map((log, index) => (
                      <div key={index} className="flex gap-2.5 items-start text-[9.5px] font-mono leading-relaxed">
                        <span className="text-white/25 select-none">[{log.time}]</span>
                        <span className="text-cyan-400 font-bold">[{log.stage}]</span>
                        <span className={log.status === 'success' ? 'text-emerald-400' : 'text-slate-300'}>{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/20 italic text-center py-8">
                      Click the "Trigger Test Flow" button to run live diagnostic transfers across capital nodes and watch real-time flow events.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== WORKSPACE 5: RESERVE MANAGEMENT ==================== */}
          {activeWorkspace === 'reserve' && (
            <motion.div 
              key="reserve"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="border-b border-[#2a2a35]/40 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Reserve Manager & Balance Reconciler</h3>
                  <span className="text-[9px] text-white/40 block mt-0.5">MINT, LOCK, RELEASE, AND ALGEBRAICALLY RECONCILE SYSTEM RESERVES</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={runReconciliation}
                    disabled={reconciling}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-white/10 text-white text-[9.5px] font-extrabold uppercase rounded transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${reconciling ? 'animate-spin' : ''}`} />
                    Reconcile Ledger
                  </button>
                </div>
              </div>

              {/* Reconciliation Status Result */}
              {reconciliationReport && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-[9.5px] leading-relaxed flex items-center gap-2 font-mono animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{reconciliationReport}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Lock Reserve Form Sub-panel (5 columns) */}
                <div className="md:col-span-5 bg-black/40 border border-white/5 rounded-lg p-4 space-y-4">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-wider block border-b border-white/5 pb-1">Lock Reserve Capital</span>
                  
                  <form onSubmit={handleAddLock} className="space-y-3 font-mono text-[9px]">
                    <div className="space-y-1">
                      <label className="text-white/40 uppercase block">Select Target Vault</label>
                      <select 
                        value={lockAccountSelect} 
                        onChange={e => setLockAccountSelect(e.target.value)}
                        className="w-full bg-black/60 border border-[#2a2a35] rounded p-1.5 text-white"
                      >
                        <option value="1010-ZRH-VAULT">1010-ZRH-VAULT (Zurich Operating)</option>
                        <option value="1020-NYC-RESERVE">1020-NYC-RESERVE (New York Core)</option>
                        <option value="2010-STRIPE-LIQUIDITY">2010-STRIPE-LIQUIDITY (Stripe Float)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/40 uppercase block">SVT Amount to Lock</label>
                      <input 
                        type="number" 
                        value={lockAmount} 
                        onChange={e => setLockAmount(e.target.value)}
                        className="w-full bg-black/60 border border-[#2a2a35] rounded p-1.5 text-white text-[11px] font-bold"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/40 uppercase block">Regulatory Lock Purpose</label>
                      <input 
                        type="text" 
                        value={lockPurpose} 
                        onChange={e => setLockPurpose(e.target.value)}
                        className="w-full bg-black/60 border border-[#2a2a35] rounded p-1.5 text-white text-[9.5px]"
                        placeholder="e.g. Basel III Liquidity Margin"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-black font-black uppercase text-[9.5px] rounded transition-all cursor-pointer shadow-md"
                    >
                      Allocate & Lock Vault Margin
                    </button>
                  </form>
                </div>

                {/* Active Locked Reserves List (7 columns) */}
                <div className="md:col-span-7 bg-[#050508]/60 border border-white/5 rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-wider block">Active Locked Reserve Collaterals</span>
                    <span className="text-[8px] text-white/30 uppercase font-black tracking-widest font-mono">EMERGENCY COLAR</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono">
                    {lockedReserves.map((lockItem) => (
                      <div key={lockItem.id} className="p-3 bg-black/45 border border-[#2a2a35]/40 rounded flex justify-between items-center text-[10px] hover:border-white/10 transition-colors">
                        <div className="space-y-1 pr-2 min-w-0">
                          <span className="font-extrabold text-white block uppercase tracking-wide truncate">{lockItem.purpose}</span>
                          <div className="flex items-center gap-1.5 text-[8.5px] text-white/40">
                            <span className="font-bold text-cyan-400">{lockItem.accountCode}</span>
                            <span>• Allocated: {lockItem.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-black text-amber-400">{lockItem.amount.toLocaleString()}.00 SVT</span>
                          <button
                            onClick={() => handleRemoveLock(lockItem.id)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-white/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Unlock and release back to float reserves"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {lockedReserves.length === 0 && (
                      <div className="text-white/20 italic text-center py-10 text-[9.5px]">
                        No active regulatory or operational locks committed.
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/40 border border-white/5 p-2.5 rounded text-[8.5px] text-white/40 leading-normal font-mono">
                    <Info className="w-3.5 h-3.5 text-cyan-400 inline mr-1 -mt-0.5" />
                    Locked reserves are cryptographically isolated from outbound clearing gateways. Outbound clearing operations will fail-fast if total available float violates these ratios.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== WORKSPACE 6: TREASURY ANALYTICS ==================== */}
          {activeWorkspace === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="border-b border-[#2a2a35]/40 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Treasury System Velocity & Analytics</h3>
                  <span className="text-[9px] text-white/40 block mt-0.5">CAPITAL VELOCITY, RESERVE COEFFICIENTS, AND SETTLEMENT VOLUMES</span>
                </div>
                <span className="text-[9px] text-white/40 font-mono font-bold uppercase tracking-widest bg-[#0c0c14] border border-white/5 px-2 py-0.5 rounded">
                  INTERVAL: 24-HOUR REALTIME
                </span>
              </div>

              {/* Analytics charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                
                {/* Graph 1: Settlement Volume */}
                <div className="bg-black/45 border border-white/5 rounded-lg p-4 space-y-3 font-mono">
                  <span className="text-[10px] text-white/50 font-black uppercase block tracking-wider">Settlement Volume Curve</span>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getAnalyticsMockData()}>
                        <defs>
                          <linearGradient id="colorSettle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#ffffff" opacity={0.25} style={{ fontSize: '8px' }} />
                        <YAxis stroke="#ffffff" opacity={0.25} style={{ fontSize: '8px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#09090e', border: '1px solid #2a2a35', fontSize: '9px' }} />
                        <Area type="monotone" dataKey="volume" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSettle)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Graph 2: Reserve Utilization Rate */}
                <div className="bg-black/45 border border-white/5 rounded-lg p-4 space-y-3 font-mono">
                  <span className="text-[10px] text-white/50 font-black uppercase block tracking-wider">Reserve Utilization Rate</span>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getAnalyticsMockData()}>
                        <XAxis dataKey="time" stroke="#ffffff" opacity={0.25} style={{ fontSize: '8px' }} />
                        <YAxis stroke="#ffffff" opacity={0.25} style={{ fontSize: '8px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#09090e', border: '1px solid #2a2a35', fontSize: '9px' }} />
                        <Bar dataKey="utilization" fill="#f59e0b" radius={[1, 1, 0, 0]} opacity={0.7} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Dynamic simulation controls block */}
              <div className="bg-[#050508] border border-white/5 rounded-lg p-4 font-mono space-y-3">
                <span className="text-[10px] text-white/50 uppercase font-black block tracking-wider">Simulate Network Load and Velocity Curve</span>
                <p className="text-[9px] text-white/40 leading-normal">Outbound capital velocity is heavily contingent on reserve policies and regional consensus latencies. Adjust values to verify rebalance models dynamically.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[9px] pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white/40 uppercase">Consensus Block Time</span>
                      <span className="text-cyan-400">1.2 seconds</span>
                    </div>
                    <input type="range" className="w-full accent-cyan-500 cursor-pointer" min="0.5" max="5" step="0.1" defaultValue="1.2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white/40 uppercase">Active Clearing Nodes</span>
                      <span className="text-emerald-400">12 nodes</span>
                    </div>
                    <input type="range" className="w-full accent-emerald-500 cursor-pointer" min="4" max="24" step="1" defaultValue="12" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-white/40 uppercase">Outbound Velocity Collar</span>
                      <span className="text-amber-500">85% Limit</span>
                    </div>
                    <input type="range" className="w-full accent-amber-500 cursor-pointer" min="50" max="100" step="5" defaultValue="85" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* METADATA STATUS FOOTER */}
        <div className="border-t border-[#2a2a35]/45 pt-3.5 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 font-mono text-[8.5px] uppercase font-bold tracking-widest text-white/35">
          <span>COGNITIVE CORE MINT LINK: SECURED</span>
          <span>Federal reserve bridge protocol rate: 99.98% Parity</span>
          <span>SYSTEM RUNNING (HEIGHT: #742214)</span>
        </div>

      </div>

    </div>
  );
}

// Simple folder icon SVG
function FolderIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
    </svg>
  );
}

// Windows Explorer Style Details Helper
function getExplorerNodeDetails(node: string) {
  switch (node) {
    case 'cash':
      return {
        name: 'Physical Cash & Vault Reserves',
        description: 'Hard liquid asset reserves stored securely in offline Swiss vault facilities and connected FedNow federal reserve balances.',
        balance: '$11,800,000.00 USD',
        accountingType: 'ASSET (Dr. leg increased)',
        status: 'NOMINAL COLLATERAL OK',
        signatures: 'Single Signature Key'
      };
    case 'tokens':
      return {
        name: 'Sovereign Core Utility Tokens (SVT)',
        description: 'Native utility tokens used for real-time node rebalancing, instant clearance and gas incentives across global anchors.',
        balance: '420,000,000.00 SVT',
        accountingType: 'ASSET (Treasury Float leg)',
        status: 'NOMINAL COLLATERAL OK',
        signatures: 'Multi-Signature Consensus Quorum'
      };
    case 'escrow_child':
      return {
        name: 'Arbitrage Escrow Custody Pool',
        description: 'Third-party customer and vendor assets temporarily secured in multi-party smart collateral locks prior to clearance validation.',
        balance: '$620,000.00 USD',
        accountingType: 'ASSET (Debit Lock Escrow)',
        status: 'NOMINAL COLLATERAL OK',
        signatures: 'Dual Authority Signatures'
      };
    case 'float':
      return {
        name: 'Systemic Customer Float',
        description: 'Total liabilities representing customer balances actively trading within regional nodes, backed 1:1 with cash assets.',
        balance: '$2,100,000.00 USD',
        accountingType: 'LIABILITY (Cr. leg increased)',
        status: 'NOMINAL COLLATERAL OK',
        signatures: 'Single Signature Key'
      };
    case 'deferred':
      return {
        name: 'Deferred Revenue Accounts',
        description: 'Revenue lines scheduled for realization over progressive 30-day clearance intervals matching invoice validation protocols.',
        balance: '$87,000.00 USD',
        accountingType: 'LIABILITY (Operational Leg)',
        status: 'NOMINAL COLLATERAL OK',
        signatures: 'Single Signature Key'
      };
    case 'retained':
      return {
        name: 'Retained Net Earnings',
        description: 'Accumulated operational profits generated from clearance fees, transaction slippage gas, and credit interest reinvested into capital.',
        balance: '$3,400,000.00 USD',
        accountingType: 'EQUITY (Debit balancing net)',
        status: 'NOMINAL COLLATERAL OK',
        signatures: 'Multi-Signature Consensus Quorum'
      };
    case 'reserves_child':
      return {
        name: 'Core Systemic Reserve Capital Pool',
        description: 'Sovereign emergency pool dedicated to mitigating regional network failure limits, sanctions adjustments, and ledger re-sync drag.',
        balance: '$1,337,015.00 USD',
        accountingType: 'EQUITY (Reserve Capital Leg)',
        status: 'NOMINAL COLLATERAL OK',
        signatures: 'Multi-Signature Consensus Quorum'
      };
    default:
      return {
        name: 'Treasury Asset Node',
        description: 'Secure systemic financial asset node belonging to the double-entry accounting matrix of the SOVR protocol.',
        balance: '$0.00 USD',
        accountingType: 'ASSET',
        status: 'OFFLINE',
        signatures: 'Quorum Required'
      };
  }
}

// Helper mock data generator for charting curves
function getAnalyticsMockData() {
  return [
    { time: '00:00', volume: 150000, utilization: 42 },
    { time: '04:00', volume: 320000, utilization: 55 },
    { time: '08:00', volume: 680000, utilization: 68 },
    { time: '12:00', volume: 920000, utilization: 72 },
    { time: '16:00', volume: 1450000, utilization: 84 },
    { time: '20:00', volume: 1120000, utilization: 78 },
    { time: '24:00', volume: 1540000, utilization: 86 }
  ];
}
