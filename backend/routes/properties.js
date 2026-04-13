// backend/routes/properties.js
import { Router } from "express";
import { pool } from "../db.js";
import { mapProperty, mapTipoDB } from "../mappers.js";
import { authMiddleware } from "../middleware/auth.js";
import { subscriptionMiddleware, checkLimits } from "../middleware/subscription.js";

const router = Router();

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
  const {
    address, type, price, status, ownerId,
    operacion, localidad, provincia, codigoPostal,
    moneda,
    m2, habitaciones, banos, descripcion,
  } = req.body;

  if (!address || !price || !ownerId)
    return res.status(400).json({ error: "Faltan campos: address, price, ownerId" });

  const parts   = address.split(",");
  const dir     = parts[0]?.trim() || address;
  const numero  = parts.slice(1).join(",").trim() || null;
  const estado  = status === "ocupado" ? "alquilada" : "disponible";
  const op      = operacion === "venta" ? "venta" : "alquiler";
  const monedaV = moneda === "USD" ? "USD" : "ARS";

  try {
    const [result] = await pool.query(
      `INSERT INTO propiedades
         (tenant_id, id_propietario, direccion, numero, tipo, estado,
          precio_lista, moneda, operacion, localidad, provincia, codigo_postal,
          m2, habitaciones, banos, descripcion, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        req.user.tenantId, ownerId, dir, numero, mapTipoDB(type), estado,
        price, monedaV, op,
        localidad || null, provincia || null, codigoPostal || null,
        m2 || null, habitaciones || null, banos || null, descripcion || null,
      ]
    );
    const [[row]] = await pool.query(
      "SELECT p.*, NULL AS leaseId FROM propiedades p WHERE p.id = ?",
      [result.insertId]
    );
    res.status(201).json(mapProperty(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear propiedad" });
  }
});

// PUT /api/properties/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    address, type, price, status, ownerId,
    operacion, localidad, provincia, codigoPostal,
    moneda,
    m2, habitaciones, banos, descripcion,
  } = req.body;

  const parts   = (address || "").split(",");
  const dir     = parts[0]?.trim() || address;
  const numero  = parts.slice(1).join(",").trim() || null;
  const estado  = status === "ocupado" ? "alquilada" : "disponible";
  const op      = operacion === "venta" ? "venta" : "alquiler";
  const monedaV = moneda === "USD" ? "USD" : "ARS";

  try {
    await pool.query(
      `UPDATE propiedades
       SET direccion = ?, numero = ?, tipo = ?, estado = ?, precio_lista = ?,
           moneda = ?, id_propietario = ?, operacion = ?,
           localidad = ?, provincia = ?, codigo_postal = ?,
           m2 = ?, habitaciones = ?, banos = ?, descripcion = ?
       WHERE id = ? AND tenant_id = ?`,
      [
        dir, numero, mapTipoDB(type), estado, price,
        monedaV, ownerId, op,
        localidad || null, provincia || null, codigoPostal || null,
        m2 || null, habitaciones || null, banos || null, descripcion || null,
        id, req.user.tenantId,
      ]
    );
    const [[row]] = await pool.query(
      `SELECT p.*,
         (SELECT c.id FROM contratos c WHERE c.propiedad_id = p.id AND c.estado_contrato = 'activo' LIMIT 1) AS leaseId
       FROM propiedades p WHERE p.id = ?`,
      [id]
    );
    res.json(mapProperty(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar propiedad" });
  }
});

// DELETE /api/properties/:id — cascada completa
router.delete("/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [contratos] = await conn.query(
      "SELECT id FROM contratos WHERE propiedad_id = ? AND tenant_id = ?",
      [req.params.id, req.user.tenantId]
    );

    for (const contrato of contratos) {
      await conn.query(
        "DELETE FROM documentos WHERE entity_type = 'lease' AND entity_id = ?",
        [contrato.id]
      );
    }

    await conn.query("DELETE FROM contratos WHERE propiedad_id = ?", [req.params.id]);
    await conn.query(
      "DELETE FROM documentos WHERE entity_type = 'property' AND entity_id = ?",
      [req.params.id]
    );
    // Las fotos se eliminan en cascada por FK
    await conn.query(
      "UPDATE propiedades SET activo = 0 WHERE id = ? AND tenant_id = ?",
      [req.params.id, req.user.tenantId]
    );

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