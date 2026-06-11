import json
from pathlib import Path

CHECKPOINTS_DIR = Path(__file__).parent.parent.parent / "data" / "checkpoints"


def save_checkpoint(sku: str, data: dict) -> None:
    CHECKPOINTS_DIR.mkdir(parents=True, exist_ok=True)
    path = Path(CHECKPOINTS_DIR) / f"{sku}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def load_checkpoint(sku: str) -> dict | None:
    path = Path(CHECKPOINTS_DIR) / f"{sku}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def list_checkpoints(status: str | None = None) -> list[dict]:
    results = []
    for f in Path(CHECKPOINTS_DIR).glob("*.json"):
        data = json.loads(f.read_text(encoding="utf-8"))
        if status is None or data.get("status") == status:
            results.append(data)
    return results
