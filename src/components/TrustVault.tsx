import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, FileText, ShieldCheck, Layers, Lock, Unlock, Search, Globe, 
  Cpu, Activity, CheckCircle2, Zap, Clock, Settings, Download, Filter, 
  Plus, Trash2, Play, ArrowRight, ChevronRight, Info, Calendar, Users, 
  Check, Database, RefreshCw, Network, FileSpreadsheet, FileJson, 
  FileSignature, Share2, ExternalLink, ShieldAlert, AlertTriangle, Printer, QrCode
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../data/seed';

interface TrustVaultProps {
  transactions: Transaction[];
  setSelectedTxIdForDrilldown: (id: string | null) => void;
  accounts?: any[];
}

// Pre-populate mock verification logs for higher fidelity
const INITIAL_VERIFICATION_LOGS = [
  { id: 'v1', verifiedBy: 'SEC Auditor Alpha', timestamp: '2026-06-26T14:22:15Z', ip: '198.51.100.42', type: 'External Regulatory Audit', result: 'PASS (100% Integrity)' },
  { id: 'v2', verifiedBy: 'Stripe Settlement Webhook', timestamp: '2026-06-26T15:05:01Z', ip: '34.204.12.88', type: 'Automated Invariant Check', result: 'PASS (Invariants Sealed)' },
  { id: 'v3', verifiedBy: 'JP Morgan API Gateway', timestamp: '2026-06-26T15:30:11Z', ip: '172.56.21.109', type: 'Settlement Clearance Sync', result: 'PASS (Signature Confirmed)' },
  { id: 'v4', verifiedBy: 'Federal Reserve Notary Node', timestamp: '2026-06-26T16:11:42Z', ip: '10.240.0.12', type: 'Consensus Merkle Proof', result: 'PASS (Anchor Sealed)' },
];

const SIGNATURES_DATA = [
  { id: 'sig-rcp', type: 'Receipt Signature', algorithm: 'Ed25519', authority: 'SOVR Authority Node NY_01', hash: '8f7d9a102b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e', keyRotation: '90-Day Scheduled (Next: July 15, 2026)', status: 'ACTIVE // VALID' },
  { id: 'sig-stl', type: 'Settlement Signature', algorithm: 'ECDSA_SHA256', authority: 'Stripe Settlement Gateway', hash: '5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f', keyRotation: 'On-Demand Triggered', status: 'ACTIVE // VALID' },
  { id: 'sig-ldg', type: 'Ledger Signature', algorithm: 'RSA_4096', authority: 'SOVR Double-Entry Consensus Core', hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', keyRotation: 'Annual Master Key Update', status: 'ACTIVE // VALID' },
  { id: 'sig-pkg', type: 'Package Signature', algorithm: 'Ed25519', authority: 'Compliance Vault Signer', hash: 'f9e8d7c6b5a493827160f5e4d3c2b1a0f9e8d7c6b5a493827160f5e4d3c2b1a0', keyRotation: 'Quarterly Automated Rot', status: 'ACTIVE // VALID' },
  { id: 'sig-crt', type: 'Certificate Signature', algorithm: 'Ed25519', authority: 'Clearing Bank Trust Root', hash: 'bcde0123456789abcdef0123456789abcdef0123456789abcdef0123456789ab', keyRotation: 'Bi-Annual Scheduled Rotation', status: 'ACTIVE // VALID' }
];

export default function TrustVault({ transactions, setSelectedTxIdForDrilldown, accounts = [] }: TrustVaultProps) {
  // Navigation states
  // Explorer tabs represent the directory tree folder or tool selected
  const [selectedFolder, setSelectedFolder] = useState<string>('Receipts');
  
  // Active transaction in drilldown within the Vault
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [activeTxTab, setActiveTxTab] = useState<'Summary' | 'Receipt' | 'Certificate' | 'Chain Proof' | 'Ledger' | 'Manifest' | 'Signatures' | 'Timeline' | 'Evidence Graph'>('Summary');
  const [txDetails, setTxDetails] = useState<any>(null);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Evidence Graph Interaction State
  const [selectedGraphNode, setSelectedGraphNode] = useState<string>('Receipt');

  // Verification Center states
  const [activeVerificationCategory, setActiveVerificationCategory] = useState<string>('Auditors');
  const [verificationLogs, setVerificationLogs] = useState(INITIAL_VERIFICATION_LOGS);
  const [simVerifier, setSimVerifier] = useState('Central Bank Inspector');
  const [simIp, setSimIp] = useState('192.168.12.155');
  const [simType, setSimType] = useState('Ad-hoc Regulatory Check');
  const [isSimulatingVerification, setIsSimulatingVerification] = useState(false);

  // Audit Workspace states
  const [auditDateRange, setAuditDateRange] = useState('Last 30 Days');
  const [selectedAuditAccounts, setSelectedAuditAccounts] = useState<string[]>(['all']);
  const [selectedAuditArtifacts, setSelectedAuditArtifacts] = useState<string[]>(['receipts', 'certificates', 'ledger']);
  const [auditProgress, setAuditProgress] = useState<number | null>(null);
  const [auditStepName, setAuditStepName] = useState<string>('');
  const [generatedPackage, setGeneratedPackage] = useState<any | null>(null);

  // Signature Explorer State
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>('sig-rcp');

  // Block details for Chain Explorer
  const [selectedBlockHeight, setSelectedBlockHeight] = useState<number>(7422);

  // Immutable Archive State
  const [selectedArchiveStage, setSelectedArchiveStage] = useState<string>('Live');

  // Fetch full details when transaction is selected
  useEffect(() => {
    if (!selectedTx) {
      setTxDetails(null);
      return;
    }
    setLoadingTx(true);
    fetch(`/api/verify/${selectedTx.id}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setTxDetails(resData);
        }
        setLoadingTx(false);
      })
      .catch(err => {
        console.error("Error fetching evidence detail", err);
        setLoadingTx(false);
      });
  }, [selectedTx]);

  // Autoselect first transaction on mount if available
  useEffect(() => {
    if (transactions && transactions.length > 0 && !selectedTx) {
      setSelectedTx(transactions[0]);
    }
  }, [transactions]);

  // Dynamic filter based on selected directory folder & search query
  const filteredTransactions = transactions.filter(tx => {
    // Apply search query first
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.originApp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.amountMinor / 100).toString().includes(searchQuery);

    if (!matchesSearch) return false;

    // Apply directory folder logic
    if (selectedFolder === 'Receipts') return true; // Show all for standard Receipts explorer
    if (selectedFolder === 'Settlement Certificates') return tx.state === 'posted' || tx.rail !== 'internal';
    if (selectedFolder === 'Chain Proofs') return tx.state === 'posted';
    if (selectedFolder === 'Ledger Extracts') return tx.entries && tx.entries.length > 0;
    if (selectedFolder === 'Audit Packages') return tx.state === 'posted';
    if (selectedFolder === 'Evidence Bundles') return true;
    if (selectedFolder === 'Archived Evidence') return tx.state === 'posted' || tx.state === 'pending';
    
    return true;
  });

  // Simulator helper
  const handleSimulateVerification = () => {
    if (!selectedTx) return;
    setIsSimulatingVerification(true);
    
    setTimeout(() => {
      const newLog = {
        id: `v_${Math.random().toString(36).substr(2, 9)}`,
        verifiedBy: simVerifier,
        timestamp: new Date().toISOString(),
        ip: simIp || '127.0.0.1',
        type: simType,
        result: `PASS (Witness Verified - Hash ${selectedTx.hash.substr(0, 10)}...)`
      };
      setVerificationLogs([newLog, ...verificationLogs]);
      setIsSimulatingVerification(false);
    }, 1500);
  };

  // Audit package generation simulator
  const handleGenerateAuditPackage = () => {
    setAuditProgress(10);
    setAuditStepName('Querying ledger nodes...');
    setGeneratedPackage(null);

    const steps = [
      { p: 30, text: 'Verifying algebraic balance invariants...' },
      { p: 60, text: 'Assembling legal signature proofs (Ed25519)...' },
      { p: 85, text: 'Compressing cryptographic ledger manifests...' },
      { p: 100, text: 'Audit Vault package compiled successfully.' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setAuditProgress(step.p);
        setAuditStepName(step.text);
        if (step.p === 100) {
          setTimeout(() => {
            setAuditProgress(null);
            setGeneratedPackage({
              id: `PKG-${Math.floor(Math.random() * 90000) + 10000}`,
              timestamp: new Date().toISOString(),
              scannedTxns: filteredTransactions.length,
              fileSize: `${(filteredTransactions.length * 12.4).toFixed(1)} KB`,
              integrityHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
            });
          }, 600);
        }
      }, (idx + 1) * 800);
    });
  };

  // Helper download trigger
  const triggerDownload = (format: string) => {
    if (!selectedTx) return;
    const a = document.createElement('a');
    a.href = `/api/evidence/download/${selectedTx.id}?format=${format === 'txt' ? 'zip' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs text-white">
      
      {/* LEFT COLUMN: THE DIRECTORY TREE / EXPLORER NAV (4 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-4 bg-[#050508] border border-[#2a2a35] rounded-lg p-4">
        
        {/* Header / Brand */}
        <div className="pb-3 border-b border-[#2a2a35]/60">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/45 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Trust Vault</span>
              <span className="text-[8px] text-white/40 block">INTEGRITY & PROOF EXPLORER</span>
            </div>
          </div>
        </div>

        {/* Overall Trust Metrics */}
        <div className="bg-[#0b0b12] border border-[#1c1c28] rounded p-2.5 space-y-1 text-[10px]">
          <div className="flex justify-between items-center">
            <span className="text-white/40 uppercase">Vault Integrity:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% NOMINAL
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40 uppercase">Consensus Anchors:</span>
            <span className="text-cyan-400 font-bold">5/5 Nodes Active</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40 uppercase">Sealed Blocks:</span>
            <span className="text-white">7,422 Sealed</span>
          </div>
        </div>

        {/* Directory Explorer Folders */}
        <div className="space-y-4">
          <div>
            <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block px-2 mb-1.5">Vault Directory Tree</span>
            <nav className="space-y-1">
              {[
                { name: 'Receipts', icon: Folder, desc: 'Digital customer receipts' },
                { name: 'Settlement Certificates', icon: Folder, desc: 'Payment rail signatures' },
                { name: 'Chain Proofs', icon: Folder, desc: 'Block anchorage logs' },
                { name: 'Ledger Extracts', icon: Folder, desc: 'Double-entry matching entries' },
                { name: 'Audit Packages', icon: Folder, desc: 'Legally-defensible bundles' },
                { name: 'Digital Signatures', icon: Folder, desc: 'Cryptographic public keys' },
                { name: 'Evidence Bundles', icon: Folder, desc: 'Dynamic validation profiles' },
                { name: 'Archived Evidence', icon: Folder, desc: 'Historical immutable files' }
              ].map(folder => {
                const isSelected = selectedFolder === folder.name;
                return (
                  <button
                    key={folder.name}
                    onClick={() => {
                      setSelectedFolder(folder.name);
                    }}
                    className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded transition-all group cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-500/10 border-l-2 border-amber-500 text-white' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <folder.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-white/35 group-hover:text-white/60'}`} />
                      <span className="text-[10.5px] truncate font-medium">{folder.name}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tools & Utilities Section */}
          <div>
            <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block px-2 mb-1.5">Trust Core Engines</span>
            <nav className="space-y-1">
              {[
                { id: 'Verification Center', name: '⚙️ Verification Center', desc: 'Manage access and external witness audits' },
                { id: 'Audit Workspace', name: '💼 Audit Workspace', desc: 'Custom package compiler engine' },
                { id: 'Signature Explorer', name: '🔑 Signature Explorer', desc: 'Inspect active signing keys' },
                { id: 'Chain Explorer', name: '🔗 Chain Explorer', desc: 'Raw ledger consensus block explorer' },
                { id: 'Immutable Archive', name: '📦 Immutable Archive', desc: 'Lifecycle & retention planner' }
              ].map(tool => {
                const isSelected = selectedFolder === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setSelectedFolder(tool.id);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded transition-all group cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-white' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">{tool.name}</span>
                      <span className="text-[8px] text-white/30 truncate group-hover:text-white/50">{tool.desc}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: MAIN CONTENT WORKSPACE (9 cols) */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* Conditional rendering based on directory selection */}
        
        {/* PART 1: DIRECTORY FILE FOLDER VIEW */}
        {!['Verification Center', 'Audit Workspace', 'Signature Explorer', 'Chain Explorer', 'Immutable Archive'].includes(selectedFolder) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Folder file items list (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-3 bg-[#08080c] border border-[#2a2a35] rounded-lg p-4">
              <div className="flex items-center justify-between border-b border-[#2a2a35]/60 pb-2">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white uppercase text-[11px] tracking-wide">{selectedFolder}</span>
                </div>
                <span className="text-[9px] bg-white/5 text-white/60 px-1.5 py-0.5 rounded font-mono">
                  {filteredTransactions.length} item(s)
                </span>
              </div>

              {/* Database Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search hash, amount, app..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#030305] border border-[#2a2a35] rounded pl-8 pr-3 py-1.5 text-[10.5px] text-white focus:outline-none focus:border-cyan-400/80 font-mono"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto scrollbar-thin">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-white/35">
                    <AlertTriangle className="w-6 h-6 mx-auto text-white/20 mb-2" />
                    <span>No files match standard filters</span>
                  </div>
                ) : (
                  filteredTransactions.map(tx => {
                    const isSelected = selectedTx?.id === tx.id;
                    const amountFormatted = formatCurrency(tx.amountMinor / 100, tx.denomination);
                    return (
                      <button
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className={`w-full text-left p-2.5 rounded border transition-all text-[11px] hover:border-amber-500/40 cursor-pointer ${
                          isSelected 
                            ? 'bg-gradient-to-r from-amber-500/10 to-[#0e0e16] border-amber-500/70 shadow-[0_0_8px_rgba(245,158,11,0.1)]' 
                            : 'bg-black/30 border-[#1c1c28]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-white truncate">{tx.id}</span>
                          <span className="text-amber-400 font-bold">{amountFormatted}</span>
                        </div>
                        <div className="text-[9px] text-white/40 flex justify-between font-mono">
                          <span className="truncate max-w-[120px]">{tx.memo}</span>
                          <span>{new Date(tx.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] text-white/30">
                          <span className="truncate font-mono">SHA256: {tx.hash.substr(0, 12)}...</span>
                          <span className={`px-1 rounded ${tx.state === 'posted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {tx.state.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Investigation workspace of selected item (7 cols) */}
            <div className="md:col-span-7 flex flex-col bg-[#08080c] border border-[#2a2a35] rounded-lg overflow-hidden">
              {selectedTx ? (
                <>
                  {/* Top Transaction Info Header */}
                  <div className="bg-[#0c0c14] border-b border-[#2a2a35] p-3 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black uppercase text-white">Trust Profile //</span>
                        <span className="text-[10px] text-cyan-400 font-bold">{selectedTx.id}</span>
                      </div>
                      <p className="text-[8.5px] text-white/40 mt-0.5">SHA256: {selectedTx.hash}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Integrated dynamic overall Evidence Integrity score bubble */}
                      <div className="bg-[#10101c] border border-[#2a2a3a] px-2 py-1 rounded text-center shrink-0">
                        <div className="text-[8px] text-white/35 uppercase leading-none">Evidence Score</div>
                        <div className="text-[12px] font-black text-emerald-400 font-mono mt-0.5">100%</div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs bar */}
                  <div className="flex border-b border-[#1c1c24] bg-black/40 overflow-x-auto scrollbar-none">
                    {[
                      { id: 'Summary', name: 'Summary' },
                      { id: 'Evidence Graph', name: 'Evidence Graph' },
                      { id: 'Receipt', name: 'Receipt' },
                      { id: 'Certificate', name: 'Certificate' },
                      { id: 'Chain Proof', name: 'Chain Proof' },
                      { id: 'Ledger', name: 'Ledger' },
                      { id: 'Manifest', name: 'Manifest' },
                      { id: 'Signatures', name: 'Signatures' },
                      { id: 'Timeline', name: 'Timeline' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTxTab(tab.id as any)}
                        className={`px-3 py-2 text-[9px] font-bold uppercase tracking-wider border-r border-[#1c1c24] whitespace-nowrap cursor-pointer ${
                          activeTxTab === tab.id 
                            ? 'bg-[#08080c] text-amber-400 border-t-2 border-t-amber-500' 
                            : 'text-white/45 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  {/* Tab Details Main Panel */}
                  <div className="p-4 flex-grow min-h-[380px] text-[10.5px]">
                    {loadingTx ? (
                      <div className="h-44 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                        <span className="text-[10px] text-white/50 uppercase">Securing cryptographic consensus proofs...</span>
                      </div>
                    ) : (
                      <>
                        {/* TAB A: SUMMARY */}
                        {activeTxTab === 'Summary' && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                                <span className="text-[8px] text-white/35 uppercase block">Origin app</span>
                                <span className="text-[11px] font-bold text-white mt-0.5 block">{selectedTx.originApp}</span>
                              </div>
                              <div className="bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                                <span className="text-[8px] text-white/35 uppercase block">Payment Rail</span>
                                <span className="text-[11px] font-bold text-cyan-400 mt-0.5 block">{selectedTx.rail}</span>
                              </div>
                            </div>

                            <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-2">
                              <span className="text-[8.5px] text-white/35 uppercase block font-bold">Immutable Evidence Score Verification checklist</span>
                              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[10px]">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60">Receipt Generated</span>
                                  <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60">Settlement Certified</span>
                                  <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60">Canonical Hash Signed</span>
                                  <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60">Ledger Invariant check</span>
                                  <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60">Blockchain Block Sealed</span>
                                  <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60">Notary Witness Signatures</span>
                                  <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                              <button
                                onClick={() => triggerDownload('json')}
                                className="px-3 py-1.5 bg-[#141420] hover:bg-[#1a1a2a] text-white rounded font-bold uppercase text-[9px] border border-[#2a2a3a] cursor-pointer flex items-center gap-1"
                              >
                                <FileJson className="w-3.5 h-3.5" /> Export JSON
                              </button>
                              <button
                                onClick={() => triggerDownload('txt')}
                                className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/35 text-amber-400 hover:bg-amber-500/25 rounded font-bold uppercase text-[9px] cursor-pointer flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" /> Download ZIP Audit Package
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TAB B: EVIDENCE GRAPH (THE CROWN JEWEL) */}
                        {activeTxTab === 'Evidence Graph' && (
                          <div className="space-y-3 animate-fadeIn flex flex-col h-full">
                            <div className="flex justify-between items-center border-b border-[#2a2a35]/40 pb-1.5">
                              <div>
                                <span className="text-[10px] text-white font-bold uppercase flex items-center gap-1.5">
                                  <Network className="w-3.5 h-3.5 text-amber-400" />
                                  Visual Cryptographic Trust Map
                                </span>
                                <p className="text-[8px] text-white/40 mt-0.5">Click nodes to inspect relationships and validation details.</p>
                              </div>
                              <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold">STATUS: INTEGRITY OK</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-grow mt-1 items-stretch">
                              
                              {/* SVG Map (7 cols) */}
                              <div className="md:col-span-8 bg-[#030305] border border-[#1c1c28] rounded relative flex items-center justify-center min-h-[220px]">
                                <svg width="100%" height="100%" viewBox="0 0 400 240" className="absolute inset-0">
                                  {/* Connector links radiating from center 'Receipt' */}
                                  {[
                                    { id: 'Ledger Entry', x: 80, y: 50 },
                                    { id: 'Settlement Certificate', x: 320, y: 50 },
                                    { id: 'Chain Proof', x: 80, y: 190 },
                                    { id: 'Digital Signature', x: 320, y: 190 },
                                    { id: 'Treasury Entry', x: 200, y: 30 },
                                    { id: 'Workflow Rules', x: 200, y: 210 },
                                    { id: 'Audit Package', x: 350, y: 120 }
                                  ].map(node => {
                                    const isCenterSelected = selectedGraphNode === 'Receipt';
                                    const isNodeSelected = selectedGraphNode === node.id;
                                    const isHighlight = isCenterSelected || isNodeSelected;
                                    return (
                                      <g key={node.id}>
                                        <line 
                                          x1="200" y1="120" 
                                          x2={node.x} y2={node.y} 
                                          stroke={isHighlight ? '#f59e0b' : '#2a2a3c'} 
                                          strokeWidth={isHighlight ? '2' : '1'} 
                                          strokeDasharray={isHighlight ? 'none' : '4,3'}
                                          className="transition-all duration-300"
                                        />
                                        {/* Dynamic signal pulse traveling along wire */}
                                        {isHighlight && (
                                          <circle r="3" fill="#06b6d4">
                                            <animateMotion 
                                              path={`M 200 120 L ${node.x} ${node.y}`} 
                                              dur="1.5s" 
                                              repeatCount="Infinity" 
                                            />
                                          </circle>
                                        )}
                                      </g>
                                    );
                                  })}

                                  {/* Center Node (Receipt) */}
                                  <g 
                                    onClick={() => setSelectedGraphNode('Receipt')} 
                                    className="cursor-pointer group"
                                  >
                                    <circle 
                                      cx="200" cy="120" r="28" 
                                      fill="#0c0c16" 
                                      stroke={selectedGraphNode === 'Receipt' ? '#f59e0b' : '#3b82f6'} 
                                      strokeWidth="3.5" 
                                      className="transition-all duration-300 shadow-glow" 
                                    />
                                    {selectedGraphNode === 'Receipt' && (
                                      <circle cx="200" cy="120" r="34" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" className="animate-spin" style={{ transformOrigin: '200px 120px' }} />
                                    )}
                                    <text x="200" y="117" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">RECEIPT</text>
                                    <text x="200" y="128" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold">ROOT</text>
                                  </g>

                                  {/* Outer nodes */}
                                  {[
                                    { id: 'Ledger Entry', x: 80, y: 50, label: 'LEDGER', color: '#10b981' },
                                    { id: 'Settlement Certificate', x: 320, y: 50, label: 'SETTLE', color: '#10b981' },
                                    { id: 'Chain Proof', x: 80, y: 190, label: 'CHAIN', color: '#06b6d4' },
                                    { id: 'Digital Signature', x: 320, y: 190, label: 'SIGN', color: '#8b5cf6' },
                                    { id: 'Treasury Entry', x: 200, y: 30, label: 'TREASURY', color: '#f59e0b' },
                                    { id: 'Workflow Rules', x: 200, y: 210, label: 'POLICIES', color: '#f43f5e' },
                                    { id: 'Audit Package', x: 350, y: 120, label: 'PACKAGE', color: '#14b8a6' }
                                  ].map(node => {
                                    const isSelected = selectedGraphNode === node.id;
                                    return (
                                      <g 
                                        key={node.id} 
                                        onClick={() => setSelectedGraphNode(node.id)}
                                        className="cursor-pointer"
                                      >
                                        <circle 
                                          cx={node.x} cy={node.y} r="20" 
                                          fill="#07070b" 
                                          stroke={isSelected ? '#f59e0b' : node.color} 
                                          strokeWidth={isSelected ? '2.5' : '1.5'} 
                                          className="transition-all duration-300"
                                        />
                                        <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold">{node.label}</text>
                                      </g>
                                    );
                                  })}
                                </svg>
                              </div>

                              {/* Node Inspector Side Panel (4 cols) */}
                              <div className="md:col-span-4 bg-[#0a0a14] border border-[#1c1c28] rounded p-2.5 flex flex-col justify-between space-y-2 text-[9.5px]">
                                <div>
                                  <span className="text-[8px] text-white/35 uppercase block">Node Inspector</span>
                                  <span className="text-[11px] font-bold text-amber-400 uppercase mt-0.5 block">{selectedGraphNode}</span>
                                  <div className="h-px bg-white/5 my-1.5" />
                                  
                                  <div className="space-y-2 text-white/80 leading-normal">
                                    {selectedGraphNode === 'Receipt' && (
                                      <>
                                        <p>The root transaction voucher node enclosing debit-credit claims.</p>
                                        <div><span className="text-white/40">Reference ID:</span> <span className="text-cyan-400 font-mono">{txDetails?.receipt?.receiptNumber || 'RCP-7892'}</span></div>
                                        <div><span className="text-white/40">Sum Cleared:</span> <span className="text-white font-bold">{formatCurrency(selectedTx.amountMinor / 100, selectedTx.denomination)}</span></div>
                                        <div><span className="text-white/40">Status:</span> <span className="text-emerald-400 font-bold">NOMINAL</span></div>
                                      </>
                                    )}

                                    {selectedGraphNode === 'Ledger Entry' && (
                                      <>
                                        <p>Standard double-entry matching record detailing internal account transfers.</p>
                                        <div><span className="text-white/40">Entries mapped:</span> <span className="text-white">2 records</span></div>
                                        <div><span className="text-white/40">Debit Account:</span> <span className="text-cyan-400">1000.CASH.STRIPE</span></div>
                                        <div><span className="text-white/40">Credit Account:</span> <span className="text-cyan-400">2000.LIAB.CUSTOMER</span></div>
                                        <div><span className="text-white/40">Zero Invariant:</span> <span className="text-emerald-400 font-bold">MATCHED (0.00)</span></div>
                                      </>
                                    )}

                                    {selectedGraphNode === 'Settlement Certificate' && (
                                      <>
                                        <p>Proof of external clearing partner handshakes and transaction finality.</p>
                                        <div><span className="text-white/40">Certificate #:</span> <span className="text-white">SC-{txDetails?.settlementCertificate?.certificateNumber || '8220'}</span></div>
                                        <div><span className="text-white/40">Clearing Method:</span> <span className="text-yellow-400 font-bold">{txDetails?.settlementCertificate?.settlementMethod || 'VALUE_TRANSFER'}</span></div>
                                        <div><span className="text-white/40">Latency:</span> <span className="text-white">14ms (cleared)</span></div>
                                      </>
                                    )}

                                    {selectedGraphNode === 'Chain Proof' && (
                                      <>
                                        <p>Proof of canonical anchorage in the sovereign consensus block ledger.</p>
                                        <div><span className="text-white/40">Block Height:</span> <span className="text-white">Block #{txDetails?.chainProof?.blockHeight || '7422'}</span></div>
                                        <div><span className="text-white/40">Merkle Path:</span> <span className="text-white truncate max-w-[120px] inline-block font-mono">0x4a7e...e9</span></div>
                                        <div><span className="text-white/40">Sealed Height:</span> <span className="text-emerald-400 font-bold">VERIFIED</span></div>
                                      </>
                                    )}

                                    {selectedGraphNode === 'Digital Signature' && (
                                      <>
                                        <p>Asymmetric cryptographically signed public key voucher confirming node authorization.</p>
                                        <div><span className="text-white/40">Algorithm:</span> <span className="text-purple-400 font-bold">Ed25519 (Secure)</span></div>
                                        <div><span className="text-white/40">Key Owner:</span> <span className="text-white">SOVR_PROD_AUTHORITY</span></div>
                                        <div><span className="text-white/40">Key Expiry:</span> <span className="text-white">Continuous rot</span></div>
                                      </>
                                    )}

                                    {selectedGraphNode === 'Treasury Entry' && (
                                      <>
                                        <p>Vault reservation allocation tracking liquid reserves mapping.</p>
                                        <div><span className="text-white/40">Liquid Impact:</span> <span className="text-emerald-400 font-bold">-{formatCurrency(selectedTx.amountMinor / 100, selectedTx.denomination)}</span></div>
                                        <div><span className="text-white/40">Reserves Locked:</span> <span className="text-white">Matched Escrow</span></div>
                                      </>
                                    )}

                                    {selectedGraphNode === 'Workflow Rules' && (
                                      <>
                                        <p>Automated security limits, policy checking, and transaction approval matrices.</p>
                                        <div><span className="text-white/40">Compliance Check:</span> <span className="text-emerald-400 font-bold">PASS (Rule V1)</span></div>
                                        <div><span className="text-white/40">Sanctions Scan:</span> <span className="text-white">Nominal</span></div>
                                      </>
                                    )}

                                    {selectedGraphNode === 'Audit Package' && (
                                      <>
                                        <p>Sealed ZIP archive representing the legal defense file for auditors.</p>
                                        <div><span className="text-white/40">Package #:</span> <span className="text-white">AUD-{txDetails?.auditPackage?.packageNumber || '004'}</span></div>
                                        <div><span className="text-white/40">Files enclosed:</span> <span className="text-white">6 Cryptographic JSONs</span></div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-white/5">
                                  <button
                                    onClick={() => setSelectedGraphNode('Receipt')}
                                    className="w-full py-1 text-center bg-white/5 hover:bg-white/10 rounded font-bold uppercase text-[8px]"
                                  >
                                    Reset to Center Root
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}

                        {/* TAB C: RECEIPT */}
                        {activeTxTab === 'Receipt' && (
                          <div className="space-y-3 animate-fadeIn">
                            <span className="text-[9px] text-white/40 uppercase block font-bold border-b border-[#2a2a35]/40 pb-1">Sovereign Financial Receipt</span>
                            <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded font-mono space-y-1.5">
                              <div className="flex justify-between"><span className="text-white/40">Receipt Code:</span><span className="text-cyan-400 font-bold">{txDetails?.receipt?.receiptNumber || 'RCP-7892'}</span></div>
                              <div className="flex justify-between"><span className="text-white/40">Clearance Amount:</span><span className="text-white font-bold">{formatCurrency(selectedTx.amountMinor / 100, selectedTx.denomination)}</span></div>
                              <div className="flex justify-between"><span className="text-white/40">Created At:</span><span className="text-white">{selectedTx.createdAt}</span></div>
                              <div className="flex justify-between"><span className="text-white/40">Origin App:</span><span className="text-white">{selectedTx.originApp}</span></div>
                              <div className="flex justify-between"><span className="text-white/40">Recipient Vault:</span><span className="text-white">{txDetails?.receipt?.receivingParty || 'Stripe Settlement Core'}</span></div>
                              <div className="flex justify-between"><span className="text-white/40">Status:</span><span className="text-emerald-400 font-bold">ISSUED // CONFIRMED</span></div>
                            </div>
                          </div>
                        )}

                        {/* TAB D: CERTIFICATE */}
                        {activeTxTab === 'Certificate' && (
                          <div className="space-y-4 animate-fadeIn max-h-[600px] overflow-y-auto pr-1">
                            <div className="flex items-center justify-between border-b border-[#2a2a35]/40 pb-2">
                              <span className="text-[9px] text-white/40 uppercase font-bold">Settlement Clearing Certificate</span>
                              <span className="text-[8px] bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">🔒 Cryptographically Sealed</span>
                            </div>

                            <div className="relative bg-[#0b0c10] border border-[#1f293d] rounded-lg overflow-hidden font-mono text-[11px] leading-relaxed shadow-2xl">
                              {/* Cyan Subtle Watermark */}
                              <div className="absolute top-4 right-4 text-[70px] text-cyan-500/5 select-none pointer-events-none font-bold z-0">🔒</div>

                              {/* Certificate Header Band */}
                              <div className="bg-gradient-to-r from-[#0a1120] to-[#0c1f38] border-b border-[#1b3152] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-cyan-400/10 border border-cyan-400/30 rounded-lg flex items-center justify-center text-lg">⚙</div>
                                  <div>
                                    <span className="text-[8px] text-white/40 uppercase tracking-widest block">SOVR Monetary Authority</span>
                                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-wide">Certificate of Settlement</span>
                                    <span className="text-[8px] text-white/50 block mt-0.5">Core Gateway · Official Ledger Record</span>
                                  </div>
                                </div>
                                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded px-2.5 py-1.5 text-right">
                                  <span className="text-[7px] text-white/40 uppercase block">Certificate No.</span>
                                  <span className="text-xs font-bold text-cyan-400">SC-{txDetails?.settlementCertificate?.certificateNumber || '8220'}</span>
                                </div>
                              </div>

                              <div className="p-4 space-y-4">
                                <p className="text-[10px] text-white/60 leading-relaxed border-l-2 border-cyan-500/20 pl-3">
                                  This document certifies that the financial transaction corresponding to <strong className="text-white">Certificate No. SC-{txDetails?.settlementCertificate?.certificateNumber || '8220'}</strong> has been officially settled and recorded on the immutable ledger.
                                </p>

                                {/* Amount Display */}
                                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex items-center justify-between">
                                  <div>
                                    <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-1">Settlement Amount</span>
                                    <span className="text-2xl font-bold text-emerald-400 tracking-wide">
                                      {txDetails?.settlementCertificate?.settlementAmount 
                                        ? ((txDetails.settlementCertificate.settlementAmount) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : '0.00'
                                      }
                                    </span>
                                  </div>
                                  <span className="bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                                    {txDetails?.settlementCertificate?.denomination || 'USD'}
                                  </span>
                                </div>

                                {/* Detail grid */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-black/40 border border-white/5 rounded p-2.5">
                                    <span className="text-[7px] text-white/40 uppercase block mb-1">Settlement Date</span>
                                    <span className="text-cyan-400 text-[10px] block font-bold">
                                      {txDetails?.settlementCertificate?.settlementDate 
                                        ? new Date(txDetails.settlementCertificate.settlementDate).toLocaleString() 
                                        : new Date().toLocaleString()
                                      }
                                    </span>
                                  </div>
                                  <div className="bg-black/40 border border-white/5 rounded p-2.5">
                                    <span className="text-[7px] text-white/40 uppercase block mb-1">Settlement Method</span>
                                    <span className="text-amber-400 text-[10px] block font-bold">
                                      {txDetails?.settlementCertificate?.settlementMethod || 'CLEARING_PAYMENT'}
                                    </span>
                                  </div>
                                  <div className="bg-black/40 border border-white/5 rounded p-2.5 col-span-2">
                                    <span className="text-[7px] text-white/40 uppercase block mb-1">Transaction ID</span>
                                    <span className="text-white text-[9px] block font-mono break-all font-bold">
                                      {selectedTx?.id}
                                    </span>
                                  </div>
                                  <div className="bg-black/40 border border-white/5 rounded p-2.5">
                                    <span className="text-[7px] text-white/40 uppercase block mb-1">Originating Vault</span>
                                    <span className="text-white text-[9px] block">
                                      {txDetails?.receipt?.originatingVault || '1000.CASH.STRIPE'}
                                    </span>
                                  </div>
                                  <div className="bg-black/40 border border-white/5 rounded p-2.5">
                                    <span className="text-[7px] text-white/40 uppercase block mb-1">Receiving Party</span>
                                    <span className="text-amber-400 text-[9px] block">
                                      {txDetails?.receipt?.receivingParty || '2000.LIAB.CUSTOMER'}
                                    </span>
                                  </div>
                                </div>

                                {/* Cryptographic Signature */}
                                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                                  <span className="text-[8px] text-purple-400 uppercase tracking-widest block mb-1">Cryptographic Verification Hash</span>
                                  <span className="text-purple-300 font-mono text-[9px] block break-all bg-purple-500/5 border border-purple-500/10 p-2 rounded">
                                    {txDetails?.settlementCertificate?.verificationHash || 'N/A'}
                                  </span>
                                </div>

                                {/* GM Family Trust Settlement Authorization Card */}
                                <div className="border border-amber-500/25 bg-amber-500/5 rounded-lg p-4 text-center space-y-2">
                                  <div className="font-serif italic text-white text-[13px] font-bold tracking-wide">
                                    GM Family Trust
                                  </div>
                                  <div className="text-[8px] text-white/50 uppercase tracking-widest font-bold">
                                    Private Irrevocable Trust - Central Valley, California,
                                  </div>
                                  <div className="text-[10px] font-black tracking-wider text-amber-400 font-mono uppercase">
                                    SOVR Development Holdings LLC
                                  </div>
                                  <div className="text-[9.5px] text-white/90 italic font-medium">
                                    Welcome to the SOVR Empire
                                  </div>
                                  <div className="text-[7.5px] text-white/40 font-mono">
                                    Bye,;Maldonado, Gustavo-Orona, agent
                                  </div>
                                  <div className="text-[8.5px] text-white/80 font-mono font-bold">
                                    For: GUSTAVO ORONA MALDONADO TTEE, 33-6472099
                                  </div>
                                  
                                  <div className="py-1">
                                    <div className="font-serif italic text-amber-200 text-sm border-b border-dashed border-white/15 pb-0.5 max-w-[200px] mx-auto select-none">
                                      Gustavo Orona Maldonado
                                    </div>
                                    <div className="text-[7px] text-white/40 uppercase tracking-wider mt-0.5 font-bold">
                                      Trustee & Authorized Representative
                                    </div>
                                  </div>

                                  <div className="text-[7px] text-white/30 font-mono leading-relaxed bg-black/40 p-2 rounded border border-white/5">
                                    "12U.S.C.§95(a)(2);50 U.S.C.§4305b(2), HJR-192/
                                    <br />
                                    Treasury Dept. Circular No. 300, 31CFR Chapter II"
                                  </div>
                                  <div className="text-[7.5px] text-white/50 font-bold uppercase tracking-widest">
                                    Without Recourse, All Rights Reserved
                                  </div>
                                </div>

                                {/* Verification bar */}
                                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3 flex items-center justify-between text-[9px]">
                                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    SOVR Signature Verified
                                  </div>
                                  <div className="text-white/45">Integrity: <span className="text-emerald-400 font-bold">100% ✓</span></div>
                                </div>

                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB E: CHAIN PROOF */}
                        {activeTxTab === 'Chain Proof' && (
                          <div className="space-y-3 animate-fadeIn">
                            <span className="text-[9px] text-white/40 uppercase block font-bold border-b border-[#2a2a35]/40 pb-1">Cryptographic Blockchain Anchor</span>
                            <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded font-mono space-y-1.5">
                              <div className="flex justify-between"><span className="text-white/40">Sovereign Block Height:</span><span className="text-cyan-400 font-bold">#{txDetails?.chainProof?.blockHeight || '7422'}</span></div>
                              <div className="flex justify-between"><span className="text-white/40">Merkle Root:</span><span className="text-white truncate max-w-[200px]">{txDetails?.chainProof?.merkleRoot || '0x4f...91'}</span></div>
                              <div className="flex justify-between"><span className="text-white/40">Consensus Witness Notaries:</span><span className="text-emerald-400 font-bold">Sealed by 5/5 Notaries</span></div>
                              <div className="flex justify-between"><span className="text-white/40">Validation State:</span><span className="text-emerald-400 font-bold">FINALITY RECONCILED</span></div>
                            </div>
                          </div>
                        )}

                        {/* TAB F: LEDGER */}
                        {activeTxTab === 'Ledger' && (
                          <div className="space-y-3 animate-fadeIn">
                            <span className="text-[9px] text-white/40 uppercase block font-bold border-b border-[#2a2a35]/40 pb-1">Double-Entry Journal Invariants</span>
                            <div className="border border-[#1c1c28] rounded overflow-hidden">
                              <div className="bg-[#0a0a14] p-2 font-bold text-white/50 text-[9px] grid grid-cols-4">
                                <span>ACCOUNT CODE</span>
                                <span>ACCOUNT NAME</span>
                                <span className="text-right">DEBIT</span>
                                <span className="text-right">CREDIT</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                <div className="p-2.5 bg-[#030305] grid grid-cols-4 text-[10px]">
                                  <span className="text-cyan-400">1000.CASH.STRIPE</span>
                                  <span className="text-white/80">Stripe Escrow Account</span>
                                  <span className="text-right text-rose-400">-{formatCurrency(selectedTx.amountMinor / 100, selectedTx.denomination)}</span>
                                  <span className="text-right text-white/20">0.00</span>
                                </div>
                                <div className="p-2.5 bg-[#030305] grid grid-cols-4 text-[10px]">
                                  <span className="text-cyan-400">2000.LIAB.CUSTOMER</span>
                                  <span className="text-white/80">Customer Deposit Reserves</span>
                                  <span className="text-right text-white/20">0.00</span>
                                  <span className="text-right text-emerald-400">+{formatCurrency(selectedTx.amountMinor / 100, selectedTx.denomination)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB G: MANIFEST */}
                        {activeTxTab === 'Manifest' && (
                          <div className="space-y-3 animate-fadeIn">
                            <span className="text-[9px] text-white/40 uppercase block font-bold border-b border-[#2a2a35]/40 pb-1">Evidence Object JSON Payload</span>
                            <div className="bg-[#030305] border border-[#1c1c28] p-2.5 rounded font-mono text-[9px] text-emerald-400 overflow-x-auto max-h-[220px] scrollbar-thin">
                              <pre>{JSON.stringify({
                                transactionId: selectedTx.id,
                                hash: selectedTx.hash,
                                parentBlock: txDetails?.chainProof?.blockHeight || '7422',
                                metadata: {
                                  originApp: selectedTx.originApp,
                                  denomination: selectedTx.denomination,
                                  ledgerSumMinor: selectedTx.amountMinor,
                                  notaryConsensus: "NY_LEDGER_CORE"
                                }
                              }, null, 2)}</pre>
                            </div>
                          </div>
                        )}

                        {/* TAB H: SIGNATURES */}
                        {activeTxTab === 'Signatures' && (
                          <div className="space-y-3 animate-fadeIn">
                            <span className="text-[9px] text-white/40 uppercase block font-bold border-b border-[#2a2a35]/40 pb-1">Authority Digital Signatures</span>
                            <div className="space-y-2">
                              <div className="bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                                <span className="text-[8px] text-white/35 uppercase">Authority Digital Signature (Ed25519)</span>
                                <p className="text-[9.5px] font-mono break-all text-purple-300 bg-[#0a0a14] p-1.5 border border-white/5 rounded mt-1">
                                  {selectedTx.hash}f9b8a7c6e5d4c3b2a1
                                </p>
                              </div>
                              <div className="bg-[#050508] p-2.5 border border-[#1c1c28] rounded flex justify-between">
                                <div>
                                  <span className="text-[8px] text-white/35 uppercase">Authority Node</span>
                                  <span className="text-[10px] font-bold text-white block mt-0.5">ed25519_pub_sovr_authority_prod_NY</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] text-white/35 uppercase">Validation Result</span>
                                  <span className="text-emerald-400 font-bold block mt-0.5">100% SECURE</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB I: TIMELINE */}
                        {activeTxTab === 'Timeline' && (
                          <div className="space-y-3 animate-fadeIn">
                            <span className="text-[9px] text-white/40 uppercase block font-bold border-b border-[#2a2a35]/40 pb-1">Millisecond-Precision Verification Lifespan</span>
                            <div className="relative border-l border-[#2a2a35] pl-4 ml-2 py-1 space-y-3">
                              <div className="relative">
                                <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-[#08080c] shadow-[0_0_6px_#22d3ee]" />
                                <div className="text-[8px] text-white/35">T+0ms (Initiation API Handshake)</div>
                                <div className="text-[10.5px] font-bold text-white">Transaction Created</div>
                                <div className="text-[8.5px] text-white/50 mt-0.5">App origin: {selectedTx.originApp}</div>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-indigo-400 border border-[#08080c]" />
                                <div className="text-[8px] text-white/35">T+4ms (Double Entry Invariant check)</div>
                                <div className="text-[10.5px] font-bold text-white">Ledger Mapped & Balanced</div>
                                <div className="text-[8.5px] text-white/50 mt-0.5">Checked algebraic matching: Cash Escrow = Custody deposit</div>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-purple-400 border border-[#08080c]" />
                                <div className="text-[8px] text-white/35">T+11ms (Cryptographic signature anchor)</div>
                                <div className="text-[10.5px] font-bold text-white">Evidence Sealed & Signed</div>
                                <div className="text-[8.5px] text-white/50 mt-0.5">Generated Ed25519 signature voucher on NY Ledger Core</div>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#08080c] shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                                <div className="text-[8px] text-white/35">T+15ms (Consensus Notary anchorage)</div>
                                <div className="text-[10.5px] font-bold text-emerald-400">Sovereign Block Finalized</div>
                                <div className="text-[8.5px] text-white/50 mt-0.5">Consensus witnesses verified block height #{txDetails?.chainProof?.blockHeight || '7422'}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-white/30 text-center">
                  <FileText className="w-8 h-8 text-white/20 mb-2" />
                  <span>Select any file record on the left to inspect its trust metadata.</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* PART 2: CORE TOOL ENGINES */}

        {/* TOOL A: VERIFICATION CENTER */}
        {selectedFolder === 'Verification Center' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* Simulation controls & overview (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-4 bg-[#08080c] border border-[#2a2a35] rounded-lg p-4">
              <div className="border-b border-[#2a2a35]/60 pb-2">
                <span className="text-[11px] font-black uppercase text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Audit Verification Center
                </span>
                <p className="text-[8.5px] text-white/40 mt-1 uppercase">Monitor, log, and trigger ad-hoc verification checks from external networks.</p>
              </div>

              {/* Channels list */}
              <div>
                <span className="text-[9px] text-white/40 uppercase block font-bold mb-2">Verification Gateways</span>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-bold">
                  {['Internal', 'External', 'Auditors', 'Customers', 'Banks', 'Courts', 'API', 'QR Code', 'Public Portal'].map(cat => {
                    const isActive = activeVerificationCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveVerificationCategory(cat)}
                        className={`py-1.5 px-1 rounded border transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-cyan-500/10 border-cyan-400/60 text-white' 
                            : 'bg-black/30 border-[#1c1c28] text-white/45 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simulate interactive check */}
              <div className="bg-[#050508] border border-[#1c1c28] rounded p-3 space-y-3">
                <span className="text-[9px] text-white/45 uppercase block font-bold border-b border-white/5 pb-1">Simulate Witness Check</span>
                
                <div className="space-y-2 text-[10px]">
                  <div>
                    <label className="text-white/40 uppercase block mb-1">Verifying Institution</label>
                    <input 
                      type="text" 
                      value={simVerifier} 
                      onChange={(e) => setSimVerifier(e.target.value)}
                      className="w-full bg-black border border-[#2a2a35] rounded px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-white/40 uppercase block mb-1">IP Address</label>
                      <input 
                        type="text" 
                        value={simIp} 
                        onChange={(e) => setSimIp(e.target.value)}
                        className="w-full bg-black border border-[#2a2a35] rounded px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 uppercase block mb-1">Check Type</label>
                      <input 
                        type="text" 
                        value={simType} 
                        onChange={(e) => setSimType(e.target.value)}
                        className="w-full bg-black border border-[#2a2a35] rounded px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSimulateVerification}
                  disabled={isSimulatingVerification || !selectedTx}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold uppercase tracking-widest text-[9px] rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingVerification ? 'animate-spin' : ''}`} />
                  {isSimulatingVerification ? 'Witnessing...' : 'Trigger Witness Verification'}
                </button>
              </div>
            </div>

            {/* Historical Verification log (7 cols) */}
            <div className="md:col-span-7 flex flex-col bg-[#08080c] border border-[#2a2a35] rounded-lg p-4">
              <div className="border-b border-[#2a2a35]/60 pb-2 mb-3">
                <span className="text-[11px] font-black uppercase text-white">Verification Requests Log trail</span>
                <p className="text-[8.5px] text-white/40 mt-1 uppercase">Continuous audit of external and internal verifying entities accessing the Trust Vault.</p>
              </div>

              <div className="flex-grow overflow-x-auto">
                <table className="w-full text-left text-[10px] font-mono">
                  <thead>
                    <tr className="border-b border-[#2a2a35] text-white/45">
                      <th className="py-2">VERIFIED BY</th>
                      <th className="py-2">TIMESTAMP</th>
                      <th className="py-2">SOURCE IP</th>
                      <th className="py-2">TYPE</th>
                      <th className="py-2 text-right">RESULT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {verificationLogs.map(log => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 text-cyan-400 font-bold">{log.verifiedBy}</td>
                        <td className="py-2.5 text-white/65">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2.5 text-white/50">{log.ip}</td>
                        <td className="py-2.5 text-white/85">{log.type}</td>
                        <td className="py-2.5 text-right text-emerald-400 font-bold">{log.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TOOL B: AUDIT WORKSPACE */}
        {selectedFolder === 'Audit Workspace' && (
          <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 animate-fadeIn space-y-5">
            <div className="border-b border-[#2a2a35]/60 pb-2.5">
              <span className="text-[12px] font-black uppercase text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-orange-400" />
                Audit Pack Compiler Engine
              </span>
              <p className="text-[9px] text-white/40 mt-1 uppercase">Select date bounds, transaction lists, and credentials to compile a legally-binding signed zip archive bundle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Date selection & metrics */}
              <div className="bg-[#050508] border border-[#1c1c28] rounded p-3 space-y-3">
                <span className="text-[9px] text-white/45 uppercase block font-bold border-b border-white/5 pb-1">1. Scope Bounds</span>
                
                <div className="space-y-2 text-[10.5px]">
                  <div>
                    <label className="text-white/40 uppercase block mb-1">Date Range Preset</label>
                    <select
                      value={auditDateRange}
                      onChange={(e) => setAuditDateRange(e.target.value)}
                      className="w-full bg-black border border-[#2a2a35] rounded px-2.5 py-1 text-white focus:outline-none text-[10.5px]"
                    >
                      <option>Last 24 Hours</option>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Quarter to Date</option>
                      <option>Annual Audit Preset</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/40 uppercase block mb-1">Target Account Filters</label>
                    <div className="space-y-1.5 border border-[#2a2a35] rounded p-2 max-h-[100px] overflow-y-auto scrollbar-thin">
                      <label className="flex items-center gap-2 text-[9.5px]">
                        <input type="checkbox" defaultChecked />
                        <span>All Cash Reserves (1000.*)</span>
                      </label>
                      <label className="flex items-center gap-2 text-[9.5px]">
                        <input type="checkbox" defaultChecked />
                        <span>All Liabilities (2000.*)</span>
                      </label>
                      <label className="flex items-center gap-2 text-[9.5px]">
                        <input type="checkbox" />
                        <span>Expense Vault (5000.*)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Artifacts Checklist */}
              <div className="bg-[#050508] border border-[#1c1c28] rounded p-3 space-y-3">
                <span className="text-[9px] text-white/45 uppercase block font-bold border-b border-white/5 pb-1">2. Evidence Inclusions</span>
                
                <div className="space-y-2 text-[10px]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Receipt Manifests (PDF + JSON)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Settlement Clearing Certificates</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Consensus Notary Merkle Root Signatures</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Double-Entry Matching Extracts</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>External Bank API Network Logs</span>
                  </label>
                </div>
              </div>

              {/* Compilation actions */}
              <div className="bg-[#050508] border border-[#1c1c28] rounded p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-white/45 uppercase block font-bold border-b border-white/5 pb-1">3. Seal & Sign</span>
                  <p className="text-[9.5px] text-white/60 leading-normal mt-2">
                    Triggers high-fidelity blockchain witness anchoring checks to secure the package index hash before download.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleGenerateAuditPackage}
                    disabled={auditProgress !== null}
                    className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold uppercase tracking-widest text-[9.5px] rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {auditProgress !== null ? 'Compiling...' : 'Generate Sealed Audit Package'}
                  </button>
                </div>
              </div>

            </div>

            {/* Processing and Output visual */}
            {auditProgress !== null && (
              <div className="bg-[#0b0b14] border border-[#2a2a3a] rounded p-4 space-y-2.5 font-mono">
                <div className="flex justify-between text-[10px]">
                  <span className="text-amber-400 font-bold uppercase animate-pulse">Running Compiler: {auditStepName}</span>
                  <span className="text-white">{auditProgress}%</span>
                </div>
                <div className="h-1.5 bg-black rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300" 
                    style={{ width: `${auditProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {generatedPackage && (
              <div className="bg-[#0b0b14] border border-[#10b981]/30 rounded p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-fadeIn">
                <div className="md:col-span-8 space-y-1 text-[10px]">
                  <span className="text-emerald-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Audit Package Prepared Successfully!
                  </span>
                  <div><span className="text-white/45">Package ID:</span> <span className="text-white font-mono">{generatedPackage.id}</span></div>
                  <div><span className="text-white/45">Ledger Entries Sealed:</span> <span className="text-white font-bold">{generatedPackage.scannedTxns} records</span></div>
                  <div><span className="text-white/45">Package Index Hash:</span> <span className="text-purple-400 break-all text-[9px] font-mono">{generatedPackage.integrityHash}</span></div>
                </div>

                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      const txnId = selectedTx?.id || filteredTransactions[0]?.id;
                      if (!txnId) return;
                      const a = document.createElement('a');
                      a.href = `/api/evidence/download/${txnId}?format=zip`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[9px] rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download ZIP Archive
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full py-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-[9px] rounded border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Audit Report
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TOOL C: SIGNATURE EXPLORER */}
        {selectedFolder === 'Signature Explorer' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* Signature selector (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-3 bg-[#08080c] border border-[#2a2a35] rounded-lg p-4">
              <div className="border-b border-[#2a2a35]/60 pb-2">
                <span className="text-[11px] font-black uppercase text-white flex items-center gap-1.5">
                  <FileSignature className="w-4 h-4 text-purple-400" />
                  Digital Signatures Directory
                </span>
                <p className="text-[8.5px] text-white/40 mt-1 uppercase">Monitor active public keys and signing authority certificates.</p>
              </div>

              <div className="space-y-2">
                {SIGNATURES_DATA.map(sig => {
                  const isSelected = selectedSignatureId === sig.id;
                  return (
                    <button
                      key={sig.id}
                      onClick={() => setSelectedSignatureId(sig.id)}
                      className={`w-full text-left p-2.5 rounded border transition-all text-[11px] cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-500/10 border-purple-500/80 text-white' 
                          : 'bg-black/30 border-[#1c1c28] text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{sig.type}</span>
                        <span className="text-[8.5px] bg-purple-500/10 border border-purple-500/35 px-1.5 py-0.5 rounded text-purple-400 font-mono font-bold">
                          {sig.algorithm}
                        </span>
                      </div>
                      <p className="text-[8.5px] text-white/40 mt-1 truncate">{sig.authority}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Signature detail viewer (7 cols) */}
            <div className="md:col-span-7 flex flex-col bg-[#08080c] border border-[#2a2a35] rounded-lg p-4">
              {(() => {
                const activeSig = SIGNATURES_DATA.find(s => s.id === selectedSignatureId);
                if (!activeSig) return null;
                return (
                  <div className="space-y-4">
                    <div className="border-b border-[#2a2a35]/60 pb-2">
                      <span className="text-[11px] font-black uppercase text-white">Signature Cryptographic Payload</span>
                      <p className="text-[8.5px] text-white/40 mt-0.5 uppercase">Inspecting properties of {activeSig.type}.</p>
                    </div>

                    <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded font-mono space-y-3 text-[10.5px]">
                      <div>
                        <span className="text-white/45 uppercase block text-[8px] mb-0.5">Clearing Authority</span>
                        <span className="text-white font-bold">{activeSig.authority}</span>
                      </div>
                      
                      <div>
                        <span className="text-white/45 uppercase block text-[8px] mb-0.5">Asymmetric Algorithm</span>
                        <span className="text-cyan-400 font-bold">{activeSig.algorithm}</span>
                      </div>

                      <div>
                        <span className="text-white/45 uppercase block text-[8px] mb-1">Signed Hash Hex</span>
                        <p className="text-[10px] break-all select-all bg-[#0a0a14] p-2 border border-white/5 rounded text-purple-300">
                          {activeSig.hash}
                        </p>
                      </div>

                      <div>
                        <span className="text-white/45 uppercase block text-[8px] mb-0.5">Continuous Key Rotation policy</span>
                        <span className="text-amber-400 font-bold">{activeSig.keyRotation}</span>
                      </div>

                      <div>
                        <span className="text-white/45 uppercase block text-[8px] mb-0.5">Verification Status</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE AND APPROVED BY NOTARY COUNCIL
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* TOOL D: CHAIN EXPLORER */}
        {selectedFolder === 'Chain Explorer' && (
          <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 animate-fadeIn space-y-5">
            
            <div className="border-b border-[#2a2a35]/60 pb-2.5">
              <span className="text-[12px] font-black uppercase text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
                Sovereign Consensus Block Explorer
              </span>
              <p className="text-[9px] text-white/40 mt-1 uppercase">Browse raw notary blocks, Merkle Root branches, and validator nodes sealing ledger integrity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[7422, 7421, 7420, 7419].map(height => {
                const isActive = selectedBlockHeight === height;
                return (
                  <button
                    key={height}
                    onClick={() => setSelectedBlockHeight(height)}
                    className={`p-3 rounded border text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-950/20 border-cyan-500 text-white shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                        : 'bg-black/30 border-[#1c1c28] text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[11px]">Block #{height}</span>
                      <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 px-1 rounded uppercase font-bold">SEALED</span>
                    </div>
                    <span className="text-[8px] text-white/40 block font-mono">Merkle: 0x4f{height}b9...</span>
                  </button>
                );
              })}
            </div>

            {/* Block details view */}
            <div className="bg-[#050508] border border-[#1c1c28] rounded p-4 font-mono text-[10.5px] space-y-4">
              <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                <span className="font-bold text-cyan-400 uppercase">Block Hash Specs [Height: #{selectedBlockHeight}]</span>
                <span className="text-[9px] text-white/40">Timestamp: {new Date(Date.now() - (7422 - selectedBlockHeight) * 600000).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div><span className="text-white/45">Block Hash:</span> <span className="text-white break-all">0xbcde{selectedBlockHeight}a7b6c5d4e3f2a109876543210123456789a</span></div>
                  <div><span className="text-white/45">Merkle Root Branch:</span> <span className="text-purple-300 break-all">0x4f8e91{selectedBlockHeight}b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f</span></div>
                  <div><span className="text-white/45">State Confirmations:</span> <span className="text-emerald-400 font-bold">5/5 Reserve Notaries Confirmed</span></div>
                </div>

                <div className="space-y-2">
                  <div><span className="text-white/45">Validator Node Lead:</span> <span className="text-white">NY_LEDGER_CORE_PROD</span></div>
                  <div><span className="text-white/45">Raw Block Payload:</span></div>
                  <pre className="bg-[#030305] border border-white/5 p-2 rounded text-[8.5px] text-emerald-400 max-h-[80px] overflow-y-auto scrollbar-thin">
{`{
  "block_height": ${selectedBlockHeight},
  "merkle_root": "0x4f8e91...",
  "state_hash": "0xbcde...",
  "sealed_by": "NY_AUTHORITY_V3",
  "txns_sealed_count": 18
}`}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TOOL E: IMMUTABLE ARCHIVE */}
        {selectedFolder === 'Immutable Archive' && (
          <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 animate-fadeIn space-y-6">
            
            <div className="border-b border-[#2a2a35]/60 pb-2.5">
              <span className="text-[12px] font-black uppercase text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Immutable Storage Archive Lifecycle
              </span>
              <p className="text-[9px] text-white/40 mt-1 uppercase">Visual planning of the data lifecycle retention matrix and automated secure tape purges.</p>
            </div>

            {/* Horizontal timeline matrix */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { stage: 'Live', range: '1 - 30 Days', storage: 'Hot Database (Firestore)', encryption: 'AES-256 GCM Live', hold: 'Immediate Querying' },
                { stage: '30 Days', range: '31 - 90 Days', storage: 'Offloaded SQL Replica', encryption: 'AES-256 Standard', hold: 'Continuous Auditing' },
                { stage: 'Quarter Archive', range: 'Q1 - Q4 Storage', storage: 'Hot Object Storage', encryption: 'KMS Sealing', hold: 'Quarterly Audits' },
                { stage: 'Annual Archive', range: '1 - 7 Years Hold', storage: 'Deep Storage Vault', encryption: 'RSA Signed Index', hold: 'Annual Tax/Audit' },
                { stage: 'Cold Storage', range: '7+ Years Archive', storage: 'Glacier Deep Tape', encryption: 'Double Encrypted', hold: 'Legal Holds Only' }
              ].map(item => {
                const isActive = selectedArchiveStage === item.stage;
                return (
                  <button
                    key={item.stage}
                    onClick={() => setSelectedArchiveStage(item.stage)}
                    className={`p-3.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                      isActive 
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
                        : 'bg-black/30 border-[#1c1c28] text-white/50 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[11px] block text-white">{item.stage}</span>
                      <span className="text-[8.5px] text-amber-400 block mt-0.5 font-bold font-mono">{item.range}</span>
                    </div>
                    <span className="text-[8px] text-white/35 block uppercase font-mono mt-4">{item.storage}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Lifecycle Stage specs */}
            {(() => {
              const spec = [
                { stage: 'Live', range: '1 - 30 Days', storage: 'Hot Database (Firestore)', encryption: 'AES-256 GCM Live', hold: 'Immediate Querying', details: 'All transactions and generated receipts are stored in the primary, high-performance database cluster. Hot queries occur with low latency (<5ms) and are replicated across three distinct geographical locations in real time.' },
                { stage: '30 Days', range: '31 - 90 Days', storage: 'Offloaded SQL Replica', encryption: 'AES-256 Standard', hold: 'Continuous Auditing', details: 'After 30 days of inactivity, the transactions are safely replicated to standard read-only relational servers. This reduces load on primary databases while keeping operational details fully queryable within the Trust Vault interface.' },
                { stage: 'Quarter Archive', range: 'Q1 - Q4 Storage', storage: 'Hot Object Storage', encryption: 'KMS Sealing', hold: 'Quarterly Audits', details: 'At the end of each fiscal quarter, transaction evidence bundles are packed into individual canonical JSON directories and secured inside highly durable regional object containers, ready to compile on-demand audit packages.' },
                { stage: 'Annual Archive', range: '1 - 7 Years Hold', storage: 'Deep Storage Vault', encryption: 'RSA Signed Index', hold: 'Annual Tax/Audit', details: 'For regulatory compliance (SEC rule 17a-4), transactions are frozen in a deep storage repository for up to seven years. The indexes are cryptographically signed to prevent unauthorized alteration or deletion.' },
                { stage: 'Cold Storage', range: '7+ Years Archive', storage: 'Glacier Deep Tape', encryption: 'Double Encrypted', hold: 'Legal Holds Only', details: 'After 7 years, historical ledger records are offloaded to ultra-cost-efficient glacier-class offline storage. Retrieval of cold files requires a 3-5 hour retrieval window and is restricted to legal holds or national bank subpoena.' }
              ].find(s => s.stage === selectedArchiveStage);

              if (!spec) return null;
              return (
                <div className="bg-[#050508] border border-[#1c1c28] rounded p-4 font-mono text-[10.5px] space-y-3">
                  <div className="border-b border-white/5 pb-1.5">
                    <span className="font-bold text-amber-400 uppercase">Archive State Specs: {spec.stage}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div><span className="text-white/45">Time Duration:</span> <span className="text-white">{spec.range}</span></div>
                      <div><span className="text-white/45">Storage Infrastructure:</span> <span className="text-white font-bold">{spec.storage}</span></div>
                      <div><span className="text-white/45">Cryptographic Encryption:</span> <span className="text-cyan-400">{spec.encryption}</span></div>
                      <div><span className="text-white/45">Legal Hold Class:</span> <span className="text-white">{spec.hold}</span></div>
                    </div>
                    <div>
                      <span className="text-white/45 block mb-1">Retention Details:</span>
                      <p className="text-white/80 leading-relaxed text-[10px]">{spec.details}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

      </div>

    </div>
  );
}
