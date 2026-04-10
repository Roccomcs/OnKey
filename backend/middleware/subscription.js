// backend/middleware/subscription.js
import { isSubscriptionActive, getActiveSubscription, getPlanLimits } from '../services/subscriptionService.js';
import { pool } from '../db.js';

/**
 * Verifica que el usuario tenga suscripción activa.
 * - Admin → siempre pasa
 * - Otros → necesitan suscripción vigente
 */
export async function subscriptionMiddleware(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });

    // Admins siempre pasan
    if (req.user.rol === 'admin') return next();

    const activa = await isSubscriptionActive(req.user.id, req.user.tenantId);
    if (!activa) {
      return res.status(403).json({
        error: 'Suscripción expirada o inactiva',
        code: 'SUBSCRIPTION_EXPIRED',
      });
    }

    const suscripcion = await getActiveSubscription(req.user.id, req.user.tenantId);
    req.subscription = suscripcion;
    next();
  } catch (err) {
    console.error('[subscriptionMiddleware]', err.message);
    res.status(500).json({ error: 'Error al verificar suscripción' });
  }
}

/**
 * Mapa de recursos a su tabla y columna de tenant en la BD.
 */
const RESOURCE_MAP = {
  propiedades: {
    tabla:       'propiedades',
    limitField:  'max_propiedades',
    countQuery:  (tenantId) => [
      'SELECT COUNT(*) AS total FROM propiedades WHERE tenant_id = ? AND activo = 1',
      [tenantId],
    ],
    label: 'propiedades',
  },
  contratos: {
    tabla:       'contratos',
    limitField:  'max_contratos',
    countQuery:  (tenantId) => [
      "SELECT COUNT(*) AS total FROM contratos WHERE tenant_id = ? AND estado_contrato = 'activo'",
      [tenantId],
    ],
    label: 'contratos activos',
  },
  contactos: {
    tabla:       'personas',
    limitField:  'max_contactos',
    countQuery:  (tenantId) => [
      "SELECT COUNT(*) AS total FROM personas WHERE tenant_id = ? AND activo = 1 AND tipo_persona IN ('propietario', 'inquilino', 'ambos')",
      [tenantId],
    ],
    label: 'contactos',
  },
  usuarios: {
    tabla:       'usuarios',
    limitField:  'max_usuarios',
    countQuery:  (tenantId) => [
      'SELECT COUNT(*) AS total FROM usuarios WHERE tenant_id = ? AND activo = 1',
      [tenantId],
    ],
    label: 'usuarios',
  },
};

/**
 * Verifica que el usuario no haya superado el límite del plan.
 * Solo se aplica en requests POST (creación de recursos).
 * Admins siempre pasan.
 *
 * Uso en rutas:
 *   router.post('/', authMiddleware, subscriptionMiddleware, checkLimits('propiedades'), handler)
 *
 * Recursos soportados: 'propiedades' | 'contratos' | 'contactos' | 'usuarios'
 */
export function checkLimits(recurso) {
  return async (req, res, next) => {
    // Solo verificar en creación
    if (req.method !== 'POST') return next();

    // Admins sin límite
    if (req.user?.rol === 'admin') return next();

    const config = RESOURCE_MAP[recurso];
    if (!config) {
      console.warn(`[checkLimits] Recurso desconocido: "${recurso}"`);
      return next();
    }

    try {
      // Obtener límites del plan activo
      const limites = await getPlanLimits(req.user.id, req.user.tenantId);
      console.log(`[checkLimits] Usuario ${req.user.id}, Recurso: ${recurso}, Limites:`, JSON.stringify(limites));

      if (!limites) {
        // Sin suscripción activa → ya lo maneja subscriptionMiddleware
        console.log(`[checkLimits] Sin suscripción activa para usuario ${req.user.id}`);
        return next();
      }

      const limite = limites[config.limitField];
      console.log(`[checkLimits] Campo buscado: ${config.limitField}, Valor: ${limite}, Tipo: ${typeof limite}`);

      // NULL = ilimitado (plan Enterprise/Premium)
      if (limite === null || limite === undefined) {
        console.log(`[checkLimits] Límite ilimitado para ${recurso}`);
        return next();
      }

      // Validar que es un número
      const limiteNum = Number(limite);
      if (isNaN(limiteNum)) {
        console.error(`[checkLimits] Límite no es número válido: ${limite}`);
        return next();
      }

      // Contar registros actuales del tenant
      const [sql, params] = config.countQuery(req.user.tenantId);
      console.log(`[checkLimits] SQL: ${sql}, params:`, params);
      
      const [results] = await pool.query(sql, params);
      console.log(`[checkLimits] Resultados de query:`, JSON.stringify(results));
      
      const total = results && results.length > 0 && results[0] ? (results[0].total || 0) : 0;
      console.log(`[checkLimits] Total actual de ${recurso}: ${total}, Límite: ${limiteNum}`);

      if (total >= limiteNum) {
        console.log(`[checkLimits] Límite excedido para ${recurso}`);
        return res.status(403).json({
          error: `Límite alcanzado: tu plan permite hasta ${limiteNum} ${config.label}. Actualiza tu plan para continuar.`,
          code: 'PLAN_LIMIT_REACHED',
          recurso,
          limite: limiteNum,
          actual: total,
        });
      }

      console.log(`[checkLimits] Límite OK para ${recurso}`);
      next();
    } catch (err) {
      console.error('[checkLimits] Error:', err.message);
      console.error('[checkLimits] Stack:', err.stack);
      res.status(500).json({ 
        error: 'Error al verificar límites del plan',
        details: err.message 
      });
    }
  };
}