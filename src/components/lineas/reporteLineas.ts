import { Linea, getNombreEstadoLinea } from "@/services/linea.service";

export const generarReporteLineas = (lineas: Linea[]) => {
  const ventana = window.open("", "_blank");
  if (!ventana) return;

  const lineasActivas = lineas.filter((l) => l.estado === "ACTIVA");
  const costoTotalActivas = lineasActivas.reduce(
    (acc, l) => acc + parseFloat(String(l.plan_costo || 0)),
    0
  );
  const totalConEquipo = lineas.filter((l) => l.activo_id || l.celular_codigo).length;
  const totalSoloChip = lineas.length - totalConEquipo;

  // Mapa para trackear slots en caso de que múltiples líneas compartan equipo
  const slotTracker = new Map<string, number>();

  const renderImei = (l: Linea) => {
    if (!l.activo_id && !l.celular_codigo) {
      return '<span style="color: #9ca3af; font-style: italic;">Solo Chip</span>';
    }

    if (l.celular_imei_asignado) {
      const isDual = l.celular_imei_1 && l.celular_imei_2 && l.celular_imei_2.trim() !== "";
      const slotTag = isDual && l.sim_slot ? ` <span style="color: #6b7280; font-size: 7.5px; font-weight: normal;">(SIM ${l.sim_slot})</span>` : "";
      return `<span style="font-family: monospace; font-size: 9px; font-weight: 700; color: #111827;">${l.celular_imei_asignado}</span>${slotTag}`;
    }

    // Fallback dinámico si se renderiza en frontend sin campo del backend
    const imei1 = l.celular_imei_1 ? l.celular_imei_1.trim() : "";
    const imei2 = l.celular_imei_2 ? l.celular_imei_2.trim() : "";

    if (imei1 && imei2 && l.activo_id) {
      const key = String(l.activo_id);
      const currentSlot = (slotTracker.get(key) || 0) + 1;
      slotTracker.set(key, currentSlot);
      const imeiAsignado = currentSlot === 2 ? imei2 : imei1;
      return `<span style="font-family: monospace; font-size: 9px; font-weight: 700; color: #111827;">${imeiAsignado}</span> <span style="color: #6b7280; font-size: 7.5px; font-weight: normal;">(SIM ${currentSlot})</span>`;
    }

    if (imei1) {
      return `<span style="font-family: monospace; font-size: 9px; font-weight: 700; color: #111827;">${imei1}</span>`;
    }

    return '<span style="color: #9ca3af; font-style: italic;">S/I</span>';
  };

  ventana.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Reporte de Inventario de Líneas Telefónicas y Equipos</title>
      <style>
        @page { size: letter landscape; margin: 1cm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 15px; font-size: 9.5px; color: #1f2937; line-height: 1.35; }
        
        .header { border-bottom: 2.5px solid #111827; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo-title { font-size: 16px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
        .subtitle { font-size: 11px; color: #4b5563; font-weight: 600; margin-top: 2px; }
        .meta-box { text-align: right; font-size: 8.5px; color: #6b7280; line-height: 1.4; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 14px; }
        .stat-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 8px 10px; text-align: center; border-radius: 6px; }
        .stat-number { font-size: 16px; font-weight: 800; color: #111827; }
        .stat-label { font-size: 8px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-top: 2px; letter-spacing: 0.5px; }
        
        .section-header { display: flex; justify-content: space-between; align-items: center; margin: 12px 0 6px; border-bottom: 1.5px solid #e5e7eb; padding-bottom: 4px; }
        .section-title { font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 8.5px; }
        th, td { padding: 5px 6px; text-align: left; border: 1px solid #e5e7eb; vertical-align: middle; }
        th { background: #f3f4f6; font-weight: 700; color: #374151; font-size: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
        tr:nth-child(even) { background-color: #fafafa; }
        
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7.5px; font-weight: 700; text-transform: uppercase; text-align: center; }
        .badge-activa { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .badge-disponible { background: #e0f2fe; color: #075985; border: 1px solid #bae6fd; }
        .badge-baja { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        
        .tag-operadora { display: inline-block; background: #ede9fe; color: #5b21b6; padding: 1px 4px; border-radius: 3px; font-weight: 700; font-size: 7.5px; margin-right: 4px; }
        .tag-codigo { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-weight: 700; font-size: 8px; margin-right: 3px; }
        
        .footer { margin-top: 15px; padding-top: 8px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; color: #6b7280; font-size: 7.5px; }
        
        @media print {
          body { padding: 0; font-size: 8.5px; }
          .stat-card { border-color: #ccc; }
          th, td { border-color: #ccc; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo-title">ACTIVOS GREENFIELD</div>
          <div class="subtitle">Reporte de Inventario de Líneas Telefónicas, Planes y Asignación de IMEI</div>
        </div>
        <div class="meta-box">
          <div><strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" })}</div>
          <div><strong>Hora:</strong> ${new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${lineas.length}</div>
          <div class="stat-label">Total Líneas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: #166534;">${lineasActivas.length}</div>
          <div class="stat-label">Líneas Activas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: #0369a1;">${lineas.filter((l) => l.estado === "DISPONIBLE").length}</div>
          <div class="stat-label">Disponibles Stock</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${totalConEquipo} / ${totalSoloChip}</div>
          <div class="stat-label">Con Celular / Solo Chip</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: #059669;">Bs. ${costoTotalActivas.toFixed(2)}</div>
          <div class="stat-label">Costo Mensual Total</div>
        </div>
      </div>

      <div class="section-header">
        <div class="section-title">Detalle de Líneas y Equipos Vinculados (${lineas.length} registros)</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 3%; text-align: center;">#</th>
            <th style="width: 10%;">Número</th>
            <th style="width: 18%;">Colaborador Asignado</th>
            <th style="width: 15%;">Cargo / Departamento</th>
            <th style="width: 14%;">Plan & Operadora</th>
            <th style="width: 8%; text-align: right;">Tarifa (Bs.)</th>
            <th style="width: 15%;">Equipo Celular</th>
            <th style="width: 11%;">IMEI Asignado</th>
            <th style="width: 6%; text-align: center;">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${lineas
            .map(
              (l, idx) => `
            <tr>
              <td style="text-align: center; color: #6b7280; font-size: 8px;">${idx + 1}</td>
              <td style="font-family: monospace; font-weight: 700; font-size: 9.5px; color: #111827;">${l.numero}</td>
              <td>
                <strong style="color: #111827;">${l.personal_nombre || '<span style="color: #9ca3af; font-weight: normal;">Disponible en Stock</span>'}</strong>
              </td>
              <td>
                ${
                  l.personal_cargo || l.personal_departamento
                    ? `${l.personal_cargo || "Sin Cargo"} <span style="color: #6b7280;">(${l.personal_departamento || "S/D"})</span>`
                    : '<span style="color: #9ca3af;">N/A</span>'
                }
              </td>
              <td>
                <span class="tag-operadora">${l.telefonia_nombre || "N/A"}</span>
                <span style="font-weight: 600;">${l.plan_nombre || "N/A"}</span>
              </td>
              <td style="text-align: right; font-weight: 700; font-family: monospace; color: #059669;">
                Bs. ${parseFloat(String(l.plan_costo || 0)).toFixed(2)}
              </td>
              <td>
                ${
                  l.celular_codigo
                    ? `<div>
                        <span class="tag-codigo">${l.celular_codigo}</span>
                        <strong>${l.celular_modelo || l.celular_nombre || ""}</strong>
                        ${l.celular_marca ? `<div style="font-size: 7.5px; color: #6b7280;">Marca: ${l.celular_marca}</div>` : ""}
                       </div>`
                    : '<span style="color: #9ca3af; font-style: italic;">Solo Chip</span>'
                }
              </td>
              <td>${renderImei(l)}</td>
              <td style="text-align: center;">
                <span class="badge badge-${(l.estado || 'disponible').toLowerCase()}">
                  ${getNombreEstadoLinea(l.estado)}
                </span>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        <div><strong>Activos Greenfield</strong> — Módulo de Gestión y Control de Telefonía Móvil</div>
        <div>Documento de Control y Auditoría Interna</div>
        <div>Página 1 de 1</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 250);
        }
      </script>
    </body>
    </html>
  `);
  ventana.document.close();
};
