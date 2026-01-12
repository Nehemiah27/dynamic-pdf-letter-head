import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Info, Sparkles } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">
      {/* Brand-colored accent shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#2E3191]/5 blur-[120px] animate-pulse-soft"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#EC1C24]/5 blur-[100px] animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <img 
            src="https://reviranexgen.com/assets/logo-with-name.png" 
            alt="Revira Nexgen" 
            className="h-24 mx-auto mb-6 transition-transform hover:scale-105 duration-500"
          />
          <div className="flex items-center justify-center gap-2 text-[#2E3191] font-bold tracking-widest uppercase text-xs">
            <div className="h-px w-8 bg-[#EC1C24]"></div>
            <span>Enterprise Resource Planning</span>
            <div className="h-px w-8 bg-[#EC1C24]"></div>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl space-y-8 border border-slate-100">
          <div className="text-center border-b border-slate-50 pb-6">
            <h2 className="text-2xl font-black text-[#2E3191] uppercase tracking-tight">System Login</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Authorised personnel access only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Info size={16} />
                </div>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-xs font-black text-[#2E3191] uppercase tracking-widest ml-1">Official ID</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#2E3191]" size={20} />
                <input 
                  required
                  type="email" 
                  placeholder="name@reviranexgen.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-[#2E3191] uppercase tracking-widest ml-1">Security Token</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#2E3191]" size={20} />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2E3191] text-white font-black py-5 rounded-2xl hover:bg-[#1e206b] hover:scale-[1.02] transition-all shadow-xl shadow-[#2E3191]/20 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 group relative overflow-hidden"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="relative z-10">Verify Identity</span>
                  <div className="absolute right-0 top-0 h-full w-12 bg-[#EC1C24] flex items-center justify-center translate-x-2 group-hover:translate-x-0 transition-transform skew-x-[-15deg]">
                    <Sparkles size={16} className="text-white skew-x-[15deg]" />
                  </div>
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100">
            <div className="bg-[#2E3191]/5 p-5 rounded-2xl border border-[#2E3191]/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#2E3191]/10 flex items-center justify-center shrink-0">
                <Info size={20} className="text-[#2E3191]" />
              </div>
              <div className="text-[10px] space-y-0.5 text-slate-500 font-bold uppercase tracking-wider">
                <p className="text-[#2E3191]">System Access</p>
                <p>Admin: admin@revira.com / admin123</p>
                <p>Staff: Acceptance of existing emails</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[10px] mt-10 font-black uppercase tracking-[0.2em]">
          &copy; 2025 REVIRA NEXGEN SYSTEMS
        </p>
      </div>
    </div>
  );
};

export default Login;