import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import pino from 'pino';
import pinoHttp from 'pino-http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const MODULE_CONFIG = {
  delivery: { key: 'delivery', file: path.resolve(__dirname, 'portfolio-metrics.json') },
  sales: { key: 'sales', file: path.resolve(__dirname, 'sales-metrics.json') },
  ai: { key: 'ai', file: path.resolve(__dirname, 'ai-subscriptions.json') },
  notes: { key: 'notes', file: path.resolve(__dirname, 'notes.json') }
};

const logger = pino({
  level: LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      '*.password',
      '*.token',
      '*.secret'
    ],
    censor: '[REDACTED]'
  }
});

if (!process.env.NEON_DATABASE_URL) {
  logger.error('NEON_DATABASE_URL no definido');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

const app = express();
app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    }
  })
);
app.use(cors());
app.use(express.json({ limit: '1mb' }));

async function ensureTable() {
  const client = await pool.connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS delivery_state (
        key text PRIMARY KEY,
        payload jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`
    );
  } finally {
    client.release();
  }
}

async function getStoredState(key) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT payload FROM delivery_state WHERE key = $1', [key]);
    return result.rows[0]?.payload || null;
  } finally {
    client.release();
  }
}

async function upsertState(key, payload) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO delivery_state (key, payload, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`,
      [key, payload]
    );
    const rows = await client.query('SELECT payload FROM delivery_state WHERE key = $1', [key]);
    return rows[0]?.payload || payload;
  } finally {
    client.release();
  }
}

async function readDefaultMetrics(filePath) {
  const buffer = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(buffer);
}

function resolveModuleConfig(moduleName) {
  return MODULE_CONFIG[moduleName] || null;
}

app.get('/api/:module', async (req, res) => {
  const moduleConfig = resolveModuleConfig(req.params.module);
  if (!moduleConfig) return res.status(404).json({ error: 'Módulo no soportado' });
  try {
    await ensureTable();
    let payload = await getStoredState(moduleConfig.key);
    if (!payload) {
      payload = await readDefaultMetrics(moduleConfig.file);
      await upsertState(moduleConfig.key, payload);
    }
    res.json(payload);
  } catch (error) {
    req.log.error({ err: error, module: req.params.module }, 'GET module failed');
    res.status(500).json({ error: 'No se pudo leer la data' });
  }
});

app.put('/api/:module', async (req, res) => {
  const moduleConfig = resolveModuleConfig(req.params.module);
  if (!moduleConfig) return res.status(404).json({ error: 'Módulo no soportado' });
  try {
    await ensureTable();
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Payload inválido' });
    }
    const saved = await upsertState(moduleConfig.key, payload);
    res.json(saved);
  } catch (error) {
    req.log.error({ err: error, module: req.params.module }, 'PUT module failed');
    res.status(500).json({ error: 'No se pudo guardar la data' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Portfolio API listening');
});
