# Plan de implementación

**Estado:** aprobado · Tareas en [tasks.md](tasks.md)

## Contexto
Queremos una PWA instalable que haga de *wrapper* de https://voluntariado.masorange.es/. El análisis de la web y las decisiones de arquitectura están en [001-overview.md](001-overview.md).

En resumen:
- Las categorías y los proyectos son estáticos y se guardan como JSON en desarrollo.
- Los votos se consultan en vivo a través del proxy `/remote/` del mismo origen y se cachean en `localStorage`.
- No hay servidor Node en producción: nginx sirve `dist/` y hace de proxy.

## Stack
- **Astro 5:** `output: 'static'`.
- **Tailwind CSS v4:** vía `@tailwindcss/vite`.
- **PWA:** `workbox-build` en una integración de Astro (`@vite-pwa/astro` no soporta Astro 7) y `@vite-pwa/assets-generator`.
- **Scraper (solo dev):** `tsx` y `linkedom`.
- **TypeScript estricto.** Los scripts del cliente son TS vanilla, sin framework de UI.

## Estructura
```
astro.config.mjs        # static, tailwind vite plugin, PWA, dev proxy /remote
package.json            # dev, build, preview, scrape, check, icons
scripts/scrape.ts       # genera src/data/*.json
src/lib/selectors.ts    # selectores CSS (única fuente de verdad)
src/lib/parse.ts        # parseCategory / parseDetail (Node + navegador)
src/lib/sanitize.ts     # lista blanca de HTML
src/lib/storage.ts      # wrappers seguros de localStorage
src/lib/votes.ts        # fetch de votos, caché y reordenado de la home
src/lib/project-sync.ts # sync del detalle + overrides
src/lib/ptr.ts          # pull-to-refresh
src/lib/types.ts        # tipos de 002-data-model
src/data/{categories,projects,votes}.json
src/layouts/Base.astro
src/components/{ProjectRow,CategorySection,SyncButton,Logo,DataGrid,Toast}.astro
src/pages/index.astro
src/pages/proyecto/[slug].astro
src/styles/global.css   # @import "tailwindcss"; @theme
public/favicon.svg, public/icons/*
deploy/default.conf   # nginx del contenedor (ver Dockerfile y docker-compose.yml)
```

## Flujo de datos
1. **Build:** `npm run scrape` genera los JSON y `astro build` produce la home y una página por proyecto mediante `getStaticPaths`.
2. **Carga de la home:**
   1. se pinta con los votos de `votes.json`;
   2. un script inline aplica `votes:v1` de `localStorage` y reordena;
   3. se hace el `fetch` de las 3 categorías por `/remote`, se aplica `parseCategory`, se guarda en `votes:v1` y se reordena.
3. **Sync en la home** (botón o pull-to-refresh): repite el paso 2.3.
4. **Carga del detalle:** se aplica el override `project:v1:{id}` si existe y se pintan los votos de la caché.
5. **Sync en el detalle:** `fetch` de `/remote/candidatura/{slug}/` y `parseDetail`, que actualizan el override, los votos y el DOM.

## Pintado de los overrides
Los elementos editables del detalle llevan `data-field="title|entity|logo|image|content|data|votes"`. `project-sync.ts` los actualiza con funciones de render pequeñas: `DataGrid` tiene una versión equivalente en TS y su HTML se sanea.

## Verificación global
1. `npm run scrape`: 3 categorías y unos 99 proyectos, sin avisos de `logo`, `image` ni `data` vacíos (o justificados).
2. `npm run dev`, en las DevTools en vista móvil:
   - los votos cargan a través de `/remote` y la lista se reordena;
   - el sync y el pull-to-refresh funcionan;
   - sin conexión se muestran los últimos votos.
3. En el detalle, el sync aplica el override y lo mantiene tras recargar.
4. `npm run check` y `npm run build` pasan sin errores, y hay una página HTML por proyecto en `dist/proyecto/`.
5. Se sirve `dist/` con `docker compose up --build` (nginx de `deploy/default.conf`). Lighthouse confirma que la PWA es instalable y que funciona sin conexión.
