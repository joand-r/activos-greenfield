import { pool } from '../config/database.js';

// @desc    Obtener todos los lugares
// @route   GET /api/lugares
// @access  Public
export const getLugares = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM lugar ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getLugares:', error);
    res.status(500).json({ error: 'Error al obtener lugares' });
  }
};

// @desc    Obtener un lugar por ID
// @route   GET /api/lugares/:id
// @access  Public
export const getLugarById = async (req, res) => {
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
    console.error('Error en getLugarById:', error);
    res.status(500).json({ error: 'Error al obtener lugar' });
  }
};

// @desc    Obtener iniciales de un lugar
// @route   GET /api/lugares/:id/iniciales
// @access  Public
export const getInicialesLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT iniciales FROM lugar WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    res.json({ iniciales: result.rows[0].iniciales });
  } catch (error) {
    console.error('Error en getInicialesLugar:', error);
    res.status(500).json({ error: 'Error al obtener iniciales' });
  }
};

// @desc    Crear nuevo lugar
// @route   POST /api/lugares
// @access  Private/Admin
export const createLugar = async (req, res) => {
  try {
    const { nombre, iniciales, tipo } = req.body;

    if (!nombre || !iniciales || !tipo) {
      return res.status(400).json({ error: 'El nombre, iniciales y tipo son requeridos' });
    }

    // Validar que iniciales tenga exactamente 3 caracteres
    if (iniciales.length !== 3) {
      return res.status(400).json({ error: 'Las iniciales deben tener exactamente 3 caracteres' });
    }

    // Convertir iniciales a mayúsculas
    const inicialesMayusculas = iniciales.toUpperCase();

    const result = await pool.query(
      `INSERT INTO lugar (nombre, iniciales, tipo) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [nombre, inicialesMayusculas, tipo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en createLugar:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'El lugar o las iniciales ya existen' });
    }
    res.status(500).json({ error: 'Error al crear lugar' });
  }
};

// @desc    Actualizar lugar
// @route   PUT /api/lugares/:id
// @access  Private/Admin
export const updateLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, iniciales, tipo } = req.body;

    if (!nombre || !iniciales || !tipo) {
      return res.status(400).json({ error: 'El nombre, iniciales y tipo son requeridos' });
    }

    // Validar que iniciales tenga exactamente 3 caracteres
    if (iniciales.length !== 3) {
      return res.status(400).json({ error: 'Las iniciales deben tener exactamente 3 caracteres' });
    }

    // Convertir iniciales a mayúsculas
    const inicialesMayusculas = iniciales.toUpperCase();

    const result = await pool.query(
      `UPDATE lugar 
       SET nombre = $1, iniciales = $2, tipo = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [nombre, inicialesMayusculas, tipo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en updateLugar:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El lugar o las iniciales ya existen' });
    }
    res.status(500).json({ error: 'Error al actualizar lugar' });
  }
};

// @desc    Eliminar lugar
// @route   DELETE /api/lugares/:id
// @access  Private/Admin
export const deleteLugar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene artículos asociados
    const articulos = await pool.query(
      'SELECT COUNT(*) FROM articulo WHERE lugar_id = $1',
      [id]
    );

    if (parseInt(articulos.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el lugar porque tiene artículos asociados' 
      });
    }

    const result = await pool.query(
      'DELETE FROM lugar WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    res.json({ message: 'Lugar eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteLugar:', error);
    res.status(500).json({ error: 'Error al eliminar lugar' });
  }
};
