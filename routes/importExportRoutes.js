import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { query } from '../models/db.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Import CSV
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    fs.unlinkSync(req.file.path); // supprimer le fichier temporaire

    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

    let addedCount = 0;

    // On saute la première ligne (en-tête)
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length < 2) continue;

      const name = parts[0].trim();
      const quantity = parseInt(parts[1]) || 0;
      const expiry_date = parts[2]?.trim() || null;
      const lot_number = parts[3]?.trim() || null;
      const barcode = parts[4]?.trim() || null;

      if (!name) continue;

      await query(
        `INSERT INTO products (name, quantity, expiry_date, lot_number, barcode)
         VALUES ($1, $2, $3, $4, $5)`,
        [name, quantity, expiry_date, lot_number, barcode]
      );

      addedCount++;
    }

    res.json({
      message: 'Import CSV réussi',
      productsAdded: addedCount
    });

  } catch (error) {
    console.error('Erreur import CSV:', error);
    res.status(500).json({ message: 'Erreur lors de l\'import' });
  }
});

export default router;
