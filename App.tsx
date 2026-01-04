import React, { useState } from 'react';
import { AppStatus, SimulationData, StrategyReport } from './types';
import { simulateNetworkTraffic, generateStrategyReport } from './services/geminiService';
import SimulationConsole from './components/SimulationConsole';
import AnalysisDashboard from './components/AnalysisDashboard';
import { Search, Cpu, ArrowRight, RefreshCw, Zap, Network } from 'lucide-react';

const App: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [strategyReport, setStrategyReport] = useState<StrategyReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setStatus(AppStatus.SIMULATING);
    setSimulationData(null);
    setStrategyReport(null);
    setErrorMsg(null);

    try {
      // Step 1: Simulate Integration Layer (Scraping 3 models)
      const simResult = await simulateNetworkTraffic(keyword);
      setSimulationData(simResult);
      
      // Step 2: Logic Layer Analysis
      setStatus(AppStatus.ANALYZING);
      const reportResult = await generateStrategyReport(simResult);
      setStrategyReport(reportResult);
      
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ein unbekannter Fehler ist aufgetreten.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setKeyword('');
    setSimulationData(null);
    setStrategyReport(null);
  };

  return (
    <div className="min-h-screen text-[#F6F7F8] p-4 md:p-8 relative">
      {/* Abstract Background Shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#33D099] opacity-10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#E33A74] opacity-10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#FF9220] to-[#FCC001] rounded-2xl shadow-[0_0_20px_rgba(255,146,32,0.3)]">
               <Zap className="text-[#101E35]" size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#F6F7F8]/70 drop-shadow-sm">
                LLM-Optimierer
              </h1>
              <p className="text-[#46BFED] text-sm md:text-base font-medium tracking-wide mt-1">
                Multi-Source KI-Strategie Automatisierung
              </p>
            </div>
          </div>
          {status === AppStatus.COMPLETE && (
            <button 
              onClick={handleReset}
              style={{ '--btn-bg': '#101E35' } as React.CSSProperties}
              className="glossy-btn mt-6 md:mt-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border border-white/10 text-[#46BFED]"
            >
              <RefreshCw size={18} /> Neue Analyse
            </button>
          )}
        </header>

        {/* Input Section - Only visible when IDLE */}
        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 animate-fadeIn">
            <div className="w-full max-w-3xl text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Hacke den <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9220] to-[#FCC001]">Network-Tab</span> der KIs
              </h2>
              <p className="text-[#F6F7F8]/60 text-lg md:text-xl font-light max-w-2xl mx-auto">
                Unser <strong>Integration Layer</strong> greift automatisch die Suchanfragen von ChatGPT, Perplexity und Gemini ab, um dir den perfekten SEO-Plan zu liefern.
              </p>
            </div>
            
            <form onSubmit={handleStart} className="w-full max-w-2xl relative group transform transition-transform hover:scale-[1.01]">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#33D099] via-[#46BFED] to-[#E33A74] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
              <div className="relative glass-input rounded-full flex items-center p-2 pr-2.5 shadow-2xl">
                <Search className="ml-6 text-[#46BFED]" size={24} />
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nische eingeben (z.B. CRM Software, Laufschuhe...)"
                  className="flex-1 bg-transparent border-none outline-none text-white px-6 py-5 placeholder:text-[#F6F7F8]/30 text-lg font-medium"
                />
                <button 
                  type="submit"
                  disabled={!keyword.trim()}
                  style={{ '--btn-bg': 'linear-gradient(135deg, #FF9220 0%, #FCC001 100%)' } as React.CSSProperties}
                  className="glossy-btn text-[#101E35] px-8 py-4 rounded-full font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,146,32,0.4)]"
                >
                  Starten <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>
            </form>

            <div className="flex gap-4 md:gap-8 opacity-60">
                {/* Provider Icons */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-[#71D033]"></div> <span className="text-xs font-mono">ChatGPT</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-[#46BFED]"></div> <span className="text-xs font-mono">Perplexity</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-[#E33A74]"></div> <span className="text-xs font-mono">Gemini</span>
                </div>
            </div>
          </div>
        )}

        {/* Simulation Phase View */}
        {(status === AppStatus.SIMULATING || status === AppStatus.ANALYZING || status === AppStatus.COMPLETE) && (
          <div className="space-y-8 animate-slideUp">
            <div className="flex items-center gap-5 mb-2 pl-2">
              <div className={`p-3 rounded-2xl shadow-lg border border-white/10 ${status === AppStatus.COMPLETE ? 'bg-[#101E35] text-[#61666D]' : 'bg-[#33D099]/10 text-[#33D099] shadow-[0_0_15px_rgba(51,208,153,0.2)]'}`}>
                <Network size={32} className={status === AppStatus.SIMULATING ? 'animate-pulse' : ''} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {status === AppStatus.SIMULATING ? 'Integration Layer: Scraping aktiv...' : 
                   status === AppStatus.ANALYZING ? 'Logic Layer: Daten werden korreliert...' :
                   'Strategie-Report generiert'}
                </h2>
                <p className="text-base text-[#F6F7F8]/50 font-medium">
                  Ziel: <span className="text-[#33D099]">{keyword}</span>
                </p>
              </div>
            </div>

            <SimulationConsole 
              data={simulationData} 
              loading={status === AppStatus.SIMULATING || status === AppStatus.ANALYZING} 
            />
          </div>
        )}

        {/* Results View */}
        {status === AppStatus.COMPLETE && strategyReport && (
          <div className="pt-8 border-t border-white/10">
             <AnalysisDashboard report={strategyReport} />
          </div>
        )}

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="p-8 glass-panel border-l-4 border-[#E33A4E] rounded-r-xl rounded-l-none text-center max-w-2xl mx-auto">
            <h3 className="text-[#E33A4E] font-bold text-xl mb-3">Verbindung fehlgeschlagen</h3>
            <p className="text-[#F6F7F8]/70 mb-6">{errorMsg}</p>
            <button 
              onClick={handleReset}
              style={{ '--btn-bg': '#101E35' } as React.CSSProperties}
              className="glossy-btn px-6 py-3 rounded-full text-[#F6F7F8] border border-white/10"
            >
              Neustart
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;