from fastapi import APIRouter, HTTPException

from services.technology_service import list_technologies

router = APIRouter()

@router.get("/list")
async def list():
    try:
        technologies = list_technologies()
        return {"technologies": technologies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))