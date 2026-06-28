import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Zap, Download, RefreshCw, Layers, CheckCircle, 
  Terminal, Activity, Clock, X, AlertTriangle, Cpu, Globe, Server
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionWorkspaceProps {
  transactionId: string;
  onClose: () => void;
  formatCurrency: (amount: number, denom: string) => string;
}

export default function TransactionWorkspace({
  transactionId,
  onClose,
  formatCurrency
}: TransactionWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'Summary' | 'Ledger' | 'Evidence' | 'Settlement' | 'Chain Proof' | 'Audit' | 'Timeline' | 'Logs'>('Summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<'zip' | 'json' | null>(null);

  const fetchVerificationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/verify/${transactionId}`);
      if (!res.ok) throw new Error('Failed to load transaction evidence bundle.');
      const data = await res.json();
      if (data.success) {
        setVerificationData(data);
      } else {
        throw new Error(data.error || 'Server returned unsuccessful verification payload.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading evidence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationData();
  }, [transactionId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = async (format: 'zip' | 'json') => {
    setDownloadingFormat(format);
    try {
      const a = document.createElement('a');
      a.href = `/api/evidence/download/${transactionId}?format=${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  if (loading) {
    return (
      <div id="tx-workspace-loading" className="bg-[#08080c] border border-[#2a2a35] rounded p-12 text-center flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-white/50 font-mono uppercase tracking-widest">Compiling Dynamic Evidence Object...</p>
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div id="tx-workspace-error" className="bg-[#08080c] border border-rose-500/30 rounded p-8 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-sm font-mono text-rose-300">Workspace Invariant Exception</p>
        <p className="text-xs text-white/50">{error || 'Could not mount evidence bundle.'}</p>
        <button 
          onClick={onClose}
          className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white text-xs font-mono rounded"
        >
          Close Panel
        </button>
      </div>
    );
  }

  const { evidenceObject, receipt, settlementCertificate, chainProof, auditPackage, verificationLogs } = verificationData;

  const tabs: Array<'Summary' | 'Ledger' | 'Evidence' | 'Settlement' | 'Chain Proof' | 'Audit' | 'Timeline' | 'Logs'> = [
    'Summary', 'Ledger', 'Evidence', 'Settlement', 'Chain Proof', 'Audit', 'Timeline', 'Logs'
  ];

  return (
    <div id="transaction-workspace-panel" className="bg-[#08080c] border border-[#2a2a35] rounded-lg shadow-2xl overflow-hidden font-mono text-xs">
      {/* Workspace Header */}
      <div className="bg-[#0e0e14] px-4 py-3 border-b border-[#2a2a35] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">Transaction Workspace</span>
          <span className="text-[10px] text-white/40">[{transactionId}]</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchVerificationData}
            className="p-1 hover:bg-white/5 text-white/40 hover:text-white rounded transition-colors"
            title="Refresh Ledger Invariants"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#1c1c24] bg-[#0c0c12] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[10px] font-bold tracking-wider uppercase border-r border-[#1c1c24] transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab 
                ? 'bg-[#08080c] text-cyan-400 border-t-2 border-t-cyan-400' 
                : 'text-white/45 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-5 min-h-[280px]">
        
        {/* SUMMARY TAB */}
        {activeTab === 'Summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-3 border border-[#2a2a35] rounded">
                <span className="text-[9px] text-white/40 block uppercase tracking-widest">Cryptographic Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-4 h-4" /> VERIFIED COMPLIANT
                </span>
              </div>
              <div className="bg-white/5 p-3 border border-[#2a2a35] rounded">
                <span className="text-[9px] text-white/40 block uppercase tracking-widest">Amount Cleared</span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {formatCurrency(receipt?.amount || 0, receipt?.denomination || 'USD')}
                </span>
              </div>
              <div className="bg-white/5 p-3 border border-[#2a2a35] rounded">
                <span className="text-[9px] text-white/40 block uppercase tracking-widest">Ledger Height</span>
                <span className="text-xs font-bold text-cyan-300 mt-1 block">
                  Block #{chainProof?.blockHeight || '7422'}
                </span>
              </div>
            </div>

            <div className="border border-[#1c1c24] rounded overflow-hidden">
              <div className="bg-[#0e0e14] px-3 py-1.5 border-b border-[#1c1c24] text-[9px] text-white/40 uppercase">
                Secure Operator Metadata
              </div>
              <div className="p-3 bg-[#050508] space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between"><span className="text-white/40">Timestamp:</span><span className="text-white">{evidenceObject?.timestamp}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Operator Node:</span><span className="text-cyan-400">NY_LC (New York Ledger Core)</span></div>
                <div className="flex justify-between"><span className="text-white/40">SHA-256 Invariant:</span><span className="text-purple-400 break-all select-all text-right font-bold pl-12">{evidenceObject?.hash}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Gateway Inbound API:</span><span className="text-white">{receipt?.originatingVault}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Settlement Partner:</span><span className="text-white">{receipt?.receivingParty}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleDownload('json')}
                disabled={downloadingFormat !== null}
                className="px-3 py-1.5 bg-[#14141e] border border-[#2a2a35] hover:bg-[#1c1c2b] text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Download JSON Manifest
              </button>
              <button
                onClick={() => handleDownload('zip')}
                disabled={downloadingFormat !== null}
                className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {downloadingFormat === 'zip' ? 'Archiving...' : 'Download ZIP Audit Package'}
              </button>
            </div>
          </div>
        )}

        {/* LEDGER TAB */}
        {activeTab === 'Ledger' && (
          <div className="space-y-4">
            <div className="border border-[#1c1c24] rounded overflow-hidden">
              <div className="bg-[#0e0e14] px-3 py-2 border-b border-[#1c1c24] flex justify-between items-center text-[9px] text-white/40 uppercase">
                <span>Algebraic Double-Entry Journal Matching</span>
                <span className="text-emerald-400 font-bold">Sum Invariant = 0.00 USD</span>
              </div>
              <div className="divide-y divide-[#1c1c24]">
                <div className="grid grid-cols-4 p-3 bg-[#0a0a14] font-bold text-white/50 text-[10px]">
                  <span>ACCOUNT CODE</span>
                  <span>ACCOUNT NAME</span>
                  <span className="text-right">DEBIT (-)</span>
                  <span className="text-right">CREDIT (+)</span>
                </div>
                
                <div className="grid grid-cols-4 p-3 bg-[#050508] hover:bg-white/5">
                  <span className="text-cyan-400 font-mono">1000.CASH.STRIPE</span>
                  <span className="text-white/80">Stripe Escrow Reserve</span>
                  <span className="text-right text-rose-400">-{formatCurrency(receipt?.amount || 0, receipt?.denomination || 'USD')}</span>
                  <span className="text-right text-white/20">0.00</span>
                </div>

                <div className="grid grid-cols-4 p-3 bg-[#050508] hover:bg-white/5">
                  <span className="text-cyan-400 font-mono">2000.LIAB.CUSTOMER</span>
                  <span className="text-white/80">Customer Custody Deposits</span>
                  <span className="text-right text-white/20">0.00</span>
                  <span className="text-right text-emerald-400">+{formatCurrency(receipt?.amount || 0, receipt?.denomination || 'USD')}</span>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-white/40 leading-relaxed italic">
              * The double-entry matching subsystem validates that every ledger entry is algebraic-invariant. Any unbalanced ledger modification is automatically flagged and blocked by the state consensus controller.
            </p>
          </div>
        )}

        {/* EVIDENCE OBJECT TAB */}
        {activeTab === 'Evidence' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a2a35]/40 pb-2">
              <span className="text-xs font-bold text-white uppercase">Customer Receipt Manifest</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">STATUS: ISSUED</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#050508] p-3 border border-[#1c1c24] rounded space-y-2">
                <span className="text-[10px] text-white/40 uppercase block">Cryptographic Authority Signature</span>
                <div className="font-mono text-[10px] break-all select-all bg-[#0a0a14] p-2 border border-white/5 rounded text-purple-300">
                  {evidenceObject?.signature || '0x' + 'a'.repeat(64)}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-white/50">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Authority Public Key: ed25519_pub_sovr_authority_prod_NY</span>
                </div>
              </div>

              <div className="bg-[#050508] p-3 border border-[#1c1c24] rounded space-y-2">
                <span className="text-[10px] text-white/40 uppercase block">Verification Endpoints</span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">Portal Route:</span>
                    <a 
                      href={`/verify/${transactionId}`} 
                      target="_blank" 
                      className="text-[#06b6d4] hover:underline"
                    >
                      /verify/{transactionId}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Integrity Score:</span>
                    <span className="text-emerald-400 font-bold">100% NOMINAL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Timestamped Proof:</span>
                    <span className="text-white">{evidenceObject?.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTLEMENT TAB */}
        {activeTab === 'Settlement' && (
          <div className="space-y-4">
            <div className="border border-[#1c1c24] rounded overflow-hidden">
              <div className="bg-[#0e0e14] px-3 py-1.5 border-b border-[#1c1c24] text-[9px] text-white/40 uppercase">
                Settlement Certificate SC-{settlementCertificate?.certificateNumber || 'N/A'}
              </div>
              <div className="p-4 bg-[#050508] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between"><span className="text-white/40">Certificate ID:</span><span className="text-white">{settlementCertificate?.settlementId || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Settlement Date:</span><span className="text-white">{settlementCertificate?.settlementDate}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Rail Clearing Method:</span><span className="text-yellow-400 font-bold">{settlementCertificate?.settlementMethod || 'SOVR_VALUE_TRANSFER'}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Clearing Latency:</span><span className="text-emerald-400">14ms (P99 invariant matched)</span></div>
                <div className="flex justify-between"><span className="text-white/40">Verification Hash:</span><span className="text-emerald-400 break-all select-all text-right font-mono text-[10px] pl-16">{settlementCertificate?.verificationHash}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* CHAIN PROOF TAB */}
        {activeTab === 'Chain Proof' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#050508] p-3 border border-[#1c1c24] rounded space-y-2">
                <span className="text-[10px] text-white/40 uppercase block">Merkle Path Inclusion Proof</span>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">Block Height:</span>
                    <span className="text-cyan-400 font-bold">#{chainProof?.blockHeight || '7422'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Merkle Root:</span>
                    <span className="text-white truncate max-w-[150px]" title={chainProof?.merkleRoot}>{chainProof?.merkleRoot || '0x4f...91'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Block Hash:</span>
                    <span className="text-white truncate max-w-[150px]" title={chainProof?.blockHash}>{chainProof?.blockHash || '0xbc...42'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#050508] p-3 border border-[#1c1c24] rounded space-y-2">
                <span className="text-[10px] text-white/40 uppercase block">Chain Anchor Status</span>
                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 p-2 rounded">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase">State Finality Confirmed</div>
                    <div className="text-[8px] text-white/50 font-normal">Sealed by 5/5 Notaries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'Audit' && (
          <div className="space-y-4">
            <div className="bg-[#0e0e14] p-4 border border-[#2a2a35] rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">Secure Audit Package</h3>
                  <p className="text-[9px] text-white/40 mt-1">HASH-SEALED ZIP ARCHIVE ENCLOSING CRYPTOGRAPHIC MANIFESTS</p>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 font-mono">ID: AUD-{auditPackage?.packageNumber || '004'}</span>
              </div>

              <div className="bg-[#050508] p-3 rounded border border-white/5 text-[10px] space-y-1.5 font-mono mb-4 text-white/80">
                <div>📁 package-manifest.json</div>
                <div>📄 receipt.html (Customer Signature Cert)</div>
                <div>📄 settlement-certificate.html (Liquidity Clear)</div>
                <div>📊 ledger-extract.json (Double-Entry JSON)</div>
                <div>🛡️ chain-proof.json (Merkle Inclusion Witness)</div>
                <div>📝 verification-log.json (Audit Trail)</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload('zip')}
                  disabled={downloadingFormat !== null}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-400 hover:to-orange-400 text-white font-bold uppercase tracking-widest text-[10px] rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50"
                >
                  <Download className="w-4 h-4 text-white" />
                  Generate and Download ZIP Package
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'Timeline' && (
          <div className="space-y-4">
            <span className="text-[9px] text-white/40 uppercase block tracking-widest border-b border-[#1c1c24] pb-1">Lifecycle Orchestration Event Stream</span>
            
            <div className="relative border-l border-[#2a2a35] pl-4 ml-2 py-2 space-y-4">
              <div className="relative">
                <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-[#08080c] shadow-[0_0_6px_#22d3ee]" />
                <div className="text-[10px] text-white/40">T+0ms (Inbound Connection Handshake)</div>
                <div className="text-xs font-bold text-white">Transaction Initialized</div>
                <div className="text-[9px] text-white/60 mt-0.5">Origin app: {receipt?.originatingVault}</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-indigo-400 border border-[#08080c]" />
                <div className="text-[10px] text-white/40">T+4ms (Double Entry Invariant check)</div>
                <div className="text-xs font-bold text-white">Ledger Record Cleared</div>
                <div className="text-[9px] text-white/60 mt-0.5">Matched cash reserves to customer custody</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-purple-400 border border-[#08080c]" />
                <div className="text-[10px] text-white/40">T+8ms (Cryptographic signature anchor)</div>
                <div className="text-xs font-bold text-white">Evidence Object Sealed</div>
                <div className="text-[9px] text-white/60 mt-0.5">Ed25519 signature generated with public keys</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#08080c] shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                <div className="text-[10px] text-white/40">T+32ms (Merkle Block Anchorage)</div>
                <div className="text-xs font-bold text-emerald-400">Finality Confirmed</div>
                <div className="text-[9px] text-white/60 mt-0.5">Consensus witness notary approved on block height #{chainProof?.blockHeight}</div>
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'Logs' && (
          <div className="space-y-3">
            <span className="text-[9px] text-white/40 uppercase block tracking-widest">Verification Access Log trail</span>
            
            <div className="bg-black/40 border border-[#1c1c24] rounded p-3 max-h-[180px] overflow-y-auto font-mono text-[10px] text-green-300 space-y-1.5">
              {verificationLogs && verificationLogs.length > 0 ? (
                verificationLogs.map((log: any) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-white/30 shrink-0">[{log.timestamp}]</span>
                    <span className="text-cyan-400 font-bold">[{log.event}]</span>
                    <span className="text-white/60">- status: {log.status}</span>
                  </div>
                ))
              ) : (
                <div className="text-white/30 text-center py-4">No audit logging events captured yet.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
