import asyncio
import json
import os
import re

from fastapi import HTTPException
from openai import AsyncOpenAI, RateLimitError

from models.schemas import ChatResponse
from services.prompts import ASSESSMENT_SYSTEM_PROMPT, build_interviewer_prompt

_MODEL = "llama-3.3-70b-versatile"
_MAX_TURNS = 7


def _client() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ["GROQ_API_KEY"],
    )


def _to_dict(m) -> dict:
    if isinstance(m, dict):
        return m
    return {"role": m.role, "content": m.content}


def _strip_fences(text: str) -> str:
    """Extract a bare JSON object from text that may contain markdown fences."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start : end + 1]
    return text


async def get_chat_response(messages: list, turn_count: int) -> ChatResponse:
    client = _client()
    last_four = [_to_dict(m) for m in messages[-4:]]
    system_prompt = build_interviewer_prompt(turn_count)
    payload = [{"role": "system", "content": system_prompt}] + last_four

    async def _call():
        return await client.chat.completions.create(
            model=_MODEL,
            messages=payload,
            max_tokens=200,
        )

    try:
        completion = await _call()
    except RateLimitError:
        await asyncio.sleep(2)
        try:
            completion = await _call()
        except RateLimitError:
            raise HTTPException(status_code=429, detail="Rate limit reached. Please wait a moment.")
        except Exception:
            raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")

    reply = completion.choices[0].message.content.strip()
    should_end = (turn_count + 1) >= _MAX_TURNS
    return ChatResponse(reply=reply, should_end=should_end)


async def get_assessment(transcript: list, extra_instruction: str | None = None) -> dict:
    """
    Call Groq with the assessment prompt and return the parsed JSON dict.
    Raises json.JSONDecodeError if the response cannot be parsed as JSON.
    The router is responsible for the stricter-prompt retry on JSONDecodeError.
    """
    client = _client()
    transcript_text = "\n".join(
        f"{_to_dict(m)['role'].upper()}: {_to_dict(m)['content']}" for m in transcript
    )
    user_content = f"Interview transcript:\n\n{transcript_text}"
    if extra_instruction:
        user_content += f"\n\n{extra_instruction}"

    payload = [
        {"role": "system", "content": ASSESSMENT_SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    async def _call():
        return await client.chat.completions.create(
            model=_MODEL,
            messages=payload,
            max_tokens=800,
        )

    try:
        completion = await _call()
    except RateLimitError:
        await asyncio.sleep(2)
        completion = await _call()

    raw = completion.choices[0].message.content
    return json.loads(_strip_fences(raw))
