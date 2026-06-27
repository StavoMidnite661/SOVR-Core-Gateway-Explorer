import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, Cpu, Radio, Activity, Key, Workflow, Sparkles, Network,
  PlusCircle, CheckCircle2, AlertTriangle, ShieldAlert, Eye, EyeOff,
  Trash2, ArrowRight, RefreshCw, Send, Database, Lock, Unlock,
  Search, Check, Globe, ChevronRight, Layers, Plus, Info, Zap, Code, Play
} from 'lucide-react';
import { ConnectedApp } from '../types';
import { 
  INITIAL_ENDPOINTS, INITIAL_WEBHOOKS, INITIAL_SECRETS, 
  INITIAL_CONNECTORS, INITIAL_WORKFLOWS, GatewayEndpoint, 
  GatewayWebhook, GatewaySecret, GatewayConnector, WorkflowPipeline 
} from '../data/gatewayData';
import ServiceDependencyGraph from './ServiceDependencyGraph';
import { motion, AnimatePresence } from 'motion/react';

interface GatewayFabricProps {
  apps: ConnectedApp[];
  setApps: React.Dispatch<React.SetStateAction<ConnectedApp[]>>;
}

interface EventLog {
  timestamp: string;
  event: string;
  source: string;
  status: 'info' | 'success' | 'warn' | 'error';
  payload: string;
}

export default function GatewayFabric({ apps, setApps }: GatewayFabricProps) {
  // Navigation tabs within Gateway Fabric
  const [activeWorkspace, setActiveWorkspace] = useState<string>('registry');

  // Dynamic Workspace States
  const [endpoints, setEndpoints] = useState<GatewayEndpoint[]>(INITIAL_ENDPOINTS);
  const [webhooks, setWebhooks] = useState<GatewayWebhook[]>(INITIAL_WEBHOOKS);
  const [secrets, setSecrets] = useState<GatewaySecret[]>(INITIAL_SECRETS);
  const [connectors, setConnectors] = useState<GatewayConnector[]>(INITIAL_CONNECTORS);
  const [workflows, setWorkflows] = useState<WorkflowPipeline[]>(INITIAL_WORKFLOWS);

  // Inspector & Selection States
  const [selectedAppId, setSelectedAppId] = useState<string | null>(apps[0]?.id || 'app_unifiedpay');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('ep_settlement');
  const [selectedWebhookId, setSelectedWebhookId] = useState<string>('wh_settle_comp');
  const [selectedSecretId, setSelectedSecretId] = useState<string>('sec_oauth');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('wf_settle');

  // Live Action States
  const [isRotatingSecret, setIsRotatingSecret] = useState<string | null>(null);
  const [isTestingEndpoint, setIsTestingEndpoint] = useState<string | null>(null);
  const [endpointResponsePayload, setEndpointResponsePayload] = useState<string | null>(null);
  
  // Custom Webhook Firing
  const [isFiringWebhook, setIsFiringWebhook] = useState<string | null>(null);
  const [webhookFireResult, setWebhookFireResult] = useState<string | null>(null);

  // Installer Drawer
  const [selectedConnectorForInstall, setSelectedConnectorForInstall] = useState<GatewayConnector | null>(null);
  const [installApiKey, setInstallApiKey] = useState<string>('');
  const [installEndpoint, setInstallEndpoint] = useState<string>('');
  const [installEnvironment, setInstallEnvironment] = useState<'production' | 'sandbox'>('sandbox');
  const [isInstalling, setIsInstalling] = useState(false);

  // Custom Service Discovery JSON input
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [discoveryJson, setDiscoveryJson] = useState<string>(`{
  "serviceId": "svc-unifiedpay",
  "displayName": "UnifiedPay Hub",
  "type": "Settlement Bridge",
  "version": "2.4.1",
  "status": "healthy",
  "baseUrl": "https://api.unifiedpay.io",
  "authentication": {
    "scheme": "OAuth2 Client Credentials"
  },
  "capabilities": [
    "settlement",
    "balance_lookup",
    "webhooks"
  ],
  "health": {
    "heartbeat": "2026-06-26T12:28:05Z",
    "latencyMs": 42
  }
}`);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [discoverySuccess, setDiscoverySuccess] = useState(false);

  // Live Event Bus Feed (Pub/Sub)
  const [liveEvents, setLiveEvents] = useState<EventLog[]>([
    { timestamp: '00:28:01', event: 'journal.posted', source: 'Treasury Controller', status: 'success', payload: '{"debit":"acc_asset_reserves","credit":"acc_liability_deposits","amountMinor":12000000}' },
    { timestamp: '00:28:02', event: 'receipt.generated', source: 'SVT Receipt Engine', status: 'success', payload: '{"receiptNo":"SVT-REC-48910","sealed":true,"height":1428}' },
    { timestamp: '00:28:02', event: 'certificate.generated', source: 'Evidence Certificate Oracle', status: 'info', payload: '{"hash":"2c9a...3f","merkleRoot":"9f1e...4a","signatures":["ed25519:..."]}' },
    { timestamp: '00:28:03', event: 'package.created', source: 'Durable Archive System', status: 'success', payload: '{"packageId":"pkg_8412","compressRatio":0.72}' },
    { timestamp: '00:28:04', event: 'webhook.sent', source: 'Webhook Delivery Agent', status: 'success', payload: '{"endpoint":"https://api.unifiedpay.io","status":200,"retries":0}' }
  ]);

  // Periodic simulated live events to keep the Event Bus moving!
  useEffect(() => {
    const eventTemplates = [
      { event: 'journal.posted', source: 'Treasury Core', status: 'success' as const, payload: '{"debit":"acc_liq_pool","credit":"acc_cust_ledger","amountMinor":450000}' },
      { event: 'receipt.generated', source: 'SVT Receipt Engine', status: 'success' as const, payload: '{"receiptNo":"SVT-REC-50122","sealed":true,"height":1429}' },
      { event: 'webhook.sent', source: 'Webhook Dispatcher', status: 'success' as const, payload: '{"endpoint":"https://api.stripe.com/v1/payouts","status":200}' },
      { event: 'node.online', source: 'Validator Consensus NY', status: 'info' as const, payload: '{"nodeId":"NY_LC","heartbeatMs":12}' },
      { event: 'system.reconfigured', source: 'Admin Console', status: 'warn' as const, payload: '{"parameter":"p99_latency_threshold_ms","prev":250,"next":180}' },
      { event: 'app.key_rotated', source: 'Secrets Vault', status: 'warn' as const, payload: '{"appId":"app_unifiedpay","rotatedBy":"stavogm@gmail.com"}' }
    ];

    const interval = setInterval(() => {
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];
      
      setLiveEvents(prev => [
        {
          timestamp,
          event: template.event,
          source: template.source,
          status: template.status,
          payload: template.payload
        },
        ...prev.slice(0, 24) // limit to last 25 events
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Fetch live app state from server
  const refreshApps = async () => {
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      if (data.success && data.apps) {
        setApps(data.apps);
      }
    } catch (err) {
      console.error("Error refreshing apps from server: ", err);
    }
  };

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
        
        // Push a corresponding event directly to the live event bus log!
        const now = new Date();
        const timestamp = now.toTimeString().split(' ')[0];
        setLiveEvents(prev => [
          {
            timestamp,
            event: action === 'ROTATE_KEYS' ? 'app.key_rotated' : action === 'RESTART_SERVICE' ? 'app.rebooted' : 'app.status_toggled',
            source: 'Gateway Control Plane',
            status: 'warn',
            payload: JSON.stringify({ appId, action, outcome: 'SUCCESS', node: 'NY_LC' })
          },
          ...prev
        ]);
      } else {
        alert('Action failed: ' + data.error);
      }
    } catch (err: any) {
      alert('Error triggering action on backend: ' + err.message);
    }
  };

  const toggleRevealSecret = (id: string) => {
    setRevealedSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedApp = apps.find(a => a.id === selectedAppId || a.slug === selectedAppId);

  // API Call Simulator
  const handleTestEndpoint = (endpoint: GatewayEndpoint) => {
    setIsTestingEndpoint(endpoint.id);
    setEndpointResponsePayload(null);
    setTimeout(() => {
      setIsTestingEndpoint(null);
      const responses: Record<string, string> = {
        'ep_settlement': '{\n  "status": "success",\n  "settlementId": "set_8a12c4e9",\n  "amountMinor": 250000,\n  "currency": "USD",\n  "clearingRail": "stripe",\n  "auditSeal": "sha256=2a8b9c...f8"\n}',
        'ep_ledger': '{\n  "balanceSheet": {\n    "assetsMinor": 248102400,\n    "liabilitiesMinor": 128410200,\n    "equityMinor": 119692200\n  },\n  "ledgerHeight": 1428,\n  "status": "balanced"\n}',
        'ep_evidence': '{\n  "certificateId": "cert_evidence_00a9f",\n  "merkleRoot": "cf53e9...fa98",\n  "proofType": "SHA256-BLOCK-WITNESS",\n  "anchoredOnchain": true\n}',
        'ep_receipts': '{\n  "receiptId": "SVT-REC-48910",\n  "amount": 12000000,\n  "denomination": "SVT",\n  "timestamp": "2026-06-26T00:28:02Z"\n}',
        'ep_accounts': '[\n  { "id": "acc_asset_usd", "code": "1000.USD", "balance": 18240212 },\n  { "id": "acc_svt_vault", "code": "1000.SVT", "balance": 142058100 }\n]',
        'ep_nodes': '{\n  "nodesTotal": 6,\n  "nodesOnline": 6,\n  "consensusAlgorithm": "Proof-of-Authority",\n  "quorumVerified": true\n}',
        'ep_audit': '{\n  "auditPassed": true,\n  "violations": 0,\n  "checkedTransactions": 28410,\n  "sealedReportHash": "sha256=8bc9112..."\n}',
        'ep_dispatch': '{\n  "dispatched": true,\n  "queueLagMs": 14,\n  "receiver": "SAP Hub Gateway",\n  "state": "delivered"\n}'
      };
      setEndpointResponsePayload(responses[endpoint.id] || '{"status": "ok"}');

      // Publish to Event Bus
      const now = new Date();
      setLiveEvents(prev => [
        {
          timestamp: now.toTimeString().split(' ')[0],
          event: 'gateway.api_request',
          source: 'Client Ingress API',
          status: 'info',
          payload: `{"method":"${endpoint.method}","path":"${endpoint.path}","latencyMs":${endpoint.latencyMs}}`
        },
        ...prev
      ]);
    }, 1200);
  };

  // Webhook Simulator
  const handleFireWebhook = (webhook: GatewayWebhook) => {
    setIsFiringWebhook(webhook.id);
    setWebhookFireResult(null);
    setTimeout(() => {
      setIsFiringWebhook(null);
      const isSuccess = Math.random() > 0.1;
      if (isSuccess) {
        setWebhookFireResult(`SUCCESS: HTTP 200 OK - Payload delivered in ${webhook.direction === 'incoming' ? '42' : '95'}ms`);
        // Event Bus Log
        const now = new Date();
        setLiveEvents(prev => [
          {
            timestamp: now.toTimeString().split(' ')[0],
            event: webhook.direction === 'incoming' ? 'webhook.received' : 'webhook.sent',
            source: 'Webhook Engine',
            status: 'success',
            payload: `{"id":"${webhook.id}","name":"${webhook.name}","status":"200_OK"}`
          },
          ...prev
        ]);
      } else {
        setWebhookFireResult(`FAILED: HTTP 504 Timeout - Saved to Dead Letter Queue (DLQ)`);
        const now = new Date();
        setLiveEvents(prev => [
          {
            timestamp: now.toTimeString().split(' ')[0],
            event: 'webhook.failed',
            source: 'Webhook Engine',
            status: 'error',
            payload: `{"id":"${webhook.id}","error":"GATEWAY_TIMEOUT","dlq_inserted":true}`
          },
          ...prev
        ]);
        // Update DLQ locally
        setWebhooks(prev => prev.map(w => w.id === webhook.id ? { ...w, dlq: w.dlq + 1 } : w));
      }
    }, 1500);
  };

  // Secrets Manager Force Rotation
  const handleRotateSecret = (secretId: string) => {
    setIsRotatingSecret(secretId);
    setTimeout(() => {
      setIsRotatingSecret(null);
      const suffix = Math.random().toString(36).substr(2, 8);
      setSecrets(prev => prev.map(sec => {
        if (sec.id === secretId) {
          const split = sec.value.split('_');
          const prefix = split.slice(0, -1).join('_') || 'sk_live';
          const nextVal = `${prefix}_${suffix}`;
          const nowStr = new Date().toTimeString().split(' ')[0];
          return {
            ...sec,
            value: nextVal,
            version: `v${parseInt(sec.version.replace(/\D/g, '')) + 1} (Active)`,
            accessLogs: [`${nowStr} - Secrets rotated by administrator stavogm@gmail.com`, ...sec.accessLogs]
          };
        }
        return sec;
      }));

      // Log to event bus
      const now = new Date();
      setLiveEvents(prev => [
        {
          timestamp: now.toTimeString().split(' ')[0],
          event: 'secret.rotated',
          source: 'Secrets Vault Core',
          status: 'warn',
          payload: `{"secretId":"${secretId}","authority":"stavogm@gmail.com"}`
        },
        ...prev
      ]);
    }, 1000);
  };

  // Marketplace Dynamic Installation
  const handleInstallConnector = (connector: GatewayConnector) => {
    setSelectedConnectorForInstall(connector);
    setInstallApiKey('');
    setInstallEndpoint(connector.id === 'conn_openai' ? 'https://api.openai.com/v1/chat/completions' : `https://api.${connector.id.split('_')[1]}.io/v1`);
  };

  const handleConfirmInstallation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnectorForInstall) return;

    setIsInstalling(true);
    setTimeout(() => {
      setIsInstalling(false);
      
      // Update Marketplace installed status
      setConnectors(prev => prev.map(c => c.id === selectedConnectorForInstall.id ? { ...c, installed: true } : c));
      
      // Register it as a custom App/Service!
      const colors = [
        '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'
      ];
      const randomColor = selectedConnectorForInstall.tint || colors[Math.floor(Math.random() * colors.length)];
      
      const newApp: ConnectedApp = {
        id: `app_${selectedConnectorForInstall.id.split('_')[1]}`,
        slug: `${selectedConnectorForInstall.id.split('_')[1]}-hub`,
        displayName: selectedConnectorForInstall.name,
        icon: selectedConnectorForInstall.icon || 'Cpu',
        tint: randomColor,
        health: 'healthy',
        activeSessions: 142,
        txnPerMin: 22.4,
        lastHeartbeat: new Date().toISOString(),
        version: selectedConnectorForInstall.version || '1.0.0',
        description: selectedConnectorForInstall.desc,
        endpoint: installEndpoint || 'https://api.internal/v1',
        auth: 'API Key Security'
      };

      setApps(prev => {
        // Avoid duplicates
        if (prev.some(a => a.id === newApp.id)) return prev;
        return [...prev, newApp];
      });

      // Clear fields and modal
      setSelectedConnectorForInstall(null);

      // Post event
      const now = new Date();
      setLiveEvents(prev => [
        {
          timestamp: now.toTimeString().split(' ')[0],
          event: 'connector.mounted',
          source: 'Marketplace Engine',
          status: 'success',
          payload: `{"connectorId":"${selectedConnectorForInstall.id}","name":"${selectedConnectorForInstall.name}","version":"${selectedConnectorForInstall.version}"}`
        },
        ...prev
      ]);
    }, 1400);
  };

  // Self Discovery Manual Registry Handler
  const handleRegisterCustomDiscovery = () => {
    setDiscoveryError(null);
    setDiscoverySuccess(false);
    try {
      const parsed = JSON.parse(discoveryJson);
      if (!parsed.serviceId || !parsed.displayName || !parsed.type) {
        throw new Error("Validation Error: 'serviceId', 'displayName', and 'type' are required fields.");
      }

      // Append to Apps state
      const colors = ['#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newApp: ConnectedApp = {
        id: parsed.serviceId,
        slug: parsed.serviceId,
        displayName: parsed.displayName,
        icon: 'Cpu',
        tint: randomColor,
        health: parsed.status === 'healthy' ? 'healthy' : 'degraded',
        activeSessions: 34,
        txnPerMin: 12.8,
        lastHeartbeat: new Date().toISOString(),
        version: parsed.version || '1.0.0',
        description: `Self-registered ${parsed.type} via Service Discovery handshakes.`,
        endpoint: parsed.baseUrl || '',
        auth: parsed.authentication?.scheme || 'OAuth2'
      };

      setApps(prev => {
        if (prev.some(a => a.id === newApp.id)) {
          return prev.map(a => a.id === newApp.id ? newApp : a);
        }
        return [...prev, newApp];
      });

      setDiscoverySuccess(true);
      setTimeout(() => {
        setIsDiscoveryOpen(false);
        setDiscoverySuccess(false);
      }, 1500);

      // Event Log
      const now = new Date();
      setLiveEvents(prev => [
        {
          timestamp: now.toTimeString().split(' ')[0],
          event: 'service.discovered',
          source: 'Service Discovery Registry',
          status: 'success',
          payload: `{"serviceId":"${parsed.serviceId}","displayName":"${parsed.displayName}","version":"${parsed.version}"}`
        },
        ...prev
      ]);

    } catch (err: any) {
      setDiscoveryError(err.message || 'Malformed JSON format. Please verify keys and quotes.');
    }
  };

  // Helper datasets
  const getSubTabStyle = (workspaceId: string) => {
    return activeWorkspace === workspaceId
      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 font-bold'
      : 'text-white/40 hover:text-white hover:bg-white/5 border-transparent';
  };

  return (
    <div className="space-y-6">
      
      {/* 2-Column Command Shell layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs">
        
        {/* Left column: Sub-tab workspace selectors (3 columns) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-4 space-y-4">
            <div>
              <span className="text-[8px] text-cyan-400 font-extrabold tracking-widest block uppercase">FABRIC CONTROL PLANE</span>
              <h2 className="text-xs font-black uppercase text-white mt-1">Ecosystem Fabric</h2>
              <p className="text-[8px] text-white/30 uppercase mt-0.5">MANAGE EXTERNAL NODES & WORKFLOW PATHS</p>
            </div>
            
            <div className="space-y-1.5 flex flex-col">
              {[
                { id: 'registry', name: 'Service Registry', icon: Server, desc: 'Central directory & managed service inspector' },
                { id: 'gateway', name: 'API Gateway', icon: Cpu, desc: 'Enterprise rate-limiting & router manager' },
                { id: 'webhooks', name: 'Webhook Manager', icon: Radio, desc: 'Dead Letter Queue & webhook pipeline listener' },
                { id: 'eventbus', name: 'Event Bus', icon: Activity, desc: 'Event-driven real-time publisher ledger' },
                { id: 'secrets', name: 'Secrets Vault', icon: Key, desc: 'Secure credential, OAuth & key rotation store' },
                { id: 'bindings', name: 'Workflow Bindings', icon: Workflow, desc: 'Active pipeline chains & execution flow paths' },
                { id: 'marketplace', name: 'Connector Marketplace', icon: Sparkles, desc: 'Click-to-install zero-code integration hub' },
                { id: 'health', name: 'Health & Dependency', icon: Network, desc: 'System blast-radius & service dependency maps' }
              ].map(workspace => {
                const Icon = workspace.icon;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace.id)}
                    className={`w-full text-left px-3 py-2 border rounded transition-all text-[10.5px] uppercase cursor-pointer flex items-center gap-2.5 ${getSubTabStyle(workspace.id)}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{workspace.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick System Summary */}
          <div className="bg-[#08080c] border border-[#2a2a35]/60 rounded-lg p-4 space-y-3">
            <span className="text-[8px] text-white/40 font-black tracking-widest block uppercase">GATEWAY STATS</span>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="bg-black/40 border border-white/5 p-2 rounded">
                <span className="text-white/30 block">LATENCY</span>
                <span className="text-emerald-400 font-extrabold text-xs">18 ms</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-2 rounded">
                <span className="text-white/30 block">THROUGHPUT</span>
                <span className="text-cyan-400 font-extrabold text-xs">182 tx/s</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-2 rounded">
                <span className="text-white/30 block">WEBHOOKS</span>
                <span className="text-emerald-400 font-extrabold text-xs">99.98%</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-2 rounded">
                <span className="text-white/30 block">API ERRORS</span>
                <span className="text-rose-400 font-extrabold text-xs">0.03%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Workspace Content (9 columns) */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* WORKSPACE 1: SERVICE REGISTRY */}
          {activeWorkspace === 'registry' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5">
                <div className="flex justify-between items-center border-b border-[#2a2a35]/40 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      Active Services Directory
                    </h3>
                    <p className="text-[9px] text-white/40 uppercase mt-0.5">Control plane for every external system participating in the SOVR network</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDiscoveryOpen(true)}
                      className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 text-[9px] font-black uppercase rounded cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Self-Discovery Handshake
                    </button>
                    <button
                      onClick={refreshApps}
                      className="p-1 hover:bg-white/5 text-white/40 hover:text-white rounded"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Services List (5 cols) */}
                  <div className="md:col-span-5 space-y-2.5">
                    {apps.map(app => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`w-full text-left p-3 border rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                          selectedAppId === app.id
                            ? 'bg-cyan-500/5 border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.05)]'
                            : 'bg-[#05050a] border-[#2a2a35]/50 hover:bg-[#08080c] hover:border-[#2a2a35]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="h-8 w-8 rounded flex items-center justify-center border"
                            style={{ 
                              backgroundColor: `${app.tint || '#06b6d4'}10`, 
                              borderColor: `${app.tint || '#06b6d4'}30` 
                            }}
                          >
                            <Server className="w-4 h-4" style={{ color: app.tint || '#06b6d4' }} />
                          </div>
                          <div>
                            <span className="font-bold text-white block truncate max-w-[120px]">{app.displayName}</span>
                            <span className="text-[8px] text-white/30 uppercase mt-0.5 block">v{app.version || '1.0.0'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-right">
                          <div>
                            <span className="text-[8px] text-white/30 uppercase block">Throughput</span>
                            <span className="font-bold text-white text-[9.5px]">{app.txnPerMin ? app.txnPerMin.toFixed(1) : '0.0'} tx/m</span>
                          </div>
                          <span className={`h-2 w-2 rounded-full ${
                            app.health === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`} />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Inspector Panel (7 cols) */}
                  <div className="md:col-span-7">
                    {selectedApp ? (
                      <div className="bg-[#050508]/60 border border-[#2a2a35]/60 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-start border-b border-white/5 pb-2.5">
                          <div>
                            <span className="text-[8px] text-cyan-400 uppercase font-bold tracking-wider">Managed System Descriptor</span>
                            <h4 className="text-xs font-black text-white uppercase mt-0.5">{selectedApp.displayName}</h4>
                          </div>
                          <span className={`text-[8.5px] px-2 py-0.5 rounded font-black border ${
                            selectedApp.health === 'healthy'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {selectedApp.health === 'healthy' ? 'HEALTHY / OPERATIONAL' : 'DEGRADED / FAULT'}
                          </span>
                        </div>

                        <p className="text-[9.5px] text-white/60 leading-normal uppercase">
                          {selectedApp.description || `Registered external ${selectedApp.displayName} service node handling peripheral API execution cycles.`}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-black/30 p-2.5 border border-white/5 rounded">
                            <span className="text-white/30 block text-[8px] uppercase">Node Endpoint</span>
                            <span className="font-bold text-white text-[9.5px] truncate block">{selectedApp.endpoint || 'api.sovr.internal/v1'}</span>
                          </div>
                          <div className="bg-black/30 p-2.5 border border-white/5 rounded">
                            <span className="text-white/30 block text-[8px] uppercase">Authentication</span>
                            <span className="font-bold text-cyan-300 text-[9.5px] block">{selectedApp.auth || 'OAuth2 Client Secret'}</span>
                          </div>
                          <div className="bg-black/30 p-2.5 border border-white/5 rounded">
                            <span className="text-white/30 block text-[8px] uppercase">Active Sessions</span>
                            <span className="font-bold text-white text-[9.5px] block">{selectedApp.activeSessions || 14} threads</span>
                          </div>
                          <div className="bg-black/30 p-2.5 border border-white/5 rounded">
                            <span className="text-white/30 block text-[8px] uppercase">Peak Load</span>
                            <span className="font-bold text-amber-400 text-[9.5px] block">{(selectedApp.txnPerMin * 2.4).toFixed(1)} tx/m</span>
                          </div>
                        </div>

                        {/* Secret Rotation Panel */}
                        <div className="border border-white/5 bg-black/45 p-3 rounded space-y-2">
                          <div className="flex items-center gap-1.5 text-cyan-300">
                            <Key className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-wider">Access Secret Invariant</span>
                          </div>
                          <div className="flex items-center justify-between bg-black/50 border border-white/5 px-2 py-1 rounded text-[10px]">
                            <span className="font-mono text-white/80 select-all font-bold">
                              {revealedSecrets[selectedApp.id] 
                                ? `sk_live_sovr_${selectedApp.id.slice(4)}29da01bf9e`
                                : `•`?.repeat(20) + `a01bf9e`
                              }
                            </span>
                            <button
                              onClick={() => toggleRevealSecret(selectedApp.id)}
                              className="text-white/40 hover:text-white cursor-pointer"
                            >
                              {revealedSecrets[selectedApp.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAppAction(selectedApp.id, 'ROTATE_KEYS')}
                              className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded text-[8px] font-bold uppercase cursor-pointer"
                            >
                              Rotate API Key
                            </button>
                            <button
                              onClick={() => handleAppAction(selectedApp.id, 'RESTART_SERVICE')}
                              className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 rounded text-[8px] font-bold uppercase cursor-pointer"
                            >
                              Hot Reboot Node
                            </button>
                            <button
                              onClick={() => handleAppAction(selectedApp.id, 'TOGGLE_STATUS')}
                              className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded text-[8px] font-bold uppercase cursor-pointer"
                            >
                              Toggle Offline
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#050508]/40 border border-[#2a2a35]/60 rounded-lg p-12 text-center text-white/30 uppercase">
                        Select a service to inspect its parameters.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Discovery Drawer modal */}
              {isDiscoveryOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <div className="bg-[#0c0c12] border border-[#2a2a35] max-w-lg w-full rounded-lg p-5 space-y-4 shadow-2xl">
                    <div className="border-b border-[#2a2a35]/65 pb-2">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Service Self-Registration Schema Handshake</h3>
                      <p className="text-[8.5px] text-white/40 uppercase mt-0.5">Central discovery registers nodes automatically via canonical JSON descriptions.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8.5px] text-white/40 uppercase block font-bold">Discovery Descriptor JSON</label>
                      <textarea
                        rows={10}
                        value={discoveryJson}
                        onChange={(e) => setDiscoveryJson(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded p-2.5 font-mono text-[9.5px] text-green-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {discoveryError && (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/35 text-rose-400 text-[8.5px] font-black uppercase rounded">
                        ✕ {discoveryError}
                      </div>
                    )}

                    {discoverySuccess && (
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[8.5px] font-black uppercase rounded">
                        ✓ Service discovery handshake successful! Mount completed.
                      </div>
                    )}

                    <div className="flex justify-end gap-2 text-[9px] font-bold">
                      <button
                        onClick={() => setIsDiscoveryOpen(false)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRegisterCustomDiscovery}
                        className="px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 rounded uppercase cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Execute Discovery
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WORKSPACE 2: API GATEWAY */}
          {activeWorkspace === 'gateway' && (
            <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 space-y-4 animate-fadeIn">
              <div className="border-b border-[#2a2a35]/40 pb-3">
                <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  API Router & Rate-Limiting Manager
                </h3>
                <p className="text-[9px] text-white/40 uppercase mt-0.5">Configure endpoints, rate metrics, and secure authentications like Apigee or Kong</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Router List */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[8px] text-white/40 font-black uppercase tracking-wider block mb-1">Managed REST Endpoints</span>
                  {endpoints.map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedEndpointId(ep.id)}
                      className={`w-full text-left p-2.5 border rounded transition-all flex items-center justify-between cursor-pointer ${
                        selectedEndpointId === ep.id
                          ? 'bg-cyan-500/5 border-cyan-500/40 text-cyan-300'
                          : 'bg-[#05050a] border-white/5 hover:bg-[#08080c]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-black ${
                          ep.method === 'POST' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-bold text-[10px] text-white/90 truncate block max-w-[140px]">{ep.path}</span>
                      </div>
                      <span className="text-[8.5px] text-white/40 font-bold">{ep.requests.toLocaleString()}</span>
                    </button>
                  ))}
                </div>

                {/* Endpoint Inspector */}
                {(() => {
                  const ep = endpoints.find(e => e.id === selectedEndpointId)!;
                  return (
                    <div className="md:col-span-7 bg-[#050508]/60 border border-white/5 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[8px] text-cyan-400 uppercase font-black">Endpoint Inspector</span>
                          <h4 className="text-xs font-black text-white uppercase mt-0.5">{ep.path}</h4>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 bg-white/5 text-white/60 border border-white/10 rounded font-bold uppercase">
                          {ep.rateLimit}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[9px]">
                        <div className="bg-black/30 p-2 border border-white/5 rounded">
                          <span className="text-white/30 block text-[8px] uppercase">Avg Latency</span>
                          <span className="font-bold text-emerald-400 text-[10px]">{ep.latencyMs} ms</span>
                        </div>
                        <div className="bg-black/30 p-2 border border-white/5 rounded">
                          <span className="text-white/30 block text-[8px] uppercase">Error Ratio</span>
                          <span className="font-bold text-rose-400 text-[10px]">{(ep.errorRate * 100).toFixed(3)}%</span>
                        </div>
                        <div className="bg-black/30 p-2 border border-white/5 rounded">
                          <span className="text-white/30 block text-[8px] uppercase">Payload Size</span>
                          <span className="font-bold text-white text-[10px]">{ep.payloadSize} (average)</span>
                        </div>
                        <div className="bg-black/30 p-2 border border-white/5 rounded">
                          <span className="text-white/30 block text-[8px] uppercase">Auth Mechanism</span>
                          <span className="font-bold text-amber-300 text-[10px] truncate block">{ep.auth}</span>
                        </div>
                      </div>

                      {ep.workflows.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[8.5px] text-white/40 uppercase block font-bold">Associated Workflows</span>
                          <div className="flex flex-wrap gap-1">
                            {ep.workflows.map(wf => (
                              <span key={wf} className="text-[7.5px] bg-cyan-950/30 border border-cyan-500/20 px-2 py-0.5 rounded text-cyan-300 font-bold uppercase">
                                {wf}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mock Router Simulator */}
                      <div className="border border-white/5 bg-black/45 p-3 rounded space-y-2">
                        <span className="text-[8.5px] text-white/40 uppercase font-black block">Router Inbound Call Simulator</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTestEndpoint(ep)}
                            disabled={isTestingEndpoint !== null}
                            className="px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 disabled:opacity-40 rounded font-black text-[8.5px] uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            {isTestingEndpoint === ep.id ? 'Routing Handshake...' : 'Dispatch Request'}
                          </button>
                        </div>

                        {endpointResponsePayload && (
                          <div className="space-y-1 animate-fadeIn">
                            <span className="text-[8px] text-green-400 uppercase font-bold block flex items-center gap-1">
                              <Check className="w-3 h-3" /> HTTP 200 OK - Response Frame (payload size: {ep.responseSize})
                            </span>
                            <pre className="p-2 bg-black border border-white/5 rounded text-[8.5px] text-white/80 overflow-x-auto max-h-[140px] font-mono leading-relaxed">
                              {endpointResponsePayload}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* WORKSPACE 3: WEBHOOK MANAGER */}
          {activeWorkspace === 'webhooks' && (
            <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 space-y-4 animate-fadeIn">
              <div className="border-b border-[#2a2a35]/40 pb-3">
                <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Webhook Pipeline & DLQ Listener
                </h3>
                <p className="text-[9px] text-white/40 uppercase mt-0.5">Control live event payloads, retry indexes, and Dead Letter Queue failovers</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Webhooks list */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[8px] text-white/40 font-black uppercase tracking-wider block mb-1">Endpoints Registry</span>
                  {webhooks.map(wh => (
                    <button
                      key={wh.id}
                      onClick={() => setSelectedWebhookId(wh.id)}
                      className={`w-full text-left p-2.5 border rounded transition-all flex items-center justify-between cursor-pointer ${
                        selectedWebhookId === wh.id
                          ? 'bg-cyan-500/5 border-cyan-500/40 text-cyan-300'
                          : 'bg-[#05050a] border-white/5 hover:bg-[#08080c]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-[9.5px] text-white/90 block">{wh.name}</span>
                        <span className="text-[7.5px] text-white/30 uppercase mt-0.5 block">{wh.direction} • {wh.event}</span>
                      </div>
                      
                      {wh.dlq > 0 ? (
                        <span className="text-[7.5px] bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold px-1.5 py-0.5 rounded">
                          DLQ: {wh.dlq}
                        </span>
                      ) : (
                        <span className="text-[7.5px] bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                          CLEAN
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Webhook details */}
                {(() => {
                  const wh = webhooks.find(w => w.id === selectedWebhookId)!;
                  return (
                    <div className="md:col-span-7 bg-[#050508]/60 border border-white/5 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[8px] text-cyan-400 uppercase font-black">Webhook Controller</span>
                          <h4 className="text-xs font-black text-white uppercase mt-0.5">{wh.name}</h4>
                        </div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black border uppercase ${
                          wh.direction === 'incoming' ? 'bg-cyan-500/15 border-cyan-500/25 text-cyan-400' : 'bg-purple-500/15 border-purple-500/25 text-purple-400'
                        }`}>
                          {wh.direction}
                        </span>
                      </div>

                      <div className="space-y-3.5 text-[9.5px] font-mono">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-black/30 p-2 border border-white/5 rounded">
                            <span className="text-white/30 block text-[8px] uppercase">Retry Strategy</span>
                            <span className="font-bold text-white text-[9.5px]">{wh.retryPolicy}</span>
                          </div>
                          <div className="bg-black/30 p-2 border border-white/5 rounded">
                            <span className="text-white/30 block text-[8px] uppercase">Average Delivery</span>
                            <span className="font-bold text-emerald-400 text-[9.5px]">{wh.deliveryTimeMs} ms</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8.5px] text-white/40 uppercase block font-bold">Headers Template</span>
                          <div className="p-2 bg-black/40 border border-white/5 rounded text-[8px] text-white/80 overflow-x-auto">
                            {Object.entries(wh.headers).map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-cyan-400 font-extrabold">{k}:</span>
                                <span className="text-white/60">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8.5px] text-white/40 uppercase block font-bold">Payload Schema Template</span>
                          <pre className="p-2 bg-black border border-white/5 rounded text-[8px] text-white/80 overflow-x-auto max-h-[120px] font-mono leading-relaxed">
                            {wh.payloadTemplate}
                          </pre>
                        </div>

                        {/* Webhook Fire Simulation */}
                        <div className="border border-white/5 bg-black/45 p-3 rounded space-y-2">
                          <span className="text-[8px] text-white/40 uppercase block font-bold">Payload Dispatcher</span>
                          <button
                            onClick={() => handleFireWebhook(wh)}
                            disabled={isFiringWebhook !== null}
                            className="px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 disabled:opacity-45 rounded font-black text-[8px] uppercase flex items-center gap-1.5 cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-cyan-400" />
                            {isFiringWebhook === wh.id ? 'Dispatching Payload...' : 'Fire Webhook Event'}
                          </button>

                          {webhookFireResult && (
                            <div className="p-2 bg-black border border-white/5 rounded text-[8.5px] text-green-300 font-bold animate-fadeIn">
                              {webhookFireResult}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* WORKSPACE 4: EVENT BUS */}
          {activeWorkspace === 'eventbus' && (
            <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 space-y-4 animate-fadeIn">
              <div className="border-b border-[#2a2a35]/40 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Distributed Event Bus Publisher Feed
                  </h3>
                  <p className="text-[9px] text-white/40 uppercase mt-0.5">Live multiplex pub/sub log auditing system-wide signals</p>
                </div>
                <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-bold px-2 py-0.5 rounded uppercase animate-pulse">
                  ● LISTENING LIVE
                </span>
              </div>

              {/* Event timeline */}
              <div className="space-y-2">
                <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider block">Real-Time Ledger Signals</span>
                <div className="bg-black/40 border border-white/5 rounded-lg p-3 max-h-[380px] overflow-y-auto font-mono text-[9px] space-y-2.5 scrollbar-thin">
                  {liveEvents.map((evt, idx) => (
                    <div 
                      key={idx} 
                      className="border-b border-white/5 pb-2.5 last:border-0 last:pb-0 flex flex-col md:flex-row md:items-start gap-1 md:gap-4 hover:bg-white/5 px-2 py-1 rounded transition-colors"
                    >
                      <div className="text-white/30 font-bold text-[8.5px] shrink-0">{evt.timestamp}</div>
                      
                      <div className="grow space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-black uppercase ${
                            evt.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : evt.status === 'warn' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {evt.event}
                          </span>
                          <span className="text-white/40">from</span>
                          <span className="text-cyan-300 font-extrabold">{evt.source}</span>
                        </div>
                        <div className="text-white/70 text-[8.5px] font-mono overflow-x-auto bg-black/20 p-1.5 rounded border border-white/5">
                          {evt.payload}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE 5: SECRETS VAULT */}
          {activeWorkspace === 'secrets' && (
            <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 space-y-4 animate-fadeIn">
              <div className="border-b border-[#2a2a35]/40 pb-3">
                <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  Operator HSM & Secrets Vault
                </h3>
                <p className="text-[9px] text-white/40 uppercase mt-0.5">Manage security API keys, client secrets, certificates, and rotational parameters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Secrets list */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[8px] text-white/40 font-black uppercase tracking-wider block mb-1">Protected Assets</span>
                  {secrets.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSecretId(sec.id)}
                      className={`w-full text-left p-2.5 border rounded transition-all flex items-center justify-between cursor-pointer ${
                        selectedSecretId === sec.id
                          ? 'bg-cyan-500/5 border-cyan-500/40 text-cyan-300'
                          : 'bg-[#05050a] border-white/5 hover:bg-[#08080c]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-[9.5px] text-white/90 truncate block max-w-[150px]">{sec.name}</span>
                        <span className="text-[7.5px] text-white/30 uppercase mt-0.5 block">{sec.type} • {sec.version}</span>
                      </div>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </button>
                  ))}
                </div>

                {/* Secret inspector */}
                {(() => {
                  const sec = secrets.find(s => s.id === selectedSecretId)!;
                  return (
                    <div className="md:col-span-7 bg-[#050508]/60 border border-white/5 p-4 rounded-lg space-y-4 font-mono">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[8px] text-cyan-400 uppercase font-black">Vault Inspector</span>
                          <h4 className="text-xs font-black text-white uppercase mt-0.5">{sec.name}</h4>
                        </div>
                        <span className="text-[8px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded font-bold uppercase">
                          {sec.type}
                        </span>
                      </div>

                      <div className="space-y-3.5 text-[9.5px]">
                        <div className="space-y-1 bg-[#05050a] p-2.5 border border-white/5 rounded">
                          <span className="text-white/30 block text-[8px] uppercase">Secret Value</span>
                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <span className="text-white/80 font-extrabold select-all truncate grow max-w-[210px]">
                              {revealedSecrets[sec.id] ? sec.value : '•'?.repeat(24) + sec.value.slice(-6)}
                            </span>
                            <button
                              onClick={() => toggleRevealSecret(sec.id)}
                              className="text-white/40 hover:text-white cursor-pointer ml-2"
                            >
                              {revealedSecrets[sec.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-white/30 block text-[8px] uppercase">Rotation Policy</span>
                            <span className="font-bold text-white text-[9px]">{sec.rotationPolicy}</span>
                          </div>
                          <div>
                            <span className="text-white/30 block text-[8px] uppercase">Expires</span>
                            <span className="font-bold text-amber-400 text-[9px]">{sec.expires}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8.5px] text-white/40 uppercase block font-bold">Access Audit Trails</span>
                          <div className="bg-black/40 border border-white/5 p-2 rounded text-[8px] text-white/50 space-y-1 max-h-[100px] overflow-y-auto">
                            {sec.accessLogs.map((log, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span className="text-cyan-300 font-extrabold">▶</span>
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRotateSecret(sec.id)}
                          disabled={isRotatingSecret !== null}
                          className="w-full py-1.5 bg-rose-500/10 border border-rose-500/35 hover:bg-rose-500/20 text-rose-400 rounded font-black text-[8.5px] uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRotatingSecret === sec.id ? 'animate-spin' : ''}`} />
                          {isRotatingSecret === sec.id ? 'Regenerating Secret Value...' : 'Force Rotate Credential'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* WORKSPACE 6: WORKFLOW BINDINGS */}
          {activeWorkspace === 'bindings' && (
            <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 space-y-4 animate-fadeIn">
              <div className="border-b border-[#2a2a35]/40 pb-3">
                <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-cyan-400" />
                  Orchestrated Workflow Bindings
                </h3>
                <p className="text-[9px] text-white/40 uppercase mt-0.5">Connect external nodes dynamically to form automated, self-healing pipeline paths</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Pipelines List */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[8px] text-white/40 font-black uppercase tracking-wider block mb-1">Configured Chains</span>
                  {workflows.map(wf => (
                    <button
                      key={wf.id}
                      onClick={() => setSelectedWorkflowId(wf.id)}
                      className={`w-full text-left p-2.5 border rounded transition-all flex items-center justify-between cursor-pointer ${
                        selectedWorkflowId === wf.id
                          ? 'bg-cyan-500/5 border-cyan-500/40 text-cyan-300'
                          : 'bg-[#05050a] border-white/5 hover:bg-[#08080c]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-[9.5px] text-white/90 block">{wf.name}</span>
                        <span className="text-[7.5px] text-white/30 uppercase mt-0.5 block">{wf.steps.length} steps chain</span>
                      </div>
                      <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        wf.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-white/5 text-white/40 border border-white/10'
                      }`}>
                        {wf.active ? 'ACTIVE' : 'STANDBY'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Pipeline Inspector */}
                {(() => {
                  const wf = workflows.find(w => w.id === selectedWorkflowId)!;
                  return (
                    <div className="md:col-span-7 bg-[#050508]/60 border border-white/5 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[8px] text-cyan-400 uppercase font-black">Chain Visualizer</span>
                          <h4 className="text-xs font-black text-white uppercase mt-0.5">{wf.name}</h4>
                        </div>
                        <button
                          onClick={() => setWorkflows(prev => prev.map(w => w.id === wf.id ? { ...w, active: !w.active } : w))}
                          className={`text-[8.5px] px-2.5 py-1 font-bold border rounded uppercase cursor-pointer ${
                            wf.active 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {wf.active ? 'Pause Chain' : 'Activate Chain'}
                        </button>
                      </div>

                      <p className="text-[9.5px] text-white/60 uppercase">{wf.desc}</p>

                      {/* visual pipeline flow */}
                      <div className="bg-[#05050a]/90 p-4 border border-white/5 rounded-lg flex flex-wrap items-center justify-center gap-2">
                        {wf.steps.map((step, idx) => (
                          <React.Fragment key={step}>
                            <div className="px-3 py-1.5 bg-cyan-500/5 border border-cyan-500/35 text-cyan-300 font-extrabold rounded uppercase text-[9px] shadow-[0_0_8px_rgba(34,211,238,0.05)]">
                              {step}
                            </div>
                            {idx < wf.steps.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Pipeline diagnostic executor */}
                      <div className="border border-white/5 bg-black/45 p-3 rounded space-y-2">
                        <span className="text-[8px] text-white/40 uppercase block font-bold">Execution Simulator</span>
                        <div className="text-[8.5px] text-white/50 leading-relaxed font-mono">
                          Triggering the execution will test step-by-step connectivity, payload translation, and audit witness seals.
                        </div>
                        <button
                          onClick={() => {
                            alert(`Simulating step-by-step pipeline trace for ${wf.name}... [100% SUCCESS]`);
                            const now = new Date();
                            setLiveEvents(prev => [
                              {
                                timestamp: now.toTimeString().split(' ')[0],
                                event: 'pipeline.traced',
                                source: 'Orchestrator Core',
                                status: 'success',
                                payload: `{"pipeline":"${wf.name}","stepsCount":${wf.steps.length},"result":"COMPLETE_SUCCESS"}`
                              },
                              ...prev
                            ]);
                          }}
                          className="px-2.5 py-1.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 rounded uppercase text-[8px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          Execute Pipeline Trace
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* WORKSPACE 7: CONNECTOR MARKETPLACE */}
          {activeWorkspace === 'marketplace' && (
            <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 space-y-4 animate-fadeIn">
              <div className="border-b border-[#2a2a35]/40 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                    Zero-Code Connector Marketplace
                  </h3>
                  <p className="text-[9px] text-white/40 uppercase mt-0.5">Integrate payments, blockchains, communication routers, and ERP backends instantly</p>
                </div>
              </div>

              {/* Grid of marketplace cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {connectors.map(conn => {
                  return (
                    <div 
                      key={conn.id} 
                      className="bg-[#050508]/60 border border-[#2a2a35]/60 hover:border-cyan-500/30 rounded-lg p-3.5 space-y-2.5 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div 
                            className="h-7 w-7 rounded flex items-center justify-center border"
                            style={{ 
                              backgroundColor: `${conn.tint || '#06b6d4'}10`, 
                              borderColor: `${conn.tint || '#06b6d4'}30` 
                            }}
                          >
                            <Server className="w-3.5 h-3.5" style={{ color: conn.tint || '#06b6d4' }} />
                          </div>
                          {conn.installed ? (
                            <span className="text-[7px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                              MOUNTED
                            </span>
                          ) : (
                            <span className="text-[7px] bg-white/5 text-white/30 border border-white/5 font-extrabold px-1.5 py-0.5 rounded">
                              AVAILABLE
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="font-extrabold text-white text-[10.5px] block">{conn.name}</span>
                          <span className="text-[7px] text-white/40 uppercase block mt-0.5">{conn.category} • {conn.publisher}</span>
                        </div>

                        <p className="text-[8px] text-white/50 leading-relaxed uppercase">
                          {conn.desc}
                        </p>
                      </div>

                      {conn.installed ? (
                        <button
                          disabled
                          className="w-full py-1 bg-[#12121e] border border-white/5 rounded text-[8px] font-black uppercase text-white/30 cursor-not-allowed text-center"
                        >
                          Already Installed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInstallConnector(conn)}
                          className="w-full py-1 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/25 text-cyan-300 rounded text-[8px] font-black uppercase cursor-pointer text-center"
                        >
                          Mount & Install
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Install Form Slide-Over Drawer */}
              {selectedConnectorForInstall && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                  <div className="bg-[#0c0c12] border border-[#2a2a35] max-w-md w-full rounded-lg p-5 space-y-4 shadow-2xl">
                    <div className="border-b border-[#2a2a35]/65 pb-2">
                      <span className="text-[8px] text-cyan-400 uppercase font-bold tracking-widest">CONNECT INTEGRATION</span>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider mt-0.5">Mount {selectedConnectorForInstall.name}</h3>
                      <p className="text-[8.5px] text-white/40 uppercase mt-0.5">Establish OAuth2 or API key secure handshakes dynamically with zero code</p>
                    </div>

                    <form onSubmit={handleConfirmInstallation} className="space-y-3.5 text-[9px] font-mono">
                      <div className="space-y-1">
                        <label className="text-white/40 uppercase block">Endpoint / Destination URL</label>
                        <input
                          type="text"
                          required
                          value={installEndpoint}
                          onChange={(e) => setInstallEndpoint(e.target.value)}
                          className="w-full bg-black border border-white/10 p-2 text-white font-mono rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-white/40 uppercase block">Secret API Token / OAuth Key</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••••••••••••••••••"
                          value={installApiKey}
                          onChange={(e) => setInstallApiKey(e.target.value)}
                          className="w-full bg-black border border-white/10 p-2 text-white font-mono rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-white/40 uppercase block">Environment Mode</label>
                        <select
                          value={installEnvironment}
                          onChange={(e) => setInstallEnvironment(e.target.value as any)}
                          className="w-full bg-black border border-white/10 p-2 text-white font-mono rounded uppercase"
                        >
                          <option value="sandbox">Sandbox / Staging</option>
                          <option value="production">Production / Clear Live</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-2 text-[9px] font-bold pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedConnectorForInstall(null)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isInstalling}
                          className="px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 rounded uppercase flex items-center gap-1 cursor-pointer"
                        >
                          {isInstalling ? 'Authenticating...' : 'Authorize & Mount'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WORKSPACE 8: HEALTH & SYSTEM DEPENDENCY MAPS */}
          {activeWorkspace === 'health' && (
            <div className="bg-[#08080c] border border-[#2a2a35] rounded-lg p-5 space-y-4 animate-fadeIn">
              <ServiceDependencyGraph />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
