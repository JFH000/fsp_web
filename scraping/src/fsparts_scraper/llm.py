import json
import os
import time

from openai import OpenAI

from fsparts_scraper.mapper import brand_lookup_text, product_line_lookup_text

NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
MODEL = "meta/llama-3.3-70b-instruct"

SYSTEM_PROMPT = """\
Eres un extractor de datos de productos HVAC/R. Devuelve ÚNICAMENTE JSON válido, \
sin texto adicional antes ni después.

Marcas disponibles (usa el id numérico): {brands}

Líneas de producto disponibles (usa el id numérico): {lines}

Schema requerido (respeta exactamente estos nombres de campo):
{{
  "sku": "string | null",
  "name": "string",
  "description": "string",
  "brand_id": number | null,
  "product_line_id": number | null,
  "specs": [{{"label": "string", "value": "string"}}],
  "refrigerants": ["R22", "R410A"]
}}

Reglas:
- sku: busca el código de modelo técnico (ej: DK-032S, MT530, YH150C7-100). Si no existe, usa null.
- name: nombre limpio del producto, sin exceso de mayúsculas.
- description: resumen técnico en español, sin marketing.
- specs: extrae TODOS los pares técnicos (voltaje, conexión, presión, capacidad, etc.) \
incluyendo los embebidos en el nombre del producto o descripción.
- refrigerants: solo códigos tipo R### (R22, R410A, R404A...) mencionados en cualquier parte.
- brand_id / product_line_id: elige el id más apropiado. Si no puedes determinar, usa null.
"""


_RATE_LIMIT_RPM = 40
_MIN_INTERVAL = 60.0 / _RATE_LIMIT_RPM  # 1.5 s between calls
_last_call: float = 0.0


def _throttled_create(client: OpenAI, **kwargs):
    global _last_call
    elapsed = time.monotonic() - _last_call
    if elapsed < _MIN_INTERVAL:
        time.sleep(_MIN_INTERVAL - elapsed)
    _last_call = time.monotonic()
    return _throttled_create(client,**kwargs)


def get_client() -> OpenAI:
    return OpenAI(
        base_url=NVIDIA_BASE_URL,
        api_key=os.environ["NVIDIA_API_KEY"],
    )


def extract_product_data(
    html_clean: str,
    client: OpenAI | None = None,
    max_html_chars: int = 8000,
) -> dict | None:
    """Call NVIDIA NIM API on cleaned HTML and return parsed product dict, or None on failure."""
    if client is None:
        client = get_client()

    system = SYSTEM_PROMPT.format(
        brands=brand_lookup_text(),
        lines=product_line_lookup_text(),
    )
    messages = [
        {"role": "system", "content": system},
        {
            "role": "user",
            "content": f"Extrae los datos de este producto:\n\n{html_clean[:max_html_chars]}",
        },
    ]

    response = _throttled_create(client,
        model=MODEL,
        messages=messages,
        max_tokens=1024,
        temperature=0,
    )
    text = response.choices[0].message.content or ""

    result = parse_llm_response(text)
    if result is None:
        messages[-1]["content"] = (
            "Devuelve SOLO el JSON, sin ningún texto adicional.\n\n"
            + messages[-1]["content"]
        )
        response = _throttled_create(client,
            model=MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0,
        )
        text = response.choices[0].message.content or ""
        result = parse_llm_response(text)

    return result


def parse_llm_response(text: str) -> dict | None:
    """Extract the first valid JSON object from LLM response text."""
    start = text.find("{")
    if start == -1:
        return None
    try:
        obj, _ = json.JSONDecoder().raw_decode(text, start)
        return obj if isinstance(obj, dict) else None
    except json.JSONDecodeError:
        return None
