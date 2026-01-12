import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Client, Project, User } from '../types';

interface DashboardProps {
  clients: Client[];
  projects: Project[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients, projects, users }) => {
  const stats = [
    { label: 'Total Clients', value: clients.length, icon: <Users className="text-[#2E3191]" />, color: 'bg-blue-50/50' },
    { label: 'Active Projects', value: projects.length, icon: <Briefcase className="text-[#EC1C24]" />, color: 'bg-red-50/50' },
    { label: 'Staff Members', value: users.length, icon: <FileText className="text-[#2E3191]" />, color: 'bg-slate-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2E3191] tracking-tight uppercase">Executive Dashboard</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Precision engineering project overview.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/clients" 
            className="flex items-center gap-2 bg-white border-2 border-slate-100 px-5 py-2.5 rounded-xl text-xs font-black text-[#2E3191] hover:border-[#2E3191] transition-all shadow-sm uppercase tracking-widest"
          >
            Client Directory
          </Link>
          <Link 
            to="/projects" 
            className="flex items-center gap-2 bg-[#EC1C24] px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-[#d11920] transition-all shadow-xl shadow-[#EC1C24]/20 active:scale-95 uppercase tracking-widest"
          >
            <Plus size={18} />
            Launch Project
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-2xl transition-all group">
            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 border border-white`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-[#2E3191]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <h3 className="font-black text-[#2E3191] flex items-center gap-2 uppercase tracking-tight text-sm">
              <Clock size={20} className="text-[#2E3191]" />
              Project Pipeline
            </h3>
            <Link to="/projects" className="text-[10px] font-black text-[#EC1C24] hover:text-[#d11920] flex items-center gap-1 uppercase tracking-widest">
              Full Spectrum <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {projects.length > 0 ? projects.slice(0, 5).map((project) => (
              <Link 
                key={project.id} 
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-6 hover:bg-[#2E3191]/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#2E3191] font-black text-xl group-hover:bg-[#2E3191] group-hover:text-white transition-all">
                    {project.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-[#2E3191] group-hover:text-[#EC1C24] transition-colors uppercase tracking-tight text-sm">{project.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{project.workflow} • {project.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    project.status === 'Ongoing' ? 'bg-blue-50 text-[#2E3191] border-blue-100' :
                    project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {project.status}
                  </span>
                  <ArrowUpRight size={18} className="text-slate-200 group-hover:text-[#EC1C24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            )) : (
              <div className="p-20 text-center text-slate-300">
                <Briefcase size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-black uppercase text-xs tracking-widest">No active projects found</p>
              </div>
            )}
          </div>
        </div>

        {/* Clients Table Snippet */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <h3 className="font-black text-[#2E3191] flex items-center gap-2 uppercase tracking-tight text-sm">
              <Users size={20} className="text-[#EC1C24]" />
              Client Partners
            </h3>
            <Link to="/clients" className="text-[10px] font-black text-[#EC1C24] hover:text-[#d11920] flex items-center gap-1 uppercase tracking-widest">
              Relationship Manager <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Organisation</th>
                  <th className="px-8 py-4">Key Liaison</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clients.length > 0 ? clients.slice(0, 5).map((client) => (
                  <tr key={client.id} className="text-sm hover:bg-[#2E3191]/5 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-[#2E3191] group-hover:text-[#EC1C24] uppercase tracking-tight">{client.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{client.email}</p>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-bold text-xs uppercase tracking-wide">{client.contactPerson}</td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        to={`/clients?id=${client.id}`}
                        className="text-[10px] font-black text-[#2E3191] hover:text-[#EC1C24] transition-colors uppercase tracking-widest"
                      >
                        Engage
                      </Link>
                    </td>
                  </tr>
                )) : (
                   <tr>
                    <td colSpan={3} className="p-20 text-center text-slate-300">
                      <Users size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="font-black uppercase text-xs tracking-widest">No clients registered</p>
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