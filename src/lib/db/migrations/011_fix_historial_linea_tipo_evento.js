/**
 * Migración 011: Ampliar tipo_evento y asegurar constraints en historial_linea
 */

export async function up(client) {
  // 1. Ampliar tipo_evento en historial_linea a VARCHAR(50)
  await client.query(`
    ALTER TABLE historial_linea 
    ALTER COLUMN tipo_evento TYPE VARCHAR(50);
  `);

  // 2. Eliminar el constraint restrictivo si existe
  await client.query(`
    ALTER TABLE historial_linea 
    DROP CONSTRAINT IF EXISTS historial_linea_tipo_evento_check;
  `);

  // 3. Agregar nuevo check constraint ampliado
  await client.query(`
    ALTER TABLE historial_linea 
    ADD CONSTRAINT historial_linea_tipo_evento_check 
    CHECK (tipo_evento IN ('ASIGNACION', 'TRANSFERENCIA', 'CAMBIO_PLAN', 'CAMBIO_EQUIPO', 'EDICION', 'BAJA', 'REACTIVACION'));
  `);

  // 4. Asegurar columnas de activo si no se hubieran corrido en migración 009
  await client.query(`
    ALTER TABLE linea 
    ADD COLUMN IF NOT EXISTS activo_id BIGINT REFERENCES activo(id) ON DELETE SET NULL;

    ALTER TABLE historial_linea 
    ADD COLUMN IF NOT EXISTS activo_anterior_id BIGINT REFERENCES activo(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS activo_nuevo_id BIGINT REFERENCES activo(id) ON DELETE SET NULL;
  `);

  // 5. Índices de soporte
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_historial_linea_tipo_evento ON historial_linea(tipo_evento);
    CREATE INDEX IF NOT EXISTS idx_historial_linea_activo_ant ON historial_linea(activo_anterior_id);
    CREATE INDEX IF NOT EXISTS idx_historial_linea_activo_nuevo ON historial_linea(activo_nuevo_id);
  `);
}

export async function down(client) {
  await client.query(`
    ALTER TABLE historial_linea 
    DROP CONSTRAINT IF EXISTS historial_linea_tipo_evento_check;

    ALTER TABLE historial_linea 
    ADD CONSTRAINT historial_linea_tipo_evento_check 
    CHECK (tipo_evento IN ('ASIGNACION', 'TRANSFERENCIA', 'CAMBIO_PLAN', 'BAJA', 'REACTIVACION'));
  `);
}
