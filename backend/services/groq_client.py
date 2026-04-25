import asyncio
import json
import os
import re

from fastapi import HTTPException
from openai import AsyncOpenAI, RateLimitError

from models.schemas import ChatResponse
from services.prompts import ASSESSMENT_SYSTEM_PROMPT, INTERVIEWER_SYSTEM_PROMPT

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
    payload = [{"role": "system", "content": INTERVIEWER_SYSTEM_PROMPT}] + last_four

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
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")

    reply = completion.choices[0].message.content.strip()
    should_end = (turn_count + 1) >= _MAX_TURNS
    return ChatResponse(reply=reply, should_end=should_end)


async def get_assessment(transcript: list) -> dict:
    client = _client()
    transcript_text = "\n".join(
        f"{_to_dict(m)['role'].upper()}: {_to_dict(m)['content']}" for m in transcript
    )
    payload = [
        {"role": "system", "content": ASSESSMENT_SYSTEM_PROMPT},
        {"role": "user", "content": f"Interview transcript:\n\n{transcript_text}"},
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
        try:
            completion = await _call()
        except RateLimitError:
            raise HTTPException(status_code=429, detail="Rate limit reached. Please wait a moment.")
        except Exception:
            raise HTTPException(status_code=500, detail="Assessment generation failed. Please contact support.")
    except Exception:
        raise HTTPException(status_code=500, detail="Assessment generation failed. Please contact support.")

    raw = completion.choices[0].message.content
    cleaned = _strip_fences(raw)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # One retry with a maximally strict follow-up prompt
        strict_payload = payload + [
            {"role": "assistant", "content": raw},
            {
                "role": "user",
                "content": "Return ONLY the JSON object. No markdown, no explanation, no text before or after.",
            },
        ]
        try:
            retry = await client.chat.completions.create(
                model=_MODEL, messages=strict_payload, max_tokens=800
            )
            return json.loads(_strip_fences(retry.choices[0].message.content))
        except Exception:
            raise HTTPException(
                status_code=500, detail="Assessment generation failed. Please contact support."
            )
