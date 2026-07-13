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
    q = queue.Queue()
    
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

# test successful streaming of tokens
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
        
# test error handling mid stream
def test_exception_mid_stream_send_error_frame(client, monkeypatch):
    async def fake_stream(query, history, session_id):
        yield {"type": "token", "content": "partial"}
        raise ValueError("test error")
    
    monkeypatch.setattr(chat, "stream_chat_tokens", fake_stream)
    
    with client.websocket_connect("/ws/chat") as ws:
        ws.send_json({"type": "chat", "query": "hi", "id": "s1"})
        assert ws.receive_json() == {"type": "token", "content": "partial"}
        assert ws.receive_json() == {"type": "error", "message": "test error"}
        
        # should not be able to receive any more messages
        with pytest.raises(TimeoutError):
            receive_with_timeout(ws, timeout=0.5)

# test missing field in request 
def test_missing_required_field_surfaces_as_error(client, monkeypatch):
    
    async def fake_stream(query, history, session_id):
        yield {"type": "token", "content": "unused"}
 
    monkeypatch.setattr(chat, "stream_chat_tokens", fake_stream)
 
    with client.websocket_connect("/ws/chat") as ws:
        ws.send_json({"type": "chat", "query": "hi"})  # no "id"
        msg = ws.receive_json()
        assert msg["type"] == "error"
        assert "id" in msg["message"]
        
