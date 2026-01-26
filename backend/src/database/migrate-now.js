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

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de base de datos...\n');
    
    // Tabla Usuario
    console.log('Creando tabla usuario...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuario (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'usuario', 'visor')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla usuario creada\n');

    // Tabla Categoria
    console.log('Creando tabla categoria...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categoria (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla categoria creada\n');

    // Tabla Lugar
    console.log('Creando tabla lugar...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS lugar (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) UNIQUE NOT NULL,
        iniciales VARCHAR(3) UNIQUE NOT NULL,
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('vivienda', 'oficina', 'almacen')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla lugar creada\n');

    // Tabla Marca
    console.log('Creando tabla marca...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS marca (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla marca creada\n');

    // Tabla Proveedor
    console.log('Creando tabla proveedor...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS proveedor (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) UNIQUE NOT NULL,
        nit VARCHAR(50) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        email VARCHAR(255),
        direccion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla proveedor creada\n');

    // Tabla Articulo
    console.log('Creando tabla articulo...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS articulo (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_adquisicion DATE NOT NULL,
        serie VARCHAR(100),
        cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
        precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
        estado VARCHAR(20) NOT NULL CHECK (estado IN ('Nuevo', 'Medio Uso', 'Fregado', 'En Reparación', 'Obsoleto', 'Transferido')),
        constancia VARCHAR(20) NOT NULL CHECK (constancia IN ('Factura', 'Recibo', 'Proforma')),
        numero_constancia VARCHAR(100),
        imagen VARCHAR(500),
        activo BOOLEAN NOT NULL DEFAULT true,
        articulo_origen_id INTEGER REFERENCES articulo(id) ON DELETE SET NULL,
        categoria_id INTEGER NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
        lugar_id INTEGER NOT NULL REFERENCES lugar(id) ON DELETE RESTRICT,
        marca_id INTEGER NOT NULL REFERENCES marca(id) ON DELETE RESTRICT,
        proveedor_id INTEGER NOT NULL REFERENCES proveedor(id) ON DELETE RESTRICT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla articulo creada\n');

    // Tabla Movimiento
    console.log('Creando tabla movimiento...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS movimiento (
        id SERIAL PRIMARY KEY,
        codigo_movimiento VARCHAR(50) UNIQUE NOT NULL,
        tipo VARCHAR(20) NOT NULL DEFAULT 'Transferencia' CHECK (tipo IN ('Transferencia', 'Ajuste', 'Prestamo')),
        articulo_id INTEGER NOT NULL REFERENCES articulo(id) ON DELETE CASCADE,
        articulo_destino_id INTEGER REFERENCES articulo(id) ON DELETE SET NULL,
        lugar_origen_id INTEGER NOT NULL REFERENCES lugar(id) ON DELETE RESTRICT,
        lugar_destino_id INTEGER NOT NULL REFERENCES lugar(id) ON DELETE RESTRICT,
        fecha_movimiento DATE NOT NULL,
        responsable VARCHAR(255) NOT NULL,
        motivo TEXT NOT NULL,
        observaciones TEXT,
        estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Completado', 'Cancelado')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_lugares_diferentes CHECK (lugar_origen_id != lugar_destino_id)
      );
    `);
    console.log('✅ Tabla movimiento creada\n');

    // Crear índices
    console.log('Creando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_articulo_codigo ON articulo(codigo);
      CREATE INDEX IF NOT EXISTS idx_articulo_categoria ON articulo(categoria_id);
      CREATE INDEX IF NOT EXISTS idx_articulo_lugar ON articulo(lugar_id);
      CREATE INDEX IF NOT EXISTS idx_articulo_activo ON articulo(activo);
      CREATE INDEX IF NOT EXISTS idx_articulo_origen ON articulo(articulo_origen_id);
      CREATE INDEX IF NOT EXISTS idx_movimiento_articulo ON movimiento(articulo_id);
      CREATE INDEX IF NOT EXISTS idx_movimiento_destino ON movimiento(articulo_destino_id);
      CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
    `);
    console.log('✅ Índices creados\n');

    // Verificar tablas creadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('🎉 Migración completada exitosamente!\n');
    console.log('📋 Tablas creadas:', result.rows.length);
    result.rows.forEach(row => console.log('  ✓', row.table_name));
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    console.error('Detalle:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Proceso fallido:', error.message);
    process.exit(1);
  });
