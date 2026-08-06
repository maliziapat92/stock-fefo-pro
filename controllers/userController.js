import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../models/db.js';

const SECRET = "stock_fefo_secret_2026";

export async function register(req, res) {
  try {
    const { nom, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExist = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    const hash = await bcrypt.hash(password, 10);
    const userRole = role || 'user';

    // Insérer dans PostgreSQL
    const result = await query(
      'INSERT INTO users (nom, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, nom, email, role',
      [nom, email, hash, userRole]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "Utilisateur créé",
      user: {
        id: user.id,
        nom: user.nom,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        nom: user.nom,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
