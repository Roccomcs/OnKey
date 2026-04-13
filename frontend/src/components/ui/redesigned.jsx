// frontend/src/components/ui/redesigned.jsx
// Componentes UI rediseñados - Animados y sofisticados

import React from 'react';
import { motion } from 'motion/react';

// ■■■ BOTONES ■■■

export function BtnPrimary({ children, onClick, disabled = false, className = '' }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)' }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium 
        hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        text-14 ${className}`}
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
      className={`px-4 py-2 bg-gray-700 text-gray-100 rounded-lg font-medium 
        hover:bg-gray-600 transition
        disabled:opacity-50 disabled:cursor-not-allowed
        text-14 ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnTertiary({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-transparent text-blue-500 rounded-lg font-medium
        hover:bg-gray-800 transition text-14 ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnDanger({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-red-600/10 text-red-500 rounded-lg font-medium
        hover:bg-red-600/20 transition text-14 ${className}`}
    >
      {children}
    </button>
  );
}

// ■■■ CARDS ■■■

export function Card({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' } : {}}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 
        ${hover ? 'transition-all cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function CardProperty({ property }) {
  const statusColor = property.estado === 'ocupado' ? 'green' : 'gray';
  const statusLabel = property.estado === 'ocupado' ? '✓ Ocupado' : '○ Desocupado';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700/50 rounded-lg p-4 cursor-pointer hover:border-blue-600/30"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-16 font-semibold text-gray-100">{property.address}</h3>
        <motion.button 
          whileHover={{ rotate: 90 }}
          className="text-gray-500 hover:text-gray-400 text-16"
        >
          ⋮
        </motion.button>
      </div>

      <div className="flex gap-3 mb-4 text-12 text-gray-500">
        <span>{property.tipo}</span>
        <span>•</span>
        <span>{property.zona}</span>
      </div>

      <motion.div 
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        className="inline-flex px-2 py-1 bg-green-600/10 text-green-400 text-11 rounded border border-green-600/20"
      >
        {statusLabel}
      </motion.div>

      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-11 text-gray-600">Precio</p>
            <p className="text-16 font-semibold text-gray-100 font-mono mt-1">
              {property.price ? `$${property.price.toLocaleString()}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-11 text-gray-600">Estado</p>
            <p className="text-14 text-gray-300 mt-1 capitalize">{property.status || '—'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ■■■ INPUTS ■■■

export function SearchInput({ placeholder = "Buscar...", onChange }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 pl-10
          text-gray-100 placeholder-gray-500
          focus:border-blue-600 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all
          text-14"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">🔍</span>
    </motion.div>
  );
}

// ■■■ BADGES / TAGS ■■■

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    success: 'bg-green-600/10 text-green-400',
    warning: 'bg-amber-600/10 text-amber-500',
    error: 'bg-red-600/10 text-red-500',
    info: 'bg-cyan-600/10 text-cyan-400',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-11 rounded font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ■■■ ALERT / ALERT CARD ■■■

export function AlertCard({ icon, title, description, action, variant = 'info' }) {
  const variantStyles = {
    error: 'bg-red-600/5 border-red-600/30 text-red-500',
    warning: 'bg-amber-600/5 border-amber-600/30 text-amber-500',
    info: 'bg-cyan-600/5 border-cyan-600/30 text-cyan-500',
    success: 'bg-green-600/5 border-green-600/30 text-green-400',
  };

  const iconColor = {
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-cyan-400',
    success: 'text-green-400',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.3 }}
      className={`border rounded-lg p-4 flex items-start gap-3 hover:shadow-md transition-all ${variantStyles[variant]}`}
    >
      <motion.span 
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`text-16 flex-shrink-0 ${iconColor[variant]}`}
      >
        {icon}
      </motion.span>
      <div className="flex-1">
        <p className="text-14 font-semibold text-gray-100">{title}</p>
        <p className="text-12 text-gray-400 mt-1">{description}</p>
      </div>
      {action && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          className="text-blue-400 text-12 font-medium hover:text-blue-300 ml-2 flex-shrink-0"
        >
          {action}
        </motion.button>
      )}
    </motion.div>
  );
}

// ■■■ EMPTY STATE ■■■

export function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16 px-4"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-48 mb-4"
      >
        {icon}
      </motion.div>
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-18 font-semibold text-gray-100 mb-2"
      >
        {title}
      </motion.h3>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-14 text-gray-500 mb-6 max-w-md mx-auto"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BtnPrimary onClick={action.onClick}>{action.label}</BtnPrimary>
        </motion.div>
      )}
    </motion.div>
  );
}

// ■■■ METRIC CARD ■■■

export function MetricCard({ label, value, trend, unit = '' }) {
  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-500' : 'text-gray-500';
  const trendBg = trend > 0 ? 'bg-green-500/10' : trend < 0 ? 'bg-red-500/10' : 'bg-gray-700/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-gray-800 to-gray-850 border border-blue-600/20 rounded-lg p-4 hover:border-blue-600/40 transition-all"
    >
      <p className="text-12 text-gray-600 uppercase tracking-wide font-medium">{label}</p>
      <div className="text-28 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-2">
        {typeof value === 'number' ? value.toLocaleString() : value}{unit}
      </div>
      {trend !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-12 mt-2 font-medium flex items-center gap-1 ${trendColor}`}
        >
          <span className={`px-2 py-0.5 rounded text-10 ${trendBg}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          vs. mes anterior
        </motion.div>
      )}
    </motion.div>
  );
}

// ■■■ TABLE ■■■

export function Table({ headers, rows, actions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-12 font-semibold text-gray-500 uppercase"
              >
                {h}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right text-12 font-semibold text-gray-500">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="border-b border-gray-700/50 transition-colors cursor-pointer"
            >
              {row.cells.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-300 text-14">
                  {cell}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">{row.actions}</td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ■■■ SECTION HEADER ■■■

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h2 className="text-24 font-semibold text-gray-100">{title}</h2>
        {description && <p className="text-14 text-gray-500 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ■■■ SEPARATOR ■■■

export function Separator() {
  return <div className="h-px bg-gray-700 my-6" />;
}
