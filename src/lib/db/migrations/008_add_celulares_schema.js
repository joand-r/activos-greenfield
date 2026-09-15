/**
 * Migración 008: Creación de la tabla de celulares para activos de tipo CELULAR
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS celulares (
      activo_id BIGINT PRIMARY KEY,
      modelo VARCHAR(100),
      procesador VARCHAR(100),
      memoria VARCHAR(50),
      capacidad_disco VARCHAR(50),
      imei_1 VARCHAR(50),
      imei_2 VARCHAR(50),
      CONSTRAINT fk_celular_padre FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_celulares_imei_1 ON celulares(imei_1);
    CREATE INDEX IF NOT EXISTS idx_celulares_imei_2 ON celulares(imei_2);
  `);
}

export async function down(client) {
  await client.query(`
    DROP INDEX IF EXISTS idx_celulares_imei_2;
    DROP INDEX IF EXISTS idx_celulares_imei_1;
    DROP TABLE IF EXISTS celulares;
  `);
}