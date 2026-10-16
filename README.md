# Premios Solidarios Orange 2026 · PWA

PWA instalable (Astro + Tailwind v4) que muestra las candidaturas de https://voluntariado.masorange.es/ por categoría, con sus votos, y un detalle de cada proyecto pensado para el móvil.

- Categorías y proyectos: JSON estáticos generados con `npm run scrape`.
- Votos: se consultan al entrar, con el botón de sync y con pull-to-refresh, y se guardan en `localStorage`.
- Detalle: el botón de sync vuelve a leer el proyecto y lo guarda en el navegador.
- Sin servidor Node en producción: nginx sirve `dist/` y reenvía `/remote/` a la web origen.

Más detalle en [`specs/`](specs/README.md) y [`AGENTS.md`](AGENTS.md).

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:4321 (incluye el proxy /remote)
npm run scrape     # regenera src/data/*.json desde la web origen
npm run check      # tipos y plantillas
npm run build      # genera dist/ y el service worker
npm run preview    # sirve dist/
npm run icons      # regenera los iconos desde public/favicon.svg
```

## Despliegue en el VPS (Docker + nginx-proxy)

El VPS ya tiene un `nginx-proxy` (`~/www/proxy`) que publica los contenedores de la red `docker-net` según su `VIRTUAL_HOST`. Este proyecto es un contenedor más: el `Dockerfile` compila el sitio y un nginx interno sirve `dist/` y reenvía `/remote/` a la web origen (`deploy/default.conf`).

```bash
git clone <repo> && cd proyectos-orange     # o git pull
cp .env.example .env                        # y pon tu dominio en SOLIDARIOS_HOST
docker compose up -d --build
```

- El dominio debe apuntar al VPS (o a Cloudflare, como el resto de servicios) y llegar por HTTPS: es obligatorio para instalar la PWA.
- No hace falta Node en el VPS: la compilación ocurre dentro de la imagen.
- Si cambian los datos de la web: `npm run scrape`, commit de `src/data/` y `docker compose up -d --build`.
- Si el proxy tiene activo `acme-companion`, descomenta `LETSENCRYPT_HOST` en `docker-compose.yml`.
