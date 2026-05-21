import { create } from 'zustand';

interface ProjectState {
    activeProjectId: string | null;
    setActiveProjectId: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    activeProjectId: null,
    setActiveProjectId: (id) => set({ activeProjectId: id })
}))