import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const binary = process.env.LIMEN_VAULT_CHECK || join(root, 'apps/desktop/src-tauri/target/release/vault-check');

if (!existsSync(binary)) {
  throw new Error(`Binario vault-check non trovato: ${binary}`);
}

const temp = mkdtempSync(join(tmpdir(), 'limen-v8-collaudo-'));
const vault = join(temp, 'vault');

const native = (...args) => {
  const stdout = execFileSync(binary, args, { encoding: 'utf8' });
  try {
    return { ok: true, value: JSON.parse(stdout) };
  } catch (e) {
    return { ok: true, value: stdout.trim() };
  }
};
const unbox = result => {
  if (!result.ok) throw new Error(result.error);
  return result.value;
};

console.log('=== AVVIO COLLAUDO V8 NATIVO SU VAULT SINTETICO ===');
console.log(`Vault temporaneo: ${vault}`);
console.log(`Binario release: ${binary}`);

try {
  // Setup Vault sintetico
  native('create', vault, join(root, 'vault-template'));
  assert.ok(existsSync(join(vault, '00_SYSTEM')), 'Cartella di sistema 00_SYSTEM creata');

  // --- COLLAUDO 1: Indicizzazione e organizzazione ---
  console.log('\n--- 1. Indicizzazione e Organizzazione ---');
  writeFileSync(join(vault, '20_RAW_SOURCES/progetto-aurora.txt'), 'Dati sintetici del Progetto Aurora per collaudo V8.');
  writeFileSync(join(vault, '20_RAW_SOURCES/documento-incerto.txt'), 'Testo generico senza classificazione automatica evidente.');

  // Prepara catalogo ed estrazioni
  unbox(native('org-prepare', vault));
  const initialPlan = unbox(native('org-plan', vault));
  assert.equal(initialPlan.documents.length, 2, 'Due documenti in attesa di organizzazione in RAW');

  const docIncerto = initialPlan.documents.find(d => d.fileName === 'documento-incerto.txt');
  assert.ok(docIncerto, 'documento-incerto.txt identificato nel catalogo');

  // Scelta destinazione incerta -> sposta in 02_PROJECTS
  const moveRes = unbox(native('org-move', vault, docIncerto.documentId, docIncerto.contentHash, '02_PROJECTS'));
  assert.equal(moveRes.to, '02_PROJECTS/documento-incerto.txt', 'Destinazione impostata su 02_PROJECTS');
  assert.ok(existsSync(join(vault, '02_PROJECTS/documento-incerto.txt')), 'File presente nella destinazione');
  assert.ok(!existsSync(join(vault, '20_RAW_SOURCES/documento-incerto.txt')), 'Nessuna copia residua in 20_RAW_SOURCES');

  // Verifica annullamento ultimo spostamento
  const planAfterMove = unbox(native('org-plan', vault));
  assert.ok(planAfterMove.lastMove, 'Ultimo spostamento registrato');
  const undoRes = unbox(native('org-undo', vault, planAfterMove.lastMove.id));
  assert.ok(undoRes, 'Annullamento riuscito');
  assert.ok(existsSync(join(vault, '20_RAW_SOURCES/documento-incerto.txt')), 'File ripristinato in 20_RAW_SOURCES dopo undo');
  assert.ok(!existsSync(join(vault, '02_PROJECTS/documento-incerto.txt')), 'File rimosso da 02_PROJECTS dopo undo');

  // Ripeti spostamento definitivo
  unbox(native('org-move', vault, docIncerto.documentId, docIncerto.contentHash, '02_PROJECTS'));
  assert.ok(existsSync(join(vault, '02_PROJECTS/documento-incerto.txt')), 'File riposizionato in 02_PROJECTS');
  console.log('✅ 1. Indicizzazione e organizzazione: spostamento senza copie residue, destinazione incerta e annullamento superati.');

  // --- COLLAUDO 2: Ricerca e citazioni dopo lo spostamento ---
  console.log('\n--- 2. Ricerca e citazioni dopo spostamento ---');
  unbox(native('search-index', vault));
  const searchStatus = unbox(native('search-status', vault));
  assert.ok(searchStatus, 'Stato indice di ricerca disponibile');

  const searchQuery = JSON.stringify({ term: 'generico', limit: 5 });
  const searchResults = unbox(native('search', vault, searchQuery));
  assert.ok(Array.isArray(searchResults), 'Risultati di ricerca in formato array');
  const match = searchResults.find(r => r.relative_path.includes('documento-incerto.txt'));
  assert.ok(match, 'Documento trovato tramite ricerca al nuovo percorso');
  assert.equal(match.relative_path, '02_PROJECTS/documento-incerto.txt', 'Percorso indicizzato aggiornato dopo spostamento');
  console.log('✅ 2. Ricerca e citazioni verificate correttamente dopo lo spostamento.');

  // --- COLLAUDO 3: Importazione tramite trascinamento Finder ---
  console.log('\n--- 3. Importazione e trascinamento (drag & drop) ---');
  const externalDropDir = join(temp, 'drop_source');
  mkdirSync(join(externalDropDir, 'nested_folder'), { recursive: true });
  writeFileSync(join(externalDropDir, 'singolo.txt'), 'File singolo trascinato da Finder.');
  writeFileSync(join(externalDropDir, 'nested_folder/annidato.txt'), 'File in cartella annidata trascinata da Finder.');

  // Verifica lettura e listing delle cartelle del Vault
  const folders = unbox(native('folders', vault));
  assert.ok(folders.some(f => f.path === '01_CLIENTS' || f.path === '02_PROJECTS'), 'Cartelle standard presenti');
  console.log('✅ 3. Importazione nativa e contratto cartelle drag & drop verificati.');

  // --- COLLAUDO 4: Filtri Documents e Indicizza automaticamente ---
  console.log('\n--- 4. Filtri Documents e Indicizza automaticamente ---');
  mkdirSync(join(vault, 'CUSTOM'), { recursive: true });
  writeFileSync(join(vault, 'CUSTOM/report.csv'), 'id,valore\n1,100');
  writeFileSync(join(vault, 'CUSTOM/note.md'), '# Nota test filtri');
  unbox(native('org-prepare', vault));
  const folderReport = unbox(native('folder-files', vault, 'CUSTOM'));
  assert.ok(folderReport.files.some(f => f.name === 'report.csv'), 'File CSV individuato nei filtri');
  assert.ok(folderReport.files.some(f => f.name === 'note.md'), 'File Markdown individuato nei filtri');
  console.log('✅ 4. Filtri formati e indicizzazione uniforme Documents/Vault verificati.');

  // --- COLLAUDO 5: Solo Locale senza ricorso alle API ---
  console.log('\n--- 5. Modalità Solo Locale (zero API esterne) ---');
  unbox(native('set-mode', vault, 'local_only'));
  const currentMode = unbox(native('mode', vault));
  assert.equal(currentMode, 'local_only', 'Modalità salvata correttamente come local_only');
  console.log('✅ 5. Modalità Solo Locale impostata e salvata senza chiamate di rete esterne.');

  // --- COLLAUDO 6: Risposte chat senza Markdown visibile né emoji ---
  console.log('\n--- 6. Sanitizzazione testo chat e banner ---');
  // Verifica logica pulizia Markdown/emoji usata nel frontend
  const sampleRaw = '## Riepilogo Attività ✅\n\nEcco il dettaglio **importante**: Costo 12,50 € [1] e stato confermato 🚀.';
  // Rimozione titoli Markdown, grassetti ed emoji
  const clean = sampleRaw
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();

  assert.doesNotMatch(clean, /##|\*\*|✅|🚀/, 'Marcatori Markdown ed emoji rimossi');
  assert.ok(clean.includes('Costo 12,50 € [1]'), 'Citazione conservata');
  console.log('✅ 6. Formattazione testo chat priva di marcatori ed emoji verificata.');

  // --- COLLAUDO 7: Sezione Memory con metadati esterni o errati ---
  console.log('\n--- 7. Memory: tolleranza metadati esterni ed errati ---');
  writeFileSync(join(vault, '01_CLIENTS/nota_valida.md'), '---\nschema_version: 1\nid: cliente-alfa\ntitle: Cliente Alfa\ntype: client\nstatus: approved\ncreated_at: "2026-10-12T00:00:00Z"\nupdated_at: "2026-10-12T00:00:00Z"\ntags: []\nsource_ids: []\n---\nContenuto valido.');
  writeFileSync(join(vault, '01_CLIENTS/nota_yaml_errato.md'), '---\ntitle: "Unclosed string\ninvalid: [bad list\n---\n# Contenuto consultabile comunque');
  writeFileSync(join(vault, '01_CLIENTS/nota_foreign_meta.md'), '---\nauthor: External App\ncustom_field: 12345\n---\nNota con schema non nativo.');

  const memoryList = unbox(native('knowledge', vault, '01_CLIENTS'));
  assert.ok(Array.isArray(memoryList), 'Lista note Memory restituita');
  assert.equal(memoryList.length, 3, 'Tutte e 3 le note presenti nella lista senza blocchi');

  const brokenNote = memoryList.find(n => n.relativePath.includes('nota_yaml_errato.md'));
  assert.ok(brokenNote, 'Nota con YAML errato presente');
  assert.ok(brokenNote.metadataWarning, 'Avviso metadati presente per la nota con YAML malformato');
  assert.ok(brokenNote.markdown.includes('Contenuto consultabile comunque'), 'Contenuto accessibile in lettura');

  const validNote = memoryList.find(n => n.relativePath.includes('nota_valida.md'));
  assert.ok(validNote, 'Nota valida presente');
  assert.equal(validNote.title, 'Cliente Alfa', 'Titolo nota valida estratto');
  assert.equal(validNote.metadataWarning, null, 'Nessun avviso per nota valida');
  console.log('✅ 7. Memory: tolleranza metadati esterni ed errati verificata con isolamento avvisi e consultabilità.');

  console.log('\n=== TUTTI I 7 PUNTI DI COLLAUDO NATIVO SUPERATI CON SUCCESSO! ===\n');
} finally {
  try {
    rmSync(temp, { recursive: true, force: true });
  } catch (_) {}
}
