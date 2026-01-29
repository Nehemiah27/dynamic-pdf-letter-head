import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  FileText,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Client, Project, User } from "../types";

interface DashboardProps {
  clients: Client[];
  projects: Project[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients, projects, users }) => {
  const stats = [
    {
      label: "Clients",
      value: clients.length,
      icon: <Users className="text-[#2E3191]" />,
      color: "bg-blue-50/50",
    },
    {
      label: "Projects",
      value: projects.length,
      icon: <Briefcase className="text-[#EC1C24]" />,
      color: "bg-red-50/50",
    },
    {
      label: "Staff",
      value: users.length,
      icon: <FileText className="text-[#2E3191]" />,
      color: "bg-slate-50",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#2E3191] tracking-tight uppercase">
            Executive Dashboard
          </h1>
          <p className="text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest">
            Precision engineering oversight.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/clients"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-100 px-4 py-3 lg:py-2.5 rounded-xl text-[10px] font-black text-[#2E3191] hover:border-[#2E3191] transition-all shadow-sm uppercase tracking-widest"
          >
            Directory
          </Link>
          <Link
            to="/projects"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#EC1C24] px-4 py-3 lg:py-2.5 rounded-xl text-[10px] font-black text-white hover:bg-[#d11920] transition-all shadow-xl shadow-[#EC1C24]/20 active:scale-95 uppercase tracking-widest"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6 hover:shadow-2xl transition-all group"
          >
            <div
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 border border-white shrink-0`}
            >
              {/* Added <any> to React.ReactElement cast to ensure 'size' property is accepted by cloneElement */}
              {React.cloneElement(stat.icon as React.ReactElement<any>, {
                size: 20,
              })}
            </div>
            <div>
              <p className="text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-2xl lg:text-3xl font-black text-[#2E3191]">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <h3 className="font-black text-[#2E3191] flex items-center gap-2 uppercase tracking-tight text-xs lg:text-sm">
              <Clock size={18} className="text-[#2E3191]" />
              Project Pipeline
            </h3>
            <Link
              to="/projects"
              className="text-[9px] lg:text-[10px] font-black text-[#EC1C24] hover:text-[#d11920] flex items-center gap-1 uppercase tracking-widest"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {projects.length > 0 ? (
              projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between p-5 lg:p-6 hover:bg-[#2E3191]/5 transition-colors group"
                >
                  <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#2E3191] font-black text-lg group-hover:bg-[#2E3191] group-hover:text-white transition-all shrink-0">
                      {project.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-[#2E3191] group-hover:text-[#EC1C24] transition-colors uppercase tracking-tight text-[11px] lg:text-sm truncate">
                        {project.name}
                      </p>
                      <p className="text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                        {project.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                    <span className="hidden xs:inline-block px-2 py-0.5 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-[#2E3191] border-blue-100">
                      {project.status}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-slate-200 group-hover:text-[#EC1C24] transition-all"
                    />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 lg:p-20 text-center text-slate-300">
                <Briefcase size={40} className="mx-auto mb-4 opacity-10" />
                <p className="font-black uppercase text-[10px] tracking-widest">
                  No active projects
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Clients Table Snippet */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <h3 className="font-black text-[#2E3191] flex items-center gap-2 uppercase tracking-tight text-xs lg:text-sm">
              <Users size={18} className="text-[#EC1C24]" />
              Partners
            </h3>
            <Link
              to="/clients"
              className="text-[9px] lg:text-[10px] font-black text-[#EC1C24] hover:text-[#d11920] flex items-center gap-1 uppercase tracking-widest"
            >
              Manager <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 lg:px-8 py-4">Organisation</th>
                  <th className="px-6 lg:px-8 py-4 hidden sm:table-cell">
                    Liaison
                  </th>
                  <th className="px-6 lg:px-8 py-4 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clients.length > 0 ? (
                  clients.slice(0, 5).map((client) => (
                    <tr
                      key={client.id}
                      className="text-sm hover:bg-[#2E3191]/5 transition-colors group"
                    >
                      <td className="px-6 lg:px-8 py-5">
                        <p className="font-black text-[#2E3191] group-hover:text-[#EC1C24] uppercase tracking-tight text-[11px] lg:text-sm">
                          {client.name}
                        </p>
                        <p className="text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]">
                          {client.email}
                        </p>
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-slate-600 font-bold text-[10px] lg:text-xs uppercase tracking-wide hidden sm:table-cell">
                        {client.contactPerson}
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-right">
                        <Link
                          to={`/clients?id=${client.id}`}
                          className="text-[9px] lg:text-[10px] font-black text-[#2E3191] hover:text-[#EC1C24] transition-colors uppercase tracking-widest"
                        >
                          Engage
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-12 lg:p-20 text-center text-slate-300"
                    >
                      <Users size={40} className="mx-auto mb-4 opacity-10" />
                      <p className="font-black uppercase text-[10px] tracking-widest">
                        No clients registered
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
