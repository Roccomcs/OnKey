// frontend/src/pages/Leases.jsx
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Plus, Search, Edit2, Trash2, Calendar, DollarSign, Percent, TrendingUp, Home, ShoppingBag } from "lucide-react";
import { Badge }              from "../components/ui/Badge";
import { AjusteBadge, LeaseDetailModal } from "../components/leases/LeaseDetailModal";
import { AjusteDinamico }     from "../components/leases/AjusteDinamico";
import { LeaseFormModal }     from "../components/leases/LeaseFormModal";
import { LeaseRenewModal }    from "../components/leases/LeaseRenewModal";
import { IndicesPanel }       from "../components/leases/IndicesPanel";
import { useActivity }        from "../hooks/useActivity";
import { fmtDate, fmtCurrency, diffDays, getAlertLevel, isValidDate, API, apiCall } from "../utils/helpers";

const TABS_ALQUILER = ["activo", "vencido", "rescindido", "renovado", "todos"];
const TABS_VENTA    = ["activo", "rescindido", "todos"];

const EMPTY_FORM = {
  propertyId: "", tenantId: "", startDate: "", endDate: "", rent: "",
  tipoAjuste: "FIJO", increase: "6", iclVariacion: "", indiceBase: "", period: "anual", status: "activo",
};

export function Leases({ properties, setProperties, owners, tenants, leases, setLeases, initialTab = "activo", setActive }) {
  // Modo principal: alquiler | venta
  const [modo,    setModo]    = useState("alquiler");
  const [tab,     setTab]     = useState(initialTab);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [detail,  setDetail]  = useState(null);
  const [renewingLease, setRenewingLease] = useState(null);
  const [formErr, setFormErr] = useState("");
  const [form,    setForm]    = useState(EMPTY_FORM);

  const { logActivity } = useActivity();

  useEffect(() => { setTab(initialTab); }, [initialTab]);
  // Al cambiar de modo resetear tab
  useEffect(() => { setTab("activo"); setSearch(""); }, [modo]);

  // Propiedades según el modo activo
  const propiedadesModo = properties.filter(p =>
    modo === "alquiler" ? p.operacion !== "venta" : p.operacion === "venta"
  );

  // IDs de propiedades del modo
  const idsPropiedadesModo = new Set(propiedadesModo.map(p => p.id));

  // Contratos del modo
  const leasesModo = leases.filter(l => idsPropiedadesModo.has(l.propertyId));

  // Tabs según modo
  const TABS = modo === "alquiler" ? TABS_ALQUILER : TABS_VENTA;

  // Lista filtrada
  const filtered = leasesModo.filter(l => {
    const matchTab    = tab === "todos" || l.status === tab;
    const prop        = properties.find(p => p.id === l.propertyId);
    const tenant      = tenants.find(t => t.id === l.tenantId);
    const q           = search.toLowerCase();
    const matchSearch = !search ||
      prop?.address?.toLowerCase().includes(q) ||
      tenant?.name?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  // ── Handlers ───────────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErr("");
    setModal(true);
  };

  const openEdit = (l) => {
    setEditing(l.id);
    setForm({
      propertyId:   l.propertyId,
      tenantId:     l.tenantId,
      startDate:    l.startDate    ?? "",
      endDate:      l.endDate      ?? "",
      rent:         String(l.rent),
      tipoAjuste:   l.tipoAjuste   ?? "FIJO",
      increase:     String(l.increase ?? 6),
      iclVariacion: String(l.increase ?? ""),
      indiceBase:   String(l.indiceBaseValor ?? ""),
      period:       l.period       ?? "anual",
      status:       l.status       ?? "activo",
    });
    setFormErr("");
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); };

  const validate = () => {
    if (!form.propertyId) return "Seleccioná una propiedad.";
    if (!form.tenantId)   return "Seleccioná un inquilino / comprador.";
    const tenant = tenants.find(t => t.id === form.tenantId);
    if (!tenant?.email || !tenant.email.includes("@"))
      return "El inquilino/comprador debe tener un email válido.";
    if (!isValidDate(form.startDate)) return "La fecha de inicio no es válida.";
    if (!isValidDate(form.endDate))   return "La fecha de fin no es válida.";
    if (new Date(form.endDate) <= new Date(form.startDate))
      return "La fecha de fin debe ser posterior al inicio.";
    if (!form.rent || Number(form.rent) <= 0) return "Ingresá un monto válido.";
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) { setFormErr(err); return; }
    setSaving(true);
    setFormErr("");
    try {
      const method = editing ? "PUT" : "POST";
      const url    = editing ? `/leases/${editing}` : `/leases`;
      const saved  = await apiCall(url, {
        method,
        body: JSON.stringify({
          propertyId:   form.propertyId,
          tenantId:     form.tenantId,
          startDate:    form.startDate,
          endDate:      form.endDate,
          rent:         Number(form.rent),
          tipoAjuste:   form.tipoAjuste,
          increase:     form.tipoAjuste === "FIJO" ? Number(form.increase) : 0,
          iclVariacion: form.tipoAjuste === "ICL"  ? form.iclVariacion : undefined,
          indiceBase:   (form.tipoAjuste === "ICL" || form.tipoAjuste === "IPC") && form.indiceBase ? Number(form.indiceBase) : undefined,
          period:       form.period,
          status:       form.status,
        }),
      });
      
      const prop = properties.find(p => p.id === form.propertyId);
      const tenant = tenants.find(t => t.id === form.tenantId);
      const title = modo === "alquiler" ? "Contrato de Alquiler" : "Contrato de Venta";
      
      if (editing) {
        logActivity('lease_updated', `${title} actualizado`, `${prop?.address} - ${tenant?.name}`, saved.id, 'lease');
        setLeases(prev => prev.map(l => l.id === editing ? { ...l, ...saved } : l));
      } else {
        logActivity('lease_created', `${title} creado`, `${prop?.address} - ${tenant?.name}`, saved.id, 'lease');
        setLeases(prev => [...prev, saved]);
        setProperties(prev => prev.map(p =>
          p.id === form.propertyId ? { ...p, status: "ocupado", leaseId: saved.id } : p
        ));
      }
      closeModal();
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("¿Eliminar este contrato? Esta acción no se puede deshacer.")) return;
    try {
      await apiCall(`/leases/${id}`, { method: "DELETE" });
      const deleted = leases.find(l => l.id === id);
      setLeases(prev => prev.filter(l => l.id !== id));
      if (deleted) {
        setProperties(prev => prev.map(p =>
          p.id === deleted.propertyId ? { ...p, status: "vacante", leaseId: null } : p
        ));
      }
    } catch (e) {
      alert("Error al eliminar: " + e.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiCall(`/leases/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const lease = leases.find(l => l.id === id);
      const prop = properties.find(p => p.id === lease?.propertyId);
      const tenant = tenants.find(t => t.id === lease?.tenantId);
      const description = `${prop?.address} - ${tenant?.name}`;
      
      // Registrar actividad según el estado
      if (status === "rescindido") {
        logActivity('lease_rescinded', `Contrato rescindido`, description, id, 'lease');
      } else if (status === "vencido") {
        logActivity('lease_ended', `Contrato vencido`, description, id, 'lease');
      } else if (status === "renovado") {
        logActivity('lease_renewed', `Contrato renovado`, description, id, 'lease');
      }
      
      setLeases(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      
      // Si se rescinde, actualizar la propiedad a desocupado
      // Si es renovado, mantener ocupado (se maneja en el modal)
      if (status === "rescindido") {
        const rescindedLease = leases.find(l => l.id === id);
        if (rescindedLease) {
          setProperties(prev => prev.map(p =>
            p.id === rescindedLease.propertyId ? { ...p, status: "desocupado", leaseId: null } : p
          ));
        }
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const esVenta = modo === "venta";

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

      {/* Encabezado */}
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Contratos</h1>
          <p className="text-gray-400 mt-2">
            {leasesModo.filter(l => l.status === "activo").length} contratos activos · {esVenta ? "Venta" : "Alquiler"}
          </p>
        </div>
        <motion.button onClick={openNew} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/20">
          <Plus size={16} /> {esVenta ? "Nueva Venta" : "Nuevo Alquiler"}
        </motion.button>
      </motion.div>

      {/* Selector Alquiler / Venta */}
      <motion.div
        className="flex gap-2 p-1 bg-white dark:bg-[#333333] border border-gray-200 dark:border-[#404040] rounded-xl w-fit"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <button
          onClick={() => setModo("alquiler")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            modo === "alquiler"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <Home size={14} /> Alquiler
        </button>
        <button
          onClick={() => setModo("venta")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            modo === "venta"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <ShoppingBag size={14} /> Venta
        </button>
      </motion.div>

      {/* Panel de índices — solo en alquiler */}
      {!esVenta && <IndicesPanel />}

      {/* Tabs de estado */}
      <motion.div
        className="flex gap-1 bg-white dark:bg-[#333333] border border-gray-200 dark:border-[#404040] rounded-xl p-1 w-fit flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        {TABS.map(t => {
          const count = t === "todos" ? leasesModo.length : leasesModo.filter(l => l.status === t).length;
          return (
            <button key={t} onClick={() => { setTab(t); setSearch(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                tab === t
                  ? esVenta ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              {t}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-[#3a3a3a] text-gray-500 dark:text-gray-400"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Buscador */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={esVenta ? "Buscar por propiedad o comprador…" : "Buscar por propiedad o inquilino…"}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#333333] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400"
        />
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
          Hacé click en un contrato para ver los detalles
        </p>
      )}

      {/* Lista */}
      <motion.div className="grid gap-3" variants={staggerContainer} initial="initial" animate="animate">
        {filtered.map(l => {
          const prop   = properties.find(p => p.id === l.propertyId);
          const tenant = tenants.find(t => t.id === l.tenantId);
          const days   = diffDays(l.endDate);
          const alert  = l.status === "activo" ? getAlertLevel(days) : null;

          return (
            <motion.button
              key={l.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              onClick={() => setDetail(l)}
              className="bg-white dark:bg-[#333333] rounded-2xl border border-gray-100 dark:border-[#404040] p-5 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-black/40 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  alert
                    ? `${alert.bg} border ${alert.border}`
                    : esVenta
                      ? "bg-amber-100 dark:bg-amber-900/30"
                      : "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  {esVenta
                    ? <ShoppingBag size={16} className={alert ? alert.color : "text-amber-600 dark:text-amber-400"} />
                    : <FileText    size={16} className={alert ? alert.color : "text-blue-600 dark:text-blue-400"} />
                  }
                </div>

                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {prop?.address || "(propiedad eliminada)"}
                    </p>
                    <Badge status={l.status} />
                    {!esVenta && <AjusteBadge tipo={l.tipoAjuste} />}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {esVenta ? "Comprador: " : "Inquilino: "}{tenant?.name || "(eliminado)"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{fmtDate(l.startDate)} — {fmtDate(l.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />
                      {fmtCurrency(l.rent)}{esVenta ? " precio venta" : "/mes"}
                    </span>
                    {!esVenta && l.tipoAjuste === "FIJO" && l.increase > 0 && (
                      <span className="flex items-center gap-1">
                        <Percent size={12} />+{l.increase}% {l.period}
                      </span>
                    )}
                    {!esVenta && (l.tipoAjuste === "ICL" || l.tipoAjuste === "IPC") && (
                      <AjusteDinamico lease={l} />
                    )}
                  </div>
                </div>

                {/* Alerta y botones */}
                <div className="flex items-start gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {alert && !esVenta && (
                    <div className="text-right mr-1">
                      <p className={`text-lg font-bold leading-none ${alert.color}`}>
                        {days <= 0 ? "Venció" : `${days} días`}
                      </p>
                      <p className={`text-xs mt-0.5 ${alert.color}`}>{alert.label}</p>
                    </div>
                  )}
                  <button onClick={() => openEdit(l)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#27272a] transition-colors">
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => del(l.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </motion.button>
          );
        })}

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="bg-white dark:bg-[#333333] rounded-2xl border border-gray-100 dark:border-[#404040] py-16 text-center">
            {esVenta
              ? <ShoppingBag size={36} className="text-emerald-400 mx-auto mb-3" />
              : <FileText size={36} className="text-emerald-400 mx-auto mb-3" />
            }
            <p className="font-medium text-gray-700 dark:text-gray-300">
              {search 
                ? "Sin resultados para tu búsqueda" 
                : tab === "todos"
                  ? esVenta ? "Sin contratos de venta" : "Sin contratos de alquiler"
                  : `Sin contratos ${tab}s`
              }
            </p>
            {!search && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {tab === "todos" ? (
                  esVenta
                    ? "Creá el primer contrato de venta con el botón de arriba"
                    : "Creá el primer contrato de alquiler con el botón de arriba"
                ) : (
                  `No hay contratos en estado "${tab}" en este momento`
                )}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Modal detalle */}
      {detail && (
        <LeaseDetailModal
          lease={detail}
          properties={properties}
          tenants={tenants}
          owners={owners}
          onClose={() => setDetail(null)}
          onEdit={(l) => { setDetail(null); openEdit(l); }}
          onDelete={(id) => { setDetail(null); del(id); }}
          onStatusChange={(id, status) => {
            updateStatus(id, status);
            setDetail(prev => prev ? { ...prev, status } : null);
          }}
          onRenew={(l) => {
            setDetail(null);
            setRenewingLease(l);
          }}
        />
      )}

      {/* Modal renovar */}
      {renewingLease && (
        <LeaseRenewModal
          lease={renewingLease}
          property={properties.find(p => p.id === renewingLease.propertyId)}
          tenant={tenants.find(t => t.id === renewingLease.tenantId)}
          owner={owners.find(o => o.id === properties.find(p => p.id === renewingLease.propertyId)?.ownerId)}
          onClose={() => setRenewingLease(null)}
          onRenewed={(newLease) => {
            setRenewingLease(null);
            setLeases(prev => [...prev, newLease]);
            setProperties(prev =>
              prev.map(p =>
                p.id === renewingLease.propertyId
                  ? { ...p, leaseId: newLease.id, status: "ocupado" }
                  : p
              )
            );
          }}
        />
      )}

      {/* Modal crear/editar */}
      <LeaseFormModal
        open={modal}
        onClose={closeModal}
        editing={editing}
        saving={saving}
        formErr={formErr}
        form={form}
        setForm={setForm}
        onSave={save}
        properties={propiedadesModo}
        tenants={tenants}
        leases={leases}
        modo={modo}
        onNavigate={setActive}
      />
    </motion.div>
  );
}