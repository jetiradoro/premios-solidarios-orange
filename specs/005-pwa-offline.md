# 005 · PWA, offline y despliegue

**Estado:** implementada

## Manifest (`public/manifest.webmanifest`, estático)
- **Nombres:** `name: "Premios Solidarios Orange 2026"`, `short_name: "Solidarios"`.
- **Pantalla:**
  - `display: "standalone"`, `start_url: "/"`, `scope: "/"`;
  - `theme_color: "#FF7900"`, `background_color: "#0B0B0B"`.
- **Iconos:** 192 px, 512 px y 512 px *maskable*. Se generan a partir de un `public/favicon.svg` propio, **sin usar el logo de Orange**, con `@vite-pwa/assets-generator`.
- **iOS:** se añaden las metas `apple-mobile-web-app-capable` y `apple-touch-icon`, y `viewport-fit=cover`.

## Service worker (`workbox-build`)
Se genera en `dist/sw.js` desde `integrations/pwa-sw.mjs`, en el hook `astro:build:done`, para que incluya todas las páginas ya renderizadas. `@vite-pwa/astro` no soporta Astro 7 y `vite-plugin-pwa` no ve el HTML que genera Astro. Usa `skipWaiting` y `clientsClaim`, y se registra en `Base.astro` solo en producción.
| Recurso | Estrategia |
|---|---|
| Shell, CSS, JS y páginas HTML generadas (home y todos los detalles) | Precache |
| `https://voluntariado.masorange.es/uploads/**` | `CacheFirst`, `cacheableResponse: {statuses:[0,200]}`, `expiration: {maxEntries: 400, maxAgeSeconds: 30 días}` |
| `/remote/**` | `NetworkOnly`, porque los votos se cachean en `localStorage` |

## Proxy `/remote/`
- **Dev** (`astro.config.mjs`):
```js
vite: { server: { proxy: { '/remote': {
  target: 'https://voluntariado.masorange.es', changeOrigin: true,
  rewrite: p => p.replace(/^\/remote/, ''),
}}}}
```
- **Prod** (`deploy/default.conf`, nginx dentro del contenedor): las rutas `/remote/candidaturas/…` y `/remote/candidatura/…` se reenvían a `https://voluntariado.masorange.es`.
  - Solo `GET`: otros métodos devuelven 403 y cualquier otra ruta de `/remote/` devuelve 404.
  - El destino va en una variable con `resolver 127.0.0.11` para que Docker vuelva a resolver su IP cada 30 s.
  - Se quitan las cookies y se fuerza `Cache-Control: no-cache`.

## Despliegue (Docker + nginx-proxy)
El VPS ya ejecuta `nginxproxy/nginx-proxy` (`~/www/proxy`), que publica los contenedores de la red externa `docker-net` por su `VIRTUAL_HOST`, con Cloudflare por delante.

- **`Dockerfile`:** etapa `node:24-alpine` que ejecuta `npm ci` y `npm run build`, y etapa `nginx:alpine` con `dist/` y `deploy/default.conf`. Usa los JSON ya versionados en `src/data/`; no hace scraping al construir.
- **`docker-compose.yml`:** servicio `solidarios` en `docker-net` con `VIRTUAL_HOST=${SOLIDARIOS_HOST}` y `VIRTUAL_PORT=80`. El dominio se define en `.env` (ver `.env.example`).
- **Cabeceras:** `sw.js` y `manifest.webmanifest` con `no-cache` (el manifest con tipo `application/manifest+json`) y `/_astro/` con `immutable`.
- **HTTPS:** lo proporciona Cloudflare o el proxy. Es obligatorio para instalar la PWA.
- **Actualizar:** `git pull && docker compose up -d --build`.
