export async function up(client) {
  // 1. Crear tipo ENUM ClasificacionActivo
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE ClasificacionActivo AS ENUM (
        'FIJO',
        'MENOR'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 2. Agregar columna clasificacion a tabla activo con default 'FIJO' NOT NULL
  // En PostgreSQL esto actualiza automáticamente todos los registros existentes a 'FIJO'
  await client.query(`
    ALTER TABLE activo 
    ADD COLUMN IF NOT EXISTS clasificacion ClasificacionActivo DEFAULT 'FIJO' NOT NULL;
  `);

  // 3. Crear índice para optimizar búsquedas y filtrados
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_activo_clasificacion ON activo(clasificacion);
  `);
}

export async function down(client) {
  // 1. Eliminar índice
  await client.query(`
    DROP INDEX IF EXISTS idx_activo_clasificacion;
  `);

  // 2. Eliminar columna clasificacion
  await client.query(`
    ALTER TABLE activo DROP COLUMN IF EXISTS clasificacion;
  `);

  // 3. Eliminar ENUM
  await client.query(`
    DROP TYPE IF EXISTS ClasificacionActivo;
  `);
}
