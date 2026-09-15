export const dynamic = "force-dynamic";

// Mirrors the http->ws origin swap in
// web/app/api/workspace/analytics/live-token/route.ts, computed server-side
// here so the embedded script always points at the right gateway regardless
// of environment.
function gatewayWsOrigin() {
  const httpUrl =
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    (process.env.NODE_ENV === "development" ? "http://127.0.0.1:4000" : "https://api.elpino.chat");
  return httpUrl.replace(/^http/, "ws");
}

// Base for the widget's own config fetch — cdn.elpino.chat (which proxies
// /api/widget/* to this same app; see the nginx config on the server, not
// in this repo) rather than wherever this app is actually deployed. That
// used to be externalOrigin(request) below, which put the app's real host
// (a Cloud Run URL today) into it — meaning a customer's CSP connect-src
// needed to track wherever we happen to be deployed, and changed on every
// redeploy to a different host. cdn.elpino.chat is the one origin that's
// meant to stay stable regardless: same reasoning as gatewayWsOrigin above,
// just for the config fetch instead of the websocket.
function widgetApiOrigin() {
  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://cdn.elpino.chat";
}

// request.url reflects the app's own bind address (e.g. localhost:3000)
// unless the platform's forwarded headers are trusted explicitly — Cloud
// Run, like most platforms behind a reverse proxy, doesn't rewrite it for
// you. Every customer's widget embeds whatever this resolves to, so
// trusting request.url directly here silently ships a dead ORIGIN to every
// site running the tag. Same fix as app/api/auth/_lib/redirect-url.ts uses
// for OAuth redirects.
function externalOrigin(request: Request): string {
  const internal = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  if (!host) return internal.origin;

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto === "http" ? "http:" : "https:";
  try {
    return new URL(`${protocol}//${host}`).origin;
  } catch {
    return internal.origin;
  }
}

export function GET(request: Request) {
  // ORIGIN: wherever this app is actually deployed — only needed for the
  // chat iframe itself (a real Next.js page, can't be served from the CDN).
  // TAG_ORIGIN: the stable public origin for everything else the tag calls
  // (config fetch) — see widgetApiOrigin() above.
  const origin = externalOrigin(request);
  const tagOrigin = widgetApiOrigin();
  const script = `(() => {
    var ORIGIN = ${JSON.stringify(origin)};
    var TAG_ORIGIN = ${JSON.stringify(tagOrigin)};
    var WS_ORIGIN = ${JSON.stringify(gatewayWsOrigin())};
    var ACCENT = '#428ce5';
    var current = document.currentScript;
    var key = current && current.dataset.siteKey;
    if (!key) return;

    // Signed identity for a logged-in visitor, minted by the site's own
    // server with its Elpino identity secret. Preferred: set
    // window.ElpinoSettings = { getIdentityToken: async () => token } before
    // this script loads; the widget calls it whenever it needs a fresh
    // single-use token. A token rendered into the page as
    // ElpinoSettings.identityToken signs in once: when that session ends the
    // visitor carries on anonymously until the page provides a new token.
    // ElpinoTag.identify({ token }) after login, ElpinoTag.logout() on
    // sign-out. Tokens only reach the chat iframe by postMessage, never in a URL.
    var settings = window.ElpinoSettings || {};
    var identityToken = typeof settings.identityToken === 'string' && settings.identityToken ? settings.identityToken : null;
    var postToWidget = function () {};
    var identityGeneration = 0;
    var signedOut = false;

    function refreshIdentity() {
      if (signedOut || typeof settings.getIdentityToken !== 'function') {
        postToWidget({ type: 'elpino:identity', token: identityToken });
        return;
      }
      var generation = ++identityGeneration;
      Promise.resolve().then(function () { return settings.getIdentityToken(); }).then(function (token) {
        if (generation !== identityGeneration) return;
        identityToken = typeof token === 'string' ? token : null;
        postToWidget({ type: 'elpino:identity', token: identityToken });
      }).catch(function () {
        if (generation !== identityGeneration) return;
        identityToken = null;
        postToWidget({ type: 'elpino:logout' });
      });
    }

    function identify(options) {
      signedOut = false;
      identityGeneration += 1;
      identityToken = options && typeof options.token === 'string' && options.token ? options.token : null;
      postToWidget({ type: 'elpino:identity', token: identityToken });
    }

    function logout() {
      signedOut = true;
      identityGeneration += 1;
      identityToken = null;
      postToWidget({ type: 'elpino:logout' });
    }

    fetch(TAG_ORIGIN + '/api/widget/config?key=' + encodeURIComponent(key) + '&hostname=' + encodeURIComponent(location.hostname))
      .then(function (response) { if (!response.ok) throw new Error('Tag is not allowed on this domain'); return response.json(); })
      .then(function (payload) {
        window.ElpinoTag = { key: key, config: payload.config, identify: identify, logout: logout };
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
      // Per-tab, not per-visitor: sessionStorage means a chat left open
      // follows the visitor across page navigations on this tab, but a new
      // tab starts closed. The conversation itself is restored separately
      // and server-side (visitorToken -> /api/widget/start), so this only
      // remembers whether the panel was showing, not what was said.
      var OPEN_KEY = 'elpino_open_' + key;
      // Tracks whether we own the top history entry, so closing the panel
      // can clean it up and back-navigation can be told apart from a
      // visitor clicking the close button.
      var pushedHistory = false;
      var ignoreNextPop = false;

      function rememberOpen(isOpen) {
        try {
          if (isOpen) sessionStorage.setItem(OPEN_KEY, '1');
          else sessionStorage.removeItem(OPEN_KEY);
        } catch (error) {
          // Storage blocked (private mode, partitioned third-party context).
          // The panel just won't follow across pages — never a hard failure.
        }
      }

      function wasOpen() {
        try { return sessionStorage.getItem(OPEN_KEY) === '1'; }
        catch (error) { return false; }
      }
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

      // Replies that arrived while the panel was closed or this tab was in
      // the background: counted on the launcher badge and, while the tab is
      // hidden, in the page title. The chat iframe reports them.
      var unread = 0;
      var titleBeforeUnread = null;
      function showUnread() {
        badge.textContent = unread > 9 ? '9+' : String(unread);
        badge.style.display = unread && !open ? 'block' : 'none';
        if (unread && document.hidden) {
          if (titleBeforeUnread === null) titleBeforeUnread = document.title;
          document.title = '(' + unread + ') New message' + (unread === 1 ? '' : 's') + ' · ' + titleBeforeUnread;
        }
      }
      function restoreTitle() {
        if (titleBeforeUnread === null) return;
        document.title = titleBeforeUnread;
        titleBeforeUnread = null;
      }
      function clearUnread() {
        unread = 0;
        restoreTitle();
        if (!greeting) badge.style.display = 'none';
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) return;
        // Back on the tab: the title has done its job. The badge stays until
        // the panel is actually opened.
        restoreTitle();
        if (open) clearUnread();
      });

      if (wasOpen()) {
        // Carried over from the previous page — drop straight back into the
        // conversation. No greeting bubble: they're already talking to us.
        setOpen(true, false);
      } else {
        setTimeout(showGreeting, 2500);
      }

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

      // Only the chat iframe, and only at its own origin, ever receives the
      // identity token.
      postToWidget = function (message) {
        if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage(message, ORIGIN);
      };

      window.addEventListener('message', function (event) {
        if (!event.data || !iframe || event.source !== iframe.contentWindow || event.origin !== ORIGIN) return;
        if (event.data.type === 'elpino:close' && open) setOpen(false);
        // The iframe needs to know whether anyone can see it before it
        // decides a reply deserves a sound.
        if (event.data.type === 'elpino:widget-ready') postToWidget({ type: 'elpino:panel', open: open });
        if (event.data.type === 'elpino:unread' && typeof event.data.count === 'number' && event.data.count > 0) {
          unread += Math.min(Math.floor(event.data.count), 50);
          showUnread();
        }
        // The iframe asks once it has loaded; answer with whatever identity
        // the page has given so far, which may be none.
        if (event.data.type === 'elpino:widget-ready' || event.data.type === 'elpino:identity-refresh') {
          refreshIdentity();
        }
      });

      // Opening the panel pushes a history entry, so the browser's back
      // button closes the chat instead of navigating the visitor off the
      // page mid-conversation. A second back then leaves as normal. This is
      // what other widgets do that feels like a "do you really want to
      // leave?" step — it isn't beforeunload, which browsers no longer let
      // anyone customise anyway.
      window.addEventListener('popstate', function () {
        if (ignoreNextPop) { ignoreNextPop = false; return; }
        if (!open) return;
        // Our own entry just got popped — the panel goes away, the page
        // stays put. pushedHistory is cleared first so closing doesn't try
        // to pop a second time.
        pushedHistory = false;
        setOpen(false);
      });

      function toggle(startNew) {
        setOpen(!open, startNew);
      }

      function setOpen(next, startNew) {
        if (next === open) return;
        open = next;
        postToWidget({ type: 'elpino:panel', open: open });
        button.innerHTML = open ? closeIcon(22) : launcherIcon();
        if (open) {
          dismissGreeting();
          clearUnread();
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
          rememberOpen(true);
          if (!pushedHistory) {
            try {
              history.pushState({ elpinoWidget: true }, '');
              pushedHistory = true;
            } catch (error) {
              // Some embedded/sandboxed contexts refuse pushState. Back
              // then behaves normally; everything else still works.
            }
          }
        } else {
          if (iframe) iframe.style.display = 'none';
          rememberOpen(false);
          if (pushedHistory) {
            // Closed by the button rather than by back — pop our own entry
            // so we don't leave junk in the visitor's history.
            pushedHistory = false;
            ignoreNextPop = true;
            try { history.back(); } catch (error) { ignoreNextPop = false; }
          }
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
