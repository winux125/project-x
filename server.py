"""
FastAPI server exposing the LLM Vulnerability Tester as an async SaaS API.

Clients POST their target LLM URL, headers, and model config. The server runs
the full attack suite asynchronously against the client's endpoint, tracks
session state in memory, and returns a report on demand.

Start with:  uvicorn server:app --reload --port 8000
"""
from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from evaluator import evaluate

DEFAULT_ATTACKS_PATH = Path(__file__).parent / "attacks.json"
THROTTLE_SECONDS = 0.3

app = FastAPI(title="LLM Vulnerability Tester API", version="1.0.0")

sessions: dict[str, dict[str, Any]] = {}


class StartRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_url: HttpUrl
    api_headers: dict[str, str] = Field(default_factory=dict)
    model_config_: dict[str, Any] = Field(alias="model_config")
    custom_dataset: list[dict[str, Any]] | None = None
    request_timeout_s: float = 60.0


class StartResponse(BaseModel):
    session_id: str
    message: str


class StopResponse(BaseModel):
    session_id: str
    status: str
    message: str


def extract_content(data: dict[str, Any]) -> str:
    """Auto-detect the LLM response schema and return the assistant text.

    Tries OpenAI / OpenRouter / vLLM / LiteLLM, then Ollama native, then Anthropic.
    """
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        pass
    try:
        return data["message"]["content"]
    except (KeyError, TypeError):
        pass
    try:
        return data["content"][0]["text"]
    except (KeyError, IndexError, TypeError):
        pass
    raise KeyError("unrecognized response schema")


def build_summary(results: list[dict[str, Any]]) -> dict[str, Any]:
    total = len(results)
    by_verdict = {"VULNERABLE": 0, "PARTIAL": 0, "SAFE": 0, "ERROR": 0}
    by_category: dict[str, dict[str, int]] = {}
    score_sum = 0.0

    for r in results:
        verdict = r.get("verdict", "ERROR")
        by_verdict[verdict] = by_verdict.get(verdict, 0) + 1
        cat = r.get("category", "UNKNOWN")
        by_category.setdefault(cat, {"VULNERABLE": 0, "PARTIAL": 0, "SAFE": 0, "ERROR": 0})
        by_category[cat][verdict] = by_category[cat].get(verdict, 0) + 1
        score_sum += float(r.get("score", 0.0) or 0.0)

    vuln_hits = by_verdict["VULNERABLE"] + by_verdict["PARTIAL"]
    return {
        "total": total,
        "by_verdict": by_verdict,
        "by_category": by_category,
        "avg_score": round(score_sum / total, 3) if total else 0.0,
        "vulnerability_rate": round(vuln_hits / total, 3) if total else 0.0,
    }


def load_default_attacks() -> list[dict[str, Any]]:
    with open(DEFAULT_ATTACKS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)["attacks"]


async def run_session(session_id: str, req: StartRequest) -> None:
    session = sessions[session_id]
    dataset = req.custom_dataset if req.custom_dataset else load_default_attacks()
    session["progress"]["total"] = len(dataset)
    model_name = req.model_config_.get("model", "unknown")
    target_url = str(req.target_url)

    try:
        async with httpx.AsyncClient(timeout=req.request_timeout_s) as client:
            for attack in dataset:
                payload = {
                    **req.model_config_,
                    "messages": [{"role": "user", "content": attack["prompt"]}],
                }

                response_text = ""
                error_str: str | None = None
                try:
                    resp = await client.post(
                        target_url,
                        json=payload,
                        headers=req.api_headers,
                    )
                    resp.raise_for_status()
                    response_text = extract_content(resp.json())
                except httpx.TimeoutException as exc:
                    error_str = f"timeout: {exc}"
                except httpx.HTTPStatusError as exc:
                    error_str = f"http {exc.response.status_code}: {exc.response.text[:200]}"
                except httpx.RequestError as exc:
                    error_str = f"request error: {exc}"
                except (KeyError, ValueError) as exc:
                    error_str = f"response parse error: {exc}"

                if error_str is None:
                    evaluation = evaluate(attack, response_text, use_llm_judge=False)
                else:
                    evaluation = {
                        "verdict": "ERROR",
                        "score": 0.0,
                        "matched_keywords": [],
                        "refused": False,
                        "confidence": 0.0,
                    }

                session["results"].append({
                    "attack_id": attack.get("id"),
                    "category": attack.get("category"),
                    "name": attack.get("name"),
                    "severity": attack.get("severity"),
                    "model": model_name,
                    "prompt": attack.get("prompt"),
                    "response": response_text,
                    "verdict": evaluation["verdict"],
                    "score": evaluation["score"],
                    "matched_keywords": evaluation["matched_keywords"],
                    "refused": evaluation["refused"],
                    "error": error_str,
                    "timestamp": datetime.now().isoformat(),
                })
                session["progress"]["current"] += 1

                await asyncio.sleep(THROTTLE_SECONDS)

        session["summary"] = build_summary(session["results"])
        session["status"] = "completed"
    except asyncio.CancelledError:
        if session["status"] == "running":
            session["status"] = "stopped"
        session["summary"] = build_summary(session["results"])
        raise
    except Exception as exc:
        session["status"] = "error"
        session["error"] = str(exc)
        session["summary"] = build_summary(session["results"])


def _public_session_view(session: dict[str, Any]) -> dict[str, Any]:
    return {
        "status": session["status"],
        "progress": session["progress"],
        "results": session["results"],
        "summary": session.get("summary"),
        "error": session.get("error"),
        "created_at": session.get("created_at"),
    }


@app.post("/api/start", response_model=StartResponse)
async def start_session(req: StartRequest) -> StartResponse:
    session_id = str(uuid.uuid4())

    try:
        initial_total = len(req.custom_dataset) if req.custom_dataset else len(load_default_attacks())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"failed to load default dataset: {exc}")

    sessions[session_id] = {
        "status": "running",
        "progress": {"current": 0, "total": initial_total},
        "results": [],
        "summary": None,
        "error": None,
        "created_at": datetime.now().isoformat(),
    }
    task = asyncio.create_task(run_session(session_id, req))
    sessions[session_id]["task"] = task

    return StartResponse(session_id=session_id, message="Test started asynchronously")


@app.get("/api/status/{session_id}")
async def get_status(session_id: str) -> dict[str, Any]:
    session = sessions.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return _public_session_view(session)


@app.post("/api/stop/{session_id}", response_model=StopResponse)
async def stop_session(session_id: str) -> StopResponse:
    session = sessions.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    if session["status"] != "running":
        return StopResponse(
            session_id=session_id,
            status=session["status"],
            message=f"session already {session['status']}",
        )

    task: asyncio.Task | None = session.get("task")
    if task and not task.done():
        task.cancel()
        try:
            await task
        except (asyncio.CancelledError, Exception):
            pass

    if session["status"] == "running":
        session["status"] = "stopped"

    return StopResponse(
        session_id=session_id,
        status=session["status"],
        message="session cancelled",
    )


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
