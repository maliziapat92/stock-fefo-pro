import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_4qGTHdpbUj3C@ep-flat-silence-aypdk8k9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

async function createProductsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        quantite INT NOT NULL,
        prix DECIMAL(10, 2) NOT NULL,
        date_fabrication DATE,
        date_expiration DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'products' créée avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("Erreur :", err);
    process.exit(1);
  }
}

createProductsTable();
