#!/usr/bin/env node
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
};

async function execSQL(sql) {
  const conn = await mysql.createConnection(config);
  try {
    const [results] = await conn.execute(sql);
    return results;
  } finally {
    await conn.end();
  }
}

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('📊 Railway DB Manager');
  console.log(`Conectado a: ${config.host}:${config.port}/${config.database}`);
  console.log('Escribe comandos SQL o "exit" para salir\n');

  const prompt = () => {
    rl.question('SQL> ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('Bye! 👋');
        rl.close();
        return;
      }

      if (!input.trim()) {
        prompt();
        return;
      }

      try {
        const results = await execSQL(input);
        console.log(JSON.stringify(results, null, 2));
      } catch (err) {
        console.error('❌ Error:', err.message);
      }

      prompt();
    });
  };

  prompt();
}

async function executeCommand(sql) {
  try {
    console.log(`\n🔄 Ejecutando: ${sql.substring(0, 60)}...`);
    const results = await execSQL(sql);
    console.log('✅ Resultado:');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Modo: node railwayDB.js "SELECT * FROM usuarios"
// O: node railwayDB.js (modo interactivo)

const args = process.argv.slice(2);

if (args.length > 0) {
  executeCommand(args.join(' '));
} else {
  interactiveMode();
}
