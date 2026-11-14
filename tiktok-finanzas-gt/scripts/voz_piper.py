"""Alternativa SIN internet a generar_voz.py, usando Piper (voz neuronal local).

Uso:
    pip install piper-tts onnx
    # Descargá una voz en español (archivo .onnx + .onnx.json), p. ej. de
    # https://github.com/rhasspy/piper/releases/tag/v0.0.2 (voice-es-mls_10246-low)
    python3 scripts/voz_piper.py videos/bono14-aguinaldo.json --modelo ruta/es-mls_10246-low.onnx

Escribe el mismo public/voz/<id>/tiempos.json que generar_voz.py, con tiempos
por palabra sacados de las alineaciones de fonemas de Piper.
"""

import argparse
import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig

RAIZ = Path(__file__).resolve().parent.parent
SEPARADORES = {" ", ",", ".", "?", "!", ";", ":", "¿", "¡", "—"}
SILENCIO_FINAL_MS = 120
PAUSA_MAX_MS = 280  # las voces "low" a veces meten silencios de varios segundos


def comprimir_silencios(audio: np.ndarray, sr: int):
    """Acorta pausas largas y recorta bordes. Devuelve (audio, función que remapea muestras)."""
    ventana = int(sr * 0.01)
    n = len(audio) // ventana
    energia = np.sqrt((audio[: n * ventana].reshape(n, ventana) ** 2).mean(axis=1))
    silencio = energia < 10 ** (-40 / 20)
    max_v = PAUSA_MAX_MS // 10
    conservar = np.ones(n, dtype=bool)
    i = 0
    while i < n:
        if silencio[i]:
            j = i
            while j < n and silencio[j]:
                j += 1
            borde = i == 0 or j == n
            limite = 3 if borde else max_v  # 30 ms en los bordes
            if j - i > limite:
                conservar[i + limite // 2 : j - (limite - limite // 2)] = False
            i = j
        else:
            i += 1
    mascara = np.repeat(conservar, ventana)
    mascara = np.concatenate([mascara, np.ones(len(audio) - len(mascara), dtype=bool)])
    acumulado = np.concatenate([[0], np.cumsum(mascara)])
    return audio[mascara], lambda m: int(acumulado[min(int(m), len(audio))])


def sintetizar(voz: PiperVoice, texto: str, cfg: SynthesisConfig):
    """Devuelve (audio float32, sample_rate, palabras con tiempos)."""
    audio, palabras = [], []
    muestras = 0
    peor = 0  # fonema más largo: si es enorme, la voz "se trabó"
    sr = voz.config.sample_rate
    actual_inicio = None

    def cerrar(fin):
        nonlocal actual_inicio
        if actual_inicio is not None:
            palabras.append([actual_inicio, fin])
            actual_inicio = None

    for chunk in voz.synthesize(texto, syn_config=cfg, include_alignments=True):
        audio.append(chunk.audio_float_array)
        for al in chunk.phoneme_alignments or []:
            ini, fin = muestras, muestras + al.num_samples
            muestras = fin
            if al.phoneme in SEPARADORES or al.phoneme in ("^", "$", "_"):
                cerrar(ini)
            else:
                peor = max(peor, al.num_samples)
                if actual_inicio is None:
                    actual_inicio = ini
        cerrar(muestras)
        muestras = sum(len(a) for a in audio)  # por si el chunk no alinea exacto

    audio_final, remap = comprimir_silencios(np.concatenate(audio), sr)
    palabras = [[remap(i), remap(f)] for i, f in palabras]
    muestras = len(audio_final)
    tokens = texto.split()
    a_ms = lambda s: round(s * 1000 / sr)
    if len(palabras) == len(tokens):
        res = [{"texto": t, "inicioMs": a_ms(i), "finMs": a_ms(f)} for t, (i, f) in zip(tokens, palabras)]
    else:
        # espeak dividió distinto: repartimos por largo de palabra dentro del habla real
        print(f"   aviso: {len(palabras)} palabras alineadas vs {len(tokens)} en el guion; uso reparto proporcional")
        ini = palabras[0][0] if palabras else 0
        fin = palabras[-1][1] if palabras else muestras
        pesos = [len(t) + 2 for t in tokens]
        total, t0, res = sum(pesos), ini, []
        for t, p in zip(tokens, pesos):
            d = (fin - ini) * p / total
            res.append({"texto": t, "inicioMs": a_ms(t0), "finMs": a_ms(t0 + d)})
            t0 += d
    return audio_final, sr, res, peor * 1000 / sr


def mejor_toma(voz: PiperVoice, texto: str, cfg: SynthesisConfig, intentos: int = 15):
    """Piper es aleatorio: si una toma alarga un sonido (>~0.3 s), probamos otra y nos quedamos con la mejor."""
    mejor = None
    for _ in range(intentos):
        toma = sintetizar(voz, texto, cfg)
        if mejor is None or toma[3] < mejor[3]:
            mejor = toma
        if toma[3] <= 260:
            break
    if mejor[3] > 320:
        print(f"   aviso: la mejor toma aún tiene un sonido de {mejor[3]:.0f} ms; revisá esta escena")
    return mejor[:3]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("guion")
    ap.add_argument("--modelo", required=True, help="archivo .onnx de la voz de Piper")
    ap.add_argument("--velocidad", type=float, default=0.92, help="<1 = más rápido (length_scale)")
    ap.add_argument("--acento", default="es-419", help="es-419 = latinoamericano (sin la 'z' española)")
    args = ap.parse_args()

    video = json.loads(Path(args.guion).read_text(encoding="utf-8"))
    voz = PiperVoice.load(args.modelo, include_alignments=True)
    voz.config.espeak_voice = args.acento
    cfg = SynthesisConfig(length_scale=args.velocidad, noise_scale=0.6, noise_w_scale=0.4)
    carpeta = RAIZ / "public" / "voz" / video["id"]
    carpeta.mkdir(parents=True, exist_ok=True)

    escenas = []
    for i, e in enumerate(video["escenas"], 1):
        print(f"[{i}/{len(video['escenas'])}] {e['texto'][:60]}…")
        audio, sr, palabras = mejor_toma(voz, e["texto"], cfg)
        nombre = f"escena-{i:02d}.mp3"
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(sr)
                w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
            # 44.1 kHz, volumen normalizado y un poco de "cuerpo" para que suene menos plano
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-i", tmp.name,
                 "-af", "highpass=f=70,bass=g=3,loudnorm=I=-14:TP=-1.5,aresample=44100",
                 "-b:a", "160k", str(carpeta / nombre)],
                check=True,
            )
        dur = len(audio) * 1000 / sr + SILENCIO_FINAL_MS
        escenas.append({"audio": f"voz/{video['id']}/{nombre}", "duracionMs": round(dur), "palabras": palabras})

    (carpeta / "tiempos.json").write_text(
        json.dumps({"voz": Path(args.modelo).stem, "escenas": escenas}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(f"Listo: {sum(e['duracionMs'] for e in escenas) / 1000:.0f} s de voz")


if __name__ == "__main__":
    main()
