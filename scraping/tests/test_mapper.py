from fsparts_scraper.mapper import brand_lookup_text, product_line_lookup_text, BRANDS, PRODUCT_LINES


def test_brands_has_expected_entries():
    assert BRANDS[5] == "Danfoss"
    assert BRANDS[2] == "Parker"
    assert BRANDS[23] == "FS Parts"


def test_product_lines_has_expected_entries():
    assert PRODUCT_LINES[1] == "Controles y Electrónica"
    assert PRODUCT_LINES[2] == "Válvulas"
    assert PRODUCT_LINES[7] == "Refrigerantes"


def test_brand_lookup_text_contains_all_ids_and_names():
    text = brand_lookup_text()
    for id_, name in BRANDS.items():
        assert str(id_) in text
        assert name in text


def test_product_line_lookup_text_contains_all_ids_and_names():
    text = product_line_lookup_text()
    for id_, name in PRODUCT_LINES.items():
        assert str(id_) in text
        assert name in text
