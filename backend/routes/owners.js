import { Router } from "express";
import { pool } from "../db.js";
import { mapOwner, splitName } from "../mappers.js";
import { authMiddleware } from "../middleware/auth.js";
import { subscriptionMiddleware, checkLimits } from "../middleware/subscription.js";
import { pagination, paginatedResponse } from "../middleware/pagination.js";
import { validateEmail, validatePhone, validateDocument, normalizeEmail } from "../validators.js";
import { createLogger } from "../middleware/logging.js";

const router = Router();
const logger = createLogger('owners');

// Todas las rutas requieren autenticación y suscripción activa
router.use(authMiddleware);
router.use(subscriptionMiddleware);

// GET /api/owners
router.get("/", pagination(20), async (req, res) => {
  try {
    // Obtener propietarios con paginación
    const [rows] = await pool.query(`
      SELECT pe.*,
        GROUP_CONCAT(pr.id ORDER BY pr.id) AS properties
      FROM personas pe
      LEFT JOIN propiedades pr ON pr.id_propietario = pe.id AND pr.activo = 1 AND pr.tenant_id = ?
      WHERE pe.activo = 1 AND pe.tipo_persona IN ('propietario', 'ambos') AND pe.tenant_id = ?
      GROUP BY pe.id
      ORDER BY pe.apellido, pe.nombre
      LIMIT ? OFFSET ?
    `, [req.user.tenantId, req.user.tenantId, req.pagination.limit, req.pagination.offset]);

    // Contar total
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM personas 
       WHERE activo = 1 AND tipo_persona IN ('propietario', 'ambos') AND tenant_id = ?`,
      [req.user.tenantId]
    );

    res.json(paginatedResponse(
      rows.map(mapOwner),
      req.pagination.page,
      req.pagination.pageSize,
      total
    ));
  } catch (err) {
    logger.error('Error al obtener propietarios', { error: err.message });
    res.status(500).json({ error: "Error al obtener propietarios" });
  }
});

// POST /api/owners — verifica límite de contactos antes de crear
router.post("/", checkLimits('contactos'), async (req, res) => {
  const { name, email, phone, document } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Faltan campos: name, email" });
  
  // Validar email
  if (!validateEmail(email)) return res.status(400).json({ error: "Email inválido" });
  
  // Validar teléfono si se proporciona
  if (phone && !validatePhone(phone)) return res.status(400).json({ error: "Teléfono inválido" });
  
  // Validar documento si se proporciona
  if (document && !validateDocument(document)) return res.status(400).json({ error: "Documento inválido (7-8 dígitos)" });
  
  const { nombre, apellido } = splitName(name);
  const normalizedEmail = normalizeEmail(email);
  
  try {
    const [result] = await pool.query(
      `INSERT INTO personas (tenant_id, tipo_persona, nombre, apellido, documento_tipo, documento_nro, telefono, email, activo)
       VALUES (?, 'propietario', ?, ?, 'DNI', ?, ?, ?, 1)`,
      [req.user.tenantId, nombre, apellido, document || null, phone || null, normalizedEmail]
    );
    const [[row]] = await pool.query("SELECT *, NULL AS properties FROM personas WHERE id = ?", [result.insertId]);
    res.status(201).json(mapOwner({ ...row, properties: null }));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Ya existe una persona con ese email o documento" });
    logger.error('Error al crear propietario', { error: err.message });
    res.status(500).json({ error: "Error al crear propietario" });
  }
});

// PUT /api/owners/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, document } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Faltan campos: name, email" });
  if (!email.includes("@")) return res.status(400).json({ error: "Ingrese un mail válido" });
  const { nombre, apellido } = splitName(name);
  try {
    await pool.query(
      `UPDATE personas SET nombre = ?, apellido = ?, email = ?, telefono = ?, documento_nro = ? WHERE id = ? AND tipo_persona IN ('propietario', 'ambos') AND tenant_id = ?`,
      [nombre, apellido, email, phone || null, document || null, id, req.user.tenantId]
    );
    const [[row]] = await pool.query(
      `SELECT pe.*, GROUP_CONCAT(pr.id ORDER BY pr.id) AS properties
       FROM personas pe LEFT JOIN propiedades pr ON pr.id_propietario = pe.id AND pr.activo = 1 AND pr.tenant_id = ?
       WHERE pe.id = ? AND pe.tenant_id = ? GROUP BY pe.id`,
      [req.user.tenantId, id, req.user.tenantId]
    );
    res.json(mapOwner(row));
  } catch (err) {
    logger.error('Error al actualizar propietario', { error: err.message });
    res.status(500).json({ error: "Error al actualizar propietario" });
  }
});

// DELETE /api/owners/:id
// Cascada: propiedades → contratos → documentos de contratos → documentos de propiedades → persona
router.delete("/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Obtener todas las propiedades activas del propietario
    const [props] = await conn.query(
      "SELECT id FROM propiedades WHERE id_propietario = ? AND activo = 1 AND tenant_id = ?",
      [req.params.id, req.user.tenantId]
    );

    for (const prop of props) {
      // 2. Obtener contratos activos de cada propiedad
      const [contratos] = await conn.query(
        "SELECT id FROM contratos WHERE propiedad_id = ?",
        [prop.id]
      );

      for (const contrato of contratos) {
        // 3. Eliminar documentos del contrato
        await conn.query(
          "DELETE FROM documentos WHERE entity_type = 'lease' AND entity_id = ?",
          [contrato.id]
        );
      }

      // 4. Eliminar todos los contratos de la propiedad
      await conn.query("DELETE FROM contratos WHERE propiedad_id = ?", [prop.id]);

      // 5. Eliminar documentos de la propiedad
      await conn.query(
        "DELETE FROM documentos WHERE entity_type = 'property' AND entity_id = ?",
        [prop.id]
      );
    }

    // 6. Dar de baja todas las propiedades del propietario
    if (props.length > 0) {
      await conn.query(
        "UPDATE propiedades SET activo = 0 WHERE id_propietario = ?",
        [req.params.id]
      );
    }

    // 7. Dar de baja al propietario
    await conn.query("UPDATE personas SET activo = 0 WHERE id = ? AND tenant_id = ?", [req.params.id, req.user.tenantId]);

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    logger.error('Error al eliminar propietario', { error: err.message });
    res.status(500).json({ error: "Error al eliminar propietario" });
  } finally {
    conn.release();
  }
});

export default router;