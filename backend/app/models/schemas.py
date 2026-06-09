from pydantic import BaseModel
from typing import Literal
    
# technology schemas
class Technology(BaseModel):
    id: str
    display_name: str
    source_url: str
    logo_url: str

# document ingestion 
class IngestRequest(BaseModel):
    source_url: str
    tech_tag: str

# document information for embeddings
class DocumentChunk(BaseModel):
    content: list[str]
    metadata: dict

# conversation history and response generation schemas
class ChatMessage(BaseModel):
    role: Literal['user', 'assistant']
    content: str

class ChatRequest(BaseModel):
    id: str
    query: str
    history: list[ChatMessage] = []
    
class ChatResponse(BaseModel):
    answer: str