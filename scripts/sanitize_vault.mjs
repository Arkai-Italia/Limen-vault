#!/usr/bin/env node
/**
 * LIMEN Vault — Script Unico di Sanitizzazione Referenze (Zero Backup)
 *
 * Scansiona e sostituisce ogni occorrenza di "Michele Bondani" con "[RIFERIMENTO_RISERVATO]"
 * nei file del Vault, mantenendo intatti i file e SENZA creare alcun file di backup.
 *
 * Utilizzo:
 *   # 1. Sanitizzazione automatica di TUTTI i Vault trovati sul sistema:
 *   node scripts/sanitize_vault.mjs
 *
 *   # 2. Sanitizzazione di un singolo Vault specifico:
 *   node scripts/sanitize_vault.mjs "tests/scratch/vault_collaudo_local_rag_v2"
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const positionalArgs = args.filter((a) => !a.startsWith('--'));

const targetPhrase = 'Michele Bondani';
const replacementPhrase = '[RIFERIMENTO_RISERVATO]';

const escapedTarget = targetPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const targetRegex = new RegExp(escapedTarget, 'gi');
const targetUnderscore = targetPhrase.replace(/\s+/g, '_');
const targetUnderscoreRegex = new RegExp(targetUnderscore.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

console.log('\n================================================================');
console.log('    LIMEN VAULT — SANITIZZATORE UNICO DIRETTO (NO BACKUP)');
console.log('================================================================');
console.log(`Termine cercato   : \x1b[33m"${targetPhrase}"\x1b[0m`);
console.log(`Sostituzione con  : \x1b[32m"${replacementPhrase}"\x1b[0m`);
console.log(`File di backup    : \x1b[31mDISABILITATI (Nessun backup creato)\x1b[0m`);
console.log('================================================================\n');

// Funzione di validazione struttura Vault
function isLimenOrObsidianVault(dir) {
  if (!fs.existsSync(dir)) return false;
  try {
    const entries = fs.readdirSync(dir);
    const hasRaw = entries.includes('20_RAW_SOURCES');
    const hasClients = entries.includes('01_CLIENTS');
    const hasSystem = entries.includes('00_SYSTEM') || entries.includes('30_SYSTEM');
    const hasObsidian = entries.includes('.obsidian');
    const hasProposals = entries.includes('90_PROPOSALS');
    const hasLimen = entries.includes('.limen');

    if ((hasRaw && hasClients) || (hasSystem && hasClients) || (hasObsidian && (hasClients || hasRaw || hasProposals)) || hasLimen) {
      return true;
    }
  } catch {}
  return false;
}

// Determina i target da sanitizzare
let targets = [];

if (positionalArgs.length > 0) {
  const p = path.resolve(positionalArgs[0]);
  if (!fs.existsSync(p)) {
    console.error(`\x1b[31m[ERRORE] Il percorso specificato non esiste: ${p}\x1b[0m\n`);
    process.exit(1);
  }
  targets = [p];
} else {
  console.log('Nessun percorso specificato: ricerca automatica di tutti i Vault sul computer...\n');
  const candidatePaths = new Set();

  // 1. Configurazione Obsidian
  const obsidianConfig = path.join(os.homedir(), 'Library/Application Support/obsidian/obsidian.json');
  if (fs.existsSync(obsidianConfig)) {
    try {
      const raw = fs.readFileSync(obsidianConfig, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.vaults) {
        for (const v of Object.values(parsed.vaults)) {
          if (v && v.path) candidatePaths.add(path.resolve(v.path));
        }
      }
    } catch {}
  }

  // 2. tests/scratch
  const workspaceRoot = process.cwd();
  const scratchDir = path.join(workspaceRoot, 'tests/scratch');
  if (fs.existsSync(scratchDir)) {
    try {
      const entries = fs.readdirSync(scratchDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory() && !e.name.startsWith('.')) {
          candidatePaths.add(path.join(scratchDir, e.name));
        }
      }
    } catch {}
  }

  // 3. Documenti utente
  const userDocs = path.join(os.homedir(), 'Documents');
  if (fs.existsSync(userDocs)) {
    try {
      const entries = fs.readdirSync(userDocs, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory()) {
          const lower = e.name.toLowerCase();
          if (lower.includes('vault') || lower.includes('memai') || lower.includes('obsidian')) {
            candidatePaths.add(path.join(userDocs, e.name));
          }
        }
      }
    } catch {}
  }

  for (const p of candidatePaths) {
    if (isLimenOrObsidianVault(p)) {
      targets.push(p);
    }
  }
}

if (targets.length === 0) {
  console.log('\x1b[31m[AVVISO] Nessun Vault identificato.\x1b[0m');
  process.exit(0);
}

console.log(`Vault target da sanitizzare: \x1b[36m${targets.length}\x1b[0m\n`);

let grandTotalFilesModified = 0;
let grandTotalOccurrences = 0;

for (const vault of targets) {
  console.log(`----------------------------------------------------------------`);
  console.log(`Elaborazione Vault: \x1b[1m${vault}\x1b[0m`);

  let modifiedInVault = 0;
  let occurrencesInVault = 0;

  function processDir(dir) {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (['.git', 'node_modules'].includes(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(vault, fullPath);

      if (entry.isDirectory()) {
        processDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const isText = ['.md', '.txt', '.json', '.yaml', '.yml', '.csv', '.tsv', '.html', '.xml'].includes(ext) || !ext;

        if (isText) {
          try {
            const originalText = fs.readFileSync(fullPath, 'utf8');
            let count = 0;
            const matches1 = originalText.match(targetRegex);
            const matches2 = originalText.match(targetUnderscoreRegex);
            if (matches1) count += matches1.length;
            if (matches2) count += matches2.length;

            if (count > 0) {
              const sanitizedText = originalText
                .replace(targetRegex, replacementPhrase)
                .replace(targetUnderscoreRegex, 'RIFERIMENTO_RISERVATO');

              // Scrittura diretta senza creare file di backup
              fs.writeFileSync(fullPath, sanitizedText, 'utf8');
              console.log(`  \x1b[32m✓ Sanitizzato:\x1b[0m ${relPath} (${count} occorrenze sostituite)`);
              modifiedInVault++;
              occurrencesInVault += count;
            }
          } catch (err) {
            console.error(`  \x1b[31m✗ Errore su ${relPath}:\x1b[0m ${err.message}`);
          }
        }
      }
    }
  }

  processDir(vault);

  if (modifiedInVault === 0) {
    console.log(`  \x1b[90m(Nessun riferimento trovato in questo Vault)\x1b[0m`);
  } else {
    console.log(`  -> File modificati: \x1b[32m${modifiedInVault}\x1b[0m | Occorrenze sostituite: \x1b[32m${occurrencesInVault}\x1b[0m`);
  }
  console.log();

  grandTotalFilesModified += modifiedInVault;
  grandTotalOccurrences += occurrencesInVault;
}

console.log('================================================================');
console.log('                       RIEPILOGO FINALE');
console.log('================================================================');
console.log(`Totale Vault esaminati   : ${targets.length}`);
console.log(`Totale file sanitizzati  : \x1b[32m${grandTotalFilesModified}\x1b[0m`);
console.log(`Totale occorrenze corrette: \x1b[32m${grandTotalOccurrences}\x1b[0m`);
console.log(`File di backup creati    : \x1b[36m0 (Nessun file di backup generato)\x1b[0m`);
console.log('================================================================\n');
console.log('\x1b[32mSanitizzazione completata con successo!\x1b[0m\n');
