import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Inter (licencia OFL) va incluida en /public/fonts para no depender de internet al renderizar.
export const fontFamily = "Inter";
for (const [archivo, peso] of [["Inter-Medium.otf", "500"], ["Inter-Bold.otf", "700"], ["Inter-Black.otf", "900"]]) {
  loadFont({ family: fontFamily, url: staticFile(`fonts/${archivo}`), weight: peso });
}
export const FPS = 30;
export const ANCHO = 1080;
export const ALTO = 1920;

export const color = {
  fondo1: "#071a2e",
  fondo2: "#0b3b5c",
  celeste: "#4997d0", // azul de la bandera
  verde: "#2ee59d",   // "dinero"
  oro: "#ffd166",
  texto: "#ffffff",
  suave: "rgba(255,255,255,0.72)",
};

// TikTok tapa ~arriba 150px, abajo ~420px y una franja a la derecha con los botones.
export const zonaSegura = { arriba: 220, abajo: 480, izquierda: 70, derecha: 170 };
