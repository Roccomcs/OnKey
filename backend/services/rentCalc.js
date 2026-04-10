// ============================================================
//  backend/services/rentCalc.js
//  Helper puro para cálculos de actualización de alquiler
//  Sin efectos secundarios — todas las funciones son puras o
//  reciben el pool como dependencia inyectada.
// ============================================================

import { pool } from "../db.js";

// ─── Períodos en meses ────────────────────────────────────────
const PERIOD_MONTHS = {
  trimestral:    3,
  cuatrimestral: 4,
  semestral:     6,
  anual:         12,
};

// ─── Calcula la próxima fecha de actualización ───────────────
/**
 * @param {string} fechaInicio   ISO "YYYY-MM-DD"
 * @param {string} periodo       "trimestral" | "semestral" | "anual"
 * @param {string} [desde]       ISO "YYYY-MM-DD" — base desde la cual avanzar
 *                               Si no se pasa, se usa fechaInicio.
 * @returns {string}             ISO "YYYY-MM-DD"
 */
export function calcularProximaActualizacion(fechaInicio, periodo, desde = null) {
  const months = PERIOD_MONTHS[periodo] ?? 12;
  const base   = new Date(desde ?? fechaInicio);
  base.setMonth(base.getMonth() + months);
  return base.toISOString().split("T")[0];
}

// ─── Fórmula de actualización por índice ─────────────────────
/**
 * Monto Actualizado = Monto Base × (Índice actual / Índice base)
 * @param {number} montoBase
 * @param {number} indiceActual
 * @param {number} indiceBase
 * @returns {number} — redondeado a 2 decimales
 */
export function calcularMontoConIndice(montoBase, indiceActual, indiceBase) {
  if (!indiceBase || indiceBase === 0) {
    throw new Error("El índice base no puede ser 0");
  }
  return Math.round((montoBase * (indiceActual / indiceBase)) * 100) / 100;
}

// ─── Fórmula de actualización fija ───────────────────────────
/**
 * @param {number} montoBase
 * @param {number} porcentaje  — ej: 10 para 10%
 * @returns {number}
 */
export function calcularMontoFijo(montoBase, porcentaje) {
  return Math.round(montoBase * (1 + porcentaje / 100) * 100) / 100;
}

// ─── Obtiene el valor de un índice para un mes/año ───────────
/**
 * Busca el valor más reciente del índice <= fecha solicitada.
 * Permite tolerar que el índice del mes exacto no haya sido cargado aún.
 *
 * @param {string} tipo    "ICL" | "IPC"
 * @param {string} fecha   ISO "YYYY-MM-DD" — busca el índice del mes de esa fecha
 * @returns {Promise<{ periodo: string, valor: number } | null>}
 */
export async function obtenerIndice(tipo, fecha) {
  // Normaliza al primer día del mes
  const primerDia = fecha.slice(0, 7) + "-01";

  const [rows] = await pool.query(
    `SELECT periodo, valor
     FROM indices_historicos
     WHERE tipo = ? AND periodo <= ?
     ORDER BY periodo DESC
     LIMIT 1`,
    [tipo, primerDia]
  );

  if (!rows.length) return null;
  return {
    periodo: rows[0].periodo instanceof Date
      ? rows[0].periodo.toISOString().split("T")[0]
      : String(rows[0].periodo),
    valor: parseFloat(rows[0].valor),
  };
}

// ─── Calcula el monto proyectado para un contrato ────────────
/**
 * Calcula el monto actualizado según el tipo de ajuste del contrato.
 * Devuelve null si los índices requeridos no están disponibles.
 *
 * @param {{
 *   monto_renta:       number,
 *   tipo_ajuste:       "FIJO"|"ICL"|"IPC",
 *   porcentaje_ajuste: number|null,
 *   indice_base_valor: number|null,
 *   proxima_actualizacion: string,
 * }} contrato
 * @returns {Promise<{ montoProyectado: number|null, indiceActualValor: number|null }>}
 */
export async function calcularMontoProyectado(contrato) {
  const {
    monto_renta,
    tipo_ajuste,
    porcentaje_ajuste,
    indice_base_valor,
    proxima_actualizacion,
  } = contrato;

  if (tipo_ajuste === "FIJO") {
    const monto = calcularMontoFijo(monto_renta, porcentaje_ajuste ?? 0);
    return { montoProyectado: monto, indiceActualValor: null };
  }

  // ICL o IPC
  const indiceActual = await obtenerIndice(tipo_ajuste, proxima_actualizacion);
  if (!indiceActual || !indice_base_valor) {
    return { montoProyectado: null, indiceActualValor: null };
  }

  const monto = calcularMontoConIndice(
    monto_renta,
    indiceActual.valor,
    indice_base_valor
  );
  return { montoProyectado: monto, indiceActualValor: indiceActual.valor };
}

// ─── Parsea el string legado "10% trimestral" ────────────────
/**
 * Compatibilidad con registros viejos que usaban indice_ajuste como string.
 * @param {string|null} indice
 * @returns {{ porcentaje: number, periodo: string }}
 */
export function parseLegacyIndiceAjuste(indice) {
  if (!indice) return { porcentaje: 6, periodo: "anual" };
  const match = String(indice).match(/^([\d.]+)%?\s*(trimestral|semestral|anual)?/i);
  if (!match) return { porcentaje: 6, periodo: "anual" };
  return {
    porcentaje: Number(match[1]) || 6,
    periodo:    (match[2] || "anual").toLowerCase(),
  };
}