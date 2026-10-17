#!/usr/bin/env python3
"""Baixa a especificacao OpenAPI (Swagger) e salva em public/api-data/openapi.json.
Uso:
  python scripts/sync-swagger.py [URL]
  SWAGGER_URL=https://... python scripts/sync-swagger.py
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "api-data" / "openapi.json"


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else None
    if not url:
        url = os.environ.get("SWAGGER_URL")
    if not url:
        print("Erro: informe a URL do Swagger (argumento ou variavel SWAGGER_URL)")
        sys.exit(1)

    OUT.parent.mkdir(parents=True, exist_ok=True)

    req = urllib.request.Request(
        url,
        headers={"Accept": "application/json", "User-Agent": "sankhyadoc-sync/1.0"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resp.status != 200:
            print(f"Falha HTTP {resp.status} ao baixar {url}")
            sys.exit(1)
        data = resp.read()

    try:
        spec = json.loads(data)
    except json.JSONDecodeError as e:
        print(f"JSON invalido: {e}")
        sys.exit(1)

    if not spec or not str(spec.get("openapi", "")).startswith("3."):
        print("A resposta nao e uma especificacao OpenAPI 3.x valida.")
        sys.exit(1)

    OUT.write_text(json.dumps(spec, indent=2, ensure_ascii=False), encoding="utf-8")
    paths = len(spec.get("paths", {}))
    print(f"OpenAPI atualizado: {OUT} ({paths} paths)")


if __name__ == "__main__":
    main()
