"""
Attack Runner — AI Chatbot Vulnerability Tester
ICCSDFAI 2026 Hackathon | Case #12

Usage:
  python runner.py --model llama3.1
  python runner.py --model llama3.1 --category JAILBREAK --verbose
  python runner.py --all-models --use-llm-judge
"""
import json
import time
import argparse
import sys
from datetime import datetime

import requests
from tqdm import tqdm
from rich.console import Console
from rich.table import Table

from evaluator import evaluate

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"

CATEGORIES = {"PROMPT_INJECTION", "JAILBREAK", "SYSTEM_LEAK", "HARMFUL_CONTENT", "ALL"}

console = Console()


def load_attacks(path: str) -> list:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data["attacks"]


def check_ollama_alive():
    try:
        resp = requests.get(OLLAMA_TAGS_URL, timeout=5)
        resp.raise_for_status()
    except requests.exceptions.RequestException:
        console.print(
            "[bold red]ERROR:[/bold red] Ollama is not running. "
            "Start it with: [cyan]ollama serve[/cyan]"
        )
        sys.exit(1)


def send_attack(prompt: str, model: str, system_prompt: str = None) -> dict:
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": 0.7},
    }

    last_error = None
    for attempt in range(2):
        try:
            resp = requests.post(OLLAMA_URL, json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            return {
                "success": True,
                "response": data["message"]["content"],
                "error": None,
            }
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as exc:
            last_error = str(exc)
            if attempt == 0:
                time.sleep(3)
                continue
        except Exception as exc:
            last_error = str(exc)
            break

    return {"success": False, "response": "", "error": last_error}


def run_all(
    attacks: list,
    model: str,
    system_prompt: str = None,
    use_llm_judge: bool = False,
    verbose: bool = False,
) -> list:
    results = []
    total = len(attacks)
    console.print(f"\n[bold cyan]Running {total} attacks on model:[/bold cyan] {model}")

    iterator = tqdm(attacks, desc=f"{model}", unit="attack", leave=True)
    for attack in iterator:
        iterator.set_postfix_str(attack["id"])
        result = send_attack(attack["prompt"], model, system_prompt)

        if result["success"]:
            evaluation = evaluate(attack, result["response"], use_llm_judge=use_llm_judge)
        else:
            evaluation = {
                "verdict": "ERROR",
                "score": 0.0,
                "matched_keywords": [],
                "refused": False,
                "confidence": 0.0,
            }

        if verbose:
            preview_verbose = result['response'].encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8')
            tqdm.write(f"\n[{attack['id']}] {attack['name']} → {evaluation['verdict']}")
            tqdm.write(f"  Response: {preview_verbose}")
        else:
            preview = result["response"][:200].replace("\n", " ")
            preview = preview.encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8')
            tqdm.write(
                f"  [{attack['id']}] {evaluation['verdict']:<10} "
                f"matched={evaluation['matched_keywords']} "
                f"| {preview}{'...' if len(result['response']) > 200 else ''}"
            )

        results.append(
            {
                "attack_id": attack["id"],
                "category": attack["category"],
                "name": attack["name"],
                "severity": attack["severity"],
                "model": model,
                "prompt": attack["prompt"],
                "response": result["response"],
                "verdict": evaluation["verdict"],
                "score": evaluation["score"],
                "matched_keywords": evaluation["matched_keywords"],
                "refused": evaluation["refused"],
                "error": result["error"],
                "judge_verdict": evaluation.get("judge_verdict"),
                "judge_reason": evaluation.get("judge_reason"),
                "judge_confidence": evaluation.get("judge_confidence"),
                "timestamp": datetime.now().isoformat(),
            }
        )

        time.sleep(0.3)

    return results


def print_summary(results: list, model: str):
    total = len(results)
    if total == 0:
        return

    verdict_style = {
        "VULNERABLE": "bold red",
        "PARTIAL": "bold yellow",
        "SAFE": "bold green",
        "ERROR": "dim white",
    }

    table = Table(
        title=f"Results — {model}",
        title_style="bold cyan",
        header_style="bold white on blue",
        show_lines=False,
    )
    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Category", style="magenta")
    table.add_column("Name", overflow="fold")
    table.add_column("Severity", justify="center")
    table.add_column("Verdict", justify="center")

    for r in results:
        style = verdict_style.get(r["verdict"], "white")
        table.add_row(
            r["attack_id"],
            r["category"],
            r["name"],
            r["severity"],
            f"[{style}]{r['verdict']}[/{style}]",
        )

    console.print(table)

    by_verdict = {}
    for r in results:
        by_verdict[r["verdict"]] = by_verdict.get(r["verdict"], 0) + 1

    vulnerable = by_verdict.get("VULNERABLE", 0)
    partial = by_verdict.get("PARTIAL", 0)
    safe = by_verdict.get("SAFE", 0)
    errors = by_verdict.get("ERROR", 0)
    pct = 100 * vulnerable // total if total else 0

    console.print(
        f"\n[bold]Summary[/bold] — total={total}  "
        f"[red]VULNERABLE={vulnerable} ({pct}%)[/red]  "
        f"[yellow]PARTIAL={partial}[/yellow]  "
        f"[green]SAFE={safe}[/green]  "
        f"[dim]ERROR={errors}[/dim]"
    )

    by_cat = {}
    for r in results:
        cat = r["category"]
        slot = by_cat.setdefault(cat, {"total": 0, "vulnerable": 0})
        slot["total"] += 1
        if r["verdict"] == "VULNERABLE":
            slot["vulnerable"] += 1

    console.print("\n[bold]By category:[/bold]")
    for cat, stats in by_cat.items():
        cat_pct = 100 * stats["vulnerable"] // stats["total"] if stats["total"] else 0
        bar = "#" * (cat_pct // 10) + "-" * (10 - cat_pct // 10)
        color = "red" if cat_pct >= 50 else "yellow" if cat_pct >= 20 else "green"
        console.print(f"  {cat:<22} [{color}][{bar}] {cat_pct}%[/{color}]")


def default_out_name(model: str) -> str:
    slug = model.replace(":", "_").replace(".", "_").replace("/", "_")
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"results_{slug}_{stamp}.json"


def main():
    parser = argparse.ArgumentParser(description="LLM Vulnerability Tester")
    parser.add_argument("--model", default="llama3.1", help="Ollama model name")
    parser.add_argument("--attacks", default="attacks.json", help="Path to attacks JSON")
    parser.add_argument(
        "--out",
        default=None,
        help="Output results file (default: results_<model>_<timestamp>.json)",
    )
    parser.add_argument("--system", default=None, help="Custom system prompt for target")
    parser.add_argument(
        "--all-models", action="store_true", help="Run on llama3.1 AND mistral"
    )
    parser.add_argument(
        "--category",
        default="ALL",
        choices=sorted(CATEGORIES),
        help="Filter attacks by category",
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Print full model response"
    )
    parser.add_argument(
        "--use-llm-judge",
        action="store_true",
        help="Also use LLM-as-judge (slower, more accurate)",
    )
    args = parser.parse_args()

    check_ollama_alive()

    attacks = load_attacks(args.attacks)
    if args.category != "ALL":
        attacks = [a for a in attacks if a["category"] == args.category]
        console.print(
            f"[yellow]Filtered to {len(attacks)} attacks in category {args.category}[/yellow]"
        )
    if not attacks:
        console.print("[red]No attacks selected. Exiting.[/red]")
        sys.exit(0)

    out_path = args.out or default_out_name(
        "multi" if args.all_models else args.model
    )
    models = ["llama3.1", "mistral"] if args.all_models else [args.model]
    
    all_results = []
    for model in models:
        results = run_all(
            attacks,
            model,
            system_prompt=args.system,
            use_llm_judge=args.use_llm_judge,
            verbose=args.verbose,
        )
        all_results.extend(results)
        
        # Save incrementally after each model to prevent data loss on print errors
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "meta": {
                        "run_at": datetime.now().isoformat(),
                        "total_attacks": len(attacks),
                        "models_tested": models,
                        "category_filter": args.category,
                        "llm_judge": args.use_llm_judge,
                    },
                    "results": all_results,
                },
                f,
                indent=2,
                ensure_ascii=False,
            )
            
        print_summary(results, model)

    console.print(f"\n[bold green]Results saved to:[/bold green] {out_path}")


if __name__ == "__main__":
    main()
