// ============================================================
// SEO Command Center — frontend
// Talks only to the real endpoints exposed by server.js
// ============================================================

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function api(method, path, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

// ============================================================
// NAV
// ============================================================
function initNav() {
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}
function switchView(view) {
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
  if (view === 'reports') loadReports();
  if (view === 'earnings') loadEarnings();
  if (view === 'clients') loadClients();
  if (view === 'setup') { loadSettings(); loadApiStatus(); }
}

// ============================================================
// HEALTH
// ============================================================
async function checkHealth() {
  const dot = $('#healthDot'), text = $('#healthText');
  try {
    const h = await api('GET', '/api/health');
    dot.classList.add('ok'); dot.classList.remove('bad');
    text.textContent = `engine online · v${h.version}`;
  } catch (e) {
    dot.classList.add('bad'); dot.classList.remove('ok');
    text.textContent = 'engine unreachable';
  }
}

// ============================================================
// ANALYZE
// ============================================================
const SCAN_STEPS = [
  'Fetching homepage HTML…',
  'Parsing on-page elements…',
  'Querying Google PageSpeed Insights…',
  'Inspecting SSL certificate…',
  'Resolving DNS records…',
  'Checking security headers…',
  'Reading sitemap.xml & robots.txt…',
  'Pulling backlink data (Moz / DataForSEO)…',
  'Scraping competitor pages…',
  'Scoring & compiling report…',
];

let scanTimer = null;

function startScanConsole() {
  const wrap = $('#scanConsole');
  const log = $('#scanLog');
  wrap.hidden = false;
  log.innerHTML = '';
  let i = 0;
  const renderStep = () => {
    // mark previous as done
    const prevCurrent = log.querySelector('.line.current');
    if (prevCurrent) { prevCurrent.classList.remove('current'); prevCurrent.classList.add('done'); }
    if (i < SCAN_STEPS.length) {
      const line = document.createElement('div');
      line.className = 'line current';
      line.textContent = SCAN_STEPS[i];
      log.appendChild(line);
      i++;
    }
  };
  renderStep();
  scanTimer = setInterval(renderStep, 1100);
}
function stopScanConsole() {
  if (scanTimer) clearInterval(scanTimer);
  scanTimer = null;
  $('#scanConsole').hidden = true;
}

$('#analyzeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = $('#formError');
  errEl.textContent = '';
  const url = $('#f-url').value.trim();
  if (!url) { errEl.textContent = 'Website URL is required.'; return; }

  const competitorUrls = [$('#f-comp1').value.trim(), $('#f-comp2').value.trim(), $('#f-comp3').value.trim()].filter(Boolean);

  const btn = $('#runBtn');
  btn.disabled = true;
  btn.textContent = 'Analyzing…';
  $('#analyzeResults').innerHTML = '';
  startScanConsole();

  try {
    const result = await api('POST', '/api/analyze', {
      url,
      businessName: $('#f-biz').value.trim(),
      location: $('#f-loc').value.trim(),
      niche: $('#f-niche').value.trim(),
      competitorUrls,
    });
    stopScanConsole();
    renderAnalysis(result.data, result.id);
  } catch (err) {
    stopScanConsole();
    errEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Run real analysis';
  }
});

function scoreClass(v) {
  if (v >= 70) return 'score-good';
  if (v >= 40) return 'score-mid';
  return 'score-bad';
}

function renderAnalysis(d, reportId, target) {
  const c = document.createElement('div');

  // toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'result-toolbar';
  toolbar.innerHTML = `<h2>${esc(d.businessName || d.url)}</h2>`;
  if (reportId) {
    const dl = document.createElement('a');
    dl.className = 'btn btn-ghost btn-sm';
    dl.href = `/api/report/download/${reportId}`;
    dl.textContent = 'Download HTML report';
    toolbar.appendChild(dl);
  }
  c.appendChild(toolbar);

  // scores
  const scoreGrid = document.createElement('div');
  scoreGrid.className = 'score-grid';
  const order = ['overall', 'technical', 'onpage', 'content', 'offpage', 'local'];
  order.forEach(key => {
    const v = d.scores[key];
    const card = document.createElement('div');
    card.className = 'score-card' + (key === 'overall' ? ' overall' : '');
    card.innerHTML = `<div class="val ${scoreClass(v)}">${v}</div><div class="lbl">${key}</div>`;
    scoreGrid.appendChild(card);
  });
  c.appendChild(scoreGrid);

  // audit sections
  const sectionNames = { technical: 'Technical SEO', onpage: 'On-page SEO', content: 'Content & E-E-A-T', offpage: 'Off-page & Links', local: 'Local SEO' };
  Object.keys(sectionNames).forEach(sec => {
    const items = d.audit[sec] || [];
    if (!items.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'audit-section';
    wrap.innerHTML = `<h3>${sectionNames[sec]}</h3>`;
    items.forEach(item => {
      const icon = item.status === 'pass' ? '✓' : item.status === 'warn' ? '⚠' : '✗';
      const row = document.createElement('div');
      row.className = 'audit-item';
      row.innerHTML = `
        <div class="row">
          <span class="status-icon ${item.status}">${icon}</span>
          <div style="flex:1">
            <div class="title">${esc(item.title)}</div>
            <div class="desc">${esc(item.desc)}</div>
            <div class="fix"><b>Fix:</b> ${esc(item.fix)}</div>
          </div>
        </div>`;
      wrap.appendChild(row);
    });
    c.appendChild(wrap);
  });

  // competitors
  if (d.competitors && d.competitors.length) {
    const h = document.createElement('h3');
    h.textContent = 'Competitor comparison';
    h.style.fontFamily = 'var(--font-display)';
    h.style.margin = '26px 0 10px';
    c.appendChild(h);
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `<thead><tr><th>Site</th><th>DA/DR</th><th>Traffic</th><th>Keywords</th><th>Backlinks</th><th>Speed</th></tr></thead>`;
    const tbody = document.createElement('tbody');
    d.competitors.forEach(comp => {
      const tr = document.createElement('tr');
      if (comp.isYou) tr.style.background = 'var(--accent-dim)';
      if (comp.error) {
        tr.innerHTML = `<td><b>${esc(comp.name)}</b></td><td colspan="5" class="muted">Could not fetch: ${esc(comp.error)}</td>`;
      } else {
        tr.innerHTML = `<td><b>${esc(comp.name)}</b><br><span class="muted mono">${esc(comp.domain)}</span></td>
          <td class="mono">${esc(comp.dr)}</td><td class="mono">${esc(comp.traffic)}</td>
          <td class="mono">${esc(comp.keywords)}</td><td class="mono">${esc(comp.backlinks)}</td>
          <td class="mono">${esc(comp.speed)}s</td>`;
      }
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    c.appendChild(table);
  }

  // gaps
  if (d.gaps && d.gaps.length) {
    const h = document.createElement('h3');
    h.textContent = 'Gap analysis';
    h.style.fontFamily = 'var(--font-display)';
    h.style.margin = '26px 0 10px';
    c.appendChild(h);
    d.gaps.forEach((g, i) => {
      const card = document.createElement('div');
      card.className = 'gap-card';
      card.innerHTML = `
        <div class="head"><strong>#${i + 1} ${esc(g.title)}</strong><span class="badge ${g.priority}">${g.priority}</span></div>
        <div class="desc">${esc(g.desc)}</div>
        <div class="action"><b>Action:</b> ${esc(g.action)}</div>`;
      c.appendChild(card);
    });
  }

  // keywords
  if (d.keywords && d.keywords.length) {
    const h = document.createElement('h3');
    h.textContent = 'Keyword opportunities';
    h.style.fontFamily = 'var(--font-display)';
    h.style.margin = '26px 0 10px';
    c.appendChild(h);
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `<thead><tr><th>Term</th><th>Volume</th><th>Difficulty</th><th>CPC</th><th>Intent</th><th>Your position</th><th>Source</th></tr></thead>`;
    const tbody = document.createElement('tbody');
    d.keywords.forEach(k => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${esc(k.term)}</td><td class="mono">${esc(k.vol)}</td>
        <td class="mono">${esc(k.diff)} <span class="muted">(${esc(k.kd)})</span></td>
        <td class="mono">$${esc(k.cpc)}</td><td class="muted">${esc(k.intent)}</td>
        <td class="mono">${esc(k.yourPos)}</td><td class="muted" style="font-size:11px">${esc(k.rankSource)}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    c.appendChild(table);
  }

  // actions
  if (d.actions && d.actions.length) {
    const h = document.createElement('h3');
    h.textContent = 'Priority action plan';
    h.style.fontFamily = 'var(--font-display)';
    h.style.margin = '26px 0 10px';
    c.appendChild(h);
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `<thead><tr><th>Task</th><th>Category</th><th>Impact</th><th>Effort</th><th>Time</th></tr></thead>`;
    const tbody = document.createElement('tbody');
    d.actions.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${esc(a.task)}</td><td class="muted">${esc(a.category)}</td>
        <td><span class="badge ${a.impact}">${a.impact}</span></td>
        <td class="muted">${esc(a.effort)}</td><td class="mono">${esc(a.time)}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    c.appendChild(table);
  }

  // pricing
  if (d.pricing && d.pricing.length) {
    const h = document.createElement('h3');
    h.textContent = 'Suggested pricing';
    h.style.fontFamily = 'var(--font-display)';
    h.style.margin = '26px 0 10px';
    c.appendChild(h);
    const grid = document.createElement('div');
    grid.className = 'pricing-grid';
    d.pricing.forEach(p => {
      const card = document.createElement('div');
      card.className = 'pricing-card' + (p.popular ? ' popular' : '');
      card.innerHTML = `
        <div class="svc">${esc(p.service)}</div>
        <div class="price">${esc(p.price)}</div>
        <div class="note">${esc(p.note)}</div>
        <ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`;
      grid.appendChild(card);
    });
    c.appendChild(grid);
  }

  (target || $('#analyzeResults')).appendChild(c);
}

// ============================================================
// REPORTS
// ============================================================
async function loadReports() {
  const body = $('#reportsBody');
  const empty = $('#reportsEmpty');
  body.innerHTML = '';
  $('#reportDetail').innerHTML = '';
  try {
    const rows = await api('GET', '/api/reports');
    empty.hidden = rows.length > 0;
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(r.business_name || '—')}</td>
        <td class="mono">${esc(r.url)}</td>
        <td>${esc(r.location || '—')}</td>
        <td>${esc(r.niche || '—')}</td>
        <td class="muted">${new Date(r.created_at).toLocaleDateString()}</td>
        <td style="white-space:nowrap">
          <button class="icon-btn view-btn">View</button>
          <a class="icon-btn" href="/api/report/download/${r.id}">Download</a>
          <button class="icon-btn danger del-btn">Delete</button>
        </td>`;
      tr.querySelector('.view-btn').addEventListener('click', () => viewReport(r.id));
      tr.querySelector('.del-btn').addEventListener('click', () => deleteReport(r.id));
      body.appendChild(tr);
    });
  } catch (e) {
    empty.hidden = false;
    empty.textContent = `Could not load reports: ${e.message}`;
  }
}

async function viewReport(id) {
  const detail = $('#reportDetail');
  detail.innerHTML = '<div class="panel">Loading…</div>';
  try {
    const row = await api('GET', `/api/reports/${id}`);
    detail.innerHTML = '';
    renderAnalysis(row.data, id, detail);
  } catch (e) {
    detail.innerHTML = `<div class="panel form-error">${esc(e.message)}</div>`;
  }
}

async function deleteReport(id) {
  if (!confirm('Delete this report? This cannot be undone.')) return;
  try {
    await api('DELETE', `/api/reports/${id}`);
    loadReports();
  } catch (e) { alert(e.message); }
}

// ============================================================
// EARNINGS
// ============================================================
async function loadEarnings() {
  const body = $('#earningsBody');
  const empty = $('#earningsEmpty');
  const summary = $('#earningsSummary');
  body.innerHTML = '';
  try {
    const rows = await api('GET', '/api/earnings');
    empty.hidden = rows.length > 0;
    const totalRevenue = rows.reduce((s, r) => s + (r.revenue || 0), 0);
    const totalHours = rows.reduce((s, r) => s + (r.hours || 0), 0);
    const rate = totalHours > 0 ? (totalRevenue / totalHours).toFixed(0) : '—';
    summary.innerHTML = `
      <div class="summary-item"><div class="val">${totalRevenue.toLocaleString()}</div><div class="lbl">total revenue</div></div>
      <div class="summary-item"><div class="val">${totalHours}</div><div class="lbl">total hours</div></div>
      <div class="summary-item"><div class="val">${rate}</div><div class="lbl">effective rate / hr</div></div>
      <div class="summary-item"><div class="val">${rows.length}</div><div class="lbl">entries</div></div>`;
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(r.client)}</td><td>${esc(r.service)}</td>
        <td class="mono">${esc(r.hours)}</td><td class="mono">${esc(r.revenue)}</td>
        <td class="muted">${esc(r.month)}</td><td class="muted">${esc(r.notes)}</td>
        <td style="white-space:nowrap">
          <button class="icon-btn edit-btn">Edit</button>
          <button class="icon-btn danger del-btn">Delete</button>
        </td>`;
      tr.querySelector('.edit-btn').addEventListener('click', () => editEarning(r));
      tr.querySelector('.del-btn').addEventListener('click', () => deleteEarning(r.id));
      body.appendChild(tr);
    });
  } catch (e) {
    empty.hidden = false;
    empty.textContent = `Could not load earnings: ${e.message}`;
  }
}

function editEarning(r) {
  $('#e-id').value = r.id;
  $('#e-client').value = r.client || '';
  $('#e-service').value = r.service || '';
  $('#e-hours').value = r.hours || '';
  $('#e-revenue').value = r.revenue || '';
  $('#e-month').value = r.month || '';
  $('#e-notes').value = r.notes || '';
  $('#earningsSubmitBtn').textContent = 'Save changes';
  $('#earningsCancelBtn').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function resetEarningsForm() {
  $('#earningsForm').reset();
  $('#e-id').value = '';
  $('#earningsSubmitBtn').textContent = 'Add earning';
  $('#earningsCancelBtn').hidden = true;
}
$('#earningsCancelBtn').addEventListener('click', resetEarningsForm);

$('#earningsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#e-id').value;
  const payload = {
    client: $('#e-client').value.trim(),
    service: $('#e-service').value.trim(),
    hours: parseFloat($('#e-hours').value) || 0,
    revenue: parseFloat($('#e-revenue').value) || 0,
    month: $('#e-month').value.trim(),
    notes: $('#e-notes').value.trim(),
  };
  try {
    if (id) await api('PUT', `/api/earnings/${id}`, payload);
    else await api('POST', '/api/earnings', payload);
    resetEarningsForm();
    loadEarnings();
  } catch (err) { alert(err.message); }
});

async function deleteEarning(id) {
  if (!confirm('Delete this earning entry?')) return;
  try { await api('DELETE', `/api/earnings/${id}`); loadEarnings(); }
  catch (e) { alert(e.message); }
}

// ============================================================
// CLIENTS
// ============================================================
async function loadClients() {
  const body = $('#clientsBody');
  const empty = $('#clientsEmpty');
  body.innerHTML = '';
  try {
    const rows = await api('GET', '/api/clients');
    empty.hidden = rows.length > 0;
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(r.name)}</td>
        <td class="mono">${esc(r.website)}</td>
        <td class="muted">${esc(r.email)}${r.phone ? ' · ' + esc(r.phone) : ''}</td>
        <td>${esc(r.package)}</td>
        <td><span class="badge ${esc(r.status)}">${esc(r.status)}</span></td>
        <td class="mono">${esc(r.monthly_revenue)}</td>
        <td style="white-space:nowrap">
          <button class="icon-btn edit-btn">Edit</button>
          <button class="icon-btn danger del-btn">Delete</button>
        </td>`;
      tr.querySelector('.edit-btn').addEventListener('click', () => editClient(r));
      tr.querySelector('.del-btn').addEventListener('click', () => deleteClient(r.id));
      body.appendChild(tr);
    });
  } catch (e) {
    empty.hidden = false;
    empty.textContent = `Could not load clients: ${e.message}`;
  }
}

function editClient(r) {
  $('#c-id').value = r.id;
  $('#c-name').value = r.name || '';
  $('#c-website').value = r.website || '';
  $('#c-email').value = r.email || '';
  $('#c-phone').value = r.phone || '';
  $('#c-package').value = r.package || '';
  $('#c-status').value = r.status || 'active';
  $('#c-revenue').value = r.monthly_revenue || '';
  $('#clientsSubmitBtn').textContent = 'Save changes';
  $('#clientsCancelBtn').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function resetClientsForm() {
  $('#clientsForm').reset();
  $('#c-id').value = '';
  $('#clientsSubmitBtn').textContent = 'Add client';
  $('#clientsCancelBtn').hidden = true;
}
$('#clientsCancelBtn').addEventListener('click', resetClientsForm);

$('#clientsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#c-id').value;
  const payload = {
    name: $('#c-name').value.trim(),
    website: $('#c-website').value.trim(),
    email: $('#c-email').value.trim(),
    phone: $('#c-phone').value.trim(),
    package: $('#c-package').value.trim(),
    status: $('#c-status').value,
    monthly_revenue: parseFloat($('#c-revenue').value) || 0,
  };
  try {
    if (id) await api('PUT', `/api/clients/${id}`, payload);
    else await api('POST', '/api/clients', payload);
    resetClientsForm();
    loadClients();
  } catch (err) { alert(err.message); }
});

async function deleteClient(id) {
  if (!confirm('Delete this client?')) return;
  try { await api('DELETE', `/api/clients/${id}`); loadClients(); }
  catch (e) { alert(e.message); }
}

// ============================================================
// SETUP — settings + API status
// ============================================================
async function loadSettings() {
  try {
    const s = await api('GET', '/api/settings');
    Object.keys(s).forEach(k => {
      const el = document.getElementById(`s-${k}`);
      if (el) el.value = s[k];
    });
  } catch (e) { /* leave blank */ }
}

$('#settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {};
  ['app_name', 'currency', 'hourly_rate', 'content_rate_per_word', 'backlink_rate'].forEach(k => {
    const el = document.getElementById(`s-${k}`);
    if (el) payload[k] = el.value;
  });
  const msg = $('#settingsSaved');
  try {
    await api('PUT', '/api/settings', payload);
    msg.style.color = 'var(--pass)';
    msg.textContent = 'Saved.';
    setTimeout(() => { msg.textContent = ''; }, 2500);
  } catch (err) {
    msg.style.color = 'var(--fail)';
    msg.textContent = err.message;
  }
});

const API_SIGNUP_LINKS = {
  moz: 'https://moz.com/products/api/keys',
  dataforseo: 'https://dataforseo.com',
  zenserp: 'https://app.zenserp.com',
  valueserp: 'https://valueserp.com',
};

function renderApiStatusRows(apis) {
  const body = $('#apiStatusBody');
  body.innerHTML = '';
  Object.entries(apis).forEach(([name, info]) => {
    const status = info.status || (info.working ? 'working' : info.configured ? 'configured' : 'not_configured');
    const details = info.message || info.reason || (info.working ? 'Working' : '—');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-transform:capitalize">${esc(name)}</td>
      <td><span class="badge ${esc(status)}">${esc(status)}</span></td>
      <td class="muted" style="font-size:12px">${esc(details)}</td>
      <td><a class="icon-btn" href="${API_SIGNUP_LINKS[name] || '#'}" target="_blank" rel="noopener">Get key ↗</a></td>`;
    body.appendChild(tr);
  });
}

async function loadApiStatus() {
  try {
    const h = await api('GET', '/api/health');
    renderApiStatusRows(h.apis);
  } catch (e) { /* ignore */ }
}

$('#testApisBtn').addEventListener('click', async () => {
  const btn = $('#testApisBtn');
  btn.disabled = true;
  btn.textContent = 'Testing…';
  try {
    const result = await api('GET', '/api/test-apis');
    renderApiStatusRows(result.apis);
  } catch (e) {
    alert(e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Test my API keys';
  }
});

// ============================================================
// INIT
// ============================================================
initNav();
checkHealth();
setInterval(checkHealth, 30000);
