import asyncio
from functools import partial

from fastapi import APIRouter, HTTPException

from services.rag_service import ingest_git_repo, ingest_web_repo
from models.schemas import IngestRequest

router = APIRouter()

@router.post("/ingest")
async def ingest_documents(request: IngestRequest):
    try:
        loop = asyncio.get_event_loop()
        
        if request.source_url.endswith(".git"):
            await loop.run_in_executor(None, partial(ingest_git_repo, request.source_url))
        else:
            await loop.run_in_executor(None, partial(ingest_web_repo, request.source_url))
            
        return {"message": "Ingestion Successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))