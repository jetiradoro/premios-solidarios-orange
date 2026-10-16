# AGENTS.md

Guía para agentes (Claude Code y otros) que trabajen en este repositorio.

## Qué es
PWA instalable (Astro + Tailwind v4) que hace de *wrapper* de https://voluntariado.masorange.es/ (Premios Solidarios Orange 2026).
- **Datos de categorías y proyectos:** son JSON estáticos que se generan con un scraper.
- **Votos:** se consultan en vivo a través del proxy `/remote/` del mismo origen y se cachean en `localStorage`.
- **Producción:** no hay servidor Node; nginx sirve `dist/` y hace de proxy.

## Fuente de verdad
- **`specs/`:** antes de tocar código, lee `specs/README.md` y la spec que aplique.
- **`specs/tasks.md`:** lista de trabajo. Marca las tareas al completarlas.
- **`specs/plan.md`:** arquitectura y flujo de datos.

## Comandos
| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo (incluye el proxy `/remote`) |
| `npm run scrape` | Regenera `src/data/*.json` desde la web origen |
| `npm run build` | Build estático en `dist/` |
| `npm run preview` | Sirve `dist/` (sin proxy `/remote`) |
| `npm run check` | `astro check` (tipos y plantillas) |
| `npm run icons` | Genera los iconos PWA desde `public/favicon.svg` |

## Mapa
- `scripts/scrape.ts`: el scraper (solo para desarrollo).
- `src/lib/`: lógica en TS vanilla.
  - `selectors.ts`
  - `parse.ts`
  - `sanitize.ts`
  - `storage.ts`
  - `votes.ts`
  - `project-sync.ts`
  - `ptr.ts`
  - `types.ts`
- `src/data/`: JSON generados.
- `src/components/`, `src/layouts/` y `src/pages/`: la UI en Astro.
- `Dockerfile`, `docker-compose.yml` y `deploy/default.conf`: el despliegue (contenedor detrás del nginx-proxy del VPS).

## Reglas
1. **Spec-first:** un cambio de comportamiento empieza actualizando o creando `specs/NNN-*.md`. Si el código se aparta de la spec, actualiza la spec en el mismo cambio.
2. **No edites `src/data/*.json` a mano:** se regeneran con `npm run scrape`.
3. **Los selectores de la web origen solo se definen en `src/lib/selectors.ts`:** `parse.ts` se comparte entre Node y el navegador, así que no dupliques lógica de parseo.
4. **Todo acceso a `localStorage` pasa por `src/lib/storage.ts`:** usa claves versionadas (`votes:v1` y `project:v1:{id}`).
5. **Mobile-first:** diseña para 360 px, con objetivos táctiles de al menos 44 px, contraste AA, modo oscuro y `prefers-reduced-motion`. Antes de maquetar, carga la skill de diseño `artifact-design`.
6. **Sin frameworks de UI:** nada de React ni Vue. Si algo necesita interactividad, usa `<script>` en TS dentro de componentes Astro.
7. **No uses el logo ni la marca de Orange como icono de la app:** el naranja `#FF7900` solo se usa como color de acento.
8. **Respeta la web origen:**
   - el scraper limita la concurrencia a 4 y espera entre peticiones;
   - el cliente solo hace 3 peticiones por refresco;
   - nunca se envían votos desde la app.

## Flujo de trabajo con agentes
- **Una tarea de `specs/tasks.md` cada vez:** impleméntala, verifícala con el criterio que indica, márcala `[x]` y haz commit.
- **Exploración amplia:** usa un subagente de exploración y devuelve solo las conclusiones.
- **Commits:** pequeños y en español, con el formato `tipo: descripción` (`feat`, `fix`, `docs`, `chore`).
- **Antes de dar algo por terminado:** `npm run check` y `npm run build` sin errores y la prueba manual en la vista móvil.

## Verificación rápida
1. `npm run scrape` genera 3 categorías y unos 99 proyectos, sin avisos inesperados.
2. Con `npm run dev`, la home carga los votos y el sync, el pull-to-refresh y el modo sin conexión funcionan.
3. El sync del detalle se mantiene tras recargar.
4. `npm run build` genera una página por proyecto en `dist/proyecto/`.
