/**
 * 🗄️ MIGRACIÓN 001: Schema Inicial
 * 
 * Crea la estructura base de la base de datos:
 * - Tablas de catálogos (Usuario, Marca, Proveedor, Lugar)
 * - Tabla padre (Activo)
 * - Tablas hijas (Equipos_Tecnologicos, Motorizados, Terreno)
 * - Tabla de Movimientos
 * - Índices para optimización
 * - Funciones PostgreSQL
 * - Datos iniciales (seeds)
 */

export async function up(client) {
  console.log('📦 Creando tablas de catálogos...\n');
  
  // Tabla Usuario (ya existe, verificar)
  const usuarioExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'usuario'
    );
  `);
  
  if (!usuarioExists.rows[0].exists) {
    await client.query(`
      CREATE TABLE usuario (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla usuario creada');
  } else {
    console.log('✅ Tabla usuario (ya existe)');
  }

  // Tabla Marca
  await client.query(`
    CREATE TABLE IF NOT EXISTS marca (
      id BIGSERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT
    );
  `);
  console.log('✅ Tabla marca');

  // Tabla Proveedor
  await client.query(`
    CREATE TABLE IF NOT EXISTS proveedor (
      id BIGSERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      nit VARCHAR(50) NOT NULL
    );
  `);
  console.log('✅ Tabla proveedor');

  console.log('✅ Tabla lugar (se creará después de los ENUMs)\n');

  // Crear ENUMs
  console.log('📦 Creando tipos ENUM...\n');
  
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE EstadoActivo AS ENUM (
        'NUEVO',
        'USADO',
        'DISPONIBLE',
        'DANADO',
        'DONADO',
        'VENDIDO',
        'TRANSFERIR'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('✅ ENUM EstadoActivo');

  await client.query(`
    DO $$ BEGIN
      CREATE TYPE TipoConstancia AS ENUM (
        'FACTURA',
        'PROFORMA',
        'RECIBO'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('✅ ENUM TipoConstancia');

  await client.query(`
    DO $$ BEGIN
      CREATE TYPE TipoLugar AS ENUM (
        'VIVIENDA',
        'OFICINA',
        'ALMACEN',
        'CENTER',
        'PROPIEDAD'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('✅ ENUM TipoLugar\n');

  // Tabla Lugar (después de crear ENUM TipoLugar)
  await client.query(`
    CREATE TABLE IF NOT EXISTS lugar (
      id BIGSERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      inicial VARCHAR(10),
      tipo TipoLugar NOT NULL
    );
  `);
  console.log('✅ Tabla lugar\n');

  // Tabla Padre: Activo
  console.log('📦 Creando tabla principal (Activo)...\n');
  await client.query(`
    CREATE TABLE IF NOT EXISTS activo (
      id BIGSERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      tipo_activo VARCHAR(50) NOT NULL,
      codigo VARCHAR(100) UNIQUE NOT NULL,
      serie VARCHAR(100),
      imagen VARCHAR(500),
      estado EstadoActivo DEFAULT 'DISPONIBLE',
      descripcion TEXT,
      fecha_adquision DATE,
      costo_adquision DECIMAL(15, 2),
      tipo_constancia TipoConstancia,
      nro_constancia VARCHAR(100),
      lugar_id BIGINT,
      marca_id BIGINT,
      proveedor_id BIGINT,
      CONSTRAINT fk_activo_lugar FOREIGN KEY (lugar_id) REFERENCES lugar(id),
      CONSTRAINT fk_activo_marca FOREIGN KEY (marca_id) REFERENCES marca(id) ON DELETE SET NULL,
      CONSTRAINT fk_activo_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id) ON DELETE SET NULL
    );
  `);
  console.log('✅ Tabla activo\n');

  // Tablas Hijas
  console.log('📦 Creando tablas hijas (datos específicos)...\n');
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS equipos_tecnologicos (
      activo_id BIGINT PRIMARY KEY,
      modelo VARCHAR(100),
      procesador VARCHAR(100),
      memoria VARCHAR(50),
      capacidad_disco VARCHAR(50),
      CONSTRAINT fk_tecnologico_padre FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ Tabla equipos_tecnologicos');

  await client.query(`
    CREATE TABLE IF NOT EXISTS motorizados (
      activo_id BIGINT PRIMARY KEY,
      tipo_vehiculo VARCHAR(100),
      motor VARCHAR(100),
      chasis VARCHAR(100),
      color VARCHAR(50),
      anho_modelo INT,
      CONSTRAINT fk_motorizado_padre FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ Tabla motorizados');

  await client.query(`
    CREATE TABLE IF NOT EXISTS terreno (
      activo_id BIGINT PRIMARY KEY,
      folio VARCHAR(100),
      nro_registro VARCHAR(100),
      area DECIMAL(15, 2),
      ubicacion VARCHAR(255),
      CONSTRAINT fk_terreno_padre FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ Tabla terreno\n');

  // Tabla Movimiento
  console.log('📦 Creando tabla de movimientos...\n');
  await client.query(`
    CREATE TABLE IF NOT EXISTS movimiento (
      id BIGSERIAL PRIMARY KEY,
      codigo_movimiento VARCHAR(100) UNIQUE NOT NULL,
      fecha_movimiento TIMESTAMP NOT NULL,
      responsable VARCHAR(255) NOT NULL,
      observaciones TEXT,
      estado EstadoActivo NOT NULL DEFAULT 'DISPONIBLE',
      activo_id BIGINT NOT NULL,
      lugar_origen_id BIGINT,
      lugar_destino_id BIGINT,
      nuevo_activo_id BIGINT,
      CONSTRAINT fk_movimiento_activo FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE CASCADE,
      CONSTRAINT fk_movimiento_origen FOREIGN KEY (lugar_origen_id) REFERENCES lugar(id) ON DELETE SET NULL,
      CONSTRAINT fk_movimiento_destino FOREIGN KEY (lugar_destino_id) REFERENCES lugar(id) ON DELETE SET NULL,
      CONSTRAINT fk_movimiento_nuevo_activo FOREIGN KEY (nuevo_activo_id) REFERENCES activo(id) ON DELETE SET NULL
    );
  `);
  console.log('✅ Tabla movimiento');

  // Tabla Bitácora de Auditoría
  await client.query(`
    CREATE TABLE IF NOT EXISTS bitacora_auditoria (
      id BIGSERIAL PRIMARY KEY,
      usuario_id BIGINT NOT NULL,
      accion VARCHAR(20) NOT NULL,
      tabla_afectada VARCHAR(100) NOT NULL,
      registro_id BIGINT NOT NULL,
      datos_anteriores JSONB,
      datos_nuevos JSONB,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_usuario VARCHAR(50),
      CONSTRAINT fk_bitacora_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ Tabla bitacora_auditoria\n');

  // Crear índices
  console.log('🔍 Creando índices...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
    CREATE INDEX IF NOT EXISTS idx_activo_codigo ON activo(codigo);
    CREATE INDEX IF NOT EXISTS idx_activo_tipo ON activo(tipo_activo);
    CREATE INDEX IF NOT EXISTS idx_activo_lugar ON activo(lugar_id);
    CREATE INDEX IF NOT EXISTS idx_activo_marca ON activo(marca_id);
    CREATE INDEX IF NOT EXISTS idx_activo_proveedor ON activo(proveedor_id);
    CREATE INDEX IF NOT EXISTS idx_movimiento_activo ON movimiento(activo_id);
    CREATE INDEX IF NOT EXISTS idx_movimiento_origen ON movimiento(lugar_origen_id);
    CREATE INDEX IF NOT EXISTS idx_movimiento_destino ON movimiento(lugar_destino_id);
    CREATE INDEX IF NOT EXISTS idx_bitacora_usuario ON bitacora_auditoria(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_bitacora_tabla ON bitacora_auditoria(tabla_afectada);
    CREATE INDEX IF NOT EXISTS idx_bitacora_registro ON bitacora_auditoria(registro_id);
    CREATE INDEX IF NOT EXISTS idx_bitacora_fecha ON bitacora_auditoria(fecha);
  `);
  console.log('✅ Índices creados\n');

  // Crear funciones
  console.log('⚙️  Creando funciones...');
  await client.query(`
    CREATE OR REPLACE FUNCTION generar_codigo_activo(p_lugar_id BIGINT)
    RETURNS VARCHAR(100) AS $$
    DECLARE
        v_inicial VARCHAR(10);
        v_ultimo_numero INTEGER;
        v_nuevo_codigo VARCHAR(100);
    BEGIN
        -- Obtener la inicial del lugar
        SELECT inicial INTO v_inicial
        FROM lugar
        WHERE id = p_lugar_id;
        
        IF v_inicial IS NULL THEN
            RAISE EXCEPTION 'Lugar no encontrado con ID: %', p_lugar_id;
        END IF;
        
        -- Obtener el último número usado para este lugar
        SELECT COALESCE(MAX(
            CAST(
                SUBSTRING(codigo FROM LENGTH(v_inicial) + 2)
                AS INTEGER
            )
        ), 0) INTO v_ultimo_numero
        FROM activo
        WHERE codigo LIKE v_inicial || '-%';
        
        -- Generar el nuevo código (VSP-001, VSP-002, etc.)
        v_nuevo_codigo := v_inicial || '-' || LPAD((v_ultimo_numero + 1)::TEXT, 3, '0');
        
        RETURN v_nuevo_codigo;
    END;
    $$ LANGUAGE plpgsql;
  `);
  console.log('✅ Función generar_codigo_activo\n');

  // Insertar datos iniciales
  console.log('🌱 Insertando datos iniciales...');
  
  // Columnas que pueden no existir en DBs creadas antes de esta versión
  console.log('🔧 Verificando columnas y constraints...');
  await client.query(`ALTER TABLE activo ADD COLUMN IF NOT EXISTS serie VARCHAR(100);`);
  await client.query(`ALTER TABLE movimiento ADD COLUMN IF NOT EXISTS nuevo_activo_id BIGINT;`);

  // Ampliar CHECK constraint de rol para soportar 'superadmin'
  await client.query(`ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_rol_check;`);
  await client.query(`
    ALTER TABLE usuario
      ADD CONSTRAINT usuario_rol_check
      CHECK (rol IN ('admin', 'usuario', 'superadmin'));
  `);
  console.log('✅ Columnas y constraints verificados\n');

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
    console.log('✅ Usuario admin creado (email: admin@greenfield.com, password: admin123)');
  }
  console.log('');
}

export async function down(client) {
  console.log('⚠️  Revirtiendo migración 001...\n');
  
  // Eliminar en orden inverso por las dependencias
  await client.query('DROP TABLE IF EXISTS bitacora_auditoria CASCADE');
  await client.query('DROP TABLE IF EXISTS movimiento CASCADE');
  await client.query('DROP TABLE IF EXISTS equipos_tecnologicos CASCADE');
  await client.query('DROP TABLE IF EXISTS motorizados CASCADE');
  await client.query('DROP TABLE IF EXISTS terreno CASCADE');
  await client.query('DROP TABLE IF EXISTS activo CASCADE');
  await client.query('DROP TABLE IF EXISTS proveedor CASCADE');
  await client.query('DROP TABLE IF EXISTS marca CASCADE');
  await client.query('DROP TABLE IF EXISTS lugar CASCADE');
  await client.query('DROP TABLE IF EXISTS usuario CASCADE');
  await client.query('DROP FUNCTION IF EXISTS generar_codigo_activo(BIGINT)');
  
  // Eliminar ENUMs
  await client.query('DROP TYPE IF EXISTS EstadoActivo');
  await client.query('DROP TYPE IF EXISTS TipoConstancia');
  await client.query('DROP TYPE IF EXISTS TipoLugar');
  
  console.log('✅ Tablas, funciones y tipos eliminados\n');
}
