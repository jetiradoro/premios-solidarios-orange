---
name: usability-review
description: "Usar cuando se solicite una revision de usabilidad, UX o diseno de UI en Batidora: auditar pantallas, componentes o CRUDs, detectar problemas de accesibilidad, jerarquia visual, formularios, navegacion y experiencia de usuario, y proponer correcciones accionables. Tambien usar para hacer una revision previa a entregar una pantalla de frontend."
metadata:
  audience: frontend
  workflow: ui-review
  unifies: web-design-guidelines, ui-ux-pro-max, extract-design-system
---

# Revision de usabilidad y diseno UI (Batidora)

Esta skill unifica tres skills externas y las alinea con las convenciones de Batidora para auditar y mejorar la experiencia de usuario sin romper la linea de diseno existente.

## Skills que unifica

| Skill | Para que se usa | Ubicacion |
|-------|-----------------|-----------|
| `web-design-guidelines` | Auditoria de correccion: a11y, spacing, tipografia, interaccion, salida `archivo:linea` | `.opencode/skills/web-design-guidelines` |
| `ui-ux-pro-max` | Reglas UX priorizadas (119 guidelines), paletas, tipografia, guia por stack (Vue) | `.opencode/skills/ui-ux-pro-max` |
| `extract-design-system` | Extraer tokens de una web publica de referencia (opcional, solo con autorizacion) | `.opencode/skills/extract-design-system` |

Carga la skill externa que corresponda con la herramienta `skill` antes de usarla.

## Reglas de Batidora (prevalecen siempre)

Estas reglas tienen prioridad sobre cualquier recomendacion de las skills externas:

- Respetar `frontend-ux-ui` y `vue-theme`: componentes comunes, theme v4.2, Bootstrap 5, grid nativo.
- Tablas siempre con `@/common/components/AppDatatable.vue` (ver `vue-datatable`).
- Borrado en dos pasos con `@/common/components/ConfirmActionModal.vue`. Prohibido `window.confirm()`.
- Botones solo desde `src/common/components/buttons`.
- Campos de texto libre con `@/common/components/TextCounterInput.vue`.
- Todos los textos traducidos (i18n); no literales en plantillas.
- Un unico origen de error visible por evento (`pageErrorMessage` o `store.errorMessage`, nunca ambos).
- Procesos de API con `loadingSpinner.vue`, mostrado al inicio y oculto en `finally`.
- Dark mode solo via `AppThemePanel`/`appOption.appDarkMode`; no duplicarlo por modulo.
- Si la seccion no define permisos, preguntar antes de implementar.
- Separar vistas grandes en subcomponentes y logica independiente.
- No romper la linea visual del proyecto ni introducir CSS ad-hoc o estilos inline innecesarios.

## Flujo de trabajo

### Fase 0 - Contexto
1. Detectar stack (Batidora: Vue 3 + Bootstrap 5 + Pinia).
2. Leer el theme y componentes comunes antes de opinar: `app/src/scss/_custom-variables.scss`, `app/src/scss/_custom.scss`, `app/src/common/stores/app-variable.js`, `app/src/common/components/`.
3. Identificar la pantalla, CRUD o flujo a revisar.

### Fase 1 - Auditoria de correccion (web-design-guidelines)
1. Cargar la skill `web-design-guidelines`.
2. Obtener las guidelines actualizadas y aplicarlas a los archivos indicados.
3. Salida en formato `archivo:linea` con el problema concreto.

### Fase 2 - Reglas UX priorizadas (ui-ux-pro-max)
Consultar por un unico objetivo dominante (2-5 terminos) y priorizar por impacto: accesibilidad (CRITICO), touch/interaccion (CRITICO), rendimiento (ALTO), layout/responsive (ALTO), formularios/feedback, navegacion, tipografia/color, animacion.

```bash
python3 .opencode/skills/ui-ux-pro-max/scripts/search.py "error summary validation" --domain ux
python3 .opencode/skills/ui-ux-pro-max/scripts/search.py "keyboard focus modal" --domain ux
python3 .opencode/skills/ui-ux-pro-max/scripts/search.py "table overflow mobile" --domain ux
```

Nota: en OpenCode el script NO usa `${CLAUDE_PLUGIN_ROOT}`; se invoca por su ruta real dentro de `.opencode/skills/ui-ux-pro-max/scripts/search.py`. Si `python3` no existe, probar `python`.

### Fase 3 - Guia de stack Vue (ui-ux-pro-max)
```bash
python3 .opencode/skills/ui-ux-pro-max/scripts/search.py "accessible form component" --stack vue
python3 .opencode/skills/ui-ux-pro-max/scripts/search.py "datatable keyboard navigation" --stack vue
```

### Fase 4 - Tokens y linea visual
- Para Batidora, la fuente de verdad son los archivos del theme y `app-variable.js`; leerlos directamente.
- Usar `extract-design-system` solo si el usuario pide tomar como referencia una web publica concreta, y nunca sobreescribir el sistema de diseno actual sin confirmacion.

### Fase 5 - Checklist de entrega
- Corregir hallazgos CRITICAL/HIGH antes de MEDIUM/LOW.
- Verificar contraste AA (4.5:1), foco visible, navegacion por teclado y `aria-label` en botones solo-icono.
- Verificar responsive con grid Bootstrap y sin scroll horizontal.
- Verificar estados de carga, vacio y error.
- Confirmar que se usan los componentes comunes obligatorios y textos traducidos.

## Criterios de severidad

| Nivel | Criterio |
|-------|----------|
| CRITICAL | Bloquea uso o accesibilidad (contraste, foco, sin teclado, accion sin confirmacion) |
| HIGH | Afecta claramente la tarea (formularios sin feedback, navegacion confusa, overflow) |
| MEDIUM | Inconsistencia visual o de patrones del proyecto |
| LOW | Pulido estetico menor |

## Resultado esperado

Tabla de hallazgos con: severidad, `archivo:linea`, regla incumplida (skill de origen) y correccion propuesta. Cada hallazgo debe ser accionable y respetar las convenciones de Batidora.

## Cuando NO usar

Tareas de backend, API, base de datos, rendimiento no visual o infraestructura. Tampoco para generar diseno desde cero sin revision: para eso usar `frontend-ux-ui`.
