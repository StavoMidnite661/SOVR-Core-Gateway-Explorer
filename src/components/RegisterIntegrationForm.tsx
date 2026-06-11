import React, { useState } from 'react';
import { ConnectedApp } from '../types';
import { PlusCircle, Shield, Link, Radio, Zap, Check, AlertCircle } from 'lucide-react';

interface RegisterIntegrationFormProps {
  onRegister: (newApp: ConnectedApp) => void;
}

export default function RegisterIntegrationForm({ onRegister }: RegisterIntegrationFormProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState('Payment Gateway');
  const [endpoint, setEndpoint] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [authType, setAuthType] = useState('OAuth2');
  const [apiKey, setApiKey] = useState('');
  const [secret, setSecret] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('sandbox');
  const [enabled, setEnabled] = useState(true);

  // Simulated status states
  const [verifyState, setVerifyState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [webhookState, setWebhookState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyState('loading');
    setTimeout(() => {
      if (!endpoint) {
        setVerifyState('error');
        setErrorMessage('Endpoint URL required.');
      } else {
        setVerifyState('success');
      }
    }, 1200);
  };

  const handleTestWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookState('loading');
    setTimeout(() => {
      if (!webhookUrl) {
        setWebhookState('error');
      } else {
        setWebhookState('success');
      }
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !endpoint) {
      setVerifyState('error');
      setErrorMessage('Please provide Name and Endpoint.');
      return;
    }

    // Generate simulated app node
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#d97706', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const icons = ['CreditCard', 'Radio', 'Database', 'Link', 'Cpu', 'Layers'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newApp: ConnectedApp = {
      id: `app_${Math.random().toString(36).substr(2, 9)}`,
      slug,
      displayName: name,
      icon: randomIcon,
      tint: randomColor,
      health: enabled ? 'healthy' : 'offline',
      activeSessions: enabled ? Math.floor(Math.random() * 800) + 50 : 0,
      txnPerMin: enabled ? (Math.random() * 30 + 5) : 0,
      lastHeartbeat: new Date().toISOString(),
      version: '1.0.0',
      description: `Custom ${category} integrated via ${provider || 'direct connection'}. Environment: ${environment}.`,
      endpoint,
      auth: authType,
    };

    onRegister(newApp);

    // Reset inputs
    setName('');
    setProvider('');
    setWebhookUrl('');
    setEndpoint('');
    setApiKey('');
    setSecret('');
    setVerifyState('idle');
    setWebhookState('idle');
  };

  return (
    <div id="register-integration-card" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 backdrop-blur-md">
      <div className="mb-4">
        <h2 id="register-panel-title" className="text-xs font-black uppercase tracking-widest text-white/90 font-display flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          Register New API Integration
        </h2>
        <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider mt-1">Deploy an auxiliary channel connection to the Core settlement stream</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">Integration Name</label>
            <input
              type="text"
              required
              placeholder="e.g. SovereignPay Retail"
              className="w-full bg-[#050507] border border-[#2a2a35] rounded px-3 py-2 text-xs text-white placeholder-white/20 tracking-wide font-mono focus:outline-none focus:border-cyan-500/60 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">Provider & Platform</label>
            <input
              type="text"
              placeholder="e.g. Swish Global"
              className="w-full bg-[#050507] border border-[#2a2a35] rounded px-3 py-2 text-xs text-white placeholder-white/20 tracking-wide font-mono focus:outline-none focus:border-cyan-500/60 transition-colors"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">Category Route</label>
            <select
              className="w-full bg-[#050507] border border-[#2a2a35] rounded px-2.5 py-2 text-xs text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors cursor-pointer uppercase font-mono tracking-wide"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Settlement Bridge">Settlement Bridge</option>
              <option value="Liquidity Oracle">Liquidity Oracle</option>
              <option value="Retail Ingress">Retail Ingress</option>
              <option value="Compliance Monitor">Compliance Monitor</option>
              <option value="Treasury custodian">Treasury custodian</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">Environment Stage</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEnvironment('production')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border rounded transition-all duration-150 cursor-pointer ${
                  environment === 'production'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-400'
                    : 'bg-[#101015] border-[#2a2a35] text-white/40 hover:text-white/60'
                }`}
              >
                Production
              </button>
              <button
                type="button"
                onClick={() => setEnvironment('sandbox')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border rounded transition-all duration-150 cursor-pointer ${
                  environment === 'sandbox'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                    : 'bg-[#101015] border-[#2a2a35] text-white/40 hover:text-white/60'
                }`}
              >
                Sandbox
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">API Target Endpoint</label>
            <div className="relative">
              <Link className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/20" />
              <input
                type="text"
                required
                placeholder="https://api.sovereignpay.io/v1/settle"
                className="w-full pl-9 pr-3 py-2 bg-[#050507] border border-[#2a2a35] rounded text-xs text-white placeholder-white/20 tracking-wide font-mono focus:outline-none focus:border-cyan-500/60 transition-colors"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">Webhook Receiver URL</label>
            <div className="relative">
              <Radio className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/20" />
              <input
                type="text"
                placeholder="https://gateway.sovr.local/v1/webhooks/pay"
                className="w-full pl-9 pr-3 py-2 bg-[#050507] border border-[#2a2a35] rounded text-xs text-white placeholder-white/20 tracking-wide font-mono focus:outline-none focus:border-cyan-500/60 transition-colors"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">Auth Scheme</label>
            <select
              className="w-full bg-[#050507] border border-[#2a2a35] rounded px-2.5 py-2 text-xs text-white/80 focus:outline-none focus:border-cyan-500/60 transition-colors cursor-pointer uppercase font-mono tracking-wide"
              value={authType}
              onChange={(e) => setAuthType(e.target.value)}
            >
              <option value="OAuth2">OAuth2 Client</option>
              <option value="API Key">API Key</option>
              <option value="Sovereign Signature">SOVR Signature</option>
              <option value="Mutual TLS">mTLS Cert</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">Access Token / Client Key</label>
            <input
              type="password"
              placeholder="••••••••••••••"
              className="w-full bg-[#050507] border border-[#2a2a35] rounded px-3 py-2 text-xs text-white placeholder-white/20 tracking-wide font-mono focus:outline-none focus:border-cyan-500/60 transition-colors"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[9px] text-white/40 uppercase font-mono block mb-1">Secret Salt</label>
            <input
              type="password"
              placeholder="••••••••••••••"
              className="w-full bg-[#050507] border border-[#2a2a35] rounded px-3 py-2 text-xs text-white placeholder-white/20 tracking-wide font-mono focus:outline-none focus:border-cyan-500/60 transition-colors"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#101015] border border-[#2a2a35]/40 p-2.5 rounded">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${enabled ? 'bg-cyan-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${enabled ? 'bg-cyan-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="text-[10px] font-mono text-white/60 uppercase">Initial Active Connection Flag</span>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded border cursor-pointer ${
              enabled
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
            }`}
          >
            {enabled ? 'ENABLED' : 'PAUSED'}
          </button>
        </div>

        {/* Verification and webhook simulation feed */}
        {(verifyState !== 'idle' || webhookState !== 'idle') && (
          <div className="bg-[#050507] border border-[#2a2a35] p-3 rounded font-mono text-[10px] space-y-1.5">
            {verifyState === 'loading' && (
              <p className="text-white/40 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400 animate-bounce" /> Checking cryptographic route integrity...
              </p>
            )}
            {verifyState === 'success' && (
              <p className="text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Connection established. TLS handshake valid. Remote registry ok.
              </p>
            )}
            {verifyState === 'error' && (
              <p className="text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Handshake failed: {errorMessage}
              </p>
            )}

            {webhookState === 'loading' && (
              <p className="text-white/40 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Posting random payload challenge...
              </p>
            )}
            {webhookState === 'success' && (
              <p className="text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Webhook challenge verified. Code status: HTTP 200 OK.
              </p>
            )}
            {webhookState === 'error' && (
              <p className="text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Delivery failed: Target URL offline.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifyState === 'loading'}
            className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-widest bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-300 rounded active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            VERIFY CONNECTION
          </button>

          <button
            type="button"
            onClick={handleTestWebhook}
            disabled={webhookState === 'loading'}
            className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-widest bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/20 text-amber-300 rounded active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            TEST WEBHOOK
          </button>

          <button
            type="submit"
            className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded active:scale-[0.98] transition-all cursor-pointer"
          >
            REGISTER SERVICE
          </button>
        </div>
      </form>
    </div>
  );
}
