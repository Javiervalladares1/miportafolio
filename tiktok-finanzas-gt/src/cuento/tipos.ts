import { Palabra } from "../types";

export type Escenario = "aldea" | "taller" | "cocina" | "cielo" | "bosque" | "noche";

export type Accion =
  | "quieto" | "entra" | "sale" | "salta" | "vuela" | "cae" | "tiembla"
  | "gira" | "duerme" | "saluda" | "brilla" | "crece" | "camina";

export type Elemento = {
  /** id de un personaje (ver personajes.ts) o un emoji suelto, p. ej. "🎁" */
  p: string;
  /** izq | centro | der | izq-lejos | der-lejos, con prefijo opcional arriba- / medio- */
  pos?: string;
  accion?: Accion;
  /** multiplica el tamaño por defecto */
  tam?: number;
  /** mirar hacia la izquierda (los emoji miran a la izquierda por defecto en la mayoría) */
  voltear?: boolean;
};

export type EscenaCuento = {
  texto: string;
  escenario: Escenario;
  elementos?: Elemento[];
  /** texto grande arriba, p. ej. la moraleja */
  rotulo?: string;
};

export type Cuento = {
  formato: "cuento";
  id: string;
  numero: number;
  serie: string;
  titulo: string;
  proximo?: string;
  voz: string;
  velocidad?: number;
  musica?: "cajita" | "cuna";
  escenas: EscenaCuento[];
};

export type EscenaCuentoTiempo = EscenaCuento & {
  audio?: string;
  duracionFrames: number;
  palabras: Palabra[];
};

export type PropsCuento = { video: Cuento; escenas: EscenaCuentoTiempo[] };
