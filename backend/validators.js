// ============================================================
//  backend/validators.js
//  Centralizado: validaciones de email, password, documento, etc.
//  Use en todas las rutas para consistencia
// ============================================================

/**
 * RFC 5322 simplified regex para validación de email
 * Acepta: usuario@dominio.com, usuario@localhost, usuario@127.0.0.1
 * Rechaza: usuario@, @dominio.com, usuario@@dominio
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@]+)*$/;

/**
 * Valida formato de email
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Valida contraseña según estándares OWASP SP 800-63B simplificado
 * Mínimo 8 caracteres con:
 * - Al menos 1 mayúscula
 * - Al menos 1 número
 * - Al menos 1 símbolo especial
 *
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Contraseña requerida'] };
  }

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Requiere al menos 1 mayúscula (A-Z)');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Requiere al menos 1 número (0-9)');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Requiere al menos 1 símbolo (!@#$%^&* etc)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida documento (DNI argentino: 7-8 dígitos)
 * @param {string} documento
 * @returns {boolean}
 */
export function validateDocument(documento) {
  if (!documento) return true; // Opcional
  return /^\d{7,8}$/.test(documento.trim());
}

/**
 * Valida número de teléfono (argentino: +54 9 opcionales, 10+ dígitos)
 * @param {string} telefono
 * @returns {boolean}
 */
export function validatePhone(telefono) {
  if (!telefono) return true; // Opcional
  const clean = telefono.replace(/[^\d+]/g, '');
  return clean.length >= 10;
}

/**
 * Valida precio (positivo, máximo 999,999.99)
 * @param {number|string} precio
 * @returns {boolean}
 */
export function validatePrice(precio) {
  const num = parseFloat(precio);
  return !isNaN(num) && num > 0 && num <= 999999.99;
}

/**
 * Valida fecha en formato YYYY-MM-DD
 * Verifica que sea fecha válida (no permite 30/02, etc)
 * @param {string} dateStr
 * @returns {boolean}
 */
export function validateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return false;
  
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  
  // Verifica que la fecha sea válida (no permite 30/02)
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

/**
 * Valida que endDate sea después de startDate
 * @param {string} startDate ISO YYYY-MM-DD
 * @param {string} endDate ISO YYYY-MM-DD
 * @returns {boolean}
 */
export function validateDateRange(startDate, endDate) {
  if (!validateDate(startDate) || !validateDate(endDate)) return false;
  return new Date(endDate) > new Date(startDate);
}

/**
 * Limpia y normaliza email
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Limpia y normaliza nombre (capitalized)
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name) {
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Valida monto de alquiler mensual
 * Rango: $0.01 - $999,999.99 ARS
 * @param {number|string} monto
 * @returns {boolean}
 */
export function validateRent(monto) {
  const num = parseFloat(monto);
  return !isNaN(num) && num > 0 && num <= 999999.99;
}

/**
 * Valida porcentaje de ajuste (0-100%)
 * @param {number|string} porcentaje
 * @returns {boolean}
 */
export function validatePercentage(porcentaje) {
  if (porcentaje === null || porcentaje === undefined) return true; // Opcional
  const num = parseFloat(porcentaje);
  return !isNaN(num) && num >= 0 && num <= 100;
}
