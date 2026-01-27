
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppState, User, Client, Project, Quotation, Branding, WorkflowType, Section } from './types';
import { loadState, saveState, createSupplyAndFabricationTemplate, createStructuralFabricationTemplate, createJobWorkTemplate } from './store';

// Components
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import BrandingPage from './pages/Branding';
import UsersPage from './pages/Users';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleLogin = (email: string, password: string): boolean => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) return false;

    // Special check for primary admin
    if (user.email.toLowerCase() === 'admin@revira.com') {
      if (password === 'admin123') {
        setState(prev => ({ ...prev, currentUser: user }));
        return true;
      }
      return false;
    }

    // For any other created user, accept any password
    setState(prev => ({ ...prev, currentUser: user }));
    return true;
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  // User Management
  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name || 'New Personnel',
      email: userData.email || '',
      role: userData.role || 'Standard',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`
    };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  };

  const deleteUser = (id: string) => {
    setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };

  const addClient = (clientData: Partial<Client>) => {
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: clientData.name || 'Unknown Client',
      address: clientData.address || '',
      gstin: clientData.gstin || '',
      contactPerson: clientData.contactPerson || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
  };

  const deleteClient = (id: string) => {
    setState(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }));
  };

  const addProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: projectData.clientId || '',
      name: projectData.name || 'New Project',
      location: projectData.location || '',
      workflow: projectData.workflow || WorkflowType.SUPPLY_AND_FABRICATION,
      status: 'Planning',
      assignedUserId: state.currentUser?.id || '1',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const addQuotation = (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    const client = state.clients.find(c => c.id === project.clientId);
    const clientName = client?.name || 'Unknown_Client';

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

    setState(prev => ({ ...prev, quotations: [...prev.quotations, newQuote] }));
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setState(prev => ({
      ...prev,
      quotations: prev.quotations.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const duplicateQuotation = (id: string) => {
    const source = state.quotations.find(q => q.id === id);
    if (!source) return;

    const existingQuotes = state.quotations.filter(q => q.projectId === source.projectId);
    const nextVersion = Math.max(...existingQuotes.map(q => q.version)) + 1;

    const newSections: Section[] = source.sections.map(s => ({
      ...s,
      id: Math.random().toString(36).substr(2, 9),
      rows: s.rows.map(r => [...r]),
      items: [...s.items],
      headers: [...s.headers]
    }));

    const newQuote: Quotation = {
      ...source,
      id: Math.random().toString(36).substr(2, 9),
      version: nextVersion,
      status: 'Draft',
      sections: newSections,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, quotations: [...prev.quotations, newQuote] }));
  };

  const deleteQuotation = (id: string) => {
    setState(prev => ({ ...prev, quotations: prev.quotations.filter(q => q.id !== id) }));
  };

  const updateBranding = (branding: Branding) => {
    setState(prev => ({ ...prev, branding }));
  };

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
      >
        {children}
      </Layout>
    );
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard clients={state.clients} projects={state.projects} users={state.users} /></ProtectedRoute>} />
        
        <Route path="/clients" element={<ProtectedRoute><Clients clients={state.clients} onAddClient={addClient} onDeleteClient={deleteClient} /></ProtectedRoute>} />
        
        <Route path="/projects" element={<ProtectedRoute><Projects projects={state.projects} clients={state.clients} onAddProject={addProject} /></ProtectedRoute>} />
        
        <Route path="/projects/:projectId" element={<ProtectedRoute>
          <ProjectDetails 
            projects={state.projects} 
            clients={state.clients} 
            quotations={state.quotations} 
            branding={state.branding}
            onAddQuotation={addQuotation}
            onUpdateQuotation={updateQuotation}
            onDeleteQuotation={deleteQuotation}
            onDuplicateQuotation={duplicateQuotation}
          />
        </ProtectedRoute>} />
        
        <Route path="/users" element={<ProtectedRoute adminOnly={true}><UsersPage users={state.users} onAddUser={addUser} onUpdateUser={updateUser} onDeleteUser={deleteUser} /></ProtectedRoute>} />
        
        <Route path="/branding" element={<ProtectedRoute><BrandingPage branding={state.branding} onUpdateBranding={updateBranding} /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
