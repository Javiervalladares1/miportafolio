import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../tema";
import { ES_INTERIOR, FondoEscenario, NieveCayendo } from "./Escenarios";
import { Personaje } from "./Personaje";
import { SubtitulosCuento } from "./SubtitulosCuento";
import { EscenaCuentoTiempo, PropsCuento } from "./tipos";

const Escena = ({ escena, fundido }: { escena: EscenaCuentoTiempo; fundido: boolean }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, escena.duracionFrames], [1, 1.045]);
  const negro = fundido ? interpolate(f, [0, 10], [1, 0], { extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <FondoEscenario escenario={escena.escenario} />
        {(escena.elementos ?? []).map((el, i) => (
          <Personaje key={i} el={el} indice={i} duracion={escena.duracionFrames} />
        ))}
        {!ES_INTERIOR[escena.escenario] && <NieveCayendo />}
      </AbsoluteFill>
      {escena.rotulo && <Rotulo texto={escena.rotulo} />}
      <SubtitulosCuento palabras={escena.palabras} />
      <AbsoluteFill style={{ background: "#000", opacity: negro }} />
    </AbsoluteFill>
  );
};

const Rotulo = ({ texto, chico }: { texto: string; chico?: string }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 13 } });
  return (
    <div style={{ position: "absolute", top: 280, left: 60, right: 150, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${s})` }}>
      {chico && (
        <div style={{ fontSize: 40, fontWeight: 700, color: "#0b1d3a", background: "#ffd166", padding: "6px 22px", borderRadius: 999, marginBottom: 14 }}>
          {chico}
        </div>
      )}
      <div
        style={{
          fontSize: 76,
          fontWeight: 900,
          lineHeight: 1.08,
          textAlign: "center",
          color: "#fff",
          WebkitTextStroke: "10px #b3202a",
          paintOrder: "stroke fill",
          textShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        {texto}
      </div>
    </div>
  );
};

export const CuentoVideo = ({ video, escenas }: PropsCuento) => {
  const f = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  let inicio = 0;
  const finUltima = durationInFrames;
  const duracionTitulo = Math.min(escenas[0]?.duracionFrames ?? 90, fps * 4);

  return (
    <AbsoluteFill style={{ fontFamily, background: "#000" }}>
      {escenas.map((e, i) => {
        const desde = inicio;
        inicio += e.duracionFrames;
        return (
          <Sequence key={i} from={desde} durationInFrames={e.duracionFrames}>
            {e.audio && <Audio src={staticFile(e.audio)} />}
            <Escena escena={e} fundido={i === 0 || escenas[i - 1].escenario !== e.escenario} />
          </Sequence>
        );
      })}

      <Sequence durationInFrames={duracionTitulo}>
        <Rotulo texto={video.titulo} chico={`Cuento ${video.numero} · ${video.serie}`} />
      </Sequence>

      {video.proximo && escenas.length > 0 && (
        <Sequence from={finUltima - escenas[escenas.length - 1].duracionFrames}>
          <Rotulo texto={video.proximo} chico="Mañana" />
        </Sequence>
      )}

      {video.musica !== undefined && (
        <Audio
          src={staticFile(`musica/${video.musica}.mp3`)}
          loop
          volume={(fr) => interpolate(fr, [0, 20, durationInFrames - 40, durationInFrames], [0, 0.16, 0.16, 0], { extrapolateRight: "clamp" })}
        />
      )}

      {/* marca del canal */}
      <div style={{ position: "absolute", top: 212, left: 60, fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.8)", opacity: f < 5 ? 0 : 1 }}>
        🎅 Cuentos de Navidad con Santa
      </div>
    </AbsoluteFill>
  );
};
