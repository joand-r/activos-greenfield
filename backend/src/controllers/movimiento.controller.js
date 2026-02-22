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
        ld.nombre as lugar_destino_nombre,
        na.codigo as nuevo_activo_codigo,
        na.nombre as nuevo_activo_nombre
      FROM movimiento m
      LEFT JOIN activo a ON m.activo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      LEFT JOIN activo na ON m.nuevo_activo_id = na.id
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
        ld.nombre as lugar_destino_nombre,
        na.codigo as nuevo_activo_codigo,
        na.nombre as nuevo_activo_nombre
      FROM movimiento m
      LEFT JOIN activo a ON m.activo_id = a.id
      LEFT JOIN lugar lo ON m.lugar_origen_id = lo.id
      LEFT JOIN lugar ld ON m.lugar_destino_id = ld.id
      LEFT JOIN activo na ON m.nuevo_activo_id = na.id
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
    
    const estadosValidos = ['NUEVO', 'USADO', 'DISPONIBLE', 'DANADO', 'DONADO', 'VENDIDO', 'TRANSFERIR'];
    const estadoFinal = estado ? estado.toUpperCase() : 'DISPONIBLE';
    if (!estadosValidos.includes(estadoFinal)) {
      return res.status(400).json({ error: 'Estado inválido. Use: NUEVO, USADO, DISPONIBLE, DANADO, DONADO, VENDIDO o TRANSFERIR' });
    }

    // Los estados "baja sin destino" no requieren lugar_destino_id
    // (el activo sale del sistema: vendido, donado, dañado)
    const estadosBajaSinDestino = ['VENDIDO', 'DONADO', 'DANADO'];
    const requiereDestino = !estadosBajaSinDestino.includes(estadoFinal);

    if (!activo_id || !lugar_origen_id || !responsable) {
      return res.status(400).json({ 
        error: 'Activo, lugar de origen y responsable son requeridos' 
      });
    }

    if (requiereDestino && !lugar_destino_id) {
      return res.status(400).json({ 
        error: 'El lugar de destino es requerido para este tipo de movimiento' 
      });
    }

    if (requiereDestino && lugar_origen_id === lugar_destino_id) {
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

    let nuevoActivoId = null;

    // ── LÓGICA DE TRANSFERENCIA ──────────────────────────────────────────────
    // Cuando el estado es TRANSFERIR se clona el activo al lugar destino:
    //   1. Se crea un nuevo activo con nuevo código (según lugar destino)
    //   2. El nuevo activo hereda el estado original del activo (ej: NUEVO → NUEVO)
    //   3. Se copian los datos de tabla hija (equipos, motorizados, terreno)
    //   4. El activo original queda con estado TRANSFERIR
    if (estadoFinal === 'TRANSFERIR') {
      // 1. Obtener datos del activo original
      const activoOriginalRes = await client.query(
        `SELECT a.*, 
          et.modelo, et.procesador, et.memoria, et.capacidad_disco,
          mo.tipo_vehiculo, mo.motor, mo.chasis, mo.color, mo.anho_modelo,
          te.folio, te.nro_registro, te.area, te.ubicacion
         FROM activo a
         LEFT JOIN equipos_tecnologicos et ON a.id = et.activo_id
         LEFT JOIN motorizados mo ON a.id = mo.activo_id
         LEFT JOIN terreno te ON a.id = te.activo_id
         WHERE a.id = $1`,
        [activo_id]
      );

      if (activoOriginalRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Activo no encontrado' });
      }
      const orig = activoOriginalRes.rows[0];

      // 2. Generar nuevo código para el lugar destino
      const nuevoCodigoRes = await client.query(
        'SELECT generar_codigo_activo($1) as codigo',
        [lugar_destino_id]
      );
      const nuevoCodigo = nuevoCodigoRes.rows[0].codigo;

      // 3. Crear nuevo activo en el lugar destino con el estado original heredado
      const nuevoActivoRes = await client.query(
        `INSERT INTO activo (
          nombre, tipo_activo, codigo, serie, imagen, estado, descripcion,
          fecha_adquision, costo_adquision, tipo_constancia, nro_constancia,
          lugar_id, marca_id, proveedor_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *`,
        [
          orig.nombre, orig.tipo_activo, nuevoCodigo, orig.serie, orig.imagen,
          orig.estado, // hereda el estado original (ej: NUEVO → NUEVO)
          orig.descripcion, orig.fecha_adquision, orig.costo_adquision,
          orig.tipo_constancia, orig.nro_constancia,
          lugar_destino_id, orig.marca_id, orig.proveedor_id
        ]
      );
      nuevoActivoId = nuevoActivoRes.rows[0].id;

      // 4. Copiar datos de tabla hija según tipo
      if (orig.tipo_activo === 'EQUIPO_TECNOLOGICO' && orig.modelo) {
        await client.query(
          `INSERT INTO equipos_tecnologicos (activo_id, modelo, procesador, memoria, capacidad_disco)
           VALUES ($1,$2,$3,$4,$5)`,
          [nuevoActivoId, orig.modelo, orig.procesador, orig.memoria, orig.capacidad_disco]
        );
      } else if (orig.tipo_activo === 'VEHICULO' && orig.tipo_vehiculo) {
        await client.query(
          `INSERT INTO motorizados (activo_id, tipo_vehiculo, motor, chasis, color, anho_modelo)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [nuevoActivoId, orig.tipo_vehiculo, orig.motor, orig.chasis, orig.color, orig.anho_modelo]
        );
      } else if (orig.tipo_activo === 'TERRENO' && orig.folio) {
        await client.query(
          `INSERT INTO terreno (activo_id, folio, nro_registro, area, ubicacion)
           VALUES ($1,$2,$3,$4,$5)`,
          [nuevoActivoId, orig.folio, orig.nro_registro, orig.area, orig.ubicacion]
        );
      }

      // 5. Marcar activo original como TRANSFERIR
      await client.query(
        'UPDATE activo SET estado = $1 WHERE id = $2',
        ['TRANSFERIR', activo_id]
      );

      await registrarAuditoria(client, {
        usuario_id: req.user.id,
        accion: 'CREAR',
        tabla_afectada: 'activo',
        registro_id: nuevoActivoId,
        datos_nuevos: { ...nuevoActivoRes.rows[0], origen_transferencia: activo_id },
        ip_usuario: req.ip
      });
    }
    // ── FIN LÓGICA DE TRANSFERENCIA ──────────────────────────────────────────

    // ── ACTUALIZAR ACTIVO SEGÚN EL ESTADO DEL MOVIMIENTO ────────────────────
    if (estadoFinal !== 'TRANSFERIR') {
      if (estadosBajaSinDestino.includes(estadoFinal)) {
        // VENDIDO / DONADO / DAÑADO: el activo sale del sistema, solo se actualiza el estado
        await client.query(
          'UPDATE activo SET estado = $1 WHERE id = $2',
          [estadoFinal, activo_id]
        );
      } else {
        // NUEVO / USADO / DISPONIBLE: movimiento normal → actualizar lugar y estado
        await client.query(
          'UPDATE activo SET estado = $1, lugar_id = $2 WHERE id = $3',
          [estadoFinal, lugar_destino_id, activo_id]
        );
      }

      await registrarAuditoria(client, {
        usuario_id: req.user.id,
        accion: 'EDITAR',
        tabla_afectada: 'activo',
        registro_id: parseInt(activo_id),
        datos_nuevos: { estado: estadoFinal, lugar_id: lugar_destino_id || null },
        ip_usuario: req.ip
      });
    }
    // ── FIN ACTUALIZACIÓN ACTIVO ─────────────────────────────────────────────

    const result = await client.query(
      `INSERT INTO movimiento 
       (codigo_movimiento, activo_id, lugar_origen_id, lugar_destino_id, 
        fecha_movimiento, responsable, observaciones, estado, nuevo_activo_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        codigo_movimiento,
        activo_id,
        lugar_origen_id,
        lugar_destino_id || null,
        fecha_movimiento || new Date(),
        responsable,
        observaciones || null,
        estadoFinal,
        nuevoActivoId
      ]
    );

    const nuevoMovimiento = result.rows[0];

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

    let estadoFinal = datosAnteriores.estado;
    if (estado) {
      const estadosValidos = ['NUEVO', 'USADO', 'DISPONIBLE', 'DANADO', 'DONADO', 'VENDIDO', 'TRANSFERIR'];
      estadoFinal = estado.toUpperCase();
      if (!estadosValidos.includes(estadoFinal)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Estado inválido. Use: NUEVO, USADO, DISPONIBLE, DANADO, DONADO, VENDIDO o TRANSFERIR' });
      }
    }

    const result = await client.query(
      `UPDATE movimiento 
       SET fecha_movimiento = $1, responsable = $2, observaciones = $3, estado = $4
       WHERE id = $5 RETURNING *`,
      [fecha_movimiento, responsable, observaciones, estadoFinal, id]
    );

    const movimientoActualizado = result.rows[0];

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
