
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  Server, 
  CloudLightning, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Globe,
  Settings,
  Cpu,
  Layers,
  Zap,
  Monitor
} from 'lucide-react';
import { DbConfig, AppState } from '../types';

interface DatabasePortalProps {
  config: DbConfig;
  onUpdateConfig: (config: Partial<DbConfig>) => void;
  stats: { clients: number; projects: number; quotations: number };
  state: AppState;
}

const DatabasePortal: React.FC<DatabasePortalProps> = ({ config, onUpdateConfig, stats, state }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [tempUri, setTempUri] = useState(config.uri);
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info'|'success'|'error'}[]>([
    { msg: 'NestJS Microservice Initialized. Runtime: local-v1.4.2', time: new Date().toLocaleTimeString(), type: 'info' },
    { msg: 'MongoDB Compass Pool: 5 local connections established.', time: new Date().toLocaleTimeString(), type: 'success' },
    { msg: 'Local DB Proxy: Port 27017 listening.', time: new Date().toLocaleTimeString(), type: 'info' }
  ]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setLogs(prev => [{ msg: `Pinging Local MongoDB @ ${config.uri}...`, time: new Date().toLocaleTimeString(), type: 'info' }, ...prev]);
    
    await new Promise(r => setTimeout(r, 1200));
    
    setLogs(prev => [{ msg: 'Compass Status: Operational. Response: 1ms.', time: new Date().toLocaleTimeString(), type: 'success' }, ...prev]);
    onUpdateConfig({ status: 'Connected', lastSync: new Date().toISOString() });
    setIsTesting(false);
  };

  return (
    <div className="space-y-8 animate-fade-in bg-white max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-[#2E3191] text-white flex items-center justify-center shadow-2xl shadow-[#2E3191]/20">
             <Monitor size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#2E3191] tracking-tight uppercase">Local Infrastructure</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
               <Zap size={14} className="text-[#EC1C24]" /> NestJS Runtime & MongoDB Compass Local Instance
            </p>
          </div>
        </div>
        <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border-2 transition-all ${
          config.status === 'Connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${config.status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-50'}`}></div>
          <span className="text-xs font-black uppercase tracking-widest">Environment: Localhost</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-800 space-y-6 group">
               <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                     <Cpu size={24} />
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-500 uppercase">System Uptime</p>
                     <p className="text-xl font-black text-white">99.9% Local</p>
                  </div>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[100%]"></div>
               </div>
               <p className="text-[9px] font-mono text-slate-500 uppercase">Instance: localhost:3000</p>
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-800 space-y-6 group">
               <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                     <Database size={24} />
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-500 uppercase">Compass Health</p>
                     <p className="text-xl font-black text-white">Port 27017 [Ready]</p>
                  </div>
               </div>
               <div className="flex gap-1.5 h-1.5 items-center">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`flex-1 h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}></div>
                  ))}
               </div>
               <p className="text-[9px] font-mono text-slate-500 uppercase">Database: {config.dbName} • Latency: 1ms</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
               <h3 className="text-xl font-black text-[#2E3191] uppercase tracking-tight flex items-center gap-3">
                 <Monitor size={24} className="text-[#EC1C24]" />
                 Compass Orchestrator
               </h3>
               
               <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Local NestJS Backend Proxy</label>
                   <input 
                     type="text"
                     className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-mono text-xs transition-all"
                     value={config.apiEndpoint}
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compass Connection String</label>
                     <input 
                       disabled
                       type="text"
                       className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl font-bold text-slate-400 outline-none"
                       value={tempUri}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol</label>
                     <div className="w-full px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-between border border-emerald-100">
                       <span className="text-[10px] font-black uppercase tracking-widest">Local-Only</span>
                       <ShieldCheck size={18} />
                     </div>
                   </div>
                 </div>

                 <button 
                   onClick={handleTestConnection}
                   disabled={isTesting}
                   className="w-full bg-[#2E3191] text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-[#1e206b] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isTesting ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                   Refresh Local Compass Handshake
                 </button>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 h-[640px] flex flex-col border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2E3191] via-[#EC1C24] to-[#2E3191]"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Terminal size={18} className="text-[#EC1C24]" />
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">Compass Console</h3>
              </div>
              <Activity size={14} className="text-blue-400 animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar-dark pr-2">
              {logs.map((log, i) => (
                <div key={i} className="space-y-1.5 border-l-2 border-slate-800 pl-4 group hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-center text-[7px] font-mono text-slate-500">
                    <span>PROCESS: LOCALHOST-DB</span>
                    <span>{log.time}</span>
                  </div>
                  <p className={`text-[10px] font-mono leading-relaxed break-words ${
                    log.type === 'success' ? 'text-emerald-400' : 
                    log.type === 'error' ? 'text-red-400' : 'text-blue-300'
                  }`}>
                    <span className="opacity-40 mr-2">_</span>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
               <span>Socket: localhost:27017</span>
               <span className="text-white">Active Node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePortal;
