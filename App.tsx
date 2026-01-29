import { AppState, User, Client, Project, Quotation, Invoice, Branding, WorkflowType } from './types';
import { 
  loadState, 
  NestApiService, 
  createSupplyAndFabricationTemplate, 
  createStructuralFabricationTemplate, 
  createJobWorkTemplate,
  createInvoiceTemplate,
  getMonthYearStr
} from './store';
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { X } from 'lucide-react';

// Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import InvoiceManagement from './pages/InvoiceManagement';
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
      } finally {
        setIsInitialLoad(false);
      }
    };
    init();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, token } = await NestApiService.login(email, password);
      NestApiService.setToken(token);
      const data = await loadState();
      setState({ ...data, currentUser: user, token });
      return true;
    } catch (e) {
      console.error("Login Error:", e);
      return false;
    }
  };

  const handleLogout = () => {
    NestApiService.setToken(null);
    setState(prev => prev ? { ...prev, currentUser: null, token: null } : null);
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' = 'danger') => {
    setConfirm({ isOpen: true, title, message, onConfirm, type });
  };

  // Helper to generate globally unique PI Reference Number
  const generateUniquePiNo = (invoices: Invoice[]) => {
    const monthYear = getMonthYearStr();
    let serial = 1;
    let piNo = `RNS/PI/${monthYear}/RNS-${String(serial).padStart(3, '0')}`;
    while (invoices.some(inv => inv.piNo === piNo)) {
      serial++;
      piNo = `RNS/PI/${monthYear}/RNS-${String(serial).padStart(3, '0')}`;
    }
    return piNo;
  };

  // Generic Handlers
  const handleAddUser = async (userData: Partial<User>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.saveUser(userData as User);
      setState(prev => prev ? { ...prev, users: [...prev.users, saved] } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateUser(id, updates);
      setState(prev => prev ? { ...prev, users: prev.users.map(u => u.id === id ? saved : u) } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleDeleteUser = async (id: string) => {
    const user = state?.users.find(u => u.id === id);
    triggerConfirm('Purge User Access', `Revoke access for ${user?.name}?`, async () => {
      setIsSyncing(true);
      try {
        await NestApiService.deleteUser(id);
        setState(prev => prev ? { ...prev, users: prev.users.filter(u => u.id !== id) } : null);
      } catch(e) { console.error(e); } finally { setIsSyncing(false); }
    });
  };

  const handleAddClient = async (clientData: Partial<Client>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.saveClient(clientData as Client);
      setState(prev => prev ? { ...prev, clients: [...prev.clients, saved] } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateClient(id, updates);
      setState(prev => prev ? { ...prev, clients: prev.clients.map(c => c.id === id ? saved : c) } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleDeleteClient = async (id: string) => {
    const client = state?.clients.find(c => c.id === id);
    triggerConfirm('Remove Client Ledger', `Delete ${client?.name}?`, async () => {
      setIsSyncing(true);
      try {
        await NestApiService.deleteClient(id);
        setState(prev => prev ? { ...prev, clients: prev.clients.filter(c => c.id !== id) } : null);
      } catch(e) { console.error(e); } finally { setIsSyncing(false); }
    });
  };

  const handleAddProject = async (projectData: Partial<Project>) => {
    setIsSyncing(true);
    try {
      const newProject = { ...projectData, assignedUserId: state?.currentUser?.id || '', createdAt: new Date().toISOString(), status: 'Planning' };
      const saved = await NestApiService.saveProject(newProject as Project);
      setState(prev => prev ? { ...prev, projects: [...prev.projects, saved] } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateProject(id, updates);
      setState(prev => prev ? { ...prev, projects: prev.projects.map(p => p.id === id ? saved : p) } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleDeleteProject = async (id: string) => {
    triggerConfirm('Terminate Project', `WARNING: This will purge all quotations and invoices.`, async () => {
      setIsSyncing(true);
      try {
        await NestApiService.deleteProject(id);
        setState(prev => prev ? { 
          ...prev, 
          projects: prev.projects.filter(p => p.id !== id),
          quotations: prev.quotations.filter(q => q.projectId !== id),
          invoices: prev.invoices.filter(i => i.projectId !== id)
        } : null);
      } catch(e) { console.error(e); } finally { setIsSyncing(false); }
    });
  };

  const handleAddQuotation = async (projectId: string, workflow?: WorkflowType) => {
    if (!state) return;
    setIsSyncing(true);
    try {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return;
      const client = state.clients.find(c => c.id === project.clientId);
      const clientName = client?.name || 'Client';
      const existing = state.quotations.filter(q => q.projectId === projectId);
      const nextVer = existing.length + 1;
      
      const typeToUse = workflow || project.workflow;
      const projectLocation = project.location || '';
      
      let newQuote: Quotation;
      if (typeToUse === WorkflowType.STRUCTURAL_FABRICATION) {
        newQuote = createStructuralFabricationTemplate(projectId, nextVer, clientName, projectLocation);
      } else if (typeToUse === WorkflowType.JOB_WORK) {
        newQuote = createJobWorkTemplate(projectId, nextVer, clientName, projectLocation);
      } else {
        newQuote = createSupplyAndFabricationTemplate(projectId, nextVer, clientName, projectLocation);
      }

      const saved = await NestApiService.saveQuotation(newQuote);
      setState(prev => prev ? { ...prev, quotations: [...prev.quotations, saved] } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleUpdateQuotation = async (id: string, updates: Partial<Quotation>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateQuotation(id, updates);
      setState(prev => prev ? { ...prev, quotations: prev.quotations.map(q => q.id === id ? saved : q) } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleDeleteQuotation = async (id: string) => {
    setIsSyncing(true);
    try {
      await NestApiService.deleteQuotation(id);
      setState(prev => prev ? { ...prev, quotations: prev.quotations.filter(q => q.id !== id) } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleAddInvoice = async (projectId: string) => {
    if (!state) return;
    setIsSyncing(true);
    try {
      const project = state.projects.find(p => p.id === projectId);
      const client = state.clients.find(c => c.id === project?.clientId);
      if (!project || !client) return;
      const existingInProject = state.invoices.filter(i => i.projectId === projectId);
      const nextVer = existingInProject.length + 1;
      
      const piNo = generateUniquePiNo(state.invoices);
      const newInv = createInvoiceTemplate(projectId, nextVer, client, piNo);
      
      const saved = await NestApiService.saveInvoice(newInv);
      setState(prev => prev ? { ...prev, invoices: [...prev.invoices, saved] } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleUpdateInvoice = async (id: string, updates: Partial<Invoice>) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateInvoice(id, updates);
      setState(prev => prev ? { ...prev, invoices: prev.invoices.map(i => i.id === id ? saved : i) } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleDeleteInvoice = async (id: string) => {
    setIsSyncing(true);
    try {
      await NestApiService.deleteInvoice(id);
      setState(prev => prev ? { ...prev, invoices: prev.invoices.filter(i => i.id !== id) } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleUpdateBranding = async (b: Branding) => {
    setIsSyncing(true);
    try {
      const updated = await NestApiService.updateBranding(b);
      setState(prev => prev ? { ...prev, branding: updated } : null);
    } catch(e) { console.error(e); } finally { setIsSyncing(false); }
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
        <p className="text-[10px] font-black text-[#2E3191] uppercase tracking-[0.4em] animate-pulse">Initializing Database Cluster</p>
      </div>
    );
  }

  // Role-based Data Filtering
  const isAdmin = state.currentUser?.role === 'Administrator';
  const filteredClients = isAdmin 
    ? state.clients 
    : state.clients.filter(c => state.currentUser?.assignedClientIds?.includes(c.id));
  
  const filteredProjects = isAdmin
    ? state.projects
    : state.projects.filter(p => state.currentUser?.assignedClientIds?.includes(p.clientId));

  const ProtectedRoute = ({ children, adminOnly = false }: { children?: React.ReactNode, adminOnly?: boolean }) => {
    if (!state.currentUser) return <Navigate to="/login" replace />;
    if (adminOnly && state.currentUser.role !== 'Administrator') return <Navigate to="/" replace />;
    return (
      <Layout user={state.currentUser} onLogout={handleLogout} brandColor={state.branding.brandColor} logo={state.branding.logo} logoBackgroundColor={state.branding.logoBackgroundColor} isSyncing={isSyncing} dbStatus={state.dbConfig.status}>
        {children}
      </Layout>
    );
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={<ProtectedRoute><Dashboard clients={filteredClients} projects={filteredProjects} users={state.users} /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients clients={filteredClients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects projects={filteredProjects} clients={filteredClients} onAddProject={handleAddProject} onUpdateProject={handleUpdateProject} onDeleteProject={handleDeleteProject} /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute>
          <ProjectDetails projects={filteredProjects} clients={filteredClients} quotations={state.quotations} branding={state.branding} onAddQuotation={handleAddQuotation} onUpdateQuotation={handleUpdateQuotation} onDeleteQuotation={handleDeleteQuotation} onDuplicateQuotation={(id) => {
            const source = state.quotations.find(q => q.id === id);
            if (source) handleAddQuotation(source.projectId, source.workflow);
          }} />
        </ProtectedRoute>} />
        <Route path="/projects/:projectId/invoices" element={<ProtectedRoute>
          <InvoiceManagement projects={filteredProjects} clients={filteredClients} invoices={state.invoices} branding={state.branding} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onDeleteInvoice={handleDeleteInvoice} onDuplicateInvoice={(id) => {
            const source = state.invoices.find(i => i.id === id);
            if (source) handleAddInvoice(source.projectId);
          }} />
        </ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly={true}><UsersPage users={state.users} clients={state.clients} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} /></ProtectedRoute>} />
        <Route path="/branding" element={<ProtectedRoute><BrandingPage branding={state.branding} onUpdateBranding={handleUpdateBranding} /></ProtectedRoute>} />
        <Route path="/database" element={<ProtectedRoute adminOnly={true}><DatabasePortal config={state.dbConfig} onUpdateConfig={(c) => setState(prev => prev ? {...prev, dbConfig: {...prev.dbConfig, ...c}} : null)} stats={{ clients: state.clients.length, projects: state.projects.length, quotations: state.quotations.length }} state={state} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {confirm.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setConfirm(prev => ({...prev, isOpen: false}))}></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl border border-slate-100 animate-fade-in p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#2E3191] tracking-tight uppercase">{confirm.title}</h2>
              <button onClick={() => setConfirm(prev => ({...prev, isOpen: false}))} className="p-2 text-slate-300"><X size={24}/></button>
            </div>
            <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight">{confirm.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirm(prev => ({...prev, isOpen: false}))} className="flex-1 px-4 py-4 border-2 border-slate-50 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest">Abort</button>
              <button onClick={() => { confirm.onConfirm(); setConfirm(prev => ({...prev, isOpen: false})); }} className={`flex-1 px-4 py-4 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 ${confirm.type === 'danger' ? 'bg-[#EC1C24]' : 'bg-amber-500'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </HashRouter>
  );
};

export default App;