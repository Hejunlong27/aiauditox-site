/* 技能库页：组 / 报表项目 / 认定 / 执行方式 / 工具 五维筛选 + 搜索 + 排序 */
(function () {
  'use strict';
  const { ICONS, Store, escapeHtml, debounce, init, renderDataError, skillCard } = window.OX;

  const state = { keyword: '', cycle: '', group: '', assertion: '', mode: '', tool: '', sort: 'code' };

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await init('skills');
    const listHost = document.getElementById('skill-list');
    if (!data) { renderDataError(listHost); return; }

    readUrl();
    buildFilters();
    syncControls();
    render();
    bindEvents();
  }, { once: true });

  /* ---------- URL <-> state ---------- */
  function readUrl() {
    const p = new URLSearchParams(location.search);
    ['q', 'cycle', 'group', 'assertion', 'mode', 'tool', 'sort'].forEach(k => {
      const v = p.get(k);
      if (!v) return;
      if (k === 'q') state.keyword = v;
      else if (k === 'sort') { if (['code', 'name', 'procs'].indexOf(v) !== -1) state.sort = v; }
      else state[k] = v;
    });
  }

  function writeUrl(replace) {
    const p = new URLSearchParams();
    if (state.keyword) p.set('q', state.keyword);
    if (state.cycle) p.set('cycle', state.cycle);
    if (state.group) p.set('group', state.group);
    if (state.assertion) p.set('assertion', state.assertion);
    if (state.mode) p.set('mode', state.mode);
    if (state.tool) p.set('tool', state.tool);
    if (state.sort !== 'code') p.set('sort', state.sort);
    const url = location.pathname + (p.toString() ? '?' + p.toString() : '');
    try { history[replace ? 'replaceState' : 'pushState'](null, '', url); } catch (e) { /* file:// 下忽略 */ }
  }

  /* ---------- 筛选控件 ---------- */
  /* ---------- 报表项目组的成员与所属「组」 ---------- */
  /* 一个报表项目组可能横跨多个「组」：如「应付职工薪酬」同时含
     F-6 应付职工薪酬（负债）与 S-12 工资费用（损益）—— 同一个工薪循环的两面。
     因此凡是「判断某报表项目属于哪个组」的地方，都必须走这两个函数，
     不能用分组编码前缀去猜。 */
  function groupMembers(code) {
    return Store.skills().filter(s => s.reportGroup === code);
  }
  function groupCycles(code) {
    return [...new Set(groupMembers(code).map(s => s.cycle))];
  }

  function buildFilters() {
    /* 组 */
    const byCycle = Store.meta().byCycle || {};
    document.getElementById('cycle-filters').innerHTML =
      `<span class="filter-label">组</span>` +
      `<button class="chip" type="button" data-f="cycle" data-v="">全部</button>` +
      Store.cycles().filter(c => byCycle[c.code]).map(c =>
        `<button class="chip" type="button" data-f="cycle" data-v="${escapeHtml(c.code)}">` +
          `${escapeHtml(c.code)} · ${escapeHtml(c.name)}` +
          `<span style="opacity:.6">${byCycle[c.code]}</span></button>`
      ).join('');

    /* 报表项目 */
    document.getElementById('group-filters').innerHTML =
      `<span class="filter-label">报表项目</span>` +
      `<button class="chip" type="button" data-f="group" data-v="">全部</button>` +
      Store.reportGroups().map(g => {
        const n = groupMembers(g.code).length;
        if (!n) return '';
        return `<button class="chip" type="button" data-f="group" data-v="${escapeHtml(g.code)}" data-cyc="${escapeHtml(groupCycles(g.code).join(','))}">` +
          `${escapeHtml(g.name)}<span style="opacity:.6">${n}</span></button>`;
      }).join('');

    /* 认定 */
    const byA = Store.meta().byAssertion || {};
    document.getElementById('assertion-filters').innerHTML =
      `<span class="filter-label">认定</span>` +
      `<button class="chip" type="button" data-f="assertion" data-v="">全部</button>` +
      Store.assertions().map(a =>
        `<button class="chip" type="button" data-f="assertion" data-v="${escapeHtml(a.code)}" title="${escapeHtml(a.desc)}">` +
          `${escapeHtml(a.code)} ${escapeHtml(a.name)}<span style="opacity:.6">${byA[a.code] || 0}</span></button>`
      ).join('');

    /* 执行方式 */
    const byM = Store.meta().byMode || {};
    document.getElementById('mode-filters').innerHTML =
      `<span class="filter-label">执行方式</span>` +
      `<button class="chip" type="button" data-f="mode" data-v="">全部</button>` +
      ['auto', 'hybrid', 'manual'].map(k => {
        const l = Store.modeLabel(k);
        return `<button class="chip" type="button" data-f="mode" data-v="${k}" title="${escapeHtml(l.desc)}">` +
          `${escapeHtml(l.name)}<span style="opacity:.6">${byM[k] || 0}</span></button>`;
      }).join('');

    /* 工具 */
    const usage = Store.meta().toolUsage || {};
    const tools = Object.keys(usage).sort((a, b) => usage[b] - usage[a]);
    document.getElementById('tool-filters').innerHTML =
      `<span class="filter-label">工具</span>` +
      `<button class="chip" type="button" data-f="tool" data-v="">全部</button>` +
      tools.map(t => {
        const meta = Store.tool(t);
        return `<button class="chip" type="button" data-f="tool" data-v="${escapeHtml(t)}" title="${escapeHtml(meta ? meta.summary : '')}">` +
          `${escapeHtml(meta ? meta.name : t)}<span style="opacity:.6">${usage[t]}</span></button>`;
      }).join('');
  }

  function syncControls() {
    document.getElementById('search-input').value = state.keyword;
    document.getElementById('sort-select').value = state.sort;
    document.querySelectorAll('[data-f]').forEach(b => {
      const on = state[b.getAttribute('data-f')] === b.getAttribute('data-v');
      b.classList.toggle('is-active', on);
    });
    /* 报表项目随组联动：选中组时只显示该组下的报表项目。
       data-cyc 是逗号分隔的组列表 —— 跨组的报表项目（如工薪循环的「应付职工薪酬」）
       只要命中选中组之一就显示。 */
    document.querySelectorAll('#group-filters [data-cyc]').forEach(b => {
      const cycs = (b.getAttribute('data-cyc') || '').split(',');
      b.hidden = !!state.cycle && cycs.indexOf(state.cycle) === -1;
    });
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const host = document.getElementById('skill-list');
    const countHost = document.getElementById('result-count');
    /* state 里的键是 group（与 URL 参数一致），数据层的字段名是 reportGroup，这里显式对接 */
    const list = Store.querySkills(Object.assign({}, state, { reportGroup: state.group }));

    if (!list.length) {
      countHost.innerHTML = '没有匹配的结果';
      host.innerHTML =
        `<div class="empty" style="grid-column:1/-1">${ICONS.inbox}` +
          `<div class="empty__title">没有找到匹配的技能组</div>` +
          `<p class="empty__desc">试试换个关键词，或清空筛选条件。</p>` +
          `<button class="btn btn--primary" type="button" id="empty-reset">清空筛选</button>` +
        `</div>`;
      const b = document.getElementById('empty-reset');
      if (b) b.addEventListener('click', resetAll);
      return;
    }

    const cond = [];
    if (state.cycle) { const c = Store.cycle(state.cycle); if (c) cond.push(c.name + '组'); }
    if (state.group) { const g = Store.reportGroup(state.group); if (g) cond.push(g.name); }
    if (state.assertion) { const a = Store.assertion(state.assertion); if (a) cond.push('认定 ' + a.name); }
    if (state.mode) cond.push(Store.modeLabel(state.mode).name);
    if (state.tool) { const t = Store.tool(state.tool); cond.push('工具 ' + (t ? t.name : state.tool)); }

    const procs = list.reduce((n, s) => n + s.procedures.length, 0);
    countHost.innerHTML =
      `共 <strong>${list.length}</strong> 个技能组 · <strong>${procs}</strong> 张程序卡` +
      (cond.length ? `<span style="color:var(--line-2)"> · </span>${escapeHtml(cond.join(' · '))}` : '');

    host.innerHTML = list.map(s => skillCard(s)).join('');
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

    /* 所有筛选 chips 统一委托 */
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      const f = b.getAttribute('data-f');
      const v = b.getAttribute('data-v');
      state[f] = state[f] === v ? '' : v;
      /* 组变化时清掉不匹配的报表项目筛选。
         注意：要按「该报表项目实际所属的组」判断（可能多个），
         不能用 state.group.startsWith(state.cycle) —— 跨组的工薪循环会被误清。
         state.cycle 为空（=全部）时不清。 */
      if (f === 'cycle' && state.cycle && state.group
          && groupCycles(state.group).indexOf(state.cycle) === -1) {
        state.group = '';
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
    Object.assign(state, { keyword: '', cycle: '', group: '', assertion: '', mode: '', tool: '', sort: 'code' });
    syncControls();
    writeUrl();
    render();
  }
})();
