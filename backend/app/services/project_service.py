from models.schemas import Project
from supabase_service import supabase

def create_project(project_create: Project):
    try:
        # insert project into supabase
        response = (supabase.table('projects')
            .insert({'id': project_create.id, 'name': project_create.name})
            .execute()
        )
        if response.data:
            return response.data
    except Exception as e:
        raise Exception(f"Error creating project: {str(e)}")
    
def list_projects() -> list[Project]:
    try:
        # fetch projects from supabase
        response = supabase.table('projects').select('*').execute()
        if response.data:
            return [Project.model_validate(item) for item in response.data]
        else:
            return []
    except Exception as e:
        raise Exception(f"Error listing projects: {str(e)}")
    

            
