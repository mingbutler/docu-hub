from fastapi import APIRouter, HTTPException

from services.project_service import create_project, list_projects
from models.schemas import Project

router = APIRouter()

# create new project
@router.post("/create")
async def create(project: Project):
    try:
        new_project = create_project(project)
        if new_project:
            return {"message": "Project created successfully", "project": new_project}
        else:
            raise HTTPException(status_code=400, detail="Failed to create project")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# list all existing projects
@router.get("/list")
async def list():
    try:
        projects = list_projects()
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# get project details by id