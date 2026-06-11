from fsparts_scraper.extractor import extract_prices, extract_images, clean_html

HTML_WITH_DEL_PRICES = """
<html><body>
<div class="product">
  <p><del>CO$54,900.00</del></p>
  <p>CO$45,000.00</p>
  <img src="https://assets.zyrosite.com/products/img1.webp" />
  <img src="https://assets.zyrosite.com/products/img2.webp" />
  <img src="https://assets.zyrosite.com/logo-final-de-fs-mv02lqNlJRcErl0b.png" />
</div>
</body></html>
"""

HTML_WITH_STRIKE_PRICES = """
<html><body>
<p><s>CO$199,990.00</s></p>
<p>CO$129,990.00</p>
<img src="https://assets.zyrosite.com/products/ctrl.jpg" />
</body></html>
"""

HTML_NO_PRICES = """
<html><body><p>Sin precio disponible</p></body></html>
"""

HTML_WITH_SCRIPTS = """
<html><head><script>alert('hi')</script><style>body{}</style></head>
<body><nav>Nav</nav><p>Producto real</p><footer>Footer</footer></body></html>
"""


def test_extract_prices_from_del_tag():
    result = extract_prices(HTML_WITH_DEL_PRICES)
    assert result["price_cop"] == 54900
    assert result["price_ws1"] == 45000


def test_extract_prices_from_strike_tag():
    result = extract_prices(HTML_WITH_STRIKE_PRICES)
    assert result["price_cop"] == 199990
    assert result["price_ws1"] == 129990


def test_extract_prices_returns_none_when_absent():
    result = extract_prices(HTML_NO_PRICES)
    assert result["price_cop"] is None
    assert result["price_ws1"] is None


def test_extract_images_excludes_logo():
    imgs = extract_images(HTML_WITH_DEL_PRICES)
    assert "https://assets.zyrosite.com/products/img1.webp" in imgs
    assert "https://assets.zyrosite.com/products/img2.webp" in imgs
    # Logo must be excluded
    assert not any("logo-final-de-fs" in u for u in imgs)


def test_extract_images_deduplicates():
    html = """<html><body>
    <img src="https://example.com/a.jpg"/>
    <img src="https://example.com/a.jpg"/>
    </body></html>"""
    imgs = extract_images(html)
    assert imgs.count("https://example.com/a.jpg") == 1


def test_clean_html_removes_scripts_styles_nav_footer():
    cleaned = clean_html(HTML_WITH_SCRIPTS)
    assert "<script>" not in cleaned
    assert "<style>" not in cleaned
    assert "<nav>" not in cleaned
    assert "<footer>" not in cleaned
    assert "Producto real" in cleaned
