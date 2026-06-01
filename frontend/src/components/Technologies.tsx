import { useTechnologiesList } from '../hooks/useTechnologies';

export function TechnologiesPage() {
    const { data: technologies, isPending, isError, error } = useTechnologiesList();

    if (isPending) return <div>Loading Technologies...</div>;
    if (isError) return <div>Error: {error.message}</div>

    return (
        <div className="app" key="technologies">
            <header className="app-header">
                <div className="app-brand">
                    <div className="app-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                    </div>
                    <div>
                        <div className="app-heading">Technologies</div>
                        <div className="app-subheading">Tools and stacks powering your projects</div>
                    </div>
                </div>
            </header>
 
            <div className="app-section-header">
                <span className="app-section-title">All Technologies</span>
                <span className="app-count">{technologies?.length ?? 0}</span>
            </div>
 
            <ul className="app-project-list">
                {!technologies || technologies.length === 0 ? (
                    <li>
                        <div className="app-empty-state">
                            <div className="app-empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 18 22 12 16 6"/>
                                    <polyline points="8 6 2 12 8 18"/>
                                </svg>
                            </div>
                            <div className="app-empty-title">No technologies yet</div>
                            <p className="app-empty-body">Technologies added to your projects will appear here</p>
                        </div>
                    </li>
                ) : (
                    technologies.map((tech) => (
                        <li key={tech.id} className="app-project-item tech-item">
                            {/* Logo */}
                            <div className="tech-logo-wrap">
                                {tech.logo_url ? (
                                    <div dangerouslySetInnerHTML={{ __html: tech.logo_url }} />
                                ) : null}
                                <span
                                    className="tech-logo-fallback"
                                    style={{ display: tech.logo_url ? 'none' : 'flex' }}
                                >
                                    {tech.display_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
 
                            {/* Info */}
                            <div className="app-project-info">
                                <div className="app-project-name">{tech.display_name}</div>
                                {tech.source_url && (
                                    <a
                                        href={tech.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="tech-source-url"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {tech.source_url.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                            </div>
 
                            {/* External link */}
                            {tech.source_url && (
                                <a
                                    href={tech.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tech-ext-btn"
                                    title="Open source"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                        <polyline points="15 3 21 3 21 9"/>
                                        <line x1="10" y1="14" x2="21" y2="3"/>
                                    </svg>
                                </a>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}