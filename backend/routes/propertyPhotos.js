// backend/routes/propertyPhotos.js
// Rutas para subir, listar y eliminar fotos de propiedades

import { Router }           from "express";
import { pool }             from "../../db.js";
import { authMiddleware }   from "../middleware/auth.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";
import multer               from "multer";

const router  = Router();
const upload  = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB por foto
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"));
  },
});

router.use(authMiddleware);
router.use(subscriptionMiddleware);

// GET /api/properties/:id/photos  — lista de fotos (sin el blob, solo metadata + base64)
router.get("/:id/photos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, file_name, mime_type, file_size, orden,
              TO_BASE64(file_data) AS data
       FROM property_photos
       WHERE propiedad_id = ? AND tenant_id = ?
       ORDER BY orden ASC, id ASC`,
      [req.params.id, req.user.tenantId]
    );
    const photos = rows.map(r => ({
      id:       r.id,
      fileName: r.file_name,
      mimeType: r.mime_type,
      fileSize: r.file_size,
      orden:    r.orden,
      url:      `data:${r.mime_type};base64,${r.data}`,
    }));
    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener fotos" });
  }
});

// POST /api/properties/:id/photos  — subir una o varias fotos
router.post("/:id/photos", upload.array("photos", 20), async (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: "No se recibieron archivos" });

  try {
    // Obtener el orden actual más alto
    const [[{ maxOrden }]] = await pool.query(
      "SELECT COALESCE(MAX(orden),0) AS maxOrden FROM property_photos WHERE propiedad_id = ? AND tenant_id = ?",
      [req.params.id, req.user.tenantId]
    );

    const inserted = [];
    for (let i = 0; i < req.files.length; i++) {
      const file  = req.files[i];
      const orden = maxOrden + i + 1;
      const [result] = await pool.query(
        `INSERT INTO property_photos (tenant_id, propiedad_id, file_name, mime_type, file_size, file_data, orden)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.tenantId, req.params.id, file.originalname, file.mimetype, file.size, file.buffer, orden]
      );
      inserted.push({
        id:       result.insertId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        orden,
        url:      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      });
    }
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar fotos" });
  }
});

// DELETE /api/properties/:id/photos/:photoId
router.delete("/:id/photos/:photoId", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM property_photos WHERE id = ? AND propiedad_id = ? AND tenant_id = ?",
      [req.params.photoId, req.params.id, req.user.tenantId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar foto" });
  }
});

// PUT /api/properties/:id/photos/reorder  — body: { order: [id1, id2, ...] }
router.put("/:id/photos/reorder", async (req, res) => {
  const { order } = req.body; // array de IDs en el nuevo orden
  if (!Array.isArray(order)) return res.status(400).json({ error: "Se espera array 'order'" });
  try {
    for (let i = 0; i < order.length; i++) {
      await pool.query(
        "UPDATE property_photos SET orden = ? WHERE id = ? AND propiedad_id = ? AND tenant_id = ?",
        [i + 1, order[i], req.params.id, req.user.tenantId]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al reordenar fotos" });
  }
});

export default router;