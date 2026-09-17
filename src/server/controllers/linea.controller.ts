import { pool } from '@/lib/db/database';
import { registrarAuditoria } from '@/server/utils/auditoria';

export const obtenerLineas = async (req: any, res: any) => {
  try {
    const { search, telefonia_id, estado, personal_id, plan_id } = req.query;

    let query = `
      SELECT 
        l.*,
        pt.nombre as plan_nombre,
        pt.costo as plan_costo,
        pt.estado as plan_estado,
        t.id as telefonia_id,
        t.nombre as telefonia_nombre,
        p.nombre as personal_nombre,
        p.departamento as personal_departamento,
        p.cargo as personal_cargo,
        a.codigo as celular_codigo,
        a.nombre as celular_nombre,
        cel.modelo as celular_modelo,
        m.nombre as celular_marca,
        cel.imei_1 as celular_imei_1,
        cel.imei_2 as celular_imei_2,
        cel.memoria as celular_memoria,
        cel.capacidad_disco as celular_capacidad
      FROM linea l
      JOIN plan_telefonia pt ON l.plan_id = pt.id
      JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN personal p ON l.personal_id = p.id
      LEFT JOIN activo a ON l.activo_id = a.id
      LEFT JOIN celulares cel ON a.id = cel.activo_id
      LEFT JOIN marca m ON a.marca_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search && search.trim() !== '') {
      query += ` AND (
        l.numero ILIKE $${paramCount} OR 
        a.codigo ILIKE $${paramCount} OR 
        a.nombre ILIKE $${paramCount} OR 
        cel.modelo ILIKE $${paramCount} OR 
        cel.imei_1 ILIKE $${paramCount} OR 
        cel.imei_2 ILIKE $${paramCount} OR 
        p.nombre ILIKE $${paramCount} OR 
        p.departamento ILIKE $${paramCount} OR 
        p.cargo ILIKE $${paramCount} OR
        pt.nombre ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
      paramCount++;
    }

    if (telefonia_id) {
      query += ` AND t.id = $${paramCount}`;
      params.push(telefonia_id);
      paramCount++;
    }

    if (estado) {
      query += ` AND l.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (personal_id) {
      query += ` AND l.personal_id = $${paramCount}`;
      params.push(personal_id);
      paramCount++;
    }

    if (plan_id) {
      query += ` AND l.plan_id = $${paramCount}`;
      params.push(plan_id);
      paramCount++;
    }

    query += ` ORDER BY l.numero ASC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener líneas:', error);
    res.status(500).json({ success: false, error: 'Error al obtener líneas' });
  }
};

export const obtenerLineaPorId = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        l.*,
        pt.nombre as plan_nombre,
        pt.costo as plan_costo,
        pt.estado as plan_estado,
        t.id as telefonia_id,
        t.nombre as telefonia_nombre,
        p.nombre as personal_nombre,
        p.departamento as personal_departamento,
        p.cargo as personal_cargo,
        a.codigo as celular_codigo,
        a.nombre as celular_nombre,
        cel.modelo as celular_modelo,
        m.nombre as celular_marca,
        cel.imei_1 as celular_imei_1,
        cel.imei_2 as celular_imei_2,
        cel.memoria as celular_memoria,
        cel.capacidad_disco as celular_capacidad
      FROM linea l
      JOIN plan_telefonia pt ON l.plan_id = pt.id
      JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN personal p ON l.personal_id = p.id
      LEFT JOIN activo a ON l.activo_id = a.id
      LEFT JOIN celulares cel ON a.id = cel.activo_id
      LEFT JOIN marca m ON a.marca_id = m.id
      WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener línea:', error);
    res.status(500).json({ success: false, error: 'Error al obtener línea' });
  }
};

export const crearLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { numero, activo_id, plan_id, personal_id, estado, fecha_asignacion, observaciones } = req.body;

    if (!numero || numero.trim() === '') {
      return res.status(400).json({ success: false, error: 'El número de línea es requerido' });
    }
    if (!plan_id) {
      return res.status(400).json({ success: false, error: 'El plan es requerido' });
    }

    await client.query('BEGIN');

    // Validar equipo celular y capacidad de IMEIs si se asigna
    if (activo_id) {
      const celCheck = await client.query(
        `SELECT a.id, a.codigo, a.nombre, cel.modelo, cel.imei_1, cel.imei_2, cel.estado_operativo 
         FROM activo a 
         JOIN celulares cel ON a.id = cel.activo_id 
         WHERE a.id = $1`,
        [activo_id]
      );
      if (celCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'El equipo celular seleccionado no existe en el inventario' });
      }
      const cel = celCheck.rows[0];
      if (cel.estado_operativo === 'BAJA' || cel.estado_operativo === 'DESHABILITADO') {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: `El equipo celular [${cel.codigo}] ${cel.nombre} se encuentra en estado ${cel.estado_operativo} y no puede asignarse a una línea` 
        });
      }

      const tieneDualImei = cel.imei_2 && cel.imei_2.trim() !== '';
      const maxLineas = tieneDualImei ? 2 : 1;

      const lineasAsignadasCheck = await client.query(
        `SELECT id, numero FROM linea WHERE activo_id = $1 AND estado != 'BAJA'`,
        [activo_id]
      );
      const totalLineasAsignadas = lineasAsignadasCheck.rows.length;

      if (totalLineasAsignadas >= maxLineas) {
        await client.query('ROLLBACK');
        const numLineasOcupadas = lineasAsignadasCheck.rows.map((l: any) => `#${l.numero}`).join(', ');
        if (maxLineas === 1) {
          return res.status(400).json({
            success: false,
            error: `El equipo celular [${cel.codigo}] ya está asignado a la línea ${numLineasOcupadas} y cuenta con 1 solo IMEI (Single SIM). No puede asignarse a más líneas.`
          });
        } else {
          return res.status(400).json({
            success: false,
            error: `El equipo celular [${cel.codigo}] ya alcanzó su capacidad máxima de 2 líneas asignadas (${numLineasOcupadas}) para sus 2 IMEIs (Dual SIM).`
          });
        }
      }
    }

    // Verificar si el número ya existe
    const existsCheck = await client.query('SELECT id FROM linea WHERE numero = $1', [numero.trim()]);
    if (existsCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'El número de línea ya se encuentra registrado' });
    }

    const estadoFinal = estado || (personal_id ? 'ACTIVA' : 'DISPONIBLE');
    const fechaAsignacionFinal = fecha_asignacion || (personal_id ? new Date().toISOString().split('T')[0] : null);

    const result = await client.query(
      `INSERT INTO linea (numero, activo_id, plan_id, personal_id, estado, fecha_asignacion, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        numero.trim(),
        activo_id ? parseInt(activo_id) : null,
        plan_id,
        personal_id || null,
        estadoFinal,
        fechaAsignacionFinal,
        observaciones || null,
      ]
    );

    const nuevaLinea = result.rows[0];

    // Si se asignó un celular, actualizar su estado operativo
    if (activo_id) {
      await client.query(
        `UPDATE celulares SET estado_operativo = 'ACTIVO' WHERE activo_id = $1 AND estado_operativo NOT IN ('BAJA', 'DESHABILITADO')`,
        [activo_id]
      );
      await client.query(
        `UPDATE activo SET estado = 'ASIGNADO' WHERE id = $1 AND estado NOT IN ('VENDIDO', 'DONADO', 'DANADO', 'TRANSFERIR')`,
        [activo_id]
      );
    }

    // Registrar evento inicial en historial
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_nuevo_id, plan_nuevo_id, activo_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $3, $4, 'ASIGNACION', $5, $6)`,
      [
        nuevaLinea.id,
        personal_id || null,
        plan_id,
        activo_id ? parseInt(activo_id) : null,
        personal_id ? 'Registro y asignación inicial de línea' : 'Registro de línea disponible en stock',
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: nuevaLinea.id,
      accion: 'CREAR',
      datos_nuevos: nuevaLinea,
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: nuevaLinea });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al crear línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear línea' });
  } finally {
    client.release();
  }
};

export const actualizarLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { numero, activo_id, personal_id, observaciones } = req.body;

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    if (numero && numero.trim() !== prevResult.rows[0].numero) {
      const existsCheck = await client.query('SELECT id FROM linea WHERE numero = $1 AND id != $2', [numero.trim(), id]);
      if (existsCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'El número ya pertenece a otra línea' });
      }
    }

    const nuevoActivoId = activo_id !== undefined ? (activo_id ? parseInt(activo_id) : null) : prevResult.rows[0].activo_id;
    const anteriorActivoId = prevResult.rows[0].activo_id;

    const nuevoPersonalId = personal_id !== undefined ? (personal_id ? parseInt(personal_id) : null) : prevResult.rows[0].personal_id;
    const anteriorPersonalId = prevResult.rows[0].personal_id;

    // Si cambió el equipo celular asignado, validar disponibilidad por IMEI
    if (nuevoActivoId && Number(nuevoActivoId) !== Number(anteriorActivoId)) {
      const celCheck = await client.query(
        `SELECT a.id, a.codigo, a.nombre, cel.modelo, cel.imei_1, cel.imei_2, cel.estado_operativo 
         FROM activo a 
         JOIN celulares cel ON a.id = cel.activo_id 
         WHERE a.id = $1`,
        [nuevoActivoId]
      );
      if (celCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'El equipo celular seleccionado no existe en el inventario' });
      }
      const cel = celCheck.rows[0];
      if (cel.estado_operativo === 'BAJA' || cel.estado_operativo === 'DESHABILITADO') {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: `El equipo celular [${cel.codigo}] ${cel.nombre} se encuentra en estado ${cel.estado_operativo} y no puede asignarse a una línea` 
        });
      }

      const tieneDualImei = cel.imei_2 && cel.imei_2.trim() !== '';
      const maxLineas = tieneDualImei ? 2 : 1;

      const lineasAsignadasCheck = await client.query(
        `SELECT id, numero FROM linea WHERE activo_id = $1 AND estado != 'BAJA' AND id != $2`,
        [nuevoActivoId, id]
      );
      const totalLineasAsignadas = lineasAsignadasCheck.rows.length;

      if (totalLineasAsignadas >= maxLineas) {
        await client.query('ROLLBACK');
        const numLineasOcupadas = lineasAsignadasCheck.rows.map((l: any) => `#${l.numero}`).join(', ');
        if (maxLineas === 1) {
          return res.status(400).json({
            success: false,
            error: `El equipo celular [${cel.codigo}] ya está asignado a la línea ${numLineasOcupadas} y cuenta con 1 solo IMEI (Single SIM). No puede asignarse a más líneas.`
          });
        } else {
          return res.status(400).json({
            success: false,
            error: `El equipo celular [${cel.codigo}] ya alcanzó su capacidad máxima de 2 líneas asignadas (${numLineasOcupadas}) para sus 2 IMEIs (Dual SIM).`
          });
        }
      }
    }

    const result = await client.query(
      `UPDATE linea 
       SET numero = COALESCE($1, numero),
           activo_id = $2,
           personal_id = $3,
           estado = CASE 
             WHEN $3 IS NULL THEN 'DISPONIBLE'
             WHEN estado = 'DISPONIBLE' THEN 'ACTIVA'
             ELSE estado 
           END,
           fecha_asignacion = CASE 
             WHEN $3 IS NULL THEN NULL 
             WHEN $3 IS NOT NULL AND ($3 != COALESCE($6, 0) OR fecha_asignacion IS NULL) THEN CURRENT_DATE 
             ELSE fecha_asignacion 
           END,
           observaciones = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [
        numero ? numero.trim() : prevResult.rows[0].numero,
        nuevoActivoId,
        nuevoPersonalId,
        observaciones !== undefined ? observaciones : prevResult.rows[0].observaciones,
        id,
        anteriorPersonalId || 0,
      ]
    );

    // Si cambió el personal asignado, registrar evento de auditoría e historial
    if (personal_id !== undefined && Number(nuevoPersonalId || 0) !== Number(anteriorPersonalId || 0)) {
      await client.query(
        `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, activo_anterior_id, activo_nuevo_id, tipo_evento, motivo, usuario_id)
         VALUES ($1, $2, $3, $4, $4, $5, $5, 'ASIGNACION', $6, $7)`,
        [
          id,
          anteriorPersonalId || null,
          nuevoPersonalId || null,
          prevResult.rows[0].plan_id,
          nuevoActivoId || null,
          nuevoPersonalId ? 'Edición / Corrección de colaborador asignado' : 'Desasignación de colaborador (línea disponible en stock)',
          req.user?.id || req.userId || null,
        ]
      );
    }

    // Si cambió el activo celular, sincronizar estados y registrar evento en historial
    if (activo_id !== undefined && Number(nuevoActivoId) !== Number(anteriorActivoId)) {
      // 1. Activar nuevo celular si aplica
      if (nuevoActivoId) {
        await client.query(
          `UPDATE celulares SET estado_operativo = 'ACTIVO' WHERE activo_id = $1 AND estado_operativo NOT IN ('BAJA', 'DESHABILITADO')`,
          [nuevoActivoId]
        );
        await client.query(
          `UPDATE activo SET estado = 'ASIGNADO' WHERE id = $1 AND estado NOT IN ('VENDIDO', 'DONADO', 'DANADO', 'TRANSFERIR')`,
          [nuevoActivoId]
        );
      }

      // 2. Si el celular anterior quedó sin líneas activas, regresarlo a DISPONIBLE
      if (anteriorActivoId) {
        const otrasLineas = await client.query(
          `SELECT COUNT(*)::int as total FROM linea WHERE activo_id = $1 AND estado != 'BAJA' AND id != $2`,
          [anteriorActivoId, id]
        );
        if (otrasLineas.rows[0].total === 0) {
          await client.query(
            `UPDATE celulares SET estado_operativo = 'DISPONIBLE' WHERE activo_id = $1 AND estado_operativo NOT IN ('BAJA', 'DESHABILITADO')`,
            [anteriorActivoId]
          );
          await client.query(
            `UPDATE activo SET estado = 'DISPONIBLE' WHERE id = $1 AND estado NOT IN ('VENDIDO', 'DONADO', 'DANADO', 'TRANSFERIR')`,
            [anteriorActivoId]
          );
        }
      }

      await client.query(
        `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, activo_anterior_id, activo_nuevo_id, tipo_evento, motivo, usuario_id)
         VALUES ($1, $2, $2, $3, $3, $4, $5, 'ASIGNACION', $6, $7)`,
        [
          id,
          nuevoPersonalId || null,
          prevResult.rows[0].plan_id,
          anteriorActivoId || null,
          nuevoActivoId,
          'Cambio de equipo celular asignado',
          req.user?.id || req.userId || null,
        ]
      );
    }

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'ACTUALIZAR',
      datos_anteriores: prevResult.rows[0],
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar línea' });
  } finally {
    client.release();
  }
};

export const transferirLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { personal_nuevo_id, motivo } = req.body;

    if (!personal_nuevo_id) {
      return res.status(400).json({ success: false, error: 'El nuevo personal es requerido para la transferencia' });
    }

    await client.query('BEGIN');
    const lineaResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (lineaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    const lineaActual = lineaResult.rows[0];
    const personalAnteriorId = lineaActual.personal_id;

    if (Number(personalAnteriorId) === Number(personal_nuevo_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'La línea ya se encuentra asignada a este personal' });
    }

    // Actualizar la línea con el nuevo personal y fecha
    const result = await client.query(
      `UPDATE linea 
       SET personal_id = $1,
           estado = 'ACTIVA',
           fecha_asignacion = CURRENT_DATE,
           fecha_baja = NULL,
           motivo_baja = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [personal_nuevo_id, id]
    );

    // Registrar en historial_linea
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $3, $4, $4, 'TRANSFERENCIA', $5, $6)`,
      [
        id,
        personalAnteriorId || null,
        personal_nuevo_id,
        lineaActual.plan_id,
        motivo ? motivo.trim() : 'Reasignación de personal',
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'TRANSFERENCIA',
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Línea transferida exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al transferir línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al transferir línea' });
  } finally {
    client.release();
  }
};

export const cambiarPlanLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { plan_nuevo_id, motivo } = req.body;

    if (!plan_nuevo_id) {
      return res.status(400).json({ success: false, error: 'El nuevo plan es requerido' });
    }

    await client.query('BEGIN');
    const lineaResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (lineaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    const lineaActual = lineaResult.rows[0];
    const planAnteriorId = lineaActual.plan_id;

    if (Number(planAnteriorId) === Number(plan_nuevo_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'La línea ya cuenta con este plan' });
    }

    const result = await client.query(
      `UPDATE linea 
       SET plan_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [plan_nuevo_id, id]
    );

    // Registrar en historial_linea
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $2, $3, $4, 'CAMBIO_PLAN', $5, $6)`,
      [
        id,
        lineaActual.personal_id || null,
        planAnteriorId,
        plan_nuevo_id,
        motivo ? motivo.trim() : 'Actualización de plan telefónico',
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'CAMBIO_PLAN',
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Plan de la línea actualizado exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al cambiar plan de la línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al cambiar plan de la línea' });
  } finally {
    client.release();
  }
};

export const cambiarEquipoLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { activo_nuevo_id, motivo } = req.body;

    await client.query('BEGIN');
    const lineaResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (lineaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    const lineaActual = lineaResult.rows[0];
    const anteriorActivoId = lineaActual.activo_id;
    const nuevoActivoId = activo_nuevo_id !== undefined && activo_nuevo_id !== "" && activo_nuevo_id !== null ? parseInt(activo_nuevo_id) : null;

    if (anteriorActivoId && nuevoActivoId && Number(anteriorActivoId) === Number(nuevoActivoId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'La línea ya cuenta con este equipo celular asignado' });
    }

    // Validar el nuevo equipo celular si se especificó uno
    if (nuevoActivoId) {
      const celCheck = await client.query(
        `SELECT a.id, a.codigo, a.nombre, cel.modelo, cel.imei_1, cel.imei_2, cel.estado_operativo 
         FROM activo a 
         JOIN celulares cel ON a.id = cel.activo_id 
         WHERE a.id = $1`,
        [nuevoActivoId]
      );
      if (celCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'El equipo celular seleccionado no existe en el inventario' });
      }
      const cel = celCheck.rows[0];
      if (cel.estado_operativo === 'BAJA' || cel.estado_operativo === 'DESHABILITADO') {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: `El equipo celular [${cel.codigo}] ${cel.nombre} se encuentra en estado ${cel.estado_operativo} y no puede asignarse a una línea` 
        });
      }

      const tieneDualImei = cel.imei_2 && cel.imei_2.trim() !== '';
      const maxLineas = tieneDualImei ? 2 : 1;

      const lineasAsignadasCheck = await client.query(
        `SELECT id, numero FROM linea WHERE activo_id = $1 AND estado != 'BAJA' AND id != $2`,
        [nuevoActivoId, id]
      );
      const totalLineasAsignadas = lineasAsignadasCheck.rows.length;

      if (totalLineasAsignadas >= maxLineas) {
        await client.query('ROLLBACK');
        const numLineasOcupadas = lineasAsignadasCheck.rows.map((l: any) => `#${l.numero}`).join(', ');
        if (maxLineas === 1) {
          return res.status(400).json({
            success: false,
            error: `El equipo celular [${cel.codigo}] ya está asignado a la línea ${numLineasOcupadas} y cuenta con 1 solo IMEI (Single SIM). No puede asignarse a más líneas.`
          });
        } else {
          return res.status(400).json({
            success: false,
            error: `El equipo celular [${cel.codigo}] ya alcanzó su capacidad máxima de 2 líneas asignadas (${numLineasOcupadas}) para sus 2 IMEIs (Dual SIM).`
          });
        }
      }
    }

    // 1. Actualizar la línea con el nuevo celular
    const result = await client.query(
      `UPDATE linea 
       SET activo_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [nuevoActivoId, id]
    );

    // 2. Activar nuevo celular si aplica
    if (nuevoActivoId) {
      await client.query(
        `UPDATE celulares SET estado_operativo = 'ACTIVO' WHERE activo_id = $1 AND estado_operativo NOT IN ('BAJA', 'DESHABILITADO')`,
        [nuevoActivoId]
      );
      await client.query(
        `UPDATE activo SET estado = 'ASIGNADO' WHERE id = $1 AND estado NOT IN ('VENDIDO', 'DONADO', 'DANADO', 'TRANSFERIR')`,
        [nuevoActivoId]
      );
    }

    // 3. Si el celular anterior quedó sin líneas activas, regresarlo a DISPONIBLE
    if (anteriorActivoId) {
      const otrasLineas = await client.query(
        `SELECT COUNT(*)::int as total FROM linea WHERE activo_id = $1 AND estado != 'BAJA' AND id != $2`,
        [anteriorActivoId, id]
      );
      if (otrasLineas.rows[0].total === 0) {
        await client.query(
          `UPDATE celulares SET estado_operativo = 'DISPONIBLE' WHERE activo_id = $1 AND estado_operativo NOT IN ('BAJA', 'DESHABILITADO')`,
          [anteriorActivoId]
        );
        await client.query(
          `UPDATE activo SET estado = 'DISPONIBLE' WHERE id = $1 AND estado NOT IN ('VENDIDO', 'DONADO', 'DANADO', 'TRANSFERIR')`,
          [anteriorActivoId]
        );
      }
    }

    // 4. Registrar en historial_linea con tipo_evento = 'CAMBIO_EQUIPO'
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, activo_anterior_id, activo_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $2, $3, $3, $4, $5, 'CAMBIO_EQUIPO', $6, $7)`,
      [
        id,
        lineaActual.personal_id || null,
        lineaActual.plan_id,
        anteriorActivoId || null,
        nuevoActivoId,
        motivo ? motivo.trim() : 'Reemplazo o cambio de equipo celular',
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'CAMBIO_EQUIPO',
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Equipo celular actualizado exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al cambiar equipo de la línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al cambiar equipo celular' });
  } finally {
    client.release();
  }
};

export const darDeBajaLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { motivo_baja, fecha_baja } = req.body;

    if (!motivo_baja || motivo_baja.trim() === '') {
      return res.status(400).json({ success: false, error: 'El motivo de la baja es requerido' });
    }

    await client.query('BEGIN');
    const lineaResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (lineaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    const lineaActual = lineaResult.rows[0];
    const fechaBajaFinal = fecha_baja || new Date().toISOString().split('T')[0];

    const result = await client.query(
      `UPDATE linea 
       SET estado = 'BAJA',
           fecha_baja = $1,
           motivo_baja = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [fechaBajaFinal, motivo_baja.trim(), id]
    );

    // Si la línea tenía un celular asignado, revisar si queda libre
    if (lineaActual.activo_id) {
      const otrasLineas = await client.query(
        `SELECT COUNT(*)::int as total FROM linea WHERE activo_id = $1 AND estado != 'BAJA' AND id != $2`,
        [lineaActual.activo_id, id]
      );
      if (otrasLineas.rows[0].total === 0) {
        await client.query(
          `UPDATE celulares SET estado_operativo = 'DISPONIBLE' WHERE activo_id = $1 AND estado_operativo NOT IN ('BAJA', 'DESHABILITADO')`,
          [lineaActual.activo_id]
        );
        await client.query(
          `UPDATE activo SET estado = 'DISPONIBLE' WHERE id = $1 AND estado NOT IN ('VENDIDO', 'DONADO', 'DANADO', 'TRANSFERIR')`,
          [lineaActual.activo_id]
        );
      }
    }

    // Registrar en historial_linea
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, plan_anterior_id, activo_anterior_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $3, $4, 'BAJA', $5, $6)`,
      [
        id,
        lineaActual.personal_id || null,
        lineaActual.plan_id,
        lineaActual.activo_id || null,
        motivo_baja.trim(),
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'BAJA',
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Línea dada de baja exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al dar de baja la línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al dar de baja la línea' });
  } finally {
    client.release();
  }
};

export const obtenerHistorialLinea = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        h.*,
        pa.nombre as personal_anterior_nombre,
        pn.nombre as personal_nuevo_nombre,
        pla.nombre as plan_anterior_nombre,
        pln.nombre as plan_nuevo_nombre,
        aa.codigo as activo_anterior_codigo,
        cel_a.modelo as activo_anterior_modelo,
        an.codigo as activo_nuevo_codigo,
        cel_n.modelo as activo_nuevo_modelo,
        u.nombre as usuario_nombre
      FROM historial_linea h
      LEFT JOIN personal pa ON h.personal_anterior_id = pa.id
      LEFT JOIN personal pn ON h.personal_nuevo_id = pn.id
      LEFT JOIN plan_telefonia pla ON h.plan_anterior_id = pla.id
      LEFT JOIN plan_telefonia pln ON h.plan_nuevo_id = pln.id
      LEFT JOIN activo aa ON h.activo_anterior_id = aa.id
      LEFT JOIN celulares cel_a ON aa.id = cel_a.activo_id
      LEFT JOIN activo an ON h.activo_nuevo_id = an.id
      LEFT JOIN celulares cel_n ON an.id = cel_n.activo_id
      LEFT JOIN usuario u ON h.usuario_id = u.id
      WHERE h.linea_id = $1
      ORDER BY h.fecha DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        eventos_linea: result.rows,
      },
    });
  } catch (error) {
    console.error('Error al obtener historial de línea:', error);
    res.status(500).json({ success: false, error: 'Error al obtener historial de línea' });
  }
};

export const obtenerEstadisticas = async (req: any, res: any) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*)::int as total_lineas,
        COUNT(CASE WHEN l.estado = 'ACTIVA' THEN 1 END)::int as lineas_activas,
        COUNT(CASE WHEN l.estado = 'BAJA' THEN 1 END)::int as lineas_bajas,
        COUNT(CASE WHEN l.estado = 'DISPONIBLE' THEN 1 END)::int as lineas_disponibles,
        COALESCE(SUM(CASE WHEN l.estado = 'ACTIVA' THEN pt.costo ELSE 0 END), 0)::float as costo_mensual_total,
        COUNT(DISTINCT CASE WHEN l.estado = 'ACTIVA' AND l.personal_id IS NOT NULL THEN l.personal_id END)::int as total_personal_con_lineas
      FROM linea l
      LEFT JOIN plan_telefonia pt ON l.plan_id = pt.id
    `;
    const result = await pool.query(statsQuery);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener estadísticas de líneas:', error);
    res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
  }
};

export const eliminarLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');
    const prevResult = await client.query('SELECT * FROM linea WHERE id = $1', [id]);
    if (prevResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    await client.query('DELETE FROM linea WHERE id = $1', [id]);

    await registrarAuditoria(client, {
      tabla_afectada: 'linea',
      registro_id: parseInt(id),
      accion: 'ELIMINAR',
      datos_anteriores: prevResult.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query('COMMIT');
    res.json({ success: true, message: 'Línea eliminada exitosamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar línea:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al eliminar línea' });
  } finally {
    client.release();
  }
};

// ==================== CELULARES CONTROLLERS ====================

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
