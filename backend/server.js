// backend/server.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');
const pathToUse = fs.existsSync(envLocalPath) ? envLocalPath : envPath;

const envResult = dotenv.config({ path: pathToUse });
console.log('✅ Cargando config desde:', pathToUse);
if (envResult.error) {
  console.error('⚠️  Error cargando archivo:', envResult.error.message);
} else {
  console.log(`✅ Config cargada exitosamente (${path.basename(pathToUse)})`);
}

import express from "express";
import cors    from "cors";

import propertiesRouter     from "./routes/properties.js";
import propertyPhotosRouter from "./routes/propertyPhotos.js";   // ← NUEVO
import ownersRouter         from "./routes/owners.js";
import tenantsRouter        from "./routes/tenants.js";
import leasesRouter         from "./routes/leases.js";
import documentsRouter      from "./routes/documents.js";
import indicesRouter        from "./routes/indices.js";
import authRouter           from "./routes/auth.js";
import subscriptionsRouter  from "./routes/subscriptions.js";

import "./db.js";
import "./cron.js";

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// ─── ROUTERS ─────────────────────────────────────────────────
app.use('/api/auth',          authRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/properties',    propertiesRouter);
app.use('/api/properties',    propertyPhotosRouter);   // ← NUEVO (mismo prefijo, rutas /:id/photos)
app.use('/api/owners',        ownersRouter);
app.use('/api/tenants',       tenantsRouter);
app.use('/api/leases',        leasesRouter);
app.use('/api/documents',     documentsRouter);
app.use('/api/indices',       indicesRouter);

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

// ─── TEMP: FIX MYSQL GRANTS (BORRAR DESPUÉS DE USAR) ─────────
app.get("/api/_fix-grants", async (_req, res) => {
  try {
    const { pool } = await import('./db.js');
    const conn = await pool.getConnection();
    const pass = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
    await conn.query(`GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '${pass}' WITH GRANT OPTION`);
    await conn.query('FLUSH PRIVILEGES');
    conn.release();
    res.json({ ok: true, msg: 'Grant ejecutado. Ahora borrá este endpoint.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  OnKey API corriendo en http://localhost:${PORT}`);
});