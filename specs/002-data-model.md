# 002 · Modelo de datos

**Estado:** implementada

Los JSON viven en `src/data/` y los genera `npm run scrape`. **No se editan a mano.**

## `categories.json`
```ts
type Category = {
  slug: string;        // "educacion-digital"
  name: string;        // "Educación digital"
  url: string;         // URL absoluta del listado
  order: number;       // 0..2, orden de la home
};
type CategoriesFile = Category[];
```

## `projects.json`
```ts
type DataItem = { label: string; value: string; html?: string }; // de dt/dd; html si dd contiene marcado

type Project = {
  id: number;          // post ID de WordPress (data-vote-count / data-candidature)
  slug: string;        // de la URL /candidatura/{slug}/
  number: string;      // "01" (de "Proyecto 01")
  title: string;
  entity: string;      // organización (.candidature-card__entity)
  entityFull?: string; // nombre largo deducido del alt del logo ("Logotipo de …")
  category: string;    // slug de categoría
  url: string;         // URL absoluta del detalle
  image?: string;      // imagen representativa (src del detalle o de la tarjeta)
  logo?: string;       // src de .candidature-detail__logo img
  contentHtml: string; // .candidature-detail__content saneado (p, br, ul, ol, li, strong, em, a)
  data: DataItem[];    // pares de .candidature-detail__data
  scrapedAt: string;   // ISO
};
type ProjectsFile = Project[];
```

## `votes.json` (snapshot de respaldo)
```ts
type VotesSnapshot = { updatedAt: string; votes: Record<string, number> }; // clave = id
```

## `localStorage`
| Clave | Valor | Uso |
|---|---|---|
| `votes:v1` | `VotesSnapshot` | Últimos votos conocidos. Se pintan al cargar, antes de la red. |
| `favorites:v1` | `number[]` | Ids de los proyectos favoritos ([006](006-favoritos.md)). |
| `project:v1:{id}` | `Partial<Project> & { syncedAt: string }` | Override tras el sync del detalle. Se combina con el JSON al cargar. |

### Reglas
- **Prioridad de votos:** respuesta de red > `votes:v1` > `votes.json`.
- **Prioridad de datos del proyecto:** `project:v1:{id}` > `projects.json`.
- **Versionado de claves:** el sufijo `v1` cambia si cambia el esquema y las claves antiguas se ignoran.
- **Acceso seguro:** todo acceso a `localStorage` va en `try/catch`, para que la app funcione aunque esté bloqueado.
