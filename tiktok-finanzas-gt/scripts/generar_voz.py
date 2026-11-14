"""Genera la voz (gratis, con edge-tts) y los tiempos de cada palabra para un video.

Uso:
    pip install edge-tts
    python3 scripts/generar_voz.py videos/bono14-aguinaldo.json
    python3 scripts/generar_voz.py videos/bono14-aguinaldo.json --voz es-GT-MartaNeural --velocidad +12%

Crea public/voz/<id>/escena-XX.mp3 y public/voz/<id>/tiempos.json,
que Remotion usa para sincronizar animaciones y subtítulos.
Voces de Guatemala: es-GT-AndresNeural (hombre), es-GT-MartaNeural (mujer).
"""

import argparse
import asyncio
import json
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path

import edge_tts

RAIZ = Path(__file__).resolve().parent.parent


def normalizar(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]", "", s)


def duracion_ms(mp3: Path) -> float | None:
    if not shutil.which("ffprobe"):
        return None
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)],
        capture_output=True, text=True,
    ).stdout.strip()
    return float(out) * 1000 if out else None


def con_puntuacion(palabras: list[dict], texto: str) -> list[dict]:
    """edge-tts devuelve palabras sin signos; recupera la versión del guion (con comas, ¿?, etc.)."""
    tokens = texto.split()
    j = 0
    for p in palabras:
        objetivo = normalizar(p["texto"])
        for k in range(j, min(j + 4, len(tokens))):
            if normalizar(tokens[k]) == objetivo:
                p["texto"] = tokens[k]
                j = k + 1
                break
    return palabras


async def escena(texto: str, voz: str, velocidad: str, destino: Path) -> dict:
    com = edge_tts.Communicate(texto, voz, rate=velocidad, boundary="WordBoundary")
    palabras = []
    with destino.open("wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                inicio = chunk["offset"] / 10_000  # unidades de 100 ns -> ms
                palabras.append({
                    "texto": chunk["text"],
                    "inicioMs": round(inicio),
                    "finMs": round(inicio + chunk["duration"] / 10_000),
                })
    dur = duracion_ms(destino) or (palabras[-1]["finMs"] + 250 if palabras else 1000)
    return {"duracionMs": round(dur), "palabras": con_puntuacion(palabras, texto)}


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("guion", help="JSON del video, p. ej. videos/bono14-aguinaldo.json")
    ap.add_argument("--voz", help="sobrescribe la voz del JSON")
    ap.add_argument("--velocidad", default="+8%", help="ritmo de TikTok: +5%% a +15%%")
    args = ap.parse_args()

    video = json.loads(Path(args.guion).read_text(encoding="utf-8"))
    voz = args.voz or video.get("voz", "es-GT-AndresNeural")
    carpeta = RAIZ / "public" / "voz" / video["id"]
    carpeta.mkdir(parents=True, exist_ok=True)

    escenas = []
    for i, e in enumerate(video["escenas"], 1):
        nombre = f"escena-{i:02d}.mp3"
        print(f"[{i}/{len(video['escenas'])}] {e['texto'][:60]}…")
        datos = await escena(e["texto"], voz, args.velocidad, carpeta / nombre)
        escenas.append({"audio": f"voz/{video['id']}/{nombre}", **datos})

    (carpeta / "tiempos.json").write_text(
        json.dumps({"voz": voz, "escenas": escenas}, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    total = sum(e["duracionMs"] for e in escenas) / 1000
    print(f"Listo: {carpeta / 'tiempos.json'} (~{total:.0f} s de voz)")


if __name__ == "__main__":
    asyncio.run(main())
