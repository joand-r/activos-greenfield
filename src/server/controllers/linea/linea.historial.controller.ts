import { pool, ensureDatabaseSchema } from "@/lib/db/database";

export const obtenerHistorialLinea = async (req: any, res: any) => {
  try {
    await ensureDatabaseSchema();
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        h.*,
        pa.nombre as personal_anterior_nombre,
        pn.nombre as personal_nuevo_nombre,
        pla.nombre as plan_anterior_nombre,
        pln.nombre as plan_nuevo_nombre,
        aa.codigo as activo_anterior_codigo,
        cel_a.modelo as activo_anterior_modelo,
        an.codigo as activo_nuevo_codigo,
        cel_n.modelo as activo_nuevo_modelo,
        u.nombre as usuario_nombre
      FROM historial_linea h
      LEFT JOIN personal pa ON h.personal_anterior_id = pa.id
      LEFT JOIN personal pn ON h.personal_nuevo_id = pn.id
      LEFT JOIN plan_telefonia pla ON h.plan_anterior_id = pla.id
      LEFT JOIN plan_telefonia pln ON h.plan_nuevo_id = pln.id
      LEFT JOIN activo aa ON h.activo_anterior_id = aa.id
      LEFT JOIN celulares cel_a ON aa.id = cel_a.activo_id
      LEFT JOIN activo an ON h.activo_nuevo_id = an.id
      LEFT JOIN celulares cel_n ON an.id = cel_n.activo_id
      LEFT JOIN usuario u ON h.usuario_id = u.id
      WHERE h.linea_id = $1
      ORDER BY h.fecha DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        eventos_linea: result.rows,
      },
    });
  } catch (error) {
    console.error("Error al obtener historial de línea:", error);
    res.status(500).json({ success: false, error: "Error al obtener historial de línea" });
  }
};

export const obtenerEstadisticas = async (req: any, res: any) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*)::int as total_lineas,
        COUNT(CASE WHEN l.estado = 'ACTIVA' THEN 1 END)::int as lineas_activas,
        COUNT(CASE WHEN l.estado = 'BAJA' THEN 1 END)::int as lineas_bajas,
        COUNT(CASE WHEN l.estado = 'DISPONIBLE' THEN 1 END)::int as lineas_disponibles,
        COALESCE(SUM(CASE WHEN l.estado = 'ACTIVA' THEN pt.costo ELSE 0 END), 0)::float as costo_mensual_total,
        COUNT(DISTINCT CASE WHEN l.estado = 'ACTIVA' AND l.personal_id IS NOT NULL THEN l.personal_id END)::int as total_personal_con_lineas
      FROM linea l
      LEFT JOIN plan_telefonia pt ON l.plan_id = pt.id
    `;
    const result = await pool.query(statsQuery);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error al obtener estadísticas de líneas:", error);
    res.status(500).json({ success: false, error: "Error al obtener estadísticas" });
  }
};
