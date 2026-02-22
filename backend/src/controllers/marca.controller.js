import { pool } from '../config/database.js';
import { registrarAuditoria } from '../utils/auditoria.js';

/**
 * 📋 CONTROLADOR DE MARCAS
 * CRUD completo para gestión de marcas
 */

// Obtener todas las marcas
export const obtenerMarcas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM marca ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
};

// Obtener marca por ID
export const obtenerMarcaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM marca WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener marca:', error);
    res.status(500).json({ error: 'Error al obtener marca' });
  }
};

// Crear marca
export const crearMarca = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, descripcion } = req.body;
    
    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    await client.query('BEGIN');

    // Crear marca
    const result = await client.query(
      'INSERT INTO marca (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre.trim(), descripcion || null]
    );

    const nuevaMarca = result.rows[0];

    // Registrar en auditoría
    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'CREAR',
      tabla_afectada: 'marca',
      registro_id: nuevaMarca.id,
      datos_nuevos: nuevaMarca,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.status(201).json(nuevaMarca);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear marca:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Ya existe una marca con ese nombre' });
    }
    
    res.status(500).json({ error: 'Error al crear marca' });
  } finally {
    client.release();
  }
};

// Actualizar marca
export const actualizarMarca = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    await client.query('BEGIN');

    // Obtener datos anteriores
    const anteriorResult = await client.query(
      'SELECT * FROM marca WHERE id = $1',
      [id]
    );

    if (anteriorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Marca no encontrada' });
    }

    const datosAnteriores = anteriorResult.rows[0];

    // Actualizar marca
    const result = await client.query(
      'UPDATE marca SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre.trim(), descripcion || null, id]
    );

    const marcaActualizada = result.rows[0];

    // Registrar en auditoría
    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'EDITAR',
      tabla_afectada: 'marca',
      registro_id: parseInt(id),
      datos_anteriores: datosAnteriores,
      datos_nuevos: marcaActualizada,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json(marcaActualizada);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar marca:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe una marca con ese nombre' });
    }
    
    res.status(500).json({ error: 'Error al actualizar marca' });
  } finally {
    client.release();
  }
};

// Eliminar marca
export const eliminarMarca = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Obtener datos antes de eliminar
    const result = await client.query(
      'SELECT * FROM marca WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Marca no encontrada' });
    }

    const marcaEliminada = result.rows[0];

    // Verificar si tiene activos asociados
    const activosResult = await client.query(
      'SELECT COUNT(*) FROM activo WHERE marca_id = $1',
      [id]
    );

    if (parseInt(activosResult.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'No se puede eliminar la marca porque tiene activos asociados' 
      });
    }

    // Eliminar marca
    await client.query('DELETE FROM marca WHERE id = $1', [id]);

    // Registrar en auditoría
    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'ELIMINAR',
      tabla_afectada: 'marca',
      registro_id: parseInt(id),
      datos_anteriores: marcaEliminada,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json({ message: 'Marca eliminada exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar marca:', error);
    res.status(500).json({ error: 'Error al eliminar marca' });
  } finally {
    client.release();
  }
};
