/* 能力模块详情页：定位 / 触发场景 / 铁律 / 系统架构(1+N) / 路由 / 工作模式 / 输出规范 / 反模式 / 配套资源 / 更新记录 */
(function () {
  'use strict';
  const {
    ICONS, Store, escapeHtml, safeUrl, qs, formatDate, mdToHtml,
    renderItems, renderSteps, init, renderDataError,
    skillhubBlock, skillhubConfig, buildPrompt
  } = window.OX;

  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('module-root');
    const data = await init('modules');
    if (!data) { renderDataError(root); return; }

    const id = qs('id');
    const m = id ? Store.module(id) : null;
    if (!m) { root.innerHTML = notFound('没有找到这个能力模块，它可能已被移除或链接有误'); return; }

    document.title = `${m.name} · 审小牛 AIAuditOx`;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', m.description || '');

    root.innerHTML = shell(m);
    bindEvents();
  }, { once: true });

  /* ---------- 骨架 ---------- */
  function shell(m) {
    const roles = (m.architecture && m.architecture.roles) || [];

    const anchors = [
      ['position', '定位'], ['triggers', '触发场景'], ['rules', '铁律'],
      ['arch', '系统架构'], ['routing', '路由决策'], ['modes', '工作模式'],
      ['output', '输出规范'], ['anti', '反模式'], ['assets', '配套资源'],
      ['changelog', '更新记录']
    ].filter(([k]) => ({
      position: m.positioning, triggers: m.triggers.length, rules: m.ironRules.length,
      arch: roles.length, routing: m.routing, modes: m.workModes.length,
      output: m.outputRules.length, anti: m.antiPatterns.length,
      assets: m.resources.length, changelog: (m.changelog || []).length
    }[k]));

    return (
      `<nav class="crumb" aria-label="面包屑">` +
        `<a href="index.html">总览</a>${ICONS.chevronRight}` +
        `<a href="modules.html">能力模块</a>${ICONS.chevronRight}` +
        `<span class="crumb__current">${escapeHtml(m.name)}</span>` +
      `</nav>` +

      `<header class="detail-head" style="margin-top:20px">` +
        `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">` +
          `<span class="mod-chip">${ICONS.puzzle}${escapeHtml(m.category || '能力模块')}</span>` +
          `<span class="badge badge--muted">v${escapeHtml(m.version)}</span>` +
          `<span class="badge badge--muted">${roles.length} 个子技能</span>` +
        `</div>` +
        `<h1 class="detail-head__title" style="margin-top:12px">${escapeHtml(m.fullName || m.name)}</h1>` +
        `<p class="detail-summary">${escapeHtml(m.description || m.tagline || '')}</p>` +
      `</header>` +

      `<nav class="anchor-nav" aria-label="本页导航">` +
        anchors.map(([k, t]) => `<a href="#${k}">${escapeHtml(t)}</a>`).join('') +
      `</nav>` +

      `<div class="detail-layout">` +
        `<div class="stack-lg">` +
          positionSection(m) +
          triggersSection(m) +
          rulesSection(m) +
          archSection(m) +
          codeSection('routing', '路由决策', 'Routing', ICONS.route, m.routing,
            '总控如何识别任务并分派到子技能；子技能之间不互相调用。') +
          modesSection(m) +
          outputSection(m) +
          antiSection(m) +
          assetsSection(m) +
          changelogSection(m) +

          `<div class="alert alert--info">${ICONS.info}<div>` +
            `<div class="alert__title">使用须知</div>` +
            `<p>模块产出为分析与参考结论，不构成审计意见、财务意见或投资建议；标注「待人工确认」「推算结果」的内容未经复核不得用于正式报告或对外披露。</p>` +
          `</div></div>` +
        `</div>` +

        `<aside class="sidebar">` +
          moduleDownloadCard(m) +
          `<div class="card"><div class="card__body">` +
            `<h2 class="sidebar__title">模块信息</h2>` +
            `<div class="kv">` +
              `<span class="kv__k">分类</span><span class="kv__v">${escapeHtml(m.category || '能力模块')}</span>` +
              `<span class="kv__k">子技能</span><span class="kv__v">${roles.length} 个</span>` +
              `<span class="kv__k">参考文档</span><span class="kv__v">${(m.assets.references || []).length} 份</span>` +
              `<span class="kv__k">脚本</span><span class="kv__v">${(m.assets.scripts || []).length} 个</span>` +
              `<span class="kv__k">版本</span><span class="kv__v">v${escapeHtml(m.version)}</span>` +
              `<span class="kv__k">模块 id</span><span class="kv__v" style="font-family:var(--font-mono);font-size:12.5px">${escapeHtml(m.id)}</span>` +
            `</div>` +
            `<button class="btn btn--quiet btn--block" type="button" style="margin-top:12px" data-copy-text="${escapeHtml(m.id)}">${ICONS.copy}复制模块 id</button>` +
          `</div></div>` +
          rolesSidebar(m) +
        `</aside>` +
      `</div>`
    );
  }

  /* ---------- 定位 ---------- */
  function positionSection(m) {
    const core = m.coreQuestions
      ? `<div class="mod-core">${ICONS.target}<span style="margin-left:8px">${escapeHtml(m.coreQuestions)}</span></div>`
      : '';
    const body = m.positioning
      ? `<div class="prose" style="margin-top:16px">${mdToHtml(m.positioning)}</div>`
      : '';
    const na = m.notApplicable
      ? `<div class="alert alert--warn" style="margin-top:16px">${ICONS.alert}<div>` +
          `<div class="alert__title">不适用</div>` +
          `<p>${escapeHtml(m.notApplicable.replace(/^\*\*[^*]*\*\*[：:]\s*/, ''))}</p>` +
        `</div></div>`
      : '';
    return (
      `<section class="card" id="position"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${ICONS.target}</span>定位` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">Positioning</span>` +
        `</h2>` + core + body + na +
      `</div></section>`
    );
  }

  /* ---------- 触发场景 ---------- */
  function triggersSection(m) {
    if (!m.triggers.length) return '';
    return (
      `<section class="card" id="triggers"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${ICONS.message}</span>触发场景` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">When to use</span>` +
        `</h2>` +
        `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">满足任一场景即可加载本模块。</p>` +
        `<div class="data-table__wrap" style="margin-top:16px"><table class="data-table">` +
          `<thead><tr><th style="width:150px">场景</th><th>用户典型说法</th></tr></thead>` +
          `<tbody>` + m.triggers.map(t =>
            `<tr><td style="font-weight:600">${escapeHtml(t.scene)}</td><td>${escapeHtml(t.say)}</td></tr>`
          ).join('') + `</tbody>` +
        `</table></div>` +
      `</div></section>`
    );
  }

  /* ---------- 铁律 ---------- */
  function rulesSection(m) {
    if (!m.ironRules.length) return '';
    return (
      `<section class="card" id="rules"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${ICONS.shieldCheck}</span>铁律` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">Iron rules</span>` +
        `</h2>` +
        `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">违反即回退重做。</p>` +
        `<div style="margin-top:16px">${renderSteps(m.ironRules)}</div>` +
      `</div></section>`
    );
  }

  /* ---------- 系统架构（1 + N） ---------- */
  function archSection(m) {
    const roles = (m.architecture && m.architecture.roles) || [];
    if (!roles.length && !m.architecture.diagram) return '';
    const diagram = m.architecture.diagram
      ? `<div class="prose"><pre><code>${escapeHtml(m.architecture.diagram)}</code></pre></div>`
      : '';
    const grid = roles.length
      ? `<div class="mod-roles" style="margin-top:18px">` + roles.map(r =>
          `<div class="mod-role">` +
            `<div class="mod-role__head">` +
              `<span class="mod-role__no">${escapeHtml(r.no || '')}</span>` +
              `<div style="min-width:0">` +
                `<div class="mod-role__name">${escapeHtml(r.name)}</div>` +
                `<div class="mod-role__dir">${escapeHtml(r.dir)}</div>` +
              `</div>` +
            `</div>` +
            (r.duty ? `<div class="mod-role__duty">${escapeHtml(r.duty)}</div>` : '') +
          `</div>`
        ).join('') + `</div>`
      : '';
    return (
      `<section class="card" id="arch"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${ICONS.workflow}</span>系统架构` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">1 + ${roles.length}</span>` +
        `</h2>` +
        `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">总控负责识别与编排，子技能只通过标准数据集交换数据，互不调用。</p>` +
        `<div style="margin-top:16px">${diagram}${grid}</div>` +
      `</div></section>`
    );
  }

  /* ---------- 代码块章节（路由决策 / 调用契约等） ---------- */
  function codeSection(id, title, en, icon, code, desc) {
    if (!code) return '';
    return (
      `<section class="card" id="${id}"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${icon}</span>${escapeHtml(title)}` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">${escapeHtml(en)}</span>` +
        `</h2>` +
        (desc ? `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">${escapeHtml(desc)}</p>` : '') +
        `<div class="prose" style="margin-top:16px"><pre><code>${escapeHtml(code)}</code></pre></div>` +
      `</div></section>`
    );
  }

  /* ---------- 工作模式 ---------- */
  function modesSection(m) {
    if (!m.workModes.length) return '';
    return (
      `<section id="modes">` +
        `<h2 class="section__title" style="font-size:20px;margin-bottom:6px">工作模式</h2>` +
        `<p class="section__desc" style="margin-bottom:16px">按任务深度选择链路，默认标准分析。</p>` +
        `<div class="grid grid--3">` + m.workModes.map(w =>
          `<div class="mod-mode">` +
            `<div class="mod-mode__name">${escapeHtml(w.mode)}</div>` +
            `<div class="mod-mode__row"><span class="mod-mode__k">适用</span>${escapeHtml(w.for)}</div>` +
            `<div class="mod-mode__row"><span class="mod-mode__k">链路</span>${escapeHtml(w.chain)}</div>` +
            `<div class="mod-mode__row"><span class="mod-mode__k">交付</span>${escapeHtml(w.deliver)}</div>` +
          `</div>`
        ).join('') + `</div>` +
      `</section>`
    );
  }

  /* ---------- 输出规范 ---------- */
  function outputSection(m) {
    if (!m.outputRules.length) return '';
    return (
      `<section class="card" id="output"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${ICONS.clipboard}</span>输出规范` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">Output spec</span>` +
        `</h2>` +
        `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">任何交付物都必须满足。</p>` +
        `<div style="margin-top:16px">${renderItems(m.outputRules)}</div>` +
      `</div></section>`
    );
  }

  /* ---------- 反模式 ---------- */
  function antiSection(m) {
    if (!m.antiPatterns.length) return '';
    return (
      `<section class="card" id="anti"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${ICONS.x}</span>反模式` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">Anti-patterns</span>` +
        `</h2>` +
        `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">禁止出现。</p>` +
        `<ul class="warn-list">` + m.antiPatterns.map(a => `<li>${escapeHtml(a)}</li>`).join('') + `</ul>` +
      `</div></section>`
    );
  }

  /* ---------- 配套资源 ---------- */
  function assetsSection(m) {
    if (!m.resources.length) return '';
    const a = m.assets || {};
    const chips =
      `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">` +
        `<span class="badge badge--muted">参考文档 ${(a.references || []).length}</span>` +
        `<span class="badge badge--muted">确定性脚本 ${(a.scripts || []).length}</span>` +
        `<span class="badge badge--muted">示例数据 ${(a.examples || []).length}</span>` +
      `</div>`;
    const table =
      `<div class="data-table__wrap" style="margin-top:16px"><table class="data-table">` +
        `<thead><tr><th style="width:280px">文件</th><th>内容</th></tr></thead>` +
        `<tbody>` + m.resources.map(r =>
          `<tr><td><span class="mod-asset__file">${escapeHtml(r.file)}</span></td><td>${escapeHtml(r.desc)}</td></tr>`
        ).join('') + `</tbody>` +
      `</table></div>`;
    return (
      `<section class="card" id="assets"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${ICONS.folder}</span>配套资源` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">Bundle</span>` +
        `</h2>` +
        `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">随模块分发的参考文档、确定性脚本与示例数据。</p>` +
        chips + table +
      `</div></section>`
    );
  }

  /* ---------- 更新记录 ---------- */
  function changelogSection(m) {
    const rows = m.changelog || [];
    if (!rows.length) return '';
    return (
      `<section class="card" id="changelog"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${ICONS.clock}</span>更新记录` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">Changelog</span>` +
        `</h2>` +
        `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">共 ${rows.length} 条，按时间倒序。</p>` +
        `<div style="margin-top:16px"><ol class="chg-list">` + rows.map(r =>
          `<li class="chg-item">` +
            `<span class="chg-date">${ICONS.calendar}${escapeHtml(formatDate(r.date))} 更新</span>` +
            `<span class="chg-text">${escapeHtml(r.content)}</span>` +
          `</li>`
        ).join('') + `</ol></div>` +
      `</div></section>`
    );
  }

  /* ---------- 侧栏：下载 ---------- */
  function moduleDownloadCard(m) {
    const d = m.download || {};
    const url = safeUrl(d.url);
    const provider = d.provider === 'quark' ? '夸克网盘' : (d.provider || '网盘');
    const meta =
      `<div class="dl-meta">` +
        `<div class="dl-meta__item"><div class="dl-meta__label">存储方式</div><div class="dl-meta__value">${escapeHtml(provider)}</div></div>` +
        `<div class="dl-meta__item"><div class="dl-meta__label">包大小</div><div class="dl-meta__value">${escapeHtml(d.size || '—')}</div></div>` +
        `<div class="dl-meta__item"><div class="dl-meta__label">版本</div><div class="dl-meta__value">v${escapeHtml(m.version)}</div></div>` +
        `<div class="dl-meta__item"><div class="dl-meta__label">子技能</div><div class="dl-meta__value">${((m.architecture && m.architecture.roles) || []).length} 个</div></div>` +
      `</div>` +
      (d.format ? `<div style="margin-bottom:18px"><div class="dl-meta__label">包含内容</div><div class="dl-meta__value" style="font-weight:500">${escapeHtml(d.format)}</div></div>` : '') +
      (d.code
        ? `<div style="margin-bottom:20px"><div class="dl-meta__label" style="margin-bottom:6px">提取码</div>` +
            `<span class="dl-code"><span>${escapeHtml(d.code)}</span>` +
            `<button type="button" data-copy-code="${escapeHtml(d.code)}" title="复制提取码" aria-label="复制提取码">${ICONS.copy}</button>` +
          `</span></div>`
        : '');

    const hasSh = !!(d.skillhub && d.skillhub.slug);
    const copyText = `${m.name}（${m.id} · v${m.version}）\n网盘下载：${d.url || ''}` +
                     (d.code ? `\n提取码：${d.code}` : '') +
                     (hasSh ? `\n\n安装到 AI 助手：\n` + buildPrompt(skillhubConfig(), d.skillhub.slug) : '');
    const copyLabel = hasSh ? '复制下载信息' : '复制链接与提取码';

    const body = url
      ? meta +
        `<div class="dl-actions">` +
          `<a class="btn btn--accent btn--lg" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer nofollow" data-quark-jump="${escapeHtml(m.id)}">` +
            `${ICONS.download}前往夸克网盘下载` +
          `</a>` +
          `<button class="btn btn--ghost btn--lg" type="button" data-copy-text="${escapeHtml(copyText)}">${ICONS.copy}${copyLabel}</button>` +
        `</div>` +
        `<div class="dl-note"><strong>提示：</strong>点击后将在新标签页打开${escapeHtml(provider)}。` +
          `${d.note ? escapeHtml(d.note) : '请先转存到自己的网盘再下载，避免链接失效。'}</div>`
      : meta +
        `<div class="dl-empty">` +
          (hasSh
            ? '该模块暂未开放网盘下载，可用下方 SkillHub 方式安装'
            : '该模块暂未开放下载，可通过<a href="contact.html">联系我们</a>获取') +
        `</div>` +
        `<div class="dl-actions" style="margin-top:14px">` +
          `<button class="btn btn--ghost" type="button" data-copy-page-link>${ICONS.copy}复制本页链接</button>` +
        `</div>`;

    return (
      `<section class="dl-card" id="download" aria-labelledby="dl-title">` +
        `<div class="dl-card__head">${ICONS.download}<h3 id="dl-title">下载能力模块</h3></div>` +
        `<div class="dl-card__body">${body}${skillhubBlock(d)}</div>` +
      `</section>`
    );
  }

  /* ---------- 侧栏：子技能 ---------- */
  function rolesSidebar(m) {
    const roles = (m.architecture && m.architecture.roles) || [];
    if (!roles.length) return '';
    return (
      `<div class="card"><div class="card__body">` +
        `<h2 class="sidebar__title">子技能</h2>` +
        `<div class="stack-sm">` + roles.map(r =>
          `<div style="display:flex;gap:9px;align-items:flex-start;padding:7px 0;border-bottom:1px dashed var(--line)">` +
            `<span class="mod-role__no" style="width:22px;height:22px;font-size:11px">${escapeHtml(r.no || '')}</span>` +
            `<div style="min-width:0">` +
              `<div style="font-size:13.5px;font-weight:600;color:var(--ink-2)">${escapeHtml(r.name)}</div>` +
              `<div style="font-size:11.5px;color:var(--ink-3);font-family:var(--font-mono);margin-top:1px">${escapeHtml(r.id)}</div>` +
            `</div>` +
          `</div>`
        ).join('') + `</div>` +
      `</div></div>`
    );
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    document.querySelectorAll('.anchor-nav a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) window.scrollTo({ top: t.offsetTop - 84, behavior: 'smooth' });
      });
    });
  }

  /* ---------- 未找到 ---------- */
  function notFound(msg) {
    return (
      `<div class="empty" style="padding:100px 24px">${ICONS.inbox}` +
        `<div class="empty__title">能力模块不存在</div>` +
        `<p class="empty__desc">${escapeHtml(msg)}</p>` +
        `<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">` +
          `<a class="btn btn--primary" href="modules.html">返回能力模块</a>` +
          `<a class="btn btn--ghost" href="skills.html">浏览技能库</a>` +
        `</div>` +
      `</div>`
    );
  }
})();
