# Videos de finanzas en Guatemala para TikTok 🇬🇹

Videos *faceless* (sin cara) y animados, hechos con código usando [Remotion](https://www.remotion.dev).
Cada video sale de un archivo JSON con el guion. Claude puede escribir videos nuevos por vos.

```
guion (JSON)  →  voz + tiempos (edge-tts)  →  animación (Remotion)  →  MP4 vertical 1080×1920
```

## Requisitos (una sola vez)

- [Node.js](https://nodejs.org) 18 o más reciente
- Python 3 y `pip install edge-tts` (voz gratis de Microsoft, con acento guatemalteco)
- `ffmpeg` (opcional, para medir el audio con precisión)

```bash
cd tiktok-finanzas-gt
npm install
```

## Hacer un video

```bash
# 1. Generar la voz (necesita internet)
python3 scripts/generar_voz.py videos/bono14-aguinaldo.json

# 2. Ver y ajustar en el navegador (vista previa en vivo)
npm run studio

# 3. Exportar el MP4
npx remotion render bono14-aguinaldo out/bono14-aguinaldo.mp4
```

Sin el paso 1 el video igual se genera, pero en silencio y con tiempos estimados (sirve para previsualizar).

**Opción recomendada sin internet: Kokoro** (voz neuronal natural, gratis). El video de ejemplo ya trae su voz hecha así, en `public/voz/`:

```bash
pip install kokoro-onnx onnx soundfile
# bajá kokoro-v1.0.onnx y voices-v1.0.bin de
# https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0  ->  carpeta modelos/
python3 scripts/voz_kokoro.py videos/bono14-aguinaldo.json --voz em_alex   # o ef_dora (mujer), em_santa
```

**Opción básica sin internet: Piper** (suena más robótico):

```bash
pip install piper-tts onnx
# bajá y descomprimí voice-es-mls_10246-low.tar.gz de
# https://github.com/rhasspy/piper/releases/tag/v0.0.2
python3 scripts/voz_piper.py videos/bono14-aguinaldo.json --modelo es-mls_10246-low.onnx
```

Piper suena más robótico que edge-tts, pero es gratis y no depende de nadie. El script usa acento
latinoamericano, acorta pausas largas y repite las tomas en las que la voz "se traba".

Voces de edge-tts: `es-GT-AndresNeural` (hombre) o `es-GT-MartaNeural` (mujer). Cambiala en el JSON (`"voz"`)
o con `--voz`. El ritmo se ajusta con `--velocidad +12%`.

## Crear un video nuevo

1. Copiá `videos/bono14-aguinaldo.json` con otro nombre y cambiá `id`, `titulo`, `fuente` y `escenas`.
2. Agregalo a la lista `videos` en `src/Root.tsx`.
3. Generá la voz y renderizá.

O pedíselo a Claude Code, por ejemplo:

> Hacé un video nuevo sobre cómo funciona el IGSS, siguiendo CLAUDE.md.

### Tipos de escena (`visual.tipo`)

| tipo | campos | se ve como |
|---|---|---|
| `numero-grande` | `valor`, `etiqueta`, `prefijo?`, `emoji?` | número gigante que cuenta desde 0 |
| `titulo` | `titulo`, `subtitulo?`, `emoji?` | título con etiqueta dorada |
| `barras` | `items[{etiqueta, valor, destacado?}]` | barras que crecen |
| `calendario` | `mes`, `detalle?`, `emoji?` | hoja de calendario |
| `contador` | `desde`, `hasta`, `prefijo?`, `etiqueta` | cifra que sube (antes vs. después) |
| `lista` | `items[{emoji, texto}]` | tarjetas que entran una por una |
| `cta` | `texto`, `subtitulo?` | botón "Seguime" que late |

## Al publicar en TikTok

- Los textos importantes quedan dentro de la zona segura (TikTok tapa los bordes inferior y derecho).
- Agregá música desde la biblioteca de TikTok a bajo volumen: así no tenés problemas de derechos.
- Marcá el video como contenido generado con IA si TikTok lo pide.
- **Verificá cada dato antes de publicar.** Son temas de dinero y la gente va a confiar en vos.

---

# Cuentos de Navidad con Santa 🎅

Plan de la temporada: `planes/navidad-50-videos.md`. Textos para publicar: `planes/publicacion-*.md`.

```bash
# 1. Voz de Santa para todos los cuentos (Kokoro, sin internet)
python3 scripts/voz_kokoro.py videos/navidad/*.json

# 2. Música de fondo original (solo una vez)
python3 scripts/musica.py

# 3. Renderizar en lote -> out/
bash scripts/renderizar.sh navidad-
```

Cada cuento es un JSON en `videos/navidad/` y se registra en `videos/navidad/index.ts`.
Cada escena tiene: `texto` (lo que dice Santa), `escenario` (`aldea`, `taller`, `cocina`, `cielo`, `bosque` o `noche`),
`elementos` (personajes o emojis con `pos` y `accion`) y un `rotulo` opcional para la moraleja.
Los personajes están en `src/cuento/personajes.ts`. Las acciones disponibles son `quieto`, `entra`, `sale`, `salta`, `vuela`,
`cae`, `tiembla`, `gira`, `duerme`, `saluda`, `brilla`, `crece` y `camina`.
