export interface IngestRequest {
    tech_id:string;
    source_url: string;
    tech_tag: string;
}

export async function ingestDocument(request: IngestRequest): Promise<string> {
    // start ingestion job
    const response = await fetch('/api/v1/ingest', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    if (!response.ok) throw new Error("Failed to ingest documents");
    const { job_id } = await response.json();

    // poll until complete or error
    const POLL_INTERVAL_MS = 3000;
    const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
    const deadline = Date.now() + TIMEOUT_MS;

    while (Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

        const statusResponse = await fetch(`/api/v1/ingest/${job_id}`);
        if (!statusResponse.ok) throw new Error("Failed to get ingestion job status");
        const { status, detail } = await statusResponse.json();

        if (status === 'complete') return "Ingestion successful";
        if (status === 'error') throw new Error(detail || "Ingestion failed");
        // still running = continue polling
    }

    throw new Error("Ingestion timed out");
}