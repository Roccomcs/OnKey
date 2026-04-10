import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "127.0.0.1",
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "inmobiliaria",
  waitForConnections: true,
  connectionLimit:    10,
  timezone: "Z",
});

// ─── Cache de schema para evitar queries repetidas ──────────────
const schemaCache = new Map();

export async function columnExists(table, column) {
  const key = `${table}.${column}`;
  if (schemaCache.has(key)) return schemaCache.get(key);
  
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  );
  const exists = row.cnt > 0;
  schemaCache.set(key, exists);
  return exists;
}

// ─── Verificación de conexión al iniciar ──────────────────────
pool.getConnection()
  .then(conn => { console.log("✅  Conectado a MySQL"); conn.release(); })
  .catch(err  => { console.error("❌  Error de conexión MySQL:", err.message); process.exit(1); });