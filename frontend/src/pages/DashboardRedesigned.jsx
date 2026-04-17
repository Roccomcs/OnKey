// frontend/src/pages/DashboardRedesigned.jsx
// Dashboard rediseñado — estilo moderno dark/light con gráfico de ingresos

import { useState, useEffect } from 'react';
import { Building2, CheckCircle, DollarSign, FileText, Bell, ArrowUpRight, TrendingUp, Home, Users } from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { fmtCurrency, fmtDate, diffDays, fmtDuration, getAlertLevel, apiCall } from '../utils/helpers';

// ─── Colores del gráfico de dona ──────────────────────────────────────────────
const DONUT_COLORS = ['#4a9fff', '#27272a'];
const DONUT_COLORS_LIGHT = ['#4a9fff', '#e2e8f0'];

// ─── Tooltip personalizado para el área chart ────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b] dark:bg-[#18181b] light:bg-white border border-[#27272a] dark:border-[#27272a] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-[#71717a] mb-1">{label}</p>
      <p className="text-base font-bold text-white dark:text-white">{fmtCurrency(payload[0].value)}</p>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, color = "blue", onClick }) {
  const iconBg = {
    blue:   "bg-blue-500/10 text-blue-400",
    green:  "bg-emerald-500/10 text-emerald-400",
    orange: "bg-orange-500/10 text-orange-400",
    red:    "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
    slate:  "bg-slate-500/10 text-slate-400",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-[#262626] border border-gray-100 dark:border-[#404040] rounded-2xl p-5 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg dark:hover:shadow-black/40 ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[color] || iconBg.blue}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            <ArrowUpRight size={12} />
            +{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-[#f4f4f5] tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1.5 font-medium">{label}</p>
    </motion.button>
  );
}

// ─── Donut / Pie de Ocupación ─────────────────────────────────────────────────
function OcupacionDonut({ occupied, total, dark }) {
  const vacant   = total - occupied;
  const pct      = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const data     = [{ value: occupied }, { value: Math.max(vacant, 0) }];
  const colors   = dark ? DONUT_COLORS : DONUT_COLORS_LIGHT;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <PieChart width={144} height={144}>
          <Pie
            data={data}
            cx={68}
            cy={68}
            innerRadius={48}
            outerRadius={65}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-[#f4f4f5]">{pct}%</span>
          <span className="text-[10px] text-gray-500 dark:text-[#71717a] font-medium">Ocupadas</span>
        </div>
      </div>
      <div className="flex gap-5 mt-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4a9fff]" />
          <div className="text-center">
            <p className="text-[10px] text-gray-500 dark:text-[#71717a]">Ocupadas</p>
            <p className="text-sm font-bold text-gray-900 dark:text-[#f4f4f5]">{occupied}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0] dark:bg-[#27272a]" />
          <div className="text-center">
            <p className="text-[10px] text-gray-500 dark:text-[#71717a]">Disponibles</p>
            <p className="text-sm font-bold text-gray-900 dark:text-[#f4f4f5]">{vacant}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Actividad reciente item ──────────────────────────────────────────────────
function ActivityItem({ icon: Icon, iconBg, title, subtitle, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-[#e4e4e7] leading-tight">{title}</p>
        <p className="text-xs text-gray-500 dark:text-[#71717a] mt-0.5 truncate">{subtitle}</p>
      </div>
      <span className="text-[11px] text-gray-400 dark:text-[#52525b] flex-shrink-0 mt-0.5">{time}</span>
    </div>
  );
}

// ─── Indicador de rendimiento ─────────────────────────────────────────────────
function PerfRow({ label, value, trend }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 dark:text-[#71717a] mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-[#f4f4f5]">{value}</p>
      </div>
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
        <TrendingUp size={13} />
        {trend}
      </span>
    </div>
  );
}

// ─── Propiedad reciente card ──────────────────────────────────────────────────
// ─── Propiedad reciente card con fotos ──────────────────────────────────────
function RecentPropertyCard({ property, onClick }) {
  const [photo, setPhoto] = useState(null);
  
  useEffect(() => {
    const loadPhoto = async () => {
      try {
        const data = await apiCall(`/properties/${property.id}/photos`);
        if (data && data.length > 0) {
          setPhoto(data[0].url);
        }
      } catch (e) {
        // Silenciar si no hay fotos
      }
    };
    if (property.id) loadPhoto();
  }, [property.id]);

  const statusCfg = {
    ocupado:      { label: "Ocupada",      cls: "bg-emerald-500/90 text-white" },
    desocupado:   { label: "Disponible",   cls: "bg-blue-500/90 text-white" },
    mantenimiento:{ label: "Mantenimiento",cls: "bg-orange-500/90 text-white" },
  };
  const cfg = statusCfg[property.status] || statusCfg.desocupado;

  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-[#262626] border border-gray-100 dark:border-[#404040] rounded-2xl overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg dark:hover:shadow-black/40 transition-all"
    >
      {/* Imagen */}
      <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-[#1a1a2e] dark:to-[#0f0f1a] relative overflow-hidden">
        {photo ? (
          <img src={photo} alt={property.address} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Home size={48} className="text-white" />
          </div>
        )}
        <span className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] text-gray-400 dark:text-[#71717a]">📍</span>
          <p className="text-sm font-semibold text-gray-800 dark:text-[#e4e4e7] truncate">{property.address || `Propiedad #${property.id}`}</p>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-[#71717a] mb-3">{property.type || "Propiedad"}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold text-gray-900 dark:text-[#f4f4f5]">{fmtCurrency(property.price || 0)}</span>
          <span className="text-[11px] text-gray-400 dark:text-[#71717a]">/mes</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Generar datos del gráfico (6 meses anteriores + actual) ─────────────────
function buildChartData(leases) {
  const now   = new Date();
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const result = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = months[d.getMonth()];

    // Sumar rentas de contratos activos en ese mes
    const total = leases
      .filter(l => l.status === "activo" || l.status === "vencido")
      .reduce((acc, l) => {
        const start = new Date(l.startDate);
        const end   = new Date(l.endDate);
        if (start <= d && end >= d) acc += (l.rent || 0);
        return acc;
      }, 0);

    result.push({ mes: label, ingresos: total });
  }
  return result;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function DashboardRedesigned({ properties, leases, tenants, setActive, dark, user }) {
  const occupied    = properties.filter(p => p.status === "ocupado").length;
  const vacant      = properties.filter(p => p.status === "desocupado").length;
  const totalRent   = leases.filter(l => l.status === "activo").reduce((s, l) => s + (l.rent || 0), 0);
  const activeLeases = leases.filter(l => l.status === "activo").length;

  const dashAlerts = leases
    .filter(l => l.status === "activo")
    .map(l => { const days = diffDays(l.endDate); const level = getAlertLevel(days); if (!level) return null; return { ...l, days, level }; })
    .filter(Boolean).sort((a, b) => a.days - b.days).slice(0, 4);

  const recentLeases = [...leases]
    .filter(l => l.status === "activo")
    .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
    .slice(0, 5);

  const recentViewedIds = JSON.parse(localStorage.getItem("recentlyViewedProperties") || "[]");
  const recentProps = recentViewedIds.length > 0
    ? recentViewedIds.map(id => properties.find(p => p.id === id)).filter(Boolean).slice(0, 3)
    : [...properties].sort((a, b) => b.id - a.id).slice(0, 3);

  const chartData = buildChartData(leases);
  const isDark    = dark ?? document.documentElement.classList.contains('dark');

  // Calcular trend vs mes anterior desde el chart
  const lastVal  = chartData[chartData.length - 1]?.ingresos || 0;
  const prevVal  = chartData[chartData.length - 2]?.ingresos || 0;
  const rentTrend = prevVal > 0 ? (((lastVal - prevVal) / prevVal) * 100).toFixed(1) : null;

  const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className="space-y-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* ══ HEADER ══ */}
      <motion.div {...fadeUp} className="flex items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f4f4f5] tracking-tight">
            {getGreeting()}, {getFirstName(user)}
          </h1>
        </div>
      </motion.div>

      {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign,  label: "Rentas Activas",       value: fmtCurrency(totalRent),  color: "blue",   trend: 12.5, onClick: () => setActive({ page: "leases",      filter: "activo" }) },
          { icon: FileText,    label: "Contratos por Vencer", value: dashAlerts.length,        color: "orange",             onClick: () => setActive({ page: "notifications", filter: null }) },
          { icon: Building2,   label: "Propiedades Totales",  value: properties.length,        color: "purple", trend: 5,    onClick: () => setActive({ page: "properties",   filter: "todos" }) },
          { icon: Bell,        label: "Alertas Activas",      value: dashAlerts.length,        color: "red",                onClick: () => setActive({ page: "notifications", filter: null }) },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...c} />
          </motion.div>
        ))}
      </div>

      {/* ══ GRÁFICO + OCUPACIÓN ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Área chart — ocupa 2/3 */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white dark:bg-[#18181b] border border-[#e2e8f0] dark:border-[#27272a] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm text-gray-500 dark:text-[#71717a] font-medium">Ingresos Mensuales</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-[#f4f4f5] mt-1">{fmtCurrency(lastVal)}</p>
              {rentTrend !== null && (
                <p className="text-sm text-emerald-500 font-semibold mt-0.5">
                  +{rentTrend}% vs mes anterior
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4a9fff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4a9fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#f1f5f9"} vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: isDark ? '#71717a' : '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => v === 0 ? '$0' : `$${(v/1000).toFixed(0)}K`}
                  tick={{ fill: isDark ? '#71717a' : '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#4a9fff"
                  strokeWidth={2.5}
                  fill="url(#incomeGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#4a9fff', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut — ocupa 1/3 */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#18181b] border border-[#e2e8f0] dark:border-[#27272a] rounded-2xl p-6 flex flex-col"
        >
          <p className="text-sm font-semibold text-gray-700 dark:text-[#a1a1aa] mb-4">Ocupación del Portafolio</p>
          <div className="flex-1 flex items-center justify-center">
            <OcupacionDonut occupied={occupied} total={properties.length} dark={isDark} />
          </div>
        </motion.div>
      </div>

      {/* ══ ACTIVIDAD + RENDIMIENTO ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Actividad reciente */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="bg-white dark:bg-[#18181b] border border-[#e2e8f0] dark:border-[#27272a] rounded-2xl p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-[#a1a1aa] mb-5">Actividad Reciente</p>
          <div className="space-y-4">
            {recentLeases.length === 0 && dashAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-[#52525b] text-center py-4">Sin actividad reciente</p>
            ) : (
              <>
                {recentLeases.slice(0, 2).map(l => {
                  const tenant = tenants.find(t => t.id === l.tenantId);
                  return (
                    <ActivityItem
                      key={`lease-${l.id}`}
                      icon={DollarSign}
                      iconBg="bg-emerald-500/10 text-emerald-400"
                      title="Pago de renta"
                      subtitle={`${tenant?.name || 'Inquilino'} · ${fmtCurrency(l.rent)}`}
                      time="Activo"
                    />
                  );
                })}
                {recentLeases.slice(2, 3).map(l => {
                  const prop = properties.find(p => p.id === l.propertyId);
                  return (
                    <ActivityItem
                      key={`renew-${l.id}`}
                      icon={FileText}
                      iconBg="bg-blue-500/10 text-blue-400"
                      title="Contrato activo"
                      subtitle={prop?.address || `Propiedad #${l.propertyId}`}
                      time={`hasta ${fmtDate(l.endDate)}`}
                    />
                  );
                })}
                {dashAlerts.slice(0, 2).map(a => {
                  const prop = properties.find(p => p.id === a.propertyId);
                  const tenant = tenants.find(t => t.id === a.tenantId);
                  return (
                    <ActivityItem
                      key={`alert-${a.id}`}
                      icon={Bell}
                      iconBg="bg-orange-500/10 text-orange-400"
                      title="Alerta de vencimiento"
                      subtitle={prop?.address || tenant?.name || `Contrato #${a.id}`}
                      time={fmtDuration(a.days)}
                    />
                  );
                })}
                {recentLeases.slice(3, 4).map(l => {
                  const prop = properties.find(p => p.id === l.propertyId);
                  return (
                    <ActivityItem
                      key={`prop-${l.id}`}
                      icon={Home}
                      iconBg="bg-purple-500/10 text-purple-400"
                      title="Propiedad con contrato"
                      subtitle={prop?.address || `Propiedad #${l.propertyId}`}
                      time={`inicio ${fmtDate(l.startDate)}`}
                    />
                  );
                })}
              </>
            )}
          </div>
        </motion.div>

        {/* Rendimiento del mes */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#18181b] border border-[#e2e8f0] dark:border-[#27272a] rounded-2xl p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-[#a1a1aa] mb-5">Rendimiento del Mes</p>
          <div className="space-y-5">
            <PerfRow
              label="Ingresos totales"
              value={fmtCurrency(totalRent)}
              trend={rentTrend ? `+${rentTrend}%` : "+0%"}
            />
            <div className="h-px bg-[#e2e8f0] dark:bg-[#27272a]" />
            <PerfRow
              label="Contratos activos"
              value={activeLeases}
              trend={activeLeases > 0 ? "+8.5%" : "—"}
            />
            <div className="h-px bg-[#e2e8f0] dark:bg-[#27272a]" />
            <PerfRow
              label="Tasa de ocupación"
              value={`${properties.length > 0 ? Math.round((occupied / properties.length) * 100) : 0}%`}
              trend={occupied > 0 ? "+2.1%" : "—"}
            />
            <div className="h-px bg-[#e2e8f0] dark:bg-[#27272a]" />
            <PerfRow
              label="Contactos totales"
              value={tenants.length}
              trend="—"
            />
          </div>
        </motion.div>
      </div>

      {/* ══ ALERTAS DE VENCIMIENTO ══ */}
      {dashAlerts.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
          <p className="text-sm font-semibold text-gray-700 dark:text-[#a1a1aa] mb-3">Alertas de Vencimiento</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dashAlerts.map(alert => (
              <motion.button
                key={alert.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setActive({ page: "leases", filter: "activo" })}
                className="w-full text-left flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#262626] hover:border-gray-400 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Bell size={15} className={alert.level.color} />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {alert.nominatario || "Contrato"}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {fmtDuration(alert.days)}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {dashAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40 rounded-xl px-5 py-4"
        >
          <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Sin alertas pendientes</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">Todos los contratos están en orden</p>
          </div>
        </motion.div>
      )}

      {/* ══ PROPIEDADES RECIENTES ══ */}
      {recentProps.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-[#a1a1aa]">Propiedades Recientes</p>
            <button
              onClick={() => setActive({ page: "properties", filter: "todos" })}
              className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors"
            >
              Ver todas →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProps.map(p => (
              <RecentPropertyCard
                key={p.id}
                property={p}
                onClick={() => setActive({ page: "properties", propertyId: p.id })}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getFirstName(user) {
  // Devuelve el primer nombre del usuario autenticado
  if (user?.nombre) return user.nombre.split(" ")[0];
  return "";
}
