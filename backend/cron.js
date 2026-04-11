// ============================================================
//  backend/cron.js
//  Evaluador diario de actualizaciones de contratos
// ============================================================

import cron from "node-cron";
import { pool } from "./db.js";
import { syncIndicesForTenant } from "./routes/indices.js";
import {
  calcularMontoProyectado,
  calcularProximaActualizacion,
} from "./services/rentCalc.js";

// ─── Logger mínimo ───────────────────────────────────────────
function log(msg) {
  console.log(`[CRON ${new Date().toISOString()}] ${msg}`);
}
function warn(msg) {
  console.warn(`[CRON ${new Date().toISOString()}] ⚠ ${msg}`);
}

// ─── Sincronización de índices desde APIs externas ───────────
// Llama directamente a la lógica de sync — sin HTTP interno
export async function sincronizarIndices() {
  log("Sincronizando índices BCRA…");

  const [tenants] = await pool.query(
    "SELECT id FROM tenants WHERE activo = TRUE"
  );

  for (const tenant of tenants) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const data = await syncIndicesForTenant(tenant.id, conn);
      await conn.commit();
      log(`Tenant #${tenant.id} — ICL: ${data.ICL ?? 0}, IPC: ${data.IPC ?? 0}`);
      if (data.errores?.length) warn(`Tenant #${tenant.id} errores: ${data.errores.join(", ")}`);
    } catch (e) {
      await conn.rollback();
      warn(`Tenant #${tenant.id} — sync falló: ${e.message}`);
    } finally {
      conn.release();
    }
  }
}

// ─── Evaluador principal ──────────────────────────────────────
export async function evaluarActualizacionesContratos() {
  log("Iniciando evaluación de actualizaciones de contratos…");

  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];
  const en30 = new Date(hoy);
  en30.setDate(en30.getDate() + 30);
  const en30Str = en30.toISOString().split("T")[0];

  try {
    const [contratos] = await pool.query(
      `SELECT
         c.id,
         c.monto_renta,
         c.tipo_ajuste,
         c.periodo_ajuste,
         c.porcentaje_ajuste,
         c.indice_base_fecha,
         c.indice_base_valor,
         c.proxima_actualizacion,
         c.fecha_inicio,
         c.fecha_fin,
         pi.nombre    AS inq_nombre,
         pi.apellido  AS inq_apellido,
         pi.email     AS inq_email,
         pp.nombre    AS prop_nombre,
         pp.apellido  AS prop_apellido,
         pp.email     AS prop_email,
         pr.direccion AS prop_direccion
       FROM contratos c
       JOIN personas pi ON pi.id = c.inquilino_id
       JOIN personas pp ON pp.id = c.propietario_id
       JOIN propiedades pr ON pr.id = c.propiedad_id
       WHERE c.estado_contrato = 'activo'
         AND c.proxima_actualizacion IS NOT NULL
         AND c.proxima_actualizacion BETWEEN ? AND ?`,
      [hoyStr, en30Str]
    );

    if (!contratos.length) {
      log("Sin contratos a evaluar en los próximos 30 días.");
      return;
    }

    log(`Evaluando ${contratos.length} contrato(s)…`);

    for (const c of contratos) {
      const fechaAct =
        c.proxima_actualizacion instanceof Date
          ? c.proxima_actualizacion.toISOString().split("T")[0]
          : String(c.proxima_actualizacion).slice(0, 10);

      const diasRestantes = Math.ceil(
        (new Date(fechaAct) - hoy) / 86400000
      );

      let tipoAlerta = null;
      if (diasRestantes <= 0) tipoAlerta = "HOY";
      else if (diasRestantes <= 15) tipoAlerta = "15_DIAS";
      else if (diasRestantes <= 30) tipoAlerta = "30_DIAS";
      if (!tipoAlerta) continue;

      // Deduplicación
      const [[existente]] = await pool.query(
        `SELECT id FROM alertas_actualizacion
         WHERE contrato_id = ? AND tipo_alerta = ? AND fecha_alerta = ?
         LIMIT 1`,
        [c.id, tipoAlerta, fechaAct]
      );
      if (existente) {
        log(`Contrato #${c.id} — alerta ${tipoAlerta} ya emitida. Omitiendo.`);
        continue;
      }

      const { montoProyectado, indiceActualValor } =
        await calcularMontoProyectado({
          monto_renta: c.monto_renta,
          tipo_ajuste: c.tipo_ajuste ?? "FIJO",
          porcentaje_ajuste: c.porcentaje_ajuste,
          indice_base_valor: c.indice_base_valor
            ? parseFloat(c.indice_base_valor)
            : null,
          proxima_actualizacion: fechaAct,
        });

      await pool.query(
        `INSERT INTO alertas_actualizacion
           (contrato_id, tipo_alerta, fecha_alerta, monto_base, monto_proyectado, indice_actual_valor)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          tipoAlerta,
          fechaAct,
          c.monto_renta,
          montoProyectado,
          indiceActualValor,
        ]
      );

      const montoStr = montoProyectado
        ? `$${Number(montoProyectado).toLocaleString("es-AR")}`
        : "(índice no disponible aún)";

      log(
        `🔔 ALERTA [${tipoAlerta}] — Contrato #${c.id}\n` +
          `   Propiedad  : ${c.prop_direccion}\n` +
          `   Inquilino  : ${c.inq_nombre} ${c.inq_apellido} <${c.inq_email}>\n` +
          `   Propietario: ${c.prop_nombre} ${c.prop_apellido} <${c.prop_email}>\n` +
          `   Tipo ajuste: ${c.tipo_ajuste ?? "FIJO"} (${c.periodo_ajuste})\n` +
          `   Fecha act. : ${fechaAct}  (en ${diasRestantes} días)\n` +
          `   Monto base : $${Number(c.monto_renta).toLocaleString("es-AR")}\n` +
          `   Monto proy.: ${montoStr}`
      );

      // Si es HOY → avanzar proxima_actualizacion al siguiente período
      if (tipoAlerta === "HOY") {
        const siguiente = calcularProximaActualizacion(
          fechaAct,
          c.periodo_ajuste ?? "anual"
        );
        await pool.query(
          "UPDATE contratos SET proxima_actualizacion = ? WHERE id = ?",
          [siguiente, c.id]
        );
        log(
          `Contrato #${c.id} — próxima actualización avanzada a ${siguiente}`
        );
      }
    }

    log("Evaluación finalizada.");
  } catch (err) {
    warn(`Error en evaluación: ${err.message}`);
    console.error(err);
  }
}

// ─── Cron único: primero sync de índices, luego evaluación ───
// Todos los días a las 08:00 hora Argentina
cron.schedule(
  "0 8 * * *",
  async () => {
    try {
      await sincronizarIndices();
      await evaluarActualizacionesContratos();
    } catch (err) {
      console.error(`[CRON] Error no manejado:`, err);
    }
  },
  {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires",
  }
);

log("Cron registrado — ejecución diaria a las 08:00 ART");

export default evaluarActualizacionesContratos;