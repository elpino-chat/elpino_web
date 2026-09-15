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
