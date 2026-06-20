# Olist Dashboard - Fullstack Analytics

Dashboard analitico para el dataset publico de Olist (e-commerce brasileno). Construido con Next.js 15 (App Router), Express 4, PostgreSQL 16 y Prisma 5.

---

## Setup, Comandos y URLs

### Requisitos

- Docker + Docker Compose
- Node.js 20+ (para desarrollo local sin Docker)

### Ejecucion con Docker (produccion local)

```bash
docker compose up --build
```

Esto levanta tres servicios:

| Servicio  | Puerto | URL                          |
|-----------|--------|------------------------------|
| Frontend  | 5173   | http://localhost:5173        |
| Backend   | 3000   | http://localhost:3000        |
| Postgres  | 5432   | postgresql://localhost:5432  |

El backend ejecuta el ETL automaticamente al arrancar (crea esquemas, carga CSVs, construye el star schema) y luego inicia el servidor Express.

### Desarrollo local (sin Docker)

**Backend:**

```bash
cd backend
cp .env.example .env   # configurar DATABASE_URL
npm install
prisma generate
npm run dev            # tsx watch, hot-reload en :3000
npm run etl            # ejecutar ETL manualmente
npm test               # tests unitarios + integracion
```

**Frontend:**

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev  # :5173
npm run build
npm run lint
```

### Endpoints de la API

| Metodo | Ruta                  | Descripcion                          |
|--------|-----------------------|--------------------------------------|
| GET    | /health               | Health check                         |
| GET    | /kpis                 | KPIs globales con filtros            |
| GET    | /trend/revenue        | Evolucion temporal de revenue        |
| GET    | /rankings/products    | Top productos por GMV o revenue      |

Todos los endpoints aceptan query params: `from`, `to`, `customer_state`, `order_status`, `category`.

---

## Arquitectura

```
+------------------+       +-------------------+       +------------------+
|                  |       |                   |       |                  |
|   Frontend       | HTTP  |   Backend         | SQL   |   PostgreSQL     |
|   Next.js 15     +------>+   Express 4       +------>+   raw / clean    |
|   React 19       |       |   Hexagonal Arch  |       |   / gold         |
|   CSS Modules    |       |   Prisma 5        |       |   (3 esquemas)   |
|   SVG nativo     |       |   csv-parse       |       |                  |
+------------------+       +-------------------+       +------------------+
                                   |
                                   | Arranque
                                   v
                            +-------------------+
                            |   ETL Pipeline    |
                            |   4 pasos secuenc.|
                            +-------------------+
```

### Flujo ETL

```
data/*.csv (9 archivos Olist)
       |
       v
01_init_schemas.sql   --> raw, clean, gold schemas
       |
       v
02_create_raw_tables  --> 8 tablas raw (todo TEXT)
       |
       v
03_raw_to_clean.sql   --> CAST a tipos, NULLIF, correccion nombres
       |
       v
04_clean_to_gold.sql  --> star schema en gold
```

### Patron backend: Hexagonal (Ports & Adapters)

- **Domain**: entidades (`KpiSummary`, `RevenueTrend`, `ProductRanking`), puerto `IKpiRepository`
- **Application**: casos de uso (`GetKpis`, `GetRevenueTrend`, `GetTopProducts`)
- **Infrastructure**: `PrismaKpiRepository`, PrismaClient, ETL orchestrator
- **Adapters (HTTP)**: controllers, routes, DTOs, middlewares de validacion

---

## Modelo Estrella (Star Schema)

### Grano

Cada fila en `gold.fact_sales` representa **un item de una orden** (grano: `order_id` + `order_item_id`).

### Tablas

| Tabla | Tipo | Columnas clave | Foraneas |
|-------|------|----------------|----------|
| `gold.dim_customer` | Dimension | `customer_sk` (PK), `customer_id`, `customer_city`, `customer_state` | — |
| `gold.dim_product` | Dimension | `product_sk` (PK), `product_id`, `product_category_name`, `product_category_name_english` | — |
| `gold.dim_seller` | Dimension | `seller_sk` (PK), `seller_id`, `seller_city`, `seller_state` | — |
| `gold.dim_date` | Dimension | `date_sk` (PK), `full_date`, `year`, `month`, `day`, `week`, `quarter` | Referenciada desde `fact_sales.date_sk` |
| `gold.dim_order` | Dimension | `order_sk` (PK), `order_id`, `order_status`, timestamps, `is_delivered`, `is_canceled`, `is_on_time` | — |
| `gold.fact_sales` | Hechos | `fact_sk` (PK), `price`, `freight_value`, `gmv`, `payment_value_allocated`, `payment_type`, `payment_installments`, `review_score` | `customer_sk`, `product_sk`, `seller_sk`, `order_sk`, `date_sk` |

### Diagrama del modelo estrella

```
dim_customer <---+
                 |
dim_product  <---+--- fact_sales ---> dim_date
                 |
dim_seller   <---+
                 |
dim_order    <---+
```

---

## KPIs Implementados

### Regla de asignacion de `payment_value` a nivel item

En Olist, los pagos estan en una tabla aparte (`order_payments`) con grano **orden** (una orden puede tener multiples pagos: tarjeta + boleto, etc.). La tabla de hechos tiene grano **item de orden**.

Para evitar duplicar el ingreso al sumar por item, se asigna proporcionalmente:

```
payment_value_allocated = (price_item / SUM(price) de la orden) * SUM(payment_value) de la orden
```

Esto garantiza que la suma de `payment_value_allocated` entre todos los items de una orden sea exactamente igual al total pagado en esa orden.

### KPIs disponibles

| KPI | Formula | Descripcion |
|-----|---------|-------------|
| GMV | `SUM(gmv)` donde gmv = `price` | Volumen bruto de mercancia (precio de lista) |
| Revenue | `SUM(payment_value_allocated)` | Ingreso real asignado proporcionalmente |
| Total Orders | `COUNT(DISTINCT order_id)` | Numero de ordenes unicas |
| Total Items | `COUNT(*)` | Items vendidos |
| Cancelled Orders | `COUNT(DISTINCT order_id WHERE is_canceled)` | Ordenes canceladas |
| Delivered Orders | `COUNT(DISTINCT order_id WHERE is_delivered)` | Ordenes entregadas |
| On-Time Orders | `COUNT(DISTINCT order_id WHERE is_on_time)` | Entregadas antes de la fecha estimada |
| Average Order Value | `revenue / totalOrders` | Ticket promedio |
| Items Per Order | `totalItems / totalOrders` | Items por orden |
| Cancellation Rate | `cancelledOrders / totalOrders` | Tasa de cancelacion |
| On-Time Rate | `onTimeOrders / deliveredOrders` | Tasa de entrega a tiempo |

### Vistas adicionales

- **Revenue trend**: `SUM(payment_value_allocated)` agrupado por dia o semana (`DATE_TRUNC`)
- **Top productos**: ranking por GMV o Revenue con limite configurable
- **Ordenes por estado**: cantidad de ordenes agrupadas por `customer_state`
- **Ordenes por tipo pago**: revenue agrupado por `payment_type`

---

## Tablas Cargadas (Raw)

Las 9 tablas raw se cargan desde los archivos CSV de Olist. Se importan **sin transformacion**, con todas las columnas como `TEXT` para evitar errores de parseo.

| Tabla raw | Archivo CSV | Filas aprox | Columnas |
|-----------|-------------|-------------|----------|
| `raw.orders` | `olist_orders_dataset.csv` | ~100k | 8 |
| `raw.order_items` | `olist_order_items_dataset.csv` | ~120k | 7 |
| `raw.order_payments` | `olist_order_payments_dataset.csv` | ~100k | 5 |
| `raw.customers` | `olist_customers_dataset.csv` | ~100k | 5 |
| `raw.products` | `olist_products_dataset.csv` | ~33k | 9 |
| `raw.sellers` | `olist_sellers_dataset.csv` | ~3k | 4 |
| `raw.order_reviews` | `olist_order_reviews_dataset.csv` | ~100k | 7 |
| `raw.product_category_name_translation` | `product_category_name_translation.csv` | ~73 | 2 |
| `raw.geolocation` | `olist_geolocation_dataset.csv` | ~1M | 5 |

---

## Reglas de Limpieza (Raw a Clean)

Se crea una tabla espejo en el schema `clean` aplicando:

1. **NULLIF(column, '')::TYPE** — cadenas vacias pasan a NULL, luego se castean al tipo correspondiente (`TIMESTAMP`, `INT`, `NUMERIC(10,2)`, `VARCHAR`)
2. **Correccion de nombres**: `product_name_lenght` → `product_name_length` (error tipografico en el dataset original)
3. **Deduplicacion**: `DISTINCT` en dimensiones para evitar duplicados en el star schema
4. **Agregacion de reviews**: `AVG(review_score)` redondeado a entero por orden

### Manejo de valores nulos

- Fechas de entrega: se permiten NULL (ordenes no entregadas o canceladas)
- `product_category_name`: puede ser NULL (productos sin categoria asignada)
- `review_score`: se usa `LEFT JOIN` con `COALESCE` a 0 en la tabla de hechos
- `payment_value`: se usa `NULLIF(0)` en la division del allocator para evitar division por cero

---

## Decisiones Tecnicas y Tradeoffs

| Decision | Alternativa considerada | Por que se eligio asi |
|----------|------------------------|----------------------|
| Todo TEXT en raw | Introducir tipos desde raw | Evita errores de parseo en la ingestion; los datos sucios no bloquean la carga. El costo es un paso extra de CAST. |
| 3 esquemas (raw/clean/gold) | 2 esquemas o tablas planas | Separacion clara de responsabilidades: raw = snapshot inmutable, clean = validado, gold = modelado para consumo. Mas complejidad de mantenimiento pero trazabilidad total. |
| Asignacion proporcional de payment | Repetir payment total en cada item | La repeticion inflaria revenue al sumar. La asignacion proporcional es la unica forma correcta de mantener el grano item sin distorsionar agregaciones. |
| SVG nativo vs chart library | Chart.js, Recharts, D3 | Ninguna libreria externa; SVG `<polyline>` a mano. Menos peso de bundle, control total, pero mas trabajo para graficos complejos. |
| Sin TanStack Query | React Query, SWR | Proyecto pequeno con 3 endpoints; `useEffect` + `useCallback` es suficiente. Para mas endpoints o cache agresivo, valdria la pena migrar. |
| Prisma solo en gold | Prisma en los 3 esquemas | raw y clean se usan solo en ETL con SQL plano; no necesitan tipos. Prisma en gold da type-safety en las queries de la API. |
| Hexagonal Architecture | Arquitectura plana (controllers → db) | Separar puertos de infraestructura permite testear casos de uso sin base de datos real. Overhead de abstracciones justificado por testabilidad. |
| csv-parse en Node | COPY en SQL puro | `COPY` es mas rapido pero requiere acceso a disco del servidor. csv-parse permite procesamiento en el contenedor sin depender de rutas de archivo en Postgres. |
| Batching de 500 filas | Insert individual o COPY | Balance entre uso de memoria y velocidad de importacion. 500 filas por transaccion evita transacciones demasiado largas. |
| `payment_type` representativo | Array de tipos de pago | Se toma el tipo del pago de mayor valor como representativo. Perder informacion de pagos mixtos es un tradeoff aceptable para simplicidad del modelo. |
