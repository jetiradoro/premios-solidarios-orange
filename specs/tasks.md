# Tareas

Marca `[x]` al completar. Cada tarea incluye cómo verificarla. Orden recomendado: de arriba abajo.

## 0. Preparación
- [x] **T0.1 · Scaffold de Astro.** Ejecutar `npm create astro@latest` con la plantilla mínima y TypeScript estricto, en la raíz del repositorio y sin borrar `specs/`, `AGENTS.md` ni `CLAUDE.md`.
  *Verificar:* `npm run dev` sirve la página.
- [x] **T0.2 · Tailwind v4.** Instalar `@tailwindcss/vite` y crear `src/styles/global.css` con `@import "tailwindcss"` y los tokens `@theme` de [004](004-ui.md).
  *Verificar:* una clase `bg-brand` se ve en el navegador.
- [x] **T0.3 · Proxy de dev.** Configurar `/remote` en `astro.config.mjs` ([005](005-pwa-offline.md)).
  *Verificar:* `curl localhost:4321/remote/candidaturas/educacion-digital/` devuelve el HTML.
- [x] **T0.4 · Scripts de `package.json`.** Añadir `dev`, `build`, `preview`, `check` (`astro check`), `scrape` (`tsx scripts/scrape.ts`) e `icons`.
- [x] **T0.5 · `.gitignore`.** Incluir `node_modules`, `dist` y `.astro`.

## 1. Datos
- [x] **T1.1 · Tipos y selectores.** Crear `src/lib/types.ts` ([002](002-data-model.md)) y `src/lib/selectors.ts` ([003](003-scraping.md)).
- [x] **T1.2 · Saneado.** Crear `src/lib/sanitize.ts` con una lista blanca de etiquetas que funcione en el navegador y con linkedom.
- [x] **T1.3 · Parser compartido.** Crear `src/lib/parse.ts` con `parseCategory` y `parseDetail`.
  *Verificar:* ejecutarlo sobre el HTML descargado de una categoría y de un detalle (por ejemplo, `conecta-tea`: id 299, 302 votos, logo `logo-autismo.jpg`, 5 datos).
- [x] **T1.4 · Scraper.** Crear `scripts/scrape.ts` con `linkedom`, concurrencia de 4 y salida en `src/data/*.json`, más un resumen y avisos.
  *Verificar:* `npm run scrape` genera 3 categorías y unos 99 proyectos.
- [ ] **T1.5 · Datos en el repo.** Hacer commit de los JSON generados.

## 2. UI base
- [x] **T2.1 · Layout.** Crear `Base.astro` con metas de viewport y *safe-area*, `theme-color`, fondo explícito del `body` y modo oscuro. Cargar antes la skill `artifact-design`.
- [x] **T2.2 · Componentes.** Crear `Logo.astro` (caja de 44 o 56 px, `object-contain` e iniciales de respaldo), `ProjectRow.astro`, `CategorySection.astro`, `SyncButton.astro` y `Toast.astro`.
- [x] **T2.3 · Home.** Crear `src/pages/index.astro`: secciones por categoría, ordenadas por votos de `votes.json` y con insignias en el top 3.
  *Verificar:* se ve bien a 360 px y todos los logos tienen el mismo tamaño.
- [x] **T2.4 · Detalle.** Crear `src/pages/proyecto/[slug].astro` con `getStaticPaths`, las secciones de [004](004-ui.md) y los atributos `data-field`.
  *Verificar:* `npm run build` genera una página por proyecto.

## 3. Votos en vivo y sync
- [x] **T3.1 · Acceso a `localStorage`.** Crear `src/lib/storage.ts` con `get`/`set` seguros en `try/catch`.
- [x] **T3.2 · Votos de la home.** Crear `src/lib/votes.ts`:
  - pinta la caché, hace el `fetch` de las 3 categorías, parsea, guarda, actualiza las cifras, reordena las filas y actualiza las insignias;
  - muestra "Actualizado hace X".

  *Verificar:* con la red bloqueada en las DevTools se ven los últimos votos y aparece el toast de error.
- [x] **T3.3 · Botón sync de la home.** Conectar el `SyncButton` con el estado de carga y el debounce.
- [x] **T3.4 · Pull-to-refresh.** Crear `src/lib/ptr.ts`: tirar más de 70 px estando en `scrollY = 0`, con indicador y respeto de `prefers-reduced-motion`.
  *Verificar:* funciona en un móvil real o con la emulación táctil.
- [x] **T3.5 · Sync del detalle.** Crear `src/lib/project-sync.ts`:
  - al cargar, aplica el override y refresca los votos;
  - el botón sync hace el `fetch` del detalle, parsea, guarda `project:v1:{id}`, vuelve a pintar y muestra el toast.

  *Verificar:* el override se mantiene tras recargar.
- [x] **T3.6 · Puesto en la categoría.** Calcular "Puesto N de M" en el detalle a partir de `votes:v1`.

## 4. PWA
- [x] **T4.1 · Iconos.** Crear `public/favicon.svg` (propio, sin el logo de Orange) y generar los iconos con `@vite-pwa/assets-generator`.
- [x] **T4.2 · Manifest y service worker.** Configurar `workbox-build` (integración en `integrations/pwa-sw.mjs`) y el manifest estático y las estrategias de Workbox de [005](005-pwa-offline.md), y registrar el SW.
  *Verificar:* en DevTools > Application el manifest es válido, el SW está activo y funciona sin conexión.
- [x] **T4.3 · Metas iOS.** Añadir `apple-touch-icon` y `apple-mobile-web-app-capable`.

## 5. Despliegue y cierre
- [x] **T5.1 · nginx.** Crear `deploy/default.conf` (nginx dentro del contenedor) con el server estático y el proxy `/remote/` restringido a `GET` y a `/candidatura(s)/`.
- [x] **T5.2 · README.md.** Documentar el arranque, el scrape, el build y el despliegue.
- [ ] **T5.3 · Revisión final.** Pasar `npm run check` y `npm run build` y hacer una prueba en un móvil real (instalar, abrir sin conexión y sincronizar).
  *Estado:* `check` y `build` pasan; instalable y offline comprobados en Chrome de escritorio. Falta la prueba en un móvil real (incluido el pull-to-refresh táctil), que requiere HTTPS.
- [x] **T5.4 · Specs al día.** Actualizar el **Estado** de las specs a `implementada` y anotar cualquier desviación. (004 queda `aprobada` hasta cerrar T6.1.)

## 6. Mejoras de la home
- [x] **T6.1 · Buscador y sin scroll horizontal.** Buscador fijo con marcado de coincidencias y scroll a la primera ([004](004-ui.md)); accesos a categorías en cuadrícula de 3 columnas.
  *Verificar:* a 360 px no hay scroll horizontal; buscar "colegio" marca filas sin ocultar ninguna y hace scroll a la primera; el marcado se mantiene tras un sync.

## 7. Despliegue con Docker
- [x] **T7.1 · Contenedor.** `Dockerfile` en dos etapas, `.dockerignore` y `docker-compose.yml` en la red `docker-net` con `VIRTUAL_HOST` (ver [005](005-pwa-offline.md)).
  *Verificado:* la imagen se construye; en contenedor, la home y el detalle dan 200, `/remote/candidaturas/educacion-digital/` devuelve 33 tarjetas, `POST` da 403 y `/remote/wp-json/` da 404.
- [ ] **T7.2 · Publicar en el VPS.** Definir `SOLIDARIOS_HOST`, apuntar el dominio y ejecutar `docker compose up -d --build`.
  *Verificar:* la URL pública carga por HTTPS, se puede instalar la PWA y los votos se actualizan.
