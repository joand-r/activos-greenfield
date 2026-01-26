import { pool } from '../config/database.js';

// @desc    Obtener todos los proveedores
// @route   GET /api/proveedores
// @access  Public
export const getProveedores = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM proveedor ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getProveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// @desc    Obtener un proveedor por ID
// @route   GET /api/proveedores/:id
// @access  Public
export const getProveedorById = async (req, res) => {
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
    console.error('Error en getProveedorById:', error);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

// @desc    Crear nuevo proveedor
// @route   POST /api/proveedores
// @access  Private/Admin
export const createProveedor = async (req, res) => {
  try {
    const { nombre, nit } = req.body;

    if (!nombre || !nit) {
      return res.status(400).json({ error: 'El nombre y NIT son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO proveedor (nombre, nit) 
       VALUES ($1, $2) 
       RETURNING *`,
      [nombre, nit]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en createProveedor:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'El proveedor o NIT ya existe' });
    }
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

// @desc    Actualizar proveedor
// @route   PUT /api/proveedores/:id
// @access  Private/Admin
export const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nit } = req.body;

    if (!nombre || !nit) {
      return res.status(400).json({ error: 'El nombre y NIT son requeridos' });
    }

    const result = await pool.query(
      `UPDATE proveedor 
       SET nombre = $1, nit = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [nombre, nit, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en updateProveedor:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El proveedor o NIT ya existe' });
    }
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

// @desc    Eliminar proveedor
// @route   DELETE /api/proveedores/:id
// @access  Private/Admin
export const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene artículos asociados
    const articulos = await pool.query(
      'SELECT COUNT(*) FROM articulo WHERE proveedor_id = $1',
      [id]
    );

    if (parseInt(articulos.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el proveedor porque tiene artículos asociados' 
      });
    }

    const result = await pool.query(
      'DELETE FROM proveedor WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteProveedor:', error);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
};
