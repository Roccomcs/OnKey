import { useState } from "react";
import { Building2, Edit2, Plus, Search, Trash2, User, X, Mail, Phone, MapPin, DollarSign, FileText, Tag } from "lucide-react";
import { Modal }                from "../components/ui/Modal";
import { Field, Input, Select } from "../components/ui/FormField";
import { Badge }                from "../components/ui/Badge";
import { DocumentsSection }     from "../components/ui/DocumentsSection";
import { useDocuments }         from "../hooks/useDocuments";
import { fmtCurrency, API, apiCall }     from "../utils/helpers";

const TIPOS = ["Departamento", "Casa", "Local Comercial", "Oficina", "Galpón", "Terreno", "Otro"];

function PropertyDocuments({ propertyId }) {
  const docState = useDocuments("property", propertyId);
  if (!propertyId) return (
    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
      Guardá la propiedad primero para adjuntar documentos.
    </p>
  );
  return <DocumentsSection entityType="property" entityId={propertyId} {...docState} />;
}

function PropertyDetailModal({ property, owners, leases, tenants, onClose, onEdit, onDelete }) {
  if (!property) return null;
  const owner       = owners.find(o => o.id === property.ownerId);
  const activeLease = leases?.find(l => l.propertyId === property.id && l.status === "activo");
  const leaseTenant = activeLease ? tenants?.find(t => t.id === activeLease.tenantId) : null;
  const docState    = useDocuments("property", property.id);
  const headerBg    = property.status === "ocupado" ? "bg-emerald-600" : "bg-slate-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${headerBg} px-6 py-5 rounded-t-2xl`}>
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={14} className="text-white/80" />
                <span className="text-white/80 text-xs font-medium">{property.type}</span>
              </div>
              <p className="text-white font-bold text-base leading-snug">{property.address}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
              <X size={15} className="text-white" />
            </button>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-white leading-none">{fmtCurrency(property.price)}</p>
              <p className="text-white/70 text-sm mt-0.5">por mes</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white">
              {property.status === "ocupado" ? "Ocupada" : "Vacante"}
            </span>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-5">

          {/* Ubicación */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin size={11} /> Ubicación
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{property.address}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{property.type}</p>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Propietario */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <User size={11} /> Propietario
            </p>
            {owner ? (
              <>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{owner.name}</p>
                <div className="flex flex-col gap-1">
                  {owner.email && (
                    <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Mail size={11} className="text-gray-400 flex-shrink-0" />{owner.email}
                    </span>
                  )}
                  {owner.phone && (
                    <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Phone size={11} className="text-gray-400 flex-shrink-0" />{owner.phone}
                    </span>
                  )}
                  {owner.document && (
                    <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <FileText size={11} className="text-gray-400 flex-shrink-0" />{owner.document}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">Sin propietario asignado</p>
            )}
          </div>

          {/* Inquilino actual */}
          {leaseTenant && (
            <>
              <div className="h-px bg-gray-100 dark:bg-gray-800" />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText size={11} /> Inquilino actual
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{leaseTenant.name}</p>
                <div className="flex flex-col gap-1">
                  {leaseTenant.email && (
                    <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Mail size={11} className="text-gray-400 flex-shrink-0" />{leaseTenant.email}
                    </span>
                  )}
                  {leaseTenant.phone && (
                    <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Phone size={11} className="text-gray-400 flex-shrink-0" />{leaseTenant.phone}
                    </span>
                  )}
                  {leaseTenant.document && (
                    <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <FileText size={11} className="text-gray-400 flex-shrink-0" />{leaseTenant.document}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                <DollarSign size={10} /> Precio lista
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtCurrency(property.price)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                <Tag size={10} /> Tipo
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{property.type}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 col-span-2">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Estado</p>
              <Badge status={property.status} />
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Documentos */}
          <DocumentsSection entityType="property" entityId={property.id} {...docState} />

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onClose(); onEdit(property); }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit2 size={14} /> Editar
            </button>
            <button
              onClick={() => { onClose(); onDelete(property.id); }}
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

export function Properties({ properties, setProperties, owners, leases, tenants, initialFilter = "todos" }) {
  const [search,         setSearch]         = useState("");
  const [filter,         setFilter]         = useState(initialFilter);
  const [modal,          setModal]          = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [detailProperty, setDetailProperty] = useState(null);
  const [form, setForm] = useState({ address: "", type: "Departamento", price: "", status: "vacante", ownerId: "" });

  const filtered = properties.filter(p => {
    const matchSearch = p.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const openNew  = () => { setEditing(null); setForm({ address: "", type: "Departamento", price: "", status: "vacante", ownerId: "" }); setModal(true); };
  const openEdit = (p) => { setEditing(p.id); setForm({ address: p.address, type: p.type, price: p.price, status: p.status, ownerId: p.ownerId }); setModal(true); };

  const save = async () => {
    if (!form.address || !form.price) return;
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url    = editing ? `/properties/${editing}` : `/properties`;
      const saved = await apiCall(url, {
        method,
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      setProperties(prev => editing ? prev.map(p => p.id === editing ? saved : p) : [...prev, saved]);
      setModal(false);
    } catch (e) {
      alert("Error al guardar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    try {
      await apiCall(`/properties/${id}`, { method: "DELETE" });
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert("Error al eliminar: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Propiedades</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{properties.length} propiedades registradas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200">
          <Plus size={16} /> Nueva Propiedad
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por dirección..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-1">
          {["todos", "ocupado", "vacante"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                filter === f ? "bg-violet-600 text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
          Hacé click en una tarjeta para ver los detalles
        </p>
      )}

      <div className="grid gap-3">
        {filtered.map(p => {
          const owner = owners.find(o => o.id === p.ownerId);
          const activeLease = leases?.find(l => l.propertyId === p.id && l.status === "activo");
          const tenant = activeLease ? tenants?.find(t => t.id === activeLease.tenantId) : null;
          return (
            <div
              key={p.id}
              onClick={() => setDetailProperty(p)}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{p.address}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{p.type}</p>
                    <div className="flex flex-col gap-1.5 mt-2 text-xs">
                      {owner && <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500"><span className="font-semibold text-gray-600 dark:text-gray-400">Propietario:</span> {owner.name}</span>}
                      {tenant && <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500"><span className="font-semibold text-gray-600 dark:text-gray-400">Inquilino:</span> {tenant.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{fmtCurrency(p.price)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">por mes</p>
                    <Badge status={p.status} />
                  </div>
                  <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Edit2 size={13} className="text-gray-400" />
                    </button>
                    <button onClick={() => del(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-16 text-center">
            <Building2 size={36} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-medium text-gray-500 dark:text-gray-400">Sin propiedades</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Agrega tu primera propiedad</p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {detailProperty && (
        <PropertyDetailModal
          property={detailProperty}
          owners={owners}
          leases={leases || []}
          tenants={tenants || []}
          onClose={() => setDetailProperty(null)}
          onEdit={(p) => { setDetailProperty(null); openEdit(p); }}
          onDelete={(id) => { setDetailProperty(null); del(id); }}
        />
      )}

      {/* Modal crear/editar */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar Propiedad" : "Nueva Propiedad"} wide>
        <div className="space-y-4">
          <Field label="Dirección completa">
            <Input placeholder="Av. Santa Fe 2450, Piso 3B" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Estado">
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="vacante">Vacante</option>
                <option value="ocupado">Ocupado</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio lista (ARS)">
              <Input type="text" inputMode="decimal" placeholder="Ej: 320000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, '') })} />
            </Field>
            <Field label="Propietario">
              <Select value={form.ownerId} onChange={e => setForm({ ...form, ownerId: e.target.value })}>
                <option value="">Seleccionar...</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </Field>
          </div>
          {editing && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4">
              <PropertyDocuments propertyId={editing} />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button onClick={save} disabled={saving} className="flex-1 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors">
              {saving ? "Guardando…" : (editing ? "Actualizar" : "Crear Propiedad")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}