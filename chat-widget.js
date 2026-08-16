/**
 * RAFMAC floating chat widget
 * ----------------------------
 * Self-contained, vanilla JS, zero dependencies.
 *
 * - Renders inside a Shadow DOM so its CSS can never leak into (or be
 *   overridden by) the site's existing styles, and vice versa.
 * - Collapsed by default (a single floating button, bottom-right). The
 *   chat panel only mounts/expands on click, so there's no visual
 *   footprint until a visitor engages with it.
 * - Does not read, modify, or depend on any existing DOM/CSS on the page.
 * - All provider config lives in assets/chat-widget.config.js
 *   (window.RAFMAC_CHAT_CONFIG). Nothing here needs to be edited to
 *   change providers, keys, or copy.
 */
(function () {
  'use strict';

  if (document.getElementById('rafmac-chat-widget')) return; // guard against double-init

  var cfg = window.RAFMAC_CHAT_CONFIG || {};
  var provider = cfg.provider || 'mailto';
  var iframeUrl = cfg.iframeUrl || '';
  var mailtoAddress = cfg.mailtoAddress || 'hello@RAFMACcore.com';
  var title = cfg.title || 'Chat with us';
  var subtitle = cfg.subtitle || '';
  var launcherLabel = cfg.launcherLabel || 'Open chat';

  function mount() {
    var host = document.createElement('div');
    host.id = 'rafmac-chat-widget';
    // Inline positioning on the host itself (outside the shadow root) so
    // it is completely unaffected by, and has no effect on, page layout.
    host.style.position = 'fixed';
    host.style.zIndex = '999999';
    host.style.bottom = '0';
    host.style.right = '0';
    host.style.left = 'auto';
    host.style.top = 'auto';
    host.style.width = '0';
    host.style.height = '0';
    document.body.appendChild(host);

    var root = host.attachShadow({ mode: 'open' });

    var style = document.createElement('style');
    style.textContent = [
      ':host{all:initial}',
      '.rcw-root,.rcw-root *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif}',
      '.rcw-root{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;align-items:flex-end;gap:12px}',
      '.rcw-launcher{width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#5799ff,#27cceb);color:#04070D;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(20,30,50,.35);transition:transform .15s ease,box-shadow .15s ease}',
      '.rcw-launcher:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(20,30,50,.4)}',
      '.rcw-launcher:focus-visible{outline:2px solid #21D4F6;outline-offset:3px}',
      '.rcw-launcher svg{width:26px;height:26px}',
      '.rcw-launcher .rcw-icon-close{display:none}',
      '.rcw-root.rcw-open .rcw-launcher .rcw-icon-chat{display:none}',
      '.rcw-root.rcw-open .rcw-launcher .rcw-icon-close{display:block}',
      '.rcw-panel{width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:#0E1015;border:1px solid #20242D;border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.45);display:none;flex-direction:column;overflow:hidden}',
      '.rcw-root.rcw-open .rcw-panel{display:flex}',
      '.rcw-header{padding:16px 18px;background:linear-gradient(135deg,#111722,#0b0e14);border-bottom:1px solid #20242D;color:#EEF0F3;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex:0 0 auto}',
      '.rcw-header h2{font-size:15px;font-weight:600;margin:0 0 2px;color:#EEF0F3;line-height:1.3}',
      '.rcw-header p{font-size:12px;margin:0;color:#8B93A3;line-height:1.4}',
      '.rcw-close{background:none;border:none;cursor:pointer;color:#8B93A3;padding:4px;border-radius:6px;flex:0 0 auto;line-height:0}',
      '.rcw-close:hover{color:#EEF0F3}',
      '.rcw-close:focus-visible{outline:2px solid #21D4F6;outline-offset:2px}',
      '.rcw-body{flex:1 1 auto;min-height:0;background:#0b0e14}',
      '.rcw-body iframe{width:100%;height:100%;border:0;display:block}',
      '.rcw-fallback{padding:20px;height:100%;display:flex;flex-direction:column;justify-content:center;gap:14px;color:#c7cedb;font-size:14px;line-height:1.6;text-align:center}',
      '.rcw-fallback a{display:inline-block;margin-top:4px;padding:11px 18px;border-radius:8px;background:linear-gradient(135deg,#5799ff,#27cceb);color:#04070D;font-weight:650;font-size:13px;text-decoration:none}',
      '.rcw-fallback a:focus-visible{outline:2px solid #21D4F6;outline-offset:2px}',
      '@media (max-width:480px){.rcw-panel{width:calc(100vw - 24px);height:calc(100vh - 104px)}.rcw-root{right:12px;bottom:12px}}'
    ].join('');
    root.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'rcw-root';
    wrap.innerHTML =
      '<div class="rcw-panel" role="dialog" aria-modal="false" aria-label="' + escapeAttr(title) + '">' +
        '<div class="rcw-header">' +
          '<div><h2>' + escapeHtml(title) + '</h2>' + (subtitle ? '<p>' + escapeHtml(subtitle) + '</p>' : '') + '</div>' +
          '<button type="button" class="rcw-close" aria-label="Close chat">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rcw-body"></div>' +
      '</div>' +
      '<button type="button" class="rcw-launcher" aria-haspopup="dialog" aria-expanded="false" aria-label="' + escapeAttr(launcherLabel) + '">' +
        '<svg class="rcw-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>' +
        '<svg class="rcw-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>';
    root.appendChild(wrap);

    var body = wrap.querySelector('.rcw-body');
    var effectiveIframeUrl = provider === 'iframe' ? iframeUrl : '';
    if (effectiveIframeUrl) {
      var iframe = document.createElement('iframe');
      iframe.src = effectiveIframeUrl;
      iframe.title = title;
      iframe.loading = 'lazy';
      body.appendChild(iframe);
    } else {
      var fallback = document.createElement('div');
      fallback.className = 'rcw-fallback';
      fallback.innerHTML =
        '<div>Live chat isn\u2019t connected yet. Send us a message and we\u2019ll reply by email.</div>' +
        '<a href="mailto:' + escapeAttr(mailtoAddress) + '?subject=Chat%20enquiry">Email ' + escapeHtml(mailtoAddress) + '</a>';
      body.appendChild(fallback);
    }

    var launcher = wrap.querySelector('.rcw-launcher');
    var closeBtn = wrap.querySelector('.rcw-close');

    function setOpen(open) {
      wrap.classList.toggle('rcw-open', open);
      launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) closeBtn.focus();
      else launcher.focus();
    }

    launcher.addEventListener('click', function () {
      setOpen(!wrap.classList.contains('rcw-open'));
    });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('rcw-open')) setOpen(false);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeAttr(str) { return escapeHtml(str); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
