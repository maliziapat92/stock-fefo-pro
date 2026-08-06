import { query } from '../models/db.js';

// Récupérer tous les produits (triés FEFO par date d'expiration)
export const getProducts = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM products ORDER BY expiry_date ASC'
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Ajouter un produit
export const createProduct = async (req, res) => {
  try {
    const { name, quantity, expiry_date } = req.body;

    const result = await query(
      `INSERT INTO products 
      (name, quantity, expiry_date)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [
        name,
        quantity,
        expiry_date
      ]
    );

    res.status(201).json({
      message: "Produit ajouté avec succès",
      product: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Modifier la quantité d'un produit
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const result = await query(
      'UPDATE products SET quantity = $1 WHERE id = $2 RETURNING *',
      [
        quantity,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Supprimer un produit
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    res.json({
      message: "Produit supprimé avec succès",
      product: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
