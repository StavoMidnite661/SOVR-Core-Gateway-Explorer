import React, { useEffect, useRef, useState } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function QuantumEntropyOscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation State variables
  const [entropyPool, setEntropyPool] = useState<string>('0x7F...E2');
  const [phaseDeviation, setPhaseDeviation] = useState<number>(0.042);
  const [entropyRate, setEntropyRate] = useState<number>(142);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [collapsedStateVal, setCollapsedStateVal] = useState<'|0⟩' | '|1⟩'>('|0⟩');
  const [collapseTimer, setCollapseTimer] = useState<number>(0);

  // Hold a ref to pass animation variables to loop without re-renders
  const stateRef = useRef({
    time: 0,
    collapsePercent: 0, // 0 = complete superposition, 1 = completely collapsed flatline/single decision wave
    collapseTarget: 0,
    collapsedState: '|0⟩' as '|0027' | '|0⟩' | '|1⟩',
    simulatedEntropySeed: 0x827ade41e2,
  });

  const triggerManualCollapse = () => {
    if (stateRef.current.collapseTarget > 0) return; // already in active collapse cycle
    const targetState = Math.random() > 0.5 ? '|1⟩' : '|0⟩';
    stateRef.current.collapsedState = targetState;
    setCollapsedStateVal(targetState);
    stateRef.current.collapseTarget = 1.0;
    setIsCollapsed(true);
    setCollapseTimer(60); // 60 frames about 1 second of collapse
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 120;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    let animFrame: number;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = Math.max(entry.contentRect.width, 100);
        height = Math.max(entry.contentRect.height, 80);
        canvas.width = width;
        canvas.height = height;
      }
    });
    resizeObserver.observe(container);

    const matchRandomTicks = () => {
      // Fluctuate helper indicators
      if (Math.random() < 0.3) {
        const hex = Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase();
        setEntropyPool(`0x${hex.substring(0, 2)}...${hex.substring(hex.length - 2)}`);
        setPhaseDeviation(parseFloat((0.02 + Math.random() * 0.08).toFixed(4)));
        setEntropyRate(Math.floor(130 + Math.random() * 35));
      }
    };

    // 60fps Loop
    const draw = () => {
      stateRef.current.time += 0.08;
      const t = stateRef.current.time;

      // Animate collapse progress interpolation towards target (0.0 or 1.0)
      const r = stateRef.current;
      r.collapsePercent += (r.collapseTarget - r.collapsePercent) * 0.12;

      // Clean Canvas with transparent fill
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Tech Background Grids
      ctx.strokeStyle = 'rgba(42, 42, 53, 0.2)';
      ctx.lineWidth = 0.5;
      const gridSpacing = 20;

      // Vertical lines
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Center Baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // 2. Plot Overlapping State Waveforms
      const halfH = height / 2;
      const amplitude = Math.min(halfH * 0.55, 28);
      const waveLength = 0.035;

      // We plot each point across X axis
      ctx.lineCap = 'round';

      // --- PLOT WAVE 1: |0⟩ STATE WAVEFORM (Cyan vibe) ---
      const p1 = r.collapsePercent; // progress factor
      ctx.beginPath();
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0.2, 0.95 - p1)})`;

      for (let x = 0; x < width; x++) {
        // Wave shifts left
        const yVal = halfH + amplitude * Math.sin(x * waveLength - t * 0.8) * Math.cos(x * 0.003 + t * 0.1);
        if (x === 0) ctx.moveTo(x, yVal);
        else ctx.lineTo(x, yVal);
      }
      ctx.stroke();

      // --- PLOT WAVE 2: |1⟩ STATE WAVEFORM (Amber vibe) ---
      ctx.beginPath();
      ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0.2, 0.95 - p1)})`;

      for (let x = 0; x < width; x++) {
        // Wave shifts right
        const yVal = halfH + amplitude * Math.sin(x * waveLength + t * 0.9 + 2.0) * Math.sin(x * 0.005 - t * 0.05);
        if (x === 0) ctx.moveTo(x, yVal);
        else ctx.lineTo(x, yVal);
      }
      ctx.stroke();

      // --- PLOT WAVE 3: COLLAPSED DECISIONAL WAVE (Emerging Emerald line) ---
      // This wave starts completely flat when collapsePercent = 0 and gains full amplitude/form when collapsePercent = 1
      if (p1 > 0.01) {
        ctx.beginPath();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = `rgba(16, 185, 129, ${p1})`;

        const chosenOffset = r.collapsedState === '|0⟩' ? 0 : Math.PI;

        for (let x = 0; x < width; x++) {
          // A single perfectly coherent sine wave representing consolidated state solution
          const coherentAmt = amplitude * 1.1 * Math.sin(x * waveLength * 1.15 - t * 1.25 + chosenOffset);
          const yVal = halfH + (coherentAmt * p1);
          if (x === 0) ctx.moveTo(x, yVal);
          else ctx.lineTo(x, yVal);
        }
        ctx.stroke();
      }

      // 3. Simulated collapse cooldown tick
      if (r.collapseTarget > 0) {
        setCollapseTimer((prev) => {
          if (prev <= 1) {
            // Revert back into superposition state
            r.collapseTarget = 0.0;
            setIsCollapsed(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        // Occasional auto-collapse to represent continuous blockchain consensus seals!
        if (Math.random() < 0.0035) { // ~once every 10 seconds
          const targetState = Math.random() > 0.5 ? '|1⟩' : '|0⟩';
          r.collapsedState = targetState;
          setCollapsedStateVal(targetState);
          r.collapseTarget = 1.0;
          setIsCollapsed(true);
          setCollapseTimer(80);
        }
      }

      matchRandomTicks();
      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      id="quantum-entropy-oscilloscope" 
      className="bg-[#050508] border border-[#2a2a35] rounded p-3 flex flex-col justify-between font-mono text-[10px]"
    >
      <div className="flex items-center justify-between border-b border-[#2a2a35]/60 pb-1.5 mb-2">
        <span className="text-white/40 uppercase text-[9px] font-bold tracking-widest flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          Quantum Entropy Oscilloscope
        </span>
        <span className="text-[#02c39a] font-bold bg-[#02c39a]/10 px-1.5 py-0.5 rounded border border-[#02c39a]/15 text-[7px] uppercase tracking-wider">
          LIVE COHERENCE
        </span>
      </div>

      {/* Scope visual box */}
      <div 
        ref={containerRef} 
        className="w-full h-[115px] bg-[#020204] rounded border border-white/5 relative overflow-hidden flex items-center justify-center cursor-crosshair group"
        onClick={triggerManualCollapse}
        title="Click viewport to measure/collapse quantum superposition state manually"
      >
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />

        {/* HUD overlays */}
        <div className="absolute top-1 left-2 pointer-events-none text-white/20 text-[7px] uppercase tracking-widest">
          COHERENCE RESOLUTION: 16-BIT SIGMA
        </div>

        <div className="absolute top-1 right-2 pointer-events-none text-white/20 text-[7px] uppercase tracking-widest font-mono">
          PHASE JITTER: {phaseDeviation} RAD
        </div>

        {/* Dynamic Decisional Status overlay */}
        {isCollapsed ? (
          <div className="absolute inset-x-0 bottom-2 px-2 py-0.5 bg-emerald-900/80 border-y border-emerald-500/25 flex items-center justify-between pointer-events-none animate-pulse">
            <span className="text-[7.5px] font-black tracking-widest text-[#00ff8e] flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-emerald-400" />
              SUPERPOSITION RESOLVED
            </span>
            <span className="text-[8px] font-black text-white px-1.5 bg-emerald-500 rounded font-mono">
              STATE: {collapsedStateVal} SECURED
            </span>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-2 px-2 py-1 flex items-center justify-between pointer-events-none text-[8px] text-white/40 bg-black/40 backdrop-blur-[1px] border-t border-white/5">
            <span className="tracking-wide">SUPERPOSITION: |0⟩ &amp; |1⟩ PARTICLES</span>
            <span className="text-amber-400 font-bold tracking-wider animate-pulse flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-400 block" />
              ENTANGUT STATE IN FLIGHT
            </span>
          </div>
        )}

        {/* Hover trigger invitation */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-cyan-950/20 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-none flex items-center justify-center">
          <div className="px-2 py-1 border border-cyan-500/30 bg-[#0c0c12]/95 rounded text-[8.5px] text-cyan-300 uppercase tracking-widest flex items-center gap-1 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <ShieldCheck className="w-3 h-3" />
            CLICK TO MEASURE &amp; COLLAPSE
          </div>
        </div>
      </div>

      {/* Underbar diagnostics */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="px-1.5 py-1 bg-[#0c0c12] border border-white/5 rounded">
          <span className="text-white/25 uppercase text-[7px] block">Entropy Seed</span>
          <span className="text-white font-bold text-[8.5px] block truncate text-cyan-400 font-mono">{entropyPool}</span>
        </div>
        <div className="px-1.5 py-1 bg-[#0c0c12] border border-white/5 rounded">
          <span className="text-white/25 uppercase text-[7px] block">Consensus Rate</span>
          <span className="text-white font-bold text-[8.5px] block font-mono">{entropyRate} Hz</span>
        </div>
        <button 
          onClick={triggerManualCollapse}
          className="px-1.5 py-1 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-400 border border-orange-500/25 hover:border-orange-500/40 rounded transition-all active:scale-95 text-center uppercase tracking-wider text-[7.5px] font-black cursor-pointer leading-tight flex items-center justify-center gap-1"
        >
          <Zap className="w-2.5 h-2.5 text-orange-400 animate-pulse" />
          FORCE COLLAPSE
        </button>
      </div>
    </div>
  );
}
