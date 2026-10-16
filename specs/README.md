# Specs

Especificaciones del proyecto. Flujo **spec-first**: antes de implementar o cambiar comportamiento se crea o actualiza la spec correspondiente.

| Archivo | Contenido |
|---|---|
| [001-overview.md](001-overview.md) | Objetivo, alcance, análisis de la web origen y decisiones de arquitectura |
| [002-data-model.md](002-data-model.md) | Esquema de los JSON y claves de `localStorage` |
| [003-scraping.md](003-scraping.md) | URLs, selectores, parser compartido y regeneración de datos |
| [004-ui.md](004-ui.md) | Pantallas, componentes y tokens de diseño |
| [005-pwa-offline.md](005-pwa-offline.md) | Manifest, service worker, caché y despliegue con nginx |
| [006-favoritos.md](006-favoritos.md) | Proyectos favoritos con estrella y sección destacada en la home |
| [plan.md](plan.md) | Plan de implementación |
| [tasks.md](tasks.md) | Tareas ordenadas con criterios de verificación |

## Convenciones
- Nombre `NNN-tema.md`, numeración correlativa.
- Cada spec indica **Estado** (`borrador` · `aprobada` · `implementada`).
- Si el código se aparta de la spec, se actualiza la spec en el mismo cambio.
