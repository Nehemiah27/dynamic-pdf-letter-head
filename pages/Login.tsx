
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Loader2, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  KeyRound
} from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const success = onLogin(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid credentials or user not found');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleAltLogin = (method: string) => {
    alert(`${method} is currently restricted. Please use Master Credentials.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 font-['Inter'] bg-white">
      {/* Background decorations removed for a clean body appearance */}

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-sm border border-slate-100 mb-4 transition-transform hover:scale-105 duration-500">
            <img 
              src="https://reviranexgen.com/assets/logo-with-name.png" 
              alt="Revira Nexgen" 
              className="h-14 mx-auto"
            />
          </div>
          <div className="flex items-center justify-center gap-3 text-[#2E3191] font-black tracking-[0.3em] uppercase text-[9px]">
            <div className="h-0.5 w-6 bg-[#EC1C24]"></div>
            <span>Industrial Intelligence v2.6</span>
            <div className="h-0.5 w-6 bg-[#EC1C24]"></div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(46,49,145,0.08)] space-y-6 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2E3191]/10 to-transparent"></div>
          
          <div className="flex justify-between items-start mb-2">
            <div className="relative">
              <h2 className="text-2xl font-black text-[#2E3191] uppercase tracking-tighter leading-none">Command Center</h2>
              <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={11} className="text-[#EC1C24]" /> Access Level: Tier 1
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">System Online</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black flex items-center gap-3 animate-shake uppercase tracking-tight">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Info size={16} />
                </div>
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">Officer Credentials (ID)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="text-slate-300 transition-colors group-focus-within:text-[#2E3191]" size={18} />
                </div>
                <input 
                  required
                  type="email" 
                  placeholder="name@reviranexgen.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-sm placeholder:text-slate-300 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">Access Token (Secret)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="text-slate-300 transition-colors group-focus-within:text-[#2E3191]" size={18} />
                </div>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-sm placeholder:text-slate-300 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group/check">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-[#2E3191] border-[#2E3191]' : 'bg-slate-50 border-slate-200'}`}>
                    {rememberMe && <div className="w-1.5 h-1.5 rounded-full bg-white animate-scale-in"></div>}
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 group-hover/check:text-[#2E3191] transition-colors uppercase tracking-widest">Remember Identity</span>
              </label>
              <button 
                type="button" 
                onClick={() => handleAltLogin('Recovery')}
                className="text-[10px] font-black text-[#EC1C24] hover:underline uppercase tracking-widest"
              >
                Forgot Token?
              </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2E3191] text-white font-black py-5 rounded-2xl hover:bg-[#1e206b] hover:shadow-[0_20px_40px_-10px_rgba(46,49,145,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98] group relative overflow-hidden shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="relative z-10 text-[11px] uppercase tracking-[0.2em]">Initiate Authorization</span>
                  <div className="absolute right-0 top-0 h-full w-14 bg-[#EC1C24] flex items-center justify-center translate-x-4 group-hover:translate-x-0 transition-transform skew-x-[-15deg]">
                    <Sparkles size={16} className="text-white skew-x-[15deg]" />
                  </div>
                </>
              )}
            </button>
          </form>

          {/* Master Credentials Display */}
          <div className="pt-2 border-t border-slate-50">
            <div className="p-1 relative">
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <KeyRound size={12} className="text-[#2E3191]" />
                 </div>
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Access Keys</h4>
               </div>
               
               <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between group/id">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Login ID:</span>
                    <span className="text-[10px] font-mono font-bold text-slate-600 group-hover/id:text-[#2E3191] transition-colors">admin@revira.com</span>
                  </div>
                  <div className="flex items-center justify-between group/pass">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Password:</span>
                    <span className="text-[10px] font-mono font-bold text-slate-600 group-hover/pass:text-[#2E3191] transition-colors">admin123</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => handleAltLogin('Support')}
              className="w-full flex items-center justify-center gap-2 py-2 text-slate-300 hover:text-[#2E3191] transition-colors"
            >
              <HelpCircle size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Help Desk & Terminal Support</span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center opacity-30">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
            &copy; 2025 Revira Nexgen Structures Private Limited
          </span>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;
