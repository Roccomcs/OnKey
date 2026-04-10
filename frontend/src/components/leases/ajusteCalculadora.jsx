// frontend/src/components/leases/AjusteCalculadora.jsx
import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

// ─── Config ──────────────────────────────────────────────────
const MESES_POR_PERIODO = { trimestral: 3, cuatrimestral: 4, semestral: 6, anual: 12 };
const PERIODO_LABEL     = { trimestral: "trim", cuatrimestral: "cuat", semestral: "sem", anual: "año" };
const N_PERIODOS        = { trimestral: 8, cuatrimestral: 6, semestral: 6, anual: 5 };
const COLOR_TIPO        = { FIJO: "#6366f1", ICL: "#f59e0b", IPC: "#0d9488" };

// ─── Helpers ─────────────────────────────────────────────────
function fmtARS(n) {
  if (n >= 1_000_000)
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function fmtAbbrev(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

// ─── Bar Chart ───────────────────────────────────────────────
function BarChart({ rows, color }) {
  const W = 520, H = 110;
  const max = Math.max(...rows.map((r) => r.renta), 1);
  const n   = rows.length;
  const slotW = W / n;
  const barW  = Math.min(38, slotW * 0.62);

  return (
    <svg viewBox={`0 0 ${W} ${H + 32}`} className="w-full overflow-visible">
      {/* Baseline */}
      <line x1={0} y1={H} x2={W} y2={H} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />

      {rows.map((r, i) => {
        const bH  = Math.max(6, (r.renta / max) * H);
        const x   = i * slotW + (slotW - barW) / 2;
        const y   = H - bH;
        const isBase = i === 0;
        const fill = isBase ? "#6b7280" : color;

        return (
          <g key={i}>
            {/* Bar */}
            <rect x={x} y={y} width={barW} height={bH} rx={5} fill={fill} opacity={isBase ? 0.5 : 0.82} />
            {/* Value above bar */}
            <text
              x={x + barW / 2} y={y - 5}
              textAnchor="middle" fontSize={7.5}
              fill={fill} opacity={0.9} fontWeight="600"
            >
              {fmtAbbrev(r.renta)}
            </text>
            {/* Label below */}
            <text
              x={x + barW / 2} y={H + 17}
              textAnchor="middle" fontSize={8}
              fill="currentColor" opacity={0.5}
            >
              {r.label}
            </text>
            {/* Date below label */}
            <text
              x={x + barW / 2} y={H + 27}
              textAnchor="middle" fontSize={7}
              fill="currentColor" opacity={0.35}
            >
              {r.fecha}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────
/**
 * Props:
 *   tipoAjuste     "FIJO" | "ICL" | "IPC"
 *   periodicidad   "trimestral" | "cuatrimestral" | "semestral" | "anual"
 *   rentaBase      number | string
 *   ipcRows        [{periodo, valor}] ordenados DESC — solo para IPC
 *   variacionManual number | string — % por período (FIJO o ICL)
 */
export function AjusteCalculadora({ tipoAjuste, periodicidad, rentaBase, ipcRows = [], variacionManual = 0 }) {
  const meses  = MESES_POR_PERIODO[periodicidad] ?? 6;
  const nP     = N_PERIODOS[periodicidad] ?? 4;
  const pLabel = PERIODO_LABEL[periodicidad] ?? "per";
  const color  = COLOR_TIPO[tipoAjuste] ?? "#0d9488";

  // IPC: promedio de los últimos 6 meses para proyectar
  const avgIPC = useMemo(() => {
    if (!ipcRows?.length) return 0;
    const slice = ipcRows.slice(0, Math.min(6, ipcRows.length));
    return slice.reduce((s, r) => s + r.valor, 0) / slice.length;
  }, [ipcRows]);

  // Variación compuesta por período
  const variacionPorPeriodo = useMemo(() => {
    if (tipoAjuste === "IPC") {
      if (avgIPC <= 0) return 0;
      return (Math.pow(1 + avgIPC / 100, meses) - 1) * 100;
    }
    return parseFloat(variacionManual) || 0;
  }, [tipoAjuste, meses, avgIPC, variacionManual]);

  // Filas de la proyección
  const rows = useMemo(() => {
    const base = parseFloat(rentaBase) || 0;
    if (base <= 0) return [];
    const result = [];
    let renta = base;
    const now = new Date();
    for (let i = 0; i <= nP; i++) {
      const fecha = new Date(now.getFullYear(), now.getMonth() + i * meses, 1);
      if (i > 0) renta = renta * (1 + variacionPorPeriodo / 100);
      result.push({
        num:      i,
        label:    i === 0 ? "Base" : `${i}° ${pLabel}`,
        fecha:    fecha.toLocaleDateString("es-AR", { month: "short", year: "2-digit" }),
        renta:    Math.round(renta),
        ajustePct: i === 0 ? 0 : variacionPorPeriodo,
      });
    }
    return result;
  }, [rentaBase, variacionPorPeriodo, nP, meses, pLabel]);

  if (!rows.length) return null;

  const totalAumentoPct = rows.length > 1
    ? ((rows[rows.length - 1].renta / rows[0].renta - 1) * 100).toFixed(1)
    : "0.0";

  const periodosLabel = periodicidad === "anual"
    ? `${nP} años`
    : `${nP} períodos ${periodicidad}es`;

  return (
    <div className="space-y-3 pt-1">
      {/* Chart */}
      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 text-gray-500 dark:text-gray-400">
        <BarChart rows={rows} color={color} />
      </div>

      {/* IPC projection notice */}
      {tipoAjuste === "IPC" && avgIPC > 0 && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 pl-1 italic">
          * Proyección estimada: IPC promedio mensual {avgIPC.toFixed(2)}% →{" "}
          <strong>{variacionPorPeriodo.toFixed(2)}%</strong> por período {periodicidad}
        </p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th className="text-left px-3 py-2 font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide text-[10px]">Período</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide text-[10px]">Fecha</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide text-[10px]">Ajuste</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide text-[10px]">Renta mensual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.num}
                className={`border-t border-gray-100 dark:border-gray-700/60 ${
                  r.num === 0 ? "bg-gray-50/50 dark:bg-gray-700/20" : ""
                }`}
              >
                <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.label}</td>
                <td className="px-3 py-2 text-gray-400 dark:text-gray-500">{r.fecha}</td>
                <td className="px-3 py-2 text-right">
                  {r.num === 0 ? (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  ) : (
                    <span
                      className="font-semibold"
                      style={{ color }}
                    >
                      +{r.ajustePct.toFixed(2)}%
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-bold text-gray-800 dark:text-gray-100">
                  {fmtARS(r.renta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary pill */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
        style={{ backgroundColor: `${color}18`, color }}
      >
        <TrendingUp size={13} />
        <span>
          Aumento total proyectado:{" "}
          <strong>+{totalAumentoPct}%</strong> en {periodosLabel}
        </span>
        <span className="ml-auto text-[11px] opacity-70">
          {fmtARS(rows[0].renta)} → {fmtARS(rows[rows.length - 1].renta)}
        </span>
      </div>
    </div>
  );
}