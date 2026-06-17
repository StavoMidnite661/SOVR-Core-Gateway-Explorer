import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Radio, Activity, Cpu, Database, ShieldCheck,
  TrendingUp, X, Search,
  ShieldAlert, AlertCircle, CheckCircle
} from 'lucide-react';
import { Transaction, LedgerAccount, GeoNode, Route } from '../types';
import SovereignGlobe from './SovereignGlobe';
import QuantumEntropyOscilloscope from './QuantumEntropyOscilloscope';
import ComplianceHub from './ComplianceHub';
import backgroundMap from '../assets/images/sovr_background_map_1781167617436.png';

interface CommandCenterViewProps {
  onClose: () => void;
  totalAssetsUSD: number;
  totalSVT: number;
  p99LatencyMs: number;
  transactions: Transaction[];
  formatCurrency: (amount: number, denom: string) => string;
  accounts: LedgerAccount[];
  pulseCount: number;
  pendingVerifications: number;
  timelineEvents: any[];
  ingestionItems: any[];
  agents: any[];
  anomalies: any[];
  geoNodes: GeoNode[];
  routes: Route[];
  currentBlockHeight: number;
  onTriggerAnomaly: () => void;
  onDismissAnomaly: (id: string) => void;
}

export default function CommandCenterView({
  onClose,
  totalAssetsUSD,
  totalSVT,
  p99LatencyMs,
  transactions,
  formatCurrency,
  accounts,
  pulseCount,
  pendingVerifications,
  timelineEvents,
  ingestionItems,
  agents,
  anomalies,
  geoNodes,
  routes,
  currentBlockHeight,
  onTriggerAnomaly,
  onDismissAnomaly
}: CommandCenterViewProps) {
  // Modes: 'network' | 'treasury' | 'consensus' | 'ingestion' | 'agents' | 'forensics' | 'compliance'
  const [activeMode, setActiveMode] = useState<'network' | 'treasury' | 'consensus' | 'ingestion' | 'agents' | 'forensics' | 'compliance'>('network');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('NY_LC');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [heatmapOn, setHeatmapOn] = useState<boolean>(true);
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [logFilter, setLogFilter] = useState<string>('ALL');
  
  // SECURE OPERATOR TRACE TERMINAL STATES
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalTyping, setTerminalTyping] = useState<boolean>(false);

  // Set up selected elements lists
  const selectedNode = useMemo(() => {
    if (!geoNodes || geoNodes.length === 0) return null;
    return geoNodes.find(n => n.id === selectedNodeId) || geoNodes[0];
  }, [selectedNodeId, geoNodes]);

  const selectedRoute = useMemo(() => {
    if (!routes || routes.length === 0) return null;
    return routes.find(r => r.id === selectedRouteId) || null;
  }, [selectedRouteId, routes]);

  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);

  if (!geoNodes || geoNodes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#040406] flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-cyan-500 uppercase tracking-widest text-sm animate-pulse">Establishing Authority Link...</p>
          <button onClick={onClose} className="mt-8 px-4 py-2 border border-rose-500 text-rose-500 text-xs uppercase hover:bg-rose-500/10 transition-colors">
            Terminate Connection
          </button>
        </div>
      </div>
    );
  }

  // Guaranteed at this point that selectedNode exists because geoNodes.length > 0
  const activeNode = selectedNode!;

  // Typing operator terminal trace effect on node selection
  useEffect(() => {
    setTerminalTyping(true);
    let logs: string[] = [];
    if (activeNode) {
      logs = [
        `[SOVR_SHELL] CONNECTED to host: ${activeNode.name} (${activeNode.id})`,
        `[AUTH_HANDSHAKE] mTLS v1.3 stream mutually-confirmed: PASS`,
        `[COMPLIANCE] Merkle root seal matching state digest verified`,
        `[DIAGNOSTIC] latency: ${activeNode.latency}ms RT, CPU: ${activeNode.cpu}%, RAM: ${activeNode.ram}%`,
        `[SECURITY] Authority ledger invariance validated. Net drift: 0.000`
      ];
    } else {
      logs = [
        `[SOVR_SHELL] Standby for Operator Select Actions...`,
        `> listening on port 3000...`,
        `> running local consensus loops... ALL CORES NOMINAL.`
      ];
    }
    
    setTerminalLogs([logs[0] || '']);
    let index = 1;
    const interval = setInterval(() => {
      if (index < logs.length) {
        setTerminalLogs(prev => [...prev, logs[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTerminalTyping(false);
      }
    }, 130);

    return () => {
      clearInterval(interval);
    };
  }, [selectedNodeId, selectedNode]);

  const handleTriggerAnomalySimulation = () => {
    onTriggerAnomaly();
  };

  const handleDismissAnomaly = (id: string) => {
    onDismissAnomaly(id);
  };

  // Filter logs based on search query/type selection
  const filteredTimelineEvents = useMemo(() => {
    return timelineEvents.filter(ev => {
      const matchesSearch = ev.msg.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                            ev.type.toLowerCase().includes(logSearchQuery.toLowerCase());
      
      const matchesFilter = logFilter === 'ALL' || ev.type === logFilter;
      return matchesSearch && matchesFilter;
    });
  }, [timelineEvents, logSearchQuery, logFilter]);

  // Helper inside Node Health visualizer to build circle ring
  const renderHealthRing = (percentage: number, colorClass: string, label: string) => {
    const strokeDash = 2 * Math.PI * 14; // circumference for exact R=14 svg circle
    const offset = strokeDash - (percentage / 100) * strokeDash;
    return (
      <div className="flex flex-col items-center">
        <svg className="w-10 h-10 transform -rotate-90">
          {/* background ring */}
          <circle cx="20" cy="20" r="14" fill="transparent" stroke="#222" strokeWidth="2.5" />
          {/* animated progress ring */}
          <circle 
            cx="20" 
            cy="20" 
            r="14" 
            fill="transparent" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeDasharray={strokeDash}
            strokeDashoffset={offset}
            className={`${colorClass} transition-all duration-1000`}
          />
        </svg>
        <span className="text-[10px] text-white/80 font-bold mt-1 font-mono">{percentage}%</span>
        <span className="text-[7.5px] text-white/30 uppercase mt-0.5 tracking-tighter">{label}</span>
      </div>
    );
  };

  return (
    <div id="command-center-fullscreen-dashboard" className="fixed inset-0 z-50 bg-[#040406]/98 backdrop-blur-xl overflow-y-auto font-mono text-xs select-none">
      {/* Background oversized blueprint map */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none opacity-[0.06] mix-blend-screen scale-110">
        <img 
          src={backgroundMap} 
          alt="SOVR Terminal Blueprint Map" 
          className="w-full h-full object-cover select-none pointer-events-none blur-[0.2px]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Top Ambient Tech Border line */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 animate-pulse w-full shadow-[0_0_8px_#06b6d4] sticky top-0 z-50" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-8 flex flex-col space-y-6">
        {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2a2a35] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[#02c39a] shadow-[0_0_10px_#02c39a] animate-ping" />
          <div>
            <h1 className="text-sm font-black tracking-widest text-[#ffffff] uppercase font-display flex items-center gap-2">
              SOVR Capital Routing Command Center
              <span className="text-[8.5px] bg-[#02c39a]/10 border border-[#02c39a]/30 text-[#02c39a] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-widest leading-none">v2.0 STATE</span>
            </h1>
            <span className="text-[10px] text-white/40 uppercase">SOVR Financial Network Operating System // Continuous Quorum Verified</span>
          </div>
        </div>

        {/* Global Modes Controllers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#08080c] p-1 border border-[#2a2a35] rounded-sm">
          {(['network', 'treasury', 'consensus', 'ingestion', 'agents', 'forensics', 'compliance'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-3 py-1.5 rounded-sm font-mono text-[9px] uppercase font-bold transition-all cursor-pointer ${
                activeMode === mode 
                  ? 'bg-[#02c39a]/15 text-[#02c39a] border border-[#02c39a]/40 shadow-[0_0_8px_rgba(2,195,154,0.15)]' 
                  : 'text-white/40 border border-transparent hover:text-white/75'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 border border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/20 hover:border-rose-500/50 rounded-sm uppercase font-bold tracking-widest text-[9.5px] transition-all cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <X className="w-3.5 h-3.5" />
          Terminate Node Connect
        </button>
      </div>

      {/* CORE BENTO-GRID OPERATION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
        
        {/* Left Column: Spatial Telemetry Map or Detail Mode Specific (7 Columns out of 12) */}
        <div className="lg:col-span-7 bg-[#08080c] border border-[#2a2a35] min-h-[420px] lg:h-[520px] rounded p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
          
          {/* ALWAYS RENDER THE 3D ROTATING GLOBE IN THE BACKGROUND! */}
          <div id="globe_canvas_container" className="absolute inset-x-0 bottom-0 top-12 z-0 overflow-hidden pointer-events-auto">
            <SovereignGlobe
              geoNodes={geoNodes}
              routes={routes}
              selectedNodeId={selectedNodeId}
              selectedRouteId={selectedRouteId}
              onSelectNode={setSelectedNodeId}
              onSelectRoute={setSelectedRouteId}
              heatmapOn={heatmapOn}
              activeMode={activeMode}
            />
          </div>

          {/* Mode-Specific Content Layout for Left Map-Area Panel */}
          {activeMode === 'network' && (
            <div className="z-10 pointer-events-none h-full flex flex-col justify-between relative">
              {/* Title & Controls */}
              <div className="z-10 flex items-start justify-between pointer-events-auto">
                <div>
                  <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#02c39a]" />
                    Map: Spatial Capital Router Telemetry (Drag to rotate, Shift to drift)
                  </span>
                  <p className="text-[8.5px] text-white/25 mt-1 font-mono">REAL-TIME PACKET ARC DEVIATIONS // GRAPH INTERCONNECT SYSTEMS</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHeatmapOn(!heatmapOn)}
                    className={`px-2 py-0.5 rounded border text-[8px] font-mono uppercase transition-all tracking-wider font-bold cursor-pointer ${
                      heatmapOn 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/35 shadow-[0_0_6px_rgba(234,179,8,0.1)]' 
                        : 'border-[#2a2a35] text-white/40 bg-transparent'
                    }`}
                  >
                    Heatmap: {heatmapOn ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Ingress status footer metrics inside the map visual panel */}
              <div className="flex items-center justify-between z-10 text-[8.5px] text-white/35 font-bold uppercase tracking-widest border-t border-[#2a2a35]/50 pt-2 font-mono bg-[#040406]/60 backdrop-blur-[2px] p-2 rounded">
                <span>Ingress protocol rate: 99.98% accurate</span>
                <span>Active regional consensus synchronized ({geoNodes.length}/{geoNodes.length} nodes verified)</span>
              </div>
            </div>
          )}

          {activeMode === 'treasury' && (
            <div className="z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  SOVR Treasury Supply Allocation Matrix
                </span>
                <p className="text-[8.5px] text-white/20 mt-1">REAL-TIME LIQUIDITY DISTRIBUTIONS OVER ACTIVE GLOBAL ANCHORS</p>
              </div>

              <div className="my-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Node-by-node treasury allocations */}
                <div className="bg-[#050507] border border-[#2a2a35] rounded p-3 space-y-2 font-mono">
                  <span className="text-[9px] text-white/40 uppercase tracking-widest block font-bold leading-none">Continental Liquid Ratios</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-white/50">North America (NY Core):</span>
                      <span className="text-white font-bold">$84.30M USD (35.2%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-sm overflow-hidden">
                      <div className="bg-[#02c39a] h-full" style={{ width: '35.2%' }} />
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="text-white/50">Southeast Asia (Singapore):</span>
                      <span className="text-white font-bold">$144.80M USD (45.8%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-sm overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: '45.8%' }} />
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="text-white/50">Europe (Zurich & London):</span>
                      <span className="text-white font-bold">$177.50M USD (19.0%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-sm overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: '19.0%' }} />
                    </div>
                  </div>
                </div>

                {/* Capital Flow metrics box summary */}
                <div className="bg-[#050507] border border-[#2a2a35] rounded p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-white/40 uppercase tracking-widest block font-bold leading-none">Automated Liquidity Guard Policy</span>
                    <p className="text-[9.5px] mt-2 text-white/60 leading-normal">
                      The SOVR core mint rebalances liquidity margins every 60-seconds consensus block sequence. Prevents regional ledger exhaustion and settlement drag.
                    </p>
                  </div>
                  <div className="p-2 bg-[#0c0c12] border border-[#2a2a35]/60 rounded text-[9px] flex items-center justify-between text-amber-400 font-bold">
                    <span>SVT TREASURY RESERVES NOMINAL:</span>
                    <span>835,565,578 SVT</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2a2a35]/50 pt-2 flex items-center justify-between text-[8px] text-white/30 uppercase font-bold tracking-widest">
                <span>Federal Reserve bridge: ACTIVE</span>
                <span>Audit confirmation: VERIFIED SECURE</span>
              </div>
            </div>
          )}

          {activeMode === 'consensus' && (
            <div className="z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Consensus Quorum & Block Hash Audits
                </span>
                <p className="text-[8.5px] text-white/20 mt-1">REPLICATED CRYPTOGRAPHIC AGREEMENT ENGINE STATS</p>
              </div>

              <div className="my-auto space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[#050507] border border-[#2a2a35] p-2.5 rounded-sm text-center">
                    <span className="text-white/30 text-[8.5px] uppercase tracking-wider block">Quorum Invariant Match</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono block mt-1">100.00%</span>
                    <span className="text-[7.5px] text-white/20 uppercase font-bold tracking-widest">6/6 Validating Nodes</span>
                  </div>
                  <div className="bg-[#050507] border border-[#2a2a35] p-2.5 rounded-sm text-center">
                    <span className="text-white/30 text-[8.5px] uppercase tracking-wider block">Round Epoch Speed</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono block mt-1">102ms</span>
                    <span className="text-[7.5px] text-white/20 uppercase font-bold tracking-widest">Round-Trip Signature speed</span>
                  </div>
                  <div className="bg-[#050507] border border-[#2a2a35] p-2.5 rounded-sm text-center">
                    <span className="text-white/30 text-[8.5px] uppercase tracking-wider block">Active Block Height</span>
                    <span className="text-lg font-bold text-white font-mono block mt-1">#{currentBlockHeight}</span>
                    <span className="text-[7.5px] text-white/20 uppercase font-bold tracking-widest">Real-time dynamic chain</span>
                  </div>
                </div>

                {/* Simulated Merkle root visual map path */}
                <div className="bg-[#050507] border border-[#2a2a35] p-3 rounded-sm font-mono text-[9px]">
                  <span className="text-white/35 uppercase text-[8px] font-bold tracking-widest block mb-1">Merkle Tree Serialization Route</span>
                  <pre className="text-[8.5px] text-purple-400 font-bold overflow-x-auto select-none font-mono">
{`   [Block Root Target: 9c8f2d...ef420]
         /                             \\
   [Sub-Hash A: 1fa2e]           [Sub-Hash B: d03ff]
     /           \\                 /           \\
 [Tx_NY_01]   [Tx_LDN_02]     [Tx_ZRH_03]   [Tx_SGP_04]`}
                  </pre>
                </div>
              </div>

              <div className="border-t border-[#2a2a35]/50 pt-2 flex items-center justify-between text-[8px] text-white/30 uppercase font-bold tracking-widest">
                <span>Proof Of Authority consensus: ACTIVE</span>
                <span>ECDSA secp256k1 keys fully matching</span>
              </div>
            </div>
          )}

          {activeMode === 'ingestion' && (
            <div className="z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Real-time Ingestion Engine Packet Matrix
                </span>
                <p className="text-[8.5px] text-white/20 mt-1">CONTINUOUS CHANNELS POLLING REGULATORY MESSAGES</p>
              </div>

              {/* Streaming list of ingestion clients */}
              <div className="my-auto max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {ingestionItems.map((item, idx) => (
                    <div key={idx} className="bg-[#050507] border border-[#2a2a35] p-2 rounded-sm space-y-1 text-center select-none font-mono">
                      <div className="flex justify-between items-center text-[7.5px] text-white/30 font-bold pb-1 border-b border-[#2a2a35]/40 uppercase">
                        <span>{item.name}</span>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      </div>
                      <div className="py-1">
                        <span className="text-[12px] font-bold text-white font-mono block">{item.rate} <span className="text-[7.5px] text-[#02c39a]">msgs/s</span></span>
                      </div>
                      <div className="flex justify-between text-[7px] text-white/20 block border-t border-[#2a2a35]/20 pt-1 font-bold">
                        <span>QUEUE: {item.queue}</span>
                        <span>{item.lastSync}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#2a2a35]/50 pt-2 flex items-center justify-between text-[8px] text-white/30 uppercase font-bold tracking-widest">
                <span>Ingestion gateway streams: STABLE</span>
                <span>Packet loss: 0.00% across all API bindings</span>
              </div>
            </div>
          )}

          {activeMode === 'agents' && (
            <div className="z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#02c39a]" />
                  Autonomous Financial System Operating Agents
                </span>
                <p className="text-[8.5px] text-white/25 mt-1">REPLICATED ORCHESTRATORS EXECUTING DECENTRALIZED POLICIES</p>
              </div>

              <div className="my-auto grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Horizontal left list of agents */}
                <div className="md:col-span-1 space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {agents.map((agent, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAgentIndex(idx)}
                      className={`w-full text-left p-2 border rounded-sm font-mono text-[9px] flex items-center justify-between transition-all cursor-pointer ${
                        selectedAgentIndex === idx 
                          ? 'bg-[#02c39a]/10 border-[#02c39a]/50 text-white font-bold' 
                          : 'bg-[#050507] border-[#2a2a35]/60 text-white/50 hover:text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 bg-emerald-500 rounded-full ${agent.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
                        <span>{agent.name}</span>
                      </div>
                      <span className="text-[8px] text-white/30 uppercase">{agent.status}</span>
                    </button>
                  ))}
                </div>

                {/* Right detailed expanded logs view */}
                <div className="md:col-span-2 bg-[#050507] border border-[#2a2a35] rounded p-3 flex flex-col justify-between font-mono text-[10px]">
                  {agents[selectedAgentIndex] && (
                    <>
                      <div>
                        <div className="flex justify-between border-b border-[#2a2a35]/60 pb-1 mb-2">
                          <span className="font-bold text-white">{agents[selectedAgentIndex].name}</span>
                          <span className="text-[#02c39a] font-bold uppercase text-[9px]">{agents[selectedAgentIndex].status} STATE</span>
                        </div>

                        <div className="space-y-1.5 text-[9.5px]">
                          <div className="flex justify-between">
                            <span className="text-white/40">Current Task:</span>
                            <span className="text-white/85">{agents[selectedAgentIndex].task}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Allocated CPU Power:</span>
                            <span className="text-[#02c39a] font-bold">{agents[selectedAgentIndex].cpu} Core Limit</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Task Confidence Accuracy:</span>
                            <span className="text-amber-400 font-bold">{agents[selectedAgentIndex].score} Matching Confidence</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Latest Action Output:</span>
                            <span className="text-white font-semibold truncate block max-w-[170px]">{agents[selectedAgentIndex].action}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 bg-[#08080c] border border-white/5 p-2 rounded-sm text-[8px] space-y-1">
                        <span className="text-white/35 uppercase text-[7px] font-bold tracking-widest block">Agent Stream Outputs</span>
                        {agents[selectedAgentIndex].logs.map((log: string, lIdx: number) => (
                          <div key={lIdx} className="text-white/60 truncate font-mono">{log}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-[#2a2a35]/50 pt-2 flex items-center justify-between text-[8px] text-white/30 uppercase font-bold tracking-widest">
                <span>Agent daemon engine: REPLICATED STABLE</span>
                <span>Policies: 8/8 active enforcement parameters</span>
              </div>
            </div>
          )}

          {activeMode === 'forensics' && (
            <div className="z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Forensic Integrity Verification & Ledger Audit Rails
                </span>
                <p className="text-[8.5px] text-white/20 mt-1">MATHEMATICAL DOUBLE-ENTRY INVARIANT VERIFICATION CERTIFICATIONS</p>
              </div>

              <div className="my-auto space-y-3 font-mono">
                <div className="bg-[#050507] border border-[#2a2a35] p-3 rounded space-y-2">
                  <div className="flex justify-between items-center text-[11px] border-b border-[#2a2a35]/40 pb-1">
                    <span className="text-white/60">Double-Entry Ledger Integrity Verification:</span>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9.5px] border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">ALGEBRAICALLY_INVARIANT</span>
                  </div>

                  <div className="text-[10px] text-white/70 leading-relaxed font-sans mt-2 space-y-1.5">
                    <p>
                      Every single asset ledger transaction posted to this network is audited dynamically against raw balance invariants:
                    </p>
                    <div className="bg-[#0c0c12] border border-white/5 px-2 py-1 font-mono text-[#02c39a] text-[9.5px] rounded select-all mb-1 text-center font-bold">
                      {"∑ Debits = ∑ Credits (Net System Matrix Deviation: 0.000000000)"}
                    </div>
                    <p>
                      The SHA-256 Authority signature maps both block records, verification Merkle paths, and state consensus histories.
                    </p>
                  </div>
                </div>

                <div className="p-2 bg-[#050507] border border-[#2a2a35]/60 rounded-sm text-[9.5px] grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-white/30 uppercase font-bold">Authority Signature:</span>
                    <span className="text-cyan-400 font-bold font-mono">ECDSA_SOVR_v2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30 uppercase font-bold">State validation:</span>
                    <span className="text-emerald-400 font-bold font-mono">100% NOMINAL</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2a2a35]/50 pt-2 flex items-center justify-between text-[8px] text-white/30 uppercase font-bold tracking-widest">
                <span>Audit certificate: VERIFIED SECURE</span>
                <span>SHA-256 Ledger invariance hash: Nominal</span>
              </div>
            </div>
          )}

          {activeMode === 'compliance' && (
            <ComplianceHub
              accounts={accounts}
              transactions={transactions}
              formatCurrency={formatCurrency}
            />
          )}

        </div>

        {/* Right Column: Node Details, Rings, Invariants, and Anomalies (5 Columns out of 12) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 h-full">
          
          {/* Node Intelligence Detail Panel */}
          <div className="bg-[#08080c] border border-[#2a2a35] rounded p-4 space-y-3.5 flex flex-col justify-between flex-grow transition-all duration-300">
            <div>
              <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center justify-between gap-1">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#02c39a]" />
                  Node Intelligence Diagnostic Panel
                </span>
                <span className="text-white/20 select-text font-mono text-[8px] tracking-tight">NODE ID: {activeNode.id}</span>
              </span>

              <div className="mt-3 flex items-start gap-4">
                {/* Visual Mini 4 Health Rings Area */}
                <div className="grid grid-cols-2 gap-3 bg-[#0c0c12] p-2.5 border border-white/5 rounded">
                  {renderHealthRing(activeNode.cpu, activeNode.cpu > 80 ? 'text-amber-500' : 'text-[#02c39a]', 'CPU LIMIT')}
                  {renderHealthRing(activeNode.ram, 'text-[#02c39a]', 'MEM ALLOC')}
                  {renderHealthRing(activeNode.disk, 'text-purple-400', 'DISK USE')}
                  {renderHealthRing(100 - activeNode.latency / 2, 'text-[#02c39a]', 'NET SYNC')}
                </div>

                {/* Node static properties */}
                <div className="flex-grow space-y-1 text-[10px] font-mono leading-tight">
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Node Role:</span>
                    <span className="text-white font-bold">{activeNode.role}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Region Location:</span>
                    <span className="text-white">{activeNode.region}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Node Status:</span>
                    <span className={`font-bold ${activeNode.status === 'ONLINE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {activeNode.status}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Heartbeat Jitter:</span>
                    <span className="text-cyan-300 font-bold">{activeNode.latency}ms RT Lat</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Synchronized Workers:</span>
                    <span className="text-white">{activeNode.workers.toLocaleString()} slots</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Total Txns Processed:</span>
                    <span className="text-[#02c39a] font-bold">{activeNode.txnsProcessed.toLocaleString()} items</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">SVT Net Flow Capacity:</span>
                    <span className="text-amber-400 font-bold">{activeNode.settlementValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Quorum Trust Score:</span>
                    <span className="text-[#02c39a] font-bold">{activeNode.trustScore}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Streaming Terminal logs shell */}
              <div className="mt-3.5 border border-white/5 bg-[#030305]/95 rounded p-2.5 font-mono text-[9px] leading-tight text-white/50 space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5 text-[7.5px] text-white/35 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${terminalTyping ? 'bg-amber-400 animate-pulse' : 'bg-[#02c39a]'}`} />
                    Operator secure host trace terminal
                  </span>
                  <span>MTLS v1.3 CHANNEL</span>
                </div>
                <div className="space-y-1 h-[75px] overflow-y-auto scrollbar-thin select-text font-mono">
                  {terminalLogs.map((log, logIdx) => (
                    <div key={logIdx} className={`truncate ${log.includes('FAIL') || log.includes('ERR') ? 'text-rose-400' : log.includes('CONNECTED') || log.includes('Mutually') || log.includes('stream') ? 'text-emerald-400 font-bold' : 'text-[#22d3ee]'}`}>
                      {log}
                    </div>
                  ))}
                  {terminalTyping && <span className="inline-block w-1 h-2.5 bg-[#02c39a] animate-pulse ml-0.5" />}
                </div>
              </div>

            </div>

            {/* If a route is clicked, display Route Telemetry Drawer popup widget */}
            {selectedRoute && (
              <div className="bg-[#0c0c12]/90 border border-amber-500/30 p-2.5 rounded-sm text-[9.5px] space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-[#2a2a35] pb-1 text-amber-400 font-bold">
                  <span className="flex items-center gap-1.5 uppercase tracking-wide text-[8.5px]">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                    Interconnect Telemetry Drawer Clicked
                  </span>
                  <button 
                    onClick={() => setSelectedRouteId(null)}
                    className="text-[8.5px] hover:text-white text-white/40 font-mono uppercase"
                  >
                    [CLOSE]
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div><span className="text-white/40">Origin Node:</span> <span className="text-white font-bold">{selectedRoute.fromId}</span></div>
                  <div><span className="text-white/40">Destination Node:</span> <span className="text-white font-bold">{selectedRoute.toId}</span></div>
                  <div><span className="text-white/40">Throughput TPS:</span> <span className="text-[#02c39a] font-bold">{selectedRoute.avgTps} TPS</span></div>
                  <div><span className="text-white/40">Epoch Flow rate:</span> <span className="text-white">{selectedRoute.volume}</span></div>
                  <div><span className="text-white/40">Jitter Latency:</span> <span className="text-cyan-300 font-bold">{selectedRoute.latency}ms</span></div>
                  <div><span className="text-white/40">Consensus Match:</span> <span className="text-purple-400 font-bold">{selectedRoute.consensus}</span></div>
                  <div><span className="text-white/40">Packet Loss:</span> <span className="text-rose-400">{selectedRoute.loss}%</span></div>
                  <div><span className="text-white/40">Success Rate:</span> <span className="text-emerald-400 font-bold">{selectedRoute.successRate}%</span></div>
                </div>
              </div>
            )}

            {/* Persistent real-time Quantum Entropy Oscilloscope on side HUD */}
            <QuantumEntropyOscilloscope />
          </div>

          {/* Core Consensus Observatory Dashboard widget */}
          <div className="bg-[#08080c] border border-[#2a2a35] rounded p-4 space-y-3 font-mono">
            <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center justify-between gap-1">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Ledger Consensus Observatory
              </span>
              <span className="text-[#02c39a] font-bold uppercase text-[8px]">ONLINE STATS</span>
            </span>

            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="p-2 bg-[#0c0c12]/80 border border-white/5 rounded space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/40">Network Health:</span>
                  <span className="text-emerald-400 font-bold">98.8% NOM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Node Availability:</span>
                  <span className="text-white">100% ACTIVE</span>
                </div>
              </div>

              <div className="p-2 bg-[#0c0c12]/80 border border-white/5 rounded space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/40">Seal Accuracy:</span>
                  <span className="text-[#02c39a] font-bold">99.999% OK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Active Witnesses:</span>
                  <span className="text-purple-400 font-bold">12 Witness Nodes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Network Threats & Anomalies Component (Threat Detection Layer) */}
          <div className="bg-[#0d0910] border border-[#a855f7]/25 rounded p-4 space-y-2.5 font-mono flex-grow relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[#a855f7] uppercase text-[9.5px] font-bold tracking-widest block border-b border-[#a855f7]/20 pb-1 flex items-center justify-between gap-1">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#a855f7]" />
                  Threat Detection Layer & Anomalies
                </span>
                
                {/* Direct simulation trigger button */}
                <button
                  onClick={handleTriggerAnomalySimulation}
                  className="text-[8px] bg-[#a855f7]/15 border border-[#a855f7]/30 hover:bg-[#a855f7]/35 text-[#c084fc] px-1.5 py-0.5 rounded cursor-pointer leading-none transition-all uppercase font-bold"
                >
                  SIMULATE TRIGGER
                </button>
              </span>

              {/* Scrollable list of errors / logs */}
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto mt-2.5 pr-1 scrollbar-thin">
                {anomalies.filter(an => !an.dismissed).length === 0 ? (
                  <div className="text-[#02c39a] text-[9.5px] py-4 bg-[#02c39a]/5 border border-[#02c39a]/10 rounded flex items-center gap-1.5 justify-center">
                    <CheckCircle className="w-4 h-4 text-[#02c39a]" />
                    <span className="font-bold uppercase tracking-wider text-[8.5px]">ALL SYSTEMS NOMINAL. ZERO ACTIVE RISK THREATS DETECTED.</span>
                  </div>
                ) : (
                  anomalies.filter(an => !an.dismissed).map((an, idx) => (
                    <div 
                      key={an.id} 
                      className={`p-2 border rounded-sm text-[9px] flex items-start justify-between gap-2 transition-all leading-normal ${
                        an.severe 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                          : 'bg-amber-500/5 border-amber-500/25 text-amber-300'
                      }`}
                    >
                      <div className="flex items-start gap-1.5 pt-0.5">
                        <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 ${an.severe ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                        <span>{an.text}</span>
                      </div>
                      <button 
                        onClick={() => handleDismissAnomaly(an.id)}
                        className="text-[8px] uppercase underline cursor-pointer hover:text-white font-bold opacity-60 flex-shrink-0"
                      >
                        DISMISS
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#050507] p-2 rounded-sm border border-white/5 text-[8.5px] text-white/30 tracking-tight flex items-center justify-between">
              <span>ALERT STATUS LEVEL:</span>
              <span className={`font-black uppercase tracking-widest ${
                anomalies.filter(an => !an.dismissed && an.severe).length > 0 
                  ? 'text-rose-400 animate-pulse' 
                  : anomalies.filter(an => !an.dismissed).length > 0 
                    ? 'text-amber-400' 
                    : 'text-[#02c39a]'
              }`}>
                {anomalies.filter(an => !an.dismissed && an.severe).length > 0 
                  ? 'ELEVATED SEVERE' 
                  : anomalies.filter(an => !an.dismissed).length > 0 
                    ? 'WARNING DRIFT' 
                    : 'SECURE NOMINAL'
                }
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Global Interactive Bottom Timeline Event Log Panel with search querying */}
      <div className="bg-[#08080c] border border-[#2a2a35] rounded p-4 h-[180px] overflow-hidden flex flex-col justify-between font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a2a35]/60 pb-2 mb-2">
          <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#02c39a] animate-pulse" />
            Global Operating Ledger Protocol Event Logger
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Simple filtering buttons */}
            {(['ALL', 'CONSENSUS', 'TREASURY', 'INGEST', 'ANOMALY'] as const).map(f => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                className={`px-2 py-0.5 rounded-sm text-[8px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                  logFilter === f 
                    ? 'bg-[#02c39a]/15 text-[#02c39a] border border-[#02c39a]/30' 
                    : 'text-white/30 border border-transparent hover:text-white/65'
                }`}
              >
                {f}
              </button>
            ))}

            {/* Event search box option */}
            <div className="relative flex items-center bg-[#050507] border border-[#2a2a35] px-2 py-0.5 rounded">
              <Search className="w-3 h-3 text-white/30 mr-1 flex-shrink-0" />
              <input
                type="text"
                placeholder="Audit Search..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white/80 placeholder-white/20 text-[8.5px] w-[110px] font-mono leading-none"
              />
            </div>
          </div>
        </div>

        {/* Scrollable event timeline block feed */}
        <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 font-mono max-h-[110px] scrollbar-thin">
          {filteredTimelineEvents.length === 0 ? (
            <div className="text-center text-white/20 select-none py-6">
              No ledger events found matching the search criteria.
            </div>
          ) : (
            filteredTimelineEvents.map(ev => {
              let dotColor = 'bg-[#02c39a]'; // Teal consensus/commit
              if (ev.type === 'TREASURY') dotColor = 'bg-amber-400';
              if (ev.type === 'INGEST') dotColor = 'bg-cyan-400';
              if (ev.type === 'ANOMALY') dotColor = 'bg-rose-500';

              return (
                <div key={ev.id} className="flex items-center justify-between text-[9px] border-b border-[#2a2a35]/15 pb-1 last:border-b-0 leading-normal font-mono select-text">
                  <div className="flex items-center gap-2 max-w-[80%]">
                    <span className="text-white/30 flex-shrink-0">[{ev.time}]</span>
                    <span className="flex items-center gap-1 bg-[#101015] px-1 py-0.5 rounded text-[7.5px] text-white/40 uppercase tracking-widest block flex-shrink-0 border border-white/5 font-bold">
                      <span className={`w-1 h-1 rounded-full ${dotColor}`} />
                      {ev.type}
                    </span>
                    <span className="text-white/85 truncate block" title={ev.msg}>{ev.msg}</span>
                  </div>

                  <span className="text-white/25 text-[8px] uppercase tracking-wider block flex-shrink-0 font-bold select-none">
                    VERIFIED // NOM_OK
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
