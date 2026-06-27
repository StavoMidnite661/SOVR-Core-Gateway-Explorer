import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Play, ArrowRight, ShieldCheck, CheckCircle, Clock, 
  Terminal, Settings, Activity, ArrowUpRight, HelpCircle, AlertCircle,
  Check, X, Lock, Unlock, FileText, Database, Award, Download, 
  RefreshCw, Share2, Eye, Server, Globe, Cpu, Coins, Shield, 
  Fingerprint, FileArchive, Webhook, TerminalSquare, Info, Sliders, PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces for node configuration
interface NodeState {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
  icon: React.ComponentType<any>;
  desc: string;
}

export default function OrchestrationEngine() {
  // Configurable Settlement Blueprint State
  const [blueprint, setBlueprint] = useState({
    txType: 'Internal Transfer',
    amount: 1500000,
    rail: 'SOVR Instant',
    evidenceProfile: 'Full Audit',
    sigPolicy: 'Dual Authority',
    receiptTemplate: 'Standard',
    chainAnchor: true,
    genCertificate: true,
    genReceipt: true,
    genLedger: true,
    genPackage: true,
    notifyCounterparties: true
  });

  // State for the active orchestration pipeline
  const [nodes, setNodes] = useState<NodeState[]>([
    { id: 'intake', name: 'Transaction Intake', status: 'PENDING', icon: Cpu, desc: 'Inbound API trigger received via Gateway router.' },
    { id: 'validate', name: 'Validation Engine', status: 'PENDING', icon: Shield, desc: 'Verifying auth signatures, rate limits, and structural compliance.' },
    { id: 'ledger', name: 'Double Entry Post', status: 'PENDING', icon: Coins, desc: 'Posting debit/credit legs matching algebraic invariants.' },
    { id: 'risk', name: 'Risk Engine', status: 'PENDING', icon: ShieldAlertIcon, desc: 'Sanctions, OFAC list checks, velocity limit checks.' },
    { id: 'signature', name: 'Signature Authority', status: 'PENDING', icon: Fingerprint, desc: 'Generating dual-authority Ed25519 digital signature keys.' },
    { id: 'evidence', name: 'Evidence Generator', status: 'PENDING', icon: FileText, desc: 'Assembling formal secure receipt and certificate files.' },
    { id: 'anchor', name: 'Chain Anchor Engine', status: 'PENDING', icon: Globe, desc: 'Calculating block header, publishing to SOVR Core blockchain.' },
    { id: 'package', name: 'Settlement Package', status: 'PENDING', icon: FileArchive, desc: 'Compiling files into sealed ZIP bundle with SHA256 integrity token.' },
    { id: 'notify', name: 'Notification Dispatch', status: 'PENDING', icon: Webhook, desc: 'Emitting secure webhooks and event triggers to external anchors.' },
  ]);

  // UI States
  const [isRunning, setIsRunning] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string>('intake');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('intake');
  const [simulationLogs, setSimulationLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'INFO' | 'SUCCESS' | 'WARN' | 'SYS' }>>([]);
  const [showDocModal, setShowDocModal] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // References
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Available Treasury balance limit
  const TREASURY_MAX = 50000000;

  // Pre-flight validation checks
  const preFlightChecks = {
    treasuryFunded: blueprint.amount <= TREASURY_MAX,
    accountsBalanced: true,
    signaturesVerified: blueprint.sigPolicy !== 'dual' || blueprint.amount < 100000000,
    ledgerOnline: true,
    chainReachable: true,
    railAvailable: true,
    evidenceProfileValid: true,
  };

  const isPreFlightReady = Object.values(preFlightChecks).every(val => val === true);

  // Handle logging auto-scroll
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [simulationLogs]);

  // Simple toast trigger helper
  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Log injector
  const addLog = (msg: string, type: 'INFO' | 'SUCCESS' | 'WARN' | 'SYS' = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString();
    setSimulationLogs(prev => [...prev, {
      id: Math.random().toString(),
      time: timestamp,
      msg,
      type
    }]);
  };

  // Custom icon for ShieldAlert since we need it custom
  function ShieldAlertIcon(props: any) {
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
        <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }

  // Pre-Flight warning status
  const getPreFlightStatusElement = () => {
    if (!preFlightChecks.treasuryFunded) {
      return (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-2.5 text-red-400 flex items-start gap-2 text-[10px]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block uppercase tracking-wide">Treasury Limit Violation</span>
            Amount exceeds max liquid reserve allocation ({blueprint.amount.toLocaleString()} / {TREASURY_MAX.toLocaleString()} SVT).
          </div>
        </div>
      );
    }
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2.5 text-emerald-400 flex items-center gap-2 text-[10px]">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <div>
          <span className="font-bold block uppercase tracking-wide">Pre-Flight Passed</span>
          System resources validated and ready for sequence deployment.
        </div>
      </div>
    );
  };

  // Digital Twin Mock Payload Generator for Node Inspection
  const getNodeTwinData = (nodeId: string) => {
    switch (nodeId) {
      case 'intake':
        return {
          service: 'TransactionIntakeService',
          endpoint: '/api/v3/settlements/intake',
          auth: 'Bearer jwt_sovr_sec_token_8871',
          payload: {
            blueprint_type: blueprint.txType,
            requested_rail: blueprint.rail,
            value_amount: `${blueprint.amount.toLocaleString()}.00`,
            denom: 'SVT',
            origin_node: 'ZRH-GATEWAY-1',
            dest_node: 'DXB-PORTAL-5',
            timestamp: new Date().toISOString()
          },
          status_header: {
            connection: 'MUTUAL_TLS_SECURE',
            api_version: 'v3.12-Prod'
          }
        };
      case 'validate':
        return {
          service: 'ValidationEngineService',
          regulatory_check: blueprint.evidenceProfile === 'Full Audit' ? 'DEEP_AUDIT' : 'BASIC',
          policy_applied: blueprint.sigPolicy,
          checks: {
            auth_token_signature: 'VALID',
            sender_vault_allowance: 'PASSED',
            destination_route_active: 'PASSED',
            double_spend_vector: 'CLEAR',
            structural_json_compliance: 'METADATA_OK'
          },
          compliance_track_id: `COMP-${Math.floor(100000 + Math.random() * 900000)}-AA`
        };
      case 'ledger':
        return {
          service: 'CoreLedgerService',
          mechanism: 'Double-Entry Balanced Invariant',
          journal_entry_id: `JE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          ledger_state: {
            debit: {
              account: '1010-ZRH-VAULT-RESERVES',
              amount: blueprint.amount,
              currency: 'SVT'
            },
            credit: {
              account: '2200-MULTI-ESCROW-HOLDINGS',
              amount: blueprint.amount,
              currency: 'SVT'
            },
            net_delta: 0,
            algebraic_test: 'PASSED (Zero-variance parity verified)'
          }
        };
      case 'risk':
        return {
          service: 'RealTimeRiskEngineService',
          screening_policy: 'SOVR Anti-Fraud Shield',
          risk_assessment: {
            score: blueprint.amount > 10000000 ? 28 : 8,
            max_limit_approved: 45,
            decision: 'AUTO_APPROVE',
            checks: {
              velocity_limits: 'PASSED',
              sanctions_list_match: 'NO_MATCH (OFAC, EU, UN lists clear)',
              unusual_geofence: 'NOT_DETECTED',
              high_value_dual_auth: blueprint.amount > 5000000 ? 'REQUIRED_AND_MET' : 'NOT_REQUIRED'
            }
          }
        };
      case 'signature':
        return {
          service: 'SignatureAuthorityService',
          key_type: 'Ed25519 Cryptographic Pair',
          signature_policy: blueprint.sigPolicy,
          authorized_signers: [
            'sovr_sign_authority_primary_ny',
            blueprint.sigPolicy === 'Dual Authority' ? 'sovr_sign_authority_secondary_zurich' : null
          ].filter(Boolean),
          signatures_minted: {
            authority_signature_01: 'ed25519_sig_b87acf789d2d0b1ea6e210a99c8f0e1',
            authority_signature_02: blueprint.sigPolicy === 'Dual Authority' ? 'ed25519_sig_f112ae908e2d4d12c8b0e11ea8cf09c' : undefined,
            public_verification_key: 'ed25519_pub_sovr_authority_prod_NY'
          }
        };
      case 'evidence':
        return {
          service: 'EvidenceGeneratorService',
          receipt_status: blueprint.genReceipt ? 'MINTED' : 'SKIPPED',
          certificate_status: blueprint.genCertificate ? 'SEALED' : 'SKIPPED',
          outputs: {
            ...(blueprint.genReceipt && { receipt: { number: `RCP-${Math.floor(100000 + Math.random() * 900000)}`, template: blueprint.receiptTemplate, format: 'PDF/A' } }),
            ...(blueprint.genCertificate && { certificate: { number: `ST-${Math.floor(100000 + Math.random() * 900000)}`, status: 'VALIDATED_SEAL' } })
          },
          integrity_hash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        };
      case 'anchor':
        return {
          service: 'BlockchainAnchoringService',
          target_network: 'SOVR Core Chain (Mainnet)',
          anchor_block: {
            height: 742214,
            epoch: 844,
            header_hash: '0x0874bf821a81dc12e84bf9081a2f1c8b901a1c24e8d8d74102',
            merkle_root: '0x882fa1cb8a4bf78de9a98ef1a89c0a1a0d89e0bc8712a1',
            confirmations: 12,
            finality_status: 'IRREVERSIBLE'
          }
        };
      case 'package':
        return {
          service: 'SettlementPackageService',
          bundle_name: `SOVR-SETTLE-PKG-TXN-${Math.floor(100000 + Math.random() * 900000)}.zip`,
          format: 'ZIP Structured Cryptographic Bundle',
          bundle_contents: [
            blueprint.genReceipt && 'Receipt.pdf (240 KB)',
            blueprint.genCertificate && 'Settlement Certificate.pdf (420 KB)',
            blueprint.genLedger && 'Ledger Extract.json (45 KB)',
            blueprint.chainAnchor && 'Chain Proof.json (12 KB)',
            'Manifest.json (4 KB)',
            'Signature.json (8 KB)'
          ].filter(Boolean),
          bundle_metrics: {
            size: `${(2.1 + Math.random() * 0.5).toFixed(1)} MB`,
            compression_level: '9 (Optimal)',
            sha256_bundle_hash: 'sha256_5a90d81b8cc90ee1e84bf902c81a99d8b74102fc83b12ea84b01e',
            integrity_match: '100% NOMINAL'
          }
        };
      case 'notify':
        return {
          service: 'NotificationDispatcherService',
          webhook_delivered: blueprint.notifyCounterparties ? 'COMPLETED' : 'SKIPPED',
          listeners: [
            'https://api.zurich-treasury.ch/hooks/settlements',
            'https://dispatch.dubai-oracle.ae/v3/ingest',
            'https://monitoring.sovr.net/hooks/compliance-audit'
          ],
          payload_digest: {
            journal_id: 'JE-2026-88741',
            finality: '100%',
            signature_provenance: 'VERIFIED'
          },
          response_metrics: {
            dispatch_status: '200_OK_BROADCAST',
            attempts: 1,
            avg_network_latency: '42ms'
          }
        };
      default:
        return {};
    }
  };

  // Launch Orchestration Execution Workflow
  const handleOrchestration = (isSimulationMode: boolean) => {
    if (isRunning || !isPreFlightReady) return;

    setIsRunning(true);
    setIsSimulated(isSimulationMode);
    setSimulationLogs([]);

    // Reset nodes status
    setNodes(prev => prev.map(n => {
      // Check if node is enabled in blueprint
      let isSkipped = false;
      if (n.id === 'anchor' && !blueprint.chainAnchor) isSkipped = true;
      if (n.id === 'package' && !blueprint.genPackage) isSkipped = true;
      if (n.id === 'notify' && !blueprint.notifyCounterparties) isSkipped = true;
      if (n.id === 'evidence' && !blueprint.genReceipt && !blueprint.genCertificate) isSkipped = true;

      return {
        ...n,
        status: isSkipped ? 'SKIPPED' : 'PENDING'
      };
    }));

    addLog(`[SYSTEM] Initializing ${isSimulationMode ? 'Workflow Simulation' : 'Production Ledger Execution'} Sequence`, 'SYS');
    addLog(`[SYSTEM] Blueprint: ${blueprint.txType} via ${blueprint.rail} rail`, 'INFO');
    addLog(`[SYSTEM] Amount: ${blueprint.amount.toLocaleString()} SVT | Authority: ${blueprint.sigPolicy}`, 'INFO');
    addLog(`[PRE-FLIGHT] Verifying structural parameters... PASS`, 'SUCCESS');

    // Run iterative pipeline simulation
    let currentStepIdx = 0;
    const pipelineSequence = ['intake', 'validate', 'ledger', 'risk', 'signature', 'evidence', 'anchor', 'package', 'notify'];

    const runNextNode = () => {
      if (currentStepIdx >= pipelineSequence.length) {
        setIsRunning(false);
        addLog(`[SEQUENCE] ${isSimulationMode ? 'Simulation' : 'Production Execution'} finished with 100% SUCCESS.`, 'SUCCESS');
        if (isSimulationMode) {
          addLog(`[SIMULATION] Simulated outputs generated successfully. Main ledger entries not written to disk.`, 'WARN');
        } else {
          addLog(`[MAIN LEDGER] Cryptographic proof envelope recorded. Transaction set to finalized.`, 'SUCCESS');
        }
        return;
      }

      const nodeId = pipelineSequence[currentStepIdx];
      const targetNode = nodes.find(n => n.id === nodeId);

      // Check if node is disabled/skipped in blueprint
      let isSkipped = false;
      if (nodeId === 'anchor' && !blueprint.chainAnchor) isSkipped = true;
      if (nodeId === 'package' && !blueprint.genPackage) isSkipped = true;
      if (nodeId === 'notify' && !blueprint.notifyCounterparties) isSkipped = true;
      if (nodeId === 'evidence' && !blueprint.genReceipt && !blueprint.genCertificate) isSkipped = true;

      if (isSkipped) {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'SKIPPED' } : n));
        addLog(`[SEQUENCE] Skipping Node: ${nodeId.toUpperCase()} (Bypassed by Blueprint Configuration)`, 'WARN');
        currentStepIdx++;
        setTimeout(runNextNode, 400);
        return;
      }

      // Mark running
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'RUNNING' } : n));
      setActiveNodeId(nodeId);
      setSelectedNodeId(nodeId);

      addLog(`[RUNNING] Active Service Node: ${nodeId.toUpperCase()}`, 'INFO');

      // Trigger node-specific custom operational logs
      setTimeout(() => {
        switch (nodeId) {
          case 'intake':
            addLog(`> Intake received payload from Zurich Gateway`, 'INFO');
            break;
          case 'validate':
            addLog(`> Auth cryptographic tokens valid. Compliance checks passed.`, 'SUCCESS');
            break;
          case 'ledger':
            addLog(`> Posting debit: Account 1010-ZRH-VAULT-RESERVES`, 'INFO');
            addLog(`> Posting credit: Account 2200-MULTI-ESCROW-HOLDINGS`, 'INFO');
            addLog(`> Ledger invariant balance delta: 0.00 SVT`, 'SUCCESS');
            break;
          case 'risk':
            addLog(`> Screening sanctions database... 0 matches found`, 'SUCCESS');
            addLog(`> Fraud risk score rating: 8/100 (Safe Level)`, 'SUCCESS');
            break;
          case 'signature':
            addLog(`> Authority key dual sign triggered...`, 'INFO');
            addLog(`> Ed25519 certificate envelope signed with primary keys`, 'SUCCESS');
            break;
          case 'evidence':
            addLog(`> Compiling PDF/A documents...`, 'INFO');
            if (blueprint.genReceipt) addLog(`> Secure Customer Receipt printed.`, 'SUCCESS');
            if (blueprint.genCertificate) addLog(`> Official Settlement Certificate sealed.`, 'SUCCESS');
            break;
          case 'anchor':
            addLog(`> Calculating block transaction Merkle tree root hash`, 'INFO');
            addLog(`> Anchoring verification signature onto block #742214`, 'SUCCESS');
            break;
          case 'package':
            addLog(`> Compiling zip container: bundle integrity score 100%`, 'SUCCESS');
            break;
          case 'notify':
            addLog(`> Dispatched webhook alert broadcasts to 3 nodes`, 'SUCCESS');
            break;
        }

        // Complete step
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'COMPLETED' } : n));
        currentStepIdx++;
        setTimeout(runNextNode, 1000);
      }, 1200);
    };

    runNextNode();
  };

  return (
    <div id="orchestration-engine" className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-xs select-none">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[20000] bg-cyan-950/90 border border-cyan-400/40 text-cyan-200 px-4 py-2.5 rounded shadow-lg flex items-center gap-2 font-mono text-xs backdrop-blur-md"
          >
            <Info className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: Blueprint & Pre-flight Controls (4 columns) */}
      <div className="lg:col-span-4 bg-[#08080c] border border-[#2a2a35]/90 rounded-lg p-5 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-[#2a2a35]/45 pb-3">
            <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Settlement Blueprint
            </h3>
            <p className="text-[9px] text-white/40 mt-0.5">CONFIGURABLE TRANSACTION SERVICE ENGINE PIPELINE</p>
          </div>

          {/* Interactive Parameters Form */}
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase block">Transaction Type</label>
              <select 
                value={blueprint.txType}
                onChange={e => setBlueprint(p => ({ ...p, txType: e.target.value }))}
                disabled={isRunning}
                className="w-full bg-[#050508] border border-[#2a2a35] hover:border-[#3d3d4e] rounded p-2 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-all"
              >
                <option value="Internal Transfer">Internal Transfer</option>
                <option value="External Settlement">External Settlement</option>
                <option value="Vendor Payment">Vendor Payment</option>
                <option value="Escrow Release">Escrow Release</option>
                <option value="Private Credit Draw">Private Credit Draw</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] text-white/40 uppercase block">Transaction Value</label>
                <span className="text-[9.5px] text-cyan-400 font-bold">{blueprint.amount.toLocaleString()} SVT</span>
              </div>
              <input 
                type="range"
                min={100000}
                max={60000000}
                step={100000}
                value={blueprint.amount}
                onChange={e => setBlueprint(p => ({ ...p, amount: parseInt(e.target.value) }))}
                disabled={isRunning}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-white/20">
                <span>100K SVT</span>
                <span>Limit: 50M SVT</span>
                <span>60M SVT</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 uppercase block">Settlement Rail</label>
                <select 
                  value={blueprint.rail}
                  onChange={e => setBlueprint(p => ({ ...p, rail: e.target.value }))}
                  disabled={isRunning}
                  className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none text-[10.5px]"
                >
                  <option value="SOVR Instant">SOVR Instant</option>
                  <option value="Sovereign Cross-Border">Cross-Border</option>
                  <option value="FedNow Gateway">FedNow GW</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 uppercase block">Signature Policy</label>
                <select 
                  value={blueprint.sigPolicy}
                  onChange={e => setBlueprint(p => ({ ...p, sigPolicy: e.target.value }))}
                  disabled={isRunning}
                  className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none text-[10.5px]"
                >
                  <option value="Dual Authority">Dual Auth</option>
                  <option value="Single Admin">Single Sign</option>
                  <option value="Quorum Consensus">Consensus</option>
                </select>
              </div>
            </div>

            {/* Checkboxes managing pipeline architecture */}
            <div className="bg-black/40 border border-[#2a2a35]/65 rounded-lg p-3 space-y-2">
              <span className="text-[8.5px] text-white/30 uppercase font-black block tracking-widest mb-1.5">PIPELINE INTEGRITY SWITCHES</span>
              
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[9.5px]">
                <label className="flex items-center gap-1.5 cursor-pointer text-white/70 hover:text-white transition-all">
                  <input 
                    type="checkbox"
                    checked={blueprint.chainAnchor}
                    onChange={e => setBlueprint(p => ({ ...p, chainAnchor: e.target.checked }))}
                    disabled={isRunning}
                    className="accent-cyan-500 rounded"
                  />
                  <span>Chain Anchor</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-white/70 hover:text-white transition-all">
                  <input 
                    type="checkbox"
                    checked={blueprint.genCertificate}
                    onChange={e => setBlueprint(p => ({ ...p, genCertificate: e.target.checked }))}
                    disabled={isRunning}
                    className="accent-cyan-500 rounded"
                  />
                  <span>Certificate</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-white/70 hover:text-white transition-all">
                  <input 
                    type="checkbox"
                    checked={blueprint.genReceipt}
                    onChange={e => setBlueprint(p => ({ ...p, genReceipt: e.target.checked }))}
                    disabled={isRunning}
                    className="accent-cyan-500 rounded"
                  />
                  <span>Receipt</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-white/70 hover:text-white transition-all">
                  <input 
                    type="checkbox"
                    checked={blueprint.genPackage}
                    onChange={e => setBlueprint(p => ({ ...p, genPackage: e.target.checked }))}
                    disabled={isRunning}
                    className="accent-cyan-500 rounded"
                  />
                  <span>ZIP Package</span>
                </label>

                <label className="flex items-center gap-1.5 col-span-2 cursor-pointer text-white/70 hover:text-white transition-all pt-1 border-t border-[#2a2a35]/25">
                  <input 
                    type="checkbox"
                    checked={blueprint.notifyCounterparties}
                    onChange={e => setBlueprint(p => ({ ...p, notifyCounterparties: e.target.checked }))}
                    disabled={isRunning}
                    className="accent-cyan-500 rounded"
                  />
                  <span>Notify Counterparties via webhook</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* PRE-FLIGHT CHECKS & EXECUTION CONTROLS */}
        <div className="space-y-4 mt-6">
          <div className="border-t border-[#2a2a35]/45 pt-3 space-y-2">
            <span className="text-[8.5px] text-white/30 uppercase font-black block tracking-widest">PRE-FLIGHT DIAGNOSTICS</span>
            {getPreFlightStatusElement()}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleOrchestration(true)}
              disabled={isRunning || !isPreFlightReady}
              className="py-2.5 bg-slate-900 border border-slate-700/60 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 disabled:opacity-40 font-bold uppercase tracking-widest text-[9.5px] rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Simulate
            </button>
            <button
              onClick={() => handleOrchestration(false)}
              disabled={isRunning || !isPreFlightReady}
              className="py-2.5 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-400 hover:to-orange-400 text-black font-extrabold uppercase tracking-widest text-[9.5px] rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg hover:shadow-orange-500/20 shadow-orange-950/50"
            >
              <Play className="w-3.5 h-3.5" />
              Execute
            </button>
          </div>
        </div>

      </div>

      {/* MIDDLE COLUMN: Orchestration Canvas & Nodes (5 columns) */}
      <div className="lg:col-span-5 bg-[#08080c] border border-[#2a2a35]/90 rounded-lg p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-[#2a2a35]/45 pb-3">
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold block">Digital Twin Pipeline</span>
              <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5 mt-0.5">
                Orchestration Canvas
              </h3>
            </div>
            {isRunning && (
              <div className="flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-ping" />
                <span className="text-[8px] text-cyan-300 font-bold tracking-wide uppercase">TRAVERSING SYSTEM</span>
              </div>
            )}
          </div>

          {/* Graphical Pipeline Canvas */}
          <div className="py-6 flex flex-col items-center relative select-none">
            
            {/* Live pulsating path connectors behind the nodes */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-12 z-0">
              <div className="w-[1.5px] h-[580px] bg-gradient-to-b from-cyan-500/10 via-amber-500/15 to-orange-500/10 relative">
                {/* Flow packets animating through the central pipeline */}
                {isRunning && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gradient-to-b from-cyan-400 to-orange-500 rounded-full shadow-[0_0_12px_#22d3ee] animate-[bounce_4.5s_infinite_linear]" />
                )}
              </div>
            </div>

            {/* PIPELINE NODES LAYOUT */}
            <div className="space-y-4 w-full max-w-[280px] relative z-10">
              
              {/* NODE 1: Intake */}
              {renderNodeElement('intake')}

              {/* Connector line */}
              <div className="h-3 flex justify-center items-center">
                <ArrowRight className="w-3 h-3 text-white/10 rotate-90" />
              </div>

              {/* NODE 2: Validation */}
              {renderNodeElement('validate')}

              {/* Branch Connection Line to Parallel Path */}
              <div className="relative h-4 w-full">
                <svg className="absolute inset-0 w-full h-full text-white/10" fill="none">
                  <path d="M 140 0 L 140 4 M 140 4 L 70 4 M 140 4 L 210 4 M 70 4 L 70 16 M 210 4 L 210 16" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>

              {/* PARALLEL ROW: Double Entry & Risk Engine */}
              <div className="grid grid-cols-2 gap-4">
                {renderNodeElement('ledger', true)}
                {renderNodeElement('risk', true)}
              </div>

              {/* Parallel Branch Merge Line */}
              <div className="relative h-4 w-full">
                <svg className="absolute inset-0 w-full h-full text-white/10" fill="none">
                  <path d="M 70 0 L 70 12 M 210 0 L 210 12 M 70 12 L 210 12 M 140 12 L 140 16" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>

              {/* NODE 5: Signature Authority */}
              {renderNodeElement('signature')}

              {/* Connector line */}
              <div className="h-3 flex justify-center items-center">
                <ArrowRight className="w-3 h-3 text-white/10 rotate-90" />
              </div>

              {/* NODE 6: Evidence Generator */}
              {renderNodeElement('evidence')}

              {/* Connector line */}
              <div className="h-3 flex justify-center items-center">
                <ArrowRight className="w-3 h-3 text-white/10 rotate-90" />
              </div>

              {/* NODE 7: Chain Anchor Engine */}
              {renderNodeElement('anchor')}

              {/* Connector line */}
              <div className="h-3 flex justify-center items-center">
                <ArrowRight className="w-3 h-3 text-white/10 rotate-90" />
              </div>

              {/* NODE 8: Settlement Package */}
              {renderNodeElement('package')}

              {/* Connector line */}
              <div className="h-3 flex justify-center items-center">
                <ArrowRight className="w-3 h-3 text-white/10 rotate-90" />
              </div>

              {/* NODE 9: Notification Dispatch */}
              {renderNodeElement('notify')}

            </div>

          </div>
        </div>

        {/* BOTTOM: Live Event Console (Terminal trace logs) */}
        <div className="bg-black/50 border border-[#2a2a35]/95 rounded-lg p-4 space-y-2 mt-4 select-text">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[9px] text-white/45 uppercase font-bold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live Event Console
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] text-white/20">Operational audit feed</span>
              {isRunning && (
                <span className="text-[7.5px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded font-black tracking-widest animate-pulse border border-cyan-500/20">
                  REALTIME RUNNING
                </span>
              )}
            </div>
          </div>
          
          <div 
            ref={logsContainerRef}
            className="h-[120px] overflow-y-auto font-mono text-[9px] space-y-1.5 pr-1.5 scrollbar-thin scrollbar-thumb-white/10"
          >
            {simulationLogs.length > 0 ? (
              simulationLogs.map((log) => (
                <div key={log.id} className="flex gap-2 items-start leading-relaxed animate-fadeIn">
                  <span className="text-white/25 shrink-0 select-none">[{log.time}]</span>
                  <span className={
                    log.type === 'SUCCESS' ? 'text-emerald-400' :
                    log.type === 'WARN' ? 'text-amber-400' :
                    log.type === 'SYS' ? 'text-purple-400 font-extrabold' : 'text-slate-300'
                  }>
                    {log.msg}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-white/20 italic py-8 text-center flex flex-col items-center justify-center gap-1">
                <TerminalSquare className="w-6 h-6 text-white/10" />
                <span>Console offline. Deploy simulated or production blueprints to record system flows.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Node Inspector & Settlement Package Builder (3 columns) */}
      <div className="lg:col-span-3 space-y-4 flex flex-col h-full">
        
        {/* PANEL 1: Twin Node Inspector */}
        <div className="bg-[#08080c] border border-[#2a2a35]/90 rounded-lg p-5 shadow-xl flex-grow flex flex-col justify-between">
          <div>
            <div className="border-b border-[#2a2a35]/45 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold block">Live Telemetry</span>
                <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5 mt-0.5">
                  Node Inspector
                </h3>
              </div>
              <span className="text-[8.5px] px-2 py-0.5 bg-[#2a2a35]/60 border border-white/5 rounded text-white/60 uppercase font-black tracking-widest">
                ID: {selectedNodeId}
              </span>
            </div>

            {/* Selected Node Header Details */}
            {(() => {
              const node = nodes.find(n => n.id === selectedNodeId);
              if (!node) return null;
              const Icon = node.icon;
              const payload = getNodeTwinData(selectedNodeId);

              // Status badges styling
              let statusStyle = 'text-slate-400 bg-slate-900/45 border-slate-800/40';
              if (node.status === 'RUNNING') statusStyle = 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30 animate-pulse';
              if (node.status === 'COMPLETED') statusStyle = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
              if (node.status === 'SKIPPED') statusStyle = 'text-amber-400 bg-amber-950/40 border-amber-500/30';

              return (
                <div className="mt-4 space-y-4 h-full flex flex-col">
                  <div className="flex gap-2.5 items-start p-2.5 bg-black/35 border border-white/5 rounded-lg">
                    <div className="p-2 rounded bg-slate-900/60 text-cyan-400 shrink-0 border border-slate-800">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-white font-extrabold block">{node.name}</span>
                      <span className="text-[9px] text-white/40 block mt-0.5 leading-tight">{node.desc}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] border-b border-[#2a2a35]/25 pb-2">
                    <span className="text-white/35 font-bold uppercase tracking-wider">Node Status:</span>
                    <span className={`px-2 py-0.5 rounded border text-[8px] font-black tracking-widest ${statusStyle}`}>
                      {node.status}
                    </span>
                  </div>

                  {/* Schema / Payload Code block */}
                  <div className="space-y-1.5 flex-grow">
                    <span className="text-[8.5px] text-white/30 uppercase font-black block tracking-widest">Digital Twin Active State</span>
                    <div className="bg-black/70 border border-[#2a2a35]/70 rounded p-2.5 max-h-[220px] overflow-y-auto font-mono text-[9px] leading-relaxed text-cyan-300">
                      <pre className="whitespace-pre-wrap select-all">
                        {JSON.stringify(payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="mt-4 bg-slate-900/25 border border-[#2a2a35]/40 rounded p-2 text-white/40 leading-normal text-[8.5px]">
            <Info className="w-3.5 h-3.5 text-cyan-400 inline mr-1 -mt-0.5 shrink-0" />
            Click on any orchestration node in the canvas to inspect its active digital twin data payloads and schemas.
          </div>
        </div>

        {/* PANEL 2: Settlement Package Builder subsystem (Missing subsystem identified by user) */}
        <div className="bg-[#08080c] border border-[#2a2a35]/90 rounded-lg p-5 shadow-xl space-y-3.5 select-text">
          <div className="border-b border-[#2a2a35]/45 pb-3">
            <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold block">Integrity Seals</span>
            <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5 mt-0.5">
              Settlement Package
            </h3>
          </div>

          {blueprint.genPackage ? (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between bg-black/45 border border-white/5 p-2 rounded text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <FileArchive className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="font-bold text-[9.5px] block truncate">sovr-settlement.zip</span>
                    <span className="text-[8px] text-white/30 block">Compression Level: Ultra</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-extrabold block">2.4 MB</span>
                  <span className="text-[7.5px] text-emerald-400 uppercase tracking-widest block font-bold font-mono">100% Secure</span>
                </div>
              </div>

              {/* Package Content List */}
              <div className="space-y-1.5 text-[9px] text-white/80">
                <span className="text-[8.5px] text-white/30 uppercase font-black block tracking-widest">COMPILE BUNDLE CONTENTS</span>
                
                <div className="bg-[#040406] border border-white/5 rounded divide-y divide-[#2a2a35]/20 font-mono text-[9.5px]">
                  {blueprint.genReceipt && (
                    <div className="flex items-center justify-between p-2 hover:bg-white/5 transition-all">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        Receipt.pdf
                      </span>
                      <button 
                        onClick={() => setShowDocModal('receipt')}
                        className="text-[8px] uppercase tracking-wider text-cyan-400 hover:underline font-extrabold"
                      >
                        Preview
                      </button>
                    </div>
                  )}

                  {blueprint.genCertificate && (
                    <div className="flex items-center justify-between p-2 hover:bg-white/5 transition-all">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        Certificate.pdf
                      </span>
                      <button 
                        onClick={() => setShowDocModal('cert')}
                        className="text-[8px] uppercase tracking-wider text-cyan-400 hover:underline font-extrabold"
                      >
                        Preview
                      </button>
                    </div>
                  )}

                  {blueprint.genLedger && (
                    <div className="flex items-center justify-between p-2 hover:bg-white/5 transition-all">
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-amber-500" />
                        LedgerExtract.json
                      </span>
                      <button 
                        onClick={() => triggerToast('LedgerExtract.json generated: 0 variance matched.')}
                        className="text-[8px] uppercase tracking-wider text-cyan-400 hover:underline font-extrabold"
                      >
                        Verify
                      </button>
                    </div>
                  )}

                  {blueprint.chainAnchor && (
                    <div className="flex items-center justify-between p-2 hover:bg-white/5 transition-all">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-purple-400" />
                        ChainProof.json
                      </span>
                      <button 
                        onClick={() => triggerToast('Merkle anchor verified on SOVR core block #742214.')}
                        className="text-[8px] uppercase tracking-wider text-cyan-400 hover:underline font-extrabold"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[9.5px]">
                <button 
                  onClick={() => triggerToast('Zipping compile folder... Created sovr-settlement.zip (2.4 MB)')}
                  className="py-1.5 bg-slate-900 border border-slate-700/50 rounded hover:bg-slate-800 text-slate-300 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  Rebuild
                </button>
                <button 
                  onClick={() => triggerToast('Audit Package downloaded: sovr-settlement.zip')}
                  className="py-1.5 bg-slate-900 border border-slate-700/50 rounded hover:bg-slate-800 text-slate-300 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3 text-orange-400" />
                  Download
                </button>
              </div>
            </div>
          ) : (
            <div className="text-white/20 italic py-6 text-center flex flex-col items-center justify-center gap-1 font-mono text-[9px]">
              <FileArchive className="w-6 h-6 text-white/10" />
              <span>Audit Package Generator is disabled in the blueprint settings on the left.</span>
            </div>
          )}
        </div>

      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/90 z-[10100] flex items-center justify-center p-4 backdrop-blur-md font-mono select-text">
          <div className="w-full max-w-xl bg-[#0a0a0f] border border-slate-800 rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#101016] px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-white uppercase font-black flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                Document Package Preview
              </span>
              <button 
                onClick={() => setShowDocModal(null)}
                className="text-slate-400 hover:text-white uppercase text-[10px] font-bold cursor-pointer"
              >
                [Close ESC]
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto text-xs space-y-4">
              {showDocModal === 'receipt' ? (
                <div className="bg-white text-black p-6 rounded font-mono text-[10.5px] leading-relaxed shadow-lg">
                  <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-4">
                    <div className="text-lg font-black tracking-widest">SOVR NETWORK</div>
                    <div className="text-[9px] text-gray-500 font-bold">SECURE TRANSACTION RECEIPT</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>RECEIPT NO:</span> <span className="font-bold">RCP-901822</span></div>
                    <div className="flex justify-between"><span>TIMESTAMP:</span> <span className="font-bold">{new Date().toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>TRANSACTION TYPE:</span> <span className="font-bold">{blueprint.txType}</span></div>
                    <div className="flex justify-between"><span>CLEARING RAIL:</span> <span className="font-bold">{blueprint.rail}</span></div>
                  </div>

                  <div className="border-t border-dashed border-slate-300 my-3"></div>

                  <div className="space-y-1">
                    <div><span className="text-gray-500">ORIGIN DEBIT ACCOUNT:</span> <div className="font-bold">ZRH-VAULT-RESERVES-908</div></div>
                    <div><span className="text-gray-500">DESTINATION CREDIT ACCOUNT:</span> <div className="font-bold">MULTI-ESCROW-HOLDINGS-441</div></div>
                  </div>

                  <div className="border-t border-dashed border-slate-300 my-3"></div>

                  <div className="flex justify-between items-center text-xs font-bold pt-2">
                    <span>TOTAL SETTLED AMOUNT:</span>
                    <span className="text-base font-black">{blueprint.amount.toLocaleString()}.00 SVT</span>
                  </div>

                  <div className="border-t border-dashed border-slate-300 my-3"></div>

                  <div className="text-[8px] break-all space-y-2">
                    <div>
                      <span className="font-bold text-gray-600 block">ED25519 CRYPTOGRAPHIC SIGNATURE</span>
                      <span>ed25519_sig_b87acf789d2d0b1ea6e210a99c8f0e1591ab8102</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-600 block">PUBLIC VERIFICATION KEY</span>
                      <span>ed25519_pub_sovr_authority_prod_NY</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 text-slate-300 p-6 rounded font-mono text-[10.5px] leading-relaxed shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="font-black text-white text-xs block">SETTLEMENT CERTIFICATE</span>
                        <span className="text-[8.5px] text-emerald-400 uppercase tracking-widest font-bold">Immutable Ledger Record</span>
                      </div>
                    </div>
                    <span className="text-[8.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">ST-22891</span>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                    This document serves as formal certificate representation that the ledger balances matches mathematical double-entry zero-variance invariants perfectly for the following payload:
                  </p>

                  <table className="w-full text-left text-[9.5px]">
                    <tbody>
                      <tr className="border-b border-slate-800"><td className="py-1.5 text-slate-500">Certificate Number:</td><td className="py-1.5 text-white font-bold">ST-22891</td></tr>
                      <tr className="border-b border-slate-800"><td className="py-1.5 text-slate-500">Clearing Method:</td><td className="py-1.5 text-white font-bold">{blueprint.rail}</td></tr>
                      <tr className="border-b border-slate-800"><td className="py-1.5 text-slate-500">Signature Rules:</td><td className="py-1.5 text-white font-bold">{blueprint.sigPolicy}</td></tr>
                      <tr className="border-b border-slate-800"><td className="py-1.5 text-slate-500">Amount Transferred:</td><td className="py-1.5 text-emerald-400 font-extrabold">{blueprint.amount.toLocaleString()}.00 SVT</td></tr>
                      <tr><td className="py-1.5 text-slate-500">Verification Hash:</td><td className="py-1.5 text-purple-300 font-bold break-all">sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b</td></tr>
                    </tbody>
                  </table>

                  <div className="mt-6 pt-3 border-t border-slate-800 flex justify-between items-center text-[8px] text-slate-500">
                    <span>Verified with SOVR System Signature Server</span>
                    <span className="text-emerald-500 font-bold">Integrity Score 100%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#101016] px-4 py-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
              <button 
                onClick={() => {
                  triggerToast(`Exporting secure PDF to disk...`);
                  setShowDocModal(null);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-orange-500 text-black font-bold uppercase rounded cursor-pointer hover:opacity-90 active:scale-95 transition-all text-[10px]"
              >
                Download PDF
              </button>
              <button 
                onClick={() => setShowDocModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase rounded cursor-pointer text-[10px]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );

  // Helper method to dynamically render canvas node elements
  function renderNodeElement(id: string, isHalfWidth = false) {
    const node = nodes.find(n => n.id === id);
    if (!node) return null;

    const isSelected = selectedNodeId === id;
    const isActive = activeNodeId === id && isRunning;
    
    // Icon
    const IconComponent = node.icon;

    // Node status classes
    let borderStyle = 'border-white/5 bg-[#050508] text-white/40';
    let iconColor = 'text-white/30';
    let pulseWave = '';

    if (isActive) {
      borderStyle = 'border-cyan-500 bg-cyan-500/5 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]';
      iconColor = 'text-cyan-400';
      pulseWave = 'animate-pulse';
    } else if (node.status === 'COMPLETED') {
      borderStyle = 'border-emerald-500/25 bg-emerald-500/5 text-white/80';
      iconColor = 'text-emerald-400';
    } else if (node.status === 'SKIPPED') {
      borderStyle = 'border-amber-500/10 bg-amber-500/5 text-white/30 opacity-40';
      iconColor = 'text-amber-500/50';
    }

    if (isSelected && !isActive) {
      borderStyle += ' ring-1 ring-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.15)]';
    }

    return (
      <div
        onClick={() => setSelectedNodeId(id)}
        className={`p-2.5 rounded-lg border transition-all cursor-pointer select-none text-[10px] leading-tight flex items-center gap-2.5 hover:border-cyan-500/40 relative group ${borderStyle} ${isHalfWidth ? 'w-full' : 'w-full'} ${pulseWave}`}
      >
        <div className={`p-1.5 rounded shrink-0 transition-all ${
          isActive ? 'bg-cyan-950/60' : 
          node.status === 'COMPLETED' ? 'bg-emerald-950/50' : 'bg-slate-900/40'
        }`}>
          {isActive ? (
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
          ) : node.status === 'COMPLETED' ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <IconComponent className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
          )}
        </div>

        <div className="grow truncate text-left">
          <span className="font-bold text-white block text-[10px] truncate">{node.name}</span>
          <span className="text-[8px] text-white/40 block mt-0.5 uppercase tracking-wider">
            {node.status}
          </span>
        </div>

        {/* Dynamic connection indicator dots */}
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full shadow-[0_0_4px_#22d3ee] animate-ping" />
        </div>
      </div>
    );
  }
}
