// frontend/src/components/ui/redesigned.jsx
// Componentes UI rediseñados - NO GENÉRICOS

import React from 'react';

// ■■■ BOTONES ■■■

export function BtnPrimary({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium 
        hover:bg-blue-700 active:bg-blue-800 transition
        disabled:opacity-50 disabled:cursor-not-allowed
        text-14 ${className}`}
    >
      {children}
    </button>
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
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 
        ${hover ? 'hover:border-gray-600 transition' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardProperty({ property }) {
  const statusColor = property.estado === 'ocupado' ? 'green' : 'gray';
  const statusLabel = property.estado === 'ocupado' ? '✓ Ocupado' : '○ Desocupado';

  return (
    <Card className="cursor-pointer hover:shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-16 font-semibold text-gray-100">{property.address}</h3>
        <button className="text-gray-500 hover:text-gray-400 text-16">⋮</button>
      </div>

      <div className="flex gap-3 mb-4 text-12 text-gray-500">
        <span>{property.tipo}</span>
        <span>•</span>
        <span>{property.zona}</span>
      </div>

      <div className="inline-flex px-2 py-1 bg-green-600/10 text-green-400 text-11 rounded">
        {statusLabel}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
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
    </Card>
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
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pl-10
          text-gray-100 placeholder-gray-500
          focus:border-blue-600 focus:bg-gray-800 transition
          text-14"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
    </div>
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
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${variantStyles[variant]}`}>
      <span className={`text-16 flex-shrink-0 ${iconColor[variant]}`}>{icon}</span>
      <div className="flex-1">
        <p className="text-14 font-semibold text-gray-100">{title}</p>
        <p className="text-12 text-gray-400 mt-1">{description}</p>
      </div>
      {action && <button className="text-blue-400 text-12 font-medium hover:text-blue-300 ml-2">{action}</button>}
    </div>
  );
}

// ■■■ EMPTY STATE ■■■

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-48 mb-4">{icon}</div>
      <h3 className="text-18 font-semibold text-gray-100 mb-2">{title}</h3>
      <p className="text-14 text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action && <BtnPrimary onClick={action.onClick}>{action.label}</BtnPrimary>}
    </div>
  );
}

// ■■■ METRIC CARD ■■■

export function MetricCard({ label, value, trend, unit = '' }) {
  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <p className="text-12 text-gray-600 uppercase mb-2">{label}</p>
      <p className="text-28 font-bold text-gray-100">
        {typeof value === 'number' ? value.toLocaleString() : value}{unit}
      </p>
      {trend !== undefined && (
        <p className={`text-12 mt-1 ${trendColor}`}>
          {trend > 0 ? '+' : ''}{trend}% vs. mes anterior
        </p>
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
            <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition">
              {row.cells.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-300 text-14">
                  {cell}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">{row.actions}</td>
              )}
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
