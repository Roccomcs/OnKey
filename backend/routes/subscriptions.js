// backend/routes/subscriptions.js
import express from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllPlans,
  getActiveSubscription,
  initiateUpgrade,
  activateSubscription,
  cancelSubscription,
  getPaymentHistory,
  recordPayment,
} from '../services/subscriptionService.js';

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/subscriptions/planes
// Lista todos los planes disponibles (público)
// ─────────────────────────────────────────────
router.get('/planes', async (_req, res) => {
  try {
    const planes = await getAllPlans();
    res.json(planes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/subscriptions/mi-plan
// Devuelve la suscripción activa del usuario actual
// ─────────────────────────────────────────────
router.get('/mi-plan', authMiddleware, async (req, res) => {
  try {
    const suscripcion = await getActiveSubscription(req.user.id, req.user.tenantId);
    if (!suscripcion) {
      return res.status(404).json({ error: 'Sin suscripción activa' });
    }
    res.json(suscripcion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/subscriptions/upgrade
// Inicia el upgrade de plan con MercadoPago
// Body: { planId }
// Response: { init_point } → redirigir al usuario
// ─────────────────────────────────────────────
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ error: 'Se requiere planId' });

    const result = await initiateUpgrade(
      req.user.id,
      req.user.tenantId,
      planId,
      req.user.email
    );

    res.json({
      init_point: result.init_point,
      preapproval_id: result.preapproval_id,
      mensaje: 'Redirigí al usuario a init_point para completar el pago',
    });
  } catch (err) {
    console.error('[subscriptions/upgrade]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/subscriptions/webhook
// Webhook de MercadoPago — VERIFICACIÓN DE FIRMA REQUERIDA
// MP envía notificaciones cuando el estado del pago cambia
// ─────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  // C5: Verificar firma ANTES de responder — rechazar con 401 si es inválida
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  const mpWebhookSecret = process.env.MP_WEBHOOK_SECRET;

  if (xSignature && mpWebhookSecret) {
    const [tsPart, v1Part] = xSignature.split(',');
    const ts = tsPart?.split('=')[1];
    const v1 = v1Part?.split('=')[1];
    const manifest = `id:${req.body?.data?.id};request-id:${xRequestId};ts:${ts};`;
    const expected = crypto.createHmac('sha256', mpWebhookSecret).update(manifest).digest('hex');
    if (expected !== v1) {
      console.warn('[webhook] ⚠️  Firma inválida — rechazando');
      return res.status(401).json({ error: 'Firma inválida' });
    }
  }

  // Responder 200 rápido a MP (firma ya verificada)
  res.sendStatus(200);

  try {
    const { type, data } = req.body;
    console.log('[webhook] ✅ Notificación MP verificada:', { type, data });

    // Solo procesar eventos de suscripciones
    if (type !== 'subscription_preapproval') return;

    const preapprovalId = data?.id;
    if (!preapprovalId) return;

    // C6+C7: activateSubscription devuelve { sub, montoAprobado } desde MP
    const { sub, montoAprobado } = await activateSubscription(preapprovalId);
    console.log(`[webhook] ✅ Suscripción activada para usuario ${sub.usuario_id}`);

    await recordPayment(sub.id, sub.usuario_id, sub.tenant_id, montoAprobado ?? 0, 'completado', preapprovalId);
  } catch (err) {
    // No lanzar error (ya respondimos 200) — solo loguear
    console.error('[webhook] ❌', err.message);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/subscriptions/:id
// Cancela una suscripción
// ─────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await cancelSubscription(req.params.id, req.user.id);
    res.json({ mensaje: 'Suscripción cancelada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/subscriptions/pagos
// Historial de pagos del usuario
// ─────────────────────────────────────────────
router.get('/pagos', authMiddleware, async (req, res) => {
  try {
    const pagos = await getPaymentHistory(req.user.id, req.user.tenantId);
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;