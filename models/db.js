import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_4qGTHdpbUj3C@ep-flat-silence-aypdk8k9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Erreur de requête SQL :', error.message);
    throw error;
  }
};

