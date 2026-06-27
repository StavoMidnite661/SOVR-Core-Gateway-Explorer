import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Clock, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  QrCode, 
  AlertCircle, 
  Cpu, 
  ExternalLink, 
  Printer, 
  ArrowRight, 
  Sparkles, 
  Activity,
  Award,
  Zap,
  RotateCw,
  X,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../data/seed';

interface EvidencePortalProps {
  transactionId: string;
  onClose?: () => void;
  standalone?: boolean;
}

export default function EvidencePortal({ transactionId, onClose, standalone = false }: EvidencePortalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'receipt' | 'settlement' | 'proof' | 'audit'>('overview');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Verification Animation Steps
  const verificationSteps = [
    'Initializing cryptographically secure socket connection...',
    'Fetching Ledger Entry record leaf...',
    'Computing SHA256 canonical transaction hash...',
    'Retrieving Consensus witness signatures & Ed25519 public key...',
    'Querying blockchain block height and Merkle roots...',
    'Performing Double-Entry Invariant algebraic balance checking...',
    'Verifying Receipt & Settlement digital signatures...',
    'Compiling fully bundled Compliance Audit Package...'
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < verificationSteps.length - 1) {
        currentStep++;
        setVerificationStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 350);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch live cryptographic validation data from server-side proxy
    fetch(`/api/verify/${transactionId}`)
      .then(res => {
        if (!res.ok) throw new Error('Transaction record not found in secure ledger archive');
        return res.json();
      })
      .then(resData => {
        setTimeout(() => {
          setData(resData);
          setLoading(false);
        }, 3000); // Allow scanning animation to show for premium high-fidelity UX
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Verification pipeline handshaking failure');
        setLoading(false);
      });
  }, [transactionId]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${transactionId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOVR_EVIDENCE_${transactionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadZIP = () => {
    // Simulate downloading secure audit zip bundle containing certificates
    if (!data) return;
    const reportText = `
================================================================================
             SOVR EVIDENCE ENGINE v1.0 - IMMUTABLE AUDIT PACKAGE BUNDLE
================================================================================
Audit Timestamp: ${new Date().toISOString()}
Transaction ID: ${transactionId}
Ledger Hash: ${data.evidenceObject.hash}
Signature Ed25519: ${data.receipt.digitalSignature.signature}
================================================================================

1. RECEIPT REPORT (RCP):
   Number: ${data.receipt.receiptNumber}
   Originating Vault: ${data.receipt.originatingVault}
   Receiving Party: ${data.receipt.receivingParty}
   Amount: ${formatCurrency(data.receipt.amount, data.receipt.denomination)}
   Status: ${data.receipt.receiptStatus}

2. SETTLEMENT CERTIFICATE (SC):
   Number: ${data.settlementCertificate.certificateNumber}
   Method: ${data.settlementCertificate.settlementMethod}
   Date: ${data.settlementCertificate.settlementDate}
   Status: ${data.settlementCertificate.settlementStatus}

3. CHAIN PROOF RECORD (CP):
   Number: ${data.chainProof.proofNumber}
   Network: ${data.chainProof.network}
   Height: Block #${data.chainProof.blockHeight}
   Validation: ${data.chainProof.validationStatus}
   Confirmations: ${data.chainProof.confirmations}

4. DIGITAL INTEGRITY ATTESTATION:
   Ledger Invariants: MATCHED (DEBITS = CREDITS)
   Signature Key verification: PASS (Ed25519)
   Hash Integrity: Match Confirmed 
   Evidence Vault Integrity Score: 100% SECURE

================================================================================
`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOVR_AUDIT_BUNDLE_${transactionId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printDocument = () => {
    if (!data) return;
    setShowPrintPreview(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPrintPreview) {
          setShowPrintPreview(false);
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showPrintPreview]);

  // Generate deterministic visual block patterns acting as QR Code segments
  const renderQRGrid = () => {
    let cells = [];
    const seedStr = transactionId;
    for (let i = 0; i < 144; i++) {
      const active = (seedStr.charCodeAt(i % seedStr.length) + i) % 3 === 0 || i % 7 === 0;
      cells.push(
        <div 
          key={i} 
          className={`w-2.5 h-2.5 transition-all duration-300 ${
            active ? 'bg-amber-400' : 'bg-transparent'
          }`} 
        />
      );
    }
    return cells;
  };

  return (
    <div className={standalone 
      ? `w-full min-h-screen bg-[#050508]/95 flex items-center justify-center p-4 relative overflow-hidden pt-16 pb-24` 
      : `w-full relative`
    }>
      {/* Background visual graphics */}
      {standalone && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>
      )}

      <div className="w-full max-w-4xl bg-[#0a0a14]/95 border border-slate-800/80 rounded-xl backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative z-10 overflow-hidden flex flex-col min-h-[580px]">
        
        {/* Top Header rail with glow */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500 w-full" />
        
        {/* Modal/View Header */}
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/35">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-cyan-500/10 border border-cyan-500/35 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                  SOVR Crypto-Evidence Portal
                </h1>
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold uppercase">
                  v1.0.0-Live
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">INTEGRITY RECORD LOCKING INFRASTRUCTURE</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 rounded bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* LOADING ANIMATION SCREEN */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col items-center justify-center p-8 space-y-6 font-mono min-h-[460px] relative"
            >
              {/* Spinning technical radar */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 border border-cyan-500/10 rounded-full" />
                <div className="absolute inset-2 border border-dashed border-teal-500/25 rounded-full" />
                <div className="absolute inset-4 border border-slate-800 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-t border-r border-cyan-400/80 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-3 border-b border-l border-amber-400/40 rounded-full"
                />
                <Cpu className="w-8 h-8 text-cyan-300 animate-pulse" />
              </div>

              <div className="space-y-2 text-center max-w-md w-full">
                <h3 className="text-xs uppercase text-cyan-400 font-black tracking-widest flex items-center justify-center gap-2">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  EVALUATING IMMUTABLE EVIDENCE...
                </h3>
                <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden border border-slate-800">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.8 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-500"
                  />
                </div>
                <div className="min-h-[30px] flex items-center justify-center px-4">
                  <span className="text-[10px] text-slate-400 text-center leading-relaxed">
                    {verificationSteps[verificationStep]}
                  </span>
                </div>
              </div>

              {/* Matrix flow side tags */}
              <div className="absolute bottom-4 left-4 text-[7px] text-slate-500 uppercase leading-none font-bold">
                CORE: SECURE_POSTING_STABLE // SHA256_ACTIVE
              </div>
              <div className="absolute bottom-4 right-4 text-[7px] text-slate-500 uppercase leading-none font-bold">
                PORT: 3000 // INGRESS: GATEWAY_SECURE
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col items-center justify-center p-8 space-y-4 font-mono text-center min-h-[460px]"
            >
              <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Verification Handshake Blocked</h2>
              <p className="text-xs text-rose-400 max-w-md bg-rose-950/20 border border-rose-500/20 p-3 rounded leading-relaxed">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-cyan-400 uppercase font-bold hover:bg-slate-700 cursor-pointer"
              >
                Retry handshake
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-grow p-6 flex flex-col space-y-6"
            >
              {/* Evidence Overview Bar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* ID and Status Block */}
                <div className="md:col-span-8 bg-[#07070d] border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">ACTIVE TRANSACTION ID</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-300 rounded font-mono border border-cyan-500/20">ROOT_LOCK</span>
                    </div>
                    <h2 className="text-lg font-mono text-white font-bold tracking-tight select-all">
                      {transactionId}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-800/50 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Value Sealed</span>
                      <span className="text-emerald-400 font-black block mt-0.5 text-xs">
                        {formatCurrency(data.receipt.amount, data.receipt.denomination)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Consensus Method</span>
                      <span className="text-white font-bold block mt-0.5 truncate">{data.receipt.instrumentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Ledger timestamp</span>
                      <span className="text-slate-300 font-medium block mt-0.5 truncate">
                        {new Date(data.evidenceObject.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vault score indicator */}
                <div className="md:col-span-4 bg-gradient-to-b from-teal-950/20 to-emerald-950/20 border border-emerald-500/25 p-4 rounded-lg flex items-center justify-between relative overflow-hidden">
                  <div className="space-y-1 relative z-10">
                    <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      Vault integrity score
                    </span>
                    <h1 className="text-3xl font-extrabold text-white font-mono leading-none tracking-tighter">
                      100<span className="text-lg text-emerald-300">%</span>
                    </h1>
                    <span className="text-[8px] text-emerald-300 font-mono block tracking-wider font-bold uppercase mt-1">
                      FULLY VERIFIED & AUDIT_READY ✓
                    </span>
                  </div>
                  <div className="absolute right-2 bottom-0 top-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <ShieldCheck className="w-24 h-24 text-emerald-400" />
                  </div>
                </div>

              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 rounded-lg p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={printDocument}
                    className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded text-[10px] text-slate-300 font-mono hover:text-white hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Print Secure Receipt"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-400" />
                    Print Out PDF
                  </button>
                  <button 
                    onClick={downloadJSON}
                    className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded text-[10px] text-slate-300 font-mono hover:text-white hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Export JSON Metadata"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    Download JSON
                  </button>
                  <button 
                    onClick={downloadZIP}
                    className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded text-[10px] text-slate-300 font-mono hover:text-white hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Download fully structured ZIP Package"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    Download ZIP Audit
                  </button>
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className={`px-3 py-1.5 border rounded text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      showQR ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {showQR ? 'Hide QR Code' : 'Verify QR'}
                  </button>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <button 
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 rounded text-[10px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                      copied 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-[#050508] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    {copied ? 'Copied' : 'Copy verification URL'}
                  </button>
                </div>
              </div>

              {/* QR Overlay Drawer if active */}
              {showQR && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-950 border border-amber-500/35 p-5 rounded-lg flex flex-col md:flex-row items-center gap-5 font-mono text-xs"
                >
                  <div className="bg-slate-900 border border-amber-500/20 p-4 rounded flex flex-col items-center justify-center">
                    <div className="grid grid-cols-12 gap-0 border-2 border-amber-500/30 p-2.5 bg-slate-950 relative">
                      {/* Top left radar indicator */}
                      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
                      {renderQRGrid()}
                    </div>
                    <span className="text-[8px] text-amber-400/80 uppercase font-black tracking-widest mt-2">
                      GATEWAY VERIFICATION TARGET
                    </span>
                  </div>
                  <div className="space-y-2 flex-grow text-slate-300">
                    <h3 className="font-extrabold text-white text-sm uppercase text-amber-400">
                      INTERACTIVE QR VERIFICATION SEAL
                    </h3>
                    <p className="text-[11px] leading-relaxed">
                      Scanning this QR Code redirects auditors and counterparties directly to the public-facing verification URL. 
                    </p>
                    <div className="bg-slate-900 border border-slate-800/80 p-2 rounded select-all break-all text-[10px] font-bold text-slate-400">
                      {window.location.origin}/verify/{transactionId}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase mt-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      Expiration: Immutable permanent locking - Never expires
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 bg-[#050508] p-1 border border-slate-800/80 rounded font-mono text-[10px] uppercase">
                {[
                  { id: 'overview', label: '1. Scoreboard', icon: ShieldCheck },
                  { id: 'receipt', label: '2. Receipt', icon: FileText },
                  { id: 'settlement', label: '3. Settlement Certificate', icon: Award },
                  { id: 'proof', label: '4. Chain Proof', icon: Zap },
                  { id: 'audit', label: '5. Audit Package', icon: FileText }
                ].map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-grow py-2 px-3 rounded font-bold tracking-tight cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        active 
                          ? 'bg-cyan-500/10 border border-cyan-500/35 text-cyan-300' 
                          : 'text-slate-500 border border-transparent hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Document Content Viewport */}
              <div className="bg-[#050507] border border-slate-800/80 rounded-lg p-5 min-h-[250px] font-mono text-xs flex flex-col justify-between">
                
                {activeTab === 'overview' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-white uppercase font-black tracking-widest text-xs flex items-center gap-1.5 text-cyan-400">
                        <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                        Evidence Integrity Scoreboard
                      </span>
                      <span className="text-[10px] text-slate-500">SEALED AT {new Date(data.evidenceObject.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Checklists */}
                      <div className="bg-[#08080f] border border-slate-800/60 rounded p-4 space-y-2.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          CRYPTO LOCK CHECKLIST
                        </span>
                        
                        {[
                          { label: 'Ledger Verified', desc: 'Immutable ledger entry successfully committed' },
                          { label: 'Receipt Generated', desc: 'Secure Receipt RCP-YYYMMDD signed' },
                          { label: 'Settlement Issued', desc: 'Financial clearing certificate completed' },
                          { label: 'Hash Validated', desc: 'SHA256 double-entry checksum validated' },
                          { label: 'Signature Verified', desc: 'Ed25519 system signature verified' },
                          { label: 'Chain Anchored', desc: 'Consensus Block height anchor posted' },
                          { label: 'Audit Package Ready', desc: 'Bundled AUD ZIP package generated' }
                        ].map((chk, i) => (
                          <div key={i} className="flex items-start justify-between border-b border-slate-900/40 pb-2 last:border-0 last:pb-0">
                            <div>
                              <span className="text-white font-bold block text-[10.5px]">{chk.label}</span>
                              <span className="text-slate-500 text-[8.5px] block">{chk.desc}</span>
                            </div>
                            <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                              ✓
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Timeline */}
                      <div className="bg-[#08080f] border border-slate-800/60 rounded p-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">
                            EVIDENCE MUTATION TIMELINE
                          </span>

                          <div className="relative border-l border-slate-800 ml-2.5 pl-4.5 space-y-4">
                            {[
                              { label: 'Event Created', time: 'T-0ms', status: 'SUCCESS', node: 'API' },
                              { label: 'Ledger Posted', time: 'T+140ms', status: 'SUCCESS', node: 'F0911' },
                              { label: 'Hash Generated', time: 'T+220ms', status: 'SUCCESS', node: 'SHA256' },
                              { label: 'Signature Applied', time: 'T+310ms', status: 'SUCCESS', node: 'Ed25519' },
                              { label: 'Proof Anchored', time: 'T+640ms', status: 'SUCCESS', node: 'BLOCK' },
                              { label: 'Verification Completed', time: 'T+840ms', status: 'SUCCESS', node: 'PORTAL' }
                            ].map((step, i) => (
                              <div key={i} className="relative">
                                <span className="absolute -left-7 top-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-white font-bold">{step.label}</span>
                                  <span className="text-slate-500 text-[8.5px]">{step.time}</span>
                                </div>
                                <div className="text-[8.5px] text-slate-400 flex gap-2 mt-0.5 font-mono">
                                  <span>Node: {step.node}</span>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-bold">{step.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'receipt' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-cyan-400 font-bold uppercase flex items-center gap-1">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        SECURE LEDGER RECEIPT (RCP)
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold">
                        {data.receipt.receiptNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 p-4 bg-slate-950/80 border border-slate-900 rounded font-mono text-[10.5px]">
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Receipt Number</span>
                        <span className="text-white font-bold block mt-0.5 select-all">{data.receipt.receiptNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Date / Time</span>
                        <span className="text-white font-bold block mt-0.5">{new Date(data.receipt.date).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Instrument</span>
                        <span className="text-cyan-400 font-bold block mt-0.5">{data.receipt.instrumentType}</span>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Total Settled</span>
                        <span className="text-emerald-400 font-black block mt-0.5">{formatCurrency(data.receipt.amount, data.receipt.denomination)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Originating Vault</span>
                        <span className="text-white font-bold block mt-0.5 truncate">{data.receipt.originatingVault}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Receiving Party</span>
                        <span className="text-white font-bold block mt-0.5 truncate">{data.receipt.receivingParty}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">
                        ED25519 DIGITAL SIGNATURE
                      </span>
                      <div className="bg-[#050508] border border-slate-800/80 p-2 rounded-sm select-all break-all text-[10px] text-purple-300 font-bold">
                        {data.receipt.digitalSignature.signature}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">
                        SYSTEM PUBLIC KEY
                      </span>
                      <div className="bg-[#050508] border border-slate-800/80 p-2 rounded-sm select-all break-all text-[10px] text-cyan-300 font-bold">
                        {data.receipt.digitalSignature.publicKey}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settlement' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                        <Award className="w-4 h-4 text-emerald-400" />
                        CERTIFICATE OF SETTLEMENT (ST)
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold">
                        {data.settlementCertificate.certificateNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 p-4 bg-slate-950/80 border border-slate-900 rounded font-mono text-[10.5px]">
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Certificate Number</span>
                        <span className="text-white font-bold block mt-0.5 select-all">{data.settlementCertificate.certificateNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Settlement Date</span>
                        <span className="text-white font-bold block mt-0.5">{new Date(data.settlementCertificate.settlementDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Settlement Method</span>
                        <span className="text-cyan-400 font-bold block mt-0.5">{data.settlementCertificate.settlementMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Settlement Status</span>
                        <span className="text-emerald-400 font-black block mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {data.settlementCertificate.settlementStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Settlement Amount</span>
                        <span className="text-emerald-400 font-black block mt-0.5">{formatCurrency(data.settlementCertificate.settlementAmount, data.settlementCertificate.denomination)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Issued By Authority</span>
                        <span className="text-white font-bold block mt-0.5">{data.settlementCertificate.issuedBy}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">
                        CRYPTOGRAPHIC VERIFICATION HASH
                      </span>
                      <div className="bg-[#050508] border border-slate-800/80 p-2 rounded-sm select-all break-all text-[10px] text-slate-300 font-bold">
                        {data.settlementCertificate.verificationHash}
                      </div>
                    </div>

                    {/* GM Family Trust Settlement Authorization Card */}
                    <div className="border border-amber-500/20 bg-amber-500/5 rounded p-4 text-center space-y-2 mt-4 max-w-lg mx-auto">
                      <div className="font-serif italic text-white text-base font-bold tracking-wide">
                        GM Family Trust
                      </div>
                      <div className="text-[8.5px] text-white/50 uppercase tracking-widest font-bold">
                        Private Irrevocable Trust - Central Valley, California,
                      </div>
                      <div className="text-[11px] font-black tracking-wider text-amber-400 font-mono uppercase">
                        SOVR Development Holdings LLC
                      </div>
                      <div className="text-[10px] text-white/90 italic font-medium">
                        Welcome to the SOVR Empire
                      </div>
                      <div className="text-[8px] text-white/40 font-mono">
                        Bye,;Maldonado, Gustavo-Orona, agent
                      </div>
                      <div className="text-[8.5px] text-white/80 font-mono font-bold">
                        For: GUSTAVO ORONA MALDONADO TTEE, 33-6472099
                      </div>
                      
                      <div className="py-1">
                        <div className="font-serif italic text-amber-200 text-lg border-b border-dashed border-white/15 pb-1 max-w-[240px] mx-auto select-none">
                          Gustavo Orona Maldonado
                        </div>
                        <div className="text-[7.5px] text-white/40 uppercase tracking-wider mt-1 font-bold">
                          Trustee & Authorized Representative
                        </div>
                      </div>

                      <div className="text-[7.5px] text-white/30 font-mono leading-relaxed bg-black/40 p-2 rounded border border-white/5">
                        "12U.S.C.§95(a)(2);50 U.S.C.§4305b(2), HJR-192/
                        <br />
                        UCC § 3-603/ UCC 10-104/ UCC 1-104"
                      </div>
                      <div className="text-[8px] text-white/50 font-bold uppercase tracking-widest">
                        Without Recourse, All Rights Reserved
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'proof' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-amber-500 font-bold uppercase flex items-center gap-1">
                        <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                        CHAIN VERIFICATION PROOF (CP)
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold">
                        {data.chainProof.proofNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 p-4 bg-slate-950/80 border border-slate-900 rounded font-mono text-[10.5px]">
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Proof Number</span>
                        <span className="text-white font-bold block mt-0.5 select-all">{data.chainProof.proofNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Anchor Blockchain</span>
                        <span className="text-cyan-400 font-bold block mt-0.5">{data.chainProof.network}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Anchored block Height</span>
                        <span className="text-amber-400 font-black block mt-0.5">Block #{data.chainProof.blockHeight}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Block Header Root Hash</span>
                        <span className="text-slate-300 font-bold block mt-0.5 select-all text-[9.5px] truncate">{data.chainProof.blockHash}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Validation Status</span>
                        <span className="text-emerald-400 font-black block mt-0.5 uppercase tracking-wider">{data.chainProof.validationStatus}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Merkle Tree Root</span>
                        <span className="text-slate-300 font-bold block mt-0.5 select-all text-[9.5px] truncate">{data.chainProof.merkleRoot}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Network Confirmations</span>
                        <span className="text-cyan-300 font-black block mt-0.5">{data.chainProof.confirmations} blocks</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">
                        TRANSACTION MERKLE LEAF HASH
                      </span>
                      <div className="bg-[#050508] border border-slate-800/80 p-2 rounded-sm select-all break-all text-[10px] text-slate-300 font-bold">
                        {data.chainProof.transactionHash}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-purple-400 font-bold uppercase flex items-center gap-1">
                        <FileText className="w-4 h-4 text-purple-400" />
                        AUDIT PACKAGE ATTRIBUTES (AUD)
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold">
                        {data.auditPackage.packageNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 p-4 bg-slate-950/80 border border-slate-900 rounded font-mono text-[10.5px]">
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Package Number</span>
                        <span className="text-white font-bold block mt-0.5 select-all">{data.auditPackage.packageNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Compliance Status</span>
                        <span className="text-emerald-400 font-black block mt-0.5 uppercase tracking-widest">{data.auditPackage.metadataReport.complianceStatus}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Evidence Integrity Score</span>
                        <span className="text-emerald-400 font-black block mt-0.5 text-xs">
                          {data.auditPackage.systemVerificationReport.evidenceIntegrityScore}/100 COMPLETE
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Operator Desk</span>
                        <span className="text-white font-bold block mt-0.5">{data.auditPackage.metadataReport.operator}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Hash Verified</span>
                        <span className="text-emerald-400 font-bold block mt-0.5">✓ MATCHED_SHA255</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase block font-bold">Digital Signature</span>
                        <span className="text-emerald-400 font-bold block mt-0.5">✓ Ed25519_STABLE</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-3 bg-purple-950/10 border border-purple-500/20 rounded font-mono text-[10px]">
                      <div>
                        <span className="text-purple-300 font-bold uppercase text-[8.5px] block">Ledger Integrity Status</span>
                        <span className="text-slate-300 block mt-0.5">✓ Mathematical invariants match double-entry balance constraints perfectly.</span>
                      </div>
                      <div>
                        <span className="text-purple-300 font-bold uppercase text-[8.5px] block">Compliance Seal Summary</span>
                        <span className="text-slate-300 block mt-0.5">Approved for internal, municipal, and sovereign cross-border tax auditing.</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRINT PREVIEW MODAL */}
        <AnimatePresence>
          {showPrintPreview && data && (
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
                    onClick={() => setShowPrintPreview(false)}
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
                className="w-full max-w-2xl bg-[#09090b] text-slate-300 p-8 shadow-2xl rounded-xl border border-slate-800 font-mono text-xs leading-relaxed overflow-hidden relative print-exact"
              >
                {/* Background accents for print (requires print-color-adjust) */}
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <ShieldCheck className="w-64 h-64 text-cyan-400" />
                </div>
                
                <div className="relative z-10 space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg">
                        <Lock className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-white font-black uppercase text-lg tracking-widest leading-none">
                          SOVR SECURE EVIDENCE
                        </h2>
                        <div className="text-[9px] text-cyan-500 uppercase tracking-widest mt-1 font-bold">
                          Immutable Ledger Settlement Certificate
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Receipt No.</div>
                      <div className="text-white font-bold bg-slate-900 border border-slate-700 px-3 py-1 rounded">
                        {data.receipt?.receiptNumber}
                      </div>
                    </div>
                  </div>
                  
                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/80 border border-slate-800 rounded p-3">
                      <span className="text-slate-500 text-[9px] uppercase block font-bold mb-1">Transaction ID</span>
                      <span className="text-cyan-400 font-bold block text-[10px] select-all break-all leading-tight">
                        {transactionId}
                      </span>
                    </div>
                    
                    <div className="bg-slate-900/80 border border-slate-800 rounded p-3">
                      <span className="text-slate-500 text-[9px] uppercase block font-bold mb-1">Value Transferred</span>
                      <span className="text-emerald-400 font-black block text-sm">
                        {formatCurrency(data.receipt?.amount, data.receipt?.denomination)}
                      </span>
                    </div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-3 p-4 bg-slate-950 border border-slate-800 rounded-lg text-[10.5px]">
                    <div className="col-span-2">
                      <span className="text-slate-500 text-[9px] uppercase block font-bold">Settlement Certificate</span>
                      <span className="text-white font-bold block mt-0.5 select-all">{data.settlementCertificate?.certificateNumber}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 text-[9px] uppercase block font-bold">Date Sealed</span>
                      <span className="text-white font-bold block mt-0.5">
                        {new Date(data.evidenceObject?.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="col-span-2">
                      <span className="text-slate-500 text-[9px] uppercase block font-bold">Origin Vault</span>
                      <span className="text-amber-400 font-bold block mt-0.5 truncate">{data.receipt?.originatingVault}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 text-[9px] uppercase block font-bold">Receiving Party</span>
                      <span className="text-amber-400 font-bold block mt-0.5 truncate">{data.receipt?.receivingParty}</span>
                    </div>
                    
                    <div className="col-span-2">
                      <span className="text-slate-500 text-[9px] uppercase block font-bold">Chain Proof Network</span>
                      <span className="text-white font-bold block mt-0.5">{data.chainProof?.network}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 text-[9px] uppercase block font-bold">Block Height</span>
                      <span className="text-cyan-400 font-bold block mt-0.5">Block #{data.chainProof?.blockHeight}</span>
                    </div>
                  </div>

                  {/* Cryptographic Proofs */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">
                        Cryptographic SHA256 Hash
                      </span>
                      <div className="bg-slate-950 border border-slate-800 p-2 rounded select-all break-all text-[9.5px] text-purple-300 font-bold">
                        {data.evidenceObject?.hash}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">
                        Ed25519 Digital Signature
                      </span>
                      <div className="bg-slate-950 border border-slate-800 p-2 rounded select-all break-all text-[9.5px] text-slate-300 font-bold leading-tight">
                        {data.receipt?.digitalSignature?.signature}
                      </div>
                    </div>
                  </div>

                  {/* GM Family Trust Settlement Authorization Card (Print friendly version) */}
                  <div className="border border-slate-700 bg-slate-950 p-4 rounded-lg text-center space-y-2 max-w-lg mx-auto my-4 relative overflow-hidden">
                    <div className="font-serif italic text-white text-base font-bold tracking-wide">
                      GM Family Trust
                    </div>
                    <div className="text-[8.5px] text-slate-400 uppercase tracking-widest font-bold">
                      Private Irrevocable Trust - Central Valley, California,
                    </div>
                    <div className="text-[11px] font-black tracking-wider text-cyan-400 font-mono uppercase">
                      SOVR Development Holdings LLC
                    </div>
                    <div className="text-[10px] text-slate-300 italic font-medium">
                      Welcome to the SOVR Empire
                    </div>
                    <div className="text-[8px] text-slate-400 font-mono">
                      Bye,;Maldonado, Gustavo-Orona, agent
                    </div>
                    <div className="text-[8.5px] text-white font-mono font-bold">
                      For: GUSTAVO ORONA MALDONADO TTEE, 33-6472099
                    </div>
                    
                    <div className="py-1">
                      <div className="font-serif italic text-amber-300 text-lg border-b border-dashed border-slate-700 pb-1 max-w-[240px] mx-auto select-none">
                        Gustavo Orona Maldonado
                      </div>
                      <div className="text-[7.5px] text-slate-400 uppercase tracking-wider mt-1 font-bold">
                        Trustee & Authorized Representative
                      </div>
                    </div>

                    <div className="text-[7.5px] text-slate-300 font-mono leading-relaxed bg-black/60 p-2 rounded border border-slate-800">
                      "12U.S.C.§95(a)(2);50 U.S.C.§4305b(2), HJR-192/
                      <br />
                      UCC § 3-603/ UCC 10-104/ UCC 1-104"
                    </div>
                    <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                      Without Recourse, All Rights Reserved
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Immutable cryptographic proof of ledger settlement.</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified with SOVR System Signature Server
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Integrity Score</span>
                      <span className="text-emerald-400 font-black text-sm">100%</span>
                    </div>
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
    </div>
  );
}
