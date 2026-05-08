import os
from typing import AsyncGenerator
from google import genai
from google.genai import types
from .prompts import TRIPMIND_SYSTEM_PROMPT

_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))
MODEL = "gemini-3-flash-preview"


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    """
    Stream a Gemini response using the google-genai SDK (proper async streaming).
    Passes the full conversation history as contents.
    """
    contents: list[types.Content] = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))

    config = types.GenerateContentConfig(
        system_instruction=TRIPMIND_SYSTEM_PROMPT,
        temperature=0.9,
        max_output_tokens=8192,
    )

    async for chunk in await _client.aio.models.generate_content_stream(
        model=MODEL,
        contents=contents,
        config=config,
    ):
        try:
            if chunk.text:
                yield chunk.text
        except Exception:
            pass


async def generate_response(messages: list[dict]) -> str:
    """Non-streaming response — used by the expense parser."""
    contents: list[types.Content] = [
        types.Content(
            role="user" if m["role"] == "user" else "model",
            parts=[types.Part(text=m["content"])]
        )
        for m in messages
    ]
    response = await _client.aio.models.generate_content(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=TRIPMIND_SYSTEM_PROMPT,
        ),
    )
    return response.text
