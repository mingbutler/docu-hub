from fastapi import APIRouter, HTTPException

from services.rag_service import ingest_git_repo, ingest_web_repo
from models.schemas import IngestRequest

router = APIRouter()

@router.post("/ingest")
async def ingest(request: IngestRequest):
    try:
        if request.source_url.endswith(".git"):
            ingest_git_repo(request.source_url)
        else:
            ingest_web_repo([request.source_url])
            
        return {"message": "Ingestion Successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))