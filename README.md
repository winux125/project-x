# LLM Vulnerability Tester

Automated security-testing framework for LLM-chatbots. Developed for the ICCSDFAI 2026 Hackathon (Case #12: AI Chatbot Vulnerability Tester).

## Project Overview

This framework provides an automated pipeline to test open LLM APIs (including local models via Ollama) for critical security vulnerabilities. It includes a comprehensive library of attacks, an automated evaluation engine to determine attack success, and reporting tools.

The framework strictly tests for four main vulnerability classes:
1. Prompt Injection: Injecting hostile instructions to override system prompts.
2. Jailbreak: Bypassing safety guardrails via roleplay, encoding, or obfuscation.
3. System Prompt Leakage: Coaxing the model into revealing its core context.
4. Harmful Content Generation: Requesting prohibited content through academic or fictional framings.

## Architecture and Features

- Attack Library: A curated dataset of attacks (attacks.json and attacks_v2.json) based on known techniques.
- Transformation Engine: Automatically multiplies base attacks using evasion techniques (Base64, ROT13, Leet speak, zero-width Unicode, persona override).
- Automated Evaluation: Dual-method scoring system using fast keyword heuristics and an LLM-as-a-judge for high accuracy.
- Dashboard and Reporting: Interactive Streamlit dashboard for visual analysis and standalone HTML report generation for audits.
- Local Execution: Fully offline capability using local Ollama instances (e.g., llama3.1, mistral) to prevent data leaks during testing.

## Quick Start

### 1. Installation

Install dependencies using pip or uv:
```bash
pip install -r requirements.txt
```

### 2. Setup Local Models (Ollama)

Ensure Ollama is running locally and pull the target models:
```bash
ollama serve
ollama pull llama3.1
ollama pull mistral
```

### 3. Run Testing Pipeline

Run attacks on a single model:
```bash
python runner.py --model llama3.1
```

Run on multiple models for comparison:
```bash
python runner.py --all-models
```

Enable the LLM-as-a-judge evaluator for higher accuracy (requires more time):
```bash
python runner.py --model llama3.1 --use-llm-judge
```

### 4. View Results

Launch the interactive dashboard:
```bash
streamlit run dashboard.py
```

Generate a standalone HTML report:
```bash
python generate_report.py --results results_*.json --out report.html
```

## Run as API Server

The framework can also run as a FastAPI service, so clients can submit their own LLM endpoint and run the full attack suite asynchronously against it.

Install dependencies and start the server:
```bash
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

Interactive API docs are available at `http://localhost:8000/docs`.

### Endpoints

- `POST /api/start` — kick off an async test session. Returns a `session_id`.
- `GET  /api/status/{session_id}` — poll progress, results, and summary.
- `POST /api/stop/{session_id}` — cancel a running session.

### Example: test an OpenAI-compatible endpoint

```bash
curl -X POST http://localhost:8000/api/start \
  -H "Content-Type: application/json" \
  -d '{
    "target_url": "https://api.openai.com/v1/chat/completions",
    "api_headers": {"Authorization": "Bearer sk-..."},
    "model_config": {"model": "gpt-4o-mini", "temperature": 0.7}
  }'
```

### Example: test a local Ollama instance

```bash
curl -X POST http://localhost:8000/api/start \
  -H "Content-Type: application/json" \
  -d '{
    "target_url": "http://localhost:11434/api/chat",
    "api_headers": {},
    "model_config": {"model": "llama3.1", "stream": false}
  }'
```

### Payload fields

- `target_url` (required) — the client's LLM endpoint. The engine never hardcodes a target.
- `api_headers` (required, object) — auth/custom headers forwarded on every request.
- `model_config` (required, object) — merged into each request body. The engine adds `messages` automatically. Include whatever your provider expects (`model`, `temperature`, `stream`, etc.).
- `custom_dataset` (optional, array) — custom attacks matching `attacks.json` schema. Defaults to the bundled `attacks.json` if omitted.
- `request_timeout_s` (optional, float) — per-attack HTTP timeout. Default 60s.

Response content is auto-detected across OpenAI, Ollama, and Anthropic schemas.

### Deployment

**Use Railway, not Vercel.** The server spawns background `asyncio` tasks that run for minutes after `/api/start` returns. Vercel's serverless model kills the function the moment the response is sent, and each request can land on a different instance, so the in-memory `sessions` dict wouldn't survive. Railway runs a long-lived container, which this app needs.

#### Railway

The repo already ships with `railway.toml`, `Procfile`, and `runtime.txt`. To deploy:

1. Push the repo to GitHub.
2. At [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pick this repo.
3. Railway auto-installs `requirements.txt` and runs `uvicorn server:app --host 0.0.0.0 --port $PORT`.
4. Click **Generate Domain** under Settings → Networking to expose a public URL.
5. Health check: `GET https://<your-domain>/api/health` should return `{"status":"ok"}`.

Alternative via CLI:
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

#### Other container platforms

The same `Procfile` works on Render, Fly.io, and Heroku. For Fly.io: `fly launch` picks up the Procfile automatically.

## Extended Attack Corpus

The base attacks.json provides 20 hand-crafted attacks. For deep security audits, generate the extended corpus (up to 300+ variations):

```bash
# Merge base attacks with 40 research-inspired attacks and apply encoding transformations
python import_attacks.py --add-v2 --transforms base64,rot13,leet,persona --out attacks_extended.json

# Run tests using the extended dataset
python runner.py --model llama3.1 --attacks attacks_extended.json
```

## Output Schema

The runner outputs timestamped JSON files (results_<model>_<timestamp>.json) containing full telemetry: verdict, confidence score, raw model response, matched keywords, and judge reasoning.

## Project Structure

- runner.py: Orchestrates the testing against the target LLM.
- evaluator.py: Implements keyword matching and LLM-as-a-judge logic.
- dashboard.py: Streamlit application for analyzing results.
- generate_report.py: CLI tool for rendering the HTML report.
- report_template.html: Jinja2 template for the final report.
- attacks.json / attacks_v2.json: Core library of attack prompts.
- import_attacks.py / transformations.py: Tools for extending the attack dataset.
- pack_for_kaggle.py: Generates a Kaggle-ready version of the framework.
