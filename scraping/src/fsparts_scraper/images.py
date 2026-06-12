import io
import os
import re
import uuid
from pathlib import Path

import httpx
from PIL import Image

IMAGES_DIR = Path(__file__).parent.parent.parent / "data" / "images"
BUCKET = "product-images"


def _safe_dirname(sku: str) -> str:
    return re.sub(r'[/\\:*?"<>|]', lambda m: f"%{ord(m.group()):02X}", sku)


def download_image(url: str, sku: str, index: int, base_dir: Path = IMAGES_DIR) -> Path | None:
    """Download and convert a product image to WebP at data/images/<sku>/<index>.webp."""
    dest_dir = base_dir / _safe_dirname(sku)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{index}.webp"
    if dest.exists():
        return dest
    try:
        response = httpx.get(url, timeout=30, follow_redirects=True)
        response.raise_for_status()
        img = Image.open(io.BytesIO(response.content))
        if img.mode == "P":
            img = img.convert("RGBA")
        if img.mode in ("RGBA", "LA"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1])
            img = bg
        else:
            img = img.convert("RGB")
        img.save(dest, "WEBP", quality=85)
        return dest
    except Exception as e:
        print(f"  [images] failed to download {url}: {e}")
        return None


def upload_image(local_path: Path, product_uid: str, image_uid: str, sb) -> str | None:
    """Upload a local WebP image to Supabase Storage. Returns public URL or None."""
    storage_path = f"products/{product_uid}/{image_uid}.webp"
    try:
        with open(local_path, "rb") as f:
            sb.storage.from_(BUCKET).upload(
                path=storage_path,
                file=f,
                file_options={"content-type": "image/webp", "upsert": "true"},
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
    product_uid = str(uuid.uuid4())
    public_urls: list[str] = []

    for i, url in enumerate(checkpoint.get("image_urls_original", [])):
        local_path = download_image(url, sku, i, base_dir)
        if local_path is None:
            continue
        image_uid = str(uuid.uuid4())
        public_url = upload_image(local_path, product_uid, image_uid, sb)
        if public_url:
            public_urls.append(public_url)

    return public_urls
