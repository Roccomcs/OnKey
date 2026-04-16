// frontend/src/pages/DashboardRedesigned.jsx
// Dashboard mejorado - Funcional, interactivo y hermoso

import { Plus, Building2, CheckCircle, DollarSign, FileText, Key, Users, PieChart, ArrowUpRight, ArrowDownRight, ScrollText, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BtnPrimary,
  Card,
  SectionHeader,
  Separator,
} from '../components/ui/redesigned';
import { fmtCurrency, fmtDate, diffDays, fmtDuration, getAlertLevel } from '../utils/helpers';

// ─── StatCard limpio estilo mockup ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = "blue", onClick }) {
  const colors = {
    blue:   "from-blue-600 to-blue-700",
    green:  "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
    slate:  "from-slate-600 to-slate-700",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      viewport={{ once: true }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      className={`w-full text-left bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-300 dark:border-gray-600 p-5 transition-all ${onClick ? "cursor-pointer" : "cursor-default"} hover:bg-gray-50 dark:hover:bg-[#262626]`}
    >
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colors[color] || colors.blue} flex items-center justify-center mb-4`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-wide font-medium">{label}</p>
    </motion.button>
  );
}

// ─── Ocupación Progress Bar ────────────────────────────────────────────────────
function OcupacionBar({ properties, setActive }) {
  const occupied   = properties.filter(p => p.status === "ocupado").length;
  const vacant     = properties.filter(p => p.status !== "ocupado").length;
  const percentage = properties.length > 0 ? Math.round((occupied / properties.length) * 100) : 0;

  return properties.length > 0 && (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      viewport={{ once: true }}
      onClick={() => setActive({ page: "properties", filter: "todos" })}
      whileHover={{ scale: 1.02 }}
      className="w-full text-left bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-300 dark:border-gray-600 p-5 hover:bg-gray-50 dark:hover:bg-[#262626] transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tasa de Ocupación
        </h3>
        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">
          {percentage}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-[#2d2d2d] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-emerald-500 rounded-full"
        />
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-emerald-500 font-medium">{occupied} ocupadas</span>
        <span className="text-orange-400 font-medium">{vacant} {vacant === 1 ? 'vacante' : 'vacantes'}</span>
      </div>
    </motion.button>
  );
}

// ─── Main Dashboard Component ──────────────────────────────────────────────────
export function DashboardRedesigned({ properties, leases, tenants, setActive }) {
  const occupied = properties.filter(p => p.status === "ocupado").length;
  const vacant = properties.filter(p => p.status === "desocupado").length;
  const totalRent = leases.filter(l => l.status === "activo").reduce((s, l) => s + (l.rent || 0), 0);
  const activeLeases = leases.filter(l => l.status === "activo").length;

  // Debug: verificar datos de leases
  console.log('[Dashboard] leases:', leases);
  console.log('[Dashboard] activeLeases count:', activeLeases);

  // Alertas de vencimiento
  const dashAlerts = leases
    .filter(l => l.status === "activo")
    .map(l => {
      const days = diffDays(l.endDate);
      const level = getAlertLevel(days);
      if (!level) return null;
      return { ...l, days, level };
    })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  // Contratos recientes
  const recentLeases = [...leases]
    .filter(l => l.status === "activo")
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5);

  // Animación de entrada para contenedor
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div 
      className="space-y-8 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ══════ HEADER ══════ */}
      <motion.div 
        {...fadeInUp}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </motion.div>

      {/* ══════ STATS GRID (5 Cards) ══════ */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <motion.div variants={fadeInUp}>
          <StatCard
            icon={Building2}
            label="Propiedades"
            value={properties.length}
            color="blue"
            trend={8}
            onClick={() => setActive({ page: "properties", filter: "todos" })}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <StatCard
            icon={CheckCircle}
            label="Ocupadas"
            value={occupied}
            color="green"
            onClick={() => setActive({ page: "properties", filter: "ocupado" })}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <StatCard
            icon={Key}
            label="Vacantes"
            value={vacant}
            color="orange"
            onClick={() => setActive({ page: "properties", filter: "desocupado" })}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <StatCard
            icon={DollarSign}
            label="Renta Mensual"
            value={fmtCurrency(totalRent)}
            color="slate"
            trend={6}
            onClick={() => setActive({ page: "leases", filter: "activo" })}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <StatCard
            icon={Users}
            label="Contactos"
            value={tenants.length}
            color="blue"
            onClick={() => setActive("contacts")}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <StatCard
            icon={ScrollText}
            label="Contratos"
            value={activeLeases}
            color="slate"
            onClick={() => setActive({ page: "leases", filter: "activo" })}
          />
        </motion.div>
      </motion.div>

      <Separator />

      {/* ══════ OCUPACIÓN BAR ══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <OcupacionBar properties={properties} setActive={setActive} />
      </motion.div>

      <Separator />

      {/* ══════ ALERTAS ══════ */}
      {dashAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader title="Alertas de Vencimiento" />
          <motion.div
            className="grid gap-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {dashAlerts.map((alert, idx) => (
              <motion.button
                key={alert.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActive({ page: "leases", filter: "activo" })}
                className={`w-full text-left group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-all cursor-pointer flex items-start gap-4`}
              >
                {/* Icono con fondo de alerta */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.level.bg} border ${alert.level.border}`}>
                  {alert.level.label.includes('Crítico') && <AlertCircle size={16} className={alert.level.color} />}
                  {alert.level.label.includes('Urgente') && <AlertTriangle size={16} className={alert.level.color} />}
                  {alert.level.label.includes('Próximo') && <Clock size={16} className={alert.level.color} />}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {alert.nominatario || "Contrato"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${alert.level.color}`}>
                      {alert.level.label}
                    </span>
                  </div>
                </div>

                {/* Días restantes */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-lg leading-none ${alert.level.color}`}>
                    {alert.days <= 0 ? "Venció" : `${alert.days} días`}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}

      {dashAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] p-5 text-center"
        >
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 font-medium">✓ Sin alertas</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Todos los contratos están en orden</p>
        </motion.div>
      )}

      <Separator />

      {/* ══════ CONTRATOS RECIENTES ══════ */}
      {recentLeases.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionHeader
            title="📋 Contratos Activos Recientes"
            description={`Los últimos ${recentLeases.length} contratos`}
          />

          <motion.div 
            className="grid gap-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
              {recentLeases.map((lease, idx) => {
                const days = diffDays(lease.endDate);
                const alert = getAlertLevel(days);
                const prop = properties.find(p => p.id === lease.propertyId);
                return (
                  <motion.button
                    key={lease.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActive({ page: "leases", filter: "activo" })}
                    className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-all cursor-pointer flex items-start gap-4"
                  >
                    {/* Icono */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                      <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {prop?.address || `Propiedad #${lease.propertyId}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {fmtCurrency(lease.rent)}/mes
                      </p>
                    </div>

                    {/* Estado */}
                    <div className="text-right flex-shrink-0">
                      {alert ? (
                        <>
                          <p className={`font-bold text-lg leading-none ${alert.color}`}>
                            {days <= 0 ? "Vencido" : `${days} días`}
                          </p>
                          <p className={`text-xs mt-0.5 ${alert.color}`}>{alert.label}</p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400">Hasta {fmtDate(lease.endDate)}</p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-[#404040] p-5 text-center"
        >
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">No hay contratos activos</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Creá el primer contrato para comenzar</p>
        </motion.div>
      )}
    </motion.div>
  );
}
