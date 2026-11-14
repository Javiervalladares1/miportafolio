export type Personaje = { emoji: string; nombre?: string; tam: number };

export const PERSONAJES: Record<string, Personaje> = {
  santa: { emoji: "🎅", nombre: "Santa", tam: 390 },
  noela: { emoji: "🤶", nombre: "Mamá Noela", tam: 364 },
  copito: { emoji: "🦌", nombre: "Copito", tam: 273 },
  reno: { emoji: "🦌", tam: 364 },
  pino: { emoji: "🧝‍♂️", nombre: "Pino", tam: 312 },
  canela: { emoji: "🧝‍♀️", nombre: "Canela", tam: 312 },
  boton: { emoji: "⛄", nombre: "Botón", tam: 390 },
  plumas: { emoji: "🦉", nombre: "Don Plumas", tam: 299 },
  lucia: { emoji: "👧", nombre: "Lucía", tam: 312 },
  mateo: { emoji: "👦", nombre: "Mateo", tam: 312 },
  raton: { emoji: "🐭", nombre: "Ratoncito", tam: 195 },
  luna: { emoji: "🌝", nombre: "Luna", tam: 338 },
  estrella: { emoji: "⭐", nombre: "Estrellita", tam: 221 },
  nino: { emoji: "🧒", tam: 286 },
  gato: { emoji: "🐈", tam: 221 },
  pajaritos: { emoji: "🐣", tam: 169 },
};

export const resolver = (p: string): Personaje => PERSONAJES[p] ?? { emoji: p, tam: 208 };
