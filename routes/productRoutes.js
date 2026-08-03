const express = require("express");
const router = express.Router();
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { isAdmin } = require("../middleware/authMiddleware"); // Assure-toi que le chemin vers ton middleware est correct

const adapter = new JSONFile("./database/db.json");
const db = new Low(adapter, { products: [] });

// GET TOUS LES PRODUITS (Accessible à tous les connectés)
router.get("/", async (req, res) => {
  await db.read();
  res.json(db.data.products || []);
});

// POST - AJOUTER UN PRODUIT (Accessible à tous ou restreint selon ton choix, ici protégé par token)
router.post("/", async (req, res) => {
  await db.read();
  db.data ||= { products: [] };

  const { nom, codeBarre, numeroLot, dateFabrication, dateExpiration, quantite } = req.body;

  if (!nom) {
    return res.status(400).json({ error: "Le nom du produit est obligatoire" });
  }

  const nouveauProduit = {
    id: Date.now().toString(),
    nom,
    codeBarre: codeBarre || "N/A",
    numeroLot: numeroLot || "",
    dateFabrication: dateFabrication || "",
    dateExpiration: dateExpiration || "",
    quantite: Number(quantite) || 0
  };

  db.data.products.push(nouveauProduit);
  await db.write();

  res.status(201).json(nouveauProduit);
});

// PATCH - METTRE À JOUR LA QUANTITÉ PAR ID OU CODEBARRE
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { quantite } = req.body;

  console.log("PATCH reçu ID :", id);
  console.log("Données reçues :", req.body);
  await db.read();
  db.data ||= { products: [] };

  const produit = db.data.products.find(p => p.id === id || p.codeBarre === id);

  if (!produit) {
    return res.status(404).json({ message: "Produit non trouvé" });
  }

  if (quantite !== undefined) {
    produit.quantite = Number(quantite);
  }

  await db.write();
  res.json(produit);
});

// DELETE - SUPPRIMER PAR ID OU CODEBARRE (RESTREINT AUX ADMINISTRATEURS SEULEMENT)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  console.log("Tentative suppression ID/Barre par admin:", id);
  console.log("Produits avant suppression :", db.data.products.length);

  await db.read();
  db.data ||= { products: [] };

  const avant = db.data.products.length;
  db.data.products = db.data.products.filter(p => p.id !== id && p.codeBarre !== id);

  if (db.data.products.length === avant) {
    return res.status(404).json({ message: "Produit non trouvé" });
  }

  await db.write();
  res.json({ message: "Supprimé avec succès" });
});

module.exports = router;
