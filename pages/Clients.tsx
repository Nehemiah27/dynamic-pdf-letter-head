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
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#2E3191] uppercase tracking-tight">
            Client Partners
          </h1>
          <p className="text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest">
            Business contacts directory.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#2E3191] text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 font-black text-[10px] uppercase tracking-widest active:scale-95"
        >
          <Plus size={18} />
          Register Client
        </button>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Search partners..."
            className="w-full pl-12 pr-4 py-3 lg:py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6 lg:mb-8 relative z-10">
              <div className="flex items-center gap-4 lg:gap-5 overflow-hidden">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#2E3191]/5 text-[#2E3191] flex items-center justify-center font-black text-xl lg:text-2xl shrink-0">
                  {client.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-base lg:text-xl font-black text-[#2E3191] uppercase tracking-tight truncate">
                    {client.name}
                  </h3>
                  <p className="text-[8px] lg:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">
                    {client.gstin}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(client)}
                  className="p-2 text-slate-300 hover:text-[#2E3191]"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDeleteClient(client.id)}
                  className="p-2 text-slate-300 hover:text-[#EC1C24]"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 relative z-10">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#EC1C24] shrink-0 mt-0.5" />
                <p className="text-[10px] lg:text-[11px] text-slate-600 font-bold leading-relaxed uppercase tracking-wide truncate">
                  {client.address}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#2E3191] shrink-0 mt-0.5" />
                <p className="text-[10px] lg:text-[11px] text-slate-600 font-bold uppercase truncate">
                  {client.email}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#2E3191] shrink-0 mt-0.5" />
                <p className="text-[10px] lg:text-[11px] text-slate-600 font-bold uppercase">
                  {client.phone}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 bg-[#EC1C24]/10 rounded-lg">
                  <Plus size={12} className="text-[#EC1C24]" />
                </div>
                <p className="text-[10px] lg:text-xs text-[#2E3191] font-black uppercase">
                  {client.contactPerson}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed top-[100px] inset-x-0 h-[80vh] bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-fade-in flex flex-col max-h-full">
            <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
              <h2 className="text-lg lg:text-xl font-black text-[#2E3191] uppercase tracking-tight">
                {editingClient ? "Modify Ledger" : "Register Client"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-[#EC1C24] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 lg:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Client Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 text-sm"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    GSTIN
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-mono font-black text-[#EC1C24] text-sm"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({ ...formData, gstin: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Address
                  </label>
                  <textarea
                    required
                    className="w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 h-20 resize-none text-sm"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Contact Person
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm"
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Phone
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-4 border-2 border-slate-50 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-widest active:scale-95"
                >
                  Verify & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Clients;
