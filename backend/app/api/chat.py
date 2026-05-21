from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from models.schemas import ChatRequest
from services.rag_service import GeneratePromptMiddleware

router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        # create agent for generated prompt with retrieved context 
        model = ChatOpenAI(model='gpt-5-mini', temperature=0.2, streaming=True)
        agent = create_agent(model=model, middleware=[GeneratePromptMiddleware()])
        
        async def event_stream():
            sources = []
            try:
                async for event in agent.astream_events({"messages": [{"role": "user", "content": request.query}], "projectId": request.projectId}, version='v2'):
                    kind = event['event']
                    
                    # stream text tokens to user
                    if kind == 'on_chat_model_stream':
                        chunk = event['data'].get('chunk')
                        if chunk and chunk.content:
                            yield f"data; {json.dumps({'type': 'token', 'content': chunk.content})}\n\n"

                    # capture sources and send at the end of stream
                    elif kind == 'on_chain_end':
                        output = event['data'].get('output', {})
                        context = output.get('context', [])
                        if context:
                            sources = [doc.metadata.get('source', "") for doc in context if doc.metadata.get('source')]
                            
                    yield f"data: {json.dumps({'type': 'done', 'sources': sources})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
                
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no" # disables buffering in nginx proxies
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 