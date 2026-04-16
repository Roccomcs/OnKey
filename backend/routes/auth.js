import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import {
  authenticateUser, createUser, createTenant,
  findTenantByName, verifyEmailToken, sendVerificationEmail
} from '../services/authService.js';
import { assignFreePlan } from '../services/subscriptionService.js';
import { authMiddleware } from '../middleware/auth.js';
import { pool } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Se requieren email y contraseña' });

    // 🔍 Buscar usuario por email (búsqueda global, no por tenant)
    const [usuarios] = await pool.query(
      'SELECT id, tenant_id, activo, email_verificado, nombre FROM usuarios WHERE email = ? ORDER BY activo DESC, id ASC LIMIT 1',
      [email]
    );
    if (!usuarios.length) {
      console.warn(`[login] Usuario no encontrado: ${email}`);
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const u = usuarios[0];
    if (!u.activo) {
      console.warn(`[login] Usuario inactivo: ${email}`);
      return res.status(403).json({ error: 'Usuario inactivo' });
    }
    if (!u.email_verificado) {
      console.warn(`[login] Email no verificado: ${email}`);
      return res.status(403).json({ error: 'Debés verificar tu email antes de ingresar', code: 'EMAIL_NOT_VERIFIED' });
    }

    // ✅ Autenticar con contraseña
    const result = await authenticateUser(email, password, u.tenant_id);

    // 📊 Obtener tenant
    const [tenants] = await pool.query('SELECT id, nombre FROM tenants WHERE id = ? LIMIT 1', [u.tenant_id]);
    const tenant = tenants[0] || { id: u.tenant_id, nombre: 'Inmobiliaria' };

    console.log(`✅ [login] Usuario autenticado: ${email} (tenant: ${u.tenant_id})`);
    res.json({ token: result.token, usuario: result.usuario, tenant });
  } catch (err) {
    console.error('[login] Error:', err.message);
    if (err.message.includes('Email o contraseña') || err.message.includes('verificar')) {
      return res.status(401).json({ error: err.message, code: err.message.includes('verificar') ? 'EMAIL_NOT_VERIFIED' : undefined });
    }
    res.status(500).json({ error: 'Error al autenticar' });
  }
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Crea un tenant propio + usuario admin + asigna plan Starter + manda mail
router.post('/register', async (req, res) => {
  try {
    const { tenantNombre, nombre, apellido, dni, email, password } = req.body;

    if (!tenantNombre || !nombre || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (!email.includes('@')) return res.status(400).json({ error: 'Email inválido' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    // Verificar que no exista ya ese tenant o email global
    const existingTenant = await findTenantByName(tenantNombre);
    if (existingTenant) return res.status(409).json({ error: 'Ya existe una inmobiliaria con ese nombre' });

    const [emailCheck] = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (emailCheck.length) return res.status(409).json({ error: 'Ese email ya está registrado' });

    // Crear tenant
    const tenant = await createTenant(tenantNombre.trim(), email, 'starter');

    // Crear usuario admin del tenant
    const usuario = await createUser(tenant.id, email, password, nombre.trim(), apellido?.trim(), dni?.trim(), 'admin');

    // Asignar plan Starter
    await assignFreePlan(usuario.id, tenant.id);

    // Enviar mail de verificación
    try {
      await sendVerificationEmail(email, nombre, usuario.verificationToken);
    } catch (mailErr) {
      console.error('[register] Error enviando mail:', mailErr.message);
      // No falla el registro si el mail falla — el usuario puede pedir reenvío
    }

    res.status(201).json({
      mensaje: `¡Listo! Revisá tu correo ${email} para verificar tu cuenta.`,
      tenantNombre: tenant.nombre,
    });
  } catch (err) {
    console.error('[register]', err.message);
    if (err.message.includes('ya existe') || err.message.includes('registrado')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Error al crear la cuenta' });
  }
});

// ── GET /api/auth/verificar-email?token=xxx ───────────────────────────────────
router.get('/verificar-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token requerido' });

    await verifyEmailToken(token);
    // Redirigir al login con mensaje
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?verified=1`);
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?verified=error&msg=${encodeURIComponent(err.message)}`);
  }
});

// ── GET /api/auth/verify ──────────────────────────────────────────────────────
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valido: true, usuario: req.user });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ usuario: req.user });
});
// ── Helper: Verificar token de Google ─────────────────────────────────────────
async function verifyGoogleToken(token) {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new Error('GOOGLE_CLIENT_ID no está configurado en el backend');
    }

    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    return {
      email: payload.email,
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      picture: payload.picture,
    };
  } catch (error) {
    throw new Error(`Token de Google inválido: ${error.message}`);
  }
}

// ── POST /api/auth/google-login ───────────────────────────────────────────────
router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body; // JWT token de Google
    if (!credential) return res.status(400).json({ error: 'Se requiere el token de Google' });

    // Verificar token de Google
    const googleData = await verifyGoogleToken(credential);

    // Buscar usuario existente
    const [usuarios] = await pool.query(
      'SELECT id, tenant_id, activo, email_verificado FROM usuarios WHERE email = ? LIMIT 1',
      [googleData.email]
    );

    if (!usuarios.length) {
      return res.status(401).json({
        error: 'Usuario no encontrado. Por favor, regístrate primero.',
        code: 'USER_NOT_FOUND',
      });
    }

    const u = usuarios[0];
    if (!u.activo) return res.status(403).json({ error: 'Usuario inactivo' });
    // Con Google OAuth No requerimos email verificado

    // Generar JWT
    const jti = require('crypto').randomUUID();
    const token = jwt.sign(
      {
        id: u.id,
        email: googleData.email,
        tenant_id: u.tenant_id,
        jti: jti,
      },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    const [tenants] = await pool.query('SELECT id, nombre FROM tenants WHERE id = ? LIMIT 1', [u.tenant_id]);
    const tenant = tenants[0] || { id: u.tenant_id, nombre: 'Inmobiliaria' };

    // Obtener datos completos del usuario
    const [usuariosFull] = await pool.query(
      'SELECT id, email, nombre, apellido, rol FROM usuarios WHERE id = ? LIMIT 1',
      [u.id]
    );
    const usuario = usuariosFull[0] || { id: u.id, email: googleData.email };

    res.json({ token, usuario, tenant });
  } catch (err) {
    console.error('[google-login]', err.message);
    res.status(401).json({ error: err.message || 'Error al autenticar con Google' });
  }
});

// ── POST /api/auth/google-register ────────────────────────────────────────────
router.post('/google-register', async (req, res) => {
  try {
    const { credential, tenantNombre } = req.body;
    if (!credential) return res.status(400).json({ error: 'Se requiere el token de Google' });

    // Verificar token de Google
    const googleData = await verifyGoogleToken(credential);

    // Verificar que el email no exista
    const [emailCheck] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
      [googleData.email]
    );
    if (emailCheck.length) {
      return res.status(409).json({
        error: 'Este email ya está registrado. Por favor, inicia sesión.',
      });
    }

    // Si no se proporciona tenantNombre, usamos el nombre/email del usuario
    const newTenantName = (tenantNombre || `${googleData.firstName} ${googleData.lastName}`).trim() || googleData.email.split('@')[0];

    // Verificar que no exista ya ese tenant
    const existingTenant = await findTenantByName(newTenantName);
    if (existingTenant) {
      return res.status(409).json({ error: 'Ya existe una inmobiliaria con ese nombre' });
    }

    // Crear tenant
    const tenant = await createTenant(newTenantName, googleData.email, 'starter');

    // Crear usuario admin del tenant (sin password, ya que usa Google OAuth)
    const usuario = await createUser(
      tenant.id,
      googleData.email,
      '', // Sin contraseña
      googleData.firstName,
      googleData.lastName,
      '', // Sin DNI
      'admin'
    );

    // Asignar plan Starter
    await assignFreePlan(usuario.id, tenant.id);

    // Marcar email como verificado (porque viene de Google confiable)
    await pool.query(
      'UPDATE usuarios SET email_verificado = 1 WHERE id = ?',
      [usuario.id]
    );

    // Generar JWT para login automático
    const jti = require('crypto').randomUUID();
    const token = jwt.sign(
      {
        id: usuario.id,
        email: googleData.email,
        tenant_id: tenant.id,
        jti: jti,
      },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensaje: '¡Cuenta creada exitosamente con Google!',
      token,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
      tenant,
    });
  } catch (err) {
    console.error('[google-register]', err.message);
    if (err.message.includes('ya existe') || err.message.includes('registrado')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Error al crear la cuenta con Google' });
  }
});
// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { jti } = req.user;
    if (jti) {
      // Calcular cuándo expira el token para limpiar la blacklist después
      // exp viene del token; lo leemos directamente del header
      const authHeader = req.headers.authorization;
      const token = authHeader.slice(7);
      const { exp } = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const expiresAt = new Date(exp * 1000).toISOString().slice(0, 19).replace('T', ' ');

      await pool.query(
        'INSERT INTO token_blacklist (jti, usuario_id, expires_at) VALUES (?, ?, ?)',
        [jti, req.user.id, expiresAt]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

export default router;