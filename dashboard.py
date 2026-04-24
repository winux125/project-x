"""
Streamlit dashboard for LLM Vulnerability Tester results.
Run:  streamlit run dashboard.py
"""
import glob
import json
import os
import time
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

VERDICT_COLORS = {
    "VULNERABLE": "#ef4444",
    "PARTIAL": "#f59e0b",
    "SAFE": "#22c55e",
    "ERROR": "#64748b",
}

CATEGORIES = ["PROMPT_INJECTION", "JAILBREAK", "SYSTEM_LEAK", "HARMFUL_CONTENT"]
SEVERITY_ORDER = ["LOW", "MEDIUM", "HIGH"]

st.set_page_config(
    layout="wide",
    page_title="LLM Vuln Tester",
    page_icon="security",
)

st.markdown(
    """
    <style>
    .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.85em;
        color: white;
    }
    .badge-vuln { background-color: #ef4444; }
    .badge-partial { background-color: #f59e0b; }
    .badge-safe { background-color: #22c55e; }
    .badge-error { background-color: #64748b; }
    .sev-HIGH { color: #ef4444; font-weight: 700; }
    .sev-MEDIUM { color: #f59e0b; font-weight: 600; }
    .sev-LOW { color: #22c55e; font-weight: 500; }
    .top-card {
        background: #1e293b;
        padding: 12px;
        border-radius: 8px;
        border-left: 4px solid #ef4444;
        color: #e2e8f0;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


@st.cache_data(show_spinner=False)
def load_results(paths: tuple, reload_token: float) -> pd.DataFrame:
    rows = []
    for p in paths:
        try:
            with open(p, encoding="utf-8") as f:
                data = json.load(f)
        except Exception as exc:
            st.warning(f"Failed to load {p}: {exc}")
            continue
        run_at = data.get("meta", {}).get("run_at", "")
        for r in data.get("results", []):
            rows.append({**r, "source_file": os.path.basename(p), "run_at": run_at})
    return pd.DataFrame(rows)


def verdict_badge(verdict: str) -> str:
    cls = {
        "VULNERABLE": "badge-vuln",
        "PARTIAL": "badge-partial",
        "SAFE": "badge-safe",
        "ERROR": "badge-error",
    }.get(verdict, "badge-error")
    return f'<span class="badge {cls}">{verdict}</span>'


def generate_report_file(df: pd.DataFrame, out_path: str = "report.html") -> str:
    from generate_report import build_html_from_df

    build_html_from_df(df, out_path)
    return out_path


# --- Sidebar --------------------------------------------------------------
st.sidebar.title("LLM Vuln Tester")
st.sidebar.caption("ICCSDFAI 2026 — Case #12")

if "reload_token" not in st.session_state:
    st.session_state.reload_token = time.time()

local_files = sorted(glob.glob("results_*.json"), reverse=True)
selected_local = st.sidebar.multiselect(
    "Local result files", local_files, default=local_files[:1] if local_files else []
)
uploaded = st.sidebar.file_uploader(
    "Or upload result JSON", accept_multiple_files=True, type=["json"]
)

if st.sidebar.button("Refresh data"):
    st.session_state.reload_token = time.time()
    st.cache_data.clear()

paths = list(selected_local)
for up in uploaded or []:
    tmp_path = Path(".streamlit_tmp") / up.name
    tmp_path.parent.mkdir(exist_ok=True)
    tmp_path.write_bytes(up.getvalue())
    paths.append(str(tmp_path))

if not paths:
    st.title("LLM Vulnerability Tester — ICCSDFAI 2026")
    st.info("Select one or more `results_*.json` files in the sidebar to begin.")
    st.stop()

df = load_results(tuple(paths), st.session_state.reload_token)
if df.empty:
    st.error("Loaded files contain no results.")
    st.stop()

models = sorted(df["model"].dropna().unique().tolist())
cats = sorted(df["category"].dropna().unique().tolist())
sevs = sorted(df["severity"].dropna().unique().tolist(), key=lambda s: SEVERITY_ORDER.index(s) if s in SEVERITY_ORDER else -1)

sel_models = st.sidebar.multiselect("Model", models, default=models)
sel_cats = st.sidebar.multiselect("Category", cats, default=cats)
sel_sevs = st.sidebar.multiselect("Severity", sevs, default=sevs)

mask = (
    df["model"].isin(sel_models)
    & df["category"].isin(sel_cats)
    & df["severity"].isin(sel_sevs)
)
df = df[mask].copy()

st.sidebar.markdown("---")
if st.sidebar.button("Generate HTML Report", use_container_width=True):
    try:
        out = generate_report_file(df, "report.html")
        st.sidebar.success(f"Saved {out}")
        with open(out, "rb") as f:
            st.sidebar.download_button(
                "Download report.html",
                f,
                file_name="report.html",
                mime="text/html",
                use_container_width=True,
            )
    except Exception as exc:
        st.sidebar.error(f"Report failed: {exc}")


# --- Main -----------------------------------------------------------------
st.title("LLM Vulnerability Tester — ICCSDFAI 2026")
st.caption(
    f"Loaded {len(paths)} file(s) · {len(df)} attack results · "
    f"models: {', '.join(sel_models) or 'none'}"
)

total = len(df)
vulnerable = int((df["verdict"] == "VULNERABLE").sum())
safe = int((df["verdict"] == "SAFE").sum())
rate = (vulnerable / total * 100) if total else 0.0

c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Attacks", total)
c2.metric("Vulnerable", vulnerable)
c3.metric("Safe", safe)
c4.metric("Success Rate", f"{rate:.1f}%")

# Row 1: category bar + verdict pie
r1_left, r1_right = st.columns(2)
with r1_left:
    st.subheader("Vulnerability Rate by Category")
    cat_stats = (
        df.assign(vuln=(df["verdict"] == "VULNERABLE").astype(int))
        .groupby("category", as_index=False)
        .agg(rate=("vuln", "mean"), total=("vuln", "size"))
    )
    cat_stats["rate_pct"] = (cat_stats["rate"] * 100).round(1)
    if not cat_stats.empty:
        fig = px.bar(
            cat_stats,
            x="category",
            y="rate_pct",
            color="rate_pct",
            color_continuous_scale=["#22c55e", "#f59e0b", "#ef4444"],
            labels={"rate_pct": "Vuln %", "category": "Category"},
            range_color=[0, 100],
        )
        fig.update_layout(height=360, margin=dict(l=10, r=10, t=10, b=10))
        st.plotly_chart(fig, use_container_width=True)

with r1_right:
    st.subheader("Verdict Distribution")
    verdict_counts = df["verdict"].value_counts().reset_index()
    verdict_counts.columns = ["verdict", "count"]
    if not verdict_counts.empty:
        fig = px.pie(
            verdict_counts,
            names="verdict",
            values="count",
            color="verdict",
            color_discrete_map=VERDICT_COLORS,
            hole=0.4,
        )
        fig.update_layout(height=360, margin=dict(l=10, r=10, t=10, b=10))
        st.plotly_chart(fig, use_container_width=True)

# Row 2: model comparison (if 2+ models)
if df["model"].nunique() >= 2:
    st.subheader(f"Model Comparison: {' vs '.join(sorted(df['model'].unique()))}")
    comp = (
        df.assign(vuln=(df["verdict"] == "VULNERABLE").astype(int))
        .groupby(["category", "model"], as_index=False)
        .agg(rate=("vuln", "mean"))
    )
    comp["rate_pct"] = (comp["rate"] * 100).round(1)
    fig = px.bar(
        comp,
        x="category",
        y="rate_pct",
        color="model",
        barmode="group",
        labels={"rate_pct": "Vuln %", "category": "Category"},
    )
    fig.update_layout(height=360, margin=dict(l=10, r=10, t=10, b=10))
    st.plotly_chart(fig, use_container_width=True)

# Row 3: severity heatmap
st.subheader("Severity × Category Heatmap (Vulnerability Rate %)")
heat = (
    df.assign(vuln=(df["verdict"] == "VULNERABLE").astype(int))
    .groupby(["category", "severity"], as_index=False)
    .agg(rate=("vuln", "mean"))
)
if not heat.empty:
    pivot = (
        heat.pivot(index="category", columns="severity", values="rate")
        .reindex(columns=[s for s in SEVERITY_ORDER if s in heat["severity"].unique()])
        .fillna(0.0)
        * 100
    )
    fig = px.imshow(
        pivot.values,
        x=list(pivot.columns),
        y=list(pivot.index),
        color_continuous_scale=["#22c55e", "#f59e0b", "#ef4444"],
        zmin=0,
        zmax=100,
        aspect="auto",
        text_auto=".0f",
    )
    fig.update_layout(height=320, margin=dict(l=10, r=10, t=10, b=10))
    st.plotly_chart(fig, use_container_width=True)

# Row 4: full results table
st.subheader("Full Results")
display_cols = [
    "attack_id",
    "category",
    "name",
    "severity",
    "model",
    "verdict",
    "score",
    "matched_keywords",
]
table_df = df[display_cols].copy()
table_df["matched_keywords"] = table_df["matched_keywords"].apply(
    lambda xs: ", ".join(xs) if isinstance(xs, list) else str(xs)
)


def row_style(row):
    color = {
        "VULNERABLE": "rgba(239,68,68,0.15)",
        "PARTIAL": "rgba(245,158,11,0.15)",
        "SAFE": "rgba(34,197,94,0.15)",
        "ERROR": "rgba(100,116,139,0.15)",
    }.get(row["verdict"], "")
    return [f"background-color: {color}"] * len(row)


st.dataframe(
    table_df.style.apply(row_style, axis=1),
    use_container_width=True,
    height=380,
)

show_details = st.checkbox("Show per-attack details (expandable)", value=False)
if show_details:
    for _, r in df.iterrows():
        label = f"{r['attack_id']} · {r['model']} · {r['verdict']} — {r['name']}"
        with st.expander(label):
            st.markdown(verdict_badge(r["verdict"]), unsafe_allow_html=True)
            st.markdown(f"**Category:** {r['category']} · **Severity:** {r['severity']}")
            st.markdown("**Prompt:**")
            st.code(r["prompt"], language="text")
            st.markdown("**Model response:**")
            st.code(r["response"] or "(empty)", language="text")
            if r.get("matched_keywords"):
                st.markdown(f"**Matched keywords:** `{r['matched_keywords']}`")
            if r.get("judge_reason"):
                st.markdown(f"**LLM judge:** {r['judge_reason']}")

# Row 5: top 5 most vulnerable across models
st.subheader("Top 5 Most Vulnerable Attacks (across models)")
top = (
    df[df["verdict"] == "VULNERABLE"]
    .groupby(["attack_id", "name", "category", "severity"], as_index=False)
    .agg(models_pwned=("model", "nunique"), score=("score", "mean"))
    .sort_values(["models_pwned", "score"], ascending=False)
    .head(5)
)

if top.empty:
    st.info("No vulnerable attacks in the current filter.")
else:
    cols = st.columns(len(top))
    for col, (_, row) in zip(cols, top.iterrows()):
        sev_cls = f"sev-{row['severity']}"
        col.markdown(
            f"""
            <div class="top-card">
              <div style="font-weight:700;font-size:1.05em">{row['attack_id']}</div>
              <div style="color:#cbd5e1;font-size:0.9em">{row['name']}</div>
              <hr style="border-color:#334155;margin:6px 0">
              <div>Category: <b>{row['category']}</b></div>
              <div>Severity: <span class="{sev_cls}">{row['severity']}</span></div>
              <div>Models pwned: <b>{row['models_pwned']}</b></div>
              <div>Avg score: <b>{row['score']:.2f}</b></div>
            </div>
            """,
            unsafe_allow_html=True,
        )
