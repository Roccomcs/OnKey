// frontend/src/pages/DashboardRedesigned.jsx
// Dashboard mejorado - Funcional, interactivo y hermoso

import { AlertCircle, AlertTriangle, Plus, Search, TrendingUp, AlertOctagon, Bell, Building2, CheckCircle, DollarSign, FileText, Key, Users, PieChart, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BtnPrimary,
  Card,
  CardProperty,
  SearchInput,
  AlertCard,
  EmptyState,
  MetricCard,
  SectionHeader,
  Table,
  Badge,
  Separator,
} from '../components/ui/redesigned';
import { fmtCurrency, fmtDate, diffDays, fmtDuration, getAlertLevel } from '../utils/helpers';

// ─── StatCard Interactivo ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = "blue", trend, onClick }) {
  const colors = {
    blue:   { bg: "from-blue-600 to-blue-700", icon: "text-blue-600 dark:text-blue-400", light: "bg-blue-50 dark:bg-blue-900/30" },
    green:  { bg: "from-emerald-600 to-emerald-700", icon: "text-emerald-600 dark:text-emerald-400", light: "bg-emerald-50 dark:bg-emerald-900/30" },
    orange: { bg: "from-orange-600 to-orange-700", icon: "text-orange-600 dark:text-orange-400", light: "bg-orange-50 dark:bg-orange-900/30" },
    slate:  { bg: "from-slate-600 to-slate-700", icon: "text-slate-600 dark:text-slate-300", light: "bg-slate-50 dark:bg-slate-700" },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-600 p-5 transition-all ${onClick ? "cursor-pointer" : "cursor-default"} hover:border-blue-400/50 dark:hover:border-blue-500/40 hover:shadow-md dark:hover:shadow-black/40`}
    >
      <div className="flex items-start justify-between">
        <motion.div
          className={`p-3 rounded-lg bg-gradient-to-br ${c.bg}`}
          whileHover={{ scale: 1.1 }}
        >
          <Icon size={20} className="text-white" />
        </motion.div>
        {trend !== undefined && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"}`}
          >
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </motion.span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      </div>
    </motion.button>
  );
}

// ─── Ocupación Progress Bar ────────────────────────────────────────────────────
function OcupacionBar({ properties, setActive }) {
  const occupied = properties.filter(p => p.status === "ocupado").length;
  const vacant = properties.filter(p => p.status === "desocupado").length;
  const percentage = properties.length > 0 ? Math.round((occupied / properties.length) * 100) : 0;

  return properties.length > 0 && (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      onClick={() => setActive({ page: "properties", filter: "todos" })}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-600 p-6 hover:border-blue-400/50 dark:hover:border-blue-500/40 hover:shadow-md dark:hover:shadow-black/40 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <PieChart size={18} className="text-blue-400" />
          </motion.div>
          Tasa de Ocupación
        </h3>
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400"
        >
          {percentage}%
        </motion.span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-emerald-600 rounded-full"
        />
      </div>
      <div className="flex justify-between mt-3 text-xs text-gray-400">
        <span className="text-green-400 font-medium">{occupied} ocupadas</span>
        <span className="text-orange-400 font-medium">{vacant} {vacant === 1 ? 'vacante' : 'vacantes'}</span>
      </div>
    </motion.button>
  );
}

// ─── Main Dashboard Component ──────────────────────────────────────────────────
export function DashboardRedesigned({ properties, leases, tenants, setActive }) {
  const occupied = properties.filter(p => p.status === "ocupado").length;
  const vacant = properties.filter(p => p.status === "desocupado").length;
  const totalRent = leases.filter(l => l.status === "activo").reduce((s, l) => s + (l.renta_mensual || 0), 0);

  // Alertas de vencimiento
  const dashAlerts = leases
    .filter(l => l.status === "activo")
    .map(l => {
      const days = diffDays(l.fecha_fin);
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
    .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
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
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <BtnPrimary onClick={() => setActive('properties')} className="flex gap-2">
            <Plus size={18} />
            Agregar propiedad
          </BtnPrimary>
        </motion.div>
      </motion.div>

      {/* ══════ STATS GRID (5 Cards) ══════ */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
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
          <SectionHeader title="⚠ Alertas de Vencimiento" />
          <motion.div 
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {dashAlerts.map((alert, idx) => (
              <motion.button
                key={alert.id}
                variants={fadeInUp}
                whileHover={{ x: 4 }}
                onClick={() => setActive({ page: "leases", filter: "activo" })}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-lg border transition-all ${alert.level.bg} ${alert.level.border} hover:shadow-lg`}
              >
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${alert.level.dot}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {alert.nominatario || "Contrato"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Propiedad #{alert.propiedad_id}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${alert.level.color}`}>
                    {alert.days <= 0 ? "Venció" : fmtDuration(alert.days)}
                  </p>
                  <p className={`text-xs ${alert.level.color}`}>{alert.level.label}</p>
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
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 text-center"
        >
          <p className="text-base text-green-700 dark:text-green-400 font-medium">✓ Sin alertas</p>
          <p className="text-sm text-green-600 dark:text-green-400/70 mt-1">Todos los contratos están en orden</p>
        </motion.div>
      )}

      <Separator />

      {/* ══════ CONTRATOS RECIENTES ══════ */}
      {recentLeases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionHeader
            title="📋 Contratos Activos Recientes"
            description={`Los últimos ${recentLeases.length} contratos`}
          />

          <Card>
            <motion.div 
              className="space-y-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {recentLeases.map((lease, idx) => {
                const days = diffDays(lease.fecha_fin);
                const alert = getAlertLevel(days);
                return (
                  <motion.button
                    key={lease.id}
                    variants={fadeInUp}
                    whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                    onClick={() => setActive({ page: "leases", filter: "activo" })}
                    className="w-full text-left flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0"
                    >
                      <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Propiedad #{lease.propiedad_id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{lease.nominatario}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{fmtCurrency(lease.renta_mensual)}</p>
                      {alert ? (
                        <p className={`text-xs font-medium ${alert.color}`}>
                          {days <= 0 ? "Vencido" : fmtDuration(days)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">Hasta {fmtDate(lease.fecha_fin)}</p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
