import fs from 'node:fs/promises';

const directory = new URL('../locales/', import.meta.url);
const english = JSON.parse(await fs.readFile(new URL('en.json', directory), 'utf8'));
english.busyOperators.rush.online = 'online';
english.busyOperators.rush.offline = 'offline';
const leaves = [];
function walk(value, path = []) {
  if (typeof value === 'string') leaves.push({ path, value });
  else for (const [key, child] of Object.entries(value)) walk(child, [...path, key]);
}
walk(english.busyOperators);
const groups = [];
for (const leaf of leaves) {
  let group = groups.at(-1);
  if (!group || group.reduce((n, item) => n + item.value.length + 20, 0) + leaf.value.length > 2200) groups.push(group = []);
  group.push(leaf);
}
async function translate(group, language) {
  // Google's MT sometimes drops a "[[N]]"-style marker on short declarative
  // sentences (it reads as a footnote reference and gets stripped), silently
  // misaligning the batch. "@@N@@" survives across every language tested.
  const body = new URLSearchParams({ client: 'gtx', sl: 'en', tl: language, dt: 't', q: group.map(({ value }, i) => `@@${i}@@ ${value.trim()}`).join('\n') });
  const response = await fetch('https://translate.googleapis.com/translate_a/single', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body });
  if (!response.ok) throw new Error(`${language}: HTTP ${response.status}`);
  const payload = await response.json();
  const text = payload[0].map(part => part[0]).join('');
  const matches = [...text.matchAll(/@@(\d+)@@\s*([\s\S]*?)(?=@@\d+@@|$)/g)];
  const values = new Map(matches.map(match => [Number(match[1]), match[2].trim()]));
  if (values.size !== group.length) throw new Error(`${language}: incomplete translation batch`);
  return group.map(({ value }, i) => {
    const translated = values.get(i);
    if (!translated) throw new Error(`${language}: empty translation ${i}`);
    return (value.match(/^\s*/)[0]) + translated + (value.match(/\s*$/)[0]);
  });
}
for (const filename of await fs.readdir(directory)) {
  if (!filename.endsWith('.json')) continue;
  const url = new URL(filename, directory);
  const locale = JSON.parse(await fs.readFile(url, 'utf8'));
  const language = filename.slice(0, -5);
  if (language !== 'en' && locale.busyOperators?.rush?.offline) { console.log(`${language}: already complete`); continue; }
  const result = structuredClone(english.busyOperators);
  if (language !== 'en') {
    for (const group of groups) {
      const values = await translate(group, language === 'zh-tw' ? 'zh-TW' : language === 'pt-br' ? 'pt' : language);
      group.forEach(({ path }, i) => {
        let target = result;
        for (const key of path.slice(0, -1)) target = target[key];
        target[path.at(-1)] = values[i];
      });
    }
  }
  locale.busyOperators = result;
  await fs.writeFile(url, JSON.stringify(locale, null, 2) + '\n');
  console.log(`${language}: ${leaves.length} strings translated`);
}
