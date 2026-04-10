// frontend/src/components/leases/IndicesPanel.jsx
import { useState, useEffect, useCallback } from "react";
import { TrendingUp, ChevronRight, RefreshCw, ExternalLink, Calculator, Check } from "lucide-react";
import { SyncIndicesButton } from "./ajusteSelector";
import { AjusteCalculadora } from "./ajusteCalculadora";
import { apiCall } from "../../utils/helpers";

// ─── Helper ───────────────────────────────────────────────────
function SmallInput({ label, ...props }) {
  return (
    <div>
      {label && <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wide">{label}</p>}
      <input
        {...props}
        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
      />
    </div>
  );
}

function PeriodSelect({ value, onChange, accentColor = "teal" }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wide">Periodicidad</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-${accentColor}-500 focus:border-${accentColor}-500 transition-all`}
      >
        <option value="trimestral">Trimestral</option>
        <option value="cuatrimestral">Cuatrimestral</option>
        <option value="semestral">Semestral</option>
        <option value="anual">Anual</option>
      </select>
    </div>
  );
}

// ─── Tarjeta IPC ──────────────────────────────────────────────
function IPCCard({ onDataChange }) {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCalc, setShowCalc] = useState(false);
  const [rentaBase, setRentaBase] = useState("");
  const [periodicidad, setPeriodicidad] = useState("trimestral");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await apiCall(`/indices/IPC`);
      setRows(rows);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const latest = rows[0];

  return (
    <div className="flex-1 min-w-0 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/40 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-teal-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">%</span>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">IPC</p>
        </div>
        <span className="text-[10px] text-teal-600 dark:text-teal-500 bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded-full font-medium">
          Auto · BCRA
        </span>
      </div>

      {/* Value */}
      {loading ? (
        <div className="flex items-center gap-1.5 py-1">
          <RefreshCw size={11} className="animate-spin text-gray-400" />
          <span className="text-xs text-gray-400">Cargando…</span>
        </div>
      ) : latest ? (
        <div className="flex items-end gap-2">
          <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 leading-none">
            {latest.valor?.toFixed(2)}
            <span className="text-lg font-bold">%</span>
          </p>
          <div className="pb-1">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">variación mensual</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{latest.periodo?.slice(0, 7)}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-amber-600 dark:text-amber-400">Sin datos — sincronizá</p>
      )}

      {/* Sync */}
      <SyncIndicesButton
        onSuccess={() => { load(); onDataChange?.(); }}
        compact
      />

      {/* Calculator toggle */}
      <button
        type="button"
        onClick={() => setShowCalc((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium"
      >
        <Calculator size={11} />
        {showCalc ? "Ocultar calculadora" : "Abrir calculadora"}
      </button>

      {/* Calculator */}
      {showCalc && (
        <div className="space-y-2 pt-2 border-t border-teal-100 dark:border-teal-800/40">
          <div className="grid grid-cols-2 gap-2">
            <SmallInput
              label="Renta base ($)"
              type="number"
              placeholder="350000"
              value={rentaBase}
              onChange={(e) => setRentaBase(e.target.value)}
            />
            <PeriodSelect value={periodicidad} onChange={setPeriodicidad} accentColor="teal" />
          </div>

          {rentaBase && latest ? (
            <AjusteCalculadora
              tipoAjuste="IPC"
              periodicidad={periodicidad}
              rentaBase={rentaBase}
              ipcRows={rows}
            />
          ) : (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic pl-1">
              Ingresá una renta base para ver la proyección.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tarjeta ICL ──────────────────────────────────────────────
function ICLCard({ onDataChange }) {
  const [lastSaved, setLastSaved]   = useState(null);
  const [desde, setDesde]           = useState("");
  const [hasta, setHasta]           = useState("");
  const [variacion, setVariacion]   = useState("");
  const [rentaBase, setRentaBase]   = useState("");
  const [periodicidad, setPeriodicidad] = useState("trimestral");
  const [showCalc, setShowCalc]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(null);

  const loadLast = useCallback(async () => {
    try {
      const rows = await apiCall(`/indices/ICL`);
      if (rows?.[0]) setLastSaved(rows[0]);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadLast(); }, [loadLast]);

  const saveICL = async () => {
    if (!hasta || !variacion) return;
    setSaving(true);
    setSaved(null);
    try {
      await apiCall(`/indices`, {
        method: "POST",
        body: JSON.stringify({ tipo: "ICL", periodo: hasta, valor: parseFloat(variacion) }),
      });
      setSaved({ ok: true, msg: `✓ ICL ${hasta.slice(0, 7)} = ${variacion}% guardado` });
      await loadLast();
      onDataChange?.();
    } catch (e) {
      setSaved({ ok: false, msg: `Error: ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/40 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">↗</span>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">ICL</p>
        </div>
        <span className="text-[10px] text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full font-medium">
          Manual · BCRA
        </span>
      </div>

      {/* Last saved value */}
      {lastSaved ? (
        <div className="flex items-end gap-2">
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 leading-none">
            {lastSaved.valor?.toFixed(2)}
            <span className="text-lg font-bold">%</span>
          </p>
          <div className="pb-1 flex items-center gap-1">
            <Check size={10} className="text-emerald-500" />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
              último guardado · {lastSaved.periodo?.slice(0, 7)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500">Sin datos cargados aún</p>
      )}

      {/* BCRA Link */}
      <a
        href="https://www.bcra.gob.ar/calculadora-icl"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
      >
        <ExternalLink size={11} />
        Consultar calculadora ICL en el BCRA
      </a>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed -mt-1">
        Seleccioná el rango de fechas en la página del BCRA, copiá el porcentaje obtenido
        e ingresalo abajo.
      </p>

      {/* Form */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <SmallInput label="Desde" type="month" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <SmallInput label="Hasta" type="month" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <SmallInput
          label="Variación ICL obtenida (%)"
          type="number"
          step="0.01"
          placeholder="Ej: 112.54"
          value={variacion}
          onChange={(e) => setVariacion(e.target.value)}
        />
        <button
          type="button"
          onClick={saveICL}
          disabled={saving || !hasta || !variacion}
          className="w-full py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando…" : "Guardar valor ICL"}
        </button>
        {saved && (
          <p className={`text-[10px] ${saved.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {saved.msg}
          </p>
        )}
      </div>

      {/* Calculator toggle */}
      <button
        type="button"
        onClick={() => setShowCalc((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium"
      >
        <Calculator size={11} />
        {showCalc ? "Ocultar calculadora" : "Abrir calculadora"}
      </button>

      {/* Calculator */}
      {showCalc && (
        <div className="space-y-2 pt-2 border-t border-amber-100 dark:border-amber-800/40">
          <div className="grid grid-cols-2 gap-2">
            <SmallInput
              label="Renta base ($)"
              type="number"
              placeholder="350000"
              value={rentaBase}
              onChange={(e) => setRentaBase(e.target.value)}
            />
            <PeriodSelect value={periodicidad} onChange={setPeriodicidad} accentColor="amber" />
          </div>

          {rentaBase && variacion ? (
            <AjusteCalculadora
              tipoAjuste="ICL"
              periodicidad={periodicidad}
              rentaBase={rentaBase}
              variacionManual={variacion}
            />
          ) : (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic pl-1">
              Ingresá renta base y variación ICL para ver la proyección.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────
export function IndicesPanel() {
  const [open, setOpen]           = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <TrendingUp size={15} className="text-teal-500" />
          Gestión de índices ICL / IPC
        </span>
        <ChevronRight
          size={15}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            El <strong>IPC</strong> se sincroniza automáticamente todos los días a las 08:00 hs.
            El <strong>ICL</strong> se ingresa manualmente consultando la calculadora oficial del BCRA.
          </p>

          {/* Cards side by side */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <IPCCard key={`ipc-${refreshKey}`} onDataChange={() => setRefreshKey((k) => k + 1)} />
            <ICLCard key={`icl-${refreshKey}`} onDataChange={() => setRefreshKey((k) => k + 1)} />
          </div>
        </div>
      )}
    </div>
  );
}