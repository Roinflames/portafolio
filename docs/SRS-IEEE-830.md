# SRS - IEEE 830 (Portfolio Metrics)

## 1. Introduccion

### 1.1 Proposito
Definir los requisitos funcionales y no funcionales de `portfolio-metrics` para mantener trazabilidad formal entre cambios, versiones y despliegues.

### 1.2 Alcance
La aplicacion consolida operacion de portafolio en cuatro modulos:
- Delivery
- Comercial
- IA Suscripcion
- Notas

Incluye frontend estatico y backend Node/Express con persistencia en Neon.

### 1.3 Definiciones
- SRS: Software Requirements Specification
- KPI: Key Performance Indicator
- API remota: endpoints `/api/delivery`, `/api/sales`, `/api/ai`, `/api/notes`

## 2. Descripcion general

### 2.1 Usuarios
- Owner del portafolio
- Operadores comerciales
- Operadores delivery

### 2.2 Restricciones
- Persistencia principal en backend remoto + Neon.
- Frontend debe funcionar en local y en produccion.
- Deploy objetivo: Render.

## 3. Requisitos especificos

### 3.1 Requisitos funcionales
- RF-01: El sistema debe permitir crear, editar y eliminar registros de Delivery.
- RF-02: El sistema debe permitir crear, editar y eliminar oportunidades Comerciales.
- RF-03: El sistema debe permitir crear, editar y eliminar suscripciones IA.
- RF-04: El sistema debe permitir crear y listar notas.
- RF-05: El sistema debe exportar/importar JSON por modulo.
- RF-06: El sistema debe persistir cambios via API remota por modulo.
- RF-07: El sistema debe cargar datos desde API y usar fallback a JSON semilla si la API falla.

### 3.2 Requisitos no funcionales
- RNF-01: El backend debe exponer healthcheck (`/health`).
- RNF-02: El backend debe registrar logs estructurados.
- RNF-03: El frontend debe ser servible como estatico via nginx.
- RNF-04: El despliegue debe soportar entorno local y Render.

## 4. Trazabilidad de versiones

| Version | Fecha | Cambios principales | Requisitos impactados |
|---|---|---|---|
| 1.1.0 | 2026-02-19 | Persistencia remota por modulo (`delivery/sales/ai/notes`), API modular, logger backend (`pino`), docker frontend (`Dockerfile.front`) | RF-01..RF-07, RNF-01..RNF-04 |
| 1.2.0 | 2026-02-23 | Fix rutas `build.mjs` (subdirectorios + versiones), `metrics.json` para todos los repos P1, `ws-health.sh`, `install-hooks.sh`, post-commit hook automático | RF-01, RNF-03 |

## 5. Politica de versionamiento

- La version de release se refleja en `package.json`.
- Toda version debe actualizar esta tabla de trazabilidad.
- Todo cambio de alcance debe referenciar requisitos RF/RNF impactados.

### 5.1 Checklist operativo por release
- [ ] Actualizar `package.json` con version SemVer.
- [ ] Registrar nueva fila en la seccion 4 (fecha, cambios, requisitos impactados).
- [ ] Sincronizar `README.md` con la version publicada.
- [ ] Verificar `GET /health` y persistencia en endpoints API por modulo.
