// frontend/src/pages/Leases.jsx
import { useState, useEffect } from "react";
import { FileText, Plus, Search, Edit2, Trash2, Calendar, DollarSign, Percent, TrendingUp } from "lucide-react";
import { Badge }              from "../components/ui/Badge";
import { AjusteBadge, LeaseDetailModal } from "../components/leases/LeaseDetailModal";
import { LeaseFormModal }     from "../components/leases/LeaseFormModal";
import { IndicesPanel }       from "../components/leases/IndicesPanel";
import { fmtDate, fmtCurrency, diffDays, getAlertLevel, isValidDate, API, apiCall } from "../utils/helpers";

const TABS = ["activo", "vencido", "rescindido", "renovado", "todos"];

const EMPTY_FORM = {
  propertyId: "", tenantId: "", startDate: "", endDate: "", rent: "",
  tipoAjuste: "FIJO", increase: "6", iclVariacion: "", period: "anual", status: "activo",
};

export function Leases({ properties, setProperties, owners, tenants, leases, setLeases, initialTab = "activo" }) {
  const [tab,     setTab]     = useState(initialTab);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [detail,  setDetail]  = useState(null);
  const [formErr, setFormErr] = useState("");
  const [form,    setForm]    = useState(EMPTY_FORM);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  // ── Lista filtrada ──────────────────────────────────────────
  const filtered = leases.filter(l => {
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
      propertyId: l.propertyId,
      tenantId:   l.tenantId,
      startDate:  l.startDate  ?? "",
      endDate:    l.endDate    ?? "",
      rent:       String(l.rent),
      tipoAjuste: l.tipoAjuste ?? "FIJO",
      increase:     String(l.increase ?? 6),
      iclVariacion: String(l.indiceBaseValor ?? ""),
      period:       l.period     ?? "anual",
      status:       l.status     ?? "activo",
    });
    setFormErr("");
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); };

  const validate = () => {
    if (!form.propertyId)             return "Seleccioná una propiedad.";
    if (!form.tenantId)               return "Seleccioná un inquilino.";
    
    // Validar que el inquilino tenga email válido
    const tenant = tenants.find(t => t.id === form.tenantId);
    if (!tenant?.email || !tenant.email.includes("@")) {
      return "El inquilino debe tener un email válido para crear un contrato.";
    }
    
    if (!isValidDate(form.startDate)) return "La fecha de inicio no es válida.";
    if (!isValidDate(form.endDate))   return "La fecha de fin no es válida.";
    if (new Date(form.endDate) <= new Date(form.startDate))
                                      return "La fecha de fin debe ser posterior al inicio.";
    if (!form.rent || Number(form.rent) <= 0) return "Ingresá un monto de renta válido.";
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
      const saved = await apiCall(url, {
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
          period:       form.period,
          status:       form.status,
        }),
      });
      if (editing) {
        setLeases(prev => prev.map(l => l.id === editing ? { ...l, ...saved } : l));
      } else {
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
      setLeases(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contratos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {leases.filter(l => l.status === "activo").length} contratos activos
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200">
          <Plus size={16} /> Nuevo Contrato
        </button>
      </div>

      {/* Panel de índices */}
      <IndicesPanel />

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => {
          const count = t === "todos" ? leases.length : leases.filter(l => l.status === t).length;
          return (
            <button key={t} onClick={() => { setTab(t); setSearch(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                tab === t
                  ? "bg-violet-600 text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              {t}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por propiedad o inquilino…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900 outline-none transition-all placeholder:text-gray-400"
        />
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
          Hacé click en un contrato para ver los detalles
        </p>
      )}

      {/* Lista */}
      <div className="grid gap-3">
        {filtered.map(l => {
          const prop   = properties.find(p => p.id === l.propertyId);
          const tenant = tenants.find(t => t.id === l.tenantId);
          const days   = diffDays(l.endDate);
          const alert  = l.status === "activo" ? getAlertLevel(days) : null;

          return (
            <div key={l.id} onClick={() => setDetail(l)}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  alert ? `${alert.bg} border ${alert.border}` : "bg-violet-50 dark:bg-violet-900/30"
                }`}>
                  <FileText size={16} className={alert ? alert.color : "text-violet-600 dark:text-violet-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {prop?.address || "(propiedad eliminada)"}
                    </p>
                    <Badge status={l.status} />
                    <AjusteBadge tipo={l.tipoAjuste} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {tenant?.name || "(inquilino eliminado)"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />{fmtDate(l.startDate)} — {fmtDate(l.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={11} />{fmtCurrency(l.rent)}/mes
                    </span>
                    {l.tipoAjuste === "FIJO" && l.increase > 0 && (
                      <span className="flex items-center gap-1">
                        <Percent size={11} />+{l.increase}% {l.period}
                      </span>
                    )}
                    {l.proximaActualizacion && (
                      <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                        <TrendingUp size={11} />Próx. act.: {fmtDate(l.proximaActualizacion)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {alert && (
                    <div className="text-right mr-1">
                      <p className={`text-xl font-black leading-none ${alert.color}`}>
                        {days <= 0 ? "Venció" : `${days}d`}
                      </p>
                      <p className={`text-xs ${alert.color}`}>{alert.label}</p>
                    </div>
                  )}
                  <button onClick={() => openEdit(l)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Edit2 size={13} className="text-gray-400" />
                  </button>
                  <button onClick={() => del(l.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-16 text-center">
            <FileText size={36} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-medium text-gray-500 dark:text-gray-400">
              {search ? "Sin resultados para tu búsqueda" : "Sin contratos"}
            </p>
            {!search && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Creá el primer contrato con el botón de arriba
              </p>
            )}
          </div>
        )}
      </div>

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
        properties={properties}
        tenants={tenants}
        leases={leases}
      />
    </div>
  );
}