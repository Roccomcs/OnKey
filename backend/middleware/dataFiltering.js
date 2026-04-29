// ============================================================
//  backend/middleware/dataFiltering.js
//  Filtra datos sensibles de respuestas API
//  Remueve: password_hash, token, credentials, etc
// ============================================================

/**
 * Lista de campos que nunca deben exponerse en respuestas API
 */
const SENSITIVE_FIELDS = [
  'password_hash',
  'password',
  'token_verificacion',
  'token_expira',
  'jti',
  'credential',
  'mp_webhook_secret',
  'mp_access_token',
  'google_client_secret',
  'jwt_secret',
];

/**
 * Filtra un objeto removiendo campos sensibles
 * @param {Object} obj - Objeto a filtrar
 * @returns {Object} Objeto filtrado
 */
function filterSensitive(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const filtered = Array.isArray(obj) ? [...obj] : { ...obj };

  if (Array.isArray(filtered)) {
    return filtered.map(item => filterSensitive(item));
  }

  for (const key of SENSITIVE_FIELDS) {
    delete filtered[key];
  }

  // Recursivamente filtra propiedades anidadas
  for (const [key, value] of Object.entries(filtered)) {
    if (typeof value === 'object' && value !== null) {
      filtered[key] = filterSensitive(value);
    }
  }

  return filtered;
}

/**
 * Middleware que filtra respuestas
 * Intercepta res.json() y res.send() para remover sensibles
 */
export function dataFilteringMiddleware() {
  return (req, res, next) => {
    // Interceptar res.json
    const originalJson = res.json;
    res.json = function(data) {
      const filtered = filterSensitive(data);
      return originalJson.call(this, filtered);
    };

    // Interceptar res.send (para strings)
    const originalSend = res.send;
    res.send = function(data) {
      if (typeof data === 'string' && data.startsWith('{')) {
        try {
          const parsed = JSON.parse(data);
          const filtered = filterSensitive(parsed);
          return originalSend.call(this, JSON.stringify(filtered));
        } catch (e) {
          // Si no es JSON válido, enviar sin cambios
          return originalSend.call(this, data);
        }
      }
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Filtra usuario para respuestas públicas
 * Devuelve solo: id, email, nombre, rol, tenantId
 */
export function filterUserForResponse(usuario) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido || undefined,
    rol: usuario.rol,
    tenantId: usuario.tenantId,
  };
}

/**
 * Filtra suscripción para respuestas públicas
 * No devuelve: MP ids, webhooks, etc
 */
export function filterSubscriptionForResponse(suscripcion) {
  if (!suscripcion) return null;
  return {
    id: suscripcion.id,
    plan_id: suscripcion.plan_id,
    estado: suscripcion.estado,
    fecha_inicio: suscripcion.fecha_inicio,
    fecha_fin: suscripcion.fecha_fin,
    ciclo_facturacion: suscripcion.ciclo_facturacion,
  };
}

/**
 * Filtra respuesta de error para no exponer stack traces
 */
export function filterErrorResponse(err) {
  // En desarrollo: devolver error completo para debugging
  if (process.env.NODE_ENV !== 'production') {
    return {
      error: err.message,
      stack: err.stack,
      code: err.code,
    };
  }

  // En producción: mensaje genérico
  if (err.code === 'ER_DUP_ENTRY') {
    return { error: 'Datos duplicados. Verifica los campos únicos.' };
  }

  // Otros errores: mensaje genérico
  return { error: 'Error al procesar tu solicitud' };
}

export { SENSITIVE_FIELDS };
