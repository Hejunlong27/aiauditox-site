/* 工具库页：确定性工具契约 + 办公工具 + 调用关系 */
(function () {
  'use strict';
  const { ICONS, Store, escapeHtml, init, renderDataError } = window.OX;

  const GROUP_ICON = { finance: 'scale', audit: 'fileCheck', office: 'table' };

  const GROUP_DESC = {
    finance: '加计核对、双向配对、调节表重算、阈值打标、抽样。输入输出均为 JSON，可被程序卡直接调用。',
    audit: '索引号编制、四段式底稿填充、修订记录、证据台账。',
    office: 'Excel / Word / PDF 读写转换、哈希、批量导入导出。'
  };

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await init('tools');
    const host = document.getElementById('tool-sections');
    if (!data) { renderDataError(host); return; }

    const tools = Store.tools();
    const groups = (Store.get().toolGroups || []).map(g => g.id);

    host.innerHTML = groups.map(gid => {
      const list = tools.filter(t => t.group === gid);
      if (!list.length) return '';
      const label = (Store.get().toolGroups.find(x => x.id === gid) || {}).name || gid;

      return (
        `<section class="section" style="padding-top:${gid === groups[0] ? 0 : 48}px">` +
          `<div class="section__head" style="margin-bottom:16px">` +
            `<div>` +
              `<h2 class="section__title" style="font-size:21px">${escapeHtml(label)}</h2>` +
              `<p class="section__desc" style="max-width:760px">${escapeHtml(GROUP_DESC[gid] || '')}</p>` +
            `</div>` +
            `<span class="badge badge--brand">${list.length} 个</span>` +
          `</div>` +
          `<div class="grid grid--2">` + list.map(t => card(t)).join('') + `</div>` +
        `</section>`
      );
    }).join('');

    /* 支持从其他页面带 hash 直接定位 */
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => window.scrollTo({ top: el.offsetTop - 84, behavior: 'smooth' }), 120);
    }
  }, { once: true });

  function card(t) {
    const isAudit = t.kind !== 'office';
    const used = isAudit ? Store.proceduresUsingTool(t.id) : [];

    const params = (t.params || []).length
      ? `<div style="margin-top:14px">` +
          `<div style="font-size:12px;font-weight:700;color:var(--ink-3);letter-spacing:.06em;margin-bottom:7px">入参</div>` +
          `<table class="kv-table">` +
            t.params.map(p =>
              `<tr>` +
                `<td style="width:112px"><code>${escapeHtml(p.name)}</code></td>` +
                `<td>` +
                  `<span style="font-family:var(--font-mono);font-size:11.5px;color:var(--ink-3)">${escapeHtml(p.type)}` +
                  `${p.required ? ' <span style="color:var(--danger)">必填</span>' : ''}</span>` +
                  `<span style="display:block;font-size:12.5px;color:var(--ink-2);margin-top:2px">${escapeHtml(p.desc)}</span>` +
                `</td>` +
              `</tr>`
            ).join('') +
          `</table>` +
        `</div>`
      : '';

    const output = t.output
      ? `<div style="margin-top:14px">` +
          `<div style="font-size:12px;font-weight:700;color:var(--ink-3);letter-spacing:.06em;margin-bottom:6px">出参</div>` +
          `<div class="code-block" style="font-size:12px;white-space:pre-wrap">${escapeHtml(t.output)}</div>` +
        `</div>`
      : '';

    const rule = t.rule
      ? `<div style="margin-top:12px;padding:10px 12px;background:var(--accent-50);border-left:3px solid var(--accent);border-radius:0 6px 6px 0;font-size:12.8px;color:var(--ink-2);line-height:1.7">` +
          `<strong style="color:var(--accent-600)">判定规则：</strong>${escapeHtml(t.rule)}` +
        `</div>`
      : '';

    const impl = t.impl
      ? `<div style="margin-top:14px;font-size:12.5px;color:var(--ink-3)">实现：${escapeHtml(t.impl)}</div>`
      : '';

    const isFlow = t.scope === 'flow';
    const usageBadge = isFlow
      ? `<span class="badge badge--accent">流程级工具 · 不绑定单张程序卡</span>`
      : `<span class="badge badge--brand">被 ${used.length} 张程序卡调用</span>`;

    const footer = isAudit
      ? `<div style="margin-top:16px;padding-top:14px;border-top:1px dashed var(--line);display:flex;align-items:center;gap:10px;flex-wrap:wrap">` +
          usageBadge +
          (!isFlow && used.length ? `<a class="btn btn--quiet btn--sm" href="atlas.html?tool=${encodeURIComponent(t.id)}">查看调用方 →</a>` : '') +
          `<span class="spacer"></span>` +
          `<button class="btn btn--quiet btn--sm" type="button" data-copy-text="${escapeHtml(t.id)}">${ICONS.copy}复制工具名</button>` +
        `</div>`
      : `<div style="margin-top:16px;padding-top:14px;border-top:1px dashed var(--line);display:flex;align-items:center;gap:10px">` +
          `<button class="btn btn--quiet btn--sm" type="button" data-copy-text="${escapeHtml(t.id)}">${ICONS.copy}复制工具名</button>` +
        `</div>`;

    return (
      `<article class="card" id="tool-${escapeHtml(t.id)}">` +
        `<div class="card__body">` +
          `<div class="tool-card__head">` +
            `<span class="tool-card__icon">${ICONS[GROUP_ICON[t.group] || 'tool']}</span>` +
            `<div style="min-width:0;flex:1">` +
              `<div class="tool-card__name">${escapeHtml(t.name)}</div>` +
              `<div class="tool-card__id">${escapeHtml(t.id)}</div>` +
            `</div>` +
            (isAudit ? '' : `<span class="badge badge--muted">办公</span>`) +
          `</div>` +
          `<p class="tool-card__desc">${escapeHtml(t.summary || '')}</p>` +
          params + output + rule + impl + footer +
        `</div>` +
      `</article>`
    );
  }
})();
