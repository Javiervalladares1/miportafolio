"""Voz natural y gratis, SIN internet, con Kokoro (recomendada sobre Piper).

Instalación (una vez):
    pip install kokoro-onnx onnx soundfile
    # Modelo y voces (~350 MB) de
    # https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
    #   kokoro-v1.0.onnx  y  voices-v1.0.bin   -> guardalos en ./modelos/

Uso:
    python3 scripts/voz_kokoro.py videos/bono14-aguinaldo.json
    python3 scripts/voz_kokoro.py videos/bono14-aguinaldo.json --voz ef_dora --velocidad 1.1

Voces en español: em_alex (hombre), em_santa (hombre), ef_dora (mujer).
Escribe public/voz/<id>/tiempos.json con el tiempo exacto de cada palabra
(sacado de las duraciones que predice el propio modelo).
"""

import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

RAIZ = Path(__file__).resolve().parent.parent
SR = 24_000
MUESTRAS_POR_FRAME = 600  # Kokoro: cada unidad de duración = 600 muestras a 24 kHz
SALIDA_DURACION = "/encoder/Clip_output_0"
PUNTUACION = set(",.;:?!¿¡—…")
COLA_MS = 150


def sesion_con_duraciones(modelo: Path) -> ort.InferenceSession:
    """Copia del modelo que además devuelve la duración de cada fonema (se crea una vez)."""
    parcheado = modelo.with_name(modelo.stem + "-tiempos.onnx")
    if not parcheado.exists():
        print("Preparando el modelo para sacar tiempos por palabra (solo la primera vez)…")
        m = onnx.load(str(modelo))
        m.graph.output.append(onnx.helper.make_tensor_value_info(SALIDA_DURACION, onnx.TensorProto.FLOAT, None))
        onnx.save(m, str(parcheado))
    return ort.InferenceSession(str(parcheado))


def escena(k: Kokoro, ses: ort.InferenceSession, texto: str, voz: str, vel: float, acento: str):
    fonemas = k.tokenizer.phonemize(texto, acento)
    vocab = k.tokenizer.vocab
    pares = [(i, vocab[c]) for i, c in enumerate(fonemas) if c in vocab]
    tokens = [t for _, t in pares]
    estilo = k.get_voice_style(voz)[len(tokens)]
    audio, dur = ses.run(None, {
        "tokens": [[0, *tokens, 0]],
        "style": estilo,
        "speed": np.array([vel], dtype=np.float32),
    })
    dur = dur.reshape(-1)
    inicio_token = np.concatenate([[0], np.cumsum(dur)])  # en frames; índice 0 = relleno inicial

    # agrupar fonemas en palabras (separadas por espacio o puntuación)
    palabras, actual = [], None
    for pos, (i_char, _) in enumerate(pares):
        c = fonemas[i_char]
        j = pos + 1  # +1 por el relleno inicial
        if c == " " or c in PUNTUACION:
            if actual:
                palabras.append(actual)
                actual = None
        elif actual is None:
            actual = [inicio_token[j], inicio_token[j + 1]]
        else:
            actual[1] = inicio_token[j + 1]
    if actual:
        palabras.append(actual)

    a_ms = lambda frames: round(frames * MUESTRAS_POR_FRAME * 1000 / SR)
    tokens_txt = texto.split()
    if len(palabras) == len(tokens_txt):
        res = [{"texto": t, "inicioMs": a_ms(a), "finMs": a_ms(b)} for t, (a, b) in zip(tokens_txt, palabras)]
    else:
        print(f"   aviso: {len(palabras)} palabras en la voz vs {len(tokens_txt)} en el guion; reparto proporcional")
        ini, fin = (palabras[0][0], palabras[-1][1]) if palabras else (0, len(audio) / MUESTRAS_POR_FRAME)
        pesos = [len(t) + 2 for t in tokens_txt]
        total, t0, res = sum(pesos), ini, []
        for t, p in zip(tokens_txt, pesos):
            d = (fin - ini) * p / total
            res.append({"texto": t, "inicioMs": a_ms(t0), "finMs": a_ms(t0 + d)})
            t0 += d

    # recortar el silencio final que deja el modelo
    fin_habla = int((palabras[-1][1] if palabras else len(audio) / MUESTRAS_POR_FRAME) * MUESTRAS_POR_FRAME)
    audio = audio[: fin_habla + int(SR * 0.08)]
    return audio, res


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("guion")
    ap.add_argument("--voz", default="em_alex", help="em_alex, em_santa o ef_dora")
    ap.add_argument("--velocidad", type=float, default=1.1, help="1.0 normal; 1.1–1.2 ritmo TikTok")
    ap.add_argument("--acento", default="es-419", help="es-419 = latinoamericano")
    ap.add_argument("--modelos", default=str(RAIZ / "modelos"), help="carpeta con kokoro-v1.0.onnx y voices-v1.0.bin")
    args = ap.parse_args()

    modelos = Path(args.modelos)
    k = Kokoro(str(modelos / "kokoro-v1.0.onnx"), str(modelos / "voices-v1.0.bin"))
    ses = sesion_con_duraciones(modelos / "kokoro-v1.0.onnx")

    video = json.loads(Path(args.guion).read_text(encoding="utf-8"))
    carpeta = RAIZ / "public" / "voz" / video["id"]
    carpeta.mkdir(parents=True, exist_ok=True)
    for viejo in carpeta.glob("escena-*.mp3"):
        viejo.unlink()

    escenas = []
    for i, e in enumerate(video["escenas"], 1):
        print(f"[{i}/{len(video['escenas'])}] {e['texto'][:60]}…")
        audio, palabras = escena(k, ses, e["texto"], args.voz, args.velocidad, args.acento)
        nombre = f"escena-{i:02d}.mp3"
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            sf.write(tmp.name, audio, SR)
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-i", tmp.name,
                 "-af", "highpass=f=60,loudnorm=I=-14:TP=-1.5,aresample=44100",
                 "-b:a", "192k", str(carpeta / nombre)],
                check=True,
            )
        escenas.append({
            "audio": f"voz/{video['id']}/{nombre}",
            "duracionMs": round(len(audio) * 1000 / SR + COLA_MS),
            "palabras": palabras,
        })

    (carpeta / "tiempos.json").write_text(
        json.dumps({"voz": f"kokoro/{args.voz}", "escenas": escenas}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(f"Listo: {sum(e['duracionMs'] for e in escenas) / 1000:.0f} s de voz ({args.voz})")


if __name__ == "__main__":
    main()
