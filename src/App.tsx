import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LedgerAccount, ConnectedApp, HashBlock, Transaction, SystemHealth, Denomination, Rail } from './types';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_APPS, 
  formatCurrency, 
  generateRandomTxn, 
  generateUUIDShort, 
  generateMerkleRoot 
} from './data/seed';
import { sha256 } from './utils/sha256';

// Recharts components for Layered Multi-stream visualizer 2.0
import { ResponsiveContainer, ComposedChart, Area, Line, Scatter, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Custom components
import AccountsList from './components/AccountsList';
import TreasuryCommandCenter from './components/TreasuryCommandCenter';
import BlocksChain from './components/BlocksChain';
import TransactionsHistory from './components/TransactionsHistory';
import EvidencePortal from './components/EvidencePortal';
import TrustVault from './components/TrustVault';
import ManualTransactionForm from './components/ManualTransactionForm';
import ConnectedAppsList from './components/ConnectedAppsList';
import RegisterIntegrationForm from './components/RegisterIntegrationForm';
import CommandCenterView from './components/CommandCenterView';
import SovereignLanding from './components/SovereignLanding';
import MobileTerminalView from './components/MobileTerminalView';
import backgroundMap from './assets/images/sovr_background_map_1781167617436.png';

// Sub-modules for tabs
import TransactionWorkspace from './components/TransactionWorkspace';
import NodeRegistry from './components/NodeRegistry';
import ConnectedSystems from './components/ConnectedSystems';
import AuditVault from './components/AuditVault';
import OrchestrationEngine from './components/OrchestrationEngine';
import AdministrationView from './components/AdministrationView';
import SovereignGlobe from './components/SovereignGlobe';
import ComplianceHub from './components/ComplianceHub';
import GatewayFabric from './components/GatewayFabric';
import MissionControlView from './components/MissionControlView';

// Lucide Icons
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
  FileText,
  Settings
} from 'lucide-react';

export default function App() {
  // Connection state
  const [gatewayURL] = useState("https://gateway.sovr.local/v1");
  const [wsURL] = useState("wss://gateway.sovr.local/v1/stream");
  const [isConnected, setIsConnected] = useState(true);

  // Screen size tracking for responsive breakpoint strategy
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // States
  const [accounts, setAccounts] = useState<LedgerAccount[]>(() => [...INITIAL_ACCOUNTS]);
  const [apps, setApps] = useState<ConnectedApp[]>(() => [...INITIAL_APPS]);
  const [chain, setChain] = useState<HashBlock[]>(() => {
    const list: HashBlock[] = [];
    let prev = "0".repeat(64);
    for (let h = 0; h < 24; h++) {
      const merkle = sha256(`merkle-${h}-${generateUUIDShort()}`);
      const blockHash = sha256(`${h}-${prev}-${merkle}`);
      list.push({
        id: `blk_${h}`,
        height: h,
        hash: blockHash,
        prevHash: prev,
        txnCount: Math.floor(Math.random() * (42 - 8 + 1)) + 8,
        merkleRoot: merkle,
        sealedAt: new Date(Date.now() - (24 - h) * 300 * 1000).toISOString(),
        verified: true
      });
      prev = blockHash;
    }
    return list.reverse(); // newest block first
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Generate initial transaction pool
    const list: Transaction[] = [];
    let prev = "0".repeat(64);
    for (let t = 0; t < 14; t++) {
      const tx = generateRandomTxn(prev, INITIAL_ACCOUNTS);
      tx.createdAt = new Date(Date.now() - (14 - t) * 120 * 1000).toISOString();
      list.push(tx);
      prev = tx.hash;
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const [volumeSeries, setVolumeSeries] = useState<any[]>(() => 
    Array.from({ length: 65 }).map((_, idx) => ({
      tick: idx,
      settlementVelocity: Math.floor(Math.random() * (78 - 25 + 1)) + 25,
      treasuryFlow: Math.floor(Math.random() * (460000 - 130000 + 1)) + 130000,
      networkLoad: Math.floor(Math.random() * (85 - 35 + 1)) + 35,
      apiThroughput: Math.floor(Math.random() * (1350 - 450 + 1)) + 450
    }))
  );

  const [selectedZoom, setSelectedZoom] = useState<'1m' | '5m' | '15m' | 'all'>('1m');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCommandViewActive, setIsCommandViewActive] = useState(false);
  const [isProofExpanded, setIsProofExpanded] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // Layout hierarchy & tabs states
  const [activeMainTab, setActiveMainTab] = useState<string>('Overview');
  const [selectedTxIdForDrilldown, setSelectedTxIdForDrilldown] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [selectedGlobeNodeId, setSelectedGlobeNodeId] = useState<string | null>(null);
  const [selectedGlobeRouteId, setSelectedGlobeRouteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.success) {
          setLiveEvents(data.events || []);
        }
      } catch (err) {
        // Silently ignore polling errors to prevent console spam during dev server restarts
        // or transient network issues.
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  // Standalone Verification route detection
  const [verifyRouteTxnId, setVerifyRouteTxnId] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/verify\/([^/]+)/);
    return match ? match[1] : null;
  });

  const handleExitStandaloneVerify = () => {
    setVerifyRouteTxnId(null);
    window.history.pushState({}, '', '/');
  };

  // Simulated notification center logs
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, type: 'API', message: 'Inbound TLS port connection handshaking initialized with SOVRPay Swedish ingress', time: '1 min ago', status: 'info' },
    { id: 2, type: 'TREASURY', message: 'Large collateral fund transfer of +120,000 SVT completed and matched algebraically', time: '4 mins ago', status: 'warning' },
    { id: 3, type: 'SYSTEM', message: 'Consensus quorum signed authority seal for ledger height #1428 matches Merkle root', time: '12 mins ago', status: 'success' },
    { id: 4, type: 'SECURITY', message: 'Scheduled algorithmic invariant check passed across all 6 validator instances', time: '35 mins ago', status: 'success' },
  ]);

  const [health, setHealth] = useState<SystemHealth>(() => ({
    ledgerOk: true,
    chainVerified: true,
    pendingTxns: 2,
    p99LatencyMs: 18,
    nodesOnline: 6,
    nodesTotal: 6,
    lastSeal: new Date().toISOString()
  }));

  const [isSealingNow, setIsSealingNow] = useState(false);

  // Reference for tick timer
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // CALCULATE DERIVED VALUES (from Swift Core matching equations)
  const totalAssetsUSD = accounts
    .filter(acc => acc.kind === 'asset' && acc.denomination === 'USD')
    .reduce((sum, current) => sum + current.balanceMinor, 0);

  const totalSVT = accounts
    .filter(acc => acc.denomination === 'SVT')
    .reduce((sum, current) => sum + current.balanceMinor, 0);

  const postedToday = transactions
    .filter(txn => txn.state === 'posted' && new Date(txn.createdAt).toDateString() === new Date().toDateString())
    .length;

  const pendingCount = transactions.filter(txn => txn.state === 'pending').length;

  // Manual block seal trigger
  const sealBlock = () => {
    setChain(prevChain => {
      const latestBlock = prevChain[0];
      const h = (latestBlock?.height ?? 0) + 1;
      const prev = latestBlock?.hash ?? "0".repeat(64);
      const merkle = sha256(`merkle-${h}-${generateUUIDShort()}`);
      const blockHash = sha256(`${h}-${prev}-${merkle}`);

      const nextBlock: HashBlock = {
        id: `blk_${h}`,
        height: h,
        hash: blockHash,
        prevHash: prev,
        txnCount: Math.floor(Math.random() * (42 - 8 + 1)) + 8,
        merkleRoot: merkle,
        sealedAt: new Date().toISOString(),
        verified: true
      };

      const newChain = [nextBlock, ...prevChain];
      if (newChain.length > 48) {
        newChain.pop();
      }
      return newChain;
    });

    setHealth(prev => ({
      ...prev,
      lastSeal: new Date().toISOString()
    }));
  };

  // POST MANUAL TRANSACTION (Debit / Credit updates)
  const handlePostTransaction = (params: {
    debitId: string;
    creditId: string;
    amountMinor: number;
    denomination: Denomination;
    rail: Rail;
    memo: string;
    originApp: string;
  }) => {
    const id = `txn_${generateUUIDShort()}`;
    const latestTx = transactions[0];
    const prevHash = latestTx?.hash ?? "0".repeat(64);
    
    const canonicalStr = `${id}|${params.rail}|${params.amountMinor}|${params.denomination}|${prevHash}`;
    const txnHash = sha256(canonicalStr);

    const debitAccount = accounts.find(a => a.id === params.debitId);
    const creditAccount = accounts.find(a => a.id === params.creditId);

    if (!debitAccount || !creditAccount) return;

    const entries = [
      {
        id: generateUUIDShort(),
        accountId: params.debitId,
        accountCode: debitAccount.code,
        debitMinor: params.amountMinor,
        creditMinor: 0
      },
      {
        id: generateUUIDShort(),
        accountId: params.creditId,
        accountCode: creditAccount.code,
        debitMinor: 0,
        creditMinor: params.amountMinor
      }
    ];

    const newTxn: Transaction = {
      id,
      hash: txnHash,
      prevHash,
      state: 'posted',
      rail: params.rail,
      denomination: params.denomination,
      amountMinor: params.amountMinor,
      memo: params.memo,
      originApp: params.originApp,
      createdAt: new Date().toISOString(),
      entries
    };

    // Update LEDGER balances IMMEDIATELY (since it is POSTED)
    setAccounts(prevAccounts => 
      prevAccounts.map(account => {
        let balanceMinor = account.balanceMinor;
        if (account.id === params.debitId) {
          balanceMinor += params.amountMinor; // Debit entry algebraic sum
        }
        if (account.id === params.creditId) {
          balanceMinor -= params.amountMinor; // Credit entry algebraic sum
        }
        return { ...account, balanceMinor };
      })
    );

    setTransactions(prev => [newTxn, ...prev].slice(0, 80));
    setVolumeSeries(prev => {
      const lastTick = prev.length ? prev[prev.length - 1].tick : 0;
      const nextPoint = {
        tick: lastTick + 1,
        settlementVelocity: Math.floor(Math.random() * (78 - 25 + 1)) + 25,
        treasuryFlow: Math.floor(Math.random() * (460000 - 130000 + 1)) + 130000,
        networkLoad: Math.floor(Math.random() * (85 - 35 + 1)) + 35,
        apiThroughput: Math.floor(Math.random() * (1350 - 450 + 1)) + 450
      };
      const newSeries = [...prev, nextPoint];
      return newSeries.length > 100 ? newSeries.slice(1) : newSeries;
    });

    // Send asynchronous transactional trigger to backend Evidence Engine
    fetch('/api/evidence/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: id,
        debitAccount: debitAccount.code,
        creditAccount: creditAccount.code,
        amount: params.amountMinor,
        currency: params.denomination,
        eventType: params.rail === 'svt' ? 'MULTIRAIL_TRANSFER' : 'CROSSBORDER_CLEARING',
        operator: 'SYSTEM_COMMANDER_OP',
        metadata: {
          memo: params.memo,
          originApp: params.originApp
        }
      })
    })
    .then(res => res.json())
    .then(resData => {
      console.log('Immutable Evidence registered for transaction:', id, resData);
    })
    .catch(err => {
      console.error('Failed to register immutable evidence:', err);
    });
  };

  const handleExportLogs = () => {
    try {
      const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sovr-ledger-logs-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export logs:", err);
    }
  };


  // LIVE SIMULATOR WEBSOCKET GRAPH TICK (Every 1400ms)
  useEffect(() => {
    if (!isConnected) {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
      return;
    }

    tickTimerRef.current = setInterval(() => {
      // 1. Generate live transaction payload and update ledger in sync
      setAccounts(prevAccounts => {
        let updatedAccounts = [...prevAccounts];

        setTransactions(prevTxns => {
          const prevHash = prevTxns[0]?.hash ?? "0".repeat(64);
          const nextTx = generateRandomTxn(prevHash, prevAccounts);

          // Update general ledger balances if transaction is Posted on boot
          const freshAccounts = prevAccounts.map(acc => {
            let balanceMinor = acc.balanceMinor;
            if (nextTx.state === 'posted') {
              const debitEntry = nextTx.entries.find(e => e.accountId === acc.id);
              const creditEntry = nextTx.entries.find(e => e.accountId === acc.id);
              if (debitEntry) {
                balanceMinor += debitEntry.debitMinor;
              }
              if (creditEntry) {
                balanceMinor -= creditEntry.creditMinor;
              }
            }
            return { ...acc, balanceMinor };
          });

          // Occasionally promote an older pending transaction to posted
          let finalTxnsList = [nextTx, ...prevTxns];
          if (Math.random() < 0.25) {
            const pendingIndex = finalTxnsList.findIndex(t => t.state === 'pending');
            if (pendingIndex !== -1) {
              const oldPending = finalTxnsList[pendingIndex];
              const promotedTx: Transaction = {
                ...oldPending,
                state: 'posted'
              };
              finalTxnsList[pendingIndex] = promotedTx;

              // Apply promoted transaction's debit/credits to finalized ledger state
              for (let i = 0; i < freshAccounts.length; i++) {
                const acc = freshAccounts[i];
                const dEntry = promotedTx.entries.find(e => e.accountId === acc.id);
                const cEntry = promotedTx.entries.find(e => e.accountId === acc.id);
                if (dEntry) {
                  freshAccounts[i].balanceMinor += dEntry.debitMinor;
                }
                if (cEntry) {
                  freshAccounts[i].balanceMinor -= cEntry.creditMinor;
                }
              }
            }
          }

          // Bound list sizes
          if (finalTxnsList.length > 80) {
            finalTxnsList = finalTxnsList.slice(0, 80);
          }

          updatedAccounts = freshAccounts;
          return finalTxnsList;
        });

        return updatedAccounts;
      });

      // 2. Volume sliding sparkline update
      setVolumeSeries(prevSeries => {
        const lastTick = prevSeries.length ? prevSeries[prevSeries.length - 1].tick : 0;
        const nextPoint = {
          tick: lastTick + 1,
          settlementVelocity: Math.floor(Math.random() * (78 - 25 + 1)) + 25,
          treasuryFlow: Math.floor(Math.random() * (460000 - 130000 + 1)) + 130000,
          networkLoad: Math.floor(Math.random() * (85 - 35 + 1)) + 35,
          apiThroughput: Math.floor(Math.random() * (1350 - 450 + 1)) + 450
        };
        const newSeries = [...prevSeries, nextPoint];
        return newSeries.length > 150 ? newSeries.slice(1) : newSeries;
      });

      // 3. Jitter connected apps session feeds
      setApps(prevApps => 
        prevApps.map(app => {
          const sessionsJitter = Math.floor(Math.random() * (4 - (-3) + 1)) + (-3);
          const txnJitter = (Math.random() * (1.4 - (-1.2))) + (-1.2);
          return {
            ...app,
            activeSessions: Math.max(0, app.activeSessions + sessionsJitter),
            txnPerMin: Math.max(0, app.txnPerMin + txnJitter),
            lastHeartbeat: new Date().toISOString()
          };
        })
      );

      // 4. Sealer automatic trigger (1 in 9 times chance)
      if (Math.random() < 0.12) {
        sealBlock();
      }

      // 5. System Health jitter
      setHealth(prev => {
        const latencyJitter = Math.floor(Math.random() * (3 - (-3) + 1)) + (-3);
        return {
          ...prev,
          pendingTxns: pendingCount,
          p99LatencyMs: Math.max(8, Math.min(140, prev.p99LatencyMs + latencyJitter))
        };
      });

      // 6. Dynamic high-fidelity notification center updates
      if (Math.random() < 0.14) {
        const categories = ['API', 'TREASURY', 'SYSTEM', 'SECURITY', 'AUDIT'];
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        let msg = '';
        let status = 'info';

        if (randomCat === 'API') {
          const apiActions = [
            'Client credential handshake resolved with Basalt Console Node #1',
            'SOVR UnifiedPay Hub webhook ingestion queue lag detected: 42ms',
            'SOVR API channel heartbeats successfully acknowledged from all 6 authorities'
          ];
          msg = apiActions[Math.floor(Math.random() * apiActions.length)];
          status = msg.includes('lag') ? 'warning' : 'success';
        } else if (randomCat === 'TREASURY') {
          msg = `Collateralized asset settlement of +${(Math.floor(Math.random() * 85000) + 15000).toLocaleString()} SVT complete; algebraic offset verified`;
          status = 'info';
        } else if (randomCat === 'SYSTEM') {
          msg = `Cryptographic sealer validator block #${Math.floor(Math.random() * 20000 + 12000)} auto-probability consensus attained`;
          status = 'success';
        } else {
          msg = 'Periodic multi-rail double-entry trial balance checked: DEBITS === CREDITS';
          status = 'success';
        }

        setNotifications(prev => [
          { id: Date.now() + Math.random(), type: randomCat, message: msg, time: 'Just now', status },
          ...prev.slice(0, 15)
        ]);
      }

    }, 1400);

    return () => {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, [isConnected, pendingCount]);

  const handleForceSeal = () => {
    setIsSealingNow(true);
    setTimeout(() => {
      sealBlock();
      setIsSealingNow(false);
    }, 600);
  };

  // Convert pure volume series numbers array into structural recharts dictionary
  const chartData = React.useMemo(() => {
    let points = [...volumeSeries];
    if (selectedZoom === '1m') {
      points = points.slice(-15);
    } else if (selectedZoom === '5m') {
      points = points.slice(-40);
    } else if (selectedZoom === '15m') {
      points = points.slice(-60);
    }
    return points.map((p, idx) => ({
      ...p,
      timestamp: new Date(Date.now() - (points.length - idx) * 1400).toLocaleTimeString()
    }));
  }, [volumeSeries, selectedZoom]);

  if (verifyRouteTxnId) {
    return (
      <div className="relative min-h-screen bg-[#050508]">
        {/* Floating exit button to return back to dashboard */}
        <div className="fixed top-4 left-4 z-[99999] font-mono">
          <button
            onClick={handleExitStandaloneVerify}
            className="px-3 py-1.5 bg-[#0a0a14] hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
          >
            ← Exit Public Portal
          </button>
        </div>
        <EvidencePortal transactionId={verifyRouteTxnId} standalone={true} />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="w-full min-h-screen"
        >
          <SovereignLanding 
            onEnter={() => setShowLanding(false)} 
            totalAssetsUSD={totalAssetsUSD} 
            totalSVT={totalSVT} 
          />
        </motion.div>
      ) : screenWidth < 768 ? (
        <MobileTerminalView
          accounts={accounts}
          transactions={transactions}
          apps={apps}
          volumeSeries={volumeSeries}
          health={health}
          currentBlock={chain[0]}
          chain={chain}
          isConnected={isConnected}
          setIsConnected={setIsConnected}
          onPostTransaction={handlePostTransaction}
          onExportLogs={handleExportLogs}
          onForceSeal={handleForceSeal}
          notifications={notifications}
          clearNotifications={() => setNotifications([])}
          totalSVT={totalSVT}
          totalAssetsUSD={totalAssetsUSD}
        />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative min-h-screen grid-overlay bg-[#050507] pb-16 text-[#e0e0e0] font-sans antialiased border-4 border-[#1a1a20] overflow-hidden"
        >
          {/* Background oversized blueprint map */}
          <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none opacity-[0.06] mix-blend-screen scale-110">
            <img 
              src={backgroundMap} 
              alt="SOVR Terminal Blueprint Map" 
              className="w-full h-full object-cover select-none pointer-events-none blur-[0.2px]"
              referrerPolicy="no-referrer"
            />
          </div>

      {/* Sticky Top Bar & Global Administrative Header Container */}
      <div className="sticky top-0 z-40 w-full flex flex-col">
        {/* Top Ambient Tech Border line */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 animate-pulse w-full shadow-[0_0_8px_#06b6d4] relative z-50" />

        {/* Global Administrative Header */}
        <header id="site-global-header" className="border-b border-[#2a2a35]/65 bg-[#0c0c12]/85 backdrop-blur-md px-4 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative flex items-center justify-center">
              <div className="absolute inset-0.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-sm rotate-45 border border-white/20 animate-pulse" />
              <Cpu className="w-5 h-5 text-cyan-200 relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-black tracking-widest text-[#ffffff] font-display uppercase">
                  SOVR Core Gateway
                </h1>
                <span className="text-[9px] bg-white/5 border border-white/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-tight">
                  v3.8.4-stable
                </span>
              </div>
              <p className="text-[10px] text-white/50 font-mono uppercase tracking-wider">Cryptographic Ledger Registry & SOVR Sealer Client</p>
            </div>
          </div>

          {/* Connection Status panel */}
          <div className="flex items-center gap-3 flex-wrap bg-[#08080a] p-2 border border-[#2a2a35] rounded-lg">
            <div className="text-xs">
              <span className="text-white/40 font-mono block text-[9px] uppercase tracking-wider">REST INGRESS URL</span>
              <span className="font-mono text-[10px] text-cyan-400">{gatewayURL}</span>
            </div>
            <div className="h-8 w-[1px] bg-[#2a2a35] block" />
            <div className="text-xs">
              <span className="text-white/40 font-mono block text-[9px] uppercase tracking-wider">WSS STATUS STREAMS</span>
              <span className="font-mono text-[10px] text-emerald-400">{wsURL}</span>
            </div>

            <div className="h-8 w-[1px] bg-[#2a2a35] block" />

            {/* Notification Center Trigger */}
            <div className="relative">
              <button
                id="notification-center-bell"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-1.5 rounded relative hover:bg-white/5 active:scale-95 transition-all cursor-pointer border ${
                  isNotificationsOpen ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'border-transparent text-white/55'
                }`}
                title="System Notifications Feed"
              >
                {notifications.length > 0 ? (
                  <>
                    <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]" />
                  </>
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </button>

              {/* Notification Center Dropdown Drawer */}
              {isNotificationsOpen && (
                <div 
                  id="notif-dropdown-drawer"
                  className="absolute right-0 mt-3.5 w-80 bg-[#0c0c12]/95 border border-[#2a2a35] rounded-sm p-4 backdrop-blur-lg shadow-[0_4px_22px_rgba(0,0,0,0.5)] z-50 text-xs font-mono space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#2a2a35] pb-2">
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-wider">Gateway Alert Center</span>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[9px] text-[#06b6d4] uppercase hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-2 bg-[#050507] border border-[#2a2a35]/60 hover:border-[#2a2a35] rounded-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] px-1 rounded-sm uppercase font-bold tracking-widest ${
                              notif.type === 'SECURITY' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              notif.type === 'TREASURY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              [{notif.type}]
                            </span>
                            <span className="text-[8px] text-white/20">{notif.time}</span>
                          </div>
                          <p className="text-[9.5px] text-white/75 leading-relaxed font-sans">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-white/30 text-[10px]">
                        No unresolved gateway notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-[#2a2a35] block" />

            {/* COMMAND VIEW MODE Trigger */}
            <button
              onClick={() => setIsCommandViewActive(true)}
              className="px-3 py-1.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30 hover:bg-cyan-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 uppercase cursor-pointer"
              title="Activate full screen mission control visualization"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Command View
            </button>

            <div className="h-8 w-[1px] bg-[#2a2a35] block" />

            {/* Connection Status Toggle */}
            <button
              id="ws-connection-toggle-button"
              onClick={() => setIsConnected(!isConnected)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-505/20 hover:bg-rose-500/25 ring-1 ring-rose-500/10'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isConnected ? 'ONLINE (ACTIVE)' : 'PAUSED (LEADERS)'}
            </button>
          </div>
        </div>
      </header>
    </div>

      {/* Main Core View Area */}
      <main id="primary-bento-viewport" className="relative z-10 max-w-7xl mx-auto px-4 mt-8 space-y-6">

        {/* 8-TAB NAVIGATION BAR */}
        <div id="main-navigation-tabs" className="border border-[#2a2a35]/60 bg-[#07070b]/90 backdrop-blur-xl rounded-lg p-2 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {[
            { name: 'Overview', icon: Activity, desc: 'Operational dashboard & real-time telemetry' },
            { name: 'Network', icon: Globe, desc: '3D Spatial Globe & global node registry' },
            { name: 'Treasury', icon: Coins, desc: 'Double-entry balance sheets & assets' },
            { name: 'Settlement', icon: Layers, desc: 'Liquidity settlement rails' },
            { name: 'Trust Vault', icon: ShieldCheck, desc: 'Ecosystem, verification & cryptographic trust explorer' },
            { name: 'Compliance', icon: Shield, desc: 'Audit vault & regulatory logs' },
            { name: 'Gateway Fabric', icon: Radio, desc: 'Ecosystem & API control plane' },
            { name: 'Administration', icon: Settings, desc: 'System entity configuration layer' }
          ].map(tab => {
            const IconComponent = tab.icon;
            const isTabActive = activeMainTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveMainTab(tab.name);
                  // If switching tabs, minimize individual transaction drilldowns to avoid confusion
                  setSelectedTxIdForDrilldown(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded text-[10.5px] font-bold tracking-wider uppercase font-mono transition-all border shrink-0 cursor-pointer ${
                  isTabActive
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                    : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/5'
                }`}
                title={tab.desc}
              >
                <IconComponent className={`w-4 h-4 ${isTabActive ? 'text-cyan-400' : 'text-white/40'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
        
        {/* NETWORK GLOBAL KPI PANEL */}
        <div id="system-kpi-row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Assets USD in general ledger */}
          <div id="kpi-box-assets" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-4.5 relative overflow-hidden backdrop-blur hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold">Total Asset Liquidity</span>
                <h2 className="text-xl font-light text-white font-mono tracking-tight mt-1">
                  {formatCurrency(totalAssetsUSD, 'USD')}<span className="text-xs opacity-40 italic">.00</span>
                </h2>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_#10b981]" />
                  <span className="text-[9px] text-[#e0e0e0] opacity-60 font-mono tracking-tight uppercase">SECURE INTEGRITY CHECK: PASS</span>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-500/5 rounded border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500/30" />
          </div>

          {/* SOVR Treasury SVT Volume representation */}
          <div id="kpi-box-svt" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-4.5 relative overflow-hidden backdrop-blur hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold">SVT Treasury Pool</span>
                <h2 className="text-xl font-light text-amber-400 font-mono tracking-tight mt-1">
                  {totalSVT.toLocaleString()}<span className="text-xs opacity-40"> SVT</span>
                </h2>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-[0_0_8px_#f59e0b]" />
                  <span className="text-[9px] text-[#e0e0e0] opacity-60 font-mono tracking-tight uppercase">SOVR NETWORK SUPPLY</span>
                </div>
              </div>
              <div className="p-2.5 bg-amber-500/5 rounded border border-amber-500/25 text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500/30" />
          </div>

          {/* Cryptographic block sealer speed latency metric */}
          <div id="kpi-box-sealer" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-4.5 relative overflow-hidden backdrop-blur hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold">Latency P99 Ingress</span>
                <h2 className="text-xl font-light text-cyan-400 font-mono tracking-tight mt-1">
                  {health.p99LatencyMs}<span className="text-xs opacity-40">ms</span>
                </h2>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_#06b6d4]" />
                  <span className="text-[9px] text-[#e0e0e0] opacity-60 font-mono tracking-tight uppercase">Nodes: 6/6 OK_SYNC</span>
                </div>
              </div>
              <div className="p-2.5 bg-cyan-500/5 rounded border border-cyan-500/25 text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-500/30" />
          </div>

          {/* Posted actions volume summary */}
          <div id="kpi-box-posted-count" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-4.5 relative overflow-hidden backdrop-blur hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold">Transaction Stream Volume</span>
                <h2 className="text-xl font-light text-[#e0e0e0] font-mono tracking-tight mt-1">
                  {postedToday} <span className="text-xs opacity-40">POSTED</span>
                </h2>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[9px] text-amber-400 font-mono font-bold uppercase tracking-tight">
                    PENDING: {health.pendingTxns} TXN_POOL
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-500/5 rounded border border-emerald-500/25 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500/30" />
          </div>

        </div>        {/* TRANSACTION DRILLDOWN WORKSPACE */}
        <AnimatePresence>
          {selectedTxIdForDrilldown && (
            <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              {/* Backdrop dismiss */}
              <div className="absolute inset-0 cursor-default" onClick={() => setSelectedTxIdForDrilldown(null)} />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative w-full max-w-4xl z-10"
              >
                <TransactionWorkspace 
                  transactionId={selectedTxIdForDrilldown} 
                  onClose={() => setSelectedTxIdForDrilldown(null)}
                  formatCurrency={formatCurrency}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CONDITIONALLY RENDERED TABS */}
        {activeMainTab === 'Overview' && (
          <div className="animate-fadeIn">
            <MissionControlView 
              accounts={accounts}
              transactions={transactions}
              setActiveTab={setActiveMainTab}
              formatCurrency={formatCurrency}
            />
          </div>
        )}

        {activeMainTab === 'Network' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
            {/* Left: Spatial Globe View (7 columns) */}
            <div className="lg:col-span-7 bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 flex flex-col justify-between h-[450px] lg:h-auto min-h-[420px] relative overflow-hidden shadow-2xl">
              <div className="z-10">
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/65 pb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Map: Spatial Capital Router Telemetry
                </span>
                <span className="text-[8px] text-white/20 block mt-1 uppercase">Interconnected validation nodes across 4 global operating zones</span>
              </div>

              {/* 3D WebGL Sovereign Globe */}
              <div className="absolute inset-0 flex items-center justify-center p-4 mt-6">
                <SovereignGlobe 
                  geoNodes={[
                    { id: 'NY_LC', name: 'NY Ledger Core', role: 'Ledger Settlement Host', region: 'North America', lat: 40.7128, lon: -74.0060, status: 'ONLINE', latency: 12, cpu: 24, ram: 42, disk: 68, workers: 1522, txnsProcessed: 1824552, settlementValue: '$84.3M', lastSeal: 'blk_18', lastConsensus: '0.8s ago', softwareVersion: 'v5.9.2', trustScore: '99.9%' },
                    { id: 'LDN_R', name: 'London Routing', role: 'Consensus Coordinator', region: 'Western Europe', lat: 51.5072, lon: -0.1276, status: 'ONLINE', latency: 15, cpu: 18, ram: 37, disk: 52, workers: 1140, txnsProcessed: 1420550, settlementValue: '$65.1M', lastSeal: 'blk_19', lastConsensus: '1.1s ago', softwareVersion: 'v5.9.2', trustScore: '100%' },
                    { id: 'ZRH_T', name: 'Zurich Treasury', role: 'Vault Custody Agent', region: 'Central Europe', lat: 47.3769, lon: 8.5417, status: 'ONLINE', latency: 16, cpu: 31, ram: 50, disk: 61, workers: 920, txnsProcessed: 981440, settlementValue: '$112.4M', lastSeal: 'blk_17', lastConsensus: '0.9s ago', softwareVersion: 'v5.9.1', trustScore: '99.9%' },
                    { id: 'SGP_G', name: 'Singapore Gate', role: 'Asynchronous Gateway', region: 'Southeast Asia', lat: 1.3521, lon: 103.8198, status: 'ONLINE', latency: 32, cpu: 48, ram: 58, disk: 74, workers: 2150, txnsProcessed: 2891460, settlementValue: '$144.8M', lastSeal: 'blk_20', lastConsensus: '1.4s ago', softwareVersion: 'v5.9.2', trustScore: '99.9%' }
                  ]} 
                  routes={[
                    { id: 'r1', fromId: 'NY_LC', toId: 'LDN_R', avgTps: 45, volume: '$12.4M', latency: 14, successRate: 99.99, drift: 0.2, loss: 0.0, consensus: 'SYNCHRONOUS' },
                    { id: 'r2', fromId: 'LDN_R', toId: 'ZRH_T', avgTps: 32, volume: '$8.2M', latency: 8, successRate: 100.0, drift: 0.05, loss: 0.0, consensus: 'SYNCHRONOUS' },
                    { id: 'r3', fromId: 'ZRH_T', toId: 'SGP_G', avgTps: 28, volume: '$14.1M', latency: 42, successRate: 99.98, drift: 0.4, loss: 0.01, consensus: 'ASYNCHRONOUS' }
                  ]} 
                  selectedNodeId={selectedGlobeNodeId} 
                  selectedRouteId={selectedGlobeRouteId} 
                  onSelectNode={setSelectedGlobeNodeId} 
                  onSelectRoute={setSelectedGlobeRouteId} 
                  heatmapOn={true} 
                />
              </div>

              <div className="flex items-center justify-between z-10 text-[8.5px] text-white/35 font-bold uppercase tracking-widest border-t border-[#2a2a35]/50 pt-2 font-mono">
                <span>Ingress protocol rate: 94.2% compliant</span>
                <span>4 operating regions mapped</span>
              </div>
            </div>

            {/* Right: Global Node Registry Panel (5 columns) */}
            <div className="lg:col-span-5 border border-[#2a2a35] bg-[#0c0c12]/90 rounded-lg p-5">
              <NodeRegistry />
            </div>
          </div>
        )}

        {activeMainTab === 'Treasury' && (
          <div className="animate-fadeIn">
            <TreasuryCommandCenter 
              accounts={accounts} 
              setAccounts={setAccounts} 
              transactions={transactions} 
              apps={apps} 
              onPostTransaction={handlePostTransaction} 
            />
          </div>
        )}

        {activeMainTab === 'Settlement' && (
          <div className="space-y-6 animate-fadeIn">
            <OrchestrationEngine />
          </div>
        )}

        {activeMainTab === 'Trust Vault' && (
          <div className="space-y-6 animate-fadeIn">
            <TrustVault 
              transactions={transactions} 
              setSelectedTxIdForDrilldown={setSelectedTxIdForDrilldown} 
              accounts={accounts}
            />
          </div>
        )}

        {activeMainTab === 'Compliance' && (
          <div className="space-y-6 animate-fadeIn">
            <ComplianceHub 
              accounts={accounts} 
              transactions={transactions} 
              formatCurrency={formatCurrency} 
            />
            <AuditVault onSelectTransaction={setSelectedTxIdForDrilldown} />
          </div>
        )}

        {activeMainTab === 'Gateway Fabric' && (
          <div className="space-y-6 animate-fadeIn">
            <GatewayFabric apps={apps} setApps={setApps} />
          </div>
        )}

        {activeMainTab === 'Administration' && (
          <div className="space-y-6 animate-fadeIn">
            <AdministrationView />
          </div>
        )}

      </main>

      {/* COMMAND CENTER OPERATIONS OVERLAY */}
      {isCommandViewActive && (
        <CommandCenterView
          onClose={() => setIsCommandViewActive(false)}
          totalAssetsUSD={totalAssetsUSD}
          totalSVT={totalSVT}
          p99LatencyMs={health.p99LatencyMs}
          transactions={transactions}
          formatCurrency={formatCurrency}
          accounts={accounts}
        />
      )}
      {false && isCommandViewActive && (
        <div id="command-center-fullscreen-dashboard" className="fixed inset-0 z-50 bg-[#040406]/98 backdrop-blur-xl flex flex-col p-6 overflow-y-auto space-y-6 font-mono text-xs select-none">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#2a2a35] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" />
              <div>
                <h1 className="text-sm font-black tracking-widest text-[#ffffff] uppercase font-display">
                  SOVR Capital Routing Command Center
                </h1>
                <span className="text-[10px] text-white/40 uppercase">SOVR Financial Network Operating System // Consensus Verified Nominal state</span>
              </div>
            </div>

            <button
              onClick={() => setIsCommandViewActive(false)}
              className="px-3.5 py-1.5 border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/50 rounded-sm uppercase font-bold tracking-widest text-[10px] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Terminate Comm Node
            </button>
          </div>

          {/* Core Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
            {/* Left: Spatial Interconnect capital routing map (7 cols) */}
            <div className="lg:col-span-7 bg-[#08080c] border border-[#2a2a35] h-[450px] lg:h-auto rounded p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="z-10">
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Map: Spatial Capital Router Telemetry
                </span>
                <span className="text-[8px] text-white/20 block mt-1">REAL-TIME PACKET ARC DEVIATIONS ACCUMULATOR</span>
              </div>

              {/* Dynamic Map SVG representation */}
              <div className="absolute inset-0 flex items-center justify-center p-8 mt-6">
                <svg viewBox="0 0 800 400" className="w-full h-full text-cyan-500/20 stroke-current opacity-70">
                  {/* Grid Lines background */}
                  <g stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <line key={`lh-${i}`} x1="0" y1={i * 30} x2="800" y2={i * 30} />
                    ))}
                    {Array.from({ length: 25 }).map((_, i) => (
                      <line key={`lv-${i}`} x1={i * 35} y1="0" x2={i * 35} y2="400" />
                    ))}
                  </g>

                  {/* Interconnected Capital Nodes */}
                  <g stroke="#22d3ee" strokeWidth="0.75" fill="none" strokeDasharray="3 3">
                    {/* Arcs between world nodes */}
                    <path d="M 120 150 Q 250   80  380 220" className="animate-pulse" />
                    <path d="M 380 220 Q 480  100  580 180" />
                    <path d="M 580 180 Q 640  280  710 160" />
                    <path d="M 120 150 Q 400  320  580 180" stroke="#a855f7" />
                    <path d="M 380 220 Q 550  350  710 160" stroke="#f59e0b" />
                  </g>

                  {/* Active Packet flow rays animation */}
                  <g fill="#22d3ee">
                    <circle r="3" className="animate-bounce">
                      <animateMotion dur="6s" repeatCount="indefinite" path="M 120 150 Q 250   80  380 220" />
                    </circle>
                    <circle r="3" fill="#a855f7">
                      <animateMotion dur="4s" repeatCount="indefinite" path="M 120 150 Q 400  320  580 180" />
                    </circle>
                    <circle r="3.5" fill="#f59e0b">
                      <animateMotion dur="5.2s" repeatCount="indefinite" path="M 380 220 Q 550  350  710 160" />
                    </circle>
                  </g>

                  {/* Physical Node markers */}
                  <g fill="#0c0c12" strokeWidth="1.5">
                    {/* Node 1: NY Core */}
                    <circle cx="120" cy="150" r="8" stroke="#06b6d4" />
                    <text x="120" y="135" fill="#ffffff" stroke="none" className="text-[9px] font-sans text-center" textAnchor="middle">NY Ledger Core</text>
                    
                    {/* Node 2: London Vault */}
                    <circle cx="380" cy="220" r="8" stroke="#a855f7" />
                    <text x="380" y="240" fill="#ffffff" stroke="none" className="text-[9px] font-sans" textAnchor="middle">London Routing</text>

                    {/* Node 3: Zurich Secret */}
                    <circle cx="580" cy="180" r="8" stroke="#eab308" />
                    <text x="580" y="165" fill="#ffffff" stroke="none" className="text-[9px] font-sans" textAnchor="middle">Zurich Treasury</text>

                    {/* Node 4: Singapore Vault */}
                    <circle cx="710" cy="160" r="10" stroke="#10b981" />
                    <circle cx="710" cy="160" r="4" fill="#10b981" className="animate-ping" />
                    <text x="710" y="145" fill="#10b981" stroke="none" className="text-[9px] font-sans font-black" textAnchor="middle">Singapore Gate</text>
                  </g>
                </svg>
              </div>

              <div className="flex items-center justify-between z-10 text-[8.5px] text-white/35 font-bold uppercase tracking-widest border-t border-[#2a2a35]/50 pt-2 font-mono">
                <span>Ingress protocol rate: 94.2% compliant</span>
                <span>All routes online</span>
              </div>
            </div>

            {/* Right: Telemetric Stats, Node Status, Logs (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4 h-full">
              {/* Telemetric readouts */}
              <div className="bg-[#08080c] border border-[#2a2a35] rounded p-4 space-y-3.5">
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  SOVR Ledger Invariants
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-[#0c0c12]/80 border border-[#2a2a35]/40 rounded-sm">
                    <span className="text-white/30 text-[8px] uppercase tracking-wider block">Global Asset Val</span>
                    <span className="text-[13px] font-bold text-white font-mono">{formatCurrency(totalAssetsUSD, 'USD')}</span>
                  </div>
                  <div className="p-2 bg-[#0c0c12]/80 border border-[#2a2a35]/40 rounded-sm">
                    <span className="text-white/30 text-[8px] uppercase tracking-wider block">SVT SUPPLY POOL</span>
                    <span className="text-[13px] font-bold text-amber-500 font-mono">{totalSVT.toLocaleString()} SVT</span>
                  </div>
                  <div className="p-2 bg-[#0c0c12]/80 border border-[#2a2a35]/40 rounded-sm">
                    <span className="text-white/30 text-[8px] uppercase tracking-wider block">CONSENSUS STATE</span>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">NOMINAL_PASS</span>
                  </div>
                  <div className="p-2 bg-[#0c0c12]/80 border border-[#2a2a35]/40 rounded-sm">
                    <span className="text-white/30 text-[8px] uppercase tracking-wider block">P99 TARGET LATENCY</span>
                    <span className="text-[11px] font-bold text-cyan-300 font-mono">{health.p99LatencyMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Validation Quorum Nodes (6 Nodes Matrix) */}
              <div className="bg-[#08080c] border border-[#2a2a35] rounded p-4 flex-grow space-y-2.5">
                <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Active Consensus Signers
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="p-2 bg-gradient-to-b from-[#101015] to-[#08080c] border border-[#2a2a35]/60 rounded-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] text-white/55 font-bold font-mono">NODE_0{idx + 1}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      </div>
                      <div className="text-[7.5px] text-white/30 font-mono flex flex-col">
                        <span>LAT: {Math.floor(Math.random() * 4) + 12}ms</span>
                        <span>CPU: {(Math.random() * 15 + 10).toFixed(1)}%</span>
                        <span className="text-cyan-400">STATE: NOM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable live event logs feed */}
              <div className="bg-[#08080c] border border-[#2a2a35] rounded p-4 h-[110px] overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    Pulsing Gateway Log
                  </span>
                </div>
                <div className="space-y-1.5 text-[8.5px] text-white/70 overflow-y-auto font-mono mt-1 pr-1 max-h-[70px]">
                  {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between border-b border-[#2a2a35]/20 pb-0.5 last:border-b-0 leading-relaxed font-mono">
                      <span className="text-white/40">[{t.id.substring(0, 8)}]</span>
                      <span className="text-white/80 truncate block max-w-[150px]">{t.memo}</span>
                      <span className="text-emerald-400">{formatCurrency(t.amountMinor, t.denomination)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Footer copyright info */}
      <footer id="dashboard-footer" className="text-center text-xs text-[#ffffff]/30 mt-12 pt-6 border-t border-[#2a2a35]">
        <p>© 2026 SOVR Core Gateway Network. Secured via SHA-256 Proof-of-Authority Authority Seal.</p>
        <p className="text-[10px] mt-1 text-white/20">Reflecting live in-memory REST endpoints mock contracts flawlessly.</p>
      </footer>
      {/* Immersive Atmospheric Scanlines Overlay */}
      <div className="scanlines" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
