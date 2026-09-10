export const dynamic = "force-dynamic";

// Mirrors the http->ws origin swap in
// web/app/api/workspace/analytics/live-token/route.ts, computed server-side
// here so the embedded script always points at the right gateway regardless
// of environment.
function gatewayWsOrigin() {
  const httpUrl =
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "https://api.elpino.chat");
  return httpUrl.replace(/^http/, "ws");
}

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const script = `(() => {
    var ORIGIN = ${JSON.stringify(origin)};
    var WS_ORIGIN = ${JSON.stringify(gatewayWsOrigin())};
    var ACCENT = '#428ce5';
    var current = document.currentScript;
    var key = current && current.dataset.siteKey;
    if (!key) return;

    fetch(ORIGIN + '/api/widget/config?key=' + encodeURIComponent(key) + '&hostname=' + encodeURIComponent(location.hostname))
      .then(function (response) { if (!response.ok) throw new Error('Tag is not allowed on this domain'); return response.json(); })
      .then(function (payload) {
        window.ElpinoTag = { key: key, config: payload.config };
        window.dispatchEvent(new CustomEvent('elpino:ready', { detail: payload.config }));
        mount(payload.config || {});
        track();
      })
      .catch(function (error) { console.warn('[Elpino]', error.message); });

    // A live WebSocket connection to the gateway, held open for the life of
    // the tab — visitorId is a long-lived id in localStorage (same visitor
    // across sessions), sessionId is scoped to this tab's sessionStorage (a
    // fresh id per new tab/session). Both are opaque random ids, never tied
    // to the visitor's real identity. The gateway persists the opening
    // pageview and, on disconnect (tab closed, or a missed heartbeat),
    // persists the completed session — see apps/gateway/src/realtime.
    var HEARTBEAT_MS = 15000;
    function track() {
      try {
        var visitorId = localStorage.getItem('elpino_av_' + key);
        if (!visitorId) {
          visitorId = randomId();
          localStorage.setItem('elpino_av_' + key, visitorId);
        }
        var sessionId = sessionStorage.getItem('elpino_as_' + key);
        if (!sessionId) {
          sessionId = randomId();
          sessionStorage.setItem('elpino_as_' + key, sessionId);
        }

        var socket = null;
        var heartbeatTimer = null;
        var reconnectDelay = 1000;

        function connect() {
          var params =
            'key=' + encodeURIComponent(key) +
            '&hostname=' + encodeURIComponent(location.hostname) +
            '&visitorId=' + encodeURIComponent(visitorId) +
            '&sessionId=' + encodeURIComponent(sessionId) +
            '&path=' + encodeURIComponent(location.pathname) +
            '&referrer=' + encodeURIComponent(document.referrer || '');
          socket = new WebSocket(WS_ORIGIN + '/rt/visitor?' + params);

          socket.onopen = function () {
            reconnectDelay = 1000;
            heartbeatTimer = setInterval(function () {
              if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'heartbeat' }));
            }, HEARTBEAT_MS);
          };

          socket.onclose = function (event) {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            // Codes 4000-4003 are the gateway rejecting this connection
            // outright (bad request, site not verified for this domain) —
            // retrying won't fix that, so only reconnect on a normal drop.
            if (event.code >= 4000 && event.code <= 4003) return;
            setTimeout(connect, reconnectDelay);
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
          };
        }
        connect();
      } catch (error) {
        // Storage or WebSocket blocked (private mode, embedded iframe,
        // restrictive CSP) — skip tracking rather than breaking the tag.
      }
    }

    function randomId() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }

    function mount(config) {
      var open = false;
      var iframe = null;
      var greetingLines = Array.isArray(config.greetingLines) && config.greetingLines.length > 0
        ? config.greetingLines
        : ['Hi there \\u{1F44B}', 'How can I help you today?'];
      var botAvatarUrl = config.botAvatarUrl || null;
      var greeting = null;
      var badge = null;

      var button = document.createElement('button');
      button.setAttribute('aria-label', 'Open chat');
      button.style.cssText = 'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:9999px;border:none;background:' + ACCENT + ';box-shadow:0 10px 28px rgba(15,23,42,0.28);cursor:pointer;z-index:2147483000;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:transform .15s ease;';
      button.onmouseenter = function () { button.style.transform = 'scale(1.05)'; };
      button.onmouseleave = function () { button.style.transform = 'scale(1)'; };
      button.innerHTML = launcherIcon();
      button.onclick = function () { toggle(false); };
      document.body.appendChild(button);

      badge = document.createElement('span');
      badge.style.cssText = 'position:fixed;bottom:64px;right:14px;width:18px;height:18px;border-radius:9999px;background:#e5484d;color:#fff;font:700 10px/18px system-ui,sans-serif;text-align:center;z-index:2147483001;display:none;box-shadow:0 0 0 2px #fff;';
      badge.textContent = '1';
      document.body.appendChild(badge);

      setTimeout(showGreeting, 2500);

      function showGreeting() {
        if (open || greeting) return;
        greeting = document.createElement('div');
        greeting.style.cssText = 'position:fixed;bottom:88px;right:20px;width:300px;max-width:calc(100vw - 32px);z-index:2147483000;cursor:pointer;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;align-items:flex-end;gap:6px;';

        var bubbles = greetingLines.map(function (line) {
          return '<div style="background:#fff;color:#18181b;border:1px solid rgba(0,0,0,0.4);border-radius:6px;padding:10px 14px;box-shadow:0 16px 40px rgba(15,23,42,0.32);font-size:13px;line-height:1.4;width:fit-content;max-width:100%;">' + escapeHtml(line) + '</div>';
        }).join('');
        greeting.innerHTML =
          '<button aria-label="Dismiss" style="align-self:flex-end;background:rgba(23,25,27,0.9);border-radius:9999px;border:none;color:rgba(255,255,255,.6);cursor:pointer;padding:4px;line-height:0;box-shadow:0 4px 12px rgba(15,23,42,0.24);">' + closeIcon(12) + '</button>' +
          bubbles;
        greeting.querySelector('button').onclick = function (event) {
          event.stopPropagation();
          dismissGreeting();
        };
        greeting.onclick = function () { dismissGreeting(); if (!open) toggle(true); };
        document.body.appendChild(greeting);
        badge.style.display = 'block';
      }

      function dismissGreeting() {
        if (!greeting) return;
        greeting.remove();
        greeting = null;
      }

      window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'elpino:close' && open) toggle(false);
      });

      function toggle(startNew) {
        open = !open;
        button.innerHTML = open ? closeIcon(22) : launcherIcon();
        if (open) {
          dismissGreeting();
          badge.style.display = 'none';
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.title = 'Chat';
            iframe.src = ORIGIN + '/widget?key=' + encodeURIComponent(key) + '&host=' + encodeURIComponent(location.hostname) + (startNew ? '&new=1' : '');
            iframe.setAttribute('allow', 'microphone');
            iframe.style.cssText = 'position:fixed;bottom:88px;right:20px;width:360px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);border:none;border-radius:16px;box-shadow:0 16px 48px rgba(15,23,42,0.22);z-index:2147483000;background:#fff;';
            document.body.appendChild(iframe);
          }
          iframe.style.display = 'block';
        } else if (iframe) {
          iframe.style.display = 'none';
        }
      }

      function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      function chatIcon() {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
      }
      function launcherIcon() {
        if (botAvatarUrl) {
          return '<img src="' + botAvatarUrl + '" alt="" style="width:100%;height:100%;object-fit:cover;" />';
        }
        return chatIcon();
      }
      function closeIcon(size) {
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      }
    }
  })();`;
  return new Response(script, { headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "public, max-age=300", "access-control-allow-origin": "*" } });
}
