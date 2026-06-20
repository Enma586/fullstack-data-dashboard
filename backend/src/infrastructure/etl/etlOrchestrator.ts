import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

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

const DATA_DIR = '/app/data';

function escapeSQLValue(value: string): string {
  if (value === '' || value === undefined || value === null) {
    return 'NULL';
  }
  const escaped = value.replace(/'/g, "''");
  return `'${escaped}'`;
}

function parseCSV(filePath: string): Record<string, string>[] {
  const content = readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
}

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
