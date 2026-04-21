import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID, randomBytes } from 'crypto';
import {
  authenticateUser, createUser, createTenant,
  findTenantByName, verifyEmailToken, sendVerificationEmail, hashPassword,
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

// ── POST /api/auth/resend-verification ───────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Se requiere el email' });

    const [rows] = await pool.query(
      'SELECT id, nombre, email_verificado FROM usuarios WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );

    if (!rows.length) return res.status(404).json({ error: 'No existe una cuenta con ese email' });

    const u = rows[0];
    if (u.email_verificado) return res.status(400).json({ error: 'Este email ya fue verificado' });

    // Generar nuevo token
    const token = randomUUID().replace(/-/g, '');
    const expira = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      'UPDATE usuarios SET token_verificacion = ?, token_expira = ? WHERE id = ?',
      [token, expira, u.id]
    );

    await sendVerificationEmail(email.trim().toLowerCase(), u.nombre, token);
    res.json({ mensaje: 'Email de verificación reenviado' });
  } catch (err) {
    console.error('[resend-verification]', err.message);
    res.status(500).json({ error: 'Error al reenviar el email' });
  }
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Crea un tenant propio + usuario admin + asigna plan Starter + manda mail
router.post('/register', async (req, res) => {
  try {
    const { tenantNombre, nombre, apellido, dni, email, password } = req.body;

    if (!tenantNombre || !nombre || !email || !password)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    if (!email.includes('@')) return res.status(400).json({ error: 'Email inválido' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    // Verificar nombre de tenant único
    const existingTenant = await findTenantByName(tenantNombre);
    if (existingTenant) return res.status(409).json({ error: 'Ya existe una inmobiliaria con ese nombre' });

    // Verificar email único en usuarios Y en tenants (ambas tablas tienen UNIQUE en email)
    const [emailInUsers] = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (emailInUsers.length) return res.status(409).json({ error: 'Ese email ya está registrado' });

    const [emailInTenants] = await pool.query('SELECT id FROM tenants WHERE email = ? LIMIT 1', [email]);
    if (emailInTenants.length) return res.status(409).json({ error: 'Ese email ya está registrado' });

    // Crear tenant + usuario en una transacción para evitar orphan tenants
    const conn = await pool.getConnection();
    let tenant, usuario;
    try {
      await conn.beginTransaction();

      const [tResult] = await conn.query(
        'INSERT INTO tenants (nombre, email, plan, activo) VALUES (?, ?, ?, TRUE)',
        [tenantNombre.trim(), email, 'starter']
      );
      tenant = { id: tResult.insertId, nombre: tenantNombre.trim() };

      const passwordHash = await hashPassword(password);
      const verificationToken = randomBytes(32).toString('hex');
      const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const [uResult] = await conn.query(
        `INSERT INTO usuarios
          (tenant_id, email, password_hash, nombre, apellido, dni, rol, activo, email_verificado, token_verificacion, token_expira)
         VALUES (?, ?, ?, ?, ?, ?, 'admin', TRUE, FALSE, ?, ?)`,
        [tenant.id, email, passwordHash, nombre.trim(), apellido?.trim() || null, dni?.trim() || null, verificationToken, tokenExpira]
      );
      usuario = { id: uResult.insertId, tenantId: tenant.id, email, nombre: nombre.trim(), verificationToken };

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    // Asignar plan Starter (no-fatal si falla)
    try {
      await assignFreePlan(usuario.id, tenant.id);
    } catch (planErr) {
      console.error('[register] Error asignando plan:', planErr.message);
    }

    // Enviar mail de verificación (no-fatal si falla)
    let mailError = null;
    let devAutoVerified = false;
    try {
      await sendVerificationEmail(email, usuario.nombre, usuario.verificationToken);
    } catch (mailErr) {
      console.error('[register] Error enviando mail:', mailErr.message);
      mailError = mailErr.message;

      // Bypass de desarrollo: si el SMTP falla fuera de producción, auto-verificar
      // para no bloquear el testing del login
      if (process.env.NODE_ENV !== 'production') {
        await pool.query('UPDATE usuarios SET email_verificado = 1 WHERE id = ?', [usuario.id]);
        devAutoVerified = true;
        console.warn('[register] DEV MODE: email_verificado = 1 forzado (SMTP no disponible)');
      }
    }

    res.status(201).json({
      mensaje: devAutoVerified
        ? `Cuenta creada. (Dev: email auto-verificado, podés ingresar ya)`
        : `¡Listo! Revisá tu correo ${email} para verificar tu cuenta.`,
      tenantNombre: tenant.nombre,
      ...(mailError && !devAutoVerified && { mailWarning: 'No pudimos enviar el email de verificación. Usá el botón "Reenviar" al iniciar sesión.' }),
      ...(devAutoVerified && { devNote: 'SMTP no disponible en dev — cuenta verificada automáticamente' }),
    });
  } catch (err) {
    console.error('[register]', err.message);
    // Detectar duplicados independientemente de mayúsculas o código SQL
    if (err.code === 'ER_DUP_ENTRY' || /ya existe|registrado|duplicate/i.test(err.message)) {
      return res.status(409).json({ error: 'Ese email o nombre de inmobiliaria ya está registrado' });
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
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    res.redirect(`${frontendUrl}/login?verified=1`);
  } catch (err) {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
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

    const [tenants] = await pool.query('SELECT id, nombre FROM tenants WHERE id = ? LIMIT 1', [u.tenant_id]);
    const tenant = tenants[0] || { id: u.tenant_id, nombre: 'Inmobiliaria' };

    // Obtener datos completos del usuario
    const [usuariosFull] = await pool.query(
      'SELECT id, email, nombre, apellido, rol FROM usuarios WHERE id = ? LIMIT 1',
      [u.id]
    );
    const usuario = usuariosFull[0] || { id: u.id, email: googleData.email };

    // Generar JWT con el mismo esquema que el login estándar (tenantId camelCase)
    const jti = randomUUID();
    const token = jwt.sign(
      {
        id: u.id,
        tenantId: u.tenant_id,
        email: googleData.email,
        nombre: usuario.nombre || '',
        rol: usuario.rol || 'admin',
        jti,
      },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

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

    // Generar JWT con el mismo esquema que el login estándar (tenantId camelCase)
    const jti = randomUUID();
    const token = jwt.sign(
      {
        id: usuario.id,
        tenantId: tenant.id,
        email: googleData.email,
        nombre: usuario.nombre || googleData.firstName || '',
        rol: 'admin',
        jti,
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
    if (err.code === 'ER_DUP_ENTRY' || /ya existe|registrado|duplicate/i.test(err.message)) {
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