import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 📝 GENERADOR DE MIGRACIONES
 * 
 * Uso: npm run migration:create nombre_de_la_migracion
 * Ejemplo: npm run migration:create add_user_avatar_column
 */

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Error: Debes proporcionar un nombre para la migración');
  console.log('\nUso: npm run migration:create <nombre>');
  console.log('Ejemplo: npm run migration:create add_user_avatar_column\n');
  process.exit(1);
}

// Validar nombre
if (!/^[a-z0-9_]+$/.test(migrationName)) {
  console.error('❌ Error: El nombre solo puede contener letras minúsculas, números y guiones bajos');
  process.exit(1);
}

// Generar timestamp
const timestamp = new Date().toISOString()
  .replace(/[-:]/g, '')
  .replace('T', '_')
  .split('.')[0];

const version = `${timestamp.slice(0, 8)}_${timestamp.slice(9, 15)}`;
const fileName = `${version}_${migrationName}.js`;
const migrationsDir = path.join(__dirname, 'migrations');
const filePath = path.join(migrationsDir, fileName);

// Template de la migración
const template = `/**
 * 🗄️ MIGRACIÓN: ${migrationName.replace(/_/g, ' ')}
 * 
 * Descripción: [Describe aquí qué hace esta migración]
 * 
 * Creada: ${new Date().toLocaleDateString('es-ES', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
 */

export async function up(client) {
  console.log('⬆️  Aplicando migración: ${migrationName}\\n');
  
  // TODO: Escribe aquí los cambios a la base de datos
  
  // Ejemplo - Agregar columna:
  // await client.query(\`
  //   ALTER TABLE tabla_ejemplo 
  //   ADD COLUMN nueva_columna VARCHAR(100)
  // \`);
  
  // Ejemplo - Crear tabla:
  // await client.query(\`
  //   CREATE TABLE IF NOT EXISTS nueva_tabla (
  //     id SERIAL PRIMARY KEY,
  //     nombre VARCHAR(255) NOT NULL,
  //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //   )
  // \`);
  
  // Ejemplo - Crear índice:
  // await client.query(\`
  //   CREATE INDEX IF NOT EXISTS idx_tabla_columna 
  //   ON tabla(columna)
  // \`);
  
  console.log('✅ Migración aplicada exitosamente\\n');
}

export async function down(client) {
  console.log('⬇️  Revirtiendo migración: ${migrationName}\\n');
  
  // TODO: Escribe aquí cómo revertir los cambios
  
  // Ejemplo - Eliminar columna:
  // await client.query(\`
  //   ALTER TABLE tabla_ejemplo 
  //   DROP COLUMN IF EXISTS nueva_columna
  // \`);
  
  // Ejemplo - Eliminar tabla:
  // await client.query(\`
  //   DROP TABLE IF EXISTS nueva_tabla CASCADE
  // \`);
  
  console.log('✅ Migración revertida exitosamente\\n');
}
`;

// Crear el archivo
try {
  // Asegurar que el directorio existe
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, template);
  
  console.log('\n✅ Migración creada exitosamente!\n');
  console.log(`📄 Archivo: ${fileName}`);
  console.log(`📍 Ubicación: ${filePath}\n`);
  console.log('📝 Próximos pasos:');
  console.log('   1. Edita el archivo y agrega tus cambios en la función up()');
  console.log('   2. Opcionalmente, implementa down() para poder revertir');
  console.log('   3. Ejecuta: npm run migrate\n');
  
} catch (error) {
  console.error('\n❌ Error al crear la migración:', error.message);
  process.exit(1);
}
