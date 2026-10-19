import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, rmSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '..');
const binary = join(root, 'apps/desktop/src-tauri/target/debug/vault-check');

console.log('========================================================================');
console.log('   COLLAUDO INTEGRATO macOS — IMPORTAZIONE 2 GB E DIRETTA ZIP V8   ');
console.log('========================================================================\n');

console.log(`Binary diagnostico: ${binary}`);
assert(existsSync(binary), `Il binario ${binary} deve esistere`);

const temp = mkdtempSync(join(tmpdir(), 'limen-v8-collaudo-'));
const vault = join(temp, 'vault');

const runCmd = (...args) => {
  const stdout = execFileSync(binary, args, { encoding: 'utf8' });
  try {
    return JSON.parse(stdout);
  } catch {
    return stdout.trim();
  }
};

// 1. Inizializzazione Vault isolato da template
console.log('\n[1/6] Inizializzazione Vault sintetico isolato...');
runCmd('create', vault, join(root, 'vault-template'));
assert(existsSync(join(vault, '00_SYSTEM')), '00_SYSTEM deve esistere nel vault');
assert(existsSync(join(vault, '20_RAW_SOURCES')), '20_RAW_SOURCES deve esistere nel vault');
console.log('  -> Vault creato con successo in:', vault);

// Helper per creare archivi ZIP
const makeZip = (destPath, entries) => {
  const script = `
import zipfile, sys, json
dest = sys.argv[1]
entries = json.loads(sys.argv[2])
with zipfile.ZipFile(dest, 'w', compression=zipfile.ZIP_DEFLATED) as z:
    for e in entries:
        z.writestr(e['name'], e['content'])
`;
  execFileSync('python3', ['-c', script, destPath, JSON.stringify(entries)]);
};

// 2. Collaudo Importazione Diretta ZIP con sottocartelle e Unicode
console.log('\n[2/6] Collaudo importazione diretta ZIP con alberi di sottocartelle e caratteri Unicode...');
const zip1Path = join(temp, 'archivio_generico.zip');
makeZip(zip1Path, [
  { name: 'progetti/2026/alpha/specifica.md', content: '# Specifica di Progetto Alpha\n\nRequisiti e linee guida.' },
  { name: 'documenti/relazione_attività_caffè.txt', content: 'Relazione di prova con accenti: caffè, percorsi e subfolders.' },
  { name: 'supporto/hash_manifest.sha256', content: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }
]);

const receipts1 = runCmd('import-zip', vault, zip1Path);
console.log('  -> Ricevute di importazione ZIP:', receipts1.length, 'file');
assert.strictEqual(receipts1.length, 3, 'Tutti i 3 file devono essere stati acquisiti');
assert(receipts1.every(r => r.status === 'imported'), 'Tutti i file devono avere status imported');

const file1 = join(vault, '20_RAW_SOURCES/archivio_generico/progetti/2026/alpha/specifica.md');
const file2 = join(vault, '20_RAW_SOURCES/archivio_generico/documenti/relazione_attività_caffè.txt');
const file3 = join(vault, '20_RAW_SOURCES/archivio_generico/supporto/hash_manifest.sha256');

assert(existsSync(file1), `file1 deve esistere: ${file1}`);
assert(existsSync(file2), `file2 deve esistere: ${file2}`);
assert(existsSync(file3), `file3 deve esistere: ${file3}`);
assert.strictEqual(readFileSync(file1, 'utf8'), '# Specifica di Progetto Alpha\n\nRequisiti e linee guida.');
console.log('  -> Gerarchia cartelle e nomi Unicode verificati con successo su disco');

// 3. Sincronizzazione Catalogo e Distinzione Documenti vs Supporto
console.log('\n[3/6] Verifica catalogo e distinzione automatica documenti vs materiali di supporto...');
const catalogSync = runCmd('catalog-sync', vault);
const docSha = Object.values(catalogSync.documents).find(d => d.fileName === 'hash_manifest.sha256');
const docMd = Object.values(catalogSync.documents).find(d => d.fileName === 'specifica.md');
const docTxt = Object.values(catalogSync.documents).find(d => d.fileName === 'relazione_attività_caffè.txt');

assert(docSha, 'hash_manifest.sha256 deve essere presente nel catalogo');
assert(docMd, 'specifica.md deve essere presente nel catalogo');
assert(docTxt, 'relazione_attività_caffè.txt deve essere presente nel catalogo');

assert.strictEqual(docSha.extractionStatus, 'unsupported', 'File .sha256 deve essere classificato Unsupported (materiale di supporto non estraibile)');
assert.strictEqual(docMd.extractionStatus, 'pending', 'File .md deve essere Pending (documento estraibile)');
assert.strictEqual(docTxt.extractionStatus, 'pending', 'File .txt deve essere Pending (documento estraibile)');
console.log('  -> Stato documenti catalogo verificato: formati documentali estraibili, materiali tecnici esclusi da RAG');

// 4. Ripetizione importazione ZIP (Idempotenza e deduplicazione)
console.log('\n[4/6] Verifica ripetizione importazione ZIP (nessuna duplicazione di byte né sovrascrittura)...');
const receiptsReimport = runCmd('import-zip', vault, zip1Path);
assert.strictEqual(receiptsReimport.length, 3);
assert(receiptsReimport.every(r => r.status === 'duplicate'), 'La re-importazione dello stesso zip deve rilevare duplicate per tutti gli elementi');
console.log('  -> Deduplicazione confermata al 100%');

// 5. ZIP con prefisso Vault 20_RAW_SOURCES/... (come pacchetto BNXT)
console.log('\n[5/6] Collaudo ZIP con prefisso strutturale 20_RAW_SOURCES/...');
const zipBnxtPath = join(temp, 'bnxt_sample.zip');
makeZip(zipBnxtPath, [
  { name: '20_RAW_SOURCES/BNXT/documento_base.md', content: '# Documento BNXT Base' }
]);
const receiptsBnxt = runCmd('import-zip', vault, zipBnxtPath);
assert.strictEqual(receiptsBnxt.length, 1);
assert.strictEqual(receiptsBnxt[0].status, 'imported');
assert.strictEqual(receiptsBnxt[0].path, '20_RAW_SOURCES/BNXT/documento_base.md');
const bnxtDirectFile = join(vault, '20_RAW_SOURCES/BNXT/documento_base.md');
assert(existsSync(bnxtDirectFile), 'Il file deve essere posizionato direttamente sotto 20_RAW_SOURCES/BNXT/');
console.log('  -> Mappatura diretta radice 20_RAW_SOURCES verificata con successo');

// 6. Collaudo Limiti 2 GB e Riapertura a Freddo del Vault
console.log('\n[6/6] Collaudo limite 2 GB (rifiuto oltre 2.000.000.000 byte) e riapertura a freddo...');
const hugeSparseFile = join(temp, 'file_oltre_limite.bin');
const fd = execFileSync('python3', ['-c', `
with open("${hugeSparseFile}", "wb") as f:
    f.truncate(2000000001)
`]);
assert(existsSync(hugeSparseFile));
assert.strictEqual(statSync(hugeSparseFile).size, 2000000001);

const oversizeReceipt = runCmd('import-receipt', vault, hugeSparseFile);
assert.strictEqual(oversizeReceipt.status, 'error', 'File di 2.000.000.001 byte deve essere rifiutato');
assert(oversizeReceipt.error.includes('oltre 2 GB'), `L'errore deve dichiarare il superamento dei 2 GB: ${oversizeReceipt.error}`);
console.log('  -> File oltre 2 GB rifiutato correttamente con messaggio esplicito');

// Riapertura a freddo del Vault da processo separato
const catalogLoaded = runCmd('catalog-load', vault);
assert(catalogLoaded.documents, 'Il catalogo deve ricaricarsi regolarmente');
console.log(`  -> Catalogo ricaricato a freddo con successo (${Object.keys(catalogLoaded.documents).length} documenti registrati)`);

// 7. Collaudo Sicurezza ZIP: Protezione Backslash Traversal e Symlink
console.log('\n[7/10] Collaudo sicurezza ZIP (rifiuto backslash traversal e blocco symlink)...');
const escapeZip = join(temp, 'escape.zip');
makeZip(escapeZip, [
  { name: '20_RAW_SOURCES\\..\\..\\outside_marker.txt', content: 'ESCAPED' }
]);
const escapeReceipt = runCmd('import-zip', vault, escapeZip);
assert.strictEqual(escapeReceipt[0].status, 'error');
assert(escapeReceipt[0].error.includes('path traversal') || escapeReceipt[0].error.includes('non sicuro'));
assert(!existsSync(join(temp, 'outside_marker.txt')), 'Il file non deve essere scritto fuori dal Vault!');
console.log('  -> Tentativo di backslash traversal bloccato e respinto con errore esplicito');

// Collaudo blocco symlink verso directory esterna
const externalDir = join(temp, 'external_target');
mkdirSync(externalDir, { recursive: true });
const symlinkPath = join(vault, '20_RAW_SOURCES/link_esterna');
execFileSync('ln', ['-s', externalDir, symlinkPath]);
const symlinkZip = join(temp, 'symlink.zip');
makeZip(symlinkZip, [
  { name: '20_RAW_SOURCES/link_esterna/marker.txt', content: 'DANGEROUS' }
]);
const symlinkReceipt = runCmd('import-zip', vault, symlinkZip);
assert.strictEqual(symlinkReceipt[0].status, 'error');
assert(symlinkReceipt[0].error.includes('link simbolico'));
assert(!existsSync(join(externalDir, 'marker.txt')), 'Nessun file deve essere scritto nella directory esterna target del symlink!');
console.log('  -> Scrittura attraverso symlink verso cartelle esterne bloccata con successo');

// 8. Collaudo Collisioni ZIP: Preservazione Byte-per-Byte dell'Originale
console.log('\n[8/10] Collaudo collisione ZIP (nessuna sovrascrittura di byte differenti)...');
const collisionTarget = join(vault, '20_RAW_SOURCES/progetto/nota_esistente.txt');
mkdirSync(join(vault, '20_RAW_SOURCES/progetto'), { recursive: true });
writeFileSync(collisionTarget, 'ORIGINALE_INTATTO', 'utf8');

const collisionZip = join(temp, 'collision.zip');
makeZip(collisionZip, [
  { name: '20_RAW_SOURCES/progetto/nota_esistente.txt', content: 'NUOVO_CONTENUTO' }
]);
const collisionReceipt = runCmd('import-zip', vault, collisionZip);
assert.strictEqual(collisionReceipt[0].status, 'error');
assert(collisionReceipt[0].error.includes('collisione'));
assert.strictEqual(readFileSync(collisionTarget, 'utf8'), 'ORIGINALE_INTATTO', 'Il file originale non deve mai essere sovrascritto!');
console.log('  -> File originale preservato byte-per-byte; collisione segnalata con ricevuta esplicita');

// 9. Collaudo Documenti Grandi (> 64 MB) nel Catalogo
console.log('\n[9/10] Collaudo documento di grandi dimensioni (67 MB) catalogato come Documento Pending...');
const largeDoc = join(vault, '20_RAW_SOURCES/progetto/grande_documento.txt');
execFileSync('python3', ['-c', `
with open("${largeDoc}", "wb") as f:
    f.truncate(67 * 1024 * 1024)
`]);
const syncAfterLarge = runCmd('catalog-sync', vault);
const docLarge = Object.values(syncAfterLarge.documents).find(d => d.fileName === 'grande_documento.txt');
assert(docLarge, 'Il documento grande deve essere registrato nel catalogo');
assert.strictEqual(docLarge.extractionStatus, 'pending', 'Documento di 67 MB deve essere Pending (non rifiutato con unsupported)');
console.log('  -> Documento grande riconosciuto regolarmente e accodato per estrazione documentale');

// 10. Collaudo Anteprima ZIP (inspect-zip)
console.log('\n[10/10] Collaudo comando anteprima ZIP (inspect-zip)...');
const preview = runCmd('inspect-zip', vault, zip1Path);
assert.strictEqual(preview.totalFiles, 3);
assert.strictEqual(preview.documentFilesCount, 2);
assert.strictEqual(preview.supportFilesCount, 1);
assert(preview.items.length === 3);
console.log(`  -> Anteprima ZIP verificata con successo (${preview.documentFilesCount} documenti, ${preview.supportFilesCount} materiali di supporto)`);

// Pulizia cartella temporanea di test
try { rmSync(temp, { recursive: true, force: true }); } catch {}

console.log('\n========================================================================');
console.log('   ESITO COLLAUDO: TUTTE LE 10 PROVE COMPLETATE CON SUCCESSO (0 ERRORI) ');
console.log('========================================================================\n');
