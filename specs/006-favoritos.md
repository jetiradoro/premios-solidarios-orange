# 006 · Favoritos

**Estado:** implementada

El usuario marca con una estrella los proyectos que quiere seguir. Se guardan solo en su dispositivo (no hay cuentas) y aparecen arriba de la home, destacados y con su puesto en la categoría.

## Datos
- Clave `favorites:v1` en `localStorage`: `number[]` con los `id` de proyecto, en el orden en que se marcaron.
- Todo acceso pasa por `src/lib/storage.ts`, desde `src/lib/favorites.ts`.
- Los ids que ya no existen en la página se ignoran (no se borran).

## Interacción
- Cada `ProjectRow` lleva un botón estrella (44×44 px) fuera del `<a>`, a la derecha. `aria-pressed` y `aria-label` ("Añadir a favoritos" / "Quitar de favoritos"). Estrella con borde si no está marcada; rellena de naranja si lo está.
- Marcar o desmarcar no navega, no envía nada a la web origen y funciona sin conexión.
- El estado se mantiene tras recargar y se reaplica al volver por bfcache.

## Sección "Favoritos" de la home
- Va antes de las categorías, con la misma cabecera *sticky* (estrella, "Favoritos" y el número). Si no hay favoritos, está oculta.
- Cada fila es una **copia** de la fila de su categoría (mismo logo, título, entidad, votos y estrella), con:
  - fondo `bg-brand/10` y borde izquierdo naranja;
  - la insignia de puesto **siempre visible** (también fuera del top 3) con el número de posición;
  - una línea "Puesto N de M · {categoría}" bajo la entidad.
- Orden: mejor puesto en su categoría primero; a igualdad, más votos.
- Las copias se regeneran en cada `applyVotes`, así que votos, puesto y orden se mantienen al día tras un sync. Las copias no participan en el buscador (que marca solo las filas originales de cada categoría).
- La fila original sigue en su categoría con la estrella marcada.

## Fuera de alcance
- Estrella en el detalle del proyecto.
- Sincronizar favoritos entre dispositivos.
