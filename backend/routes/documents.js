import { Router } from "express";
import { pool }    from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";

const router = Router();

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

// POST /api/documents
// Body JSON: { entityType, entityId, fileName, mimeType, fileData (base64) }
router.post("/", async (req, res) => {
  const { entityType, entityId, fileName, mimeType, fileData } = req.body;
  if (!entityType || !entityId || !fileName || !mimeType || !fileData)
    return res.status(400).json({ error: "Faltan campos obligatorios" });

  const allowed = ["application/pdf", "image/png", "image/jpeg"];
  if (!allowed.includes(mimeType))
    return res.status(400).json({ error: "Tipo de archivo no permitido (PDF, PNG, JPG)" });

  const buffer   = Buffer.from(fileData, "base64");
  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (buffer.length > maxBytes)
    return res.status(400).json({ error: "El archivo supera los 10 MB" });

  try {
    const [result] = await pool.query(
      `INSERT INTO documentos (tenant_id, entity_type, entity_id, file_name, mime_type, file_size, file_data)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.tenantId, entityType, entityId, fileName, mimeType, buffer.length, buffer]
    );
    res.status(201).json({
      id:          result.insertId,
      entity_type: entityType,
      entity_id:   entityId,
      file_name:   fileName,
      mime_type:   mimeType,
      file_size:   buffer.length,
      created_at:  new Date(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar documento" });
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
