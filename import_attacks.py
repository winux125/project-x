"""
Merge the base attack corpus with v2 extensions and programmatic transformations.

Usage examples:
  python import_attacks.py --add-v2 --out attacks_extended.json
  python import_attacks.py --add-v2 --transforms base64,rot13,leet --out attacks_extended.json
  python import_attacks.py --transforms persona,unicode_tag --out attacks_transformed.json
"""
import argparse
import json
from pathlib import Path

from transformations import TRANSFORMS, apply_all


def load_attacks_file(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description="Merge and transform attack corpora into a single extended file"
    )
    parser.add_argument("--base", default="attacks.json",
                        help="Base corpus (default: attacks.json)")
    parser.add_argument("--v2-file", default="attacks_v2.json",
                        help="Extended corpus file (default: attacks_v2.json)")
    parser.add_argument("--add-v2", action="store_true",
                        help="Include the v2 extension set")
    parser.add_argument(
        "--transforms",
        default="",
        help=f"Comma-separated transforms to apply to base (+v2): "
             f"{','.join(sorted(TRANSFORMS.keys()))}",
    )
    parser.add_argument("--out", default="attacks_extended.json",
                        help="Output file (default: attacks_extended.json)")
    args = parser.parse_args()

    base_data = load_attacks_file(args.base)
    base_attacks = list(base_data["attacks"])

    v2_attacks = []
    if args.add_v2:
        v2_attacks = load_attacks_file(args.v2_file).get("attacks", [])

    combined_sources = base_attacks + v2_attacks

    transforms = [t.strip() for t in args.transforms.split(",") if t.strip()]
    unknown = [t for t in transforms if t not in TRANSFORMS]
    if unknown:
        raise SystemExit(
            f"Unknown transform(s): {unknown}. Available: {sorted(TRANSFORMS.keys())}"
        )

    transformed = apply_all(combined_sources, transforms) if transforms else []

    result = {
        "version": "extended",
        "description": (
            f"Merged corpus: base={len(base_attacks)}, "
            f"v2={len(v2_attacks)}, transforms={len(transformed)}"
        ),
        "categories": base_data.get("categories", {}),
        "meta": {
            "base_count": len(base_attacks),
            "v2_count": len(v2_attacks),
            "transforms_applied": transforms,
            "transform_count": len(transformed),
        },
        "attacks": combined_sources + transformed,
    }

    Path(args.out).write_text(
        json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    total = len(result["attacks"])
    print(
        f"Wrote {args.out}: {len(base_attacks)} base"
        f" + {len(v2_attacks)} v2"
        f" + {len(transformed)} transforms"
        f" = {total} total attacks"
    )


if __name__ == "__main__":
    main()
