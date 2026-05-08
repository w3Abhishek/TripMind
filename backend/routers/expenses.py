from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from google.genai import types
import os

router = APIRouter()

_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))
MODEL = "gemini-3-flash-preview"

EXPENSE_PARSE_PROMPT = """You are an expense parser. Given a natural language expense description, extract structured expense data and return ONLY valid JSON matching this schema exactly:
{
  "description": "short title",
  "amount": 850,
  "currency": "INR",
  "category": "food",
  "paidBy": "currentUser",
  "splitBetween": ["currentUser", "name2"]
}
Category must be one of: food, transport, hotel, activity, other.
Currency should be a 3-letter ISO code (INR, USD, EUR, etc.).
Return ONLY the JSON object, no explanation."""


class ExpenseParseRequest(BaseModel):
    text: str
    current_user: str = "currentUser"


@router.post("/parse")
async def parse_expense(request: ExpenseParseRequest):
    """Parse a natural language expense description into structured data."""
    import json, re
    prompt = f"{EXPENSE_PARSE_PROMPT}\n\nExpense: {request.text}"
    response = await _client.aio.models.generate_content(
        model=MODEL,
        contents=prompt,
    )
    raw = response.text.strip()
    raw = re.sub(r"^```(?:json)?\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    try:
        data = json.loads(raw)
        return data
    except json.JSONDecodeError:
        return {"error": "Could not parse expense", "raw": raw}
