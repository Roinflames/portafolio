# portafolio

App unificada para operar portafolio en 4 frentes:
- `Delivery`: avance de proyectos, prioridad, bloqueos.
- `Comercial`: prospección, embudo, oportunidades y ventas.
- `IA Suscripción`: control de uso por plan (cupos, consumo, sobrecupo, MRR).
- `Comunidad`: salud de comunidad, eventos e incidentes.

## Estructura de datos
- `portfolio-metrics.json` (generado): consolidado de `metrics.json` por repo.
- `sales-metrics.json`: datos comerciales semilla.
- `ai-subscriptions.json`: datos semilla de suscripciones IA.
- `community-ops.json`: operación de comunidad.

## Comercial editable desde cero
- La pestaña `Comercial` permite crear, editar y eliminar oportunidades desde la UI.
- Botón `Partir de cero`: limpia todas las oportunidades y recalcula KPIs.
- Botón `Restaurar demo`: vuelve al dataset base de `sales-metrics.json`.
- Persistencia remota: API (`/api/sales`) + Neon.

## IA Suscripción editable desde cero
- La pestaña `IA Suscripción` permite crear, editar y eliminar suscripciones.
- Mide estado por suscripción (`active`, `past_due`, `canceled`) y sobrecupo.
- KPIs: suscripciones activas, MRR, sobrecupo, uso promedio.
- Botón `Partir de cero`: deja el módulo IA sin registros.
- Botón `Restaurar demo`: vuelve al dataset base de `ai-subscriptions.json`.
- Persistencia remota: API (`/api/ai`) + Neon.

## Delivery editable desde cero
- La pestaña `Delivery` permite crear/editar/eliminar métricas por proyecto sin tocar archivos.
- Botón `Partir de cero`: limpia la tabla completa y recalcúla KPIs.
- Botón `Restaurar demo`: vuelve al consolidado original (`portfolio-metrics.json`).
- Persistencia remota: API (`/api/delivery`) + Neon.
- Cada registro incluye el link al servicio desplegado para acceder fácilmente desde la tabla (columna “Link”) y los exportes JSON mantienen esos URLs.

## Notas
- La pestaña `Notas` permite crear nuevas entradas con proyecto, estado y contexto.
- Persistencia remota: API (`/api/notes`) + Neon.

## Importar/Exportar JSON
- Cada módulo (`Delivery`, `Comercial` y `IA Suscripción`) tiene botones `Exportar JSON` / `Importar JSON`.
- `Exportar JSON` descarga un archivo con la estructura actual (incluye métricas, oportunidades o suscripciones) para compartir o para respaldos.
- `Importar JSON` espera un archivo con la misma estructura; lo carga, recalcula las métricas y persiste el nuevo estado en backend.
- Hay un botón “Más acciones” para los comandos exportar/importar y un toggle “Ocultar periodos” que colapsa la vista de periodos para dejar solo tabla+KPIs cuando quieras trabajar rápido.

## Toggle Plantiwuis vs Comunidad
- El doble botón junto a las pestañas cambia el foco entre “Comunidad virtual” y “Plantiwuis”.
- Al seleccionar Plantiwuis se muestran los KPIs y promociones del canal de feria en la sección contextual, manteniendo el resto de los módulos activos.
- Sirve para preparar el pitch y ver cómo la misma comunidad alimenta el negocio de plantas junto a los demás frentes.
- Las tarjetas de KPI son clicables y el nuevo banner sticky “Comercial · …” recuerda qué contexto se está viendo (Comunidad o Plantiwuis) mientras haces scroll.
- Cuando el toggle está en Plantiwuis los KPIs superiores se reemplazan por métricas específicas del canal de feria (ventas, visitas, revenue, stock); el panel contextual y la tarjeta de detalle reflejan esa vista especializada.
- Las tarjetas del summary son clicables: cada una despliega un texto breve con el contexto detrás de ese KPI (pipeline, CPA, IA, engagement).

## Ventas por periodos y subperiodos
- Bajo la tabla comercial se muestra un panel con selecciones de periodo (trimestre, mes) y el detalle de subperiodos (semana).
- Cada selección recalcula los KPIs de revenue, transacciones y ticket promedio y lista los subperiodos con su revenue/transactions/conversion.
- Puedes editar los datos fuera de la app vía `Exportar JSON` e importar tus propios periodos; la UI recalcula automáticamente al recargar o reimportar.

## Regenerar delivery
```bash
node /home/rreyes/projects/portfolio-metrics/build.mjs
```

## Levantar app local
```bash
cd /home/rreyes/projects/portfolio-metrics
python3 -m http.server 8799
```

Abrir `http://localhost:8799`.

## Backend y persistencia compartida

- Para sincronizar `Delivery`, `Comercial`, `IA Suscripción` y `Notas` entre instancias usamos una API Express desplegada en Render (`https://portafolio-2dy0.onrender.com`), que escribe/lee de la base Neon.
- Antes de arrancar el backend instala dependencias: `npm install`.
- Suministra la variable `NEON_DATABASE_URL='postgresql://neondb_owner:...@.../neondb?sslmode=require&channel_binding=require'` y arranca con `npm start`.
- El backend expone:
  - `GET /api/delivery` / `PUT /api/delivery` – estado de delivery (fallback `portfolio-metrics.json`).
  - `GET /api/sales` / `PUT /api/sales` – estado comercial (fallback `sales-metrics.json`).
  - `GET /api/ai` / `PUT /api/ai` – estado IA (fallback `ai-subscriptions.json`).
  - `GET /api/notes` / `PUT /api/notes` – estado de notas (fallback `notes.json`).
- La UI (`app.js`) resuelve la API por config runtime (`window.__PORTFOLIO_CONFIG__.remoteServiceBase`): en local usa `http://127.0.0.1:3101` y fuera de local usa `https://portafolio-2dy0.onrender.com`; si un endpoint falla, recarga desde el JSON semilla correspondiente.

## Despliegue en Render

- El mismo repo debe empaquetarse vía GitHub Actions y desplegarse en Render. Los pasos mínimos son:
 1. `npm install` para preparar el backend Express y las dependencias del API.
 2. Regenera los JSON semilla si hace falta (`node build.mjs`).
 3. Copiar los archivos estáticos (`index.html`, `styles.css`, `app.js`, `*.json`) en la carpeta pública del servicio (ya lo hace tu workflow).
 4. Arrancar `npm start` en Render para que sirva la API e indique la misma URL pública al frontend.
- Con esa configuracion Diego abre `https://portafolio-2dy0.onrender.com` y ve la misma data sincronizada de Neon; el front local usa automaticamente `http://127.0.0.1:3101` cuando detecta `localhost`/`127.0.0.1`.
