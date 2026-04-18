// ============================================================
//  frontend/src/components/ui/IndicesPanel.jsx
//  Panel completo de gestión de índices ICL / IPC
//  - Sincronización automática desde APIs públicas
//  - Carga manual de valores
//  - Tabla de historial con opción de eliminar
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Plus, Trash2, AlertCircle, CheckCircle, Loader2, TrendingUp, Info } from "lucide-react";
import { API } from "../../utils/helpers";
import { Field, Input, Select } from "./FormField";

// ── Helpers ──────────────────────────────────────────────────
function fmtPeriodo(p) {
  // "YYYY-MM" → "MMM YYYY"
  const [y, m] = String(p).slice(0, 7).split("-");
  const meses  = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[Number(m) - 1] || m} ${y}`;
}

// ── Subcomponente: tabla de índices ───────────────────────────
function IndicesTable({ tipo, rows, onDelete }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">
        Sin datos cargados para {tipo}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-[#404040]">
            <th className="text-left py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">Período</th>
            <th className="text-right py-2 px-2 text-gray-400 dark:text-gray-500 font-medium">Valor</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {rows.map(r => (
            <tr key={r.periodo} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300 font-medium">
                {fmtPeriodo(r.periodo)}
              </td>
              <td className="py-1.5 px-2 text-right text-gray-900 dark:text-gray-100 font-mono">
                {Number(r.valor).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </td>
              <td className="py-1.5 px-1 text-right">
                <button
                  onClick={() => onDelete(tipo, r.periodo)}
                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-40 hover:opacity-100"
                  title="Eliminar este valor"
                >
                  <Trash2 size={11} className="text-red-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export function IndicesPanel({ embedded = false }) {
  const [iclRows,  setIclRows]  = useState([]);
  const [ipcRows,  setIpcRows]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [syncing,  setSyncing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [status,   setStatus]   = useState(null); // { ok, msg }
  const [activeTab,setActiveTab]= useState("ICL");

  // Formulario de carga manual
  const [form, setForm] = useState({ tipo: "ICL", periodo: "", valor: "" });

  // ── Cargar historial ──
  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const [rICL, rIPC] = await Promise.all([
        fetch(`${API}/api/indices/ICL`).then(r => r.json()),
        fetch(`${API}/api/indices/IPC`).then(r => r.json()),
      ]);
      setIclRows(Array.isArray(rICL) ? rICL : []);
      setIpcRows(Array.isArray(rIPC) ? rIPC : []);
    } catch (e) {
      console.error("Error cargando índices:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRows(); }, [loadRows]);

  // ── Sincronizar desde APIs ──
  const syncBCRA = async () => {
    setSyncing(true);
    setStatus(null);
    try {
      const res  = await fetch(`${API}/api/indices/sync`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al sincronizar");

      const msgs = [];
      if (data.ICL > 0) msgs.push(`ICL: ${data.ICL} registros`);
      if (data.IPC > 0) msgs.push(`IPC: ${data.IPC} registros`);
      if (data.errores?.length) msgs.push(`⚠ ${data.errores.join(" — ")}`);

      const ultimoICL = data.ultimos?.ICL;
      const ultimoIPC = data.ultimos?.IPC;
      const ultimosStr = [
        ultimoICL ? `ICL ${fmtPeriodo(ultimoICL.periodo)}: ${ultimoICL.valor}` : null,
        ultimoIPC ? `IPC ${fmtPeriodo(ultimoIPC.periodo)}: ${ultimoIPC.valor}` : null,
      ].filter(Boolean).join("  ·  ");

      if (msgs.length === 0 && data.errores?.length) {
        setStatus({ ok: false, msg: `No se pudieron obtener datos: ${data.errores.join(" — ")}` });
      } else {
        setStatus({
          ok:  true,
          msg: (msgs.join("  ·  ") || "Sin datos nuevos") + (ultimosStr ? `\nÚltimos — ${ultimosStr}` : ""),
        });
      }

      await loadRows();
    } catch (e) {
      setStatus({ ok: false, msg: e.message });
    } finally {
      setSyncing(false);
    }
  };

  // ── Guardar valor manual ──
  const saveManual = async () => {
    if (!form.periodo || !form.valor) {
      setStatus({ ok: false, msg: "Completá el período y el valor" });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${API}/api/indices`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          tipo:    form.tipo,
          periodo: form.periodo,
          valor:   parseFloat(form.valor),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      setStatus({
        ok:  true,
        msg: `Guardado: ${data.tipo} ${fmtPeriodo(data.periodo)} = ${data.valor}`,
      });
      setForm(f => ({ ...f, periodo: "", valor: "" }));
      setActiveTab(form.tipo);
      await loadRows();
    } catch (e) {
      setStatus({ ok: false, msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar un registro ──
  const deleteRow = async (tipo, periodo) => {
    if (!confirm(`¿Eliminar ${tipo} ${fmtPeriodo(periodo)}?`)) return;
    try {
      await fetch(`${API}/api/indices/${tipo}/${periodo}`, { method: "DELETE" });
      await loadRows();
    } catch (e) {
      setStatus({ ok: false, msg: "Error al eliminar: " + e.message });
    }
  };

  const activeRows = activeTab === "ICL" ? iclRows : ipcRows;
  const ultimoICL  = iclRows[0];
  const ultimoIPC  = ipcRows[0];

  const wrapClass = embedded
    ? "space-y-4"
    : "bg-white dark:bg-[#333333] rounded-2xl border border-gray-100 dark:border-[#404040] p-5 space-y-4";

  return (
    <div className={wrapClass}>
      {!embedded && (
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-teal-600 dark:text-teal-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Índices ICL / IPC</h3>
        </div>
      )}

      {/* ── Resumen de últimos valores ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { tipo: "ICL", row: ultimoICL, color: "blue",  label: "Índice de Contratos de Locación" },
          { tipo: "IPC", row: ultimoIPC, color: "violet", label: "Índice de Precios al Consumidor" },
        ].map(({ tipo, row, color, label }) => (
          <div
            key={tipo}
            className={`rounded-xl p-3 border ${
              color === "blue"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40"
            }`}
          >
            <p className={`text-xs font-bold ${color === "blue" ? "text-blue-600 dark:text-blue-400" : "text-blue-600 dark:text-blue-400"}`}>
              {tipo}
            </p>
            {row ? (
              <>
                <p className="text-lg font-black text-gray-900 dark:text-gray-100 mt-0.5">
                  {Number(row.valor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{fmtPeriodo(row.periodo)}</p>
              </>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sin datos</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Botón de sincronización ── */}
      <div className="space-y-2">
        <button
          onClick={syncBCRA}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {syncing
            ? <><Loader2 size={14} className="animate-spin" /> Sincronizando…</>
            : <><RefreshCw size={14} /> Sincronizar desde APIs públicas</>
          }
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
          <Info size={10} />
          Intenta obtener datos del BCRA y fuentes alternativas automáticamente
        </p>
      </div>

      {/* ── Divisor ── */}
      <div className="relative">
        <div className="h-px bg-gray-100 dark:bg-[#333333]" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#333333] px-3 text-xs text-gray-400 dark:text-gray-500">
          o cargá manualmente
        </span>
      </div>

      {/* ── Formulario de carga manual ── */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Field label="Tipo">
            <Select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="ICL">ICL</option>
              <option value="IPC">IPC</option>
            </Select>
          </Field>
          <Field label="Período">
            <Input
              type="month"
              value={form.periodo}
              onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))}
            />
          </Field>
          <Field label="Valor del índice">
            <Input
              type="number"
              step="0.0001"
              min="0"
              placeholder="Ej: 1234.56"
              value={form.valor}
              onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
            />
          </Field>
        </div>

        <button
          onClick={saveManual}
          disabled={saving || !form.periodo || !form.valor}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {saving
            ? <><Loader2 size={14} className="animate-spin" /> Guardando…</>
            : <><Plus size={14} /> Guardar valor de índice</>
          }
        </button>
      </div>

      {/* ── Feedback ── */}
      {status && (
        <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${
          status.ok
            ? "bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/40 text-teal-700 dark:text-teal-400"
            : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400"
        }`}>
          {status.ok
            ? <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          }
          <pre className="whitespace-pre-wrap font-sans leading-relaxed">{status.msg}</pre>
        </div>
      )}

      {/* ── Historial ── */}
      <div className="space-y-2">
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-0.5 w-fit">
          {["ICL", "IPC"].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === t
                  ? "bg-white dark:bg-[#333333] text-gray-800 dark:text-gray-200 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t} ({(t === "ICL" ? iclRows : ipcRows).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-3 justify-center">
            <Loader2 size={14} className="animate-spin text-gray-400" />
            <p className="text-xs text-gray-400">Cargando historial…</p>
          </div>
        ) : (
          <IndicesTable tipo={activeTab} rows={activeRows} onDelete={deleteRow} />
        )}
      </div>
    </div>
  );
}