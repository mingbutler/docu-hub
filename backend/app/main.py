from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import chat, ingest, project

app = FastAPI(
    title="DocuHub API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register API routes
app.include_router(chat.router, prefix="/api/v1/rag", tags=["Chat"])
app.include_router(ingest.router, prefix="/api/v1/ingest", tags=["Ingestion"])
app.include_router(project.router, prefix="/api/v1/projects", tags=["Projects"])

# Health check
@app.get("/health")
async def root():
    return {"status": "DocuHub API is online"}