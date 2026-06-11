import re
from pathlib import Path
from xml.etree import ElementTree

import httpx

DATA_DIR = Path(__file__).parent.parent.parent / "data"
SITEMAP_URL = "https://www.fsparts.org/sitemap.xml"

KNOWN_CATEGORY_SLUGS: set[str] = {
    "filtros-secadores-para-refrigeracion",
    "valvulas-de-bola-para-refrigeracion-y-hvac",
    "valvulas-solenoides-para-refrigeracion-o-aire-acondicionado",
    "compresores-hvac",
    "accesorios-para-aire-acondicionado",
    "absorbedores-de-vibracion-hvac",
    "valvulas-para-refrigeracion-hvac",
    "ventilacion-industrial",
    "transmisores-de-temperatura-y-humedad-hvac",
    "refrigerantes-para-aire-acondicionado-y-refrigeracion",
    "controladores-y-termostatos",
    "visor-de-liquido-para-sistemas-de-refrigeracion-y-aire-acondicionado",
    "valvula-de-expansion-electronica",
    "separadores-de-aceite-para-refrigeracion-y-hvac",
    "valvulas-de-expansion-termostaticas-y-orificios",
    "sensores-de-presion-y-temperatura",
    "aire-acondicionado",
    "valvulas-para-amoniaco-parker",
    "presostatos-para-refrigeracion-y-aire-acondicionado",
    "valvulas-de-4-vias-para-aire-acondicionado",
    "actuadores-icad",
    "controladores",
    "carga-termica",
    "marcas-hvac-y-refrigeracion",
    "productos-y-repuestos-hvac-y-refrigeracion",
    "contacto-hvacr-colombia",
    "terminos-y-condiciones",
    "membresia-fs-parts",
    "blog-tecnologias",
    "blog-post5",
    "catalogo-hvac-y-refrigeracion-fs-parts",
    "repuestos-hvac-de-alta-calidad",
    "repuestos-hvac-de-alta-calidad-1",
    "repuestos-hvac-de-alta-calidad-4",
    "compresor-de-aire-acondicionado",
    "york-colombia",
    "compresor-gmcc",
    "promocion-compresores-scroll-invotech",
    "compresor-semi-hermetico-refrigeracion-5hp-r404a-r507a-r134a",
}


def fetch_sitemap() -> str:
    response = httpx.get(SITEMAP_URL, timeout=30, follow_redirects=True)
    response.raise_for_status()
    return response.text


def parse_sitemap_xml(xml_text: str) -> list[str]:
    root = ElementTree.fromstring(xml_text)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]


def filter_product_urls(
    urls: list[str],
    category_slugs: set[str] = KNOWN_CATEGORY_SLUGS,
) -> list[str]:
    results = []
    for url in urls:
        slug = url.rstrip("/").split("/")[-1]
        if slug in category_slugs:
            continue
        if re.search(r"/en/|/pt/", url):
            continue
        results.append(url)
    return results


def parse_price_string(text: str) -> int | None:
    """Parse 'CO$54,900.00' → 54900. Returns None if no number found."""
    digits = re.sub(r"[^\d]", "", text.split(".")[0])
    if not digits:
        return None
    return int(digits)


def save_urls(urls: list[str]) -> Path:
    path = DATA_DIR / "urls.txt"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(urls), encoding="utf-8")
    return path


def load_urls() -> list[str]:
    path = DATA_DIR / "urls.txt"
    if not path.exists():
        return []
    return [u for u in path.read_text(encoding="utf-8").splitlines() if u.strip()]
