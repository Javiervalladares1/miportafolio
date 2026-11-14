import { useCurrentFrame, useVideoConfig } from "remotion";
import { Palabra } from "../types";

const MAX = 6;

const agrupar = (palabras: Palabra[]) => {
  const grupos: Palabra[][] = [];
  let actual: Palabra[] = [];
  palabras.forEach((p, i) => {
    actual.push(p);
    const sig = palabras[i + 1];
    if (!sig || actual.length >= MAX || /[.;:?!]$/.test(p.texto) || (/,$/.test(p.texto) && actual.length >= 3)) {
      grupos.push(actual);
      actual = [];
    }
  });
  return grupos;
};

export const SubtitulosCuento = ({ palabras }: { palabras: Palabra[] }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const grupos = agrupar(palabras);
  const grupo =
    grupos.find((g) => ms >= g[0].inicioMs - 80 && ms < g[g.length - 1].finMs + 150) ??
    [...grupos].reverse().find((g) => ms >= g[0].inicioMs);
  if (!grupo) return null;
  return (
    <div style={{ position: "absolute", top: 1345, left: 60, right: 150, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "rgba(10,15,40,0.62)",
          borderRadius: 28,
          padding: "14px 28px",
          fontSize: 54,
          fontWeight: 700,
          lineHeight: 1.25,
          textAlign: "center",
          color: "#fff",
        }}
      >
        {grupo.map((p, i) => {
          const activa = ms >= p.inicioMs - 40 && ms < p.finMs + 40;
          return (
            <span key={i} style={{ color: activa ? "#ffd166" : "#fff" }}>
              {p.texto}
              {i < grupo.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
