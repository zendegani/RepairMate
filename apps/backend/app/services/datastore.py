"""Cached loader for the mock JSON data the agent pipeline reads from."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


@lru_cache(maxsize=None)
def load(name: str) -> dict[str, Any]:
    with (DATA_DIR / f"{name}.json").open(encoding="utf-8") as handle:
        return json.load(handle)
