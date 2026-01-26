import { pool } from '../config/database.js';

// @desc    Obtener todas las categorías
// @route   GET /api/categorias
// @access  Public
export const getCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categoria ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getCategorias:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// @desc    Obtener una categoría por ID
// @route   GET /api/categorias/:id
// @access  Public
export const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM categoria WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en getCategoriaById:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// @desc    Crear nueva categoría
// @route   POST /api/categorias
// @access  Private/Admin
export const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      `INSERT INTO categoria (nombre, descripcion) 
       VALUES ($1, $2) 
       RETURNING *`,
      [nombre, descripcion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en createCategoria:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'La categoría ya existe' });
    }
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// @desc    Actualizar categoría
// @route   PUT /api/categorias/:id
// @access  Private/Admin
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      `UPDATE categoria 
       SET nombre = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [nombre, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en updateCategoria:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// @desc    Eliminar categoría
// @route   DELETE /api/categorias/:id
// @access  Private/Admin
export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene artículos asociados
    const articulos = await pool.query(
      'SELECT COUNT(*) FROM articulo WHERE categoria_id = $1',
      [id]
    );

    if (parseInt(articulos.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque tiene artículos asociados' 
      });
    }

    const result = await pool.query(
      'DELETE FROM categoria WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error en deleteCategoria:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};
