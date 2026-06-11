BRANDS: dict[int, str] = {
    1: "Full Gauge",
    2: "Parker",
    3: "Invotech",
    4: "York",
    5: "Danfoss",
    6: "Lefoo",
    7: "GMCC",
    8: "Chemours",
    9: "Corestar",
    10: "Shtrol",
    11: "AMG",
    23: "FS Parts",
}

PRODUCT_LINES: dict[int, str] = {
    1: "Controles y Electrónica",
    2: "Válvulas",
    3: "Compresores",
    4: "Ventilación",
    5: "Accesorios de Refrigeración",
    6: "Aires Acondicionados",
    7: "Refrigerantes",
}


def brand_lookup_text() -> str:
    return ", ".join(f"{id_}={name}" for id_, name in BRANDS.items())


def product_line_lookup_text() -> str:
    return ", ".join(f"{id_}={name}" for id_, name in PRODUCT_LINES.items())
