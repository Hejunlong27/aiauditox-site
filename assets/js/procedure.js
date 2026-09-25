/* 程序卡详情页：输入 / Steps / 质量门 / 升级路径 / 关联工具 / 相邻程序卡 */
(function () {
  'use strict';
  const {
    ICONS, Store, escapeHtml, qs, idx, cycleBadge, assertionChips, modeBadge,
    renderSteps, renderItems, init, renderDataError
  } = window.OX;

  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('proc-root');
    const data = await init('atlas');
    if (!data) { renderDataError(root); return; }

    const skillId = qs('skill');
    const pid = qs('p');
    const s = skillId ? Store.skill(skillId) : null;
    const p = s && pid ? Store.procedure(skillId, pid) : null;

    if (!s || !p) { root.innerHTML = notFound('没有找到这张程序卡，链接可能有误'); return; }

    document.title = `${p.id} ${p.name} · ${s.code} · 审小牛 AIAuditOx`;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', `${s.code} ${p.id} ${p.name}：${s.title}技能组下的审计程序卡。`);

    root.innerHTML = shell(s, p);
  }, { once: true });

  function shell(s, p) {
    const d = p.detail || {};
    const hasCard = !!d.hasCard;

    return (
      /* 面包屑 */
      `<nav class="crumb" aria-label="面包屑">` +
        `<a href="index.html">总览</a>${ICONS.chevronRight}` +
        `<a href="skills.html">技能库</a>${ICONS.chevronRight}` +
        `<a href="skill.html?id=${encodeURIComponent(s.id)}">${escapeHtml(s.code)} ${escapeHtml(s.title.replace(/^[^·]*·/, ''))}</a>` +
        `${ICONS.chevronRight}<span class="crumb__current">${escapeHtml(p.id)}</span>` +
      `</nav>` +

      /* 头部 */
      `<header class="proc-hero">` +
        `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">` +
          cycleBadge(s.cycle, true) +
          idx(s.code) +
          `<span class="proc-hero__id">${escapeHtml(p.id)}</span>` +
        `</div>` +
        `<h1 class="proc-hero__title">${escapeHtml(p.name)}</h1>` +
        `<div class="proc-hero__meta">` +
          (p.assertions.length ? assertionChips(p.assertions) : '<span class="badge badge--muted">认定待标注</span>') +
          modeBadge(p.mode, p.modeText) +
          (p.output ? `<span style="font-size:13px;color:var(--ink-3)">产出底稿 ${p.index ? idx(p.index) : escapeHtml(p.output)}</span>` : '') +
        `</div>` +
        (p.source ? `<p style="margin-top:12px;font-size:13.5px;color:var(--ink-3)">来源：${escapeHtml(p.source)}</p>` : '') +
      `</header>` +

      `<div class="detail-layout" style="margin-top:26px">` +
        `<div class="stack-lg">` +

          (hasCard ? '' :
            `<div class="alert alert--warn">${ICONS.alert}<div>` +
              `<div class="alert__title">这张程序卡还没有独立文档</div>` +
              `<p>它已登记在技能组的程序分派表中，但尚未拆出独立程序卡文档。` +
              `执行时按 SKILL.md 与程序分派表的要求处理。</p>` +
            `</div></div>`) +

          /* 输入 */
          (hasCard && d.inputs.length ? section('输入资料', 'Inputs', ICONS.fileText,
            renderItems(d.inputs),
            '执行前须备齐的资料。缺项先索取，未齐不跑数。') : '') +

          /* Steps */
          (hasCard && d.steps.length ? section('执行步骤', 'Steps', ICONS.workflow,
            renderSteps(d.steps),
            '三类步骤：脚本（工具执行）、规则（按预设判断）、人工（必须由人判断）。') : '') +

          /* 质量门 */
          (hasCard && d.qualityGate.length ? section('质量门', 'Quality Gate', ICONS.shieldCheck,
            renderItems(d.qualityGate),
            '未通过不得进入下一张程序卡。') : '') +

          /* 升级路径 */
          (hasCard && d.escalation.length ? section('升级路径', 'Escalation', ICONS.route,
            renderItems(d.escalation),
            '触发时立即挂起上报，不得自行放宽阈值。') : '') +

          /* 免责 */
          `<div class="alert alert--info">${ICONS.info}<div>` +
            `<div class="alert__title">关于程序卡</div>` +
            `<p>程序卡是审计程序 skill 化的最小执行单元，可单独触发、单独重做、单独复核，也可组合成完整科目的流程。</p>` +
          `</div></div>` +

        `</div>` +

        `<aside class="sidebar">` +
          toolSidebar(p) +
          skillSidebar(s) +
          siblingSidebar(s, p) +
        `</aside>` +
      `</div>`
    );
  }

  function section(title, en, icon, body, desc) {
    return (
      `<section class="card"><div class="card__body">` +
        `<h2 style="font-size:18px;display:flex;align-items:center;gap:9px">` +
          `<span style="color:var(--brand);display:flex">${icon}</span>${escapeHtml(title)}` +
          `<span style="font-size:11.5px;font-weight:600;color:var(--ink-3);letter-spacing:.08em">${escapeHtml(en)}</span>` +
        `</h2>` +
        (desc ? `<p style="font-size:13.5px;color:var(--ink-3);margin-top:6px;line-height:1.75">${escapeHtml(desc)}</p>` : '') +
        `<div style="margin-top:16px">${body}</div>` +
      `</div></section>`
    );
  }

  /* ---------- 侧栏：关联工具（含契约） ---------- */
  function toolSidebar(p) {
    if (!p.tools.length) {
      return (
        `<div class="card"><div class="card__body">` +
          `<h2 class="sidebar__title">执行方式</h2>` +
          `<p style="font-size:13.5px;color:var(--ink-2);line-height:1.75">` +
            (p.human
              ? '人工主导：需现场实施或对外发函，Agent 只做控制表与跟踪。'
              : '暂未绑定确定性工具，按程序卡描述执行。') +
          `</p>` +
        `</div></div>`
      );
    }

    return (
      `<div class="card"><div class="card__body">` +
        `<h2 class="sidebar__title">调用的确定性工具</h2>` +
        p.tools.map(t => {
          const meta = Store.tool(t);
          if (!meta) {
            return `<div style="padding:9px 0;border-bottom:1px dashed var(--line)">` +
              `<span style="font-family:var(--font-mono);font-size:12.5px;color:var(--warn)">${escapeHtml(t)}</span></div>`;
          }
          const used = Store.proceduresUsingTool(t).length;
          return (
            `<a href="tools.html#tool-${encodeURIComponent(t)}" ` +
            `style="display:block;padding:11px 0;border-bottom:1px dashed var(--line)">` +
              `<span style="display:block;font-size:14px;font-weight:650;color:var(--ink);margin-bottom:2px">${escapeHtml(meta.name)}</span>` +
              `<span style="display:block;font-family:var(--font-mono);font-size:11.5px;color:var(--ink-3);margin-bottom:5px">${escapeHtml(t)}</span>` +
              `<span style="display:block;font-size:12.5px;color:var(--ink-2);line-height:1.65">${escapeHtml(meta.summary || '')}</span>` +
              `<span style="display:block;font-size:11.5px;color:var(--ink-3);margin-top:6px">全库共 ${used} 张程序卡调用</span>` +
            `</a>`
          );
        }).join('') +
        `<a class="btn btn--quiet btn--block" href="tools.html" style="margin-top:12px">查看全部工具 →</a>` +
      `</div></div>`
    );
  }

  /* ---------- 侧栏：所属技能 ---------- */
  function skillSidebar(s) {
    return (
      `<div class="card"><div class="card__body">` +
        `<h2 class="sidebar__title">所属技能组</h2>` +
        `<a href="skill.html?id=${encodeURIComponent(s.id)}" style="display:block;color:inherit">` +
          `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">` +
            idx(s.code, 'idx--brand') +
            `<span style="font-size:14px;font-weight:650">${escapeHtml(s.title.replace(/^[^·]*·/, ''))}</span>` +
          `</div>` +
          `<p style="font-size:13px;color:var(--ink-2);line-height:1.7">` +
            `共 ${s.procedures.length} 张程序卡 · 风险等级 ${escapeHtml(s.riskLevel || '—')}` +
          `</p>` +
        `</a>` +
        `<a class="btn btn--quiet btn--block" href="skill.html?id=${encodeURIComponent(s.id)}" style="margin-top:12px">查看技能组详情 →</a>` +
      `</div></div>`
    );
  }

  /* ---------- 侧栏：相邻程序卡 ---------- */
  function siblingSidebar(s, p) {
    const list = s.procedures;
    const i = list.findIndex(x => x.id === p.id);
    if (i === -1) return '';
    const prev = i > 0 ? list[i - 1] : null;
    const next = i < list.length - 1 ? list[i + 1] : null;
    if (!prev && !next) return '';

    const item = (x, label) => {
      if (!x) return '';
      const href = x.detail && x.detail.hasCard
        ? `procedure.html?skill=${encodeURIComponent(s.id)}&p=${encodeURIComponent(x.id)}`
        : `skill.html?id=${encodeURIComponent(s.id)}#procedures`;
      return (
        `<a href="${href}" style="display:block;padding:9px 0;border-bottom:1px dashed var(--line)">` +
          `<span style="display:block;font-size:11px;color:var(--ink-3);letter-spacing:.06em">${escapeHtml(label)}</span>` +
          `<span style="display:block;font-size:13.5px;font-weight:600;color:var(--ink);margin-top:2px">` +
            `${escapeHtml(x.id)} ${escapeHtml(x.name)}</span>` +
        `</a>`
      );
    };

    return (
      `<div class="card"><div class="card__body">` +
        `<h2 class="sidebar__title">相邻程序卡</h2>` +
        item(prev, '上一张') +
        item(next, '下一张') +
        `<p style="font-size:12px;color:var(--ink-3);margin-top:10px;line-height:1.7">` +
          `实际执行顺序见技能组的「调度流程」。` +
        `</p>` +
      `</div></div>`
    );
  }

  function notFound(msg) {
    return (
      `<div class="empty" style="padding:100px 24px">${ICONS.inbox}` +
        `<div class="empty__title">程序卡不存在</div>` +
        `<p class="empty__desc">${escapeHtml(msg)}</p>` +
        `<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">` +
          `<a class="btn btn--primary" href="atlas.html">浏览程序图谱</a>` +
          `<a class="btn btn--ghost" href="skills.html">返回技能库</a>` +
        `</div>` +
      `</div>`
    );
  }
})();
