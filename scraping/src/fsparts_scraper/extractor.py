import re
from bs4 import BeautifulSoup

from fsparts_scraper.crawler import parse_price_string

LOGO_PATTERNS = ["logo-final-de-fs", "/logo", "favicon"]


def extract_prices(html: str) -> dict[str, int | None]:
    """Extract tachado price (price_cop) and visible price (price_ws1) from HTML."""
    soup = BeautifulSoup(html, "html.parser")

    for tag in ("del", "s"):
        el = soup.find(tag, string=re.compile(r"CO\$"))
        if el:
            price_cop = parse_price_string(el.get_text())
            price_ws1 = _find_next_price(el, soup)
            return {"price_cop": price_cop, "price_ws1": price_ws1}

    prices_raw = re.findall(r"CO\$[\d,\.]+", soup.get_text())
    if len(prices_raw) >= 2:
        return {
            "price_cop": parse_price_string(prices_raw[0]),
            "price_ws1": parse_price_string(prices_raw[1]),
        }
    if len(prices_raw) == 1:
        return {"price_cop": None, "price_ws1": parse_price_string(prices_raw[0])}

    return {"price_cop": None, "price_ws1": None}


def _find_next_price(el, soup: BeautifulSoup) -> int | None:
    """Given a tachado element, find the next price in the document."""
    all_text = soup.get_text()
    tachado_text = el.get_text().strip()
    idx = all_text.find(tachado_text)
    if idx == -1:
        return None
    after = all_text[idx + len(tachado_text):]
    match = re.search(r"CO\$([\d,\.]+)", after)
    if match:
        return parse_price_string(f"CO${match.group(1)}")
    return None


def extract_images(html: str) -> list[str]:
    """Return deduplicated product image URLs, excluding logos and icons."""
    soup = BeautifulSoup(html, "html.parser")
    seen: set[str] = set()
    results: list[str] = []
    for img in soup.find_all("img"):
        src = img.get("src", "").strip()
        if not src or src in seen:
            continue
        if any(p in src for p in LOGO_PATTERNS):
            continue
        if not re.search(r"\.(jpg|jpeg|webp|png|gif)(\?|$)", src, re.IGNORECASE):
            if not src.startswith("http"):
                continue
        seen.add(src)
        results.append(src)
    return results


def clean_html(html: str) -> str:
    """Strip scripts, styles, nav, footer — keep only product body content."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return str(soup)


async def fetch_product_html(url: str) -> str:
    """Render a JS-heavy page with Playwright and return the full HTML."""
    import asyncio
    return await asyncio.to_thread(_fetch_sync, url)


def _fetch_sync(url: str) -> str:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="networkidle", timeout=30000)
        html = page.content()
        browser.close()
    return html
