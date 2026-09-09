import { pool } from '@/lib/db/database';
import { registrarAuditoria } from '@/server/utils/auditoria';

export const obtenerLineas = async (req: any, res: any) => {
  try {
    const { search, telefonia_id, estado, personal_id, plan_id } = req.query;

    let query = `
      SELECT 
        l.*,
        pt.nombre as plan_nombre,
        pt.costo as plan_costo,
        pt.estado as plan_estado,
        t.id as telefonia_id,
        t.nombre as telefonia_nombre,
        p.nombre as personal_nombre,
        p.departamento as personal_departamento,
        p.cargo as personal_cargo
      FROM linea l
      JOIN plan_telefonia pt ON l.plan_id = pt.id
      JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN personal p ON l.personal_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search && search.trim() !== '') {
      query += ` AND (
        l.numero ILIKE $${paramCount} OR 
        l.equipo_asignado ILIKE $${paramCount} OR 
        p.nombre ILIKE $${paramCount} OR 
        p.departamento ILIKE $${paramCount} OR 
        p.cargo ILIKE $${paramCount} OR
        pt.nombre ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
      paramCount++;
    }

    if (telefonia_id) {
      query += ` AND t.id = $${paramCount}`;
      params.push(telefonia_id);
      paramCount++;
    }

    if (estado) {
      query += ` AND l.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (personal_id) {
      query += ` AND l.personal_id = $${paramCount}`;
      params.push(personal_id);
      paramCount++;
    }

    if (plan_id) {
      query += ` AND l.plan_id = $${paramCount}`;
      params.push(plan_id);
      paramCount++;
    }

    query += ` ORDER BY l.numero ASC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener líneas:', error);
    res.status(500).json({ success: false, error: 'Error al obtener líneas' });
  }
};

export const obtenerLineaPorId = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        l.*,
        pt.nombre as plan_nombre,
        pt.costo as plan_costo,
        pt.estado as plan_estado,
        t.id as telefonia_id,
        t.nombre as telefonia_nombre,
        p.nombre as personal_nombre,
        p.departamento as personal_departamento,
        p.cargo as personal_cargo
      FROM linea l
      JOIN plan_telefonia pt ON l.plan_id = pt.id
      JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN personal p ON l.personal_id = p.id
      WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener línea:', error);
    res.status(500).json({ success: false, error: 'Error al obtener línea' });
  }
};

export const crearLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { numero, equipo_asignado, plan_id, personal_id, estado, fecha_asignacion, observaciones } = req.body;

    if (!numero || numero.trim() === '') {
      return res.status(400).json({ success: false, error: 'El número de línea es requerido' });
    }
    if (!plan_id) {
      return res.status(400).json({ success: false, error: 'El plan es requerido' });
    }

    await client.query('BEGIN');

    // Verificar si el número ya existe
    const existsCheck = await client.query('SELECT id FROM linea WHERE numero = $1', [numero.trim()]);
    if (existsCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'El número de línea ya se encuentra registrado' });
    }

    const estadoFinal = estado || (personal_id ? 'ACTIVA' : 'DISPONIBLE');
    const fechaAsignacionFinal = fecha_asignacion || (personal_id ? new Date().toISOString().split('T')[0] : null);

    const result = await client.query(
      `INSERT INTO linea (numero, equipo_asignado, plan_id, personal_id, estado, fecha_asignacion, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        numero.trim(),
        equipo_asignado ? equipo_asignado.trim() : null,
        plan_id,
        personal_id || null,
        estadoFinal,
        fechaAsignacionFinal,
        observaciones || null,
      ]
    );

    const nuevaLinea = result.rows[0];

    // Registrar evento inicial en historial
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_nuevo_id, plan_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $3, 'ASIGNACION', $4, $5)`,
      [
        nuevaLinea.id,
        personal_id || null,
        plan_id,
        personal_id ? 'Registro y asignación inicial de línea' : 'Registro de línea disponible en stock',
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: nuevaLinea.id,
      accion: 'CREAR',
      datos_nuevos: nuevaLinea,
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: nuevaLinea });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al crear línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear línea' });
  } finally {
    client.release();
  }
};

export const actualizarLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { numero, equipo_asignado, observaciones } = req.body;

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    if (numero && numero.trim() !== prevResult.rows[0].numero) {
      const existsCheck = await client.query('SELECT id FROM linea WHERE numero = $1 AND id != $2', [numero.trim(), id]);
      if (existsCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'El número ya pertenece a otra línea' });
      }
    }

    const result = await client.query(
      `UPDATE linea 
       SET numero = COALESCE($1, numero),
           equipo_asignado = $2,
           observaciones = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [
        numero ? numero.trim() : prevResult.rows[0].numero,
        equipo_asignado !== undefined ? equipo_asignado : prevResult.rows[0].equipo_asignado,
        observaciones !== undefined ? observaciones : prevResult.rows[0].observaciones,
        id,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'ACTUALIZAR',
      datos_anteriores: prevResult.rows[0],
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar línea' });
  } finally {
    client.release();
  }
};

export const transferirLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { personal_nuevo_id, motivo } = req.body;

    if (!personal_nuevo_id) {
      return res.status(400).json({ success: false, error: 'El nuevo personal es requerido para la transferencia' });
    }

    await client.query('BEGIN');
    const lineaResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (lineaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    const lineaActual = lineaResult.rows[0];
    const personalAnteriorId = lineaActual.personal_id;

    if (Number(personalAnteriorId) === Number(personal_nuevo_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'La línea ya se encuentra asignada a este personal' });
    }

    // Actualizar la línea con el nuevo personal y fecha
    const result = await client.query(
      `UPDATE linea 
       SET personal_id = $1,
           estado = 'ACTIVA',
           fecha_asignacion = CURRENT_DATE,
           fecha_baja = NULL,
           motivo_baja = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [personal_nuevo_id, id]
    );

    // Registrar en historial_linea
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $3, $4, $4, 'TRANSFERENCIA', $5, $6)`,
      [
        id,
        personalAnteriorId || null,
        personal_nuevo_id,
        lineaActual.plan_id,
        motivo ? motivo.trim() : 'Reasignación de personal',
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'TRANSFERENCIA',
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Línea transferida exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al transferir línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al transferir línea' });
  } finally {
    client.release();
  }
};

export const cambiarPlanLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { plan_nuevo_id, motivo } = req.body;

    if (!plan_nuevo_id) {
      return res.status(400).json({ success: false, error: 'El nuevo plan es requerido' });
    }

    await client.query('BEGIN');
    const lineaResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (lineaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    const lineaActual = lineaResult.rows[0];
    const planAnteriorId = lineaActual.plan_id;

    if (Number(planAnteriorId) === Number(plan_nuevo_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'La línea ya cuenta con este plan' });
    }

    const result = await client.query(
      `UPDATE linea 
       SET plan_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [plan_nuevo_id, id]
    );

    // Registrar en historial_linea
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $2, $3, $4, 'CAMBIO_PLAN', $5, $6)`,
      [
        id,
        lineaActual.personal_id || null,
        planAnteriorId,
        plan_nuevo_id,
        motivo ? motivo.trim() : 'Actualización de plan telefónico',
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'CAMBIO_PLAN',
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Plan de la línea actualizado exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al cambiar plan de la línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al cambiar plan de la línea' });
  } finally {
    client.release();
  }
};

export const darDeBajaLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { motivo_baja, fecha_baja } = req.body;

    if (!motivo_baja || motivo_baja.trim() === '') {
      return res.status(400).json({ success: false, error: 'El motivo de la baja es requerido' });
    }

    await client.query('BEGIN');
    const lineaResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (lineaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    const lineaActual = lineaResult.rows[0];
    const fechaBajaFinal = fecha_baja || new Date().toISOString().split('T')[0];

    const result = await client.query(
      `UPDATE linea 
       SET estado = 'BAJA',
           fecha_baja = $1,
           motivo_baja = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [fechaBajaFinal, motivo_baja.trim(), id]
    );

    // Registrar en historial_linea
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, plan_anterior_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $3, 'BAJA', $4, $5)`,
      [
        id,
        lineaActual.personal_id || null,
        lineaActual.plan_id,
        motivo_baja.trim(),
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'BAJA',
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Línea dada de baja exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al dar de baja la línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al dar de baja la línea' });
  } finally {
    client.release();
  }
};

export const obtenerHistorialLinea = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        h.*,
        pa.nombre as personal_anterior_nombre,
        pn.nombre as personal_nuevo_nombre,
        pla.nombre as plan_anterior_nombre,
        pln.nombre as plan_nuevo_nombre,
        u.nombre as usuario_nombre
      FROM historial_linea h
      LEFT JOIN personal pa ON h.personal_anterior_id = pa.id
      LEFT JOIN personal pn ON h.personal_nuevo_id = pn.id
      LEFT JOIN plan_telefonia pla ON h.plan_anterior_id = pla.id
      LEFT JOIN plan_telefonia pln ON h.plan_nuevo_id = pln.id
      LEFT JOIN usuario u ON h.usuario_id = u.id
      WHERE h.linea_id = $1
      ORDER BY h.fecha DESC`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener historial de línea:', error);
    res.status(500).json({ success: false, error: 'Error al obtener historial de línea' });
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
    console.error('Error al obtener estadísticas de líneas:', error);
    res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
  }
};

export const eliminarLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    await client.query('DELETE FROM linea WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'ELIMINAR',
      datos_anteriores: prevResult.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, message: 'Línea eliminada exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al eliminar línea' });
  } finally {
    client.release();
  }
};
