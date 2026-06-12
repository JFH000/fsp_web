from fsparts_scraper.supabase_client import make_slug


def test_make_slug_removes_accents():
    assert make_slug("Válvula Solenoide") == "valvula-solenoide"


def test_make_slug_removes_special_chars():
    assert make_slug('Filtro 1/4" NC') == "filtro-1-4-nc"


def test_make_slug_collapses_multiple_hyphens():
    assert make_slug("Compresor  Scroll--Inverter") == "compresor-scroll-inverter"


def test_make_slug_strips_leading_trailing_hyphens():
    assert make_slug("--Producto--") == "producto"


def test_make_slug_handles_numbers():
    assert make_slug("Compresor 5 TR 220V R410") == "compresor-5-tr-220v-r410"
