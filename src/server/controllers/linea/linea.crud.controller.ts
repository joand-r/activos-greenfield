import { pool, ensureDatabaseSchema } from "@/lib/db/database";
import { registrarAuditoria } from "@/server/utils/auditoria";

export const obtenerLineas = async (req: any, res: any) => {
  try {
    const { search, telefonia_id, estado, personal_id, plan_id } = req.query;

    let query = `
      WITH lineas_con_slot AS (
        SELECT 
          id,
          ROW_NUMBER() OVER(PARTITION BY activo_id ORDER BY id ASC) as sim_slot
        FROM linea
        WHERE activo_id IS NOT NULL AND estado != 'BAJA'
      )
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
        COALESCE(lcs.sim_slot, 1)::int as sim_slot,
        CASE 
          WHEN l.activo_id IS NULL THEN NULL
          WHEN lcs.sim_slot = 2 AND cel.imei_2 IS NOT NULL AND TRIM(cel.imei_2) != '' THEN cel.imei_2
          ELSE cel.imei_1
        END as celular_imei_asignado,
        cel.memoria as celular_memoria,
        cel.capacidad_disco as celular_capacidad
      FROM linea l
      JOIN plan_telefonia pt ON l.plan_id = pt.id
      JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN lineas_con_slot lcs ON l.id = lcs.id
      LEFT JOIN personal p ON l.personal_id = p.id
      LEFT JOIN activo a ON l.activo_id = a.id
      LEFT JOIN celulares cel ON a.id = cel.activo_id
      LEFT JOIN marca m ON a.marca_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search && search.trim() !== "") {
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
    console.error("Error al obtener líneas:", error);
    res.status(500).json({ success: false, error: "Error al obtener líneas" });
  }
};

export const obtenerLineaPorId = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `WITH lineas_con_slot AS (
        SELECT 
          id,
          ROW_NUMBER() OVER(PARTITION BY activo_id ORDER BY id ASC) as sim_slot
        FROM linea
        WHERE activo_id IS NOT NULL AND estado != 'BAJA'
      )
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
        COALESCE(lcs.sim_slot, 1)::int as sim_slot,
        CASE 
          WHEN l.activo_id IS NULL THEN NULL
          WHEN lcs.sim_slot = 2 AND cel.imei_2 IS NOT NULL AND TRIM(cel.imei_2) != '' THEN cel.imei_2
          ELSE cel.imei_1
        END as celular_imei_asignado,
        cel.memoria as celular_memoria,
        cel.capacidad_disco as celular_capacidad
      FROM linea l
      JOIN plan_telefonia pt ON l.plan_id = pt.id
      JOIN telefonia t ON pt.telefonia_id = t.id
      LEFT JOIN lineas_con_slot lcs ON l.id = lcs.id
      LEFT JOIN personal p ON l.personal_id = p.id
      LEFT JOIN activo a ON l.activo_id = a.id
      LEFT JOIN celulares cel ON a.id = cel.activo_id
      LEFT JOIN marca m ON a.marca_id = m.id
      WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Línea no encontrada" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error al obtener línea:", error);
    res.status(500).json({ success: false, error: "Error al obtener línea" });
  }
};

export const crearLinea = async (req: any, res: any) => {
  await ensureDatabaseSchema();
  const client = await pool.connect();
  try {
    const { numero, activo_id, plan_id, personal_id, estado, fecha_asignacion, observaciones } = req.body;

    if (!numero || numero.trim() === "") {
      return res.status(400).json({ success: false, error: "El número de línea es requerido" });
    }
    if (!plan_id) {
      return res.status(400).json({ success: false, error: "El plan es requerido" });
    }

    await client.query("BEGIN");

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
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "El equipo celular seleccionado no existe en el inventario" });
      }
      const cel = celCheck.rows[0];
      if (cel.estado_operativo === "BAJA" || cel.estado_operativo === "DESHABILITADO") {
        await client.query("ROLLBACK");
        return res.status(400).json({ 
          success: false, 
          error: `El equipo celular [${cel.codigo}] ${cel.nombre} se encuentra en estado ${cel.estado_operativo} y no puede asignarse a una línea` 
        });
      }

      const tieneDualImei = cel.imei_2 && cel.imei_2.trim() !== "";
      const maxLineas = tieneDualImei ? 2 : 1;

      const lineasAsignadasCheck = await client.query(
        `SELECT id, numero FROM linea WHERE activo_id = $1 AND estado != 'BAJA'`,
        [activo_id]
      );
      const totalLineasAsignadas = lineasAsignadasCheck.rows.length;

      if (totalLineasAsignadas >= maxLineas) {
        await client.query("ROLLBACK");
        const numLineasOcupadas = lineasAsignadasCheck.rows.map((l: any) => `#${l.numero}`).join(", ");
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
    const existsCheck = await client.query("SELECT id FROM linea WHERE numero = $1", [numero.trim()]);
    if (existsCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, error: "El número de línea ya se encuentra registrado" });
    }

    const estadoFinal = estado || (personal_id ? "ACTIVA" : "DISPONIBLE");
    const fechaAsignacionFinal = fecha_asignacion || (personal_id ? new Date().toISOString().split("T")[0] : null);

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
        personal_id ? "Registro y asignación inicial de línea" : "Registro de línea disponible en stock",
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: "linea",
      registro_id: nuevaLinea.id,
      accion: "CREAR",
      datos_nuevos: nuevaLinea,
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query("COMMIT");
    res.status(201).json({ success: true, data: nuevaLinea });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error al crear línea:", error);
    res.status(500).json({ success: false, error: error.message || "Error al crear línea" });
  } finally {
    client.release();
  }
};

export const actualizarLinea = async (req: any, res: any) => {
  await ensureDatabaseSchema();
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { numero, activo_id, personal_id, plan_id, observaciones } = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ success: false, error: "ID de línea inválido" });
    }
    const lineaId = parseInt(id, 10);

    await client.query("BEGIN");
    const prevResult = await client.query("SELECT * FROM linea WHERE id = $1", [lineaId]);
    if (prevResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Línea no encontrada" });
    }

    if (numero && numero.trim() !== prevResult.rows[0].numero) {
      const existsCheck = await client.query("SELECT id FROM linea WHERE numero = $1 AND id != $2", [numero.trim(), lineaId]);
      if (existsCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "El número ya pertenece a otra línea" });
      }
    }

    const nuevoActivoId = activo_id !== undefined ? (activo_id ? parseInt(activo_id, 10) : null) : (prevResult.rows[0].activo_id ? parseInt(prevResult.rows[0].activo_id, 10) : null);
    const anteriorActivoId = prevResult.rows[0].activo_id ? parseInt(prevResult.rows[0].activo_id, 10) : null;

    const nuevoPersonalId = personal_id !== undefined ? (personal_id ? parseInt(personal_id, 10) : null) : (prevResult.rows[0].personal_id ? parseInt(prevResult.rows[0].personal_id, 10) : null);
    const anteriorPersonalId = prevResult.rows[0].personal_id ? parseInt(prevResult.rows[0].personal_id, 10) : null;

    const nuevoPlanId = plan_id !== undefined ? (plan_id ? parseInt(plan_id, 10) : prevResult.rows[0].plan_id) : prevResult.rows[0].plan_id;

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
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "El equipo celular seleccionado no existe en el inventario" });
      }
      const cel = celCheck.rows[0];
      if (cel.estado_operativo === "BAJA" || cel.estado_operativo === "DESHABILITADO") {
        await client.query("ROLLBACK");
        return res.status(400).json({ 
          success: false, 
          error: `El equipo celular [${cel.codigo}] ${cel.nombre} se encuentra en estado ${cel.estado_operativo} y no puede asignarse a una línea` 
        });
      }

      const tieneDualImei = cel.imei_2 && cel.imei_2.trim() !== "";
      const maxLineas = tieneDualImei ? 2 : 1;

      const lineasAsignadasCheck = await client.query(
        `SELECT id, numero FROM linea WHERE activo_id = $1 AND estado != 'BAJA' AND id != $2`,
        [nuevoActivoId, lineaId]
      );
      const totalLineasAsignadas = lineasAsignadasCheck.rows.length;

      if (totalLineasAsignadas >= maxLineas) {
        await client.query("ROLLBACK");
        const numLineasOcupadas = lineasAsignadasCheck.rows.map((l: any) => `#${l.numero}`).join(", ");
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
       SET numero = COALESCE($1::varchar, numero),
           activo_id = $2::bigint,
           personal_id = $3::bigint,
           plan_id = COALESCE($7::bigint, plan_id),
           estado = CASE 
             WHEN $3::bigint IS NULL THEN 'DISPONIBLE'
             WHEN estado = 'DISPONIBLE' THEN 'ACTIVA'
             ELSE estado 
           END,
           fecha_asignacion = CASE 
             WHEN $3::bigint IS NULL THEN NULL 
             WHEN $3::bigint IS NOT NULL AND ($3::bigint != COALESCE($6::bigint, 0) OR fecha_asignacion IS NULL) THEN CURRENT_DATE 
             ELSE fecha_asignacion 
           END,
           observaciones = $4::text,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5::bigint RETURNING *`,
      [
        numero ? numero.trim() : prevResult.rows[0].numero,
        nuevoActivoId,
        nuevoPersonalId,
        observaciones !== undefined ? observaciones : prevResult.rows[0].observaciones,
        lineaId,
        anteriorPersonalId || 0,
        nuevoPlanId,
      ]
    );

    // Si cambió el personal asignado, registrar evento de auditoría e historial
    if (personal_id !== undefined && Number(nuevoPersonalId || 0) !== Number(anteriorPersonalId || 0)) {
      await client.query(
        `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, activo_anterior_id, activo_nuevo_id, tipo_evento, motivo, usuario_id)
         VALUES ($1, $2, $3, $4, $4, $5, $6, 'TRANSFERENCIA', $7, $8)`,
        [
          lineaId,
          anteriorPersonalId || null,
          nuevoPersonalId || null,
          prevResult.rows[0].plan_id,
          anteriorActivoId || null,
          nuevoActivoId || null,
          nuevoPersonalId ? "Edición / Corrección de colaborador asignado" : "Desasignación de colaborador (línea disponible en stock)",
          req.user?.id || req.userId || null,
        ]
      );
    }

    // Si cambió el activo celular, sincronizar estados y registrar evento en historial
    if (activo_id !== undefined && Number(nuevoActivoId || 0) !== Number(anteriorActivoId || 0)) {
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
          [anteriorActivoId, lineaId]
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
         VALUES ($1, $2, $2, $3, $3, $4, $5, 'CAMBIO_EQUIPO', $6, $7)`,
        [
          lineaId,
          nuevoPersonalId || null,
          prevResult.rows[0].plan_id,
          anteriorActivoId || null,
          nuevoActivoId,
          nuevoActivoId ? "Cambio de equipo celular asignado" : "Desvinculación de equipo celular (Solo Chip)",
          req.user?.id || req.userId || null,
        ]
      );
    }

    await registrarAuditoria(client, {
      tabla_afectada: "linea",
      registro_id: lineaId,
      accion: "ACTUALIZAR",
      datos_anteriores: prevResult.rows[0],
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query("COMMIT");
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar línea:", error);
    res.status(500).json({ success: false, error: error.message || "Error al actualizar línea" });
  } finally {
    client.release();
  }
};

export const eliminarLinea = async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");
    const prevResult = await client.query("SELECT * FROM linea WHERE id = $1", [id]);
    if (prevResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Línea no encontrada" });
    }

    await client.query("DELETE FROM linea WHERE id = $1", [id]);

    await registrarAuditoria(client, {
      tabla_afectada: "linea",
      registro_id: parseInt(id),
      accion: "ELIMINAR",
      datos_anteriores: prevResult.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query("COMMIT");
    res.json({ success: true, message: "Línea eliminada exitosamente" });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar línea:", error);
    res.status(500).json({ success: false, error: error.message || "Error al eliminar línea" });
  } finally {
    client.release();
  }
};
