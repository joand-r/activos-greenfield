"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { superadminService, UsuarioAdmin } from "@/services/superadmin.service";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAuth } from "@/contexts/AuthContext";

export default function UsuariosPage() {
  const { showLoading, hideLoading } = useLoading();
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditId, setUsuarioEditId] = useState<number | null>(null);

  // Form states
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState("");

  // Delete states
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<UsuarioAdmin | null>(null);

  useEffect(() => {
    document.title = "Gestión de Usuarios | Seguridad";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const [usuariosData, rolesData] = await Promise.all([
        superadminService.getUsuarios(),
        superadminService.getRoles()
      ]);
      setUsuarios(usuariosData || []);
      setRoles(rolesData || []);
    } catch (e: any) {
      console.error(e);
      toast.error("Error", e.message || "No se pudieron cargar los datos");
    } finally {
      hideLoading();
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setEmail("");
    setPassword("");
    setRolId("");
    setUsuarioEditId(null);
    setModoEdicion(false);
  };

  const abrirCrear = () => {
    limpiarFormulario();
    if (roles.length > 0) {
      // Intentar auto-seleccionar Operadora por defecto
      const opRol = roles.find(r => r.nombre === "Operadora");
      if (opRol) setRolId(opRol.id.toString());
    }
    setModalAbierto(true);
  };

  const abrirEditar = (u: UsuarioAdmin) => {
    limpiarFormulario();
    setNombre(u.nombre);
    setEmail(u.email);
    setPassword(""); // Vacío por seguridad/opcional
    // Encontrar rol_id por nombre de rol
    const userRol = roles.find(r => r.nombre === u.rol);
    if (userRol) setRolId(userRol.id.toString());
    setUsuarioEditId(u.id);
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !rolId || (!modoEdicion && !password)) {
      toast.error("Campos requeridos", "Por favor completa todos los campos obligatorios");
      return;
    }

    showLoading();
    try {
      if (modoEdicion && usuarioEditId !== null) {
        await superadminService.actualizarUsuario(usuarioEditId, {
          nombre,
          email,
          password: password ? password : undefined,
          rol_id: parseInt(rolId)
        });
        toast.success("Usuario actualizado", "Los datos del usuario han sido actualizados");
      } else {
        await superadminService.crearUsuario({
          nombre,
          email,
          password,
          rol_id: parseInt(rolId)
        });
        toast.success("Usuario creado", "El nuevo usuario ha sido creado exitosamente");
      }
      setModalAbierto(false);
      limpiarFormulario();
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      toast.error("Error", err.response?.data?.error || err.message || "Ocurrió un error al procesar el usuario");
    } finally {
      hideLoading();
    }
  };

  const intentarEliminar = (u: UsuarioAdmin) => {
    if (currentUser && u.id === currentUser.id) {
      toast.error("Acción denegada", "No puedes eliminar tu propio usuario con el que tienes sesión iniciada");
      return;
    }
    setUsuarioAEliminar(u);
    setConfirmEliminar(true);
  };

  const confirmarEliminarUsuario = async () => {
    if (!usuarioAEliminar) return;
    showLoading();
    try {
      await superadminService.eliminarUsuario(usuarioAEliminar.id);
      toast.success("Usuario eliminado", `El usuario ${usuarioAEliminar.nombre} ha sido eliminado`);
      setConfirmEliminar(false);
      setUsuarioAEliminar(null);
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      toast.error("Error", err.response?.data?.error || err.message || "No se pudo eliminar el usuario");
    } finally {
      hideLoading();
    }
  };

  const colorRol = (rolName: string) => {
    switch (rolName) {
      case "Administrador":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Operadora":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Gestión de Usuarios"
        description="Crea, edita y administra los usuarios y sus roles asignados."
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {/* Header con botón */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Cuentas Registradas ({usuarios.length})
            </h2>
            <button
              onClick={abrirCrear}
              className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-primary/10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m2 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Crear Usuario
            </button>
          </div>

          {/* Tabla de Usuarios */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">Nombre</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">Email</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">Rol</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">Registrado</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-black dark:text-white">{u.nombre}</td>
                      <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{u.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-[10px] font-bold ${colorRol(u.rol)}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold">
                        {new Date(u.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => abrirEditar(u)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all text-white shadow-sm hover:shadow-md"
                            title="Editar Usuario"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => intentarEliminar(u)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all text-white shadow-sm hover:shadow-md"
                            title="Eliminar Usuario"
                            disabled={currentUser && u.id === currentUser.id}
                            style={{ opacity: currentUser && u.id === currentUser.id ? 0.4 : 1 }}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {usuarios.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No hay usuarios registrados.
              </div>
            )}
          </div>

          {/* Modal de Crear / Editar */}
          {modalAbierto && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
              <div className="relative w-full max-w-md rounded-2xl border border-black/5 dark:border-white/5 bg-white/90 dark:bg-black/80 backdrop-blur-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                  onClick={() => setModalAbierto(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Header */}
                <h3 className="text-sm font-bold uppercase tracking-wider text-body-color/70 mb-6 pb-2 border-b border-black/5 dark:border-white/5">
                  {modoEdicion ? "✏️ Editar Usuario" : "👤 Registrar Nuevo Usuario"}
                </h3>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">Nombre Completo <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Joan Daniel"
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@greenfield.com.bo"
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">
                      Contraseña {modoEdicion ? "" : <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="password"
                      required={!modoEdicion}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={modoEdicion ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                    />
                    {modoEdicion && (
                      <p className="mt-1 text-[9px] text-body-color dark:text-gray-400">
                        * Deja este campo vacío si no deseas modificar la contraseña del usuario.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">Rol Asignado <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={rolId}
                      onChange={(e) => setRolId(e.target.value)}
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                    >
                      <option value="">Selecciona un rol...</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setModalAbierto(false)}
                      className="flex-1 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 py-2.5 text-xs font-bold text-black dark:text-white transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-primary hover:bg-primary/90 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-primary/10"
                    >
                      {modoEdicion ? "Guardar Cambios" : "Crear Usuario"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Confirmación de Eliminación */}
          <ConfirmModal
            isOpen={confirmEliminar}
            onCancel={() => {
              setConfirmEliminar(false);
              setUsuarioAEliminar(null);
            }}
            onConfirm={confirmarEliminarUsuario}
            title="¿Eliminar Usuario?"
            message={`¿Estás seguro de que deseas eliminar permanentemente a ${usuarioAEliminar?.nombre}? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
          />
        </div>
      </section>
    </>
  );
}
