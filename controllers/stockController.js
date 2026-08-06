const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const createProduct = require("../models/Product");

const adapter = new FileSync("./database/db.json");
const db = low(adapter);

db.defaults({ products: [] }).write();

// Ajouter un produit
function addProduct(req, res) {
  const product = createProduct(req.body);
  db.get("products").push(product).write();

  res.json({
    message: "Produit ajouté",
    product
  });
}

// Voir tous les produits
function getProducts(req, res) {
  res.json(db.get("products").value());
}

// Rechercher un produit
function searchProduct(req, res) {
  const { search } = req.query;

  const result = db.get("products")
    .filter(product =>
      product.nom.toLowerCase().includes(search.toLowerCase()) ||
      product.codeBarre === search ||
      product.numeroLot === search
    )
    .value();

  res.json(result);
}

// Supprimer un produit
function deleteProduct(req, res) {
  const idOrBarcode = req.params.id;

  db.get("products")
    .remove(product => product.id !== idOrBarcode && product.codeBarre !== idOrBarcode)
    .write();

  res.json({
    message: "Produit supprimé"
  });
}

module.exports = {
  addProduct,
  getProducts,
  searchProduct,
  deleteProduct
};
