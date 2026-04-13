// frontend/src/pages/PropertiesRedesigned.jsx
// Vista de propiedades rediseñada - Premium, intuitiva

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, MapPin, DollarSign } from 'lucide-react';
import {
  BtnPrimary,
  BtnSecondary,
  SearchInput,
  Card,
  CardProperty,
  EmptyState,
  SectionHeader,
  Badge,
  AlertCard,
} from '../components/ui/redesigned';
import { fmtCurrency, fmtDate } from '../utils/helpers';

export function PropertiesRedesigned({ properties = [], onAdd, onEdit, onDelete, setActive }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos'); // 'todos', 'ocupado', 'desocupado'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // ─── Filtros ─────────────────────────────────────────
  const filtered = properties.filter(p => {
    const matchesSearch = p.address?.toLowerCase().includes(search.toLowerCase()) ||
                         p.localidad?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'todos' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: properties.length,
    ocupadas: properties.filter(p => p.status === 'ocupado').length,
    desocupadas: properties.filter(p => p.status === 'desocupado').length,
    rentaTotal: properties.reduce((sum, p) => sum + (p.price || 0), 0),
  };

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-8 pb-16">
      {/* ══════ HEADER ══════ */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-32 font-bold text-gray-100">Propiedades</h1>
          <p className="text-14 text-gray-600 mt-1">
            {stats.total} total • {stats.ocupadas} ocupadas • {fmtCurrency(stats.rentaTotal)}/mes
          </p>
        </div>
        <BtnPrimary onClick={onAdd} className="flex gap-2">
          <Plus size={16} />
          Agregar propiedad
        </BtnPrimary>
      </div>

      {/* ══════ BÚSQUEDA + FILTROS ══════ */}
      <div className="space-y-4">
        <SearchInput
          placeholder="Buscar por dirección, zona..."
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'todos', label: `Todas (${stats.total})` },
            { key: 'ocupado', label: `Ocupadas (${stats.ocupadas})` },
            { key: 'desocupado', label: `Desocupadas (${stats.desocupadas})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-14 font-medium transition ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════ LISTA DE PROPIEDADES ══════ */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={search ? "🔍" : "🏠"}
          title={search ? "No encontramos propiedades" : "Todavía no hay propiedades"}
          description={
            search
              ? `Intentá con otra búsqueda`
              : "Empezá agregando tu primer inmueble para gestionar todo desde aquí"
          }
          action={{
            label: search ? "Limpiar búsqueda" : "Agregar primera propiedad",
            onClick: search ? () => setSearch('') : onAdd,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(property => (
            <div key={property.id} className="group">
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-16 font-semibold text-gray-100">
                    {property.direccion}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEdit?.(property)}
                      className="p-1.5 hover:bg-gray-700 rounded transition"
                      title="Editar"
                    >
                      <Edit2 size={14} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(property.id)}
                      className="p-1.5 hover:bg-red-600/10 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 text-12 text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {property.zona}
                  </span>
                  <span>•</span>
                  <span>{property.tipo}</span>
                </div>

                <Badge variant={property.estado === 'ocupado' ? 'success' : 'warning'}>
                  {property.estado === 'ocupado' ? '✓ Ocupado' : '○ Desocupado'}
                </Badge>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-11 text-gray-600">Renta</p>
                      <p className="text-16 font-semibold text-gray-100 font-mono mt-1">
                        {fmtCurrency(property.renta_mensual)}
                      </p>
                    </div>
                    <div>
                      <p className="text-11 text-gray-600">Inquilino</p>
                      <p className="text-14 text-gray-300 mt-1">{property.inquilino || '—'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* ══════ CONFIRMACIÓN DE ELIMINACIÓN ══════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md">
            <h3 className="text-18 font-semibold text-gray-100 mb-2">
              ¿Eliminar esta propiedad?
            </h3>
            <p className="text-14 text-gray-500 mb-6">
              Se eliminarán todos los contratos, inquilinos y documentos asociados.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <BtnSecondary onClick={() => setShowDeleteConfirm(null)} className="flex-1">
                Cancelar
              </BtnSecondary>
              <button
                onClick={() => {
                  onDelete?.(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600/10 text-red-500 rounded-lg font-medium
                  hover:bg-red-600/20 transition text-14"
              >
                Eliminar
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
