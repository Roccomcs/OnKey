import { Router } from "express";
import { pool } from "../db.js";
import { mapProperty, mapTipoDB } from "../mappers.js";
import { authMiddleware } from "../middleware/auth.js";
import { subscriptionMiddleware, checkLimits } from "../middleware/subscription.js";

const router = Router();

// Todas las rutas requieren autenticación y suscripción activa
router.use(authMiddleware);
router.use(subscriptionMiddleware);

// GET /api/properties
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*,
        (SELECT c.id FROM contratos c WHERE c.propiedad_id = p.id AND c.estado_contrato = 'activo' LIMIT 1) AS leaseId
      FROM propiedades p
      WHERE p.activo = 1 AND p.tenant_id = ?
      ORDER BY p.id DESC
    `, [req.user.tenantId]);
    res.json(rows.map(mapProperty));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener propiedades" });
  }
});

// POST /api/properties — verifica límite de propiedades antes de crear
router.post("/", checkLimits('propiedades'), async (req, res) => {
  const { address, type, price, status, ownerId } = req.body;
  if (!address || !price || !ownerId)
    return res.status(400).json({ error: "Faltan campos: address, price, ownerId" });

  const parts  = address.split(",");
  const dir    = parts[0]?.trim() || address;
  const numero = parts.slice(1).join(",").trim() || null;
  const estado = status === "ocupado" ? "alquilada" : "disponible";

  try {
    const [result] = await pool.query(
      `INSERT INTO propiedades (tenant_id, id_propietario, direccion, numero, ciudad, codigo_postal, tipo, estado, precio_lista, moneda, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ARS', 1)`,
      [req.user.tenantId, ownerId, dir, numero, "Buenos Aires", "1000", mapTipoDB(type), estado, price]
    );
    const [[row]] = await pool.query("SELECT p.*, NULL AS leaseId FROM propiedades p WHERE p.id = ?", [result.insertId]);
    res.status(201).json(mapProperty(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear propiedad" });
  }
});

// PUT /api/properties/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { address, type, price, status, ownerId } = req.body;
  const parts  = (address || "").split(",");
  const dir    = parts[0]?.trim() || address;
  const numero = parts.slice(1).join(",").trim() || null;
  const estado = status === "ocupado" ? "alquilada" : "disponible";

  try {
    await pool.query(
      `UPDATE propiedades SET direccion = ?, numero = ?, tipo = ?, estado = ?, precio_lista = ?, id_propietario = ? WHERE id = ? AND tenant_id = ?`,
      [dir, numero, mapTipoDB(type), estado, price, ownerId, id, req.user.tenantId]
    );
    const [[row]] = await pool.query(
      `SELECT p.*, (SELECT c.id FROM contratos c WHERE c.propiedad_id = p.id AND c.estado_contrato = 'activo' LIMIT 1) AS leaseId FROM propiedades p WHERE p.id = ?`,
      [id]
    );
    res.json(mapProperty(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar propiedad" });
  }
});

// DELETE /api/properties/:id
// Cascada: contratos → documentos de contratos → documentos de propiedad → propiedad
router.delete("/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Obtener todos los contratos de la propiedad
    const [contratos] = await conn.query(
      "SELECT id FROM contratos WHERE propiedad_id = ? AND tenant_id = ?",
      [req.params.id, req.user.tenantId]
    );

    for (const contrato of contratos) {
      // 2. Eliminar documentos de cada contrato
      await conn.query(
        "DELETE FROM documentos WHERE entity_type = 'lease' AND entity_id = ?",
        [contrato.id]
      );
    }

    // 3. Eliminar todos los contratos de la propiedad
    await conn.query("DELETE FROM contratos WHERE propiedad_id = ?", [req.params.id]);

    // 4. Eliminar documentos de la propiedad
    await conn.query(
      "DELETE FROM documentos WHERE entity_type = 'property' AND entity_id = ?",
      [req.params.id]
    );

    // 5. Dar de baja la propiedad
    await conn.query("UPDATE propiedades SET activo = 0 WHERE id = ? AND tenant_id = ?", [req.params.id, req.user.tenantId]);

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Error al eliminar propiedad" });
  } finally {
    conn.release();
  }
});

export default router;