// frontend/src/pages/Properties.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Building2, Edit2, Plus, Search, Trash2, User, X,
  Mail, Phone, MapPin, DollarSign, FileText, Tag,
  ChevronLeft, ChevronRight, Camera, Loader2,
  BedDouble, Bath, Maximize2,
} from "lucide-react";
import { Modal }                from "../components/ui/Modal";
import { Field, Input, Select } from "../components/ui/FormField";
import { Badge }                from "../components/ui/Badge";
import { DocumentsSection }     from "../components/ui/DocumentsSection";
import { useDocuments }         from "../hooks/useDocuments";
import { useActivity }          from "../hooks/useActivity";
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

// Formatea número con puntos de miles para mostrar en el input (ej: "80000" → "80.000")
const fmtInputPrice = (val) => {
  if (!val && val !== 0) return "";
  const digits = String(val).replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
    const token = localStorage.getItem("authToken");
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

// ── Carrusel de tarjeta (imagen lateral) ─────────────────────────────────────
function CardCarousel({ photos }) {
  const [idx, setIdx] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-56 shrink-0 bg-gray-100 dark:bg-[#2d2d2d] flex items-center justify-center rounded-l-2xl">
        <Building2 size={32} className="text-gray-300 dark:text-gray-500" />
      </div>
    );
  }

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); };

  return (
    <div className="relative w-56 shrink-0 overflow-hidden rounded-l-2xl group">
      <img src={photos[idx].url} alt="foto propiedad" className="w-full h-full object-cover" />
      {photos.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={14} />
          </button>
          <button onClick={next} className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {photos.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
          <span className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
            {idx + 1}/{photos.length}
          </span>
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
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-900">
        <Camera size={48} className="text-gray-700" />
        <p className="text-sm text-gray-500">Sin fotos</p>
      </div>
    );
  }

  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      <img src={photos[idx].url} alt="foto" className="w-full h-full object-contain" />
      {photos.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-colors z-10">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-colors z-10">
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-6">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
          <span className="absolute top-4 right-4 text-sm bg-black/70 text-white px-3 py-1.5 rounded-full font-medium">
            {idx + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}

// ── Sección de gestión de fotos (dentro del modal editar) ────────────────────
function PhotoManager({ propertyId, isNewProperty }) {
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
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
        {isNewProperty 
          ? "📸 Después de crear la propiedad, podrás agregar fotos aquí"
          : "📸 Guardá la propiedad primero para agregar fotos."}
      </p>
    </div>
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
          className="w-full border-2 border-dashed border-gray-200 dark:border-[#404040] rounded-xl py-6 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
        >
          <Camera size={22} className="text-gray-300 dark:text-gray-500" />
          <span className="text-xs text-gray-400">Hacé click para subir fotos</span>
        </button>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-[#2d2d2d]">
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
        className="relative bg-white dark:bg-[#262626] rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex border border-gray-100 dark:border-[#404040] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Left side: Carousel */}
        <div className="w-1/2 bg-black overflow-hidden rounded-l-2xl flex flex-col">
          <BigCarousel photos={photos} />
        </div>

        {/* Right side: Details */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header info */}
          <div className={`${headerBg} px-6 py-4 flex-shrink-0`}>
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
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
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

            <div className="h-px bg-gray-100 dark:bg-[#333333]" />

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
                <div className="h-px bg-gray-100 dark:bg-[#333333]" />
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

            <div className="h-px bg-gray-100 dark:bg-[#333333]" />

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-xl p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                  <DollarSign size={10} /> Precio lista
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {fmtPrice(property.price, property.moneda)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{property.moneda || "ARS"}</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-xl p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                  <Tag size={10} /> Tipo
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{property.type}</p>
              </div>
              {/* Superficie / Habitaciones / Baños */}
              {(property.m2 || property.habitaciones || property.banos) && (
                <div className="col-span-2 grid grid-cols-3 gap-2">
                  {property.m2 && (
                    <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{property.m2}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">m²</p>
                    </div>
                  )}
                  {property.habitaciones && (
                    <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{property.habitaciones}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">hab.</p>
                    </div>
                  )}
                  {property.banos && (
                    <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{property.banos}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">baños</p>
                    </div>
                  )}
                </div>
              )}
              {/* Descripción */}
              {property.descripcion && (
                <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-xl p-3 col-span-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Descripción</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{property.descripcion}</p>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Estado</p>
                <Badge status={property.status} />
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-[#333333]" />

            {/* Documentos */}
            <DocumentsSection entityType="property" entityId={property.id} {...docState} />

            <div className="h-px bg-gray-100 dark:bg-[#333333]" />

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onClose(); onEdit(property); }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-[#404040] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#333333]00 transition-colors"
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
    </div>
  );
}

// ── PropertyCard horizontal ───────────────────────────────────────────────────
function PropertyCard({ p, owners, leases, tenants, onClick, onEdit, onDelete }) {
  const { photos } = usePropertyPhotos(p.id);
  const owner       = owners.find(o => o.id === p.ownerId);
  const activeLease = leases?.find(l => l.propertyId === p.id && l.status === "activo");
  const tenant      = activeLease ? tenants?.find(t => t.id === activeLease.tenantId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="bg-white dark:bg-[#333333] rounded-2xl border border-gray-100 dark:border-[#404040] hover:border-gray-400 dark:hover:border-gray-600 transition-all cursor-pointer overflow-hidden flex h-44"
    >
      {/* Imagen lateral izquierda */}
      <CardCarousel photos={photos} />

      {/* Info derecha */}
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        {/* Fila superior: dirección + acciones */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-200 leading-snug truncate">{p.address}</p>
            {(p.localidad || p.provincia) && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                {[p.localidad, p.provincia].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <div className="flex gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333]00 transition-colors">
              <Edit2 size={13} className="text-gray-400" />
            </button>
            <button onClick={() => onDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 size={13} className="text-red-400" />
            </button>
          </div>
        </div>

        {/* Tipo + operación */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{p.type}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            p.operacion === "venta"
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          }`}>
            {p.operacion === "venta" ? "Venta" : "Alquiler"}
          </span>
        </div>

        {/* Características: m², habitaciones, baños */}
        {(p.m2 || p.habitaciones || p.banos) && (
          <div className="flex items-center gap-2">
            {p.m2 && (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2d2d2d] px-2 py-0.5 rounded-md">
                <Maximize2 size={10} /> {p.m2} m²
              </span>
            )}
            {p.habitaciones && (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2d2d2d] px-2 py-0.5 rounded-md">
                <BedDouble size={10} /> {p.habitaciones}
              </span>
            )}
            {p.banos && (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2d2d2d] px-2 py-0.5 rounded-md">
                <Bath size={10} /> {p.banos}
              </span>
            )}
          </div>
        )}

        {/* Propietario / Inquilino */}
        <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {owner  && <span><span className="font-medium text-gray-600 dark:text-gray-400">Propietario:</span> {owner.name}</span>}
          {tenant && <span className="ml-3"><span className="font-medium text-gray-600 dark:text-gray-400">Inquilino:</span> {tenant.name}</span>}
        </div>

        {/* Fila inferior: precio + estado */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-bold text-base text-gray-900 dark:text-gray-100 leading-none">
              {fmtPrice(p.price, p.moneda)}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              {p.moneda === "USD" ? "USD · " : ""}{p.operacion === "venta" ? "precio venta" : "por mes"}
            </p>
          </div>
          <Badge status={p.status} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function Properties({ properties, setProperties, owners, leases, tenants, initialFilter = "todos", initialPropertyId = null }) {
  const [search,         setSearch]         = useState("");
  const [filter,         setFilter]         = useState(initialFilter);
  const [modal,          setModal]          = useState(false);
  const [photoModal,     setPhotoModal]     = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [detailProperty, setDetailProperty] = useState(null);

  const { logActivity } = useActivity();

  useEffect(() => {
    if (initialPropertyId && properties.length > 0) {
      const p = properties.find(p => p.id === initialPropertyId);
      if (p) setDetailProperty(p);
    }
  }, [initialPropertyId, properties]);

  const [form, setForm] = useState({
    address: "", type: "Departamento", price: "", status: "vacante",
    ownerId: "", operacion: "alquiler", localidad: "", provincia: "",
    codigoPostal: "", moneda: "ARS",
    m2: "", habitaciones: "", banos: "", descripcion: "",
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
    m2: "", habitaciones: "", banos: "", descripcion: "",
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
      operacion:    p.operacion    || "alquiler",
      localidad:    p.localidad    || "",
      provincia:    p.provincia    || "",
      codigoPostal: p.codigoPostal || "",
      moneda:       p.moneda       || "ARS",
      m2:           p.m2           ?? "",
      habitaciones: p.habitaciones ?? "",
      banos:        p.banos        ?? "",
      descripcion:  p.descripcion  || "",
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
      
      // Registrar actividad
      if (editing) {
        logActivity('property_updated', `Propiedad actualizada`, saved.address, saved.id, 'property');
        setProperties(prev => prev.map(p => p.id === editing ? saved : p));
        setModal(false);
      } else {
        logActivity('property_created', `Propiedad para ${form.operacion} agregada`, saved.address, saved.id, 'property');
        // Propiedad nueva: cerrar modal principal y abrir modal de fotos
        setProperties(prev => [...prev, saved]);
        setEditing(saved.id);
        setModal(false);
        setPhotoModal(true);
      }
    } catch (e) {
      alert("Error al guardar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const closePhotoModal = async () => {
    setPhotoModal(false);
    // Recargar la propiedad para que aparezcan las fotos
    if (editing) {
      try {
        const updated = await apiCall(`/properties/${editing}`);
        setProperties(prev => prev.map(p => p.id === editing ? updated : p));
      } catch (e) {
        console.error("Error recargando propiedad:", e);
      }
    }
    setEditing(null);
  };

  const del = async (id) => {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    try {
      const prop = properties.find(p => p.id === id);
      await apiCall(`/properties/${id}`, { method: "DELETE" });
      logActivity('property_deleted', `Propiedad eliminada`, prop?.address, id, 'property');
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert("Error al eliminar: " + e.message);
    }
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Encabezado */}
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Propiedades</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{properties.length} propiedades registradas</p>
        </div>
        <motion.button 
          onClick={openNew}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} /> Nueva Propiedad
        </motion.button>
      </motion.div>

      {/* Búsqueda y filtros */}
      <motion.div className="flex gap-3" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }}>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por dirección..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-1 bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#404040] rounded-xl p-1">
          {["todos", "ocupado", "vacante"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                filter === f ? "bg-blue-600 text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
          Hacé click en una tarjeta para ver los detalles
        </p>
      )}

      {/* Lista de propiedades */}
      <motion.div
        className="grid gap-3"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {filtered.map(p => (
          <PropertyCard
            key={p.id}
            p={p}
            owners={owners}
            leases={leases}
            tenants={tenants}
            onClick={() => {
            const key = "recentlyViewedProperties";
            const prev = JSON.parse(localStorage.getItem(key) || "[]");
            const updated = [p.id, ...prev.filter(id => id !== p.id)].slice(0, 10);
            localStorage.setItem(key, JSON.stringify(updated));
            setDetailProperty(p);
          }}
            onEdit={openEdit}
            onDelete={del}
          />
        ))}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#262626] rounded-2xl border border-gray-100 dark:border-[#404040] py-16 text-center"
          >
            <Building2 size={36} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-medium text-gray-500 dark:text-gray-400">Sin propiedades</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Agrega tu primera propiedad</p>
          </motion.div>
        )}
      </motion.div>

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
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? "Editar Propiedad" : "Nueva Propiedad"} wide>
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
                      : "border-gray-200 dark:border-[#404040] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#333333]00"
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

          {/* M2 / Habitaciones / Baños */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Superficie (m²)">
              <Input
                type="number" min="1" placeholder="Ej: 65"
                value={form.m2}
                onChange={e => setForm({ ...form, m2: e.target.value })}
              />
            </Field>
            <Field label="Habitaciones">
              <Input
                type="number" min="0" placeholder="Ej: 2"
                value={form.habitaciones}
                onChange={e => setForm({ ...form, habitaciones: e.target.value })}
              />
            </Field>
            <Field label="Baños">
              <Input
                type="number" min="0" placeholder="Ej: 1"
                value={form.banos}
                onChange={e => setForm({ ...form, banos: e.target.value })}
              />
            </Field>
          </div>

          {/* Descripción */}
          <Field label="Descripción breve">
            <textarea
              rows={3}
              placeholder="Ej: Departamento luminoso con balcón, cocina equipada, excelente estado..."
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400 resize-none"
            />
          </Field>

          {/* Tipo / Estado */}
          <div className={`grid gap-4 ${editing ? "grid-cols-2" : "grid-cols-1"}`}>
            <Field label="Tipo">
              <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            {editing && (
              <Field label="Estado">
                <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="vacante">Vacante</option>
                  <option value="ocupado">Ocupado</option>
                </Select>
              </Field>
            )}
          </div>

          {/* Precio + Moneda */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio lista">
              <div className="flex gap-2">
                {/* Toggle ARS / USD */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-[#404040] flex-shrink-0">
                  {["ARS", "USD"].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, moneda: m })}
                      className={`px-3 py-2 text-xs font-semibold transition-colors ${
                        form.moneda === m
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#333333]00"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={form.moneda === "USD" ? "120.000" : "320.000"}
                  value={fmtInputPrice(form.price)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                    setForm({ ...form, price: raw });
                  }}
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

          {/* Fotos — solo al editar, no en creación */}
          {editing && (
            <div className="rounded-xl border border-gray-200 dark:border-[#404040] bg-gray-50 dark:bg-[#1e1e1e] p-4">
              <PhotoManager propertyId={editing} isNewProperty={false} />
            </div>
          )}

          {/* Documentos — solo al editar */}
          {editing && (
            <div className="rounded-xl border border-gray-200 dark:border-[#404040] bg-gray-50 dark:bg-[#1e1e1e] p-4">
              <PropertyDocuments propertyId={editing} />
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#404040] text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#333333]00 transition-colors">
              Cancelar
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Guardando…" : (editing ? "Guardar cambios" : "Agregar Fotos")}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para agregar fotos (solo cuando se crea propiedad nueva) */}
      <Modal open={photoModal} onClose={closePhotoModal} title="Agregar Fotos" wide>
        <div className="space-y-4">
          {editing && (
            <div className="rounded-xl border border-gray-200 dark:border-[#404040] bg-gray-50 dark:bg-[#1e1e1e] p-4">
              <PhotoManager propertyId={editing} isNewProperty={false} />
            </div>
          )}
          
          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button onClick={closePhotoModal}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Listo
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}