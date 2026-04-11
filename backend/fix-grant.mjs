import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.MYSQL_URL);
const pass = process.env.MYSQLPASSWORD;

await conn.query(`GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '${pass}' WITH GRANT OPTION`);
await conn.query('FLUSH PRIVILEGES');
console.log('✅ Grant ejecutado OK');
conn.end();
process.exit(0);
