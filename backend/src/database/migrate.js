import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Solo cargar .env si DATABASE_URL no está definida (permite usar Railway CLI)
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  host: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
  port: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : (process.env.DB_PORT || 5432),
  user: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'postgres'),
  password: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  database: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'activos_greenfield'),
});

/**
 * 🗄️ SISTEMA DE MIGRACIONES VERSIONADAS
 * 
 * Ejecuta migraciones de forma automática y controlada.
 * Solo ejecuta las migraciones que aún no se han aplicado.
 */

// Crear tabla de tracking de migraciones
async function createMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Obtener migraciones ya ejecutadas
async function getExecutedMigrations(client) {
  const result = await client.query(`
    SELECT version FROM schema_migrations ORDER BY version
  `);
  return result.rows.map(row => row.version);
}

// Registrar migración ejecutada
async function recordMigration(client, version) {
  await client.query(`
    INSERT INTO schema_migrations (version) VALUES ($1)
  `, [version]);
}

// Obtener archivos de migración pendientes
async function getPendingMigrations(executedMigrations) {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();

  const pending = [];
  for (const file of files) {
    const version = file.replace('.js', '');
    if (!executedMigrations.includes(version)) {
      pending.push({ version, file: path.join(migrationsDir, file) });
    }
  }

  return pending;
}

// Ejecutar migraciones pendientes
async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Sistema de Migraciones - Activos Greenfield\n');
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Crear tabla de tracking
    await createMigrationsTable(client);
    
    // Obtener migraciones ejecutadas
    const executedMigrations = await getExecutedMigrations(client);
    console.log(`📊 Migraciones ejecutadas: ${executedMigrations.length}`);
    if (executedMigrations.length > 0) {
      executedMigrations.forEach(version => console.log(`   ✓ ${version}`));
    }
    console.log('');
    
    // Obtener migraciones pendientes
    const pendingMigrations = await getPendingMigrations(executedMigrations);
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No hay migraciones pendientes. Base de datos actualizada.\n');
      return;
    }
    
    console.log(`🔄 Migraciones pendientes: ${pendingMigrations.length}`);
    pendingMigrations.forEach(m => console.log(`   → ${m.version}`));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Ejecutar cada migración pendiente
    for (const migration of pendingMigrations) {
      console.log(`▶️  Ejecutando: ${migration.version}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      try {
        // Iniciar transacción
        await client.query('BEGIN');
        
        // Importar y ejecutar migración
        const migrationModule = await import(`file:///${migration.file}`);
        await migrationModule.up(client);
        
        // Registrar migración
        await recordMigration(client, migration.version);
        
        // Commit
        await client.query('COMMIT');
        
        console.log(`\n✅ ${migration.version} completada exitosamente\n`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } catch (error) {
        // Rollback en caso de error
        await client.query('ROLLBACK');
        console.error(`\n❌ Error en ${migration.version}:`, error.message);
        throw error;
      }
    }
    
    console.log('🎉 Todas las migraciones completadas exitosamente!\n');
    
    // Resumen final
    const allExecuted = await getExecutedMigrations(client);
    console.log('📋 Estado actual de la base de datos:');
    console.log(`   Total de migraciones: ${allExecuted.length}\n`);
    
  } catch (error) {
    console.error('\n❌ Error en el proceso de migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
runMigrations()
  .then(() => {
    console.log('✅ Proceso completado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Proceso fallido:', error.message);
    process.exit(1);
  });
