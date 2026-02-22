"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { useToast } from "@/contexts/ToastContext";
import { movimientoService } from "@/services/movimiento.service";
import { activoService, Activo } from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import ConfirmModal from "@/components/ConfirmModal";

const RegistrarMovimientoPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  const router = useRouter();
  
  const [activos, setActivos] = useState<Activo[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);

  useEffect(() => {
    document.title = "Registro de Movimiento | Activos Greenfield";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const [activosData, lugaresData] = await Promise.all([
        activoService.getAll(),
        lugarService.getAll()
      ]);
      setActivos(activosData);
      setLugares(lugaresData);
    } catch (error: any) {
      console.error("Error al cargar datos:", error);
      toast.error('Error al cargar', 'No se pudieron cargar los datos necesarios');
    } finally {
      setCargando(false);
      hideLoading();
    }
  };

  const [formData, setFormData] = useState({
    activo_id: "",
    lugar_origen_id: "",
    lugar_destino_id: "",
    fecha_movimiento: new Date().toISOString().split('T')[0],
    responsable: "",
    observaciones: "",
    estado: "DISPONIBLE",
  });

  const [error, setError] = useState("");
  const [confirmCancelar, setConfirmCancelar] = useState(false);

  // Estados que dan de baja al activo y no requieren lugar destino
  const ESTADOS_BAJA_SIN_DESTINO = ['VENDIDO', 'DONADO', 'DANADO'];
  const requiereDestino = !ESTADOS_BAJA_SIN_DESTINO.includes(formData.estado);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Auto-fill lugar_origen from selected activo
    if (name === 'activo_id') {
      if (value) {
        const activoElegido = activos.find(a => String(a.id) === String(value));
        console.log('[movimiento] activo_id cambió a:', value, '| activos cargados:', activos.length, '| encontrado:', activoElegido?.codigo);
        setActivoSeleccionado(activoElegido ?? null);
        setFormData(prev => ({
          ...prev,
          activo_id: value,
          lugar_origen_id: activoElegido?.lugar_id ? String(activoElegido.lugar_id) : '',
        }));
      } else {
        setActivoSeleccionado(null);
        setFormData(prev => ({ ...prev, activo_id: '', lugar_origen_id: '' }));
      }
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError("");

    // Validaciones
    if (!formData.activo_id) {
      setError("Debe seleccionar un activo");
      return;
    }

    if (!formData.lugar_origen_id) {
      setError("Debe seleccionar un lugar de origen");
      return;
    }

    if (requiereDestino && !formData.lugar_destino_id) {
      setError("Debe seleccionar un lugar de destino");
      return;
    }

    if (requiereDestino && formData.lugar_origen_id === formData.lugar_destino_id) {
      setError("El lugar de origen y destino no pueden ser el mismo");
      return;
    }

    if (!formData.responsable.trim()) {
      setError("Debe ingresar el nombre del responsable");
      return;
    }

    showLoading();
    
    try {
      const dataToSend = {
        activo_id: parseInt(formData.activo_id),
        lugar_origen_id: parseInt(formData.lugar_origen_id),
        ...(requiereDestino && formData.lugar_destino_id
          ? { lugar_destino_id: parseInt(formData.lugar_destino_id) }
          : {}),
        fecha_movimiento: formData.fecha_movimiento,
        responsable: formData.responsable,
        observaciones: formData.observaciones || undefined,
        estado: formData.estado,
      };

      const nuevoMovimiento = await movimientoService.create(dataToSend);
      
      hideLoading();
      toast.success('Movimiento registrado', `El movimiento ${nuevoMovimiento.codigo_movimiento} ha sido registrado exitosamente`);
      
      // Redirigir a la lista después de un breve delay
      setTimeout(() => {
        router.push('/admin/movimientos/lista');
      }, 1500);
      
    } catch (error: any) {
      console.error("Error al registrar movimiento:", error);
      setError(error.message || "Error al registrar el movimiento");
      hideLoading();
      toast.error('Error al registrar', error.message || 'No se pudo registrar el movimiento');
    }
  };

  const handleCancelar = () => {
    setConfirmCancelar(true);
  };

  if (cargando) {
    return (
      <>
        <Breadcrumb
          pageName="Registro de Movimiento"
          description="Registra un nuevo movimiento de activo"
        />
        <section className="pb-[120px] pt-[120px]">
          <div className="container">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Registro de Movimiento"
        description="Registra un nuevo movimiento de activo"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-10/12 xl:w-8/12">
              <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white p-8 sm:p-12">
                <h2 className="mb-8 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                  Registrar Nuevo Movimiento
                </h2>

                {error && (
                  <div className="mb-6 rounded-sm bg-red-100 dark:bg-red-900/30 px-4 py-3">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* Selector de Activo — ancho completo */}
                    <div className="md:col-span-2">
                      <label htmlFor="activo_id" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Activo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="activo_id"
                        id="activo_id"
                        value={formData.activo_id}
                        onChange={handleChange}
                        required
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      >
                        <option value="">Seleccione un activo...</option>
                        {(activos || []).map((activo) => (
                          <option key={activo.id} value={activo.id}>
                            {activo.codigo} — {activo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tarjeta info del activo seleccionado */}
                    {activoSeleccionado && (
                      <div className="md:col-span-2 rounded-lg border-2 border-primary/40 dark:border-emerald-500/40 bg-primary/5 dark:bg-emerald-950/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary dark:text-emerald-400 mb-3">Activo seleccionado</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Código</p>
                            <p className="text-sm font-mono font-bold text-black dark:text-white mt-0.5">{activoSeleccionado.codigo}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nombre</p>
                            <p className="text-sm font-medium text-black dark:text-white mt-0.5">{activoSeleccionado.nombre}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Estado actual</p>
                            <p className="text-sm font-medium text-black dark:text-white mt-0.5">{activoSeleccionado.estado || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Lugar actual</p>
                            <p className="text-sm font-bold text-primary dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {activoSeleccionado.lugar_nombre || 'Sin lugar asignado'}
                            </p>
                          </div>
                        </div>
                        {formData.estado === 'TRANSFERIR' && (
                          <p className="mt-3 text-xs text-primary dark:text-emerald-400/80 border-t border-primary/20 dark:border-emerald-500/20 pt-2">
                            Al transferir, se generará un nuevo activo con nuevo código en el lugar de destino. El código <strong>{activoSeleccionado.codigo}</strong> quedará en el historial de Transferidos.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Estado del movimiento */}
                    <div>
                      <label htmlFor="estado" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Estado tras el movimiento <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="estado"
                        id="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      >
                        <option value="NUEVO">Nuevo</option>
                        <option value="USADO">Usado</option>
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="DANADO">Dañado — Dar de baja</option>
                        <option value="DONADO">Donado — Dar de baja</option>
                        <option value="VENDIDO">Vendido — Dar de baja</option>
                        <option value="TRANSFERIR">Transferir a otro lugar (genera nuevo código)</option>
                      </select>
                    </div>

                    {/* Lugar Origen — solo lectura, obtenido del activo */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Lugar de Origen
                      </label>
                      {activoSeleccionado ? (
                        <div className="w-full rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 px-6 py-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {activoSeleccionado.lugar_nombre || 'Sin lugar asignado'}
                          </span>
                          <span className="ml-auto text-xs text-gray-400">automático</span>
                        </div>
                      ) : (
                        <div className="w-full rounded-sm border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-6 py-3">
                          <p className="text-sm text-gray-400 dark:text-gray-500 italic">Seleccione primero un activo</p>
                        </div>
                      )}
                      {/* campo oculto para enviar el valor */}
                      <input type="hidden" name="lugar_origen_id" value={formData.lugar_origen_id} />
                    </div>

                    {/* Banner de baja */}
                    {ESTADOS_BAJA_SIN_DESTINO.includes(formData.estado) && (
                      <div className="md:col-span-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 px-4 py-3 flex items-start gap-3">
                        <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                            {formData.estado === 'VENDIDO' && 'El activo será dado de baja por venta'}
                            {formData.estado === 'DONADO' && 'El activo será dado de baja por donación'}
                            {formData.estado === 'DANADO' && 'El activo será dado de baja por daño'}
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
                            No requiere lugar de destino. El activo quedará fuera de servicio y aparecerá en &ldquo;Dados de baja&rdquo;.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Lugar Destino — solo si aplica */}
                    {requiereDestino ? (
                      <div className={formData.estado === 'TRANSFERIR' ? 'md:col-span-2' : ''}>
                        <label htmlFor="lugar_destino_id" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Lugar de Destino <span className="text-red-500">*</span>
                          {formData.estado === 'TRANSFERIR' && (
                            <span className="ml-2 text-xs font-normal text-primary">(el activo recibirá un nuevo código al llegar aquí)</span>
                          )}
                        </label>
                        <select
                          name="lugar_destino_id"
                          id="lugar_destino_id"
                          value={formData.lugar_destino_id}
                          onChange={handleChange}
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        >
                          <option value="">Seleccione lugar de destino</option>
                          {(lugares || []).filter(l => l.id.toString() !== formData.lugar_origen_id).map((lugar) => (
                            <option key={lugar.id} value={lugar.id}>
                              {lugar.inicial} - {lugar.nombre} {lugar.tipo ? `(${lugar.tipo})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-sm bg-gray-100 dark:bg-gray-800 px-4 py-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lugar de destino no aplica para este estado</p>
                      </div>
                    )}

                    {/* Campo Fecha */}
                    <div>
                      <label
                        htmlFor="fecha_movimiento"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Fecha del Movimiento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="fecha_movimiento"
                        id="fecha_movimiento"
                        value={formData.fecha_movimiento}
                        onChange={handleChange}
                        required
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>

                    {/* Campo Responsable */}
                    <div>
                      <label
                        htmlFor="responsable"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Responsable del Movimiento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="responsable"
                        id="responsable"
                        value={formData.responsable}
                        onChange={handleChange}
                        placeholder="Ej: Juan Pérez"
                        required
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  {/* Campo Observaciones */}
                  <div className="mt-6">
                    <label
                      htmlFor="observaciones"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      Observaciones (Opcional)
                    </label>
                    <textarea
                      name="observaciones"
                      id="observaciones"
                      rows={4}
                      value={formData.observaciones}
                      onChange={handleChange}
                      placeholder="Ingrese observaciones adicionales sobre el movimiento..."
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 mt-8">
                    <button
                      type="submit"
                      className="rounded-sm bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                    >
                      Registrar Movimiento
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelar}
                      className="rounded-sm bg-gray-300 px-9 py-4 text-base font-medium text-dark shadow-submit duration-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>

                <div className="mt-8 rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    <strong>Nota:</strong> Los campos marcados con{" "}
                    <span className="text-red-500">*</span> son obligatorios. Los movimientos registrados no pueden ser editados ni eliminados debido a políticas de auditoría.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={confirmCancelar}
        title="¿Descartar cambios?"
        message="Tienes datos sin guardar. ¿Estás seguro de que deseas cancelar el registro del movimiento?"
        confirmText="Sí, cancelar"
        cancelText="Seguir registrando"
        confirmVariant="warning"
        onConfirm={() => router.push('/admin/movimientos/lista')}
        onCancel={() => setConfirmCancelar(false)}
      />
    </>
  );
};

export default RegistrarMovimientoPage;
