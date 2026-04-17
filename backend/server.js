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
import activitiesRouter     from "./routes/activities.js";

import { pool, columnExists } from "./db.js";
import "./cron.js";

// ─── MIGRACIONES AUTOMÁTICAS ─────────────────────────────────
async function runMigrations() {
  // Crear tabla planes si no existe
  const createPlanesTable = `
    CREATE TABLE IF NOT EXISTS planes (
      id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
      nombre           VARCHAR(100)    NOT NULL,
      activo           TINYINT(1)      NOT NULL DEFAULT 1,
      precio_mensual   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
      max_propiedades  INT UNSIGNED             DEFAULT NULL,
      max_contratos    INT UNSIGNED             DEFAULT NULL,
      max_contactos    INT UNSIGNED             DEFAULT NULL,
      max_usuarios     INT UNSIGNED             DEFAULT NULL,
      mp_plan_id       VARCHAR(255)             DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_planes_nombre (nombre)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;

  // Crear tabla suscripciones si no existe
  const createSuscripcionesTable = `
    CREATE TABLE IF NOT EXISTS suscripciones (
      id                       INT UNSIGNED   NOT NULL AUTO_INCREMENT,
      usuario_id               INT UNSIGNED   NOT NULL,
      tenant_id                INT UNSIGNED   NOT NULL,
      plan_id                  INT UNSIGNED   NOT NULL,
      fecha_inicio             DATE           NOT NULL,
      fecha_fin                DATE           NOT NULL,
      fecha_renovacion_proximo DATE                    DEFAULT NULL,
      ciclo_facturacion        ENUM('mensual','anual') NOT NULL DEFAULT 'mensual',
      estado                   ENUM('activo','pendiente','cancelado')
                               NOT NULL DEFAULT 'activo',
      renovacion_automatica    TINYINT(1)     NOT NULL DEFAULT 0,
      mp_preapproval_id        VARCHAR(255)            DEFAULT NULL,
      created_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_subs_usuario (usuario_id),
      KEY idx_subs_tenant  (tenant_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;

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

  // Crear tabla documentos si no existe
  const createDocumentosTable = `
    CREATE TABLE IF NOT EXISTS documentos (
      id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
      tenant_id    INT UNSIGNED   NOT NULL,
      entity_type  VARCHAR(30)    NOT NULL,
      entity_id    INT UNSIGNED   NOT NULL,
      file_name    VARCHAR(255)   NOT NULL,
      mime_type    VARCHAR(100)   NOT NULL,
      file_size    INT UNSIGNED   NOT NULL DEFAULT 0,
      file_data    LONGBLOB       NOT NULL,
      created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_docs_tenant  (tenant_id),
      KEY idx_docs_entity  (entity_type, entity_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;

  // Crear tabla activities si no existe
  const createActivitiesTable = `
    CREATE TABLE IF NOT EXISTS activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT UNSIGNED NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      relatedId INT,
      relatedType VARCHAR(50),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_userId_createdAt (userId, createdAt DESC),
      INDEX idx_createdAt (createdAt DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  // Crear plan Starter si no existe (required para new users)
  const ensureStarterPlan = `
    INSERT IGNORE INTO planes (nombre, activo, precio_mensual, max_propiedades, max_contratos, max_contactos, max_usuarios)
    VALUES ('Starter', 1, 0, 5, 5, 10, 1)
  `;

  try {
    await pool.query(createPlanesTable);
    console.log("  ✅ Tabla 'planes' creada/verificada");
  } catch (err) {
    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error("  ❌ Error al crear tabla planes:", err.message);
    }
  }

  try {
    await pool.query(createSuscripcionesTable);
    console.log("  ✅ Tabla 'suscripciones' creada/verificada");
  } catch (err) {
    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error("  ❌ Error al crear tabla suscripciones:", err.message);
    }
  }

  try {
    await pool.query(createPropertyPhotosTable);
    console.log("  ✅ Tabla 'property_photos' creada/verificada");
  } catch (err) {
    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error("  ❌ Error al crear tabla property_photos:", err.message);
    }
  }

  try {
    await pool.query(createDocumentosTable);
    console.log("  ✅ Tabla 'documentos' creada/verificada");
  } catch (err) {
    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error("  ❌ Error al crear tabla documentos:", err.message);
    }
  }

  try {
    await pool.query(createActivitiesTable);
    console.log("  ✅ Tabla 'activities' creada/verificada");
  } catch (err) {
    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error("  ❌ Error al crear tabla activities:", err.message);
    }
  }

  try {
    await pool.query(ensureStarterPlan);
    console.log("  ✅ Plan Starter verificado/creado");
  } catch (err) {
    console.error("  ⚠️  Error al verificar plan Starter:", err.message);
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
app.use('/api/activities',    activitiesRouter);

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

// ─── START ───────────────────────────────────────────────────
runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀  OnKey API corriendo en http://localhost:${PORT}`);
  });
});