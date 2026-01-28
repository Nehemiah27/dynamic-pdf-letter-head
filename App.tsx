
import { AppState, User, Client, Project, Quotation, Branding, WorkflowType } from './types';
import { 
  loadState, 
  saveState, 
  NestApiService, 
  createSupplyAndFabricationTemplate, 
  createStructuralFabricationTemplate, 
  createJobWorkTemplate 
} from './store';
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertTriangle, Trash2, X, Info } from 'lucide-react';

// Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import BrandingPage from './pages/Branding';
import UsersPage from './pages/Users';
import DatabasePortal from './pages/DatabasePortal';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'danger' | 'warning';
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showDemoAlert, setShowDemoAlert] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadState();
        setState(data);
        if (NestApiService.getIsLocalMode()) {
          setShowDemoAlert(true);
        }
      } finally {
        setIsInitialLoad(false);
      }
    };
    init();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<void> => {
    const { user, token } = await NestApiService.login(email, password);
    NestApiService.setToken(token);
    const data = await loadState();
    setState({ ...data, currentUser: user, token });
    if (NestApiService.getIsLocalMode()) setShowDemoAlert(true);
  };

  const handleLogout = () => {
    NestApiService.setToken(null);
    setState(prev => prev ? { ...prev, currentUser: null, token: null } : null);
    setShowDemoAlert(false);
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' = 'danger') => {
    setConfirm({ isOpen: true, title, message, onConfirm, type });
  };

  const handleAddUser = async (userData: Partial<User>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.saveUser(userData as User);
      setState(prev => prev ? { ...prev, users: [...prev.users, saved] } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateUser(id, updates);
      setState(prev => prev ? { ...prev, users: prev.users.map(u => u.id === id ? saved : u) } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const user = state?.users.find(u => u.id === id);
    triggerConfirm(
      'Purge User Access',
      `You are about to revoke system access for ${user?.name}. This action will terminate their credentials permanently.`,
      async () => {
        setIsSyncing(true);
        try {
          await NestApiService.deleteUser(id);
          setState(prev => prev ? { ...prev, users: prev.users.filter(u => u.id !== id) } : null);
        } finally {
          setIsSyncing(false);
        }
      }
    );
  };

  const handleAddClient = async (clientData: Partial<Client>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.saveClient(clientData as Client);
      setState(prev => prev ? { ...prev, clients: [...prev.clients, saved] } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateClient(id, updates);
      setState(prev => prev ? { ...prev, clients: prev.clients.map(c => c.id === id ? saved : c) } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const client = state?.clients.find(c => c.id === id);
    triggerConfirm(
      'Remove Client Ledger',
      `Confirm removal of ${client?.name}. All historical associations and project links for this client will be removed.`,
      async () => {
        setIsSyncing(true);
        try {
          await NestApiService.deleteClient(id);
          setState(prev => prev ? { ...prev, clients: prev.clients.filter(c => c.id !== id) } : null);
        } finally {
          setIsSyncing(false);
        }
      }
    );
  };

  const handleAddProject = async (projectData: Partial<Project>) => {
    setIsSyncing(true);
    try {
      const newProject: Partial<Project> = {
        ...projectData,
        assignedUserId: state?.currentUser?.id || '',
        createdAt: new Date().toISOString(),
        status: 'Planning'
      };
      const saved = await NestApiService.saveProject(newProject as Project);
      setState(prev => prev ? { ...prev, projects: [...prev.projects, saved] } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateProject(id, updates);
      setState(prev => prev ? { ...prev, projects: prev.projects.map(p => p.id === id ? saved : p) } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const project = state?.projects.find(p => p.id === id);
    triggerConfirm(
      'Terminate Project Lifecycle',
      `WARNING: Deleting "${project?.name}" will purge all associated technical quotations. This cannot be undone.`,
      async () => {
        setIsSyncing(true);
        try {
          await NestApiService.deleteProject(id);
          setState(prev => prev ? { 
            ...prev, 
            projects: prev.projects.filter(p => p.id !== id),
            quotations: prev.quotations.filter(q => q.projectId !== id)
          } : null);
        } finally {
          setIsSyncing(false);
        }
      }
    );
  };

  const handleAddQuotation = async (projectId: string) => {
    if (!state) return;
    setIsSyncing(true);
    try {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return;
      const client = state.clients.find(c => c.id === project.clientId);
      const clientName = client?.name || 'Client';
      const existingQuotes = state.quotations.filter(q => q.projectId === projectId);
      const newVersion = existingQuotes.length + 1;
      
      let newQuote: Quotation;
      if (project.workflow === WorkflowType.STRUCTURAL_FABRICATION) {
        newQuote = createStructuralFabricationTemplate(projectId, newVersion, clientName);
      } else if (project.workflow === WorkflowType.JOB_WORK) {
        newQuote = createJobWorkTemplate(projectId, newVersion, clientName);
      } else {
        newQuote = createSupplyAndFabricationTemplate(projectId, newVersion, clientName);
      }

      const saved = await NestApiService.saveQuotation(newQuote);
      setState(prev => prev ? { ...prev, quotations: [...prev.quotations, saved] } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateQuotation = async (id: string, updates: Partial<Quotation>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateQuotation(id, updates);
      setState(prev => prev ? { ...prev, quotations: prev.quotations.map(q => q.id === id ? saved : q) } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    const quote = state?.quotations.find(q => q.id === id);
    triggerConfirm(
      'Purge Technical Version',
      `Delete Quotation Version ${quote?.version}? This will be permanently removed.`,
      async () => {
        setIsSyncing(true);
        try {
          await NestApiService.deleteQuotation(id);
          setState(prev => prev ? { ...prev, quotations: prev.quotations.filter(q => q.id !== id) } : null);
        } finally {
          setIsSyncing(false);
        }
      }
    );
  };

  const handleUpdateBranding = async (updates: Branding) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateBranding(updates);
      setState(prev => prev ? { ...prev, branding: saved } : null);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isInitialLoad || !state) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2rem] bg-[#2E3191]/5 flex items-center justify-center">
            <img src="https://reviranexgen.com/assets/logo-with-name.png" alt="Loading" className="h-10 animate-pulse-soft grayscale opacity-30" />
          </div>
          <div className="absolute inset-0 border-4 border-[#2E3191]/10 border-t-[#EC1C24] rounded-[2rem] animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-[#2E3191] uppercase tracking-[0.5em]">Initializing nexGen Runtime</p>
          <p className="text-[9px] font-mono text-slate-400 mt-2">Checking Connection Cluster...</p>
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ children, adminOnly = false }: { children?: React.ReactNode, adminOnly?: boolean }) => {
    if (!state.currentUser) return <Navigate to="/login" replace />;
    if (adminOnly && state.currentUser.role !== 'Administrator') return <Navigate to="/" replace />;
    return (
      <Layout 
        user={state.currentUser} 
        onLogout={handleLogout} 
        brandColor={state.branding.brandColor}
        logo={state.branding.logo}
        logoBackgroundColor={state.branding.logoBackgroundColor}
        isSyncing={isSyncing}
        dbStatus={state.dbConfig.status}
      >
        {children}
      </Layout>
    );
  };

  return (
    <HashRouter>
      {showDemoAlert && (
        <div className="fixed bottom-6 right-6 z-[3000] max-w-sm bg-amber-50 border-2 border-amber-100 p-5 rounded-[2rem] shadow-2xl animate-fade-in">
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                 <Info size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Infrastructure Alert</p>
                 <p className="text-xs font-bold text-amber-900 leading-relaxed uppercase tracking-tight">NestJS backend is unreachable. Operating in Edge Runtime (Local) Mode.</p>
                 <button onClick={() => setShowDemoAlert(false)} className="mt-3 text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] border-b border-amber-300 hover:text-amber-800">Acknowledge</button>
              </div>
           </div>
        </div>
      )}

      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={<ProtectedRoute><Dashboard clients={state.clients} projects={state.projects} users={state.users} /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients clients={state.clients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects projects={state.projects} clients={state.clients} onAddProject={handleAddProject} onUpdateProject={handleUpdateProject} onDeleteProject={handleDeleteProject} /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute>
          <ProjectDetails 
            projects={state.projects} 
            clients={state.clients} 
            quotations={state.quotations} 
            branding={state.branding}
            onAddQuotation={handleAddQuotation}
            onUpdateQuotation={handleUpdateQuotation}
            onDeleteQuotation={handleDeleteQuotation}
            onDuplicateQuotation={(id) => {
              const source = state.quotations.find(q => q.id === id);
              if (source) handleAddQuotation(source.projectId);
            }}
          />
        </ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly={true}><UsersPage users={state.users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} /></ProtectedRoute>} />
        <Route path="/branding" element={<ProtectedRoute><BrandingPage branding={state.branding} onUpdateBranding={handleUpdateBranding} /></ProtectedRoute>} />
        <Route path="/database" element={<ProtectedRoute adminOnly={true}><DatabasePortal config={state.dbConfig} onUpdateConfig={(c) => setState(prev => prev ? {...prev, dbConfig: {...prev.dbConfig, ...c}} : null)} stats={{ clients: state.clients.length, projects: state.projects.length, quotations: state.quotations.length }} state={state} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {confirm.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setConfirm(prev => ({...prev, isOpen: false}))}></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-fade-in">
            <div className="p-8 sm:p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-2xl ${confirm.type === 'danger' ? 'bg-[#EC1C24] text-white shadow-[#EC1C24]/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>
                  {confirm.type === 'danger' ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#2E3191] tracking-tight uppercase">{confirm.title}</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Authorization Required</p>
                </div>
              </div>
              <button onClick={() => setConfirm(prev => ({...prev, isOpen: false}))} className="p-2 text-slate-300 hover:text-slate-600"><X size={28}/></button>
            </div>
            <div className="p-8 sm:p-10 space-y-8">
              <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight">{confirm.message}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirm(prev => ({...prev, isOpen: false}))}
                  className="flex-1 px-4 py-4 border-2 border-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                >
                  Abort Action
                </button>
                <button 
                  onClick={() => {
                    confirm.onConfirm();
                    setConfirm(prev => ({...prev, isOpen: false}));
                  }}
                  className={`flex-1 px-4 py-4 text-white font-black rounded-2xl transition-all shadow-2xl uppercase text-[10px] tracking-widest active:scale-95 ${confirm.type === 'danger' ? 'bg-[#EC1C24] hover:bg-[#d11920] shadow-[#EC1C24]/30' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'}`}
                >
                  Confirm & Execute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </HashRouter>
  );
};

export default App;
