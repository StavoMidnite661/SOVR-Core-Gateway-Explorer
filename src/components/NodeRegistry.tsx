import React, { useState, useEffect } from 'react';
import { 
  Server, Cpu, Database, Activity, Plus, RefreshCw, Trash2, 
  AlertTriangle, ShieldCheck, CheckCircle, ArrowRightLeft, Radio, Globe, Search
} from 'lucide-react';

interface Node {
  id: string;
  name: string;
  role: string;
  region: string;
  status: 'ONLINE' | 'WARNING' | 'DEGRADED';
  heartbeat: string;
  applications: string[];
  connections: number;
  assetsRouted: string;
  riskScore: string;
  cpu: number;
  ram: number;
  queueDepth: number;
  throughput: number;
  latency: number;
  activeSessions: number;
  verified: boolean;
}

const INITIAL_NODES: Node[] = [
  {
    id: 'NY_LC',
    name: 'NY Ledger Core',
    role: 'Ledger Settlement Host',
    region: 'North America',
    status: 'ONLINE',
    heartbeat: '0.9s ago',
    applications: ['UnifiedPay Hub', 'SOVR Bridge'],
    connections: 12,
    assetsRouted: '12.5M SVT',
    riskScore: 'Low (0.01%)',
    cpu: 24,
    ram: 42,
    queueDepth: 1,
    throughput: 420,
    latency: 12,
    activeSessions: 182,
    verified: true
  },
  {
    id: 'LDN_R',
    name: 'London Routing',
    role: 'Consensus Coordinator',
    region: 'Western Europe',
    status: 'ONLINE',
    heartbeat: '0.4s ago',
    applications: ['UnifiedPay Hub', 'Basalt Console'],
    connections: 8,
    assetsRouted: '8.4M SVT',
    riskScore: 'Low (0.02%)',
    cpu: 18,
    ram: 37,
    queueDepth: 0,
    throughput: 310,
    latency: 15,
    activeSessions: 94,
    verified: true
  },
  {
    id: 'ZRH_T',
    name: 'Zurich Treasury',
    role: 'SOVR Vault Agent',
    region: 'Central Europe',
    status: 'ONLINE',
    heartbeat: '1.1s ago',
    applications: ['Basalt Console'],
    connections: 6,
    assetsRouted: '19.1M SVT',
    riskScore: 'Low (0.00%)',
    cpu: 31,
    ram: 50,
    queueDepth: 2,
    throughput: 550,
    latency: 16,
    activeSessions: 112,
    verified: true
  },
  {
    id: 'SGP_G',
    name: 'Singapore Gate',
    role: 'Asynchronous Gateway',
    region: 'Southeast Asia',
    status: 'ONLINE',
    heartbeat: '1.7s ago',
    applications: ['UnifiedPay Hub', 'SOVR Bridge', 'Basalt Console'],
    connections: 15,
    assetsRouted: '31.2M SVT',
    riskScore: 'Low (0.04%)',
    cpu: 48,
    ram: 58,
    queueDepth: 4,
    throughput: 890,
    latency: 32,
    activeSessions: 245,
    verified: true
  },
  {
    id: 'TYO_C',
    name: 'Tokyo Consensus',
    role: 'Witness Notary Node',
    region: 'East Asia',
    status: 'ONLINE',
    heartbeat: '0.6s ago',
    applications: ['SOVR Bridge'],
    connections: 5,
    assetsRouted: '5.1M SVT',
    riskScore: 'Low (0.01%)',
    cpu: 14,
    ram: 29,
    queueDepth: 0,
    throughput: 180,
    latency: 41,
    activeSessions: 62,
    verified: true
  }
];

export default function NodeRegistry() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Node form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeRole, setNewNodeRole] = useState('Consensus Validator');
  const [newNodeRegion, setNewNodeRegion] = useState('North America');
  const [newNodeId, setNewNodeId] = useState('');

  // Load transferring state
  const [transferringId, setTransferringId] = useState<string | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('LDN_R');

  // Load nodes from backend
  const fetchNodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/nodes');
      const data = await res.json();
      if (data.success) {
        setNodes(data.nodes);
      } else {
        throw new Error(data.error || 'Failed to load nodes.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching nodes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleAction = async (nodeId: string, action: 'DISABLE' | 'DRAIN' | 'ENABLE' | 'TRANSFER_LOAD' | 'ADD', params?: any) => {
    try {
      const res = await fetch('/api/nodes/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, action, params })
      });
      const data = await res.json();
      if (data.success) {
        setNodes(data.nodes);
        setTransferringId(null);
        setShowAddForm(false);
        setNewNodeName('');
        setNewNodeId('');
      } else {
        alert('Action failed: ' + data.error);
      }
    } catch (err: any) {
      alert('Error triggering action: ' + err.message);
    }
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    const cleanId = newNodeId.trim() || 'NODE_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    handleAction(cleanId, 'ADD', {
      id: cleanId,
      name: newNodeName,
      role: newNodeRole,
      region: newNodeRegion,
      applications: ['UnifiedPay Hub'],
      connections: 6
    });
  };

  return (
    <div id="global-node-registry" className="space-y-6 font-mono text-xs">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-[#2a2a35]/65 pb-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Global Node Registry
          </h2>
          <p className="text-[10px] text-white/40 mt-1 uppercase">DISTRIBUTED NOTARY NODES, VALIDATORS AND REGIONAL COMMUNICATORS</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNodes}
            className="p-1.5 bg-[#0e0e14] border border-[#2a2a35] rounded text-white/60 hover:text-white hover:bg-[#14141e] cursor-pointer"
            title="Refresh Nodes State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-400 hover:to-orange-400 text-white rounded font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Provision Node
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white/40" />
        </div>
        <input
          type="text"
          placeholder="Search by name, region, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0e0e14] border border-[#2a2a35] rounded py-2 pl-9 pr-3 text-white text-xs focus:outline-none focus:border-cyan-400 placeholder:text-white/30"
        />
      </div>

      {/* Add Node Form */}
      {showAddForm && (
        <form onSubmit={handleAddNode} className="p-4 bg-[#0e0e14] border border-[#2a2a35] rounded-lg space-y-3">
          <h3 className="text-xs font-bold uppercase text-white">Provision New Sovereign Node</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase block">Node ID (e.g. SYD_V)</label>
              <input 
                type="text" 
                value={newNodeId} 
                onChange={e => setNewNodeId(e.target.value)}
                placeholder="SYD_V" 
                className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase block">Node Name</label>
              <input 
                type="text" 
                required
                value={newNodeName} 
                onChange={e => setNewNodeName(e.target.value)}
                placeholder="Sydney Notary" 
                className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase block">Role</label>
              <select 
                value={newNodeRole} 
                onChange={e => setNewNodeRole(e.target.value)}
                className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none"
              >
                <option value="Consensus Validator">Consensus Validator</option>
                <option value="Liquidity Router">Liquidity Router</option>
                <option value="Asynchronous Gateway">Asynchronous Gateway</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase block">Geographic Region</label>
              <select 
                value={newNodeRegion} 
                onChange={e => setNewNodeRegion(e.target.value)}
                className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none"
              >
                <option value="North America">North America</option>
                <option value="Western Europe">Western Europe</option>
                <option value="Central Europe">Central Europe</option>
                <option value="Southeast Asia">Southeast Asia</option>
                <option value="East Asia">East Asia</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-3 py-1 bg-[#14141e] border border-[#2a2a35] text-white/60 hover:text-white rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
            >
              Provision Node
            </button>
          </div>
        </form>
      )}

      {/* Nodes list Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {nodes
          .filter(node => 
            node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.status.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(node => (
          <div 
            key={node.id} 
            className={`border rounded-lg bg-[#08080c] p-4 flex flex-col justify-between space-y-3 transition-all ${
              node.status === 'ONLINE' 
                ? 'border-[#2a2a35]/60 hover:border-cyan-500/30' 
                : node.status === 'WARNING' 
                  ? 'border-amber-500/30' 
                  : 'border-rose-500/30'
            }`}
          >
            {/* Header block */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-white uppercase block">{node.name}</span>
                <span className="text-[8px] text-white/40 uppercase font-mono mt-0.5 block">{node.role} • {node.region}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  node.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' :
                  node.status === 'WARNING' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
                <span className={`text-[8.5px] font-bold ${
                  node.status === 'ONLINE' ? 'text-emerald-400' :
                  node.status === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                }`}>{node.status}</span>
              </div>
            </div>

            {/* Metrics Twin block */}
            <div className="bg-[#050508] border border-white/5 rounded p-2.5 space-y-2">
              <span className="text-[8px] text-white/30 uppercase tracking-widest block font-bold">Digital Twin Real-Time Metrics</span>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-white/40">CPU Load:</span>
                  <span className="text-white font-bold">{node.cpu}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Memory usage:</span>
                  <span className="text-white font-bold">{node.ram}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Queue depth:</span>
                  <span className={node.queueDepth > 0 ? 'text-amber-400' : 'text-white/60'}>{node.queueDepth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Throughput:</span>
                  <span className="text-cyan-400 font-bold">{node.throughput} tps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Latency:</span>
                  <span className="text-emerald-400">{node.latency} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Peer count:</span>
                  <span className="text-white">{node.connections}</span>
                </div>
              </div>

              {/* Progress bars for CPU / Memory */}
              <div className="space-y-1.5 pt-1 border-t border-white/5 mt-1.5">
                <div className="flex items-center justify-between text-[8px] text-white/40">
                  <span>CPU INVARIANT</span>
                  <span>{node.cpu}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${node.cpu}%` }} />
                </div>
              </div>
            </div>

            {/* Operations section */}
            <div className="space-y-2 pt-1 border-t border-[#1c1c24]">
              <span className="text-[8px] text-white/30 uppercase block font-bold">Node Operations Panel</span>
              
              <div className="flex flex-wrap gap-1">
                {node.status === 'ONLINE' ? (
                  <>
                    <button
                      onClick={() => handleAction(node.id, 'DISABLE')}
                      className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
                    >
                      Disable Node
                    </button>
                    <button
                      onClick={() => handleAction(node.id, 'DRAIN')}
                      className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
                    >
                      Drain Traffic
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAction(node.id, 'ENABLE')}
                    className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Enable / Re-peer Node
                  </button>
                )}

                <button
                  onClick={() => setTransferringId(node.id)}
                  className="px-2 py-1 bg-[#14141e] border border-[#2a2a35] text-white hover:bg-[#1c1c2b] rounded text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                  Load Balance
                </button>
              </div>

              {/* Load transfer selector */}
              {transferringId === node.id && (
                <div className="p-2 bg-[#0c0c12] border border-[#2a2a35] rounded space-y-1.5 mt-2">
                  <span className="text-[8px] text-white/40 uppercase block">Transfer Load Target</span>
                  <div className="flex gap-1">
                    <select
                      value={transferTargetId}
                      onChange={e => setTransferTargetId(e.target.value)}
                      className="bg-[#050508] border border-[#2a2a35] text-white text-[9px] p-1 rounded"
                    >
                      {nodes.filter(n => n.id !== node.id).map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAction(node.id, 'TRANSFER_LOAD', { targetNodeId: transferTargetId })}
                      className="px-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-bold uppercase rounded cursor-pointer"
                    >
                      Route
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
