import React, { useState, useEffect } from "react";
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
  FileText,
  Activity,
  FileCheck,
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
    clientId: "",
    location: "",
    workflow: WorkflowType.SUPPLY_AND_FABRICATION,
    status: "Planning",
  });

  // Ensure clientId is updated if clients list becomes available
  useEffect(() => {
    if (clients.length > 0 && !formData.clientId && !editingProject) {
      setFormData((prev) => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients, formData.clientId, editingProject]);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      clientId: clients[0]?.id || "",
      location: "",
      workflow: WorkflowType.SUPPLY_AND_FABRICATION,
      status: "Planning",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      alert("Please select a client partner.");
      return;
    }

    if (editingProject) {
      onUpdateProject(editingProject.id, formData);
    } else {
      onAddProject(formData);
    }
    closeModal();
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()),
  );

  const getWorkflowDisplay = (type: WorkflowType) => {
    switch (type) {
      case WorkflowType.SUPPLY_AND_FABRICATION:
        return {
          label: "Supply & Fab",
          icon: <Factory size={14} className="text-[#2E3191]" />,
        };
      case WorkflowType.STRUCTURAL_FABRICATION:
        return {
          label: "Structural Fab",
          icon: <Hammer size={14} className="text-[#2E3191]" />,
        };
      case WorkflowType.JOB_WORK:
        return {
          label: "Job Work",
          icon: <Truck size={14} className="text-[#2E3191]" />,
        };
      default:
        return {
          label: "Standard",
          icon: <Briefcase size={14} className="text-[#2E3191]" />,
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase();
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#2E3191] uppercase tracking-tight">
            Project Ledger
          </h1>
          <p className="text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest">
            Visibility of engineering deployment.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#2E3191] text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 font-black text-[10px] uppercase tracking-widest active:scale-95"
        >
          <Plus size={18} />
          New Quotation
        </button>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center shrink-0">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-12 pr-4 py-3 lg:py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile View */}
        <div className="lg:hidden space-y-4 overflow-y-auto pb-10">
          {filteredProjects.map((project) => {
            const client = clients.find((c) => c.id === project.clientId);
            return (
              <div
                key={project.id}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-[#2E3191] text-white flex items-center justify-center font-black shrink-0">
                      {project.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-black text-[#2E3191] uppercase tracking-tight text-xs truncate">
                        {project.name}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
                        {client?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/projects/${project.id}/invoices`}
                      className="p-2.5 bg-[#EC1C24]/5 text-[#EC1C24] rounded-xl"
                      title="Manage Invoices"
                    >
                      <FileCheck size={18} />
                    </Link>
                    <Link
                      to={`/projects/${project.id}`}
                      className="p-2.5 bg-[#2E3191]/5 text-[#2E3191] rounded-xl"
                      title="Manage Quotations"
                    >
                      <FileText size={18} />
                    </Link>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-4">
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="p-2 text-slate-300 hover:text-[#2E3191]"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="p-2 text-slate-300 hover:text-[#EC1C24]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 sticky top-0 z-10">
                  <th className="px-8 py-6">Project Identifier</th>
                  <th className="px-8 py-6">Client Partner</th>
                  <th className="px-8 py-6">Geographic Site</th>
                  <th className="px-8 py-6">Creation Date</th>
                  <th className="px-8 py-6">Status</th>
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
                          <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center text-[#2E3191] font-black text-sm group-hover:bg-[#2E3191] group-hover:text-white transition-all">
                            {project.name.charAt(0)}
                          </div>
                          <p className="font-black text-[#2E3191] uppercase tracking-tight text-sm truncate max-w-[200px]">
                            {project.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-black text-slate-600 uppercase tracking-tight truncate max-w-[150px]">
                        {client?.name}
                      </td>
                      <td className="px-8 py-6 text-[11px] font-bold uppercase text-slate-400 tracking-tight">
                        {project.location}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                          <Calendar size={12} className="text-[#EC1C24]" />
                          <span className="text-[10px] font-black tracking-widest">
                            {formatDate(project.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            project.status === "Ongoing"
                              ? "bg-blue-50 text-[#2E3191] border-blue-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}
                        >
                          {project.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/projects/${project.id}/invoices`}
                            className="p-2.5 text-[#EC1C24] hover:bg-[#EC1C24]/10 rounded-xl transition-all"
                            title="Manage Invoices"
                          >
                            <FileCheck size={18} />
                          </Link>
                          <Link
                            to={`/projects/${project.id}`}
                            className="p-2.5 text-slate-300 hover:text-[#2E3191] transition-all"
                            title="Manage Quotations"
                          >
                            <FileText size={18} />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(project)}
                            className="p-2.5 text-slate-300 hover:text-[#2E3191] transition-all"
                            title="Edit Project"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => onDeleteProject(project.id)}
                            className="p-2.5 text-slate-300 hover:text-[#EC1C24] transition-all"
                            title="Delete Project"
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
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in flex flex-col h-auto max-h-[90vh]">
            <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-[#2E3191] text-white flex items-center justify-center">
                  {editingProject ? <Edit size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-black text-[#2E3191] uppercase">
                    {editingProject ? "Modify Project" : "Initiate Project"}
                  </h2>
                </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 p-2">
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-6 lg:p-8 space-y-6 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Location
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                  Client Partner
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-5 py-3 lg:py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#2E3191] outline-none font-black text-slate-800 appearance-none cursor-pointer"
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Client...
                    </option>
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
                <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                  Quotation Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      type: WorkflowType.SUPPLY_AND_FABRICATION,
                      label: "Supply & Fab",
                      icon: <Factory size={18} />,
                    },
                    {
                      type: WorkflowType.STRUCTURAL_FABRICATION,
                      label: "Structural Fab",
                      icon: <Hammer size={18} />,
                    },
                    {
                      type: WorkflowType.JOB_WORK,
                      label: "Job Work",
                      icon: <Truck size={18} />,
                    },
                  ].map((wf) => (
                    <button
                      key={wf.type}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, workflow: wf.type })
                      }
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${formData.workflow === wf.type ? "bg-[#2E3191] border-[#2E3191] text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-400 hover:border-[#2E3191]/30"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.workflow === wf.type ? "bg-white/20" : "bg-white shadow-sm"}`}
                      >
                        {wf.icon}
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-tight leading-none h-4 flex items-center">
                        {wf.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-widest active:scale-95"
                >
                  {editingProject ? "Save" : "Launch"}
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
