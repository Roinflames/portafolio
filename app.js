const runtimeConfig = window.__PORTFOLIO_CONFIG__ || {};
const defaultRemoteServiceBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:3101'
  : 'https://portafolio-2dy0.onrender.com';
const REMOTE_SERVICE_BASE = runtimeConfig.remoteServiceBase || defaultRemoteServiceBase;
const REMOTE_DELIVERY_API = `${REMOTE_SERVICE_BASE}/api/delivery`;
const REMOTE_SALES_API = `${REMOTE_SERVICE_BASE}/api/sales`;
const REMOTE_AI_API = `${REMOTE_SERVICE_BASE}/api/ai`;
const REMOTE_NOTES_API = `${REMOTE_SERVICE_BASE}/api/notes`;
const LOCAL_METRICS_FILE = './portfolio-metrics.json';
const LOCAL_SALES_FILE = './sales-metrics.json';
const LOCAL_AI_FILE = './ai-subscriptions.json';
const LOCAL_NOTES_FILE = './notes.json';
const LEGACY_SALES_STORAGE_KEY = 'portfolio_metrics_sales_v1';
const LEGACY_AI_STORAGE_KEY = 'portfolio_metrics_ai_subscriptions_v1';
const LEGACY_DELIVERY_STORAGE_KEY = 'portfolio_metrics_delivery_v1';
const LEGACY_NOTES_STORAGE_KEY = 'portfolio_metrics_notes_v1';

const state = {
  metrics: null,
  deliverySeed: null,
  delivery: null,
  sales: {
    opportunities: [],
    summary: {
      period: 'editable',
      new_leads: 0,
      qualified_leads: 0,
      open_opportunities: 0,
      won_deals: 0,
      lost_deals: 0,
      pipeline_amount_clp: 0,
      won_amount_clp: 0,
      conversion_rate_percent: 0,
      cpa_clp: 0
    }
  },
  salesSeed: null,
  salesEditIndex: null,
  ai: null,
  aiSeed: null,
  aiEditIndex: null,
  plantiwuis: null,
  plantiwuisKpis: null,
  community: null,
  salesPeriods: [],
  salesPeriodIndex: 0,
  priorityFilter: 'ALL',
  stageFilter: 'ALL',
  aiStatusFilter: 'ALL',
  salesSortField: 'account',
  salesSortDirection: 'asc',
  salesPage: 1,
  salesPageSize: 5,
  periodPanelHidden: false,
  contextMode: 'community',
  tab: 'overview',
  notesSeed: null,
  notes: {
    generated_at: null,
    notes: []
  },
  notesFilters: {
    project: 'ALL',
    status: 'ALL'
  },
  notesNextId: 1,
  deliveryLinkEditIndex: null,
  deliveryInlineEdit: {
    index: null,
    field: null
  }
};

const generatedAtEl = document.getElementById('generatedAt');
const globalKpisEl = document.getElementById('globalKpis');
const overviewCardsEl = document.getElementById('overviewCards');
const deliveryRowsEl = document.getElementById('deliveryRows');
const salesRowsEl = document.getElementById('salesRows');
const salesKpisEl = document.getElementById('salesKpis');
const aiRowsEl = document.getElementById('aiRows');
const aiKpisEl = document.getElementById('aiKpis');
const communitySummaryEl = document.getElementById('communitySummary');
const eventListEl = document.getElementById('eventList');
const incidentListEl = document.getElementById('incidentList');
const priorityFilterEl = document.getElementById('priorityFilter');
const stageFilterEl = document.getElementById('stageFilter');
const aiStatusFilterEl = document.getElementById('aiStatusFilter');
const contextToggleEl = document.getElementById('contextToggle');
const contextDetailEl = document.getElementById('contextDetail');
const salesPeriodSelectEl = document.getElementById('salesPeriodSelect');
const periodKpisEl = document.getElementById('periodKpis');
const periodRowsEl = document.getElementById('periodRows');
const kpiDetailPanel = document.getElementById('kpiDetailPanel');
const kpiDetailText = document.getElementById('kpiDetailText');
const deliveryConsoleRowsEl = document.getElementById('deliveryConsoleRows');
const persistNoticeEl = document.getElementById('persistNotice');
const persistNoticeTitleEl = document.getElementById('persistNoticeTitle');
const persistNoticeMessageEl = document.getElementById('persistNoticeMessage');
let persistNoticeTimer = null;

const salesFormEl = document.getElementById('salesForm');
const saleAccountEl = document.getElementById('saleAccount');
const saleProductEl = document.getElementById('saleProduct');
const saleStageEl = document.getElementById('saleStage');
const saleAmountEl = document.getElementById('saleAmount');
const saleProbabilityEl = document.getElementById('saleProbability');
const saleCloseDateEl = document.getElementById('saleCloseDate');
const saleOwnerEl = document.getElementById('saleOwner');
const salesSaveBtnEl = document.getElementById('salesSaveBtn');
const salesCancelEditBtnEl = document.getElementById('salesCancelEditBtn');
const salesNewBtnEl = document.getElementById('salesNewBtn');
const salesResetBtnEl = document.getElementById('salesResetBtn');
const salesRestoreBtnEl = document.getElementById('salesRestoreBtn');
const salesSortFieldEl = document.getElementById('salesSortField');
const salesSortDirectionBtnEl = document.getElementById('salesSortDirectionBtn');
const salesPageSizeEl = document.getElementById('salesPageSize');
const salesPrevPageBtn = document.getElementById('salesPrevPage');
const salesNextPageBtn = document.getElementById('salesNextPage');
const salesPageInfoEl = document.getElementById('salesPageInfo');
const salesMoreBtnEl = document.getElementById('salesMoreBtn');
const salesMoreMenuEl = document.getElementById('salesMoreMenu');
const salesPeriodToggleEl = document.getElementById('salesPeriodToggle');
const salesPeriodPanelEl = document.getElementById('salesPeriodPanel');

const aiFormEl = document.getElementById('aiForm');
const aiCustomerEl = document.getElementById('aiCustomer');
const aiPlanEl = document.getElementById('aiPlan');
const aiBillingCycleEl = document.getElementById('aiBillingCycle');
const aiPriceEl = document.getElementById('aiPrice');
const aiQuotaTokensEl = document.getElementById('aiQuotaTokens');
const aiUsedTokensEl = document.getElementById('aiUsedTokens');
const aiQuotaRequestsEl = document.getElementById('aiQuotaRequests');
const aiUsedRequestsEl = document.getElementById('aiUsedRequests');
const aiRenewDateEl = document.getElementById('aiRenewDate');
const aiStatusEl = document.getElementById('aiStatus');
const aiSaveBtnEl = document.getElementById('aiSaveBtn');
const aiCancelEditBtnEl = document.getElementById('aiCancelEditBtn');
const aiNewBtnEl = document.getElementById('aiNewBtn');
const aiResetBtnEl = document.getElementById('aiResetBtn');
const aiRestoreBtnEl = document.getElementById('aiRestoreBtn');
const salesExportBtnEl = document.getElementById('salesExportBtn');
const salesImportBtnEl = document.getElementById('salesImportBtn');
const salesImportInputEl = document.getElementById('salesImportInput');
const deliveryExportBtnEl = document.getElementById('deliveryExportBtn');
const deliveryImportBtnEl = document.getElementById('deliveryImportBtn');
const deliveryImportInputEl = document.getElementById('deliveryImportInput');
const aiExportBtnEl = document.getElementById('aiExportBtn');
const aiImportBtnEl = document.getElementById('aiImportBtn');
const aiImportInputEl = document.getElementById('aiImportInput');
const notesGridEl = document.getElementById('notesGrid');
const notesFormEl = document.getElementById('notesForm');
const notesProjectEl = document.getElementById('notesProject');
const notesTitleEl = document.getElementById('notesTitle');
const notesDescriptionEl = document.getElementById('notesDescription');
const notesStatusEl = document.getElementById('notesStatus');
const notesProjectFilterEl = document.getElementById('notesProjectFilter');
const notesStatusFilterEl = document.getElementById('notesStatusFilter');
const notesSaveBtnEl = document.getElementById('notesSaveBtn');
const notesClearBtnEl = document.getElementById('notesClearBtn');
const deliveryFormEl = document.getElementById('deliveryForm');
const deliveryIdEl = document.getElementById('deliveryId');
const deliverySlugEl = document.getElementById('deliverySlug');
const deliveryGroupEl = document.getElementById('deliveryGroup');
const deliveryPriorityEl = document.getElementById('deliveryPriority');
const deliveryProgressEl = document.getElementById('deliveryProgress');
const deliveryStatusEl = document.getElementById('deliveryStatus');
const deliveryVersionEl = document.getElementById('deliveryVersion');
const deliveryBlockerEl = document.getElementById('deliveryBlocker');
const deliveryFrontendUrlEl = document.getElementById('deliveryFrontendUrl');
const deliveryBackendUrlEl = document.getElementById('deliveryBackendUrl');
const deliveryDatabaseUrlEl = document.getElementById('deliveryDatabaseUrl');
const deliveryGithubUrlEl = document.getElementById('deliveryGithubUrl');
const deliverySaveBtnEl = document.getElementById('deliverySaveBtn');
const deliveryCancelBtnEl = document.getElementById('deliveryCancelBtn');
const deliveryNewBtnEl = document.getElementById('deliveryNewBtn');
const deliveryResetBtnEl = document.getElementById('deliveryResetBtn');
const deliveryRestoreBtnEl = document.getElementById('deliveryRestoreBtn');

function resolveProjectGithubUrl(item) {
  if (item.github_url) return item.github_url;
  if (item.repo_path) return `https://github.com/rreyes/${item.repo_path}`;
  return null;
}

function getProjectLinks(item) {
  return {
    frontend: item.frontend_url || item.service_url || '',
    backend: item.backend_url || '',
    database: item.database_url || '',
    github: resolveProjectGithubUrl(item) || ''
  };
}

function renderSingleProjectLink(label, url, iconCode) {
  return `<span class="quick-link-item"><span class="link-kind-icon icon" aria-hidden="true">${iconCode}</span><a class="quick-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a><button class="btn btn-small btn-ghost" type="button" data-copy-url="${url}"><span class="icon" aria-hidden="true">&#128203;</span>Copiar</button></span>`;
}

function renderProjectLinks(item) {
  const links = getProjectLinks(item);
  const chips = [];
  if (links.frontend) chips.push(renderSingleProjectLink('Front', links.frontend, '&#127760;'));
  if (links.backend) chips.push(renderSingleProjectLink('Back', links.backend, '&#9881;'));
  if (links.database) chips.push(renderSingleProjectLink('DB', links.database, '&#128451;'));
  if (links.github) chips.push(renderSingleProjectLink('GitHub', links.github, '&#128187;'));
  return chips.join(' ') || '—';
}

async function copyText(text) {
  if (!text) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // fallback below
  }

  const input = document.createElement('textarea');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}

function showPersistNotice(type, message) {
  if (!persistNoticeEl || !persistNoticeTitleEl || !persistNoticeMessageEl) return;
  const isError = type === 'error';
  persistNoticeEl.hidden = false;
  persistNoticeEl.classList.add('is-visible');
  persistNoticeEl.classList.toggle('is-error', isError);
  persistNoticeTitleEl.textContent = isError ? 'No se pudo guardar' : 'Cambio persistido';
  persistNoticeMessageEl.textContent = message;
  if (persistNoticeTimer) clearTimeout(persistNoticeTimer);
  persistNoticeTimer = setTimeout(() => {
    persistNoticeEl.classList.remove('is-visible');
    persistNoticeEl.classList.remove('is-error');
    persistNoticeEl.hidden = true;
  }, 1800);
}

function validateLinkValue(value, label) {
  if (!value) return true;
  if (label === 'DB URL') return true;
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    throw new Error(`${label} debe comenzar con http(s)`);
  }
  return true;
}

function saveInlineDeliveryLinks(index, row, closeEditor) {
  const project = state.delivery.projects[index];
  if (!project || !row) return false;
  const frontendInput = row.querySelector('input[data-link-field="frontend_url"]');
  const backendInput = row.querySelector('input[data-link-field="backend_url"]');
  const databaseInput = row.querySelector('input[data-link-field="database_url"]');
  const githubInput = row.querySelector('input[data-link-field="github_url"]');
  if (!frontendInput || !backendInput || !databaseInput || !githubInput) return false;

  const frontendUrl = frontendInput.value.trim();
  const backendUrl = backendInput.value.trim();
  const databaseUrl = databaseInput.value.trim();
  const githubUrl = githubInput.value.trim();

  try {
    validateLinkValue(frontendUrl, 'Front URL');
    validateLinkValue(backendUrl, 'Back URL');
    validateLinkValue(databaseUrl, 'DB URL');
    validateLinkValue(githubUrl, 'GitHub URL');
  } catch (error) {
    alert(error.message);
    return false;
  }

  project.frontend_url = frontendUrl;
  project.backend_url = backendUrl;
  project.database_url = databaseUrl;
  project.service_url = frontendUrl;
  project.github_url = githubUrl;
  project.last_update = new Date().toISOString().slice(0, 10);
  persistDeliveryData();
  renderGeneratedAt();

  if (closeEditor) {
    state.deliveryLinkEditIndex = null;
    renderDelivery();
  }
  return true;
}

function openInlineDeliveryNumber(index, field) {
  state.deliveryInlineEdit = { index, field };
  renderDelivery();
}

function closeInlineDeliveryNumber() {
  state.deliveryInlineEdit = { index: null, field: null };
  renderDelivery();
}

function saveInlineDeliveryNumber(index, row, field, closeEditor) {
  const project = state.delivery.projects[index];
  if (!project || !row) return false;
  const input = row.querySelector(`input[data-delivery-inline-input="${field}"]`);
  if (!input) return false;
  const raw = input.value.trim();

  if (field === 'project_id') {
    const parsed = Number(raw);
    if (!raw || Number.isNaN(parsed) || parsed <= 0) {
      alert('ID inválido');
      return false;
    }
    project.project_id = parsed;
  }

  if (field === 'progress_percent') {
    if (!raw) {
      project.progress_percent = null;
    } else {
      const parsed = Number(raw);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert('Avance debe estar entre 0 y 100');
        return false;
      }
      project.progress_percent = parsed;
    }
  }

  project.last_update = new Date().toISOString().slice(0, 10);
  persistDeliveryData();
  renderGeneratedAt();
  renderGlobalKpis();
  renderOverview();

  if (closeEditor) {
    state.deliveryInlineEdit = { index: null, field: null };
    renderDelivery();
  }
  return true;
}

function clp(value) {
  return new Intl.NumberFormat('es-CL').format(value || 0);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ratio(used, quota) {
  if (!quota || quota <= 0) return 0;
  return used / quota;
}

function percent(value) {
  return `${Number((value * 100).toFixed(1))}%`;
}

async function fetchRemoteData(remoteUrl, fallbackFile, label) {
  try {
    const response = await fetch(remoteUrl);
    if (response.ok) return response.json();
    console.warn(`Render ${label} fetch failed (${response.status}). Falling back to local JSON.`);
  } catch (error) {
    console.warn(`Render ${label} fetch error`, error);
  }

  const fallback = await fetch(fallbackFile);
  if (!fallback.ok) throw new Error(`No se pudo cargar ${fallbackFile}: ${fallback.status}`);
  return fallback.json();
}

async function fetchDeliveryData() {
  return fetchRemoteData(REMOTE_DELIVERY_API, LOCAL_METRICS_FILE, 'delivery');
}

async function fetchSalesData() {
  return fetchRemoteData(REMOTE_SALES_API, LOCAL_SALES_FILE, 'sales');
}

async function fetchAiData() {
  return fetchRemoteData(REMOTE_AI_API, LOCAL_AI_FILE, 'ai');
}

async function fetchNotesData() {
  return fetchRemoteData(REMOTE_NOTES_API, LOCAL_NOTES_FILE, 'notes');
}

async function persistRemoteData(remoteUrl, payload, successMessage, label, options = {}) {
  const { notify = true } = options;
  try {
    const response = await fetch(remoteUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    if (notify) showPersistNotice('success', successMessage);
    return true;
  } catch (error) {
    if (notify) showPersistNotice('error', `${label}: ${error.message}`);
    return false;
  }
}

function readLegacyLocalStorage(key, normalizeFn) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    return normalizeFn(JSON.parse(saved));
  } catch {
    return null;
  }
}

function shouldMigrateLegacyData(legacyData, remoteData, seedData, arrayField) {
  if (!legacyData) return false;
  const legacyItems = Array.isArray(legacyData[arrayField]) ? legacyData[arrayField] : [];
  const remoteItems = Array.isArray(remoteData[arrayField]) ? remoteData[arrayField] : [];
  const seedItems = Array.isArray(seedData[arrayField]) ? seedData[arrayField] : [];
  if (!legacyItems.length) return false;
  if (!remoteItems.length) return true;

  const remoteLooksLikeSeed = JSON.stringify(remoteItems) === JSON.stringify(seedItems);
  const legacyDiffersFromSeed = JSON.stringify(legacyItems) !== JSON.stringify(seedItems);
  return remoteLooksLikeSeed && legacyDiffersFromSeed;
}

function downloadJSON(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      callback(payload);
    } catch (error) {
      alert('JSON inválido');
    }
  };
  reader.onerror = () => {
    alert('No se pudo leer el archivo');
  };
  reader.readAsText(file);
}

function computeSalesSummary(opportunities) {
  const openStages = ['lead', 'qualified', 'proposal', 'negotiation'];
  const summary = {
    period: 'editable',
    new_leads: 0,
    qualified_leads: 0,
    open_opportunities: 0,
    won_deals: 0,
    lost_deals: 0,
    pipeline_amount_clp: 0,
    won_amount_clp: 0,
    conversion_rate_percent: 0
  };

  for (const item of opportunities) {
    const stage = item.stage;
    const amount = Number(item.amount_clp) || 0;

    if (stage === 'lead') summary.new_leads += 1;
    if (stage === 'qualified') summary.qualified_leads += 1;
    if (openStages.includes(stage)) {
      summary.open_opportunities += 1;
      summary.pipeline_amount_clp += amount;
    }
    if (stage === 'won') {
      summary.won_deals += 1;
      summary.won_amount_clp += amount;
    }
    if (stage === 'lost') summary.lost_deals += 1;
  }

  const closed = summary.won_deals + summary.lost_deals;
  summary.conversion_rate_percent = closed > 0
    ? Number(((summary.won_deals / closed) * 100).toFixed(2))
    : 0;

  summary.cpa_clp = Math.round(summary.pipeline_amount_clp / Math.max(1, summary.won_deals + summary.open_opportunities));

  return summary;
}

function computeDeliverySummary(projects) {
  const progressEntries = projects.filter((item) => typeof item.progress_percent === 'number');
  const progressSum = progressEntries.reduce((acc, item) => acc + item.progress_percent, 0);
  const byPriority = {};
  const byStatus = {};

  projects.forEach((item) => {
    const priority = item.priority || 'P1';
    byPriority[priority] = (byPriority[priority] || 0) + 1;
    const status = item.status || 'unknown';
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  return {
    total_projects: projects.length,
    projects_with_progress: progressEntries.length,
    projects_without_progress: projects.length - progressEntries.length,
    average_progress_known_only: progressEntries.length ? Number((progressSum / progressEntries.length).toFixed(2)) : 0,
    by_priority: byPriority,
    by_status: byStatus
  };
}

function computeAiSummary(subscriptions) {
  let active_subscriptions = 0;
  let past_due_subscriptions = 0;
  let canceled_subscriptions = 0;
  let monthly_recurring_revenue_clp = 0;
  let over_quota_subscriptions = 0;
  let total_tokens_quota = 0;
  let total_tokens_used = 0;
  let total_requests_quota = 0;
  let total_requests_used = 0;
  let utilization_acc = 0;

  for (const item of subscriptions) {
    const status = item.status;
    const cycle = item.billing_cycle;
    const price = Number(item.price_clp) || 0;
    const quotaTokens = Number(item.quota_tokens) || 0;
    const usedTokens = Number(item.used_tokens) || 0;
    const quotaRequests = Number(item.quota_requests) || 0;
    const usedRequests = Number(item.used_requests) || 0;

    if (status === 'active') active_subscriptions += 1;
    if (status === 'past_due') past_due_subscriptions += 1;
    if (status === 'canceled') canceled_subscriptions += 1;

    if (status === 'active') {
      monthly_recurring_revenue_clp += cycle === 'yearly' ? price / 12 : price;
    }

    const tokensRatio = ratio(usedTokens, quotaTokens);
    const requestsRatio = ratio(usedRequests, quotaRequests);
    const maxRatio = Math.max(tokensRatio, requestsRatio);
    utilization_acc += maxRatio;

    if (usedTokens > quotaTokens || usedRequests > quotaRequests) {
      over_quota_subscriptions += 1;
    }

    total_tokens_quota += quotaTokens;
    total_tokens_used += usedTokens;
    total_requests_quota += quotaRequests;
    total_requests_used += usedRequests;
  }

  const count = subscriptions.length || 1;

  return {
    total_subscriptions: subscriptions.length,
    active_subscriptions,
    past_due_subscriptions,
    canceled_subscriptions,
    monthly_recurring_revenue_clp: Math.round(monthly_recurring_revenue_clp),
    over_quota_subscriptions,
    avg_utilization_percent: Number(((utilization_acc / count) * 100).toFixed(2)),
    total_tokens_quota,
    total_tokens_used,
    total_requests_quota,
    total_requests_used
  };
}

function normalizeSalesData(raw) {
  const opportunities = Array.isArray(raw.opportunities) ? raw.opportunities : [];
  return {
    generated_at: raw.generated_at || new Date().toISOString(),
    currency: raw.currency || 'CLP',
    opportunities,
    summary: computeSalesSummary(opportunities)
  };
}

function normalizeDeliveryData(raw) {
  const projects = Array.isArray(raw.projects) ? raw.projects : [];
  return {
    generated_at: raw.generated_at || new Date().toISOString(),
    projects,
    summary: computeDeliverySummary(projects)
  };
}

function loadDeliveryData(base) {
  return normalizeDeliveryData(base);
}

function normalizeAiData(raw) {
  const subscriptions = Array.isArray(raw.subscriptions) ? raw.subscriptions : [];
  return {
    generated_at: raw.generated_at || new Date().toISOString(),
    currency: raw.currency || 'CLP',
    subscriptions,
    summary: computeAiSummary(subscriptions)
  };
}

function persistSalesData() {
  state.sales.generated_at = new Date().toISOString();
  state.sales.summary = computeSalesSummary(state.sales.opportunities);
  persistRemoteData(REMOTE_SALES_API, state.sales, 'Comercial sincronizado con Render.', 'Comercial');
  return true;
}

function persistDeliveryData() {
  state.delivery.generated_at = new Date().toISOString();
  state.delivery.summary = computeDeliverySummary(state.delivery.projects);
  persistRemoteData(REMOTE_DELIVERY_API, state.delivery, 'Delivery sincronizado con Render.', 'Delivery');
  return true;
}

function persistAiData() {
  state.ai.generated_at = new Date().toISOString();
  state.ai.summary = computeAiSummary(state.ai.subscriptions);
  persistRemoteData(REMOTE_AI_API, state.ai, 'IA suscripciones sincronizado con Render.', 'IA');
  return true;
}

function loadSalesData(seedSales) {
  return normalizeSalesData(seedSales);
}

function loadAiData(seedAi) {
  return normalizeAiData(seedAi);
}

function setSalesToZero() {
  state.sales = normalizeSalesData({
    generated_at: new Date().toISOString(),
    currency: 'CLP',
    opportunities: []
  });
  persistSalesData();
  clearSalesForm();
  rerenderAllFromSales();
}

function restoreSalesSeed() {
  state.sales = normalizeSalesData(clone(state.salesSeed));
  persistSalesData();
  clearSalesForm();
  rerenderAllFromSales();
}

function setAiToZero() {
  state.ai = normalizeAiData({
    generated_at: new Date().toISOString(),
    currency: 'CLP',
    subscriptions: []
  });
  persistAiData();
  clearAiForm();
  rerenderAllFromAi();
}

function restoreAiSeed() {
  state.ai = normalizeAiData(clone(state.aiSeed));
  persistAiData();
  clearAiForm();
  rerenderAllFromAi();
}

function fillSalesForm(item) {
  saleAccountEl.value = item.account;
  saleProductEl.value = item.product;
  saleStageEl.value = item.stage;
  saleAmountEl.value = item.amount_clp;
  saleProbabilityEl.value = item.probability_percent;
  saleCloseDateEl.value = item.close_date;
  saleOwnerEl.value = item.owner;
  salesSaveBtnEl.textContent = 'Actualizar';
}

function fillAiForm(item) {
  aiCustomerEl.value = item.customer;
  aiPlanEl.value = item.plan;
  aiBillingCycleEl.value = item.billing_cycle;
  aiPriceEl.value = item.price_clp;
  aiQuotaTokensEl.value = item.quota_tokens;
  aiUsedTokensEl.value = item.used_tokens;
  aiQuotaRequestsEl.value = item.quota_requests;
  aiUsedRequestsEl.value = item.used_requests;
  aiRenewDateEl.value = item.renew_date;
  aiStatusEl.value = item.status;
  aiSaveBtnEl.textContent = 'Actualizar';
}

function clearSalesForm() {
  state.salesEditIndex = null;
  salesFormEl.reset();
  saleStageEl.value = 'lead';
  salesSaveBtnEl.textContent = 'Guardar';
}

function clearAiForm() {
  state.aiEditIndex = null;
  aiFormEl.reset();
  aiBillingCycleEl.value = 'monthly';
  aiStatusEl.value = 'active';
  aiSaveBtnEl.textContent = 'Guardar';
}

function createDeliveryRowFromForm() {
  const id = Number(deliveryIdEl.value);
  const progress = deliveryProgressEl.value ? Number(deliveryProgressEl.value) : null;
  const frontendUrl = deliveryFrontendUrlEl.value.trim();
  const backendUrl = deliveryBackendUrlEl.value.trim();
  const databaseUrl = deliveryDatabaseUrlEl.value.trim();
  const githubUrl = deliveryGithubUrlEl.value.trim();
  if (!deliverySlugEl.value.trim()) throw new Error('Proyecto es obligatorio');
  if (!deliveryGroupEl.value.trim()) throw new Error('Grupo es obligatorio');
  if (Number.isNaN(id) || id <= 0) throw new Error('ID inválido');
  if (progress !== null && (Number.isNaN(progress) || progress < 0 || progress > 100)) throw new Error('Avance debe estar entre 0 y 100');
  if (frontendUrl && !frontendUrl.startsWith('http')) throw new Error('Front URL debe comenzar con http(s)');
  if (backendUrl && !backendUrl.startsWith('http')) throw new Error('Back URL debe comenzar con http(s)');
  if (githubUrl && !githubUrl.startsWith('http')) throw new Error('GitHub URL debe comenzar con http(s)');
  const slug = deliverySlugEl.value.trim();

  return {
    project_id: id,
    project_slug: slug,
    group: deliveryGroupEl.value.trim(),
    priority: deliveryPriorityEl.value,
    progress_percent: progress,
    status: deliveryStatusEl.value.trim() || 'on_track',
    version: deliveryVersionEl.value.trim() || '',
    blocker: deliveryBlockerEl.value.trim() || '',
    frontend_url: frontendUrl || '',
    backend_url: backendUrl || '',
    database_url: databaseUrl || '',
    service_url: frontendUrl || '',
    github_url: githubUrl || '',
    repo_path: slug,
    last_update: new Date().toISOString().slice(0, 10)
  };
}

function fillDeliveryForm(item) {
  deliveryIdEl.value = item.project_id;
  deliverySlugEl.value = item.project_slug;
  deliveryGroupEl.value = item.group;
  deliveryPriorityEl.value = item.priority;
  deliveryProgressEl.value = item.progress_percent ?? '';
  deliveryStatusEl.value = item.status;
  deliveryVersionEl.value = item.version;
  deliveryBlockerEl.value = item.blocker;
  deliveryFrontendUrlEl.value = item.frontend_url || item.service_url || '';
  deliveryBackendUrlEl.value = item.backend_url || '';
  deliveryDatabaseUrlEl.value = item.database_url || '';
  deliveryGithubUrlEl.value = item.github_url || resolveProjectGithubUrl(item) || '';
  deliverySaveBtnEl.textContent = 'Actualizar';
}

function clearDeliveryForm() {
  state.deliveryEditIndex = null;
  deliveryFormEl.reset();
  deliveryPriorityEl.value = 'P1';
  deliverySaveBtnEl.textContent = 'Guardar';
}

function saleFromForm() {
  const amount = Number(saleAmountEl.value);
  const probability = Number(saleProbabilityEl.value);

  if (!saleAccountEl.value.trim()) throw new Error('Cuenta es obligatoria');
  if (!saleProductEl.value.trim()) throw new Error('Producto es obligatorio');
  if (!saleOwnerEl.value.trim()) throw new Error('Owner es obligatorio');
  if (!saleCloseDateEl.value) throw new Error('Fecha de cierre es obligatoria');
  if (Number.isNaN(amount) || amount < 0) throw new Error('Monto inválido');
  if (Number.isNaN(probability) || probability < 0 || probability > 100) throw new Error('Probabilidad inválida (0-100)');

  return {
    account: saleAccountEl.value.trim(),
    product: saleProductEl.value.trim(),
    stage: saleStageEl.value,
    amount_clp: amount,
    probability_percent: probability,
    close_date: saleCloseDateEl.value,
    owner: saleOwnerEl.value.trim()
  };
}

function aiFromForm() {
  const price = Number(aiPriceEl.value);
  const quotaTokens = Number(aiQuotaTokensEl.value);
  const usedTokens = Number(aiUsedTokensEl.value);
  const quotaRequests = Number(aiQuotaRequestsEl.value);
  const usedRequests = Number(aiUsedRequestsEl.value);

  if (!aiCustomerEl.value.trim()) throw new Error('Cliente es obligatorio');
  if (!aiPlanEl.value.trim()) throw new Error('Plan es obligatorio');
  if (!aiRenewDateEl.value) throw new Error('Fecha de renovación es obligatoria');

  const numericFields = [
    ['Precio', price],
    ['Cupo tokens', quotaTokens],
    ['Tokens usados', usedTokens],
    ['Cupo requests', quotaRequests],
    ['Requests usados', usedRequests]
  ];

  for (const [label, value] of numericFields) {
    if (Number.isNaN(value) || value < 0) throw new Error(`${label} inválido`);
  }

  return {
    customer: aiCustomerEl.value.trim(),
    plan: aiPlanEl.value.trim(),
    billing_cycle: aiBillingCycleEl.value,
    price_clp: price,
    quota_tokens: quotaTokens,
    used_tokens: usedTokens,
    quota_requests: quotaRequests,
    used_requests: usedRequests,
    renew_date: aiRenewDateEl.value,
    status: aiStatusEl.value
  };
}

function renderGeneratedAt() {
  const generatedDates = [state.delivery.generated_at, state.sales.generated_at, state.ai.generated_at, state.community.generated_at]
    .map((value) => new Date(value).toLocaleString('es-CL'));
  generatedAtEl.textContent = `Delivery: ${generatedDates[0]} | Comercial: ${generatedDates[1]} | IA: ${generatedDates[2]} | Comunidad: ${generatedDates[3]}`;
}

function renderGlobalKpis() {
  const delivery = state.delivery.summary;
  const sales = state.sales.summary;
  const ai = state.ai.summary;
  const community = state.community.community;

  const communityCards = [
    ['Proyectos', delivery.total_projects],
    ['Avance promedio', delivery.average_progress_known_only ?? 'N/D'],
    ['Pipeline CLP', clp(sales.pipeline_amount_clp)],
    ['MRR IA CLP', clp(ai.monthly_recurring_revenue_clp)],
    ['IA sobrecupo', ai.over_quota_subscriptions],
    ['Miembros activos', community.active_members],
    ['Engagement 7d', `${community.engagement_percent_7d}%`]
  ];

  const plantiwuisCards = (state.plantiwuisKpis?.metrics || []).map((metric) => [metric.label, metric.value]);

  const cards = state.contextMode === 'plantiwuis' && plantiwuisCards.length > 0 ? plantiwuisCards : communityCards;

  globalKpisEl.innerHTML = cards
    .map(([label, value]) => `<article class="kpi" data-kpi="${label}"><span class="label">${label}</span><strong class="value">${value}</strong></article>`)
    .join('');
  attachKpiClicks();
}

const kpiInfo = {
  'Proyectos': 'Cantidad total de proyectos en el portafolio, incluyendo Activos, Diego y JP.',
  'Avance promedio': 'Promedio de avance (%) de proyectos que reportan progress_percent.',
  'Pipeline CLP': 'Suma de montos estimados en oportunidades abiertas (stage lead/qualified/proposal/negotiation).',
  'MRR IA CLP': 'Ingreso mensual recurrente equivalente sumado desde planes IA activos.',
  'IA sobrecupo': 'Número de suscripciones IA que excedieron tokens o requests.',
  'Miembros activos': 'Miembros con actividad reciente (7 días).',
  'Engagement 7d': 'Porcentaje de miembros activos que interactuaron en la última semana.'
};
const plantiwuisKpiInfo = {
  'Ventas feria': 'Transacciones cerradas en feria libre durante la semana.',
  'Visitas diarias': 'Visitantes diarios promedio en el stand de Plantiwuis.',
  'Revenue CLP': 'Ingresos totales generados por Plantiwuis en el periodo seleccionado.',
  'Promociones activas': 'Ofertas vigentes en feria/tienda para impulsar ventas.',
  'Stock valorado': 'Valor monetario estimado del inventario disponible en el momento.',
  'Stalls activos': 'Cantidad de puestos de feria o locales vendiendo Plantiwuis.'
};

function attachKpiClicks() {
  globalKpisEl.querySelectorAll('.kpi').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.kpi;
      showKpiDetail(key);
    });
  });
}

function showKpiDetail(key) {
  if (!kpiDetailPanel) return;
  kpiDetailPanel.classList.add('active');
  const info = state.contextMode === 'plantiwuis' ? plantiwuisKpiInfo[key] : kpiInfo[key];
  kpiDetailText.textContent = info || 'Detalle no disponible';
}

function renderOverview() {
  const delivery = state.delivery.summary;
  const sales = state.sales.summary;
  const ai = state.ai.summary;
  const community = state.community.community;

  const cards = [
    ['Delivery', `Bloqueados: ${delivery.by_status.blocked ?? 0} / Sin %: ${delivery.projects_without_progress}`],
    ['Comercial', `Leads: ${sales.new_leads} / Won: ${sales.won_deals} / Conversión: ${sales.conversion_rate_percent}%`],
    ['IA Suscripción', `Activas: ${ai.active_subscriptions} / Sobrecupo: ${ai.over_quota_subscriptions} / MRR: ${clp(ai.monthly_recurring_revenue_clp)}`],
    ['Comunidad', `Nuevos 30d: ${community.new_members_30d} / Churn: ${community.churn_percent_30d}% / NPS: ${community.nps}`],
    ['Riesgo operativo', `SLA breaches: ${community.support_sla_breaches}`]
  ];

  overviewCardsEl.innerHTML = cards
    .map(([title, text]) => `<article class="subpanel"><h3>${title}</h3><p>${text}</p></article>`)
    .join('');
  renderContextDetail();
  updateLegend();
}

function updateLegend() {
  const legendTextEl = document.getElementById('sectionLegendText');
  const badgeEl = document.getElementById('contextBadge');
  if (legendTextEl) {
    legendTextEl.textContent = state.contextMode === 'plantiwuis'
      ? 'Comercial · Plantiwuis KPI set'
      : 'Comercial · Comunidad virtual KPI set';
  }
  if (badgeEl) {
    badgeEl.textContent = state.contextMode === 'plantiwuis' ? 'Plantiwuis' : 'Comunidad';
  }
}

function renderContextDetail() {
  if (!contextDetailEl) return;
  if (state.contextMode === 'plantiwuis' && state.plantiwuis) {
    const data = state.plantiwuis;
    const promos = data.promotions?.map((promo) => `<li>${promo}</li>`).join('') || '';
    contextDetailEl.innerHTML = `
      <strong>Plantiwuis</strong> · Ventas semanales: ${data.weekly_sales} · Visitas: ${data.daily_visits} · Ingresos: ${clp(data.revenue_clp)} · Stock: ${clp(data.stock_value_clp)} · Stalls: ${data.active_stalls}
      <ul>${promos}</ul>
    `;
  } else if (state.community) {
    const upcoming = state.community.events?.[0];
    contextDetailEl.innerHTML = `
      <strong>Comunidad virtual</strong> · Miembros activos: ${state.community.community.active_members} · NPS: ${state.community.community.nps} · Evento próximo: ${upcoming ? `${upcoming.name} (${upcoming.date})` : 'sin eventos programados'}.
    `;
  } else {
    contextDetailEl.textContent = '';
  }
}

function renderDelivery() {
  const projects = state.delivery.projects
    .map((item, index) => ({ ...item, _index: index }))
    .filter((item) => state.priorityFilter === 'ALL' || item.priority === state.priorityFilter);

  if (!projects.length) {
    deliveryRowsEl.innerHTML = '<tr><td colspan="10">Sin métricas. Usa \"Nueva métrica\" para agregar registros.</td></tr>';
    if (deliveryConsoleRowsEl) {
      deliveryConsoleRowsEl.innerHTML = '<tr><td colspan="6">Sin servicios para mostrar.</td></tr>';
    }
    return;
  }

  deliveryRowsEl.innerHTML = projects
    .map((item) => {
      const progress = typeof item.progress_percent === 'number' ? `${item.progress_percent}%` : 'N/D';
      const idEditing = state.deliveryInlineEdit.index === item._index && state.deliveryInlineEdit.field === 'project_id';
      const progressEditing = state.deliveryInlineEdit.index === item._index && state.deliveryInlineEdit.field === 'progress_percent';
      return `
        <tr>
          <td>
            ${idEditing
              ? `<div class="inline-number-editor"><input type="number" min="1" data-delivery-inline-input="project_id" value="${item.project_id ?? ''}" /><button class="btn btn-small" data-delivery-inline-action="done" data-delivery-inline-field="project_id" data-delivery-index="${item._index}" type="button"><span class="icon" aria-hidden="true">&#10003;</span></button></div>`
              : `<button class="inline-number-btn" data-delivery-inline-action="edit" data-delivery-inline-field="project_id" data-delivery-index="${item._index}" type="button" title="Editar ID">${item.project_id}</button>`}
          </td>
          <td>${item.project_slug}</td>
          <td>${item.group}</td>
          <td>${item.priority}</td>
          <td>
            ${progressEditing
              ? `<div class="inline-number-editor"><input type="number" min="0" max="100" data-delivery-inline-input="progress_percent" value="${item.progress_percent ?? ''}" placeholder="N/D" /><button class="btn btn-small" data-delivery-inline-action="done" data-delivery-inline-field="progress_percent" data-delivery-index="${item._index}" type="button"><span class="icon" aria-hidden="true">&#10003;</span></button></div>`
              : `<button class="inline-number-btn" data-delivery-inline-action="edit" data-delivery-inline-field="progress_percent" data-delivery-index="${item._index}" type="button" title="Editar avance">${progress}</button>`}
          </td>
      <td><span class="tag ${item.status}">${item.status}</span></td>
      <td>${item.version}</td>
      <td>${item.blocker}</td>
      <td>${renderProjectLinks(item)}</td>
      <td>
            <button class="btn btn-small btn-ghost" data-delivery-action="edit" data-delivery-index="${item._index}" type="button">Editar</button>
            <button class="btn btn-small btn-danger" data-delivery-action="delete" data-delivery-index="${item._index}" type="button">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join('');

  if (deliveryConsoleRowsEl) {
    deliveryConsoleRowsEl.innerHTML = projects
      .map((item, index) => {
        const updated = item.last_update || '—';
        return `
          <tr>
            <td>${item.project_slug}</td>
            <td><span class="tag ${item.status}">${item.status}</span></td>
            <td>${item.group || '—'}</td>
            <td>${item.priority || '—'}</td>
            <td>${updated}</td>
            <td>
              <div class="link-editor">
                <input type="url" data-link-field="frontend_url" data-link-index="${index}" value="${item.frontend_url || item.service_url || ''}" placeholder="https://front..." />
                <input type="url" data-link-field="backend_url" data-link-index="${index}" value="${item.backend_url || ''}" placeholder="https://back..." />
                <input type="url" data-link-field="database_url" data-link-index="${index}" value="${item.database_url || ''}" placeholder="https://db..." />
                <input type="url" data-link-field="github_url" data-link-index="${index}" value="${item.github_url || ''}" placeholder="https://github.com/..." />
                <div class="quick-links-wrap">
                  ${renderProjectLinks(item)}
                </div>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }
}

function sortOpportunities(list) {
  const field = state.salesSortField;
  const direction = state.salesSortDirection === 'asc' ? 1 : -1;

  return [...list].sort((a, b) => {
    const valA = field === 'amount_clp' || field === 'probability_percent'
      ? Number(a[field] || 0)
      : field === 'close_date'
        ? new Date(a[field] || 0).getTime()
        : String(a[field] || '').toLowerCase();
    const valB = field === 'amount_clp' || field === 'probability_percent'
      ? Number(b[field] || 0)
      : field === 'close_date'
        ? new Date(b[field] || 0).getTime()
        : String(b[field] || '').toLowerCase();

    if (valA < valB) return -1 * direction;
    if (valA > valB) return 1 * direction;
    return 0;
  });
}

function updateSalesPagination(total) {
  const pageSize = state.salesPageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  state.salesPage = Math.min(Math.max(state.salesPage, 1), totalPages);
  salesPageInfoEl.textContent = `Página ${state.salesPage} / ${totalPages}`;
  salesPrevPageBtn.disabled = state.salesPage === 1;
  salesNextPageBtn.disabled = state.salesPage === totalPages;
}

 function renderSales() {
  const s = state.sales.summary;
  const kpis = [
    ['Leads nuevos', s.new_leads],
    ['Op. abiertas', s.open_opportunities],
    ['Won deals', s.won_deals],
    ['Conversión', `${s.conversion_rate_percent}%`],
    ['Pipeline', clp(s.pipeline_amount_clp)],
    ['CPA CLP', clp(s.cpa_clp)]
  ];

  salesKpisEl.innerHTML = kpis
    .map(([label, value]) => `<article class="kpi"><span class="label">${label}</span><strong class="value">${value}</strong></article>`)
    .join('');

   const filtered = state.sales.opportunities
     .map((item, index) => ({ ...item, _index: index }))
     .filter((item) => state.stageFilter === 'ALL' || item.stage === state.stageFilter);

   const sorted = sortOpportunities(filtered);
  updateSalesPagination(sorted.length);
  const start = (state.salesPage - 1) * state.salesPageSize;
  const paginated = sorted.slice(start, start + state.salesPageSize);

  if (!paginated.length) {
    salesRowsEl.innerHTML = '<tr><td colspan="8">Sin oportunidades. Usa "Nueva oportunidad" o "Restaurar demo".</td></tr>';
    return;
  }

  salesRowsEl.innerHTML = paginated
    .map((item) => `
      <tr>
        <td>${item.account}</td>
        <td>${item.product}</td>
        <td><span class="tag ${item.stage}">${item.stage}</span></td>
        <td>${clp(item.amount_clp)}</td>
        <td>${item.probability_percent}%</td>
        <td>${item.close_date}</td>
        <td>${item.owner}</td>
        <td>
          <button class="btn btn-small btn-ghost" data-sale-action="edit" data-sale-index="${item._index}" type="button">Editar</button>
          <button class="btn btn-small btn-danger" data-sale-action="delete" data-sale-index="${item._index}" type="button">Eliminar</button>
        </td>
      </tr>
    `)
    .join('');
  renderPeriodSummary();
}

function renderPeriodSummary() {
  if (!state.salesPeriods.length) {
    periodKpisEl.innerHTML = '';
    periodRowsEl.innerHTML = '<tr><td colspan="4">Sin periodos definidos.</td></tr>';
    return;
  }

  const period = state.salesPeriods[state.salesPeriodIndex]?.periods
    ? state.salesPeriods[state.salesPeriodIndex]
    : state.salesPeriods[state.salesPeriodIndex];
  if (!period) {
    periodRowsEl.innerHTML = '<tr><td colspan="4">Sin periodos seleccionados.</td></tr>';
    return;
  }

  const revenue = period.total_revenue_clp || 0;
  const transactions = period.total_transactions || 0;
  const avgTicket = transactions ? Math.round(revenue / transactions) : 0;

  const kpis = [
    ['Periodo', period.name],
    ['Tipo', period.type],
    ['Revenue total', clp(revenue)],
    ['Total transacciones', transactions],
    ['Ticket promedio', clp(avgTicket)]
  ];

  periodKpisEl.innerHTML = kpis
    .map(([label, value]) => `<article class="kpi"><span class="label">${label}</span><strong class="value">${value}</strong></article>`)
    .join('');

  periodRowsEl.innerHTML = (period.subperiods || [])
    .map((sub) => `
      <tr>
        <td>${sub.name}</td>
        <td>${clp(sub.revenue_clp)}</td>
        <td>${sub.transactions}</td>
        <td>${sub.conversion_percent}%</td>
      </tr>
    `)
    .join('') || '<tr><td colspan="4">Sin subperiodos.</td></tr>';
}

function populatePeriodOptions() {
  if (!salesPeriodSelectEl) return;
  salesPeriodSelectEl.innerHTML = state.salesPeriods
    .map((period, index) => `<option value="${index}">${period.name} (${period.type})</option>`)
    .join('');
}

function setSalesPeriod(index) {
  if (!state.salesPeriods.length) return;
  state.salesPeriodIndex = Math.min(Math.max(index, 0), state.salesPeriods.length - 1);
  if (salesPeriodSelectEl) salesPeriodSelectEl.value = state.salesPeriodIndex;
  renderPeriodSummary();
}

function renderAiSubscriptions() {
  const a = state.ai.summary;
  const kpis = [
    ['Suscripciones', a.total_subscriptions],
    ['Activas', a.active_subscriptions],
    ['Past due', a.past_due_subscriptions],
    ['MRR CLP', clp(a.monthly_recurring_revenue_clp)],
    ['Sobrecupo', a.over_quota_subscriptions],
    ['Uso promedio', `${a.avg_utilization_percent}%`]
  ];

  aiKpisEl.innerHTML = kpis
    .map(([label, value]) => `<article class="kpi"><span class="label">${label}</span><strong class="value">${value}</strong></article>`)
    .join('');

  const subscriptions = state.ai.subscriptions
    .map((item, index) => ({ ...item, _index: index }))
    .filter((item) => state.aiStatusFilter === 'ALL' || item.status === state.aiStatusFilter);

  if (!subscriptions.length) {
    aiRowsEl.innerHTML = '<tr><td colspan="10">Sin suscripciones. Usa "Nueva suscripción" o "Restaurar demo".</td></tr>';
    return;
  }

  aiRowsEl.innerHTML = subscriptions
    .map((item) => {
      const tokenRatio = ratio(item.used_tokens, item.quota_tokens);
      const requestRatio = ratio(item.used_requests, item.quota_requests);
      const maxRatio = Math.max(tokenRatio, requestRatio);
      const overQuota = maxRatio > 1 ? 'over_quota' : 'in_quota';

      return `
        <tr>
          <td>${item.customer}</td>
          <td>${item.plan}</td>
          <td>${item.billing_cycle}</td>
          <td><span class="tag ${item.status}">${item.status}</span></td>
          <td>${clp(item.price_clp)}</td>
          <td>${clp(item.used_tokens)} / ${clp(item.quota_tokens)}</td>
          <td>${clp(item.used_requests)} / ${clp(item.quota_requests)}</td>
          <td><span class="tag ${overQuota}">${percent(maxRatio)}</span></td>
          <td>${item.renew_date}</td>
          <td>
            <button class="btn btn-small btn-ghost" data-ai-action="edit" data-ai-index="${item._index}" type="button">Editar</button>
            <button class="btn btn-small btn-danger" data-ai-action="delete" data-ai-index="${item._index}" type="button">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderCommunity() {
  const c = state.community.community;
  const cards = [
    ['Miembros activos', c.active_members],
    ['Altas 30d', c.new_members_30d],
    ['Churn 30d', `${c.churn_percent_30d}%`],
    ['Engagement 7d', `${c.engagement_percent_7d}%`],
    ['NPS', c.nps],
    ['Brechas SLA', c.support_sla_breaches]
  ];

  communitySummaryEl.innerHTML = cards
    .map(([label, value]) => `<article class="kpi"><span class="label">${label}</span><strong class="value">${value}</strong></article>`)
    .join('');

  eventListEl.innerHTML = state.community.events
    .map((event) => {
      const occupancy = Math.round((event.registered / event.capacity) * 100);
      return `<li><strong>${event.name}</strong><br>${event.date} · ${event.channel}<br>${event.registered}/${event.capacity} inscritos (${occupancy}%)</li>`;
    })
    .join('');

  incidentListEl.innerHTML = state.community.incidents
    .map((incident) => `<li><strong>${incident.title}</strong><br>Severidad: ${incident.severity} · Estado: ${incident.status}<br>Owner: ${incident.owner}</li>`)
    .join('');
}

function normalizeNotesData(raw) {
  const notesArray = Array.isArray(raw?.notes) ? raw.notes : [];
  const generatedAt = raw?.generated_at || new Date().toISOString();
  return {
    generated_at: generatedAt,
    notes: notesArray
  };
}

function updateNotesNextId() {
  const maxId = state.notes.notes.reduce((acc, note) => Math.max(acc, note.note_id || 0), 0);
  state.notesNextId = maxId + 1;
}

function loadNotesData(seed) {
  state.notes = normalizeNotesData(seed);
  updateNotesNextId();
}

function persistNotesData() {
  state.notes.generated_at = new Date().toISOString();
  updateNotesNextId();
  persistRemoteData(REMOTE_NOTES_API, state.notes, 'Notas sincronizadas con Render.', 'Notas');
  return true;
}

function getNotesProjects() {
  const projects = new Set();
  state.notes.notes.forEach((note) => {
    if (note.project) projects.add(note.project);
  });
  return Array.from(projects).sort((a, b) => a.localeCompare(b));
}

function renderNotesFilters() {
  if (!notesProjectFilterEl) return;
  const projects = getNotesProjects();
  const currentProject = state.notesFilters.project;
  notesProjectFilterEl.innerHTML = [
    '<option value="ALL">Todos</option>',
    ...projects.map((project) => `<option value="${project}">${project}</option>`)
  ].join('');
  notesProjectFilterEl.value = projects.includes(currentProject) ? currentProject : 'ALL';
  if (notesStatusFilterEl) {
    notesStatusFilterEl.value = state.notesFilters.status;
  }
}

function clearNotesForm() {
  if (!notesFormEl) return;
  notesFormEl.reset();
  if (notesStatusEl) notesStatusEl.value = 'idea';
}

function notesFromForm() {
  const project = notesProjectEl?.value.trim();
  const title = notesTitleEl?.value.trim();
  if (!project) throw new Error('Proyecto es obligatorio');
  if (!title) throw new Error('Título es obligatorio');
  const description = notesDescriptionEl?.value.trim() || '';
  const status = notesStatusEl?.value || 'idea';
  return {
    note_id: state.notesNextId,
    project,
    title,
    description,
    status,
    context: 'notes',
    created_at: new Date().toISOString()
  };
}

function renderNotes() {
  if (!notesGridEl) return;
  const filtered = state.notes.notes.filter((note) => {
    const matchesProject = state.notesFilters.project === 'ALL' || note.project === state.notesFilters.project;
    const matchesStatus = state.notesFilters.status === 'ALL' || note.status === state.notesFilters.status;
    return matchesProject && matchesStatus;
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (!sorted.length) {
    notesGridEl.innerHTML = '<p class="muted">Aún no hay notas que coincidan con los filtros.</p>';
    return;
  }
  notesGridEl.innerHTML = sorted
    .map((note) => {
      const created = new Date(note.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
      return `
        <article class="notes-card">
          <header>
            <span class="notes-status ${note.status}">${note.status}</span>
            <span class="muted">${note.project}</span>
          </header>
          <h3>${note.title}</h3>
          <p>${note.description || 'Sin descripción'}</p>
          <footer>${created}</footer>
        </article>
      `;
    })
    .join('');
}

function rerenderAllFromSales() {
  renderGeneratedAt();
  renderGlobalKpis();
  renderOverview();
  renderSales();
}

function rerenderAllFromDelivery() {
  renderGeneratedAt();
  renderGlobalKpis();
  renderOverview();
  renderDelivery();
}

function rerenderAllFromAi() {
  renderGeneratedAt();
  renderGlobalKpis();
  renderOverview();
  renderAiSubscriptions();
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.panel === tab);
  });
}

function setPeriodPanel(hidden) {
  state.periodPanelHidden = hidden;
  if (salesPeriodPanelEl) {
    salesPeriodPanelEl.classList.toggle('hidden', hidden);
  }
  if (salesPeriodToggleEl) {
    salesPeriodToggleEl.textContent = hidden ? 'Mostrar periodos' : 'Ocultar periodos';
  }
}

function closeMoreMenu() {
  if (salesMoreMenuEl) salesMoreMenuEl.classList.remove('is-open');
}

function setContextMode(mode) {
  state.contextMode = mode;
  contextToggleEl.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.context === mode);
  });
  renderContextDetail();
}

async function init() {
  const deliveryPromise = fetchDeliveryData();
  const salesPromise = fetchSalesData();
  const aiPromise = fetchAiData();
  const notesPromise = fetchNotesData();
  const [deliverySeedRes, salesSeedRes, aiSeedRes, notesSeedRes, communityRes, plantiwuisRes, periodsRes, plantiwuisKpisRes] = await Promise.all([
    fetch(LOCAL_METRICS_FILE),
    fetch(LOCAL_SALES_FILE),
    fetch(LOCAL_AI_FILE),
    fetch(LOCAL_NOTES_FILE),
    fetch('./community-ops.json'),
    fetch('./plantiwuis.json'),
    fetch('./sales-periods.json'),
    fetch('./plantiwuis-kpis.json')
  ]);

  if (
    !deliverySeedRes.ok ||
    !salesSeedRes.ok ||
    !aiSeedRes.ok ||
    !notesSeedRes.ok ||
    !communityRes.ok ||
    !plantiwuisRes.ok ||
    !periodsRes.ok ||
    !plantiwuisKpisRes.ok
  ) {
    throw new Error('No se pudieron cargar todos los datasets');
  }

  const [deliveryData, deliverySeed, salesData, salesSeed, aiData, aiSeed, community, plantiwuis, periodsData, plantiwuisKpis, notesData, notesSeed] = await Promise.all([
    deliveryPromise,
    deliverySeedRes.json(),
    salesPromise,
    salesSeedRes.json(),
    aiPromise,
    aiSeedRes.json(),
    communityRes.json(),
    plantiwuisRes.json(),
    periodsRes.json(),
    plantiwuisKpisRes.json(),
    notesPromise,
    notesSeedRes.json()
  ]);

  const normalizedDeliverySeed = normalizeDeliveryData(deliverySeed);
  const normalizedSalesSeed = normalizeSalesData(salesSeed);
  const normalizedAiSeed = normalizeAiData(aiSeed);
  const normalizedNotesSeed = normalizeNotesData(notesSeed);
  const normalizedDeliveryData = normalizeDeliveryData(deliveryData);
  const normalizedSalesDataSet = normalizeSalesData(salesData);
  const normalizedAiDataSet = normalizeAiData(aiData);
  const normalizedNotesDataSet = normalizeNotesData(notesData);

  const legacyDelivery = readLegacyLocalStorage(LEGACY_DELIVERY_STORAGE_KEY, normalizeDeliveryData);
  const legacySales = readLegacyLocalStorage(LEGACY_SALES_STORAGE_KEY, normalizeSalesData);
  const legacyAi = readLegacyLocalStorage(LEGACY_AI_STORAGE_KEY, normalizeAiData);
  const legacyNotes = readLegacyLocalStorage(LEGACY_NOTES_STORAGE_KEY, normalizeNotesData);

  const resolvedDelivery = shouldMigrateLegacyData(legacyDelivery, normalizedDeliveryData, normalizedDeliverySeed, 'projects')
    ? legacyDelivery
    : normalizedDeliveryData;
  const resolvedSales = shouldMigrateLegacyData(legacySales, normalizedSalesDataSet, normalizedSalesSeed, 'opportunities')
    ? legacySales
    : normalizedSalesDataSet;
  const resolvedAi = shouldMigrateLegacyData(legacyAi, normalizedAiDataSet, normalizedAiSeed, 'subscriptions')
    ? legacyAi
    : normalizedAiDataSet;
  const resolvedNotes = shouldMigrateLegacyData(legacyNotes, normalizedNotesDataSet, normalizedNotesSeed, 'notes')
    ? legacyNotes
    : normalizedNotesDataSet;

  if (resolvedDelivery === legacyDelivery) {
    await persistRemoteData(REMOTE_DELIVERY_API, resolvedDelivery, '', 'Delivery', { notify: false });
  }
  if (resolvedSales === legacySales) {
    await persistRemoteData(REMOTE_SALES_API, resolvedSales, '', 'Comercial', { notify: false });
  }
  if (resolvedAi === legacyAi) {
    await persistRemoteData(REMOTE_AI_API, resolvedAi, '', 'IA', { notify: false });
  }
  if (resolvedNotes === legacyNotes) {
    await persistRemoteData(REMOTE_NOTES_API, resolvedNotes, '', 'Notas', { notify: false });
  }

  state.metrics = resolvedDelivery;
  state.deliverySeed = clone(deliverySeed);
  state.delivery = loadDeliveryData(resolvedDelivery);
  state.metrics.projects = state.delivery.projects;
  state.metrics.summary = state.delivery.summary;
  state.metrics.generated_at = state.delivery.generated_at;
  state.salesSeed = clone(salesSeed);
  state.sales = loadSalesData(resolvedSales);
  state.aiSeed = clone(aiSeed);
  state.ai = loadAiData(resolvedAi);
  state.community = community;
  state.plantiwuis = plantiwuis;
  state.plantiwuisKpis = plantiwuisKpis;
  state.salesPeriods = periodsData.periods || [];
  state.salesPeriodIndex = 0;
  state.notesSeed = clone(notesSeed);
  loadNotesData(resolvedNotes);
  renderNotesFilters();
  renderNotes();
  populatePeriodOptions();
  setSalesPeriod(0);

  renderGeneratedAt();
  renderGlobalKpis();
  renderOverview();
  renderDelivery();
  renderSales();
  renderAiSubscriptions();
  renderCommunity();
  setPeriodPanel(state.periodPanelHidden);
}

document.getElementById('tabs').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-tab]');
  if (!button) return;
  setTab(button.dataset.tab);
});

contextToggleEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-context]');
  if (!button) return;
  setContextMode(button.dataset.context);
});

if (salesMoreBtnEl && salesMoreMenuEl) {
  salesMoreBtnEl.addEventListener('click', () => {
    salesMoreMenuEl.classList.toggle('is-open');
  });
  document.addEventListener('click', (event) => {
    if (!salesMoreBtnEl.contains(event.target) && !salesMoreMenuEl.contains(event.target)) {
      closeMoreMenu();
    }
  });
}

if (salesPeriodToggleEl) {
  salesPeriodToggleEl.addEventListener('click', () => {
    setPeriodPanel(!state.periodPanelHidden);
  });
}

priorityFilterEl.addEventListener('change', (event) => {
  state.priorityFilter = event.target.value;
  renderDelivery();
});

stageFilterEl.addEventListener('change', (event) => {
  state.stageFilter = event.target.value;
  state.salesPage = 1;
  renderSales();
});

salesPeriodSelectEl.addEventListener('change', (event) => {
  const index = Number(event.target.value);
  if (Number.isNaN(index)) return;
  setSalesPeriod(index);
});

salesSortFieldEl.addEventListener('change', (event) => {
  state.salesSortField = event.target.value;
  state.salesPage = 1;
  renderSales();
});

salesSortDirectionBtnEl.addEventListener('click', () => {
  state.salesSortDirection = state.salesSortDirection === 'asc' ? 'desc' : 'asc';
  salesSortDirectionBtnEl.textContent = state.salesSortDirection === 'asc' ? 'Ascendente' : 'Descendente';
  state.salesPage = 1;
  renderSales();
});

salesPageSizeEl.addEventListener('change', (event) => {
  state.salesPageSize = Number(event.target.value);
  state.salesPage = 1;
  renderSales();
});

salesPrevPageBtn.addEventListener('click', () => {
  if (state.salesPage > 1) {
    state.salesPage -= 1;
    renderSales();
  }
});

salesNextPageBtn.addEventListener('click', () => {
  const total = state.sales.opportunities.filter((item) => state.stageFilter === 'ALL' || item.stage === state.stageFilter).length;
  const maxPage = Math.max(1, Math.ceil(total / state.salesPageSize));
  if (state.salesPage < maxPage) {
    state.salesPage += 1;
    renderSales();
  }
});

aiStatusFilterEl.addEventListener('change', (event) => {
  state.aiStatusFilter = event.target.value;
  renderAiSubscriptions();
});

salesFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!state.sales) {
    alert('Los datos de Comercial aún no se cargan. Usa "Restaurar demo" o espera unos segundos.');
    return;
  }
  try {
    const sale = saleFromForm();

    if (state.salesEditIndex === null) {
      state.sales.opportunities.push(sale);
    } else {
      state.sales.opportunities[state.salesEditIndex] = sale;
    }

    persistSalesData();
    clearSalesForm();
    rerenderAllFromSales();
  } catch (error) {
    alert(error.message);
  }
});

aiFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const subscription = aiFromForm();

    if (state.aiEditIndex === null) {
      state.ai.subscriptions.push(subscription);
    } else {
      state.ai.subscriptions[state.aiEditIndex] = subscription;
    }

    persistAiData();
    clearAiForm();
    rerenderAllFromAi();
  } catch (error) {
    alert(error.message);
  }
});

salesCancelEditBtnEl.addEventListener('click', clearSalesForm);
salesNewBtnEl.addEventListener('click', () => {
  clearSalesForm();
  saleAccountEl.focus();
});
salesResetBtnEl.addEventListener('click', () => {
  if (!confirm('Se eliminarán todas las oportunidades actuales. ¿Continuar?')) return;
  setSalesToZero();
});
salesRestoreBtnEl.addEventListener('click', () => {
  if (!confirm('Se reemplazarán los datos actuales por la demo inicial. ¿Continuar?')) return;
  restoreSalesSeed();
});

aiCancelEditBtnEl.addEventListener('click', clearAiForm);
aiNewBtnEl.addEventListener('click', () => {
  clearAiForm();
  aiCustomerEl.focus();
});
aiResetBtnEl.addEventListener('click', () => {
  if (!confirm('Se eliminarán todas las suscripciones IA actuales. ¿Continuar?')) return;
  setAiToZero();
});
aiRestoreBtnEl.addEventListener('click', () => {
  if (!confirm('Se reemplazarán los datos IA actuales por la demo inicial. ¿Continuar?')) return;
  restoreAiSeed();
});

salesRowsEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-sale-action]');
  if (!button) return;

  const action = button.dataset.saleAction;
  const index = Number(button.dataset.saleIndex);
  if (Number.isNaN(index)) return;

  if (action === 'edit') {
    const sale = state.sales.opportunities[index];
    if (!sale) return;
    state.salesEditIndex = index;
    fillSalesForm(sale);
    saleAccountEl.focus();
    return;
  }

  if (action === 'delete') {
    if (!confirm('¿Eliminar esta oportunidad?')) return;
    state.sales.opportunities.splice(index, 1);
    persistSalesData();
    if (state.salesEditIndex === index) clearSalesForm();
    rerenderAllFromSales();
  }
});

deliveryFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const project = createDeliveryRowFromForm();

    if (state.deliveryEditIndex === null) {
      state.delivery.projects.push(project);
    } else {
      const current = state.delivery.projects[state.deliveryEditIndex] || {};
      state.delivery.projects[state.deliveryEditIndex] = { ...current, ...project };
    }

    persistDeliveryData();
    clearDeliveryForm();
    rerenderAllFromDelivery();
  } catch (error) {
    alert(error.message);
  }
});

deliveryCancelBtnEl.addEventListener('click', clearDeliveryForm);
deliveryNewBtnEl.addEventListener('click', () => {
  clearDeliveryForm();
  deliveryIdEl.focus();
});
deliveryResetBtnEl.addEventListener('click', () => {
  if (!confirm('Se eliminarán todas las métricas de delivery actuales. ¿Continuar?')) return;
  state.delivery.projects = [];
  persistDeliveryData();
  rerenderAllFromDelivery();
});
deliveryRestoreBtnEl.addEventListener('click', () => {
  if (!confirm('Se reemplazarán las métricas actuales por la demo inicial. ¿Continuar?')) return;
  state.delivery = normalizeDeliveryData(state.deliverySeed);
  persistDeliveryData();
  rerenderAllFromDelivery();
});

deliveryRowsEl.addEventListener('click', (event) => {
  const inlineButton = event.target.closest('button[data-delivery-inline-action]');
  if (inlineButton) {
    const action = inlineButton.dataset.deliveryInlineAction;
    const field = inlineButton.dataset.deliveryInlineField;
    const index = Number(inlineButton.dataset.deliveryIndex);
    if (Number.isNaN(index) || !field) return;

    if (action === 'edit') {
      openInlineDeliveryNumber(index, field);
      return;
    }

    if (action === 'done') {
      const row = inlineButton.closest('tr');
      saveInlineDeliveryNumber(index, row, field, true);
      return;
    }
  }

  const button = event.target.closest('button[data-delivery-action]');
  if (!button) return;

  const action = button.dataset.deliveryAction;
  const index = Number(button.dataset.deliveryIndex);
  if (Number.isNaN(index)) return;

  if (action === 'edit') {
    const project = state.delivery.projects[index];
    if (!project) return;
    state.deliveryEditIndex = index;
    fillDeliveryForm(project);
    deliveryIdEl.focus();
    return;
  }

  if (action === 'delete') {
    if (!confirm('¿Eliminar esta métrica de delivery?')) return;
    state.delivery.projects.splice(index, 1);
    persistDeliveryData();
    if (state.deliveryEditIndex === index) clearDeliveryForm();
    rerenderAllFromDelivery();
  }
});

deliveryRowsEl.addEventListener('change', (event) => {
  const input = event.target.closest('input[data-delivery-inline-input]');
  if (!input) return;
  const row = input.closest('tr');
  const field = input.dataset.deliveryInlineInput;
  if (!row || !field) return;
  const actionButton = row.querySelector(`button[data-delivery-inline-action="done"][data-delivery-inline-field="${field}"]`);
  if (!actionButton) return;
  const index = Number(actionButton.dataset.deliveryIndex);
  if (Number.isNaN(index)) return;
  saveInlineDeliveryNumber(index, row, field, false);
});

if (deliveryConsoleRowsEl) {
  deliveryConsoleRowsEl.addEventListener('click', (event) => {
    const copyBtn = event.target.closest('button[data-copy-url]');
    if (copyBtn) {
      const url = copyBtn.dataset.copyUrl || '';
      copyText(url);
      return;
    }

    const button = event.target.closest('button[data-delivery-link-action]');
    if (!button) return;
    const action = button.dataset.deliveryLinkAction;
    const index = Number(button.dataset.deliveryLinkIndex);
    if (Number.isNaN(index)) return;

    if (action === 'done') {
      const row = button.closest('tr');
      saveInlineDeliveryLinks(index, row, true);
    }
  });

  deliveryConsoleRowsEl.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-link-field]');
    if (!input) return;
    const index = Number(input.dataset.linkIndex);
    if (Number.isNaN(index)) return;
    const row = input.closest('tr');
    saveInlineDeliveryLinks(index, row, false);
  });
}

salesExportBtnEl.addEventListener('click', () => {
  downloadJSON(state.sales, 'commercial-metrics.json');
});

salesImportBtnEl.addEventListener('click', () => {
  salesImportInputEl.value = '';
  salesImportInputEl.click();
});

salesImportInputEl.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  importJSON(file, (payload) => {
    state.sales = normalizeSalesData(payload);
    persistSalesData();
    rerenderAllFromSales();
  });
});

deliveryExportBtnEl.addEventListener('click', () => {
  downloadJSON(state.delivery, 'delivery-metrics.json');
});

deliveryImportBtnEl.addEventListener('click', () => {
  deliveryImportInputEl.value = '';
  deliveryImportInputEl.click();
});

deliveryImportInputEl.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  importJSON(file, (payload) => {
    state.delivery = normalizeDeliveryData(payload);
    persistDeliveryData();
    rerenderAllFromDelivery();
  });
});

aiExportBtnEl.addEventListener('click', () => {
  downloadJSON(state.ai, 'ai-subscriptions.json');
});

aiImportBtnEl.addEventListener('click', () => {
  aiImportInputEl.value = '';
  aiImportInputEl.click();
});

aiImportInputEl.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  importJSON(file, (payload) => {
    state.ai = normalizeAiData(payload);
    persistAiData();
    rerenderAllFromAi();
  });
});
aiRowsEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-ai-action]');
  if (!button) return;

  const action = button.dataset.aiAction;
  const index = Number(button.dataset.aiIndex);
  if (Number.isNaN(index)) return;

  if (action === 'edit') {
    const subscription = state.ai.subscriptions[index];
    if (!subscription) return;
    state.aiEditIndex = index;
    fillAiForm(subscription);
    aiCustomerEl.focus();
    return;
  }

  if (action === 'delete') {
    if (!confirm('¿Eliminar esta suscripción IA?')) return;
    state.ai.subscriptions.splice(index, 1);
    persistAiData();
    if (state.aiEditIndex === index) clearAiForm();
    rerenderAllFromAi();
  }
});

notesProjectFilterEl?.addEventListener('change', (event) => {
  state.notesFilters.project = event.target.value;
  renderNotes();
});

notesStatusFilterEl?.addEventListener('change', (event) => {
  state.notesFilters.status = event.target.value;
  renderNotes();
});

notesFormEl?.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const note = notesFromForm();
    state.notes.notes.unshift(note);
    persistNotesData();
    renderNotesFilters();
    renderNotes();
    clearNotesForm();
  } catch (error) {
    alert(error.message);
  }
});

notesClearBtnEl?.addEventListener('click', clearNotesForm);

init().catch((error) => {
  generatedAtEl.textContent = `Error: ${error.message}`;
});
