import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.chat_stream import stream_chat_tokens

router = APIRouter()

@router.websocket("/ws/chat")
async def chat_ws(websocket: WebSocket):
    await websocket.accept()
    active_task: asyncio.Task | None = None
    
    try:
        while True:
            payload = await websocket.receive_json()
            msg_type = payload.get("type")

            if msg_type == "cancel":
                if active_task and not active_task.done():
                    active_task.cancel()
                continue

            if msg_type == "chat":
                if active_task and not active_task.done():
                    active_task.cancel()

                async def run():
                    try:
                        async for frame in stream_chat_tokens(
                            query=payload["query"],
                            history=payload.get("history", []),
                            session_id=payload["id"],
                        ):
                            await websocket.send_json(frame)
                        await websocket.send_json({"type": "done"})
                    except asyncio.CancelledError:
                        pass
                    except Exception as e:
                        await websocket.send_json({"type": "error", "message": str(e)})

                active_task = asyncio.create_task(run())
    except WebSocketDisconnect:
        if active_task and not active_task.done():
            active_task.cancel()