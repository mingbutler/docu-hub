export interface Project {
    id: string;
    name: string;
}

export async function createProject(project: Project): Promise<Project> {
    const response = await fetch('/api/v1/projects/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    });
    if (!response.ok) throw new Error("Failed to create projects");
    const data = await response.json();
    return data.projects;
}

export async function getProjects(): Promise<Project[]> {
    const response = await fetch('/api/v1/projects/list');
    if (!response.ok) throw new Error("Failed to fetch projects");
    const data = await response.json();
    return data.projects; // API returns { projects: Project[] }
}