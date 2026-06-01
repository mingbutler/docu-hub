export interface Technology {
    id: string;
    display_name: string;
    source_url: string;
    logo_url: string;
}

export async function getTechnologies(): Promise<Technology[]> {
    const response = await fetch('/api/v1/technologies/list');
    if (!response.ok) throw new Error("Failed to fetch technologies");
    const data = await response.json();
    return data.technologies;
}