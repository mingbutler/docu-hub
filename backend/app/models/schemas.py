from pydantic import BaseModel

# project and project creation schemas
class Project(BaseModel):
    id: str
    name: str
    
class ProjectCreate(BaseModel):
    project: Project
    
# document information for embeddings
class DocumentChunk(BaseModel):
    content: str
    metadata: dict

# conversation history and response generation schemas
class ChatRequest(BaseModel):
    projectId: str
    query: str
    
class ChatResponse(BaseModel):
    answer: str
    sources: list[str] 