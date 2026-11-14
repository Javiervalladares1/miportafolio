import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../tema";
import { resolver } from "./personajes";
import { SUELO_Y } from "./Escenarios";
import { Elemento } from "./tipos";

const X: Record<string, number> = { "izq-lejos": 170, izq: 290, centro: 540, der: 790, "der-lejos": 910 };
const Y: Record<string, number> = { arriba: 680, medio: 880, suelo: SUELO_Y };

export const posicion = (pos = "centro") => {
  const partes = pos.split("-");
  let nivel = "suelo";
  if (partes[0] === "arriba" || partes[0] === "medio") nivel = partes.shift()!;
  const h = partes.join("-") || "centro";
  return { x: X[h] ?? 540, y: Y[nivel] };
};

export const Personaje = ({ el, duracion, indice }: { el: Elemento; duracion: number; indice: number }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = resolver(el.p);
  const tam = p.tam * (el.tam ?? 1);
  const { x, y } = posicion(el.pos);
  const accion = el.accion ?? "quieto";
  const retraso = indice * 4;
  const ent = spring({ frame: f - retraso, fps, config: { damping: 14, stiffness: 120 } });
  const lado = x < 540 ? -1 : 1;

  let dx = 0, dy = Math.sin(f / 18 + indice) * 6, rot = 0, esc = 1, sx = el.voltear ? -1 : 1, op = 1;
  let extra: React.ReactNode = null;

  switch (accion) {
    case "entra":
      dx = (1 - ent) * lado * 700;
      break;
    case "sale":
      dx = interpolate(f, [duracion * 0.5, duracion], [0, lado * 800], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      break;
    case "camina":
      dx = interpolate(f, [0, duracion], [-lado * 250, lado * 120]);
      dy = -Math.abs(Math.sin(f / 5)) * 18;
      rot = Math.sin(f / 5) * 4;
      break;
    case "salta":
      dy = -Math.abs(Math.sin(f / 8)) * 110;
      esc = 1 + (Math.abs(Math.sin(f / 8)) < 0.15 ? 0.06 : 0);
      break;
    case "vuela":
      dx = interpolate(f, [0, duracion], [-lado * 380, lado * 200]);
      dy = Math.sin(f / 12) * 50;
      rot = Math.sin(f / 12) * 8;
      break;
    case "cae": {
      const c = interpolate(f, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      dy = (1 - c * c) * -900;
      const golpe = f > 25 ? Math.max(0, 1 - (f - 25) / 12) : 0;
      esc = 1 - golpe * 0.15;
      rot = f > 25 ? 160 - Math.min(160, (f - 25) * 6) : 160 * c;
      break;
    }
    case "tiembla":
      dx = Math.sin(f * 2.2) * 9;
      break;
    case "gira":
      rot = Math.sin(f / 6) * 18;
      break;
    case "duerme":
      rot = -10;
      dy = Math.sin(f / 25) * 5;
      extra = (
        <div style={{ position: "absolute", left: tam * 0.7, top: -40 - ((f * 1.5) % 80), fontSize: 70, opacity: 1 - ((f * 1.5) % 80) / 80 }}>
          💤
        </div>
      );
      break;
    case "saluda":
      rot = Math.sin(f / 4) * 10;
      break;
    case "brilla":
      esc = 1 + Math.sin(f / 6) * 0.08;
      break;
    case "crece":
      esc = ent;
      break;
  }
  if (accion !== "entra" && accion !== "crece" && accion !== "cae") {
    op = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  }
  const brillo = accion === "brilla" ? `drop-shadow(0 0 ${30 + Math.sin(f / 6) * 20}px #ffe680)` : "drop-shadow(0 16px 14px rgba(0,0,0,0.35))";

  return (
    <div
      style={{
        position: "absolute",
        left: x - tam / 2 + dx,
        top: y - tam + dy,
        width: tam,
        height: tam,
        opacity: op,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: tam * 0.85, lineHeight: `${tam}px`, transform: `rotate(${rot}deg) scale(${esc * sx}, ${esc})`, transformOrigin: "50% 90%", filter: brillo }}>
        {p.emoji}
      </div>
      {extra}
      {p.nombre && accion !== "sale" && (
        <div
          style={{
            position: "absolute",
            top: tam + 4,
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontFamily,
            fontWeight: 700,
            fontSize: 38,
            color: "#fff",
            background: "rgba(0,0,0,0.45)",
            padding: "4px 18px",
            borderRadius: 999,
          }}
        >
          {p.nombre}
        </div>
      )}
    </div>
  );
};
