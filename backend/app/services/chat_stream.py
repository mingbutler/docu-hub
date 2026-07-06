from langsmith import traceable
from langchain_openai import ChatOpenAI

from app.services.rag_service import build_chat_messages

def extract_text_chunk(content) -> str:
    if content is None:
        return ""
    
    if isinstance(content, str):
        return content
    
    # list of content blocks
    return "".join(
        block.get("text", "") if isinstance(block, dict) else str(block)
        for block in content
    )

@traceable(name="stream_chat_tokens", run_type="chain")
async def stream_chat_tokens(*, query: str, history: list, session_id: str):
    # create agent for generated prompt with retrieved context 
        model = ChatOpenAI(model='gpt-4o-mini', temperature=0.2, streaming=True)
        messages = build_chat_messages(query, history)
        
        async for chunk in model.astream(messages):
            text = extract_text_chunk(chunk.content)
            if text:
                yield {"type": "token", "content": text}