import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Coins, 
  Layers, 
  ShieldCheck, 
  Shield, 
  Radio, 
  Settings, 
  Globe, 
  Zap, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  Play, 
  CornerDownRight, 
  Server, 
  TrendingUp, 
  HelpCircle,
  Database,
  Lock,
  Compass
} from 'lucide-react';

interface MissionControlProps {
  accounts: any[];
  transactions: any[];
  setActiveTab: (tabName: string) => void;
  formatCurrency: (value: number, denom: string) => string;
}

export default function MissionControlView({ 
  accounts, 
  transactions, 
  setActiveTab, 
  formatCurrency 
}: MissionControlProps) {
  // Real-time UTC clock
  const [utcTime, setUtcTime] = useState<string>('');
  
  // Interactive nodes highlighting
  const [activeTwinNode, setActiveTwinNode] = useState<string | null>(null);
  
  // Animation/Simulation Trigger
  const [isSimulatingPulse, setIsSimulatingPulse] = useState(false);
  const [pulseStep, setPulseStep] = useState<number>(-1); // -1: idle, 0: bank/ext, 1: gateway, 2: core, 3: treasury/settle/vault, 4: compliance

  // Live simulation event counters
  const [apiCallsCount, setApiCallsCount] = useState(4822421);
  const [evidenceCount, setEvidenceCount] = useState(18422);
  const [settlementQueue, setSettlementQueue] = useState(27);

  // Dynamic flow streams for the "Live Workflow Stream"
  const [activeWorkflows, setActiveWorkflows] = useState([
    { id: 'TX-982341', amount: '$450,000', step: 6, state: 'COMPLETED', timer: 100 },
    { id: 'TX-982342', amount: '$1,200,000', step: 4, state: 'ANCHORING', timer: 75 },
    { id: 'TX-982343', amount: '$85,000', step: 2, state: 'LEDGER_POSTING', timer: 40 },
    { id: 'TX-982344', amount: '$320,000', step: 1, state: 'VALIDATING', timer: 15 },
  ]);

  // Executive narrative feed
  const [narratives, setNarratives] = useState([
    { id: 1, time: '09:25', text: 'Consensus engine recovered heartbeat signals from European validation clusters.', type: 'system' },
    { id: 2, time: '09:24', text: 'Sovereign ledger reached cross-region validation consensus for block #1429.', type: 'consensus' },
    { id: 3, time: '09:24', text: 'UnifiedPay webhook integration handshaking acknowledged successfully.', type: 'gateway' },
    { id: 4, time: '09:23', text: 'Trust Vault sealed digital settlement certificate SC-20260626-000021.', type: 'vault' },
    { id: 5, time: '09:22', text: 'Sealed audit compliance package compiled for SEC-17a-4 verification.', type: 'compliance' },
    { id: 6, time: '09:21', text: 'Treasury executed automatic reserve allocation to secure commercial escrow.', type: 'treasury' }
  ]);

  useEffect(() => {
    // Clock tick
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Dynamic stats increment simulation
    const statsInterval = setInterval(() => {
      setApiCallsCount(prev => prev + Math.floor(Math.random() * 5) + 1);
      if (Math.random() > 0.7) {
        setEvidenceCount(prev => prev + 1);
      }
      if (Math.random() > 0.85) {
        setSettlementQueue(prev => Math.max(12, prev + (Math.random() > 0.5 ? 1 : -1)));
      }
    }, 1200);

    // Live workflow progression simulation
    const workflowInterval = setInterval(() => {
      let loggedTxEvent: { text: string; type: string } | null = null;

      setActiveWorkflows(prev => {
        // Advance all workflows, but select one transition to print to the timeline
        return prev.map((wf, idx) => {
          if (wf.step >= 6) {
            const randId = `TX-${Math.floor(Math.random() * 900000) + 100000}`;
            const formats = ['$120,000', '$2,400,000', '$75,000', '$410,000', '$950,000'];
            const chosenAmt = formats[Math.floor(Math.random() * formats.length)];
            const newWf = {
              id: randId,
              amount: chosenAmt,
              step: 0,
              state: 'INGESTED',
              timer: 0
            };
            if (!loggedTxEvent && idx === 0) {
              loggedTxEvent = {
                text: `Ingress Gateway: Ingested settlement pipeline for ${randId} (${chosenAmt}) via secure API proxy.`,
                type: 'gateway'
              };
            }
            return newWf;
          } else {
            const nextStep = wf.step + 1;
            const states = ['INGESTED', 'VALIDATED', 'LEDGER_POSTING', 'RECEIPT_GENERATED', 'EVIDENCE_CREATED', 'ANCHORING', 'COMPLETED'];
            const newWf = {
              ...wf,
              step: nextStep,
              state: states[nextStep],
              timer: Math.floor((nextStep / 6) * 100)
            };

            if (!loggedTxEvent && idx === 0) {
              switch (nextStep) {
                case 1:
                  loggedTxEvent = {
                    text: `Validation Enclave: Cryptographic key signatures and algebraic balance invariants verified for ${wf.id}.`,
                    type: 'system'
                  };
                  break;
                case 2:
                  loggedTxEvent = {
                    text: `Ledger Core: Double-entry ledger balance post succeeded for transaction ${wf.id}.`,
                    type: 'consensus'
                  };
                  break;
                case 3:
                  loggedTxEvent = {
                    text: `Trust Vault: Digital settlement receipt generated and co-signed for ${wf.id}.`,
                    type: 'vault'
                  };
                  break;
                case 4:
                  loggedTxEvent = {
                    text: `Evidence Portal: Compact compliance evidence archive compiled for transaction ${wf.id}.`,
                    type: 'compliance'
                  };
                  break;
                case 5:
                  loggedTxEvent = {
                    text: `Consensus: Notarization Merkle Root for block containing ${wf.id} successfully anchored on Polygon mainnet.`,
                    type: 'consensus'
                  };
                  break;
                case 6:
                  loggedTxEvent = {
                    text: `Settlement: Capital transfer completed. ${wf.amount} cleared and liquidated into recipient bank ledger for ${wf.id}.`,
                    type: 'treasury'
                  };
                  break;
                default:
                  break;
              }
            }
            return newWf;
          }
        });
      });

      // Post the transition event if we got one!
      const timeStr = new Date().toTimeString().substring(0, 5);
      if (loggedTxEvent) {
        setNarratives(prev => [
          { id: Math.random(), time: timeStr, text: (loggedTxEvent as any).text, type: (loggedTxEvent as any).type },
          ...prev.slice(0, 11)
        ]);
      }

      // Periodically trigger unexpected system happenings, warnings, and automatic recoveries!
      if (Math.random() > 0.75) {
        const isWarning = Math.random() > 0.5;
        if (isWarning) {
          const regions = ['European', 'Asia-Pacific', 'North-American', 'South-American'];
          const chosenRegion = regions[Math.floor(Math.random() * regions.length)];
          const warningId = Math.random();
          
          setNarratives(prev => [
            { id: warningId, time: timeStr, text: `Alert: Validator cluster #${chosenRegion}-09 lost active heartbeat connection. Re-routing consensus queue.`, type: 'system' },
            ...prev.slice(0, 11)
          ]);

          // Automatically trigger the recovery after 8 seconds (2 ticks)!
          setTimeout(() => {
            const recoveryTimeStr = new Date().toTimeString().substring(0, 5);
            setNarratives(prev => [
              { id: Math.random(), time: recoveryTimeStr, text: `Recovery: Validator cluster #${chosenRegion}-09 re-established active heartbeat sync. Consensus integrity restored to 100%.`, type: 'system' },
              ...prev.slice(0, 11)
            ]);
          }, 8000);
        } else {
          // Regular dynamic platform status logs
          const nonTxEvents = [
            { text: 'Treasury optimized liquidity re-balancing: allocated surplus to reserve escrow.', type: 'treasury' },
            { text: 'Trust Vault completed public key rotation for Sovereign Clearing Authority.', type: 'vault' },
            { text: 'Gateway Fabric registered new routing rule for incoming Stripe payment webhook.', type: 'gateway' },
            { text: 'Compliance Engine auto-filed dual-entry journal audits in Trust Vault.', type: 'compliance' },
            { text: 'Security Oracle confirmed zero ledger discrepancies on daily balance sheets.', type: 'compliance' }
          ];
          const chosen = nonTxEvents[Math.floor(Math.random() * nonTxEvents.length)];
          setNarratives(prev => [
            { id: Math.random(), time: timeStr, text: chosen.text, type: chosen.type },
            ...prev.slice(0, 11)
          ]);
        }
      }
    }, 4000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(statsInterval);
      clearInterval(workflowInterval);
    };
  }, []);

  // Trigger Holographic digital twin simulation flow
  const triggerSimulationPulse = () => {
    if (isSimulatingPulse) return;
    setIsSimulatingPulse(true);
    setPulseStep(0);

    const steps = [
      { delay: 1000, step: 1, text: 'Gateway handshaking established with incoming payment webhook.' },
      { delay: 2000, step: 2, text: 'Sovereign Core engine processing cryptographic double-entry invariant validation.' },
      { delay: 3500, step: 3, text: 'Treasury balancing ledger, Trust Vault sealing SC certificate, Settlement releasing liquidity.' },
      { delay: 5000, step: 4, text: 'Compliance reporting signed, cross-region consensus updated successfully.' },
      { delay: 6500, step: -1, text: '' }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setPulseStep(s.step);
        if (s.step === -1) {
          setIsSimulatingPulse(false);
        } else {
          // add to narrative
          const timeStr = new Date().toTimeString().substring(0, 5);
          setNarratives(prev => [
            { id: Math.random(), time: timeStr, text: `[SIMULATION] ${s.text}`, type: 'system' },
            ...prev.slice(0, 11)
          ]);
        }
      }, s.delay);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: OS EXECUTIVE SUMMARY HEADER */}
      <div className="border border-[#2a2a35]/60 bg-[#07070b]/90 backdrop-blur-xl rounded-lg p-4 font-mono text-white/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2a2a35]/40 pb-3 mb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
            </span>
            <div>
              <span className="text-[12px] font-black tracking-widest uppercase block">SOVR FINANCIAL OPERATING SYSTEM</span>
              <span className="text-[9px] text-cyan-400/80 font-bold uppercase tracking-wider block mt-0.5">MISSION CONTROL ACTIVE CONSOLE</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] bg-black/40 border border-white/5 rounded px-3 py-1 text-white/50">
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-4">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white tracking-widest">{utcTime || 'SYS_TICK'}</span>
            </div>
            <div>
              <span>SYSTEM STATE: </span>
              <span className="text-emerald-400 font-bold tracking-widest">COHESIVE // OK</span>
            </div>
          </div>
        </div>

        {/* 8-Metric horizontal layout block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          <div className="bg-black/35 border border-white/5 rounded p-2 flex flex-col justify-center min-h-[56px] transition-all hover:bg-white/5">
            <span className="text-white/35 text-[7.5px] uppercase font-bold tracking-widest">Network Status</span>
            <span className="text-emerald-400 font-black text-[11px] tracking-wider mt-1 flex items-center justify-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
            </span>
          </div>

          <div className="bg-black/35 border border-white/5 rounded p-2 flex flex-col justify-center min-h-[56px] transition-all hover:bg-white/5">
            <span className="text-white/35 text-[7.5px] uppercase font-bold tracking-widest">Trust Score</span>
            <span className="text-cyan-400 font-black text-[12px] tracking-wider mt-1">
              100%
            </span>
          </div>

          <div className="bg-black/35 border border-white/5 rounded p-2 flex flex-col justify-center min-h-[56px] transition-all hover:bg-white/5">
            <span className="text-white/35 text-[7.5px] uppercase font-bold tracking-widest">Settlement Queue</span>
            <span className="text-amber-400 font-black text-[12px] tracking-wider mt-1">
              {settlementQueue}
            </span>
          </div>

          <div className="bg-black/35 border border-white/5 rounded p-2 flex flex-col justify-center min-h-[56px] transition-all hover:bg-white/5">
            <span className="text-white/35 text-[7.5px] uppercase font-bold tracking-widest">Evidence Today</span>
            <span className="text-purple-400 font-black text-[12px] tracking-wider mt-1">
              {evidenceCount.toLocaleString()}
            </span>
          </div>

          <div className="bg-black/35 border border-white/5 rounded p-2 flex flex-col justify-center min-h-[56px] transition-all hover:bg-white/5">
            <span className="text-white/35 text-[7.5px] uppercase font-bold tracking-widest">Connected Services</span>
            <span className="text-sky-400 font-black text-[12px] tracking-wider mt-1">
              41
            </span>
          </div>

          <div className="bg-black/35 border border-white/5 rounded p-2 flex flex-col justify-center min-h-[56px] transition-all hover:bg-white/5">
            <span className="text-white/35 text-[7.5px] uppercase font-bold tracking-widest">Validator Nodes</span>
            <span className="text-indigo-400 font-black text-[12px] tracking-wider mt-1">
              26
            </span>
          </div>

          <div className="bg-black/35 border border-white/5 rounded p-2 flex flex-col justify-center min-h-[56px] transition-all hover:bg-white/5">
            <span className="text-white/35 text-[7.5px] uppercase font-bold tracking-widest">Treasury Value</span>
            <span className="text-emerald-400 font-black text-[11px] tracking-wider mt-1">
              $20,043,868
            </span>
          </div>

          <div className="bg-black/35 border border-white/5 rounded p-2 flex flex-col justify-center min-h-[56px] transition-all hover:bg-white/5">
            <span className="text-white/35 text-[7.5px] uppercase font-bold tracking-widest">Platform Health</span>
            <span className="text-amber-500 font-black text-[11px] tracking-wider mt-1">
              99.997%
            </span>
          </div>
        </div>
      </div>


      {/* SECTION 2: DIGITAL TWIN CENTERPIECE & EXECUTIVE TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* CENTERPIECE: Ecosystem Digital Twin (8 Columns) */}
        <div className="lg:col-span-8 bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          {/* Breathing ambient backdrop glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-amber-500/5 animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />

          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/90 font-display flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
                Ecosystem Digital Twin Live Topology
              </span>
              <p className="text-[9.5px] text-white/40 uppercase tracking-wider font-mono mt-0.5">Dynamic transaction pulse routing across active system components and rails</p>
            </div>
            
            <button
              onClick={triggerSimulationPulse}
              disabled={isSimulatingPulse}
              className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-cyan-400/30 hover:border-cyan-400/80 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-400 rounded transition-all cursor-pointer flex items-center gap-1"
            >
              <Play className={`w-3 h-3 ${isSimulatingPulse ? 'animate-pulse text-amber-400' : ''}`} />
              {isSimulatingPulse ? 'SIMULATING...' : 'TRIGGER PULSE'}
            </button>
          </div>

          {/* Interactive Flow Diagram Visualizer */}
          <div className="py-10 flex items-center justify-center min-h-[300px] z-10 relative">
            
            {/* Pulsating lines connection network */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              {/* Lines from banks to gateway */}
              <line x1="20%" y1="75%" x2="20%" y2="55%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50%" y1="75%" x2="20%" y2="55%" stroke="#38bdf8" strokeWidth="1" />
              <line x1="80%" y1="75%" x2="20%" y2="55%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />

              {/* Lines from Gateway to SOVR Core */}
              <line x1="20%" y1="55%" x2="50%" y2="22%" stroke="#67e8f9" strokeWidth="1.5" />

              {/* Lines from SOVR Core to sub-nodes */}
              <line x1="50%" y1="22%" x2="22%" y2="40%" stroke="#fbbf24" strokeWidth="1.5" />
              <line x1="50%" y1="22%" x2="50%" y2="40%" stroke="#10b981" strokeWidth="1.5" />
              <line x1="50%" y1="22%" x2="78%" y2="40%" stroke="#a855f7" strokeWidth="1.5" />

              {/* Under connection links */}
              <line x1="22%" y1="40%" x2="50%" y2="40%" stroke="#2a2a35" strokeWidth="1" />
              <line x1="50%" y1="40%" x2="78%" y2="40%" stroke="#2a2a35" strokeWidth="1" />

              {/* Animated flow pulse indicators */}
              {isSimulatingPulse && (
                <>
                  {pulseStep === 0 && (
                    <circle r="4" fill="#38bdf8" className="animate-ping">
                      <animateMotion dur="1s" repeatCount="indefinite" path="M 120 220 L 150 160" />
                    </circle>
                  )}
                  {pulseStep === 1 && (
                    <circle r="5" fill="#22d3ee">
                      <animateMotion dur="1.5s" repeatCount="indefinite" path="M 150 160 L 320 80" />
                    </circle>
                  )}
                  {pulseStep === 2 && (
                    <circle r="6" fill="#a7f3d0" className="animate-pulse">
                      <animateMotion dur="1s" repeatCount="indefinite" path="M 320 80 L 150 120; M 320 80 L 320 120; M 320 80 L 500 120" />
                    </circle>
                  )}
                  {pulseStep === 3 && (
                    <circle r="4" fill="#c084fc">
                      <animateMotion dur="1s" repeatCount="indefinite" path="M 150 120 L 150 160; M 500 120 L 500 160" />
                    </circle>
                  )}
                </>
              )}
            </svg>

            {/* Visual Node Grid */}
            <div className="w-full max-w-2xl grid grid-cols-3 gap-y-12 items-center text-center font-mono">
              
              {/* ROW 1: SOVR CORE IN THE CENTER */}
              <div className="col-span-3 flex justify-center">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveTwinNode('core')}
                  className={`relative p-3.5 rounded-lg border text-xs cursor-pointer select-none transition-all w-48 ${
                    activeTwinNode === 'core' || pulseStep === 2
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]' 
                      : 'bg-black/60 border-cyan-500/20 text-white hover:border-cyan-500/60'
                  }`}
                >
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-black font-black uppercase text-[7px] px-1.5 py-0.5 rounded tracking-widest">
                    CORE SYSTEM
                  </div>
                  <Server className="w-5 h-5 mx-auto text-cyan-400 mb-1.5" />
                  <span className="font-black text-white text-[11px] block tracking-widest">SOVR CORE</span>
                  <span className="text-[8.5px] text-cyan-300 font-bold block mt-0.5 font-mono">26/26 CLUSTERS OK</span>
                </motion.div>
              </div>

              {/* ROW 2: SPLIT COGNITIVE SERVICES (Treasury, Settlement, Trust Vault) */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => { setActiveTwinNode('treasury'); setActiveTab('Treasury'); }}
                className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  activeTwinNode === 'treasury' || pulseStep === 3
                    ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                    : 'bg-black/60 border-white/5 text-white hover:border-amber-500/40'
                }`}
              >
                <Coins className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                <span className="font-bold text-white text-[10.5px] block tracking-wide">Treasury</span>
                <span className="text-[7.5px] text-amber-400/80 uppercase block mt-1 font-bold">MINI SNAPSHOT</span>
                <span className="text-[9px] text-white/50 block font-mono mt-0.5">$20.0M LIQUID</span>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => { setActiveTwinNode('settlement'); setActiveTab('Settlement'); }}
                className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  activeTwinNode === 'settlement' || pulseStep === 3
                    ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                    : 'bg-black/60 border-white/5 text-white hover:border-emerald-500/40'
                }`}
              >
                <Layers className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                <span className="font-bold text-white text-[10.5px] block tracking-wide">Settlement</span>
                <span className="text-[7.5px] text-emerald-400/80 uppercase block mt-1 font-bold">QUEUE ACTIVE</span>
                <span className="text-[9px] text-emerald-400 block font-mono mt-0.5">27 QUEUED</span>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => { setActiveTwinNode('trustvault'); setActiveTab('Trust Vault'); }}
                className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  activeTwinNode === 'trustvault' || pulseStep === 3
                    ? 'bg-purple-500/15 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]' 
                    : 'bg-black/60 border-white/5 text-white hover:border-purple-500/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                <span className="font-bold text-white text-[10.5px] block tracking-wide">Trust Vault</span>
                <span className="text-[7.5px] text-purple-400/80 uppercase block mt-1 font-bold">CRYPTO SEAL</span>
                <span className="text-[9px] text-white/50 block font-mono mt-0.5">18,422 RECS</span>
              </motion.div>

              {/* ROW 3: REPLICATED AUXILIARY SERVICES (Gateway, Compliance, Administration) */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => { setActiveTwinNode('gateway'); setActiveTab('Gateway Fabric'); }}
                className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  activeTwinNode === 'gateway' || pulseStep === 1
                    ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]' 
                    : 'bg-black/60 border-white/5 text-white hover:border-sky-500/40'
                }`}
              >
                <Radio className="w-4 h-4 mx-auto text-sky-400 mb-1" />
                <span className="font-bold text-white text-[10.5px] block tracking-wide">Gateway Fabric</span>
                <span className="text-[7.5px] text-sky-400/80 uppercase block mt-1 font-bold">API PORT ENCLAVE</span>
                <span className="text-[9px] text-white/50 block font-mono mt-0.5">41 INTEGRATIONS</span>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => { setActiveTwinNode('compliance'); setActiveTab('Compliance'); }}
                className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  activeTwinNode === 'compliance' || pulseStep === 4
                    ? 'bg-indigo-500/15 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                    : 'bg-black/60 border-white/5 text-white hover:border-indigo-500/40'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                <span className="font-bold text-white text-[10.5px] block tracking-wide">Compliance</span>
                <span className="text-[7.5px] text-indigo-400/80 uppercase block mt-1 font-bold">GUARDIAN METER</span>
                <span className="text-[9px] text-emerald-400 block font-mono mt-0.5">ZERO VIOLATIONS</span>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => { setActiveTwinNode('admin'); setActiveTab('Administration'); }}
                className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  activeTwinNode === 'admin'
                    ? 'bg-slate-500/15 border-slate-400 shadow-[0_0_12px_rgba(100,116,139,0.2)]' 
                    : 'bg-black/60 border-white/5 text-white hover:border-slate-500/40'
                }`}
              >
                <Settings className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                <span className="font-bold text-white text-[10.5px] block tracking-wide">Administration</span>
                <span className="text-[7.5px] text-slate-400/80 uppercase block mt-1 font-bold">SYSTEM ENTITIES</span>
                <span className="text-[9px] text-white/50 block font-mono mt-0.5">POLICIES HARMONIZED</span>
              </motion.div>

              {/* BOTTOM LEVEL: CONNECTED EXTERNAL RAILS & SERVERS */}
              <div className="col-span-3 mt-4 border-t border-dashed border-white/10 pt-4">
                <span className="text-[8.5px] text-white/35 font-bold uppercase block mb-2 tracking-widest">EXTERNAL SERVICE CHANNELS & FINANCIAL BANKS</span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {['Sovereign Bank', 'Polygon', 'Ethereum', 'Stripe Proxies', 'SAP ERP Enclave', 'AI Orchestrator', 'SMTP relay'].map((ext) => (
                    <span key={ext} className="px-2 py-1 bg-black/40 border border-white/5 rounded text-[8px] text-white/60 tracking-wider">
                      {ext}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] text-white/30 font-mono border-t border-white/5 pt-2 font-bold uppercase tracking-widest z-10">
            <span>Core loop status: ACTIVE SYNC (1.00s cycle)</span>
            <span>Click any module node to jump to its cockpit workspace</span>
          </div>
        </div>

        {/* RIGHT PANEL: Executive Timeline (4 Columns) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#1c1c28] rounded-lg p-5 flex flex-col justify-between font-mono text-white/90">
          <div className="space-y-3.5">
            <div className="border-b border-[#2a2a35]/40 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Executive Live Event Timeline
              </span>
              <span className="text-[7px] text-white/30 uppercase font-bold bg-white/5 px-1.5 py-0.5 rounded">REALTIME</span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-none">
              <AnimatePresence initial={false}>
                {narratives.map((evt) => (
                  <motion.div 
                    key={evt.id} 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-2 border border-white/5 bg-black/30 rounded flex items-start gap-2.5 text-[9px] hover:border-white/10 transition-all"
                  >
                    <span className="text-cyan-400 shrink-0 font-bold">{evt.time}</span>
                    <div className="space-y-0.5">
                      <span className="text-white/80 block leading-normal">{evt.text}</span>
                      <span className={`text-[7px] font-bold uppercase px-1 rounded inline-block ${
                        evt.type === 'treasury' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : evt.type === 'vault' 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : evt.type === 'compliance' 
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : evt.type === 'gateway'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {evt.type}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-[9px] text-white/30 uppercase font-bold flex justify-between items-center">
            <span>System Log Ingress:</span>
            <span className="text-emerald-400">NOMINAL STATE</span>
          </div>
        </div>

      </div>


      {/* SECTION 3: SYSTEM ACTIVITY HEATMAP & LIVE WORKFLOW STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* BOTTOM LEFT: System Activity Heat Map (4 Columns) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#1c1c28] rounded-lg p-5 flex flex-col justify-between font-mono text-white/90">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block border-b border-[#2a2a35]/40 pb-2">
              System Activity Heat Map (Operational Weight)
            </span>

            <div className="space-y-4 pt-1.5">
              {[
                { name: 'Treasury', pct: 75, color: 'bg-amber-400', val: '█████████' },
                { name: 'Settlement', pct: 50, color: 'bg-emerald-400', val: '██████' },
                { name: 'Evidence', pct: 100, color: 'bg-purple-400', val: '████████████' },
                { name: 'Gateway', pct: 33, color: 'bg-sky-400', val: '████' },
                { name: 'Compliance', pct: 25, color: 'bg-indigo-400', val: '███' },
                { name: 'Administration', pct: 8, color: 'bg-slate-400', val: '█' },
              ].map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-[10px] items-center">
                    <span className="text-white/60 font-bold">{item.name}</span>
                    <span className="text-white/30 font-mono text-[9px] uppercase font-bold">WEIGHT: {item.pct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-black rounded overflow-hidden border border-white/5">
                      <div className={`h-full ${item.color} rounded`} style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-[8px] text-white/40 font-bold min-w-[50px] text-right font-mono tracking-tighter">
                      {item.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[8.5px] text-white/30 leading-snug mt-4 border-t border-white/5 pt-2 uppercase">
            Weights measured across distributed transaction processors over a rolling 1-hour cycle.
          </p>
        </div>

        {/* BOTTOM RIGHT: Live Workflow Stream (8 Columns) */}
        <div className="lg:col-span-8 bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 flex flex-col justify-between font-mono text-white/90">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90 font-display flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live Operational Workflow Stream
                </span>
                <p className="text-[9px] text-white/40 uppercase tracking-wider font-mono mt-0.5">Real-time pipeline monitoring tracking transactions through every system stage</p>
              </div>
              <span className="px-2 py-0.5 text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 rounded font-black tracking-widest uppercase">
                20 ACTIVE
              </span>
            </div>

            <div className="space-y-3.5 pt-2">
              {activeWorkflows.map((wf) => {
                return (
                  <div key={wf.id} className="bg-black/40 border border-white/5 rounded p-3 text-[9px] space-y-2.5 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-white font-bold">{wf.id}</span>
                        <span className="text-white/40">|</span>
                        <span className="text-cyan-400 font-bold">{wf.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          wf.step >= 6 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}>
                          {wf.state}
                        </span>
                        <span className="text-white/30">{wf.timer}%</span>
                      </div>
                    </div>

                    {/* Horizontal pipeline visualization */}
                    <div className="grid grid-cols-7 gap-1 text-center font-mono">
                      {[
                        { step: 0, label: 'Ingested' },
                        { step: 1, label: 'Validated' },
                        { step: 2, label: 'Ledger' },
                        { step: 3, label: 'Receipt' },
                        { step: 4, label: 'Evidence' },
                        { step: 5, label: 'Anchored' },
                        { step: 6, label: 'Completed' },
                      ].map((item, idx) => {
                        const isDone = wf.step >= idx;
                        const isCurrent = wf.step === idx;
                        return (
                          <div key={item.label} className="space-y-1">
                            <div className="h-1 rounded bg-black relative border border-white/5">
                              <div className={`h-full rounded transition-all duration-300 ${
                                isDone 
                                  ? 'bg-emerald-400' 
                                  : isCurrent 
                                    ? 'bg-amber-400 animate-pulse' 
                                    : 'bg-white/5'
                              }`} />
                            </div>
                            <span className={`text-[7px] uppercase block font-bold truncate ${
                              isDone ? 'text-white' : isCurrent ? 'text-amber-400' : 'text-white/20'
                            }`}>
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] text-white/30 border-t border-white/5 pt-2.5 font-bold uppercase tracking-widest mt-2">
            <span>Workflow Engine ID: sovr-wf-001a</span>
            <span>Automatically schedules consensus notarization and ledger archival sequences</span>
          </div>
        </div>

      </div>


      {/* SECTION 4: DEEP WORKSPACE Live Snapshots (Grid of 4 Snapshots) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-white/90">
        
        {/* Treasury Snapshot CARD */}
        <div 
          onClick={() => setActiveTab('Treasury')}
          className="bg-[#0c0c12]/90 border border-[#2a2a35] hover:border-amber-500/40 rounded-lg p-5 cursor-pointer flex flex-col justify-between transition-all group hover:bg-black/40"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#2a2a35]/40 pb-2">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-amber-400 block flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                Treasury Snapshot
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-amber-400 transition-all group-hover:translate-x-0.5" />
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between"><span className="text-white/40">Total Assets</span><span className="text-white font-bold">$20,043,868</span></div>
              <div className="flex justify-between"><span className="text-white/40">Liabilities</span><span className="text-white/50">$0.00</span></div>
              <div className="flex justify-between"><span className="text-white/40">Equity Capital</span><span className="text-white font-bold">$20,043,868</span></div>
              <div className="flex justify-between"><span className="text-white/40">Collateral Reserves</span><span className="text-amber-400 font-bold">142,500 SVT</span></div>
              <div className="flex justify-between"><span className="text-white/40">Credit Outstanding</span><span className="text-white/50">0.00</span></div>
            </div>
          </div>

          <div className="text-[7.5px] text-white/30 uppercase font-bold border-t border-white/5 pt-2 mt-4 tracking-wider flex justify-between">
            <span>RES-RATIO: 100%</span>
            <span className="text-amber-400/80 group-hover:underline">Open Treasury Workspace</span>
          </div>
        </div>

        {/* Trust Vault Snapshot CARD */}
        <div 
          onClick={() => setActiveTab('Trust Vault')}
          className="bg-[#0c0c12]/90 border border-[#2a2a35] hover:border-purple-500/40 rounded-lg p-5 cursor-pointer flex flex-col justify-between transition-all group hover:bg-black/40"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#2a2a35]/40 pb-2">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-purple-400 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Trust Vault
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 transition-all group-hover:translate-x-0.5" />
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between"><span className="text-white/40">Sealed Receipts</span><span className="text-white font-bold">18,422</span></div>
              <div className="flex justify-between"><span className="text-white/40">Settlement Certs</span><span className="text-white font-bold">18,422</span></div>
              <div className="flex justify-between"><span className="text-white/40">Audit Packages</span><span className="text-white font-bold">18,422</span></div>
              <div className="flex justify-between"><span className="text-white/40">Verification Req</span><span className="text-white">121 Active</span></div>
              <div className="flex justify-between"><span className="text-white/40">Integrity Hash</span><span className="text-purple-400 font-bold">100% VERIFIED</span></div>
            </div>
          </div>

          <div className="text-[7.5px] text-white/30 uppercase font-bold border-t border-white/5 pt-2 mt-4 tracking-wider flex justify-between">
            <span>MUTABLE LOCK: SECURE</span>
            <span className="text-purple-400/80 group-hover:underline">Open Trust Vault</span>
          </div>
        </div>

        {/* Compliance Snapshot CARD */}
        <div 
          onClick={() => setActiveTab('Compliance')}
          className="bg-[#0c0c12]/90 border border-[#2a2a35] hover:border-indigo-500/40 rounded-lg p-5 cursor-pointer flex flex-col justify-between transition-all group hover:bg-black/40"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#2a2a35]/40 pb-2">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-indigo-400 block flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Compliance Status
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5" />
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between"><span className="text-white/40">Active Policies</span><span className="text-emerald-400 font-bold">6/6 HEALTHY</span></div>
              <div className="flex justify-between"><span className="text-white/40">System Violations</span><span className="text-emerald-400 font-bold">0 ACTIVE</span></div>
              <div className="flex justify-between"><span className="text-white/40">Pending Reviews</span><span className="text-amber-400 font-bold">3 WARNING</span></div>
              <div className="flex justify-between"><span className="text-white/40">Evidence Gaps</span><span className="text-emerald-400 font-bold">0 DETECTED</span></div>
              <div className="flex justify-between"><span className="text-white/40">Approvals Waiting</span><span className="text-amber-400 font-bold">1 WAITING</span></div>
            </div>
          </div>

          <div className="text-[7.5px] text-white/30 uppercase font-bold border-t border-white/5 pt-2 mt-4 tracking-wider flex justify-between">
            <span>SEC RULE: 17A-4 PASS</span>
            <span className="text-indigo-400/80 group-hover:underline">Open Compliance Hub</span>
          </div>
        </div>

        {/* Gateway Fabric Status CARD */}
        <div 
          onClick={() => setActiveTab('Gateway Fabric')}
          className="bg-[#0c0c12]/90 border border-[#2a2a35] hover:border-sky-500/40 rounded-lg p-5 cursor-pointer flex flex-col justify-between transition-all group hover:bg-black/40"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#2a2a35]/40 pb-2">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-sky-400 block flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                Gateway Health
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-sky-400 transition-all group-hover:translate-x-0.5" />
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between"><span className="text-white/40">Active Services</span><span className="text-white font-bold">41</span></div>
              <div className="flex justify-between"><span className="text-white/40">Healthy Enclaves</span><span className="text-emerald-400 font-bold">39</span></div>
              <div className="flex justify-between"><span className="text-white/40">Enclave Warnings</span><span className="text-amber-400 font-bold">2</span></div>
              <div className="flex justify-between"><span className="text-white/40">Offline Services</span><span className="text-emerald-400 font-bold">0</span></div>
              <div className="flex justify-between"><span className="text-white/40">API Calls Today</span><span className="text-white font-bold">{apiCallsCount.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="text-[7.5px] text-white/30 uppercase font-bold border-t border-white/5 pt-2 mt-4 tracking-wider flex justify-between">
            <span>INGRESS PORT: 3000 OK</span>
            <span className="text-sky-400/80 group-hover:underline">Open Gateway Fabric</span>
          </div>
        </div>

      </div>


      {/* SECTION 5: PLATFORM MAP / TOPOLOGY & EXECUTIVE SYSTEM KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Platform Map Topology (6 Columns) */}
        <div 
          onClick={() => setActiveTab('Network')}
          className="lg:col-span-6 bg-[#0a0a0f] border border-[#1c1c28] hover:border-cyan-500/40 cursor-pointer rounded-lg p-5 flex flex-col justify-between transition-all group font-mono text-white/90"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '40s' }} />
                Platform Map Topology
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-cyan-400 transition-all group-hover:translate-x-0.5" />
            </div>

            <p className="text-[9px] text-white/60 leading-relaxed uppercase">
              Consensus validation cluster dispersion mapped across 6 operational continental regions.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[
                { zone: 'North America', nodes: '17 Nodes', status: 'ACTIVE' },
                { zone: 'Europe', nodes: '12 Nodes', status: 'ACTIVE' },
                { zone: 'Asia', nodes: '9 Nodes', status: 'ACTIVE' },
                { zone: 'Australia', nodes: '3 Nodes', status: 'ACTIVE' },
                { zone: 'South America', nodes: '4 Nodes', status: 'ACTIVE' },
                { zone: 'Africa', nodes: '2 Nodes', status: 'ACTIVE' }
              ].map(item => (
                <div key={item.zone} className="bg-black/30 border border-white/5 rounded p-2 flex justify-between items-center">
                  <div>
                    <span className="text-white/40 block text-[8px] uppercase font-bold">{item.zone}</span>
                    <span className="text-white font-bold block mt-0.5">{item.nodes}</span>
                  </div>
                  <span className="text-[8px] font-black text-emerald-400 tracking-wider">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[7.5px] text-white/30 uppercase font-bold border-t border-white/5 pt-2 mt-4 tracking-wider flex justify-between">
            <span>TOTAL CLUSTERS: 47</span>
            <span className="text-cyan-400/80 group-hover:underline">Open 3D Spatial Network Globe</span>
          </div>
        </div>

        {/* Executive KPIs & Platform Trust Meter (6 Columns) */}
        <div className="lg:col-span-6 bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 flex flex-col justify-between font-mono text-white/90">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block border-b border-[#2a2a35]/40 pb-2">
              Platform Trust Index & Verification Metrics
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Trust Meter Radial representation */}
              <div className="bg-black/30 border border-white/5 rounded p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[8.5px] text-white/40 uppercase font-bold tracking-widest block">Platform Trust Index</span>
                  <div className="py-4 text-center">
                    <span className="text-3xl font-light text-cyan-400 tracking-tighter">99.998%</span>
                    <p className="text-[7.5px] text-white/30 uppercase mt-1 tracking-widest font-black">STABILITY QUORUM SECURE</p>
                  </div>
                </div>
                
                <div className="h-1.5 bg-black rounded overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: '99.998%' }} />
                </div>
              </div>

              {/* Individual trust components */}
              <div className="space-y-1.5 text-[9.5px]">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/40">Evidence Integrity</span>
                  <span className="text-emerald-400 font-bold">100% SECURE</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/40">Notary Signatures</span>
                  <span className="text-emerald-400 font-bold">100% ENROLLED</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/40">Ledger Invariance</span>
                  <span className="text-emerald-400 font-bold">100% COHESIVE</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/40">Validator Consensus</span>
                  <span className="text-amber-400 font-bold">99.98% QUORUM</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/40">Witness Verification</span>
                  <span className="text-emerald-400 font-bold">100% ATTESTED</span>
                </div>
              </div>

            </div>
          </div>

          <div className="text-[7.5px] text-white/30 uppercase font-bold border-t border-white/5 pt-2 mt-4 tracking-widest flex justify-between">
            <span>MUTABLE DRIFT: ZERO</span>
            <span>AUDIT READINESS: CRITICAL READY</span>
          </div>
        </div>

      </div>


      {/* SECTION 6: PLATFORM NARRATIVE (HUMAN OPERATIONAL PROSE) */}
      <div className="bg-[#0c0c12]/95 border border-cyan-500/20 rounded-lg p-5 font-mono text-white/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3.5 z-10 relative">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Platform Human Narrative & Operational Story
            </span>
          </div>
          <span className="text-[7.5px] text-white/40 font-bold uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded border border-white/5">
            NATURAL LANGUAGE TRANSLATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9.5px] text-white/80 leading-relaxed font-sans z-10 relative">
          <div className="space-y-2 bg-black/40 border border-white/5 p-3 rounded">
            <span className="text-[8px] text-cyan-400 font-mono font-bold tracking-widest block uppercase">LATEST INBOUND ACTION NARRATION</span>
            <p className="leading-normal">
              A commercial inbound payment webhook cleared mTLS encryption buffers on ports 443/3000. Sovereign Core automatically completed matching validations with the internal SVT liquidity reservoir.
            </p>
          </div>
          <div className="space-y-2 bg-black/40 border border-white/5 p-3 rounded">
            <span className="text-[8px] text-amber-400 font-mono font-bold tracking-widest block uppercase">LATEST OUTBOUND LIQUIDITY BALANCE</span>
            <p className="leading-normal">
              Trust Vault compiled digital clearing certificate <span className="font-mono text-amber-300 font-semibold select-all text-[9px] bg-white/5 px-1 rounded">SC-20260626-000021</span>. Ledger state reached validation consensus across North American and European cluster nodes simultaneously.
            </p>
          </div>
        </div>

        <div className="text-[7.5px] text-white/30 uppercase font-mono mt-3.5 font-bold tracking-widest block border-t border-white/5 pt-2 flex justify-between">
          <span>COGNITIVE TRANSLATION AGENT: ACTIVE</span>
          <span>Eecosystem perfectly secure</span>
        </div>
      </div>

    </div>
  );
}
