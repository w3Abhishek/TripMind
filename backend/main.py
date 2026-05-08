"""
load_dotenv() MUST be called before any module-level code that reads env vars
(e.g. genai.Client instantiation in services/gemini.py).
"""
import os
from dotenv import load_dotenv
load_dotenv()  # ← must be first, before any router/service imports

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, images, expenses, youtube

app = FastAPI(title="TripMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router,     prefix="/chat",     tags=["chat"])
app.include_router(images.router,   prefix="/images",   tags=["images"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(youtube.router,  prefix="/youtube",  tags=["youtube"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "tripmind-backend"}
