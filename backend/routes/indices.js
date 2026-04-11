import { Router } from "express";
import { fetch as undiciFetch, Agent } from "undici";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";

// Agente undici con SSL desactivado solo para BCRA — no afecta fetch global
const bcraAgent = new Agent({ connect: { rejectUnauthorized: false } });

const router = Router();

// ─── GET /api/indices/health (PUBLIC - no auth required) ──────
router.get("/health", async (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

router.use(authMiddleware);
router.use(subscriptionMiddleware);

// ─── Helpers ──────────────────────────────────────────────────
function fmtFecha(date) {
  return date.toISOString().split("T")[0];
}

function fmtPeriodo(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

// Fix: solo últimos 10 años — para alquileres no necesitamos datos de 1943
const AÑOS_HISTORIAL = 10;
function fechaDesde() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - AÑOS_HISTORIAL);
  return d.toISOString().slice(0, 10);
}

const BCRA_VAR_IDS = { ICL: 40, IPC: 29 };

// ─── Fuente 1: BCRA (fetch nativo con SSL bypass via NODE_TLS_REJECT_UNAUTHORIZED) ──
// Fix: eliminamos undici (no está instalado). Usamos fetch nativo con variable de entorno.
async function fetchBCRA(tipo) {
  const varId = BCRA_VAR_IDS[tipo];
  if (!varId) throw new Error(`Variable ID no definida para ${tipo}`);

  const hasta = new Date();
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 18);

  const url =
    `https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable/` +
    `${varId}/${fmtFecha(desde)}/${fmtFecha(hasta)}`;

  console.log(`[fetchBCRA] ${tipo}: Solicitando ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await undiciFetch(url, {
      headers: { Accept: "application/json", "User-Agent": "OnKey/1.0" },
      signal: controller.signal,
      dispatcher: bcraAgent,
    });
    clearTimeout(timeout);

    console.log(`[fetchBCRA] ${tipo}: Status ${res.status}`);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`BCRA HTTP ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = await res.json();
    const results = json.results ?? json.data ?? [];

    if (!Array.isArray(results) || results.length === 0)
      throw new Error(`BCRA devolvió respuesta vacía para variable ${varId}`);

    const cutoff = fechaDesde();
    const filtered = results
      .filter((r) => r.fecha && r.valor != null && String(r.fecha) >= cutoff)
      .map((r) => ({ fecha: String(r.fecha).slice(0, 10), valor: parseFloat(r.valor) }))
      .filter((r) => !isNaN(r.valor) && isFinite(r.valor));

    console.log(`[fetchBCRA] ${tipo}: ${filtered.length} registros válidos (últimos ${AÑOS_HISTORIAL} años)`);
    return filtered;
  } catch (err) {
    clearTimeout(timeout);
    throw new Error(`BCRA falló: ${err.message}`);
  }
}

// ─── Fuente 2: ArgentinaDatos.com ────────────────────────────
async function fetchArgentinaDatos(tipo) {
  const endpoints = {
    ICL: ["https://api.argentinadatos.com/v1/finanzas/indices/icl"],
    IPC: ["https://api.argentinadatos.com/v1/finanzas/indices/inflacion"],
  };

  const urls = endpoints[tipo] ?? [];
  let lastErr = null;

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "OnKey/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const items = Array.isArray(json) ? json : json.results ?? json.data ?? [];

      // Fix: filtrar por fecha (solo últimos N años) y permitir negativos válidos
      const cutoff = fechaDesde();
      const rows = items
        .filter((r) => r.fecha && r.valor != null && String(r.fecha) >= cutoff)
        .map((r) => ({ fecha: String(r.fecha).slice(0, 10), valor: parseFloat(r.valor) }))
        .filter((r) => !isNaN(r.valor) && isFinite(r.valor));

      if (rows.length > 0) return rows;
      throw new Error("Sin datos en el rango de fechas");
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(`ArgentinaDatos falló: ${lastErr?.message}`);
}

// ─── Fuente 3: datos.gob.ar (solo IPC) ───────────────────────
async function fetchDatosGobAr(tipo) {
  if (tipo !== "IPC") throw new Error("datos.gob.ar solo tiene IPC");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const url =
      "https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&limit=120&format=json";
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const cutoff = fechaDesde();
    return (json.data ?? [])
      .filter((r) => r[0] && r[1] != null && String(r[0]) >= cutoff)
      .map((r) => ({ fecha: String(r[0]).slice(0, 10), valor: parseFloat(r[1]) }))
      .filter((r) => !isNaN(r.valor) && isFinite(r.valor));
  } catch (e) {
    clearTimeout(timeout);
    throw new Error(`datos.gob.ar falló: ${e.message}`);
  }
}

// ─── Fetch con fallback en cascada ────────────────────────────
async function fetchIndice(tipo) {
  const errores = [];

  try {
    console.log(`[fetchIndice] ${tipo}: Probando BCRA...`);
    const rows = await fetchBCRA(tipo);
    if (rows.length > 0) {
      console.log(`[indices] BCRA OK para ${tipo}: ${rows.length} registros`);
      return { rows, fuente: "BCRA" };
    }
    errores.push("BCRA: respuesta vacía");
  } catch (e1) {
    errores.push(`BCRA: ${e1.message}`);
    console.warn(`[indices] BCRA falló para ${tipo}: ${e1.message}`);
  }

  try {
    console.log(`[fetchIndice] ${tipo}: Probando ArgentinaDatos...`);
    const rows = await fetchArgentinaDatos(tipo);
    if (rows.length > 0) {
      console.log(`[indices] ArgentinaDatos OK para ${tipo}: ${rows.length} registros`);
      return { rows, fuente: "ArgentinaDatos" };
    }
    errores.push("ArgentinaDatos: respuesta vacía");
  } catch (e2) {
    errores.push(`ArgentinaDatos: ${e2.message}`);
    console.warn(`[indices] ArgentinaDatos falló para ${tipo}: ${e2.message}`);
  }

  if (tipo === "IPC") {
    try {
      console.log(`[fetchIndice] ${tipo}: Probando datos.gob.ar...`);
      const rows = await fetchDatosGobAr(tipo);
      if (rows.length > 0) {
        console.log(`[indices] datos.gob.ar OK para ${tipo}: ${rows.length} registros`);
        return { rows, fuente: "datos.gob.ar" };
      }
      errores.push("datos.gob.ar: respuesta vacía");
    } catch (e3) {
      errores.push(`datos.gob.ar: ${e3.message}`);
      console.warn(`[indices] datos.gob.ar falló para ${tipo}: ${e3.message}`);
    }
  }

  throw new Error(`Todas las fuentes fallaron para ${tipo}:\n${errores.join("\n")}`);
}

// ─── Lógica de sync reutilizable (usada por el router Y el cron) ─
export async function syncIndicesForTenant(tenantId, conn) {
  const resultados = { ICL: 0, IPC: 0, errores: [], fuentes: {}, logs: [] };

  for (const tipo of ["ICL", "IPC"]) {
    let fetchResult;
    try {
      console.log(`[indices/sync] Iniciando fetch para ${tipo}...`);
      fetchResult = await fetchIndice(tipo);
      console.log(`[indices/sync] ✅ ${tipo} OK - fuente: ${fetchResult.fuente}, registros: ${fetchResult.rows.length}`);
    } catch (e) {
      const errMsg = `${tipo}: ${e.message}`;
      resultados.errores.push(errMsg);
      resultados.logs.push(`❌ ${errMsg}`);
      console.error(`[indices/sync] Error para ${tipo}:`, e.message);
      continue;
    }

    const { rows, fuente } = fetchResult;
    resultados.fuentes[tipo] = fuente;

    const validRows = rows
      .map((row) => {
        const periodo = row.fecha.slice(0, 7) + "-01";
        const valor = row.valor;
        if (!isFinite(valor) || isNaN(valor)) return null;
        return [tenantId, tipo, periodo, valor];
      })
      .filter(Boolean);

    if (validRows.length > 0) {
      await conn.query(
        `INSERT INTO indices_historicos (tenant_id, tipo, periodo, valor)
         VALUES ?
         ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
        [validRows]
      );
      resultados[tipo] = validRows.length;
    }

    resultados.logs.push(`✅ ${tipo}: ${resultados[tipo]} registros insertados desde ${fuente}`);
    console.log(`[indices/sync] ${tipo}: ${resultados[tipo]} registros insertados`);
  }

  return resultados;
}

// ─── POST /api/indices/sync ───────────────────────────────────
router.post("/sync", async (req, res) => {
  const globalTimeout = setTimeout(() => {
    if (!res.headersSent) {
      console.warn("[indices/sync] Global timeout - respondiendo con resultado parcial");
      res.json({ ok: false, ICL: 0, IPC: 0, errores: ["Timeout: las APIs externas tardaron demasiado"], fuentes: {}, logs: [], totalEnBD: 0 });
    }
  }, 60000);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultados = await syncIndicesForTenant(req.user.tenantId, conn);
    await conn.commit();

    const [[countRow]] = await conn.query(
      "SELECT COUNT(*) as total FROM indices_historicos WHERE tenant_id = ?",
      [req.user.tenantId]
    );

    clearTimeout(globalTimeout);
    console.log(`[indices/sync] ✅ Completado: ICL=${resultados.ICL}, IPC=${resultados.IPC}`);
    res.json({ ok: true, ...resultados, totalEnBD: countRow.total });
  } catch (err) {
    await conn.rollback();
    clearTimeout(globalTimeout);
    console.error("[indices/sync] Error general:", err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─── POST /api/indices ────────────────────────────────────────
router.post("/", async (req, res) => {
  const { tipo, periodo, valor } = req.body;
  if (!tipo || !periodo || valor == null)
    return res.status(400).json({ error: "Faltan campos: tipo, periodo, valor" });
  if (!["ICL", "IPC"].includes(tipo))
    return res.status(400).json({ error: "Tipo inválido: ICL o IPC" });

  const periodoNorm = periodo.slice(0, 7) + "-01";

  try {
    await pool.query(
      `INSERT INTO indices_historicos (tenant_id, tipo, periodo, valor)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
      [req.user.tenantId, tipo, periodoNorm, parseFloat(valor)]
    );
    res.status(201).json({ ok: true, tipo, periodo: periodoNorm, valor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/indices/:tipo (GENERIC ROUTE) ──────────────────
router.get("/:tipo", async (req, res) => {
  const tipo = req.params.tipo.toUpperCase();
  if (!["ICL", "IPC"].includes(tipo))
    return res.status(400).json({ error: "Tipo inválido" });
  try {
    const [rows] = await pool.query(
      `SELECT periodo, valor FROM indices_historicos
       WHERE tipo = ? AND tenant_id = ? ORDER BY periodo DESC LIMIT 24`,
      [tipo, req.user.tenantId]
    );
    res.json(rows.map((r) => ({ periodo: fmtPeriodo(r.periodo), valor: parseFloat(r.valor) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;