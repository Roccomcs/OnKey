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
import helmet  from "helmet";
import cookieParser from "cookie-parser";

import { loginLimiter, registerLimiter, webhookLimiter, emailResendLimiter, generalLimiter } from "./middleware/rateLimiting.js";
import { extractCookieAuth } from "./middleware/httpOnlyCookies.js";
import { requestLogger } from "./middleware/logging.js";
import { dataFilteringMiddleware } from "./middleware/dataFiltering.js";
import { csrfProtection } from "./middleware/csrf.js";

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
import seoRouter            from "./routes/seo.js";

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
    INSERT IGNORE INTO planes (nombre, activo, precio_mensual, max_propiedades, max_contratos, max_contactos)
    VALUES ('Starter', 1, 0, 5, 5, 10)
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

  // Agregar tenant_id a activities si no existe (multi-tenancy explícito)
  if (!(await columnExists("activities", "tenant_id"))) {
    await pool.query(
      "ALTER TABLE activities ADD COLUMN tenant_id INT UNSIGNED NULL, ADD INDEX idx_activities_tenant (tenant_id)"
    );
    // Backfill: copiar el tenant_id desde el usuario correspondiente
    await pool.query(
      "UPDATE activities a JOIN usuarios u ON u.id = a.userId SET a.tenant_id = u.tenant_id WHERE a.tenant_id IS NULL"
    );
    console.log("  ✅ Columna 'tenant_id' agregada a activities y backfilled");
  }

  console.log("✅ Migraciones aplicadas");
}

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── TRUST PROXY: Necesario para rate-limiting detrás de proxy (Railway, Vercel, etc)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── SEGURIDAD: Headers de seguridad ──────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://www.onkey.com.ar",
  "https://onkey.com.ar",
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());

// ─── COOKIES ──────────────────────────────────────────────────
app.use(cookieParser());
app.use(extractCookieAuth); // Extrae JWT de cookie al header Authorization

// ─── LOGGING & DATA FILTERING ─────────────────────────────────
app.use(requestLogger()); // Loguea requests (solo ruta, método, status en prod)
app.use(dataFilteringMiddleware()); // Filtra datos sensibles de respuestas

// ─── CSRF PROTECTION ──────────────────────────────────────────
app.use(csrfProtection); // Valida token CSRF en POST, PUT, DELETE

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
app.use('/',                  seoRouter);  // ← SEO: sitemap.xml, robots.txt

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

// ─── START ───────────────────────────────────────────────────
runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀  OnKey API corriendo en http://localhost:${PORT}`);
  });
});