import asyncio
import uuid
from functools import partial

from fastapi import APIRouter, BackgroundTasks, HTTPException

from services.rag_service import ingest_git_repo, ingest_web_repo
from models.schemas import IngestRequest

router = APIRouter()

# in memory job store
_jobs: dict[str, dict] = {}

def _run_ingestion(job_id: str, source_url: str):
    try :
        if source_url.endswith(".git"):
            ingest_git_repo(source_url)
        else:
            ingest_web_repo(source_url)
        _jobs[job_id]["status"] = "complete"
    except Exception as e:
        _jobs[job_id]["status"] = "error"
        _jobs[job_id]["detail"] = str(e)

# start ingestion job
@router.post("/ingest", status_code=200)
async def ingest_documents(request: IngestRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "running"}
    background_tasks.add_task(_run_ingestion, job_id, request.source_url)
    return {"job_id": job_id, "message": "Ingestion job started"}

# get job status
@router.get("/ingest/{job_id}")    
async def get_ingest_job_status(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job