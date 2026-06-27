import React, { useState, useEffect } from 'react';
import { 
  Network, ShieldAlert, Cpu, Radio, Key, CheckCircle2, AlertTriangle, 
  RefreshCw, Info, Landmark, Layers, HelpCircle, FileText, Database, 
  Mail, Users, Archive, HelpCircle as HelpIcon, Play
} from 'lucide-react';
import { motion } from 'motion/react';

interface Node {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  icon: any;
  defaultHealth: 'healthy' | 'degraded' | 'offline';
}

const GRAPH_NODES: Node[] = [
  { id: 'treasury', name: 'Treasury Core', role: 'Ledger Engine', x: 200, y: 40, icon: Landmark, defaultHealth: 'healthy' },
  
  { id: 'settlement', name: 'Settlement Rail', role: 'Orchestrator', x: 80, y: 120, icon: Layers, defaultHealth: 'healthy' },
  { id: 'evidence', name: 'Evidence Seal', role: 'Certs Generator', x: 200, y: 120, icon: FileText, defaultHealth: 'healthy' },
  { id: 'ai', name: 'AI Gate', role: 'Compliance Scanner', x: 320, y: 120, icon: Cpu, defaultHealth: 'healthy' },
  
  { id: 'stripe', name: 'Stripe Gateway', role: 'Payment Ingress', x: 80, y: 200, icon: Layers, defaultHealth: 'healthy' },
  { id: 'polygon', name: 'Polygon Network', role: 'L2 Blockchain', x: 200, y: 200, icon: Network, defaultHealth: 'healthy' },
  { id: 'openai', name: 'OpenAI Auditing', role: 'LLM Validator', x: 320, y: 200, icon: Cpu, defaultHealth: 'healthy' },
  
  { id: 'smtp', name: 'SMTP Gateway', role: 'Email Dispatch', x: 80, y: 280, icon: Mail, defaultHealth: 'healthy' },
  { id: 'storage', name: 'Object Store', role: 'Evidence Backups', x: 200, y: 280, icon: Database, defaultHealth: 'healthy' },
  { id: 'identity', name: 'Identity Prov.', role: 'User Auth Provider', x: 320, y: 280, icon: Users, defaultHealth: 'healthy' },
  
  { id: 'customer', name: 'Customer Alerts', role: 'SMS & UI Pushes', x: 80, y: 360, icon: Radio, defaultHealth: 'healthy' },
  { id: 'archive', name: 'Legal Archive', role: 'WORM Compliance', x: 200, y: 360, icon: Archive, defaultHealth: 'healthy' }
];

const GRAPH_EDGES = [
  { from: 'treasury', to: 'settlement' },
  { from: 'treasury', to: 'evidence' },
  { from: 'treasury', to: 'ai' },
  { from: 'settlement', to: 'stripe' },
  { from: 'evidence', to: 'polygon' },
  { from: 'ai', to: 'openai' },
  { from: 'stripe', to: 'smtp' },
  { from: 'polygon', to: 'storage' },
  { from: 'openai', to: 'identity' },
  { from: 'smtp', to: 'customer' },
  { from: 'storage', to: 'archive' }
];

// Downstream dependency mapping to calculate blast radius
const DOWNSTREAM_MAP: Record<string, string[]> = {
  treasury: ['settlement', 'evidence', 'ai', 'stripe', 'polygon', 'openai', 'smtp', 'storage', 'identity', 'customer', 'archive'],
  settlement: ['stripe', 'smtp', 'customer'],
  evidence: ['polygon', 'storage', 'archive'],
  ai: ['openai', 'identity'],
  stripe: ['smtp', 'customer'],
  polygon: ['storage', 'archive'],
  openai: ['identity'],
  smtp: ['customer'],
  storage: ['archive'],
  identity: [],
  customer: [],
  archive: []
};

// Immediate parents map to compute cascade outages
const PARENT_MAP: Record<string, string> = {
  settlement: 'treasury',
  evidence: 'treasury',
  ai: 'treasury',
  stripe: 'settlement',
  polygon: 'evidence',
  openai: 'ai',
  smtp: 'stripe',
  storage: 'polygon',
  identity: 'openai',
  customer: 'smtp',
  archive: 'storage'
};

export default function ServiceDependencyGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('stripe');
  
  // Custom interactive health overrides
  const [healthMap, setHealthMap] = useState<Record<string, 'healthy' | 'degraded' | 'offline'>>({
    treasury: 'healthy',
    settlement: 'healthy',
    evidence: 'healthy',
    ai: 'healthy',
    stripe: 'healthy',
    polygon: 'healthy',
    openai: 'healthy',
    smtp: 'healthy',
    storage: 'healthy',
    identity: 'healthy',
    customer: 'healthy',
    archive: 'healthy'
  });

  // Calculate final cascaded health for each node
  // If an ancestor is offline, child is offline. If ancestor is degraded, child is degraded.
  const resolveFinalHealth = (nodeId: string): 'healthy' | 'degraded' | 'offline' => {
    // Traverse parent tree to see if any ancestor has issues
    let currentId = nodeId;
    let worstHealth: 'healthy' | 'degraded' | 'offline' = healthMap[nodeId];

    while (PARENT_MAP[currentId]) {
      const parentId = PARENT_MAP[currentId];
      const parentHealth = healthMap[parentId];

      if (parentHealth === 'offline') {
        return 'offline'; // Complete outage takes absolute precedence
      }
      if (parentHealth === 'degraded' && worstHealth !== 'offline') {
        worstHealth = 'degraded';
      }
      currentId = parentId;
    }

    return worstHealth;
  };

  const blastRadius = DOWNSTREAM_MAP[selectedNodeId] || [];

  const updateNodeHealth = (nodeId: string, health: 'healthy' | 'degraded' | 'offline') => {
    setHealthMap(prev => ({
      ...prev,
      [nodeId]: health
    }));
  };

  const getHealthColor = (state: 'healthy' | 'degraded' | 'offline') => {
    switch (state) {
      case 'healthy': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
      case 'degraded': return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
      case 'offline': return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
    }
  };

  const getStatusBadge = (state: 'healthy' | 'degraded' | 'offline') => {
    switch (state) {
      case 'healthy': return <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">HEALTHY</span>;
      case 'degraded': return <span className="text-[9px] bg-amber-950/40 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black">DEGRADED</span>;
      case 'offline': return <span className="text-[9px] bg-rose-950/40 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-black">OFFLINE</span>;
    }
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-[#2a2a35]/40 pb-3">
        <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          Interactive System Topology & Blast Radius Simulator
        </h3>
        <p className="text-[9px] text-white/40 block mt-0.5 uppercase">
          Evaluate downstream cascading impacts of regional and vendor connectivity outages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: SVG Graph Canvas (7 columns) */}
        <div className="lg:col-span-7 bg-[#050508]/80 border border-white/5 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[440px]">
          {/* Legend */}
          <div className="absolute top-3 left-3 bg-black/40 border border-white/5 rounded p-2 text-[8px] font-mono space-y-1 z-10">
            <span className="text-white/40 uppercase font-black tracking-wide block border-b border-white/5 pb-1">Legend</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operational
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Jitter / Latency
            </div>
            <div className="flex items-center gap-1.5 text-rose-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Critical Block
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]" /> Focus Target
            </div>
          </div>

          {/* SVG canvas */}
          <svg viewBox="0 0 400 420" className="w-full max-w-[400px] h-auto font-mono select-none overflow-visible">
            {/* Draw edge paths */}
            {GRAPH_EDGES.map((edge, idx) => {
              const fromNode = GRAPH_NODES.find(n => n.id === edge.from)!;
              const toNode = GRAPH_NODES.find(n => n.id === edge.to)!;
              
              // Resolve parent-child cascaded health
              const fromHealth = resolveFinalHealth(edge.from);
              const toHealth = resolveFinalHealth(edge.to);

              const isBlastRadius = selectedNodeId === edge.from || blastRadius.includes(edge.from);
              
              let lineColor = 'stroke-[#2a2a35]';
              let dashArray = '0';
              let pulseColor = 'rgba(255, 255, 255, 0.15)';

              if (fromHealth === 'offline' || toHealth === 'offline') {
                lineColor = 'stroke-rose-600';
                dashArray = '3,3';
                pulseColor = '#ef4444';
              } else if (fromHealth === 'degraded' || toHealth === 'degraded') {
                lineColor = 'stroke-amber-500';
                dashArray = '5,2';
                pulseColor = '#f59e0b';
              } else if (isBlastRadius) {
                lineColor = 'stroke-cyan-500/60';
                pulseColor = '#22d3ee';
              }

              return (
                <g key={`edge-${idx}`}>
                  {/* Outer line */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    className={`${lineColor} transition-all duration-300`}
                    strokeWidth={isBlastRadius ? "2" : "1.5"}
                    strokeDasharray={dashArray}
                  />

                  {/* Pulsing signal dot along the line if healthy/degraded */}
                  {fromHealth !== 'offline' && (
                    <circle r="2.5" fill={pulseColor} className="shadow-[0_0_4px_currentColor]">
                      <animateMotion
                        path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                        dur={`${fromHealth === 'degraded' ? '4s' : '2s'}`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Draw nodes */}
            {GRAPH_NODES.map((node) => {
              const IconComponent = node.icon;
              const resolvedHealth = resolveFinalHealth(node.id);
              
              const isSelected = selectedNodeId === node.id;
              const isAffectedInRadius = blastRadius.includes(node.id);
              
              let ringColor = 'stroke-[#2a2a35]';
              let fillBg = 'fill-[#050508]';
              let iconColor = 'text-white/40';

              if (resolvedHealth === 'healthy') {
                ringColor = isSelected ? 'stroke-cyan-400' : 'stroke-emerald-500/40';
                iconColor = 'text-emerald-400';
              } else if (resolvedHealth === 'degraded') {
                ringColor = isSelected ? 'stroke-cyan-400' : 'stroke-amber-500';
                iconColor = 'text-amber-400';
              } else if (resolvedHealth === 'offline') {
                ringColor = isSelected ? 'stroke-cyan-400' : 'stroke-rose-600';
                iconColor = 'text-rose-500';
              }

              // Highlight outline if selected
              const nodeGlow = isSelected 
                ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
                : isAffectedInRadius 
                  ? 'drop-shadow-[0_0_4px_rgba(244,63,94,0.15)]' 
                  : '';

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  className={`cursor-pointer group ${nodeGlow} transition-all duration-300`}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {/* Pulse Ring */}
                  {resolvedHealth === 'healthy' && !isSelected && (
                    <circle
                      r="16"
                      fill="none"
                      className="stroke-emerald-400/20"
                      strokeWidth="1"
                    >
                      <animate attributeName="r" values="14;22;14" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Node Base Circle */}
                  <circle
                    r="14"
                    className={`${fillBg} ${ringColor} transition-all duration-300`}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                  />

                  {/* Focus circle if selected */}
                  {isSelected && (
                    <circle
                      r="18"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1"
                      strokeDasharray="4,2"
                      className="animate-spin"
                      style={{ transformOrigin: 'center', animationDuration: '10s' }}
                    />
                  )}

                  {/* Render Lucide Icon */}
                  <g transform="translate(-6.5, -6.5)">
                    <foreignObject width="13" height="13">
                      <div className={`${iconColor} select-none pointer-events-none`}>
                        <IconComponent className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </foreignObject>
                  </g>

                  {/* Node Label */}
                  <text
                    y="25"
                    textAnchor="middle"
                    fill={isSelected ? '#22d3ee' : isAffectedInRadius ? '#f43f5e' : '#ffffff'}
                    className="text-[8px] font-black tracking-wide uppercase transition-colors"
                  >
                    {node.name}
                  </text>
                  <text
                    y="34"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.3)"
                    className="text-[6.5px] tracking-widest font-normal uppercase"
                  >
                    {node.role}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right column: Diagnostics & Blast Radius Console (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {(() => {
            const activeNode = GRAPH_NODES.find(n => n.id === selectedNodeId)!;
            const originalHealth = healthMap[selectedNodeId];
            const computedHealth = resolveFinalHealth(selectedNodeId);
            const parentId = PARENT_MAP[selectedNodeId];
            const isCascaded = originalHealth === 'healthy' && computedHealth !== 'healthy';

            return (
              <div className="bg-[#0c0c14] border border-white/5 rounded-lg p-4 space-y-4 h-full flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  {/* Target Node Title */}
                  <div className="border-b border-white/5 pb-2 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[8px] text-cyan-400 uppercase font-black tracking-widest block">DIAGNOSTICS & TELEMETRY</span>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider mt-0.5">{activeNode.name}</h4>
                    </div>
                    {getStatusBadge(computedHealth)}
                  </div>

                  {/* Service status descriptor */}
                  <div className="space-y-2 text-[9px] font-mono text-white/80">
                    <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                      <span className="text-white/40">Algebraic Class:</span>
                      <span className="font-extrabold text-white">{activeNode.role}</span>
                    </div>

                    <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                      <span className="text-white/40">Configured State:</span>
                      <span className="font-extrabold text-cyan-400 capitalize">{originalHealth}</span>
                    </div>

                    <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                      <span className="text-white/40">Resolved Runtime Health:</span>
                      <span className={`font-extrabold capitalize ${
                        computedHealth === 'healthy' ? 'text-emerald-400' : computedHealth === 'degraded' ? 'text-amber-400' : 'text-rose-400'
                      }`}>{computedHealth} {isCascaded && '(Upstream Failover)'}</span>
                    </div>

                    {parentId && (
                      <div className="flex justify-between p-1.5 bg-black/40 border border-white/5 rounded">
                        <span className="text-white/40">Upstream Dependency:</span>
                        <span className="font-extrabold text-amber-500 uppercase">{GRAPH_NODES.find(n => n.id === parentId)?.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Status Changer (CRITICAL requirement!) */}
                  <div className="border border-white/5 bg-black/35 rounded p-3 space-y-2">
                    <span className="text-[8.5px] text-white/40 font-black uppercase tracking-wider block">
                      Trigger Simulated Node State
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-[8px] font-bold">
                      <button
                        onClick={() => updateNodeHealth(selectedNodeId, 'healthy')}
                        className={`py-1.5 rounded border uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          originalHealth === 'healthy'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-black/40 border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Healthy
                      </button>

                      <button
                        onClick={() => updateNodeHealth(selectedNodeId, 'degraded')}
                        className={`py-1.5 rounded border uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          originalHealth === 'degraded'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-black/40 border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Degraded
                      </button>

                      <button
                        onClick={() => updateNodeHealth(selectedNodeId, 'offline')}
                        className={`py-1.5 rounded border uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          originalHealth === 'offline'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                            : 'bg-black/40 border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Offline
                      </button>
                    </div>
                  </div>

                  {/* Blast Radius Assessment */}
                  <div className="border border-white/5 bg-black/30 rounded p-3 space-y-2">
                    <span className="text-[8.5px] text-[#f43f5e] font-black uppercase tracking-wider block flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                      Calculated Outage Blast Radius
                    </span>
                    
                    {blastRadius.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-[8.5px] text-white/50 leading-relaxed">
                          A degradation of <span className="text-white font-extrabold">{activeNode.name}</span> instantly cascades down and affects the following <span className="text-rose-400 font-extrabold">{blastRadius.length} downstream components</span>:
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {blastRadius.map(nodeId => {
                            const name = GRAPH_NODES.find(n => n.id === nodeId)?.name || nodeId;
                            return (
                              <span 
                                key={nodeId} 
                                className="text-[7.5px] bg-rose-950/30 border border-rose-500/20 px-2 py-0.5 rounded text-rose-300 font-black uppercase font-mono"
                              >
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[8.5px] text-emerald-400/80 leading-relaxed font-bold">
                        ✓ Leaf node: Zero downstream components. Outages on this node are fully isolated from the wider SOVR fabric.
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer security log */}
                <div className="bg-[#12121a]/60 border border-white/5 p-2 rounded text-[8.5px] text-white/40 leading-normal flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    Simulated health toggles demonstrate active blast-radius risk calculations. Under load, the control plane will trigger real alerts and bypass broken nodes using Dynamic Pipeline failover.
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
