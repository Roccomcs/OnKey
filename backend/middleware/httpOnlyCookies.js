// ============================================================
//  backend/middleware/httpOnlyCookies.js
//  Middleware para manejar JWT en HttpOnly cookies
//  Previene: XSS token theft (cookies no accesibles a JavaScript)
// ============================================================

/**
 * Establece JWT access token en HttpOnly cookie (seguro contra XSS)
 * Opcionalmente también establece refresh token
 * @param {Object} res - Express response
 * @param {string} accessToken - JWT access token (7 días)
 * @param {string} refreshToken - Optional refresh token (30 días)
 */
export function setAuthCookie(res, accessToken, refreshToken = null) {
  const accessTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
  
  // Access token cookie
  res.cookie('authToken', accessToken, {
    httpOnly: true,        // No accesible desde JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en prod
    sameSite: 'strict',    // CSRF protection
    path: '/',
    maxAge: accessTokenMaxAge,
  });

  // Refresh token cookie (si se proporciona)
  if (refreshToken) {
    const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh', // Solo valido para refresh endpoint
      maxAge: refreshTokenMaxAge,
    });
  }
}

/**
 * Limpia cookies de autenticación al logout
 * @param {Object} res - Express response
 */
export function clearAuthCookie(res) {
  res.clearCookie('authToken', {
    httpOnly: true,
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    path: '/api/auth/refresh',
  });
}

/**
 * Middleware que extrae JWT del cookie y lo pone en Authorization header
 * Esto permite que authMiddleware funcione igual que antes
 */
export function extractCookieAuth(req, res, next) {
  const token = req.cookies?.authToken;
  if (token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${token}`;
  }
  next();
}
