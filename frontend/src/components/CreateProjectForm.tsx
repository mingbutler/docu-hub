import { useState, useEffect, useRef } from 'react';
import { useCreateProject } from '../hooks/useProjects';
import '../styles/CreateProjectForm.css';

interface CreateProjectFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateProjectForm({ open, onClose, onSuccess }: CreateProjectFormProps) {
    const [ name, setName ] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const { mutate: createProject, isPending, isError, error, reset } = useCreateProject();

    useEffect(() => {
        if (open) {
            reset();
            setName('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open, reset]);

    // close on escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        createProject(
            { id: crypto.randomUUID(), name: name.trim() },
            {
                onSuccess: () => {
                    onSuccess?.();
                    onClose();
                }
            }
        );
    };

    if (!open) return null;

    return (
        <div className="cpf-overlay" onClick={onClose}>
            <div
                className="cpf-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cpf-title"
            >
                <div className="cpf-header">
                    <div className="cpf-header-text">
                        <h2 className="cpf-title" id="cpf-title">New Project</h2>
                        <p className="cpf-subtitle">Give your project a name</p>
                    </div>
                    <button className="cpf-close" onClick={onClose} aria-label="Close">✕</button>
                </div>
        
                <div className="cpf-body">
                    <label className="cpf-label" htmlFor="cpf-name">Project name</label>
                    <input
                        ref={inputRef}
                        id="cpf-name"
                        className="cpf-input"
                        type="text"
                        placeholder="My awesome project"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                        disabled={isPending}
                        autoComplete="off"
                    />
                    {isError && (
                        <p className="cpf-error">
                            {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
                        </p>
                    )}
                </div>
        
                <div className="cpf-footer">
                    <button className="cpf-btn-cancel" onClick={onClose} disabled={isPending}>
                        Cancel
                    </button>
                    <button
                        className="cpf-btn-create"
                        onClick={handleSubmit}
                        disabled={isPending || !name.trim()}
                    >
                        {isPending ? <span className="cpf-spinner" /> : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}