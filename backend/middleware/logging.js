// ============================================================
//  backend/middleware/logging.js
//  Logging estructurado centralizado
//  Reemplaza console.log con estructurado, seguro para producción
// ============================================================

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

/**
 * Obtiene nivel de log de ambiente
 * En desarrollo: DEBUG
 * En producción: WARN (logs sensibles minimizados)
 */
function getLogLevel() {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
  return process.env.NODE_ENV === 'production' ? 'WARN' : 'DEBUG';
}

/**
 * Formatea timestamp ISO
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Redacta valores sensibles antes de loguear
 * Protege: passwords, tokens, números de documento, etc
 */
function redactSensitive(value) {
  if (typeof value === 'string') {
    // Token: mostrar solo primeros 20 chars
    if (value.length > 50 && value.includes('.')) {
      return value.substring(0, 20) + '...[REDACTED]';
    }
    // Documento: mostrar solo últimos 2 dígitos
    if (/^\d{7,8}$/.test(value)) {
      return '****' + value.slice(-2);
    }
  }
  return value;
}

/**
 * Sanitiza un objeto para logging
 * Redacta: password, token, jti, documento, numero_documento, etc
 */
function sanitizeForLogging(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitive = ['password', 'password_hash', 'token', 'jti', 'credential', 
                     'documento', 'documento_nro', 'documento_numero', 'dni',
                     'email', 'phone', 'telefono'];
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Logger centralizado
 * Formato JSON para fácil parsing en centralized logging systems
 */
class Logger {
  constructor(category = 'app') {
    this.category = category;
    this.currentLevel = getLogLevel();
  }

  shouldLog(level) {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const minLevel = levels.indexOf(this.currentLevel);
    return levels.indexOf(level) >= minLevel;
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const entry = {
      timestamp: getTimestamp(),
      level,
      category: this.category,
      message,
      ...sanitizeForLogging(meta),
    };

    // Producción: JSON para parsing
    // Desarrollo: JSON pretty-print
    const output = process.env.NODE_ENV === 'production'
      ? JSON.stringify(entry)
      : JSON.stringify(entry, null, 2);

    if (level === 'ERROR') {
      console.error(output);
    } else {
      console.log(output);
    }
  }

  debug(message, meta) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  info(message, meta) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  warn(message, meta) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  error(message, meta) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }
}

/**
 * Crea logger para una categoría
 * @param {string} category Nombre de categoría (ej: 'auth', 'payments')
 */
export function createLogger(category) {
  return new Logger(category);
}

/**
 * Middleware para loguear requests en producción
 * Solo loguea ruta, método, status
 * No loguea body (puede contener sensibles)
 */
export function requestLogger() {
  const logger = createLogger('http');

  return (req, res, next) => {
    const startTime = Date.now();
    
    // Captura el original res.json para loguear status
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      logger.info(`${req.method} ${req.path} ${res.statusCode}`, {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id || 'anonymous',
        tenantId: req.user?.tenantId || null,
      });
      return originalJson.call(this, data);
    };

    next();
  };
}

export { LOG_LEVELS };
