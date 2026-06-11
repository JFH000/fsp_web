from fsparts_scraper.crawler import parse_sitemap_xml, filter_product_urls, parse_price_string

SAMPLE_SITEMAP = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.fsparts.org/filtros-secadores-para-refrigeracion</loc></url>
  <url><loc>https://www.fsparts.org/filtro-secador-conexion-soldar-dk-032s-14-refrigeracion</loc></url>
  <url><loc>https://www.fsparts.org/terminos-y-condiciones</loc></url>
  <url><loc>https://www.fsparts.org/compresor-scroll-invotech-yh150c7-100-de-5-tr-220v-r410</loc></url>
  <url><loc>https://www.fsparts.org/marcas-hvac-y-refrigeracion</loc></url>
  <url><loc>https://www.fsparts.org/blog-tecnologias</loc></url>
</urlset>
"""

KNOWN_CATEGORY_SLUGS = {
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
}


def test_parse_sitemap_xml_returns_all_locs():
    urls = parse_sitemap_xml(SAMPLE_SITEMAP)
    assert len(urls) == 6
    assert "https://www.fsparts.org/filtro-secador-conexion-soldar-dk-032s-14-refrigeracion" in urls


def test_filter_product_urls_excludes_known_categories():
    urls = parse_sitemap_xml(SAMPLE_SITEMAP)
    products = filter_product_urls(urls, KNOWN_CATEGORY_SLUGS)
    assert "https://www.fsparts.org/filtros-secadores-para-refrigeracion" not in products
    assert "https://www.fsparts.org/terminos-y-condiciones" not in products
    assert "https://www.fsparts.org/blog-tecnologias" not in products


def test_filter_product_urls_keeps_product_urls():
    urls = parse_sitemap_xml(SAMPLE_SITEMAP)
    products = filter_product_urls(urls, KNOWN_CATEGORY_SLUGS)
    assert "https://www.fsparts.org/filtro-secador-conexion-soldar-dk-032s-14-refrigeracion" in products
    assert "https://www.fsparts.org/compresor-scroll-invotech-yh150c7-100-de-5-tr-220v-r410" in products


def test_parse_price_string_handles_colombian_format():
    assert parse_price_string("CO$54,900.00") == 54900
    assert parse_price_string("CO$2,999,990.00") == 2999990
    assert parse_price_string("CO$45,000") == 45000


def test_parse_price_string_returns_none_for_invalid():
    assert parse_price_string("") is None
    assert parse_price_string("Sin precio") is None
