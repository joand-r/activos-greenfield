/**
 * 🗄️ MIGRACIÓN 001: Schema Inicial
 * 
 * Crea la estructura base de la base de datos:
 * - Tablas principales (usuario, categoria, lugar, marca, proveedor, articulo, movimiento)
 * - Índices para optimización
 * - Funciones PostgreSQL
 * - Datos iniciales (seeds)
 */

export async function up(client) {
  console.log('📦 Creando tablas principales...\n');
  
  // Tabla Usuario
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
  console.log('✅ Tabla usuario');

  // Tabla Categoria
  await client.query(`
    CREATE TABLE IF NOT EXISTS categoria (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabla categoria');

  // Tabla Lugar
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
  console.log('✅ Tabla lugar');

  // Tabla Marca
  await client.query(`
    CREATE TABLE IF NOT EXISTS marca (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabla marca');

  // Tabla Proveedor
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
  console.log('✅ Tabla proveedor');

  // Tabla Articulo
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
  console.log('✅ Tabla articulo');

  // Tabla Movimiento
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
  console.log('✅ Tabla movimiento\n');

  // Crear índices
  console.log('🔍 Creando índices...');
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

  // Crear funciones
  console.log('⚙️  Creando funciones...');
  await client.query(`
    CREATE OR REPLACE FUNCTION generar_codigo_articulo(p_lugar_id INTEGER)
    RETURNS VARCHAR(50) AS $$
    DECLARE
        v_iniciales VARCHAR(10);
        v_ultimo_numero INTEGER;
        v_nuevo_codigo VARCHAR(50);
    BEGIN
        -- Obtener las iniciales del lugar
        SELECT iniciales INTO v_iniciales
        FROM lugar
        WHERE id = p_lugar_id;
        
        IF v_iniciales IS NULL THEN
            RAISE EXCEPTION 'Lugar no encontrado con ID: %', p_lugar_id;
        END IF;
        
        -- Obtener el último número usado para este lugar
        SELECT COALESCE(MAX(
            CAST(
                SUBSTRING(codigo FROM LENGTH(v_iniciales) + 2)
                AS INTEGER
            )
        ), 0) INTO v_ultimo_numero
        FROM articulo
        WHERE codigo LIKE v_iniciales || '-%';
        
        -- Generar el nuevo código
        v_nuevo_codigo := v_iniciales || '-' || LPAD((v_ultimo_numero + 1)::TEXT, 3, '0');
        
        RETURN v_nuevo_codigo;
    END;
    $$ LANGUAGE plpgsql;
  `);
  console.log('✅ Función generar_codigo_articulo\n');

  // Insertar datos iniciales
  console.log('🌱 Insertando datos iniciales...');
  
  // Usuario admin
  const adminCheck = await client.query(`SELECT id FROM usuario WHERE email = 'admin@greenfield.com'`);
  if (adminCheck.rows.length === 0) {
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default || bcryptModule;
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO usuario (email, password, nombre, rol)
      VALUES ('admin@greenfield.com', $1, 'Administrador', 'admin')
    `, [hashedPassword]);
    console.log('✅ Usuario admin creado');
  }

  // Categorías
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
  console.log('✅ Categorías insertadas');

  // Lugares
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
  console.log('✅ Lugares insertados');

  // Marcas
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
  console.log('✅ Marcas insertadas');

  // Proveedores
  await client.query(`
    INSERT INTO proveedor (nombre, nit, telefono, email, direccion)
    VALUES ('Proveedor General', '0000000000', '0000000', 'general@example.com', 'Sin dirección')
    ON CONFLICT (nombre) DO NOTHING
  `);
  console.log('✅ Proveedores insertados\n');
}

export async function down(client) {
  console.log('⚠️  Revirtiendo migración 001...\n');
  
  // Eliminar en orden inverso por las dependencias
  await client.query('DROP TABLE IF EXISTS movimiento CASCADE');
  await client.query('DROP TABLE IF EXISTS articulo CASCADE');
  await client.query('DROP TABLE IF EXISTS proveedor CASCADE');
  await client.query('DROP TABLE IF EXISTS marca CASCADE');
  await client.query('DROP TABLE IF EXISTS lugar CASCADE');
  await client.query('DROP TABLE IF EXISTS categoria CASCADE');
  await client.query('DROP TABLE IF EXISTS usuario CASCADE');
  await client.query('DROP FUNCTION IF EXISTS generar_codigo_articulo(INTEGER)');
  
  console.log('✅ Tablas y funciones eliminadas\n');
}
