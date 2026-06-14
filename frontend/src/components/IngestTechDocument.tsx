import { useState, useRef, useEffect } from "react";
import '../styles/IngestTechDocumentForm.css';
import { useAddTechnology } from "../hooks/useTechnologies";

interface Technology {
    id: string;
    tech_tag?: string;
    display_name: string;
    source_url?: string;
    logo_url?: string;
}

interface IngestTechDocumentProps {
    technologies: Technology[];
    onClose: () => void;
}

type Step = 'select' | 'confirm';

export function IngestTechDocument({ technologies, onClose }: IngestTechDocumentProps) {
    const [search, setSearch] = useState('');
    const [step, setStep] = useState<Step>('select');
    const [selected, setSelected] = useState<Technology | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const { mutateAsync: addTechnology } = useAddTechnology();

    useEffect(() => {
        searchRef.current?.focus();
    }, []);

    const filtered = technologies.filter(tech => tech.display_name.toLowerCase().includes(search.toLowerCase()));

    function handleSelect(tech: Technology) {
        setSelected(tech);
        setStep('confirm');
        setStatus('idle');
        setErrorMsg('');
    }

    function handleBack() {
        setStep('select');
        setSelected(null);
        setStatus('idle');
        setErrorMsg('');
    }

    async function handleConfirm() {
        if (!selected) return;

        setStatus('loading');

        try {
            await addTechnology({
                tech_id: selected.id,
                source_url: selected.source_url ?? '',
                tech_tag: selected.tech_tag ?? selected.display_name.toLowerCase(),
            });

            setStatus('success');
        } catch (e: any) {
            setStatus('error');
            setErrorMsg(e?.message ?? 'Ingestion failed. Please try again.');
        }
    }

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === overlayRef.current) onClose();
    }

     return (
        <div className="itdf-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true">
            <div className="itdf-modal">
                {/* Header */}
                <div className="itdf-header">
                    {step === 'confirm' && (
                        <button className="itdf-back-btn" onClick={handleBack} aria-label="Back">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}
                    <div className="itdf-header-text">
                        <span className="itdf-title">
                            {step === 'select' ? 'Ingest Documents' : 'Confirm Ingestion'}
                        </span>
                        <span className="itdf-subtitle">
                            {step === 'select'
                                ? 'Select a technology to ingest its documentation'
                                : `You're about to ingest docs for ${selected?.display_name}`}
                        </span>
                    </div>
                    <button className="itdf-close-btn" onClick={onClose} aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
 
                {/* SELECT STEP */}
                {step === 'select' && (
                    <>
                        <div className="itdf-search-wrap">
                            <svg className="itdf-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                ref={searchRef}
                                className="itdf-search"
                                type="text"
                                placeholder="Search technologies…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button className="itdf-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>
 
                        <ul className="itdf-list">
                            {filtered.length === 0 ? (
                                <li className="itdf-empty">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <span>No technologies match "<strong>{search}</strong>"</span>
                                </li>
                            ) : (
                                filtered.map((tech) => (
                                    <li key={tech.id}>
                                        <button className="itdf-tech-row" onClick={() => handleSelect(tech)}>
                                            <div className="itdf-tech-logo">
                                                {tech.logo_url ? (
                                                    <div dangerouslySetInnerHTML={{ __html: tech.logo_url }} />
                                                ) : (
                                                    <span className="itdf-tech-fallback">
                                                        {tech.display_name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="itdf-tech-info">
                                                <span className="itdf-tech-name">{tech.display_name}</span>
                                                {tech.source_url && (
                                                    <span className="itdf-tech-url">
                                                        {tech.source_url.replace(/^https?:\/\//, '')}
                                                    </span>
                                                )}
                                            </div>
                                            <svg className="itdf-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </>
                )}
 
                {/* CONFIRM STEP */}
                {step === 'confirm' && selected && (
                    <div className="itdf-confirm">
                        <div className="itdf-confirm-card">
                            <div className="itdf-confirm-logo">
                                {selected.logo_url ? (
                                    <div dangerouslySetInnerHTML={{ __html: selected.logo_url }} />
                                ) : (
                                    <span className="itdf-tech-fallback itdf-tech-fallback--lg">
                                        {selected.display_name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="itdf-confirm-info">
                                <span className="itdf-confirm-name">{selected.display_name}</span>
                                {selected.source_url && (
                                    <span className="itdf-confirm-url">
                                        {selected.source_url.replace(/^https?:\/\//, '')}
                                    </span>
                                )}
                            </div>
                        </div>
 
                        <p className="itdf-confirm-desc">
                            This will crawl and index the documentation for{' '}
                            <strong>{selected.display_name}</strong> so it can be referenced
                            across your projects. This may take a moment.
                        </p>
 
                        {status === 'error' && (
                            <div className="itdf-alert itdf-alert--error">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {errorMsg}
                            </div>
                        )}
 
                        {status === 'success' && (
                            <div className="itdf-alert itdf-alert--success">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Ingestion Complete!
                            </div>
                        )}
 
                        <div className="itdf-confirm-actions">
                            <button className="itdf-btn itdf-btn--ghost" onClick={handleBack} disabled={status === 'loading'}>
                                Cancel
                            </button>
                            <button
                                className="itdf-btn itdf-btn--primary"
                                onClick={handleConfirm}
                                disabled={status === 'loading' || status === 'success'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <span className="itdf-spinner" />
                                        Ingesting…
                                    </>
                                ) : status === 'success' ? (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Done
                                    </>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

