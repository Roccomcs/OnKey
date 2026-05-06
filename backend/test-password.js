import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envLocalPath = path.join(__dirname, '.env.local');
dotenv.config({ path: fs.existsSync(envLocalPath) ? envLocalPath : path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'inmobiliaria',
});

async function test() {
  try {
    const password = 'STzC@N3I2*{ry[89';
    const [rows] = await pool.query(
      'SELECT password_hash FROM usuarios WHERE email = ? LIMIT 1',
      ['admin@localhost']
    );
    
    if (rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    const hash = rows[0].password_hash;
    console.log('🔐 Probando contraseña...');
    console.log('Password:', password);
    console.log('Hash (primeros 30):', hash.substring(0, 30) + '...');
    
    const matches = await bcrypt.compare(password, hash);
    console.log('');
    console.log(matches ? '✅ CONTRASEÑA CORRECTA' : '❌ CONTRASEÑA INCORRECTA');
    
    process.exit(matches ? 0 : 1);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

test();
