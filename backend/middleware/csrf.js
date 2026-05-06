// ============================================================
//  backend/middleware/csrf.js
//  Protección contra ataques CSRF (Cross-Site Request Forgery)
//  Genera tokens CSRF únicos por sesión y los valida en escrituras
// ============================================================

import crypto from 'crypto';

/**
 * Store de tokens CSRF en memoria (en producción, usar Redis o BD)
 * Mapea: jti -> { token, createdAt }
 * En aplicaciones reales, limpiar periódicamente tokens expirados
 */
const csrfTokenStore = new Map();

/**
 * Limpia tokens CSRF expirados (> 1 hora)
 * Se ejecuta cada 30 minutos
 */
function cleanExpiredTokens() {
  const now = Date.now();
  const maxAge = 1 * 60 * 60 * 1000; // 1 hora
  
  for (const [jti, data] of csrfTokenStore.entries()) {
    if (now - data.createdAt > maxAge) {
      csrfTokenStore.delete(jti);
    }
  }
}

// Ejecutar limpieza cada 30 minutos
setInterval(cleanExpiredTokens, 30 * 60 * 1000);

/**
 * Genera un nuevo token CSRF para el usuario
 * Se llama después del login
 * @param {string} jti - JWT ID único del usuario
 * @returns {string} Token CSRF
 */
export function generateCSRFToken(jti) {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokenStore.set(jti, {
    token,
    createdAt: Date.now()
  });
  return token;
}

/**
 * Obtiene el token CSRF del usuario (si existe)
 * @param {string} jti - JWT ID único del usuario
 * @returns {string|null} Token CSRF o null si no existe/expiró
 */
export function getCSRFToken(jti) {
  const data = csrfTokenStore.get(jti);
  if (!data) return null;
  
  // Verificar que no haya expirado
  const age = Date.now() - data.createdAt;
  const maxAge = 1 * 60 * 60 * 1000; // 1 hora
  
  if (age > maxAge) {
    csrfTokenStore.delete(jti);
    return null;
  }
  
  return data.token;
}

/**
 * Middleware que valida CSRF token en requests de escritura
 * Debe ir DESPUÉS del authMiddleware
 * 
 * Espera el token en:
 * - Header: X-CSRF-Token
 * - Body: _csrf
 * - Query: _csrf
 * 
 * Se aplica a: POST, PUT, DELETE, PATCH
 * 
 * Excluye: Endpoints de autenticación (login, register, etc.) 
 * porque aún no hay usuario autenticado
 */
export function csrfProtection(req, res, next) {
  // Skip CSRF check para métodos seguros (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF check para endpoints de autenticación (sin usuario previo)
  const unauthenticatedPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/google-login',
    '/api/auth/google-register',
    '/api/auth/resend-verification',
    '/api/auth/verify-email',
    '/api/subscriptions/webhook', // Webhook de Mercury
  ];

  if (unauthenticatedPaths.includes(req.path)) {
    return next();
  }

  // Obtener token del usuario
  if (!req.user || !req.user.jti) {
    return res.status(401).json({ error: 'No autorizado: token requerido' });
  }

  const expectedToken = getCSRFToken(req.user.jti);
  if (!expectedToken) {
    return res.status(403).json({ error: 'Token CSRF expirado. Refresca la página e intenta de nuevo.' });
  }

  // Obtener token del request (puede venir en header, body o query)
  const clientToken = 
    req.headers['x-csrf-token'] ||
    req.body?._csrf ||
    req.query?._csrf;

  if (!clientToken) {
    return res.status(403).json({ error: 'Token CSRF faltante' });
  }

  // Comparar tokens de forma segura (constant-time comparison)
  const tokensMatch = crypto.timingSafeEqual(
    Buffer.from(expectedToken),
    Buffer.from(clientToken)
  ).toString() === 'true';

  if (!tokensMatch) {
    return res.status(403).json({ error: 'Token CSRF inválido' });
  }

  // Token validado, continuar
  next();
}

/**
 * Regenera el token CSRF después de ciertos eventos (ej: cambio de contraseña)
 * @param {string} jti - JWT ID único del usuario
 * @returns {string} Nuevo token CSRF
 */
export function regenerateCSRFToken(jti) {
  csrfTokenStore.delete(jti);
  return generateCSRFToken(jti);
}
