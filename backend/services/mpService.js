// backend/services/mpService.js
// Wrapper para la API de MercadoPago Subscriptions (preapproval)

const MP_BASE = 'https://api.mercadopago.com';

function getHeaders() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN no está configurado en .env');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Crea un plan de suscripción en MercadoPago (preapproval_plan).
 * Se ejecuta UNA SOLA VEZ por plan con: node setupMpPlans.js
 */
export async function createMpPlan({ reason, monto }) {
  const res = await fetch(`${MP_BASE}/preapproval_plan`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      reason,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: monto,
        currency_id: 'ARS',
      },
      back_url: process.env.FRONTEND_URL || 'http://localhost:5173',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`MP createMpPlan: ${JSON.stringify(data)}`);
  return data; // { id, init_point, ... }
}

/**
 * Crea una suscripción para un usuario (preapproval).
 * Devuelve { id, init_point } → redirigir al usuario a init_point
 */
export async function createPreapproval({ planMpId, email }) {
  const backUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/planes`;
  const res = await fetch(`${MP_BASE}/preapproval`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      preapproval_plan_id: planMpId,
      payer_email: email,
      back_url: backUrl,
      status: 'pending',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`MP createPreapproval: ${JSON.stringify(data)}`);
  return data; // { id, init_point, status, ... }
}

/**
 * Obtiene el estado actual de una suscripción en MP
 */
export async function getPreapproval(preapprovalId) {
  const res = await fetch(`${MP_BASE}/preapproval/${preapprovalId}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`MP getPreapproval: ${JSON.stringify(data)}`);
  return data;
}

/**
 * Cancela una suscripción en MercadoPago
 */
export async function cancelPreapproval(preapprovalId) {
  const res = await fetch(`${MP_BASE}/preapproval/${preapprovalId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status: 'cancelled' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`MP cancelPreapproval: ${JSON.stringify(data)}`);
  return data;
}