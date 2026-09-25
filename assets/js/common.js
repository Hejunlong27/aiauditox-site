/* ==========================================================================
   审小牛 AIAuditOx — 公共脚本 v2
   职责：图标库 / 工具函数 / Registry 数据层 / 布局注入 / 体系化组件
   ========================================================================== */
(function (global) {
  'use strict';

  /* ===================== 图标库 ===================== */
  const _svg = (d, extra) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra || ''}>${d}</svg>`;

  const ICONS = {
    search:    _svg('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>'),
    download:  _svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>'),
    copy:      _svg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    check:     _svg('<path d="M20 6L9 17l-5-5"/>'),
    checkCircle: _svg('<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>'),
    arrowRight:_svg('<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>'),
    arrowLeft: _svg('<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>'),
    chevronRight: _svg('<path d="M9 18l6-6-6-6"/>'),
    chevronDown: _svg('<path d="M6 9l6 6 6-6"/>'),
    clock:     _svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
    tag:       _svg('<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>'),
    layers:    _svg('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>'),
    calendar:  _svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    user:      _svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    users:     _svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>'),
    inbox:     _svg('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z"/>'),
    info:      _svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    alert:     _svg('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
    shield:    _svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    shieldCheck: _svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'),
    fileText:  _svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>'),
    fileCheck: _svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/>'),
    barChart:  _svg('<path d="M12 20V10M18 20V4M6 20v-4"/>'),
    clipboard: _svg('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>'),
    tool:      _svg('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z"/>'),
    box:       _svg('<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>'),
    mail:      _svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>'),
    message:   _svg('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>'),
    external:  _svg('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/>'),
    menu:      _svg('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    book:      _svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    bookOpen:  _svg('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
    refresh:   _svg('<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>'),
    send:      _svg('<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>'),
    sparkles:  _svg('<path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"/><path d="M19 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z"/>'),
    zap:       _svg('<path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>'),
    folder:    _svg('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'),
    hash:      _svg('<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>'),
    wechat:    _svg('<path d="M8.5 3C4.9 3 2 5.4 2 8.4c0 1.7.9 3.2 2.4 4.2L4 15l2.5-1.3c.6.2 1.3.3 2 .3h.6"/><path d="M22 15.2c0-2.6-2.5-4.7-5.6-4.7s-5.6 2.1-5.6 4.7 2.5 4.7 5.6 4.7c.6 0 1.2-.1 1.7-.3L20 21l-.4-1.7c1.5-.9 2.4-2.4 2.4-4.1z"/>'),
    list:      _svg('<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>'),
    star:      _svg('<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1L12 2z"/>'),
    grid:      _svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    target:    _svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
    database:  _svg('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.7-4 3-9 3s-9-1.3-9-3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>'),
    gitBranch: _svg('<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),
    workflow:  _svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4a3 3 0 0 1 3 3V14"/>'),
    puzzle:    _svg('<path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.6H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9.5A1.6 1.6 0 0 0 10.5 3V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1z"/>'),
    blocks:    _svg('<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><path d="M17 14v6M14 17h6"/>'),
    table:     _svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
    filter:    _svg('<path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/>'),
    sliders:   _svg('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'),
    x:         _svg('<path d="M18 6L6 18M6 6l12 12"/>'),
    lock:      _svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
    scale:     _svg('<path d="M12 3v18M7 7l-4 8h8L7 7zM17 7l-4 8h8l-4-8z"/><path d="M5 7h14"/>'),
    eye:       _svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
    route:     _svg('<circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h5a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h5"/>'),
    award:     _svg('<circle cx="12" cy="8" r="6"/><path d="M8.2 13.9L7 22l5-3 5 3-1.2-8.1"/>'),
    gitMerge:  _svg('<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>')
  };

  /* ===================== 工具函数 ===================== */
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /**
   * URL 白名单校验：只放行 http/https、协议相对地址、站内 html/锚点/正文路径。
   * 显式拦截 javascript:、data:、vbscript:、file: 等危险协议，返回空串表示不可用。
   */
  function safeUrl(url) {
    if (!url) return '';
    const u = String(url).trim();
    if (!u) return '';
    if (/^(javascript|data|vbscript|file|blob)\s*:/i.test(u)) return '';
    if (/^\/\//.test(u)) return 'https:' + u;
    if (/^https?:\/\//i.test(u)) return u;
    if (/^#[\w\-]*$/.test(u)) return u;
    if (/^[\w\-./]+\.html(\?[^#]*)?(#[\w\-]*)?$/i.test(u)) return u;
    if (/^content\/[\w\-./]+$/i.test(u)) return u;
    return '';
  }

  function formatNumber(n) {
    const v = Number(n) || 0;
    if (v >= 10000) return (v / 10000).toFixed(1).replace(/\.0$/, '') + ' 万';
    return String(v);
  }

  function formatDate(str) {
    if (!str) return '—';
    const d = new Date(String(str).replace(/-/g, '/'));
    if (isNaN(d.getTime())) return String(str);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function relativeDate(str) {
    if (!str) return '—';
    const d = new Date(String(str).replace(/-/g, '/'));
    if (isNaN(d.getTime())) return String(str);
    const diff = Date.now() - d.getTime();
    const day = 86400000;
    if (diff < 0) return formatDate(str);
    if (diff < day) return '今天';
    if (diff < day * 2) return '昨天';
    if (diff < day * 30) return Math.floor(diff / day) + ' 天前';
    if (diff < day * 365) return Math.floor(diff / (day * 30)) + ' 个月前';
    return formatDate(str);
  }

  function qs(name) {
    return new URLSearchParams(global.location.search).get(name) || '';
  }

  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(ctx, args), wait || 220);
    };
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && global.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* 走降级 */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  let _toastTimer = null;
  function showToast(msg, ok) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.innerHTML = (ok === false ? ICONS.alert : ICONS.checkCircle) + '<span>' + escapeHtml(msg) + '</span>';
    el.classList.add('is-visible');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
  }

  /* ===================== 数据层 ===================== */
  const DATA_URL = 'data/registry.json';

  const Store = {
    _data: null,
    _promise: null,

    async load() {
      if (this._data) return this._data;
      if (this._promise) return this._promise;
      this._promise = fetch(DATA_URL, { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(json => { this._data = json; return json; })
        .catch(err => { this._promise = null; throw err; });
      return this._promise;
    },

    get() { return this._data; },
    site() { return (this._data && this._data.site) || {}; },
    meta() { return (this._data && this._data.meta) || {}; },
    cycles() { return (this._data && this._data.cycles) || []; },
    reportGroups() { return (this._data && this._data.reportGroups) || []; },
    assertions() { return (this._data && this._data.assertions) || []; },
    tools() { return (this._data && this._data.tools) || []; },
    skills() { return (this._data && this._data.skills) || []; },
    procedures() { return (this._data && this._data.procedures) || []; },

    cycle(code) { return this.cycles().find(c => c.code === code) || null; },
    assertion(code) { return this.assertions().find(a => a.code === code) || null; },
    modeLabel(mode) { return ((this._data && this._data.modeLabels) || {})[mode] || { name: mode, desc: '' }; },
    reportGroup(code) { return this.reportGroups().find(g => g.code === code) || null; },
    tool(id) { return this.tools().find(t => t.id === id) || null; },
    skill(id) { return this.skills().find(s => s.id === id) || null; },
    procedure(skillId, pid) {
      return this.procedures().find(p => p.skillId === skillId && p.id === pid) || null;
    },

    /** 某工具被哪些程序卡调用 */
    proceduresUsingTool(toolId) {
      return this.procedures().filter(p => (p.tools || []).indexOf(toolId) !== -1);
    },

    /** 技能库检索：组 / 报表项目 / 认定 / 执行方式 / 工具 / 关键词 */
    querySkills({ keyword = '', cycle = '', reportGroup = '', assertion = '', mode = '', tool = '', sort = 'code' } = {}) {
      const kw = keyword.trim().toLowerCase();
      let list = this.skills().slice();

      if (cycle) list = list.filter(s => s.cycle === cycle);
      if (reportGroup) list = list.filter(s => s.reportGroup === reportGroup);

      if (assertion || mode || tool) {
        list = list.filter(s => s.procedures.some(p =>
          (!assertion || (p.assertions || []).indexOf(assertion) !== -1) &&
          (!mode || p.mode === mode) &&
          (!tool || (p.tools || []).indexOf(tool) !== -1)
        ));
      }

      if (kw) {
        list = list.filter(s => {
          const g = this.reportGroup(s.reportGroup);
          const hay = [s.title, s.code, s.id, s.description, g ? g.name : '',
                       s.procedures.map(p => p.name).join(' ')].join(' ').toLowerCase();
          return hay.indexOf(kw) !== -1;
        });
      }

      const sorters = {
        code:  (a, b) => a.code.localeCompare(b.code, 'en'),
        name:  (a, b) => String(a.title).localeCompare(String(b.title), 'zh-Hans-CN'),
        procs: (a, b) => b.procedures.length - a.procedures.length
      };
      list.sort(sorters[sort] || sorters.code);
      return list;
    },

    /** 程序卡检索：全库跨科目 */
    queryProcedures({ keyword = '', cycle = '', skillId = '', assertion = '', mode = '', tool = '', sort = 'code' } = {}) {
      const kw = keyword.trim().toLowerCase();
      let list = this.procedures().slice();

      if (cycle) list = list.filter(p => p.skillCode.startsWith(cycle));
      if (skillId) list = list.filter(p => p.skillId === skillId);
      if (assertion) list = list.filter(p => (p.assertions || []).indexOf(assertion) !== -1);
      if (mode) list = list.filter(p => p.mode === mode);
      if (tool) list = list.filter(p => (p.tools || []).indexOf(tool) !== -1);

      if (kw) {
        list = list.filter(p => {
          const s = this.skill(p.skillId);
          const hay = [p.id, p.name, p.source, p.output, s ? s.title : '',
                       p.tools.join(' ')].join(' ').toLowerCase();
          return hay.indexOf(kw) !== -1;
        });
      }

      const sorters = {
        code:   (a, b) => (a.skillCode + a.id).localeCompare(b.skillCode + b.id, 'en'),
        name:   (a, b) => String(a.name).localeCompare(String(b.name), 'zh-Hans-CN'),
        mode:   (a, b) => a.mode.localeCompare(b.mode) || a.skillCode.localeCompare(b.skillCode, 'en')
      };
      list.sort(sorters[sort] || sorters.code);
      return list;
    },

    /** 分布统计 */
    distribution(key) {
      const out = {};
      const bump = (k) => { if (k) out[k] = (out[k] || 0) + 1; };
      if (key === 'assertion') {
        this.procedures().forEach(p => (p.assertions || []).forEach(bump));
      } else if (key === 'mode') {
        this.procedures().forEach(p => bump(p.mode));
      } else if (key === 'cycle') {
        this.skills().forEach(s => bump(s.cycle));
      } else if (key === 'tool') {
        this.procedures().forEach(p => (p.tools || []).forEach(bump));
      }
      return out;
    }
  };

  /* ===================== 布局注入 ===================== */
  const NAV_ITEMS = [
    { href: 'index.html',   label: '总览',     key: 'home' },
    { href: 'skills.html',  label: '技能库',   key: 'skills' },
    { href: 'atlas.html',   label: '程序图谱', key: 'atlas' },
    { href: 'tools.html',   label: '工具库',   key: 'tools' },
    { href: 'contact.html', label: '联系',     key: 'contact' }
  ];

  function renderHeader(active) {
    const host = document.getElementById('site-header');
    if (!host) return;
    const navHtml = NAV_ITEMS.map(it =>
      `<a class="nav__link${it.key === active ? ' is-active' : ''}" href="${it.href}"` +
      `${it.key === active ? ' aria-current="page"' : ''}>${it.label}</a>`
    ).join('');

    host.className = 'site-header';
    host.innerHTML =
      `<div class="container site-header__inner">` +
        `<a class="brand" href="index.html" aria-label="审小牛 AIAuditOx 首页">` +
          `<img class="brand__mark" src="assets/img/logo.svg" alt="" width="34" height="34">` +
          `<span class="brand__text">` +
            `<span class="brand__name">审小牛</span>` +
            `<span class="brand__sub">AIAuditOx</span>` +
          `</span>` +
        `</a>` +
        `<nav class="nav" id="primary-nav" aria-label="主导航">${navHtml}</nav>` +
        `<span class="spacer"></span>` +
        `<a class="btn btn--primary btn--sm nav-cta" href="skills.html">浏览技能库</a>` +
        `<button class="nav-toggle" id="nav-toggle" type="button" aria-label="展开导航" aria-expanded="false" aria-controls="primary-nav">${ICONS.menu}</button>` +
      `</div>`;

    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '收起导航' : '展开导航');
      });
    }
  }

  function renderFooter() {
    const host = document.getElementById('site-footer');
    if (!host) return;
    const site = Store.site();
    const c = site.contact || {};
    const year = new Date().getFullYear();
    const m = Store.meta();
    const counts = m.counts || {};

    host.className = 'site-footer';
    host.innerHTML =
      `<div class="container">` +
        `<div class="footer-grid">` +
          `<div>` +
            `<a class="brand" href="index.html">` +
              `<img class="brand__mark" src="assets/img/logo.svg" alt="" width="34" height="34">` +
              `<span class="brand__text">` +
                `<span class="brand__name">审小牛</span>` +
                `<span class="brand__sub">AIAuditOx</span>` +
              `</span>` +
            `</a>` +
            `<p class="footer-desc">${escapeHtml(site.tagline || '一切审计程序，皆可 skill 化')}</p>` +
            (counts.skills
              ? `<p class="footer-desc" style="margin-top:10px;font-size:12.5px">` +
                  `已收录 ${counts.skills} 个技能组 · ${counts.procedures} 张程序卡 · ${counts.tools} 个确定性工具` +
                `</p>`
              : '') +
          `</div>` +
          `<div>` +
            `<h3 class="footer-col__title">技能库</h3>` +
            `<ul class="footer-links">` +
              `<li><a href="skills.html">全部技能组</a></li>` +
              `<li><a href="atlas.html">程序图谱</a></li>` +
              `<li><a href="tools.html">确定性工具</a></li>` +
            `</ul>` +
          `</div>` +
          `<div>` +
            `<h3 class="footer-col__title">帮助</h3>` +
            `<ul class="footer-links">` +
              `<li><a href="contact.html#faq">常见问题</a></li>` +
              `<li><a href="contact.html">提交反馈</a></li>` +
              `<li><a href="skills.html">全部技能组</a></li>` +
            `</ul>` +
          `</div>` +
          `<div>` +
            `<h3 class="footer-col__title">联系</h3>` +
            `<ul class="footer-links">` +
              (c.email ? `<li><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></li>` : '') +
              (c.wechat ? `<li>微信：${escapeHtml(c.wechat)}</li>` : '') +
              `<li><a href="contact.html">更多联系方式</a></li>` +
            `</ul>` +
          `</div>` +
        `</div>` +
        `<div class="footer-bottom">` +
          `<span>© ${year} ${escapeHtml(site.name || '审小牛')} ${escapeHtml(site.nameEn || 'AIAuditOx')} · 内容仅供学习交流</span>` +
          `<span>技能库与底稿制式版权归原作者，请勿商用转售</span>` +
        `</div>` +
      `</div>`;
  }

  /* ===================== 体系化组件 ===================== */

  /** 索引号 */
  function idx(code, cls) {
    if (!code) return '';
    return `<span class="idx${cls ? ' ' + cls : ''}">${escapeHtml(code)}</span>`;
  }

  /** 组标识 */
  function cycleBadge(code, withName) {
    const c = Store.cycle(code);
    return `<span class="cyc" data-c="${escapeHtml(code)}">${escapeHtml(code)}${withName && c ? ' · ' + escapeHtml(c.name) : ''}</span>`;
  }

  /** 认定 chips */
  function assertionChips(codes) {
    return (codes || []).map(a => {
      const meta = Store.assertion(a);
      const tip = meta ? `${meta.name}（${meta.en}）：${meta.desc}` : a;
      return `<span class="as-chip" data-a="${escapeHtml(a)}" title="${escapeHtml(tip)}">${escapeHtml(a)} ${escapeHtml(meta ? meta.name : '')}</span>`;
    }).join('');
  }

  /** 执行方式标识 */
  function modeBadge(mode, text) {
    const m = Store.modeLabel(mode);
    return `<span class="mode" data-m="${escapeHtml(mode)}" title="${escapeHtml(m.desc || '')}">` +
      `<span class="mode__dot"></span>${escapeHtml(text || m.name || mode)}</span>`;
  }

  /** 技能组卡片 */
  function skillCard(s) {
    const g = Store.reportGroup(s.reportGroup);
    const tools = new Set();
    s.procedures.forEach(p => (p.tools || []).forEach(t => tools.add(t)));
    const modes = {};
    s.procedures.forEach(p => { modes[p.mode] = (modes[p.mode] || 0) + 1; });

    return (
      `<article class="card card--hover">` +
        `<div class="card__body skill-tile">` +
          `<div class="skill-tile__top">` +
            `<span class="skill-tile__code" data-c="${escapeHtml(s.cycle)}">${escapeHtml(s.code)}</span>` +
            `<div style="min-width:0;flex:1">` +
              `<a class="skill-tile__title" href="skill.html?id=${encodeURIComponent(s.id)}">${escapeHtml(s.title)}</a>` +
              `<div style="font-size:12.5px;color:var(--ink-3);margin-top:3px">` +
                `${escapeHtml(g ? g.name : '通用')} · 风险等级 ${escapeHtml(s.riskLevel || '—')}` +
              `</div>` +
            `</div>` +
          `</div>` +
          `<p class="skill-tile__desc">${escapeHtml(s.description || '')}</p>` +
          `<div class="skill-tile__metrics">` +
            `<span class="metric"><span class="metric__num">${s.procedures.length}</span><span class="metric__label">程序卡</span></span>` +
            `<span class="metric"><span class="metric__num">${tools.size}</span><span class="metric__label">关联工具</span></span>` +
            `<span class="metric"><span class="metric__num">${modes.auto || 0}</span><span class="metric__label">全自动</span></span>` +
          `</div>` +
        `</div>` +
      `</article>`
    );
  }

  /** 程序卡行（技能详情页用） */
  function procedureRow(p) {
    const href = p.detail && p.detail.hasCard
      ? `procedure.html?skill=${encodeURIComponent(p.skillId)}&p=${encodeURIComponent(p.id)}`
      : `skill.html?id=${encodeURIComponent(p.skillId)}#procedures`;
    return (
      `<a class="proc-row" href="${href}">` +
        `<span class="proc-row__id">${escapeHtml(p.id)}</span>` +
        `<span>` +
          `<span class="proc-row__name">${escapeHtml(p.name)}</span>` +
          (p.source ? `<span class="proc-row__src">${escapeHtml(p.source)}</span>` : '') +
        `</span>` +
        `<span class="proc-row__as">${assertionChips(p.assertions)}</span>` +
        `<span title="${escapeHtml(p.modeText || '')}">${modeBadge(p.mode)}</span>` +
        `<span class="proc-row__out">${p.index ? idx(p.index) : escapeHtml(p.output || '—')}</span>` +
      `</a>`
    );
  }

  /** 工具卡 */
  function toolCard(t) {
    const used = Store.proceduresUsingTool(t.id).length;
    const iconKey = t.group === 'office' ? 'table' : (t.group === 'audit' ? 'fileCheck' : 'scale');
    return (
      `<article class="card card--hover" id="tool-${escapeHtml(t.id)}">` +
        `<div class="card__body tool-card">` +
          `<div class="tool-card__head">` +
            `<span class="tool-card__icon">${ICONS[iconKey]}</span>` +
            `<div style="min-width:0">` +
              `<div class="tool-card__name">${escapeHtml(t.name)}</div>` +
              `<div class="tool-card__id">${escapeHtml(t.id)}</div>` +
            `</div>` +
          `</div>` +
          `<p class="tool-card__desc">${escapeHtml(t.summary || '')}</p>` +
          `<div style="margin-top:auto;padding-top:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">` +
            (t.kind === 'office'
              ? `<span class="badge badge--muted">${escapeHtml(t.impl || '')}</span>`
              : `<span class="badge badge--brand">被 ${used} 张程序卡调用</span>`) +
            (t.kind === 'office' ? '' : `<a class="btn btn--quiet btn--sm" href="atlas.html?tool=${encodeURIComponent(t.id)}">查看调用方</a>`) +
          `</div>` +
        `</div>` +
      `</article>`
    );
  }

  /** 分布条 */
  function barRow(label, num, max, color) {
    const pct = max ? Math.round(num / max * 100) : 0;
    return (
      `<div class="bar-row">` +
        `<span class="bar-row__label">${label}</span>` +
        `<span class="bar-row__track"><span class="bar-row__fill" style="width:${pct}%${color ? ';background:' + color : ''}"></span></span>` +
        `<span class="bar-row__num">${num}</span>` +
      `</div>`
    );
  }

  /** 技能包下载卡片 */
  function downloadCard(s) {
    const d = s.download || {};
    const url = safeUrl(d.url);
    const provider = d.provider === 'quark' ? '夸克网盘' : (d.provider || '网盘');

    const meta =
      `<div class="dl-meta">` +
        `<div class="dl-meta__item"><div class="dl-meta__label">存储方式</div><div class="dl-meta__value">${escapeHtml(provider)}</div></div>` +
        `<div class="dl-meta__item"><div class="dl-meta__label">包大小</div><div class="dl-meta__value">${escapeHtml(d.size || '—')}</div></div>` +
        `<div class="dl-meta__item"><div class="dl-meta__label">版本</div><div class="dl-meta__value">v${escapeHtml(s.version || '1.0.0')}</div></div>` +
        `<div class="dl-meta__item"><div class="dl-meta__label">程序卡</div><div class="dl-meta__value">${s.procedures.length} 张</div></div>` +
      `</div>` +
      (d.format ? `<div style="margin-bottom:18px"><div class="dl-meta__label">包含内容</div><div class="dl-meta__value" style="font-weight:500">${escapeHtml(d.format)}</div></div>` : '') +
      (d.code
        ? `<div style="margin-bottom:20px"><div class="dl-meta__label" style="margin-bottom:6px">提取码</div>` +
            `<span class="dl-code"><span>${escapeHtml(d.code)}</span>` +
            `<button type="button" data-copy-code="${escapeHtml(d.code)}" title="复制提取码" aria-label="复制提取码">${ICONS.copy}</button>` +
          `</span></div>`
        : '');

    const body = url
      ? meta +
        `<div class="dl-actions">` +
          `<a class="btn btn--accent btn--lg" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer nofollow" data-quark-jump="${escapeHtml(s.id)}">` +
            `${ICONS.download}前往夸克网盘下载` +
          `</a>` +
          (d.code ? `<button class="btn btn--ghost btn--lg" type="button" data-copy-all="${escapeHtml(s.id)}">${ICONS.copy}复制链接与提取码</button>` : '') +
        `</div>` +
        `<div class="dl-note"><strong>提示：</strong>点击后将在新标签页打开${escapeHtml(provider)}。` +
          `${d.note ? escapeHtml(d.note) : '请先转存到自己的网盘再下载，避免链接失效。'}</div>`
      : `<div class="dl-empty">该技能包暂未开放下载，可通过<a href="contact.html">联系我们</a>获取</div>` +
        `<div class="dl-actions" style="margin-top:14px">` +
          `<button class="btn btn--ghost" type="button" data-copy-page-link>${ICONS.copy}复制本页链接</button>` +
        `</div>`;

    return (
      `<section class="dl-card" id="download" aria-labelledby="dl-title">` +
        `<div class="dl-card__head">${ICONS.download}<h3 id="dl-title">下载技能包</h3></div>` +
        `<div class="dl-card__body">${body}</div>` +
      `</section>`
    );
  }

  /* ===================== 下载行为 ===================== */
  function bindGlobalActions() {
    document.addEventListener('click', async (ev) => {
      const t = ev.target.closest('[data-copy-code],[data-copy-all],[data-copy-text],[data-copy-page-link],[data-quark-jump]');
      if (!t) return;

      /* 复制当前页面地址（技能包暂未开放下载时也能分享本页） */
      if (t.hasAttribute('data-copy-page-link')) {
        const ok = await copyText(global.location.href);
        showToast(ok ? '本页链接已复制' : '复制失败，请手动复制', ok);
        return;
      }

      if (t.hasAttribute('data-copy-code')) {
        const ok = await copyText(t.getAttribute('data-copy-code'));
        showToast(ok ? '提取码已复制' : '复制失败，请手动选择', ok);
        return;
      }

      if (t.hasAttribute('data-copy-text')) {
        const ok = await copyText(t.getAttribute('data-copy-text'));
        showToast(ok ? '已复制' : '复制失败，请手动复制', ok);
        return;
      }

      if (t.hasAttribute('data-copy-all')) {
        const s = Store.skill(t.getAttribute('data-copy-all'));
        if (!s || !s.download) return;
        const text = `${s.title}（${s.code} · v${s.version}）\n下载地址：${s.download.url}` +
                     (s.download.code ? `\n提取码：${s.download.code}` : '');
        const ok = await copyText(text);
        showToast(ok ? '链接与提取码已复制' : '复制失败，请手动复制', ok);
        return;
      }

      if (t.hasAttribute('data-quark-jump')) {
        showToast('已在新标签页打开夸克网盘');
      }
    });
  }

  /* ===================== Markdown 渲染（保留，供扩展内容使用） ===================== */
  function sanitize(html) {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/javascript:/gi, '');
  }

  function slugify(text) {
    return String(text).trim().toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  }

  function mdToHtml(md) {
    let html;
    if (global.marked && typeof global.marked.parse === 'function') {
      try { html = global.marked.parse(String(md || ''), { gfm: true, breaks: false }); }
      catch (e) { html = '<pre>' + escapeHtml(md) + '</pre>'; }
    } else {
      html = '<pre>' + escapeHtml(md) + '</pre>';
    }
    html = sanitize(html);
    return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (m, lv, inner) => {
      const text = inner.replace(/<[^>]+>/g, '').trim();
      return `<h${lv} id="${slugify(text)}">${inner}</h${lv}>`;
    });
  }

  /** 把程序卡步骤文本里的【脚本】【规则】【人工】标成彩色标签 */
  function renderStepText(text) {
    return escapeHtml(text)
      .replace(/【脚本】/g, '<span class="tag-script">脚本</span>')
      .replace(/【规则】/g, '<span class="tag-rule">规则</span>')
      .replace(/【人工】/g, '<span class="tag-human">人工</span>');
  }

  /** 渲染带层级的列表 */
  function renderSteps(items) {
    if (!items || !items.length) return '<p style="color:var(--ink-3);font-size:14px">暂无</p>';
    return '<ol class="step-list">' + items.map(it =>
      `<li data-lv="${it.level || 0}">${renderStepText(it.text)}</li>`
    ).join('') + '</ol>';
  }

  /** 渲染普通条目列表 */
  function renderItems(items, opts) {
    opts = opts || {};
    if (!items || !items.length) return '<p style="color:var(--ink-3);font-size:14px">暂无</p>';
    return '<ul class="six-cell__body" style="list-style:none">' + items.map(it => {
      const text = typeof it === 'string' ? it : it.text;
      const lv = typeof it === 'string' ? 0 : (it.level || 0);
      return `<li style="padding-left:${14 + lv * 16}px">${escapeHtml(text)}</li>`;
    }).join('') + '</ul>';
  }

  /* ===================== 初始化 ===================== */
  async function init(activeKey) {
    renderHeader(activeKey);
    let data = null;
    try {
      data = await Store.load();
    } catch (err) {
      console.error('[审小牛] 数据加载失败：', err);
    }
    renderFooter();
    bindGlobalActions();
    return data;
  }

  function renderDataError(host) {
    if (!host) return;
    host.innerHTML =
      `<div class="empty">${ICONS.alert}` +
        `<div class="empty__title">数据加载失败</div>` +
        `<p class="empty__desc">无法读取 <code>data/registry.json</code>。<br>` +
        `如果你是用双击 HTML 文件的方式打开，请改用本地服务器访问：<br>` +
        `<code>python -m http.server 8765</code>（详见 README）。</p>` +
        `<button class="btn btn--primary" type="button" onclick="location.reload()">重新加载</button>` +
      `</div>`;
  }

  /* ===================== 导出 ===================== */
  global.OX = {
    ICONS, Store, NAV_ITEMS,
    escapeHtml, safeUrl, formatNumber, formatDate, relativeDate,
    qs, debounce, copyText, showToast,
    renderHeader, renderFooter,
    idx, cycleBadge, assertionChips, modeBadge,
    skillCard, procedureRow, toolCard, barRow, downloadCard,
    mdToHtml, renderStepText, renderSteps, renderItems,
    init, renderDataError
  };
})(window);
