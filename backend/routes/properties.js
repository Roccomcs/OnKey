// backend/routes/properties.js
import { Router } from "express";
import { pool } from "../db.js";
import { mapProperty, mapTipoDB } from "../mappers.js";
import { authMiddleware } from "../middleware/auth.js";
import { subscriptionMiddleware, checkLimits } from "../middleware/subscription.js";
import { pagination, paginatedResponse } from "../middleware/pagination.js";
import { validatePrice } from "../validators.js";
import { createLogger } from "../middleware/logging.js";

const router = Router();
const logger = createLogger('properties');

router.use(authMiddleware);
router.use(subscriptionMiddleware);

// GET /api/properties
router.get("/", pagination(20), async (req, res) => {
  try {
    // Obtener propiedades con paginación
    const [rows] = await pool.query(`
      SELECT p.*,
        c.id AS leaseId
      FROM propiedades p
      LEFT JOIN contratos c ON c.propiedad_id = p.id 
        AND c.estado_contrato = 'activo'
      WHERE p.activo = 1 AND p.tenant_id = ?
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `, [req.user.tenantId, req.pagination.limit, req.pagination.offset]);

    // Contar total para paginación
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM propiedades WHERE activo = 1 AND tenant_id = ?',
      [req.user.tenantId]
    );

    res.json(paginatedResponse(
      rows.map(mapProperty),
      req.pagination.page,
      req.pagination.pageSize,
      total
    ));
  } catch (err) {
    logger.error('Error al obtener propiedades', { error: err.message });
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

  // ✅ Validar precio
  if (!validatePrice(price)) {
    return res.status(400).json({ error: "Precio inválido (debe ser entre $0.01 y $999,999.99)" });
  }

  // ✅ Validar números positivos opcionales
  if (m2 !== undefined && (!Number.isInteger(Number(m2)) || Number(m2) <= 0)) {
    return res.status(400).json({ error: "m² debe ser un número positivo" });
  }
  if (habitaciones !== undefined && (!Number.isInteger(Number(habitaciones)) || Number(habitaciones) < 0)) {
    return res.status(400).json({ error: "Habitaciones debe ser un número no negativo" });
  }
  if (banos !== undefined && (!Number.isInteger(Number(banos)) || Number(banos) < 0)) {
    return res.status(400).json({ error: "Baños debe ser un número no negativo" });
  }

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
    logger.error('Error al crear propiedad', { error: err.message });
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

  // ✅ Validar precio si se proporciona
  if (price !== undefined && !validatePrice(price)) {
    return res.status(400).json({ error: "Precio inválido (debe ser entre $0.01 y $999,999.99)" });
  }

  // ✅ Validar números positivos opcionales
  if (m2 !== undefined && (!Number.isInteger(Number(m2)) || Number(m2) <= 0)) {
    return res.status(400).json({ error: "m² debe ser un número positivo" });
  }
  if (habitaciones !== undefined && (!Number.isInteger(Number(habitaciones)) || Number(habitaciones) < 0)) {
    return res.status(400).json({ error: "Habitaciones debe ser un número no negativo" });
  }
  if (banos !== undefined && (!Number.isInteger(Number(banos)) || Number(banos) < 0)) {
    return res.status(400).json({ error: "Baños debe ser un número no negativo" });
  }

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
    logger.error('Error al actualizar propiedad', { error: err.message });
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
    logger.error('Error al eliminar propiedad', { error: err.message });
    res.status(500).json({ error: "Error al eliminar propiedad" });
  } finally {
    conn.release();
  }
});

export default router;