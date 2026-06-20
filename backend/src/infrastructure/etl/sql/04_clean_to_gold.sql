-- =============================================================================
-- Transformación clean -> gold (Modelo Estrella)
-- =============================================================================
-- Propósito: Poblar las tablas de dimensiones y la tabla de hechos
--            (fact_sales) en el esquema gold a partir de los datos limpios.
--
-- NOTA: El pago en Olist se registra a nivel de orden (order_payments),
--       pero el grano de fact_sales es una fila por ítem de orden (order_items).
--       Para evitar duplicar el pago total en cada fila, se asigna
--       proporcionalmente según el peso del precio del ítem sobre el total
--       de la orden (payment_value_allocated).
-- =============================================================================

-- 1. Dimensión: dim_customer (clientes)
DROP TABLE IF EXISTS gold.dim_customer CASCADE;
CREATE TABLE gold.dim_customer (
    customer_sk  SERIAL PRIMARY KEY,
    customer_id  VARCHAR(50) UNIQUE NOT NULL,
    customer_city VARCHAR(100),
    customer_state CHAR(2)
);
TRUNCATE TABLE gold.dim_customer CASCADE;
INSERT INTO gold.dim_customer (customer_id, customer_city, customer_state)
SELECT DISTINCT
    c.customer_id,
    c.customer_city,
    c.customer_state
FROM clean.customers c;

-- 2. Dimensión: dim_product (productos con traducción de categoría)
DROP TABLE IF EXISTS gold.dim_product CASCADE;
CREATE TABLE gold.dim_product (
    product_sk                    SERIAL PRIMARY KEY,
    product_id                    VARCHAR(50) UNIQUE NOT NULL,
    product_category_name         VARCHAR(100),
    product_category_name_english VARCHAR(100)
);
TRUNCATE TABLE gold.dim_product CASCADE;
INSERT INTO gold.dim_product (product_id, product_category_name, product_category_name_english)
SELECT DISTINCT
    p.product_id,
    p.product_category_name,
    t.product_category_name_english
FROM clean.products p
LEFT JOIN clean.product_category_name_translation t
    ON p.product_category_name = t.product_category_name;

-- 3. Dimensión: dim_seller (vendedores)
DROP TABLE IF EXISTS gold.dim_seller CASCADE;
CREATE TABLE gold.dim_seller (
    seller_sk    SERIAL PRIMARY KEY,
    seller_id    VARCHAR(50) UNIQUE NOT NULL,
    seller_city  VARCHAR(100),
    seller_state CHAR(2)
);
TRUNCATE TABLE gold.dim_seller CASCADE;
INSERT INTO gold.dim_seller (seller_id, seller_city, seller_state)
SELECT DISTINCT
    s.seller_id,
    s.seller_city,
    s.seller_state
FROM clean.sellers s;

-- 4. Dimensión: dim_date (fechas derivadas del timestamp de compra)
DROP TABLE IF EXISTS gold.dim_date CASCADE;
CREATE TABLE gold.dim_date (
    date_sk    SERIAL PRIMARY KEY,
    full_date  DATE UNIQUE NOT NULL,
    year       INT,
    month      INT,
    day        INT,
    week       INT,
    quarter    INT
);
TRUNCATE TABLE gold.dim_date CASCADE;
INSERT INTO gold.dim_date (full_date, year, month, day, week, quarter)
SELECT DISTINCT
    o.order_purchase_timestamp::DATE               AS full_date,
    EXTRACT(YEAR  FROM o.order_purchase_timestamp)::INT  AS year,
    EXTRACT(MONTH FROM o.order_purchase_timestamp)::INT  AS month,
    EXTRACT(DAY   FROM o.order_purchase_timestamp)::INT  AS day,
    EXTRACT(WEEK  FROM o.order_purchase_timestamp)::INT  AS week,
    EXTRACT(QUARTER FROM o.order_purchase_timestamp)::INT AS quarter
FROM clean.orders o
WHERE o.order_purchase_timestamp IS NOT NULL;

-- 5. Dimensión: dim_order (detalles de la orden)
DROP TABLE IF EXISTS gold.dim_order CASCADE;
CREATE TABLE gold.dim_order (
    order_sk                      SERIAL PRIMARY KEY,
    order_id                      VARCHAR(50) UNIQUE NOT NULL,
    order_status                  VARCHAR(20),
    order_purchase_timestamp      TIMESTAMP,
    order_approved_at             TIMESTAMP,
    order_delivered_carrier_date  TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP,
    is_delivered                  BOOLEAN DEFAULT FALSE,
    is_canceled                   BOOLEAN DEFAULT FALSE,
    is_on_time                    BOOLEAN DEFAULT FALSE
);
TRUNCATE TABLE gold.dim_order CASCADE;
INSERT INTO gold.dim_order (
    order_id, order_status, order_purchase_timestamp, order_approved_at,
    order_delivered_carrier_date, order_delivered_customer_date,
    order_estimated_delivery_date, is_delivered, is_canceled, is_on_time
)
SELECT
    order_id,
    order_status,
    order_purchase_timestamp,
    order_approved_at,
    order_delivered_carrier_date,
    order_delivered_customer_date,
    order_estimated_delivery_date,
    order_status = 'delivered' AS is_delivered,
    order_status = 'canceled' AS is_canceled,
    CASE
        WHEN order_status = 'delivered'
             AND order_delivered_customer_date IS NOT NULL
             AND order_estimated_delivery_date IS NOT NULL
             AND order_delivered_customer_date <= order_estimated_delivery_date
        THEN TRUE ELSE FALSE
    END AS is_on_time
FROM clean.orders;

-- 6. Tabla de hechos: fact_sales
--    Se calcula el pago proporcional por ítem.
DROP TABLE IF EXISTS gold.fact_sales CASCADE;
CREATE TABLE gold.fact_sales (
    fact_sk                       SERIAL PRIMARY KEY,
    order_id                      VARCHAR(50) NOT NULL,
    order_item_id                 INT NOT NULL,
    customer_sk                   INT REFERENCES gold.dim_customer(customer_sk),
    product_sk                    INT REFERENCES gold.dim_product(product_sk),
    seller_sk                     INT REFERENCES gold.dim_seller(seller_sk),
    order_sk                      INT REFERENCES gold.dim_order(order_sk),
    date_sk                       INT REFERENCES gold.dim_date(date_sk),
    order_purchase_date           DATE,
    order_status                  VARCHAR(20),
    price                         NUMERIC(10,2),
    freight_value                 NUMERIC(10,2),
    gmv                           NUMERIC(10,2),
    payment_value_allocated       NUMERIC(10,2),
    payment_type                  VARCHAR(20),
    payment_installments          INT,
    review_score                  INT,
    order_purchase_timestamp      TIMESTAMP,
    order_approved_at             TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP,
    is_delivered                  BOOLEAN DEFAULT FALSE,
    is_canceled                   BOOLEAN DEFAULT FALSE,
    is_on_time                    BOOLEAN DEFAULT FALSE
);
TRUNCATE TABLE gold.fact_sales;

WITH order_prices AS (
    -- Precio total por orden (denominador para la proporción)
    SELECT
        order_id,
        SUM(price) AS total_order_price
    FROM clean.order_items
    GROUP BY order_id
),
order_payments_agg AS (
    -- Pago total por orden y tipo de pago principal (el de mayor valor).
    -- Se usa DISTINCT ON con ORDER BY payment_value DESC para elegir
    -- el tipo representativo.
    SELECT DISTINCT ON (op.order_id)
        op.order_id,
        SUM(op.payment_value) OVER (PARTITION BY op.order_id) AS total_payment,
        op.payment_type,
        op.payment_installments
    FROM clean.order_payments op
    ORDER BY op.order_id, op.payment_value DESC
),
order_reviews_agg AS (
    -- Review score promedio por orden (redondeado al entero más cercano)
    SELECT
        order_id,
        ROUND(AVG(review_score))::INT AS avg_review_score
    FROM clean.order_reviews
    GROUP BY order_id
)
INSERT INTO gold.fact_sales (
    order_id, order_item_id, customer_sk, product_sk, seller_sk, order_sk,
    date_sk, order_purchase_date, order_status, price, freight_value, gmv,
    payment_value_allocated, payment_type, payment_installments, review_score,
    order_purchase_timestamp, order_approved_at, order_delivered_customer_date,
    order_estimated_delivery_date, is_delivered, is_canceled, is_on_time
)
SELECT
    o.order_id,
    oi.order_item_id,
    dc.customer_sk,
    dp.product_sk,
    ds.seller_sk,
    dor.order_sk,
    dd.date_sk,
    o.order_purchase_timestamp::DATE,
    o.order_status,
    oi.price,
    oi.freight_value,
    oi.price AS gmv,
    ROUND(
        (oi.price / NULLIF(op.total_order_price, 0)) * opa.total_payment,
        2
    ) AS payment_value_allocated,
    opa.payment_type,
    opa.payment_installments,
    COALESCE(ora.avg_review_score, 0) AS review_score,
    o.order_purchase_timestamp,
    o.order_approved_at,
    o.order_delivered_customer_date,
    o.order_estimated_delivery_date,
    dor.is_delivered,
    dor.is_canceled,
    dor.is_on_time
FROM clean.orders o
JOIN clean.order_items oi ON o.order_id = oi.order_id
JOIN order_prices op ON o.order_id = op.order_id
LEFT JOIN order_payments_agg opa ON o.order_id = opa.order_id
LEFT JOIN order_reviews_agg ora ON o.order_id = ora.order_id
LEFT JOIN gold.dim_customer dc ON o.customer_id = dc.customer_id
LEFT JOIN gold.dim_product dp ON oi.product_id = dp.product_id
LEFT JOIN gold.dim_seller ds ON oi.seller_id = ds.seller_id
LEFT JOIN gold.dim_order dor ON o.order_id = dor.order_id
LEFT JOIN gold.dim_date dd ON o.order_purchase_timestamp::DATE = dd.full_date;

-- Índices para rendimiento en consultas analíticas
CREATE INDEX IF NOT EXISTS idx_fact_sales_order_date   ON gold.fact_sales(order_purchase_date);
CREATE INDEX IF NOT EXISTS idx_fact_sales_order_status ON gold.fact_sales(order_status);
CREATE INDEX IF NOT EXISTS idx_fact_sales_payment_type ON gold.fact_sales(payment_type);
CREATE INDEX IF NOT EXISTS idx_fact_sales_customer_sk  ON gold.fact_sales(customer_sk);
CREATE INDEX IF NOT EXISTS idx_fact_sales_product_sk   ON gold.fact_sales(product_sk);
CREATE INDEX IF NOT EXISTS idx_fact_sales_seller_sk    ON gold.fact_sales(seller_sk);
