// Run with node scripts/check-widget-security.mjs from web/.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Check production sources without requiring the unrelated test runner.
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, '.');
const files = parsed.fileNames.filter(file => !/\.(test|spec)\.[cm]?[jt]sx?$/.test(file));
const program = ts.createProgram(files, { ...parsed.options, incremental: false });
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: file => file, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n',
  }));
  process.exitCode = 1;
} else {
  console.log('Production TypeScript check passed.');
}

// Compile the actual generated loader, including template-string escaping.
const source = readFileSync('app/tag.js/route.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const context = { exports: {}, URL, Response, process: { env: { NODE_ENV: 'development' } } };
vm.runInNewContext(compiled, context);
const response = context.exports.GET(new Request('http://localhost:3000/tag.js'));
const script = await response.text();
new vm.Script(script);

// Exercise the real identity bridge without controlling a browser. A pending
// refresh must never sign a user back in after the host has logged them out.
const begin = script.indexOf('    var settings =');
const end = script.indexOf("    fetch(TAG_ORIGIN + '/api/widget/config");
assert(begin >= 0 && end > begin);
let resolveToken;
const messages = [];
const bridge = { window: { ElpinoSettings: { getIdentityToken: () => new Promise(resolve => { resolveToken = resolve; }) } } };
vm.createContext(bridge);
vm.runInContext(script.slice(begin, end), bridge);
bridge.widgetReady = true;
bridge.postToWidget = message => messages.push(message);
bridge.refreshIdentity();
await Promise.resolve();
bridge.logout();
resolveToken('old-account-assertion');
await new Promise(resolve => setImmediate(resolve));
assert.deepEqual(messages.map(message => message.type), ['elpino:logout']);
assert.equal(bridge.identityToken, null);
bridge.identify({ token: 'new-account-assertion' });
assert.equal(bridge.identityToken, 'new-account-assertion');
console.log('Generated loader syntax and refresh/logout race checks passed.');

const warnings = [];
const requests = [];
const queued = [['configure', { identityEndpoint: '/api/chat-identity' }], ['logout']];
const sdkBridge = {
  window: { $elpino: queued }, URL,
  location: { href: 'https://shop.example/account', origin: 'https://shop.example' },
  console: { warn: (...args) => warnings.push(args) },
  fetch: async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ token: 'fresh-token' }) };
  },
};
vm.createContext(sdkBridge);
vm.runInContext(script.slice(begin, end), sdkBridge);
sdkBridge.widgetReady = true;
await new Promise(resolve => setImmediate(resolve));
assert.equal(sdkBridge.identityToken, null, 'queued logout wins over pending configure');
assert.equal(sdkBridge.window.$elpino, queued, 'saved queue references remain usable');
queued.push(['identify']);
await new Promise(resolve => setImmediate(resolve));
assert.equal(sdkBridge.identityToken, 'fresh-token');
assert.equal(requests.at(-1).url, 'https://shop.example/api/chat-identity');
assert.equal(requests.at(-1).options.method, 'POST');
assert.equal(requests.at(-1).options.redirect, 'error');
const previousProvider = sdkBridge.settings.getIdentityToken;
queued.push(['configure', { identityEndpoint: 'https://attacker.example/identity' }]);
assert.equal(sdkBridge.settings.getIdentityToken, previousProvider);
assert.equal(warnings.length, 1);
sdkBridge.fetch = async () => ({ status: 401 });
queued.push(['identify']);
await new Promise(resolve => setImmediate(resolve));
assert.equal(sdkBridge.identityToken, null);
console.log('$elpino queue, endpoint, guest and logout checks passed.');

// Use the shipped server helper against the actual backend verifier.
const { createIdentityToken } = await import('../public/sdk/elpino-server.mjs');
const verifierSource = readFileSync('../apps/workspace-service/src/widget/identity-token.ts', 'utf8');
const verifierJs = ts.transpileModule(verifierSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const { createRequire } = await import('node:module');
const verifierContext = { exports: {}, require: createRequire(import.meta.url), Buffer };
vm.runInNewContext(verifierJs, verifierContext);
const { generateIdentitySecret, verifyIdentityToken } = verifierContext.exports;
const secret = generateIdentitySecret();
const token = createIdentityToken(secret, { id: 'account-42', email: 'sam@example.com', emailVerified: true });
assert.equal(verifyIdentityToken(token, secret).identity.email, 'sam@example.com');
assert.equal(verifyIdentityToken(token, generateIdentitySecret()).reason, 'bad_signature');
assert.equal(verifyIdentityToken(token, secret, Date.now() + 301000).reason, 'expired');
assert.equal(verifyIdentityToken(createIdentityToken(secret, { id: '42', email: 'sam@example.com' }), secret).identity.email, null);
assert.notEqual(createIdentityToken(secret, { id: '42' }), createIdentityToken(secret, { id: '42' }));
assert.throws(() => createIdentityToken(secret, { id: '' }));
console.log('Shipped server helper/backend verification contract passed.');

// Exercise the complete generated tag: a queued token starts a hidden iframe
// without any customer endpoint, then reaches the verifier through the bridge.
const elements = [];
const listeners = {};
const sent = [];
const events = [];
const sdkWarnings = [];
const directQueue = [['identify', { token }]];
const host = {
  URL, console: { warn: (...args) => sdkWarnings.push(args) },
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
  location: { href: 'https://shop.example/account', origin: 'https://shop.example', hostname: 'shop.example' },
  setTimeout: () => 0,
  sessionStorage: { getItem: () => null },
  document: {
    currentScript: { dataset: { siteKey: 'pk' } },
    body: { appendChild: element => elements.push(element) },
    addEventListener: () => {},
    createElement: tag => ({ tag, style: {}, setAttribute: () => {}, contentWindow: { postMessage: (message, origin) => sent.push({ message, origin }) } }),
  },
  window: {
    $elpino: directQueue,
    dispatchEvent: event => events.push(event.type),
    addEventListener: (type, callback) => { listeners[type] = callback; },
  },
  fetch: async url => {
    assert.match(url, /\/api\/widget\/config\?/);
    return { ok: true, json: async () => ({ config: {} }) };
  },
};
vm.runInNewContext(script, host);
await new Promise(resolve => setImmediate(resolve));
assert.equal(sdkWarnings.length, 0);
const frame = elements.find(element => element.tag === 'iframe');
assert.ok(frame, 'identity exchange must not wait for the launcher click');
assert.equal(frame.style.display, 'none');
assert.ok(!frame.src.includes(token));
listeners.message({ source: frame.contentWindow, origin: 'http://localhost:3000', data: { type: 'elpino:widget-ready' } });
const delivered = sent.find(entry => entry.message.type === 'elpino:identity');
assert.equal(delivered.origin, 'http://localhost:3000');
assert.equal(verifyIdentityToken(delivered.message.token, secret).identity.userId, 'account-42');
const beforeRenewal = sent.length;
listeners.message({ source: frame.contentWindow, origin: 'http://localhost:3000', data: { type: 'elpino:identity-refresh' } });
assert.equal(sent.length, beforeRenewal, 'a single-use assertion is never replayed on renewal');
assert.ok(events.includes('elpino:identity-required'));
directQueue.push(['identify', { token }]);
assert.equal(sent.length, beforeRenewal, 'repeated identify with the same token is idempotent');
directQueue.push(['logout']);
assert.equal(sent.at(-1).message.type, 'elpino:logout');

// A late provider response cannot replace the explicitly supplied account.
let finishOldProvider;
sdkBridge.fetch = () => new Promise(resolve => { finishOldProvider = resolve; });
queued.push(['identify']);
await Promise.resolve();
queued.push(['identify', { token }]);
finishOldProvider({ ok: true, json: async () => ({ token: 'old-account' }) });
await new Promise(resolve => setImmediate(resolve));
assert.equal(sdkBridge.identityToken, token);
console.log('Direct-token SDK, hidden iframe, backend verification and account-switch checks passed.');
