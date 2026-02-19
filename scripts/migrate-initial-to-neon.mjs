import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL o NEON_DATABASE_URL no definido');
  process.exit(1);
}

const modules = [
  ['delivery', 'portfolio-metrics.json'],
  ['sales', 'sales-metrics.json'],
  ['ai', 'ai-subscriptions.json'],
  ['notes', 'notes.json']
];

async function run() {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS delivery_state (
        key text PRIMARY KEY,
        payload jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`
    );

    for (const [key, file] of modules) {
      const payload = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
      await client.query(
        `INSERT INTO delivery_state (key, payload, updated_at)
         VALUES ($1, $2::jsonb, now())
         ON CONFLICT (key)
         DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`,
        [key, payload]
      );
    }

    const { rows } = await client.query(
      `SELECT key, jsonb_typeof(payload) AS type, updated_at
       FROM delivery_state
       WHERE key IN ('delivery', 'sales', 'ai', 'notes')
       ORDER BY key`
    );
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
