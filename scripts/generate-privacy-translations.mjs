import fs from "node:fs/promises";
import ts from "typescript";

const sourcePath = new URL("../app/privacy/PrivacyView.tsx", import.meta.url);
const outputPath = new URL("../app/privacy/privacy-translations.generated.json", import.meta.url);
const source = await fs.readFile(sourcePath, "utf8");
const file = ts.createSourceFile("PrivacyView.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const strings = new Set();

function add(value) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length < 2 || !/[A-Za-z]/.test(text)) return;
  if (/^(use client|https?:|mailto:|[\w.-]+@[\w.-]+|[a-z-]+\/[a-z-]+)$/i.test(text)) return;
  if (/^[#./\[\]():_a-z0-9% -]+$/i.test(text) && /(?:bg-|text-|px-|py-|mt-|rounded|border|flex|grid|hover|sm:|lg:)/.test(text)) return;
  strings.add(text);
}

function visit(node) {
  if (ts.isJsxText(node)) add(node.text);
  if (ts.isStringLiteral(node)) {
    const parent = node.parent;
    const property = ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name) ? parent.name.text : "";
    const attribute = ts.isJsxAttribute(parent) && ts.isIdentifier(parent.name) ? parent.name.text : "";
    if (!["id", "color", "section", "className", "href", "src"].includes(property) &&
        !["className", "href", "src", "id"].includes(attribute)) add(node.text);
  }
  ts.forEachChild(node, visit);
}
visit(file);

let english = [...strings];
const targets = ["cs", "da", "de", "es", "fi", "fr", "hu", "id", "it", "ja", "ko", "nl", "pl", "pt", "pt-br", "ro", "ru", "sv", "th", "tr", "uk", "vi", "zh-tw"];
const googleCodes = { "pt-br": "pt", "zh-tw": "zh-TW" };
let result = { en: Object.fromEntries(english.map((text) => [text, text])) };
try {
  const existing = JSON.parse(await fs.readFile(outputPath, "utf8"));
  if (existing.en) {
    result = existing;
    english = Object.keys(existing.en);
  }
} catch {}

function chunks(items, maxChars = 2800) {
  const groups = [];
  let group = [];
  let size = 0;
  for (const item of items) {
    if (group.length && size + item.length > maxChars) { groups.push(group); group = []; size = 0; }
    group.push(item); size += item.length + 20;
  }
  if (group.length) groups.push(group);
  return groups;
}

async function translateBatch(items, target) {
  const marked = items.map((text, index) => `[[${index}]] ${text}`).join("\n");
  const params = new URLSearchParams({ client: "gtx", sl: "en", tl: googleCodes[target] ?? target, dt: "t", q: marked });
  let response;
  for (let attempt = 0; attempt < 7; attempt++) {
    try {
      response = await fetch("https://translate.googleapis.com/translate_a/single", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: params,
      });
    } catch (error) {
      if (attempt === 6) throw error;
      await new Promise((resolve) => setTimeout(resolve, 5000 * (attempt + 1)));
      continue;
    }
    if (response.ok) break;
    if (response.status !== 429 || attempt === 6) throw new Error(`${target}: translation request failed (${response.status})`);
    await new Promise((resolve) => setTimeout(resolve, 5000 * (attempt + 1)));
  }
  const payload = await response.json();
  const translated = payload[0].map((part) => part[0]).join("");
  const found = new Map();
  const pattern = /\[\[(\d+)\]\]\s*([\s\S]*?)(?=\n?\[\[\d+\]\]|$)/g;
  for (const match of translated.matchAll(pattern)) found.set(Number(match[1]), match[2].trim());
  return items.map((original, index) => found.get(index) || original);
}

await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
for (const target of targets) {
  if (result[target] && Object.keys(result[target]).length === english.length) { process.stdout.write(`${target}(cached) `); continue; }
  const translated = [];
  for (const group of chunks(english)) {
    translated.push(...await translateBatch(group, target));
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  result[target] = Object.fromEntries(english.map((text, index) => [text, translated[index]]));
  await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  process.stdout.write(`${target} `);
}

await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(`\nWrote ${english.length} strings in ${targets.length + 1} languages.`);
