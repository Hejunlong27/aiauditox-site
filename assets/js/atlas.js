/* 程序图谱页：全库程序卡跨科目检索 */
(function () {
  'use strict';
  const {
    ICONS, Store, escapeHtml, debounce, idx, cycleBadge, assertionChips, modeBadge,
    init, renderDataError
  } = window.OX;

  const state = { keyword: '', cycle: '', skill: '', assertion: '', mode: '', tool: '', sort: 'code' };

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await init('atlas');
    if (!data) { renderDataError(document.querySelector('.data-table__wrap')); return; }

    readUrl();
    renderStats();
    buildFilters();
    syncControls();
    render();
    bindEvents();
  }, { once: true });

  /* ---------- URL ---------- */
  function readUrl() {
    const p = new URLSearchParams(location.search);
    ['q', 'cycle', 'skill', 'assertion', 'mode', 'tool', 'sort'].forEach(k => {
      const v = p.get(k);
      if (!v) return;
      if (k === 'q') state.keyword = v;
      else if (k === 'sort') { if (['code', 'name', 'mode'].indexOf(v) !== -1) state.sort = v; }
      else state[k] = v;
    });
  }

  function writeUrl(replace) {
    const p = new URLSearchParams();
    if (state.keyword) p.set('q', state.keyword);
    if (state.cycle) p.set('cycle', state.cycle);
    if (state.skill) p.set('skill', state.skill);
    if (state.assertion) p.set('assertion', state.assertion);
    if (state.mode) p.set('mode', state.mode);
    if (state.tool) p.set('tool', state.tool);
    if (state.sort !== 'code') p.set('sort', state.sort);
    const url = location.pathname + (p.toString() ? '?' + p.toString() : '');
    try { history[replace ? 'replaceState' : 'pushState'](null, '', url); } catch (e) { /* 忽略 */ }
  }

  /* ---------- 统计卡 ---------- */
  function renderStats() {
    const m = Store.meta();
    const c = m.counts || {};
    const usage = m.toolUsage || {};
    const cards = [
      { n: c.procedures || 0, l: '程序卡总数', s: `覆盖 ${c.skills || 0} 个技能组`, icon: ICONS.list, href: '' },
      { n: Object.keys(usage).length, l: '在用的确定性工具', s: `${Object.values(usage).reduce((a, b) => a + b, 0)} 处调用`, icon: ICONS.tool, href: 'tools.html' },
      { n: (c.procedures || 0) - (m.byMode.manual || 0), l: '含自动环节的程序', s: `全自动 ${m.byMode.auto || 0} · 混合 ${m.byMode.hybrid || 0}`, icon: ICONS.zap, href: '' },
      { n: m.byMode.manual || 0, l: '人工主导程序', s: '函证 / 监盘 / 现场查验', icon: ICONS.users, href: '' }
    ];
    document.getElementById('atlas-stats').innerHTML = cards.map(x => {
      const inner =
        `<div style="display:flex;align-items:flex-start;gap:12px">` +
          `<span class="tool-card__icon" style="width:34px;height:34px">${x.icon}</span>` +
          `<div>` +
            `<div style="font-size:24px;font-weight:700;color:var(--brand);line-height:1.2;font-variant-numeric:tabular-nums">${x.n}</div>` +
            `<div style="font-size:13px;font-weight:600;margin-top:3px">${escapeHtml(x.l)}</div>` +
            `<div style="font-size:11.5px;color:var(--ink-3);margin-top:2px">${escapeHtml(x.s)}</div>` +
          `</div>` +
        `</div>`;
      return x.href
        ? `<a class="card card--hover" href="${x.href}" style="color:inherit"><div class="card__body">${inner}</div></a>`
        : `<div class="card"><div class="card__body">${inner}</div></div>`;
    }).join('');
  }

  /* ---------- 筛选控件 ---------- */
  function buildFilters() {
    const byCycle = Store.meta().byCycle || {};
    document.getElementById('cycle-filters').innerHTML =
      `<span class="filter-label">组</span>` +
      `<button class="chip" type="button" data-f="cycle" data-v="">全部</button>` +
      Store.cycles().filter(c => byCycle[c.code]).map(c =>
        `<button class="chip" type="button" data-f="cycle" data-v="${escapeHtml(c.code)}">` +
          `${escapeHtml(c.code)} · ${escapeHtml(c.name)}` +
          `<span style="opacity:.6">${Store.procedures().filter(p => p.skillCode.startsWith(c.code)).length}</span></button>`
      ).join('');

    document.getElementById('skill-filters').innerHTML =
      `<span class="filter-label">技能组</span>` +
      `<button class="chip" type="button" data-f="skill" data-v="">全部</button>` +
      Store.skills().map(s =>
        `<button class="chip" type="button" data-f="skill" data-v="${escapeHtml(s.id)}" data-cyc="${escapeHtml(s.cycle)}">` +
          `${escapeHtml(s.code)}<span style="opacity:.6">${s.procedures.length}</span></button>`
      ).join('');

    const byA = Store.meta().byAssertion || {};
    document.getElementById('assertion-filters').innerHTML =
      `<span class="filter-label">认定</span>` +
      `<button class="chip" type="button" data-f="assertion" data-v="">全部</button>` +
      Store.assertions().map(a =>
        `<button class="chip" type="button" data-f="assertion" data-v="${escapeHtml(a.code)}" title="${escapeHtml(a.desc)}">` +
          `${escapeHtml(a.code)} ${escapeHtml(a.name)}<span style="opacity:.6">${byA[a.code] || 0}</span></button>`
      ).join('');

    const byM = Store.meta().byMode || {};
    document.getElementById('mode-filters').innerHTML =
      `<span class="filter-label">执行方式</span>` +
      `<button class="chip" type="button" data-f="mode" data-v="">全部</button>` +
      ['auto', 'hybrid', 'manual'].map(k => {
        const l = Store.modeLabel(k);
        return `<button class="chip" type="button" data-f="mode" data-v="${k}" title="${escapeHtml(l.desc)}">` +
          `${escapeHtml(l.name)}<span style="opacity:.6">${byM[k] || 0}</span></button>`;
      }).join('');

    const usage = Store.meta().toolUsage || {};
    document.getElementById('tool-filters').innerHTML =
      `<span class="filter-label">工具</span>` +
      `<button class="chip" type="button" data-f="tool" data-v="">全部</button>` +
      Object.keys(usage).sort((a, b) => usage[b] - usage[a]).map(t => {
        const meta = Store.tool(t);
        return `<button class="chip" type="button" data-f="tool" data-v="${escapeHtml(t)}" title="${escapeHtml(meta ? meta.summary : '')}">` +
          `${escapeHtml(meta ? meta.name : t)}<span style="opacity:.6">${usage[t]}</span></button>`;
      }).join('');
  }

  function syncControls() {
    document.getElementById('search-input').value = state.keyword;
    document.getElementById('sort-select').value = state.sort;
    document.querySelectorAll('[data-f]').forEach(b => {
      b.classList.toggle('is-active', state[b.getAttribute('data-f')] === b.getAttribute('data-v'));
    });
    document.querySelectorAll('#skill-filters [data-cyc]').forEach(b => {
      b.hidden = !!state.cycle && b.getAttribute('data-cyc') !== state.cycle;
    });
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const body = document.getElementById('atlas-body');
    const countHost = document.getElementById('result-count');
    const list = Store.queryProcedures(state);

    if (!list.length) {
      countHost.innerHTML = '没有匹配的结果';
      body.innerHTML =
        `<tr><td colspan="7" style="padding:56px 24px">` +
          `<div class="empty" style="padding:0">${ICONS.inbox}` +
            `<div class="empty__title">没有找到匹配的程序卡</div>` +
            `<p class="empty__desc">试试换个关键词，或清空筛选条件。</p>` +
            `<button class="btn btn--primary" type="button" id="empty-reset">清空筛选</button>` +
          `</div></td></tr>`;
      const b = document.getElementById('empty-reset');
      if (b) b.addEventListener('click', resetAll);
      return;
    }

    const cond = [];
    if (state.cycle) { const c = Store.cycle(state.cycle); if (c) cond.push(c.name + '组'); }
    if (state.skill) { const s = Store.skill(state.skill); if (s) cond.push(s.code + ' ' + s.title.replace(/^[^·]*·/, '')); }
    if (state.assertion) { const a = Store.assertion(state.assertion); if (a) cond.push('认定 ' + a.name); }
    if (state.mode) cond.push(Store.modeLabel(state.mode).name);
    if (state.tool) { const t = Store.tool(state.tool); cond.push('工具 ' + (t ? t.name : state.tool)); }

    countHost.innerHTML =
      `共 <strong>${list.length}</strong> 张程序卡` +
      (cond.length ? `<span style="color:var(--line-2)"> · </span>${escapeHtml(cond.join(' · '))}` : '');

    body.innerHTML = list.map(p => {
      const s = Store.skill(p.skillId);
      const href = p.detail && p.detail.hasCard
        ? `procedure.html?skill=${encodeURIComponent(p.skillId)}&p=${encodeURIComponent(p.id)}`
        : `skill.html?id=${encodeURIComponent(p.skillId)}#procedures`;

      const toolHtml = p.tools.length
        ? p.tools.map(t => {
            const meta = Store.tool(t);
            return `<a class="chip chip--link" href="atlas.html?tool=${encodeURIComponent(t)}" ` +
              `title="${escapeHtml(meta ? meta.summary : t)}">${escapeHtml(meta ? meta.name : t)}</a>`;
          }).join(' ')
        : `<span style="font-size:12.5px;color:var(--ink-3)">—</span>`;

      /* 产出底稿：标准索引号用 idx 徽标；非标准的长文本（如「联动 Z-1-2-05…」）
         截断显示，全文放 title —— 固定列宽下不截断会把行高撑得很夸张 */
      const outHtml = p.index
        ? idx(p.index)
        : (p.output
            ? `<span style="font-size:12px;color:var(--ink-3)" title="${escapeHtml(p.output)}">` +
              `${escapeHtml(p.output.length > 9 ? p.output.slice(0, 9) + '…' : p.output)}</span>`
            : '<span style="font-size:12px;color:var(--ink-3)">—</span>');

      return (
        `<tr>` +
          `<td><span class="proc-row__id">${escapeHtml(p.id)}</span></td>` +
          `<td>` +
            `<a href="${href}" style="font-size:14px;font-weight:600;color:var(--ink)">${escapeHtml(p.name)}</a>` +
            (p.source ? `<div style="font-size:11.5px;color:var(--ink-3);margin-top:2px">${escapeHtml(p.source)}</div>` : '') +
          `</td>` +
          `<td>` +
            (s ? `<a href="skill.html?id=${encodeURIComponent(s.id)}" style="display:flex;align-items:center;gap:6px">` +
                  idx(s.code) + `<span style="font-size:12.5px;color:var(--ink-2)">${escapeHtml(s.title.replace(/^[^·]*·/, ''))}</span>` +
                `</a>` : '—') +
          `</td>` +
          `<td><div style="display:flex;gap:4px;flex-wrap:wrap">${assertionChips(p.assertions)}</div></td>` +
          `<td title="${escapeHtml(p.modeText)}">${modeBadge(p.mode)}</td>` +
          `<td><div style="display:flex;gap:5px;flex-wrap:wrap">${toolHtml}</div></td>` +
          `<td>${outHtml}</td>` +
        `</tr>`
      );
    }).join('');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    const search = document.getElementById('search-input');
    search.addEventListener('input', debounce(() => {
      state.keyword = search.value.trim();
      writeUrl(true);
      render();
    }, 200));

    document.getElementById('sort-select').addEventListener('change', e => {
      state.sort = e.target.value;
      writeUrl();
      render();
    });

    document.getElementById('reset-btn').addEventListener('click', resetAll);

    document.addEventListener('click', e => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      const f = b.getAttribute('data-f');
      const v = b.getAttribute('data-v');
      state[f] = state[f] === v ? '' : v;
      if (f === 'cycle') {
        if (state.skill) {
          const s = Store.skill(state.skill);
          if (s && s.cycle !== state.cycle) state.skill = '';
        }
      }
      if (f === 'skill' && state.skill) {
        const s = Store.skill(state.skill);
        if (s) state.cycle = s.cycle;
      }
      syncControls();
      writeUrl();
      render();
    });

    window.addEventListener('popstate', () => {
      readUrl();
      syncControls();
      render();
    });
  }

  function resetAll() {
    Object.assign(state, { keyword: '', cycle: '', skill: '', assertion: '', mode: '', tool: '', sort: 'code' });
    syncControls();
    writeUrl();
    render();
  }
})();
