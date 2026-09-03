import { pool } from '@/lib/db/database';
import { registrarAuditoria } from '@/server/utils/auditoria';

export const obtenerTelefonias = async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT * FROM telefonia ORDER BY nombre ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener telefonías:', error);
    res.status(500).json({ success: false, error: 'Error al obtener telefonías' });
  }
};

export const crearTelefonia = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }

    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO telefonia (nombre) VALUES ($1) RETURNING *',
      [nombre.trim()]
    );

    await registrarAuditoria(client, {
      tabla: 'telefonia',
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
    console.error('Error al crear telefonía:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear telefonía' });
  } finally {
    client.release();
  }
};

export const actualizarTelefonia = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM telefonia WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Telefonía no encontrada' });
    }

    const result = await client.query(
      'UPDATE telefonia SET nombre = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [nombre.trim(), id]
    );

    await registrarAuditoria(client, {
      tabla: 'telefonia',
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
    console.error('Error al actualizar telefonía:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar telefonía' });
  } finally {
    client.release();
  }
};

export const eliminarTelefonia = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const planesCheck = await client.query('SELECT COUNT(*) FROM plan_telefonia WHERE telefonia_id = $1', [id]);
    if (parseInt(planesCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar la telefonía porque tiene planes asociados',
      });
    }

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM telefonia WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Telefonía no encontrada' });
    }

    await client.query('DELETE FROM telefonia WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      tabla: 'telefonia',
      registro_id: parseInt(id),
      accion: 'DELETE',
      valores_anteriores: prevResult.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip: req.ip || null,
      cliente: client,
    });

    await client.query('COMMIT');
    res.json({ success: true, message: 'Telefonía eliminada exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar telefonía:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al eliminar telefonía' });
  } finally {
    client.release();
  }
};
