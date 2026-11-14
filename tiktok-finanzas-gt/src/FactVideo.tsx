import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fondo } from "./components/Fondo";
import { EscenaVisual } from "./components/Visuales";
import { Subtitulos } from "./components/Subtitulos";
import { color, fontFamily, zonaSegura } from "./tema";
import { Props } from "./types";

export const FactVideo = ({ video, escenas }: Props) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let inicio = 0;

  return (
    <AbsoluteFill style={{ fontFamily, color: color.texto }}>
      <Fondo />
      {escenas.map((escena, i) => {
        const desde = inicio;
        inicio += escena.duracionFrames;
        return (
          <Sequence key={i} from={desde} durationInFrames={escena.duracionFrames}>
            {escena.audio && <Audio src={staticFile(escena.audio)} />}
            <EscenaVisual visual={escena.visual} duracion={escena.duracionFrames} />
            <Subtitulos palabras={escena.palabras} />
          </Sequence>
        );
      })}

      {/* barra de progreso: ayuda a la retención */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: zonaSegura.izquierda,
          right: zonaSegura.izquierda,
          height: 10,
          borderRadius: 5,
          background: "rgba(255,255,255,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(frame / durationInFrames) * 100}%`,
            height: "100%",
            background: color.verde,
          }}
        />
      </div>

      {video.fuente && (
        <div
          style={{
            position: "absolute",
            bottom: zonaSegura.abajo,
            left: zonaSegura.izquierda,
            right: zonaSegura.derecha,
            fontSize: 26,
            fontWeight: 500,
            color: color.suave,
          }}
        >
          Fuente: {video.fuente}
        </div>
      )}
    </AbsoluteFill>
  );
};
