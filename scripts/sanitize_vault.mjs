#!/usr/bin/env node
/**
 * LIMEN Vault — Script Unico di Sanitizzazione Referenze (Zero Backup)
 *
 * Scansiona e sostituisce ogni occorrenza di:
 * 1. "Michele Bondani" -> "[RIFERIMENTO_RISERVATO]"
 * 2. "Packaging in Italy" (e varianti) -> "[AZIENDA_RISERVATA]"
 * nei file del Vault, mantenendo intatti i file e SENZA creare alcun file di backup.
 *
 * Utilizzo:
 *   # 1. Sanitizzazione automatica di TUTTI i Vault trovati sul sistema:
 *   node scripts/sanitize_vault.mjs
 *
 *   # 2. Sanitizzazione di un singolo Vault specifico:
 *   node scripts/sanitize_vault.mjs "tests/scratch/vault_collaudo_local_rag_v2"
 *
 *   # 3. Sanitizzazione con termine personalizzato:
 *   node scripts/sanitize_vault.mjs --target "Nome Target" --replace "[SOSTITUZIONE]"
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const positionalArgs = args.filter((a) => !a.startsWith('--'));

// Definizione pattern predefiniti da sanitizzare
const defaultRules = [
  {
    name: 'Michele Bondani',
    regexes: [
      new RegExp('Michele\\s+Bondani', 'gi'),
      new RegExp('Michele_Bondani', 'gi'),
    ],
    replacement: '[RIFERIMENTO_RISERVATO]',
  },
  {
    name: 'Packaging in Italy',
    regexes: [
      new RegExp('Packaging\\s+in\\s+Italy(?:\\s+s\\.?r\\.?l\\.?)?', 'gi'),
      new RegExp('Packaging_in_Italy', 'gi'),
      new RegExp('PackaginginItaly', 'gi'),
    ],
    replacement: '[AZIENDA_RISERVATA]',
  },
];

// Supporto per override da riga di comando
let activeRules = defaultRules;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) {
    const customTarget = args[i + 1];
    let customReplace = '[RIFERIMENTO_RISERVATO]';
    for (let j = 0; j < args.length; j++) {
      if (args[j] === '--replace' && args[j + 1]) {
        customReplace = args[j + 1];
      }
    }
    const escaped = customTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    activeRules = [
      {
        name: customTarget,
        regexes: [new RegExp(escaped, 'gi'), new RegExp(customTarget.replace(/\s+/g, '_'), 'gi')],
        replacement: customReplace,
      },
    ];
    break;
  }
}

console.log('\n================================================================');
console.log('    LIMEN VAULT — SANITIZZATORE UNICO DIRETTO (NO BACKUP)');
console.log('================================================================');
console.log('Regole di sanitizzazione attive:');
activeRules.forEach((r, idx) => {
  console.log(`  ${idx + 1}. \x1b[33m"${r.name}"\x1b[0m -> \x1b[32m"${r.replacement}"\x1b[0m`);
});
console.log(`File di backup : \x1b[31mDISABILITATI (Nessun backup creato)\x1b[0m`);
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

    if (
      (hasRaw && hasClients) ||
      (hasRaw && hasSystem) ||
      (hasSystem && hasClients) ||
      (hasObsidian && (hasClients || hasRaw || hasProposals)) ||
      hasLimen
    ) {
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
const ruleStats = {};
activeRules.forEach((r) => {
  ruleStats[r.name] = 0;
});

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
            let currentText = fs.readFileSync(fullPath, 'utf8');
            let fileChanged = false;
            let fileOccurrences = 0;

            for (const rule of activeRules) {
              for (const rx of rule.regexes) {
                const matches = currentText.match(rx);
                if (matches && matches.length > 0) {
                  currentText = currentText.replace(rx, rule.replacement);
                  fileChanged = true;
                  fileOccurrences += matches.length;
                  ruleStats[rule.name] = (ruleStats[rule.name] || 0) + matches.length;
                }
              }
            }

            if (fileChanged) {
              // Scrittura diretta senza creare file di backup
              fs.writeFileSync(fullPath, currentText, 'utf8');
              console.log(`  \x1b[32m✓ Sanitizzato:\x1b[0m ${relPath} (${fileOccurrences} occorrenze corrette)`);
              modifiedInVault++;
              occurrencesInVault += fileOccurrences;
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
console.log('Dettaglio per regola:');
Object.entries(ruleStats).forEach(([name, count]) => {
  console.log(`  - \x1b[33m"${name}"\x1b[0m: \x1b[32m${count} occorrenze sostituite\x1b[0m`);
});
console.log(`File di backup creati    : \x1b[36m0 (Nessun file di backup generato)\x1b[0m`);
console.log('================================================================\n');
console.log('\x1b[32mSanitizzazione completata con successo!\x1b[0m\n');
