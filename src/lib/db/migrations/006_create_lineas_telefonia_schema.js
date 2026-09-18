/**
 * Migración 006: Creación del esquema para el Módulo de Líneas Telefónicas
 * Tablas: telefonia, plan_telefonia, personal, linea, historial_linea
 */

export async function up(client) {
  // 1. Tabla telefonia
  await client.query(`
    CREATE TABLE IF NOT EXISTS telefonia (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(30) NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insertar operadoras por defecto si no existen
  await client.query(`
    INSERT INTO telefonia (nombre) 
    VALUES ('Tigo'), ('Entel'), ('Viva')
    ON CONFLICT (nombre) DO NOTHING;
  `);

  // 2. Tabla plan_telefonia
  await client.query(`
    CREATE TABLE IF NOT EXISTS plan_telefonia (
      id SERIAL PRIMARY KEY,
      telefonia_id INTEGER NOT NULL REFERENCES telefonia(id) ON DELETE RESTRICT,
      nombre VARCHAR(30) NOT NULL,
      costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'NO_DISPONIBLE')),
      descripcion TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Tabla personal
  await client.query(`
    CREATE TABLE IF NOT EXISTS personal (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(80) NOT NULL,
      departamento VARCHAR(30) NOT NULL,
      cargo VARCHAR(30) NOT NULL,
      estado VARCHAR(10) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Tabla linea
  await client.query(`
    CREATE TABLE IF NOT EXISTS linea (
      id SERIAL PRIMARY KEY,
      numero VARCHAR(10) NOT NULL UNIQUE,
      equipo_asignado VARCHAR(30),
      plan_id INTEGER NOT NULL REFERENCES plan_telefonia(id) ON DELETE RESTRICT,
      personal_id INTEGER REFERENCES personal(id) ON DELETE SET NULL,
      estado VARCHAR(10) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'BAJA', 'DISPONIBLE', 'SUSPENDIDA')),
      fecha_asignacion DATE DEFAULT CURRENT_DATE,
      fecha_baja DATE,
      motivo_baja TEXT,
      observaciones TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Tabla historial_linea
  await client.query(`
    CREATE TABLE IF NOT EXISTS historial_linea (
      id SERIAL PRIMARY KEY,
      linea_id INTEGER NOT NULL REFERENCES linea(id) ON DELETE CASCADE,
      personal_anterior_id INTEGER REFERENCES personal(id) ON DELETE SET NULL,
      personal_nuevo_id INTEGER REFERENCES personal(id) ON DELETE SET NULL,
      plan_anterior_id INTEGER REFERENCES plan_telefonia(id) ON DELETE SET NULL,
      plan_nuevo_id INTEGER REFERENCES plan_telefonia(id) ON DELETE SET NULL,
      tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('ASIGNACION', 'TRANSFERENCIA', 'CAMBIO_PLAN', 'CAMBIO_EQUIPO', 'EDICION', 'BAJA', 'REACTIVACION')),
      motivo TEXT,
      usuario_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
      fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Índices para optimizar búsquedas y consultas frecuentes
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_plan_telefonia_telefonia_id ON plan_telefonia(telefonia_id);
    CREATE INDEX IF NOT EXISTS idx_linea_personal_id ON linea(personal_id);
    CREATE INDEX IF NOT EXISTS idx_linea_plan_id ON linea(plan_id);
    CREATE INDEX IF NOT EXISTS idx_linea_estado ON linea(estado);
    CREATE INDEX IF NOT EXISTS idx_linea_numero ON linea(numero);
    CREATE INDEX IF NOT EXISTS idx_historial_linea_linea_id ON historial_linea(linea_id);
    CREATE INDEX IF NOT EXISTS idx_personal_departamento ON personal(departamento);
  `);
}

export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS historial_linea CASCADE;
    DROP TABLE IF EXISTS linea CASCADE;
    DROP TABLE IF EXISTS personal CASCADE;
    DROP TABLE IF EXISTS plan_telefonia CASCADE;
    DROP TABLE IF EXISTS telefonia CASCADE;
  `);
}
