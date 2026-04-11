import { Router } from "express";
import multer      from "multer";
import { pool }    from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Tipo no permitido. Solo PDF, PNG o JPG"));
  },
});

// Todas las rutas requieren autenticación y suscripción activa
router.use(authMiddleware);
router.use(subscriptionMiddleware);

// GET /api/documents?entityType=lease&entityId=5
router.get("/", async (req, res) => {
  const { entityType, entityId } = req.query;
  if (!entityType || !entityId)
    return res.status(400).json({ error: "Faltan entityType o entityId" });
  try {
    const [rows] = await pool.query(
      `SELECT id, entity_type, entity_id, file_name, mime_type, file_size,
              created_at
       FROM documentos
       WHERE entity_type = ? AND entity_id = ? AND tenant_id = ?
       ORDER BY created_at DESC`,
      [entityType, entityId, req.user.tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

// GET /api/documents/:id/file  — devuelve el binario del archivo
router.get("/:id/file", async (req, res) => {
  try {
    const [[row]] = await pool.query(
      "SELECT file_name, mime_type, file_data FROM documentos WHERE id = ? AND tenant_id = ?",
      [req.params.id, req.user.tenantId]
    );
    if (!row) return res.status(404).json({ error: "Documento no encontrado" });
    res.setHeader("Content-Type", row.mime_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(row.file_name)}"`
    );
    res.send(row.file_data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

// POST /api/documents  — multipart/form-data: file + entityType + entityId
router.post("/", upload.single("file"), async (req, res) => {
  const { entityType, entityId } = req.body;
  if (!entityType || !entityId || !req.file)
    return res.status(400).json({ error: "Faltan campos: entityType, entityId o archivo" });

  const { originalname, mimetype, buffer, size } = req.file;
  try {
    const [result] = await pool.query(
      `INSERT INTO documentos (tenant_id, entity_type, entity_id, file_name, mime_type, file_size, file_data)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.tenantId, entityType, entityId, originalname, mimetype, size, buffer]
    );
    res.status(201).json({
      id:          result.insertId,
      entity_type: entityType,
      entity_id:   Number(entityId),
      file_name:   originalname,
      mime_type:   mimetype,
      file_size:   size,
      created_at:  new Date(),
    });
  } catch (err) {
    console.error('[documents POST]', err.code, err.message);
    res.status(500).json({ error: `Error al guardar: ${err.code ?? err.message}` });
  }
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM documentos WHERE id = ? AND tenant_id = ?", [req.params.id, req.user.tenantId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

export default router;
