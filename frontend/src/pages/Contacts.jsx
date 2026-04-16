import { useState } from "react";
import { motion } from "motion/react";
import {
  Edit2, Mail, Phone, Plus, Search, Trash2, Users,
  X, FileText, Building2, Calendar, User, CheckCircle,
} from "lucide-react";
import { Modal }                from "../components/ui/Modal";
import { Field, Input, Select } from "../components/ui/FormField";
import { fmtDate, API, apiCall }         from "../utils/helpers";

// ─── Modal de detalle de contacto ────────────────────────────
function ContactDetailModal({ person, tab, properties, leases, onClose, onEdit, onDelete }) {
  if (!person) return null;

  const isOwner = tab === "owners";

  // Para propietarios: sus propiedades
  const personProps = isOwner
    ? properties.filter(p => p.ownerId === person.id)
    : [];

  // Para inquilinos: su contrato activo
  // Usamos String() para evitar mismatch de tipos entre number y string
  const activeLease = !isOwner
    ? leases.find(l => String(l.id) === String(person.leaseId) && l.status === "activo")
    : null;

  const headerBg = isOwner ? "bg-blue-600" : "bg-blue-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#262626] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-[#404040]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${headerBg} px-6 py-5 rounded-t-2xl`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {person.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white/70 text-xs font-medium mb-0.5">
                  {isOwner ? "Propietario" : "Inquilino"}
                </p>
                <p className="text-white font-bold text-base leading-snug truncate">{person.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
              <X size={15} className="text-white" />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-5">

          {/* Datos de contacto */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <User size={11} /> Datos de contacto
            </p>
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                <a href={`mailto:${person.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {person.email}
                </a>
              </span>
              {person.phone && (
                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <a href={`tel:${person.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {person.phone}
                  </a>
                </span>
              )}
              {person.document && (
                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FileText size={14} className="text-gray-400 flex-shrink-0" />
                  {person.document}
                </span>
              )}
            </div>
          </div>

          {/* Propiedades del propietario */}
          {isOwner && (
            <>
              <div className="h-px bg-gray-100 dark:bg-[#333333]" />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 size={11} /> Propiedades ({personProps.length})
                </p>
                {personProps.length > 0 ? (
                  <div className="space-y-2">
                    {personProps.map(prop => (
                      <div key={prop.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Building2 size={13} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{prop.address}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{prop.type}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          prop.status === "ocupado"
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                            : "bg-gray-100 dark:bg-[#2d2d2d] text-gray-500 dark:text-gray-400"
                        }`}>
                          {prop.status === "ocupado" ? "Ocupada" : "Vacante"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">Sin propiedades asignadas</p>
                )}
              </div>
            </>
          )}

          {/* Contrato activo del inquilino */}
          {!isOwner && (
            <>
              <div className="h-px bg-gray-100 dark:bg-[#333333]" />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText size={11} /> Contrato activo
                </p>
                {activeLease ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                          <Calendar size={10} /> Inicio
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtDate(activeLease.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                          <Calendar size={10} /> Vencimiento
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtDate(activeLease.endDate)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                      Contrato activo
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">Sin contrato activo</p>
                )}
              </div>
            </>
          )}

          <div className="h-px bg-gray-100 dark:bg-[#333333]" />

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onClose(); onEdit(person); }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-[#404040] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#333333]00 transition-colors"
            >
              <Edit2 size={14} /> Editar
            </button>
            <button
              onClick={() => { onClose(); onDelete(person.id); }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contacts({ owners, setOwners, tenants, setTenants, properties, leases }) {
  const [tab,          setTab]          = useState("owners");
  const [search,       setSearch]       = useState("");
  const [modal,        setModal]        = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [detailPerson, setDetailPerson] = useState(null);
  const [form,         setForm]         = useState({ name: "", email: "", phone: "", document: "", role: "owner" });
  const [formError,    setFormError]    = useState("");

  const list = (tab === "owners" ? owners : tenants).filter(person => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      person.name?.toLowerCase().includes(q) ||
      person.email?.toLowerCase().includes(q) ||
      person.phone?.toLowerCase().includes(q)
    );
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", document: "", role: tab === "owners" ? "owner" : "tenant" });
    setFormError("");
    setModal(true);
  };

  const openEdit = (person) => {
    setEditing(person.id);
    setForm({ name: person.name, email: person.email, phone: person.phone || "", document: person.document || "", role: tab === "owners" ? "owner" : "tenant" });
    setFormError("");
    setModal(true);
  };

  const validate = () => {
    const missing = [];
    if (!form.name)     missing.push("nombre");
    if (!form.email)    missing.push("email");
    if (!form.document) missing.push("DNI/CUIL");
    if (!form.phone)    missing.push("teléfono");
    if (missing.length > 1) return `Faltan completar campos obligatorios: ${missing.join(", ")}.`;
    if (missing.length === 1) return `Falta completar un campo: ${missing[0]}.`;
    
    // Validar formato de email
    if (form.email && !form.email.includes("@")) {
      return "Ingrese un mail válido.";
    }
    
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError("");
    const endpoint = form.role === "owner" ? "owners" : "tenants";
    const method   = editing ? "PUT" : "POST";
    const url      = editing ? `/${endpoint}/${editing}` : `/${endpoint}`;
    try {
      const saved = await apiCall(url, {
        method,
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, document: form.document }),
      });
      if (form.role === "owner") {
        setOwners(prev => editing ? prev.map(o => o.id === editing ? saved : o) : [...prev, saved]);
      } else {
        setTenants(prev => editing ? prev.map(t => t.id === editing ? saved : t) : [...prev, saved]);
      }
      setModal(false);
    } catch (e) {
      setFormError("Error al guardar: " + e.message);
    } finally {
      setSaving(false);
      setEditing(null);
    }
  };

  const del = async (id) => {
    if (!confirm("¿Eliminar este contacto?")) return;
    const endpoint = tab === "owners" ? "owners" : "tenants";
    try {
      await apiCall(`/${endpoint}/${id}`, { method: "DELETE" });
      if (tab === "owners") setOwners(prev => prev.filter(o => o.id !== id));
      else                  setTenants(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert("Error al eliminar: " + e.message);
    }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Contactos</h1>
          <p className="text-gray-400 mt-2">
            {owners.length} propietarios · {tenants.length} inquilinos
          </p>
        </div>
        <motion.button onClick={openNew} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/20">
          <Plus size={16} /> Nuevo Contacto
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-[#404040] rounded-xl p-1 w-fit" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }}>
        <button onClick={() => { setTab("owners"); setSearch(""); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === "owners" ? "bg-blue-600 text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
          Propietarios
        </button>
        <button onClick={() => { setTab("tenants"); setSearch(""); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === "tenants" ? "bg-blue-600 text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
          Inquilinos
        </button>
      </motion.div>

      {/* Buscador */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400"
        />
      </div>

      {list.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
          Hacé click en un contacto para ver sus detalles
        </p>
      )}

      {/* Lista */}
      <motion.div className="grid gap-3" variants={staggerContainer} initial="initial" animate="animate">
        {list.map((person, idx) => {
          const personProps = tab === "owners" ? properties.filter(p => p.ownerId === person.id) : [];
          const lease       = tab === "tenants" ? leases.find(l => String(l.id) === String(person.leaseId)) : null;
          return (
            <motion.div
              key={person.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              onClick={() => setDetailPerson(person)}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {person.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{person.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Mail size={11} />{person.email}</span>
                    {person.phone && <span className="flex items-center gap-1"><Phone size={11} />{person.phone}</span>}
                  </div>
                  {tab === "owners" && personProps.length > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">{personProps.length} propiedad(es)</p>
                  )}
                  {lease && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
                      Contrato activo · Vence {fmtDate(lease.endDate)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(person)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333]00 transition-colors">
                    <Edit2 size={13} className="text-gray-400" />
                  </button>
                  <button onClick={() => del(person.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {list.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800/50 py-16 text-center">
            <CheckCircle size={36} className="text-green-400 mx-auto mb-3" />
            <p className="font-medium text-green-700 dark:text-green-400">
              {search ? "Sin resultados para tu búsqueda" : "Sin contactos registrados"}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Modal de detalle */}
      {detailPerson && (
        <ContactDetailModal
          person={detailPerson}
          tab={tab}
          properties={properties}
          leases={leases}
          onClose={() => setDetailPerson(null)}
          onEdit={(p) => { setDetailPerson(null); openEdit(p); }}
          onDelete={(id) => { setDetailPerson(null); del(id); }}
        />
      )}

      {/* Modal crear/editar */}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? "Editar Contacto" : "Nuevo Contacto"}>
        <div className="space-y-4">

          {/* Rol: solo visible al crear, no al editar */}
          {!editing && (
            <Field label="Rol">
              <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="owner">Propietario</option>
                <option value="tenant">Inquilino</option>
              </Select>
            </Field>
          )}

          <Field label="Nombre completo">
            <Input placeholder="Ej: Juan Pérez" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setFormError(""); }} />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="juan@email.com" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setFormError(""); }} />
          </Field>
          <Field label="DNI/CUIL">
            <Input placeholder="Ej: 12345678 o 20-12345678-9" value={form.document} onChange={e => { const val = e.target.value.replace(/[^0-9-]/g, ''); setForm({ ...form, document: val }); setFormError(""); }} />
          </Field>
          <Field label="Teléfono">
            <Input placeholder="+54 11 1234-5678" value={form.phone} onChange={e => { const val = e.target.value.replace(/[^0-9+\s()-]/g, ''); setForm({ ...form, phone: val }); setFormError(""); }} />
          </Field>

          {formError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setModal(false); setEditing(null); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#404040] text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#333333]00 transition-colors">
              Cancelar
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Guardando…" : (editing ? "Actualizar" : "Crear Contacto")}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}