-- =============================================================================
-- Inicialización de esquemas del pipeline ETL
-- =============================================================================
-- Propósito: Crear los tres esquemas (raw, clean, gold) que estructuran
--            las capas del proceso ETL de Olist.
--
-- Esquemas:
--   raw   — Capa de datos crudos, tal cual se importan desde los CSVs.
--   clean — Capa intermedia con tipado y limpieza básica.
--   gold  — Capa final con modelo estrella para análisis.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS clean;
CREATE SCHEMA IF NOT EXISTS gold;
