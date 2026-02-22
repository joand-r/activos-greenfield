import { pool } from '../config/database.js';
import { registrarAuditoria } from '../utils/auditoria.js';

/**
 * 📋 CONTROLADOR DE PROVEEDORES
 */

export const obtenerProveedores = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM proveedor ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

export const obtenerProveedorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM proveedor WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

export const crearProveedor = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, nit } = req.body;
    
    if (!nombre || !nit) {
      return res.status(400).json({ error: 'Nombre y NIT son requeridos' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      'INSERT INTO proveedor (nombre, nit) VALUES ($1, $2) RETURNING *',
      [nombre.trim(), nit.trim()]
    );

    const nuevoProveedor = result.rows[0];

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'CREAR',
      tabla_afectada: 'proveedor',
      registro_id: nuevoProveedor.id,
      datos_nuevos: nuevoProveedor,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear proveedor:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un proveedor con ese NIT' });
    }
    
    res.status(500).json({ error: 'Error al crear proveedor' });
  } finally {
    client.release();
  }
};

export const actualizarProveedor = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre, nit } = req.body;

    if (!nombre || !nit) {
      return res.status(400).json({ error: 'Nombre y NIT son requeridos' });
    }

    await client.query('BEGIN');

    const anteriorResult = await client.query(
      'SELECT * FROM proveedor WHERE id = $1',
      [id]
    );

    if (anteriorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const datosAnteriores = anteriorResult.rows[0];

    const result = await client.query(
      'UPDATE proveedor SET nombre = $1, nit = $2 WHERE id = $3 RETURNING *',
      [nombre.trim(), nit.trim(), id]
    );

    const proveedorActualizado = result.rows[0];

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'EDITAR',
      tabla_afectada: 'proveedor',
      registro_id: parseInt(id),
      datos_anteriores: datosAnteriores,
      datos_nuevos: proveedorActualizado,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json(proveedorActualizado);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar proveedor:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un proveedor con ese NIT' });
    }
    
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  } finally {
    client.release();
  }
};

export const eliminarProveedor = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM proveedor WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const proveedorEliminado = result.rows[0];

    const activosResult = await client.query(
      'SELECT COUNT(*) FROM activo WHERE proveedor_id = $1',
      [id]
    );

    if (parseInt(activosResult.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'No se puede eliminar el proveedor porque tiene activos asociados' 
      });
    }

    await client.query('DELETE FROM proveedor WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'ELIMINAR',
      tabla_afectada: 'proveedor',
      registro_id: parseInt(id),
      datos_anteriores: proveedorEliminado,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  } finally {
    client.release();
  }
};
