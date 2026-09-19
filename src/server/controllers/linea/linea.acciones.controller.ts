import { pool, ensureDatabaseSchema } from "@/lib/db/database";
import { registrarAuditoria } from "@/server/utils/auditoria";

export const transferirLinea = async (req: any, res: any) => {
  await ensureDatabaseSchema();
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { personal_nuevo_id, motivo } = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ success: false, error: "ID de línea inválido" });
    }
    const lineaId = parseInt(id, 10);

    if (!personal_nuevo_id) {
      return res.status(400).json({ success: false, error: "El nuevo personal es requerido para la transferencia" });
    }
    const nuevoPersonalId = parseInt(personal_nuevo_id, 10);

    await client.query("BEGIN");
    const lineaResult = await client.query("SELECT * FROM linea WHERE id = $1", [lineaId]);
    if (lineaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Línea no encontrada" });
    }

    const lineaActual = lineaResult.rows[0];
    const personalAnteriorId = lineaActual.personal_id ? parseInt(lineaActual.personal_id, 10) : null;

    if (personalAnteriorId && personalAnteriorId === nuevoPersonalId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, error: "La línea ya se encuentra asignada a este personal" });
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
      [nuevoPersonalId, lineaId]
    );

    // Registrar en historial_linea
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, activo_anterior_id, activo_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $3, $4, $4, $5, $5, 'TRANSFERENCIA', $6, $7)`,
      [
        lineaId,
        personalAnteriorId || null,
        nuevoPersonalId,
        lineaActual.plan_id,
        lineaActual.activo_id || null,
        motivo ? motivo.trim() : "Reasignación de personal",
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: "linea",
      registro_id: lineaId,
      accion: "TRANSFERENCIA",
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query("COMMIT");
    res.json({ success: true, data: result.rows[0], message: "Línea transferida exitosamente" });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error al transferir línea:", error);
    res.status(500).json({ success: false, error: error.message || "Error al transferir línea" });
  } finally {
    client.release();
  }
};

export const cambiarPlanLinea = async (req: any, res: any) => {
  await ensureDatabaseSchema();
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { plan_nuevo_id, motivo } = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ success: false, error: "ID de línea inválido" });
    }
    const lineaId = parseInt(id, 10);

    if (!plan_nuevo_id) {
      return res.status(400).json({ success: false, error: "El nuevo plan es requerido" });
    }
    const nuevoPlanId = parseInt(plan_nuevo_id, 10);

    await client.query("BEGIN");
    const lineaResult = await client.query("SELECT * FROM linea WHERE id = $1", [lineaId]);
    if (lineaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Línea no encontrada" });
    }

    const lineaActual = lineaResult.rows[0];
    const planAnteriorId = lineaActual.plan_id ? parseInt(lineaActual.plan_id, 10) : null;

    if (planAnteriorId && planAnteriorId === nuevoPlanId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, error: "La línea ya cuenta con este plan" });
    }

    const result = await client.query(
      `UPDATE linea 
       SET plan_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [nuevoPlanId, lineaId]
    );

    // Registrar en historial_linea
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, activo_anterior_id, activo_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $2, $3, $4, $5, $5, 'CAMBIO_PLAN', $6, $7)`,
      [
        lineaId,
        lineaActual.personal_id || null,
        planAnteriorId,
        nuevoPlanId,
        lineaActual.activo_id || null,
        motivo ? motivo.trim() : "Actualización de plan telefónico",
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: "linea",
      registro_id: lineaId,
      accion: "CAMBIO_PLAN",
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query("COMMIT");
    res.json({ success: true, data: result.rows[0], message: "Plan de la línea actualizado exitosamente" });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error al cambiar plan de la línea:", error);
    res.status(500).json({ success: false, error: error.message || "Error al cambiar plan de la línea" });
  } finally {
    client.release();
  }
};

export const cambiarEquipoLinea = async (req: any, res: any) => {
  await ensureDatabaseSchema();
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { activo_nuevo_id, motivo } = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ success: false, error: "ID de línea inválido" });
    }
    const lineaId = parseInt(id, 10);

    await client.query("BEGIN");
    const lineaResult = await client.query("SELECT * FROM linea WHERE id = $1", [lineaId]);
    if (lineaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Línea no encontrada" });
    }

    const lineaActual = lineaResult.rows[0];
    const anteriorActivoId = lineaActual.activo_id ? parseInt(lineaActual.activo_id, 10) : null;
    const nuevoActivoId = activo_nuevo_id !== undefined && activo_nuevo_id !== "" && activo_nuevo_id !== null ? parseInt(activo_nuevo_id, 10) : null;

    if (anteriorActivoId && nuevoActivoId && anteriorActivoId === nuevoActivoId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, error: "La línea ya cuenta con este equipo celular asignado" });
    }

    if (!anteriorActivoId && !nuevoActivoId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, error: "La línea ya se encuentra sin equipo celular vinculado" });
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

    // 1. Actualizar la línea con el nuevo celular
    const result = await client.query(
      `UPDATE linea 
       SET activo_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [nuevoActivoId, lineaId]
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

    // 4. Registrar en historial_linea con tipo_evento = 'CAMBIO_EQUIPO'
    await client.query(
      `INSERT INTO historial_linea (linea_id, personal_anterior_id, personal_nuevo_id, plan_anterior_id, plan_nuevo_id, activo_anterior_id, activo_nuevo_id, tipo_evento, motivo, usuario_id)
       VALUES ($1, $2, $2, $3, $3, $4, $5, 'CAMBIO_EQUIPO', $6, $7)`,
      [
        lineaId,
        lineaActual.personal_id || null,
        lineaActual.plan_id,
        anteriorActivoId || null,
        nuevoActivoId,
        motivo ? motivo.trim() : "Reemplazo o cambio de equipo celular",
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: "linea",
      registro_id: lineaId,
      accion: "CAMBIO_EQUIPO",
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query("COMMIT");
    res.json({ success: true, data: result.rows[0], message: "Equipo celular actualizado exitosamente" });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error al cambiar equipo de la línea:", error);
    res.status(500).json({ success: false, error: error.message || "Error al cambiar equipo celular" });
  } finally {
    client.release();
  }
};

export const darDeBajaLinea = async (req: any, res: any) => {
  await ensureDatabaseSchema();
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { motivo_baja, fecha_baja } = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ success: false, error: "ID de línea inválido" });
    }
    const lineaId = parseInt(id, 10);

    if (!motivo_baja || motivo_baja.trim() === "") {
      return res.status(400).json({ success: false, error: "El motivo de la baja es requerido" });
    }

    await client.query("BEGIN");
    const lineaResult = await client.query("SELECT * FROM linea WHERE id = $1", [lineaId]);
    if (lineaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Línea no encontrada" });
    }

    const lineaActual = lineaResult.rows[0];
    const fechaBajaFinal = fecha_baja || new Date().toISOString().split("T")[0];

    const result = await client.query(
      `UPDATE linea 
       SET estado = 'BAJA',
           fecha_baja = $1,
           motivo_baja = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [fechaBajaFinal, motivo_baja.trim(), lineaId]
    );

    // Si la línea tenía un celular asignado, revisar si queda libre
    if (lineaActual.activo_id) {
      const otrasLineas = await client.query(
        `SELECT COUNT(*)::int as total FROM linea WHERE activo_id = $1 AND estado != 'BAJA' AND id != $2`,
        [lineaActual.activo_id, lineaId]
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
        lineaId,
        lineaActual.personal_id || null,
        lineaActual.plan_id,
        lineaActual.activo_id || null,
        motivo_baja.trim(),
        req.user?.id || req.userId || null,
      ]
    );

    await registrarAuditoria(client, {
      tabla_afectada: "linea",
      registro_id: lineaId,
      accion: "BAJA",
      datos_anteriores: lineaActual,
      datos_nuevos: result.rows[0],
      usuario_id: req.user?.id || req.userId || null,
      ip_usuario: req.ip || null,
    });

    await client.query("COMMIT");
    res.json({ success: true, data: result.rows[0], message: "Línea dada de baja exitosamente" });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error al dar de baja la línea:", error);
    res.status(500).json({ success: false, error: error.message || "Error al dar de baja la línea" });
  } finally {
    client.release();
  }
};
