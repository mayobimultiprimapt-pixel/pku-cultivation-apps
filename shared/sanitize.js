/**
 * PKU Sanitize · 通用 HTML / DOM 安全工具
 *
 * audit_pku.md QA-6 / SEC-6 修复抽离：
 * - escapeHtml: 把字符串里的 HTML 元字符转义，防止注入
 * - safeText: 把字符串作为纯文本塞进 element（最安全，推荐）
 * - linkify: 把 URL 转成 <a>，自带 rel="noopener noreferrer"
 * - mini Markdown: 仅识别白名单标签（b/i/em/strong/code/br/p）
 *
 * 使用：
 *   <script src="/pku-cultivation-apps/shared/sanitize.js"></script>
 *   const safe = PKUSanitize.escapeHtml(userInput);
 *   PKUSanitize.safeText(el, llmOutput);
 */
(function (global) {
  'use strict';
  if (global.PKUSanitize) return;

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"'`=\/]/g, function (c) {
      return ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;', '`': '&#96;',
        '=': '&#61;', '/': '&#47;'
      })[c];
    });
  }

  function safeText(el, text) {
    if (!el) return;
    el.textContent = text == null ? '' : String(text);
  }

  function linkify(text) {
    var escaped = escapeHtml(text);
    return escaped.replace(/(https?:\/\/[^\s<]+)/g, function (url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
    });
  }

  // 最小 markdown：仅 **bold** *italic* `code` 换行 段落
  function miniMarkdown(text) {
    if (text == null) return '';
    var s = escapeHtml(text);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|\s)\*([^*\s][^*]*?)\*(?=\s|$)/g, '$1<em>$2</em>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\n\n+/g, '</p><p>');
    s = s.replace(/\n/g, '<br>');
    return '<p>' + s + '</p>';
  }

  // 替换某 element 的内容为 AI 输出，走 mini markdown 渲染
  function renderAI(el, llmText) {
    if (!el) return;
    el.innerHTML = miniMarkdown(llmText);
  }

  global.PKUSanitize = {
    escapeHtml: escapeHtml,
    safeText: safeText,
    linkify: linkify,
    miniMarkdown: miniMarkdown,
    renderAI: renderAI,
    version: '1.0.0'
  };
})(typeof window !== 'undefined' ? window : globalThis);
