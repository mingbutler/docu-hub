import asyncio
import queue 
import threading
import time

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import chat

@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(chat.router)
    return TestClient(app)

def receive_with_timeout(ws, timeout=0.5):
    q: queue.Queue = queue
    
    def worker():
        try:
            q.put(("ok", ws.receive_json()))
        except Exception as exc:  
            q.put(("err", exc))
    
    threading.Thread(target=worker, daemon=True).start()
    try:
        kind, value = q.get(timeout=timeout)
    except queue.Empty:
        raise TimeoutError(f"no message received within {timeout}s")
    if kind == "err":
        raise value
    return value
    
def test_streams_tokens_then_done(client, monkeypatch):
    async def fake_stream(query, history, session_id):
        yield {"type": "token", "content": "Hello"}
        yield {"type": "token", "content": " world"}
 
    monkeypatch.setattr(chat, "stream_chat_tokens", fake_stream)
 
    with client.websocket_connect("/ws/chat") as ws:
        ws.send_json({"type": "chat", "query": "hi", "id": "s1"})
        assert ws.receive_json() == {"type": "token", "content": "Hello"}
        assert ws.receive_json() == {"type": "token", "content": " world"}
        assert ws.receive_json() == {"type": "done"}