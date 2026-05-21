export interface Project {
    id: string;
    name: string;
}

export async function getProjects(): Promise<Project[]> {
    const response = await fetch('/api/v1/projects/list');
    if (!response.ok) throw new Error("Failed to fetch projects");
    const data = await response.json();
    return data.projects; // API returns { projects: Project[] }
}