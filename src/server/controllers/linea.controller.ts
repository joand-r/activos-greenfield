/**
 * Linea controller - Re-exports from modular controllers under ./linea/
 * 
 * Sub-controllers:
 * - linea.crud.controller.ts: CRUD operations (obtenerLineas, obtenerLineaPorId, crearLinea, actualizarLinea, eliminarLinea)
 * - linea.acciones.controller.ts: Specific business actions (transferirLinea, cambiarPlanLinea, cambiarEquipoLinea, darDeBajaLinea)
 * - linea.historial.controller.ts: History tracking and metrics (obtenerHistorialLinea, obtenerEstadisticas)
 * - linea.celulares.controller.ts: Cell phones management (obtenerCelularesLineas, obtenerCelularPorId, actualizarEstadoCelular, darDeBajaCelular)
 */

export * from './linea';
