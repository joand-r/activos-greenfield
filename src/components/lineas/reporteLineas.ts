import { Linea, getNombreEstadoLinea } from "@/services/linea.service";

export const generarReporteLineas = (lineas: Linea[]) => {
  const ventana = window.open("", "_blank");
  if (!ventana) return;

  const lineasActivas = lineas.filter((l) => l.estado === "ACTIVA");
  const costoTotalActivas = lineasActivas.reduce(
    (acc, l) => acc + parseFloat(String(l.plan_costo || 0)),
    0
  );

  ventana.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte General - Líneas Telefónicas</title>
      <style>
        @page { size: letter landscape; margin: 1.2cm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 10px; line-height: 1.4; }
        .header { border-bottom: 3px solid #333; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
        .logo { font-size: 18px; font-weight: bold; color: #333; }
        .title { font-size: 14px; color: #555; margin-top: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 15px; }
        .stat-card { background: #f9f9f9; border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 4px; }
        .stat-number { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 4px; }
        .stat-label { font-size: 9px; color: #666; text-transform: uppercase; }
        .section-title { font-size: 12px; font-weight: bold; margin: 15px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px; }
        th, td { padding: 6px 8px; text-align: left; border: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: bold; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
        .badge-activa { background: #dcfce7; color: #15803d; }
        .badge-disponible { background: #e0f2fe; color: #0369a1; }
        .badge-baja { background: #fee2e2; color: #b91c1c; }
        .badge-suspendida { background: #fef3c7; color: #d97706; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 8px; }
        @media print { body { padding: 5px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">ACTIVOS GREENFIELD</div>
          <div class="title">Inventario y Control de Líneas Telefónicas Corporativas</div>
        </div>
        <div style="text-align: right; font-size: 9px; color: #666;">
          <div>Fecha: ${new Date().toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" })}</div>
          <div>Hora: ${new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${lineas.length}</div>
          <div class="stat-label">Total Líneas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${lineasActivas.length}</div>
          <div class="stat-label">Líneas Activas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${lineas.filter((l) => l.estado === "BAJA").length}</div>
          <div class="stat-label">Líneas de Baja</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">Bs. ${costoTotalActivas.toFixed(2)}</div>
          <div class="stat-label">Costo Mensual Total</div>
        </div>
      </div>

      <div class="section-title">Listado Completo de Líneas</div>
      <table>
        <thead>
          <tr>
            <th style="width: 12%;">Número</th>
            <th style="width: 22%;">Colaborador Asignado</th>
            <th style="width: 16%;">Departamento / Cargo</th>
            <th style="width: 10%;">Telefonía</th>
            <th style="width: 15%;">Plan Contratado</th>
            <th style="width: 10%; text-align: right;">Costo (Bs.)</th>
            <th style="width: 15%;">Equipo Asignado</th>
            <th style="width: 8%; text-align: center;">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${lineas
            .map(
              (l) => `
            <tr>
              <td style="font-family: monospace; font-weight: bold;">${l.numero}</td>
              <td>${l.personal_nombre || '<span style="color: #888;">Sin asignar</span>'}</td>
              <td>${l.personal_departamento ? l.personal_departamento + ' - ' + l.personal_cargo : 'N/A'}</td>
              <td style="font-weight: bold;">${l.telefonia_nombre || 'N/A'}</td>
              <td>${l.plan_nombre || 'N/A'}</td>
              <td style="text-align: right; font-weight: bold;">Bs. ${parseFloat(String(l.plan_costo || 0)).toFixed(2)}</td>
              <td>${l.celular_codigo ? `[${l.celular_codigo}] ${l.celular_modelo || l.celular_nombre || ''}` : 'Solo Chip'}</td>
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
        <p>Activos Greenfield - Sistema de Gestión de Líneas Telefónicas</p>
        <p>Documento confidencial para control administrativo interno</p>
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
