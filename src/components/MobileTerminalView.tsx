import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Radio, 
  Layers, 
  Database, 
  Power, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Coins, 
  TrendingUp, 
  Info,
  DollarSign,
  Download,
  Bell,
  BellRing,
  Globe,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
  Check,
  AlertCircle,
  Search,
  BookOpen,
  ArrowRight,
  Sliders,
  Terminal,
  Play,
  Share2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Transaction, LedgerAccount, HashBlock, ConnectedApp, SystemHealth } from '../types';
import SovereignGlobe from './SovereignGlobe';

interface MobileTerminalProps {
  accounts: LedgerAccount[];
  transactions: Transaction[];
  apps: ConnectedApp[];
  volumeSeries: any[];
  health: SystemHealth;
  currentBlock: HashBlock;
  chain: HashBlock[];
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  onPostTransaction: (params: any) => void;
  onExportLogs: () => void;
  onForceSeal: () => void;
  notifications: any[];
  clearNotifications: () => void;
  totalSVT: number;
  totalAssetsUSD: number;
}

export default function MobileTerminalView({
  accounts,
  transactions,
  apps,
  volumeSeries,
  health,
  currentBlock,
  chain,
  isConnected,
  setIsConnected,
  onPostTransaction,
  onExportLogs,
  onForceSeal,
  notifications,
  clearNotifications,
  totalSVT,
  totalAssetsUSD
}: MobileTerminalProps) {
  // Navigation Tabs: 'dashboard' | 'network' | 'ledger' | 'agents' | 'more'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'network' | 'ledger' | 'agents' | 'more'>('dashboard');

  // Interactive diagnostic states
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);
  const [selectedChainBlockIndex, setSelectedChainBlockIndex] = useState<number>(0);

  // Quick action FAB radial menu state
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isVerificationActive, setIsVerificationActive] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Tactical Mode State
  const [isTacticalMode, setIsTacticalMode] = useState(false);

  // Custom Transaction post form states
  const [debitId, setDebitId] = useState(accounts[0]?.id || '');
  const [creditId, setCreditId] = useState(accounts[1]?.id || '');
  const [amountInput, setAmountInput] = useState('500');
  const [memoInput, setMemoInput] = useState('MCT Tactical Ledger Sync');
  const [railInput, setRailInput] = useState<'stripe' | 'ach' | 'fednow' | 'onchain' | 'svt'>('svt');

  // Swipeable telemetry graph states
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'tps' | 'treasury' | 'settlement' | 'consensus' | 'load'>('tps');
  const graphScrollRef = useRef<HTMLDivElement>(null);

  // Geo nodes detail database for drawer lookups (aligned with CommandCenterView)
  const mobileGeonodes = [
    { id: 'NY_LC', name: 'NY Ledger Core', role: 'Ledger Settlement Host', region: 'North America', lat: 40.7128, lon: -74.0060, status: 'ONLINE', latency: 12, cpu: 24, ram: 42, disk: 68, workers: 1522, txnsProcessed: 1824552, settlementValue: '$84.3M', lastSeal: 'blk_7420', trustScore: '99.998%', currentLoad: '42%' },
    { id: 'LDN_R', name: 'London Routing', role: 'Consensus Coordinator', region: 'Western Europe', lat: 51.5072, lon: -0.1276, status: 'ONLINE', latency: 15, cpu: 18, ram: 37, disk: 52, workers: 1140, txnsProcessed: 1420550, settlementValue: '$65.1M', lastSeal: 'blk_7423', trustScore: '100% NOM', currentLoad: '28%' },
    { id: 'ZRH_T', name: 'Zurich Treasury', role: 'SOVR Vault Agent', region: 'Central Europe', lat: 47.3769, lon: 8.5417, status: 'ONLINE', latency: 16, cpu: 31, ram: 50, disk: 61, workers: 920, txnsProcessed: 981440, settlementValue: '$112.4M', lastSeal: 'blk_7422', trustScore: '99.999%', currentLoad: '50%' },
    { id: 'SGP_G', name: 'Singapore Gate', role: 'Asynchronous Gateway', region: 'Southeast Asia', lat: 1.3521, lon: 103.8198, status: 'ONLINE', latency: 32, cpu: 48, ram: 58, disk: 74, workers: 2150, txnsProcessed: 2891460, settlementValue: '$144.8M', lastSeal: 'blk_7424', trustScore: '99.997%', currentLoad: '62%' },
    { id: 'TYO_C', name: 'Tokyo Consensus', role: 'Witness Notary Node', region: 'East Asia', lat: 35.6762, lon: 139.6503, status: 'ONLINE', latency: 41, cpu: 14, ram: 29, disk: 44, workers: 840, txnsProcessed: 1102900, settlementValue: '$48.2M', lastSeal: 'blk_7423', trustScore: '100.00%', currentLoad: '18%' },
    { id: 'DXB_T', name: 'Dubai Treasury', role: 'Liquidity Oracle Host', region: 'Middle East', lat: 25.2048, lon: 55.2708, status: 'ONLINE', latency: 22, cpu: 27, ram: 45, disk: 59, workers: 1180, txnsProcessed: 1530200, settlementValue: '$96.5M', lastSeal: 'blk_7421', trustScore: '99.995%', currentLoad: '34%' },
    { id: 'SYD_S', name: 'Sydney Settlement', role: 'Settlement Liquidator', region: 'Oceania', lat: -33.8688, lon: 151.2093, status: 'ONLINE', latency: 82, cpu: 19, ram: 36, disk: 48, workers: 610, txnsProcessed: 591320, settlementValue: '$21.9M', lastSeal: 'blk_7423', trustScore: '100% NOM', currentLoad: '21%' },
    { id: 'SAO_L', name: 'São Paulo Liquidity', role: 'Asset Pool Custodian', region: 'South America', lat: -23.5505, lon: -46.6333, status: 'WARNING', latency: 94, cpu: 82, ram: 79, disk: 88, workers: 1320, txnsProcessed: 1205300, settlementValue: '$39.2M', lastSeal: 'blk_7422', trustScore: '98.423%', currentLoad: '85%' },
    { id: 'YTO_V', name: 'Toronto Validator', role: 'Integrity Verifier Client', region: 'North America', lat: 43.6532, lon: -79.3832, status: 'ONLINE', latency: 18, cpu: 21, ram: 40, disk: 51, workers: 740, txnsProcessed: 914550, settlementValue: '$34.0M', lastSeal: 'blk_7423', trustScore: '99.999%', currentLoad: '24%' },
    { id: 'FRA_R', name: 'Frankfurt Reserve', role: 'Reserve Yield Oracle', region: 'Western Europe', lat: 50.1109, lon: 8.6821, status: 'ONLINE', latency: 14, cpu: 25, ram: 44, disk: 55, workers: 1050, txnsProcessed: 1311450, settlementValue: '$57.8M', lastSeal: 'blk_7419', trustScore: '100% NOM', currentLoad: '30%' }
  ];

  const mobileRoutes = [
    { id: 'R1', fromId: 'LDN_R', toId: 'SGP_G', avgTps: 162, volume: '$4.8M', latency: 14, successRate: 99.97, loss: 0.00, consensus: 'Verified' },
    { id: 'R2', fromId: 'NY_LC', toId: 'LDN_R', avgTps: 245, volume: '$12.4M', latency: 8, successRate: 100.0, loss: 0.00, consensus: 'Verified' },
    { id: 'R3', fromId: 'ZRH_T', toId: 'FRA_R', avgTps: 98, volume: '$16.2M', latency: 3, successRate: 99.99, loss: 0.00, consensus: 'Verified' },
    { id: 'R4', fromId: 'DXB_T', toId: 'TYO_C', avgTps: 110, volume: '$5.1M', latency: 28, successRate: 99.95, loss: 0.01, consensus: 'Verified' },
    { id: 'R5', fromId: 'SGP_G', toId: 'SYD_S', avgTps: 76, volume: '$3.5M', latency: 42, successRate: 99.98, loss: 0.00, consensus: 'Verified' },
    { id: 'R6', fromId: 'SAO_L', toId: 'NY_LC', avgTps: 120, volume: '$2.9M', latency: 86, successRate: 99.85, loss: 0.04, consensus: 'Warning_Sync' }
  ];

  // Mobile Agent information
  const mobileAgents = [
    { name: 'Settlement Agent', status: 'ACTIVE', task: 'Polling client deposit nodes...', confidence: '99.99%', queue: 0, load: '1.2%', logs: ['09:01:14 - Handled ingress ledger matching', '09:01:10 - Verification lock active', '09:00:54 - Parsed 24 transaction packets'] },
    { name: 'Treasury Agent', status: 'ONLINE', task: 'Balancing multi-pool weights...', confidence: '99.98%', queue: 1, load: '0.8%', logs: ['09:01:12 - Collateral pool verification matched', '09:01:00 - Rebalanced Swiss margin escrow'] },
    { name: 'Audit Agent', status: 'ONLINE', task: 'Validating seal block proofs...', confidence: '100.0%', queue: 0, load: '2.5%', logs: ['09:01:15 - Checked trial balance equivalence', '09:01:05 - Verified zeroes matrix invariants'] },
    { name: 'Witness Agent', status: 'IDLE', task: 'Signing epoch hash lists...', confidence: '99.99%', queue: 0, load: '0.1%', logs: ['09:00:45 - Generated epoch witness certificate', '09:00:00 - Quorum confirmed signature'] },
    { name: 'Oracle Agent', status: 'ACTIVE', task: 'Fetching USD/SVT parity state...', confidence: '99.97%', queue: 0, load: '1.1%', logs: ['09:01:13 - Updated secondary exchange limits', '09:00:58 - Loaded reserve feeds payload'] },
    { name: 'Routing Agent', status: 'ONLINE', task: 'Optimizing packet roundtrips...', confidence: '99.95%', queue: 0, load: '1.4%', logs: ['09:01:08 - Re-routed degraded São Paulo lanes', '09:01:01 - Core p99 latency evaluation'] }
  ];

  // Detect orientation change to automatically trigger landscape command view
  useEffect(() => {
    const handleOrientation = () => {
      const isLandscape = window.innerHeight < window.innerWidth && window.innerWidth < 1024;
      setIsTacticalMode(isLandscape);
    };

    window.addEventListener('resize', handleOrientation);
    handleOrientation();
    return () => window.removeEventListener('resize', handleOrientation);
  }, []);

  // Sync horizontal scrolling on swipeable telemetry graph container
  const handleScrollTelemetry = (tab: 'tps' | 'treasury' | 'settlement' | 'consensus' | 'load') => {
    setActiveTelemetryTab(tab);
    if (!graphScrollRef.current) return;
    const scrollWidth = graphScrollRef.current.scrollWidth;
    const clientWidth = graphScrollRef.current.clientWidth;
    const tabIndices = { tps: 0, treasury: 1, settlement: 2, consensus: 3, load: 4 };
    const scrollDest = (scrollWidth / 5) * tabIndices[tab];
    graphScrollRef.current.scrollTo({ left: scrollDest, behavior: 'smooth' });
  };

  const handleManualPost = (e: React.FormEvent) => {
    e.preventDefault();
    onPostTransaction({
      debitId,
      creditId,
      amountMinor: parseFloat(amountInput) * 100,
      denomination: debitId.includes('svt') || debitId.includes('collateral') ? 'SVT' : 'USD',
      rail: railInput,
      memo: memoInput,
      originApp: 'Sovereign mobile client'
    });
    setIsPostFormOpen(false);
    setIsFabOpen(false);
    // Alert feedback
    alert('TRANSACTION CANONICAL BROADCAST REPLICATED');
  };

  const executeVerifySeal = () => {
    setIsVerificationActive(true);
    setTimeout(() => {
      onForceSeal();
      setIsVerificationActive(false);
      setIsFabOpen(false);
      alert('ZERO-DRIFT CRYPTOGRAPHIC QUORUM SEAL COMPLETED. Heights and Merkle roots audited successfully.');
    }, 1800);
  };

  // Find detailed records
  const selectedNode = mobileGeonodes.find(n => n.id === selectedNodeId);
  const selectedRoute = mobileRoutes.find(r => r.id === selectedRouteId);

  // Filter Transactions for search querying
  const filteredTxns = transactions.filter(t => {
    if (!searchQuery) return true;
    return t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.rail.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div id="sovr-mobile-command-viewport" className="relative min-h-screen text-[#e0e0e0] font-sans antialiased overflow-x-hidden bg-[#040406]">
      {/* Scanlines layer for immersive military/ops CRT overlay context */}
      <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-[0.22]" />

      {/* Top Operating Console Status Bar */}
      <header className="sticky top-0 z-40 bg-[#07070a]/92 border-b border-[#1b1b24] px-4 py-3 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-orange-500 rounded rotate-45 animate-pulse" />
            <Cpu className="w-3.5 h-3.5 text-cyan-200 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black tracking-widest text-white uppercase font-display leading-none">
                SOVR MCT v1.0
              </span>
              <span className="text-[8px] border border-emerald-500/40 text-emerald-400 px-1 py-0 bg-emerald-500/5 rounded font-mono font-bold leading-none scale-90">
                STABLE
              </span>
            </div>
            <p className="text-[8px] text-white/40 uppercase font-mono tracking-wider leading-none mt-1">Sovereign Mobile Command Terminal</p>
          </div>
        </div>

        {/* Global actions and notification bell */}
        <div className="flex items-center gap-2">
          {/* Tactical mode override selector */}
          <button
            onClick={() => setIsTacticalMode(!isTacticalMode)}
            className={`px-2 py-1 rounded border text-[8px] font-mono uppercase tracking-widest font-bold flex items-center gap-1 transition-all ${
              isTacticalMode ? 'bg-[#ff5500]/10 text-[#ff7733] border-[#ff5500]/40' : 'bg-[#101015] border-[#222] text-[#e0e0e0]/40'
            }`}
          >
            <Radio className="w-2.5 h-2.5" />
            Tactical
          </button>

          {/* Connection quick toggle */}
          <button 
            onClick={() => setIsConnected(!isConnected)}
            className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all ${
              isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <Power className="w-3 h-3" />
          </button>

          {/* Alerts Bell drawer trigger */}
          <button
            onClick={() => setIsNotifCenterOpen(!isNotifCenterOpen)}
            className={`relative p-1.5 rounded-lg border flex items-center justify-center ${
              notifications.length > 0 ? 'bg-amber-500/5 border-amber-500/30 text-amber-400' : 'bg-[#101015] border-[#20202a] text-zinc-500'
            }`}
          >
            {notifications.length > 0 ? (
              <>
                <BellRing className="w-3.5 h-3.5 animate-pulse" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-500 glow-amber" />
              </>
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* Primary Scroll View Grid View */}
      <main className="px-4 py-4 pb-28 min-h-[calc(110vh)]">
        
        {/* TAB CONTROLS RENDERING */}
        <AnimatePresence mode="wait">
          
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* NETWORK HARDENED STATUS GRID (Landing Screen Grid) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#02c39a] font-bold uppercase">
                    OPERATIONAL PARAMETERS
                  </span>
                  <span className="text-[9px] text-[#e0e0e0]/30 font-mono">UTC TIME: {new Date().toTimeString().split(' ')[0]}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Card 1: Network status */}
                  <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3 relative overflow-hidden backdrop-blur shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest block font-bold">Network Status</span>
                      <Radio className="w-3 h-3 text-[rgb(2,195,154)] animate-pulse" />
                    </div>
                    <div className="mt-2">
                      <h2 className="text-sm font-black text-white font-mono tracking-tight leading-none">ONLINE</h2>
                      <span className="text-[8px] text-[rgb(2,195,154)] font-mono uppercase block mt-1">Consensus Verified</span>
                      <span className="text-[15px] font-semibold font-mono block mt-1 text-[#02c39a] font-bold">99.998%</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#02c39a]/30" />
                  </div>

                  {/* Card 2: Treasury Pool */}
                  <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3 relative overflow-hidden backdrop-blur shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest block font-bold">Treasury Pool</span>
                      <Coins className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="mt-2">
                      <h2 className="text-sm font-black text-amber-400 font-mono tracking-tight leading-none">
                        {(totalSVT / 1000000).toFixed(0)}M SVT
                      </h2>
                      <span className="text-[8px] text-white/40 font-mono uppercase block mt-1">Network Supply Pool</span>
                      <span className="text-[9px] text-zinc-400 font-mono block mt-1 truncate">841,200,500 Collateral</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-amber-500/30" />
                  </div>

                  {/* Card 3: Asset Liquidity */}
                  <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3 relative overflow-hidden backdrop-blur shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest block font-bold">Asset Liquidity</span>
                      <DollarSign className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="mt-2">
                      <h2 className="text-sm font-black text-white font-mono tracking-tight leading-none">
                        ${(totalAssetsUSD / 1000000).toFixed(1)}M
                      </h2>
                      <span className="text-[8px] text-white/40 font-mono uppercase block mt-1">Net Pool Val</span>
                      <span className="text-[9px] text-cyan-400 font-mono block mt-1 font-bold">ACTIVE_POOL</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-cyan-500/30" />
                  </div>

                  {/* Card 4: Active Nodes */}
                  <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3 relative overflow-hidden backdrop-blur shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest block font-bold">Active Nodes</span>
                      <Cpu className="w-3 h-3 text-teal-400" />
                    </div>
                    <div className="mt-2">
                      <h2 className="text-sm font-black text-white font-mono tracking-tight leading-none">10/10 Online</h2>
                      <span className="text-[8px] text-white/40 font-mono uppercase block mt-1">Authority Quorum</span>
                      <span className="text-[9px] text-teal-400 font-mono block mt-1 font-bold">100% HEALTH</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-teal-500/30" />
                  </div>

                  {/* Card 5: Live TPS */}
                  <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3 relative overflow-hidden backdrop-blur shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest block font-bold">Live Execution</span>
                      <Activity className="w-3 h-3 text-purple-400" />
                    </div>
                    <div className="mt-2">
                      <h2 className="text-sm font-black text-white font-mono tracking-tight leading-none">68 TPS</h2>
                      <span className="text-[8px] text-white/40 font-mono uppercase block mt-1">Settlement Velocity</span>
                      <span className="text-[9px] text-purple-400 font-mono block mt-1 font-bold">CYCLE_STABLE</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-purple-500/30" />
                  </div>

                  {/* Card 6: Current Drift */}
                  <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3 relative overflow-hidden backdrop-blur shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest block font-bold">Current Drift</span>
                      <Zap className="w-3 h-3 text-red-400" />
                    </div>
                    <div className="mt-2">
                      <h2 className="text-sm font-black text-white font-mono tracking-tight leading-none">60.0 TKS</h2>
                      <span className="text-[8px] text-white/40 font-mono uppercase block mt-1">Offset Deviation</span>
                      <span className="text-[9px] text-[#02c39a] font-mono block mt-1 font-bold">0.00% VARIANCE</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-red-500/30" />
                  </div>
                </div>
              </div>

              {/* DYNAMIC SWIPEABLE TELEMETRY CARDS (Horizontal Scroll graphs) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                    SWIPE TELEMETRY CARDS
                  </span>
                  <div className="flex gap-1">
                    {(['tps', 'treasury', 'settlement', 'consensus', 'load'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => handleScrollTelemetry(tab)}
                        className={`w-1.5 h-1.5 rounded-full ${activeTelemetryTab === tab ? 'bg-cyan-400' : 'bg-zinc-800'}`}
                        aria-label={`Show ${tab} card`}
                      />
                    ))}
                  </div>
                </div>

                <div 
                  ref={graphScrollRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2"
                >
                  {/* Card 1: TPS graph */}
                  <div className="w-[85%] shrink-0 snap-center bg-zinc-950/90 border border-[#20202a] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-[#222] pb-1.5">
                      <span className="text-[9px] text-[#02c39a] font-bold font-mono tracking-wider uppercase flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Card 1: Settlement TPS Rate
                      </span>
                      <span className="text-[8px] text-white/30 font-mono">LATENCY: {health.p99LatencyMs}ms</span>
                    </div>
                    <div className="relative h-20 bg-black/40 border border-white/5 rounded p-2 flex items-end justify-between overflow-hidden">
                      {/* Interactive mock micro graph columns */}
                      {volumeSeries.slice(-16).map((item, idx) => {
                        const maxVal = Math.max(...volumeSeries.slice(-16).map(v => v.settlementVelocity));
                        const scalingHeight = item.settlementVelocity ? (item.settlementVelocity / maxVal) * 100 : 50;
                        return (
                          <div key={idx} className="w-[4%] bg-gradient-to-t from-[#02c39a]/60 to-[#02c39a] rounded-t-xs hover:opacity-100 transition-opacity" style={{ height: `${scalingHeight}%` }} />
                        );
                      })}
                      <span className="absolute top-2 left-2 font-mono text-[10px] text-white/80 font-bold">
                        Average: {Math.round(volumeSeries.reduce((acc, curr) => acc + curr.settlementVelocity, 0) / volumeSeries.length)} TPS
                      </span>
                    </div>
                    <p className="text-[7.5px] text-zinc-500 uppercase font-mono tracking-tight leading-tight">CONTINUOUS INTRA-EPOCH BROADCAST TRANSFERS THROUGH SEGMENT GATEWAYS</p>
                  </div>

                  {/* Card 2: Treasury Flow graph */}
                  <div className="w-[85%] shrink-0 snap-center bg-zinc-950/90 border border-[#20202a] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-[#222] pb-1.5">
                      <span className="text-[9px] text-amber-500 font-bold font-mono tracking-wider uppercase flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        Card 2: Treasury Flow
                      </span>
                      <span className="text-[8px] text-white/30 font-mono">NET REBALANCE: 1.4s</span>
                    </div>
                    <div className="relative h-20 bg-black/40 border border-white/5 rounded p-2 flex items-end justify-between overflow-hidden">
                      {volumeSeries.slice(-16).map((item, idx) => {
                        const maxVal = Math.max(...volumeSeries.slice(-16).map(v => v.treasuryFlow));
                        const scalingHeight = item.treasuryFlow ? (item.treasuryFlow / maxVal) * 100 : 50;
                        return (
                          <div key={idx} className="w-[4%] bg-gradient-to-t from-amber-500/50 to-amber-500 rounded-t-xs" style={{ height: `${scalingHeight}%` }} />
                        );
                      })}
                      <span className="absolute top-2 left-2 font-mono text-[10px] text-white/80 font-bold">
                        Volatility Pool: SVT State
                      </span>
                    </div>
                    <p className="text-[7.5px] text-zinc-500 uppercase font-mono tracking-tight leading-tight">COLLATERAL ESCROW FLUCTUATION RATIOS MEASURED OVER THE QUORUM SYSTEM</p>
                  </div>

                  {/* Card 3: Settlement Volume */}
                  <div className="w-[85%] shrink-0 snap-center bg-zinc-950/90 border border-[#20202a] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-[#222] pb-1.5">
                      <span className="text-[9px] text-[#22d3ee] font-bold font-mono tracking-wider uppercase flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Card 3: Settlement USD Volume
                      </span>
                      <span className="text-[8px] text-white/30 font-mono">ACC INTEGRITY: 100%</span>
                    </div>
                    <div className="relative h-20 bg-black/40 border border-white/5 rounded p-2 flex items-end justify-between overflow-hidden">
                      {volumeSeries.slice(-16).map((item, idx) => {
                        const scalingHeight = item.settlementVelocity ? ((item.settlementVelocity * 100 + 4000) / 15000) * 100 : 50;
                        return (
                          <div key={idx} className="w-[4%] bg-gradient-to-t from-cyan-400/50 to-cyan-400 rounded-t-xs" style={{ height: `${scalingHeight}%` }} />
                        );
                      })}
                      <span className="absolute top-2 left-2 font-mono text-[10px] text-white/80 font-bold">
                        Posted Today: {transactions.length} Canonical Triggers
                      </span>
                    </div>
                    <p className="text-[7.5px] text-zinc-500 uppercase font-mono tracking-tight leading-tight">CUMULATIVE ALGEBRAICAL MINOR CORES COMMITTED ON LIQUIDITY GATEWAYS</p>
                  </div>

                  {/* Card 4: Consensus Health */}
                  <div className="w-[85%] shrink-0 snap-center bg-zinc-950/90 border border-[#20202a] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-[#222] pb-1.5">
                      <span className="text-[9px] text-purple-400 font-bold font-mono tracking-wider uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Card 4: Consensus Health Index
                      </span>
                      <span className="text-[8px] text-white/30 font-mono">SYNC: ACTIVE</span>
                    </div>
                    <div className="relative h-20 bg-black/40 border border-white/5 rounded p-2 flex items-end justify-between overflow-hidden">
                      {volumeSeries.slice(-16).map((item, idx) => {
                        const maxVal = Math.max(...volumeSeries.slice(-16).map(v => v.networkLoad));
                        const scalingHeight = item.networkLoad ? (item.networkLoad / maxVal) * 100 : 50;
                        return (
                          <div key={idx} className="w-[4%] bg-gradient-to-t from-purple-500/50 to-purple-500 rounded-t-xs" style={{ height: `${scalingHeight}%` }} />
                        );
                      })}
                      <span className="absolute top-2 left-2 font-mono text-[10px] text-white/80 font-bold">
                        Quorum Signers Matched: 100%
                      </span>
                    </div>
                    <p className="text-[7.5px] text-zinc-500 uppercase font-mono tracking-tight leading-tight">ACTIVE PROBABILITY AGREEMENT INDICES OVER ALL SIX REGISTERED VALIDATORS</p>
                  </div>

                  {/* Card 5: Node Load */}
                  <div className="w-[85%] shrink-0 snap-center bg-zinc-950/90 border border-[#20202a] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-[#222] pb-1.5">
                      <span className="text-[9px] text-red-400 font-bold font-mono tracking-wider uppercase flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        Card 5: Node Core Load Utilization
                      </span>
                      <span className="text-[8px] text-white/30 font-mono">P99 INGRESS</span>
                    </div>
                    <div className="relative h-20 bg-black/40 border border-white/5 rounded p-2 flex items-end justify-between overflow-hidden">
                      {volumeSeries.slice(-16).map((item, idx) => {
                        const scalingHeight = item.networkLoad ? ((item.networkLoad + 14) / 100) * 100 : 50;
                        return (
                          <div key={idx} className="w-[4%] bg-gradient-to-t from-rose-500/50 to-rose-500 rounded-t-xs" style={{ height: `${scalingHeight}%` }} />
                        );
                      })}
                      <span className="absolute top-2 left-2 font-mono text-[10px] text-white/80 font-bold">
                        Capacity Quorum limits: SECURE
                      </span>
                    </div>
                    <p className="text-[7.5px] text-zinc-500 uppercase font-mono tracking-tight leading-tight">AGGREGATE REPLICA HARDWARE STATISTICS SAMPLED BY COLD-HEARTBEAT TICKERS</p>
                  </div>
                </div>
              </div>

              {/* LIVE EVENTS SYSTEM TICKER */}
              <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3">
                <span className="text-[9px] font-mono tracking-widest text-[#02c39a] font-bold uppercase block border-b border-zinc-800 pb-1.5 mb-2 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-[#02c39a]" />
                  SOVR MOBILE LIVE TICKER FEED (INF SCROLL)
                </span>
                <div className="h-44 overflow-y-auto space-y-2 pr-1 font-mono text-[9px]">
                  {transactions.slice(0, 20).map((t, idx) => (
                    <div key={idx} className="p-2 bg-[#050507] border border-[#1b1b24] rounded flex items-start gap-1.5">
                      <span className="text-[#02c39a] font-bold">[{t.rail.toUpperCase()}]</span>
                      <div className="flex-grow">
                        <p className="text-zinc-300 font-sans tracking-tight">{t.memo} for ${(t.amountMinor / 100).toLocaleString()}</p>
                        <span className="text-[8px] text-zinc-600 block mt-0.5 font-mono">{t.createdAt} // CANON_HASH: {t.hash.slice(0, 16)}...</span>
                      </div>
                      <span className="text-[8px] bg-emerald-950/20 text-emerald-400 tracking-widest uppercase font-bold px-1 rounded border border-emerald-500/10">POSTED</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'network' && (
            <motion.div
              key="network"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 h-full relative"
            >
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-800 pb-1.5">
                <span className="tracking-widest text-[#02c39a] font-bold uppercase">
                  SOVR ACTIVE SPATIAL GLOBE
                </span>
                <span className="text-zinc-500">TAP SITES / PATHWAYS TO INSPECT</span>
              </div>

              {/* THREE.JS RENDER STAGE (Interactive touch globe) */}
              <div className="h-[320px] bg-black/80 border border-zinc-800 rounded-lg relative overflow-hidden">
                <SovereignGlobe
                  geoNodes={mobileGeonodes as any}
                  routes={mobileRoutes as any}
                  selectedNodeId={selectedNodeId}
                  selectedRouteId={selectedRouteId}
                  onSelectNode={(id) => {
                    setSelectedNodeId(id);
                    setSelectedRouteId(null);
                  }}
                  onSelectRoute={(id) => {
                    setSelectedRouteId(id);
                    setSelectedNodeId(null);
                  }}
                  heatmapOn={true}
                />
              </div>

              {/* Route Overlays checklist list */}
              <div className="bg-[#0b0b10] border border-[#1b1b24] p-3 rounded-lg">
                <span className="text-[9px] font-mono tracking-widest text-white/40 block mb-2 font-bold uppercase">
                  Validator Inbound Connection Channels
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {mobileRoutes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => {
                        setSelectedRouteId(route.id);
                        setSelectedNodeId(null);
                      }}
                      className={`text-left p-2 border rounded font-mono text-[9px] flex items-center justify-between ${
                        selectedRouteId === route.id
                          ? 'bg-[#02c39a]/10 border-[#02c39a]/50 text-white font-bold'
                          : 'bg-[#050507] border-zinc-900 text-zinc-400'
                      }`}
                    >
                      <span>Route [ {route.fromId} ➔ {route.toId} ]</span>
                      <span className="text-[8px] text-[#02c39a] font-bold">{route.avgTps} TPS</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ledger' && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-800 pb-1.5">
                <span className="tracking-widest text-amber-500 font-bold uppercase">
                  CANONICAL GENERAL LEDGER CORE
                </span>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-[9px] text-[#22d3ee] uppercase flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  Filter Search
                </button>
              </div>

              {isSearchOpen && (
                <div className="p-2 bg-[#0c0c12] border border-[#1b1b24] rounded-lg">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Query by ID, hash, memo, gateway..."
                    className="w-full bg-[#050507] border border-zinc-800 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              )}

              {/* CARD STACK OF TRANSACTIONS */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredTxns.length > 0 ? (
                  filteredTxns.map((t) => {
                    const isExpanded = expandedTxId === t.id;
                    return (
                      <div 
                        key={t.id}
                        onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                        className={`border rounded-lg p-3 transition-all backdrop-blur ${
                          isExpanded 
                            ? 'bg-[#0b0b15]/95 border-amber-500/40 shadow-lg' 
                            : 'bg-[#08080c]/85 border-[#1b1b24] hover:bg-[#0c0c12]/92 hover:border-zinc-800/80'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] bg-emerald-950/20 text-emerald-400 font-mono font-bold border border-emerald-500/10 px-1 rounded uppercase tracking-wider">
                                POSTED
                              </span>
                              <span className="text-[10px] text-zinc-300 font-bold capitalize font-sans">{t.rail} Gateway</span>
                            </div>
                            <h3 className="text-[11px] font-black text-white mt-1 leading-tight font-sans truncate max-w-[170px]">{t.memo}</h3>
                            <span className="text-[8.5px] text-zinc-500 font-mono block mt-1 truncate max-w-[170px]">HASH: {t.hash.slice(0, 24)}...</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[12px] font-bold font-mono text-white tracking-tight">
                              ${(t.amountMinor / 100).toLocaleString()}<span className="text-[8px] text-zinc-500">.00</span>
                            </span>
                            <span className="text-[8px] text-[#e0e0e0]/30 font-mono block mt-1">
                              {new Date(t.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        {/* Expandable rich transaction state representation */}
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-zinc-800/60 font-mono text-[9px] space-y-2.5"
                          >
                            <div className="bg-[#050507] border border-white/5 p-2 rounded-sm space-y-1">
                              <span className="text-[#02c39a] font-bold block uppercase text-[7.5px] tracking-wider mb-1">Trial Double-Entry Accounting Matrix</span>
                              <div className="flex justify-between items-center text-zinc-300">
                                <span className="truncate max-w-[140px]">DEBIT ACCOUNT ID: {t.entries[0]?.accountCode}</span>
                                <span className="text-[#02c39a] font-bold">+${(t.entries[0]?.debitMinor / 100).toLocaleString()}.00</span>
                              </div>
                              <div className="flex justify-between items-center text-zinc-300">
                                <span className="truncate max-w-[140px]">CREDIT ACCOUNT ID: {t.entries[1]?.accountCode}</span>
                                <span className="text-[#f43f5e] font-bold">-${(t.entries[1]?.creditMinor / 100).toLocaleString()}.00</span>
                              </div>
                            </div>

                            <div className="space-y-1 text-zinc-400 text-[8.5px]">
                              <div className="flex justify-between">
                                <span>Consensus Sealer Validation:</span>
                                <span className="text-[#02c39a] font-bold font-mono">QUORUM SIGNED PASS</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Authority Witnesses:</span>
                                <span className="text-white/80">Basalt-Validator #01, #04, #06</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Drift Offset Compliance:</span>
                                <span className="text-cyan-400 font-bold font-mono">0.000 TKS NOMINAL DETECTED</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cryptographic Proof:</span>
                                <span className="text-purple-400 font-bold break-all">{t.prevHash.slice(0, 32)}...</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[10px] text-zinc-500 font-mono">
                    No listed transaction matching search query [{searchQuery}]
                  </div>
                )}
              </div>

              {/* DYNAMIC DRILL-DOWN: CRYPTOGRAPHIC BLOCK DRILL-DOWN */}
              <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3 space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5">
                  <span className="text-[9px] text-[#02c39a] font-bold font-mono tracking-widest uppercase flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Cryptographic Block Drill-Down
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedChainBlockIndex(prev => Math.max(0, prev - 1))}
                      disabled={selectedChainBlockIndex === 0}
                      className="px-1.5 py-0.5 border border-zinc-800 disabled:opacity-30 rounded text-xs select-none"
                    >
                      ◀
                    </button>
                    <span className="text-[9px] font-bold text-white font-mono">Block {selectedChainBlockIndex + 1}/{chain.length}</span>
                    <button
                      onClick={() => setSelectedChainBlockIndex(prev => Math.min(chain.length - 1, prev + 1))}
                      disabled={selectedChainBlockIndex === chain.length - 1}
                      className="px-1.5 py-0.5 border border-zinc-800 disabled:opacity-30 rounded text-xs select-none"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {chain[selectedChainBlockIndex] && (
                  <div className="bg-[#050507] border border-white/5 p-2 rounded-sm space-y-2 text-[9px] font-mono">
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span className="font-bold text-white text-[10px]">BLOCK HEIGHT #{chain[selectedChainBlockIndex].height}</span>
                      <span className="text-[#02c39a] font-bold px-1 rounded border border-[#02c39a]/20 bg-[#02c39a]/5">SEALED STATE</span>
                    </div>
                    
                    <div className="space-y-1 block leading-relaxed font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Block Signature Hash:</span>
                        <span className="text-white/90 truncate max-w-[130px]" title={chain[selectedChainBlockIndex].hash}>{chain[selectedChainBlockIndex].hash}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Merkle Root Leaf:</span>
                        <span className="text-cyan-400 font-bold truncate max-w-[130px]">{chain[selectedChainBlockIndex].merkleRoot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Witnesses Matched:</span>
                        <span className="text-[#02c39a] font-bold">10 / 10 Consensus Nodes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Sealing Timestamp:</span>
                        <span className="text-zinc-400">{chain[selectedChainBlockIndex].sealedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Transferred minor:</span>
                        <span className="text-amber-400 font-semibold">{chain[selectedChainBlockIndex].txnCount} Operations Sealed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-800 pb-1.5">
                <span className="tracking-widest text-purple-400 font-bold uppercase">
                  SOVR MOBILE AGENT CENTER
                </span>
                <span className="text-zinc-500">INSPECT AUTONOMOUS POLICY BEHAVIOR</span>
              </div>

              {/* CARD STACK OF AGENTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mobileAgents.map((agent, idx) => {
                  const isAgentSelected = selectedAgentIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedAgentIndex(isAgentSelected ? null : idx)}
                      className={`border rounded-lg p-3 transition-all cursor-pointer backdrop-blur ${
                        isAgentSelected
                          ? 'bg-[#0f0a1d]/90 border-purple-500/50 shadow-lg glow-cyan'
                          : 'bg-[#08080c]/85 border-[#1b1b24] hover:bg-zinc-950/80'
                      }`}
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800/40">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ACTIVE' ? 'bg-[#02c39a] animate-pulse' : 'bg-amber-400'}`} />
                          <h4 className="text-[11px] font-black text-white font-sans">{agent.name}</h4>
                        </div>
                        <span className="text-[8px] tracking-wide font-mono px-1 rounded border border-purple-500/10 text-purple-400 bg-purple-500/5">
                          {agent.status}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 font-mono text-[9px] text-zinc-400">
                        <div className="flex justify-between">
                          <span>Autonomous Task:</span>
                          <span className="text-white/90 font-sans truncate max-w-[130px]">{agent.task}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Drift Accuracy:</span>
                          <span className="text-teal-400 font-bold">{agent.confidence} Confidence</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Queue Buffers:</span>
                          <span className="text-white/80 font-bold">{agent.queue} pending</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hardware Load:</span>
                          <span className="text-white/80">{agent.load}</span>
                        </div>
                      </div>

                      {isAgentSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-zinc-800/60 font-mono text-[8.5px] text-[#02c39a] space-y-1 bg-black/40 p-2 rounded"
                        >
                          <span className="text-white/40 block text-[7.5px] uppercase tracking-wider mb-1 font-bold">Execution Logs</span>
                          {agent.logs.map((log, lIdx) => (
                            <div key={lIdx} className="truncate select-none font-mono">➔ {log}</div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-800 pb-1.5">
                <span className="tracking-widest text-[#02c39a] font-bold uppercase">
                  OPERATIONAL CONTROL FLIGHT CORES
                </span>
                <span className="text-zinc-500">MCT v1.0 SYSTEM CONTROL</span>
              </div>

              {/* LIST OF LEDGER ACCOUNTS FOR MOBILE GENERAL INSPECTION */}
              <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3">
                <span className="text-[10px] font-mono tracking-widest text-[#02c39a] font-bold uppercase block border-b border-zinc-800 pb-1.5 mb-2">
                  Validator Liquidity Minor Balances
                </span>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="flex justify-between items-center p-2 bg-[#050507] rounded border border-zinc-900 font-mono text-[10px]">
                      <div>
                        <span className="text-zinc-500">[{acc.code}]</span>
                        <h4 className="text-white font-bold tracking-tight text-[10.5px] font-sans ml-1 inline">{acc.name}</h4>
                      </div>
                      <span className="text-white font-bold leading-none">
                        {acc.denomination === 'USD' ? '$' : ''}
                        {(acc.balanceMinor / 100).toLocaleString()}
                        <span className="text-[8px] text-zinc-500"> {acc.denomination}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected apps checking list */}
              <div className="bg-[#0b0b10] border border-[#1b1b24] rounded-lg p-3">
                <span className="text-[10px] font-mono tracking-widest text-[#22d3ee] font-bold uppercase block border-b border-zinc-800 pb-1.5 mb-2">
                  External Ingress API Integrations
                </span>
                <div className="space-y-2">
                  {apps.map((app) => (
                    <div key={app.id} className="p-2.5 bg-[#050507] border border-zinc-900 rounded flex justify-between items-center font-mono text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${app.health === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <h4 className="text-white font-bold font-sans">{app.displayName} ({app.slug})</h4>
                      </div>
                      <span className="text-[#02c39a] font-bold">{Math.round(app.txnPerMin)} pkts/m</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FLOAT ACTION BUTTON SYSTEM (Radial custom Quick action menu) */}
      <div className="fixed bottom-20 right-4 z-50">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-14 right-2 bg-zinc-950/95 border border-[#222] rounded-xl p-3 shadow-2xl space-y-2 backdrop-blur-md w-48 text-left font-mono"
            >
              <span className="text-[8.5px] text-zinc-500 uppercase font-black block border-b border-zinc-900 pb-1 mb-2">Tactical Operations</span>
              
              <button
                onClick={() => {
                  setIsPostFormOpen(true);
                  setIsFabOpen(false);
                }}
                className="w-full text-left p-1.5 hover:bg-zinc-900 text-[10px] text-[#e0e0e0] flex items-center gap-2 rounded transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#02c39a]" />
                Post Journal Entry
              </button>

              <button
                onClick={onExportLogs}
                className="w-full text-left p-1.5 hover:bg-zinc-900 text-[10px] text-[#e0e0e0] flex items-center gap-2 rounded transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                Export Ledger Logs
              </button>

              <button
                onClick={executeVerifySeal}
                disabled={isVerificationActive}
                className="w-full text-left p-1.5 hover:bg-zinc-900 text-[10px] text-[#e0e0e0] flex items-center gap-2 rounded transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                {isVerificationActive ? 'Drifting check...' : 'Verify Cryptographic Seal'}
              </button>

              <button
                onClick={() => {
                  setActiveTab('ledger');
                  setIsSearchOpen(true);
                  setIsFabOpen(false);
                }}
                className="w-full text-left p-1.5 hover:bg-zinc-900 text-[10px] text-[#e0e0e0] flex items-center gap-2 rounded transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-purple-400" />
                Search Transaction
              </button>

              <button
                onClick={() => {
                  setIsTacticalMode(true);
                  setIsFabOpen(false);
                }}
                className="w-full text-left p-1.5 hover:bg-zinc-900 text-[10px] text-orange-400 flex items-center gap-2 rounded transition-all cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-[#ff5500]" />
                Launch Command View
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Trigger button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`h-11 w-11 rounded-full glow-cyan flex items-center justify-center transition-all shadow-xl active:scale-95 text-white ${
            isFabOpen ? 'bg-rose-600 rotate-45' : 'bg-gradient-to-br from-cyan-400 to-orange-500'
          }`}
          aria-label="Toggle quick actions radial menu"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* NODE DETAILS DRAWER (Bottom sheet lookup Drawer layout) */}
      <AnimatePresence>
        {selectedNodeId && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#08080c]/98 border-t border-[#2a2a35] max-h-[85vh] rounded-t-xl p-4 font-mono text-[10px] overflow-y-auto backdrop-blur-xl shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
          >
            {/* Slipper bar representation */}
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-3" />

            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
              <div>
                <span className="text-[8px] text-[#02c39a] uppercase tracking-widest block font-black leading-none">Diagnostic Node</span>
                <h3 className="text-sm font-black text-white mt-1 leading-none font-sans">{selectedNode?.name || selectedNodeId}</h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded bg-[#101015] text-zinc-500 hover:text-white border border-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedNode && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-[#050507] p-2 rounded-lg border border-white/5 leading-relaxed">
                  <div>
                    <span className="text-[#e2e8f0]/30 block text-[7.5px] uppercase">Role Coordinator</span>
                    <span className="text-white font-sans text-[10px] font-semibold">{selectedNode.role}</span>
                  </div>
                  <div>
                    <span className="text-[#e2e8f0]/30 block text-[7.5px] uppercase">Quorum Region</span>
                    <span className="text-white">{selectedNode.region}</span>
                  </div>
                  <div>
                    <span className="text-[#e2e8f0]/30 block text-[7.5px] uppercase">Drift round Latency</span>
                    <span className="text-[#02c39a] font-bold">{selectedNode.latency} ms nominal</span>
                  </div>
                  <div>
                    <span className="text-[#e2e8f0]/30 block text-[7.5px] uppercase">Consensus Trust Score</span>
                    <span className="text-[#02c39a] font-bold">{selectedNode.trustScore}</span>
                  </div>
                  <div>
                    <span className="text-[#e2e8f0]/30 block text-[7.5px] uppercase">Sealed Height</span>
                    <span className="text-cyan-400 font-bold">{selectedNode.lastSeal}</span>
                  </div>
                  <div>
                    <span className="text-[#e2e8f0]/30 block text-[7.5px] uppercase">Continuous Core Load</span>
                    <span className="text-zinc-400">{selectedNode.currentLoad} utilization</span>
                  </div>
                </div>

                <div className="space-y-1 text-zinc-400 block pb-4 border-b border-zinc-900">
                  <div className="flex justify-between">
                    <span>Validation Client Version:</span>
                    <span className="text-white">v5.9.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allocated CPU Thread capacity:</span>
                    <span className="text-white">{selectedNode.cpu}% of limits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RAM physical offset memory:</span>
                    <span className="text-white">{selectedNode.ram}% capacity</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total minor counts ledgered:</span>
                    <span className="text-amber-400 font-bold">{selectedNode.txnsProcessed.toLocaleString()} items</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button onClick={() => alert('Dispatching validator shell live trace')} className="w-full py-2 bg-[#02c39a]/10 border border-[#02c39a]/35 rounded text-[#02c39a] font-bold leading-none select-none hover:bg-[#02c39a]/20">
                    View Logs
                  </button>
                  <button onClick={() => alert('Calculating active Great-Circle latency routing deviations')} className="w-full py-2 bg-purple-500/10 border border-purple-500/35 rounded text-purple-400 font-bold leading-none select-none hover:bg-purple-500/20">
                    Route Analysis
                  </button>
                  <button onClick={() => alert('Dispatched algorithmic self-healing hardware diagnostic parameters')} className="w-full py-2 bg-amber-500/15 border border-amber-500/35 rounded text-amber-500 font-bold leading-none select-none hover:bg-amber-500/25">
                    Node Diagnostics
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE ROUTE INSPECTOR (Slide-up panel for selected GREAT-CIRCLE line) */}
      <AnimatePresence>
        {selectedRouteId && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#08080c]/98 border-t border-[#2a2a35] rounded-t-xl p-4 font-mono text-[10px] backdrop-blur-xl shadow-2xl"
          >
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-3" />
            
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
              <div>
                <span className="text-[8px] text-amber-500 uppercase tracking-widest block font-black leading-none">Bezier Spline Interconnect</span>
                <h3 className="text-sm font-black text-white mt-1 font-sans">Route ID: {selectedRouteId} ({selectedRoute?.fromId} ➔ {selectedRoute?.toId})</h3>
              </div>
              <button
                onClick={() => setSelectedRouteId(null)}
                className="p-1 rounded bg-[#101015] text-zinc-500 hover:text-white border border-[#1d1d24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedRoute && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3 bg-[#05055] p-2.5 rounded border border-white/5">
                  <div>
                    <span className="text-zinc-500 block text-[7.5px] uppercase">Execution rate</span>
                    <span className="text-[#02c39a] font-bold text-[11px]">{selectedRoute.avgTps} TPS average</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[7.5px] uppercase">Epoch liquid volume</span>
                    <span className="text-white font-bold">{selectedRoute.volume} transferred</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[7.5px] uppercase">Spline route latency</span>
                    <span className="text-cyan-400 font-bold">{selectedRoute.latency} ms roundtrip</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[7.5px] uppercase">Consensus Integrity</span>
                    <span className="text-teal-400 font-bold">{selectedRoute.consensus}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-zinc-500 border-t border-zinc-900 pt-2 block font-bold uppercase tracking-wider">
                  <span>Packet Loss: {selectedRoute.loss}%</span>
                  <span>Compliance score: {selectedRoute.successRate}%</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION FLIGHT ACCENT DRAWER */}
      <AnimatePresence>
        {isNotifCenterOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 z-50 bg-[#09090e]/98 border-l border-[#1b1b24] w-80 max-w-[90vw] p-4 text-[9.5px] font-mono backdrop-blur-xl shadow-2xl overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-4">
              <span className="font-black text-white uppercase tracking-wider text-[10px]">Gateway Alarm Dispatch</span>
              <button
                onClick={() => setIsNotifCenterOpen(false)}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-2.5 bg-[#050507] border border-zinc-800/80 rounded space-y-1 leading-normal font-sans">
                    <div className="flex justify-between font-mono text-[8px] font-bold">
                      <span className="text-amber-500 uppercase">[{notif.type}]</span>
                      <span className="text-zinc-500">{notif.time}</span>
                    </div>
                    <p className="text-zinc-300 tracking-tight leading-relaxed">{notif.message}</p>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-zinc-500 max-w-[150px] mx-auto leading-relaxed">
                  Quorum matching invariants perfectly. No alarms dispatched.
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="w-full mt-4 py-2 bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-rose-400 rounded hover:bg-[#f43f5e]/25 transition-all text-[9px] font-bold"
              >
                Flush System Alerts
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MANUAL TRANSACTION POSTING DRAWER SHEET */}
      <AnimatePresence>
        {isPostFormOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#08080c]/98 border-t border-[#1b1b24] p-4 font-mono text-[10px] overflow-y-auto backdrop-blur-xl max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-4">
              <span className="font-black text-white text-[10px] uppercase tracking-widest">Transmit Journal Entry Payload</span>
              <button onClick={() => setIsPostFormOpen(false)} className="p-1 text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualPost} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 uppercase text-[7.5px] tracking-wider mb-1 font-bold">Debit Target Account</label>
                  <select
                    value={debitId}
                    onChange={(e) => setDebitId(e.target.value)}
                    className="w-full bg-[#050507] border border-zinc-800/85 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50 text-[10px] text-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>[{acc.code}] {acc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 uppercase text-[7.5px] tracking-wider mb-1 font-bold">Credit Origin Account</label>
                  <select
                    value={creditId}
                    onChange={(e) => setCreditId(e.target.value)}
                    className="w-full bg-[#050507] border border-zinc-800/85 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50 text-[10px] text-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>[{acc.code}] {acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 uppercase text-[7.5px] tracking-wider mb-1 font-bold">Amount minor token units</label>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full bg-[#050507] border border-zinc-800/85 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50 text-white text-[10px]"
                    placeholder="E.g. 500 minor ($5.00)"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 uppercase text-[7.5px] tracking-wider mb-1 font-bold">Consensus Route Gateway</label>
                  <select
                    value={railInput}
                    onChange={(e: any) => setRailInput(e.target.value)}
                    className="w-full bg-[#050507] border border-zinc-800/85 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500/50 text-[10px]"
                  >
                    <option value="svt">SOVR Onchain (SVT)</option>
                    <option value="stripe">Stripe Gateway (USD)</option>
                    <option value="fednow">FedNow Rail (USD)</option>
                    <option value="ach">ACH Batch Terminal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 uppercase text-[7.5px] tracking-wider mb-1 font-bold">Proof Memo Note</label>
                <input
                  type="text"
                  value={memoInput}
                  onChange={(e) => setMemoInput(e.target.value)}
                  className="w-full bg-[#050507] border border-zinc-800/85 rounded px-2.5 py-1.5 text-white font-sans focus:outline-none focus:border-cyan-500/50 text-[10px]"
                  placeholder="Memo string for ledger record matching..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-orange-500 rounded text-slate-950 text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all text-center"
              >
                Seal & Transmit Broadcast Code
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TACTICAL COMMAND OVERLAY (Landscape Tactical Command view - "Mission control in your pocket") */}
      <AnimatePresence>
        {isTacticalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#030305]/98 text-rose-500 font-mono text-[9px] p-4 flex flex-col justify-between overflow-hidden select-none"
          >
            {/* Holographic glowing grids and threat markers */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-10">
              <div className="absolute inset-0 grid-overlay" />
            </div>

            {/* Tactical mode header */}
            <div className="flex justify-between items-center border-b border-rose-500/40 pb-2 z-10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-white text-[11px] font-black tracking-widest font-display">TACTICAL SECTOR COMMAND DISPLAY v1.0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/30 text-[8px] font-bold tracking-widest blink animate-pulse">THREAT MONITOR ACTIVE</span>
                <button
                  onClick={() => setIsTacticalMode(false)}
                  className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
                >
                  EXIT_TCT
                </button>
              </div>
            </div>

            {/* Tactical center screen layouts */}
            <div className="grid grid-cols-12 gap-4 flex-grow my-3 h-full items-stretch">
              
              {/* Left Column telemetry monitors */}
              <div className="col-span-3 bg-red-950/5 border border-rose-950 rounded p-2 flex flex-col justify-between">
                <div>
                  <span className="text-rose-500 uppercase font-bold text-[8.5px] tracking-widest block border-b border-rose-950 pb-1 mb-1">Drift Deviation Monitor</span>
                  <div className="space-y-1 mt-1 leading-normal">
                    <div className="flex justify-between text-zinc-400 text-[8px]">
                      <span>Average network drift:</span>
                      <span className="font-bold text-white">60.0 drift marks</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[8px]">
                      <span>Cycle re-offset time:</span>
                      <span className="font-bold text-[#02c39a]">1.4s loop cycle</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[8px]">
                      <span>Consensus Quorum:</span>
                      <span className="font-bold text-teal-400">100% stable</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#10090c]/40 border border-rose-950 p-2 rounded-sm text-[8px] space-y-0.5">
                  <div className="text-zinc-500 uppercase font-black tracking-widest">Active warnings</div>
                  <div className="text-yellow-500 truncate">● São Paulo - Ping offset peak limit</div>
                  <div className="text-zinc-500">● Escrow balances matched and aligned</div>
                </div>
              </div>

              {/* Middle full screen interactive globe overlay */}
              <div className="col-span-6 bg-[#040407] border border-[#ff5500]/20 rounded relative overflow-hidden">
                <SovereignGlobe
                  geoNodes={mobileGeonodes as any}
                  routes={mobileRoutes as any}
                  selectedNodeId={null}
                  selectedRouteId={null}
                  onSelectNode={() => {}}
                  onSelectRoute={() => {}}
                  heatmapOn={true}
                />
              </div>

              {/* Right column: Live Threat and packet streaming tracker */}
              <div className="col-span-3 bg-[#080304] border border-rose-950 rounded p-2 flex flex-col justify-between">
                <div>
                  <span className="text-rose-500 uppercase font-bold text-[8.5px] tracking-widest block border-b border-rose-950 pb-1 mb-1.5">Live Packet Audits</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {transactions.slice(0, 10).map((t, idx) => (
                      <div key={idx} className="text-[7.5px] text-zinc-400 truncate font-mono">
                        ➔ <span className="text-rose-400">STATE_MUTATION [${(t.amountMinor / 100).toLocaleString()}.00]</span> verified via {t.rail.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-rose-950 text-right opacity-60">
                  <span className="text-[7px]">OPERATIONAL SECURITY CODE // HIGH-TRUST CONTEXT SECTOR</span>
                </div>
              </div>

            </div>

            {/* Bottom tactical stats panel */}
            <div className="flex justify-between items-center text-[8.5px] text-rose-500 border-t border-rose-500/40 pt-2 block font-black uppercase tracking-widest">
              <span>Sealed Node Height limit: #{chain[0]?.height || '7424'}</span>
              <span>Algebraic balance matrix invariance: Debits - Credits === 0.00000000</span>
              <span>Sovereign Security protocol: active & locked</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation Tab bar (Glassmorphic look) */}
      <nav className="fixed bottom-4 inset-x-4 h-14 bg-[#0c0c14]/85 border border-[#1b1b24] shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl flex items-center justify-around px-2 z-40 backdrop-blur-lg">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setSelectedNodeId(null);
            setSelectedRouteId(null);
          }}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'dashboard' ? 'text-[#02c39a] scale-105' : 'text-[#e0e0e0]/40'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[8.5px] mt-1 font-mono">Dashboard</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('network');
            setSelectedNodeId(null);
            setSelectedRouteId(null);
          }}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'network' ? 'text-[#02c39a] scale-105' : 'text-[#e0e0e0]/40'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span className="text-[8.5px] mt-1 font-mono">Network</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ledger');
            setSelectedNodeId(null);
            setSelectedRouteId(null);
          }}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'ledger' ? 'text-[#02c39a] scale-105' : 'text-[#e0e0e0]/40'
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="text-[8.5px] mt-1 font-mono">Ledger</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('agents');
            setSelectedNodeId(null);
            setSelectedRouteId(null);
          }}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'agents' ? 'text-[#02c39a] scale-105' : 'text-[#e0e0e0]/40'
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span className="text-[8.5px] mt-1 font-mono">Agents</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('more');
            setSelectedNodeId(null);
            setSelectedRouteId(null);
          }}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'more' ? 'text-[#02c39a] scale-105' : 'text-[#e0e0e0]/40'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[8.5px] mt-1 font-mono">More</span>
        </button>
      </nav>
    </div>
  );
}
