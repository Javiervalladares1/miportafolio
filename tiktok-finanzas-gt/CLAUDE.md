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

# Cuentos de Navidad con Santa (videos/navidad/)
- Guiones en JSON con `"formato": "cuento"`; tipos en `src/cuento/tipos.ts`. Registrar cada uno en `videos/navidad/index.ts`.
- Seguir el plan `planes/navidad-50-videos.md` (personajes, fechas, enseñanza de cada uno).
- Español neutro (tú/ustedes, sin voseo), frases cortas para niños. 160–190 palabras ≈ 60–65 s.
- Siempre empieza con "¡Jo, jo, jo! Hola, pequeños." y termina anunciando el cuento de mañana (campo `proximo`).
- Diálogos sin guiones largos: "¡Tengo una idea!, dijo Pino." (la voz y los subtítulos funcionan mejor así).
- Solo personajes originales; nada de Rodolfo, Grinch, Frosty ni personajes de películas.
- Voz: `python3 scripts/voz_kokoro.py videos/navidad/<id>.json` (em_santa, velocidad 0.95; 0.88 en cuentos para dormir con musica "cuna").
