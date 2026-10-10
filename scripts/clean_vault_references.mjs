#!/usr/bin/env node
/**
 * LIMEN Vault — Script di Analisi e Sanitizzazione Referenze
 *
 * Utilizzo:
 *   node scripts/clean_vault_references.mjs "/percorso/del/tuo/vault" [opzioni]
 *
 * Opzioni:
 *   --dry-run        (Predefinito) Esegue una simulazione: mostra tutti i file e le righe trovate senza modificare nulla.
 *   --execute        Applica effettivamente le modifiche/eliminazioni.
 *   --delete-files   Elimina i file che contengono il testo target (invece di ripulirne solo il contenuto).
 *   --no-backup      Disabilita il backup automatico di sicurezza prima dell'esecuzione.
 *   --target "testo" Cambia la stringa da cercare (predefinito: "Michele Bondani").
 *
 * Esempi:
 *   # 1. Analisi preliminare di prova (nessuna modifica al vault):
 *   node scripts/clean_vault_references.mjs "/Users/cesare/Documents/MIO_VAULT"
 *
 *   # 2. Eliminazione sicura di tutti i file contenenti "Michele Bondani" (con backup automatico):
 *   node scripts/clean_vault_references.mjs "/Users/cesare/Documents/MIO_VAULT" --delete-files --execute
 *
 *   # 3. Rimozione del testo all'interno dei file preservando i file stessi:
 *   node scripts/clean_vault_references.mjs "/Users/cesare/Documents/MIO_VAULT" --execute
 */

import fs from 'node:fs';
import path from 'node:path';

// Argument parsing
const args = process.argv.slice(2);
const positionalArgs = args.filter((a) => !a.startsWith('--'));
const flags = new Set(args.filter((a) => a.startsWith('--')));

const vaultPath = positionalArgs[0];
const isExecute = flags.has('--execute');
const isDeleteFiles = flags.has('--delete-files');
const noBackup = flags.has('--no-backup');

// Parametro target personalizzabile
let targetPhrase = 'Michele Bondani';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) {
    targetPhrase = args[i + 1];
  }
}

if (!vaultPath) {
  console.log('\n\x1b[33m[AVVISO] Nessun percorso Vault specificato.\x1b[0m');
  console.log('Avvio automatico dello scanner per trovare tutti i Vault sul sistema...\n');
  await import('./find_and_verify_vaults.mjs');
  process.exit(0);
}

const resolvedVaultPath = path.resolve(vaultPath);

if (!fs.existsSync(resolvedVaultPath)) {
  console.error(`\n\x1b[31m[ERRORE] La cartella indicata non esiste: ${resolvedVaultPath}\x1b[0m\n`);
  process.exit(1);
}

console.log('\n================================================================');
console.log('       LIMEN VAULT — ANALIZZATORE E SANITIZZATORE REFERENZE');
console.log('================================================================');
console.log(`Cartella Vault : \x1b[36m${resolvedVaultPath}\x1b[0m`);
console.log(`Termine target : \x1b[33m"${targetPhrase}"\x1b[0m`);
console.log(`Modalità       : ${isExecute ? '\x1b[32mESECUZIONE EFFETTIVA (--execute)\x1b[0m' : '\x1b[33mSIMULAZIONE (--dry-run, sola lettura)\x1b[0m'}`);
console.log(`Azione file    : ${isDeleteFiles ? '\x1b[31mEliminazione completa dei file trovati\x1b[0m' : '\x1b[36mSanitizzazione del testo all\'interno dei file\x1b[0m'}`);
console.log('================================================================\n');

// Costruisci Regex case-insensitive e varianti comuni (es. underscore)
const escapedTarget = targetPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const targetRegex = new RegExp(escapedTarget, 'gi');
const targetUnderscore = targetPhrase.replace(/\s+/g, '_');
const targetUnderscoreRegex = new RegExp(targetUnderscore.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

// Directory o file da escludere dalla scansione
const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  '.DS_Store',
  'target',
]);

const matches = [];
let totalScanned = 0;

function scanDirectory(dir) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.warn(`\x1b[33m[AVVISO] Impossibile leggere cartella: ${dir} (${err.message})\x1b[0m`);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(resolvedVaultPath, fullPath);

    if (EXCLUDED_DIRS.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      // Controlla se il nome della cartella contiene il target
      if (targetRegex.test(entry.name) || targetUnderscoreRegex.test(entry.name)) {
        matches.push({
          type: 'directory_name',
          fullPath,
          relPath,
          name: entry.name,
        });
      }
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      totalScanned++;
      const ext = path.extname(entry.name).toLowerCase();
      const filenameMatch = targetRegex.test(entry.name) || targetUnderscoreRegex.test(entry.name);

      // Scansiona testo per estensioni note o file di testo
      const isTextFile = ['.md', '.txt', '.json', '.yaml', '.yml', '.csv', '.tsv', '.html', '.xml'].includes(ext) || !ext;

      let fileMatches = [];
      let originalContent = null;

      if (isTextFile) {
        try {
          originalContent = fs.readFileSync(fullPath, 'utf8');
          const lines = originalContent.split(/\r?\n/);
          for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            const line = lines[lineIdx];
            if (targetRegex.test(line) || targetUnderscoreRegex.test(line)) {
              fileMatches.push({
                lineNumber: lineIdx + 1,
                content: line.trim(),
              });
            }
          }
        } catch {
          // Ignora se binario o non codificabile UTF-8
        }
      }

      if (filenameMatch || fileMatches.length > 0) {
        matches.push({
          type: 'file',
          fullPath,
          relPath,
          filenameMatch,
          lineMatches: fileMatches,
          originalContent,
        });
      }
    }
  }
}

console.log('Avvio scansione del vault...');
scanDirectory(resolvedVaultPath);

console.log(`Scansione completata. File esaminati: ${totalScanned}`);
console.log(`Elementi con corrispondenze trovati: \x1b[33m${matches.length}\x1b[0m\n`);

if (matches.length === 0) {
  console.log('\x1b[32m[PERFETTO] Nessun file o riferimento contenente "' + targetPhrase + '" trovato nel Vault.\x1b[0m\n');
  process.exit(0);
}

// Stampa dettagli corrispondenze
console.log('----------------------------------------------------------------');
console.log('DETTAGLIO CORRISPONDENZE RISCONTRATE:');
console.log('----------------------------------------------------------------');

matches.forEach((m, idx) => {
  console.log(`\n\x1b[1m[${idx + 1}/${matches.length}] ${m.relPath}\x1b[0m`);
  if (m.type === 'directory_name') {
    console.log(`   \x1b[35m-> Cartella con nome corrispondente\x1b[0m`);
  } else {
    if (m.filenameMatch) {
      console.log(`   \x1b[35m-> Nome file contiene il termine\x1b[0m`);
    }
    if (m.lineMatches && m.lineMatches.length > 0) {
      console.log(`   \x1b[36m-> Trovate ${m.lineMatches.length} righe con riferimenti:\x1b[0m`);
      m.lineMatches.slice(0, 5).forEach((lm) => {
        const snippet = lm.content.length > 120 ? lm.content.substring(0, 117) + '...' : lm.content;
        console.log(`      \x1b[90mRiga ${lm.lineNumber}:\x1b[0m ${snippet}`);
      });
      if (m.lineMatches.length > 5) {
        console.log(`      \x1b[90m... ed altre ${m.lineMatches.length - 5} righe.\x1b[0m`);
      }
    }
  }
});

console.log('\n----------------------------------------------------------------');

// Se siamo in simulazione (Dry Run)
if (!isExecute) {
  console.log('\n\x1b[33m[SIMULAZIONE COMPLETATA — NESSUNA MODIFICA APPLICATA]\x1b[0m');
  console.log('Per applicare le modifiche reali:');
  if (isDeleteFiles) {
    console.log(`  \x1b[32mnode scripts/clean_vault_references.mjs "${resolvedVaultPath}" --delete-files --execute\x1b[0m`);
  } else {
    console.log(`  \x1b[32mnode scripts/clean_vault_references.mjs "${resolvedVaultPath}" --execute\x1b[0m  (ripulisce il testo)`);
    console.log(`  oppure:`);
    console.log(`  \x1b[32mnode scripts/clean_vault_references.mjs "${resolvedVaultPath}" --delete-files --execute\x1b[0m  (elimina i file)`);
  }
  console.log();
  process.exit(0);
}

// ESECUZIONE REALE
// 1. Backup di sicurezza preventivo
if (!noBackup) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(resolvedVaultPath, '..', `${path.basename(resolvedVaultPath)}_BACKUP_PRIMA_CLEAN_${timestamp}`);
  console.log(`\n\x1b[36m[SICUREZZA] Creazione backup preventivo in:\x1b[0m`);
  console.log(`  ${backupDir}`);
  try {
    fs.cpSync(resolvedVaultPath, backupDir, { recursive: true });
    console.log(`\x1b[32m[BACKUP COMPLETATO] Copia di sicurezza salvata con successo.\x1b[0m\n`);
  } catch (err) {
    console.error(`\x1b[31m[ERRORE CRITICO] Impossibile creare il backup: ${err.message}. Operazione interrotta per sicurezza.\x1b[0m`);
    process.exit(1);
  }
}

// 2. Applicazione modifiche
let filesDeletedCount = 0;
let filesSanitizedCount = 0;
let dirsDeletedCount = 0;

for (const m of matches) {
  try {
    if (m.type === 'directory_name') {
      if (isDeleteFiles) {
        fs.rmSync(m.fullPath, { recursive: true, force: true });
        console.log(`\x1b[31m[ELIMINATA CARTELLA]\x1b[0m ${m.relPath}`);
        dirsDeletedCount++;
      }
    } else if (m.type === 'file') {
      if (isDeleteFiles) {
        // Se flag --delete-files attivo, elimina direttamente il file
        fs.unlinkSync(m.fullPath);
        console.log(`\x1b[31m[ELIMINATO FILE]\x1b[0m ${m.relPath}`);
        filesDeletedCount++;
      } else {
        // Altrimenti sanitizza il contenuto testuale
        if (m.originalContent !== null) {
          // Sostituisci tutte le occorrenze con testo generico / rimosso
          let updatedContent = m.originalContent
            .replace(targetRegex, '[RIFERIMENTO_RISERVATO]')
            .replace(targetUnderscoreRegex, 'RIFERIMENTO_RISERVATO');

          fs.writeFileSync(m.fullPath, updatedContent, 'utf8');
          console.log(`\x1b[32m[SANITIZZATO TESTO]\x1b[0m ${m.relPath}`);
          filesSanitizedCount++;
        }
      }
    }
  } catch (err) {
    console.error(`\x1b[31m[ERRORE su ${m.relPath}]: ${err.message}\x1b[0m`);
  }
}

console.log('\n================================================================');
console.log('                  RIEPILOGO OPERAZIONE ESEGUITA');
console.log('================================================================');
if (isDeleteFiles) {
  console.log(`File eliminati       : \x1b[31m${filesDeletedCount}\x1b[0m`);
  console.log(`Cartelle eliminate   : \x1b[31m${dirsDeletedCount}\x1b[0m`);
} else {
  console.log(`File sanitizzati     : \x1b[32m${filesSanitizedCount}\x1b[0m`);
}
console.log('================================================================\n');
console.log('\x1b[32mOperazione completata con successo!\x1b[0m');
console.log('Nota: se hai eliminato o modificato file nel Vault operativo, puoi avviare LIMEN Vault');
console.log('e cliccare su "RICALCOLA CACHE" in Avanzate → Collegamenti AI & MCP per riallineare l\'indice semantico.\n');
