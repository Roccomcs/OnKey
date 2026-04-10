/**
 * resetAdminPassword.js
 * 
 * Ejecutar con: node resetAdminPassword.js
 * 
 * Regenera el hash bcrypt del usuario admin y lo actualiza en la BD.
 */

import bcrypt from 'bcrypt';
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const PASSWORD = 'admin123'; // contraseña que querés usar para testing

async function reset() {
  const conn = await createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'inmobiliariavane',
  });

  console.log('🔑 Generando hash para:', PASSWORD);
  const hash = await bcrypt.hash(PASSWORD, 10);
  console.log('Hash generado:', hash);

  const [result] = await conn.execute(
    'UPDATE usuarios SET password_hash = ? WHERE email = ?',
    [hash, 'admin@localhost']
  );

  if (result.affectedRows > 0) {
    console.log('✅ Password actualizado correctamente para admin@localhost');
  } else {
    console.log('⚠️  No se encontró el usuario admin@localhost');
  }

  // Verificación
  const [rows] = await conn.execute(
    'SELECT id, email, password_hash FROM usuarios WHERE email = ?',
    ['admin@localhost']
  );

  if (rows.length > 0) {
    const match = await bcrypt.compare(PASSWORD, rows[0].password_hash);
    console.log('🔍 Verificación del hash:', match ? '✅ Correcto' : '❌ Error');
  }

  await conn.end();
}

reset().catch(console.error);