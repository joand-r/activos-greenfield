"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ConfirmModal";
import { 
  activoService, 
  TipoActivo, 
  EstadoActivo,
  TipoConstancia,
  getNombreTipoActivo, 
  getNombreEstadoActivo,
  getNombreTipoConstancia,
  esActivoSimple,
  requiereMarcaProveedor,
  Activo 
} from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
import { uploadService } from "@/services/upload.service";

const EditarActivoPage = () => {
  const router = useRouter();
  const params = useParams();
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [activoId, setActivoId] = useState<number | null>(null);
  const [cargandoActivo, setCargandoActivo] = useState(true);
  const [activoNoEncontrado, setActivoNoEncontrado] = useState(false);
  
  useEffect(() => {
    document.title = "Editar Activo | Activos Greenfield";
    
    // Obtener ID del parámetro de ruta
    const id = params.id;
    if (id && typeof id === 'string') {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        setActivoId(parsedId);
      } else {
        setActivoNoEncontrado(true);
        setCargandoActivo(false);
      }
    } else {
      setActivoNoEncontrado(true);
      setCargandoActivo(false);
    }
  }, [params]);

  // Estados para los selects
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  // Estado del formulario principal
  const [tipoActivo, setTipoActivo] = useState<TipoActivo | "">("");
  const [codigoActivo, setCodigoActivo] = useState<string>("");
  const [formData, setFormData] = useState({
    nombre: "",
    imagen: "",
    estado: "DISPONIBLE",
    descripcion: "",
    fecha_adquision: "",
    costo_adquision: "",
    tipo_constancia: "",
    nro_constancia: "",
    lugar_id: "",
    marca_id: "",
    proveedor_id: "",
  });

  // Estados para manejo de imagen
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [confirmCancelar, setConfirmCancelar] = useState(false);

  // Estados para campos específicos de cada tipo
  const [camposEquipoTecnologico, setCamposEquipoTecnologico] = useState({
    modelo: "",
    procesador: "",
    memoria: "",
    capacidad_disco: "",
  });

  const [camposMotorizado, setCamposMotorizado] = useState({
    tipo_vehiculo: "",
    motor: "",
    chasis: "",
    color: "",
    anho_modelo: "",
  });

  const [camposTerreno, setCamposTerreno] = useState({
    folio: "",
    nro_registro: "",
    area: "",
    ubicacion: "",
  });

  // Cargar el activo existente
  useEffect(() => {
    if (activoId) {
      cargarActivo(activoId);
      cargarDatosSelects();
    }
  }, [activoId]);

  const cargarActivo = async (id: number) => {
    setCargandoActivo(true);
    try {
      const activo = await activoService.getById(id);
      
      // Pre-llenar datos básicos
      setTipoActivo(activo.tipo_activo);
      setCodigoActivo(activo.codigo);
      setFormData({
        nombre: activo.nombre || "",
        imagen: activo.imagen || "",
        estado: activo.estado || "DISPONIBLE",
        descripcion: activo.descripcion || "",
        fecha_adquision: activo.fecha_adquision || "",
        costo_adquision: activo.costo_adquision?.toString() || "",
        tipo_constancia: activo.tipo_constancia || "",
        nro_constancia: activo.nro_constancia || "",
        lugar_id: activo.lugar_id?.toString() || "",
        marca_id: activo.marca_id?.toString() || "",
        proveedor_id: activo.proveedor_id?.toString() || "",
      });

      // Pre-cargar imagen si existe
      if (activo.imagen) {
        setImagenPreview(activo.imagen);
      }

      // Pre-llenar datos específicos según el tipo
      if (activo.datos_especificos) {
        if (activo.tipo_activo === 'EQUIPO_TECNOLOGICO') {
          const datos = activo.datos_especificos as any;
          setCamposEquipoTecnologico({
            modelo: datos.modelo || "",
            procesador: datos.procesador || "",
            memoria: datos.memoria || "",
            capacidad_disco: datos.capacidad_disco || "",
          });
        } else if (activo.tipo_activo === 'VEHICULO' || activo.tipo_activo === 'MAQUINARIA') {
          const datos = activo.datos_especificos as any;
          setCamposMotorizado({
            tipo_vehiculo: datos.tipo_vehiculo || "",
            motor: datos.motor || "",
            chasis: datos.chasis || "",
            color: datos.color || "",
            anho_modelo: datos.anho_modelo?.toString() || "",
          });
        } else if (activo.tipo_activo === 'TERRENO') {
          const datos = activo.datos_especificos as any;
          setCamposTerreno({
            folio: datos.folio || "",
            nro_registro: datos.nro_registro || "",
            area: datos.area?.toString() || "",
            ubicacion: datos.ubicacion || "",
          });
        }
      }

      setCargandoActivo(false);
    } catch (error: any) {
      console.error("Error al cargar activo:", error);
      setCargandoActivo(false);
      setActivoNoEncontrado(true);
      toast.error('Error al cargar', 'No se pudo cargar el activo');
    }
  };

  const cargarDatosSelects = async () => {
    try {
      const [lugaresData, marcasData, proveedoresData] = await Promise.all([
        lugarService.getAll(),
        marcaService.getAll(),
        proveedorService.getAll(),
      ]);
      setLugares(lugaresData || []);
      setMarcas(marcasData || []);
      setProveedores(proveedoresData || []);
    } catch (error: any) {
      console.error("Error al cargar datos:", error);
      toast.error('Error al cargar', 'No se pudieron cargar los datos necesarios');
      setLugares([]);
      setMarcas([]);
      setProveedores([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Archivo inválido', 'Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', 'La imagen no debe superar los 5MB');
      return;
    }

    setImagenArchivo(file);

    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    setSubiendoImagen(true);
    try {
      const base64 = await convertToBase64(file);
      const result = await uploadService.uploadImage(base64 as string, 'activos-greenfield/activos');
      
      // Guardar la URL en el formulario
      setFormData(prev => ({
        ...prev,
        imagen: result.url
      }));
      
      toast.success('Imagen subida', 'La imagen se ha subido correctamente');
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      toast.error('Error al subir', error.message || 'No se pudo subir la imagen');
      setImagenArchivo(null);
      setImagenPreview('');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const eliminarImagen = () => {
    setImagenArchivo(null);
    setImagenPreview('');
    setFormData(prev => ({
      ...prev,
      imagen: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!tipoActivo) {
      toast.error('Campo requerido', 'Debe seleccionar un tipo de activo');
      return;
    }

    if (!activoId) {
      toast.error('Error', 'No se pudo identificar el activo a actualizar');
      return;
    }

    showLoading();
    
    try {
      // Preparar datos específicos según el tipo
      let datos_especificos: any = null;

      if (tipoActivo === 'EQUIPO_TECNOLOGICO') {
        datos_especificos = {
          modelo: camposEquipoTecnologico.modelo || null,
          procesador: camposEquipoTecnologico.procesador || null,
          memoria: camposEquipoTecnologico.memoria || null,
          capacidad_disco: camposEquipoTecnologico.capacidad_disco || null,
        };
      } else if (tipoActivo === 'VEHICULO' || tipoActivo === 'MAQUINARIA') {
        datos_especificos = {
          tipo_vehiculo: camposMotorizado.tipo_vehiculo || null,
          motor: camposMotorizado.motor || null,
          chasis: camposMotorizado.chasis || null,
          color: camposMotorizado.color || null,
          anho_modelo: camposMotorizado.anho_modelo ? parseInt(camposMotorizado.anho_modelo) : null,
        };
      } else if (tipoActivo === 'TERRENO') {
        datos_especificos = {
          folio: camposTerreno.folio || null,
          nro_registro: camposTerreno.nro_registro || null,
          area: camposTerreno.area ? parseFloat(camposTerreno.area) : null,
          ubicacion: camposTerreno.ubicacion || null,
        };
      }

      const dataToSend = {
        nombre: formData.nombre,
        tipo_activo: tipoActivo,
        imagen: formData.imagen || undefined,
        estado: (formData.estado as EstadoActivo) || undefined,
        descripcion: formData.descripcion || undefined,
        fecha_adquision: formData.fecha_adquision || undefined,
        costo_adquision: formData.costo_adquision ? parseFloat(formData.costo_adquision) : undefined,
        tipo_constancia: formData.tipo_constancia || undefined,
        nro_constancia: formData.nro_constancia || undefined,
        lugar_id: parseInt(formData.lugar_id),
        marca_id: formData.marca_id ? parseInt(formData.marca_id) : undefined,
        proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : undefined,
        datos_especificos: datos_especificos,
      };

      await activoService.update(activoId, dataToSend);
      
      hideLoading();
      toast.success('Activo actualizado', 'El activo ha sido actualizado exitosamente');
      
      // Redirigir a la lista
      setTimeout(() => {
        router.push('/admin/activos/lista');
      }, 1500);
      
    } catch (error: any) {
      console.error("Error al actualizar activo:", error);
      hideLoading();
      toast.error('Error al actualizar', error.message || 'No se pudo actualizar el activo');
    }
  };

  const tiposActivos: TipoActivo[] = [
    'EDIFICACION',
    'ELECTRODOMESTICO',
    'EQUIPO_CAMPO',
    'HERRAMIENTA',
    'MUEBLE_ENSER',
    'UTENSILIO_EQUIPAMIENTO',
    'EQUIPO_TECNOLOGICO',
    'VEHICULO',
    'MAQUINARIA',
    'TERRENO',
  ];

  const mostrarMarcaProveedor = tipoActivo && requiereMarcaProveedor(tipoActivo as TipoActivo);
  const esSimple = tipoActivo && esActivoSimple(tipoActivo as TipoActivo);

  // Si el activo no fue encontrado
  if (activoNoEncontrado) {
    return (
      <>
        <Breadcrumb
          pageName="Error"
          description="Activo no encontrado"
        />
        <section className="pb-[120px] pt-[120px]">
          <div className="container">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-8 text-center">
                <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
                  Activo no encontrado
                </h2>
                <p className="mb-6 text-body-color dark:text-body-color-dark">
                  El activo que intentas editar no existe o no se pudo cargar.
                </p>
                <button
                  onClick={() => router.push('/admin/activos/lista')}
                  className="rounded-sm bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                >
                  Volver a la lista
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Mostrar loading mientras carga el activo
  if (cargandoActivo) {
    return (
      <>
        <Breadcrumb
          pageName="Editar Activo"
          description="Cargando datos del activo..."
        />
        <section className="pb-[120px] pt-[120px]">
          <div className="container">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-pulse">
                <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-4 text-lg text-body-color dark:text-body-color-dark">
                Cargando activo...
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Editar Activo"
        description="Actualiza la información del activo"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-10/12 xl:w-9/12">
              <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white p-8 sm:p-12">
                <h2 className="mb-8 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                  Editar Activo
                </h2>

                <form onSubmit={handleSubmit}>
                  {/* SECCIÓN 1: TIPO DE ACTIVO Y CÓDIGO */}
                  <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                      1. Tipo de Activo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="tipo_activo"
                          className="mb-3 block text-sm font-medium text-dark dark:text-white"
                        >
                          Tipo de Activo <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="tipo_activo"
                          value={tipoActivo}
                          disabled
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-gray-100 px-6 py-3 text-base text-body-color outline-none dark:border-transparent dark:bg-gray-700 cursor-not-allowed opacity-75"
                        >
                          <option value={tipoActivo}>{getNombreTipoActivo(tipoActivo as TipoActivo)}</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          El tipo de activo no puede ser modificado
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="codigo"
                          className="mb-3 block text-sm font-medium text-dark dark:text-white"
                        >
                          Código del Activo
                        </label>
                        <input
                          type="text"
                          id="codigo"
                          value={codigoActivo}
                          readOnly
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-gray-100 px-6 py-3 text-base text-body-color outline-none dark:border-transparent dark:bg-gray-700 cursor-not-allowed opacity-75"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          El código es generado automáticamente y no puede ser modificado
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: CAMPOS COMUNES */}
                  {tipoActivo && (
                    <>
                      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                          2. Información Básica
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nombre */}
                          <div>
                            <label
                              htmlFor="nombre"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Nombre del Activo <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="nombre"
                              id="nombre"
                              value={formData.nombre}
                              onChange={handleChange}
                              placeholder="Ej: Laptop Dell Inspiron"
                              required
                              className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                            />
                          </div>

                          {/* Estado */}
                          <div>
                            <label
                              htmlFor="estado"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Estado
                            </label>
                            <select
                              name="estado"
                              id="estado"
                              value={formData.estado}
                              onChange={handleChange}
                              className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                            >
                              <option value="NUEVO">{getNombreEstadoActivo('NUEVO')}</option>
                              <option value="USADO">{getNombreEstadoActivo('USADO')}</option>
                              <option value="DISPONIBLE">{getNombreEstadoActivo('DISPONIBLE')}</option>
                              <option value="DANADO">{getNombreEstadoActivo('DANADO')}</option>
                              <option value="DONADO">{getNombreEstadoActivo('DONADO')}</option>
                              <option value="VENDIDO">{getNombreEstadoActivo('VENDIDO')}</option>
                              <option value="TRANSFERIR">{getNombreEstadoActivo('TRANSFERIR')}</option>
                            </select>
                          </div>

                          {/* Lugar */}
                          <div>
                            <label
                              htmlFor="lugar_id"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Lugar <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="lugar_id"
                              id="lugar_id"
                              value={formData.lugar_id}
                              onChange={handleChange}
                              required
                              className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                            >
                              <option value="">-- Seleccione un lugar --</option>
                              {(lugares || []).map((lugar) => (
                                <option key={lugar.id} value={lugar.id}>
                                  {lugar.nombre} ({lugar.inicial})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Marca (solo si aplica) */}
                          {mostrarMarcaProveedor && (
                            <div>
                              <label
                                htmlFor="marca_id"
                                className="mb-3 block text-sm font-medium text-dark dark:text-white"
                              >
                                Marca
                              </label>
                              <select
                                name="marca_id"
                                id="marca_id"
                                value={formData.marca_id}
                                onChange={handleChange}
                                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                              >
                                <option value="">-- Seleccione una marca --</option>
                                {(marcas || []).map((marca) => (
                                  <option key={marca.id} value={marca.id}>
                                    {marca.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Proveedor (solo si aplica) */}
                          {mostrarMarcaProveedor && (
                            <div>
                              <label
                                htmlFor="proveedor_id"
                                className="mb-3 block text-sm font-medium text-dark dark:text-white"
                              >
                                Proveedor
                              </label>
                              <select
                                name="proveedor_id"
                                id="proveedor_id"
                                value={formData.proveedor_id}
                                onChange={handleChange}
                                className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                              >
                                <option value="">-- Seleccione un proveedor --</option>
                                {(proveedores || []).map((proveedor) => (
                                  <option key={proveedor.id} value={proveedor.id}>
                                    {proveedor.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Fecha de Adquisición */}
                          <div>
                            <label
                              htmlFor="fecha_adquision"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Fecha de Adquisición
                            </label>
                            <input
                              type="date"
                              name="fecha_adquision"
                              id="fecha_adquision"
                              value={formData.fecha_adquision}
                              onChange={handleChange}
                              className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                            />
                          </div>

                          {/* Costo de Adquisición */}
                          <div>
                            <label
                              htmlFor="costo_adquision"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Costo de Adquisición (Bs.)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              name="costo_adquision"
                              id="costo_adquision"
                              value={formData.costo_adquision}
                              onChange={handleChange}
                              placeholder="0.00"
                              className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                            />
                          </div>

                          {/* Imagen */}
                          <div className="md:col-span-2">
                            <label
                              htmlFor="imagen"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Imagen del Activo
                            </label>
                            
                            {!imagenPreview ? (
                              <div className="flex flex-col items-center justify-center w-full">
                                <label
                                  htmlFor="imagen-upload"
                                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {subiendoImagen ? (
                                      <>
                                        <svg className="w-10 h-10 mb-3 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Subiendo imagen...</p>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                          <span className="font-semibold">Click para subir</span> o arrastra la imagen
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG (MAX. 5MB)</p>
                                      </>
                                    )}
                                  </div>
                                  <input
                                    id="imagen-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImagenChange}
                                    disabled={subiendoImagen}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={imagenPreview}
                                  alt="Preview"
                                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  type="button"
                                  onClick={eliminarImagen}
                                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
                                  title="Eliminar imagen"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  ✓ Imagen cargada
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Descripción */}
                          <div className="md:col-span-2">
                            <label
                              htmlFor="descripcion"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Descripción
                            </label>
                            <textarea
                              name="descripcion"
                              id="descripcion"
                              rows={3}
                              value={formData.descripcion}
                              onChange={handleChange}
                              placeholder="Describe el activo..."
                              className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                            />
                          </div>

                          {/* Constancias */}
                          <div>
                            <label
                              htmlFor="tipo_constancia"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Tipo de Constancia
                            </label>
                            <select
                              name="tipo_constancia"
                              id="tipo_constancia"
                              value={formData.tipo_constancia}
                              onChange={handleChange}
                              className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                            >
                              <option value="">Seleccionar...</option>
                              <option value="FACTURA">Factura</option>
                              <option value="PROFORMA">Proforma</option>
                              <option value="RECIBO">Recibo</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="nro_constancia"
                              className="mb-3 block text-sm font-medium text-dark dark:text-white"
                            >
                              Número de Constancia
                            </label>
                            <input
                              type="text"
                              name="nro_constancia"
                              id="nro_constancia"
                              value={formData.nro_constancia}
                              onChange={handleChange}
                              placeholder="Ej: 001-001234"
                              className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECCIÓN 3: CAMPOS ESPECÍFICOS */}
                      {!esSimple && (
                        <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                            3. Información Específica - {getNombreTipoActivo(tipoActivo as TipoActivo)}
                          </h3>

                          {/* Campos para EQUIPO_TECNOLOGICO */}
                          {tipoActivo === 'EQUIPO_TECNOLOGICO' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Modelo
                                </label>
                                <input
                                  type="text"
                                  value={camposEquipoTecnologico.modelo}
                                  onChange={(e) => setCamposEquipoTecnologico({...camposEquipoTecnologico, modelo: e.target.value})}
                                  placeholder="Ej: Inspiron 15"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Procesador
                                </label>
                                <input
                                  type="text"
                                  value={camposEquipoTecnologico.procesador}
                                  onChange={(e) => setCamposEquipoTecnologico({...camposEquipoTecnologico, procesador: e.target.value})}
                                  placeholder="Ej: Intel Core i5"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Memoria (RAM)
                                </label>
                                <input
                                  type="text"
                                  value={camposEquipoTecnologico.memoria}
                                  onChange={(e) => setCamposEquipoTecnologico({...camposEquipoTecnologico, memoria: e.target.value})}
                                  placeholder="Ej: 8GB DDR4"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Capacidad de Disco
                                </label>
                                <input
                                  type="text"
                                  value={camposEquipoTecnologico.capacidad_disco}
                                  onChange={(e) => setCamposEquipoTecnologico({...camposEquipoTecnologico, capacidad_disco: e.target.value})}
                                  placeholder="Ej: 512GB SSD"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* Campos para VEHICULO y MAQUINARIA */}
                          {(tipoActivo === 'VEHICULO' || tipoActivo === 'MAQUINARIA') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Tipo de Vehículo
                                </label>
                                <input
                                  type="text"
                                  value={camposMotorizado.tipo_vehiculo}
                                  onChange={(e) => setCamposMotorizado({...camposMotorizado, tipo_vehiculo: e.target.value})}
                                  placeholder="Ej: Camioneta, Sedan"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Motor
                                </label>
                                <input
                                  type="text"
                                  value={camposMotorizado.motor}
                                  onChange={(e) => setCamposMotorizado({...camposMotorizado, motor: e.target.value})}
                                  placeholder="Ej: XYZ123456"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Chasis
                                </label>
                                <input
                                  type="text"
                                  value={camposMotorizado.chasis}
                                  onChange={(e) => setCamposMotorizado({...camposMotorizado, chasis: e.target.value})}
                                  placeholder="Ej: ABC789012"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Color
                                </label>
                                <input
                                  type="text"
                                  value={camposMotorizado.color}
                                  onChange={(e) => setCamposMotorizado({...camposMotorizado, color: e.target.value})}
                                  placeholder="Ej: Rojo"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Año del Modelo
                                </label>
                                <input
                                  type="number"
                                  value={camposMotorizado.anho_modelo}
                                  onChange={(e) => setCamposMotorizado({...camposMotorizado, anho_modelo: e.target.value})}
                                  placeholder="Ej: 2023"
                                  min="1900"
                                  max="2100"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* Campos para TERRENO */}
                          {tipoActivo === 'TERRENO' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Folio
                                </label>
                                <input
                                  type="text"
                                  value={camposTerreno.folio}
                                  onChange={(e) => setCamposTerreno({...camposTerreno, folio: e.target.value})}
                                  placeholder="Ej: F-001"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Número de Registro
                                </label>
                                <input
                                  type="text"
                                  value={camposTerreno.nro_registro}
                                  onChange={(e) => setCamposTerreno({...camposTerreno, nro_registro: e.target.value})}
                                  placeholder="Ej: REG-123456"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div>
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Área (m²)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={camposTerreno.area}
                                  onChange={(e) => setCamposTerreno({...camposTerreno, area: e.target.value})}
                                  placeholder="Ej: 1000.50"
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                                  Ubicación Detallada
                                </label>
                                <textarea
                                  rows={3}
                                  value={camposTerreno.ubicacion}
                                  onChange={(e) => setCamposTerreno({...camposTerreno, ubicacion: e.target.value})}
                                  placeholder="Descripción detallada de la ubicación del terreno..."
                                  className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botones */}
                      <div className="flex flex-wrap gap-4">
                        <button
                          type="submit"
                          className="rounded-sm bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                        >
                          Actualizar Activo
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancelar(true)}
                          className="rounded-sm bg-gray-300 px-9 py-4 text-base font-medium text-dark shadow-submit duration-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </form>

                <div className="mt-8 rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    <strong>Nota:</strong> Los campos marcados con{" "}
                    <span className="text-red-500">*</span> son obligatorios.
                    {tipoActivo === 'TERRENO' && (
                      <span className="block mt-2">
                        <strong>Terrenos:</strong> No requieren marca ni proveedor.
                      </span>
                    )}
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
        message="Tienes cambios sin guardar. ¿Estás seguro de que deseas cancelar? Se perderán todos los cambios realizados."
        confirmText="Sí, cancelar"
        cancelText="Seguir editando"
        confirmVariant="warning"
        onConfirm={() => router.push('/admin/activos/lista')}
        onCancel={() => setConfirmCancelar(false)}
      />
    </>
  );
};

export default EditarActivoPage;
