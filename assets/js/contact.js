/* 联系页：联系方式卡片 / 技能组下拉 / 表单校验 / 自动推送邮件 + 感谢弹框 */
(function () {
  'use strict';
  const { ICONS, Store, escapeHtml, copyText, showToast, modal, init } = window.OX;

  let CONTACT = {};

  /* 邮件推送服务商适配表。
     - web3forms：需要 access_key（在 web3forms.com 用邮箱免费领取，250 封/月）。
       access_key 是「公开钥匙」，官方明确说明可以写在前端代码里，不要求保密。
     - formsubmit：零配置，把收件邮箱拼进 URL；首次提交后收件人点一次激活邮件即可
     两者都是纯前端 POST，不需要自建后端。
     注意：Web3Forms 免费版只允许浏览器端调用，服务端调用会被 403 拒绝。 */
  const PROVIDERS = {
    web3forms: {
      endpoint: (cfg) => cfg.endpoint || 'https://api.web3forms.com/submit',
      payload: (cfg, d) => Object.assign(
        { access_key: cfg.accessKey || '', subject: d.subject, from_name: cfg.fromName || '审小牛' },
        isEmail(d.reply) ? { email: d.reply, replyto: d.reply } : {},
        d.fields
      ),
      ok: (r) => r && r.success !== false
    },
    formsubmit: {
      endpoint: (cfg) => 'https://formsubmit.co/ajax/' + encodeURIComponent(cfg.email || ''),
      payload: (cfg, d) => Object.assign(
        { _subject: d.subject, _template: 'table', _captcha: 'false' },
        isEmail(d.reply) ? { _replyto: d.reply } : {},
        d.fields
      ),
      ok: (r) => r && r.success !== 'false' && r.success !== false
    }
  };

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()); }

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await init('contact');
    if (data) CONTACT = (Store.site().contact) || {};

    renderContactCards();
    fillSkillOptions();
    bindForm();
    bindQrZoom();
  }, { once: true });

  /* ---------- 二维码放大 ---------- */
  function bindQrZoom() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-qr-zoom]')) return;
      openQrZoom();
    });
  }

  function openQrZoom() {
    const qr = CONTACT.wechatQr || '';
    if (!qr) return;
    modal({
      title: '扫码加我微信',
      desc:
        `<div class="qr-zoom">` +
          `<img src="${escapeHtml(qr)}" alt="微信二维码，扫码添加">` +
          `<p class="qr-zoom__hint">备注「审小牛」优先通过</p>` +
        `</div>`,
      actions: [{ label: '好，知道了', style: 'primary' }]
    });
  }

  /* ---------- 联系方式卡片 ---------- */
  function renderContactCards() {
    const host = document.getElementById('contact-cards');
    if (!host) return;

    const email = CONTACT.email || '';
    const qr = CONTACT.wechatQr || '';

    /* 微信卡片：只展示二维码，不再暴露微信号文本。
       排在邮箱后面 —— 两张都是「联系方式」，放一起更顺。
       二维码做成按钮：悬停放大（桌面端），点击开大图（手机端没有 hover）。 */
    const wechatCard = qr
      ? `<div class="card"><div class="card__body qr-card">` +
          `<button class="qr-card__img" type="button" data-qr-zoom title="点击放大二维码" aria-label="放大微信二维码">` +
            `<img src="${escapeHtml(qr)}" alt="微信二维码，扫码添加" loading="lazy" width="104" height="104">` +
          `</button>` +
          `<div style="flex:1;min-width:0">` +
            `<div style="font-size:12.5px;color:var(--ink-3)">微信</div>` +
            `<div style="font-size:15.5px;font-weight:650;margin:2px 0 4px">欢迎沟通交流</div>` +
            `<p style="font-size:13px;color:var(--ink-2);margin:0;line-height:1.7">手机微信扫一下，备注「审小牛」优先通过。</p>` +
          `</div>` +
        `</div></div>`
      : '';

    const cards = [
      {
        icon: ICONS.mail, label: '邮箱', value: email || '—',
        desc: '正式反馈、技能需求与合作洽谈，推荐用这个',
        href: email ? 'mailto:' + email : '',
        action: '写邮件'
      },
      { html: wechatCard },
      {
        icon: ICONS.sparkles, label: '技能需求', value: '把审计程序 skill 化',
        desc: '告诉我你想沉淀的那道程序，按六要素补全后即可固化',
        href: '#contact-form', action: '填写需求'
      }
    ];

    host.innerHTML = cards.map(c => {
      if (c.html !== undefined) return c.html;
      const href = /^(https?:\/\/|mailto:|#)/i.test(c.href || '') ? c.href : '';
      const btn = href
        ? `<a class="btn btn--ghost btn--sm" href="${escapeHtml(href)}"${/^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(c.action)}</a>`
        : '';
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

    const rn = document.getElementById('resp-note');
    if (rn && CONTACT.replyNote) rn.textContent = CONTACT.replyNote;
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

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = collect(true);
      if (!d) return;

      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = ICONS.refresh + '正在提交…'; }

      let sent = false;
      try { sent = await sendMail(d); } catch (err) { sent = false; }
      finally { if (btn) { btn.disabled = false; btn.innerHTML = label; } }

      if (sent) {
        form.reset();
        showThanks();
      } else {
        fallbackMail(d);
      }
    });

    document.getElementById('copy-btn').addEventListener('click', async () => {
      const d = collect(false);
      if (!d) { showToast('请先填写必填项', false); return; }
      const ok = await copyText(`收件人：${CONTACT.email || '（未配置）'}\n主题：${d.subject}\n\n${d.body}`);
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

  /* ---------- 提交到表单服务 ---------- */
  function sendMail(d) {
    const cfg = Object.assign({ email: CONTACT.email }, CONTACT.form || {});
    const p = PROVIDERS[cfg.provider] || PROVIDERS.web3forms;

    if (p === PROVIDERS.web3forms && !cfg.accessKey) {
      return Promise.resolve(false);   /* 没配 key → 直接走兜底 */
    }
    if (p === PROVIDERS.formsubmit && !cfg.email) {
      return Promise.resolve(false);
    }

    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 12000) : null;

    return fetch(p.endpoint(cfg), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(p.payload(cfg, d)),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(r => r.json().catch(() => ({})))
      .then(r => p.ok(r))
      .catch(() => false)
      .then(v => { if (timer) clearTimeout(timer); return v; });
  }

  /* 自动推送不可用时的兜底：复制 + 唤起邮件客户端 */
  function fallbackMail(d) {
    const to = CONTACT.email || '';
    if (!to) {
      copyText(d.body).then(() => showToast('未配置收件邮箱，内容已复制到剪贴板', false));
      return;
    }
    copyText(d.body);
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`;
    showMailFallback(d);
  }

  /* ---------- 感谢弹框 ---------- */
  function showThanks() {
    const mail = CONTACT.email || '';
    modal({
      icon: ICONS.checkCircle,
      title: '反馈已收到，谢谢！',
      desc:
        `<p>你的反馈已经记下了。平时要上班，回复可能慢一点，但<strong>每一条我都会看</strong>。</p>` +
        `<p>链接失效这类会优先处理，一般当天更新。</p>`,
      extra: ICONS.check + `<div>已同步到我的邮箱${mail ? `（<strong>${escapeHtml(mail)}</strong>）` : ''}，不会漏。</div>`,
      actions: [
        { label: '再提一条', style: 'ghost', onClick: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); } },
        { label: '好，知道了', style: 'primary' }
      ]
    });
  }

  function showMailFallback(d) {
    modal({
      icon: ICONS.send,
      title: '内容已准备好',
      desc:
        `<p>自动推送暂时没连上，你的邮件客户端应该已经弹出来了——<strong>点一下发送</strong>，反馈就到我这儿了。</p>`,
      extra: ICONS.info +
        `<div>没弹出也不要紧，内容已复制到剪贴板，粘贴到任意邮件里发到 ` +
        `${escapeHtml(CONTACT.email || '')} 即可。</div>`,
      actions: [
        { label: '复制内容', style: 'ghost', onClick: () => { copyText(d.body); showToast('已复制'); return false; } },
        { label: '好，知道了', style: 'primary' }
      ]
    });
  }

  /* ---------- 取值与校验 ---------- */
  function collect(strict) {
    const name = document.getElementById('name').value.trim();
    const reply = document.getElementById('reply').value.trim();
    const type = document.getElementById('type').value;
    const skill = document.getElementById('skill').value;
    const message = document.getElementById('message').value.trim();
    const trap = document.getElementById('company');   /* 蜜罐：真人不会填 */

    const errors = [];
    if (!reply) errors.push('f-reply');
    if (!type) errors.push('f-type');
    if (message.length < 10) errors.push('f-message');
    if (trap && trap.value) errors.push('f-reply');     /* 机器人：当成校验失败，静默丢弃 */

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

    const time = new Date().toLocaleString('zh-CN');
    const body =
      `称呼：${name || '（未填写）'}\n` +
      `联系方式：${reply || '（未填写）'}\n` +
      `反馈类型：${type || '（未选择）'}\n` +
      `相关技能组：${skill || '不涉及'}\n` +
      `提交时间：${time}\n` +
      `------------------------------------\n\n${message || '（未填写）'}`;

    const prefix = (CONTACT.form && CONTACT.form.subjectPrefix) || '【审小牛反馈】';

    return {
      name, reply, type, skill, message, body,
      subject: `${prefix}${type || '未分类'}${skill ? ' · ' + skill.split(' ')[0] : ''}`,
      /* 给表单服务用的结构化字段 */
      fields: {
        '称呼': name || '（未填写）',
        '联系方式': reply || '（未填写）',
        '反馈类型': type || '（未选择）',
        '相关技能组': skill || '不涉及',
        '提交时间': time,
        '详细说明': message || '（未填写）',
        '来源页面': (typeof location !== 'undefined' ? location.href : '')
      }
    };
  }
})();
