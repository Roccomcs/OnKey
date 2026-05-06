#!/usr/bin/env node
import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL || "mysql://root:NrfnpDSdrMFWMNCNoLNpXENTvTkKfHlpb@mainline.proxy.riwy.net:57931/railway";

const pool = await mysql.createPool({ uri: dbUrl });

try {
  console.log('📋 Verificando todos los emails en la BD...\n');
  
  const [usuarios] = await pool.query(
    'SELECT id, email, nombre, activo, email_verificado FROM usuarios ORDER BY email'
  );
  
  if (!usuarios.length) {
    console.log('❌ No hay usuarios');
    process.exit(0);
  }
  
  console.log(`✅ Total de usuarios: ${usuarios.length}\n`);
  usuarios.forEach(u => {
    console.log(`  • ${u.email}`);
    console.log(`    - ID: ${u.id}, Nombre: ${u.nombre}, Activo: ${u.activo}, Verificado: ${u.email_verificado}`);
  });
  
  // Buscar duplicados
  const duplicates = new Map();
  usuarios.forEach(u => {
    const key = u.email.toLowerCase();
    if (!duplicates.has(key)) duplicates.set(key, []);
    duplicates.get(key).push(u);
  });
  
  const hasDuplicates = Array.from(duplicates.values()).some(arr => arr.length > 1);
  if (hasDuplicates) {
    console.log('\n⚠️  EMAILS DUPLICADOS ENCONTRADOS:');
    for (const [email, users] of duplicates) {
      if (users.length > 1) {
        console.log(`\n  ${email}:`);
        users.forEach(u => {
          console.log(`    - ID ${u.id} (Activo: ${u.activo})`);
        });
      }
    }
  } else {
    console.log('\n✅ No hay emails duplicados');
  }
  
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await pool.end();
}
