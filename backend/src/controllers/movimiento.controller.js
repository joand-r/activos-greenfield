import { pool } from '../config/database.js';

/**
 * Genera el siguiente código disponible para un artículo en un lugar específico
 */
async function generarCodigoArticulo(lugarId, client) {
  // Obtener iniciales del lugar
  const lugarResult = await client.query(
    'SELECT iniciales FROM lugar WHERE id = $1',
    [lugarId]
  );
  
  if (lugarResult.rows.length === 0) {
    throw new Error('Lugar no encontrado');
  }
  
  const iniciales = lugarResult.rows[0].iniciales;
  
  // Buscar el último código con estas iniciales
  const codigoResult = await client.query(
    `SELECT codigo FROM articulo 
     WHERE codigo LIKE $1 
     ORDER BY codigo DESC 
     LIMIT 1`,
    [`${iniciales}-%`]
  );
  
  let numeroSiguiente = 1;
  
  if (codigoResult.rows.length > 0) {
    const ultimoCodigo = codigoResult.rows[0].codigo;
    const numero = parseInt(ultimoCodigo.split('-')[1]);
    numeroSiguiente = numero + 1;
  }
  
  // Formatear con ceros a la izquierda (ej: 001, 002, etc)
  return `${iniciales}-${numeroSiguiente.toString().padStart(3, '0')}`;
}

// @desc    Obtener todos los movimientos
// @route   GET /api/movimientos
// @access  Private
export const getMovimientos = async (req, res) => {
  try {
    const { articuloId, tipo, estado } = req.query;

    let query = `
      SELECT 
        m.*,
        a.codigo as articulo_codigo,
        a.nombre as articulo_nombre,
        lo.nombre as lugar_origen_nombre,
        ld.nombre as lugar_destino_nombre
      FROM movimiento m
      LEFT JOIN articulo a ON m.articulo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (articuloId) {
      query += ` AND m.articulo_id = $${paramCount}`;
      params.push(articuloId);
      paramCount++;
    }

    if (tipo) {
      query += ` AND m.tipo = $${paramCount}`;
      params.push(tipo);
      paramCount++;
    }

    if (estado) {
      query += ` AND m.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    query += ' ORDER BY m.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getMovimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// @desc    Obtener un movimiento por ID
// @route   GET /api/movimientos/:id
// @access  Private
export const getMovimientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        m.*,
        a.codigo as articulo_codigo,
        a.nombre as articulo_nombre,
        lo.nombre as lugar_origen_nombre,
        lo.iniciales as lugar_origen_iniciales,
        ld.nombre as lugar_destino_nombre,
        ld.iniciales as lugar_destino_iniciales,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM movimiento m
      LEFT JOIN articulo a ON m.articulo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      LEFT JOIN usuario u ON m.usuario_id = u.id
      WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en getMovimientoById:', error);
    res.status(500).json({ error: 'Error al obtener movimiento' });
  }
};

// @desc    Obtener historial de movimientos de un artículo
// @route   GET /api/movimientos/articulo/:articuloId
// @access  Private
export const getMovimientosByArticulo = async (req, res) => {
  try {
    const { articuloId } = req.params;
    const result = await pool.query(
      `SELECT 
        m.*,
        lo.nombre as lugar_origen_nombre,
        ld.nombre as lugar_destino_nombre,
        u.nombre as usuario_nombre
      FROM movimiento m
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      LEFT JOIN usuario u ON m.usuario_id = u.id
      WHERE m.articulo_id = $1
      ORDER BY m.created_at DESC`,
      [articuloId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getMovimientosByArticulo:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// @desc    Crear nueva transferencia (marca origen como transferido y crea nuevo artículo en destino)
// @route   POST /api/movimientos/transferencia
// @access  Private
export const createTransferencia = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      articuloId,
      lugarDestinoId,
      responsable,
      motivo,
      observaciones,
      fechaMovimiento
    } = req.body;

    // Validar campos requeridos
    if (!articuloId || !lugarDestinoId || !responsable || !motivo) {
      throw new Error('Faltan campos requeridos: articuloId, lugarDestinoId, responsable y motivo son obligatorios');
    }

    // 1. Obtener artículo origen completo
    const articuloOrigen = await client.query(
      `SELECT a.*, l.id as lugar_id, l.nombre as lugar_nombre, l.iniciales as lugar_iniciales
       FROM articulo a
       LEFT JOIN lugar l ON a.lugar_id = l.id
       WHERE a.id = $1 AND a.activo = true`,
      [articuloId]
    );

    if (articuloOrigen.rows.length === 0) {
      throw new Error('Artículo no encontrado o ya fue transferido');
    }

    const origen = articuloOrigen.rows[0];

    // Validar que el destino sea diferente al origen
    if (origen.lugar_id === parseInt(lugarDestinoId)) {
      throw new Error('El lugar de destino debe ser diferente al lugar actual del artículo');
    }

    // 2. Generar nuevo código para el artículo en el lugar destino
    const nuevoCodigo = await generarCodigoArticulo(lugarDestinoId, client);

    // 3. Crear nuevo artículo en el lugar destino
    const nuevoArticuloResult = await client.query(
      `INSERT INTO articulo (
        codigo, nombre, descripcion, fecha_adquisicion, serie,
        cantidad, precio_unitario, estado, constancia, numero_constancia,
        imagen, activo, articulo_origen_id,
        categoria_id, lugar_id, marca_id, proveedor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        nuevoCodigo,
        origen.nombre,
        origen.descripcion,
        origen.fecha_adquisicion,
        origen.serie,
        origen.cantidad,
        origen.precio_unitario,
        origen.estado, // Mantiene el estado físico del artículo
        origen.constancia,
        origen.numero_constancia,
        origen.imagen,
        true, // activo
        origen.id, // articulo_origen_id - referencia al artículo original
        origen.categoria_id,
        lugarDestinoId,
        origen.marca_id,
        origen.proveedor_id
      ]
    );

    const nuevoArticulo = nuevoArticuloResult.rows[0];

    // 4. Marcar artículo origen como transferido e inactivo
    await client.query(
      `UPDATE articulo 
       SET estado = 'Transferido', activo = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [articuloId]
    );

    // 5. Generar código de movimiento
    const countResult = await client.query('SELECT COUNT(*) FROM movimiento');
    const count = parseInt(countResult.rows[0].count) + 1;
    const codigoMovimiento = `MOV-${count.toString().padStart(5, '0')}`;

    // 6. Registrar el movimiento con ambos artículos
    const movimientoResult = await client.query(
      `INSERT INTO movimiento (
        codigo_movimiento, tipo, articulo_id, articulo_destino_id,
        lugar_origen_id, lugar_destino_id, fecha_movimiento,
        responsable, motivo, observaciones, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        codigoMovimiento,
        'Transferencia',
        articuloId, // Artículo origen (ahora inactivo)
        nuevoArticulo.id, // Artículo destino (nuevo)
        origen.lugar_id,
        lugarDestinoId,
        fechaMovimiento || new Date(),
        responsable,
        motivo,
        observaciones,
        'Completado' // Las transferencias se completan inmediatamente
      ]
    );

    await client.query('COMMIT');

    // 7. Obtener datos completos para la respuesta
    const lugarDestino = await pool.query(
      'SELECT nombre, iniciales FROM lugar WHERE id = $1',
      [lugarDestinoId]
    );

    res.status(201).json({
      success: true,
      message: `Transferencia completada: ${origen.codigo} → ${nuevoCodigo}`,
      data: {
        movimiento: movimientoResult.rows[0],
        articuloOriginal: {
          id: origen.id,
          codigo: origen.codigo,
          estado: 'Transferido',
          activo: false,
          lugar: origen.lugar_nombre
        },
        articuloNuevo: {
          id: nuevoArticulo.id,
          codigo: nuevoCodigo,
          nombre: nuevoArticulo.nombre,
          estado: nuevoArticulo.estado,
          activo: true,
          lugar: lugarDestino.rows[0].nombre
        }
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en createTransferencia:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al crear transferencia' 
    });
  } finally {
    client.release();
  }
};

// @desc    Crear nuevo movimiento
// @route   POST /api/movimientos
// @access  Private
export const createMovimiento = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      tipo,
      articuloId,
      lugarOrigenId,
      lugarDestinoId,
      cantidad,
      motivo,
      observaciones,
      fechaMovimiento,
      usuarioId
    } = req.body;

    // Validar campos requeridos
    if (!tipo || !articuloId || !cantidad || !fechaMovimiento || !usuarioId) {
      throw new Error('Faltan campos requeridos');
    }

    // Validar que los lugares sean diferentes
    if (tipo === 'Traslado' && lugarOrigenId === lugarDestinoId) {
      throw new Error('El lugar de origen y destino no pueden ser iguales');
    }

    // Validar cantidad del artículo
    const articulo = await client.query(
      'SELECT cantidad FROM articulo WHERE id = $1',
      [articuloId]
    );

    if (articulo.rows.length === 0) {
      throw new Error('Artículo no encontrado');
    }

    if (cantidad > articulo.rows[0].cantidad) {
      throw new Error('La cantidad a mover excede la cantidad disponible del artículo');
    }

    // Crear movimiento
    const result = await client.query(
      `INSERT INTO movimiento (
        tipo, articulo_id, lugar_origen_id, lugar_destino_id,
        cantidad, motivo, observaciones, fecha_movimiento, estado, usuario_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        tipo, articuloId, lugarOrigenId, lugarDestinoId,
        cantidad, motivo, observaciones, fechaMovimiento, 'Pendiente', usuarioId
      ]
    );

    await client.query('COMMIT');

    // Obtener movimiento con relaciones
    const movimientoCompleto = await pool.query(
      `SELECT 
        m.*,
        a.codigo as articulo_codigo,
        a.nombre as articulo_nombre,
        lo.nombre as lugar_origen_nombre,
        ld.nombre as lugar_destino_nombre,
        u.nombre as usuario_nombre
      FROM movimiento m
      LEFT JOIN articulo a ON m.articulo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      LEFT JOIN usuario u ON m.usuario_id = u.id
      WHERE m.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(movimientoCompleto.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en createMovimiento:', error);
    res.status(500).json({ error: error.message || 'Error al crear movimiento' });
  } finally {
    client.release();
  }
};

// @desc    Actualizar movimiento
// @route   PUT /api/movimientos/:id
// @access  Private
export const updateMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo,
      lugarOrigenId,
      lugarDestinoId,
      cantidad,
      motivo,
      observaciones,
      fechaMovimiento,
      estado
    } = req.body;

    const result = await pool.query(
      `UPDATE movimiento 
       SET tipo = $1, lugar_origen_id = $2, lugar_destino_id = $3,
           cantidad = $4, motivo = $5, observaciones = $6,
           fecha_movimiento = $7, estado = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [tipo, lugarOrigenId, lugarDestinoId, cantidad, motivo, observaciones, fechaMovimiento, estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    // Obtener movimiento con relaciones
    const movimientoCompleto = await pool.query(
      `SELECT 
        m.*,
        a.codigo as articulo_codigo,
        a.nombre as articulo_nombre,
        lo.nombre as lugar_origen_nombre,
        ld.nombre as lugar_destino_nombre,
        u.nombre as usuario_nombre
      FROM movimiento m
      LEFT JOIN articulo a ON m.articulo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      LEFT JOIN usuario u ON m.usuario_id = u.id
      WHERE m.id = $1`,
      [id]
    );

    res.json(movimientoCompleto.rows[0]);
  } catch (error) {
    console.error('Error en updateMovimiento:', error);
    res.status(500).json({ error: 'Error al actualizar movimiento' });
  }
};

// @desc    Completar movimiento (actualiza ubicación del artículo automáticamente via trigger)
// @route   PATCH /api/movimientos/:id/completar
// @access  Private
export const completarMovimiento = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { fechaCompletado } = req.body;

    // Actualizar estado del movimiento
    const result = await client.query(
      `UPDATE movimiento 
       SET estado = 'Completado', fecha_completado = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND estado = 'Pendiente'
       RETURNING *`,
      [fechaCompletado || new Date(), id]
    );

    if (result.rows.length === 0) {
      throw new Error('Movimiento no encontrado o ya completado');
    }

    // El trigger actualizar_lugar_articulo se encarga de actualizar el lugar_id del artículo

    await client.query('COMMIT');

    // Obtener movimiento con relaciones
    const movimientoCompleto = await pool.query(
      `SELECT 
        m.*,
        a.codigo as articulo_codigo,
        a.nombre as articulo_nombre,
        a.lugar_id as articulo_lugar_actual,
        lo.nombre as lugar_origen_nombre,
        ld.nombre as lugar_destino_nombre,
        u.nombre as usuario_nombre
      FROM movimiento m
      LEFT JOIN articulo a ON m.articulo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      LEFT JOIN usuario u ON m.usuario_id = u.id
      WHERE m.id = $1`,
      [id]
    );

    res.json({
      message: 'Movimiento completado y ubicación del artículo actualizada',
      movimiento: movimientoCompleto.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en completarMovimiento:', error);
    res.status(500).json({ error: error.message || 'Error al completar movimiento' });
  } finally {
    client.release();
  }
};

// @desc    Eliminar movimiento
// @route   DELETE /api/movimientos/:id
// @access  Private/Admin
export const deleteMovimiento = async (req, res) => {
  try {
    const { id } = req.params;

    // Solo se pueden eliminar movimientos pendientes
    const check = await pool.query(
      'SELECT estado FROM movimiento WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    if (check.rows[0].estado === 'Completado') {
      return res.status(400).json({ 
        error: 'No se puede eliminar un movimiento completado' 
      });
    }

    const result = await pool.query(
      'DELETE FROM movimiento WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteMovimiento:', error);
    res.status(500).json({ error: 'Error al eliminar movimiento' });
  }
};
