"""
Render a self-contained HTML report from one or more results JSON files.

Usage:
  python generate_report.py --results results_*.json --out report.html
"""
import argparse
import glob
import json
from datetime import datetime
from pathlib import Path

import pandas as pd
from jinja2 import Environment, FileSystemLoader, select_autoescape

TEMPLATE_NAME = "report_template.html"

CATEGORY_COLOR = {
    0: "#22c55e",
    30: "#84cc16",
    50: "#f59e0b",
    70: "#ef4444",
}


def _load_many(paths: list) -> pd.DataFrame:
    rows = []
    for p in paths:
        with open(p, encoding="utf-8") as f:
            data = json.load(f)
        for r in data.get("results", []):
            rows.append(r)
    if not rows:
        raise SystemExit("No results found in the provided files.")
    df = pd.DataFrame(rows)
    return df.drop_duplicates(subset=["attack_id", "model"], keep="last")


def _pick_bar_color(pct: float) -> str:
    if pct >= 70:
        return "#ef4444"
    if pct >= 40:
        return "#f59e0b"
    if pct >= 15:
        return "#eab308"
    return "#22c55e"


def _aggregate(df: pd.DataFrame) -> dict:
    models = sorted(df["model"].dropna().unique().tolist())
    total = len(df)
    vulnerable = int((df["verdict"] == "VULNERABLE").sum())
    partial = int((df["verdict"] == "PARTIAL").sum())
    safe = int((df["verdict"] == "SAFE").sum())
    rate_pct = round(vulnerable / total * 100, 1) if total else 0.0

    # Category bars
    category_bars = []
    df_v = df.assign(vuln=(df["verdict"] == "VULNERABLE").astype(int))
    grouped = df_v.groupby("category").agg(vuln=("vuln", "sum"), total=("vuln", "size")).reset_index()
    for _, row in grouped.iterrows():
        pct = round(row["vuln"] / row["total"] * 100, 1) if row["total"] else 0.0
        category_bars.append(
            {
                "category": row["category"],
                "pct": pct,
                "width_pct": min(100.0, pct),
                "vuln": int(row["vuln"]),
                "total": int(row["total"]),
                "color": _pick_bar_color(pct),
            }
        )

    # Model comparison
    model_comparison = []
    if len(models) >= 2:
        for cat in sorted(df["category"].unique()):
            sub = df_v[df_v["category"] == cat]
            per_model = {}
            for m in models:
                mrows = sub[sub["model"] == m]
                mtotal = len(mrows)
                mvuln = int(mrows["vuln"].sum()) if mtotal else 0
                mpct = round(mvuln / mtotal * 100, 1) if mtotal else 0.0
                per_model[m] = {"vuln": mvuln, "total": mtotal, "pct": mpct}
            model_comparison.append({"category": cat, "per_model": per_model})

    # Findings (keep manageable)
    findings = []
    for _, r in df.sort_values(
        by=["verdict", "severity"],
        key=lambda s: s.map({"VULNERABLE": 0, "PARTIAL": 1, "SAFE": 2, "ERROR": 3, "HIGH": 0, "MEDIUM": 1, "LOW": 2}),
    ).iterrows():
        findings.append(
            {
                "attack_id": r["attack_id"],
                "category": r["category"],
                "name": r["name"],
                "severity": r["severity"],
                "model": r["model"],
                "verdict": r["verdict"],
                "matched_keywords": r.get("matched_keywords") or [],
            }
        )

    # High severity vulnerabilities
    high_sev_vulns = []
    hs = df[(df["verdict"] == "VULNERABLE") & (df["severity"] == "HIGH")]
    for _, r in hs.iterrows():
        resp = r.get("response") or ""
        excerpt = resp[:200] + ("..." if len(resp) > 200 else "")
        high_sev_vulns.append(
            {
                "attack_id": r["attack_id"],
                "name": r["name"],
                "category": r["category"],
                "model": r["model"],
                "score": r.get("score"),
                "prompt": r.get("prompt", ""),
                "response_excerpt": excerpt,
                "matched_keywords": r.get("matched_keywords") or [],
            }
        )

    return {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "models": models,
        "totals": {
            "total": total,
            "vulnerable": vulnerable,
            "partial": partial,
            "safe": safe,
            "rate_pct": rate_pct,
        },
        "category_bars": category_bars,
        "model_comparison": model_comparison,
        "findings": findings,
        "high_sev_vulns": high_sev_vulns,
    }


def _render(context: dict) -> str:
    template_dir = Path(__file__).parent
    env = Environment(
        loader=FileSystemLoader(str(template_dir)),
        autoescape=select_autoescape(["html", "xml"]),
    )
    template = env.get_template(TEMPLATE_NAME)
    return template.render(**context)


def build_html(results_files: list, out_path: str = "report.html") -> str:
    df = _load_many(list(results_files))
    context = _aggregate(df)
    html = _render(context)
    Path(out_path).write_text(html, encoding="utf-8")
    return out_path


def build_html_from_df(df: pd.DataFrame, out_path: str = "report.html") -> str:
    context = _aggregate(df)
    html = _render(context)
    Path(out_path).write_text(html, encoding="utf-8")
    return out_path


def main():
    parser = argparse.ArgumentParser(description="Generate HTML vulnerability report")
    parser.add_argument(
        "--results", nargs="+", required=True,
        help="One or more results JSON files (globs allowed)",
    )
    parser.add_argument("--out", default="report.html", help="Output HTML path")
    args = parser.parse_args()

    expanded = []
    for pattern in args.results:
        matches = glob.glob(pattern)
        expanded.extend(matches or [pattern])

    out = build_html(expanded, args.out)
    print(f"Report saved to {out} — open in browser")


if __name__ == "__main__":
    main()
