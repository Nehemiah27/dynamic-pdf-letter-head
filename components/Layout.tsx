import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  UserCog,
  Database,
  CloudLightning,
  RefreshCw,
} from "lucide-react";
import { User } from "../types";

interface LayoutProps {
  children?: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  brandColor: string;
  logo: string;
  logoBackgroundColor: string;
  isSyncing?: boolean;
  dbStatus?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  onLogout,
  brandColor,
  logo,
  logoBackgroundColor,
  isSyncing,
  dbStatus,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/" },
    { icon: <Users size={20} />, label: "Clients", path: "/clients" },
    { icon: <Briefcase size={20} />, label: "Projects", path: "/projects" },
  ];

  if (user?.role === "Administrator") {
    navItems.push({
      icon: <UserCog size={20} />,
      label: "Users",
      path: "/users",
    });
  }

  navItems.push({
    icon: <Settings size={20} />,
    label: "Branding",
    path: "/branding",
  });

  const brandRed = "#EC1C24";

  return (
    <div className="h-screen flex bg-white overflow-hidden font-['Inter']">
      {/* Syncing Bar */}
      {isSyncing && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-white overflow-hidden">
          <div
            className="h-full bg-[#EC1C24] animate-progress-indefinite"
            style={{ width: "40%" }}
          ></div>
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: brandColor }}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl pointer-events-none"></div>

          <div className="p-8 pb-4 relative z-10 flex flex-col items-center">
            <div
              className="p-4 rounded-2xl shadow-lg mb-2 flex items-center justify-center min-h-[80px] w-full"
              style={{ backgroundColor: logoBackgroundColor || "#ffffff" }}
            >
              <img
                src={logo}
                alt="Revira Nexgen"
                className="h-10 w-auto object-contain mx-auto"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 px-2 w-full">
              <div className="h-px flex-1 bg-white/20"></div>
              <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] whitespace-nowrap">
                ERP Ecosystem
              </span>
              <div className="h-px flex-1 bg-white/20"></div>
            </div>
          </div>

          <nav className="flex-1 px-6 py-4 space-y-1 relative z-10 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group ${isActive ? "text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/10"}`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: brandRed,
                        boxShadow: `0 10px 15px -3px ${brandRed}44`,
                      }
                    : {}
                }
                onClick={() => setSidebarOpen(false)}
              >
                <div className="transition-transform group-hover:scale-110 duration-200">
                  {item.icon}
                </div>
                <span className="font-bold text-sm uppercase tracking-wider">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="p-6 border-t border-white/10 bg-black/10 relative z-10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-5 py-4 text-white/60 hover:text-white hover:bg-red-50/20 rounded-xl transition-all duration-200 group"
            >
              <LogOut
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="font-bold text-sm uppercase tracking-wider">
                Sign Out
              </span>
            </button>
            <p className="text-[9px] text-white/30 text-center mt-6 font-medium uppercase tracking-widest">
              v2.6.0 • Mobile Ready
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-10 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden xs:block"></div>
              <h1 className="text-[10px] lg:text-xs font-black text-[#2E3191] uppercase tracking-[0.1em] lg:tracking-[0.2em]">
                Command Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group cursor-default">
              {isSyncing ? (
                <RefreshCw size={12} className="text-[#2E3191] animate-spin" />
              ) : (
                <CloudLightning
                  size={12}
                  className={
                    dbStatus === "Connected"
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }
                />
              )}
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                DB:{" "}
                <span
                  className={
                    dbStatus === "Connected"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                >
                  {dbStatus}
                </span>
              </span>
            </div>

            <div className="relative group">
              <button className="p-2 lg:p-3 text-slate-400 hover:text-[#2E3191] hover:bg-slate-50 rounded-xl transition-all">
                <Bell size={20} />
              </button>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EC1C24] border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
            </div>

            <div className="h-8 w-px bg-slate-100 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-black text-[#2E3191] leading-tight uppercase tracking-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {user?.role}
                </p>
              </div>
              <div
                className="w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-black border-2 lg:border-4 border-slate-50 shadow-md transition-transform hover:scale-105 cursor-pointer text-xs lg:text-base"
                style={{ backgroundColor: brandColor }}
              >
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 no-print bg-slate-50/30 h-[80vh] min-h-0">
          {children}
        </main>
      </div>

      <style>{`
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 2s infinite linear;
        }
        @media (max-width: 400px) {
          .xs\:hidden { display: none; }
          .xs\:block { display: block; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
