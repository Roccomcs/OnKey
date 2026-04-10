// frontend/src/components/leases/LeaseDetailModal.jsx
import { useState, useMemo } from "react";
import {
  X, Edit2, Trash2, Calendar, DollarSign,
  TrendingUp, ChevronRight, ChevronDown, BarChart2,
} from "lucide-react";
import { Badge }             from "../ui/Badge";
import { AjusteCalculadora } from "./ajusteCalculadora";
import { DocumentsSection }  from "../ui/DocumentsSection";
import { useDocuments }      from "../../hooks/useDocuments";
import { fmtDate, fmtCurrency, diffDays, getAlertLevel } from "../../utils/helpers";

export function AjusteBadge({ tipo }) {
  const map = {
    ICL:  "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",
    IPC:  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    FIJO: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[tipo] || map.FIJO}`}>
      {tipo || "FIJO"}
    </span>
  );
}


// ─── Proyección de ajuste ─────────────────────────────────
const COLOR_TIPO = { FIJO: "#6366f1", ICL: "#f59e0b", IPC: "#0d9488" };

function ProyeccionAjuste({ lease }) {
  const [open, setOpen] = useState(false);

  const tipo         = lease.tipoAjuste ?? "FIJO";
  const color        = COLOR_TIPO[tipo] ?? "#6366f1";
  const rentaBase    = lease.rent;
  const periodicidad = lease.period ?? "anual";

  // Para ICL: indiceBaseValor guarda el % de variación por período
  const variacionManual = tipo === "ICL" ? (lease.indiceBaseValor ?? 0) : (lease.increase ?? 0);

  // Solo mostrar si hay datos suficientes
  const canShow = rentaBase > 0 && (
    (tipo === "FIJO" && variacionManual > 0) ||
    (tipo === "ICL"  && variacionManual > 0) ||
    tipo === "IPC"
  );

  if (!canShow) return null;

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <BarChart2 size={13} style={{ color }} />
          Proyección de ajustes
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="p-4">
          <AjusteCalculadora
            tipoAjuste={tipo}
            periodicidad={periodicidad}
            rentaBase={rentaBase}
            variacionManual={variacionManual}
            ipcRows={[]}
          />
        </div>
      )}
    </div>
  );
}

export function LeaseDetailModal({ lease, properties, tenants, owners, onClose, onEdit, onDelete, onStatusChange }) {
  if (!lease) return null;

  const prop    = properties.find(p => p.id === lease.propertyId);
  const tenant  = tenants.find(t => t.id === lease.tenantId);
  const owner   = prop ? owners.find(o => o.id === prop.ownerId) : null;
  const days    = diffDays(lease.endDate);
  const alert   = lease.status === "activo" ? getAlertLevel(days) : null;
  const docState = useDocuments("lease", lease.id);

  const headerBg = alert
    ? (alert.label === "Crítico" ? "bg-red-500" : alert.label === "Urgente" ? "bg-orange-400" : "bg-amber-500")
    : "bg-blue-600";

  const otrosEstados = ["activo", "vencido", "rescindido", "renovado"].filter(s => s !== lease.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${headerBg} px-6 py-5 rounded-t-2xl`}>
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <p className="text-white/70 text-xs font-medium mb-0.5">Contrato #{lease.id}</p>
              <p className="text-white font-bold text-base leading-snug truncate">{prop?.address}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
              <X size={15} className="text-white" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Badge status={lease.status} />
            <AjusteBadge tipo={lease.tipoAjuste} />
            {alert && lease.status === "activo" && (
              <span className="text-white/90 text-sm font-bold ml-auto">
                {days <= 0 ? "Venció" : `${days}d restantes`}
              </span>
            )}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-5">
          {/* Partes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Inquilino</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{tenant?.name}</p>
              {tenant?.email && <p className="text-xs text-gray-400 mt-0.5">{tenant.email}</p>}
              {tenant?.phone && <p className="text-xs text-gray-400">{tenant.phone}</p>}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Propietario</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{owner?.name ?? "—"}</p>
              {owner?.email && <p className="text-xs text-gray-400 mt-0.5">{owner.email}</p>}
            </div>
          </div>

          {/* Fechas y montos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><Calendar size={10} /> Inicio</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtDate(lease.startDate)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><Calendar size={10} /> Vencimiento</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtDate(lease.endDate)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={10} /> Renta base</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmtCurrency(lease.rent)}/mes</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><TrendingUp size={10} /> Ajuste</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {lease.tipoAjuste === "FIJO" || !lease.tipoAjuste
                  ? `+${lease.increase ?? 0}% ${lease.period ?? "anual"}`
                  : `${lease.tipoAjuste} · ${lease.period ?? "anual"}`}
              </p>
            </div>
          </div>

          {/* Índice base */}
          {(lease.tipoAjuste === "ICL" || lease.tipoAjuste === "IPC") && lease.indiceBaseValor && (
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-3 space-y-1">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Índice base al inicio del contrato</p>
              <p className="text-sm font-bold text-teal-800 dark:text-teal-200">
                {Number(lease.indiceBaseValor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
              {lease.indiceBaseFecha && (
                <p className="text-xs text-teal-600 dark:text-teal-400">Período: {lease.indiceBaseFecha?.slice(0, 7)}</p>
              )}
            </div>
          )}

          {/* Próxima actualización */}
          {lease.proximaActualizacion && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
              <TrendingUp size={14} className="text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Próxima actualización: <strong>{fmtDate(lease.proximaActualizacion)}</strong>
              </p>
            </div>
          )}

          <ProyeccionAjuste lease={lease} />

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          <DocumentsSection entityType="lease" entityId={lease.id} {...docState} />

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { onClose(); onEdit(lease); }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Edit2 size={14} /> Editar
            </button>
            <button onClick={() => { onClose(); onDelete(lease.id); }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 size={14} /> Eliminar
            </button>
          </div>

          {/* Cambiar estado */}
          {otrosEstados.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Cambiar estado:</p>
              <div className="flex flex-wrap gap-2">
                {otrosEstados.map(s => (
                  <button key={s} onClick={() => onStatusChange(lease.id, s)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors capitalize">
                    <ChevronRight size={11} /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}