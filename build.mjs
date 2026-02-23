import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectsRoot = path.resolve(__dirname, '../..');

const repos = [
  { slug: 'boxmagic-saas',          path: 'clients/boxmagic-saas-v0.5.10' },
  { slug: 'cabanas-mvp',            path: 'clients/cabanas-mvp-v0.1.0' },
  { slug: 'pjud-webscrapping',      path: 'clients/pjud-webscrapping-v0.0.1' },
  { slug: 'contavirtual',           path: 'core/contavirtual-v1.0.0' },
  { slug: 'inventario-web-barcode', path: 'clients/inventario-web-barcode-v0.1.13' },
  { slug: 'fec',                    path: 'core/fec' },
  { slug: 'dieto',                  path: 'core/dieto-v0.1.0' },
  { slug: 'asistenciadeudores-cl',  path: 'clients/asistenciadeudores-cl-v0.1.0' },
  { slug: 'tempo-generador-pdf',    path: 'clients/tempo-generador-pdf-v0.1.0' },
  { slug: 'agentcockpit',           path: 'labs/agentcockpit' },
  { slug: 'deploy-notifier',        path: 'labs/deploy-notifier-v0.1.0' },
  { slug: 'pokemon-web',            path: 'labs/pokemon-web-v0.1.0' },
  { slug: 'jorellana',              path: 'labs/jorellana-v0.2.0' },
  { slug: 'passbolt-repo',          path: 'core/passbolt-repo-v0.1.0' },
  { slug: 'context-first-arch',     path: 'labs/context-first-arch' },
];

async function loadMetrics(repo) {
  const metricsPath = path.join(projectsRoot, repo.path, 'metrics.json');
  const raw = await readFile(metricsPath, 'utf8');
  const parsed = JSON.parse(raw);
  return { ...parsed, repo_path: repo.path };
}

function summarize(items) {
  const knownProgress = items
    .map((item) => item.progress_percent)
    .filter((value) => typeof value === 'number');

  const byPriority = items.reduce((acc, item) => {
    acc[item.priority] = (acc[item.priority] ?? 0) + 1;
    return acc;
  }, {});

  const byStatus = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  const avg = knownProgress.length
    ? Number((knownProgress.reduce((a, b) => a + b, 0) / knownProgress.length).toFixed(2))
    : null;

  return {
    total_projects: items.length,
    projects_with_progress: knownProgress.length,
    projects_without_progress: items.length - knownProgress.length,
    average_progress_known_only: avg,
    by_priority: byPriority,
    by_status: byStatus
  };
}

const items = await Promise.all(repos.map(loadMetrics));
items.sort((a, b) => Number(a.project_id) - Number(b.project_id));

const payload = {
  generated_at: new Date().toISOString(),
  schema_version: '1.0.0',
  summary: summarize(items),
  projects: items
};

const outputPath = path.join(__dirname, 'portfolio-metrics.json');
await writeFile(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log(`Generated ${outputPath} with ${items.length} projects.`);
