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
    """Strip scripts/styles/nav, return plain text — reduces LLM token usage vs raw HTML."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)


import queue
import threading

_worker: "_BrowserWorker | None" = None


class _BrowserWorker:
    """Runs Playwright in a dedicated thread to avoid asyncio event-loop conflicts on Windows."""

    def __init__(self) -> None:
        self._req: queue.Queue = queue.Queue()
        self._res: queue.Queue = queue.Queue()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self) -> None:
        import asyncio
        import sys
        # Restore a real ProactorEventLoop policy so sync_playwright can spawn
        # its subprocess driver — Jupyter's tornado patch breaks asyncio.new_event_loop()
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            while True:
                url = self._req.get()
                if url is None:
                    break
                try:
                    page = browser.new_page()
                    page.goto(url, wait_until="load", timeout=30000)
                    page.wait_for_timeout(2000)
                    html = page.content()
                    page.close()
                    self._res.put(("ok", html))
                except Exception as e:
                    self._res.put(("err", str(e)))
            browser.close()

    def fetch(self, url: str, timeout: int = 60) -> str:
        self._req.put(url)
        status, result = self._res.get(timeout=timeout)
        if status == "err":
            raise RuntimeError(f"Playwright fetch failed for {url}: {result}")
        return result

    def close(self) -> None:
        self._req.put(None)
        self._thread.join(timeout=10)


def _get_worker() -> _BrowserWorker:
    global _worker
    if _worker is None:
        _worker = _BrowserWorker()
    return _worker


def close_browser() -> None:
    """Shut down the shared Chromium instance. Call once at the end of a scraping session."""
    global _worker
    if _worker is not None:
        _worker.close()
        _worker = None


async def fetch_product_html(url: str) -> str:
    """Render a JS-heavy page with Playwright and return the full HTML.

    Uses a persistent Chromium instance (one launch per session). Call
    close_browser() when done. Async signature keeps notebook cells unchanged.
    """
    return _get_worker().fetch(url)
