// Runs every .sql file in src/config/migrations (in name order) against your database.
// Safe to run more than once. Usage: npm run db:migrate
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function migrate() {
  const dir = path.join(__dirname, '..', 'src', 'config', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  const client = await pool.connect();

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`${file}: ${err.message}`);
      }
    }
    console.log('Migration finished.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();