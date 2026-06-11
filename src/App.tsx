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
import BlocksChain from './components/BlocksChain';
import TransactionsHistory from './components/TransactionsHistory';
import ManualTransactionForm from './components/ManualTransactionForm';
import ConnectedAppsList from './components/ConnectedAppsList';
import RegisterIntegrationForm from './components/RegisterIntegrationForm';
import CommandCenterView from './components/CommandCenterView';
import SovereignLanding from './components/SovereignLanding';

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
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Connection state
  const [gatewayURL] = useState("https://gateway.sovr.local/v1");
  const [wsURL] = useState("wss://gateway.sovr.local/v1/stream");
  const [isConnected, setIsConnected] = useState(true);

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

  // Simulated notification center logs
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, type: 'API', message: 'Inbound TLS port connection handshaking initialized with SovereignPay Swedish ingress', time: '1 min ago', status: 'info' },
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
  const tickTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            'Sovereign UnifiedPay Hub webhook ingestion queue lag detected: 42ms',
            'Sovereign API channel heartbeats successfully acknowledged from all 6 authorities'
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
          { id: Date.now(), type: randomCat, message: msg, time: 'Just now', status },
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
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative min-h-screen grid-overlay bg-[#050507] pb-16 text-[#e0e0e0] font-sans antialiased border-4 border-[#1a1a20]"
        >
      {/* Top Ambient Tech Border line */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 animate-pulse w-full shadow-[0_0_8px_#06b6d4]" />

      {/* Global Administrative Header */}
      <header id="site-global-header" className="border-b border-[#2a2a35] bg-[#0c0c12]/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5 shadow-sm">
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
              <p className="text-[10px] text-white/50 font-mono uppercase tracking-wider">Cryptographic Ledger Registry & Sovereign Sealer Client</p>
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

      {/* Main Core View Area */}
      <main id="primary-bento-viewport" className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        
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

          {/* Sovereign Treasury SVT Volume representation */}
          <div id="kpi-box-svt" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-4.5 relative overflow-hidden backdrop-blur hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold">SVT Treasury Pool</span>
                <h2 className="text-xl font-light text-amber-400 font-mono tracking-tight mt-1">
                  {totalSVT.toLocaleString()}<span className="text-xs opacity-40"> SVT</span>
                </h2>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-[0_0_8px_#f59e0b]" />
                  <span className="text-[9px] text-[#e0e0e0] opacity-60 font-mono tracking-tight uppercase">SOVEREIGN NETWORK SUPPLY</span>
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

        </div>

        {/* TELEMETRY CHART SECTION */}
        <div id="central-sparkline-graph-panel" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 id="sparkline-title" className="text-xs font-bold uppercase tracking-widest text-white/90 font-display flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Ledger Transaction Velocity Stream 2.0
                  </h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono">Multi-Layer telemetry mapping of validation nodes, network throughput, and liquid volume</p>
                </div>
                
                {/* Real-time zoom controllers */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-[#050507] p-1 border border-[#2a2a35] rounded-sm">
                    {(['1m', '5m', '15m', 'all'] as const).map(zoom => (
                      <button
                        key={zoom}
                        onClick={() => setSelectedZoom(zoom)}
                        className={`px-2.5 py-1 rounded-sm font-mono text-[9px] uppercase font-bold transition-all cursor-pointer ${
                          selectedZoom === zoom ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/35' : 'text-white/30 border border-transparent hover:text-white/50'
                        }`}
                      >
                        {zoom}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#050507] px-2.5 py-1 rounded border border-[#2a2a35] font-mono text-[10px]">
                    <span className="text-white/40">DRIFT:</span>
                    <span className="text-[#02c39a] font-bold">
                      {((volumeSeries[volumeSeries.length - 1]?.settlementVelocity) || 0).toFixed(1)} TKS
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-layered custom composed chart */}
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="timestamp" stroke="#ffffff" fontSize={8} tickLine={false} axisLine={false} opacity={0.2} style={{ fontSize: '7.5px', fontFamily: 'monospace' }} />
                    <YAxis yAxisId="tps" orientation="left" stroke="#ffffff" opacity={0.2} style={{ fontSize: '7.5px', fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="flow" orientation="right" stroke="#ffffff" opacity={0.1} style={{ fontSize: '7.5px', fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                    <defs>
                      <linearGradient id="gradientFlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.06}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradientVelocity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#02c39a" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#02c39a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#020617]/95 border border-[#2a2a35] p-3 rounded-sm backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.5)] font-mono text-[9.5px] space-y-1.5 text-white/90">
                            <div className="border-b border-[#2a2a35] pb-1 text-white/40 flex items-center justify-between gap-3 text-[8.5px]">
                              <span>Telemetry Data Payload</span>
                              <span>{data.timestamp}</span>
                            </div>
                            <div>
                              <span className="text-[#02c39a]">● Core Velocity:</span> <span className="font-bold">{data.settlementVelocity} TPS</span>
                            </div>
                            <div>
                              <span className="text-amber-400">● Treasury Flow:</span> <span className="font-bold">+{data.treasuryFlow.toLocaleString()} SVT</span>
                            </div>
                            <div>
                              <span className="text-purple-400">● Network Load:</span> <span className="font-bold">{data.networkLoad}% UTIL</span>
                            </div>
                            <div>
                              <span className="text-sky-400">● API Throughput:</span> <span className="font-bold">{data.apiThroughput} pkts/s</span>
                            </div>
                            <div className="border-t border-[#2a2a35] pt-1 text-[8px] text-white/30 uppercase flex justify-between gap-4 font-bold">
                              <span>Status: COHESIVE</span>
                              <span>Age: 1.4s cycle</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    {/* Layer 2: Treasury Flow (Gold Area, Asset movement) */}
                    <Area yAxisId="flow" type="monotone" dataKey="treasuryFlow" stroke="#eab308" strokeWidth={1} fillOpacity={1} fill="url(#gradientFlow)" opacity={0.65} name="Treasury Flow" />
                    
                    {/* Layer 1: Settlement Velocity (Green Area, Transactions/sec) */}
                    <Area yAxisId="tps" type="monotone" dataKey="settlementVelocity" stroke="#02c39a" strokeWidth={1.5} fillOpacity={1} fill="url(#gradientVelocity)" name="Settlement Velocity" />
                    
                    {/* Layer 3: Network Load (Purple line, Gateway utilization) */}
                    <Line yAxisId="tps" type="monotone" dataKey="networkLoad" stroke="#a855f7" strokeWidth={1} strokeDasharray="3 3" dot={false} opacity={0.5} name="Network Load" />
                    
                    {/* Layer 4: API Throughput (Blue Scatter Points, Live integration activity) */}
                    <Scatter yAxisId="tps" dataKey="apiThroughput" fill="#38bdf8" opacity={0.25} style={{ pointerEvents: 'none' }} shape={(props: any) => {
                      const { cx, cy } = props;
                      // Bound coordinates nicely
                      return <circle cx={cx} cy={Math.max(10, Math.min(145, cy))} r={2} fill="#38bdf8" stroke="none" opacity={0.4} />;
                    }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Horizontal Legend labels */}
              <div className="flex items-center gap-4 text-[8.5px] font-mono text-white/30 uppercase border-t border-[#2a2a35]/40 pt-2 tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#02c39a]" /> Settled Velocity</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Treasury movement</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Layer 3 Load limits</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" /> API Throughput</span>
              </div>
            </div>

            {/* GRAPH INSIGHT ENGINE Side panel */}
            <div id="graph-insight-engine-panel" className="bg-[#050507] border border-[#2a2a35] rounded p-3 text-[10px] font-mono space-y-2.5 flex flex-col justify-between">
              <div>
                <span className="text-white/35 uppercase text-[8px] font-bold tracking-widest block border-b border-[#2a2a35]/60 pb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#02c39a] animate-pulse" />
                  Live Stream Analytics
                </span>

                <div className="space-y-2 mt-2">
                  <div className="flex justify-between border-b border-[#2a2a35]/30 pb-1">
                    <span className="text-white/40">Current Core Speed:</span>
                    <span className="text-[#02c39a] font-bold">{chartData[chartData.length - 1]?.settlementVelocity ?? 0} TPS</span>
                  </div>

                  <div className="flex justify-between border-b border-[#2a2a35]/30 pb-1">
                    <span className="text-white/40">Mean Settlement Velocity:</span>
                    <span className="text-[#ffffff]/80 font-bold">
                      {Math.round(chartData.reduce((acc, curr) => acc + (curr.settlementVelocity || 0), 0) / (chartData.length || 1))} TPS
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-[#2a2a35]/30 pb-1">
                    <span className="text-white/40">Peak Execution Rate:</span>
                    <span className="text-[#02c39a] font-bold">
                      {Math.max(...chartData.map(d => d.settlementVelocity || 0), 0)} TPS
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-[#2a2a35]/30 pb-1" title="Algorithmic invariant offset deviation">
                    <span className="text-white/40">Live Drift Rate:</span>
                    <span className="text-amber-400 font-bold">
                      +{(Math.abs((chartData[chartData.length - 1]?.settlementVelocity || 0) - (chartData[0]?.settlementVelocity || 0)) / 10).toFixed(3)}%
                    </span>
                  </div>

                  <div className="flex justify-between" title="Aggregate SVT transferred inside chosen sliding interval">
                    <span className="text-white/40">Window Net Volume:</span>
                    <span className="text-amber-500 font-bold">
                      {chartData.reduce((acc, curr) => acc + (curr.treasuryFlow || 0), 0).toLocaleString()} SVT
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#101015] border border-[#2a2a35]/60 p-2 rounded-sm text-[8px] space-y-1">
                <div className="flex items-center justify-between text-white/30 text-[7px] uppercase font-bold tracking-widest">
                  <span>Engine status</span>
                  <span className="text-cyan-400">NOMINAL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Node sync rate:</span>
                  <span className="text-emerald-400 font-bold">100.0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Settlement compliance:</span>
                  <span className="text-cyan-300 font-bold">99.998% compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DOUBLE COLUMN LAYOUT: Accounts Ledger & Block Explorer & apps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SUBDIVISION: Accounts General Ledger list & custom submissions (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Accounts Panel component */}
            <AccountsList accounts={accounts} />

            {/* Quick manual journal poster */}
            <ManualTransactionForm 
              accounts={accounts} 
              apps={apps} 
              onPostTransaction={handlePostTransaction} 
            />

            {/* Ingress integrations connected apps widget */}
            <ConnectedAppsList apps={apps} isPaused={!isConnected} />

            {/* NEW API REGISTRATION PANEL */}
            <RegisterIntegrationForm 
              onRegister={(newApp) => {
                const colors = [
                  'border-cyan-500/30 text-cyan-400 bg-cyan-500/5',
                  'border-purple-500/30 text-purple-400 bg-purple-500/5',
                  'border-amber-500/30 text-amber-400 bg-amber-500/5',
                  'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
                  'border-blue-500/30 text-blue-400 bg-blue-500/5'
                ];
                setApps(prevApps => [
                  ...prevApps,
                  {
                    id: `app_${generateUUIDShort()}`,
                    slug: newApp.slug,
                    displayName: newApp.displayName,
                    icon: newApp.icon || 'Cpu',
                    tint: colors[prevApps.length % colors.length],
                    health: 'healthy',
                    activeSessions: Number(newApp.activeSessions || 4),
                    txnPerMin: Number(newApp.txnPerMin || 18.5),
                    lastHeartbeat: new Date().toISOString(),
                    version: newApp.version || 'v2.1-stable'
                  }
                ]);
              }}
            />

          </div>

          {/* RIGHT SUBDIVISION: Secure chain seals log & diagnostic info blocks (4 columns) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* Sealer blocks log component */}
            <BlocksChain 
              chain={chain} 
              onForceSeal={handleForceSeal} 
              isSealing={isSealingNow} 
            />

             {/* Interactive network diagnostics cheat panel with Expand Mode */}
             <div id="diagnostics-card" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 backdrop-blur-md shadow-inner transition-all duration-300">
               <div className="flex items-center justify-between mb-3 border-b border-[#2a2a35] pb-2">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-white/90 font-display flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-cyan-400" />
                   Cryptographic Guard Proofs
                 </h3>
                 <button
                   onClick={() => setIsProofExpanded(!isProofExpanded)}
                   className="text-[9px] hover:text-[#06b6d4] text-white/40 uppercase font-mono tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                 >
                   {isProofExpanded ? (
                     <>
                       [COLLAPSE] <ChevronUp className="w-3.5 h-3.5" />
                     </>
                   ) : (
                     <>
                       [EXPAND MODULE] <ChevronDown className="w-3.5 h-3.5" />
                     </>
                   )}
                 </button>
               </div>
               
               <div className="space-y-2.5 text-xs">
                 <div className="flex justify-between items-center py-1.5 border-b border-[#2a2a35]/40">
                   <span className="text-white/50 text-[11px]">Double Entry Algebraic integrity:</span>
                   <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                     PASS_MATH
                   </span>
                 </div>

                 <div className="flex justify-between items-center py-1.5 border-b border-[#2a2a35]/40">
                   <span className="text-white/50 text-[11px]">SHA-256 Authority signature:</span>
                   <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
                     VERIFIED
                   </span>
                 </div>

                 <div className="flex justify-between items-center py-1.5 border-b border-[#2a2a35]/40 border-dashed">
                   <span className="text-white/50 text-[11px]">Consensus Quorum:</span>
                   <span className="font-mono text-[10px] text-white/60">
                     6/6 ALIVE_SYNC
                   </span>
                 </div>

                 {/* Forensic Cryptographic Proof Drawer (Reveal on expansion) */}
                 {isProofExpanded && (
                   <div id="crypto-forensic-drawer" className="mt-3 p-3 bg-[#050507] border border-[#2a2a35] rounded-sm font-mono text-[9px] text-white/70 space-y-3 animate-fade-in">
                     <div className="space-y-1">
                       <span className="text-[8px] text-white/35 uppercase font-bold tracking-widest block">Active Merkle Root Path Indices:</span>
                       <pre className="text-[8px] text-cyan-400 bg-[#08080c] p-2 rounded overflow-x-auto border border-white/5 scrollbar-thin">
{`   [Root: 8c3e21...9f220]
       /           \\
 [H_01]: 2fe3a   [H_23]: f4a0e
   /     \\         /     \\
 [Tx0]: [Tx1]   [Tx2]: [Tx3]`}
                       </pre>
                     </div>

                     <div className="space-y-1.5 border-t border-[#2a2a35]/50 pt-2 text-[8.5px]">
                       <div className="flex justify-between leading-relaxed">
                         <span className="text-white/40">Authority seal:</span>
                         <span className="text-cyan-300">ECDSA_Sovereign_v2(SHA-256)</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-white/40">Validator group:</span>
                         <span className="text-white/70">Consensus Authority Nodes #1-6</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-white/40">Proof epoch age:</span>
                         <span className="text-[#ffffff]/60">1.4s (active block stream)</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-white/40">Ledger state seal:</span>
                         <span className="text-emerald-400 font-bold">ALGEBRAICALLY_INVARIANT</span>
                       </div>
                     </div>

                     <div className="grid grid-cols-3 gap-2 border-t border-[#2a2a35]/50 pt-2.5">
                       <button
                         onClick={() => {
                           navigator.clipboard.writeText("8c3e21e7f3a2b1662defa0f5e712a42dd094f31cfa754ebfa05f426214227f22");
                           alert("Canonical block authority signature hash copied to clipboard.");
                         }}
                         className="px-1.5 py-1 bg-[#101015] border border-[#2a2a35] hover:border-white/10 hover:bg-[#131422] rounded-sm text-center uppercase tracking-wide cursor-pointer transition-all active:scale-95 text-[8px]"
                         title="Copy SHA-256 root hash to clipboard"
                       >
                         Copy Hash
                       </button>

                       <button
                         onClick={() => {
                           // Trigger validation routine
                           alert("Verifying SHA-256 state invariants: Root match PASS. Debits/Credits match PASS. Signature match PASS.");
                         }}
                         className="px-1.5 py-1 bg-[#101015] border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/10 rounded-sm text-center uppercase tracking-wide cursor-pointer transition-all active:scale-95 text-[8px]"
                         title="Execute local validation tree verification"
                       >
                         Verify Seal
                       </button>

                       <button
                         onClick={() => {
                           const proofTemplate = {
                             merkleRoot: "8c3e21e7f3a2b1662defa0f5e712a42dd094f31cfa754ebfa05f426214227f22",
                             sealerAuthority: "Sovereign SHA-256 seal nodes",
                             algebraicIntegrity: "PROVEN_PASS",
                             timestamp: new Date().toISOString()
                           };
                           const blob = new Blob([JSON.stringify(proofTemplate, null, 2)], { type: 'application/json' });
                           const url = URL.createObjectURL(blob);
                           const link = document.createElement('a');
                           link.href = url;
                           link.download = `sovr_cryptographic_proof_${Date.now()}.json`;
                           document.body.appendChild(link);
                           link.click();
                           document.body.removeChild(link);
                         }}
                         className="px-1.5 py-1 bg-[#101015] border border-[#2a2a35] hover:border-white/10 hover:bg-[#131422] rounded-sm text-center uppercase tracking-wide cursor-pointer transition-all active:scale-95 text-[8px]"
                         title="Download digital proof signature"
                       >
                         Export Proof
                       </button>
                     </div>
                   </div>
                 )}

                 <div className="bg-[#050507] p-3 rounded mt-1.5 text-[10.5px] text-white/55 border border-[#2a2a35] flex items-start gap-2.5 leading-relaxed">
                   <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                   <p>
                     This in-memory control client models the complete live **SOVR core gateway** protocol. All debit/credit actions verify algebraic invariance.
                   </p>
                 </div>

                 <button
                   id="export-logs-button"
                   onClick={handleExportLogs}
                   className="w-full mt-2.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                 >
                   <Download className="w-3.5 h-3.5" />
                   Export Ledger Logs
                 </button>
               </div>
             </div>

          </div>

        </div>

        {/* LEDGER TRANSACTION STREAM LOG CONTAINER */}
        <div className="w-full">
          <TransactionsHistory transactions={transactions} />
        </div>

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
                  Sovereign Capital Routing Command Center
                </h1>
                <span className="text-[10px] text-white/40 uppercase">Sovereign Financial Network Operating System // Consensus Verified Nominal state</span>
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
                  Sovereign Ledger Invariants
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
