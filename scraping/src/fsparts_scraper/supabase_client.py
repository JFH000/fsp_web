import os
import re
import unicodedata

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


def get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_KEY"]
    return create_client(url, key)


def make_slug(name: str) -> str:
    """Convert a product name to a URL slug."""
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s-]", "-", name)
    name = re.sub(r"[\s-]+", "-", name)
    return name.strip("-")


def upsert_product(checkpoint: dict, sb: Client | None = None) -> None:
    """Upsert a product into Supabase using sku as the conflict key."""
    if sb is None:
        sb = get_client()

    payload = {
        "sku":             checkpoint["sku"],
        "name":            checkpoint["name"],
        "slug":            make_slug(f"{checkpoint.get('name') or checkpoint['sku']} {checkpoint['sku']}"),
        "description":     checkpoint.get("description") or "",
        "price_cop":       checkpoint.get("price_cop"),
        "price_ws1":       checkpoint.get("price_ws1"),
        "brand_id":        checkpoint.get("brand_id"),
        "product_line_id": checkpoint.get("product_line_id"),
        "specs":           checkpoint.get("specs") or [],
        "refrigerants":    checkpoint.get("refrigerants") or [],
        "images":          checkpoint.get("images") or [],
        "stock":           0,
    }

    sb.table("products").upsert(payload, on_conflict="sku").execute()
