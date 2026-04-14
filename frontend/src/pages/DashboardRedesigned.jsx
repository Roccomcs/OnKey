// frontend/src/pages/DashboardRedesigned.jsx
// Dashboard mejorado - Funcional, interactivo y hermoso

import { Plus, Building2, CheckCircle, DollarSign, FileText, Key, Users, PieChart, ArrowUpRight, ArrowDownRight, ScrollText } from 'lucide-react';
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
      whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(0,0,0,0.09)' }}
      transition={{ duration: 0.25 }}
      viewport={{ once: true }}
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-[#333] p-5 transition-all ${onClick ? "cursor-pointer" : "cursor-default"} hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-md dark:hover:shadow-black/40`}
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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      viewport={{ once: true }}
      onClick={() => setActive({ page: "properties", filter: "todos" })}
      className="w-full text-left bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-[#333] p-5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-md dark:hover:shadow-black/40 transition-all"
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
  const totalRent = leases.filter(l => l.status === "activo").reduce((s, l) => s + (l.renta_mensual || 0), 0);
  const activeLeases = leases.filter(l => l.status === "activo").length;

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
            className="space-y-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {dashAlerts.map((alert, idx) => (
              <motion.button
                key={alert.id}
                variants={fadeInUp}
                whileHover={{ x: 3 }}
                onClick={() => setActive({ page: "leases", filter: "activo" })}
                className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${alert.level.bg} ${alert.level.border}`}
              >
                <p className={`text-sm font-medium ${alert.level.color}`}>
                  {alert.nominatario || "Contrato"}
                </p>
                <p className={`text-sm font-bold ${alert.level.color} flex-shrink-0`}>
                  {alert.days <= 0 ? "Venció" : fmtDuration(alert.days)}
                </p>
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
                    whileHover={{ x: 2 }}
                    onClick={() => setActive({ page: "leases", filter: "activo" })}
                    className="w-full text-left flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors border border-transparent hover:border-gray-100 dark:hover:border-[#333]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{lease.nominatario || `Propiedad #${lease.propiedad_id}`}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Propiedad #{lease.propiedad_id}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{fmtCurrency(lease.renta_mensual)}</p>
                      {alert ? (
                        <p className={`text-xs font-medium ${alert.color}`}>
                          {days <= 0 ? "Vencido" : fmtDuration(days)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Hasta {fmtDate(lease.fecha_fin)}</p>
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
