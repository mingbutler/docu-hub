from pydantic import BaseModel

# project and project creation schemas
class Project(BaseModel):
    id: str
    name: str
    
class ProjectList(BaseModel):
    project: list[Project]
    
# technology schemas
class Technology(BaseModel):
    id: str
    display_name: str
    source_url: str
    logo_url: str

# document ingestion 
class IngestRequest(BaseModel):
    projectId: str
    source_url: str
    tech_tag: str

# document information for embeddings
class DocumentChunk(BaseModel):
    content: list[str]
    metadata: dict

# conversation history and response generation schemas
class ChatRequest(BaseModel):
    projectId: str
    query: str
    
class ChatResponse(BaseModel):
    answer: str
    sources: list[str] 