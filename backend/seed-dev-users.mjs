import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envLocal = path.join(__dirname, '.env.local');
dotenv.config({ path: fs.existsSync(envLocal) ? envLocal : path.join(__dirname, '.env') });

const conn = await mysql.createConnection({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Limpiar usuarios de prueba anteriores (mal insertados)
await conn.query(`DELETE FROM usuarios WHERE email IN ('admin@localhost','starter@localhost','pro@localhost','viewer@localhost')`);
await conn.query(`DELETE FROM tenants WHERE email = 'dev@localhost'`);

// Crear tenant dev
await conn.query(`INSERT INTO tenants (nombre, email, plan, activo) VALUES ('Local Dev', 'dev@localhost', 'starter', 1)`);
const [[{ tid }]] = await conn.query(`SELECT LAST_INSERT_ID() AS tid`);

// Generar hashes y crear usuarios
const users = [
  { email: 'admin@localhost',   pass: 'admin123',   nombre: 'Admin',   rol: 'admin'   },
  { email: 'starter@localhost', pass: 'starter123', nombre: 'Starter', rol: 'usuario' },
  { email: 'pro@localhost',     pass: 'pro123',     nombre: 'Pro',     rol: 'usuario' },
  { email: 'viewer@localhost',  pass: 'viewer123',  nombre: 'Viewer',  rol: 'viewer'  },
];

for (const u of users) {
  const hash = await bcrypt.hash(u.pass, 10);
  await conn.query(
    `INSERT INTO usuarios (tenant_id, email, password_hash, nombre, apellido, rol, activo, email_verificado)
     VALUES (?, ?, ?, ?, 'Local', ?, 1, 1)`,
    [tid, u.email, hash, u.nombre, u.rol]
  );
  console.log(`✅ ${u.email}`);
}

await conn.end();
console.log('Listo.');
