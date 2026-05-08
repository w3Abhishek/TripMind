import os
import random
import httpx
from typing import AsyncGenerator
from google import genai
from google.genai import types
from .prompts import TRIPMIND_SYSTEM_PROMPT

KEYS_URL = "https://gist.githubusercontent.com/w3Abhishek/35c1540c640fda0de8234e249e4eed80/raw/f2f6662c2ab83f2b5de991d52a1b686e6c8b9373/keys.txt"
_api_keys = []

try:
    with httpx.Client() as _http:
        _resp = _http.get(KEYS_URL)
        if _resp.status_code == 200:
            _api_keys = [k.strip() for k in _resp.text.split(",") if k.strip()]
except Exception as e:
    print(f"Failed to fetch remote keys: {e}")

if not _api_keys:
    _api_keys = [os.getenv("GEMINI_API_KEY", "")]

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

    available_keys = list(_api_keys)
    random.shuffle(available_keys)
    
    for key in available_keys:
        if not key: continue
        client = genai.Client(api_key=key)
        try:
            stream = await client.aio.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=config,
            )
            async for chunk in stream:
                try:
                    if chunk.text:
                        yield chunk.text
                except Exception:
                    pass
            return  # Success, exit the function
        except Exception as e:
            print(f"Gemini streaming error with key {key[:8]}...: {e}")
            continue # Try next key

async def generate_response(messages: list[dict]) -> str:
    """Non-streaming response — used by the expense parser."""
    contents: list[types.Content] = [
        types.Content(
            role="user" if m["role"] == "user" else "model",
            parts=[types.Part(text=m["content"])]
        )
        for m in messages
    ]
    
    available_keys = list(_api_keys)
    random.shuffle(available_keys)
    
    for key in available_keys:
        if not key: continue
        client = genai.Client(api_key=key)
        try:
            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=TRIPMIND_SYSTEM_PROMPT,
                ),
            )
            return response.text
        except Exception as e:
            print(f"Gemini non-streaming error with key {key[:8]}...: {e}")
            continue
    return ""
