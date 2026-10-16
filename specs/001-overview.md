# 001 · Visión general

**Estado:** implementada

## Objetivo
PWA instalable en el móvil, desarrollada con **Astro + Tailwind CSS**, que actúa de *wrapper* de https://voluntariado.masorange.es/ (XV Premios Solidarios Orange 2026). Muestra las candidaturas por categoría con sus votos y un detalle simplificado de cada proyecto, pensado para el móvil.

## Alcance
- **Home:** una sección por categoría (3). Cada sección muestra la lista de proyectos con logo, nombre y votos a la derecha, ordenada por votos de más a menos.
- **Detalle de proyecto:** las secciones de la web original simplificadas.
- **Datos estáticos** (categorías y proyectos): se generan en desarrollo como JSON.
- **Votos en vivo:** se consultan al entrar, con el botón de sync y con pull-to-refresh. Los últimos votos se guardan en `localStorage`.
- **Sync de detalle:** vuelve a descargar los datos del proyecto y los guarda como *override* en `localStorage`.
- **Fuera de alcance:** votar desde la app. Se enlaza a `{url}#votar` de la web original, porque votar requiere email y reCAPTCHA.

## Análisis de la web origen (16-10-2026)
- **CMS:** WordPress. El tema es `orange-voluntariado`.
- **Periodo de votación:** del 16 al 30 de octubre de 2026. Los 3 proyectos más votados de cada categoría pasan de fase.
- **Categorías:**
  - `https://voluntariado.masorange.es/candidaturas/compromiso-con-el-medio-ambiente/`
  - `https://voluntariado.masorange.es/candidaturas/educacion-digital/`
  - `https://voluntariado.masorange.es/candidaturas/tecnologia-con-proposito/`
- **Listado de cada categoría:** se renderizan todas las candidaturas en el HTML. El botón "Ver más resultados…" solo hace paginación visual en el cliente.
- **Detalle:** `https://voluntariado.masorange.es/candidatura/{slug}/`. El logo de la entidad **solo aparece aquí**, en `div.candidature-detail__logo img`.
- **API REST:**
  - `wp-json/wp/v2/candidature` existe (unas 99 candidaturas, taxonomía `candidature_category`) y tiene CORS, pero **no incluye los votos**.
  - `wp-json/orange-voluntariado/v1/votes` es solo un `POST` para votar.
- **CORS:** el HTML de la web **no envía cabeceras CORS**, así que el navegador no puede leerlo desde otro origen.
- **Fuente de votos:** el atributo `data-vote-count="{postId}"` en los listados y en el detalle.

## Decisiones
1. **Sitio estático (`output: 'static'`), sin servidor Node en producción.** El VPS es temporal y sencillo, y en él nginx solo sirve `dist/`.
2. **Proxy `/remote/` en el mismo origen** para leer el HTML sin CORS:
   - En dev, `vite.server.proxy`.
   - En prod, un bloque `location /remote/` en nginx (ver [005](005-pwa-offline.md)).
3. **El parseo de votos y del detalle se hace en el cliente** con `DOMParser`, usando los mismos selectores y el mismo parser que el scraper ([003](003-scraping.md)).
4. **Persistencia en el cliente con `localStorage`**:
   - los votos se pintan primero desde la caché y después se actualizan desde la red;
   - los overrides del detalle se guardan tras cada sync.
5. **Para cambios permanentes de datos** se vuelve a ejecutar `npm run scrape` y se redespliega.
6. **Imágenes remotas en *hotlink***, cacheadas por el service worker con estrategia CacheFirst.
7. **Orden de la home:** por votos, de más a menos. Los 3 primeros llevan una insignia.

## Riesgos
- Si la web cambia su marcado, se rompen los selectores. Para mitigarlo, están centralizados en `src/lib/selectors.ts` y el scraper avisa de los campos vacíos.
- Que la web origen bloquee o limite las peticiones al proxy. Para mitigarlo, solo se hacen 3 peticiones por refresco de la home y se usa debounce en la UI.
