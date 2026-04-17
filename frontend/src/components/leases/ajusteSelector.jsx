// frontend/src/components/leases/AjusteSelector.jsx
import { Info, AlertTriangle, RefreshCw, Check, ExternalLink, Calculator, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Field, Input } from "../ui/FormField";
import { useIndice } from "../../hooks/useIndice";
import { AjusteCalculadora } from "./ajusteCalculadora";
import { apiCall } from "../../utils/helpers";

// ─── Helper: rango de fechas para consulta BCRA ──────────────
const MESES_PERIODO = { trimestral: 3, cuatrimestral: 4, semestral: 6, anual: 12 };

function iclBcraRango(period) {
  const meses = MESES_PERIODO[period] ?? 3;
  const hoy   = new Date();
  const fin   = new Date(hoy.getFullYear(), hoy.getMonth() + meses, hoy.getDate());
  const fmt   = d => d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return { inicio: fmt(hoy), fin: fmt(fin) };
}

// ─── Helper: format periodo seguro ───────────────────────────
function fmtPeriodo(val) {
  if (!val) return "—";
  if (val instanceof Date) return val.toISOString().slice(0, 7);
  const s = String(val);
  if (/^\d{4}-\d{2}/.test(s)) return s.slice(0, 7);
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 7);
  return s.slice(0, 7);
}

// ─── Botón de sincronización ──────────────────────────────────
export function SyncIndicesButton({ onSuccess, compact = false }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult]   = useState(null);

  const sync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const data = await apiCall(`/indices/sync`, { method: "POST" });

      const hasData = (data.ICL ?? 0) > 0 || (data.IPC ?? 0) > 0;
      const fuentes = data.fuentes
        ? Object.entries(data.fuentes).map(([k, v]) => `${k}: ${v}`).join(", ")
        : "";

      if (hasData) {
        setResult({ ok: true, msg: `✓ ICL: ${data.ICL ?? 0} reg. · IPC: ${data.IPC ?? 0} reg.${fuentes ? ` (${fuentes})` : ""}` });
        onSuccess?.();
      } else if (data.errores?.length) {
        setResult({ ok: false, msg: `Sin datos: ${data.errores.join(" | ")}` });
      } else {
        setResult({ ok: true, msg: "Ya estaba actualizado." });
        onSuccess?.();
      }
    } catch (e) {
      setResult({ ok: false, msg: `Error de red: ${e.message}` });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <button
        type="button"
        onClick={sync}
        disabled={syncing}
        className={`flex items-center gap-2 font-medium transition-colors rounded-xl disabled:opacity-50 ${
          compact
            ? "text-xs px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60"
            : "text-sm px-4 py-2.5 bg-teal-600 text-white hover:bg-teal-700 w-full justify-center"
        }`}
      >
        <RefreshCw size={compact ? 12 : 15} className={syncing ? "animate-spin" : ""} />
        {syncing ? "Sincronizando…" : "↻ Sincronizar índices desde BCRA"}
      </button>
      {result && (
        <p className={`text-xs ${result.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {result.msg}
        </p>
      )}
    </div>
  );
}

// ─── Fallback sin datos ───────────────────────────────────────
function SinDatosFallback({ tipo, onSuccess }) {
  const [showManual, setShowManual] = useState(false);
  const [mes, setMes]   = useState("");
  const [val, setVal]   = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(null);

  const saveManual = async () => {
    if (!mes || !val) return;
    setSaving(true);
    try {
      await apiCall(`/indices`, {
        method: "POST",
        body: JSON.stringify({ tipo, periodo: mes, valor: parseFloat(val) }),
      });
      setSaved(`✓ ${tipo} ${mes.slice(0, 7)} = ${val} guardado`);
      setMes(""); setVal("");
      onSuccess?.();
    } catch (e) {
      setSaved(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2.5">
      <div className="flex gap-2.5">
        <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          No hay valores de <strong>{tipo}</strong> en la base de datos.
          Intentá sincronizar; si falla, cargá un valor manual.
        </p>
      </div>

      <SyncIndicesButton onSuccess={onSuccess} compact />

      <button
        type="button"
        onClick={() => setShowManual((v) => !v)}
        className="text-xs text-amber-700 dark:text-amber-400 underline underline-offset-2"
      >
        {showManual ? "Ocultar carga manual" : "¿No funciona la sync? Cargá un valor manual"}
      </button>

      {showManual && (
        <div className="pt-1 space-y-2 border-t border-amber-200 dark:border-amber-700">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Ingresá el valor de {tipo} (consultalo en{" "}
            <a href="https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp"
              target="_blank" rel="noreferrer" className="underline">
              BCRA <ExternalLink size={10} className="inline" />
            </a>):
          </p>
          <div className="flex gap-2">
            <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs border border-amber-300 dark:border-[#6b5608] rounded-lg bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500" />
            <input type="text" inputMode="decimal" placeholder="Ej: 1234.56" value={val} onChange={(e) => setVal(e.target.value.replace(/[^0-9.]/g, ''))}
              className="flex-1 px-2.5 py-1.5 text-xs border border-amber-300 dark:border-[#6b5608] rounded-lg bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500" />
            <button type="button" onClick={saveManual} disabled={saving || !mes || !val}
              className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors">
              {saving ? "…" : "Guardar"}
            </button>
          </div>
          {saved && <p className={`text-xs ${saved.startsWith("Error") ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{saved}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Selector principal ───────────────────────────────────────
/**
 * Props:
 *   tipoAjuste   string        "FIJO" | "ICL" | "IPC"
 *   onChange     fn(tipo)
 *   period       string        "trimestral" | "cuatrimestral" | "semestral" | "anual"
 *   onPeriod     fn(period)
 *   increase     string|number porcentaje fijo (solo FIJO)
 *   onIncrease   fn(val)
 *   iclVariacion string|number porcentaje ICL manual por período
 *   onIclVariacion fn(val)
 *   indiceBase   string|number valor del índice base al inicio (ICL/IPC)
 *   onIndiceBase fn(val)
 *   rentaBase    string|number renta mensual actual (para la calculadora)
 */
export function AjusteSelector({
  tipoAjuste,
  onChange,
  period,
  onPeriod,
  increase,
  onIncrease,
  iclVariacion = "",
  onIclVariacion,
  indiceBase = "",
  onIndiceBase,
  rentaBase = "",
}) {
  const { rows: ipcRows, loading, error, reload } = useIndice(
    tipoAjuste === "IPC" ? "IPC" : tipoAjuste === "ICL" ? "ICL" : null
  );

  const [showCalc, setShowCalc] = useState(false);

  const latest  = ipcRows?.[0] ?? null;
  const hasData = (ipcRows?.length ?? 0) > 0;

  const tipos = [
    { id: "FIJO", label: "Fijo",  sub: "% fijo",     icon: "%" },
    { id: "ICL",  label: "ICL",   sub: "Índice ICL",  icon: "↗" },
    { id: "IPC",  label: "IPC",   sub: "Índice IPC",  icon: "↗" },
  ];

  const periodos = [
    { id: "trimestral",    label: "Trimestral" },
    { id: "cuatrimestral", label: "Cuatrimestral" },
    { id: "semestral",     label: "Semestral" },
    { id: "anual",         label: "Anual" },
  ];

  const descriptions = {
    ICL: "El alquiler se actualizará según el Índice para Contratos de Locación (BCRA).",
    IPC: "El alquiler se actualizará según el Índice de Precios al Consumidor (INDEC).",
  };

  // ¿Tiene suficiente info para mostrar la calculadora?
  const canShowCalc = rentaBase && parseFloat(rentaBase) > 0 && (
    (tipoAjuste === "FIJO" && parseFloat(increase) > 0) ||
    (tipoAjuste === "ICL"  && parseFloat(iclVariacion) > 0) ||
    (tipoAjuste === "IPC"  && hasData)
  );

  return (
    <div className="space-y-4">
      {/* ── Tipo de ajuste ── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cláusula de ajuste</p>
        <div className="grid grid-cols-3 gap-3">
          {tipos.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                tipoAjuste === t.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-[#404040] bg-white dark:bg-[#2d2d2d] hover:border-gray-300 dark:hover:border-[#404040]"
              }`}
            >
              {tipoAjuste === t.id && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
              )}
              <span className={`text-lg font-bold ${tipoAjuste === t.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                {t.icon}
              </span>
              <p className={`text-sm font-semibold ${tipoAjuste === t.id ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                {t.label}
              </p>
              <p className={`text-xs ${tipoAjuste === t.id ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                {t.sub}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Periodicidad ── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Periodicidad de actualización</p>
        <div className="grid grid-cols-4 gap-2">
          {periodos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPeriod(p.id)}
              className={`py-2 rounded-xl text-xs font-medium transition-all ${
                period === p.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-[#2d2d2d] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Porcentaje fijo ── */}
      {tipoAjuste === "FIJO" && (
        <Field label="Porcentaje de aumento por período (%)">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Ej: 10"
            value={increase}
            onChange={(e) => onIncrease(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </Field>
      )}

      {/* ── ICL ── */}
      {tipoAjuste === "ICL" && (
        <div className="space-y-3">
          {/* Info pill azul */}
          {(() => {
            const { inicio, fin } = iclBcraRango(period);
            return (
              <div className="flex gap-2.5 p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Ajuste por ICL</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">{descriptions.ICL}</p>
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wide">Fechas a consultar en BCRA</span>
                    <span className="ml-auto text-xs font-bold text-blue-700 dark:text-blue-200">{inicio} → {fin}</span>
                  </div>
                  <a
                    href="https://www.bcra.gob.ar/calculadora-icl/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink size={11} />
                    Consultá la variación ICL en el BCRA
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Input variación */}
          <Field label="Variación ICL por período (%)">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 85.32"
              value={iclVariacion}
              onChange={(e) => onIclVariacion?.(e.target.value.replace(/[^0-9.]/g, ''))}
            />
          </Field>

          {/* Índice base inicial */}
          <Field label="Índice base al inicio del contrato">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 750.25"
              value={indiceBase}
              onChange={(e) => onIndiceBase?.(e.target.value.replace(/[^0-9.]/g, ''))}
            />
          </Field>

          {/* Calculadora inline — aparece apenas hay renta + variación */}
          {rentaBase && parseFloat(rentaBase) > 0 && parseFloat(iclVariacion) > 0 && (
            <div className="border border-amber-100 dark:border-amber-800/40 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20">
                <Calculator size={12} className="text-amber-500" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Proyección de ajustes</p>
              </div>
              <div className="p-4">
                <AjusteCalculadora
                  tipoAjuste="ICL"
                  periodicidad={period}
                  rentaBase={rentaBase}
                  variacionManual={iclVariacion}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── IPC ── */}
      {tipoAjuste === "IPC" && (
        <div className="space-y-3">
          {/* Loading */}
          {loading && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5 pl-1">
              <RefreshCw size={12} className="animate-spin" /> Verificando valores de IPC…
            </p>
          )}

          {!loading && !error && (
            <>
              {/* Info pill azul con valor si hay datos */}
              <div className="flex gap-2.5 p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Ajuste por IPC</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{descriptions.IPC}</p>
                  {hasData && latest && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Último valor:{" "}
                      <strong>{latest.valor?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}%</strong>
                      {" "}· {fmtPeriodo(latest.periodo)}
                    </p>
                  )}
                </div>
                {hasData && (
                  <button type="button" onClick={reload} title="Recargar"
                    className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors self-start">
                    <RefreshCw size={11} />
                  </button>
                )}
              </div>

              {!hasData && <SinDatosFallback tipo="IPC" onSuccess={reload} />}

              {hasData && <SyncIndicesButton onSuccess={reload} compact />}

              {/* Calculadora inline — aparece apenas hay renta y datos IPC */}
              {rentaBase && parseFloat(rentaBase) > 0 && hasData && (
                <div className="border border-teal-100 dark:border-teal-800/40 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 dark:bg-teal-900/20">
                    <Calculator size={12} className="text-teal-500" />
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">Proyección de ajustes</p>
                  </div>
                  <div className="p-4">
                    <AjusteCalculadora
                      tipoAjuste="IPC"
                      periodicidad={period}
                      rentaBase={rentaBase}
                      ipcRows={ipcRows}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* IPC error */}
          {!loading && error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-xs text-red-600 dark:text-red-400">Error al verificar índices: {error}</p>
                <SyncIndicesButton onSuccess={reload} compact />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FIJO: calculadora ── */}
      {canShowCalc && tipoAjuste === "FIJO" && (
        <div className="border border-gray-100 dark:border-[#404040] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCalc((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#1e1e1e] text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calculator size={13} className="text-gray-400" />
              Proyección de ajustes
            </span>
            <ChevronDown
              size={13}
              className={`text-gray-400 transition-transform duration-200 ${showCalc ? "rotate-180" : ""}`}
            />
          </button>
          {showCalc && (
            <div className="p-4">
              <AjusteCalculadora
                tipoAjuste="FIJO"
                periodicidad={period}
                rentaBase={rentaBase}
                variacionManual={increase}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}