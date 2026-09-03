import { pool } from '@/lib/db/database';
import { registrarAuditoria } from '@/server/utils/auditoria';

export const obtenerPersonal = async (req: any, res: any) => {
  try {
    const query = `
      SELECT 
        p.*,
        COUNT(l.id) as total_lineas,
        COALESCE(SUM(CASE WHEN l.estado = 'ACTIVA' THEN pt.costo ELSE 0 END), 0) as costo_total_mensual
      FROM personal p
      LEFT JOIN linea l ON l.personal_id = p.id
      LEFT JOIN plan_telefonia pt ON l.plan_id = pt.id
      GROUP BY p.id
      ORDER BY p.nombre ASC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({ success: false, error: 'Error al obtener personal' });
  }
};

export const obtenerPersonalPorId = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const personalResult = await pool.query('SELECT * FROM personal WHERE id = $1', [id]);
    if (personalResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Personal no encontrado' });
    }

    const lineasResult = await pool.query(
      `SELECT 
        l.*,
        pt.nombre as plan_nombre,
        pt.costo as plan_costo,
        t.nombre as telefonia_nombre
      FROM linea l
      JOIN plan_telefonia pt ON l.plan_id = pt.id
      JOIN telefonia t ON pt.telefonia_id = t.id
      WHERE l.personal_id = $1
      ORDER BY l.numero ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        personal: personalResult.rows[0],
        lineas: lineasResult.rows,
      },
    });
  } catch (error) {
    console.error('Error al obtener detalle del personal:', error);
    res.status(500).json({ success: false, error: 'Error al obtener detalle del personal' });
  }
};

export const crearPersonal = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { nombre, departamento, cargo, estado } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }
    if (!departamento || departamento.trim() === '') {
      return res.status(400).json({ success: false, error: 'El departamento es requerido' });
    }
    if (!cargo || cargo.trim() === '') {
      return res.status(400).json({ success: false, error: 'El cargo es requerido' });
    }

    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO personal (nombre, departamento, cargo, estado)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre.trim(), departamento.trim(), cargo.trim(), estado || 'ACTIVO']
    );

    await registrarAuditoria(client, {
      tabla: 'personal',
      registro_id: result.rows[0].id,
      accion: 'INSERT',
      valores_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip: req.ip || null,
      cliente: client,
    });

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al crear personal:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear personal' });
  } finally {
    client.release();
  }
};

export const actualizarPersonal = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre, departamento, cargo, estado } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }
    if (!departamento || departamento.trim() === '') {
      return res.status(400).json({ success: false, error: 'El departamento es requerido' });
    }
    if (!cargo || cargo.trim() === '') {
      return res.status(400).json({ success: false, error: 'El cargo es requerido' });
    }

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM personal WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Personal no encontrado' });
    }

    const result = await client.query(
      `UPDATE personal 
       SET nombre = $1,
           departamento = $2,
           cargo = $3,
           estado = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [nombre.trim(), departamento.trim(), cargo.trim(), estado || prevResult.rows[0].estado, id]
    );

    await registrarAuditoria(client, {
      tabla: 'personal',
      registro_id: parseInt(id),
      accion: 'UPDATE',
      valores_anteriores: prevResult.rows[0],
      valores_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip: req.ip || null,
      cliente: client,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar personal:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar personal' });
  } finally {
    client.release();
  }
};

export const eliminarPersonal = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const lineasCheck = await client.query('SELECT COUNT(*) FROM linea WHERE personal_id = $1 AND estado != \'BAJA\'', [id]);
    if (parseInt(lineasCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar el personal porque tiene líneas activas asignadas. Primero reasigna o da de baja sus líneas.',
      });
    }

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM personal WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Personal no encontrado' });
    }

    await client.query('DELETE FROM personal WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      tabla: 'personal',
      registro_id: parseInt(id),
      accion: 'DELETE',
      valores_anteriores: prevResult.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip: req.ip || null,
      cliente: client,
    });

    await client.query('COMMIT');
    res.json({ success: true, message: 'Personal eliminado exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar personal:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al eliminar personal' });
  } finally {
    client.release();
  }
};
