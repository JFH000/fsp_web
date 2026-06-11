import json
import pytest
from pathlib import Path
from fsparts_scraper import checkpoint as cp


@pytest.fixture(autouse=True)
def patch_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(cp, "CHECKPOINTS_DIR", tmp_path)


def test_save_creates_file():
    cp.save_checkpoint("DK-001", {"sku": "DK-001", "status": "extracted"})
    assert (Path(cp.CHECKPOINTS_DIR) / "DK-001.json").exists()


def test_load_returns_none_for_missing():
    assert cp.load_checkpoint("NONEXISTENT") is None


def test_save_and_load_roundtrip():
    data = {"sku": "DK-001", "name": "Test", "status": "extracted", "images": []}
    cp.save_checkpoint("DK-001", data)
    assert cp.load_checkpoint("DK-001") == data


def test_list_checkpoints_all():
    cp.save_checkpoint("A", {"sku": "A", "status": "extracted"})
    cp.save_checkpoint("B", {"sku": "B", "status": "upserted"})
    result = cp.list_checkpoints()
    skus = {c["sku"] for c in result}
    assert skus == {"A", "B"}


def test_list_checkpoints_by_status():
    cp.save_checkpoint("A", {"sku": "A", "status": "extracted"})
    cp.save_checkpoint("B", {"sku": "B", "status": "upserted"})
    result = cp.list_checkpoints(status="extracted")
    assert len(result) == 1
    assert result[0]["sku"] == "A"


def test_save_overwrites_existing():
    cp.save_checkpoint("X", {"sku": "X", "status": "extracted"})
    cp.save_checkpoint("X", {"sku": "X", "status": "upserted"})
    assert cp.load_checkpoint("X")["status"] == "upserted"
