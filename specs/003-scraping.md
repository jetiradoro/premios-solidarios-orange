# 003 · Scraping y parseo

**Estado:** implementada

## Fuentes
- **Listados (3):** `/candidaturas/{categoria}/`. Contienen todos los proyectos de la categoría y sus votos.
- **Detalle:** `/candidatura/{slug}/`.

## Selectores (`src/lib/selectors.ts`, única fuente de verdad)
| Dato | Selector |
|---|---|
| Item del listado | `li.js-candidature-list-item article.candidature-card` |
| Número | `.candidature-card__number` ("Proyecto 01" → "01") |
| Votos | `[data-vote-count]` (atributo = id, texto = número) |
| Título + URL | `.candidature-card__title a` |
| Entidad | `.candidature-card__entity` |
| Imagen tarjeta | `.candidature-card__image img` |
| Categoría (detalle) | `.candidature-detail__category` (texto + href → slug) |
| Título (detalle) | `h1.candidature-detail__title` |
| Votos (detalle) | `.candidature-detail__votes[data-vote-count]` ("302 votos") |
| Imagen (detalle) | `figure.candidature-detail__image img` |
| Descripción | `.candidature-detail__content` |
| Logo | `.candidature-detail__logo img` |
| Datos | `dl.candidature-detail__data > .candidature-detail__data-item` → `dt` / `dd` |

## Parser compartido (`src/lib/parse.ts`)
- **Funciones puras:**
  - `parseCategory(root): { id, number, title, url, slug, entity, image, votes }[]`
  - `parseDetail(root): Partial<Project> & { votes }`
- **Entrada:** trabajan sobre una interfaz mínima (`querySelector`, `querySelectorAll`, `getAttribute` y `textContent`). Así sirven igual con `DOMParser` en el navegador que con un adaptador `linkedom` en Node.
- **Recomendación:** usar `linkedom` en el script en lugar de `cheerio`, porque da un DOM real y permite reutilizar el código sin adaptadores.
- **Limpieza de texto:** se normalizan los espacios. Los números se extraen con `/\d[\d.]*/` y se les quitan los puntos de miles.
- **Saneado de HTML:** `contentHtml` y `dd` se sanean con una lista blanca de etiquetas.
- **Enlaces:** las URLs relativas se convierten en absolutas.

## Script `scripts/scrape.ts` (`npm run scrape`)
1. Descarga los 3 listados con un `User-Agent` de navegador.
2. Por cada proyecto, descarga el detalle con una concurrencia máxima de 4 y un retardo de 150 ms.
3. Combina los datos de la tarjeta y del detalle y escribe `categories.json`, `projects.json` y `votes.json`, con los proyectos ordenados por categoría y número.
4. Muestra un resumen por categoría y avisa de los proyectos sin `logo`, `image` o `data`.
5. **Idempotente:** si no hay cambios, el diff de los JSON solo afecta a `scrapedAt` y `updatedAt`.

## En el cliente
- **Votos (`src/lib/votes.ts`):** hace `fetch('/remote/candidaturas/{cat}/')` de las 3 categorías en paralelo, aplica `parseCategory`, combina los resultados y los guarda en `votes:v1`.
- **Detalle (`src/lib/project-sync.ts`):** hace `fetch('/remote/candidatura/{slug}/')`, aplica `parseDetail` y guarda el override y los votos de ese proyecto.
- **Errores:** si la respuesta no es `ok` o el parseo devuelve 0 elementos, se considera un error y no se sobrescribe la caché.
