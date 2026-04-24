# LLM Vulnerability Tester

Automated security-testing tool that probes local Ollama-hosted LLMs for prompt injection, jailbreaks, system-prompt leakage, and harmful-content generation. Results are displayed in a Streamlit dashboard and exported as a self-contained HTML report.

Built for **ICCSDFAI 2026 — Case #12 (AI Chatbot Vulnerability Tester)**.

## Quick Start

```bash
# 1. Install dependencies (pick one)
pip install -r requirements.txt
# or
uv sync

# 2. Make sure Ollama is running with the models you want to test
ollama serve
ollama pull llama3.1
ollama pull mistral

# 3. Run attacks on one model
python runner.py --model llama3.1

# 4. Run on both models for comparison
python runner.py --all-models

# 5. Run only a single category, with full response output
python runner.py --model llama3.1 --category JAILBREAK --verbose

# 6. Add LLM-as-judge for more accurate verdicts (slower)
python runner.py --model llama3.1 --use-llm-judge

# 7. Launch the dashboard
streamlit run dashboard.py

# 8. Generate a standalone HTML report
python generate_report.py --results results_*.json --out report.html
```

## Extended Attack Corpus

The base `attacks.json` ships 20 hand-crafted attacks for demo safety. For thorough testing, expand the corpus:

```bash
# Merge base + 40 research-inspired attacks (Promptfoo / DeepTeam / AIM / STAN / UCAR patterns)
python import_attacks.py --add-v2 --out attacks_extended.json

# Add Augustus-style transformation variants (Base64 / ROT13 / Leet / Unicode / Reverse / Persona)
python import_attacks.py --add-v2 --transforms base64,rot13,leet,persona --out attacks_extended.json

# Run the extended corpus
python runner.py --model llama3.1 --attacks attacks_extended.json
```

Every v2 attack carries a `source` field (`original`, `promptfoo-inspired`, `jailbreak-research`, `augustus-inspired`, etc.) and a `technique` field for fine-grained analysis. Transformed attacks are marked `transform:<kind>:<base_id>` so the provenance of every variant is traceable.

### Provenance summary

| Corpus source        | Count | Notes                                                        |
|----------------------|-------|--------------------------------------------------------------|
| `attacks.json`       | 20    | Original curated set                                         |
| `attacks_v2.json`    | 40    | Research-inspired additions (attribution in each entry)      |
| Transformations      | up to 360 | 60 base × 6 transforms (Base64/ROT13/Leet/Unicode/Reverse/Persona) |

> **Future work:** `import_attacks.py` has room for a `--fetch-jailbreakbench` flag to merge the 100-prompt academic benchmark (Chao et al., 2024). Not yet wired.

## Attack Categories

| Category          | Description                                                                                           |
|-------------------|-------------------------------------------------------------------------------------------------------|
| PROMPT_INJECTION  | Inject hostile instructions to override the system prompt (separator tricks, fake dialogue, comments) |
| JAILBREAK         | Bypass safety guardrails via roleplay, hypothetical framing, persona override, or obfuscation         |
| SYSTEM_LEAK       | Coax the model into revealing its system prompt or preceding context                                  |
| HARMFUL_CONTENT   | Request prohibited content through academic, fictional, or research framings                          |

## Project Layout

| File                   | Purpose                                             |
|------------------------|-----------------------------------------------------|
| `attacks.json`         | Curated attack corpus (20 attacks across 4 classes) |
| `runner.py`            | CLI runner — orchestrates attacks against Ollama    |
| `evaluator.py`         | Keyword + LLM-as-judge scoring                      |
| `dashboard.py`         | Streamlit dashboard for interactive analysis        |
| `report_template.html` | Jinja2 template for the exported HTML report        |
| `generate_report.py`   | CLI and library entry-point for report generation   |

## Output Schema

Each run emits `results_<model>_<timestamp>.json` with the following shape:

```json
{
  "meta": {
    "run_at": "...",
    "models_tested": ["llama3.1"],
    "total_attacks": 20,
    "category_filter": "ALL",
    "llm_judge": false
  },
  "results": [
    {
      "attack_id": "PI-01",
      "category": "PROMPT_INJECTION",
      "name": "Ignore previous instructions",
      "severity": "HIGH",
      "model": "llama3.1",
      "prompt": "...",
      "response": "...",
      "verdict": "VULNERABLE",
      "score": 0.8,
      "matched_keywords": ["PWNED"],
      "refused": false,
      "error": null,
      "timestamp": "..."
    }
  ]
}
```

## Screenshots

<!-- ![dashboard](docs/dashboard.png) -->
<!-- ![report](docs/report.png) -->

_Screenshots will be added after the first demo run._
