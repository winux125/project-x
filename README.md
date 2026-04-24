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
