import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { X, Calendar, DollarSign, TrendingUp, Info } from "lucide-react";
import { Field, Input, Select } from "../ui/FormField";
import { fmtDate, fmtCurrency, apiCall } from "../../utils/helpers";

// ─── Calcular proyección de ajustes ──────────────────────────────────────────
function calculateAdjustmentProjection(startDate, endDate, baseRent, tipoAjuste, increase, period) {
  const dates = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  
  // Si es FIJO, calcular ajustes según período
  if (tipoAjuste === "FIJO") {
    const percentageIncrease = Number(increase) || 0;
    let currentRent = Number(baseRent) || 0;
    let adjustmentCount = 0;

    while (current <= end) {
      const shouldAdjust = (() => {
        if (adjustmentCount === 0) return false; // Primera vez sin ajuste
        if (period === "anual") return adjustmentCount % 12 === 0;
        if (period === "semestral") return adjustmentCount % 6 === 0;
        if (period === "trimestral") return adjustmentCount % 3 === 0;
        return false;
      })();

      if (shouldAdjust) {
        currentRent = currentRent * (1 + percentageIncrease / 100);
      }

      dates.push({
        month: `${months[current.getMonth()]} ${current.getFullYear()}`,
        rent: currentRent,
        isAdjustment: shouldAdjust,
      });

      current = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
      adjustmentCount++;
    }
  } else {
    // Para ICL/IPC solo mostrar inicio y fin sin proyección detallada
    dates.push({
      month: `${months[new Date(startDate).getMonth()]} ${new Date(startDate).getFullYear()}`,
      rent: Number(baseRent),
      isAdjustment: false,
    });
    if (new Date(endDate) > new Date(startDate)) {
      const lastDate = new Date(endDate);
      dates.push({
        month: `${months[lastDate.getMonth()]} ${lastDate.getFullYear()} (estimado)`,
        rent: Number(baseRent),
        isAdjustment: false,
        note: "Depende del índice",
      });
    }
  }

  return dates;
}

export function LeaseRenewModal({ lease, property, tenant, owner, onClose, onRenewed }) {
  const [form, setForm] = useState({
    startDate: fmtDate(new Date()), // Hoy como inicio sugerido
    endDate: fmtDate(new Date(new Date(lease.endDate).getFullYear() + 1, new Date(lease.endDate).getMonth(), new Date(lease.endDate).getDate())),
    rent: String(lease.rent),
    tipoAjuste: lease.tipoAjuste || "FIJO",
    increase: String(lease.increase || 6),
    period: lease.period || "anual",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calcular proyección de ajustes en tiempo real
  const projectionData = useMemo(
    () => calculateAdjustmentProjection(
      form.startDate,
      form.endDate,
      form.rent,
      form.tipoAjuste,
      form.increase,
      form.period
    ),
    [form.startDate, form.endDate, form.rent, form.tipoAjuste, form.increase, form.period]
  );

  // Mostrar solo primeros 6 meses y últimos 3 meses de la proyección
  const displayedProjection = projectionData.length > 9 
    ? [
        ...projectionData.slice(0, 6),
        { month: "...", rent: null, isStatic: true },
        ...projectionData.slice(-3)
      ]
    : projectionData;

  const handleSave = async () => {
    if (!form.startDate || !form.endDate || !form.rent) {
      setError("Completa todos los campos necesarios");
      return;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("La fecha de fin debe ser posterior a la de inicio");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Crear nuevo contrato con los datos renovados
      const newLease = await apiCall("/leases", {
        method: "POST",
        body: JSON.stringify({
          propertyId: lease.propertyId,
          tenantId: lease.tenantId,
          startDate: form.startDate,
          endDate: form.endDate,
          rent: Number(form.rent),
          tipoAjuste: form.tipoAjuste,
          increase: form.tipoAjuste === "FIJO" ? Number(form.increase) : 0,
          period: form.period,
          status: "activo",
        }),
      });

      // Marcar contrato anterior como renovado
      await apiCall(`/leases/${lease.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "renovado" }),
      });

      onRenewed?.(newLease);
      onClose();
    } catch (e) {
      setError(e.message || "Error al renovar el contrato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#333333] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-[#404040]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <p className="text-white/70 text-xs font-medium mb-0.5">Renovar Contrato #{lease.id}</p>
              <p className="text-white font-bold text-base leading-snug truncate">{property?.address}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
              <X size={15} className="text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info actual */}
          <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Contrato actual vence el {fmtDate(lease.endDate)}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Inquilino:</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{tenant?.name}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Propietario:</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{owner?.name || "—"}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha inicio">
              <Input
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
              />
            </Field>
            <Field label="Fecha fin">
              <Input
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
          </div>

          {/* Renta */}
          <Field label="Renta mensual">
            <Input
              type="number"
              placeholder="Ej: 50000"
              value={form.rent}
              onChange={e => setForm({ ...form, rent: e.target.value })}
            />
          </Field>

          {/* Ajuste */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Tipo de ajuste</label>
            <div className="grid grid-cols-3 gap-2">
              {["FIJO", "ICL", "IPC"].map(tipo => (
                <button
                  key={tipo}
                  onClick={() => setForm({ ...form, tipoAjuste: tipo })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    form.tipoAjuste === tipo
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-gray-200 dark:border-[#404040] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2d2d2d]"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Porcentaje o período */}
          {form.tipoAjuste === "FIJO" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Aumento %">
                <Input
                  type="number"
                  placeholder="Ej: 6"
                  value={form.increase}
                  onChange={e => setForm({ ...form, increase: e.target.value })}
                />
              </Field>
              <Field label="Período">
                <Select
                  value={form.period}
                  onChange={e => setForm({ ...form, period: e.target.value })}
                >
                  <option value="anual">Anual</option>
                  <option value="semestral">Semestral</option>
                  <option value="trimestral">Trimestral</option>
                </Select>
              </Field>
            </div>
          )}

          {/* Proyección de ajustes */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-start gap-2 mb-3">
              <Info size={14} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">Proyección de ingresos</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {form.tipoAjuste === "FIJO" 
                    ? `Aumenta ${form.increase}% cada ${form.period}`
                    : "Sujeto al índice seleccionado"}
                </p>
              </div>
            </div>
            {/* Tabla de proyección */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {displayedProjection.map((proj, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    proj.isStatic
                      ? "text-gray-400 dark:text-gray-600"
                      : proj.isAdjustment
                      ? "bg-white/60 dark:bg-[#1e1e1e]/60 font-medium border-l-2 border-emerald-500"
                      : "bg-white/40 dark:bg-white/5"
                  }`}
                >
                  <span className={proj.isStatic ? "text-center flex-1" : "text-emerald-700 dark:text-emerald-300 font-medium"}>
                    {proj.month}
                  </span>
                  {proj.rent !== null && (
                    <span className={`font-semibold ${
                      proj.isAdjustment ? "text-emerald-700 dark:text-emerald-300" : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {fmtCurrency(proj.rent)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-[#404040] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2.5 px-4 text-sm font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Renovando..." : "Renovar Contrato"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
