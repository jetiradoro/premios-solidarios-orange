---
name: spec-driven-development
description: Crear y ejecutar especificaciones, planes y tareas SDD para nuevas funcionalidades y refactors de Batidora. Usar cuando el usuario solicite una especificación, un plan de implementación, un seguimiento de tareas o un cambio funcional.
argument-hint: Describe la funcionalidad, el refactor o el cambio de requisitos que debe especificarse.
---

# Specification-Driven Development

Esta skill define el flujo obligatorio para desarrollar funcionalidades y refactors en Batidora.

## Estructura de una funcionalidad

Cada funcionalidad vive en una carpeta numerada dentro de `specs/`:

```text
specs/<numero>.<nombre-funcionalidad>/
├── spec.md
├── tasks.md
└── plans/
    └── <numero>.<nombre-del-plan>.md
```

Los nombres usan números incrementales y `kebab-case`. La funcionalidad mantiene una única especificación vigente y puede tener varios planes históricos.

## Responsabilidad de cada archivo

### `spec.md`

Es la fuente de verdad funcional actual. Debe contener, como mínimo:

- Metadatos: identificador, estado, versión, fecha de creación y última actualización.
- Problema, objetivo y contexto actual.
- Alcance y exclusiones.
- Actores, casos de uso y flujo funcional.
- Requisitos funcionales identificados como `REQ-XXX`.
- Requisitos no funcionales cuando apliquen.
- Criterios de aceptación verificables.
- Contratos de API, datos, permisos, interfaz y errores cuando correspondan.
- Dependencias, riesgos, decisiones y preguntas abiertas.
- Relación con planes, tareas, pruebas y documentación.
- Historial de cambios.

La especificación describe qué debe hacer el sistema. No debe convertirse en un listado de pasos de implementación.

### `plans/*.md`

Cada plan describe cómo implementar una versión concreta de la especificación. Debe contener:

- Especificación de origen y versión de `spec.md`.
- Estado del plan y tipo de cambio: inicial, ampliación o refactor.
- Objetivo, contexto actual y alcance del plan.
- Decisiones técnicas, dependencias y riesgos.
- Tabla de seguimiento de fases.
- Fases ordenadas con pasos accionables, rutas completas y resultados esperados.
- Código de referencia cuando sea necesario.
- Orden de ejecución y dependencias entre fases.
- Estructura final esperada.
- Criterios de validación.
- Historial de ejecución y evidencias.

Un plan puede actualizar su seguimiento, pero no se debe reescribir su alcance después de comenzar. Si cambia el comportamiento o el alcance, se crea otro plan.

### `tasks.md`

Es el índice histórico y operativo de tareas. Cada tarea debe contener:

- Identificador único, por ejemplo `P01-T01`.
- Requisito relacionado, si aplica.
- Plan y fase de origen.
- Descripción concreta de la operación.
- Estado: `pendiente`, `en curso`, `completada`, `bloqueada` o `cancelada`.
- Evidencia, prueba, ruta modificada o motivo de bloqueo.
- Fecha de inicio y finalización cuando estén disponibles.

Las tareas completadas, bloqueadas o canceladas no se eliminan. Las nuevas tareas se añaden dentro del plan correspondiente.

## Flujo obligatorio

### 1. Solicitud de una nueva funcionalidad

1. Cargar esta skill.
2. Revisar `AGENTS.md`, la estructura existente y las funcionalidades relacionadas.
3. Localizar la especificación afectada o crear una nueva carpeta numerada.
4. Redactar o actualizar `spec.md`.
5. Detener el trabajo y solicitar al usuario la validación explícita de la especificación.

No se debe redactar un plan, crear tareas ni modificar código en esta fase.

### 2. Aprobación de la especificación

La especificación solo se considera aprobada cuando el usuario confirme expresamente que es correcta. El silencio, una respuesta ambigua o una aprobación parcial no permiten avanzar.

Si el usuario solicita cambios, actualizar `spec.md` y volver a solicitar su validación.

### 3. Creación del plan

Después de aprobar `spec.md`:

1. Crear un nuevo archivo dentro de `plans/`.
2. Referenciar la versión exacta de la especificación aprobada.
3. Dividir la implementación en fases ordenadas y verificables.
4. Detallar archivos, operaciones, dependencias, comandos y validaciones.
5. Marcar el plan como `borrador`.
6. Detener el trabajo y solicitar al usuario la validación explícita del plan.

No se debe crear ni actualizar `tasks.md` para ese plan hasta que el usuario lo apruebe.

### 4. Aprobación del plan y tareas

Después de aprobar el plan:

1. Crear o actualizar `tasks.md` con tareas atómicas y trazables.
2. Relacionar cada tarea con una fase y requisito.
3. Marcar el plan como `aprobado` y las tareas nuevas como `pendiente`.
4. Ejecutar las tareas en el orden definido.

No es necesario solicitar una aprobación adicional para comenzar la ejecución de las tareas después de la aprobación del plan.

### 5. Ejecución

Durante la ejecución:

- Leer la especificación, el plan aprobado y las tareas pendientes antes de comenzar.
- Marcar la fase y tarea activa como `en curso`.
- Ejecutar todas las tareas técnicamente posibles sin detenerse entre fases.
- Actualizar estados inmediatamente después de cada resultado verificable.
- Registrar pruebas, comandos, rutas modificadas y bloqueos.
- Detenerse únicamente ante un bloqueo real o una decisión funcional pendiente.
- No marcar como completada una tarea sin evidencia.

### 6. Cierre

Una funcionalidad solo puede marcarse como completada cuando:

- Los requisitos aprobados están implementados o formalmente descartados.
- Las tareas están completadas, canceladas con motivo o bloqueadas con explicación.
- Las pruebas y validaciones tienen evidencia registrada.
- `spec.md` refleja el comportamiento final.
- El plan y la especificación tienen sus estados actualizados.
- La documentación afectada está alineada.
- No quedan tareas implementables sin ejecutar.

## Regla de cambios

### Cambio funcional o refactor

Requiere actualizar `spec.md`, aumentar su versión y crear un nuevo plan. El plan anterior conserva su alcance y queda como historial.

### Corrección de error

No requiere crear un plan nuevo. Debe registrarse como tarea en `tasks.md` y debe actualizar `spec.md` cuando la corrección modifique, aclare o restrinja el comportamiento funcional documentado.

Si una corrección de error termina introduciendo una nueva capacidad o un refactor, deja de ser un bugfix simple y debe seguir el flujo completo de especificación y plan.

### Aclaración sin cambio de comportamiento

Puede actualizar `spec.md` y su historial sin crear un nuevo plan. Debe quedar claro que no cambia requisitos ni criterios de aceptación.

## Estados permitidos

| Artefacto | Estados |
|---|---|
| Especificación | `borrador`, `aprobada`, `en curso`, `completada`, `bloqueada` |
| Plan | `borrador`, `aprobado`, `en curso`, `completado`, `bloqueado`, `sustituido` |
| Tarea | `pendiente`, `en curso`, `completada`, `bloqueada`, `cancelada` |

## Trazabilidad mínima

Cada requisito debe poder seguirse mediante esta relación:

```text
REQ-XXX -> plan -> fase -> tarea -> prueba o evidencia
```

Cuando un requisito no tenga implementación, debe registrarse el motivo y su estado en la especificación y en las tareas.

## Calidad del contenido

- Escribir la documentación en castellano, manteniendo en inglés los nombres técnicos del código.
- Basar la especificación y el plan en el estado real del repositorio.
- Usar rutas relativas completas desde la raíz del proyecto.
- No inventar contratos, comandos, módulos ni resultados de pruebas.
- Mantener separados el comportamiento funcional, la estrategia técnica y el seguimiento operativo.
- Actualizar los tres artefactos cuando el resultado de la implementación cambie el estado de la funcionalidad.
