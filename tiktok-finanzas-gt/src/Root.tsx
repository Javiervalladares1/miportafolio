import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { FactVideo } from "./FactVideo";
import { ALTO, ANCHO, FPS } from "./tema";
import { EscenaTiempo, Palabra, Props, Video } from "./types";
import bono14 from "../videos/bono14-aguinaldo.json";

// Para agregar un video nuevo: creá el JSON en /videos y sumalo a esta lista.
const videos: Video[] = [bono14 as Video];

const PAUSA_MS = 350; // respiro entre escenas

type Tiempos = {
  escenas: { audio: string; duracionMs: number; palabras: Palabra[] }[];
};

/** Sin audio todavía: estima ~2.7 palabras/seg para poder previsualizar. */
const estimar = (texto: string): { duracionMs: number; palabras: Palabra[] } => {
  const tokens = texto.split(/\s+/).filter(Boolean);
  const pesos = tokens.map((t) => t.length + 2 + (/[.,;:?!]$/.test(t) ? 4 : 0));
  const total = pesos.reduce((a, b) => a + b, 0);
  const duracionMs = (tokens.length / 2.7) * 1000;
  let t = 0;
  const palabras = tokens.map((texto, i) => {
    const d = (pesos[i] / total) * duracionMs;
    const p = { texto, inicioMs: t, finMs: t + d };
    t += d;
    return p;
  });
  return { duracionMs, palabras };
};

const calcular: CalculateMetadataFunction<Props> = async ({ props }) => {
  const { video } = props;
  let tiempos: Tiempos | null = null;
  try {
    const res = await fetch(staticFile(`voz/${video.id}/tiempos.json`));
    if (res.ok) tiempos = await res.json();
  } catch {
    tiempos = null;
  }
  if (tiempos && tiempos.escenas.length !== video.escenas.length) {
    console.warn(`tiempos.json de ${video.id} no coincide con el guion; regenerá la voz.`);
    tiempos = null;
  }

  const escenas: EscenaTiempo[] = video.escenas.map((e, i) => {
    const t = tiempos?.escenas[i] ?? estimar(e.texto);
    return {
      ...e,
      audio: tiempos?.escenas[i]?.audio,
      palabras: t.palabras,
      duracionFrames: Math.ceil(((t.duracionMs + PAUSA_MS) / 1000) * FPS),
    };
  });

  return {
    durationInFrames: escenas.reduce((a, e) => a + e.duracionFrames, 0),
    props: { video, escenas },
  };
};

export const RemotionRoot = () => (
  <>
    {videos.map((video) => (
      <Composition
        key={video.id}
        id={video.id}
        component={FactVideo}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        durationInFrames={1}
        defaultProps={{ video, escenas: [] }}
        calculateMetadata={calcular}
      />
    ))}
  </>
);
