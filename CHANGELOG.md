# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). La versión sale de `package.json` ([specs/007-versionado.md](specs/007-versionado.md)).

## [1.2.1] - 2026-10-16
### Añadido
- La versión de la app también en el header de la home, junto a la fecha de los votos.

## [1.2.0] - 2026-10-16
### Añadido
- Estrella en cada proyecto para marcarlo como favorito, guardada solo en el dispositivo (`favorites:v1`).
- Sección "Favoritos" al inicio de la home, con la insignia y el "Puesto N de M" de la categoría, ordenada por puesto y votos.
- La versión de la app en el pie de la home.

## [1.0.0] - 2026-10-16
### Añadido
- Home con los proyectos por categoría ordenados por votos, con insignias en el top 3.
- Votos en vivo mediante el proxy `/remote/`, con caché en `localStorage` y funcionamiento sin conexión.
- Detalle de cada proyecto con su sincronización y el puesto en la categoría.
- Buscador con marcado de coincidencias, accesos a categorías y pull-to-refresh.
- PWA instalable (manifest, service worker, iconos).
- Scraper de categorías y proyectos (`npm run scrape`).
- Despliegue con Docker y nginx.
