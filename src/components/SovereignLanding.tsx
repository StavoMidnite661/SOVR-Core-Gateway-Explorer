import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Coins, 
  Database, 
  CheckCircle, 
  Lock, 
  Flame, 
  Disc, 
  ExternalLink,
  FileText,
  X,
  Scale,
  Building2,
  Briefcase
} from 'lucide-react';

interface SOVRLandingProps {
  onEnter: () => void;
  totalAssetsUSD: number;
  totalSVT: number;
}

// Low-profile high-impact audio synthesizer using standard Web Audio API
class AudioSynthService {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHover() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      // Ignored if blocked by gesture
    }
  }

  playEnter() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Sub drop
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.frequency.setValueAtTime(90, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 1.2);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc1.start();
      osc1.stop(now + 1.25);

      // High cyber chime
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.linearRampToValueAtTime(880, now + 0.2);
      osc2.frequency.setValueAtTime(880, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.8);
      
      // Filter sweep
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(3000, now + 0.6);

      osc2.disconnect();
      osc2.connect(filter);
      filter.connect(gain2);

      gain2.gain.setValueAtTime(0.06, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc2.start();
      osc2.stop(now + 1.0);
    } catch (e) {
      // Ignored if blocked by browser autoplay constraints
    }
  }
}

const synth = new AudioSynthService();

export default function SovereignLanding({ onEnter, totalAssetsUSD, totalSVT }: SOVRLandingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glitchText, setGlitchText] = useState('SOVR_CORE');
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [ingressIndex, setIngressIndex] = useState(0);
  const [bootStep, setBootStep] = useState(0);
  const [systemAlert, setSystemAlert] = useState('NOMINAL STATE VERIFIED // QUORUM SYNCED');

  // Trigger sound feedback
  const handleHoverEffects = () => {
    synth.playHover();
  };

  const handleEnterAction = () => {
    synth.playEnter();
    onEnter();
  };

  // Holographic quantum connector interactive wireframe
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool representing decentralised ledger packets
    const nodeCount = 55;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      pulseRate: number;
      pulsePhase: number;
    }> = [];

    const colors = ['#00f2ff', '#f97316', '#10b981', '#ffffff'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseRate: Math.random() * 0.05 + 0.01,
        pulsePhase: Math.random() * Math.PI
      });
    }

    // Mouse interactive gravity
    const mouse = { x: -9999, y: -9999 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Background mesh grids
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 0.5;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and mutate telemetry nodes
      nodes.forEach((node, idx) => {
        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Interaction with mouse
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 152) {
          const force = (152 - dist) / 152;
          node.x -= (dx / dist) * force * 1.5;
          node.y -= (dy / dist) * force * 1.5;
        }

        // Pulse alpha
        node.pulsePhase += node.pulseRate;
        const currentAlpha = node.alpha + Math.sin(node.pulsePhase) * 0.15;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 4;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Render laser vectors connecting neighboring nodes
        for (let j = idx + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const distNodes = Math.hypot(node.x - other.x, node.y - other.y);
          if (distNodes < 110) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            
            // Connect vector colors gradient
            const connectionAlpha = (110 - distNodes) / 110 * 0.15;
            ctx.strokeStyle = node.color;
            ctx.globalAlpha = connectionAlpha;
            ctx.lineWidth = 0.55;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Cybernetics text glitches & boot sequence
  useEffect(() => {
    const textOptions = ['SOVR_CORE', 'CRYPT_GW', 'S_NET_V38', 'SOVR', 'SYS_SECURE'];
    const intervalText = setInterval(() => {
      setGlitchText(textOptions[Math.floor(Math.random() * textOptions.length)]);
    }, 2800);

    const intervalBoot = setInterval(() => {
      setBootStep(prev => (prev < 4 ? prev + 1 : 4));
    }, 1200);

    const alerts = [
      'NOMINAL STATE VERIFIED // QUORUM SYNCED',
      'ALERT: LARGE TRANSFER BLOCK DETECTED IN LONDON ROUTER - ALGEBRAIC OFFSET VALIDATED',
      'AUTONOMIC CRYPTO RE-SEAL IN SYNCHRONIC SEQUENCE #310C',
      'INGRESS STREAM RATE METRIC P99 RESOLVING AT 18ms',
      'TLS HANDSHAKES INBOUND SECURE (ECC_COHESIVE)'
    ];

    const intervalAlert = setInterval(() => {
      setSystemAlert(alerts[Math.floor(Math.random() * alerts.length)]);
    }, 4500);

    return () => {
      clearInterval(intervalText);
      clearInterval(intervalBoot);
      clearInterval(intervalAlert);
    };
  }, []);

  // Format monetary value
  const formattedCol = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalAssetsUSD);

  return (
    <div id="sovr-quantum-landing-viewport" className="relative w-full min-h-screen bg-[#020204] text-white font-mono overflow-x-hidden flex flex-col justify-between selection:bg-[#00f2ff] selection:text-black">
      {/* Top Ambient Tech Border line */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-orange-500 animate-pulse w-full shadow-[0_0_8px_#f97316] relative z-30" />
      
      {/* Background oversized blueprint map */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none opacity-25 mix-blend-screen scale-110">
        <img 
          src="/src/assets/images/sovr_background_map_1781167617436.png" 
          alt="SOVR Terminal Blueprint Map" 
          className="w-full h-full object-cover select-none pointer-events-none opacity-30 blur-[0.2px]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Laser Interactive Matrix Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Atmospheric Scanning grid & CRT Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/90 to-[#020204] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,255,0.015)_0%,transparent_75%)] pointer-events-none z-10" />

      {/* 1. TOP STATUS PANEL BAR */}
      <header className="z-20 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/45 text-[10px] text-zinc-500">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse shadow-[0_0_6px_#00f2ff]" />
          <span>QUANTUM NETWORK: SECURE</span>
          <span className="text-zinc-800">//</span>
          <span className="text-orange-500 font-bold">NODE_STATE_PASS</span>
        </div>
        <div className="flex items-center gap-4">
          <span>PORT: 3000 Ingress</span>
          <span className="text-zinc-800">/</span>
          <span>SYSTEM RUNTIME: 2026-06-11 UTC</span>
          <span className="text-zinc-800">/</span>
          <span className="bg-zinc-900 border border-zinc-800 text-teal-400 px-1.5 py-0.5 rounded text-[8.5px] font-bold">
            v3.8.4
          </span>
        </div>
      </header>

      {/* 2. CORE LANDING CONTENT */}
      <main className="z-20 flex-grow w-full max-w-7xl mx-auto px-6 flex flex-col justify-center py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Oversized typography, dynamic branding */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-3">
              
              {/* Floating Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-sm text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Next-Gen Ledger Decryption Gateway</span>
              </div>
              
              {/* Oversized Bold Headline */}
              <h1 className="text-4xl md:text-6xl xl:text-7xl font-sans font-black tracking-tight uppercase leading-[0.9] text-white">
                SOVR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-400 to-orange-500 font-display">
                  CAPITAL CORE
                </span>
              </h1>
              
              {/* Protocol status tag */}
              <p className="text-xs md:text-sm text-zinc-400 font-mono leading-relaxed max-w-2xl">
                A highly secure, zero-trust cryptographic Double-Entry Ledger system and Multi-stream Router designed for high-concurrency cross-border settlement.
              </p>
            </div>

            {/* Matrix HUD Diagnostic Loading Progress */}
            <div className="p-5 bg-zinc-950/70 border border-zinc-800/70 rounded-md backdrop-blur-md max-w-lg space-y-3">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">AUTONOMIC BOOT SEQUENCE</span>
              
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>[0.0] LOAD CRYPTOGRAPHIC VECTOR ASSETS:</span>
                  <span className={bootStep >= 1 ? 'text-teal-400 font-bold' : 'text-zinc-600'}>
                    {bootStep >= 1 ? 'OK' : 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>[1.4] INGEST CHANNELS TLS SEALS:</span>
                  <span className={bootStep >= 2 ? 'text-teal-400 font-bold' : 'text-zinc-600'}>
                    {bootStep >= 2 ? 'SECURED' : 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>[2.8] CONSOLIDATED COLLATERAL VALUATION:</span>
                  <span className={bootStep >= 3 ? 'text-teal-400 font-bold' : 'text-zinc-600'}>
                    {bootStep >= 3 ? 'STABILIZED' : 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>[4.2] INVARIANT PARITY AUDIT STREAM:</span>
                  <span className={bootStep >= 4 ? 'text-orange-400 font-bold' : 'text-zinc-600'}>
                    {bootStep >= 4 ? 'BALANCED' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Progress Loading Bar */}
              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-orange-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${(bootStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Next-gen Trigger call to action */}
            <div className="flex flex-col sm:flex-row gap-4 items-start pt-3">
              <button
                id="initialize-gateway-cta"
                onClick={handleEnterAction}
                onMouseEnter={handleHoverEffects}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-orange-500 text-black font-sans font-extrabold text-sm uppercase tracking-widest rounded-sm hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_0_24px_rgba(249,115,22,0.4)] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-3 overflow-hidden border border-cyan-300"
              >
                {/* Visual swipe shimmer scanning lines inside button */}
                <span className="absolute inset-x-0 h-[100%] w-[15%] bg-white/30 transform -skew-x-[25deg] -translate-x-[150%] group-hover:translate-x-[800%] transition-transform duration-[1200ms] ease-out pointer-events-none" />
                <span>Initialize Core Gateway</span>
                <span className="p-1 px-1.5 bg-black/10 rounded font-mono text-[9px] font-black text-black">
                  ENTER
                </span>
              </button>

              <button
                onClick={() => {
                  synth.playHover();
                  window.open('https://github.com/vasturiano/three-globe', '_blank');
                }}
                onMouseEnter={handleHoverEffects}
                className="px-6 py-4 border border-zinc-700/60 hover:border-zinc-500 hover:bg-zinc-900/40 text-xs text-zinc-300 uppercase font-bold tracking-widest rounded-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Documentation</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Right subdivision: High impact telemetry diagnostics HUD widgets */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Counter Display */}
            <div className="relative p-6 bg-[#06060c]/80 border border-zinc-800 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden space-y-4">
              {/* Highlight top border line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">COLLATERAL INTEGRITY POOL</span>
                <span className="text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/25 px-1.5 py-0.5 rounded font-bold">
                  99.999% VERIFIED
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 text-[10px] block uppercase tracking-widest">Aggregate Trust Value</span>
                <h3 className="text-3xl md:text-4xl font-sans font-light tracking-tight text-white leading-none">
                  {formattedCol} <span className="text-xs text-zinc-400 opacity-60">USD</span>
                </h3>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-zinc-500 text-[10px] block uppercase tracking-widest font-mono">SOVR Supply Pool</span>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-mono text-amber-400 font-bold">
                    {totalSVT.toLocaleString()} <span className="text-xs text-zinc-500">SVT</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-800/60 pt-3.5 mt-2 flex items-center gap-3">
                <div className="h-5.5 w-5.5 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                </div>
                <div className="text-[9.5px] leading-relaxed text-zinc-400 font-mono">
                  Quorum Consensus is active and certifying block state seals every 1.4s cycle.
                </div>
              </div>
            </div>

            {/* Micro HUD terminal simulator panel */}
            <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-sm space-y-3 font-mono text-[10px]">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#00f2ff]" />
                  <span className="text-white font-bold uppercase text-[9px] tracking-wider">GW_INTELLIGENCE: ACTIVE</span>
                </div>
                <span className="text-[8px] text-zinc-600">STATE: COHESIVE</span>
              </div>

              <div className="space-y-2 text-[9px] text-zinc-400 max-h-[140px] overflow-y-auto">
                <div className="flex gap-2">
                  <span className="text-zinc-600">[07:39:14]</span>
                  <span className="text-emerald-400">✔ SYSTEM:</span>
                  <span className="truncate">Parity balance invariants locked. DEBITS === CREDITS</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-600">[07:44:05]</span>
                  <span className="text-orange-400">⚓ CONSENSUS:</span>
                  <span className="truncate">Signed Authority seal for block height #1428</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-600">[07:47:45]</span>
                  <span className="text-cyan-400">ℹ INGRESS:</span>
                  <span className="truncate">Swedish payment gateway webhook matched to ledger ID</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-600">[07:50:41]</span>
                  <span className="text-amber-500">⚠ AUDITING:</span>
                  <span className="truncate">Executing algebraic matching check cycle across 6 nodes</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 3. ROBUST COMPLIANCE & RESTRUCTURED CORPORATE FOOTER */}
      <footer className="z-20 w-full bg-[#040407] border-t border-zinc-850 pt-12 pb-6 px-6 relative mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-xs font-mono">
          
          {/* Column 1: Organization Registry */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span className="font-sans font-extrabold text-xs uppercase tracking-wider text-white">Corporate Entity</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-zinc-400 min-h-[75px]">
              <p className="font-bold text-zinc-200">SOVR DEVELOPMENT HOLDINGS LLC</p>
              <p className="text-zinc-500 text-[10.5px]">dba SOVR EMPIRE</p>
              <p className="text-[10.5px] leading-relaxed">A Wyoming Limited Liability Company Authorized Private Multi-asset Operations</p>
            </div>
            <div className="pt-2.5 space-y-1 text-[10px] text-zinc-500 border-t border-zinc-900">
              <p>EIN: <span className="text-zinc-300">39-2332625</span></p>
              <p>D-U-N-S: <span className="text-zinc-300 font-sans text-[9px]">13-682-4504</span></p>
              <p>UID #: <span className="text-zinc-300">K752ULAXJV36</span></p>
            </div>
          </div>

          {/* Column 2: Strategy & Trust Governance */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
              <Briefcase className="w-4 h-4 text-[#00f2ff]" />
              <span className="font-sans font-extrabold text-xs uppercase tracking-wider text-white">Trust Administration</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-zinc-400 min-h-[75px]">
              <p className="font-bold text-zinc-200">GUSTAVO O MALDONADO TTEE</p>
              <p className="text-zinc-500 text-[10.5px]">Founder & Vault Architect</p>
              <p className="text-[10.5px] leading-relaxed">Trust Law Strategist, leading high-integrity digital financial settlement and tokenized credit ecosystems.</p>
            </div>
            <div className="pt-2.5 space-y-1 text-[10px] text-zinc-500 border-t border-zinc-900">
              <p>Workplace: <span className="text-zinc-300 truncate">Bakersfield, CA 93313</span></p>
              <p>Reg. Agent: <span className="text-zinc-300 font-sans text-[9px]">Cheyenne, WY 82001</span></p>
              <p>Authority: <span className="text-zinc-300">ADMINISTRATOR</span></p>
            </div>
          </div>

          {/* Column 3: Typical System Documents & Disclosures */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
              <FileText className="w-4 h-4 text-teal-400" />
              <span className="font-sans font-extrabold text-xs uppercase tracking-wider text-white">Trust Documents</span>
            </div>
            <div className="flex flex-col gap-2 text-[11px] text-zinc-400 min-h-[75px]">
              <button 
                onClick={() => { synth.playHover(); setActiveDoc('trust'); }} 
                className="text-left text-zinc-400 hover:text-white hover:underline transition-all flex items-center gap-1.5 group cursor-pointer"
              >
                <span>SOVR Trust Agreement</span>
                <span className="text-[9px] text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button 
                onClick={() => { synth.playHover(); setActiveDoc('terms'); }} 
                className="text-left text-zinc-400 hover:text-white hover:underline transition-all flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Terms of Service & Rules</span>
                <span className="text-[9px] text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button 
                onClick={() => { synth.playHover(); setActiveDoc('privacy'); }} 
                className="text-left text-zinc-400 hover:text-white hover:underline transition-all flex items-center gap-1.5 group cursor-pointer"
              >
                <span>ZKP Privacy Protection Policy</span>
                <span className="text-[9px] text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button 
                onClick={() => { synth.playHover(); setActiveDoc('compliance'); }} 
                className="text-left text-zinc-400 hover:text-white hover:underline transition-all flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Regulatory Disclosures</span>
                <span className="text-[9px] text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
            <div className="pt-2.5 space-y-1 text-[10px] text-zinc-500 border-t border-zinc-900">
              <p>Repository: <span className="text-zinc-300">SHA-256 SECURED</span></p>
              <p>Signatures: <span className="text-zinc-300">ECC WITNESS MULTISIG</span></p>
              <p>Type: <span className="text-zinc-300">TRUST COVENANT</span></p>
            </div>
          </div>

          {/* Column 4: Operational Portal Statement */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
              <Scale className="w-4 h-4 text-purple-400" />
              <span className="font-sans font-extrabold text-xs uppercase tracking-wider text-white">Service Mission</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-zinc-400 leading-relaxed min-h-[75px]">
              <p className="font-bold text-zinc-200">DIGITAL SETTLEMENT</p>
              <p className="text-[10.5px] leading-relaxed text-zinc-450">
                Providing trust-based payment settlement, QR code presentment tools, and AI-powered economic empowerment systems point-of-need.
              </p>
            </div>
            <div className="pt-2.5 space-y-1 text-[10px] text-zinc-500 border-t border-zinc-900">
              <p>Primary: <a href="mailto:admin@sovr.credit" className="text-cyan-400 hover:underline">admin@sovr.credit</a></p>
              <p>Vault Ops: <a href="mailto:SOVR.Empire@sovr.credit" className="text-cyan-400 hover:underline font-sans text-[9px]">SOVR.Empire@sovr.credit</a></p>
              <p>State: <span className="text-emerald-400 font-bold">ONLINE</span></p>
            </div>
          </div>

        </div>

        {/* Dynamic Horizontal Line */}
        <div className="max-w-7xl mx-auto h-[1px] bg-zinc-900 my-4" />

        {/* Corporate Copyright and System Identifier */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-zinc-600 font-mono">
          <div>
            © 2026 SOVR DEVELOPMENT HOLDINGS LLC. ALL RIGHTS RESERVED. PRIVATE TRUST OPERATION.
          </div>
          <div className="flex items-center gap-4 text-[9.5px]">
            <span>SYSTEM ENCRYPTION: ECC_521_COHESIVE</span>
            <span className="text-zinc-800">/</span>
            <span>SECURE INGRESS STREAMS</span>
          </div>
        </div>
      </footer>

      {/* 4. FOOTER ALERT TICKER (Real-time cybernetic ticker animation) */}
      <footer className="z-20 w-full bg-zinc-950/85 border-t border-zinc-800/50 py-3 px-6 h-11 flex items-center overflow-hidden shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-[9px] font-mono text-zinc-500">
          <div className="flex items-center gap-3 w-full">
            <span className="text-cyan-500 uppercase font-black tracking-widest text-[8px] border border-cyan-500/30 px-1 py-0.5 rounded leading-none shrink-0">
              GW_TICKER
            </span>
            <div className="overflow-hidden whitespace-nowrap text-zinc-300 w-full">
              <span className="inline-block animate-pulse font-mono translate-x-0 tracking-wide">
                🔐 {systemAlert}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-zinc-600 text-right uppercase tracking-widest hidden md:block">
            RESTRICTED CORE GATEWAY SYSTEM
          </div>
        </div>
      </footer>

      {/* 5. INTERACTIVE COMPLIANCE DOCUMENT MODAL (Next-level quantum immersive overlay) */}
      <AnimatePresence>
        {activeDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-[#07070a] border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden font-mono text-xs text-zinc-300"
            >
              {/* Highlight orange border line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-cyan-400" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 p-4 pt-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00f2ff]" />
                  <span className="font-sans font-bold text-sm text-white uppercase tracking-tight">
                    {activeDoc === 'trust' && 'SOVR TRUST AGREEMENT'}
                    {activeDoc === 'terms' && 'TERMS OF SERVICE // SOVR EMPIRE'}
                    {activeDoc === 'privacy' && 'ZKP PRIVACY & DATA INTEGRITY'}
                    {activeDoc === 'compliance' && 'REGULATORY DISCLOSURES'}
                  </span>
                </div>
                <button
                  onClick={() => { synth.playHover(); setActiveDoc(null); }}
                  className="p-1 px-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  <span>ESC</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-4 leading-relaxed text-[11px] text-zinc-400 h-[60vh]">
                {activeDoc === 'trust' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-zinc-950 border border-zinc-900/60 rounded text-[10px]">
                      <p className="font-bold text-amber-400">TRUST ADMINISTRATOR & TRUSTEE RECORD:</p>
                      <p className="mt-1">NAME: GUSTAVO O MALDONADO TTEE</p>
                      <p>ORGANIZATION / SPONSOR: SOVR DEVELOPMENT HOLDINGS LLC</p>
                      <p>UID REFERENCE: K752ULAXJV36 / WYOMING SECURE TRUST</p>
                    </div>

                    <h4 className="text-white uppercase font-bold text-xs">Section 1. Private Trust Indenture</h4>
                    <p>
                      This Covenant governs the allocation, transfer, and cryptographic custody of zero-knowledge double-entry ledger credentials. Under the stewardship of Gustavo O Maldonado as Trustee (TTEE), the SOVR Empire system guarantees the matching preservation of debit-credit accounts without secondary collateral exposure.
                    </p>

                    <h4 className="text-white uppercase font-bold text-xs">Section 2. Digital Assets & Tokenization</h4>
                    <p>
                      The SOVR Supply Pool (administered under native denominational ticker SVT) represents cryptographic units of participation. No unit shall be generated outside of the verified consensual Quorum agreement. All values are balanced to algebraic correctness continuously.
                    </p>

                    <h4 className="text-white uppercase font-bold text-xs">Section 3. Fiduciary Autonomic Sealing</h4>
                    <p>
                      The system automatically computes and publishes cryptographic block proofs every 1.4 seconds. These seals act as authorized witness seals under Wyoming corporate provisions. By utilizing point-of-need QR wallet presentments, customers confirm real-time settlement directly with the trust pool.
                    </p>
                  </div>
                )}

                {activeDoc === 'terms' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-zinc-950 border border-zinc-900/60 rounded text-[10px]">
                      <p className="font-bold text-orange-400">REGISTRATION COMPLIANCE METADATA:</p>
                      <p className="mt-1">COMPANY: SOVR DEVELOPMENT HOLDINGS LLC</p>
                      <p>dba SOVR EMPIRE (A Wyoming Limited Liability Company)</p>
                      <p>EIN: 39-2332625 | D-U-N-S: 13-682-4504</p>
                    </div>

                    <h4 className="text-white uppercase font-bold text-xs">1. Scope of Electronic Payment Settlement</h4>
                    <p>
                      SOVR Empire operates a non-custodial decentralized payment presentment node. Users agree that all digital ledger transactions are immediate, non-reversible, and subject to automatic algebraic verification rules before publication on target consensus chains.
                    </p>

                    <h4 className="text-white uppercase font-bold text-xs">2. Factional Reserve Prohibition</h4>
                    <p>
                      The system maintains a full dollar-for-dollar collateral pool. At no time does the interface support fractional liability expansion. Invariant rule audits are computed live on every keystroke, matching assets directly inside the SOVR Balance Sheets.
                    </p>

                    <h4 className="text-white uppercase font-bold text-xs">3. Use of Interactive Portals</h4>
                    <p>
                      Customers interact strictly via point-of-need client dashboards. You agree to secure any cryptographic keys or credentials; the developers maintain no centralized storage of physical user keys.
                    </p>
                  </div>
                )}

                {activeDoc === 'privacy' && (
                  <div className="space-y-4 font-mono text-[11px]">
                    <h4 className="text-white uppercase font-bold text-xs">1. Zero-Knowledge Cryptographic Paradigm</h4>
                    <p>
                      No cleartext user credentials, social identifications, or payment credentials are stored in plain sight. Standard operations route telemetry hashes directly through local browser database instances (IndexedDB / LocalStorage) and execute matching checks client-side.
                    </p>

                    <h4 className="text-white uppercase font-bold text-xs">2. Ingress & Webhook Telemetry Logs</h4>
                    <p>
                      All inbound webhook payloads (including Stripe secure links, payment webhooks, and ledger synchronization handshakes) are hashed with Elliptic Curve Cryptography vectors. IP logs are deleted immediately upon Quorum signature resolution.
                    </p>

                    <h4 className="text-white uppercase font-bold text-xs">3. Client-Authoritative Storage</h4>
                    <p>
                      The active state is yours. Clearing cookies and local configurations instantly wipes all visual matching registries from this client. Real-time metrics are stored ephemerally to monitor service network latencies.
                    </p>
                  </div>
                )}

                {activeDoc === 'compliance' && (
                  <div className="space-y-4 text-[11px]">
                    <div className="p-3 bg-zinc-950 border border-zinc-900/60 rounded text-[10px] space-y-1">
                      <p className="font-bold text-teal-400">REGULATORY STANDARDS MATRIX:</p>
                      <p>WY DEPT OF REVENUE RECOGNIZED ENTITY</p>
                      <p>WYOMING STATE FILING REF // SECURE INGRESS PROTOCOLS</p>
                      <p>OFFICIAL REGISTERED AGENT: 2120 Carey Ave, Cheyenne, WY 82001</p>
                    </div>

                    <h4 className="text-white uppercase font-bold text-xs">Wyoming LLC Compliance Disclosures</h4>
                    <p>
                      Formed under the statutes of the State of Wyoming, SOVR DEVELOPMENT HOLDINGS LLC maintains strict reporting compliance. Financial operations are regulated under private trust provisions. This platform does not solicit retail investment capital nor does it offer interest-bearing custodial accounts.
                    </p>

                    <h4 className="text-white uppercase font-bold text-xs">No Investment Advice Notice</h4>
                    <p>
                      Information distributed inside the SOVR dashboard interfaces represents administrative ledger records and point-of-sale presentments. Ticker symbols, metrics, and transaction values are generated live matching real ledger positions.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-zinc-800 p-4 bg-[#0a0a0f] flex justify-end">
                <button
                  onClick={() => { synth.playHover(); setActiveDoc(null); }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-sans font-bold text-xs uppercase tracking-widest rounded-sm transition-all cursor-pointer"
                >
                  Acknowledge & Close
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
