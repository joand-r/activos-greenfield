import { pool } from '@/lib/db/database';
import { registrarAuditoria } from '@/server/utils/auditoria';

export const obtenerPlanes = async (req: any, res: any) => {
  try {
    const { telefonia_id, estado } = req.query;
    let query = `
      SELECT 
        pt.*,
        t.nombre as telefonia_nombre,
        COUNT(l.id) as total_lineas
      FROM plan_telefonia pt
      LEFT JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN linea l ON l.plan_id = pt.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (telefonia_id) {
      query += ` AND pt.telefonia_id = $${paramCount}`;
      params.push(telefonia_id);
      paramCount++;
    }

    if (estado) {
      query += ` AND pt.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    query += ` GROUP BY pt.id, t.nombre ORDER BY pt.nombre ASC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener planes' });
  }
};

export const crearPlan = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { telefonia_id, nombre, costo, estado, descripcion } = req.body;

    if (!telefonia_id) {
      return res.status(400).json({ success: false, error: 'La telefonía es requerida' });
    }
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre del plan es requerido' });
    }

    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO plan_telefonia (telefonia_id, nombre, costo, estado, descripcion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        telefonia_id,
        nombre.trim(),
        costo ? parseFloat(costo) : 0.0,
        estado || 'DISPONIBLE',
        descripcion || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'plan_telefonia',
      registro_id: result.rows[0].id,
      accion: 'CREAR',
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al crear plan:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear plan' });
  } finally {
    client.release();
  }
};

export const actualizarPlan = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { telefonia_id, nombre, costo, estado, descripcion } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre del plan es requerido' });
    }

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM plan_telefonia WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Plan no encontrado' });
    }

    const result = await client.query(
      `UPDATE plan_telefonia 
       SET telefonia_id = COALESCE($1, telefonia_id),
           nombre = $2,
           costo = $3,
           estado = $4,
           descripcion = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [
        telefonia_id || prevResult.rows[0].telefonia_id,
        nombre.trim(),
        costo !== undefined ? parseFloat(costo) : prevResult.rows[0].costo,
        estado || prevResult.rows[0].estado,
        descripcion !== undefined ? descripcion : prevResult.rows[0].descripcion,
        id,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'plan_telefonia',
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
    console.error('Error al actualizar plan:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar plan' });
  } finally {
    client.release();
  }
};

export const eliminarPlan = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const lineasCheck = await client.query('SELECT COUNT(*) FROM linea WHERE plan_id = $1', [id]);
    if (parseInt(lineasCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar el plan porque tiene líneas asociadas. En su lugar, puedes cambiar su estado a No Disponible.',
      });
    }

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM plan_telefonia WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Plan no encontrado' });
    }

    await client.query('DELETE FROM plan_telefonia WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      tabla_afectada: 'plan_telefonia',
      registro_id: parseInt(id),
      accion: 'ELIMINAR',
      datos_anteriores: prevResult.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, message: 'Plan eliminado exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar plan:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al eliminar plan' });
  } finally {
    client.release();
  }
};
