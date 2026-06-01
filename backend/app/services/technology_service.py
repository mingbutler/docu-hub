from models.schemas import Technology
from services.supabase_service import supabase

def list_technologies() -> list[Technology]:
    try:
        response = supabase.table('technologies').select('*').execute()
        if response.data:
            return [Technology.model_validate(item) for item in response.data]
        else:
            return []
    except Exception as e:
        raise Exception(f"Error listing technologies: {str(e)}")