"""Genera música de fondo ORIGINAL (cajita musical) sin derechos de autor.

    python3 scripts/musica.py   ->  public/musica/cajita.mp3 y public/musica/cuna.mp3
"""

import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

SR = 44100
RAIZ = Path(__file__).resolve().parent.parent
NOTAS = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def hz(nota: str) -> float:
    n, octava = nota[:-1], int(nota[-1])
    alt = 1 if "#" in n else -1 if "b" in n else 0
    midi = 12 * (octava + 1) + NOTAS[n[0]] + alt
    return 440 * 2 ** ((midi - 69) / 12)


def campanita(f: float, dur: float, vol: float) -> np.ndarray:
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 3.2) * np.minimum(1, t * 400)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 5) + 0.12 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 8)
    return s * env * vol


def cascabeles(dur: float, vol: float, rng) -> np.ndarray:
    n = int(SR * dur)
    t = np.arange(n) / SR
    ruido = rng.standard_normal(n)
    ruido = np.diff(ruido, prepend=0)  # agudo
    return ruido * np.exp(-t * 28) * vol


def componer(acordes, bpm, compases_por_acorde, melodia, cascabel, semilla):
    rng = np.random.default_rng(semilla)
    negra = 60 / bpm
    total_tiempos = len(acordes) * compases_por_acorde * 3  # compás de 3/4
    pista = np.zeros(int(SR * (total_tiempos * negra + 3)))

    def poner(sonido, en_seg):
        i = int(en_seg * SR)
        fin = min(len(pista), i + len(sonido))
        pista[i:fin] += sonido[: fin - i]

    t = 0.0
    for a_i, acorde in enumerate(acordes):
        notas = acorde.split()
        for c in range(compases_por_acorde):
            # bajo
            poner(campanita(hz(notas[0][:-1] + "3"), 2.5, 0.22), t)
            # arpegio en corcheas: 1-3-5-8-5-3
            patron = [notas[0], notas[1], notas[2], notas[0][:-1] + str(int(notas[0][-1]) + 1), notas[2], notas[1]]
            for k, n in enumerate(patron):
                poner(campanita(hz(n), 1.4, 0.10), t + k * negra / 2)
            # melodía: una nota por tiempo, tomada de la frase
            frase = melodia[(a_i * compases_por_acorde + c) % len(melodia)]
            for k, n in enumerate(frase.split()):
                if n != "-":
                    poner(campanita(hz(n), 1.8, 0.16), t + k * negra)
            if cascabel:
                for k in range(3):
                    poner(cascabeles(0.15, 0.025 if k else 0.04, rng), t + k * negra)
            t += 3 * negra
    # reverb simple
    eco = np.zeros_like(pista)
    for d, g in [(0.083, 0.35), (0.137, 0.25), (0.211, 0.18), (0.29, 0.12)]:
        k = int(d * SR)
        eco[k:] += pista[:-k] * g
    pista = pista + eco
    # loop sin cortes: la cola que sobra se suma al principio
    largo = int(SR * total_tiempos * negra)
    pista[: len(pista) - largo] += pista[largo:]
    pista = pista[:largo]
    return pista / np.max(np.abs(pista)) * 0.8


PIEZAS = {
    "cajita": dict(
        acordes=["C5 E5 G5", "A4 C5 E5", "F4 A4 C5", "G4 B4 D5"] * 4,
        bpm=126,
        compases_por_acorde=1,
        melodia=["E6 - G6", "C6 - E6", "A5 C6 F6", "D6 - B5", "E6 G6 E6", "C6 - A5", "F5 A5 C6", "B5 - -",
                 "G6 - E6", "E6 - C6", "F6 - A5", "D6 B5 G5", "E6 - G6", "A5 - C6", "C6 A5 F5", "G5 - -"],
        cascabel=True,
        semilla=1,
    ),
    "cuna": dict(
        acordes=["F4 A4 C5", "Bb4 D5 F5", "F4 A4 C5", "C4 E4 G4"] * 2,
        bpm=72,
        compases_por_acorde=2,
        melodia=["A5 - C6", "F5 - -", "D6 - Bb5", "F5 - -", "C6 - A5", "F5 - A5", "G5 - E5", "C5 - -"],
        cascabel=False,
        semilla=2,
    ),
}

if __name__ == "__main__":
    carpeta = RAIZ / "public" / "musica"
    carpeta.mkdir(parents=True, exist_ok=True)
    for nombre, cfg in PIEZAS.items():
        audio = componer(**cfg)
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(SR)
                w.writeframes((audio * 32767).astype(np.int16).tobytes())
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp.name, "-b:a", "160k", str(carpeta / f"{nombre}.mp3")], check=True)
        print(nombre, f"{len(audio) / SR:.0f} s")
