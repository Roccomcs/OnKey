/**
 * resetAdminPassword.js
 * 
 * Script para migrar/resetear contraseña del administrador de forma segura
 * 
 * USO:
 * node resetAdminPassword.js [email] [newPassword]
 * 
 * Ejemplos:
 * node resetAdminPassword.js admin@localhost "MySecure!P@ss2024"
 * node resetAdminPassword.js admin@onkey.com.ar "NewPassword123!"
 * 
 * Si no se proporciona contraseña, genera una aleatoria
 */

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envLocalPath = path.join(__dirname, '.env.local');
dotenv.config({ path: fs.existsSync(envLocalPath) ? envLocalPath : path.join(__dirname, '.env') });

const args = process.argv.slice(2);
const email = args[0];
const newPassword = args[1];

// Validar argumentos
if (!email) {
  console.error('❌ Uso: node resetAdminPassword.js <email> [password]');
  console.error('   Si no proporciona password, se generará una aleatoria\n');
  console.error('Ejemplos:');
  console.error('  node resetAdminPassword.js admin@localhost "MySecure!P@ss2024"');
  console.error('  node resetAdminPassword.js admin@onkey.com.ar');
  process.exit(1);
}

/**
 * Valida que la contraseña cumpla con OWASP SP 800-63B
 */
function validatePassword(pwd) {
  const errors = [];
  if (pwd.length < 12) errors.push('Mínimo 12 caracteres');
  if (!/[A-Z]/.test(pwd)) errors.push('Requiere al menos 1 mayúscula');
  if (!/[a-z]/.test(pwd)) errors.push('Requiere al menos 1 minúscula');
  if (!/[0-9]/.test(pwd)) errors.push('Requiere al menos 1 número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) errors.push('Requiere al menos 1 símbolo');
  return { valid: errors.length === 0, errors };
}

/**
 * Genera una contraseña aleatoria segura
 */
function generateSecurePassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}';
  
  const chars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Garantizar al menos 1 de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Rellenar hasta 16 caracteres
  for (let i = password.length; i < 16; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Mezclar
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function main() {
  try {
    console.log('🔐 Migrando contraseña de administrador...\n');

    // Buscar el usuario
    const [users] = await pool.query(
      'SELECT id, email, nombre FROM usuarios WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (!users.length) {
      console.error(`❌ No se encontró usuario con email: ${email}`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`✅ Usuario encontrado: ${user.nombre} (${user.email})`);

    // Determinar contraseña
    let pwToSet = newPassword;
    if (!pwToSet) {
      pwToSet = generateSecurePassword();
      console.log(`⚠️  Contraseña no proporcionada. Generando aleatoria...\n`);
    }

    // Validar contraseña
    const validation = validatePassword(pwToSet);
    if (!validation.valid) {
      console.error('❌ Contraseña inválida:');
      validation.errors.forEach(err => console.error(`   • ${err}`));
      process.exit(1);
    }

    console.log('✅ Contraseña cumple requisitos OWASP SP 800-63B');

    // Hashear contraseña
    console.log('🔄 Hasheando contraseña...');
    const passwordHash = await bcrypt.hash(pwToSet, 10);

    // Actualizar en BD
    console.log('🔄 Actualizando BD...');
    await pool.query(
      'UPDATE usuarios SET password_hash = ? WHERE id = ?',
      [passwordHash, user.id]
    );

    console.log('\n✅ ¡Contraseña actualizada exitosamente!\n');
    console.log('📋 Detalles:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Nueva contraseña: ${pwToSet}`);
    console.log(`\n⚠️  Guarda esta contraseña en un lugar seguro (ej: gestor de contraseñas)`);
    console.log(`⚠️  Considera implementar MFA (autenticación multifactor) para mayor seguridad\n`);

    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();