// frontend/src/components/ui/redesigned.jsx
// Componentes UI rediseñados — estilo moderno dark/light

import { motion } from 'motion/react';

// ■■■ BOTONES ■■■

export function BtnPrimary({ children, onClick, disabled = false, className = '' }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function BtnSecondary({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#27272a] hover:bg-gray-200 dark:hover:bg-[#3f3f46] text-gray-700 dark:text-[#a1a1aa] text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnTertiary({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-sm font-semibold rounded-xl transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnDanger({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-xl transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

// ■■■ CARDS ■■■

export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#18181b] border border-[#e2e8f0] dark:border-[#27272a] rounded-2xl p-5 ${hover ? 'hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-md transition-all cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardProperty({ property }) {
  const cfg = {
    ocupado:      { label: "Ocupado",       cls: "bg-emerald-500/10 text-emerald-500" },
    desocupado:   { label: "Disponible",    cls: "bg-blue-500/10 text-blue-500" },
    mantenimiento:{ label: "Mantenimiento", cls: "bg-orange-500/10 text-orange-500" },
  };
  const s = cfg[property.status] || cfg.desocupado;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-[#18181b] border border-[#e2e8f0] dark:border-[#27272a] rounded-2xl p-5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-[#e4e4e7]">{property.address}</h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
      </div>
      <div className="flex gap-2 mb-4 text-xs text-gray-400 dark:text-[#71717a]">
        <span>{property.tipo}</span>
        {property.zona && <><span>·</span><span>{property.zona}</span></>}
      </div>
      <div className="pt-3 border-t border-[#e2e8f0] dark:border-[#27272a]">
        <p className="text-xs text-gray-400 dark:text-[#71717a] mb-1">Renta mensual</p>
        <p className="text-base font-bold text-gray-900 dark:text-[#f4f4f5]">
          {property.price ? `$${property.price.toLocaleString()}` : '—'}
        </p>
      </div>
    </motion.div>
  );
}

// ■■■ INPUTS ■■■

export function SearchInput({ placeholder = "Buscar...", onChange }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className="w-full bg-gray-50 dark:bg-[#27272a] border border-[#e2e8f0] dark:border-[#3f3f46] rounded-xl px-3.5 py-2.5 pl-9 text-sm text-gray-800 dark:text-[#e4e4e7] placeholder-gray-400 dark:placeholder-[#52525b] focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#52525b] text-sm">🔍</span>
    </div>
  );
}

// ■■■ BADGES ■■■

export function Badge({ children, variant = 'default' }) {
  const v = {
    default: 'bg-gray-100 dark:bg-[#27272a] text-gray-600 dark:text-[#a1a1aa]',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    error:   'bg-red-500/10 text-red-600 dark:text-red-400',
    info:    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${v[variant]}`}>
      {children}
    </span>
  );
}

// ■■■ ALERT CARD ■■■

export function AlertCard({ icon, title, description, action, variant = 'info' }) {
  const s = {
    error:   'bg-red-500/5   border-red-500/20   text-red-500',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-500',
    info:    'bg-blue-500/5  border-blue-500/20  text-blue-400',
    success: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500',
  };
  return (
    <div className={`border rounded-xl p-4 flex items-start gap-3 ${s[variant]}`}>
      <span className="text-sm flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-[#e4e4e7]">{title}</p>
        <p className="text-xs text-gray-500 dark:text-[#71717a] mt-0.5">{description}</p>
      </div>
      {action && (
        <button className="text-blue-500 text-xs font-semibold hover:text-blue-400 transition-colors ml-2 flex-shrink-0">
          {action}
        </button>
      )}
    </div>
  );
}

// ■■■ EMPTY STATE ■■■

export function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-16 px-4"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-[#e4e4e7] mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-[#71717a] mb-6 max-w-sm mx-auto">{description}</p>
      {action && <BtnPrimary onClick={action.onClick}>{action.label}</BtnPrimary>}
    </motion.div>
  );
}

// ■■■ METRIC CARD ■■■

export function MetricCard({ label, value, trend, unit = '' }) {
  const isPos = trend > 0;
  return (
    <div className="bg-white dark:bg-[#18181b] border border-[#e2e8f0] dark:border-[#27272a] rounded-2xl p-5">
      <p className="text-xs text-gray-400 dark:text-[#71717a] uppercase tracking-wide font-medium mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-[#f4f4f5]">
        {typeof value === 'number' ? value.toLocaleString() : value}{unit}
      </p>
      {trend !== undefined && (
        <div className={`text-xs mt-2 font-semibold flex items-center gap-1 ${isPos ? 'text-emerald-500' : 'text-red-500'}`}>
          <span className={`px-2 py-0.5 rounded-full ${isPos ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {isPos ? '+' : ''}{trend}%
          </span>
          <span className="text-gray-400 dark:text-[#52525b] font-normal">vs. mes anterior</span>
        </div>
      )}
    </div>
  );
}

// ■■■ TABLE ■■■

export function Table({ headers, rows, actions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e2e8f0] dark:border-[#27272a]">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-[#52525b] uppercase tracking-wide">
                {h}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 dark:text-[#52525b] uppercase tracking-wide">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[#e2e8f0]/60 dark:border-[#27272a]/60 hover:bg-gray-50 dark:hover:bg-[#1f1f23] transition-colors cursor-pointer"
            >
              {row.cells.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-700 dark:text-[#a1a1aa]">
                  {cell}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{row.actions}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ■■■ SECTION HEADER ■■■

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-5 gap-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#f4f4f5]">{title}</h2>
        {description && <p className="text-sm text-gray-400 dark:text-[#71717a] mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ■■■ SEPARATOR ■■■

export function Separator() {
  return <div className="h-px bg-[#e2e8f0] dark:bg-[#27272a] my-5" />;
}
