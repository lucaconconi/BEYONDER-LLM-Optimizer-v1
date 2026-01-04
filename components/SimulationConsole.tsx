import React, { useEffect, useState, useRef } from 'react';
import { SimulationData } from '../types';
import { Terminal, ShieldAlert, Activity, Lock, Wifi } from 'lucide-react';

interface SimulationConsoleProps {
  data: SimulationData | null;
  loading: boolean;
}

const SimulationConsole: React.FC<SimulationConsoleProps> = ({ data, loading }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) {
      setLogs(['> Initialisiere Proxy-Verbindung...', '> Handshake mit LLM-Provider...', '> Warte auf Anfrage...']);
      const interval = setInterval(() => {
        const msgs = [
          '> Paket abgefangen: 4KB',
          '> Entschlüssle Header...',
          '> Umgehe SSL-Pinning...',
          '> Extrahiere Nutzdaten...',
          '> Analysiere JSON-Struktur...',
          '> Latenzmessung aktiv...'
        ];
        setLogs(prev => [...prev, msgs[Math.floor(Math.random() * msgs.length)]]);
      }, 800);
      return () => clearInterval(interval);
    } else if (data) {
      setLogs(prev => [...prev, '> ERFOLG: Daten extrahiert.', '> Payload bereit zur Analyse.']);
    }
  }, [loading, data]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full glass-panel rounded-2xl overflow-hidden relative border border-[#46BFED]/30">
      {/* Header */}
      <div className="bg-[#101E35]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#46BFED]/20">
        <div className="flex items-center gap-2 text-[#46BFED]">
          <Terminal size={18} />
          <span className="font-bold tracking-wide text-sm font-mono">TRACE_TERMINAL_v2.4</span>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#E33A4E] shadow-[0_0_8px_rgba(227,58,78,0.6)]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FCC001] shadow-[0_0_8px_rgba(252,192,1,0.6)]"></div>
          <div className="w-3 h-3 rounded-full bg-[#33D099] shadow-[0_0_8px_rgba(51,208,153,0.6)]"></div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-[450px]">
        {/* Left: Logs */}
        <div className="flex flex-col h-full">
          <h3 className="text-[#33D099] mb-3 text-xs uppercase font-bold tracking-widest flex items-center gap-2">
            <Activity size={14} /> Live-Datenstrom
          </h3>
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#0d1625]/80 p-4 rounded-xl border border-[#46BFED]/10 font-mono text-xs shadow-inner">
            {logs.map((log, i) => (
              <div key={i} className="mb-2 text-[#46BFED]/90 break-all flex items-start gap-2">
                <span className="opacity-40 select-none">
                  {new Date().toLocaleTimeString('de-CH').split(' ')[0]}
                </span>
                <span>{log}</span>
              </div>
            ))}
            {loading && <div className="animate-pulse text-[#33D099] font-bold">_</div>}
          </div>
        </div>

        {/* Right: Extracted Data Visualization */}
        <div className="flex flex-col h-full">
          <h3 className="text-[#FCC001] mb-3 text-xs uppercase font-bold tracking-widest flex items-center gap-2">
            <Lock size={14} /> Decodierte Payload
          </h3>
          <div className="flex-1 overflow-y-auto bg-[#101E35]/60 p-4 rounded-xl border border-[#FCC001]/10 text-xs shadow-inner relative group">
            {data ? (
              <pre className="text-[#F6F7F8] font-mono leading-relaxed">
                <span className="text-[#E33A74]">{"{"}</span>
                {'\n  '}<span className="text-[#46BFED]">"target"</span>: <span className="text-[#33D099]">"{data.targetKeyword}"</span>,
                {'\n  '}<span className="text-[#46BFED]">"intent"</span>: <span className="text-[#33D099]">"{data.detectedIntent}"</span>,
                {'\n  '}<span className="text-[#46BFED]">"latency"</span>: <span className="text-[#FCC001]">{data.simulatedNetworkLatencyMs}ms</span>,
                {'\n  '}<span className="text-[#46BFED]">"queries"</span>: <span className="text-[#F6F7F8]">[</span>
                {data.interceptedQueries.map((q, i) => (
                   <React.Fragment key={i}>{'\n    '}<span className="text-[#33D099]">"{q}"</span>{i < data.interceptedQueries.length - 1 ? ',' : ''}</React.Fragment>
                ))}
                {'\n  '}<span className="text-[#F6F7F8]">]</span>,
                {'\n  '}<span className="text-[#46BFED]">"meta"</span>: <span className="text-[#F6F7F8]">{JSON.stringify(data.metadata, null, 2).replace(/{/g, '').replace(/}/g, '').trim()}</span>
                {'\n'}<span className="text-[#E33A74]">{"}"}</span>
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#61666D] gap-4">
                <div className="p-4 rounded-full bg-[#101E35] border border-[#61666D]/30 shadow-xl">
                    <Wifi size={32} className="opacity-30" />
                </div>
                <p className="font-medium tracking-wide">Warte auf Signal...</p>
              </div>
            )}
            
            {/* Glossy Overlay effect for screen */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationConsole;