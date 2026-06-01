import './App.css'

import { useState } from 'react';
import { useProjectsList, useCreateProject } from './hooks/useProjects'
import { CreateProjectForm } from './components/CreateProjectForm';
import { TechnologiesPage } from './components/Technologies';

type ActiveTab = 'projects' | 'technologies';

// Home page
function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('projects');
  const [modalOpen, setModalOpen] = useState(false);

  const { 
    data: projects, 
    isPending: isProjectsPending, 
    isError: isProjectsError, 
    error: projectsError, 
    refetch
  } = useProjectsList();

  
  useCreateProject();

  const projectsErrorMessage = projectsError?.message || null;
  if (isProjectsPending) return <div>Loading projects...</div>;
  if (isProjectsError) return <div>Error: {projectsErrorMessage}</div>;

  return (
    <div className="shell">
 
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="sidebar-brand-name">Workspace</span>
        </div>
 
        <nav className="sidebar-nav">
          <span className="sidebar-nav-group-label">Menu</span>
 
          <button
            className={`sidebar-nav-item ${activeTab === 'projects' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
            </svg>
            Projects
          </button>
 
          <button
            className={`sidebar-nav-item ${activeTab === 'technologies' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveTab('technologies')}
          >
            <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            Technologies
          </button>
        </nav>
      </aside>
 
      {/* ── Main content ── */}
      <main className="main">
 
        {/* Projects tab */}
        {activeTab === 'projects' && (
          <div className="app" key="projects">
            <header className="app-header">
              <div className="app-brand">
                <div className="app-logo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
                  </svg>
                </div>
                <div>
                  <div className="app-heading">Projects</div>
                  <div className="app-subheading">Manage and track all your work in one place</div>
                </div>
              </div>
              <button className="app-btn-new" onClick={() => setModalOpen(true)}>
                <span className="app-btn-icon">+</span>
                New Project
              </button>
            </header>
 
            {isProjectsPending && <div className="app-loading">Loading projects…</div>}
            {isProjectsError && <div className="app-error">Error: {projectsErrorMessage}</div>}
 
            {!isProjectsPending && !isProjectsError && (
              <>
                <div className="app-section-header">
                  <span className="app-section-title">All Projects</span>
                  <span className="app-count">{projects.length}</span>
                </div>
 
                <ul className="app-project-list">
                  {projects.length === 0 ? (
                    <li>
                      <div className="app-empty-state">
                        <div className="app-empty-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
                            <line x1="12" y1="11" x2="12" y2="17"/>
                            <line x1="9" y1="14" x2="15" y2="14"/>
                          </svg>
                        </div>
                        <div className="app-empty-title">No projects yet</div>
                        <p className="app-empty-body">Create your first project to start</p>
                      </div>
                    </li>
                  ) : (
                    projects.map((project) => (
                      <li key={project.id} className="app-project-item">
                        <div className="app-project-avatar">
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="app-project-info">
                          <div className="app-project-name">{project.name}</div>
                        </div>
                        <span className="app-project-chevron">›</span>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
 
            <CreateProjectForm
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              onSuccess={() => refetch()}
            />
          </div>
        )}
 
        {/* Technologies tab */}
        {activeTab === 'technologies' && <TechnologiesPage />}
      </main>
    </div>
  );
}

export default App
