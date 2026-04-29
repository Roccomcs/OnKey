// backend/services/subscriptionService.js
import { pool } from '../db.js';
import { createPreapproval, getPreapproval, cancelPreapproval } from './mpService.js';

// ─────────────────────────────────────────────
// PLANES
// ─────────────────────────────────────────────

export async function getAllPlans() {
  const [planes] = await pool.query(
    'SELECT * FROM planes ORDER BY precio_mensual ASC'
  );
  return planes;
}

export async function getPlanById(planId) {
  const [planes] = await pool.query(
    'SELECT * FROM planes WHERE id = ? LIMIT 1',
    [planId]
  );
  return planes.length > 0 ? planes[0] : null;
}

/**
 * Devuelve los límites del plan activo de un usuario.
 * Retorna { max_propiedades, max_contratos, max_contactos, max_usuarios }
 * NULL en cualquier campo significa ilimitado.
 */
export async function getPlanLimits(usuarioId, tenantId) {
  const [rows] = await pool.query(
    `SELECT p.max_propiedades, p.max_contratos, p.max_contactos, p.max_usuarios
     FROM suscripciones s
     JOIN planes p ON p.id = s.plan_id
     WHERE s.usuario_id = ? AND s.tenant_id = ?
       AND s.estado = 'activo' AND s.fecha_fin >= CURDATE()
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [usuarioId, tenantId]
  );
  return rows.length > 0 ? rows[0] : null;
}

// ─────────────────────────────────────────────
// SUSCRIPCIONES
// ─────────────────────────────────────────────

/**
 * Asigna el plan Starter automáticamente al registrarse.
 * Fecha_fin = 100 años (equivale a "sin vencimiento" para plan Starter).
 */
export async function assignFreePlan(usuarioId, tenantId) {
  const [planes] = await pool.query(
    "SELECT id FROM planes WHERE nombre IN ('Starter', 'Gratis') LIMIT 1"
  );
  if (!planes.length) throw new Error('Plan Starter/Gratis no configurado en la BD. Ejecutá la migración 002-add-suscripciones.sql');

  const planId = planes[0].id;
  const fechaFin = new Date();
  fechaFin.setFullYear(fechaFin.getFullYear() + 100);
  const fechaFinStr = fechaFin.toISOString().split('T')[0];

  await pool.query(
    `INSERT INTO suscripciones
       (usuario_id, tenant_id, plan_id, fecha_inicio, fecha_fin,
        fecha_renovacion_proximo, ciclo_facturacion, estado, renovacion_automatica)
     VALUES (?, ?, ?, CURDATE(), ?, ?, 'mensual', 'activo', FALSE)`,
    [usuarioId, tenantId, planId, fechaFinStr, fechaFinStr]
  );
}

/**
 * Obtiene la suscripción activa de un usuario
 */
export async function getActiveSubscription(usuarioId, tenantId) {
  const [rows] = await pool.query(
    `SELECT s.*, p.nombre AS plan_nombre
     FROM suscripciones s
     JOIN planes p ON p.id = s.plan_id
     WHERE s.usuario_id = ? AND s.tenant_id = ?
       AND s.estado = 'activo' AND s.fecha_fin >= CURDATE()
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [usuarioId, tenantId]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Verifica si la suscripción está activa y no vencida
 */
export async function isSubscriptionActive(usuarioId, tenantId) {
  const [result] = await pool.query(
    `SELECT COUNT(*) AS count FROM suscripciones
     WHERE usuario_id = ? AND tenant_id = ?
       AND estado = 'activo' AND fecha_fin >= CURDATE()`,
    [usuarioId, tenantId]
  );
  return result[0].count > 0;
}

// ─────────────────────────────────────────────
// UPGRADE CON MERCADOPAGO
// ─────────────────────────────────────────────

/**
 * Inicia el proceso de upgrade:
 * 1. Obtiene el plan con su mp_plan_id
 * 2. Crea el preapproval en MP
 * 3. Guarda la suscripción como 'pendiente' en la BD
 * 4. Devuelve { init_point } para redirigir al usuario
 */
export async function initiateUpgrade(usuarioId, tenantId, planId, email) {
  const plan = await getPlanById(planId);
  if (!plan) throw new Error('Plan no encontrado');
  if (!plan.mp_plan_id) throw new Error('Este plan no tiene un ID de MercadoPago configurado. Ejecutá setupMpPlans.js');

  // Crear preapproval en MP
  const preapproval = await createPreapproval({
    planMpId: plan.mp_plan_id,
    email,
  });

  // Guardar suscripción pendiente en BD
  await pool.query(
    `INSERT INTO suscripciones
       (usuario_id, tenant_id, plan_id, fecha_inicio, fecha_fin,
        fecha_renovacion_proximo, ciclo_facturacion, estado,
        renovacion_automatica, mp_preapproval_id)
     VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY),
             DATE_ADD(CURDATE(), INTERVAL 30 DAY),
             'mensual', 'pendiente', TRUE, ?)`,
    [usuarioId, tenantId, planId, preapproval.id]
  );

  return {
    init_point: preapproval.init_point,
    preapproval_id: preapproval.id,
  };
}

/**
 * Activa una suscripción cuando MP confirma el pago (webhook authorized).
 * C6: Usa FOR UPDATE para evitar race condition.
 * Verifica el estado real en MP ANTES de abrir transacción.
 */
export async function activateSubscription(mpPreapprovalId) {
  // Verificar estado real en MP ANTES de transacción
  const preapproval = await getPreapproval(mpPreapprovalId);
  if (preapproval.status !== 'authorized') {
    throw new Error(`Pago no autorizado. Estado MP: ${preapproval.status}`);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // FOR UPDATE bloquea la fila — llamadas concurrentes esperan
    const [rows] = await conn.query(
      "SELECT * FROM suscripciones WHERE mp_preapproval_id = ? AND estado = 'pendiente' LIMIT 1 FOR UPDATE",
      [mpPreapprovalId]
    );
    if (!rows.length) {
      await conn.rollback();
      throw new Error('Suscripción pendiente no encontrada o ya fue procesada');
    }

    const sub = rows[0];

    // ✅ CRITICAL: Validar que el monto aprobado coincide con el plan
    const [planRows] = await conn.query(
      'SELECT precio_mensual FROM planes WHERE id = ? LIMIT 1',
      [sub.plan_id]
    );
    if (!planRows.length) {
      await conn.rollback();
      throw new Error('Plan no encontrado');
    }

    const planPrice = planRows[0].precio_mensual;
    const approvedAmount = preapproval.auto_recurring?.transaction_amount ?? 0;

    // Permitir pequeña diferencia por redondeo (0.01)
    if (Math.abs(approvedAmount - planPrice) > 0.01) {
      await conn.rollback();
      console.error(
        `[webhook] ❌ MONTO INVÁLIDO: Plan=${planPrice}, Aprobado=${approvedAmount}, Preapproval=${mpPreapprovalId}`
      );
      throw new Error(
        `Monto no coincide. Plan: $${planPrice}, Aprobado: $${approvedAmount}`
      );
    }

    // Cancelar suscripciones activas anteriores del mismo usuario/tenant
    await conn.query(
      `UPDATE suscripciones
       SET estado = 'cancelado', updated_at = NOW()
       WHERE usuario_id = ? AND tenant_id = ? AND estado = 'activo'`,
      [sub.usuario_id, sub.tenant_id]
    );

    // Activar la nueva
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 1);
    await conn.query(
      `UPDATE suscripciones
       SET estado = 'activo',
           fecha_inicio = CURDATE(),
           fecha_fin = ?,
           fecha_renovacion_proximo = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [fechaFin.toISOString().split('T')[0], fechaFin.toISOString().split('T')[0], sub.id]
    );

    await conn.commit();
    return { sub, montoAprobado: approvedAmount };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Cancela suscripción en MP y en la BD
 */
export async function cancelSubscription(suscripcionId, usuarioId) {
  const [rows] = await pool.query(
    'SELECT * FROM suscripciones WHERE id = ? AND usuario_id = ? LIMIT 1',
    [suscripcionId, usuarioId]
  );
  if (!rows.length) throw new Error('Suscripción no encontrada');
  const sub = rows[0];

  if (sub.mp_preapproval_id) {
    try { await cancelPreapproval(sub.mp_preapproval_id); } catch (e) {
      console.warn('[subscriptionService] No se pudo cancelar en MP:', e.message);
    }
  }

  await pool.query(
    "UPDATE suscripciones SET estado = 'cancelado', updated_at = NOW() WHERE id = ?",
    [suscripcionId]
  );
  return true;
}

// ─────────────────────────────────────────────
// HISTORIAL DE PAGOS
// ─────────────────────────────────────────────

export async function recordPayment(suscripcionId, usuarioId, tenantId, monto, estado = 'completado', transaccionId = null) {
  const montoValido = typeof monto === 'number' && isFinite(monto) && monto >= 0 ? monto : 0;
  if (montoValido !== monto) {
    console.warn(`[recordPayment] Monto inválido recibido: ${monto} — usando 0`);
  }
  const [result] = await pool.query(
    `INSERT INTO pagos (suscripcion_id, usuario_id, tenant_id, monto, estado, transaccion_id, fecha_pago)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [suscripcionId, usuarioId, tenantId, montoValido, estado, transaccionId]
  );
  return result.insertId;
}

export async function getPaymentHistory(usuarioId, tenantId) {
  const [pagos] = await pool.query(
    `SELECT p.*, pl.nombre AS plan_nombre
     FROM pagos p
     JOIN suscripciones s ON s.id = p.suscripcion_id
     JOIN planes pl ON pl.id = s.plan_id
     WHERE p.usuario_id = ? AND p.tenant_id = ?
     ORDER BY p.created_at DESC LIMIT 50`,
    [usuarioId, tenantId]
  );
  return pagos;
}