/* 总览页：统计 / 概览面板 / 组分布 / 认定与执行方式分布 */
(function () {
  'use strict';
  const {
    ICONS, Store, escapeHtml, formatNumber, idx, cycleBadge, barRow,
    init, renderDataError
  } = window.OX;

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await init('home');
    if (!data) { renderDataError(document.getElementById('cycle-overview')); return; }
    renderStats();
    renderPanel();
    renderTrio();
    renderCycles();
    renderBars();
  }, { once: true });

  /* 统计条 */
  function renderStats() {
    const host = document.getElementById('stat-strip');
    const m = Store.meta().counts || {};
    const rows = [
      { num: m.skills || 0, label: '技能组', suffix: ' 个' },
      { num: m.procedures || 0, label: '程序卡', suffix: ' 张' },
      { num: m.tools || 0, label: '确定性工具', suffix: ' 个' }
    ];
    host.innerHTML = rows.map(r =>
      `<div class="stat"><div class="stat__num">${formatNumber(r.num)}${r.suffix}</div>` +
      `<div class="stat__label">${r.label}</div></div>`
    ).join('');
  }

  /* Hero 右侧概览面板 */
  function renderPanel() {
    const host = document.getElementById('hero-overview');
    const gen = document.getElementById('panel-gen');
    if (gen) gen.textContent = '更新于 ' + ((Store.meta().generatedAt || '').slice(0, 10) || '—');

    const byCycle = Store.meta().byCycle || {};
    const procByCycle = {};
    Store.procedures().forEach(p => {
      const c = p.skillCode.split('-')[0];
      procByCycle[c] = (procByCycle[c] || 0) + 1;
    });

    const rows = Store.cycles().filter(c => byCycle[c.code]).map(c => {
      const skills = Store.skills().filter(s => s.cycle === c.code);
      return (
        `<a href="skills.html?cycle=${encodeURIComponent(c.code)}" ` +
        `style="display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px dashed var(--line);color:inherit">` +
          cycleBadge(c.code, true) +
          `<span style="flex:1;font-size:12.5px;color:var(--ink-3);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">` +
            skills.map(s => escapeHtml(s.title.replace(/^[^·]*·/, ''))).join('、') +
          `</span>` +
          `<span style="font-size:13px;font-weight:700;color:var(--brand);font-variant-numeric:tabular-nums">${procByCycle[c.code] || 0}</span>` +
          `<span style="font-size:11.5px;color:var(--ink-3)">张</span>` +
        `</a>`
      );
    }).join('');

    host.innerHTML = rows || '<p style="font-size:13.5px;color:var(--ink-3)">暂无数据</p>';
  }

  /* 三件套数字 */
  function renderTrio() {
    const m = Store.meta().counts || {};
    const ts = document.getElementById('tri-skills');
    const tt = document.getElementById('tri-tools');
    if (ts) ts.textContent = `${m.skills || 0} 个技能组 · ${m.procedures || 0} 张程序卡`;
    if (tt) tt.textContent = `${m.tools || 0} 个确定性工具 · 覆盖 ${Object.keys(Store.meta().toolUsage || {}).length} 类调用`;
  }

  /* 组概览 */
  function renderCycles() {
    const host = document.getElementById('cycle-overview');
    const byCycle = Store.meta().byCycle || {};

    const cards = Store.cycles().map(c => {
      const skills = Store.skills().filter(s => s.cycle === c.code);
      const procs = Store.procedures().filter(p => p.skillCode.startsWith(c.code));
      const empty = !skills.length;

      const items = empty
        ? `<p style="font-size:13px;color:var(--ink-3);margin-top:10px">该组技能正在建设中</p>`
        : `<div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:14px">` +
            skills.map(s =>
              `<a class="chip chip--link" href="skill.html?id=${encodeURIComponent(s.id)}">` +
                `${escapeHtml(s.code)} ${escapeHtml(s.title.replace(/^[^·]*·/, ''))}` +
                `<span style="opacity:.6;margin-left:2px">${s.procedures.length}</span>` +
              `</a>`
            ).join('') +
          `</div>`;

      return (
        `<div class="card${empty ? '' : ' card--hover'}" style="margin-bottom:14px${empty ? ';opacity:.6' : ''}">` +
          `<div class="card__body">` +
            `<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">` +
              cycleBadge(c.code, true) +
              `<span style="font-size:14px;font-weight:650">${escapeHtml(c.full)}</span>` +
              `<span class="spacer"></span>` +
              `<span style="font-size:12.5px;color:var(--ink-3)">` +
                `${skills.length} 个技能组 · ${procs.length} 张程序卡` +
              `</span>` +
            `</div>` +
            `<p style="font-size:13px;color:var(--ink-3);margin-top:8px">${escapeHtml(c.desc)}</p>` +
            items +
          `</div>` +
        `</div>`
      );
    }).join('');

    host.innerHTML = cards;
  }

  /* 分布条 */
  function renderBars() {
    const aHost = document.getElementById('assertion-bars');
    const mHost = document.getElementById('mode-bars');

    /* 认定 */
    const byA = Store.meta().byAssertion || {};
    const aList = Store.assertions().map(a => ({ a, n: byA[a.code] || 0 }));
    const aMax = Math.max(1, ...aList.map(x => x.n));
    aHost.innerHTML = aList.map(({ a, n }) =>
      barRow(
        `<span class="as-chip" data-a="${a.code}">${a.code}</span>` +
        `<span style="font-size:13px">${escapeHtml(a.name)}</span>`,
        n, aMax
      )
    ).join('');

    /* 执行方式 */
    const byM = Store.meta().byMode || {};
    const order = ['auto', 'hybrid', 'manual'];
    const mMax = Math.max(1, ...order.map(k => byM[k] || 0));
    const colors = { auto: 'var(--mode-auto)', hybrid: 'var(--mode-hybrid)', manual: 'var(--mode-manual)' };
    mHost.innerHTML = order.map(k => {
      const label = Store.modeLabel(k);
      return barRow(
        `<span class="mode" data-m="${k}"><span class="mode__dot"></span>${escapeHtml(label.name)}</span>`,
        byM[k] || 0, mMax, colors[k]
      );
    }).join('');
  }
})();
