"""Equivalent to notebooks/00_inspect.ipynb — runs outside Jupyter to avoid Windows event-loop issues."""
import asyncio
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env.local")

from fsparts_scraper.crawler import (
    fetch_sitemap, parse_sitemap_xml, filter_product_urls, KNOWN_CATEGORY_SLUGS,
)
from fsparts_scraper.extractor import fetch_product_html, extract_prices, extract_images, clean_html
from fsparts_scraper.llm import get_client, extract_product_data


async def main() -> None:
    llm_client = get_client()
    print("NVIDIA NIM client ready")

    # --- Cell 2: discover URLs ---
    xml = fetch_sitemap()
    all_urls = parse_sitemap_xml(xml)
    product_urls = filter_product_urls(all_urls, KNOWN_CATEGORY_SLUGS)
    print(f"Total sitemap URLs: {len(all_urls)}")
    print(f"Product URLs after filtering: {len(product_urls)}")
    sample = random.sample(product_urls, min(5, len(product_urls)))
    for u in sample:
        print(" ", u)

    # --- Cell 3: inspect one product ---
    url = sample[0]
    print(f"\nInspecting: {url}\n")
    html = await fetch_product_html(url)
    prices = extract_prices(html)
    images = extract_images(html)
    cleaned = clean_html(html)

    print("=== PRICES ===")
    print(prices)
    print("\n=== IMAGES ===")
    for img in images:
        print(" ", img)
    print("\n=== LLM EXTRACTION ===")
    data = extract_product_data(cleaned, client=llm_client)
    print(json.dumps(data, ensure_ascii=False, indent=2))

    # --- Cell 4: run all 5 samples ---
    print("\n" + "=" * 60)
    print("RUNNING ALL 5 SAMPLES")
    print("=" * 60)
    results = []
    for u in sample:
        print(f"\n--- {u.split('/')[-1]} ---")
        h = await fetch_product_html(u)
        p = extract_prices(h)
        imgs = extract_images(h)
        llm_data = extract_product_data(clean_html(h), client=llm_client)
        if llm_data:
            llm_data.update(p)
            llm_data["image_urls_original"] = imgs
            llm_data["source_url"] = u
        results.append({"url": u, "prices": p, "images_count": len(imgs), "llm": llm_data})
        sku = llm_data.get("sku") if llm_data else "FAILED"
        print(f"  prices: {p} | images: {len(imgs)} | sku: {sku}")

    succeeded = sum(1 for r in results if r["llm"])
    print(f"\n{succeeded} / {len(results)} extractions succeeded")


if __name__ == "__main__":
    asyncio.run(main())
