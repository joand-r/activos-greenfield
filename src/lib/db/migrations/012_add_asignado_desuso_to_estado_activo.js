/**
 * Migración 012: Agregar valores ASIGNADO y DESUSO al ENUM EstadoActivo
 */

export async function up(client) {
  await client.query(`
    ALTER TYPE EstadoActivo ADD VALUE IF NOT EXISTS 'ASIGNADO';
    ALTER TYPE EstadoActivo ADD VALUE IF NOT EXISTS 'DESUSO';
  `);
}

export async function down(client) {
  // Nota: PostgreSQL no soporta ALTER TYPE ... DROP VALUE. 
  // Los valores quedan preservados en el ENUM.
}
