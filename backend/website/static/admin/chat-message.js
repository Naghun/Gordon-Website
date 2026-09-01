(function () {
  function resize(field) {
    field.style.height = 'auto';
    field.style.height = Math.max(38, field.scrollHeight) + 'px';
  }
  function prepare(root) {
    root.querySelectorAll('textarea.chat-message-input').forEach(function (field) {
      if (field.dataset.autogrow) return;
      field.dataset.autogrow = 'true';
      field.addEventListener('input', function () { resize(field); });
      resize(field);
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    prepare(document);
    var initialHistory = document.querySelector('.admin-chat-history');
    if (initialHistory) initialHistory.scrollTop = initialHistory.scrollHeight;
    new MutationObserver(function () { prepare(document); }).observe(document.body, {childList:true, subtree:true});
    var reply = document.querySelector('textarea.chat-message-input');
    if (reply) {
      reply.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          var send = document.querySelector('.submit-row input[name="_save"]');
          if (reply.value.trim() && send) send.click();
        }
      });
    }
    async function refreshHistory() {
      if (document.hidden || document.activeElement === reply) return;
      try {
        var response = await fetch(window.location.href, {cache:'no-store', headers:{'X-Requested-With':'XMLHttpRequest'}});
        if (!response.ok) return;
        var page = new DOMParser().parseFromString(await response.text(), 'text/html');
        var incoming = page.querySelector('.admin-chat-history');
        var current = document.querySelector('.admin-chat-history');
        if (incoming && current && incoming.innerHTML !== current.innerHTML) {
          current.innerHTML = incoming.innerHTML;
          current.scrollTop = current.scrollHeight;
        }
      } catch (_) {}
    }
    window.setInterval(refreshHistory, 2000);
  });
})();
