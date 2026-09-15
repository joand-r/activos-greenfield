/**
 * Migración 009: Enlazar líneas telefónicas con activos celulares
 * - Agrega activo_id a linea
 * - Elimina equipo_asignado de linea
 * - Agrega activo_anterior_id y activo_nuevo_id a historial_linea
 */

export async function up(client) {
  // 1. Agregar columna activo_id a tabla linea
  await client.query(`
    ALTER TABLE linea 
    ADD COLUMN IF NOT EXISTS activo_id BIGINT REFERENCES activo(id) ON DELETE SET NULL;
  `);

  // 2. Crear índice sobre activo_id
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_linea_activo_id ON linea(activo_id);
  `);

  // 3. Eliminar columna obsoleta equipo_asignado
  await client.query(`
    ALTER TABLE linea 
    DROP COLUMN IF EXISTS equipo_asignado;
  `);

  // 4. Agregar columnas de activo a historial_linea
  await client.query(`
    ALTER TABLE historial_linea 
    ADD COLUMN IF NOT EXISTS activo_anterior_id BIGINT REFERENCES activo(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS activo_nuevo_id BIGINT REFERENCES activo(id) ON DELETE SET NULL;
  `);
}

export async function down(client) {
  await client.query(`
    ALTER TABLE historial_linea 
    DROP COLUMN IF EXISTS activo_anterior_id,
    DROP COLUMN IF EXISTS activo_nuevo_id;

    ALTER TABLE linea 
    ADD COLUMN IF NOT EXISTS equipo_asignado VARCHAR(30);

    DROP INDEX IF EXISTS idx_linea_activo_id;

    ALTER TABLE linea 
    DROP COLUMN IF EXISTS activo_id;
  `);
}
