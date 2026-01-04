import React, { useEffect, useState, useRef } from 'react';
import { SimulationData, ProviderInsight } from '../types';
import { Terminal, ShieldAlert, Activity, Lock, Wifi, Globe, Server, Database } from 'lucide-react';

interface SimulationConsoleProps {
  data: SimulationData | null;
  loading: boolean;
}

const SimulationConsole: React.FC<SimulationConsoleProps> = ({ data, loading }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // States for the 3 providers visual simulation
  const [providers, setProviders] = useState([
    { name: 'ChatGPT', status: 'pending', progress: 0 },
    { name: 'Perplexity', status: 'pending', progress: 0 },
    { name: 'Gemini', status: 'pending', progress: 0 }
  ]);

  useEffect(() => {
    if (loading) {
      setLogs(['> Initialisiere Integration Layer...', '> Starte Browser-Instanzen...', '> Proxy-Rotation aktiv...']);
      
      // Simulate individual provider connection progress
      const interval = setInterval(() => {
        setProviders(prev => prev.map(p => {
          if (p.progress >= 100) return p;
          const increment = Math.random() * 5;
          const newProgress = Math.min(p.progress + increment, 100);
          
          let newStatus = p.status;
          if (newProgress > 20 && p.status === 'pending') newStatus = 'connecting';
          if (newProgress > 60 && p.status === 'connecting') newStatus = 'extracting';
          if (newProgress === 100) newStatus = 'done';

          return { ...p, progress: newProgress, status: newStatus };
        }));

        const msgs = [
            '> ChatGPT: Auth-Token erneuert...',
            '> Perplexity: Zitierebenen werden gescannt...',
            '> Gemini: Graph-Verbindungen analysiert...',
            '> JSON-Objekt abgefangen (24kb)...',
            '> Netzwerk-Latenz normalisiert...'
        ];
        if (Math.random() > 0.7) {
             setLogs(prev => [...prev, msgs[Math.floor(Math.random() * msgs.length)]]);
        }
      }, 150);

      return () => clearInterval(interval);
    } else if (data) {
        setProviders([
            { name: 'ChatGPT', status: 'done', progress: 100 },
            { name: 'Perplexity', status: 'done', progress: 100 },
            { name: 'Gemini', status: 'done', progress: 100 }
        ]);
        setLogs(prev => [...prev, '> ERFOLG: Alle Datenquellen konsolidiert.', '> Logic Layer aktiv.']);
    }
  }, [loading, data]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getStatusColor = (status: string) => {
      if (status === 'done') return 'text-[#33D099] border-[#33D099]';
      if (status === 'extracting') return 'text-[#FCC001] border-[#FCC001] animate-pulse';
      if (status === 'connecting') return 'text-[#46BFED] border-[#46BFED]';
      return 'text-[#61666D] border-[#61666D]';
  };

  return (
    <div className="w-full glass-panel rounded-2xl overflow-hidden relative border border-[#46BFED]/30 flex flex-col md:flex-row h-auto md:h-[500px]">
      
      {/* Left: Active Connections (Integration Layer) */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#46BFED]/20 bg-[#101E35]/40 flex flex-col">
         <div className="p-4 bg-[#101E35]/60 backdrop-blur border-b border-[#46BFED]/10">
            <h3 className="text-[#F6F7F8] text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-[#46BFED]" /> Integration Layer
            </h3>
         </div>
         <div className="p-6 space-y-6 flex-1 flex flex-col justify-center">
            {providers.map((p, i) => (
                <div key={i} className="relative">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`font-bold ${p.status === 'done' ? 'text-white' : 'text-[#F6F7F8]/60'}`}>{p.name}</span>
                        <span className={`text-xs uppercase font-mono px-2 py-0.5 border rounded ${getStatusColor(p.status)}`}>
                            {p.status === 'done' ? 'OK' : p.status}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#101E35] rounded-full overflow-hidden border border-white/5">
                        <div 
                            className={`h-full transition-all duration-200 ${p.status === 'done' ? 'bg-[#33D099]' : 'bg-[#46BFED]'}`} 
                            style={{ width: `${p.progress}%` }}
                        ></div>
                    </div>
                </div>
            ))}
         </div>
         {/* Terminal Logs Mini */}
         <div className="p-4 border-t border-[#46BFED]/10 h-1/3 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <Terminal size={12} className="text-[#61666D]" />
                <span className="text-[10px] uppercase text-[#61666D] font-mono">System Log</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-hidden overflow-y-auto font-mono text-[10px] text-[#46BFED]/70 space-y-1">
                {logs.slice(-6).map((log, i) => (
                    <div key={i} className="truncate">{log}</div>
                ))}
            </div>
         </div>
      </div>

      {/* Right: Data Visualization (Logic Layer) */}
      <div className="w-full md:w-2/3 flex flex-col">
         <div className="p-4 bg-[#101E35]/60 backdrop-blur border-b border-[#46BFED]/10 flex justify-between items-center">
            <h3 className="text-[#F6F7F8] text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                <Database size={14} className="text-[#FCC001]" /> Extracted JSON Fragments
            </h3>
            {data && <span className="text-[10px] px-2 py-1 bg-[#33D099]/20 text-[#33D099] rounded border border-[#33D099]/30">LIVE</span>}
         </div>

         <div className="flex-1 overflow-y-auto p-6 bg-[#0d1625]/60 relative">
            {data ? (
              <div className="space-y-6">
                 {/* Metadata Card */}
                 <div className="p-4 rounded-xl bg-[#101E35] border border-white/5">
                    <h4 className="text-xs text-[#61666D] uppercase mb-2">Global Metadata</h4>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded bg-white/5">
                             <div className="text-[10px] text-[#F6F7F8]/50">Preis-Sensibilität</div>
                             <div className="text-[#FCC001] font-bold text-sm">{data.metadata.priceSensitivity}</div>
                        </div>
                        <div className="text-center p-2 rounded bg-white/5">
                             <div className="text-[10px] text-[#F6F7F8]/50">Tech-Tiefe</div>
                             <div className="text-[#46BFED] font-bold text-sm">{data.metadata.technicalDepth}</div>
                        </div>
                        <div className="text-center p-2 rounded bg-white/5">
                             <div className="text-[10px] text-[#F6F7F8]/50">Reviews</div>
                             <div className="text-[#E33A74] font-bold text-sm">{data.metadata.reviewImportance}%</div>
                        </div>
                    </div>
                 </div>

                 {/* Queries per Provider */}
                 {data.providers.map((p, i) => (
                     <div key={i} className="font-mono text-xs">
                         <div className="flex items-center gap-2 mb-1 text-[#F6F7F8]/80">
                             <span className="text-[#33D099]">></span> {p.name}.extracted_queries
                         </div>
                         <div className="pl-4 border-l border-white/10 space-y-1 py-1">
                             {p.interceptedQueries.map((q, idx) => (
                                 <div key={idx} className="text-[#46BFED]/80">"{q}"</div>
                             ))}
                         </div>
                     </div>
                 ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#61666D] gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#46BFED] blur-xl opacity-20 animate-pulse"></div>
                    <Server size={40} className="relative z-10 text-[#46BFED]/50" />
                </div>
                <p className="font-medium tracking-wide text-sm">Warte auf JSON-Response...</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SimulationConsole;