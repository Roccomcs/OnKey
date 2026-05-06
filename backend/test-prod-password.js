import mysql from 'mysql2/promise';

const pool = await mysql.createPool({
  uri: process.env.DATABASE_URL || "mysql://root:NrfnpDSdrMFWMCNoLNpXENTvTkfHlpb@mainline.proxy.rlwy.net:57931/railway"
});

try {
  const [users] = await pool.query(
    'SELECT id, email, contraseña FROM usuarios WHERE email = ? LIMIT 1',
    ['admin@localhost']
  );
  
  if (!users.length) {
    console.log('❌ Usuario admin@localhost no encontrado');
    process.exit(1);
  }
  
  const user = users[0];
  console.log('✅ Usuario encontrado:');
  console.log('  Email:', user.email);
  console.log('  Hash en BD:', user.contraseña);
  console.log('\n📝 Para testear, ejecuta:');
  console.log(`  node -e "import bcrypt from 'bcrypt'; bcrypt.compare('14)17=HCCcI=d%s$', '${user.contraseña}').then(r => console.log(r))"`);
  
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await pool.end();
}
