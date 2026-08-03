const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const lotRoutes = require("./routes/lotRoutes");
const alertRoutes = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const locationRoutes = require("./routes/locationRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const damageRoutes = require("./routes/damageRoutes");
const historyRoutes = require("./routes/historyRoutes");
const reportRoutes = require("./routes/reportRoutes");

const importExportRoutes = require("./routes/importExportRoutes");
const backupRoutes = require("./routes/backupRoutes");
const roleRoutes = require("./routes/roleRoutes");
const settingRoutes = require("./routes/settingRoutes");
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/lots", lotRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/damages", damageRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", importExportRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/settings", settingRoutes);

// lowdb will be dynamically imported because it's an ES module
let Low;
let JSONFile;
let db;

// Initialisation base
async function initDB() {
  // dynamic import to avoid ERR_REQUIRE_ESM when running in CommonJS
  const lowdb = await import('lowdb');
  const lowdbNode = await import('lowdb/node');
  Low = lowdb.Low;
  JSONFile = lowdbNode.JSONFile;

  const adapter = new JSONFile("./database/db.json");
  
  // Provide default data to avoid "missing default data" error
  db = new Low(adapter, {
    users: [],
    products: [],
    lots: [],
    stocks: [],
    damages: [],
    alerts: [],
    movements: [],
    history: [],
    reports: []
  });

  await db.read();

  db.data ||= {
    users: [],
    products: [],
    lots: [],
    stocks: [],
    damages: [],
    alerts: [],
    movements: [],
    history: [],
    reports: []
  };

  await db.write();
}

app.get("/", (req, res) => {
  res.json({
    message: "Stock FEFO Pro API fonctionne",
    version: "1.0.0"
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "API Stock FEFO Pro",
    status: "running"
  });
});

app.get("/api/status", async (req, res) => {
  await db.read();

  res.json({
    status: "OK",
    produits: db.data.products.length,
    utilisateurs: db.data.users.length
  });
});

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  console.log("✅ Base JSON connectée");

  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    });
  }
});

module.exports = app;
