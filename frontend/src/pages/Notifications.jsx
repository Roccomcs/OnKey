import { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Calendar, CheckCircle, DollarSign, Search, X, Phone, Mail, MapPin, Percent, RotateCcw, FileText } from "lucide-react";
import { fmtDate, fmtCurrency, fmtDuration, diffDays, getAlertLevel, apiCall } from "../utils/helpers";

// ─── Modal de detalle de alerta ───────────────────────────────
function AlertDetailModal({ alert, onClose, onGoToContract }) {
  if (!alert) return null;

  const { level, prop, tenant, days } = alert;

  const levelColors = {
    "Crítico": {
      header: "bg-red-500",
      ring:   "ring-red-200 dark:ring-red-900/60",
      btn:    "bg-red-600 hover:bg-red-700 text-white",
    },
    "Urgente": {
      header: "bg-orange-400",
      ring:   "ring-orange-200 dark:ring-orange-900/60",
      btn:    "bg-orange-500 hover:bg-orange-600 text-white",
    },
    "Próximo": {
      header: "bg-amber-400",
      ring:   "ring-amber-200 dark:ring-amber-900/60",
      btn:    "bg-amber-500 hover:bg-amber-600 text-white",
    },
  };

  const c = levelColors[level.label] || levelColors["Próximo"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={`relative bg-white dark:bg-[#262626] rounded-2xl shadow-2xl w-full max-w-md ring-1 ${c.ring} overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${c.header} px-6 py-5`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={18} className="text-white" />
                <span className="text-white font-bold text-base">{level.label}</span>
              </div>
              <p className="text-white/90 text-sm font-medium truncate max-w-xs">{prop?.address}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
              <X size={15} className="text-white" />
            </button>
          </div>
          <div className="mt-4 flex items-end gap-1">
            {days <= 0 ? (
              <p className="text-3xl font-black text-white">Venció</p>
            ) : (
              <>
                <p className="text-4xl font-black text-white leading-none">{days}</p>
                <p className="text-white/80 text-sm mb-1">días restantes</p>
              </>
            )}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin size={11} /> Propiedad
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{prop?.address}</p>
            {prop?.type && <p className="text-xs text-gray-400 dark:text-gray-500">{prop.type}</p>}
          </div>

          <div className="h-px bg-gray-100 dark:bg-[#333333]" />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Inquilino</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{tenant?.name}</p>
            <div className="flex flex-col gap-1.5">
              {tenant?.email && (
                <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Mail size={11} className="text-gray-400 flex-shrink-0" />{tenant.email}
                </span>
              )}
              {tenant?.phone && (
                <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Phone size={11} className="text-gray-400 flex-shrink-0" />{tenant.phone}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-[#333333]" />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><Calendar size={10} /> Inicio</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtDate(alert.startDate)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><Calendar size={10} /> Vencimiento</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtDate(alert.endDate)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={10} /> Renta mensual</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtCurrency(alert.rent)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><Percent size={10} /> Ajuste</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">+{alert.increase}% {alert.period || "anual"}</p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); onGoToContract(); }}
            className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${c.btn}`}
          >
            <FileText size={14} />
            Ver contrato
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Estilos de alerta por nivel ──────────────────────────────
function getCardStyles(level) {
  const map = {
    Crítico: {
      card:  "border border-gray-200/80 dark:border-[#404040]/60 dark:shadow-[inset_3px_0_0_0_rgba(239,68,68,0.55)]",
      icon:  "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40",
      dot:   "bg-red-500",
      badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50",
      days:  "text-red-600 dark:text-red-400",
    },
    Urgente: {
      card:  "border border-gray-200/80 dark:border-[#404040]/60 dark:shadow-[inset_3px_0_0_0_rgba(249,115,22,0.55)]",
      icon:  "bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/40",
      dot:   "bg-orange-400",
      badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50",
      days:  "text-orange-600 dark:text-orange-400",
    },
    Próximo: {
      card:  "border border-gray-200/80 dark:border-[#404040]/60 dark:shadow-[inset_3px_0_0_0_rgba(251,191,36,0.45)]",
      icon:  "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40",
      dot:   "bg-amber-400",
      badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
      days:  "text-amber-600 dark:text-amber-400",
    },
  };
  return map[level.label] || map["Próximo"];
}

// ─── Notifications ────────────────────────────────────────────
export function Notifications({ leases, properties, tenants, activeAlerts, dismiss, setActive }) {
  const [tab,       setTab]       = useState("pendientes");
  const [search,    setSearch]    = useState("");
  const [openAlert, setOpenAlert] = useState(null);

  const allAlerts = leases
    .filter(l => l.status === "activo")
    .map(l => {
      const days       = diffDays(l.endDate);
      const level      = getAlertLevel(days);
      if (!level) return null;
      const prop       = properties.find(p => p.id === l.propertyId);
      const tenant     = tenants.find(t => t.id === l.tenantId);
      const activeInfo = activeAlerts?.find(a => a.contractId === l.id);
      const isDismissed = activeInfo?.isDismissed ?? false;
      return { ...l, days, level, prop, tenant, isDismissed };
    })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days);

  const pendientes = allAlerts.filter(a => !a.isDismissed);
  const revisadas  = allAlerts.filter(a => a.isDismissed);

  const ok = leases
    .filter(l => l.status === "activo" && diffDays(l.endDate) > 90)
    .sort((a, b) => diffDays(a.endDate) - diffDays(b.endDate));

  const filterFn = (a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.prop?.address?.toLowerCase().includes(q) ||
      a.tenant?.name?.toLowerCase().includes(q)
    );
  };

  const filteredPendientes = pendientes.filter(filterFn);
  const filteredRevisadas  = revisadas.filter(filterFn);
  const filteredOk = ok.filter(l => {
    if (!search) return true;
    const q      = search.toLowerCase();
    const prop   = properties.find(p => p.id === l.propertyId);
    const tenant = tenants.find(t => t.id === l.tenantId);
    return prop?.address?.toLowerCase().includes(q) || tenant?.name?.toLowerCase().includes(q);
  });

  const handleOpen = (alert) => {
    setOpenAlert(alert);
    dismiss(alert.id, alert.level.label);
  };

  const handleUndismiss = (alert) => {
    dismiss(alert.id, null);
    if (revisadas.length === 1) setTab("pendientes");
  };

  const handleClose = () => setOpenAlert(null);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Notificaciones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sistema de alertas de vencimiento de contratos</p>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div
        className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-[#404040] rounded-xl p-1 w-fit"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {[
          { key: "pendientes", label: "Pendientes", count: pendientes.length, red: true  },
          { key: "revisadas",  label: "Revisadas",  count: revisadas.length,  red: false },
        ].map(({ key, label, count, red }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSearch(""); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              tab === key
                ? "bg-blue-600 text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === key
                  ? "bg-white/20 text-white"
                  : red
                    ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                    : "bg-gray-100 dark:bg-[#2d2d2d] text-gray-500 dark:text-gray-400"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Buscador */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === "pendientes" ? "Buscar alertas pendientes..." : "Buscar alertas revisadas..."}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400"
        />
      </motion.div>

      {/* ════════ TAB: PENDIENTES ════════ */}
      {tab === "pendientes" && (
        <>
          {/* Leyenda */}
          <motion.div
            className="grid grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              { label: "15 días o menos", color: "bg-red-500",    desc: "Crítico" },
              { label: "16 a 30 días",    color: "bg-orange-400", desc: "Urgente" },
              { label: "31 a 90 días",    color: "bg-amber-400",  desc: "Próximo" },
            ].map(({ label, color, desc }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-[#404040] p-4 flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{desc}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Sin alertas en absoluto */}
          {allAlerts.length === 0 && ok.length === 0 && (
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] py-16 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
              <p className="font-medium text-gray-700 dark:text-gray-300">Sin alertas activas</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Todos los contratos están en regla</p>
            </motion.div>
          )}

          {/* Lista de alertas pendientes */}
          {filteredPendientes.length > 0 ? (
            <motion.div
              className="space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              <motion.p
                className="text-xs text-gray-400 dark:text-gray-500"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
              >
                Tocá una alerta para ver los detalles
              </motion.p>
              {filteredPendientes.map(a => {
                const s = getCardStyles(a.level);
                return (
                  <motion.button
                    key={a.id}
                    onClick={() => handleOpen(a)}
                    className={`w-full text-left rounded-2xl ${s.card} bg-white dark:bg-gray-800 p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-all active:scale-[0.99]`}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}>
                        <AlertTriangle size={16} className={s.days} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{a.prop?.address}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>{a.level.label}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{a.tenant?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {a.days <= 0 ? (
                          <p className={`text-xl font-black ${s.days}`}>Venció</p>
                        ) : (
                          <>
                            <p className={`text-2xl font-black ${s.days}`}>{a.days}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">días</p>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            /* Sin pendientes pero hay revisadas o contratos */
            allAlerts.length > 0 && !search && (
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] py-10 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CheckCircle size={30} className="text-emerald-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Todas las alertas revisadas</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Podés verlas en la tab{" "}
                  <button onClick={() => setTab("revisadas")} className="text-blue-500 hover:underline font-medium">
                    Revisadas
                  </button>
                </p>
              </motion.div>
            )
          )}

          {/* Contratos al día */}
          {filteredOk.length > 0 && (
            <motion.div
              className="space-y-3 pt-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              <motion.p
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
              >
                Contratos al día ({filteredOk.length})
              </motion.p>
              {filteredOk.map(l => {
                const prop   = properties.find(p => p.id === l.propertyId);
                const tenant = tenants.find(t => t.id === l.tenantId);
                const days   = diffDays(l.endDate);
                return (
                  <motion.div
                    key={l.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{prop?.address}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{tenant?.name}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={11} />Vence {fmtDate(l.endDate)}</span>
                          <span className="flex items-center gap-1"><DollarSign size={11} />{fmtCurrency(l.rent)}/mes</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{fmtDuration(days)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">restantes</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* ════════ TAB: REVISADAS ════════ */}
      {tab === "revisadas" && (
        <>
          {filteredRevisadas.length === 0 ? (
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] py-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle size={36} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
              <p className="font-medium text-gray-500 dark:text-gray-400">
                {search ? "Sin resultados para tu búsqueda" : "No hay alertas revisadas"}
              </p>
              {!search && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Las alertas que revisés aparecerán acá
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              <motion.p
                className="text-xs text-gray-400 dark:text-gray-500"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
              >
                Hacé click en ↺ para marcar una alerta como no vista
              </motion.p>
              {filteredRevisadas.map(a => {
                const s = getCardStyles(a.level);
                return (
                  <motion.div
                    key={a.id}
                    className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040]/60 hover:border-gray-400 dark:hover:border-gray-600 px-5 py-4 transition-all"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 0.6 },
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{a.prop?.address}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.tenant?.name} · {a.level.label}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className={`text-sm font-bold ${s.days}`}>
                        {a.days <= 0 ? "Venció" : `${a.days} días`}
                      </p>
                      <button
                        onClick={() => handleUndismiss(a)}
                        title="Marcar como no vista"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333]00 transition-colors"
                      >
                        <RotateCcw size={14} className="text-gray-400 dark:text-gray-500" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      <AlertDetailModal
        alert={openAlert}
        onClose={handleClose}
        onGoToContract={() => setActive({ page: "leases", filter: "activo" })}
      />
    </motion.div>
  );
}
// IndicesAdmin.jsx — panel minimalista de carga manual
import { API } from "../utils/helpers";
import { Field, Input, Select } from "../components/ui/FormField";

export function IndicesAdmin() {
  const [tipo,    setTipo]    = useState("ICL");
  const [periodo, setPeriodo] = useState("");
  const [valor,   setValor]   = useState("");
  const [status,  setStatus]  = useState(null);
  const [syncing, setSyncing] = useState(false);

  const syncBCRA = async () => {
    setSyncing(true);
    setStatus(null);
    try {
      const data = await apiCall(`/indices/sync`, { method: "POST" });
      setStatus({ ok: true, msg: `Sincronizado — ICL: ${data.ICL} registros, IPC: ${data.IPC} registros` });
    } catch (e) {
      setStatus({ ok: false, msg: e.message });
    } finally {
      setSyncing(false);
    }
  };

  const saveManual = async () => {
    if (!periodo || !valor) return;
    try {
      await apiCall(`/indices`, {
        method: "POST",
        body: { tipo, periodo, valor: parseFloat(valor) },
      });
      setStatus({ ok: true, msg: `Guardado: ${tipo} ${periodo.slice(0,7)} = ${valor}` });
      setValor("");
    } catch (e) {
      setStatus({ ok: false, msg: e.message });
    }
  };

  return (
    <div className="space-y-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040]">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Gestión de Índices</h3>

      {/* Sync automático */}
      <button onClick={syncBCRA} disabled={syncing}
        className="w-full py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors">
        {syncing ? "Sincronizando con BCRA…" : "↻ Sincronizar desde API del BCRA"}
      </button>

      {/* Carga manual */}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Tipo">
          <Select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="ICL">ICL</option>
            <option value="IPC">IPC</option>
          </Select>
        </Field>
        <Field label="Período">
          <Input type="month" value={periodo} onChange={e => setPeriodo(e.target.value)} />
        </Field>
        <Field label="Valor">
          <Input type="text" inputMode="decimal" placeholder="Ej: 1234.56" value={valor}
            onChange={e => setValor(e.target.value.replace(/[^0-9.]/g, ''))} />
        </Field>
      </div>
      <button onClick={saveManual}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
        Guardar valor manual
      </button>

      {status && (
        <p className={`text-sm ${status.ok ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400"}`}>
          {status.msg}
        </p>
      )}
    </div>
  );
}