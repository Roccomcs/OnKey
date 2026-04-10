// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

// Función helper para obtener JWT_SECRET en runtime
function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no definido. Configuralo en .env antes de iniciar.');
  return secret;
}

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y extrae los datos del usuario
 * Uso: router.use(authMiddleware) o router.get('/path', authMiddleware, handler)
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado: token requerido' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, getJWTSecret());

    // Verificar que el token no esté en la blacklist (logout)
    if (decoded.jti) {
      const [[blacklisted]] = await pool.query(
        'SELECT id FROM token_blacklist WHERE jti = ? AND expires_at > NOW() LIMIT 1',
        [decoded.jti]
      );
      if (blacklisted) return res.status(401).json({ error: 'Token revocado' });
    }

    // Adjuntar datos del usuario al request
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
      email: decoded.email,
      nombre: decoded.nombre,
      rol: decoded.rol,
      jti: decoded.jti,
    };

    next();
  } catch (err) {
    console.error('[authMiddleware]', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    res.status(401).json({ error: 'No autorizado' });
  }
}