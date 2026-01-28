import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  ChevronRight,
  ChevronDown,
  X,
  Factory,
  Hammer,
  Truck,
  Trash2,
  Edit,
  Briefcase,
  Calendar,
  ExternalLink,
  Activity,
} from "lucide-react";
import { Project, Client, WorkflowType } from "../types";

interface ProjectsProps {
  projects: Project[];
  clients: Client[];
  onAddProject: (project: Partial<Project>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({
  projects,
  clients,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    clientId: clients[0]?.id || "",
    location: "",
    workflow: WorkflowType.SUPPLY_AND_FABRICATION,
    status: "Planning",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      onUpdateProject(editingProject.id, formData);
    } else {
      onAddProject(formData);
    }
    closeModal();
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({
      name: "",
      clientId: clients[0]?.id || "",
      location: "",
      workflow: WorkflowType.SUPPLY_AND_FABRICATION,
      status: "Planning",
    });
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()),
  );

  const getWorkflowIcon = (type: WorkflowType) => {
    switch (type) {
      case WorkflowType.SUPPLY_AND_FABRICATION:
        return <Factory size={14} />;
      case WorkflowType.STRUCTURAL_FABRICATION:
        return <Hammer size={14} />;
      case WorkflowType.JOB_WORK:
        return <Truck size={14} />;
      default:
        return <Briefcase size={14} />;
    }
  };

  return (
    <div className="space-y-6 bg-white animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-black text-[#2E3191] uppercase tracking-tight">
            Project Ledger
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Full-spectrum visibility of engineering deployment and site
            operations.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#2E3191] text-white px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 font-black text-xs uppercase tracking-widest active:scale-95"
        >
          <Plus size={20} />
          Initialize New Project
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center shrink-0">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by project identifier or location..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-slate-50 rounded-2xl hover:border-[#2E3191] hover:text-[#2E3191] text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all">
          <Filter size={18} />
          <span>Advanced Filter</span>
        </button>
      </div>

      {/* Project Table View */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                <th className="px-8 py-6">Project Identifier</th>
                <th className="px-8 py-6">Client Partner</th>
                <th className="px-8 py-6">Geographic Site</th>
                <th className="px-8 py-6">Strategic Workflow</th>
                <th className="px-8 py-6">Lifecycle Status</th>
                <th className="px-8 py-6">Deployment Date</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProjects.map((project) => {
                const client = clients.find((c) => c.id === project.clientId);
                return (
                  <tr
                    key={project.id}
                    className="group hover:bg-[#2E3191]/5 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center text-[#2E3191] font-black text-sm shadow-sm group-hover:bg-[#2E3191] group-hover:text-white transition-all">
                          {project.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-[#2E3191] uppercase tracking-tight text-sm leading-none">
                            {project.name}
                          </p>
                          <p className="text-[9px] text-slate-300 font-bold mt-1.5 uppercase tracking-widest">
                            ID: {project.id.split("_")[1]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-slate-600 uppercase tracking-tight">
                        {client?.name || "Unassigned"}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin size={12} className="text-[#EC1C24]" />
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          {project.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[#2E3191] text-[9px] font-black uppercase tracking-widest">
                        {getWorkflowIcon(project.workflow)}
                        {project.workflow}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          project.status === "Ongoing"
                            ? "bg-blue-50 text-[#2E3191] border-blue-100"
                            : project.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            project.status === "Ongoing"
                              ? "bg-[#2E3191] animate-pulse"
                              : project.status === "Completed"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                          }`}
                        ></div>
                        {project.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {new Date(project.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/projects/${project.id}`}
                          className="p-2.5 text-slate-300 hover:text-[#2E3191] hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
                          title="Orchestrate Offer"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-2.5 text-slate-300 hover:text-[#2E3191] hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
                          title="Edit Configuration"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="p-2.5 text-slate-300 hover:text-[#EC1C24] hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
                          title="Terminate Project"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProjects.length === 0 && (
            <div className="p-32 text-center text-slate-200">
              <Briefcase size={80} className="mx-auto mb-6 opacity-5" />
              <p className="font-black uppercase text-xs tracking-[0.3em]">
                No project deployment found in cluster
              </p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-24 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in mb-12 flex flex-col h-auto">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2E3191] text-white flex items-center justify-center shadow-lg shadow-[#2E3191]/20">
                  {editingProject ? <Edit size={24} /> : <Plus size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2E3191] tracking-tight uppercase">
                    {editingProject ? "Modify Project" : "Initiate Project"}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Project Definition Engine
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-8 flex-1 flex flex-col"
            >
              <div className="space-y-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Project Identifier
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Warehouse Structural Fabrication"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Geographic Deployment
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g. Plot 4, Industrial Estate, Pune"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Select Client Partner
                  </label>
                  <div className="relative group/select">
                    <select
                      className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/10 focus:border-[#2E3191] outline-none font-black text-slate-800 transition-all appearance-none cursor-pointer"
                      value={formData.clientId}
                      onChange={(e) =>
                        setFormData({ ...formData, clientId: e.target.value })
                      }
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Strategic Workflow Selection
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        type: WorkflowType.SUPPLY_AND_FABRICATION,
                        label: "Supply & Fab",
                        icon: <Factory size={24} />,
                        desc: "Full PEB Lifecycle",
                      },
                      {
                        type: WorkflowType.STRUCTURAL_FABRICATION,
                        label: "Structural Fab",
                        icon: <Hammer size={24} />,
                        desc: "Custom Frameworks",
                      },
                      {
                        type: WorkflowType.JOB_WORK,
                        label: "Job Work",
                        icon: <Truck size={24} />,
                        desc: "Service-Only Basis",
                      },
                    ].map((wf) => (
                      <button
                        key={wf.type}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, workflow: wf.type })
                        }
                        className={`p-5 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 h-full ${formData.workflow === wf.type ? "bg-[#2E3191] border-[#2E3191] text-white shadow-xl scale-[1.02]" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-white"}`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.workflow === wf.type ? "bg-white/20 text-white" : "bg-white text-slate-300"}`}
                        >
                          {wf.icon}
                        </div>
                        <div>
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ${formData.workflow === wf.type ? "text-white" : "text-[#2E3191]"}`}
                          >
                            {wf.label}
                          </p>
                          <p className="text-[8px] font-bold uppercase opacity-60 leading-tight mt-1">
                            {wf.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl hover:bg-[#d11920] transition-all shadow-xl uppercase text-xs tracking-widest active:scale-95"
                >
                  {editingProject ? "Save Changes" : "Launch Project"}
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
