import os
import re
from pathlib import Path

import httpx

IMAGES_DIR = Path(__file__).parent.parent.parent / "data" / "images"
BUCKET = "product-images"


def download_image(url: str, sku: str, index: int, base_dir: Path = IMAGES_DIR) -> Path | None:
    """Download a single image to data/images/<sku>/<index>.ext. Returns path or None on failure."""
    dest_dir = base_dir / sku
    dest_dir.mkdir(parents=True, exist_ok=True)
    ext = _extension_from_url(url)
    dest = dest_dir / f"{index}{ext}"
    if dest.exists():
        return dest
    try:
        response = httpx.get(url, timeout=30, follow_redirects=True)
        response.raise_for_status()
        dest.write_bytes(response.content)
        return dest
    except Exception as e:
        print(f"  [images] failed to download {url}: {e}")
        return None


def upload_image(local_path: Path, sku: str, index: int, sb) -> str | None:
    """Upload a local image file to Supabase Storage. Returns public URL or None."""
    storage_path = f"products/{sku}/{local_path.name}"
    try:
        with open(local_path, "rb") as f:
            sb.storage.from_(BUCKET).upload(
                path=storage_path,
                file=f,
                file_options={"upsert": "true"},
            )
        return sb.storage.from_(BUCKET).get_public_url(storage_path)
    except Exception as e:
        print(f"  [images] failed to upload {local_path}: {e}")
        return None


def process_product_images(
    checkpoint: dict,
    sb,
    base_dir: Path = IMAGES_DIR,
) -> list[str]:
    """Download all product images and upload to Supabase Storage. Returns list of public URLs."""
    sku = checkpoint["sku"]
    public_urls: list[str] = []

    for i, url in enumerate(checkpoint.get("image_urls_original", [])):
        local_path = download_image(url, sku, i, base_dir)
        if local_path is None:
            continue
        public_url = upload_image(local_path, sku, i, sb)
        if public_url:
            public_urls.append(public_url)

    return public_urls


def _extension_from_url(url: str) -> str:
    match = re.search(r"\.(jpg|jpeg|webp|png|gif)", url, re.IGNORECASE)
    return f".{match.group(1).lower()}" if match else ".jpg"
