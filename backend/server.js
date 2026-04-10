// backend/server.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ⚠️  CRÍTICO: Cargar .env ANTES de cualquier otra cosa
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intentar cargar .env.local (desarrollo) primero, luego .env (producción)
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

import propertiesRouter from "./routes/properties.js";
import ownersRouter     from "./routes/owners.js";
import tenantsRouter    from "./routes/tenants.js";
import leasesRouter     from "./routes/leases.js";
import documentsRouter  from "./routes/documents.js";
import indicesRouter    from "./routes/indices.js";
import authRouter       from "./routes/auth.js";
import subscriptionsRouter from "./routes/subscriptions.js";
import { authMiddleware } from "./middleware/auth.js";
import { pool } from "./db.js";

import "./db.js";
import "./cron.js";

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// ─── ROUTERS ─────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/leases', leasesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/indices', indicesRouter);

// ─── HELPER ─────────────────────────────────────────────────

// ─── HEALTH CHECK ────────────────────────────────────────────

app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

// ─── START ───────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀  OnKey API corriendo en http://localhost:${PORT}`);
});