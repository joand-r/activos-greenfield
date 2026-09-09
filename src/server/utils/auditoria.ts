/**
 * 📝 UTILIDAD PARA AUDITORÍA
 * Registra todas las acciones en la tabla bitacora_auditoria
 */

export const registrarAuditoria = async (client, datos) => {
  const usuario_id = datos.usuario_id || datos.usuarioId || null;
  const accion = datos.accion || 'ACCION';
  const tabla_afectada = datos.tabla_afectada || datos.tabla || 'general';
  const registro_id = datos.registro_id || datos.registroId || null;
  const datos_anteriores = datos.datos_anteriores || datos.valores_anteriores || null;
  const datos_nuevos = datos.datos_nuevos || datos.valores_nuevos || null;
  const ip_usuario = datos.ip_usuario || datos.ip || null;

  try {
    await client.query(
      `INSERT INTO bitacora_auditoria 
       (usuario_id, accion, tabla_afectada, registro_id, datos_anteriores, datos_nuevos, ip_usuario) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        usuario_id,
        accion,
        tabla_afectada,
        registro_id,
        datos_anteriores ? JSON.stringify(datos_anteriores) : null,
        datos_nuevos ? JSON.stringify(datos_nuevos) : null,
        ip_usuario
      ]
    );
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
    // No lanzar error para no interrumpir la operación principal
  }
};

/**
 * Obtener historial de auditoría de un registro específico
 */
export const obtenerHistorialAuditoria = async (pool, tabla, registroId) => {
  try {
    const result = await pool.query(
      `SELECT ba.*, u.nombre as usuario_nombre, u.email as usuario_email
       FROM bitacora_auditoria ba
       LEFT JOIN usuario u ON ba.usuario_id = u.id
       WHERE ba.tabla_afectada = $1 AND ba.registro_id = $2
       ORDER BY ba.fecha DESC`,
      [tabla, registroId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};
