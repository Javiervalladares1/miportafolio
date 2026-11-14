import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { color } from "../tema";
import { Visual } from "../types";

const useEntrada = (retraso = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - retraso, fps, config: { damping: 14, stiffness: 160 } });
};

const formato = (n: number) => Math.round(n).toLocaleString("en-US");

const Emoji = ({ e, tam = 160, retraso = 0 }: { e?: string; tam?: number; retraso?: number }) => {
  const frame = useCurrentFrame();
  const s = useEntrada(retraso);
  if (!e) return null;
  return (
    <div
      style={{
        fontSize: tam,
        transform: `scale(${s}) rotate(${Math.sin(frame / 12) * 6}deg)`,
        marginBottom: 20,
      }}
    >
      {e}
    </div>
  );
};

const NumeroGrande = ({ v }: { v: Extract<Visual, { tipo: "numero-grande" }> }) => {
  const frame = useCurrentFrame();
  const s = useEntrada();
  const n = interpolate(frame, [0, 28], [0, v.valor], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <>
      <Emoji e={v.emoji} />
      <div
        style={{
          fontSize: 420,
          fontWeight: 900,
          lineHeight: 1,
          color: color.verde,
          transform: `scale(${s})`,
          textShadow: `0 0 80px ${color.verde}66`,
        }}
      >
        {v.prefijo}
        {Math.round(n)}
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, opacity: s }}>{v.etiqueta}</div>
    </>
  );
};

const Titulo = ({ v }: { v: Extract<Visual, { tipo: "titulo" }> }) => {
  const s = useEntrada();
  const s2 = useEntrada(8);
  return (
    <>
      <Emoji e={v.emoji} tam={200} />
      <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1.05, transform: `translateY(${(1 - s) * 60}px)`, opacity: s }}>
        {v.titulo}
      </div>
      {v.subtitulo && (
        <div
          style={{
            marginTop: 36,
            fontSize: 58,
            fontWeight: 700,
            color: color.fondo1,
            background: color.oro,
            padding: "16px 34px",
            borderRadius: 24,
            transform: `scale(${s2})`,
          }}
        >
          {v.subtitulo}
        </div>
      )}
    </>
  );
};

const Barras = ({ v }: { v: Extract<Visual, { tipo: "barras" }> }) => {
  const frame = useCurrentFrame();
  const total = v.items.reduce((a, b) => a + b.valor, 0);
  const contador = Math.round(
    interpolate(frame, [0, 10 + v.items.length * 14], [0, total], { extrapolateRight: "clamp" }),
  );
  return (
    <div style={{ width: "100%" }}>
      <div style={{ fontSize: 96, fontWeight: 900, marginBottom: 50 }}>
        <span style={{ color: color.verde }}>{contador}</span> {contador === 1 ? "pago" : "pagos"} al año
      </div>
      {v.items.map((it, i) => {
        const s = spring({ frame: frame - i * 14, fps: 30, config: { damping: 16 } });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 30 }}>
            <div style={{ width: 300, fontSize: 52, fontWeight: 700, textAlign: "right" }}>{it.etiqueta}</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  width: `${(it.valor / Math.max(...v.items.map((x) => x.valor))) * 100 * s}%`,
                  minWidth: 90 * s,
                  height: 90,
                  borderRadius: 20,
                  background: it.destacado ? color.verde : color.celeste,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 24,
                  fontSize: 54,
                  fontWeight: 900,
                  color: color.fondo1,
                  boxShadow: it.destacado ? `0 0 40px ${color.verde}88` : undefined,
                }}
              >
                {s > 0.6 ? `+${it.valor}` : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Calendario = ({ v }: { v: Extract<Visual, { tipo: "calendario" }> }) => {
  const frame = useCurrentFrame();
  const s = useEntrada();
  const s2 = useEntrada(10);
  return (
    <>
      <div
        style={{
          width: 620,
          borderRadius: 48,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          transform: `scale(${s}) rotate(${(1 - s) * -12 + Math.sin(frame / 20) * 1.5}deg)`,
        }}
      >
        <div style={{ background: "#e63946", padding: "28px 0", fontSize: 80, fontWeight: 900 }}>{v.mes}</div>
        <div style={{ padding: "30px 0 40px", fontSize: 230, lineHeight: 1 }}>{v.emoji ?? "📅"}</div>
      </div>
      {v.detalle && (
        <div style={{ marginTop: 50, fontSize: 70, fontWeight: 900, color: color.oro, opacity: s2 }}>
          {v.detalle}
        </div>
      )}
    </>
  );
};

const Contador = ({ v }: { v: Extract<Visual, { tipo: "contador" }> }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = useEntrada();
  const fin = Math.min(durationInFrames * 0.7, 80);
  const n = interpolate(frame, [15, fin], [v.desde, v.hasta], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const llego = frame >= fin;
  return (
    <>
      <div style={{ fontSize: 80, fontWeight: 700, color: color.suave, textDecoration: "line-through", opacity: s }}>
        {v.prefijo}
        {formato(v.desde)}
      </div>
      <div
        style={{
          fontSize: 210,
          fontWeight: 900,
          color: llego ? color.verde : color.texto,
          transform: `scale(${s * (llego ? 1 + Math.sin((frame - fin) / 3) * 0.02 : 1)})`,
          textShadow: llego ? `0 0 70px ${color.verde}88` : undefined,
        }}
      >
        {v.prefijo}
        {formato(n)}
      </div>
      <div style={{ fontSize: 56, fontWeight: 700 }}>{v.etiqueta}</div>
    </>
  );
};

const Lista = ({ v }: { v: Extract<Visual, { tipo: "lista" }> }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const paso = Math.max(12, Math.floor((durationInFrames * 0.6) / v.items.length));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40, width: "100%" }}>
      {v.items.map((it, i) => {
        const s = spring({ frame: frame - 10 - i * paso, fps: 30, config: { damping: 13 } });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 40,
              padding: "30px 50px",
              borderRadius: 36,
              background: "rgba(255,255,255,0.1)",
              border: `3px solid ${color.verde}55`,
              transform: `translateX(${(1 - s) * -900}px)`,
              fontSize: 90,
              fontWeight: 900,
            }}
          >
            <span style={{ fontSize: 120 }}>{it.emoji}</span>
            {it.texto}
          </div>
        );
      })}
    </div>
  );
};

const Cta = ({ v }: { v: Extract<Visual, { tipo: "cta" }> }) => {
  const frame = useCurrentFrame();
  const s = useEntrada();
  const s2 = useEntrada(10);
  const pulso = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <>
      <div
        style={{
          fontSize: 100,
          fontWeight: 900,
          background: color.verde,
          color: color.fondo1,
          padding: "30px 60px",
          borderRadius: 999,
          transform: `scale(${s * pulso})`,
        }}
      >
        {v.texto} ➜
      </div>
      {v.subtitulo && <div style={{ marginTop: 50, fontSize: 70, fontWeight: 700, opacity: s2 }}>{v.subtitulo}</div>}
    </>
  );
};

export const EscenaVisual = ({ visual, duracion }: { visual: Visual; duracion: number }) => {
  const frame = useCurrentFrame();
  const salida = interpolate(frame, [duracion - 8, duracion], [1, 0], { extrapolateLeft: "clamp" });
  const contenido: Record<Visual["tipo"], () => React.ReactNode> = {
    "numero-grande": () => <NumeroGrande v={visual as never} />,
    titulo: () => <Titulo v={visual as never} />,
    barras: () => <Barras v={visual as never} />,
    calendario: () => <Calendario v={visual as never} />,
    contador: () => <Contador v={visual as never} />,
    lista: () => <Lista v={visual as never} />,
    cta: () => <Cta v={visual as never} />,
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 230,
        height: 900,
        left: 70,
        right: 110,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: salida,
        transform: `scale(${0.96 + salida * 0.04})`,
      }}
    >
      {contenido[visual.tipo]()}
    </div>
  );
};
