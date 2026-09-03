/**
 * Migración 007: Creación de índices de alto rendimiento para acelerar consultas y joins
 */

export async function up(client) {
  // Índices para Módulo de Líneas y Telefonía
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_linea_numero ON linea(numero);
    CREATE INDEX IF NOT EXISTS idx_linea_plan_id ON linea(plan_id);
    CREATE INDEX IF NOT EXISTS idx_linea_personal_id ON linea(personal_id);
    CREATE INDEX IF NOT EXISTS idx_linea_estado ON linea(estado);
    CREATE INDEX IF NOT EXISTS idx_linea_fecha_asignacion ON linea(fecha_asignacion DESC);

    CREATE INDEX IF NOT EXISTS idx_plan_telefonia_telefonia_id ON plan_telefonia(telefonia_id);
    CREATE INDEX IF NOT EXISTS idx_plan_telefonia_estado ON plan_telefonia(estado);

    CREATE INDEX IF NOT EXISTS idx_personal_nombre ON personal(nombre);
    CREATE INDEX IF NOT EXISTS idx_personal_estado ON personal(estado);
    CREATE INDEX IF NOT EXISTS idx_personal_departamento ON personal(departamento);

    CREATE INDEX IF NOT EXISTS idx_historial_linea_linea_id ON historial_linea(linea_id);
    CREATE INDEX IF NOT EXISTS idx_historial_linea_fecha ON historial_linea(fecha DESC);
    CREATE INDEX IF NOT EXISTS idx_historial_linea_personal_nuevo ON historial_linea(personal_nuevo_id);
    CREATE INDEX IF NOT EXISTS idx_historial_linea_personal_ant ON historial_linea(personal_anterior_id);
  `);

  // Índices para Módulo de Activos y Movimientos
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_activo_codigo ON activo(codigo);
    CREATE INDEX IF NOT EXISTS idx_activo_tipo_activo ON activo(tipo_activo);
    CREATE INDEX IF NOT EXISTS idx_activo_clasificacion ON activo(clasificacion);
    CREATE INDEX IF NOT EXISTS idx_activo_lugar_id ON activo(lugar_id);
    CREATE INDEX IF NOT EXISTS idx_activo_marca_id ON activo(marca_id);
    CREATE INDEX IF NOT EXISTS idx_activo_proveedor_id ON activo(proveedor_id);
    CREATE INDEX IF NOT EXISTS idx_activo_estado ON activo(estado);

    CREATE INDEX IF NOT EXISTS idx_movimiento_activo_id ON movimiento(activo_id);
    CREATE INDEX IF NOT EXISTS idx_movimiento_fecha ON movimiento(fecha_movimiento DESC);
    CREATE INDEX IF NOT EXISTS idx_movimiento_origen ON movimiento(lugar_origen_id);
    CREATE INDEX IF NOT EXISTS idx_movimiento_destino ON movimiento(lugar_destino_id);

    CREATE INDEX IF NOT EXISTS idx_bitacora_tabla_reg ON bitacora_auditoria(tabla_afectada, registro_id);
    CREATE INDEX IF NOT EXISTS idx_bitacora_fecha ON bitacora_auditoria(fecha DESC);
  `);
}

export async function down(client) {
  await client.query(`
    DROP INDEX IF EXISTS idx_linea_numero;
    DROP INDEX IF EXISTS idx_linea_plan_id;
    DROP INDEX IF EXISTS idx_linea_personal_id;
    DROP INDEX IF EXISTS idx_linea_estado;
    DROP INDEX IF EXISTS idx_linea_fecha_asignacion;
    DROP INDEX IF EXISTS idx_plan_telefonia_telefonia_id;
    DROP INDEX IF EXISTS idx_plan_telefonia_estado;
    DROP INDEX IF EXISTS idx_personal_nombre;
    DROP INDEX IF EXISTS idx_personal_estado;
    DROP INDEX IF EXISTS idx_personal_departamento;
    DROP INDEX IF EXISTS idx_historial_linea_linea_id;
    DROP INDEX IF EXISTS idx_historial_linea_fecha;
    DROP INDEX IF EXISTS idx_historial_linea_personal_nuevo;
    DROP INDEX IF EXISTS idx_historial_linea_personal_ant;
    DROP INDEX IF EXISTS idx_activo_codigo;
    DROP INDEX IF EXISTS idx_activo_tipo_activo;
    DROP INDEX IF EXISTS idx_activo_clasificacion;
    DROP INDEX IF EXISTS idx_activo_lugar_id;
    DROP INDEX IF EXISTS idx_activo_marca_id;
    DROP INDEX IF EXISTS idx_activo_proveedor_id;
    DROP INDEX IF EXISTS idx_activo_estado;
    DROP INDEX IF EXISTS idx_movimiento_activo_id;
    DROP INDEX IF EXISTS idx_movimiento_fecha;
    DROP INDEX IF EXISTS idx_movimiento_origen;
    DROP INDEX IF EXISTS idx_movimiento_destino;
    DROP INDEX IF EXISTS idx_bitacora_tabla_reg;
    DROP INDEX IF EXISTS idx_bitacora_fecha;
  `);
}