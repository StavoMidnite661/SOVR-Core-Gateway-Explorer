import React, { useState } from 'react';
import { ConnectedApp } from '../types';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronUp, Radio, AlertTriangle } from 'lucide-react';

interface ConnectedAppsListProps {
  apps: ConnectedApp[];
  isPaused: boolean;
}

export default function ConnectedAppsList({ apps, isPaused }: ConnectedAppsListProps) {
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  // Dynamic icon resolver from Lucide
  const renderAppIcon = (iconName: string, tintColor: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    return (
      <div 
        className="p-2.5 rounded border flex items-center justify-center flex-shrink-0"
        style={{ 
          backgroundColor: `${tintColor}10`, 
          borderColor: `${tintColor}25` 
        }}
      >
        <IconComponent className="w-4 h-4" style={{ color: tintColor }} />
      </div>
    );
  };

  const getHealthBadgeStyle = (app: ConnectedApp) => {
    if (isPaused) {
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
    switch (app.health) {
      case 'healthy': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'degraded': return 'bg-amber-500/10 text-amber-400 border border-amber-500/10';
      case 'offline': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  // Pre-configured rich description / details mapping for seeded integrations
  const getSimulatedDetails = (app: ConnectedApp) => {
    switch (app.slug) {
      case 'unifiedpay-hub':
        return {
          description: 'Settlement bridge for merchant retail operations processing high-volume credit captures.',
          endpoint: 'api.unifiedpay.io/v1/settlements',
          auth: 'OAuth2 Client Credentials',
          version: '2.4.1',
          recentEvents: ['Settlement Posted', 'Escrow Released', 'Credit Card Captured'],
          errorHistory: ['00:15:20 - Handshake Success', '03:42:15 - Keepalive Retransmit'],
          healthLogs: ['Database transaction log verified', 'No outstanding queue lag detected'],
        };
      case 'rork-sovr-bridge':
        return {
          description: 'Cross-chain settlement oracle connecting secure peripheral sovereign currencies.',
          endpoint: 'bridge-core.sovr.net/api/v3',
          auth: 'Sovereign Proof Signature',
          version: '1.9.0',
          recentEvents: ['Secured Collateral Checked', 'Sovereign MInt Triggered', 'Gas Pool Rebalanced'],
          errorHistory: ['08:21:40 - Router updated', '19:10:05 - Authority seal signed'],
          healthLogs: ['Validator agreement: 100%', 'Consensus consensus authority #3 authenticated'],
        };
      case 'basalt-console':
        return {
          description: 'High-availability read/write storage console auditing general transaction state trees.',
          endpoint: 'db.basalt-sovr.local:5432/core',
          auth: 'Mutual TLS Certificates',
          version: '0.7.2',
          recentEvents: ['Block Merkle Audited', 'Root Hash Saved', 'System Checkpoint Completed'],
          errorHistory: ['Yesterday - Integrity verify pass'],
          healthLogs: ['Durable storage write speed 0.3ms', 'Mirror node sync ok'],
        };
      case 'vendor-oracle':
        return {
          description: 'External price and settlement feed evaluating vendor currency ratios.',
          endpoint: 'oracle-feed.external.vendor/v1',
          auth: 'Private API Key',
          version: '1.2.0',
          recentEvents: ['Oracle Price Pushed', 'Spread Integrity Evaluated', 'Escrow Account Checked'],
          errorHistory: ['05:12:12 - HTTP 504 Timeout Retried', '11:15:30 - Jitter spike resolved'],
          healthLogs: ['External price delta: 0.02%', 'Timeout recovery system alive'],
        };
      case 'audit-witness':
        return {
          description: 'Automatic compliance machine generating automated block seals and regulatory witness reports.',
          endpoint: 'audit.witness.sovr:9000/report',
          auth: 'Sovereign Proof Signature',
          version: '1.0.4',
          recentEvents: ['Witness Verified', 'Seal Proof Attested', 'Compliance Logs Filed'],
          errorHistory: ['No logged faults inside current epoch'],
          healthLogs: ['Automatic PoA signature verified', 'Zero compliance alerts'],
        };
      case 'treasury-ops':
        return {
          description: 'Internal treasury Operations managing sovereign asset liquidity pool ratios.',
          endpoint: 'ops.treasury-sovr.internal/v2',
          auth: 'Mutual TLS Certificates',
          version: '3.1.0',
          recentEvents: ['Treasury Mint Approved', 'Collateral Pool Balanced', 'Liquidity Disbursed'],
          errorHistory: ['None - Internally routed'],
          healthLogs: ['Treasury invariant verified', 'Federal reserve bridge connected'],
        };
      default:
        return {
          description: app.description || 'Custom corporate gateway client registered and active.',
          endpoint: app.endpoint || 'api.custom-gateway.local/v1',
          auth: app.auth || 'OAuth2 Handshake',
          version: app.version || '1.0.0',
          recentEvents: ['Service Registered', 'Handshake Accepted', 'Channel Initialized'],
          errorHistory: ['Handshake handshake verified'],
          healthLogs: ['Integrated into Core Settlement Engine'],
        };
    }
  };

  return (
    <div id="connected-apps-container" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 backdrop-blur-md">
      <div className="mb-4">
        <h2 id="apps-panel-title" className="text-xs font-black uppercase tracking-widest text-white/90 font-display flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          Active API Clients & Integrations
        </h2>
        <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider mt-1">Live WebSocket heartbeats from authorized peripheral gateway servers</p>
      </div>

      {/* Horizontal Virtual Scrolling Grid allowing smooth scrolling of 50+ clients without wrapping */}
      <div 
        id="apps-grid-viewport" 
        className="flex gap-4 overflow-x-auto pb-4 select-text snap-x scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {apps.map((app) => {
          const isExpanded = expandedAppId === app.id;
          const detail = getSimulatedDetails(app);

          return (
            <div
              key={app.id}
              id={`app-node-card-${app.id}`}
              className={`bg-[#101015] border rounded-sm flex-shrink-0 w-[305px] select-text transition-all duration-300 ${
                isExpanded ? 'border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/10' : 'border-white/5 hover:border-white/15'
              }`}
            >
              {/* Card top summary row */}
              <div 
                className="p-4 cursor-pointer select-none" 
                onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {renderAppIcon(app.icon, app.tint)}
                    <div>
                      <h3 className="text-xs font-semibold text-[#e0e0e0] leading-none mb-1">{app.displayName}</h3>
                      <span className="font-mono text-[9px] text-[#ffffff]/30 block tracking-tight">SLUG: {app.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-sm ${getHealthBadgeStyle(app)}`}>
                      {isPaused ? 'PAUSED' : app.health}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-[#2a2a35]/40 pt-3 text-xs">
                  <div>
                    <span className="text-[#ffffff]/40 text-[9px] uppercase font-mono block">Active Workers</span>
                    <span className="font-mono font-medium text-white/80 block mt-0.5">
                      {isPaused ? '0' : app.activeSessions.toLocaleString()}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-[#ffffff]/40 text-[9px] uppercase font-mono block">Velocity rate</span>
                    <span className="font-mono font-medium text-indigo-400 block mt-0.5">
                      {isPaused ? '0.0' : app.txnPerMin.toFixed(1)} tx/m
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900 text-[9px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-rose-500' : (app.health === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')}`} />
                    HB: {isPaused ? 'OFFLINE' : new Date(app.lastHeartbeat).toLocaleTimeString()}
                  </span>
                  <span>VER: {app.version}</span>
                </div>
              </div>

              {/* Expansion downward drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#2a2a35]/50 bg-[#07070b] pt-3 text-[10px] space-y-3 font-mono animate-fadeIn">
                  <div>
                    <span className="text-[9px] text-white/30 uppercase block font-bold">Service Description</span>
                    <p className="text-white/70 text-[10.5px] font-sans mt-0.5 leading-normal font-light">
                      {detail.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-white/30 uppercase block font-bold">Endpoint Target</span>
                      <span className="text-cyan-400 text-[9.5px] block truncate" title={detail.endpoint}>
                        {detail.endpoint}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/30 uppercase block font-bold">Authentication</span>
                      <span className="text-white/60 text-[9.5px] block truncate">
                        {detail.auth}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-[#2a2a35]/30">
                    <div>
                      <span className="text-[8.5px] text-white/30 uppercase block font-bold">Sync Age</span>
                      <span className="text-white/80 block">
                        {isPaused ? 'OFFLINE' : '2 sec ago'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-white/30 uppercase block font-bold">Allocated</span>
                      <span className="text-indigo-400 block">
                        {isPaused ? '0' : app.activeSessions + 236} nodes
                      </span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-white/30 uppercase block font-bold">Throughput</span>
                      <span className="text-emerald-400 block">
                        {isPaused ? '0.0' : (app.txnPerMin * 1.5).toFixed(1)} t/m
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-white/30 uppercase block font-bold mb-1">Recent Events Trace</span>
                    <div className="space-y-1">
                      {detail.recentEvents.map((evt, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-white/70">
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span>{evt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1 border-t border-[#2a2a35]/20">
                    <div>
                      <span className="text-[9px] text-white/30 uppercase block font-bold">Error history / Faults</span>
                      <span className="text-rose-400 block text-[9px] bg-rose-500/[0.04] px-1 py-0.5 rounded-sm">
                        {isPaused ? 'ENGINE_SUSPENDED_QUEUE_LOCKED' : detail.errorHistory[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/30 uppercase block font-bold">Health Logs</span>
                      <span className="text-emerald-400 block text-[9px] bg-emerald-500/[0.04] px-1 py-0.5 rounded-sm">
                        {isPaused ? 'READ_ONLY_MODE_OK' : detail.healthLogs[0]}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

