from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.gemini import stream_chat

router = APIRouter()


class Message(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@router.post("")
async def chat(request: ChatRequest):
    """
    Stream a Gemini response for the given conversation history.
    Returns a text/plain streaming response.
    """
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    async def generator():
        async for chunk in stream_chat(messages):
            yield chunk

    return StreamingResponse(generator(), media_type="text/plain")
