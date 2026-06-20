-- Limpieza y transformacion de datos raw a clean

DROP TABLE IF EXISTS clean.orders CASCADE;
CREATE TABLE clean.orders AS
SELECT
    order_id,
    customer_id,
    order_status,
    NULLIF(order_purchase_timestamp, '')::TIMESTAMP      AS order_purchase_timestamp,
    NULLIF(order_approved_at, '')::TIMESTAMP              AS order_approved_at,
    NULLIF(order_delivered_carrier_date, '')::TIMESTAMP   AS order_delivered_carrier_date,
    NULLIF(order_delivered_customer_date, '')::TIMESTAMP  AS order_delivered_customer_date,
    NULLIF(order_estimated_delivery_date, '')::TIMESTAMP  AS order_estimated_delivery_date
FROM raw.orders;

DROP TABLE IF EXISTS clean.order_items CASCADE;
CREATE TABLE clean.order_items AS
SELECT
    order_id,
    order_item_id::INT,
    product_id,
    seller_id,
    NULLIF(shipping_limit_date, '')::TIMESTAMP  AS shipping_limit_date,
    NULLIF(price, '')::NUMERIC(10,2)            AS price,
    NULLIF(freight_value, '')::NUMERIC(10,2)    AS freight_value
FROM raw.order_items;

DROP TABLE IF EXISTS clean.order_payments CASCADE;
CREATE TABLE clean.order_payments AS
SELECT
    order_id,
    payment_sequential::INT,
    payment_type,
    NULLIF(payment_installments, '')::INT   AS payment_installments,
    NULLIF(payment_value, '')::NUMERIC(10,2) AS payment_value
FROM raw.order_payments;

DROP TABLE IF EXISTS clean.customers CASCADE;
CREATE TABLE clean.customers AS
SELECT
    customer_id,
    customer_unique_id,
    customer_zip_code_prefix,
    customer_city,
    customer_state
FROM raw.customers;

DROP TABLE IF EXISTS clean.products CASCADE;
CREATE TABLE clean.products AS
SELECT
    product_id,
    NULLIF(product_category_name, '')       AS product_category_name,
    NULLIF(product_name_length, '')::INT    AS product_name_length,
    NULLIF(product_description_length, '')::INT AS product_description_length,
    NULLIF(product_photos_qty, '')::INT     AS product_photos_qty,
    NULLIF(product_weight_g, '')::NUMERIC   AS product_weight_g,
    NULLIF(product_length_cm, '')::NUMERIC  AS product_length_cm,
    NULLIF(product_height_cm, '')::NUMERIC  AS product_height_cm,
    NULLIF(product_width_cm, '')::NUMERIC   AS product_width_cm
FROM raw.products;

DROP TABLE IF EXISTS clean.sellers CASCADE;
CREATE TABLE clean.sellers AS
SELECT
    seller_id,
    seller_zip_code_prefix,
    seller_city,
    seller_state
FROM raw.sellers;

DROP TABLE IF EXISTS clean.order_reviews CASCADE;
CREATE TABLE clean.order_reviews AS
SELECT
    review_id,
    order_id,
    NULLIF(review_score, '')::INT           AS review_score,
    review_comment_title,
    review_comment_message,
    NULLIF(review_creation_date, '')::TIMESTAMP   AS review_creation_date,
    NULLIF(review_answer_timestamp, '')::TIMESTAMP AS review_answer_timestamp
FROM raw.order_reviews;

DROP TABLE IF EXISTS clean.product_category_name_translation CASCADE;
CREATE TABLE clean.product_category_name_translation AS
SELECT
    product_category_name,
    product_category_name_english
FROM raw.product_category_name_translation;
