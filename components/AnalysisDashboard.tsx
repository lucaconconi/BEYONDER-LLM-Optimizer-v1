import React from 'react';
import { StrategyReport } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
} from 'recharts';
import { CheckCircle, Zap, Target, FileText, Layers, AlertTriangle, AlertCircle } from 'lucide-react';

interface AnalysisDashboardProps {
  report: StrategyReport;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ report }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Executive Summary */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
           <FileText size={120} className="text-[#46BFED]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <span className="p-2 rounded-lg bg-[#46BFED]/20 text-[#46BFED]">
            <FileText size={24} /> 
          </span>
          Strategische Zusammenfassung
        </h2>
        <p className="text-[#F6F7F8]/90 leading-relaxed text-lg font-light">
            {report.executiveSummary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Ranking Factors Chart */}
        <div className="glass-panel p-8 rounded-3xl min-h-[400px]">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-[#33D099]/20 text-[#33D099]">
                <Target size={24} /> 
            </span>
            LLM-Ranking-Kriterien
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.rankingFactors} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={140} 
                    tick={{ fill: '#F6F7F8', fontSize: 13, fontWeight: 500, fontFamily: 'Montserrat' }} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ 
                      backgroundColor: '#101E35', 
                      borderColor: 'rgba(70, 191, 237, 0.3)', 
                      color: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                  }} 
                  itemStyle={{ color: '#46BFED' }}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
                  {report.rankingFactors.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={index % 2 === 0 ? '#46BFED' : '#E33A74'} 
                        style={{ filter: 'drop-shadow(0px 0px 4px rgba(70, 191, 237, 0.3))' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Keyword Clusters */}
        <div className="glass-panel p-8 rounded-3xl min-h-[400px] flex flex-col">
           <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-[#E33A74]/20 text-[#E33A74]">
                <Layers size={24} /> 
            </span>
            Semantische Cluster
          </h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {report.keywordClusters.map((cluster, idx) => (
              <div key={idx} className="bg-[#0f172a]/40 p-4 rounded-xl border border-white/5 hover:border-[#FF9220]/50 transition-colors">
                <h4 className="text-sm font-bold text-[#FF9220] mb-3 uppercase tracking-wider">{cluster.topic}</h4>
                <div className="flex flex-wrap gap-2">
                  {cluster.keywords.map((kw, kIdx) => (
                    <span key={kIdx} className="text-xs bg-white/5 text-[#F6F7F8] px-3 py-1.5 rounded-full border border-white/10 shadow-sm backdrop-blur-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="glass-panel p-8 rounded-3xl">
        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="p-2 rounded-lg bg-[#FCC001]/20 text-[#FCC001]">
            <Zap size={24} /> 
          </span>
          Reverse-Engineering Massnahmenplan
        </h3>
        <div className="space-y-4">
          {report.actionPlan.map((step, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-r from-white/5 to-transparent rounded-2xl border border-white/5 hover:border-[#33D099]/30 transition-all group">
              <div className="mt-1 min-w-[32px]">
                 {step.priority === 'Hoch' ? (
                     <AlertCircle className="text-[#E33A4E] drop-shadow-[0_0_8px_rgba(227,58,78,0.5)]" size={32} />
                 ) : step.priority === 'Mittel' ? (
                     <AlertTriangle className="text-[#FCC001] drop-shadow-[0_0_8px_rgba(252,192,1,0.5)]" size={32} />
                 ) : (
                     <CheckCircle className="text-[#71D033] drop-shadow-[0_0_8px_rgba(113,208,51,0.5)]" size={32} />
                 )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                  <h4 className="text-lg font-bold text-white group-hover:text-[#33D099] transition-colors">{step.title}</h4>
                  <div className="flex gap-2">
                     <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase border backdrop-blur-md shadow-sm
                      ${step.priority === 'Hoch' ? 'border-[#E33A4E]/30 text-[#E33A4E] bg-[#E33A4E]/10' : 
                        step.priority === 'Mittel' ? 'border-[#FCC001]/30 text-[#FCC001] bg-[#FCC001]/10' : 
                        'border-[#71D033]/30 text-[#71D033] bg-[#71D033]/10'}
                    `}>
                      {step.priority} Prio
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full font-bold uppercase bg-[#101E35] border border-white/10 text-[#61666D]">
                      {step.effort}
                    </span>
                  </div>
                </div>
                <p className="text-[#F6F7F8]/70 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalysisDashboard;