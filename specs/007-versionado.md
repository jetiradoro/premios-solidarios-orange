# 007 · Versionado y changelog

**Estado:** implementada

## Fuente de la versión
- La versión de la app es el campo `version` de `package.json` (semver `MAJOR.MINOR.PATCH`). No se duplica en ningún otro sitio.
- Se muestra en el pie de la home, junto al recuento de candidaturas: `v1.2.0` (`text-xs text-muted`). Se resuelve en build importando `package.json` en `index.astro`; no hay JS en cliente.

## Historial de versiones
| Versión | Fecha | Commit | Contenido |
|---|---|---|---|
| 1.0.0 | 2026-10-16 | `c7e7618` (first version) | Primera versión: specs 001–005, buscador, Docker |
| 1.2.0 | 2026-10-16 | `7b98d56` | Favoritos ([006](006-favoritos.md)) |

La numeración salta de 1.0.0 a 1.2.0 de forma deliberada.

## Changelog
- Vive en `CHANGELOG.md` (raíz), formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), en español, la versión más reciente primero.
- Cada versión lista sus cambios en `Añadido`, `Cambiado` o `Corregido`.

## Regla de trabajo
Todo cambio de comportamiento sube la versión en `package.json` (minor si es funcionalidad, patch si es un arreglo, major si rompe datos guardados) y añade su entrada en `CHANGELOG.md` en el mismo commit.
