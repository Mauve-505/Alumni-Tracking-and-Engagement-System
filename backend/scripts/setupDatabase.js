const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function setupDatabase() {
  const schemaPath = path.join(__dirname, '..', 'src', 'config', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(schema);
    await client.query('COMMIT');
    console.log('Database schema created successfully.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Database setup failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(async (err) => {
  console.error('Database setup failed:', err.message);
  process.exitCode = 1;
  await pool.end();
});