// frontend/src/pages/LeasesRedesigned.jsx
// Vista de contratos rediseñada - Premium, con urgencia clara

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import {
  BtnPrimary,
  BtnSecondary,
  SearchInput,
  Card,
  EmptyState,
  SectionHeader,
  Badge,
  AlertCard,
  Table,
} from '../components/ui/redesigned';
import { fmtCurrency, fmtDate, diffDays } from '../utils/helpers';

export function LeasesRedesigned({ leases = [], properties = [], onAdd, onEdit, onDelete, setActive }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('activo'); // 'activo', 'vencido', 'todos'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // ─── Cálculos ─────────────────────────────────────────
  const now = new Date();
  const classified = {
    activos: leases.filter(l => new Date(l.fecha_fin) > now),
    vencidos: leases.filter(l => new Date(l.fecha_fin) <= now),
    proximosVencer: leases.filter(l => {
      const dias = diffDays(l.fecha_fin);
      return dias > 0 && dias <= 30;
    }).sort((a, b) => diffDays(a.fecha_fin) - diffDays(b.fecha_fin)),
  };

  const filtered = (filter === 'activo' ? classified.activos : filter === 'vencido' ? classified.vencidos : leases)
    .filter(l => {
      const prop = properties.find(p => p.id === l.propiedad_id);
      return l.nominatario?.toLowerCase().includes(search.toLowerCase()) ||
             prop?.direccion?.toLowerCase().includes(search.toLowerCase());
    });

  const getUrgency = (fechaFin) => {
    const dias = diffDays(fechaFin);
    if (dias < 0) return { label: '⚠ Vencido', color: 'error', dias };
    if (dias <= 7) return { label: `⚡ Termina en ${dias}d`, color: 'error', dias };
    if (dias <= 30) return { label: `● Termina en ${dias}d`, color: 'warning', dias };
    return { label: `✓ Activo`, color: 'success', dias };
  };

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-8 pb-16">
      {/* ══════ HEADER ══════ */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-32 font-bold text-gray-100">Contratos</h1>
          <p className="text-14 text-gray-600 mt-1">
            {classified.activos.length} activos • {classified.vencidos.length} vencidos
            {classified.proximosVencer.length > 0 && ` • ${classified.proximosVencer.length} por vencer en 30 días`}
          </p>
        </div>
        <BtnPrimary onClick={onAdd} className="flex gap-2">
          <Plus size={16} />
          Nuevo contrato
        </BtnPrimary>
      </div>

      {/* ══════ ALERTAS CRÍTICAS ══════ */}
      {classified.vencidos.length > 0 && (
        <AlertCard
          icon="🚨"
          title={`${classified.vencidos.length} ${classified.vencidos.length === 1 ? 'contrato' : 'contratos'} han vencido`}
          description="Estos inquilinos están fuera de plazo. Contactalos urgentemente."
          action="Ver vencidos"
          variant="error"
        />
      )}

      {classified.proximosVencer.length > 0 && classified.vencidos.length === 0 &&(
        <AlertCard
          icon="●"
          title={`${classified.proximosVencer.length} ${classified.proximosVencer.length === 1 ? 'contrato' : 'contratos'} vence pronto`}
          description={`En los próximos 30 días. El primero: ${fmtDate(classified.proximosVencer[0].fecha_fin)}`}
          action="Ver próximos"
          variant="warning"
        />
      )}

      {classified.vencidos.length === 0 && classified.proximosVencer.length === 0 && (
        <div className="bg-green-600/5 border border-green-600/30 rounded-lg p-4 text-center">
          <p className="text-14 text-green-400 font-medium">✓ Todos los contratos al día</p>
          <p className="text-12 text-green-400/60">Sin vencimientos próximos</p>
        </div>
      )}

      {/* ══════ BÚSQUEDA + FILTROS ══════ */}
      <div className="space-y-4">
        <SearchInput
          placeholder="Buscar inquilino o propiedad..."
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'activo', label: `Activos (${classified.activos.length})` },
            { key: 'vencido', label: `Vencidos (${classified.vencidos.length})` },
            { key: 'todos', label: `Todos (${leases.length})` },
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

      {/* ══════ TABLA DE CONTRATOS ══════ */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={search ? "🔍" : "📋"}
          title={search ? "No encontramos contratos" : "Todavía no hay contratos"}
          description={search ? "Intentá con otra búsqueda" : "Empezá creando tu primer contrato"}
          action={{
            label: search ? "Limpiar búsqueda" : "Crear primer contrato",
            onClick: search ? () => setSearch('') : onAdd,
          }}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-12 font-semibold text-gray-500 uppercase">
                    Inquilino
                  </th>
                  <th className="px-4 py-3 text-left text-12 font-semibold text-gray-500 uppercase">
                    Propiedad
                  </th>
                  <th className="px-4 py-3 text-left text-12 font-semibold text-gray-500 uppercase">
                    Renta
                  </th>
                  <th className="px-4 py-3 text-left text-12 font-semibold text-gray-500 uppercase">
                    Vencimiento
                  </th>
                  <th className="px-4 py-3 text-right text-12 font-semibold text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lease => {
                  const prop = properties.find(p => p.id === lease.propiedad_id);
                  const urgency = getUrgency(lease.fecha_fin);
                  const dias = urgency.dias;

                  return (
                    <tr
                      key={lease.id}
                      className={`border-b border-gray-700/50 hover:bg-gray-800/50 transition ${
                        dias < 0 ? 'bg-red-600/5' : dias <= 7 ? 'bg-amber-600/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-100 font-medium">
                        {lease.nominatario}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {prop?.direccion || `Prop #${lease.propiedad_id}`}
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-mono">
                        {fmtCurrency(lease.renta_mensual)}/mes
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-12 font-medium px-2 py-1 rounded ${
                              urgency.color === 'error'
                                ? 'bg-red-600/10 text-red-500'
                                : urgency.color === 'warning'
                                ? 'bg-amber-600/10 text-amber-500'
                                : 'bg-green-600/10 text-green-400'
                            }`}
                          >
                            {urgency.label}
                          </span>
                          <span className="text-12 text-gray-600">
                            {fmtDate(lease.fecha_fin)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEdit?.(lease)}
                            className="p-1.5 hover:bg-gray-700 rounded transition"
                            title="Editar"
                          >
                            <Edit2 size={14} className="text-gray-400" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(lease.id)}
                            className="p-1.5 hover:bg-red-600/10 rounded transition"
                            title="Eliminar"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ══════ CONFIRMACIÓN DE ELIMINACIÓN ══════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md">
            <h3 className="text-18 font-semibold text-gray-100 mb-2">
              ¿Eliminar este contrato?
            </h3>
            <p className="text-14 text-gray-500 mb-6">
              Se eliminarán todos los registros y documentos asociados.
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
