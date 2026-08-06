import express from "express";
import { query } from "../models/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const totalProduits = await query(
      "SELECT COUNT(*) FROM products"
    );

    const stockTotal = await query(
      "SELECT COALESCE(SUM(quantity),0) FROM products"
    );

    const produitsExpires = await query(
      "SELECT COUNT(*) FROM products WHERE expiry_date < CURRENT_DATE"
    );

    const produitsUrgents = await query(
      `SELECT COUNT(*) FROM products 
       WHERE expiry_date >= CURRENT_DATE 
       AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'`
    );

    const totalLots = await query(
      "SELECT COUNT(DISTINCT lot_number) FROM products"
    );

    res.json({
      totalProduits: Number(totalProduits.rows[0].count),
      stockTotal: Number(stockTotal.rows[0].coalesce || stockTotal.rows[0].sum || 0),
      produitsExpires: Number(produitsExpires.rows[0].count),
      produitsUrgents: Number(produitsUrgents.rows[0].count),
      totalLots: Number(totalLots.rows[0].count),
      mouvements: 0
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      error: "Erreur dashboard"
    });
  }
});

export default router;
