
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X,
  Factory,
  Hammer,
  Truck
} from 'lucide-react';
import { Project, Client, WorkflowType } from '../types';

interface ProjectsProps {
  projects: Project[];
  clients: Client[];
  onAddProject: (project: Partial<Project>) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, clients, onAddProject }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    clientId: clients[0]?.id || '',
    location: '',
    workflow: WorkflowType.SUPPLY_AND_FABRICATION,
    status: 'Planning'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject(newProject);
    setShowModal(false);
    setNewProject({
      name: '',
      clientId: clients[0]?.id || '',
      location: '',
      workflow: WorkflowType.SUPPLY_AND_FABRICATION,
      status: 'Planning'
    });
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2E3191] uppercase tracking-tight">Project Management</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Track and manage your engineering projects and site locations.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#2E3191] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 font-black text-xs uppercase tracking-widest"
        >
          <Plus size={20} />
          Create New Project
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search by project name or location..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 border-2 border-slate-50 rounded-xl hover:border-[#2E3191] hover:text-[#2E3191] text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => {
          const client = clients.find(c => c.id === project.clientId);
          return (
            <div key={project.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    project.status === 'Ongoing' ? 'bg-blue-50 text-[#2E3191] border-blue-100' :
                    project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {project.status}
                  </span>
                  <button className="text-slate-300 hover:text-[#EC1C24] transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <h3 className="text-lg font-black text-[#2E3191] mb-2 group-hover:text-[#EC1C24] transition-colors uppercase tracking-tight leading-tight">{project.name}</h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mb-6 font-bold uppercase tracking-wider">
                  <MapPin size={14} className="text-[#EC1C24]" />
                  {project.location}
                </p>
                
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-slate-300">Client Partner</span>
                    <span className="text-[#2E3191]">{client?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                    <span className="text-slate-300">Workflow</span>
                    <span className="px-2.5 py-1 bg-[#2E3191]/5 text-[#2E3191] rounded-lg">{project.workflow}</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Created {new Date(project.createdAt).toLocaleDateString()}</p>
                <Link 
                  to={`/projects/${project.id}`}
                  className="text-[#EC1C24] hover:text-[#d11920] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group/link"
                >
                  Orchestrate Offer <ChevronRight size={16} className="group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2E3191] text-white flex items-center justify-center shadow-lg shadow-[#2E3191]/20">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2E3191] tracking-tight uppercase">Initiate Project</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Project Definition Engine</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">Project Identifier</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    placeholder="e.g. Warehouse Structural Fabrication"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">Geographic Deployment</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                    value={newProject.location}
                    onChange={e => setNewProject({...newProject, location: e.target.value})}
                    placeholder="e.g. Plot 4, Industrial Estate, Pune"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">Select Client Partner</label>
                <div className="relative group/select">
                  <select 
                    className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/10 focus:border-[#2E3191] outline-none font-black text-slate-800 transition-all appearance-none cursor-pointer hover:border-[#2E3191]/30 hover:shadow-lg hover:shadow-[#2E3191]/5"
                    value={newProject.clientId}
                    onChange={e => setNewProject({...newProject, clientId: e.target.value})}
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover/select:text-[#2E3191] group-hover/select:scale-110 transition-all duration-300">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              {/* Redesigned Workflow Selection Cards */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">Strategic Workflow Selection</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { type: WorkflowType.SUPPLY_AND_FABRICATION, label: 'Supply & Fab', icon: <Factory size={24} />, desc: 'Full PEB Lifecycle' },
                    { type: WorkflowType.STRUCTURAL_FABRICATION, label: 'Structural Fab', icon: <Hammer size={24} />, desc: 'Custom Frameworks' },
                    { type: WorkflowType.JOB_WORK, label: 'Job Work', icon: <Truck size={24} />, desc: 'Service-Only Basis' }
                  ].map((wf) => (
                    <button
                      key={wf.type}
                      type="button"
                      onClick={() => setNewProject({...newProject, workflow: wf.type})}
                      className={`p-5 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 group/card ${
                        newProject.workflow === wf.type 
                          ? 'bg-[#2E3191] border-[#2E3191] text-white shadow-xl shadow-[#2E3191]/20 scale-[1.02]' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-[#2E3191]/30 hover:bg-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        newProject.workflow === wf.type ? 'bg-white/20 text-white' : 'bg-white text-slate-300 group-hover/card:text-[#2E3191]'
                      }`}>
                        {wf.icon}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${newProject.workflow === wf.type ? 'text-white' : 'text-[#2E3191]'}`}>
                          {wf.label}
                        </p>
                        <p className={`text-[8px] font-bold uppercase opacity-60`}>
                          {wf.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl hover:bg-[#d11920] transition-all shadow-xl shadow-[#EC1C24]/20 uppercase text-xs tracking-widest active:scale-95"
                >
                  Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
