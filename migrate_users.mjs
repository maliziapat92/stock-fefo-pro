import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_4qGTHdpbUj3C@ep-flat-silence-aypdk8k9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

async function createUsersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'users' créée avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("Erreur :", err);
    process.exit(1);
  }
}

createUsersTable();
