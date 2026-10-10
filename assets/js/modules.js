/* 能力模块列表页：列出技能库中的「总控 + 子技能」型模块 */
(function () {
  'use strict';
  const { ICONS, Store, init, renderDataError, moduleCard } = window.OX;

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await init('modules');
    const host = document.getElementById('module-list');
    const countHost = document.getElementById('module-count');
    if (!data) { renderDataError(host); return; }

    const mods = Store.modules();
    if (!mods.length) {
      countHost.innerHTML = '暂无能力模块';
      host.innerHTML =
        `<div class="empty" style="grid-column:1/-1">${ICONS.box}` +
          `<div class="empty__title">暂无能力模块</div>` +
          `<p class="empty__desc">模块正在建设中，可先到技能库浏览审计技能组。</p>` +
          `<a class="btn btn--primary" href="skills.html">前往技能库</a>` +
        `</div>`;
      return;
    }

    countHost.innerHTML = `共 <strong>${mods.length}</strong> 个能力模块`;
    host.innerHTML = mods.map(moduleCard).join('');
  }, { once: true });
})();
