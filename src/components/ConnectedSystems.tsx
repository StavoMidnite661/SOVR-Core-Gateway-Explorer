import React, { useState, useEffect } from 'react';
import { 
  Radio, ShieldAlert, Cpu, Terminal, RefreshCw, Key, Play, Eye, EyeOff, CheckCircle2, 
  HelpCircle, ChevronRight, Activity, ArrowUpRight, BarChart2
} from 'lucide-react';

interface ConnectedApp {
  id: string;
  slug: string;
  displayName: string;
  version: string;
  environment: string;
  connectedSince: string;
  lastHeartbeat: string;
  transactions: number;
  settlementVolume: number;
  averageLatency: number;
  errorRate: number;
  nodeAssociations: number;
  status: 'healthy' | 'warning' | 'offline';
  activeSessions: number;
  txnPerMin: number;
  apiKey: string;
}

export default function ConnectedSystems() {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedAppId, setSelectedAppId] = useState<string | null>('app_unifiedpay');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [inspectingAPI, setInspectingAPI] = useState<string | null>(null);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      if (data.success) {
        setApps(data.apps);
      } else {
        throw new Error(data.error || 'Failed to load app profiles.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching apps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleAppAction = async (appId: string, action: 'ROTATE_KEYS' | 'RESTART_SERVICE' | 'TOGGLE_STATUS') => {
    try {
      const res = await fetch('/api/apps/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, action })
      });
      const data = await res.json();
      if (data.success) {
        setApps(data.apps);
        alert(`Successfully completed action [${action}] on system profile.`);
      } else {
        alert('Action failed: ' + data.error);
      }
    } catch (err: any) {
      alert('Error triggering app action: ' + err.message);
    }
  };

  const toggleRevealSecret = (id: string) => {
    setRevealedSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedApp = apps.find(a => a.id === selectedAppId);

  return (
    <div id="connected-systems-intelligence" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
      
      {/* Left panel: App Profiles List (5 columns) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a2a35]/65 pb-3">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Connected Systems
            </h2>
            <p className="text-[8px] text-white/40 mt-0.5">CONNECTED REPLICATORS, CLIENT APPS & LIQUIDITY BRIDGES</p>
          </div>
          <button
            onClick={fetchApps}
            className="p-1 hover:bg-white/5 text-white/40 hover:text-white rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              className={`w-full text-left p-3.5 border rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                selectedAppId === app.id
                  ? 'bg-cyan-500/5 border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.05)]'
                  : 'bg-[#08080c] border-[#2a2a35]/50 hover:bg-[#0c0c12] hover:border-[#2a2a35]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded flex items-center justify-center bg-cyan-500/10`}>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="font-bold text-white block">{app.displayName}</span>
                  <span className="text-[8.5px] text-white/30 uppercase mt-0.5 block">{app.environment} • v{app.version}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[9px] text-white/40 uppercase block">Vol</span>
                  <span className="font-bold text-white">${(app.settlementVolume / 1000000).toFixed(2)}M</span>
                </div>
                <div className={`h-2 w-2 rounded-full ${
                  app.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel: Application Details & Actions (7 columns) */}
      <div className="lg:col-span-7">
        {selectedApp ? (
          <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 space-y-4">
            
            {/* Header profile info */}
            <div className="flex justify-between items-start border-b border-[#2a2a35]/40 pb-3">
              <div>
                <h3 className="text-xs font-black text-white uppercase">{selectedApp.displayName} Profile</h3>
                <p className="text-[9px] text-white/40 mt-1 uppercase">Client API Secret Invariant Key Registry</p>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${
                selectedApp.status === 'healthy' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {selectedApp.status === 'healthy' ? 'HEALTHY / ACTIVE' : 'RE-INDEXING'}
              </span>
            </div>

            {/* Secret key management */}
            <div className="bg-[#050508] p-3 border border-white/5 rounded space-y-2">
              <span className="text-[9px] text-white/30 uppercase block font-bold">API Security Secret Invariant</span>
              
              <div className="flex items-center gap-2 bg-[#0a0a14] border border-white/5 px-2.5 py-1.5 rounded">
                <Key className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[10px] text-white/70 font-mono grow break-all select-all">
                  {revealedSecrets[selectedApp.id] ? selectedApp.apiKey : '•'.repeat(24) + selectedApp.apiKey.slice(-6)}
                </span>
                <button
                  onClick={() => toggleRevealSecret(selectedApp.id)}
                  className="p-1 text-white/40 hover:text-white cursor-pointer"
                >
                  {revealedSecrets[selectedApp.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAppAction(selectedApp.id, 'ROTATE_KEYS')}
                  className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded text-[9px] font-bold uppercase cursor-pointer"
                >
                  Rotate Secret Key
                </button>
                <button
                  onClick={() => handleAppAction(selectedApp.id, 'RESTART_SERVICE')}
                  className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 rounded text-[9px] font-bold uppercase cursor-pointer"
                >
                  Reboot App Container
                </button>
              </div>
            </div>

            {/* Core telemetry details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#050508] p-3 border border-white/5 rounded space-y-1">
                <span className="text-[9px] text-white/40 block">Clearing Transactions</span>
                <span className="text-xs font-bold text-white">{selectedApp.transactions.toLocaleString()} txns</span>
              </div>
              <div className="bg-[#050508] p-3 border border-white/5 rounded space-y-1">
                <span className="text-[9px] text-white/40 block">Clearing Latency (P99)</span>
                <span className="text-xs font-bold text-emerald-400">{selectedApp.averageLatency} ms</span>
              </div>
              <div className="bg-[#050508] p-3 border border-white/5 rounded space-y-1">
                <span className="text-[9px] text-white/40 block">Inbound Error rate</span>
                <span className="text-xs font-bold text-rose-400">{(selectedApp.errorRate * 100).toFixed(2)}%</span>
              </div>
              <div className="bg-[#050508] p-3 border border-white/5 rounded space-y-1">
                <span className="text-[9px] text-white/40 block">Node Peerings</span>
                <span className="text-xs font-bold text-cyan-300">{selectedApp.nodeAssociations} validator peers</span>
              </div>
            </div>

            {/* In-place API inspection */}
            <div className="border border-[#1c1c24] rounded overflow-hidden">
              <button
                onClick={() => setInspectingAPI(inspectingAPI ? null : selectedApp.id)}
                className="w-full bg-[#0e0e14] hover:bg-[#14141f] px-3 py-2 border-b border-[#1c1c24] flex justify-between items-center text-[10px] text-white uppercase font-bold cursor-pointer"
              >
                <span>Inspect API Endpoints & Live Logs</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${inspectingAPI ? 'rotate-90' : ''}`} />
              </button>
              
              {inspectingAPI === selectedApp.id && (
                <div className="p-3 bg-[#050508] space-y-3 font-mono text-[10px]">
                  <div>
                    <span className="text-yellow-400 font-bold">GET /api/sovr/v1/ledger/extract</span>
                    <p className="text-white/40 mt-0.5">Response type: application/json • Authenticated with bearer key</p>
                  </div>
                  <div>
                    <span className="text-yellow-400 font-bold">POST /api/sovr/v1/evidence/receipt</span>
                    <p className="text-white/40 mt-0.5">Payload: {"{ amount: number, memo: string, target: string }"}</p>
                  </div>
                  
                  <div className="bg-black/50 border border-white/5 p-2 rounded text-green-300 font-mono text-[9px] space-y-1 max-h-[100px] overflow-y-auto">
                    <div>[INFO] - Incoming handshaking validation approved for endpoint</div>
                    <div>[INFO] - Cryptographic key alignment secure: SHA256 matches local db</div>
                    <div>[WARN] - Slow peer packet delivery warning triggered at Sydney relay</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-12 text-center text-white/30">
            Select a system connection profiles to begin auditing.
          </div>
        )}
      </div>

    </div>
  );
}
