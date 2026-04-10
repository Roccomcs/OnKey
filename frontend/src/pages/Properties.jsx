// frontend/src/pages/Properties.jsx
import { useState, useEffect, useRef } from "react";
import {
  Building2, Edit2, Plus, Search, Trash2, User, X,
  Mail, Phone, MapPin, DollarSign, FileText, Tag,
  ChevronLeft, ChevronRight, Camera, Loader2,
} from "lucide-react";
import { Modal }                from "../components/ui/Modal";
import { Field, Input, Select } from "../components/ui/FormField";
import { Badge }                from "../components/ui/Badge";
import { DocumentsSection }     from "../components/ui/DocumentsSection";
import { useDocuments }         from "../hooks/useDocuments";
import { fmtCurrency, API, apiCall } from "../utils/helpers";

const TIPOS = ["Departamento", "Casa", "Local Comercial", "Oficina", "Galpón", "Terreno", "Otro"];

// ── helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (price, moneda) => {
  if (!price && price !== 0) return "-";
  const num = Number(price);
  if (moneda === "USD") {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
  }
  return fmtCurrency(num);
};

// ── Hook: fotos de propiedad ──────────────────────────────────────────────────
function usePropertyPhotos(propertyId) {
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const data = await apiCall(`/properties/${propertyId}/photos`);
      setPhotos(data);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [propertyId]);

  const upload = async (files) => {
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("photos", f));
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/properties/${propertyId}/photos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    const added = await res.json();
    setPhotos(prev => [...prev, ...added]);
  };

  const remove = async (photoId) => {
    await apiCall(`/properties/${propertyId}/photos/${photoId}`, { method: "DELETE" });
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  return { photos, loading, upload, remove, reload: load };
}

// ── Carrusel pequeño (tarjeta de lista) ──────────────────────────────────────
function MiniCarousel({ photos }) {
  const [idx, setIdx] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <Building2 size={22} className="text-gray-300 dark:text-gray-500" />
      </div>
    );
  }

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); };

  return (
    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 group">
      <img
        src={photos[idx].url}
        alt="foto propiedad"
        className="w-full h-full object-cover"
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-r p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-l p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={12} />
          </button>
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
            {photos.map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Carrusel grande (modal de detalle) ───────────────────────────────────────
function BigCarousel({ photos }) {
  const [idx, setIdx] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-52 rounded-xl bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center gap-2">
        <Camera size={28} className="text-gray-300 dark:text-gray-500" />
        <p className="text-xs text-gray-400">Sin fotos</p>
      </div>
    );
  }

  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);

  return (
    <div className="relative w-full h-52 rounded-xl overflow-hidden bg-black">
      <img src={photos[idx].url} alt="foto" className="w-full h-full object-cover" />
      {photos.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
          <span className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
            {idx + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}

// ── Sección de gestión de fotos (dentro del modal editar) ────────────────────
function PhotoManager({ propertyId }) {
  const { photos, loading, upload, remove } = usePropertyPhotos(propertyId);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFiles = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try { await upload(e.target.files); }
    catch (err) { alert("Error al subir fotos: " + err.message); }
    finally { setUploading(false); e.target.value = ""; }
  };

  if (!propertyId) return (
    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
      Guardá la propiedad primero para agregar fotos.
    </p>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
          <Camera size={11} /> Fotos ({photos.length})
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
          {uploading ? "Subiendo…" : "Agregar fotos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 size={18} className="animate-spin text-blue-500" />
        </div>
      )}

      {!loading && photos.length === 0 && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
        >
          <Camera size={22} className="text-gray-300 dark:text-gray-500" />
          <span className="text-xs text-gray-400">Hacé click para subir fotos</span>
        </button>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700">
              <img src={photo.url} alt={photo.fileName} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
                  Principal
                </span>
              )}
              <button
                onClick={() => remove(photo.id)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PropertyDocuments ─────────────────────────────────────────────────────────
function PropertyDocuments({ propertyId }) {
  const docState = useDocuments("property", propertyId);
  if (!propertyId) return (
    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
      Guardá la propiedad primero para adjuntar documentos.
    </p>
  );
  return <DocumentsSection entityType="property" entityId={propertyId} {...docState} />;
}

// ── PropertyDetailModal ───────────────────────────────────────────────────────
function PropertyDetailModal({ property, owners, leases, tenants, onClose, onEdit, onDelete }) {
  if (!property) return null;
  const { photos } = usePropertyPhotos(property.id);
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
        {/* Carrusel de fotos */}
        <div className="rounded-t-2xl overflow-hidden">
          <BigCarousel photos={photos} />
        </div>

        {/* Header info */}
        <div className={`${headerBg} px-6 py-4`}>
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
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-white leading-none">
                {fmtPrice(property.price, property.moneda)}
              </p>
              <p className="text-white/70 text-sm mt-0.5">
                {property.moneda === "USD" ? "USD · " : "ARS · "}
                {property.operacion === "venta" ? "precio venta" : "por mes"}
              </p>
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
            {(property.localidad || property.provincia) && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {[property.localidad, property.provincia, property.codigoPostal].filter(Boolean).join(", ")}
              </p>
            )}
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
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {fmtPrice(property.price, property.moneda)}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{property.moneda || "ARS"}</p>
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

// ── PropertyCard con mini-carrusel ────────────────────────────────────────────
function PropertyCard({ p, owners, leases, tenants, onClick, onEdit, onDelete }) {
  const { photos } = usePropertyPhotos(p.id);
  const owner       = owners.find(o => o.id === p.ownerId);
  const activeLease = leases?.find(l => l.propertyId === p.id && l.status === "activo");
  const tenant      = activeLease ? tenants?.find(t => t.id === activeLease.tenantId) : null;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Mini carrusel / foto de perfil */}
        <MiniCarousel photos={photos} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{p.address}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-500 dark:text-gray-400">{p.type}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  p.operacion === "venta"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                }`}>
                  {p.operacion === "venta" ? "Venta" : "Alquiler"}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-1.5 text-xs">
                {owner  && <span className="text-gray-400 dark:text-gray-500"><span className="font-semibold text-gray-600 dark:text-gray-400">Propietario:</span> {owner.name}</span>}
                {tenant && <span className="text-gray-400 dark:text-gray-500"><span className="font-semibold text-gray-600 dark:text-gray-400">Inquilino:</span> {tenant.name}</span>}
              </div>
            </div>

            <div className="flex items-start gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {fmtPrice(p.price, p.moneda)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {p.moneda === "USD" ? "USD · " : ""}{p.operacion === "venta" ? "precio venta" : "por mes"}
                </p>
                <Badge status={p.status} />
              </div>
              <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Edit2 size={13} className="text-gray-400" />
                </button>
                <button onClick={() => onDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function Properties({ properties, setProperties, owners, leases, tenants, initialFilter = "todos" }) {
  const [search,         setSearch]         = useState("");
  const [filter,         setFilter]         = useState(initialFilter);
  const [modal,          setModal]          = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [detailProperty, setDetailProperty] = useState(null);
  const [form, setForm] = useState({
    address: "", type: "Departamento", price: "", status: "vacante",
    ownerId: "", operacion: "alquiler", localidad: "", provincia: "",
    codigoPostal: "", moneda: "ARS",
  });

  const filtered = properties.filter(p => {
    const matchSearch = p.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const blankForm = () => ({
    address: "", type: "Departamento", price: "", status: "vacante",
    ownerId: "", operacion: "alquiler", localidad: "", provincia: "",
    codigoPostal: "", moneda: "ARS",
  });

  const openNew  = () => { setEditing(null); setForm(blankForm()); setModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      address:      p.address,
      type:         p.type,
      price:        p.price,
      status:       p.status,
      ownerId:      p.ownerId,
      operacion:    p.operacion || "alquiler",
      localidad:    p.localidad    || "",
      provincia:    p.provincia    || "",
      codigoPostal: p.codigoPostal || "",
      moneda:       p.moneda       || "ARS",
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.address || !form.price) return;
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url    = editing ? `/properties/${editing}` : `/properties`;
      const saved  = await apiCall(url, {
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
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Propiedades</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{properties.length} propiedades registradas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={16} /> Nueva Propiedad
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por dirección..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-1">
          {["todos", "ocupado", "vacante"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                filter === f ? "bg-blue-600 text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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

      {/* Lista de propiedades */}
      <div className="grid gap-3">
        {filtered.map(p => (
          <PropertyCard
            key={p.id}
            p={p}
            owners={owners}
            leases={leases}
            tenants={tenants}
            onClick={() => setDetailProperty(p)}
            onEdit={openEdit}
            onDelete={del}
          />
        ))}
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
          {/* Operación */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Operación</p>
            <div className="flex gap-2">
              {["alquiler", "venta"].map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setForm({ ...form, operacion: op })}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors capitalize ${
                    form.operacion === op
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {op === "alquiler" ? "Alquiler" : "Venta"}
                </button>
              ))}
            </div>
          </div>

          {/* Dirección */}
          <Field label="Dirección completa">
            <Input placeholder="Av. Santa Fe 2450, Piso 3B" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} />
          </Field>

          {/* Localidad / Provincia / CP */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Localidad">
              <Input placeholder="Ej: Palermo" value={form.localidad}
                onChange={e => setForm({ ...form, localidad: e.target.value })} />
            </Field>
            <Field label="Provincia">
              <Input placeholder="Ej: Buenos Aires" value={form.provincia}
                onChange={e => setForm({ ...form, provincia: e.target.value })} />
            </Field>
            <Field label="Código postal">
              <Input placeholder="Ej: 1425" value={form.codigoPostal}
                onChange={e => setForm({ ...form, codigoPostal: e.target.value })} />
            </Field>
          </div>

          {/* Tipo / Estado */}
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

          {/* Precio + Moneda */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio lista">
              <div className="flex gap-2">
                {/* Toggle ARS / USD */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                  {["ARS", "USD"].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, moneda: m })}
                      className={`px-3 py-2 text-xs font-semibold transition-colors ${
                        form.moneda === m
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder={form.moneda === "USD" ? "Ej: 120000" : "Ej: 320000"}
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, '') })}
                />
              </div>
            </Field>

            <Field label="Propietario">
              <Select value={form.ownerId} onChange={e => setForm({ ...form, ownerId: e.target.value })}>
                <option value="">Seleccionar...</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </Field>
          </div>

          {/* Fotos — solo al editar */}
          {editing && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4">
              <PhotoManager propertyId={editing} />
            </div>
          )}

          {/* Documentos — solo al editar */}
          {editing && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4">
              <PropertyDocuments propertyId={editing} />
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Guardando…" : (editing ? "Actualizar" : "Crear Propiedad")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}