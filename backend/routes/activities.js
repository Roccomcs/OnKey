// backend/routes/activities.js
// Rutas para registrar y obtener actividades del usuario

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { pool } from '../db.js';

const router = express.Router();

// ─── REGISTRAR ACTIVIDAD ──────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { id: userId, tenantId } = req.user;
    const { type, title, description, relatedId, relatedType } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: 'type y title son requeridos' });
    }

    const [result] = await pool.query(
      `INSERT INTO activities (userId, tenant_id, type, title, description, relatedId, relatedType)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, tenantId, type, title, description || null, relatedId || null, relatedType || null]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('[POST /activities]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── OBTENER ACTIVIDADES DEL USUARIO ──────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { id: userId, tenantId } = req.user;
    const limit = parseInt(req.query.limit) || 50;

    const [activities] = await pool.query(
      `SELECT id, type, title, description, relatedId, relatedType, createdAt
       FROM activities
       WHERE userId = ? AND (tenant_id = ? OR tenant_id IS NULL)
       ORDER BY createdAt DESC
       LIMIT ?`,
      [userId, tenantId, limit]
    );

    res.json(activities);
  } catch (err) {
    console.error('[GET /activities]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
