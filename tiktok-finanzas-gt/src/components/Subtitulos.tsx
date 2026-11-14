import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { color, zonaSegura } from "../tema";
import { Palabra } from "../types";

const MAX_PALABRAS = 3;

/** Agrupa en bloques cortos: cortan en puntuación, pausas o cada 3 palabras. */
const agrupar = (palabras: Palabra[]): Palabra[][] => {
  const grupos: Palabra[][] = [];
  let actual: Palabra[] = [];
  palabras.forEach((p, i) => {
    actual.push(p);
    const sig = palabras[i + 1];
    const corte =
      actual.length >= MAX_PALABRAS ||
      /[.,;:?!]$/.test(p.texto) ||
      (sig && sig.inicioMs - p.finMs > 250);
    if (corte || !sig) {
      grupos.push(actual);
      actual = [];
    }
  });
  return grupos;
};

export const Subtitulos = ({ palabras }: { palabras: Palabra[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const grupos = agrupar(palabras);

  const grupo =
    grupos.find((g) => ms >= g[0].inicioMs && ms < g[g.length - 1].finMs + 120) ??
    [...grupos].reverse().find((g) => ms >= g[0].inicioMs);
  if (!grupo) return null;

  const entrada = spring({
    frame: frame - Math.round((grupo[0].inicioMs / 1000) * fps),
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 1170,
        left: zonaSegura.izquierda,
        right: zonaSegura.derecha - 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 30px",
        fontSize: 92,
        fontWeight: 900,
        lineHeight: 1.1,
        textTransform: "uppercase",
        textAlign: "center",
        transform: `scale(${interpolate(entrada, [0, 1], [0.8, 1])})`,
      }}
    >
      {grupo.map((p, i) => {
        const activa = ms >= p.inicioMs && ms < p.finMs + 60;
        return (
          <span
            key={i}
            style={{
              color: activa ? color.verde : color.texto,
              WebkitTextStroke: "3px rgba(0,0,0,0.85)",
              paintOrder: "stroke fill",
              textShadow: "0 8px 24px rgba(0,0,0,0.55)",
              transform: activa ? "scale(1.08)" : undefined,
              display: "inline-block",
            }}
          >
            {p.texto}
          </span>
        );
      })}
    </div>
  );
};
