export async function up(client) {
  // Actualizar los tipos de activos existentes 'MUEBLE_ENSER' a 'MUEBLES_OFICINA'
  await client.query(`
    UPDATE activo
    SET tipo_activo = 'MUEBLES_OFICINA'
    WHERE tipo_activo = 'MUEBLE_ENSER';
  `);
}

export async function down(client) {
  // Revertir de 'MUEBLES_OFICINA' a 'MUEBLE_ENSER'
  await client.query(`
    UPDATE activo
    SET tipo_activo = 'MUEBLE_ENSER'
    WHERE tipo_activo = 'MUEBLES_OFICINA';
  `);
}
