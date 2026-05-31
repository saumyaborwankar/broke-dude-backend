#!/usr/bin/env python3
"""Extract transaction rows from a PDF using pdfplumber's text lines."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber


def extract_transactions(pdf_path: str) -> list[dict]:
    rows: list[dict] = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            lines = page.extract_text_lines()
            if not lines:
                continue

            for line_data in lines:
                text = line_data["text"].strip()
                if not text:
                    continue

                trans = _try_parse_transaction(text)
                if trans:
                    rows.append(trans)

    return rows


# Matches lines like: "03/28 HEYTEA-Natick Mall Boston MA 19.87"
# or: "04/17 Payment Thank You-Mobile -1,994.79"
_TRANSACTION_RE = re.compile(
    r"^(\d{2}/\d{2})\s+"      # date  MM/DD
    r"(.+?)"                   # description (lazy)
    r"\s+"                     # separator
    r"(-?\d{1,3}(?:,\d{3})*(?:\.\d{2}))\s*$"  # amount at end
)


def _try_parse_transaction(text: str) -> dict | None:
    match = _TRANSACTION_RE.match(text)
    if not match:
        return None

    date_part = match.group(1)
    description = match.group(2).strip()
    amount_raw = match.group(3)

    amount = _parse_amount(amount_raw)

    if not description:
        return None

    return {
        "description": description,
        "amount": amount,
        "date": date_part,
    }


def _parse_amount(raw: str) -> float:
    cleaned = raw.replace(",", "").replace("$", "").replace(" ", "").replace("\xa0", "")
    sign = -1 if cleaned.startswith("-") or cleaned.startswith("(") else 1
    cleaned = cleaned.lstrip("-(").rstrip(")")
    try:
        return sign * float(cleaned)
    except ValueError:
        return 0.0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: extract_tables.py <pdf_path>"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    if not Path(pdf_path).exists():
        print(json.dumps({"error": f"File not found: {pdf_path}"}))
        sys.exit(1)

    try:
        result = extract_transactions(pdf_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
