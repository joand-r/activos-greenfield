"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { useToast } from "@/contexts/ToastContext";
import {
  activoService,
  TipoActivo,
  ClasificacionActivo,
  EstadoActivo,
  esActivoSimple,
  requiereMarcaProveedor,
} from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
import { uploadService } from "@/services/upload.service";
import {
  TipoClasificacionSection,
  InformacionBasicaSection,
  CamposEspecificosSection,
} from "@/components/activos";

const RegistrarActivoPage = () => {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  useEffect(() => {
    document.title = "Registro de Activo | Activos Greenfield";
    cargarDatosSelects();
  }, []);

  // Estados para selects
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  // Estado código correlativo próximo
  const [codigoProximo, setCodigoProximo] = useState<string>("");
  const [cargandoCodigo, setCargandoCodigo] = useState(false);

  // Estado del formulario principal
  const [tipoActivo, setTipoActivo] = useState<TipoActivo | "">("");
  const [clasificacion, setClasificacion] = useState<ClasificacionActivo>("FIJO");
  const [formData, setFormData] = useState({
    nombre: "",
    serie: "",
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
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Estados para campos específicos
  const [camposEquipoTecnologico, setCamposEquipoTecnologico] = useState({
    modelo: "",
    procesador: "",
    memoria: "",
    capacidad_disco: "",
  });

  const [camposCelular, setCamposCelular] = useState({
    modelo: "",
    procesador: "",
    memoria: "",
    capacidad_disco: "",
    imei_1: "",
    imei_2: "",
  });

  const [camposMotorizado, setCamposMotorizado] = useState({
    tipo_vehiculo: "",
    motor: "",
    chasis: "",
    color: "",
    anho_modelo: "",
    placa: "",
  });

  const [camposTerreno, setCamposTerreno] = useState({
    folio: "",
    nro_registro: "",
    area: "",
    ubicacion: "",
  });

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
      toast.error("Error al cargar", "No se pudieron cargar los datos necesarios");
      setLugares([]);
      setMarcas([]);
      setProveedores([]);
    }
  };

  const cargarCodigoProximo = async (lugarId: string) => {
    if (!lugarId) {
      setCodigoProximo("");
      return;
    }

    setCargandoCodigo(true);
    try {
      const codigo = await activoService.getProximoCodigo(parseInt(lugarId));
      setCodigoProximo(codigo);
    } catch (error: any) {
      console.error("Error al cargar código próximo:", error);
      setCodigoProximo("");
    } finally {
      setCargandoCodigo(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "lugar_id") {
      cargarCodigoProximo(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTipo = e.target.value as TipoActivo | "";
    setTipoActivo(nuevoTipo);

    if (nuevoTipo === "TERRENO") {
      setFormData((prev) => ({
        ...prev,
        marca_id: "",
        proveedor_id: "",
      }));
    }
  };

  const handleImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Archivo inválido", "Por favor selecciona una imagen válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Archivo muy grande", "La imagen no debe superar los 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSubiendoImagen(true);
    try {
      const { compressImage } = await import("@/lib/image");
      const base64 = await compressImage(file);
      const result = await uploadService.uploadImage(base64, "activos-greenfield/activos");

      setFormData((prev) => ({
        ...prev,
        imagen: result.url,
      }));

      toast.success("Imagen subida", "La imagen se ha subido correctamente");
    } catch (error: any) {
      console.error("Error al subir imagen:", error);
      toast.error("Error al subir", error.message || "No se pudo subir la imagen");
      setImagenPreview("");
    } finally {
      setSubiendoImagen(false);
    }
  };

  const eliminarImagen = () => {
    setImagenPreview("");
    setFormData((prev) => ({
      ...prev,
      imagen: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tipoActivo) {
      toast.error("Campo requerido", "Debe seleccionar un tipo de activo");
      return;
    }

    if (subiendoImagen) {
      toast.error("Espera", "La imagen aún se está subiendo, por favor espera");
      return;
    }

    showLoading();

    try {
      let datos_especificos: any = null;

      if (tipoActivo === "EQUIPO_TECNOLOGICO") {
        datos_especificos = {
          modelo: camposEquipoTecnologico.modelo || null,
          procesador: camposEquipoTecnologico.procesador || null,
          memoria: camposEquipoTecnologico.memoria || null,
          capacidad_disco: camposEquipoTecnologico.capacidad_disco || null,
        };
      } else if (tipoActivo === "CELULAR") {
        datos_especificos = {
          modelo: camposCelular.modelo || null,
          procesador: camposCelular.procesador || null,
          memoria: camposCelular.memoria || null,
          capacidad_disco: camposCelular.capacidad_disco || null,
          imei_1: camposCelular.imei_1 || null,
          imei_2: camposCelular.imei_2 || null,
        };
      } else if (tipoActivo === "VEHICULO" || tipoActivo === "MAQUINARIA") {
        datos_especificos = {
          tipo_vehiculo: camposMotorizado.tipo_vehiculo || null,
          motor: camposMotorizado.motor || null,
          chasis: camposMotorizado.chasis || null,
          color: camposMotorizado.color || null,
          anho_modelo: camposMotorizado.anho_modelo ? parseInt(camposMotorizado.anho_modelo) : null,
          placa: camposMotorizado.placa || null,
        };
      } else if (tipoActivo === "TERRENO") {
        datos_especificos = {
          folio: camposTerreno.folio || null,
          nro_registro: camposTerreno.nro_registro || null,
          area: camposTerreno.area ? parseFloat(camposTerreno.area) : null,
          ubicacion: camposTerreno.ubicacion || null,
        };
      }

      const dataToSend = {
        nombre: formData.nombre,
        serie: formData.serie || undefined,
        tipo_activo: tipoActivo,
        clasificacion: clasificacion,
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

      await activoService.create(dataToSend);

      hideLoading();
      toast.success("Activo registrado", "El activo ha sido registrado exitosamente");

      setTimeout(() => {
        router.push("/admin/activos/lista");
      }, 1500);
    } catch (error: any) {
      console.error("Error al registrar activo:", error);
      hideLoading();
      toast.error("Error al registrar", error.message || "No se pudo registrar el activo");
    }
  };

  const mostrarMarcaProveedor = !!tipoActivo && requiereMarcaProveedor(tipoActivo as TipoActivo);
  const esSimple = !!tipoActivo && esActivoSimple(tipoActivo as TipoActivo);

  return (
    <>
      <Breadcrumb
        pageName="Registro de Activo"
        description="Añade un nuevo activo al sistema"
      />

      <section className="pb-16 pt-4">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-10/12 xl:w-9/12">
              <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="mb-6 text-xl font-bold text-black dark:text-white">
                  Registrar Nuevo Activo
                </h2>

                <form onSubmit={handleSubmit}>
                  {/* SECCIÓN 1: TIPO Y CLASIFICACIÓN */}
                  <TipoClasificacionSection
                    tipoActivo={tipoActivo}
                    onTipoChange={handleTipoChange}
                    clasificacion={clasificacion}
                    onClasificacionChange={setClasificacion}
                  />

                  {/* SECCIONES 2 Y 3: INFORMACIÓN BÁSICA Y CAMPOS ESPECÍFICOS */}
                  {tipoActivo && (
                    <>
                      <InformacionBasicaSection
                        formData={formData}
                        onChange={handleChange}
                        onLugarChange={(val) => {
                          setFormData((prev) => ({ ...prev, lugar_id: val }));
                          cargarCodigoProximo(val);
                        }}
                        onMarcaChange={(val) => setFormData((prev) => ({ ...prev, marca_id: val }))}
                        onProveedorChange={(val) => setFormData((prev) => ({ ...prev, proveedor_id: val }))}
                        lugares={lugares}
                        marcas={marcas}
                        proveedores={proveedores}
                        codigoProximo={codigoProximo}
                        cargandoCodigo={cargandoCodigo}
                        onReloadSelects={cargarDatosSelects}
                        mostrarMarcaProveedor={mostrarMarcaProveedor}
                        imagenPreview={imagenPreview}
                        subiendoImagen={subiendoImagen}
                        onImagenChange={handleImagenChange}
                        onEliminarImagen={eliminarImagen}
                      />

                      {!esSimple && (
                        <CamposEspecificosSection
                          tipoActivo={tipoActivo as TipoActivo}
                          camposEquipoTecnologico={camposEquipoTecnologico}
                          setCamposEquipoTecnologico={setCamposEquipoTecnologico}
                          camposCelular={camposCelular}
                          setCamposCelular={setCamposCelular}
                          camposMotorizado={camposMotorizado}
                          setCamposMotorizado={setCamposMotorizado}
                          camposTerreno={camposTerreno}
                          setCamposTerreno={setCamposTerreno}
                        />
                      )}

                      {/* Botones de Envío */}
                      <div className="flex flex-wrap gap-4">
                        <button
                          type="submit"
                          className="rounded-xl bg-primary hover:bg-primary/90 px-6 py-3 text-xs font-bold text-white transition-all shadow-md shadow-primary/10 cursor-pointer"
                        >
                          Registrar Activo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("¿Está seguro de cancelar? Se perderán los datos ingresados.")) {
                              router.push("/admin/activos/lista");
                            }
                          }}
                          className="rounded-xl border border-stroke dark:border-gray-800 px-6 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </form>

                <div className="mt-8 rounded-xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5 p-4">
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    <strong>Nota:</strong> Los campos marcados con{" "}
                    <span className="text-red-500">*</span> son obligatorios.
                    {tipoActivo === "TERRENO" && (
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
    </>
  );
};

export default RegistrarActivoPage;
