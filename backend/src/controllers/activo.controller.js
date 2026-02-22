import { pool } from '../config/database.js';
import { registrarAuditoria } from '../utils/auditoria.js';

/**
 * 🏢 CONTROLADOR DE ACTIVOS (Con herencia de tablas 1-1)
 * Patrón: Delegation/Inheritance
 * Activo (padre) -> Equipos_Tecnologicos, Motorizados, Terreno (hijos)
 */

// Obtener todos los activos con sus datos específicos
export const obtenerActivos = async (req, res) => {
  try {
    const { tipo_activo, lugar_id } = req.query;
    
    let query = `
      SELECT 
        a.*,
        l.nombre as lugar_nombre,
        l.inicial as lugar_inicial,
        m.nombre as marca_nombre,
        p.nombre as proveedor_nombre
      FROM activo a
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor p ON a.proveedor_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (tipo_activo) {
      query += ` AND a.tipo_activo = $${paramCount}`;
      params.push(tipo_activo);
      paramCount++;
    }
    
    if (lugar_id) {
      query += ` AND a.lugar_id = $${paramCount}`;
      params.push(lugar_id);
      paramCount++;
    }
    
    query += ' ORDER BY a.codigo ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener activos:', error);
    res.status(500).json({ error: 'Error al obtener activos' });
  }
};

// Obtener activo por ID con todos sus datos (padre + hijo)
export const obtenerActivoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener datos del padre
    const activoResult = await pool.query(
      `SELECT 
        a.*,
        l.nombre as lugar_nombre,
        l.inicial as lugar_inicial,
        m.nombre as marca_nombre,
        p.nombre as proveedor_nombre
      FROM activo a
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor p ON a.proveedor_id = p.id
      WHERE a.id = $1`,
      [id]
    );
    
    if (activoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }
    
    const activo = activoResult.rows[0];
    
    // Obtener datos específicos según el tipo
    let datosEspecificos = null;
    
    switch (activo.tipo_activo) {
      case 'TECNOLOGICO':
        const tecResult = await pool.query(
          'SELECT * FROM equipos_tecnologicos WHERE activo_id = $1',
          [id]
        );
        datosEspecificos = tecResult.rows[0] || null;
        break;
        
      case 'MOTORIZADO':
        const motResult = await pool.query(
          'SELECT * FROM motorizados WHERE activo_id = $1',
          [id]
        );
        datosEspecificos = motResult.rows[0] || null;
        break;
        
      case 'TERRENO':
        const terrResult = await pool.query(
          'SELECT * FROM terreno WHERE activo_id = $1',
          [id]
        );
        datosEspecificos = terrResult.rows[0] || null;
        break;
    }
    
    res.json({
      ...activo,
      datos_especificos: datosEspecificos
    });
  } catch (error) {
    console.error('Error al obtener activo:', error);
    res.status(500).json({ error: 'Error al obtener activo' });
  }
};

// Crear activo (transacción con tabla hija según tipo)
export const crearActivo = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      nombre,
      tipo_activo,
      serie,
      imagen,
      estado,
      descripcion,
      fecha_adquision,
      costo_adquision,
      tipo_constancia,
      nro_constancia,
      lugar_id,
      marca_id,
      proveedor_id,
      // Datos específicos por tipo
      datos_especificos
    } = req.body;
    
    // Validaciones
    if (!nombre || !tipo_activo || !lugar_id) {
      return res.status(400).json({ 
        error: 'Nombre, tipo de activo y lugar son requeridos' 
      });
    }

    await client.query('BEGIN');

    // Generar código automático
    const codigoResult = await client.query(
      'SELECT generar_codigo_activo($1) as codigo',
      [lugar_id]
    );
    const codigo = codigoResult.rows[0].codigo;

    // Crear activo padre
    const activoResult = await client.query(
      `INSERT INTO activo (
        nombre, tipo_activo, codigo, serie, imagen, estado, descripcion,
        fecha_adquision, costo_adquision, tipo_constancia, nro_constancia,
        lugar_id, marca_id, proveedor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        nombre, tipo_activo, codigo, serie || null, imagen || null,
        estado || null, descripcion || null, fecha_adquision || null,
        costo_adquision || null, tipo_constancia || null, nro_constancia || null,
        lugar_id, marca_id || null, proveedor_id || null
      ]
    );

    const nuevoActivo = activoResult.rows[0];
    const activoId = nuevoActivo.id;

 // Crear registro en tabla hija según tipo
    if (datos_especificos) {
      switch (tipo_activo) {
        case 'TECNOLOGICO':
          await client.query(
            `INSERT INTO equipos_tecnologicos 
             (activo_id, modelo, procesador, memoria, capacidad_disco)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              activoId,
              datos_especificos.modelo || null,
              datos_especificos.procesador || null,
              datos_especificos.memoria || null,
              datos_especificos.capacidad_disco || null
            ]
          );
          break;
          
        case 'MOTORIZADO':
          await client.query(
            `INSERT INTO motorizados 
             (activo_id, tipo_vehiculo, motor, chasis, color, anho_modelo)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              activoId,
              datos_especificos.tipo_vehiculo || null,
              datos_especificos.motor || null,
              datos_especificos.chasis || null,
              datos_especificos.color || null,
              datos_especificos.anho_modelo || null
            ]
          );
          break;
          
        case 'TERRENO':
          await client.query(
            `INSERT INTO terreno 
             (activo_id, folio, nro_registro, area, ubicacion)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              activoId,
              datos_especificos.folio || null,
              datos_especificos.nro_registro || null,
              datos_especificos.area || null,
              datos_especificos.ubicacion || null
            ]
          );
          break;
      }
    }

    // Registrar en auditoría
    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'CREAR',
      tabla_afectada: 'activo',
      registro_id: activoId,
      datos_nuevos: { ...nuevoActivo, datos_especificos },
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.status(201).json({ ...nuevoActivo, datos_especificos });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear activo:', error);
    res.status(500).json({ error: 'Error al crear activo' });
  } finally {
    client.release();
  }
};

// Actualizar activo
export const actualizarActivo = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      nombre,
      serie,
      imagen,
      estado,
      descripcion,
      fecha_adquision,
      costo_adquision,
      tipo_constancia,
      nro_constancia,
      lugar_id,
      marca_id,
      proveedor_id,
      datos_especificos
    } = req.body;

    await client.query('BEGIN');

    // Obtener datos anteriores
    const anteriorResult = await client.query(
      'SELECT * FROM activo WHERE id = $1',
      [id]
    );

    if (anteriorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Activo no encontrado' });
    }

    const datosAnteriores = anteriorResult.rows[0];
    const tipo_activo = datosAnteriores.tipo_activo;

    // Actualizar activo padre
    const activoResult = await client.query(
      `UPDATE activo SET
        nombre = $1, serie = $2, imagen = $3, estado = $4, descripcion = $5,
        fecha_adquision = $6, costo_adquision = $7, tipo_constancia = $8,
        nro_constancia = $9, lugar_id = $10, marca_id = $11, proveedor_id = $12
      WHERE id = $13 RETURNING *`,
      [
        nombre, serie, imagen, estado, descripcion,
        fecha_adquision, costo_adquision, tipo_constancia, nro_constancia,
        lugar_id, marca_id, proveedor_id, id
      ]
    );

    const activoActualizado = activoResult.rows[0];

    // Actualizar tabla hija si hay datos específicos
    if (datos_especificos) {
      switch (tipo_activo) {
        case 'TECNOLOGICO':
          await client.query(
            `UPDATE equipos_tecnologicos 
             SET modelo = $1, procesador = $2, memoria = $3, capacidad_disco = $4
             WHERE activo_id = $5`,
            [
              datos_especificos.modelo,
              datos_especificos.procesador,
              datos_especificos.memoria,
              datos_especificos.capacidad_disco,
              id
            ]
          );
          break;
          
        case 'MOTORIZADO':
          await client.query(
            `UPDATE motorizados 
             SET tipo_vehiculo = $1, motor = $2, chasis = $3, color = $4, anho_modelo = $5
             WHERE activo_id = $6`,
            [
              datos_especificos.tipo_vehiculo,
              datos_especificos.motor,
              datos_especificos.chasis,
              datos_especificos.color,
              datos_especificos.anho_modelo,
              id
            ]
          );
          break;
          
        case 'TERRENO':
          await client.query(
            `UPDATE terreno 
             SET folio = $1, nro_registro = $2, area = $3, ubicacion = $4
             WHERE activo_id = $5`,
            [
              datos_especificos.folio,
              datos_especificos.nro_registro,
              datos_especificos.area,
              datos_especificos.ubicacion,
              id
            ]
          );
          break;
      }
    }

    // Registrar en auditoría
    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'EDITAR',
      tabla_afectada: 'activo',
      registro_id: parseInt(id),
      datos_anteriores: datosAnteriores,
      datos_nuevos: { ...activoActualizado, datos_especificos },
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json({ ...activoActualizado, datos_especificos });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar activo:', error);
    res.status(500).json({ error: 'Error al actualizar activo' });
  } finally {
    client.release();
  }
};

// Eliminar activo
export const eliminarActivo = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM activo WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Activo no encontrado' });
    }

    const activoEliminado = result.rows[0];

    // Las tablas hijas se eliminan automáticamente por ON DELETE CASCADE
    await client.query('DELETE FROM activo WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      usuario_id: req.user.id,
      accion: 'ELIMINAR',
      tabla_afectada: 'activo',
      registro_id: parseInt(id),
      datos_anteriores: activoEliminado,
      ip_usuario: req.ip
    });

    await client.query('COMMIT');
    res.json({ message: 'Activo eliminado exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar activo:', error);
    res.status(500).json({ error: 'Error al eliminar activo' });
  } finally {
    client.release();
  }
};
