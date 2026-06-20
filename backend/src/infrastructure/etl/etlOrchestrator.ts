/**
 * Orquestador del proceso ETL (Extract, Transform, Load).
 *
 * Flujo:
 *   1. Crea los esquemas raw, clean y gold (01_init_schemas.sql)
 *   2. Crea las tablas raw e importa los CSVs de Olist (02_create_raw_tables.sql + csv-parse)
 *   3. Transforma raw -> clean con tipado correcto (03_raw_to_clean.sql)
 *   4. Construye el esquema estrella gold con fact_sales y dimensiones (04_clean_to_gold.sql)
 *
 * Se ejecuta de forma autónoma al arrancar el contenedor via `npm run etl`.
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

/** Mapa que asocia cada tabla del esquema `raw` con su archivo CSV correspondiente. */
const CSV_FILES: Record<string, string> = {
  orders: 'olist_orders_dataset.csv',
  order_items: 'olist_order_items_dataset.csv',
  order_payments: 'olist_order_payments_dataset.csv',
  customers: 'olist_customers_dataset.csv',
  products: 'olist_products_dataset.csv',
  sellers: 'olist_sellers_dataset.csv',
  order_reviews: 'olist_order_reviews_dataset.csv',
  product_category_name_translation: 'product_category_name_translation.csv',
};

/** Directorio donde se encuentran los archivos CSV de origen. */
const DATA_DIR = '/app/data';

/**
 * Escapa un valor para usarlo de forma segura en una sentencia SQL.
 * Los valores vacíos o nulos se convierten a `NULL`.
 * @param value - Valor a escapar.
 * @returns Cadena lista para interpolar en SQL.
 */
function escapeSQLValue(value: string): string {
  if (value === '' || value === undefined || value === null) {
    return 'NULL';
  }
  const escaped = value.replace(/'/g, "''");
  return `'${escaped}'`;
}

/**
 * Parsea un archivo CSV y retorna un arreglo de registros como objetos clave-valor.
 * @param filePath - Ruta absoluta al archivo CSV.
 * @returns Arreglo de registros planos.
 */
function parseCSV(filePath: string): Record<string, string>[] {
  const content = readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
  });
}

/**
 * Ejecuta un archivo SQL ubicado en el directorio `sql/`.
 * Divide el contenido por punto y coma y ejecuta cada sentencia individualmente.
 * @param filename - Nombre del archivo SQL (ej. `01_init_schemas.sql`).
 */
async function executeSQLFile(filename: string): Promise<void> {
  const filePath = join(__dirname, 'sql', filename);
  const sql = readFileSync(filePath, 'utf-8');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(`${statement};`);
  }
  console.info(`Ejecutado: ${filename}`);
}

/**
 * Importa todos los archivos CSV definidos en {@link CSV_FILES} hacia las
 * tablas correspondientes del esquema `raw` en lotes de 500 registros.
 */
async function importCSVToRaw(): Promise<void> {
  for (const [table, csvFile] of Object.entries(CSV_FILES)) {
    const csvPath = join(DATA_DIR, csvFile);
    const records = parseCSV(csvPath);

    if (records.length === 0) {
      console.warn(`CSV vacio: ${csvFile}`);
      continue;
    }

    const columns = Object.keys(records[0]);
    const batchSize = 500;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const valueRows = batch.map((record) => {
        const values = columns.map((col) => escapeSQLValue(record[col] ?? ''));
        return `(${values.join(',')})`;
      });

      const sql = `INSERT INTO raw.${table} (${columns.join(',')}) VALUES ${valueRows.join(',')};`;
      await prisma.$executeRawUnsafe(sql);
    }

    console.info(`Importadas ${records.length} filas en raw.${table} desde ${csvFile}`);
  }
}

/**
 * Orquesta el flujo completo ETL:
 *  1. Creación de esquemas (raw, clean, gold).
 *  2. Creación de tablas raw e importación de CSVs.
 *  3. Transformación de raw a clean.
 *  4. Transformación de clean a gold (modelo estrella).
 * En caso de error, finaliza el proceso con código 1.
 */
async function runETL(): Promise<void> {
  const startTime = Date.now();
  console.info('=== INICIO DEL PROCESO ETL ===');

  try {
    console.info('[1/4] Creando esquemas...');
    await executeSQLFile('01_init_schemas.sql');

    console.info('[2/4] Creando tablas raw e importando CSVs...');
    await executeSQLFile('02_create_raw_tables.sql');
    await importCSVToRaw();

    console.info('[3/4] Transformando raw -> clean...');
    await executeSQLFile('03_raw_to_clean.sql');

    console.info('[4/4] Transformando clean -> gold (esquema estrella)...');
    await executeSQLFile('04_clean_to_gold.sql');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.info(`=== ETL COMPLETADO en ${elapsed}s ===`);
  } catch (error) {
    console.error('Error en el proceso ETL:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runETL();
