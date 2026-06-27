import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Shield, Users, Key, Building2, Workflow, Radio, Database, 
  ShieldCheck, Download, Upload, Cpu, Activity, Clock, FileText, 
  CheckCircle2, AlertTriangle, Play, Trash2, ArrowRight, ChevronRight, 
  Info, Calendar, RefreshCw, Network, Lock, Unlock, HelpCircle, Save, 
  Plus, Palette, Sliders, Check, Server, Eye, EyeOff, Terminal, Sparkles, BarChart2
} from 'lucide-react';

// Interfaces for our state
interface IAMUser {
  id: string;
  name: string;
  email: string;
  role: string;
  mfa: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  lastActive: string;
}

interface ApprovalRule {
  id: string;
  action: string;
  threshold: number;
  currency: string;
  requiresRoles: string[];
  status: 'ACTIVE' | 'DISABLED';
}

interface NetworkNode {
  id: string;
  name: string;
  type: string;
  region: string;
  status: 'ACTIVE' | 'DRAINING' | 'RETIRED';
  health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  cpu: number;
  memory: number;
}

interface ServiceItem {
  id: string;
  name: string;
  version: string;
  status: 'RUNNING' | 'STOPPED' | 'MAINTENANCE';
  dependencies: string[];
  capabilities: string[];
}

interface AuditSnapshot {
  id: string;
  timestamp: string;
  version: number;
  author: string;
  description: string;
  hash: string;
}

export default function AdministrationView() {
  // Navigation states
  const [activeMenuSection, setActiveMenuSection] = useState<string>('Organization');

  // Load backend configuration dynamically (retains full compatibility with /api/config)
  const [dbConfig, setDbConfig] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [showAddDbItem, setShowAddDbItem] = useState(false);
  const [dbFormFields, setDbFormFields] = useState({
    code: '',
    name: '',
    type: 'FIAT'
  });

  // State values for different admin panels
  // 1. Organization Setup
  const [orgState, setOrgState] = useState({
    name: 'SOVR Clearing & Settlement Corp',
    legalEntity: 'SOVR global clearing networks LLC',
    operatingEnv: 'PRODUCTION-US-EAST',
    jurisdiction: 'Delaware, USA / Basel III Sovereign Compliance',
    timezone: 'UTC (+00:00)',
    baseCurrency: 'USD',
    networkIdentity: 'sovr.node.primary.clearing',
    digitalSeal: '0x8f7d9a102b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    businessUnits: ['Corporate Treasury', 'International Remittance', 'Liquid Asset Escrow'],
    departments: ['Settlement Operations', 'Compliance & Regulatory Audit', 'Infrastructure Devops']
  });
  const [isEditingOrg, setIsEditingOrg] = useState(false);

  // 2. IAM
  const [iamUsers, setIamUsers] = useState<IAMUser[]>([
    { id: 'usr-1', name: 'Alexander Sterling', email: 'a.sterling@sovr.clearing', role: 'Platform Administrator', mfa: true, status: 'ACTIVE', lastActive: '3 minutes ago' },
    { id: 'usr-2', name: 'Sarah Vance', email: 's.vance@sovr.clearing', role: 'Treasury Officer', mfa: true, status: 'ACTIVE', lastActive: '14 mins ago' },
    { id: 'usr-3', name: 'Marcus Chen', email: 'm.chen@sovr.clearing', role: 'Settlement Operator', mfa: true, status: 'ACTIVE', lastActive: '2 hours ago' },
    { id: 'usr-4', name: 'Audrey Hepburn', email: 'a.hepburn@sec.gov', role: 'Auditor', mfa: true, status: 'ACTIVE', lastActive: 'Yesterday' },
    { id: 'usr-5', name: 'Devin Thorne', email: 'd.thorne@sovr.clearing', role: 'API Developer', mfa: false, status: 'ACTIVE', lastActive: '3 days ago' }
  ]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Settlement Operator', mfa: true });

  const rolesList = [
    'Platform Administrator',
    'Treasury Officer',
    'Settlement Operator',
    'Evidence Officer',
    'Compliance Reviewer',
    'Auditor',
    'API Developer',
    'Read Only'
  ];

  const capabilityPermissions: Record<string, string[]> = {
    'Platform Administrator': ['approve_settlement', 'rotate_secrets', 'modify_treasury_limits', 'read_audit_logs', 'deploy_network_nodes', 'update_governance_rules'],
    'Treasury Officer': ['approve_settlement', 'modify_treasury_limits', 'read_audit_logs'],
    'Settlement Operator': ['approve_settlement', 'read_audit_logs'],
    'Evidence Officer': ['read_audit_logs'],
    'Compliance Reviewer': ['read_audit_logs', 'update_governance_rules'],
    'Auditor': ['read_audit_logs'],
    'API Developer': ['rotate_secrets'],
    'Read Only': []
  };

  // 3. Governance Engine
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([
    { id: 'rul-1', action: 'Settlement Execution', threshold: 250000, currency: 'USD', requiresRoles: ['Treasury Officer', 'Compliance Reviewer'], status: 'ACTIVE' },
    { id: 'rul-2', action: 'Reserve Redistribution', threshold: 1000000, currency: 'USD', requiresRoles: ['Platform Administrator', 'Treasury Officer'], status: 'ACTIVE' },
    { id: 'rul-3', action: 'Secret Key Rotation', threshold: 0, currency: 'USD', requiresRoles: ['Platform Administrator'], status: 'ACTIVE' }
  ]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    action: 'Settlement Execution',
    threshold: 50000,
    currency: 'USD',
    requiresRoles: ['Platform Administrator'] as string[]
  });

  // 4. Policy Engine
  const [policies, setPolicies] = useState({
    receiptRetentionYears: 10,
    certificateGeneration: 'REQUIRED',
    chainAnchoring: 'ENABLED',
    qrVerification: 'ENABLED',
    automaticZipCompilation: true,
    webhookRetryLimit: 5,
    maxNotificationRetries: 3,
    ledgerReconciliationFrequency: 'HOURLY'
  });

  // 5. Network Topology
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([
    { id: 'node-us-01', name: 'SOVR Primary Validator NY', type: 'Validator Node', region: 'us-east-1', status: 'ACTIVE', health: 'HEALTHY', cpu: 14, memory: 42 },
    { id: 'node-us-02', name: 'SOVR Secondary Oracle SF', type: 'Oracle Node', region: 'us-west-2', status: 'ACTIVE', health: 'HEALTHY', cpu: 8, memory: 31 },
    { id: 'node-eu-01', name: 'SOVR Gateway Frankfurt', type: 'Gateway Node', region: 'eu-central-1', status: 'ACTIVE', health: 'HEALTHY', cpu: 22, memory: 58 },
    { id: 'node-ap-01', name: 'SOVR Settlement Tokyo', type: 'Settlement Node', region: 'ap-northeast-1', status: 'ACTIVE', health: 'HEALTHY', cpu: 12, memory: 28 },
    { id: 'node-backup-01', name: 'Sovereign Shadow Vault Sync', type: 'Backup Node', region: 'us-east-1', status: 'ACTIVE', health: 'HEALTHY', cpu: 2, memory: 15 }
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-us-01');
  const [deployingNode, setDeployingNode] = useState({
    name: 'SOVR Validator Mumbai',
    type: 'Validator Node',
    region: 'ap-south-1',
    cpu: 8,
    memory: 32
  });
  const [nodeLogs, setNodeLogs] = useState<string[]>([
    'System startup initiated.',
    'Validator NY consensus handshake secured (Block #7422).',
    'Gateway Frankfurt network socket listening on port 3000.'
  ]);

  // 6. Service Registry
  const [services, setServices] = useState<ServiceItem[]>([
    { id: 'srv-1', name: 'UnifiedPay Core Connector', version: 'v2.4.1-stable', status: 'RUNNING', dependencies: ['Postgres SQL DB', 'Stripe Bridge Webhook'], capabilities: ['Direct Clearing', 'Debit Escrow Mappings'] },
    { id: 'srv-2', name: 'SwiftBridge Cross-border Router', version: 'v1.12.0', status: 'RUNNING', dependencies: ['Sovereign HSM Keyring'], capabilities: ['MT103 ISO20022 Compiling', 'BIC Directory Matching'] },
    { id: 'srv-3', name: 'Plaid Bank Gateway Connector', version: 'v4.0.2', status: 'MAINTENANCE', dependencies: ['Redis Session Store'], capabilities: ['Real-time Account Balances', 'ACH Routing Verification'] },
    { id: 'srv-4', name: 'FedWire Realtime Gateway', version: 'v3.5.9', status: 'STOPPED', dependencies: ['Federal Reserve Notary Node'], capabilities: ['Sovereign Wire Clearance', 'Instant RTGS Settlements'] }
  ]);

  // 7. Security Center
  const [securityScore, setSecurityScore] = useState<number>(98);
  const [failedLogins, setFailedLogins] = useState<number>(3);
  const [secretsNearExpiration, setSecretsNearExpiration] = useState<number>(2);
  const [activeCertificates, setActiveCertificates] = useState([
    { id: 'cert-1', name: 'Sovereign SSL Root Authority', issuer: 'DigiCert Sovereign Corp', expires: '242 days', status: 'HEALTHY' },
    { id: 'cert-2', name: 'Consensus HSM Ledger Signer', issuer: 'Internal Trust Root PKI', expires: '11 days (Pending Auto-Rotation)', status: 'WARNING' },
    { id: 'cert-3', name: 'API Client Gateway mTLS', issuer: 'SOVR Core CA-2', expires: '533 days', status: 'HEALTHY' }
  ]);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [recentSecurityEvents, setRecentSecurityEvents] = useState([
    { timestamp: '14:22:15', type: 'mTLS Handshake', node: 'SOVR Frankfurt', detail: 'Authorized connection verified', severity: 'INFO' },
    { timestamp: '15:10:02', type: 'API Key Rotation', node: 'Central IAM Plane', detail: 'Secret key "sk_prod_...ff01" rotated safely', severity: 'SUCCESS' },
    { timestamp: '16:05:40', type: 'Policy Violation Attempt', node: 'External IP 198.51.100.42', detail: 'Blocked dual-sign bypass on Settlement #8892', severity: 'HIGH_ALERT' }
  ]);

  // 8. Audit & Recovery (Configuration Snapshots)
  const [snapshots, setSnapshots] = useState<AuditSnapshot[]>([
    { id: 'snap-4', timestamp: '2026-06-26T18:00:00Z', version: 4.1, author: 'Alexander Sterling', description: 'Added Dual-Authorization rule for transactions > $250k', hash: '0xa41b2c...890e' },
    { id: 'snap-3', timestamp: '2026-06-25T12:30:11Z', version: 4.0, author: 'Sarah Vance', description: 'Rotated consensus validator secrets scheduled update', hash: '0x992b4c...f201' },
    { id: 'snap-2', timestamp: '2026-06-24T09:15:42Z', version: 3.2, author: 'Marcus Chen', description: 'Registered Federal Reserve Notary Node to Topology', hash: '0x882a1b...c94e' },
    { id: 'snap-1', timestamp: '2026-06-20T14:22:00Z', version: 3.0, author: 'Alexander Sterling', description: 'Base SOVR UEFI platform initialized successfully', hash: '0x771f2e...d482' }
  ]);
  const [selectedSnapForCompare, setSelectedSnapForCompare] = useState<string>('snap-4');
  const [compareSnapTo, setCompareSnapTo] = useState<string>('snap-3');
  const [isComparing, setIsComparing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // 9. Templates
  const [templates, setTemplates] = useState({
    receiptTitle: 'SOVR CANONICAL TRANSACTION RECEIPT',
    receiptFont: 'JetBrains Mono',
    colorTheme: 'Twilight Slate',
    primaryColor: '#f59e0b', // Amber-500
    qrStyle: 'DENSE_SECURE_GRID',
    footerMessage: 'This cryptographic certificate serves as legally defensible evidence of bilateral settlement under Delaware and International banking rules.'
  });

  // 10. Automation Settings
  const [cronJobs, setCronJobs] = useState([
    { id: 'cron-1', name: 'Quarterly Audit Package Compiler', cron: '0 0 1 */3 *', lastRun: '6 days ago', nextRun: 'in 2 months', status: 'ACTIVE' },
    { id: 'cron-2', name: 'Realtime Ledger Re-anchoring', cron: '*/5 * * * *', lastRun: '4 mins ago', nextRun: 'in 1 min', status: 'ACTIVE' },
    { id: 'cron-3', name: 'Reserve Compliance Balance Sweep', cron: '0 0 * * *', lastRun: '18 hours ago', nextRun: 'in 6 hours', status: 'ACTIVE' },
    { id: 'cron-4', name: 'Stripe Reconciliation Sync', cron: '0 */4 * * *', lastRun: '2 hours ago', nextRun: 'in 2 hours', status: 'DISABLED' }
  ]);

  // 11. Platform Health Indicators
  const [healthMetrics, setHealthMetrics] = useState({
    cpu: [12, 14, 11, 15, 12, 14, 13, 15, 12, 14, 13, 16],
    memory: [42, 43, 42, 42, 44, 43, 44, 45, 43, 44, 44, 45],
    storage: 34.2, // %
    dbConnections: 18,
    queueSize: 0,
    apiGatewayLatency: 14 // ms
  });

  // Oscilloscope tick simulator for Platform Health
  useEffect(() => {
    const timer = setInterval(() => {
      setHealthMetrics(prev => {
        const nextCpu = [...prev.cpu.slice(1), Math.max(5, Math.min(95, prev.cpu[prev.cpu.length - 1] + (Math.random() * 6 - 3)))];
        const nextMem = [...prev.memory.slice(1), Math.max(30, Math.min(90, prev.memory[prev.memory.length - 1] + (Math.random() * 2 - 1)))];
        return {
          ...prev,
          cpu: nextCpu,
          memory: nextMem,
          dbConnections: Math.max(10, Math.min(50, prev.dbConnections + Math.floor(Math.random() * 3 - 1))),
          apiGatewayLatency: Math.max(10, Math.min(30, Math.floor(prev.apiGatewayLatency + (Math.random() * 4 - 2)))),
          queueSize: Math.max(0, prev.queueSize + Math.floor(Math.random() * 3 - 1.5))
        };
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fetch /api/config on load to support original functionality
  const fetchDbConfig = async () => {
    setDbLoading(true);
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success) {
        setDbConfig(data.config);
      }
    } catch (err) {
      console.error('Error fetching database config items:', err);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchDbConfig();
  }, []);

  // Handler for saving customized templates or configs
  const handleToastAlert = (message: string, isSuccess: boolean = true) => {
    alert(`${isSuccess ? '✅ SUCCESS' : '❌ ERROR'}: ${message}`);
  };

  // Add DB configuration entry directly supporting original backend update route
  const handleAddDbConfigEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbFormFields.code || !dbFormFields.name) return;

    try {
      const res = await fetch('/api/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'asset_classes',
          item: {
            code: dbFormFields.code.toUpperCase(),
            name: dbFormFields.name,
            type: dbFormFields.type,
            active: true
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setDbConfig(data.config);
        setShowAddDbItem(false);
        setDbFormFields({ code: '', name: '', type: 'FIAT' });
        handleToastAlert('Successfully appended asset class under central backend register.');
      } else {
        handleToastAlert('Action failed: ' + data.error, false);
      }
    } catch (err: any) {
      handleToastAlert('Error saving configuration rule: ' + err.message, false);
    }
  };

  // 12. CONFIGURATION AS DATA EXPORT/IMPORT
  const handleExportConfig = () => {
    const fullConfig = {
      organization: orgState,
      identityAndAccess: { users: iamUsers, roles: rolesList, capabilities: capabilityPermissions },
      governance: { approvalRules },
      policyEngine: policies,
      templates,
      cronJobs,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(fullConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOVR_UEFI_GOVERNANCE_CONFIG.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleToastAlert('UEFI Governance Configuration package compiled and exported successfully.');
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.organization) setOrgState(imported.organization);
        if (imported.identityAndAccess?.users) setIamUsers(imported.identityAndAccess.users);
        if (imported.governance?.approvalRules) setApprovalRules(imported.governance.approvalRules);
        if (imported.policyEngine) setPolicies(imported.policyEngine);
        if (imported.templates) setTemplates(imported.templates);
        if (imported.cronJobs) setCronJobs(imported.cronJobs);
        
        handleToastAlert('UEFI BIOS Governance package parsed and imported. All operating planes updated in real-time!');
      } catch (err) {
        handleToastAlert('Failed to parse imported configuration JSON file. Ensure it is a valid SOVR Governance bundle.', false);
      }
    };
    reader.readAsText(file);
  };

  // Simulating Key Rotation
  const handleKeyRotation = () => {
    setIsRotatingKeys(true);
    setTimeout(() => {
      const newHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setOrgState(prev => ({ ...prev, digitalSeal: newHash }));
      
      const newEvent = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'HSM Signature Key Rotation',
        node: 'Consensus HSM Ledger Signer',
        detail: 'Hardware Security Module co-signed rotated keys safely',
        severity: 'SUCCESS'
      };
      setRecentSecurityEvents(prev => [newEvent, ...prev]);
      setIsRotatingKeys(false);
      handleToastAlert('Asymmetric Cryptographic signing key rotation successfully executed inside safe enclave.');
    }, 2000);
  };

  // Add User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const newId = `usr_${Math.floor(Math.random() * 900) + 100}`;
    setIamUsers(prev => [
      ...prev,
      {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        mfa: newUser.mfa,
        status: 'ACTIVE',
        lastActive: 'Just registered'
      }
    ]);
    setShowAddUser(false);
    setNewUser({ name: '', email: '', role: 'Settlement Operator', mfa: true });
    handleToastAlert(`User ${newUser.name} enrolled and mapped to capability profiles.`);
  };

  // Add Approval Rule
  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `rul_${Math.floor(Math.random() * 900) + 100}`;
    setApprovalRules(prev => [
      ...prev,
      {
        id: newId,
        action: newRule.action,
        threshold: Number(newRule.threshold),
        currency: newRule.currency,
        requiresRoles: newRule.requiresRoles,
        status: 'ACTIVE'
      }
    ]);
    setShowAddRule(false);
    handleToastAlert(`Bilateral approval policy rule compiled and activated in the Governance Ledger.`);
  };

  // Simulate backup comparison and restoring
  const handleCompareAndRestore = () => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      handleToastAlert('System configurations safely rolled back to snapshot state.');
    }, 2000);
  };

  // Menu layout definitions
  const adminMenu = [
    { id: 'Organization', label: 'Organization Plane', icon: Building2, desc: 'Legal identity & environment config' },
    { id: 'IAM', label: 'Identity & Access (IAM)', icon: Users, desc: 'Enroll users, roles & permission matrices' },
    { id: 'Governance', label: 'Governance Engine', icon: Workflow, desc: 'Approval policies & multi-sig thresholds' },
    { id: 'Policy Engine', label: 'Policy Control Plane', icon: Sliders, desc: 'Global ledger retention & webhook rules' },
    { id: 'System Dictionary', label: 'System Dictionary', icon: Database, desc: 'Central Asset classes & code vocabularies' },
    { id: 'Network Topology', label: 'Network Topology', icon: Network, desc: 'Manage nodes, regions & clusters' },
    { id: 'Service Registry', label: 'Service Registry', icon: Server, desc: 'Connected system services & states' },
    { id: 'Security Center', label: 'Security Operations', icon: ShieldCheck, desc: 'Rotations, mTLS certs & secrets enclaves' },
    { id: 'Audit & Recovery', label: 'Audit & Recovery snapshots', icon: Clock, desc: 'UEFI rollback & configurations history' },
    { id: 'Templates', label: 'Output Templates', icon: FileText, desc: 'Brand receipt, certificate & PDF layouts' },
    { id: 'Automation', label: 'Task Automation Plane', icon: Play, desc: 'Manage cron sweeps & synchronization' },
    { id: 'Platform Health', label: 'Platform Diagnostics', icon: Cpu, desc: 'Diagnostic telemetry & system memory' }
  ];

  return (
    <div id="sovr-administration-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs text-white">
      
      {/* 1. LEFT NAVIGATION PANEL (4 columns) */}
      <div className="lg:col-span-4 flex flex-col gap-4 bg-[#050508] border border-[#2a2a35] rounded-lg p-4">
        
        {/* Header / Brand */}
        <div className="pb-3 border-b border-[#2a2a35]/60 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/45 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-white text-[11px] uppercase tracking-wider block">SOVR Admin Plane</span>
              <span className="text-[8px] text-white/40 block">UEFI BIOS CONTROL ENGINE</span>
            </div>
          </div>
          
          <span className="text-[8px] bg-amber-500/15 border border-amber-500/35 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">
            BIOS v4.1
          </span>
        </div>

        {/* Dynamic Global Configuration Import/Export Panel */}
        <div className="bg-[#0b0b12] border border-[#1c1c28] rounded p-2.5 space-y-2">
          <span className="text-[8px] text-white/40 uppercase block font-bold tracking-wider">Configuration as Data</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportConfig}
              className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wide cursor-pointer text-white/80"
            >
              <Download className="w-3 h-3 text-cyan-400" /> Export JSON
            </button>
            <label className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wide cursor-pointer text-white/80 text-center">
              <Upload className="w-3 h-3 text-amber-400" /> Import JSON
              <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
            </label>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <div className="space-y-1">
          <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block px-2 mb-1.5">Governance planes</span>
          <nav className="space-y-0.5">
            {adminMenu.map(menuItem => {
              const IconComponent = menuItem.icon;
              const isSelected = activeMenuSection === menuItem.id;
              return (
                <button
                  key={menuItem.id}
                  onClick={() => setActiveMenuSection(menuItem.id)}
                  className={`w-full text-left flex items-center justify-between px-2.5 py-2 rounded transition-all group cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500/10 border-l-2 border-amber-500 text-white font-bold' 
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-white/30 group-hover:text-white/60'}`} />
                    <div className="flex flex-col">
                      <span className="text-[10.5px] truncate font-medium">{menuItem.label}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-white/40" />
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* 2. RIGHT WORKSPACE CONTENT PANEL (8 columns) */}
      <div className="lg:col-span-8 flex flex-col bg-[#08080c] border border-[#2a2a35] rounded-lg overflow-hidden min-h-[580px]">
        
        {/* Active Subsection Header */}
        <div className="bg-[#0c0c14] border-b border-[#2a2a35] p-4 flex justify-between items-center">
          <div>
            <span className="text-[8px] text-amber-400 font-bold uppercase tracking-widest block">UEFI Bios Section //</span>
            <span className="text-[12px] font-black uppercase text-white mt-0.5 block">
              {adminMenu.find(m => m.id === activeMenuSection)?.label}
            </span>
          </div>
          
          <span className="text-[8.5px] text-white/45 max-w-[280px] text-right font-mono leading-tight uppercase">
            {adminMenu.find(m => m.id === activeMenuSection)?.desc}
          </span>
        </div>

        {/* Dynamic content rendering depending on active subsection */}
        <div className="p-5 flex-grow">
          
          {/* A. ORGANIZATION PLANE */}
          {activeMenuSection === 'Organization' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-[#2a2a35]/40">
                <span className="text-[10px] text-white font-bold uppercase">Operating Entity Identity</span>
                <button
                  onClick={() => {
                    if (isEditingOrg) {
                      handleToastAlert('Operating entity identifiers serialized and written to UEFI storage.');
                    }
                    setIsEditingOrg(!isEditingOrg);
                  }}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded font-bold uppercase text-[9px] cursor-pointer"
                >
                  {isEditingOrg ? '💾 Save Changes' : '⚙️ Edit Config'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                  <span className="text-[8px] text-white/40 uppercase block font-bold">Organization Name</span>
                  {isEditingOrg ? (
                    <input 
                      type="text" 
                      value={orgState.name} 
                      onChange={e => setOrgState({...orgState, name: e.target.value})} 
                      className="w-full bg-[#0d0d16] border border-[#2a2a35] rounded p-1 text-white" 
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-white block mt-0.5">{orgState.name}</span>
                  )}
                </div>

                <div className="space-y-1 bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                  <span className="text-[8px] text-white/40 uppercase block font-bold">Legal Corporate Entity</span>
                  {isEditingOrg ? (
                    <input 
                      type="text" 
                      value={orgState.legalEntity} 
                      onChange={e => setOrgState({...orgState, legalEntity: e.target.value})} 
                      className="w-full bg-[#0d0d16] border border-[#2a2a35] rounded p-1 text-white" 
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-white block mt-0.5">{orgState.legalEntity}</span>
                  )}
                </div>

                <div className="space-y-1 bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                  <span className="text-[8px] text-white/40 uppercase block font-bold">Operating Environment</span>
                  <span className="text-[11px] font-bold text-cyan-400 block mt-0.5">{orgState.operatingEnv}</span>
                </div>

                <div className="space-y-1 bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                  <span className="text-[8px] text-white/40 uppercase block font-bold">Legal Regulatory Jurisdiction</span>
                  {isEditingOrg ? (
                    <input 
                      type="text" 
                      value={orgState.jurisdiction} 
                      onChange={e => setOrgState({...orgState, jurisdiction: e.target.value})} 
                      className="w-full bg-[#0d0d16] border border-[#2a2a35] rounded p-1 text-white" 
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-yellow-400 block mt-0.5">{orgState.jurisdiction}</span>
                  )}
                </div>

                <div className="space-y-1 bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                  <span className="text-[8px] text-white/40 uppercase block font-bold">Operating Time Zone</span>
                  <span className="text-[11px] font-bold text-white block mt-0.5">{orgState.timezone}</span>
                </div>

                <div className="space-y-1 bg-[#050508] p-2.5 border border-[#1c1c28] rounded">
                  <span className="text-[8px] text-white/40 uppercase block font-bold">Base Clearing Currency</span>
                  <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">{orgState.baseCurrency}</span>
                </div>
              </div>

              <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-1.5">
                <span className="text-[8px] text-white/40 uppercase block font-bold">Cryptographic Enterprise digital Seal</span>
                <span className="text-[10px] text-cyan-400 break-all font-mono leading-relaxed bg-black/40 p-2 border border-white/5 rounded block">
                  {orgState.digitalSeal}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0b0b14] border border-[#1c1c28] rounded p-3">
                  <span className="text-[8.5px] text-white/35 font-bold uppercase block mb-1.5">Business Divisions</span>
                  <div className="space-y-1 text-white/80 font-mono text-[9.5px]">
                    {orgState.businessUnits.map((bu, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-white/70">
                        <span className="text-[#f59e0b]">▪</span> {bu}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0b0b14] border border-[#1c1c28] rounded p-3">
                  <span className="text-[8.5px] text-white/35 font-bold uppercase block mb-1.5">Operational Departments</span>
                  <div className="space-y-1 text-white/80 font-mono text-[9.5px]">
                    {orgState.departments.map((dept, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-white/70">
                        <span className="text-[#06b6d4]">▪</span> {dept}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. IAM PANEL */}
          {activeMenuSection === 'IAM' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-[#2a2a35]/40">
                <span className="text-[10px] text-white font-bold uppercase">Enrolled System Operators</span>
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/35 text-amber-400 hover:bg-amber-500/25 rounded font-bold uppercase text-[9px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Enroll Identity
                </button>
              </div>

              {/* Add User Form */}
              {showAddUser && (
                <form onSubmit={handleAddUserSubmit} className="bg-[#050508] p-3 border border-[#2a2a35] rounded space-y-3">
                  <span className="text-[9px] text-amber-400 font-bold uppercase block">Enroll Cryptographic Identity Operator</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Operator Name</label>
                      <input 
                        type="text" 
                        required
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                        placeholder="John Doe" 
                        className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Secure Email</label>
                      <input 
                        type="email" 
                        required
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                        placeholder="j.doe@sovr.clearing" 
                        className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Assigned Role</label>
                      <select 
                        value={newUser.role}
                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                        className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none cursor-pointer"
                      >
                        {rolesList.map(r => (
                          <option key={r} value={r} className="bg-[#0c0c14]">{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 flex items-end">
                      <label className="flex items-center gap-2 text-white/70 select-none pb-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newUser.mfa}
                          onChange={e => setNewUser({...newUser, mfa: e.target.checked})}
                          className="rounded text-amber-400 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold uppercase">Enforce Hardware MFA</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1.5">
                    <button 
                      type="button" 
                      onClick={() => setShowAddUser(false)} 
                      className="px-2.5 py-1 bg-white/5 border border-white/5 text-white/50 hover:text-white rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 bg-amber-500 text-black font-black uppercase rounded text-[9px]"
                    >
                      Enroll Operator
                    </button>
                  </div>
                </form>
              )}

              {/* Users List Table */}
              <div className="border border-white/5 rounded overflow-hidden">
                <div className="grid grid-cols-4 p-2.5 bg-[#0e0e14] border-b border-white/5 font-bold text-white/50 text-[9px] uppercase">
                  <span>Operator</span>
                  <span>Assigned Role</span>
                  <span className="text-center">MFA</span>
                  <span className="text-right">Last Active</span>
                </div>
                <div className="divide-y divide-white/5">
                  {iamUsers.map(usr => (
                    <div key={usr.id} className="grid grid-cols-4 p-2.5 bg-black/15 hover:bg-white/5 items-center">
                      <div>
                        <span className="font-bold text-white block">{usr.name}</span>
                        <span className="text-[8.5px] text-white/35 block font-mono">{usr.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cyan-400 font-medium">{usr.role}</span>
                      </div>
                      <div className="text-center">
                        {usr.mfa ? (
                          <span className="text-[8.5px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded uppercase font-bold">
                            Secured
                          </span>
                        ) : (
                          <span className="text-[8.5px] px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded uppercase font-bold">
                            Missing
                          </span>
                        )}
                      </div>
                      <div className="text-right text-white/40 text-[9px]">
                        <span>{usr.lastActive}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capability-based Permissions Grid Display */}
              <div className="bg-[#0b0b14] border border-[#1c1c28] p-3 rounded">
                <span className="text-[9px] text-white/40 uppercase block font-bold mb-2.5">Capability permission Matrix</span>
                <div className="space-y-2 text-[10px]">
                  {rolesList.map(role => {
                    const permissions = capabilityPermissions[role] || [];
                    return (
                      <div key={role} className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-1.5 last:border-0">
                        <span className="font-bold text-amber-400/80 min-w-[150px]">{role}</span>
                        <div className="flex flex-wrap gap-1 mt-1 md:mt-0">
                          {permissions.length === 0 ? (
                            <span className="text-white/20 uppercase text-[8px]">No authorization credentials</span>
                          ) : (
                            permissions.map(perm => (
                              <span key={perm} className="px-1.5 py-0.5 bg-white/5 border border-white/5 text-white/70 rounded text-[8.5px] font-mono font-medium">
                                {perm}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* C. GOVERNANCE ENGINE */}
          {activeMenuSection === 'Governance' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-[#2a2a35]/40">
                <span className="text-[10px] text-white font-bold uppercase">Dual-Authorization & Multi-Sig Rules</span>
                <button
                  onClick={() => setShowAddRule(!showAddRule)}
                  className="px-2.5 py-1 bg-cyan-400/15 border border-cyan-400/35 text-cyan-400 hover:bg-cyan-400/25 rounded font-bold uppercase text-[9px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Rule
                </button>
              </div>

              {/* Add Rule Form */}
              {showAddRule && (
                <form onSubmit={handleAddRuleSubmit} className="bg-[#050508] p-3 border border-[#2a2a35] rounded space-y-3">
                  <span className="text-[9px] text-cyan-400 font-bold uppercase block">Create Bilateral Approval Policy Rule</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Action Category</label>
                      <select 
                        value={newRule.action}
                        onChange={e => setNewRule({...newRule, action: e.target.value})}
                        className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Settlement Execution">Settlement Execution</option>
                        <option value="Reserve Redistribution">Reserve Redistribution</option>
                        <option value="Secret Key Rotation">Secret Key Rotation</option>
                        <option value="Integrations Modification">Integrations Modification</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Trigger Threshold Amount (USD)</label>
                      <input 
                        type="number" 
                        required
                        value={newRule.threshold}
                        onChange={e => setNewRule({...newRule, threshold: Number(e.target.value)})}
                        placeholder="250000" 
                        className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Required co-signers (Select Roles)</label>
                      <div className="grid grid-cols-2 gap-2 mt-1 bg-black/40 p-2.5 rounded border border-[#2a2a35]">
                        {rolesList.map(role => {
                          const isSelected = newRule.requiresRoles.includes(role);
                          return (
                            <label key={role} className="flex items-center gap-1.5 text-[9.5px] cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setNewRule({...newRule, requiresRoles: newRule.requiresRoles.filter(r => r !== role)});
                                  } else {
                                    setNewRule({...newRule, requiresRoles: [...newRule.requiresRoles, role]});
                                  }
                                }}
                                className="rounded text-cyan-400 focus:ring-0 cursor-pointer"
                              />
                              <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-white/50'}>{role}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1.5">
                    <button 
                      type="button" 
                      onClick={() => setShowAddRule(false)} 
                      className="px-2.5 py-1 bg-white/5 border border-white/5 text-white/50 hover:text-white rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 bg-cyan-500 text-black font-black uppercase rounded text-[9px]"
                    >
                      Enforce Policy Rule
                    </button>
                  </div>
                </form>
              )}

              {/* Rules List Grid */}
              <div className="space-y-3">
                {approvalRules.map(rule => (
                  <div key={rule.id} className="bg-black/20 p-3.5 border border-[#1c1c28] rounded flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-[11px]">{rule.action}</span>
                        <span className="text-[8px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-1 py-0.5 rounded font-bold uppercase">
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-white/40 leading-normal">
                        Triggers on sums exceeding <span className="text-emerald-400 font-bold">${rule.threshold.toLocaleString()} {rule.currency}</span>.
                      </p>
                    </div>

                    <div className="bg-[#050508] p-2 border border-white/5 rounded shrink-0 space-y-1">
                      <span className="text-[7.5px] text-white/35 uppercase block font-bold">Required Authorized Endorsers</span>
                      <div className="flex flex-wrap gap-1">
                        {rule.requiresRoles.map(role => (
                          <span key={role} className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[8px] font-bold uppercase">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Four Eyes Governance Diagram */}
              <div className="bg-[#0b0b14] p-3 rounded border border-[#1c1c28] text-[9.5px] leading-relaxed text-white/80 space-y-2">
                <span className="text-[9px] text-white/40 uppercase block font-bold">Governance execution flow diagram</span>
                <p>All settlements above threshold levels queue automatically. Movement is frozen until multiple asymmetric hardware keys attest with valid cryptographic signatures.</p>
                <div className="bg-[#030305] p-2.5 rounded border border-white/5 font-mono text-[9px] text-cyan-400/80 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>SETTLEMENT_INITIATED ➜ MULTISIG_GATE_QUEUED [Requires Co-Signers attestation] ➜ BLOCKCHAIN_ANCHORED</span>
                </div>
              </div>
            </div>
          )}

          {/* D. POLICY ENGINE */}
          {activeMenuSection === 'Policy Engine' && (
            <div className="space-y-4 animate-fadeIn">
              <span className="text-[10px] text-white font-bold uppercase block border-b border-[#2a2a35]/40 pb-2">Global Ledger Policy Control Matrix</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-2">
                  <label className="text-[8.5px] text-white/40 uppercase block font-bold">Evidence Vault Retention Lifecycle</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="1" 
                      max="30" 
                      value={policies.receiptRetentionYears}
                      onChange={e => setPolicies({...policies, receiptRetentionYears: Number(e.target.value)})}
                      className="w-full accent-amber-500"
                    />
                    <span className="text-[11px] font-bold text-white min-w-[50px] text-right shrink-0">
                      {policies.receiptRetentionYears} Years
                    </span>
                  </div>
                  <p className="text-[8px] text-white/35 leading-tight uppercase">Defines the duration that cryptographic receipt metadata, certificates, and manifests reside in high-availability enclaves.</p>
                </div>

                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-2">
                  <label className="text-[8.5px] text-white/40 uppercase block font-bold">Certificate Generation Mandate</label>
                  <div className="flex gap-2">
                    {['REQUIRED', 'OPTIONAL', 'BY_METRIC'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPolicies({...policies, certificateGeneration: opt})}
                        className={`flex-1 py-1 text-center font-bold rounded border ${
                          policies.certificateGeneration === opt 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300' 
                            : 'bg-black/40 border-[#1c1c28] text-white/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-white/35 leading-tight uppercase">Requires clearing signatures to issue a formal settlement voucher immediately upon ledger posted confirmation.</p>
                </div>

                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-2">
                  <label className="text-[8.5px] text-white/40 uppercase block font-bold">Automatic chain Anchoring anchor</label>
                  <div className="flex gap-2">
                    {['ENABLED', 'DISABLED'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPolicies({...policies, chainAnchoring: opt})}
                        className={`flex-1 py-1 text-center font-bold rounded border ${
                          policies.chainAnchoring === opt 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' 
                            : 'bg-black/40 border-[#1c1c28] text-white/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-white/35 leading-tight uppercase">Determines if ledger entries must automatically trigger notary block anchorage on the immutable sovereign blockchain ledger.</p>
                </div>

                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-2">
                  <label className="text-[8.5px] text-white/40 uppercase block font-bold">Public QR Code Verification Portal</label>
                  <div className="flex gap-2">
                    {['ENABLED', 'DISABLED'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPolicies({...policies, qrVerification: opt})}
                        className={`flex-1 py-1 text-center font-bold rounded border ${
                          policies.qrVerification === opt 
                            ? 'bg-purple-500/10 border-purple-500 text-purple-300' 
                            : 'bg-black/40 border-[#1c1c28] text-white/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-white/35 leading-tight uppercase">Allows outside parties and auditors to verify transactions offline via QR scanning against public trust keys.</p>
                </div>
              </div>

              <div className="bg-[#0b0b14] border border-[#1c1c28] p-3 rounded space-y-2">
                <span className="text-[9px] text-white/40 uppercase block font-bold">Policy rules status indicators</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[9.5px]">
                  <div className="flex items-center justify-between bg-black/30 p-2 border border-white/5 rounded">
                    <span className="text-white/40">Retry Webhook:</span>
                    <span className="text-white font-bold">{policies.webhookRetryLimit}x</span>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 p-2 border border-white/5 rounded">
                    <span className="text-white/40">ZIP Build:</span>
                    <span className="text-emerald-400 font-bold">{policies.automaticZipCompilation ? 'AUTO' : 'MANUAL'}</span>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 p-2 border border-white/5 rounded">
                    <span className="text-white/40">Notification retries:</span>
                    <span className="text-white font-bold">{policies.maxNotificationRetries}x</span>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 p-2 border border-white/5 rounded">
                    <span className="text-white/40">Audit sync:</span>
                    <span className="text-cyan-400 font-bold">{policies.ledgerReconciliationFrequency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* E. SYSTEM DICTIONARY (Supports original system configuration vocabularies) */}
          {activeMenuSection === 'System Dictionary' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-[#2a2a35]/40">
                <div>
                  <span className="text-[10px] text-white font-bold uppercase">System Vocabularies & Entities Registry</span>
                  <p className="text-[8px] text-white/35 leading-normal uppercase">Synchronized with central database configuration endpoint</p>
                </div>
                <button
                  onClick={() => setShowAddDbItem(!showAddDbItem)}
                  className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-300 rounded font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Code
                </button>
              </div>

              {/* Add Code Item directly supporting /api/config/update */}
              {showAddDbItem && (
                <form onSubmit={handleAddDbConfigEntry} className="bg-[#050508] p-3 border border-[#2a2a35] rounded space-y-3">
                  <span className="text-[9px] text-cyan-400 font-bold uppercase block">Add Central Database Asset Class</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Code Identifier</label>
                      <input 
                        type="text" 
                        required
                        value={dbFormFields.code} 
                        onChange={e => setDbFormFields({ ...dbFormFields, code: e.target.value.toUpperCase() })}
                        placeholder="E.g. JPY" 
                        className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[8px] text-white/40 uppercase block">Name / Label</label>
                      <input 
                        type="text" 
                        required
                        value={dbFormFields.name} 
                        onChange={e => setDbFormFields({ ...dbFormFields, name: e.target.value })}
                        placeholder="E.g. Japanese Yen" 
                        className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddDbItem(false)} 
                      className="px-2.5 py-1 bg-[#14141e] border border-[#2a2a35] text-white/60 hover:text-white rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold uppercase text-[9px]"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              )}

              {/* Database Vocabulary Section Display */}
              <div className="space-y-3">
                {dbLoading ? (
                  <div className="text-center py-12 text-white/40 font-mono flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                    <span>Querying central DB schema...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Database Asset classes */}
                    <div className="bg-[#0b0b14] p-3 border border-[#1c1c28] rounded">
                      <span className="text-[8.5px] text-cyan-400 font-bold uppercase block mb-2 border-b border-white/5 pb-1">Asset Classes (DB Sync)</span>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto">
                        {(dbConfig?.asset_classes || [
                          { code: 'USD', name: 'United States Dollar', type: 'FIAT' },
                          { code: 'EUR', name: 'Euro Union Common', type: 'FIAT' },
                          { code: 'GBP', name: 'British Sterling', type: 'FIAT' }
                        ]).map((ac: any, idx: number) => (
                          <div key={idx} className="flex justify-between p-1 hover:bg-white/5 rounded">
                            <span className="font-bold text-white font-mono">{ac.code}</span>
                            <span className="text-white/60 truncate max-w-[120px]">{ac.name}</span>
                            <span className="text-[7px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-1 rounded">fiat</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Regions */}
                    <div className="bg-[#0b0b14] p-3 border border-[#1c1c28] rounded">
                      <span className="text-[8.5px] text-amber-400 font-bold uppercase block mb-2 border-b border-white/5 pb-1">Operating Regions</span>
                      <div className="space-y-1">
                        {(dbConfig?.regions || [
                          { code: 'US_EAST', name: 'N. Virginia Enclave' },
                          { code: 'EU_CENTRAL', name: 'Frankfurt Hub' },
                          { code: 'APAC_EAST', name: 'Tokyo Node Cluster' }
                        ]).map((reg: any, idx: number) => (
                          <div key={idx} className="flex justify-between p-1 hover:bg-white/5 rounded">
                            <span className="font-bold text-white font-mono">{reg.code}</span>
                            <span className="text-white/60 truncate max-w-[140px]">{reg.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* F. NETWORK TOPOLOGY */}
          {activeMenuSection === 'Network Topology' && (
            <div className="space-y-4 animate-fadeIn">
              <span className="text-[10px] text-white font-bold uppercase block border-b border-[#2a2a35]/40 pb-2">Consensus Nodes & Global Clusters</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Panel: Active Nodes list & selection details */}
                <div className="space-y-4">
                  <div className="bg-[#050508] border border-[#1c1c28] rounded p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] text-white/35 font-bold uppercase block">Active Network Nodes</span>
                      <span className="text-[7.5px] text-white/30 uppercase">Click a node to select</span>
                    </div>
                    
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-none">
                      {networkNodes.map(node => {
                        const isSelected = selectedNodeId === node.id;
                        return (
                          <div 
                            key={node.id} 
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`flex items-center justify-between p-2 rounded border transition-all text-[9px] cursor-pointer ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500/50 text-white font-bold' 
                                : 'bg-black/40 border-white/5 text-white/80 hover:bg-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                node.status === 'ACTIVE' 
                                  ? 'bg-emerald-400' 
                                  : node.status === 'DRAINING' 
                                    ? 'bg-amber-400' 
                                    : 'bg-rose-500'
                              }`} />
                              <span className="font-bold text-white">{node.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/40">{node.region}</span>
                              <span className="text-cyan-400 font-bold uppercase">{node.type.split(' ')[0]}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Node Details & Operations */}
                  {selectedNodeId && (
                    <div className="bg-[#09090f] border border-[#1c1c28] rounded p-3 space-y-2.5 animate-fadeIn">
                      {(() => {
                        const node = networkNodes.find(n => n.id === selectedNodeId);
                        if (!node) return <p className="text-[9px] text-white/40">Select a node from the active mesh above.</p>;
                        return (
                          <>
                            <div className="flex justify-between items-start border-b border-white/5 pb-1.5">
                              <div>
                                <span className="text-[9px] font-bold text-amber-400 block uppercase">Node Parameters</span>
                                <span className="text-[11px] font-black text-white">{node.name}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                                node.status === 'ACTIVE' 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                {node.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                              <div className="bg-[#030305] p-1.5 border border-white/5 rounded">
                                <span className="text-white/35 uppercase block text-[7px] font-bold">Node ID</span>
                                <span className="text-white/80">{node.id}</span>
                              </div>
                              <div className="bg-[#030305] p-1.5 border border-white/5 rounded">
                                <span className="text-white/35 uppercase block text-[7px] font-bold">Type Class</span>
                                <span className="text-cyan-400 font-bold">{node.type}</span>
                              </div>
                              <div className="bg-[#030305] p-1.5 border border-white/5 rounded">
                                <span className="text-white/35 uppercase block text-[7px] font-bold">Operating Region</span>
                                <span className="text-white/80">{node.region}</span>
                              </div>
                              <div className="bg-[#030305] p-1.5 border border-white/5 rounded">
                                <span className="text-white/35 uppercase block text-[7px] font-bold">Health Status</span>
                                <span className="text-emerald-400 font-bold">{node.health}</span>
                              </div>
                              <div className="bg-[#030305] p-1.5 border border-white/5 rounded">
                                <span className="text-white/35 uppercase block text-[7px] font-bold">Allocated CPU</span>
                                <span className="text-white/80">{node.cpu} Cores</span>
                              </div>
                              <div className="bg-[#030305] p-1.5 border border-white/5 rounded">
                                <span className="text-white/35 uppercase block text-[7px] font-bold">Allocated Memory</span>
                                <span className="text-white/80">{node.memory} GB</span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => {
                                  setNetworkNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'DRAINING' } : n));
                                  setNodeLogs(prev => [`[${new Date().toLocaleTimeString()}] Draining traffic from node: ${node.name}`, ...prev]);
                                  handleToastAlert(`Traffic drain sequence initiated for node: ${node.name}`);
                                }}
                                disabled={node.status === 'DRAINING'}
                                className="flex-1 py-1 px-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:bg-white/5 disabled:text-white/20 text-amber-400 border border-amber-500/20 disabled:border-white/5 rounded font-black uppercase text-[8px] cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Drain Node
                              </button>
                              <button
                                onClick={() => {
                                  setNetworkNodes(prev => prev.filter(n => n.id !== node.id));
                                  setNodeLogs(prev => [`[${new Date().toLocaleTimeString()}] Decommissioned and retired node: ${node.name}`, ...prev]);
                                  setSelectedNodeId(null);
                                  handleToastAlert(`Node retired successfully: ${node.name}`);
                                }}
                                className="flex-1 py-1 px-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 rounded font-black uppercase text-[8px] cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Trash2 className="w-2.5 h-2.5" /> Retire Node
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Right Panel: Node deployment control form */}
                <div className="bg-[#0b0b14] border border-[#1c1c28] rounded p-3 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[8.5px] text-white/35 font-bold uppercase block mb-1">Infrastructure Control Node Deployment</span>
                    <p className="text-[9px] text-white/70 leading-normal">Configure and provision a new validation, oracle, or gateway node to the consensus cluster safely.</p>
                    
                    <div className="space-y-2.5 pt-1">
                      <div className="space-y-1">
                        <label className="text-[8px] text-white/40 uppercase block font-bold">Node Name</label>
                        <input 
                          type="text" 
                          value={deployingNode.name}
                          onChange={e => setDeployingNode({...deployingNode, name: e.target.value})}
                          placeholder="SOVR Node Name"
                          className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white text-[9.5px] focus:outline-none focus:border-cyan-400/60 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 uppercase block font-bold">Node Class Type</label>
                          <select 
                            value={deployingNode.type}
                            onChange={e => setDeployingNode({...deployingNode, type: e.target.value})}
                            className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white text-[9.5px] focus:outline-none focus:border-cyan-400/60 cursor-pointer font-mono"
                          >
                            <option value="Validator Node">Validator Node</option>
                            <option value="Oracle Node">Oracle Node</option>
                            <option value="Gateway Node">Gateway Node</option>
                            <option value="Settlement Node">Settlement Node</option>
                            <option value="Backup Node">Backup Node</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 uppercase block font-bold">Operating Region</label>
                          <select 
                            value={deployingNode.region}
                            onChange={e => setDeployingNode({...deployingNode, region: e.target.value})}
                            className="w-full bg-[#050508] border border-[#2a2a35] rounded p-1.5 text-white text-[9.5px] focus:outline-none focus:border-cyan-400/60 cursor-pointer font-mono"
                          >
                            <option value="us-east-1">us-east-1 (N. Virginia)</option>
                            <option value="us-west-2">us-west-2 (Oregon)</option>
                            <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                            <option value="ap-northeast-1">ap-northeast-1 (Tokyo)</option>
                            <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 uppercase block font-bold">CPU Core Allocation</label>
                          <div className="flex items-center gap-2 bg-[#050508] border border-[#2a2a35] rounded px-2 py-1.5">
                            <input 
                              type="range" 
                              min="2" 
                              max="64" 
                              step="2"
                              value={deployingNode.cpu}
                              onChange={e => setDeployingNode({...deployingNode, cpu: Number(e.target.value)})}
                              className="w-full accent-cyan-400"
                            />
                            <span className="text-[9px] font-bold text-cyan-400 shrink-0 w-8 text-right font-mono">{deployingNode.cpu}C</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 uppercase block font-bold">RAM Allocation</label>
                          <div className="flex items-center gap-2 bg-[#050508] border border-[#2a2a35] rounded px-2 py-1.5">
                            <input 
                              type="range" 
                              min="4" 
                              max="256" 
                              step="4"
                              value={deployingNode.memory}
                              onChange={e => setDeployingNode({...deployingNode, memory: Number(e.target.value)})}
                              className="w-full accent-cyan-400"
                            />
                            <span className="text-[9px] font-bold text-cyan-400 shrink-0 w-11 text-right font-mono">{deployingNode.memory}GB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!deployingNode.name.trim()) {
                        handleToastAlert('Node Name cannot be empty.', false);
                        return;
                      }
                      const nextId = `node-${deployingNode.region}-${Math.floor(Math.random() * 90) + 10}`;
                      const newNode: NetworkNode = {
                        id: nextId,
                        name: deployingNode.name,
                        type: deployingNode.type,
                        region: deployingNode.region,
                        status: 'ACTIVE',
                        health: 'HEALTHY',
                        cpu: deployingNode.cpu,
                        memory: deployingNode.memory
                      };
                      setNetworkNodes([...networkNodes, newNode]);
                      setSelectedNodeId(newNode.id);
                      setNodeLogs(prev => [`[${new Date().toLocaleTimeString()}] Provisioned regional node: ${newNode.name} (${newNode.type}) in region ${newNode.region}`, ...prev]);
                      
                      // Auto generate a next name suggest
                      const nextNames = [
                        'SOVR Oracle London Hub', 'SOVR Gateway Singapore', 'SOVR Clearing Sydney', 'SOVR Validator Dublin'
                      ];
                      const nextName = nextNames[Math.floor(Math.random() * nextNames.length)];
                      const nextRegions = ['eu-west-1', 'ap-southeast-1', 'ap-southeast-2', 'eu-west-1'];
                      const randIdx = Math.floor(Math.random() * nextNames.length);
                      setDeployingNode({
                        name: nextNames[randIdx],
                        type: 'Validator Node',
                        region: nextRegions[randIdx],
                        cpu: 16,
                        memory: 64
                      });
                      
                      handleToastAlert(`Consensus node ${newNode.name} deployed. Merkle verification handshake complete.`);
                    }}
                    className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/35 rounded font-black uppercase text-[9px] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" /> Deploy Custom Node
                  </button>
                </div>
              </div>

              {/* Console log logs stream */}
              <div className="bg-black border border-[#1c1c28] rounded p-3 space-y-1.5">
                <span className="text-[8px] text-white/35 font-bold uppercase block">Infrastructure log stream</span>
                <div className="space-y-1 text-[8.5px] text-emerald-400/80 font-mono">
                  {nodeLogs.map((log, i) => (
                    <div key={i} className="flex gap-1">
                      <span>&gt;</span> <span className="truncate">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* G. SERVICE REGISTRY */}
          {activeMenuSection === 'Service Registry' && (
            <div className="space-y-4 animate-fadeIn">
              <span className="text-[10px] text-white font-bold uppercase block border-b border-[#2a2a35]/40 pb-2">Installed services Mesh Control</span>
              
              <div className="space-y-2.5">
                {services.map(srv => (
                  <div key={srv.id} className="bg-black/20 p-3.5 border border-[#1c1c28] rounded flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-white/10 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-[11px]">{srv.name}</span>
                        <span className="text-[8px] text-white/40">{srv.version}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          srv.status === 'RUNNING' 
                            ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400' 
                            : srv.status === 'MAINTENANCE' 
                              ? 'bg-yellow-500/15 border border-yellow-500/25 text-yellow-400'
                              : 'bg-rose-500/15 border border-rose-500/25 text-rose-400'
                        }`}>
                          {srv.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[9.5px] text-white/50">
                        <span className="text-[8px] text-white/35 uppercase">Dependencies:</span>
                        {srv.dependencies.map(dep => (
                          <span key={dep} className="px-1 bg-white/5 rounded text-[8.5px]">{dep}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setServices(services.map(s => s.id === srv.id ? { ...s, status: 'RUNNING' } : s));
                          handleToastAlert(`Service ${srv.name} started successfully.`);
                        }}
                        disabled={srv.status === 'RUNNING'}
                        className={`px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-[8px] font-bold uppercase cursor-pointer disabled:opacity-40`}
                      >
                        Start
                      </button>
                      <button
                        onClick={() => {
                          setServices(services.map(s => s.id === srv.id ? { ...s, status: 'STOPPED' } : s));
                          handleToastAlert(`Service ${srv.name} stopped.`);
                        }}
                        disabled={srv.status === 'STOPPED'}
                        className={`px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded text-[8px] font-bold uppercase cursor-pointer disabled:opacity-40`}
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* H. SECURITY CENTER */}
          {activeMenuSection === 'Security Center' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Overall security status panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded text-center">
                  <span className="text-[8px] text-white/45 uppercase block font-bold">UEFI Security Score</span>
                  <span className="text-[20px] font-black text-emerald-400 mt-1.5 block font-mono">
                    {securityScore}%
                  </span>
                  <span className="text-[8px] text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded uppercase font-bold mt-1 inline-block">
                    NOMINAL RATING
                  </span>
                </div>

                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded text-center">
                  <span className="text-[8px] text-white/45 uppercase block font-bold">Secrets in rotation</span>
                  <span className="text-[20px] font-black text-cyan-400 mt-1.5 block font-mono">
                    {secretsNearExpiration} Near Expiry
                  </span>
                  <button
                    onClick={handleKeyRotation}
                    disabled={isRotatingKeys}
                    className="mt-1.5 w-full py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/35 text-cyan-300 rounded font-bold uppercase text-[8px] cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isRotatingKeys ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : null}
                    Force Enclave Rotation
                  </button>
                </div>

                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded text-center">
                  <span className="text-[8px] text-white/45 uppercase block font-bold">Threat Alerts logged</span>
                  <span className="text-[20px] font-black text-white mt-1.5 block font-mono">
                    {failedLogins} Events
                  </span>
                  <span className="text-[8px] text-white/45 bg-white/5 px-1.5 py-0.5 rounded uppercase font-bold mt-1 inline-block">
                    0 EXPLOITS LOGGED
                  </span>
                </div>
              </div>

              {/* Active Certificates Table */}
              <div className="space-y-2">
                <span className="text-[9px] text-white/45 font-bold uppercase block">Active Cryptographic Certificates</span>
                <div className="border border-white/5 rounded overflow-hidden text-[9px]">
                  <div className="grid grid-cols-3 p-2 bg-[#0e0e14] border-b border-white/5 font-bold text-white/50 uppercase">
                    <span>Certificate Certificate Name</span>
                    <span>Issuer Root</span>
                    <span className="text-right">Expiration countdown</span>
                  </div>
                  <div className="divide-y divide-white/5 font-mono">
                    {activeCertificates.map(cert => (
                      <div key={cert.id} className="grid grid-cols-3 p-2 bg-black/15 hover:bg-white/5 items-center">
                        <span className="text-white font-bold">{cert.name}</span>
                        <span className="text-white/55">{cert.issuer}</span>
                        <div className="text-right">
                          <span className={`px-1 rounded font-bold ${
                            cert.status === 'HEALTHY' ? 'text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {cert.expires}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Threat log events */}
              <div className="bg-[#0b0b14] p-3 border border-[#1c1c28] rounded space-y-2">
                <span className="text-[8.5px] text-white/35 font-bold uppercase block">Enclave Threat Detection Stream</span>
                <div className="space-y-1.5 font-mono text-[8.5px]">
                  {recentSecurityEvents.map((evt, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-1 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/45">[{evt.timestamp}]</span>
                        <span className={`font-bold ${
                          evt.severity === 'HIGH_ALERT' ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
                        }`}>{evt.type}:</span>
                        <span className="text-white/85">{evt.detail}</span>
                      </div>
                      <span className="text-white/30 truncate max-w-[120px]">{evt.node}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* I. AUDIT & RECOVERY (Rollbacks / Comparison) */}
          {activeMenuSection === 'Audit & Recovery' && (
            <div className="space-y-4 animate-fadeIn">
              <span className="text-[10px] text-white font-bold uppercase block border-b border-[#2a2a35]/40 pb-2">UEFI Backup rollbacks & Snapshot History</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Timeline of snapshots */}
                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-2">
                  <span className="text-[8.5px] text-white/35 font-bold uppercase block">Configuration snapshots timeline</span>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {snapshots.map(snap => (
                      <button
                        key={snap.id}
                        type="button"
                        onClick={() => setSelectedSnapForCompare(snap.id)}
                        className={`w-full text-left p-2 rounded border text-[9px] cursor-pointer transition-all ${
                          selectedSnapForCompare === snap.id 
                            ? 'bg-amber-500/10 border-amber-500/55' 
                            : 'bg-black/30 border-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-white">Snapshot v{snap.version}</span>
                          <span className="text-white/35">{new Date(snap.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white/60 truncate">{snap.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compare & Restore panel */}
                <div className="bg-[#0b0b14] border border-[#1c1c28] rounded p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[8.5px] text-white/35 font-bold uppercase block">UEFI Rollback comparison tool</span>
                    <p className="text-[9.5px] text-white/70 leading-normal mt-1 mb-2.5">Select a historical snapshot on the left and choose a target baseline snapshot to verify file diffs before rollbacks.</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-[8.5px] mb-2">
                      <div className="bg-black/40 p-1.5 rounded border border-white/5">
                        <span className="text-white/35 block">SNAPSHOT A:</span>
                        <span className="text-amber-400 font-bold block mt-0.5">{selectedSnapForCompare} (Active selection)</span>
                      </div>
                      <div className="bg-black/40 p-1.5 rounded border border-white/5">
                        <span className="text-white/35 block">BASELINE B:</span>
                        <select 
                          value={compareSnapTo}
                          onChange={e => setCompareSnapTo(e.target.value)}
                          className="bg-[#08080c] text-cyan-400 border border-white/5 rounded px-1.5 py-0.5 mt-0.5 cursor-pointer font-mono text-[8.5px] focus:outline-none"
                        >
                          {snapshots.map(s => (
                            <option key={s.id} value={s.id}>{s.id} (v{s.version})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setIsComparing(true);
                        setTimeout(() => setIsComparing(false), 1500);
                      }}
                      className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase text-[8.5px] border border-white/10"
                    >
                      {isComparing ? 'Comparing files...' : '🔍 Compare Snapshots Diff'}
                    </button>
                    <button
                      onClick={handleCompareAndRestore}
                      disabled={isRestoring}
                      className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/35 rounded font-black uppercase text-[8.5px] cursor-pointer flex items-center justify-center gap-1"
                    >
                      {isRestoring ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                      Restore snapshot states
                    </button>
                  </div>
                </div>

              </div>

              {/* simulated comparing diff representation */}
              <AnimatePresence>
                {selectedSnapForCompare && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#030305] p-3 rounded border border-[#1c1c28] space-y-1"
                  >
                    <span className="text-[8px] text-cyan-400 font-bold uppercase block">File Diff output code</span>
                    <div className="font-mono text-[8.5px] text-white/50 space-y-0.5">
                      <div className="text-emerald-400">+ "dual_sign_threshold": 250000,</div>
                      <div className="text-emerald-400">+ "requires_signatures": ["Treasury Officer", "Compliance Reviewer"],</div>
                      <div className="text-rose-400">- "dual_sign_threshold": 500000,</div>
                      <div>  "base_operating_jurisdiction": "Delaware, USA / Basel III"</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* J. TEMPLATES */}
          {activeMenuSection === 'Templates' && (
            <div className="space-y-4 animate-fadeIn">
              <span className="text-[10px] text-white font-bold uppercase block border-b border-[#2a2a35]/40 pb-2">Custom brand and PDF output Layouts</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customizer forms */}
                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] text-white/40 uppercase block">Voucher Header text</label>
                    <input 
                      type="text" 
                      value={templates.receiptTitle}
                      onChange={e => setTemplates({...templates, receiptTitle: e.target.value.toUpperCase()})}
                      className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-white/40 uppercase block">Primary Layout Color theme</label>
                    <div className="flex gap-2">
                      {[
                        { name: 'Amber Glow', color: '#f59e0b' },
                        { name: 'Sovereign Cyan', color: '#06b6d4' },
                        { name: 'Emerald Ledger', color: '#10b981' },
                        { name: 'Enterprise Blue', color: '#3b82f6' }
                      ].map(t => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => setTemplates({...templates, colorTheme: t.name, primaryColor: t.color})}
                          className={`flex-1 py-1 text-center font-bold rounded text-[8.5px] border ${
                            templates.colorTheme === t.name 
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                              : 'bg-black/40 border-[#1c1c28] text-white/40'
                          }`}
                        >
                          {t.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-white/40 uppercase block">Receipt Disclaimer Text</label>
                    <textarea 
                      value={templates.footerMessage}
                      onChange={e => setTemplates({...templates, footerMessage: e.target.value})}
                      className="w-full bg-[#0a0a14] border border-[#2a2a35] rounded p-1.5 text-white text-[9px] focus:outline-none font-mono h-16 resize-none"
                    />
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="bg-[#0b0b14] border border-[#1c1c28] rounded p-3.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[8.5px] text-white/35 font-bold uppercase block mb-1.5">Live Output Preview</span>
                    
                    {/* Simulated Receipt Voucher preview */}
                    <div className="bg-black/50 border border-white/5 rounded p-3 font-mono text-[9px] space-y-2">
                      <div className="border-b border-dashed border-white/10 pb-1.5 text-center">
                        <span className="font-bold text-white block tracking-wider" style={{ color: templates.primaryColor }}>
                          {templates.receiptTitle || 'SOVR RECEIPT'}
                        </span>
                        <span className="text-[7.5px] text-white/40">DIGITAL CERTIFICATE PROOF</span>
                      </div>
                      
                      <div className="space-y-1 text-white/70">
                        <div className="flex justify-between"><span>TX_HASH:</span> <span className="text-cyan-400">0x8f7d9a102b3c...</span></div>
                        <div className="flex justify-between"><span>CLEARANCE:</span> <span className="text-white font-bold">$125,000.00 USD</span></div>
                        <div className="flex justify-between"><span>SETTLEMENT:</span> <span className="text-emerald-400 font-bold">SUCCESS</span></div>
                      </div>

                      <div className="border-t border-dashed border-white/10 pt-1.5 text-[7.5px] text-white/35 leading-tight text-center italic">
                        {templates.footerMessage}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToastAlert('Brand templates compiled and synced to PDF generation pipeline.')}
                    className="w-full py-1.5 mt-2 bg-amber-500 text-black font-black uppercase rounded text-[9px]"
                  >
                    Sync output templates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* K. AUTOMATION */}
          {activeMenuSection === 'Automation' && (
            <div className="space-y-4 animate-fadeIn">
              <span className="text-[10px] text-white font-bold uppercase block border-b border-[#2a2a35]/40 pb-2">Task scheduler & cron automation</span>
              
              <div className="space-y-2.5">
                {cronJobs.map(job => (
                  <div key={job.id} className="bg-black/20 p-3 border border-[#1c1c28] rounded flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-white/10 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-[10.5px]">{job.name}</span>
                        <span className="text-[8.5px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded font-mono text-cyan-400 font-bold">
                          {job.cron}
                        </span>
                      </div>
                      <div className="text-[9px] text-white/40 flex items-center gap-3">
                        <span>Last run: {job.lastRun}</span>
                        <span>•</span>
                        <span>Next run: {job.nextRun}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleToastAlert(`Enclave job "${job.name}" triggered manual run execution.`);
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold rounded text-[8px] uppercase"
                      >
                        Run Now
                      </button>

                      <button
                        onClick={() => {
                          const nextStatus = job.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                          setCronJobs(cronJobs.map(j => j.id === job.id ? { ...j, status: nextStatus } : j));
                          handleToastAlert(`Job "${job.name}" updated to state: ${nextStatus}`);
                        }}
                        className={`px-2 py-1 rounded text-[8px] font-bold uppercase cursor-pointer border ${
                          job.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}
                      >
                        {job.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* L. PLATFORM DIAGNOSTICS */}
          {activeMenuSection === 'Platform Health' && (
            <div className="space-y-4 animate-fadeIn">
              <span className="text-[10px] text-white font-bold uppercase block border-b border-[#2a2a35]/40 pb-2">UEFI Diagnostic Telemetry</span>
              
              {/* Telemetry charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* CPU Core load oscilloscope */}
                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-2">
                  <div className="flex justify-between items-center text-[8.5px]">
                    <span className="text-white/45 font-bold uppercase">Consensus CPU core load</span>
                    <span className="text-emerald-400 font-bold font-mono">{healthMetrics.cpu[healthMetrics.cpu.length - 1].toFixed(1)}%</span>
                  </div>
                  
                  {/* Dynamic SVG Sparkline Graph */}
                  <div className="h-14 bg-black/50 border border-white/5 rounded relative overflow-hidden flex items-end">
                    <svg className="w-full h-full absolute inset-0">
                      <path
                        d={`M 0 ${56 - (healthMetrics.cpu[0] / 100) * 56} ${healthMetrics.cpu.map((val, idx) => `L ${(idx / (healthMetrics.cpu.length - 1)) * 360} ${56 - (val / 100) * 56}`).join(' ')}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute bottom-1 right-2 font-mono text-[7px] text-white/30">SWEEP SECURE</div>
                  </div>
                </div>

                {/* Memory load oscilloscope */}
                <div className="bg-[#050508] p-3 border border-[#1c1c28] rounded space-y-2">
                  <div className="flex justify-between items-center text-[8.5px]">
                    <span className="text-white/45 font-bold uppercase">System Memory usage</span>
                    <span className="text-cyan-400 font-bold font-mono">{healthMetrics.memory[healthMetrics.memory.length - 1].toFixed(1)}%</span>
                  </div>
                  
                  {/* Dynamic SVG Sparkline Graph */}
                  <div className="h-14 bg-black/50 border border-white/5 rounded relative overflow-hidden flex items-end">
                    <svg className="w-full h-full absolute inset-0">
                      <path
                        d={`M 0 ${56 - (healthMetrics.memory[0] / 100) * 56} ${healthMetrics.memory.map((val, idx) => `L ${(idx / (healthMetrics.memory.length - 1)) * 360} ${56 - (val / 100) * 56}`).join(' ')}`}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute bottom-1 right-2 font-mono text-[7px] text-white/30">SWEEP SECURE</div>
                  </div>
                </div>

              </div>

              {/* Status parameters grids */}
              <div className="bg-[#0b0b14] border border-[#1c1c28] p-3 rounded">
                <span className="text-[9px] text-white/35 font-bold uppercase block mb-2">Detailed Platform stats</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[9.5px]">
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <span className="text-white/40 block">Storage Volume:</span>
                    <span className="text-white font-bold block mt-0.5">{healthMetrics.storage}% filled</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <span className="text-white/40 block">DB Connections:</span>
                    <span className="text-white font-bold block mt-0.5">{healthMetrics.dbConnections} active</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <span className="text-white/40 block">API Gateway Latency:</span>
                    <span className="text-emerald-400 font-bold block mt-0.5">{healthMetrics.apiGatewayLatency}ms (NOMINAL)</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <span className="text-white/40 block">Event Queue Size:</span>
                    <span className="text-white font-bold block mt-0.5">{healthMetrics.queueSize} items</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
