# Canal TikTok: finanzas en Guatemala

Proyecto Remotion que convierte guiones JSON (`videos/*.json`) en videos verticales 1080×1920.

## Para crear un video nuevo
1. Crear `videos/<id>.json` con el mismo formato que `videos/bono14-aguinaldo.json`.
   Tipos de visual disponibles: ver `src/types.ts`.
2. Registrarlo en el array `videos` de `src/Root.tsx`.
3. `npx tsc` para validar, y `npx remotion still <id> out/prueba.png --frame=30` para revisar.

## Reglas del guion
- Español de Guatemala con voseo ("ganás", "seguime"), tono cercano, nada de jerga financiera sin explicar.
- 35–60 segundos (≈ 100–150 palabras). Primera escena = gancho en forma de pregunta o dato sorprendente.
- Escribí los números en letras dentro de `texto` (la voz los lee mejor); en `visual` van en cifras.
- Una idea por escena, máximo ~25 palabras por escena.
- Solo datos verificables. Llenar `fuente` con la ley, el Banguat, la SAT, el IGSS o la SIB.
  Si no estás seguro de un dato, decilo al usuario en vez de inventarlo.
- No dar recomendaciones de inversión específicas (marcas, productos); es contenido educativo.
- Cerrar con una escena `cta`.
