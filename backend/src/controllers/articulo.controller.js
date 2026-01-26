import { pool } from '../config/database.js';

/**
 * Obtener el siguiente código disponible para un lugar
 * @route   GET /api/articulos/next-code/:lugarId
 * @access  Public
 */
export const getNextCode = async (req, res) => {
  try {
    const { lugarId } = req.params;
    
    // Obtener las iniciales del lugar
    const lugarResult = await pool.query(
      'SELECT iniciales FROM lugar WHERE id = $1',
      [lugarId]
    );

    if (lugarResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    const iniciales = lugarResult.rows[0].iniciales;

    // Generar código usando la función SQL
    const codigoResult = await pool.query(
      'SELECT generar_codigo_articulo($1) as codigo',
      [lugarId]
    );

    const codigo = codigoResult.rows[0].codigo;

    res.json({ codigo, iniciales });
  } catch (error) {
    console.error('Error en getNextCode:', error);
    res.status(500).json({ error: 'Error al obtener siguiente código' });
  }
};

// @desc    Obtener todos los artículos con filtros opcionales
// @route   GET /api/articulos
// @access  Public
export const getArticulos = async (req, res) => {
  try {
    const { categoria, lugar, estado, search, incluirInactivos } = req.query;
    
    let query = `
      SELECT 
        a.*,
        c.nombre as categoria_nombre,
        l.nombre as lugar_nombre,
        l.iniciales as lugar_iniciales,
        m.nombre as marca_nombre,
        p.nombre as proveedor_nombre
      FROM articulo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor p ON a.proveedor_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    // Por defecto, solo mostrar artículos activos (no transferidos)
    if (incluirInactivos !== 'true') {
      query += ` AND a.activo = true`;
    }

    if (categoria) {
      query += ` AND a.categoria_id = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    if (lugar) {
      query += ` AND a.lugar_id = $${paramCount}`;
      params.push(lugar);
      paramCount++;
    }

    if (estado) {
      query += ` AND a.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (search) {
      query += ` AND (
        a.nombre ILIKE $${paramCount} OR 
        a.codigo ILIKE $${paramCount} OR 
        a.serie ILIKE $${paramCount} OR 
        a.descripcion ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getArticulos:', error);
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
};

// @desc    Obtener un artículo por ID con todas sus relaciones
// @route   GET /api/articulos/:id
// @access  Public
export const getArticuloById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        l.nombre as lugar_nombre,
        l.iniciales as lugar_iniciales,
        m.nombre as marca_nombre,
        p.nombre as proveedor_nombre,
        p.contacto as proveedor_contacto,
        p.telefono as proveedor_telefono
      FROM articulo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor p ON a.proveedor_id = p.id
      WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en getArticuloById:', error);
    res.status(500).json({ error: 'Error al obtener artículo' });
  }
};

// @desc    Obtener artículos por lugar
// @route   GET /api/articulos/lugar/:lugarId
// @access  Public
export const getArticulosByLugar = async (req, res) => {
  try {
    const { lugarId } = req.params;
    const result = await pool.query(
      `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        l.nombre as lugar_nombre,
        m.nombre as marca_nombre
      FROM articulo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      WHERE a.lugar_id = $1
      ORDER BY a.created_at DESC`,
      [lugarId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getArticulosByLugar:', error);
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
};

// @desc    Obtener artículos por categoría
// @route   GET /api/articulos/categoria/:categoriaId
// @access  Public
export const getArticulosByCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const result = await pool.query(
      `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        l.nombre as lugar_nombre,
        m.nombre as marca_nombre
      FROM articulo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      WHERE a.categoria_id = $1
      ORDER BY a.created_at DESC`,
      [categoriaId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getArticulosByCategoria:', error);
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
};

// @desc    Crear nuevo artículo (código generado automáticamente)
// @route   POST /api/articulos
// @access  Private/Admin
export const createArticulo = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      nombre,
      descripcion,
      fechaAdquisicion,
      serie,
      cantidad,
      precioUnitario,
      estado,
      constancia,
      numeroConstancia,
      categoriaId,
      lugarId,
      marcaId,
      proveedorId,
      imagen
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !fechaAdquisicion || !cantidad || !precioUnitario || !estado || !categoriaId || !lugarId) {
      throw new Error('Faltan campos requeridos');
    }

    // Generar código automáticamente usando la función SQL
    const codigoResult = await client.query(
      'SELECT generar_codigo_articulo($1) as codigo',
      [lugarId]
    );
    const codigo = codigoResult.rows[0].codigo;

    // Insertar artículo
    const result = await client.query(
      `INSERT INTO articulo (
        codigo, nombre, descripcion, fecha_adquisicion, serie,
        cantidad, precio_unitario, estado, constancia, numero_constancia,
        categoria_id, lugar_id, marca_id, proveedor_id, imagen
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        codigo, nombre, descripcion, fechaAdquisicion, serie,
        cantidad, precioUnitario, estado, constancia, numeroConstancia,
        categoriaId, lugarId, marcaId, proveedorId, imagen
      ]
    );

    await client.query('COMMIT');

    // Obtener artículo con relaciones
    const articuloCompleto = await pool.query(
      `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        l.nombre as lugar_nombre,
        l.iniciales as lugar_iniciales,
        m.nombre as marca_nombre,
        p.nombre as proveedor_nombre
      FROM articulo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor p ON a.proveedor_id = p.id
      WHERE a.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(articuloCompleto.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en createArticulo:', error);
    res.status(500).json({ error: error.message || 'Error al crear artículo' });
  } finally {
    client.release();
  }
};

// @desc    Actualizar artículo
// @route   PUT /api/articulos/:id
// @access  Private/Admin
export const updateArticulo = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const {
      nombre,
      descripcion,
      fechaAdquisicion,
      serie,
      cantidad,
      precioUnitario,
      estado,
      constancia,
      numeroConstancia,
      categoriaId,
      lugarId,
      marcaId,
      proveedorId,
      imagen
    } = req.body;

    // Obtener el artículo actual para verificar si cambió el lugar
    const articuloActual = await client.query(
      'SELECT lugar_id FROM articulo WHERE id = $1',
      [id]
    );

    if (articuloActual.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    let codigo;
    const lugarActual = articuloActual.rows[0].lugar_id;

    // Si cambió el lugar, generar nuevo código
    if (lugarId && lugarId !== lugarActual) {
      const codigoResult = await client.query(
        'SELECT generar_codigo_articulo($1) as codigo',
        [lugarId]
      );
      codigo = codigoResult.rows[0].codigo;

      // Actualizar con nuevo código
      await client.query(
        `UPDATE articulo 
         SET codigo = $1, nombre = $2, descripcion = $3, fecha_adquisicion = $4, serie = $5, 
             cantidad = $6, precio_unitario = $7, estado = $8,
             constancia = $9, numero_constancia = $10, categoria_id = $11, 
             lugar_id = $12, marca_id = $13, proveedor_id = $14, imagen = $15,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $16`,
        [
          codigo, nombre, descripcion, fechaAdquisicion, serie,
          cantidad, precioUnitario, estado, constancia, numeroConstancia,
          categoriaId, lugarId, marcaId, proveedorId, imagen, id
        ]
      );
    } else {
      // Actualizar sin cambiar el código
      await client.query(
        `UPDATE articulo 
         SET nombre = $1, descripcion = $2, fecha_adquisicion = $3, serie = $4, 
             cantidad = $5, precio_unitario = $6, estado = $7,
             constancia = $8, numero_constancia = $9, categoria_id = $10, 
             lugar_id = $11, marca_id = $12, proveedor_id = $13, imagen = $14,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $15`,
        [
          nombre, descripcion, fechaAdquisicion, serie,
          cantidad, precioUnitario, estado, constancia, numeroConstancia,
          categoriaId, lugarId, marcaId, proveedorId, imagen, id
        ]
      );
    }

    await client.query('COMMIT');

    // Obtener artículo actualizado con relaciones
    const articuloCompleto = await pool.query(
      `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        l.nombre as lugar_nombre,
        l.iniciales as lugar_iniciales,
        m.nombre as marca_nombre,
        p.nombre as proveedor_nombre
      FROM articulo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor p ON a.proveedor_id = p.id
      WHERE a.id = $1`,
      [id]
    );

    res.json(articuloCompleto.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en updateArticulo:', error);
    res.status(500).json({ error: 'Error al actualizar artículo' });
  } finally {
    client.release();
  }
};

// @desc    Eliminar artículo
// @route   DELETE /api/articulos/:id
// @access  Private/Admin
export const deleteArticulo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene movimientos asociados
    const movimientos = await pool.query(
      'SELECT COUNT(*) FROM movimiento WHERE articulo_id = $1',
      [id]
    );

    if (parseInt(movimientos.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el artículo porque tiene movimientos asociados' 
      });
    }

    const result = await pool.query(
      'DELETE FROM articulo WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    res.json({ message: 'Artículo eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteArticulo:', error);
    res.status(500).json({ error: 'Error al eliminar artículo' });
  }
};

// @desc    Buscar artículos
// @route   GET /api/articulos/buscar
// @access  Public
export const buscarArticulos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }

    const result = await pool.query(
      `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        l.nombre as lugar_nombre,
        l.iniciales as lugar_iniciales,
        m.nombre as marca_nombre,
        p.nombre as proveedor_nombre
      FROM articulo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor p ON a.proveedor_id = p.id
      WHERE 
        a.nombre ILIKE $1 OR 
        a.codigo ILIKE $1 OR 
        a.serie ILIKE $1 OR 
        a.descripcion ILIKE $1 OR
        c.nombre ILIKE $1 OR
        l.nombre ILIKE $1 OR
        m.nombre ILIKE $1
      ORDER BY a.created_at DESC
      LIMIT 50`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en buscarArticulos:', error);
    res.status(500).json({ error: 'Error al buscar artículos' });
  }
};
