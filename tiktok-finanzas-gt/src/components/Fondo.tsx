import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { color } from "../tema";

const MONEDAS = Array.from({ length: 14 }, (_, i) => ({
  x: random(`x${i}`) * 1080,
  y: random(`y${i}`) * 1920,
  tam: 50 + random(`t${i}`) * 90,
  vel: 0.4 + random(`v${i}`) * 0.9,
  fase: random(`f${i}`) * Math.PI * 2,
}));

export const Fondo = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const giro = frame * 0.15;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${160 + Math.sin(frame / 90) * 10}deg, ${color.fondo1} 0%, ${color.fondo2} 55%, ${color.fondo1} 100%)`,
      }}
    >
      {/* resplandor */}
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          left: -110 + Math.sin(frame / 70) * 60,
          top: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color.celeste}40 0%, transparent 65%)`,
          transform: `rotate(${giro}deg)`,
        }}
      />
      {MONEDAS.map((m, i) => {
        const y = (((m.y - frame * m.vel) % (height + 200)) + height + 200) % (height + 200) - 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: m.x + Math.sin(frame / 40 + m.fase) * 25,
              top: y,
              width: m.tam,
              height: m.tam,
              borderRadius: "50%",
              border: `4px solid ${color.oro}`,
              color: color.oro,
              fontSize: m.tam * 0.5,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.12,
              transform: `scaleX(${Math.cos(frame / 25 + m.fase)})`,
            }}
          >
            Q
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
