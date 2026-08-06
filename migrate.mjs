import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_4qGTHdpbUj3C@ep-flat-silence-aypdk8k9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'products' créée avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors de la création de la table :", err);
    process.exit(1);
  }
}

createTable();
