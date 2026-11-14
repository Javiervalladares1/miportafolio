export type Visual =
  | { tipo: "numero-grande"; valor: number; etiqueta: string; prefijo?: string; emoji?: string }
  | { tipo: "titulo"; titulo: string; subtitulo?: string; emoji?: string }
  | { tipo: "barras"; items: { etiqueta: string; valor: number; destacado?: boolean }[] }
  | { tipo: "calendario"; mes: string; detalle?: string; emoji?: string }
  | { tipo: "contador"; desde: number; hasta: number; prefijo?: string; etiqueta: string }
  | { tipo: "lista"; items: { emoji: string; texto: string }[] }
  | { tipo: "cta"; texto: string; subtitulo?: string };

export type Escena = { texto: string; visual: Visual };

export type Video = {
  id: string;
  titulo: string;
  voz: string;
  fuente?: string;
  escenas: Escena[];
};

export type Palabra = { texto: string; inicioMs: number; finMs: number };

/** Escena ya cronometrada: con audio real (generar_voz.py) o con tiempos estimados. */
export type EscenaTiempo = Escena & {
  audio?: string;
  duracionFrames: number;
  palabras: Palabra[];
};

export type Props = { video: Video; escenas: EscenaTiempo[] };
