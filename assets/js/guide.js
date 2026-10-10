/* 使用方法页：静态内容 + 路径复制 + 目录锚点 */
(function () {
  'use strict';
  const {
    ICONS, escapeHtml, copyText, showToast, init
  } = window.OX;

  /* 给每个路径块补上复制图标，并绑定复制动作 */
  function bindCopyPaths() {
    document.querySelectorAll('[data-copy-path]').forEach(btn => {
      btn.innerHTML = ICONS.copy;
      btn.addEventListener('click', async () => {
        const path = btn.getAttribute('data-copy-path') || '';
        const ok = await copyText(path);
        showToast(ok ? '路径已复制：' + path : '复制失败，请手动选中复制');
      });
    });
  }

  /* 目录锚点：平滑滚动，并留出固定导航栏的高度。
     注意：不要用 offsetTop —— 它是相对 offsetParent 的，
     目标在 .container 这类定位容器里时会算少，滚不到位。 */
  function scrollToEl(el, offset) {
    const top = el.getBoundingClientRect().top + window.scrollY - (offset || 84);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function bindToc() {
    document.querySelectorAll('.guide-toc a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        scrollToEl(target);
        history.replaceState(null, '', a.getAttribute('href'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await init('guide');
    bindCopyPaths();
    bindToc();
    /* 本页是纯静态内容，不依赖 registry；加载失败也能正常阅读 */
    if (!data) console.warn('[审小牛] registry 未加载，本页不受影响');
  }, { once: true });
})();
