import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { pool } from '../db.js';

const JWT_EXPIRY = '7d';

function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no definido. Configuralo en .env antes de iniciar.');
  return secret;
}

// ─── Email ────────────────────────────────────────────────────────────────────

function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
}

export async function sendVerificationEmail(email, nombre, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/verificar-email?token=${token}`;

  const transporter = getMailTransporter();
  await transporter.sendMail({
    from: `"OnKey" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verificá tu cuenta en OnKey',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#1d4ed8;">¡Hola, ${nombre}!</h2>
        <p>Gracias por registrarte en <strong>OnKey</strong>.</p>
        <p>Hacé clic en el botón para verificar tu cuenta:</p>
        <a href="${link}" 
           style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;
                  border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Verificar mi cuenta
        </a>
        <p style="color:#6b7280;font-size:13px;">
          Si no creaste una cuenta, ignorá este mensaje.<br/>
          El enlace expira en 24 horas.
        </p>
      </div>
    `,
  });
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ─── Token ────────────────────────────────────────────────────────────────────

export function generateToken(usuario) {
  const jti = crypto.randomBytes(32).toString('hex');
  return jwt.sign(
    { id: usuario.id, tenantId: usuario.tenant_id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol, jti },
    getJWTSecret(),
    { expiresIn: JWT_EXPIRY }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJWTSecret());
  } catch {
    throw new Error('Token inválido o expirado');
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function findUserByEmail(email, tenantId) {
  const [rows] = await pool.query(
    'SELECT id, tenant_id, email, password_hash, nombre, apellido, dni, rol, activo, email_verificado, last_login FROM usuarios WHERE email = ? AND tenant_id = ? LIMIT 1',
    [email, tenantId]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, tenant_id, email, password_hash, nombre, apellido, dni, rol, activo, email_verificado, last_login FROM usuarios WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function findTenantByName(nombre) {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, plan, activo FROM tenants WHERE LOWER(nombre) = LOWER(?) LIMIT 1',
    [nombre.trim()]
  );
  return rows[0] || null;
}

export async function createTenant(nombre, email, plan = 'basic') {
  try {
    const [result] = await pool.query(
      'INSERT INTO tenants (nombre, email, plan, activo) VALUES (?, ?, ?, TRUE)',
      [nombre, email, plan]
    );
    return { id: result.insertId, nombre, email, plan, activo: true };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new Error('Ya existe una inmobiliaria con ese nombre o email');
    throw error;
  }
}

export async function createUser(tenantId, email, passwordPlain, nombre, apellido, dni, rol = 'admin') {
  const existing = await findUserByEmail(email, tenantId);
  if (existing) throw new Error('El email ya está registrado');

  const passwordHash = await hashPassword(passwordPlain);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hs

  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios 
        (tenant_id, email, password_hash, nombre, apellido, dni, rol, activo, email_verificado, token_verificacion, token_expira)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, FALSE, ?, ?)`,
      [tenantId, email, passwordHash, nombre, apellido || null, dni || null, rol, verificationToken, tokenExpira]
    );
    return { id: result.insertId, tenantId, email, nombre, apellido, dni, rol, verificationToken };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new Error('El email ya está registrado');
    throw error;
  }
}

export async function verifyEmailToken(token) {
  const [rows] = await pool.query(
    'SELECT id, tenant_id, nombre, email, email_verificado, token_expira FROM usuarios WHERE token_verificacion = ? LIMIT 1',
    [token]
  );
  if (!rows.length) throw new Error('Token inválido');

  const user = rows[0];
  if (user.email_verificado) throw new Error('La cuenta ya fue verificada');
  if (new Date() > new Date(user.token_expira)) throw new Error('El enlace expiró, solicitá uno nuevo');

  await pool.query(
    'UPDATE usuarios SET email_verificado = TRUE, token_verificacion = NULL, token_expira = NULL WHERE id = ?',
    [user.id]
  );
  return user;
}

export async function authenticateUser(email, passwordPlain, tenantId) {
  const usuario = await findUserByEmail(email, tenantId);
  if (!usuario) throw new Error('Email o contraseña incorrectos');
  if (!usuario.activo) throw new Error('Usuario inactivo');
  if (!usuario.email_verificado) throw new Error('Debés verificar tu email antes de ingresar');

  const match = await verifyPassword(passwordPlain, usuario.password_hash);
  if (!match) throw new Error('Email o contraseña incorrectos');

  await pool.query('UPDATE usuarios SET last_login = NOW() WHERE id = ?', [usuario.id]);
  return { token: generateToken(usuario), usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol } };
}