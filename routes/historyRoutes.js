import express from 'express';
import { query } from '../models/db.js';

const router = express.Router();

// Récupérer l'historique
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM history ORDER BY created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Ajouter une entrée d'historique
router.post('/', async (req, res) => {
  try {
    const { product_name, action, quantity, note } = req.body;

    const result = await query(
      `INSERT INTO history (product_name, action, quantity, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product_name, action, quantity || 0, note || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
