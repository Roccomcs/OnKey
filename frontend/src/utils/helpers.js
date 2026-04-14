// ─── FORMATO DE FECHAS Y MONEDA ──────────────────────────────

export const fmtDate = d =>
  new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

export const diffDays = (dateStr) => {
  // Validación defensiva
  if (!dateStr || typeof dateStr !== 'string') {
    console.warn('[diffDays] dateStr inválido:', dateStr);
    return 0;
  }
  // Fuerza interpretación en zona horaria local (Argentina UTC-3)
  // evitando el offset UTC que new Date("YYYY-MM-DD") aplica por defecto
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    console.warn('[diffDays] formato de fecha inválido:', dateStr);
    return 0;
  }
  const [y, m, d] = parts;
  const target = new Date(y, m - 1, d);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
};

export const fmtDuration = (days) => {
  if (days <= 0) return "Venció";
  if (days > 90) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }
  return `${days} días`;
};

export const fmtCurrency = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

// ─── VALIDACIÓN DE FECHA ─────────────────────────────────────
// Verifica que una fecha string "YYYY-MM-DD" sea realmente válida
// (evita fechas como 30/02 que los inputs de tipo date normalizan o rechazan)
export const isValidDate = (str) => {
  if (!str || typeof str !== 'string') return false;
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return false;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth()    === m - 1 &&
    dt.getDate()     === d
  );
};

// ─── NIVELES DE ALERTA ────────────────────────────────────────

export const getAlertLevel = (days) => {
  if (days <= 15) return { label: "Crítico",  color: "text-red-600",    bg: "bg-red-50 dark:bg-red-900/20",       dot: "bg-red-500",    border: "border-red-200 dark:border-red-800"    };
  if (days <= 30) return { label: "Urgente",  color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", dot: "bg-orange-500", border: "border-orange-200 dark:border-orange-800" };
  if (days <= 90) return { label: "Próximo",  color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20",   dot: "bg-amber-400",  border: "border-amber-200 dark:border-amber-800"  };
  return null;
};

// ─── URL BASE DE LA API ───────────────────────────────────────
// En desarrollo usa el proxy de Vite (/api), en producción usa la URL del .env (DEBE estar configurada en Vercel)

const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return "/api"; // Proxy de Vite en desarrollo
  }
  const url = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!url) {
    console.error('[API] VITE_API_URL no está configurada. Backend no será accesible en producción.');
    console.error('[API] Configura en Vercel: VITE_API_URL=https://onkey-production.up.railway.app/api');
  }
  return url || 'https://onkey-production.up.railway.app/api';
};

export const API = getApiUrl();

// ─── API CALLS CON AUTENTICACIÓN ──────────────────────────────
/**
 * Realiza un fetch con token JWT automático
 * Usa el token almacenado en localStorage si existe
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`[apiCall] ${options.method || 'GET'} ${endpoint} - Token presente (${token.substring(0, 20)}...)`);
  } else {
    console.warn(`[apiCall] ${options.method || 'GET'} ${endpoint} - ⚠️  SIN TOKEN en localStorage`);
  }

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch (e) {
      // No JSON body
    }
    throw error;
  }

  return response.json();
};