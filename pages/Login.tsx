import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  Loader2,
  Info,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  KeyRound,
  Fingerprint,
  AlertCircle,
} from "lucide-react";

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await onLogin(email, password);
      navigate("/");
    } catch (err: any) {
      console.error("Login caught error:", err);
      // Display the actual error message from the backend or store
      setError(err.message || "An unexpected error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 font-['Inter'] bg-white">
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
            <span>NestJS / MongoDB Compass Local</span>
            <div className="h-0.5 w-6 bg-[#EC1C24]"></div>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(46,49,145,0.08)] space-y-6 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2E3191]/10 to-transparent"></div>

          <div className="flex justify-between items-start mb-2">
            <div className="relative">
              <h2 className="text-2xl font-black text-[#2E3191] uppercase tracking-tighter leading-none">
                Access Control
              </h2>
              <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={11} className="text-[#EC1C24]" /> MongoDB
                Compass Local v1.42
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                Uplink Active
              </span>
            </div>
          </div>

          <div className="bg-[#2E3191]/5 border border-[#2E3191]/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Fingerprint size={14} className="text-[#2E3191]" />
              <span className="text-[9px] font-black text-[#2E3191] uppercase tracking-widest">
                Master Credentials
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 font-bold uppercase">
                Login ID:
              </span>
              <span className="font-mono font-bold text-[#2E3191] bg-white px-2 py-0.5 rounded border border-[#2E3191]/5 select-all">
                admin@reviranexgen.com
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 font-bold uppercase">
                Token (Pass):
              </span>
              <span className="font-mono font-bold text-[#EC1C24] bg-white px-2 py-0.5 rounded border border-[#EC1C24]/5 select-all">
                admin@123
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black flex items-start gap-3 animate-shake uppercase tracking-tight">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle size={16} />
                </div>
                <div className="flex-1 leading-tight py-1">{error}</div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                Identity (Email)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail
                    className="text-slate-300 transition-colors group-focus-within:text-[#2E3191]"
                    size={18}
                  />
                </div>
                <input
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@reviranexgen.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                Secure Token (Pass)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock
                    className="text-slate-300 transition-colors group-focus-within:text-[#2E3191]"
                    size={18}
                  />
                </div>
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2E3191] text-white font-black py-5 rounded-2xl hover:bg-[#1e206b] transition-all flex items-center justify-center gap-3 disabled:opacity-70 group relative overflow-hidden shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="relative z-10 text-[11px] uppercase tracking-[0.2em]">
                    Verify Identity
                  </span>
                  <div className="absolute right-0 top-0 h-full w-14 bg-[#EC1C24] flex items-center justify-center translate-x-4 group-hover:translate-x-0 transition-transform skew-x-[-15deg]">
                    <Sparkles size={16} className="text-white skew-x-[15deg]" />
                  </div>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-50">
            <div className="p-1">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
                Local System Access Only
              </h4>
              <p className="text-[9px] text-slate-300 leading-relaxed italic">
                Unauthorized access attempts are logged to the local MongoDB
                Compass audit trail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
