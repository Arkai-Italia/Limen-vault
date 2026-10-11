// Real React components + Rust fixture filesystem; no OpenAI, real vault or native app.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../../..');
const esbuild = createRequire(require.resolve('vite/package.json'))('esbuild');
const { chromium } = require(process.env.LIMEN_PLAYWRIGHT_MODULE || 'playwright');
const binary = join(root, 'apps/desktop/src-tauri/target/debug/vault-check');
const temp = mkdtempSync(join(tmpdir(), 'limen-ui-fixture-'));
const vault = join(temp, 'vault');
const native = (...args) => ({ ok: true, value: JSON.parse(execFileSync(binary, args, { encoding: 'utf8' })) });
const unbox = result => { if (!result.ok) throw new Error(result.error); return result.value; };
let browser;
let server;
try {
  native('create', vault, join(root, 'vault-template'));
  unbox(native('set-mode', vault, 'hybrid'));
  mkdirSync(join(vault, 'CUSTOM/nested'), { recursive: true });
  writeFileSync(join(vault, 'CUSTOM/nested/nota.md'), '# Nota sintetica\nContenuto leggibile senza indicizzazione.');
  const built = await esbuild.build({ entryPoints: [join(root, 'apps/desktop/tests/ui/fixture.tsx')], bundle: true, write: false, format: 'iife', loader: { '.png': 'dataurl', '.svg': 'dataurl', '.css': 'empty' }, alias: { '@tauri-apps/api/webview': join(root, 'apps/desktop/tests/ui/tauri-fixture.ts'), '@tauri-apps/api/core': join(root, 'apps/desktop/tests/ui/tauri-fixture.ts'), '@tauri-apps/api/event': join(root, 'apps/desktop/tests/ui/tauri-fixture.ts') } });
  server = createServer(async (req, res) => {
    if (req.url === '/bundle.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(built.outputFiles[0].text); return; }
    if (req.url === '/native') {
      let body = ''; for await (const chunk of req) body += chunk;
      try {
        const { command, args } = JSON.parse(body);
        const commands = { vault_list_folders: ['folders', vault], vault_list_folder_files: ['folder-files', vault, args.folder || ''], vault_read_text: ['read-text', vault, args.relativePath || ''], ai_get_mode: ['mode', vault], ai_set_mode: ['set-mode', vault, args.mode || ''] };
        if (!commands[command]) throw new Error('Unsupported command');
        res.end(JSON.stringify(native(...commands[command])));
      } catch (e) { res.end(JSON.stringify({ ok: false, error: String(e) })); }
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>');
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, executablePath: process.env.LIMEN_BROWSER_EXECUTABLE });
  const page = await browser.newPage({ viewport: { width: 1200, height: 950 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route('**/*', route => route.request().url().startsWith(url) ? route.continue() : route.abort());
  await page.goto(`${url}/?panel=vault`);
  await page.getByRole('button', { name: /CUSTOM/ }).click();
  await page.getByRole('button', { name: 'Apri', exact: true }).click();
  await page.getByRole('button', { name: 'Anteprima', exact: true }).click();
  await page.getByRole('dialog', { name: 'Anteprima file' }).waitFor();
  assert.match(await page.getByRole('dialog').innerText(), /Contenuto leggibile/);
  await page.getByRole('button', { name: 'Chiudi anteprima' }).click();
  await page.getByTitle('Rivela nel Finder / File Explorer').click();
  assert.match(await page.getByLabel('Esito fixture').innerText(), /CUSTOM\/nested\/nota.md/);
  await page.screenshot({ path: join(temp, 'vault.png') });
  await page.goto(`${url}/?panel=chat`);
  await page.getByRole('button', { name: 'SOLO LOCALE', exact: true }).waitFor();
  await page.locator('textarea').fill('Bozza da conservare');
  await page.evaluate(() => { window.__failSave = true; });
  await page.getByRole('button', { name: 'SOLO LOCALE', exact: true }).click();
  await page.getByText(/Salvataggio modalità non riuscito/).waitFor();
  assert.equal(unbox(native('mode', vault)), 'hybrid');
  assert.equal(await page.locator('textarea').inputValue(), 'Bozza da conservare');
  await page.evaluate(() => { window.__failSave = false; });
  await page.getByRole('button', { name: 'SOLO LOCALE', exact: true }).click();
  await page.getByLabel('Esito fixture').filter({ hasText: 'llm' }).waitFor();
  assert.equal(unbox(native('mode', vault)), 'local_only');
  await page.getByText('Ministral', { exact: true }).waitFor();
  await page.getByText('Avviso memoria:', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Non mostrare più l’avviso memoria' }).click();
  await page.reload();
  await page.getByText('Ministral', { exact: true }).waitFor();
  assert.equal(await page.getByText('Avviso memoria:', { exact: true }).count(), 0);
  await page.locator('textarea').fill('Bozza da conservare');

  assert.equal(await page.getByRole('button', { name: /Consenti.*OpenAI/ }).count(), 0);
  await page.getByRole('button', { name: /Switch to Hybrid|Passa a Ibrido/ }).click();
  await page.getByRole('button', { name: 'SOLO LOCALE', exact: true }).waitFor();
  assert.equal(unbox(native('mode', vault)), 'hybrid');
  assert.equal(await page.locator('textarea').inputValue(), 'Bozza da conservare');
  await page.getByRole('button', { name: 'Strumenti Ricerca' }).click();
  await page.getByRole('button', { name: 'Nascondi Ricerca' }).waitFor();
  await page.screenshot({ path: join(temp, 'chat.png') });
  await page.goto(`${url}/?panel=import`);
  await page.getByRole('dialog').waitFor();
  assert.match(await page.getByRole('dialog').innerText(), /2 nuovi documenti/);
  await page.getByRole('button', { name: 'Rimanda a dopo' }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  assert.equal(await page.getByLabel('Esito fixture').innerText(), 'postponed');
  await page.goto(`${url}/?panel=import`);
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.goto(`${url}/?panel=documents`);
  await page.getByLabel('Documenti').filter({ hasText: 'uno.pdf,due.md' }).waitFor();
  await page.getByRole('button', { name: 'pdf', exact: true }).click();
  await page.waitForFunction(() => window.__calls.some(c => c.options?.format === 'pdf'));
  await page.getByRole('button', { name: 'md', exact: true }).click();
  await page.getByLabel('Documenti').filter({ hasText: /^due.md$/ }).waitFor();
  // Allow the deliberately slow obsolete PDF response to complete.
  await page.waitForTimeout(800);
  assert.equal(await page.getByLabel('Documenti').innerText(), 'due.md');
  await page.getByRole('button', { name: 'xlsx', exact: true }).click();
  await page.getByLabel('Documenti').filter({ hasText: 'Nessun documento' }).waitFor();
  await page.getByRole('button', { name: 'all', exact: true }).click();
  await page.getByLabel('Nome file').fill('uno');
  await page.getByLabel('Documenti').filter({ hasText: /^uno.pdf$/ }).waitFor();
  await page.goto(`${url}/?panel=drop`);
  await page.waitForFunction(() => !!window.__nativeDrop);
  await page.evaluate(() => window.__nativeDrop({ payload: { type: 'enter', paths: ['/tmp/cartella'] } }));
  assert.equal(await page.getByLabel('Trascinamento').innerText(), 'Rilascia');
  await page.evaluate(() => window.__nativeDrop({ payload: { type: 'drop', paths: ['/tmp/cartella', '/tmp/file.pdf'] } }));
  await page.getByLabel('Trascinamento').filter({ hasText: '/tmp/cartella,/tmp/file.pdf' }).waitFor();
  assert.deepEqual(errors, []);
  console.log(`PASS browser: filter changes/empty/search/stale response, memory warning dismissal across reload, Ministral label, native drop handler contract, native JSON explorer, nested folder, unindexed text preview, Finder target, failed mode save, missing-model routing, retained draft, advanced toggle, postpone. Screenshots: ${temp}`);
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(r => server.close(r));
}
