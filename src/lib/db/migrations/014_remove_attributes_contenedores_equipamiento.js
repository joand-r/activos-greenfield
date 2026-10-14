/**
 * Migración 014: Eliminar atributos innecesarios de contenedores, equipamiento_estacion_servicio y equipamiento_vehiculos
 */

export async function up(client) {
  // 1. Contenedores: eliminar capacidad, material, estado_estructura
  await client.query(`
    ALTER TABLE contenedores DROP COLUMN IF EXISTS capacidad;
    ALTER TABLE contenedores DROP COLUMN IF EXISTS material;
    ALTER TABLE contenedores DROP COLUMN IF EXISTS estado_estructura;
  `);

  // 2. Equipamiento estación de servicio: eliminar modelo, nro_mangueras, capacidad_flujo, tipo_combustible, voltaje_fase, nro_calibracion
  await client.query(`
    ALTER TABLE equipamiento_estacion_servicio DROP COLUMN IF EXISTS modelo;
    ALTER TABLE equipamiento_estacion_servicio DROP COLUMN IF EXISTS nro_mangueras;
    ALTER TABLE equipamiento_estacion_servicio DROP COLUMN IF EXISTS capacidad_flujo;
    ALTER TABLE equipamiento_estacion_servicio DROP COLUMN IF EXISTS tipo_combustible;
    ALTER TABLE equipamiento_estacion_servicio DROP COLUMN IF EXISTS voltaje_fase;
    ALTER TABLE equipamiento_estacion_servicio DROP COLUMN IF EXISTS nro_calibracion;
  `);

  // 3. Equipamiento vehículos: eliminar modelo, nro_serie_dispositivo, imei, voltaje_operacion, vehiculo_asignado
  await client.query(`
    DROP INDEX IF EXISTS idx_equip_vehiculos_serie;
    DROP INDEX IF EXISTS idx_equip_vehiculos_imei;

    ALTER TABLE equipamiento_vehiculos DROP COLUMN IF EXISTS modelo;
    ALTER TABLE equipamiento_vehiculos DROP COLUMN IF EXISTS nro_serie_dispositivo;
    ALTER TABLE equipamiento_vehiculos DROP COLUMN IF EXISTS imei;
    ALTER TABLE equipamiento_vehiculos DROP COLUMN IF EXISTS voltaje_operacion;
    ALTER TABLE equipamiento_vehiculos DROP COLUMN IF EXISTS vehiculo_asignado;
  `);
}

export async function down(client) {
  await client.query(`
    ALTER TABLE contenedores ADD COLUMN IF NOT EXISTS capacidad VARCHAR(100);
    ALTER TABLE contenedores ADD COLUMN IF NOT EXISTS material VARCHAR(100);
    ALTER TABLE contenedores ADD COLUMN IF NOT EXISTS estado_estructura VARCHAR(100);

    ALTER TABLE equipamiento_estacion_servicio ADD COLUMN IF NOT EXISTS modelo VARCHAR(100);
    ALTER TABLE equipamiento_estacion_servicio ADD COLUMN IF NOT EXISTS nro_mangueras INT;
    ALTER TABLE equipamiento_estacion_servicio ADD COLUMN IF NOT EXISTS capacidad_flujo VARCHAR(100);
    ALTER TABLE equipamiento_estacion_servicio ADD COLUMN IF NOT EXISTS tipo_combustible VARCHAR(100);
    ALTER TABLE equipamiento_estacion_servicio ADD COLUMN IF NOT EXISTS voltaje_fase VARCHAR(50);
    ALTER TABLE equipamiento_estacion_servicio ADD COLUMN IF NOT EXISTS nro_calibracion VARCHAR(100);

    ALTER TABLE equipamiento_vehiculos ADD COLUMN IF NOT EXISTS modelo VARCHAR(100);
    ALTER TABLE equipamiento_vehiculos ADD COLUMN IF NOT EXISTS nro_serie_dispositivo VARCHAR(100);
    ALTER TABLE equipamiento_vehiculos ADD COLUMN IF NOT EXISTS imei VARCHAR(50);
    ALTER TABLE equipamiento_vehiculos ADD COLUMN IF NOT EXISTS voltaje_operacion VARCHAR(50);
    ALTER TABLE equipamiento_vehiculos ADD COLUMN IF NOT EXISTS vehiculo_asignado VARCHAR(100);
  `);
}
