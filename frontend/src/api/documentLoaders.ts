export interface IngestRequest {
    projectId: string;
    source_url: string;
    tech_tag: string;
}

export async function ingestDocument(request: IngestRequest): Promise<string> {
    const response = await fetch('/api/v1/ingest', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    if (!response.ok) throw new Error("Failed to ingest documents");
    const data = await response.json();
    return data.message;
}