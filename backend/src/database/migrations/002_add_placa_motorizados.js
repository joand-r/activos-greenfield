/**
 * 🗄️ MIGRACIÓN 002: Agregar columna Placa a motorizados
 *
 * Cambios:
 * - Agrega columna `placa` VARCHAR(10) a la tabla `motorizados`
 */

export async function up(client) {
  console.log('📦 Agregando columna placa a motorizados...\n');

  await client.query(`
    ALTER TABLE motorizados
    ADD COLUMN IF NOT EXISTS placa VARCHAR(10);
  `);

  console.log('✅ Columna placa agregada a motorizados\n');
}

export async function down(client) {
  console.log('⚠️  Revirtiendo migración 002...\n');

  await client.query(`
    ALTER TABLE motorizados
    DROP COLUMN IF EXISTS placa;
  `);

  console.log('✅ Columna placa eliminada de motorizados\n');
}
