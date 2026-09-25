/* 联系页：联系方式卡片 / 技能组下拉 / 表单校验 / 生成邮件 */
(function () {
  'use strict';
  const { ICONS, Store, escapeHtml, copyText, showToast, init } = window.OX;

  let CONTACT = {};

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await init('contact');
    if (data) CONTACT = (Store.site().contact) || {};

    renderContactCards();
    fillSkillOptions();
    bindForm();
  }, { once: true });

  /* ---------- 联系方式卡片 ---------- */
  function renderContactCards() {
    const host = document.getElementById('contact-cards');
    if (!host) return;

    const cards = [
      {
        icon: ICONS.mail, label: '邮箱', value: CONTACT.email || '—',
        desc: '正式反馈、技能需求与合作洽谈，推荐用这个',
        href: CONTACT.email ? 'mailto:' + CONTACT.email : '',
        action: '写邮件'
      },
      {
        icon: ICONS.wechat, label: '微信', value: CONTACT.wechat || '—',
        desc: '加好友请备注「技能」，否则可能不通过',
        action: '复制微信号', copy: CONTACT.wechat || ''
      },
      {
        icon: ICONS.folder, label: '夸克网盘群', value: '技能包备份与更新',
        desc: '链接失效时，群里一定有最新版本',
        href: CONTACT.quarkGroup || '', action: '前往网盘'
      },
      {
        icon: ICONS.sparkles, label: '技能需求', value: '把审计程序 skill 化',
        desc: '告诉我你想沉淀的那道程序，按六要素补全后即可固化',
        href: '#contact-form', action: '填写需求'
      }
    ];

    host.innerHTML = cards.map(c => {
      const href = /^(https?:\/\/|mailto:|#)/i.test(c.href || '') ? c.href : '';
      const btn = c.copy
        ? `<button class="btn btn--ghost btn--sm" type="button" data-copy-text="${escapeHtml(c.copy)}">${ICONS.copy}${escapeHtml(c.action)}</button>`
        : (href
            ? `<a class="btn btn--ghost btn--sm" href="${escapeHtml(href)}"${/^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(c.action)}</a>`
            : '');
      return (
        `<div class="card"><div class="card__body" style="display:flex;gap:16px;align-items:flex-start">` +
          `<div class="skill-card__icon" style="flex-shrink:0">${c.icon}</div>` +
          `<div style="flex:1;min-width:0">` +
            `<div style="font-size:12.5px;color:var(--ink-3)">${escapeHtml(c.label)}</div>` +
            `<div style="font-size:15.5px;font-weight:650;margin:2px 0 4px;word-break:break-all">${escapeHtml(c.value)}</div>` +
            `<p style="font-size:13px;color:var(--ink-2);margin-bottom:12px">${escapeHtml(c.desc)}</p>` +
            btn +
          `</div>` +
        `</div></div>`
      );
    }).join('');

    const rt = document.getElementById('resp-time');
    if (rt && CONTACT.responseTime) rt.textContent = CONTACT.responseTime;
  }

  /* ---------- 技能组下拉 ---------- */
  function fillSkillOptions() {
    const sel = document.getElementById('skill');
    if (!sel || !Store.get()) return;
    sel.innerHTML = '<option value="">不涉及 / 全部</option>' +
      Store.skills().map(s =>
        `<option value="${escapeHtml(s.code)} ${escapeHtml(s.title)}">${escapeHtml(s.code)} · ${escapeHtml(s.title)}</option>`
      ).join('');
  }

  /* ---------- 表单 ---------- */
  function bindForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = collect(true);
      if (!data) return;

      const to = CONTACT.email || '';
      if (!to) {
        copyText(data.body).then(() => showToast('未配置收件邮箱，内容已复制到剪贴板', false));
        return;
      }
      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.body)}`;
      window.location.href = mailto;
      showToast('已打开邮件客户端，请确认后发送');
    });

    document.getElementById('copy-btn').addEventListener('click', async () => {
      const data = collect(false);
      if (!data) { showToast('请先填写必填项', false); return; }
      const ok = await copyText(`收件人：${CONTACT.email || '（未配置）'}\n主题：${data.subject}\n\n${data.body}`);
      showToast(ok ? '反馈内容已复制，可直接粘贴发送' : '复制失败，请手动选择', ok);
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
      form.reset();
      document.querySelectorAll('.field.has-error').forEach(f => f.classList.remove('has-error'));
    });

    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f) f.classList.remove('has-error');
    });
  }

  function collect(strict) {
    const name = document.getElementById('name').value.trim();
    const reply = document.getElementById('reply').value.trim();
    const type = document.getElementById('type').value;
    const skill = document.getElementById('skill').value;
    const message = document.getElementById('message').value.trim();

    const errors = [];
    if (!reply) errors.push('f-reply');
    if (!type) errors.push('f-type');
    if (message.length < 10) errors.push('f-message');

    /* 先清空上一次的错误态，再按本次校验结果重新标记 */
    document.querySelectorAll('.field.has-error').forEach(f => f.classList.remove('has-error'));

    if (errors.length && strict !== false) {
      errors.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('has-error');
      });
      const first = document.getElementById(errors[0]);
      if (first) {
        window.scrollTo({ top: first.offsetTop - 120, behavior: 'smooth' });
        const input = first.querySelector('input,select,textarea');
        if (input) input.focus({ preventScroll: true });
      }
      showToast('还有 ' + errors.length + ' 项需要补充', false);
      return null;
    }

    const body =
      `称呼：${name || '（未填写）'}\n` +
      `联系方式：${reply || '（未填写）'}\n` +
      `反馈类型：${type || '（未选择）'}\n` +
      `相关技能组：${skill || '不涉及'}\n` +
      `提交时间：${new Date().toLocaleString('zh-CN')}\n` +
      `------------------------------------\n\n${message || '（未填写）'}`;

    return {
      name, reply, type, skill, message, body,
      subject: `【审小牛反馈】${type || '未分类'}${skill ? ' · ' + skill.split(' ')[0] : ''}`
    };
  }
})();
