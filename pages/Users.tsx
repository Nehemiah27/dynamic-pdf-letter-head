import React, { useState } from "react";
import {
  Plus,
  Search,
  Mail,
  Shield,
  Trash2,
  Edit,
  UserPlus,
  UserCog,
  Check,
  X,
  ChevronDown,
  KeyRound,
  Building,
} from "lucide-react";
import { User, Role, Client } from "../types";

interface UsersPageProps {
  users: User[];
  clients: Client[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({
  users,
  clients,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "Standard",
    password: "",
    assignedClientIds: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser(editingUser.id, newUser);
    } else {
      onAddUser(newUser);
    }
    closeModal();
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setNewUser({ ...user });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setNewUser({
      name: "",
      email: "",
      role: "Standard",
      password: "",
      assignedClientIds: [],
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleClientAssignment = (clientId: string) => {
    const current = newUser.assignedClientIds || [];
    if (current.includes(clientId)) {
      setNewUser({
        ...newUser,
        assignedClientIds: current.filter((id) => id !== clientId),
      });
    } else {
      setNewUser({ ...newUser, assignedClientIds: [...current, clientId] });
    }
  };

  return (
    <div className="space-y-6 bg-white animate-fade-in relative min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2E3191] tracking-tight uppercase">
            Staff Management
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Manage corporate identities and system access levels.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#2E3191] text-white px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 active:scale-95 font-black text-xs uppercase tracking-widest"
        >
          <UserPlus size={20} />
          Provision New User
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
            placeholder="Search by name or email address..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Personnel</th>
                <th className="px-8 py-5">Access Level</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="group hover:bg-[#2E3191]/5 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#2E3191] font-black text-xl border-2 border-slate-50 shadow-sm group-hover:scale-110 group-hover:bg-[#2E3191] group-hover:text-white transition-all overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-black text-[#2E3191] uppercase tracking-tight text-sm">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                          <Mail size={12} className="text-[#EC1C24]" />{" "}
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] ${
                        user.role === "Administrator"
                          ? "bg-red-50 text-[#EC1C24] border-red-100"
                          : "bg-blue-50 text-[#2E3191] border-blue-100"
                      }`}
                    >
                      <Shield size={12} />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Active
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-3 text-slate-300 hover:text-[#2E3191] hover:bg-[#2E3191]/5 rounded-xl transition-all"
                        title="Edit Permissions"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-3 text-slate-300 hover:text-[#EC1C24] hover:bg-[#EC1C24]/5 rounded-xl transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-32 text-center text-slate-200">
              <UserCog size={80} className="mx-auto mb-6 opacity-5" />
              <p className="font-black uppercase text-xs tracking-[0.3em]">
                No staff members match criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border border-slate-100 animate-fade-in overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-8 sm:p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.5rem] bg-[#2E3191] text-white flex items-center justify-center shadow-2xl shadow-[#2E3191]/20">
                  {editingUser ? <UserCog size={28} /> : <UserPlus size={28} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#2E3191] tracking-tight uppercase">
                    {editingUser ? "Update" : "Provision"}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                    Personnel Authorization
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-300 hover:text-[#EC1C24] transition-all rounded-xl hover:bg-slate-100"
              >
                <X size={28} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 sm:p-10 space-y-8 overflow-y-auto flex-1"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Legal Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 text-sm"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="Personnel name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Corporate Email
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 text-sm"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="name@reviranexgen.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      System Password
                    </label>
                    <div className="relative">
                      <KeyRound
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                        size={18}
                      />
                      <input
                        required={!editingUser}
                        type="password"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 text-sm"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        placeholder={
                          editingUser
                            ? "Leave blank to keep same"
                            : "Secure password..."
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Authorization Role
                    </label>
                    <div className="relative group/select">
                      <select
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/10 focus:border-[#2E3191] outline-none font-black text-slate-800 transition-all appearance-none cursor-pointer hover:border-[#2E3191]/30 hover:shadow-lg hover:shadow-[#2E3191]/5 text-sm"
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            role: e.target.value as Role,
                          })
                        }
                      >
                        <option value="Standard">Standard</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover/select:text-[#2E3191] group-hover/select:scale-110 transition-all duration-300">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                      Client Authorization
                    </label>
                    <Building size={16} className="text-[#EC1C24]" />
                  </div>

                  {newUser.role === "Administrator" ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3">
                      <Shield size={32} className="text-emerald-500" />
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                        Full System Access Granted
                      </p>
                      <p className="text-[9px] text-emerald-600 leading-relaxed italic">
                        Administrators bypass client constraints and view all
                        records.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {clients.length > 0 ? (
                        clients.map((client) => (
                          <div
                            key={client.id}
                            onClick={() => toggleClientAssignment(client.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group/client ${
                              newUser.assignedClientIds?.includes(client.id)
                                ? "bg-blue-50 border-[#2E3191] shadow-md shadow-blue-500/5"
                                : "bg-white border-slate-50 hover:border-slate-200"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <p
                                className={`text-[11px] font-black uppercase tracking-tight truncate ${newUser.assignedClientIds?.includes(client.id) ? "text-[#2E3191]" : "text-slate-500"}`}
                              >
                                {client.name}
                              </p>
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                                {client.gstin}
                              </p>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                newUser.assignedClientIds?.includes(client.id)
                                  ? "bg-[#2E3191] text-white scale-110"
                                  : "bg-slate-50 text-transparent group-hover/client:bg-slate-100"
                              }`}
                            >
                              <Check size={14} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-300 text-center py-10 uppercase font-black italic tracking-widest">
                          No clients registered in ecosystem
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-4 border-2 border-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl hover:bg-[#d11920] transition-all shadow-2xl shadow-[#EC1C24]/30 uppercase text-[10px] tracking-widest active:scale-95"
                >
                  {editingUser ? "Sync Identity" : "Provision Protocol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default UsersPage;
