import { pool } from '../config/database.js';

// @desc    Obtener todas las marcas
// @route   GET /api/marcas
// @access  Public
export const getMarcas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM marca ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getMarcas:', error);
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
};

// @desc    Obtener una marca por ID
// @route   GET /api/marcas/:id
// @access  Public
export const getMarcaById = async (req, res) => {
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
    console.error('Error en getMarcaById:', error);
    res.status(500).json({ error: 'Error al obtener marca' });
  }
};

// @desc    Crear nueva marca
// @route   POST /api/marcas
// @access  Private/Admin
export const createMarca = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      `INSERT INTO marca (nombre, descripcion) 
       VALUES ($1, $2) 
       RETURNING *`,
      [nombre, descripcion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en createMarca:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'La marca ya existe' });
    }
    res.status(500).json({ error: 'Error al crear marca' });
  }
};

// @desc    Actualizar marca
// @route   PUT /api/marcas/:id
// @access  Private/Admin
export const updateMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      `UPDATE marca 
       SET nombre = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [nombre, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en updateMarca:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'La marca ya existe' });
    }
    res.status(500).json({ error: 'Error al actualizar marca' });
  }
};

// @desc    Eliminar marca
// @route   DELETE /api/marcas/:id
// @access  Private/Admin
export const deleteMarca = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene artículos asociados
    const articulos = await pool.query(
      'SELECT COUNT(*) FROM articulo WHERE marca_id = $1',
      [id]
    );

    if (parseInt(articulos.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la marca porque tiene artículos asociados' 
      });
    }

    const result = await pool.query(
      'DELETE FROM marca WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }

    res.json({ message: 'Marca eliminada correctamente' });
  } catch (error) {
    console.error('Error en deleteMarca:', error);
    res.status(500).json({ error: 'Error al eliminar marca' });
  }
};
