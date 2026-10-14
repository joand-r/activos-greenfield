/**
 * Migración 013: Creación de tablas para:
 * 1. Contenedores (CONTENEDOR)
 * 2. Equipamiento para estación de servicio (EQUIPAMIENTO_ESTACION_SERVICIO)
 * 3. Equipamiento para Vehículos (EQUIPAMIENTO_VEHICULO)
 */

export async function up(client) {
  // 1. Tabla contenedores
  await client.query(`
    CREATE TABLE IF NOT EXISTS contenedores (
      activo_id BIGINT PRIMARY KEY,
      tipo_contenedor VARCHAR(100),
      dimensiones VARCHAR(100),
      capacidad VARCHAR(100),
      material VARCHAR(100),
      codigo_identificador VARCHAR(100),
      estado_estructura VARCHAR(100),
      CONSTRAINT fk_contenedor_padre FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contenedores_codigo_identificador ON contenedores(codigo_identificador);
  `);

  // 2. Tabla equipamiento_estacion_servicio
  await client.query(`
    CREATE TABLE IF NOT EXISTS equipamiento_estacion_servicio (
      activo_id BIGINT PRIMARY KEY,
      tipo_equipamiento VARCHAR(100),
      modelo VARCHAR(100),
      nro_mangueras INT,
      capacidad_flujo VARCHAR(100),
      tipo_combustible VARCHAR(100),
      voltaje_fase VARCHAR(50),
      nro_calibracion VARCHAR(100),
      CONSTRAINT fk_equip_estacion_padre FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_equip_estacion_tipo ON equipamiento_estacion_servicio(tipo_equipamiento);
  `);

  // 3. Tabla equipamiento_vehiculos
  await client.query(`
    CREATE TABLE IF NOT EXISTS equipamiento_vehiculos (
      activo_id BIGINT PRIMARY KEY,
      tipo_equipamiento VARCHAR(100),
      modelo VARCHAR(100),
      nro_serie_dispositivo VARCHAR(100),
      imei VARCHAR(50),
      voltaje_operacion VARCHAR(50),
      vehiculo_asignado VARCHAR(100),
      CONSTRAINT fk_equip_vehiculo_padre FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_equip_vehiculos_imei ON equipamiento_vehiculos(imei);
    CREATE INDEX IF NOT EXISTS idx_equip_vehiculos_serie ON equipamiento_vehiculos(nro_serie_dispositivo);
  `);
}

export async function down(client) {
  await client.query(`
    DROP INDEX IF EXISTS idx_equip_vehiculos_serie;
    DROP INDEX IF EXISTS idx_equip_vehiculos_imei;
    DROP TABLE IF EXISTS equipamiento_vehiculos;

    DROP INDEX IF EXISTS idx_equip_estacion_tipo;
    DROP TABLE IF EXISTS equipamiento_estacion_servicio;

    DROP INDEX IF EXISTS idx_contenedores_codigo_identificador;
    DROP TABLE IF EXISTS contenedores;
  `);
}
