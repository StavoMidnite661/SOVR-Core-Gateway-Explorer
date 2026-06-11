import React, { useState } from 'react';
import { HashBlock } from '../types';
import { Cpu, CheckCircle2, Server, Clock, ShieldCheck, Box, ArrowRight, ShieldAlert, Key } from 'lucide-react';

interface BlocksChainProps {
  chain: HashBlock[];
  onForceSeal: () => void;
  isSealing: boolean;
}

export default function BlocksChain({ chain, onForceSeal, isSealing }: BlocksChainProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = chain.find(b => b.id === selectedBlockId);

  return (
    <div id="blocks-chain-container" className="bg-[#0c0c12]/90 border border-[#2a2a35] rounded-lg p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 id="blocks-panel-title" className="text-xs font-black uppercase tracking-widest text-white/90 font-display flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            Verified Cryptographic Chain
          </h2>
          <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider mt-1">Immutable SHA-256 proof-of-authority seal log</p>
        </div>

        <button
          id="force-seal-block-button"
          onClick={onForceSeal}
          disabled={isSealing}
          className={`px-3 py-1.5 text-xs font-semibold rounded-sm flex items-center gap-1.5 border transition-all uppercase tracking-wider ${
            isSealing
              ? 'opacity-60 bg-[#151520] border-[#2a2a35] text-cyan-200 cursor-not-allowed'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300 active:scale-[0.98] cursor-pointer'
          }`}
        >
          <Box className={`w-3.5 h-3.5 ${isSealing ? 'animate-spin' : ''}`} />
          {isSealing ? 'Sealing...' : 'Force Block Seal'}
        </button>
      </div>

      {/* Horizontal block flow layout of latest blocks */}
      <div id="latest-blocks-horizontal" className="relative mb-5 bg-[#050507] border border-[#2a2a35] p-4 rounded">
        <label className="text-[9px] text-white/30 font-mono tracking-widest uppercase block mb-3">Live Chronological Sequence (Hover to detail)</label>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pr-1">
          {chain.slice(0, 8).map((block, idx) => (
            <React.Fragment key={block.id}>
              <button
                id={`block-flow-node-${block.id}`}
                onClick={() => setSelectedBlockId(selectedBlockId === block.id ? null : block.id)}
                className={`flex-shrink-0 group relative p-3 rounded border text-left transition-all duration-200 cursor-pointer w-[140px] ${
                  selectedBlockId === block.id
                    ? 'bg-cyan-950/20 border-cyan-500 text-white shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                    : 'bg-[#101015] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[9px] text-white/40 font-bold">#{block.height}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
                
                <div className="font-mono text-[9px] text-white/80 truncate tracking-wide" title={block.hash}>
                  {block.hash.substring(0, 14)}...
                </div>
                <div className="text-[9px] text-white/30 mt-1 flex items-center gap-1 font-mono uppercase tracking-tight">
                  <Server className="w-2.5 h-2.5 text-cyan-400" />
                  <span>{block.txnCount} txs</span>
                </div>

                <div className="absolute top-1 right-2 scale-0 group-hover:scale-100 transition-transform origin-top-right">
                  <span className="text-[8px] bg-cyan-500 text-slate-950 px-1 rounded font-bold uppercase">Inspect</span>
                </div>
              </button>
              
              {idx < 7 && idx < chain.slice(0, 8).length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Selected Block Info panel / expander */}
      {selectedBlock && (
        <div id="block-inspector-panel" className="bg-[#101015] border border-cyan-500/30 rounded p-4 mb-4 transition-all animate-fadeIn">
          <div className="flex justify-between items-start border-b border-[#2a2a35]/60 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                  HEIGHT {selectedBlock.height}
                </span>
                <span className="flex items-center gap-1 text-[9px] text-[#ffffff]/60 font-mono font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shadow-[0_0_8px_#10b981]" /> SECURE SEED SEALED
                </span>
              </div>
              <h3 className="text-xs font-semibold text-[#e0e0e0] mt-1.5 flex items-center gap-2 font-mono">
                BLOCK ID: {selectedBlock.id}
              </h3>
            </div>
            
            <button
              id="close-block-inspector"
              onClick={() => setSelectedBlockId(null)}
              className="text-[#ffffff]/40 hover:text-white text-[9px] font-mono uppercase tracking-widest transition-colors font-bold"
            >
              [Dismiss]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-indigo-400" />
                Block Hash
              </p>
              <div className="bg-slate-900 border border-slate-800/80 p-2 rounded text-[11px] font-mono select-all break-all text-slate-200">
                {selectedBlock.hash}
              </div>

              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-wider mt-3 mb-1">
                Previous Block Hash
              </p>
              <div className="bg-slate-900/50 border border-slate-850 p-2 rounded text-[11px] font-mono select-all break-all text-slate-400">
                {selectedBlock.prevHash}
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-wider mb-1">
                Merkle Tree Root Proof
              </p>
              <div className="bg-slate-900 border border-slate-800/80 p-2 rounded text-[11px] font-mono select-all break-all text-slate-300">
                {selectedBlock.merkleRoot}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-slate-900/50 border border-slate-850 p-2 rounded text-center">
                  <span className="text-[10px] text-slate-500 block">Total Transactions</span>
                  <span className="font-mono text-base font-medium text-indigo-400 mt-0.5 block">{selectedBlock.txnCount}</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-850 p-2 rounded text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Sealed Time
                  </span>
                  <span className="font-mono text-[10px] text-slate-300 mt-1 block">
                    {new Date(selectedBlock.sealedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List of remaining recent blocks */}
      <div id="all-blocks-vertical-list" className="max-h-[300px] overflow-y-auto pr-1">
        <label className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block mb-2">History Seal Log</label>
        <div className="space-y-1.5">
          {chain.slice(0, 15).map((block) => (
            <div
              key={block.id}
              onClick={() => setSelectedBlockId(selectedBlockId === block.id ? null : block.id)}
              className="flex items-center justify-between text-xs bg-slate-950/60 hover:bg-slate-900/30 border border-slate-900 px-3 py-2 rounded-lg cursor-pointer hover:border-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400 w-8">#{block.height}</span>
                <span className="font-mono text-slate-500 hidden sm:inline">{block.id}</span>
                <span className="font-mono text-slate-300 truncate w-[160px] sm:w-[240px]" title={block.hash}>
                  {block.hash}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-slate-500">{block.txnCount} txs</span>
                <span className="font-mono text-[10px] text-slate-400 bg-indigo-950/40 text-indigo-300/80 px-1.5 py-0.5 rounded">
                  {new Date(block.sealedAt).toLocaleTimeString()}
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
