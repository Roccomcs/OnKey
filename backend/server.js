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

import { pool, columnExists } from "./db.js";
import "./cron.js";

// ─── MIGRACIONES AUTOMÁTICAS ─────────────────────────────────
async function runMigrations() {
  // Crear tabla property_photos si no existe
  const createPropertyPhotosTable = `
    CREATE TABLE IF NOT EXISTS property_photos (
      id            INT UNSIGNED   NOT NULL AUTO_INCREMENT,
      tenant_id     INT UNSIGNED   NOT NULL,
      propiedad_id  INT            NOT NULL,
      file_name     VARCHAR(255)   NOT NULL,
      mime_type     VARCHAR(100)   NOT NULL DEFAULT 'image/jpeg',
      file_size     INT UNSIGNED   NOT NULL DEFAULT 0,
      file_data     LONGBLOB       NOT NULL,
      orden         INT UNSIGNED   NOT NULL DEFAULT 0,
      created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_photos_propiedad (propiedad_id),
      KEY idx_photos_tenant    (tenant_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;

  try {
    await pool.query(createPropertyPhotosTable);
    console.log("  ✅ Tabla 'property_photos' creada/verificada");
  } catch (err) {
    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error("  ❌ Error al crear tabla property_photos:", err.message);
    }
  }

  // Agregar columnas a propiedades si no existen
  const cols = [
    { name: "m2",           sql: "ALTER TABLE propiedades ADD COLUMN m2 INT NULL" },
    { name: "habitaciones", sql: "ALTER TABLE propiedades ADD COLUMN habitaciones TINYINT NULL" },
    { name: "banos",        sql: "ALTER TABLE propiedades ADD COLUMN banos TINYINT NULL" },
    { name: "descripcion",  sql: "ALTER TABLE propiedades ADD COLUMN descripcion TEXT NULL" },
  ];
  for (const { name, sql } of cols) {
    if (!(await columnExists("propiedades", name))) {
      await pool.query(sql);
      console.log(`  ✅ Columna '${name}' agregada`);
    }
  }
  console.log("✅ Migraciones aplicadas");
}

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

// ─── START ───────────────────────────────────────────────────
runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀  OnKey API corriendo en http://localhost:${PORT}`);
  });
});