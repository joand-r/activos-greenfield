import { pool } from '../config/database.js';
import { registrarAuditoria } from '../utils/auditoria.js';

/**
 * 🚚 CONTROLADOR DE MOVIMIENTOS
 */

export const obtenerMovimientos = async (req, res) => {
  try {
    const { activo_id } = req.query;
    
    let query = `
      SELECT 
        m.*,
        a.nombre as activo_nombre,
        a.codigo as activo_codigo,
        lo.nombre as lugar_origen_nombre,
        ld.nombre as lugar_destino_nombre
      FROM movimiento m
      LEFT JOIN activo a ON m.activo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (activo_id) {
      query += ' AND m.activo_id = $1';
      params.push(activo_id);
    }
    
    query += ' ORDER BY m.fecha_movimiento DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

export const obtenerMovimientoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        m.*,
        a.nombre as activo_nombre,
        a.codigo as activo_codigo,
        lo.nombre as lugar_origen_nombre,
        ld.nombre as lugar_destino_nombre
      FROM movimiento m
      LEFT JOIN activo a ON m.activo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      WHERE m.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener movimiento:', error);
    res.status(500).json({ error: 'Error al obtener movimiento' });
  }
};

export const crearMovimiento = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      activo_id,
      lugar_origen_id,
      lugar_destino_id,
      fecha_movimiento,
      responsable,
      observaciones,
      estado
    } = req.body;
    
    if (!activo_id || !lugar_origen_id || !lugar_destino_id || !responsable) {
      return res.status(400).json({ 
        error: 'Activo, lugares y responsable son requeridos' 
      });
    }

    if (lugar_origen_id === lugar_destino_id) {
      return res.status(400).json({ 
        error: 'El lugar de origen y destino deben ser diferentes' 
      });
    }

    await client.query('BEGIN');

    // Generar código de movimiento (MOV-001, MOV-002, etc.)
    const codigoResult = await client.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(codigo_movimiento FROM 5) AS INTEGER)), 0) + 1 as siguiente
       FROM movimiento 
       WHERE codigo_movimiento LIKE 'MOV-%'`
    );
    const siguiente = codigoResult.rows[0].siguiente;
    const codigo_movimiento = `MOV-${String(siguiente).padStart(3, '0')}`;

    const result = await client.query(
      `INSERT INTO movimiento 
       (codigo_movimiento, activo_id, lugar_origen_id, lugar_destino_id, 
        fecha_movimiento, responsable, observaciones, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        codigo_movimiento,
        activo_id,
        lugar_origen_id,
        lugar_destino_id,
        fecha_movimiento || new Date(),
        responsable,
        observaciones || null,
        estado || 'Pendiente'
      ]
    );

    const nuevoMovimiento = result.rows[0];

    // Si el movimiento está completado, actualizar el lugar del activo
    if (estado === 'Completado') {
      await client.query(
        'UPDATE activo SET lugar_id = $1 WHERE id = $2',
        [lugar_destino_id, activo_id]
      );
    }

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'CREAR',
      tabla_afectada: 'movimiento',
      registro_id: nuevoMovimiento.id,
      datos_nuevos: nuevoMovimiento,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.status(201).json(nuevoMovimiento);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ error: 'Error al crear movimiento' });
  } finally {
    client.release();
  }
};

export const actualizarMovimiento = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      fecha_movimiento,
      responsable,
      observaciones,
      estado
    } = req.body;

    await client.query('BEGIN');

    const anteriorResult = await client.query(
      'SELECT * FROM movimiento WHERE id = $1',
      [id]
    );

    if (anteriorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    const datosAnteriores = anteriorResult.rows[0];

    const result = await client.query(
      `UPDATE movimiento 
       SET fecha_movimiento = $1, responsable = $2, observaciones = $3, estado = $4
       WHERE id = $5 RETURNING *`,
      [fecha_movimiento, responsable, observaciones, estado, id]
    );

    const movimientoActualizado = result.rows[0];

    // Si el estado cambió a Completado, actualizar lugar del activo
    if (estado === 'Completado' && datosAnteriores.estado !== 'Completado') {
      await client.query(
        'UPDATE activo SET lugar_id = $1 WHERE id = $2',
        [movimientoActualizado.lugar_destino_id, movimientoActualizado.activo_id]
      );
    }

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'EDITAR',
      tabla_afectada: 'movimiento',
      registro_id: parseInt(id),
      datos_anteriores: datosAnteriores,
      datos_nuevos: movimientoActualizado,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json(movimientoActualizado);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar movimiento:', error);
    res.status(500).json({ error: 'Error al actualizar movimiento' });
  } finally {
    client.release();
  }
};

export const eliminarMovimiento = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM movimiento WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    const movimientoEliminado = result.rows[0];

    await client.query('DELETE FROM movimiento WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'ELIMINAR',
      tabla_afectada: 'movimiento',
      registro_id: parseInt(id),
      datos_anteriores: movimientoEliminado,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json({ message: 'Movimiento eliminado exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar movimiento:', error);
    res.status(500).json({ error: 'Error al eliminar movimiento' });
  } finally {
    client.release();
  }
};
