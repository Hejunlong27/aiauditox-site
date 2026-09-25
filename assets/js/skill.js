/* 技能详情页：六要素 / 程序分派表 / 调度流程 / 复核清单 / 边界 / 陷阱 / 验证 */
(function () {
  'use strict';
  const {
    ICONS, Store, escapeHtml, qs, idx, cycleBadge, assertionChips, modeBadge,
    procedureRow, downloadCard, renderSteps, renderItems,
    init, renderDataError
  } = window.OX;

  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('detail-root');
    const data = await init('skills');
    if (!data) { renderDataError(root); return; }

    const id = qs('id');
    const s = id ? Store.skill(id) : null;
    if (!s) { root.innerHTML = notFound('没有找到这个技能组，它可能已被移除或链接有误'); return; }

    document.title = `${s.title}（${s.code}） · 审小牛 AIAuditOx`;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', s.description || '');

    root.innerHTML = shell(s);
    bindEvents(s);
  }, { once: true });

  /* ---------- 骨架 ---------- */
  function shell(s) {
    const g = Store.reportGroup(s.reportGroup);
    const cyc = Store.cycle(s.cycle);

    /* 锚点导航 */
    const anchors = [
      ['six', '六要素'], ['procedures', '程序分派表'], ['steps', '调度流程'],
      ['review', '一级复核清单'], ['boundaries', '边界与禁止'], ['pitfalls', '易错点'], ['verify', '验证要点']
    ].filter(([k]) => {
      const map = { six: s.objectives, procedures: s.procedures.length, steps: s.steps.length,
                    review: s.reviewChecklist.length, boundaries: s.boundaries.length,
                    pitfalls: s.pitfalls.length, verify: s.verification.length };
      return map[k];
    });

    return (
      /* 面包屑 */
      `<nav class="crumb" aria-label="面包屑">` +
        `<a href="index.html">总览</a>${ICONS.chevronRight}` +
        `<a href="skills.html">技能库</a>${ICONS.chevronRight}` +
        (cyc ? `<a href="skills.html?cycle=${encodeURIComponent(cyc.code)}">${escapeHtml(cyc.name)}</a>${ICONS.chevronRight}` : '') +
        (g ? `<a href="skills.html?group=${encodeURIComponent(g.code)}">${escapeHtml(g.name)}</a>${ICONS.chevronRight}` : '') +
        `<span class="crumb__current">${escapeHtml(s.code)}</span>` +
      `</nav>` +

      /* 头部 */
      `<header class="detail-head" style="margin-top:20px">` +
        `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">` +
          cycleBadge(s.cycle, true) +
          idx(s.code, 'idx--lg idx--brand') +
          `<span class="badge badge--muted">风险等级 ${escapeHtml(s.riskLevel || '—')}</span>` +
          `<span class="badge badge--muted">v${escapeHtml(s.version)}</span>` +
          (s.ownerRole ? `<span class="badge badge--muted">${escapeHtml(s.ownerRole)}</span>` : '') +
        `</div>` +
        `<h1 class="detail-head__title" style="margin-top:12px">${escapeHtml(s.title)}</h1>` +
        `<p class="detail-summary">${escapeHtml(s.description || '')}</p>` +
      `</header>` +

      /* 锚点 */
      `<nav class="anchor-nav" aria-label="本页导航">` +
        anchors.map(([k, t]) => `<a href="#${k}">${escapeHtml(t)}</a>`).join('') +
      `</nav>` +

      `<div class="detail-layout">` +
        `<div class="stack-lg">` +

          /* 六要素 */
          sixSection(s) +

          /* 程序分派表 */
          procSection(s) +

          /* 调度流程 */
          block('steps', '调度流程', 'Steps', ICONS.workflow,
            renderSteps(s.steps),
            'Agent 按此顺序分派程序卡，含依赖关系与异常激活路径。') +

          /* 一级复核清单 */
          block('review', '一级复核清单', 'Review Checklist', ICONS.shieldCheck,
            renderItems(s.reviewChecklist),
            '复核独立于编制上下文执行。') +

          /* 边界与禁止 */
          block('boundaries', '边界与禁止事项', 'Boundaries', ICONS.lock,
            renderItems(s.boundaries),
            '违反边界的操作一律拒绝，交人工升级处理。') +

          /* 易错点 */
          block('pitfalls', '易错点', 'Pitfalls', ICONS.alert,
            renderItems(s.pitfalls),
            '实际项目里踩过的坑，执行程序卡前先自查。') +

          /* 验证要点 */
          block('verify', '验证要点', 'Verification', ICONS.checkCircle,
            renderItems(s.verification),
            '底稿提交前按此自检，未通过不得进入二级复核。') +

          /* 免责 */
          `<div class="alert alert--info">${ICONS.info}<div>` +
            `<div class="alert__title">使用须知</div>` +
            `<p>输出不替代注册会计师的职业判断，差异类结论须经人工复核后方可用于正式底稿。</p>` +
          `</div></div>` +

        `</div>` +

        /* 侧栏 */
        `<aside class="sidebar">` +
          downloadCard(s) +

          `<div class="card"><div class="card__body">` +
            `<h2 class="sidebar__title">技能信息</h2>` +
            `<div class="kv">` +
              `<span class="kv__k">索引号</span><span class="kv__v">${escapeHtml(s.code)}</span>` +
              `<span class="kv__k">所属组</span><span class="kv__v">${escapeHtml(cyc ? cyc.full : s.cycle)}</span>` +
              `<span class="kv__k">报表项目</span><span class="kv__v">${escapeHtml(g ? g.name : '—')}</span>` +
              `<span class="kv__k">程序卡</span><span class="kv__v">${s.procedures.length} 张</span>` +
              `<span class="kv__k">风险等级</span><span class="kv__v">${escapeHtml(s.riskLevel || '—')}</span>` +
              `<span class="kv__k">版本</span><span class="kv__v">v${escapeHtml(s.version)}</span>` +
              `<span class="kv__k">技能 id</span><span class="kv__v" style="font-family:var(--font-mono);font-size:12.5px">${escapeHtml(s.id)}</span>` +
            `</div>` +
            `<button class="btn btn--quiet btn--block" type="button" style="margin-top:12px" data-copy-text="${escapeHtml(s.id)}">${ICONS.copy}复制技能 id</button>` +
          `</div></div>` +

          toolSidebar(s) +
          siblingSidebar(s) +
          assetSidebar(s) +
        `</aside>` +
      `</div>`
    );
  }

  /* ---------- 六要素 ---------- */
  function sixSection(s) {
    const cells = [
      ['审计目标', ICONS.target, s.objectives ? escapeHtml(s.objectives) : '—'],
      ['所需资料', ICONS.fileText, renderItems(s.requiredDocs)],
      ['所需数据', ICONS.database, renderItems(s.requiredData)],
      ['核对逻辑', ICONS.gitBranch, renderItems(s.logic)],
      ['底稿编制内容', ICONS.clipboard, escapeHtml(s.workpaperScope || '—')],
      ['输出格式', ICONS.download, escapeHtml(s.outputFormat || '—')]
    ];
    return (
      `<section id="six">` +
        `<h2 class="section__title" style="font-size:20px;margin-bottom:6px">六要素</h2>` +
        `<p class="section__desc" style="margin-bottom:16px">` +
          `技能工厂固化时确认的六项定义，是程序卡拆分的依据。` +
        `</p>` +
        `<div class="six-grid">` +
          cells.map(([label, icon, body]) =>
            `<div class="six-cell">` +
              `<div class="six-cell__label">${icon}${escapeHtml(label)}</div>` +
              `<div class="six-cell__body">${body}</div>` +
            `</div>`
          ).join('') +
        `</div>` +
      `</section>`
    );
  }

  /* ---------- 程序分派表 ---------- */
  function procSection(s) {
    if (!s.procedures.length) return '';
    const withTools = s.procedures.filter(p => p.tools.length).length;
    const manual = s.procedures.filter(p => p.mode === 'manual').length;

    return (
      `<section id="procedures">` +
        `<div class="section__head" style="margin-bottom:14px">` +
          `<div>` +
            `<h2 class="section__title" style="font-size:20px">程序分派表</h2>` +
            `<p class="section__desc">` +
              `共 ${s.procedures.length} 张程序卡，其中 ${withTools} 张已绑定确定性工具，${manual} 张为人工主导。` +
            `</p>` +
          `</div>` +
          `<a class="btn btn--quiet" href="atlas.html?skill=${encodeURIComponent(s.id)}">在程序图谱中查看 →</a>` +
        `</div>` +
        `<div class="proc-list">` +
          `<div class="proc-list__head">` +
            `<span>程序卡</span><span>程序名称</span><span>对应认定</span><span>执行方式</span><span>产出底稿</span>` +
          `</div>` +
          s.procedures.map(p => procedureRow(p)).join('') +
        `</div>` +
      `</section>`
    );
  }

  /* ---------- 通用内容块 ---------- */
  function block(id, title, en, icon, body, desc) {
    if (!body || body.indexOf('暂无') === 0) return '';
    return (
      `<section class="card" id="${id}"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${icon}</span>${escapeHtml(title)}` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">${escapeHtml(en)}</span>` +
        `</h2>` +
        (desc ? `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px">${escapeHtml(desc)}</p>` : '') +
        `<div style="margin-top:16px">${body}</div>` +
      `</div></section>`
    );
  }

  /* ---------- 侧栏：关联工具 ---------- */
  function toolSidebar(s) {
    const usage = {};
    s.procedures.forEach(p => p.tools.forEach(t => { usage[t] = (usage[t] || 0) + 1; }));
    const ids = Object.keys(usage);
    if (!ids.length) return '';

    return (
      `<div class="card"><div class="card__body">` +
        `<h2 class="sidebar__title">关联确定性工具</h2>` +
        `<div class="stack-sm">` +
          ids.map(t => {
            const meta = Store.tool(t);
            return `<a href="tools.html#tool-${encodeURIComponent(t)}" ` +
              `style="display:block;padding:9px 0;border-bottom:1px dashed var(--line)">` +
              `<span style="display:block;font-size:13.5px;font-weight:600;color:var(--ink)">${escapeHtml(meta ? meta.name : t)}</span>` +
              `<span style="display:block;font-size:11.5px;color:var(--ink-3);font-family:var(--font-mono)">${escapeHtml(t)} · ${usage[t]} 处调用</span>` +
            `</a>`;
          }).join('') +
        `</div>` +
      `</div></div>`
    );
  }

  /* ---------- 侧栏：同组技能 ---------- */
  function siblingSidebar(s) {
    const sib = Store.skills().filter(x => x.reportGroup === s.reportGroup && x.id !== s.id);
    const sameCycle = Store.skills().filter(x => x.cycle === s.cycle && x.reportGroup !== s.reportGroup);
    const list = sib.concat(sameCycle).slice(0, 5);
    if (!list.length) return '';

    return (
      `<div class="card"><div class="card__body">` +
        `<h2 class="sidebar__title">相邻技能组</h2>` +
        `<div class="stack-sm">` +
          list.map(x =>
            `<a href="skill.html?id=${encodeURIComponent(x.id)}" style="display:flex;gap:8px;align-items:center;padding:7px 0">` +
              idx(x.code) +
              `<span style="font-size:13.5px;color:var(--ink-2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">` +
                escapeHtml(x.title.replace(/^[^·]*·/, '')) + `</span>` +
            `</a>`
          ).join('') +
        `</div>` +
      `</div></div>`
    );
  }

  /* ---------- 侧栏：模板与用例 ---------- */
  function assetSidebar(s) {
    if (!s.templates.length && !s.cases.inputs) return '';
    return (
      `<div class="card"><div class="card__body">` +
        `<h2 class="sidebar__title">随包资产</h2>` +
        (s.templates.length
          ? `<div style="margin-bottom:12px">` +
              `<div style="font-size:12px;color:var(--ink-3);margin-bottom:6px">底稿模板</div>` +
              s.templates.map(t =>
                `<div style="font-size:13px;color:var(--ink-2);padding:4px 0;display:flex;gap:7px;align-items:flex-start">` +
                  `<span style="color:var(--accent);flex-shrink:0;display:flex;width:14px">${ICONS.fileText}</span>` +
                  `<span style="word-break:break-all">${escapeHtml(t)}</span></div>`
              ).join('') +
            `</div>`
          : '') +
        (s.cases.inputs
          ? `<div style="font-size:13px;color:var(--ink-2);display:flex;align-items:center;gap:7px">` +
              `${ICONS.checkCircle}<span>黄金用例 ${s.cases.inputs} 组（输入 + 期望）</span></div>`
          : '') +
      `</div></div>`
    );
  }

  /* ---------- 事件 ---------- */
  function bindEvents(s) {
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
        `<div class="empty__title">技能组不存在</div>` +
        `<p class="empty__desc">${escapeHtml(msg)}</p>` +
        `<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">` +
          `<a class="btn btn--primary" href="skills.html">返回技能库</a>` +
          `<a class="btn btn--ghost" href="atlas.html">浏览程序图谱</a>` +
        `</div>` +
      `</div>`
    );
  }
})();
