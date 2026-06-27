import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, RefreshCw, FileText, CheckCircle, Clock, 
  Terminal, ArrowUpRight, Check, Eye, ListFilter
} from 'lucide-react';

interface AuditVaultProps {
  onSelectTransaction: (id: string) => void;
}

export default function AuditVault({
  onSelectTransaction
}: AuditVaultProps) {
  const [evidenceObjects, setEvidenceObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/verify/svt_initial'); // This triggers dynamic gen and returns a bundle which registers things, but let's query the db store instead!
      // Wait, we can hit an API endpoint or load existing ledger list. Let's load the verify data.
      const resVerify = await fetch('/api/verify/svt_initial');
      const data = await resVerify.json();
      if (data.success && data.evidenceObject) {
        setEvidenceObjects([data.evidenceObject]);
      }
      
      // Let's also pull standard lists! Since we want to display multiple evidence objects, let's fetch several typical transactions or random ones
      const ids = ['svt_initial', 'svt_settlement', 'usd_clearing', 'usd_transfer'];
      const objects = [];
      for (const id of ids) {
        try {
          const r = await fetch(`/api/verify/${id}`);
          const d = await r.json();
          if (d.success && d.evidenceObject) {
            objects.push(d.evidenceObject);
          }
        } catch(e){}
      }
      if (objects.length > 0) {
        setEvidenceObjects(objects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const filtered = evidenceObjects.filter(obj => {
    const matchesSearch = obj.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          obj.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          obj.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (typeFilter === 'ALL') return matchesSearch;
    return matchesSearch && obj.status === typeFilter;
  });

  return (
    <div id="compliance-audit-vault" className="space-y-4 font-mono text-xs">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#2a2a35]/65 pb-3">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            Governance Audit Vault
          </h2>
          <p className="text-[8px] text-white/40 mt-0.5">IMMUTABLE CRYPTOGRAPHIC EVIDENCE BUNDLE DEPOSITORIES & LOG ARCHIVES</p>
        </div>
        <button
          onClick={fetchEvidence}
          className="p-1 hover:bg-white/5 text-white/40 hover:text-white rounded"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#0a0a14] border border-[#2a2a35]/50 p-3 rounded-lg items-center">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID, SHA256 Hash, or Evidence ID..." 
            className="w-full bg-[#050508] border border-[#2a2a35] rounded p-2 pl-9 text-white font-mono text-[10px] focus:outline-none focus:border-cyan-400"
          />
        </div>
        
        <div className="md:col-span-4 flex items-center gap-1.5 justify-end">
          <ListFilter className="w-3.5 h-3.5 text-white/30" />
          <button 
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1 text-[9px] font-bold rounded uppercase ${
              typeFilter === 'ALL' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' : 'bg-transparent text-white/40'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setTypeFilter('VERIFIED')}
            className={`px-2.5 py-1 text-[9px] font-bold rounded uppercase ${
              typeFilter === 'VERIFIED' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' : 'bg-transparent text-white/40'
            }`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Results table */}
      <div className="border border-[#2a2a35]/50 rounded-lg bg-[#08080c] overflow-hidden">
        <div className="grid grid-cols-12 p-3 bg-[#0e0e14] border-b border-[#2a2a35]/55 font-bold text-white/50 text-[9px]">
          <span className="col-span-2">EVIDENCE ID</span>
          <span className="col-span-2">TRANSACTION ID</span>
          <span className="col-span-4">SECURE SHA-256 HASH SEAL</span>
          <span className="col-span-2">TIMESTAMP</span>
          <span className="col-span-1 text-center">STATUS</span>
          <span className="col-span-1 text-right">ACTION</span>
        </div>

        <div className="divide-y divide-[#1c1c24]">
          {loading ? (
            <div className="text-center py-8 text-white/30">Querying cryptographic indices...</div>
          ) : filtered.length > 0 ? (
            filtered.map(obj => (
              <div key={obj.id} className="grid grid-cols-12 p-3 hover:bg-white/5 items-center">
                <span className="col-span-2 text-cyan-400 font-bold select-all">{obj.id}</span>
                <span className="col-span-2 text-white/80 select-all font-bold">{obj.transactionId}</span>
                <span className="col-span-4 text-purple-400 break-all select-all pr-4 font-mono text-[9px]">{obj.hash}</span>
                <span className="col-span-2 text-white/40">{obj.timestamp}</span>
                <div className="col-span-1 flex justify-center">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                    VERIFIED
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <button 
                    onClick={() => onSelectTransaction(obj.transactionId)}
                    className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded text-[9px] uppercase font-bold cursor-pointer"
                  >
                    Open Workspace
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/30">No matching audit files found. Make some transactions to build evidence packages.</div>
          )}
        </div>
      </div>

    </div>
  );
}
