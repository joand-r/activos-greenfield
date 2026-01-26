import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function addColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Agregando columnas nuevas...\n');
    
    // Agregar columnas a articulo
    console.log('Agregando columnas a tabla articulo...');
    
    try {
      await client.query(`
        ALTER TABLE articulo 
        ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true
      `);
      console.log('✅ Columna activo agregada');
    } catch (error) {
      console.log('⚠️  Columna activo ya existe o error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE articulo 
        ADD COLUMN IF NOT EXISTS articulo_origen_id INTEGER REFERENCES articulo(id) ON DELETE SET NULL
      `);
      console.log('✅ Columna articulo_origen_id agregada');
    } catch (error) {
      console.log('⚠️  Columna articulo_origen_id ya existe o error:', error.message);
    }
    
    // Actualizar constraint de estado para incluir 'Transferido'
    try {
      await client.query(`
        ALTER TABLE articulo 
        DROP CONSTRAINT IF EXISTS articulo_estado_check
      `);
      await client.query(`
        ALTER TABLE articulo 
        ADD CONSTRAINT articulo_estado_check 
        CHECK (estado IN ('Nuevo', 'Medio Uso', 'Fregado', 'En Reparación', 'Obsoleto', 'Transferido'))
      `);
      console.log('✅ Constraint de estado actualizado');
    } catch (error) {
      console.log('⚠️  Error al actualizar constraint:', error.message);
    }
    
    // Agregar columnas a movimiento
    console.log('\nAgregando columnas a tabla movimiento...');
    
    try {
      await client.query(`
        ALTER TABLE movimiento 
        ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'Transferencia' 
        CHECK (tipo IN ('Transferencia', 'Ajuste', 'Prestamo'))
      `);
      console.log('✅ Columna tipo agregada');
    } catch (error) {
      console.log('⚠️  Columna tipo ya existe o error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE movimiento 
        ADD COLUMN IF NOT EXISTS articulo_destino_id INTEGER REFERENCES articulo(id) ON DELETE SET NULL
      `);
      console.log('✅ Columna articulo_destino_id agregada');
    } catch (error) {
      console.log('⚠️  Columna articulo_destino_id ya existe o error:', error.message);
    }
    
    // Crear índices nuevos
    console.log('\nCreando índices nuevos...');
    
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_articulo_activo ON articulo(activo)
      `);
      console.log('✅ Índice idx_articulo_activo creado');
    } catch (error) {
      console.log('⚠️  Índice ya existe:', error.message);
    }
    
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_articulo_origen ON articulo(articulo_origen_id)
      `);
      console.log('✅ Índice idx_articulo_origen creado');
    } catch (error) {
      console.log('⚠️  Índice ya existe:', error.message);
    }
    
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_movimiento_destino ON movimiento(articulo_destino_id)
      `);
      console.log('✅ Índice idx_movimiento_destino creado');
    } catch (error) {
      console.log('⚠️  Índice ya existe:', error.message);
    }
    
    console.log('\n🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    console.error('Detalle:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Proceso fallido:', error.message);
    process.exit(1);
  });
