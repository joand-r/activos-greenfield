import { pool } from '../config/database.js';
import { registrarAuditoria } from '../utils/auditoria.js';

/**
 * 📋 CONTROLADOR DE LUGARES
 */

export const obtenerLugares = async (req, res) => {
  try {
    const { tipo } = req.query;
    let query = 'SELECT * FROM lugar';
    const params = [];
    
    if (tipo) {
      query += ' WHERE tipo = $1';
      params.push(tipo);
    }
    
    query += ' ORDER BY nombre ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener lugares:', error);
    res.status(500).json({ error: 'Error al obtener lugares' });
  }
};

export const obtenerLugarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM lugar WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener lugar:', error);
    res.status(500).json({ error: 'Error al obtener lugar' });
  }
};

export const crearLugar = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, inicial, tipo } = req.body;
    
    if (!nombre || !inicial) {
      return res.status(400).json({ error: 'Nombre e inicial son requeridos' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      'INSERT INTO lugar (nombre, inicial, tipo) VALUES ($1, $2, $3) RETURNING *',
      [nombre.trim(), inicial.trim().toUpperCase(), tipo || null]
    );

    const nuevoLugar = result.rows[0];

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'CREAR',
      tabla_afectada: 'lugar',
      registro_id: nuevoLugar.id,
      datos_nuevos: nuevoLugar,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.status(201).json(nuevoLugar);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear lugar:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un lugar con ese nombre o inicial' });
    }
    
    res.status(500).json({ error: 'Error al crear lugar' });
  } finally {
    client.release();
  }
};

export const actualizarLugar = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre, inicial, tipo } = req.body;

    if (!nombre || !inicial) {
      return res.status(400).json({ error: 'Nombre e inicial son requeridos' });
    }

    await client.query('BEGIN');

    const anteriorResult = await client.query(
      'SELECT * FROM lugar WHERE id = $1',
      [id]
    );

    if (anteriorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    const datosAnteriores = anteriorResult.rows[0];

    const result = await client.query(
      'UPDATE lugar SET nombre = $1, inicial = $2, tipo = $3 WHERE id = $4 RETURNING *',
      [nombre.trim(), inicial.trim().toUpperCase(), tipo || null, id]
    );

    const lugarActualizado = result.rows[0];

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'EDITAR',
      tabla_afectada: 'lugar',
      registro_id: parseInt(id),
      datos_anteriores: datosAnteriores,
      datos_nuevos: lugarActualizado,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json(lugarActualizado);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar lugar:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un lugar con ese nombre o inicial' });
    }
    
    res.status(500).json({ error: 'Error al actualizar lugar' });
  } finally {
    client.release();
  }
};

export const eliminarLugar = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM lugar WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    const lugarEliminado = result.rows[0];

    const activosResult = await client.query(
      'SELECT COUNT(*) FROM activo WHERE lugar_id = $1',
      [id]
    );

    if (parseInt(activosResult.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'No se puede eliminar el lugar porque tiene activos asociados' 
      });
    }

    await client.query('DELETE FROM lugar WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'ELIMINAR',
      tabla_afectada: 'lugar',
      registro_id: parseInt(id),
      datos_anteriores: lugarEliminado,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json({ message: 'Lugar eliminado exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar lugar:', error);
    res.status(500).json({ error: 'Error al eliminar lugar' });
  } finally {
    client.release();
  }
};
