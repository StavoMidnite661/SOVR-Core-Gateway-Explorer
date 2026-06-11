import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Radio, Activity, Cpu, Database, ShieldCheck, AlertTriangle, 
  TrendingUp, X, Play, Pause, Search, Clock, ArrowUpRight, 
  Terminal, BarChart2, ShieldAlert, Cpu as CoreCpu, Layers, AlertCircle, CheckCircle
} from 'lucide-react';
import { Transaction } from '../types';
import SovereignGlobe from './SovereignGlobe';

interface CommandCenterViewProps {
  onClose: () => void;
  totalAssetsUSD: number;
  totalSVT: number;
  p99LatencyMs: number;
  transactions: Transaction[];
  formatCurrency: (amount: number, denom: string) => string;
}

interface GeoNode {
  id: string;
  name: string;
  role: string;
  region: string;
  lat: number;
  lon: number;
  status: 'ONLINE' | 'WARNING' | 'DEGRADED';
  latency: number;
  cpu: number;
  ram: number;
  disk: number;
  workers: number;
  txnsProcessed: number;
  settlementValue: string;
  lastSeal: string;
  lastConsensus: string;
  softwareVersion: string;
  trustScore: string;
}

interface Route {
  id: string;
  fromId: string;
  toId: string;
  avgTps: number;
  volume: string;
  latency: number;
  successRate: number;
  drift: number;
  loss: number;
  consensus: string;
}

export default function CommandCenterView({
  onClose,
  totalAssetsUSD,
  totalSVT,
  p99LatencyMs,
  transactions,
  formatCurrency
}: CommandCenterViewProps) {
  // Modes: 'network' | 'treasury' | 'consensus' | 'ingestion' | 'agents' | 'forensics'
  const [activeMode, setActiveMode] = useState<'network' | 'treasury' | 'consensus' | 'ingestion' | 'agents' | 'forensics'>('network');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('NY_LC');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [heatmapOn, setHeatmapOn] = useState<boolean>(true);
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [logFilter, setLogFilter] = useState<string>('ALL');
  
  // Real-time metrics that tick up/fluctuate
  const [currentBlock, setCurrentBlock] = useState<number>(7421);
  const [pendingVerifications, setPendingVerifications] = useState<number>(3);
  const [pulseCount, setPulseCount] = useState<number>(0);

  // Simulation data
  const geoNodes: GeoNode[] = useMemo(() => [
    {
      id: 'NY_LC',
      name: 'NY Ledger Core',
      role: 'Ledger Settlement Host',
      region: 'North America',
      lat: 40.7128,
      lon: -74.0060,
      status: 'ONLINE',
      latency: 12,
      cpu: 24,
      ram: 42,
      disk: 68,
      workers: 1522,
      txnsProcessed: 1824552,
      settlementValue: '$84.3M',
      lastSeal: `blk_${currentBlock - 3}`,
      lastConsensus: '0.8 sec ago',
      softwareVersion: 'v5.9.2',
      trustScore: '99.998%'
    },
    {
      id: 'LDN_R',
      name: 'London Routing',
      role: 'Consensus Coordinator',
      region: 'Western Europe',
      lat: 51.5072,
      lon: -0.1276,
      status: 'ONLINE',
      latency: 15,
      cpu: 18,
      ram: 37,
      disk: 52,
      workers: 1140,
      txnsProcessed: 1420550,
      settlementValue: '$65.1M',
      lastSeal: `blk_${currentBlock - 1}`,
      lastConsensus: '1.1 sec ago',
      softwareVersion: 'v5.9.2',
      trustScore: '100% NOM'
    },
    {
      id: 'ZRH_T',
      name: 'Zurich Treasury',
      role: 'Sovereign Vault Agent',
      region: 'Central Europe',
      lat: 47.3769,
      lon: 8.5417,
      status: 'ONLINE',
      latency: 16,
      cpu: 31,
      ram: 50,
      disk: 61,
      workers: 920,
      txnsProcessed: 981440,
      settlementValue: '$112.4M',
      lastSeal: `blk_${currentBlock - 2}`,
      lastConsensus: '0.9 sec ago',
      softwareVersion: 'v5.9.1',
      trustScore: '99.999%'
    },
    {
      id: 'SGP_G',
      name: 'Singapore Gate',
      role: 'Asynchronous Gateway',
      region: 'Southeast Asia',
      lat: 1.3521,
      lon: 103.8198,
      status: 'ONLINE',
      latency: 32,
      cpu: 48,
      ram: 58,
      disk: 74,
      workers: 2150,
      txnsProcessed: 2891460,
      settlementValue: '$144.8M',
      lastSeal: `blk_${currentBlock}`,
      lastConsensus: '1.4 sec ago',
      softwareVersion: 'v5.9.2',
      trustScore: '99.997%'
    },
    {
      id: 'TYO_C',
      name: 'Tokyo Consensus',
      role: 'Witness Notary Node',
      region: 'East Asia',
      lat: 35.6762,
      lon: 139.6503,
      status: 'ONLINE',
      latency: 41,
      cpu: 14,
      ram: 29,
      disk: 44,
      workers: 840,
      txnsProcessed: 1102900,
      settlementValue: '$48.2M',
      lastSeal: `blk_${currentBlock - 1}`,
      lastConsensus: '1.2 sec ago',
      softwareVersion: 'v5.9.2',
      trustScore: '100.00%'
    },
    {
      id: 'DXB_T',
      name: 'Dubai Treasury',
      role: 'Liquidity Oracle Host',
      region: 'Middle East',
      lat: 25.2048,
      lon: 55.2708,
      status: 'ONLINE',
      latency: 22,
      cpu: 27,
      ram: 45,
      disk: 59,
      workers: 1180,
      txnsProcessed: 1530200,
      settlementValue: '$96.5M',
      lastSeal: `blk_${currentBlock - 4}`,
      lastConsensus: '1.7 sec ago',
      softwareVersion: 'v5.9.0',
      trustScore: '99.995%'
    },
    {
      id: 'SYD_S',
      name: 'Sydney Settlement',
      role: 'Settlement Liquidator',
      region: 'Oceania',
      lat: -33.8688,
      lon: 151.2093,
      status: 'ONLINE',
      latency: 82,
      cpu: 19,
      ram: 36,
      disk: 48,
      workers: 610,
      txnsProcessed: 591320,
      settlementValue: '$21.9M',
      lastSeal: `blk_${currentBlock - 1}`,
      lastConsensus: '2.1 sec ago',
      softwareVersion: 'v5.9.1',
      trustScore: '100% NOM'
    },
    {
      id: 'SAO_L',
      name: 'São Paulo Liquidity',
      role: 'Asset Pool Custodian',
      region: 'South America',
      lat: -23.5505,
      lon: -46.6333,
      status: 'WARNING',
      latency: 94,
      cpu: 82,
      ram: 79,
      disk: 88,
      workers: 1320,
      txnsProcessed: 1205300,
      settlementValue: '$39.2M',
      lastSeal: `blk_${currentBlock - 2}`,
      lastConsensus: '2.5 sec ago',
      softwareVersion: 'v5.9.2',
      trustScore: '98.423%'
    },
    {
      id: 'YTO_V',
      name: 'Toronto Validator',
      role: 'Integrity Verifier Client',
      region: 'North America',
      lat: 43.6532,
      lon: -79.3832,
      status: 'ONLINE',
      latency: 18,
      cpu: 21,
      ram: 40,
      disk: 51,
      workers: 740,
      txnsProcessed: 914550,
      settlementValue: '$34.0M',
      lastSeal: `blk_${currentBlock - 1}`,
      lastConsensus: '0.9 sec ago',
      softwareVersion: 'v5.9.2',
      trustScore: '99.999%'
    },
    {
      id: 'FRA_R',
      name: 'Frankfurt Reserve',
      role: 'Reserve Yield Oracle',
      region: 'Western Europe',
      lat: 50.1109,
      lon: 8.6821,
      status: 'ONLINE',
      latency: 14,
      cpu: 25,
      ram: 44,
      disk: 55,
      workers: 1050,
      txnsProcessed: 1311450,
      settlementValue: '$57.8M',
      lastSeal: `blk_${currentBlock - 5}`,
      lastConsensus: '1.0 sec ago',
      softwareVersion: 'v5.9.2',
      trustScore: '100% NOM'
    }
  ], [currentBlock]);

  const routes: Route[] = useMemo(() => [
    { id: 'R1', fromId: 'LDN_R', toId: 'SGP_G', avgTps: 162, volume: '$4.8M', latency: 14, successRate: 99.97, drift: 0.002, loss: 0.00, consensus: 'Verified' },
    { id: 'R2', fromId: 'NY_LC', toId: 'LDN_R', avgTps: 245, volume: '$12.4M', latency: 8, successRate: 100.0, drift: 0.000, loss: 0.00, consensus: 'Verified' },
    { id: 'R3', fromId: 'ZRH_T', toId: 'FRA_R', avgTps: 98, volume: '$16.2M', latency: 3, successRate: 99.99, drift: 0.001, loss: 0.00, consensus: 'Verified' },
    { id: 'R4', fromId: 'DXB_T', toId: 'TYO_C', avgTps: 110, volume: '$5.1M', latency: 28, successRate: 99.95, drift: 0.004, loss: 0.01, consensus: 'Verified' },
    { id: 'R5', fromId: 'SGP_G', toId: 'SYD_S', avgTps: 76, volume: '$3.5M', latency: 42, successRate: 99.98, drift: 0.003, loss: 0.00, consensus: 'Verified' },
    { id: 'R6', fromId: 'SAO_L', toId: 'NY_LC', avgTps: 120, volume: '$2.9M', latency: 86, successRate: 99.85, drift: 0.015, loss: 0.04, consensus: 'Warning_Sync' },
    { id: 'R7', fromId: 'YTO_V', toId: 'FRA_R', avgTps: 85, volume: '$1.8M', latency: 38, successRate: 99.99, drift: 0.001, loss: 0.00, consensus: 'Verified' },
    { id: 'R8', fromId: 'DXB_T', toId: 'SGP_G', avgTps: 190, volume: '$9.2M', latency: 19, successRate: 100.0, drift: 0.001, loss: 0.00, consensus: 'Verified' }
  ], []);

  // Set up selected elements lists
  const selectedNode = useMemo(() => geoNodes.find(n => n.id === selectedNodeId) || geoNodes[0], [selectedNodeId, geoNodes]);
  const selectedRoute = useMemo(() => routes.find(r => r.id === selectedRouteId) || null, [selectedRouteId, routes]);

  // Dynamic system logs stream with specific categories
  const [timelineEvents, setTimelineEvents] = useState<Array<{ id: string; time: string; msg: string; type: 'CONSENSUS' | 'TREASURY' | 'INGEST' | 'COMMIT' | 'ANOMALY' }>>([
    { id: 'ev_1', time: '02:44:11', msg: 'System blockchain seal blk_7420 finalized (100% approval rate)', type: 'CONSENSUS' },
    { id: 'ev_2', time: '02:44:05', msg: 'SGP_G requested asynchronous yield escrow adjustments [+$4,500,000 SVT]', type: 'TREASURY' },
    { id: 'ev_3', time: '02:43:52', msg: 'Stripe webhook Ingest: payload balance allocation for operating expenses', type: 'INGEST' },
    { id: 'ev_4', time: '02:43:40', msg: 'Node Frankfurt Reserve matched regulatory verification state parameters', type: 'COMMIT' },
    { id: 'ev_5', time: '02:43:12', msg: 'Slight congestion wave flagged from São Paulo Liquidity node (latency > 100ms)', type: 'ANOMALY' },
    { id: 'ev_6', time: '02:42:50', msg: 'Coinbase core vault bridge re-allocated holding reserves to Escrow accounts', type: 'TREASURY' },
    { id: 'ev_7', time: '02:42:15', msg: 'Authority validation chain synchronized globally', type: 'CONSENSUS' }
  ]);

  // Real-time API Ingestion simulation items
  const [ingestionItems, setIngestionItems] = useState([
    { name: 'Stripe Pay', rate: 142, queue: 0, status: 'NOMINAL', lastSync: '100ms ago' },
    { name: 'Visa Direct', rate: 285, queue: 1, status: 'NOMINAL', lastSync: '220ms ago' },
    { name: 'Mastercard Gate', rate: 195, queue: 0, status: 'NOMINAL', lastSync: '500ms ago' },
    { name: 'FedNow Router', rate: 64, queue: 0, status: 'NOMINAL', lastSync: '120ms ago' },
    { name: 'ACH Terminal', rate: 12, queue: 0, status: 'NOMINAL', lastSync: '2.1s ago' },
    { name: 'Bank Wire Ingress', rate: 4, queue: 0, status: 'NOMINAL', lastSync: '4.5s ago' },
    { name: 'Coinbase Ledger', rate: 45, queue: 0, status: 'NOMINAL', lastSync: '240ms ago' },
    { name: 'Treasury Ops Feed', rate: 3, queue: 1, status: 'NOMINAL', lastSync: '500ms ago' },
    { name: 'Vendor Oracle Bridge', rate: 8, queue: 0, status: 'NOMINAL', lastSync: '1.2s ago' },
    { name: 'Audit Witness Node', rate: 1, queue: 0, status: 'NOMINAL', lastSync: '1s ago' }
  ]);

  // Autonomous System Agents state
  const [agents, setAgents] = useState([
    { name: 'Settlement Agent', status: 'ACTIVE', task: 'Polling client deposit nodes...', cpu: '1.2%', action: 'Verified invoice audit balance', score: '99.99%', logs: ['02:44:19 - Pushed lock state to NY Core', '02:44:02 - Loaded minor state balances'] },
    { name: 'Treasury Agent', status: 'ONLINE', task: 'Balancing multi-pool reserve weights...', cpu: '0.8%', action: 'Rebalanced Zurich escrow margin', score: '99.98%', logs: ['02:43:58 - Detected SVT transfer request', '02:43:10 - Released surplus pool reserve'] },
    { name: 'Risk Agent', status: 'ONLINE', task: 'Scanning for double-entry drift issues...', cpu: '2.5%', action: 'Calculated zero ledger variance', score: '100.0%', logs: ['02:44:11 - Completed general matrix check', '02:44:00 - Solved balance linear bounds'] },
    { name: 'Audit Agent', status: 'IDLE', task: 'Awaiting block Merkle leaf seal approval...', cpu: '0.1%', action: 'Verified blk_7420 digest signatures', score: '99.99%', logs: ['02:43:44 - Saved verified Block Merkle root', '02:43:12 - Handshake verified with Singapore'] },
    { name: 'Routing Agent', status: 'ACTIVE', task: 'Measuring continental round-trip p99 jitter...', cpu: '1.4%', action: 'Optimized Dublin-to-Singapore paths', score: '99.95%', logs: ['02:44:18 - Latency recalculation passed', '02:44:05 - Re-routed SP pool to NY server'] },
    { name: 'Witness Agent', status: 'ONLINE', task: 'Signing validated epoch hashes...', cpu: '0.7%', action: 'Generated cryptographic witness certification', score: '100.0%', logs: ['02:44:12 - Signed block verification pack #7420', '02:44:00 - Quorum validated 6/6 signers'] },
    { name: 'Oracle Agent', status: 'ACTIVE', task: 'Evaluating asset margin exchanges...', cpu: '1.1%', action: 'Fetched USD-to-SVT parity index from API', score: '99.97%', logs: ['02:44:15 - Updated external price parity delta', '02:43:50 - Read external vendor pool data'] },
    { name: 'Compliance Agent', status: 'ONLINE', task: 'Auditing dynamic KYC validation limits...', cpu: '0.4%', action: 'Completed continuous compliance verification', score: '99.99%', logs: ['02:44:10 - Checked high-volume limit triggers', '02:43:02 - Clean sweep of AML boundary logs'] }
  ]);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);

  // Active Network Anomaly checklist
  const [anomalies, setAnomalies] = useState([
    { id: 'an_1', text: 'São Paulo node latency spike (94ms / average 35ms)', severe: false, dismissed: false },
    { id: 'an_2', text: 'Drift correction threshold evaluation in-progress', severe: false, dismissed: false },
    { id: 'an_3', text: 'Automatic redundancy path fallback active between YTO and FRA', severe: false, dismissed: false }
  ]);

  // Handle ticking up block heights, transaction figures, and appending new flow simulations
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount(p => p + 1);

      // Increment block height occasionally
      const r = Math.random();
      if (r > 0.85) {
        setCurrentBlock(b => b + 1);
        setPendingVerifications(Math.floor(Math.random() * 4) + 1);
        
        // Add new consensus log
        const timestamp = new Date().toTimeString().split(' ')[0];
        setTimelineEvents(prev => [
          { 
            id: `ev_${Date.now()}`, 
            time: timestamp, 
            msg: `New cryptographic block state #7421 authority seal produced successfully.`, 
            type: 'CONSENSUS' 
          },
          ...prev.slice(0, 10)
        ]);
      }

      // Slightly fluctuate metrics
      setIngestionItems(prev => prev.map(item => ({
        ...item,
        rate: Math.max(item.rate + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 8), 1),
        queue: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0
      })));

      // Occasional new timeline event
      if (Math.random() > 0.7 && transactions.length > 0) {
        const tIdx = Math.floor(Math.random() * transactions.length);
        const randTx = transactions[tIdx];
        const timestamp = new Date().toTimeString().split(' ')[0];
        const types: Array<'TREASURY' | 'INGEST' | 'COMMIT' | 'ANOMALY'> = ['TREASURY', 'INGEST', 'COMMIT', 'ANOMALY'];
        const selectedType = types[Math.floor(Math.random() * types.length)];
        
        let customMsg = `Routed transactional packet [${formatCurrency(randTx.amountMinor, randTx.denomination)}] via ${randTx.rail.toUpperCase()}`;
        if (selectedType === 'COMMIT') {
          customMsg = `Committed double-entry algebraic state proof for balance [${formatCurrency(randTx.amountMinor, randTx.denomination)}]`;
        }

        setTimelineEvents(prev => [
          {
            id: `ev_${Date.now()}`,
            time: timestamp,
            msg: customMsg,
            type: selectedType
          },
          ...prev.slice(0, 15)
        ]);
      }

    }, 3500);

    return () => clearInterval(timer);
  }, [transactions, formatCurrency]);

  const handleTriggerAnomalySimulation = () => {
    const alerts = [
      'Federal Reserve FedNow packet payload handshake pending retry',
      'Memory pool expansion limit reaching 85% capacity on Singapore Gate node',
      'API webhook ping timeout detected on Uniswap liquidity tracking Oracle',
      'Automatic block verification witness #11 delay warning: sync threshold drift alert'
    ];
    const alertText = alerts[Math.floor(Math.random() * alerts.length)];
    setAnomalies(prev => [
      { id: `an_${Date.now()}`, text: alertText, severe: Math.random() > 0.5, dismissed: false },
      ...prev
    ]);
  };

  const handleDismissAnomaly = (id: string) => {
    setAnomalies(prev => prev.map(an => an.id === id ? { ...an, dismissed: true } : an));
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
      {/* Top Ambient Tech Border line */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 animate-pulse w-full shadow-[0_0_8px_#06b6d4] sticky top-0 z-50" />
      
      <div className="max-w-7xl mx-auto w-full px-4 py-8 flex flex-col space-y-6">
        {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2a2a35] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[#02c39a] shadow-[0_0_10px_#02c39a] animate-ping" />
          <div>
            <h1 className="text-sm font-black tracking-widest text-[#ffffff] uppercase font-display flex items-center gap-2">
              Sovereign Capital Routing Command Center
              <span className="text-[8.5px] bg-[#02c39a]/10 border border-[#02c39a]/30 text-[#02c39a] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-widest leading-none">v2.0 STATE</span>
            </h1>
            <span className="text-[10px] text-white/40 uppercase">Sovereign Financial Network Operating System // Continuous Quorum Verified</span>
          </div>
        </div>

        {/* Global Modes Controllers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#08080c] p-1 border border-[#2a2a35] rounded-sm">
          {(['network', 'treasury', 'consensus', 'ingestion', 'agents', 'forensics'] as const).map(mode => (
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
        <div className="lg:col-span-7 bg-[#08080c] border border-[#2a2a35] min-h-[380px] lg:h-[520px] rounded p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
                  {/* Background Cyberpunk Stationary Globe Hologram! (8-12% opacity) */}
          {activeMode !== 'network' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center scale-90 md:scale-100 select-none opacity-10">
              <svg viewBox="0 0 400 400" className="w-full h-full text-[#22d3ee]/60 stroke-current animate-[spin_120s_linear_infinite]">
                {/* Outer boundary */}
                <circle cx="200" cy="200" r="180" fill="none" strokeWidth="1" strokeDasharray="5 5" />
                <circle cx="200" cy="200" r="130" fill="none" strokeWidth="0.5" strokeDasharray="3 15" />
                <circle cx="200" cy="200" r="70" fill="none" strokeWidth="0.5" strokeDasharray="3 3" />
                
                {/* Ellipse Meridiand & Latitudes to represent a holographic sphere projection */}
                <ellipse cx="200" cy="200" rx="180" ry="60" fill="none" strokeWidth="0.5" />
                <ellipse cx="200" cy="200" rx="180" ry="120" fill="none" strokeWidth="0.75" />
                <ellipse cx="200" cy="200" rx="60" ry="180" fill="none" strokeWidth="0.5" />
                <ellipse cx="200" cy="200" rx="120" ry="180" fill="none" strokeWidth="0.75" />
                <line x1="20" y1="200" x2="380" y2="200" strokeWidth="1" />
                <line x1="200" y1="20" x2="200" y2="380" strokeWidth="1" />
                
                {/* Subtle tech tick marks inside the globe */}
                <circle cx="200" cy="200" r="175" fill="none" strokeWidth="1" strokeDasharray="1 10" />
              </svg>
            </div>
          )}

          {/* Mode-Specific Content Layout for Left Map-Area Panel */}
          {activeMode === 'network' && (
            <>
              {/* Title & Controls */}
              <div className="z-10 flex items-start justify-between">
                <div>
                  <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#02c39a]" />
                    Map: Spatial Capital Router Telemetry (Drag to rotate, Shift to drift)
                  </span>
                  <p className="text-[8.5px] text-white/25 mt-1">REAL-TIME PACKET ARC DEVIATIONS // GRAPH INTERCONNECT SYSTEMS</p>
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

              {/* Interactive 3D Rotating Globe Canvas */}
              <div id="globe_canvas_container" className="relative flex-grow h-full w-full min-h-[220px] mt-4 z-10 overflow-hidden">
                <SovereignGlobe
                  geoNodes={geoNodes}
                  routes={routes}
                  selectedNodeId={selectedNodeId}
                  selectedRouteId={selectedRouteId}
                  onSelectNode={setSelectedNodeId}
                  onSelectRoute={setSelectedRouteId}
                  heatmapOn={heatmapOn}
                />
              </div>

              {/* Ingress status footer metrics inside the map visual panel */}
              <div className="flex items-center justify-between z-10 text-[8.5px] text-white/35 font-bold uppercase tracking-widest border-t border-[#2a2a35]/50 pt-2 font-mono">
                <span>Ingress protocol rate: 99.98% accurate</span>
                <span>Active regional consensus synchronized ({geoNodes.length}/{geoNodes.length} nodes verified)</span>
              </div>
            </>
          )}

          {activeMode === 'treasury' && (
            <div className="z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  Sovereign Treasury Supply Allocation Matrix
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
                      The Sovereign core mint rebalances liquidity margins every 60-seconds consensus block sequence. Prevents regional ledger exhaustion and settlement drag.
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
                    <span className="text-lg font-bold text-white font-mono block mt-1">#{currentBlock}</span>
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
                    {agents[selectedAgentIndex].logs.map((log, lIdx) => (
                      <div key={lIdx} className="text-white/60 truncate font-mono">{log}</div>
                    ))}
                  </div>
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
                    <span className="text-cyan-400 font-bold font-mono">ECDSA_Sovereign_v2</span>
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
                <span className="text-white/20 select-text font-mono text-[8px] tracking-tight">NODE ID: {selectedNode.id}</span>
              </span>

              <div className="mt-3 flex items-start gap-4">
                {/* Visual Mini 4 Health Rings Area */}
                <div className="grid grid-cols-2 gap-3 bg-[#0c0c12] p-2.5 border border-white/5 rounded">
                  {renderHealthRing(selectedNode.cpu, selectedNode.cpu > 80 ? 'text-amber-500' : 'text-[#02c39a]', 'CPU LIMIT')}
                  {renderHealthRing(selectedNode.ram, 'text-[#02c39a]', 'MEM ALLOC')}
                  {renderHealthRing(selectedNode.disk, 'text-purple-400', 'DISK USE')}
                  {renderHealthRing(100 - selectedNode.latency / 2, 'text-[#02c39a]', 'NET SYNC')}
                </div>

                {/* Node static properties */}
                <div className="flex-grow space-y-1 text-[10px] font-mono leading-tight">
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Node Role:</span>
                    <span className="text-white font-bold">{selectedNode.role}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Region Location:</span>
                    <span className="text-white">{selectedNode.region}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Node Status:</span>
                    <span className={`font-bold ${selectedNode.status === 'ONLINE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Heartbeat Jitter:</span>
                    <span className="text-cyan-300 font-bold">{selectedNode.latency}ms RT Lat</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Synchronized Workers:</span>
                    <span className="text-white">{selectedNode.workers.toLocaleString()} slots</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">Total Txns Processed:</span>
                    <span className="text-[#02c39a] font-bold">{selectedNode.txnsProcessed.toLocaleString()} items</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2a2a35]/40 pb-0.5">
                    <span className="text-white/40">SVT Net Flow Capacity:</span>
                    <span className="text-amber-400 font-bold">{selectedNode.settlementValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Quorum Trust Score:</span>
                    <span className="text-[#02c39a] font-bold">{selectedNode.trustScore}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* If a route is clicked, display Route Telemetry Drawer popup widget */}
            {selectedRoute ? (
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
            ) : (
              <div className="p-3 bg-[#050507] rounded-sm border border-white/5 text-[9px] text-white/50 leading-relaxed font-sans">
                💡 <span className="font-bold text-[#02c39a]">Command Option:</span> Click on any connecting route arc on the map above to view the precise inter-node latency details, packet loss coefficients, and network consensus verification states.
              </div>
            )}
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
