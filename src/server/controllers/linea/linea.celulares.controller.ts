import { pool } from "@/lib/db/database";
import { registrarAuditoria } from "@/server/utils/auditoria";

export const obtenerCelularesLineas = async (req: any, res: any) => {
  try {
    const { search, estado_operativo, marca_id, lugar_id, telefonia_id, disponibles_para_linea } = req.query;

    let query = `
      SELECT 
        a.id,
        a.codigo,
        a.nombre,
        a.serie,
        a.estado as activo_estado,
        a.clasificacion,
        a.imagen,
        a.descripcion,
        a.fecha_adquision,
        a.costo_adquision,
        a.lugar_id,
        l.nombre as lugar_nombre,
        a.marca_id,
        m.nombre as marca_nombre,
        prov.id as proveedor_id,
        prov.nombre as proveedor_nombre,
        cel.modelo,
        cel.procesador,
        cel.memoria,
        cel.capacidad_disco,
        cel.imei_1,
        cel.imei_2,
        COALESCE(cel.estado_operativo, 'DISPONIBLE') as estado_operativo,
        cel.fecha_baja,
        cel.motivo_baja,
        cel.accesorios,
        (CASE WHEN cel.imei_2 IS NOT NULL AND TRIM(cel.imei_2) != '' THEN 2 ELSE 1 END)::int as max_lineas,
        COUNT(lin.id)::int as total_lineas_asignadas,
        (
          COUNT(lin.id) < (CASE WHEN cel.imei_2 IS NOT NULL AND TRIM(cel.imei_2) != '' THEN 2 ELSE 1 END)
          AND COALESCE(cel.estado_operativo, 'DISPONIBLE') NOT IN ('BAJA', 'DESHABILITADO')
        ) as disponible_para_linea,
        COALESCE(
          json_agg(
            json_build_object(
              'id', lin.id,
              'numero', lin.numero,
              'estado', lin.estado,
              'plan_nombre', pt.nombre,
              'telefonia_nombre', t.nombre,
              'personal_id', p.id,
              'personal_nombre', p.nombre,
              'personal_cargo', p.cargo,
              'personal_departamento', p.departamento
            )
          ) FILTER (WHERE lin.id IS NOT NULL),
          '[]'::json
        ) as lineas_asignadas,
        (ARRAY_AGG(lin.id) FILTER (WHERE lin.id IS NOT NULL))[1] as linea_id,
        (ARRAY_AGG(lin.numero) FILTER (WHERE lin.id IS NOT NULL))[1] as linea_numero,
        (ARRAY_AGG(lin.estado) FILTER (WHERE lin.id IS NOT NULL))[1] as linea_estado,
        (ARRAY_AGG(pt.nombre) FILTER (WHERE lin.id IS NOT NULL))[1] as plan_nombre,
        (ARRAY_AGG(pt.costo) FILTER (WHERE lin.id IS NOT NULL))[1] as plan_costo,
        (ARRAY_AGG(t.nombre) FILTER (WHERE lin.id IS NOT NULL))[1] as telefonia_nombre,
        (ARRAY_AGG(p.id) FILTER (WHERE lin.id IS NOT NULL))[1] as personal_id,
        (ARRAY_AGG(p.nombre) FILTER (WHERE lin.id IS NOT NULL))[1] as personal_nombre,
        (ARRAY_AGG(p.cargo) FILTER (WHERE lin.id IS NOT NULL))[1] as personal_cargo,
        (ARRAY_AGG(p.departamento) FILTER (WHERE lin.id IS NOT NULL))[1] as personal_departamento
      FROM activo a
      JOIN celulares cel ON a.id = cel.activo_id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor prov ON a.proveedor_id = prov.id
      LEFT JOIN linea lin ON a.id = lin.activo_id AND lin.estado != 'BAJA'
      LEFT JOIN plan_telefonia pt ON lin.plan_id = pt.id
      LEFT JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN personal p ON lin.personal_id = p.id
      WHERE a.tipo_activo = 'CELULAR'
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (search && search.trim() !== '') {
      query += ` AND (
        a.codigo ILIKE $${paramCount} OR 
        a.nombre ILIKE $${paramCount} OR 
        cel.modelo ILIKE $${paramCount} OR 
        a.serie ILIKE $${paramCount} OR 
        cel.imei_1 ILIKE $${paramCount} OR 
        cel.imei_2 ILIKE $${paramCount} OR 
        l.nombre ILIKE $${paramCount} OR 
        m.nombre ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
      paramCount++;
    }

    if (estado_operativo && estado_operativo !== 'TODOS') {
      query += ` AND cel.estado_operativo = $${paramCount}`;
      params.push(estado_operativo);
      paramCount++;
    }

    if (marca_id) {
      query += ` AND a.marca_id = $${paramCount}`;
      params.push(marca_id);
      paramCount++;
    }

    if (lugar_id) {
      query += ` AND a.lugar_id = $${paramCount}`;
      params.push(lugar_id);
      paramCount++;
    }

    if (telefonia_id) {
      query += ` AND t.id = $${paramCount}`;
      params.push(telefonia_id);
      paramCount++;
    }

    query += ` GROUP BY a.id, cel.activo_id, l.id, m.id, prov.id`;

    if (disponibles_para_linea === 'true') {
      query += ` HAVING COUNT(lin.id) < (CASE WHEN cel.imei_2 IS NOT NULL AND TRIM(cel.imei_2) != '' THEN 2 ELSE 1 END) AND COALESCE(cel.estado_operativo, 'DISPONIBLE') NOT IN ('BAJA', 'DESHABILITADO')`;
    }

    query += ` ORDER BY a.codigo ASC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener celulares:', error);
    res.status(500).json({ success: false, error: 'Error al obtener celulares' });
  }
};

export const obtenerCelularPorId = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        a.id,
        a.codigo,
        a.nombre,
        a.serie,
        a.estado as activo_estado,
        a.clasificacion,
        a.imagen,
        a.descripcion,
        a.fecha_adquision,
        a.costo_adquision,
        a.lugar_id,
        l.nombre as lugar_nombre,
        a.marca_id,
        m.nombre as marca_nombre,
        prov.id as proveedor_id,
        prov.nombre as proveedor_nombre,
        cel.modelo,
        cel.procesador,
        cel.memoria,
        cel.capacidad_disco,
        cel.imei_1,
        cel.imei_2,
        COALESCE(cel.estado_operativo, 'DISPONIBLE') as estado_operativo,
        cel.fecha_baja,
        cel.motivo_baja,
        cel.accesorios,
        (CASE WHEN cel.imei_2 IS NOT NULL AND TRIM(cel.imei_2) != '' THEN 2 ELSE 1 END)::int as max_lineas,
        COUNT(lin.id)::int as total_lineas_asignadas,
        (
          COUNT(lin.id) < (CASE WHEN cel.imei_2 IS NOT NULL AND TRIM(cel.imei_2) != '' THEN 2 ELSE 1 END)
          AND COALESCE(cel.estado_operativo, 'DISPONIBLE') NOT IN ('BAJA', 'DESHABILITADO')
        ) as disponible_para_linea,
        COALESCE(
          json_agg(
            json_build_object(
              'id', lin.id,
              'numero', lin.numero,
              'estado', lin.estado,
              'plan_nombre', pt.nombre,
              'telefonia_nombre', t.nombre,
              'personal_id', p.id,
              'personal_nombre', p.nombre,
              'personal_cargo', p.cargo,
              'personal_departamento', p.departamento
            )
          ) FILTER (WHERE lin.id IS NOT NULL),
          '[]'::json
        ) as lineas_asignadas,
        (ARRAY_AGG(lin.id) FILTER (WHERE lin.id IS NOT NULL))[1] as linea_id,
        (ARRAY_AGG(lin.numero) FILTER (WHERE lin.id IS NOT NULL))[1] as linea_numero,
        (ARRAY_AGG(lin.estado) FILTER (WHERE lin.id IS NOT NULL))[1] as linea_estado,
        (ARRAY_AGG(pt.nombre) FILTER (WHERE lin.id IS NOT NULL))[1] as plan_nombre,
        (ARRAY_AGG(pt.costo) FILTER (WHERE lin.id IS NOT NULL))[1] as plan_costo,
        (ARRAY_AGG(t.nombre) FILTER (WHERE lin.id IS NOT NULL))[1] as telefonia_nombre,
        (ARRAY_AGG(p.id) FILTER (WHERE lin.id IS NOT NULL))[1] as personal_id,
        (ARRAY_AGG(p.nombre) FILTER (WHERE lin.id IS NOT NULL))[1] as personal_nombre,
        (ARRAY_AGG(p.cargo) FILTER (WHERE lin.id IS NOT NULL))[1] as personal_cargo,
        (ARRAY_AGG(p.departamento) FILTER (WHERE lin.id IS NOT NULL))[1] as personal_departamento
      FROM activo a
      JOIN celulares cel ON a.id = cel.activo_id
      LEFT JOIN lugar l ON a.lugar_id = l.id
      LEFT JOIN marca m ON a.marca_id = m.id
      LEFT JOIN proveedor prov ON a.proveedor_id = prov.id
      LEFT JOIN linea lin ON a.id = lin.activo_id AND lin.estado != 'BAJA'
      LEFT JOIN plan_telefonia pt ON lin.plan_id = pt.id
      LEFT JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN personal p ON lin.personal_id = p.id
      WHERE a.tipo_activo = 'CELULAR' AND a.id = $1
      GROUP BY a.id, cel.activo_id, l.id, m.id, prov.id
    `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Celular no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener celular:', error);
    res.status(500).json({ success: false, error: 'Error al obtener celular' });
  }
};

export const actualizarEstadoCelular = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { estado_operativo, accesorios, motivo } = req.body;

    const estadosValidos = ['DISPONIBLE', 'ACTIVO', 'BAJA', 'DESHABILITADO'];
    if (!estadosValidos.includes(estado_operativo)) {
      return res.status(400).json({ success: false, error: 'Estado operativo inválido' });
    }

    await client.query('BEGIN');

    const prevResult = await client.query('SELECT * FROM celulares WHERE activo_id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Celular no encontrado' });
    }

    const anterior = prevResult.rows[0];

    const result = await client.query(
      `UPDATE celulares 
       SET estado_operativo = $1,
           accesorios = COALESCE($2, accesorios),
           fecha_baja = CASE WHEN $1 = 'BAJA' THEN COALESCE(fecha_baja, CURRENT_DATE) ELSE NULL END,
           motivo_baja = CASE WHEN $1 = 'BAJA' THEN COALESCE($3, motivo_baja) ELSE NULL END
       WHERE activo_id = $4 
       RETURNING *`,
      [estado_operativo, accesorios !== undefined ? accesorios : null, motivo || null, id]
    );

    let nuevoActivoEstado = 'DISPONIBLE';
    if (estado_operativo === 'ACTIVO') nuevoActivoEstado = 'ASIGNADO';
    else if (estado_operativo === 'BAJA' || estado_operativo === 'DESHABILITADO') nuevoActivoEstado = 'DESUSO';

    await client.query('UPDATE activo SET estado = $1 WHERE id = $2', [nuevoActivoEstado, id]);

    await registrarAuditoria(client, {
      tabla_afectada: 'celulares',
      registro_id: parseInt(id),
      accion: 'ACTUALIZAR_ESTADO',
      datos_anteriores: anterior,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Estado del celular actualizado exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar estado del celular:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar estado del celular' });
  } finally {
    client.release();
  }
};

export const darDeBajaCelular = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { motivo_baja, fecha_baja } = req.body;

    if (!motivo_baja || motivo_baja.trim() === '') {
      return res.status(400).json({ success: false, error: 'El motivo de la baja es requerido' });
    }

    await client.query('BEGIN');

    const prevResult = await client.query('SELECT * FROM celulares WHERE activo_id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Celular no encontrado' });
    }

    const anterior = prevResult.rows[0];
    const fechaBajaFinal = fecha_baja || new Date().toISOString().split('T')[0];

    const result = await client.query(
      `UPDATE celulares 
       SET estado_operativo = 'BAJA',
           fecha_baja = $1,
           motivo_baja = $2
       WHERE activo_id = $3 
       RETURNING *`,
      [fechaBajaFinal, motivo_baja.trim(), id]
    );

    await client.query("UPDATE activo SET estado = 'DESUSO' WHERE id = $1", [id]);

    await registrarAuditoria(client, {
      tabla_afectada: 'celulares',
      registro_id: parseInt(id),
      accion: 'BAJA',
      datos_anteriores: anterior,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Celular dado de baja exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al dar de baja el celular:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al dar de baja el celular' });
  } finally {
    client.release();
  }
};
