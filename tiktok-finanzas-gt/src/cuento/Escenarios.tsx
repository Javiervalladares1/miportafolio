import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Escenario } from "./tipos";

export const SUELO_Y = 1270; // línea donde "pisan" los personajes

const Estrellas = ({ n = 70, hasta = 900 }: { n?: number; hasta?: number }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const tam = 2 + random(`es${i}`) * 5;
        const brillo = 0.4 + 0.6 * Math.abs(Math.sin(f / (20 + random(`ev${i}`) * 40) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`ex${i}`) * 1080,
              top: random(`ey${i}`) * hasta,
              width: tam,
              height: tam,
              borderRadius: "50%",
              background: "#fff",
              opacity: brillo,
              boxShadow: `0 0 ${tam * 3}px #fff`,
            }}
          />
        );
      })}
    </>
  );
};

const Luna = ({ x = 800, y = 330, r = 90 }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 35%, #fffbe8, #f3e3a6)",
      boxShadow: "0 0 80px 30px rgba(255,240,180,0.35)",
    }}
  />
);

const Pino = ({ x, y, h, color = "#1f5e43", nieve = true }: { x: number; y: number; h: number; color?: string; nieve?: boolean }) => {
  const w = h * 0.62;
  const capas = [0, 0.3, 0.55];
  return (
    <g>
      <rect x={x - h * 0.04} y={y - h * 0.12} width={h * 0.08} height={h * 0.14} fill="#4a2c1a" />
      {capas.map((c, i) => {
        const top = y - h + c * h;
        const ancho = w * (0.55 + i * 0.22);
        const alto = h * 0.5;
        return (
          <g key={i}>
            <polygon points={`${x},${top} ${x - ancho / 2},${top + alto} ${x + ancho / 2},${top + alto}`} fill={color} />
            {nieve && (
              <polygon
                points={`${x},${top} ${x - ancho * 0.18},${top + alto * 0.32} ${x},${top + alto * 0.24} ${x + ancho * 0.18},${top + alto * 0.32}`}
                fill="#f4f8ff"
              />
            )}
          </g>
        );
      })}
    </g>
  );
};

const Casa = ({ x, y, w, color }: { x: number; y: number; w: number; color: string }) => {
  const f = useCurrentFrame();
  const h = w * 0.7;
  const luz = 0.8 + Math.sin(f / 15 + x) * 0.1;
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={color} />
      <polygon points={`${x - w * 0.1},${y - h} ${x + w / 2},${y - h - w * 0.5} ${x + w * 1.1},${y - h}`} fill="#f4f8ff" />
      <rect x={x + w * 0.15} y={y - h * 0.75} width={w * 0.25} height={w * 0.22} fill="#ffd36b" opacity={luz} />
      <rect x={x + w * 0.6} y={y - h * 0.75} width={w * 0.25} height={w * 0.22} fill="#ffd36b" opacity={luz} />
      <rect x={x + w * 0.4} y={y - h * 0.42} width={w * 0.2} height={h * 0.42} fill="#6b3b22" />
    </g>
  );
};

const SueloNieve = ({ y = SUELO_Y - 40 }: { y?: number }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="nieve" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7fbff" />
        <stop offset="1" stopColor="#bfd3ea" />
      </linearGradient>
    </defs>
    <path d={`M0 ${y} Q 270 ${y - 50} 540 ${y} T 1080 ${y} V 1920 H 0 Z`} fill="url(#nieve)" />
  </svg>
);

const Guirnalda = () => {
  const f = useCurrentFrame();
  const colores = ["#ff4d4d", "#ffd166", "#2ee59d", "#4cc9f0"];
  return (
    <svg width={1080} height={300} style={{ position: "absolute", top: 230 }}>
      <path d="M -20 30 Q 270 140 540 40 Q 810 -40 1100 70" stroke="#1d5e3a" strokeWidth={10} fill="none" />
      {Array.from({ length: 16 }, (_, i) => {
        const t = i / 15;
        const x = -20 + t * 1120;
        const y = t < 0.5 ? 30 + Math.sin(t * 2 * Math.PI) * 80 : 40 + Math.sin((t - 0.5) * 2 * Math.PI) * 60;
        const on = Math.floor(f / 12 + i) % 3 !== 0;
        const c = colores[i % colores.length];
        return <circle key={i} cx={x} cy={y + 16} r={13} fill={c} opacity={on ? 1 : 0.35} style={{ filter: on ? `drop-shadow(0 0 10px ${c})` : undefined }} />;
      })}
    </svg>
  );
};

const Ventana = ({ x, y }: { x: number; y: number }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 300, height: 340, borderRadius: "150px 150px 12px 12px", border: "18px solid #6b3b22", overflow: "hidden", background: "linear-gradient(#0d1f45, #24427a)" }}>
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`vx${i}`) * 280, top: ((random(`vy${i}`) * 340 + f * (1 + random(`vv${i}`))) % 340), width: 8, height: 8, borderRadius: 4, background: "#fff", opacity: 0.85 }} />
      ))}
      <div style={{ position: "absolute", left: 125, top: 0, width: 14, height: "100%", background: "#6b3b22" }} />
      <div style={{ position: "absolute", top: 160, left: 0, height: 14, width: "100%", background: "#6b3b22" }} />
    </div>
  );
};

const Repisa = ({ y, cosas }: { y: number; cosas: string[] }) => (
  <div style={{ position: "absolute", top: y, left: 420, right: 40 }}>
    <div style={{ display: "flex", justifyContent: "space-around", fontSize: 90, lineHeight: 1 }}>
      {cosas.map((c, i) => <span key={i}>{c}</span>)}
    </div>
    <div style={{ height: 22, background: "#8a5631", borderRadius: 6, boxShadow: "0 10px 20px rgba(0,0,0,0.35)" }} />
  </div>
);

const Interior = ({ pared, cosas1, cosas2, piso }: { pared: string; cosas1: string[]; cosas2: string[]; piso: string }) => (
  <AbsoluteFill style={{ background: pared }}>
    <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 4px, transparent 4px 135px)" }} />
    <Ventana x={70} y={470} />
    <Repisa y={520} cosas={cosas1} />
    <Repisa y={760} cosas={cosas2} />
    <Guirnalda />
    <div style={{ position: "absolute", top: SUELO_Y - 30, left: 0, right: 0, bottom: 0, background: piso }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(255,200,120,0.25), transparent 60%)" }} />
  </AbsoluteFill>
);

const Aurora = () => {
  const f = useCurrentFrame();
  const bandas = [
    { c: "#2ee59d", y: 380, d: 0 },
    { c: "#33d1ff", y: 520, d: 2 },
    { c: "#b388ff", y: 300, d: 4 },
  ];
  return (
    <>
      {bandas.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -300 + Math.sin(f / 60 + b.d) * 120,
            top: b.y + Math.sin(f / 45 + b.d) * 40,
            width: 1700,
            height: 260,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${b.c}88 0%, transparent 70%)`,
            filter: "blur(30px)",
            transform: `rotate(${-12 + i * 8}deg)`,
            opacity: 0.55 + Math.sin(f / 30 + b.d) * 0.25,
          }}
        />
      ))}
    </>
  );
};

const Fondo: Record<Escenario, () => React.ReactNode> = {
  aldea: () => (
    <AbsoluteFill style={{ background: "linear-gradient(#0a1838 0%, #1b3a6e 60%, #2d5591 100%)" }}>
      <Estrellas />
      <Luna />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d={`M0 1080 Q 250 960 520 1060 T 1080 1020 V 1920 H 0 Z`} fill="#c9d9ee" />
        <Casa x={90} y={1130} w={190} color="#a33b3b" />
        <Casa x={760} y={1110} w={210} color="#2f6d8a" />
        <Casa x={430} y={1080} w={150} color="#7c5a2e" />
        <Pino x={340} y={1150} h={260} />
        <Pino x={680} y={1140} h={200} />
        <Pino x={1010} y={1160} h={300} />
      </svg>
      <SueloNieve />
    </AbsoluteFill>
  ),
  bosque: () => (
    <AbsoluteFill style={{ background: "linear-gradient(#07152e, #183a5c 70%, #2b5878)" }}>
      <Estrellas n={50} hasta={700} />
      <Luna x={250} y={360} r={70} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {Array.from({ length: 9 }, (_, i) => <Pino key={`a${i}`} x={i * 135 + 20} y={1120} h={300 + (i % 3) * 60} color="#14402f" />)}
        {Array.from({ length: 6 }, (_, i) => <Pino key={`b${i}`} x={i * 210 + 80} y={1200} h={420 + (i % 2) * 80} color="#1f5e43" />)}
      </svg>
      <SueloNieve />
    </AbsoluteFill>
  ),
  cielo: () => (
    <AbsoluteFill style={{ background: "linear-gradient(#030820, #0d1d4a 60%, #1c3270)" }}>
      <Estrellas n={110} hasta={1500} />
      <Aurora />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d="M0 1380 Q 200 1300 420 1360 T 820 1340 T 1080 1360 V 1920 H 0 Z" fill="#dfe9f7" opacity={0.95} />
        <path d="M0 1450 Q 300 1400 600 1450 T 1080 1430 V 1920 H 0 Z" fill="#c3d4ea" />
      </svg>
    </AbsoluteFill>
  ),
  noche: () => (
    <AbsoluteFill style={{ background: "linear-gradient(#120a33 0%, #2b1d5c 55%, #4a3585 100%)" }}>
      <Estrellas n={90} hasta={1100} />
      <Luna x={820} y={640} r={95} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d={`M0 ${SUELO_Y - 20} Q 540 ${SUELO_Y - 140} 1080 ${SUELO_Y - 20} V 1920 H 0 Z`} fill="#d8d3f2" />
        <Pino x={130} y={SUELO_Y - 40} h={280} color="#2a3f63" />
        <Pino x={960} y={SUELO_Y - 30} h={330} color="#2a3f63" />
      </svg>
    </AbsoluteFill>
  ),
  taller: () => (
    <Interior
      pared="linear-gradient(#6a4026, #4a2a17)"
      cosas1={["🧸", "🚂", "🪀"]}
      cosas2={["🎁", "🪁", "🥁"]}
      piso="linear-gradient(#8a5a36, #5e3a20)"
    />
  ),
  cocina: () => (
    <Interior
      pared="linear-gradient(#b5523b, #8c3a28)"
      cosas1={["🍪", "🥛", "🫖"]}
      cosas2={["🍯", "🥕", "🍲"]}
      piso="repeating-conic-gradient(#f3e6d0 0 25%, #c9b18e 0 50%) 0 0 / 120px 120px"
    />
  ),
};

export const FondoEscenario = ({ escenario }: { escenario: Escenario }) => <>{Fondo[escenario]()}</>;

export const NieveCayendo = ({ cantidad = 60 }: { cantidad?: number }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: cantidad }, (_, i) => {
        const tam = 6 + random(`nt${i}`) * 12;
        const vel = 1.2 + random(`nv${i}`) * 2.5;
        const y = ((random(`ny${i}`) * 2000 + f * vel) % 2000) - 40;
        const x = random(`nx${i}`) * 1080 + Math.sin(f / 30 + i) * 30;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: tam, height: tam, borderRadius: "50%", background: "#fff", opacity: 0.85, filter: tam > 14 ? "blur(1.5px)" : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

export const ES_INTERIOR: Record<Escenario, boolean> = {
  aldea: false, bosque: false, cielo: false, noche: false, taller: true, cocina: true,
};
