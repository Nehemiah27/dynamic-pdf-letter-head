import React, { useState } from "react";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Edit,
  X,
  UserPlus,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { Client } from "../types";

interface ClientsProps {
  clients: Client[];
  onAddClient: (client: Partial<Client>) => void;
  onUpdateClient: (id: string, updates: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
}

const Clients: React.FC<ClientsProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<Partial<Client>>({
    name: "",
    address: "",
    gstin: "",
    contactPerson: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onUpdateClient(editingClient.id, formData);
    } else {
      onAddClient(formData);
    }
    closeModal();
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({ ...client });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      name: "",
      address: "",
      gstin: "",
      contactPerson: "",
      email: "",
      phone: "",
    });
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 bg-white animate-fade-in text-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2E3191] uppercase tracking-tight">
            Client Partners
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Manage your business contacts and corporate partners.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#2E3191] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 font-black text-xs uppercase tracking-widest"
        >
          <Plus size={20} />
          Register New Client
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by company name or contact person..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#2E3191]/5 rounded-full -translate-y-8 translate-x-8 blur-xl pointer-events-none group-hover:scale-150 transition-transform"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white text-[#2E3191] flex items-center justify-center font-black text-2xl border-4 border-[#2E3191]/5 shadow-sm group-hover:bg-[#2E3191] group-hover:text-white transition-all">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#2E3191] leading-tight uppercase tracking-tight">
                    {client.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                    {client.gstin}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(client)}
                  className="p-3 text-slate-300 hover:text-[#2E3191] hover:bg-[#2E3191]/5 rounded-xl transition-all"
                  title="Edit Client Information"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => onDeleteClient(client.id)}
                  className="p-3 text-slate-300 hover:text-[#EC1C24] hover:bg-[#EC1C24]/5 rounded-xl transition-all"
                  title="Delete Client Record"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6 relative z-10">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#EC1C24] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed uppercase tracking-wide">
                  {client.address}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-[#2E3191] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wide">
                  {client.email}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-[#2E3191] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wide">
                  {client.phone}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-[#EC1C24]/10 rounded-lg">
                  <Plus size={14} className="text-[#EC1C24]" />
                </div>
                <div>
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">
                    Key Liaison
                  </p>
                  <p className="text-xs text-[#2E3191] font-black uppercase tracking-tight">
                    {client.contactPerson}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-[100px] h-screen overflow-hidden">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg h-[80vh] shadow-2xl overflow-hidden border border-slate-100 animate-fade-in relative flex flex-col mb-12">
            <div className="relative z-20 p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 shadow-sm shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2E3191] text-white flex items-center justify-center shadow-lg shadow-[#2E3191]/20">
                  {editingClient ? <Edit size={24} /> : <UserPlus size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2E3191] tracking-tight uppercase leading-none">
                    {editingClient ? "Modify Ledger" : "Register Client"}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                    Client Management Portal
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-500 hover:text-white hover:bg-[#EC1C24] bg-slate-100 rounded-xl transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar relative z-10"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                  <Briefcase size={14} className="text-[#2E3191]" />
                  <span className="text-[10px] font-black text-[#2E3191] uppercase tracking-[0.2em]">
                    Company Details
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Entity Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all text-sm"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    GSTIN Number
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-mono font-black text-[#EC1C24] transition-all text-sm"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({ ...formData, gstin: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Full Address
                  </label>
                  <textarea
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all h-24 resize-none text-sm"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                  <Mail size={14} className="text-[#2E3191]" />
                  <span className="text-[10px] font-black text-[#2E3191] uppercase tracking-[0.2em]">
                    Liaison Information
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Contact Person
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all text-sm"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPerson: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all text-sm"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Email ID
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all text-sm"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl hover:bg-[#d11920] transition-all shadow-xl shadow-[#EC1C24]/20 uppercase text-xs tracking-widest active:scale-95"
                >
                  {editingClient ? "Commit Changes" : "Verify & Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Clients;
