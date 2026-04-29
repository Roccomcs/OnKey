// ============================================================
//  backend/middleware/rateLimiting.js
//  Rate limiting centralizado para endpoints críticos
//  Previene: brute force, spam, DoS
// ============================================================

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para login
 * Max 5 intentos por IP cada 15 minutos
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos máximo
  message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
  standardHeaders: true, // Retorna info en header `RateLimit-*`
  legacyHeaders: false, // Deshabilita header `X-RateLimit-*`
  skip: (req) => {
    // Skip para desarrollo
    return process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate limiter para registro
 * Max 3 registros por IP cada 24 horas
 */
export const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3, // 3 intentos máximo
  message: 'Demasiados registros desde tu IP. Intenta mañana.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});

/**
 * Rate limiter para webhooks de MercadoPago
 * Max 100 webhooks por IP cada 15 minutos
 * (Más permisivo porque son legítimos de MP)
 */
export const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiados webhooks. Contacta a soporte.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});

/**
 * Rate limiter para resend email verification
 * Max 3 envíos por IP cada 24 horas
 */
export const emailResendLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: 'Demasiados intentos de reenvío. Intenta mañana.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});

/**
 * Rate limiter general para API
 * Max 1000 requests por IP cada 15 minutos
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Generoso, pero previene DoS masivos
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});
