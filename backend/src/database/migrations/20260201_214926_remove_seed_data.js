/**
 * 🗄️ MIGRACIÓN: Eliminar datos de ejemplo
 * 
 * Descripción: Elimina los datos de ejemplo insertados en la migración inicial
 * (lugares, categorías, marcas, proveedores). Mantiene solo el usuario admin.
 * 
 * Creada: 1 de febrero de 2026
 */

export async function up(client) {
  console.log('⬆️  Aplicando migración: eliminar datos de ejemplo\n');
  
  // Eliminar proveedores de ejemplo
  await client.query(`
    DELETE FROM proveedor WHERE nit = '0000000000'
  `);
  console.log('✅ Proveedores de ejemplo eliminados');
  
  // Eliminar marcas de ejemplo
  await client.query(`
    DELETE FROM marca WHERE nombre IN ('HP', 'Dell', 'Samsung', 'Sin Marca')
  `);
  console.log('✅ Marcas de ejemplo eliminadas');
  
  // Eliminar lugares de ejemplo
  await client.query(`
    DELETE FROM lugar WHERE iniciales IN ('OFP', 'ALM', 'V01')
  `);
  console.log('✅ Lugares de ejemplo eliminados');
  
  // Eliminar categorías de ejemplo
  await client.query(`
    DELETE FROM categoria WHERE nombre IN ('Mobiliario', 'Electrónica', 'Herramientas', 'Vehículos', 'Otros')
  `);
  console.log('✅ Categorías de ejemplo eliminadas');
  
  console.log('\n✅ Base de datos limpia. Solo queda el usuario admin.\n');
}

export async function down(client) {
  console.log('⬇️  Revirtiendo migración: restaurar datos de ejemplo\n');
  
  // Restaurar categorías
  const categorias = [
    ['Mobiliario', 'Muebles y mobiliario de oficina'],
    ['Electrónica', 'Equipos electrónicos y computadoras'],
    ['Herramientas', 'Herramientas y equipos de trabajo'],
    ['Vehículos', 'Vehículos y equipos de transporte'],
    ['Otros', 'Otros activos'],
  ];
  for (const [nombre, descripcion] of categorias) {
    await client.query(`
      INSERT INTO categoria (nombre, descripcion)
      VALUES ($1, $2)
      ON CONFLICT (nombre) DO NOTHING
    `, [nombre, descripcion]);
  }
  
  // Restaurar lugares
  const lugares = [
    ['Oficina Principal', 'OFP', 'oficina'],
    ['Almacén Central', 'ALM', 'almacen'],
    ['Vivienda 1', 'V01', 'vivienda'],
  ];
  for (const [nombre, iniciales, tipo] of lugares) {
    await client.query(`
      INSERT INTO lugar (nombre, iniciales, tipo)
      VALUES ($1, $2, $3)
      ON CONFLICT (nombre) DO NOTHING
    `, [nombre, iniciales, tipo]);
  }
  
  // Restaurar marcas
  const marcas = [
    ['HP', 'Hewlett-Packard'],
    ['Dell', 'Dell Technologies'],
    ['Samsung', 'Samsung Electronics'],
    ['Sin Marca', 'Productos sin marca específica'],
  ];
  for (const [nombre, descripcion] of marcas) {
    await client.query(`
      INSERT INTO marca (nombre, descripcion)
      VALUES ($1, $2)
      ON CONFLICT (nombre) DO NOTHING
    `, [nombre, descripcion]);
  }
  
  // Restaurar proveedor
  await client.query(`
    INSERT INTO proveedor (nombre, nit, telefono, email, direccion)
    VALUES ('Proveedor General', '0000000000', '0000000', 'general@example.com', 'Sin dirección')
    ON CONFLICT (nombre) DO NOTHING
  `);
  
  console.log('✅ Datos de ejemplo restaurados\n');
}
