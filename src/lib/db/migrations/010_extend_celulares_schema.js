/**
 * Migración 010: Extender esquema de celulares para gestión en módulo de líneas
 * - Agrega estado_operativo, fecha_baja, motivo_baja, accesorios a celulares
 */

export async function up(client) {
  await client.query(`
    ALTER TABLE celulares
    ADD COLUMN IF NOT EXISTS estado_operativo VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    ADD COLUMN IF NOT EXISTS fecha_baja DATE,
    ADD COLUMN IF NOT EXISTS motivo_baja TEXT,
    ADD COLUMN IF NOT EXISTS accesorios TEXT;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_celulares_estado_operativo ON celulares(estado_operativo);
  `);
}

export async function down(client) {
  await client.query(`
    DROP INDEX IF EXISTS idx_celulares_estado_operativo;

    ALTER TABLE celulares
    DROP COLUMN IF EXISTS estado_operativo,
    DROP COLUMN IF EXISTS fecha_baja,
    DROP COLUMN IF EXISTS motivo_baja,
    DROP COLUMN IF EXISTS accesorios;
  `);
}
