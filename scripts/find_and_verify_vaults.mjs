#!/usr/bin/env node
/**
 * LIMEN Vault — Scanner Automatico dei Vault e Verifica Referenze
 *
 * Scansiona automaticamente il computer, il workspace e i file di configurazione di Obsidian
 * per trovare tutti i Vault esistenti e verificare la presenza di referenze a "Michele Bondani".
 *
 * Utilizzo:
 *   node scripts/find_and_verify_vaults.mjs
 *   node scripts/find_and_verify_vaults.mjs --target "Altro Nome"
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
let targetPhrase = 'Michele Bondani';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) {
    targetPhrase = args[i + 1];
  }
}

const escapedTarget = targetPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const targetRegex = new RegExp(escapedTarget, 'gi');
const targetUnderscore = targetPhrase.replace(/\s+/g, '_');
const targetUnderscoreRegex = new RegExp(targetUnderscore.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

console.log('\n================================================================');
console.log('       LIMEN VAULT — RILEVATORE E SCANNER DEI VAULT');
console.log('================================================================');
console.log(`Termine target cercato : \x1b[33m"${targetPhrase}"\x1b[0m`);
console.log('Ricerca automatica dei percorsi Vault in corso...');
console.log('================================================================\n');

const candidatePaths = new Set();

// 1. Lettura configurazione Obsidian
const obsidianConfig = path.join(os.homedir(), 'Library/Application Support/obsidian/obsidian.json');
if (fs.existsSync(obsidianConfig)) {
  try {
    const raw = fs.readFileSync(obsidianConfig, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.vaults) {
      for (const v of Object.values(parsed.vaults)) {
        if (v && v.path) {
          candidatePaths.add(path.resolve(v.path));
        }
      }
    }
  } catch {}
}

// 2. Cartelle note nel workspace
const workspaceRoot = process.cwd();
candidatePaths.add(path.join(workspaceRoot, 'vault-template'));

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

// 3. Documenti dell'utente e cartelle tipiche
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

// Scansiona i candidati
const verifiedVaults = [];

for (const p of candidatePaths) {
  if (isLimenOrObsidianVault(p)) {
    verifiedVaults.push(p);
  }
}

// Se non ne abbiamo trovati, facciamo una scansione un livello più profonda in ~/Documents
if (verifiedVaults.length === 0 && fs.existsSync(userDocs)) {
  try {
    const subdirs = fs.readdirSync(userDocs, { withFileTypes: true });
    for (const sub of subdirs) {
      if (sub.isDirectory() && !sub.name.startsWith('.')) {
        const fullSub = path.join(userDocs, sub.name);
        if (isLimenOrObsidianVault(fullSub)) {
          verifiedVaults.push(fullSub);
        }
      }
    }
  } catch {}
}

console.log(`Identificati \x1b[32m${verifiedVaults.length}\x1b[0m possibili Vault validi sul sistema.\n`);

if (verifiedVaults.length === 0) {
  console.log('\x1b[33mNessun Vault rilevato automaticamente nelle posizioni standard.\x1b[0m');
  console.log('Puoi passare un percorso manualmente eseguendo:');
  console.log('  node scripts/clean_vault_references.mjs "/percorso/della/tua/cartella"\n');
  process.exit(0);
}

// Analizza ogni Vault per la presenza del target
const vaultReports = [];

for (const vault of verifiedVaults) {
  let fileMatches = 0;
  let matchingFiles = [];

  function scan(dir) {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (['.git', 'node_modules'].includes(item.name)) continue;
        const full = path.join(dir, item.name);
        const rel = path.relative(vault, full);

        if (item.isDirectory()) {
          if (targetRegex.test(item.name) || targetUnderscoreRegex.test(item.name)) {
            matchingFiles.push({ type: 'dir', rel });
          }
          scan(full);
        } else if (item.isFile()) {
          const nameMatch = targetRegex.test(item.name) || targetUnderscoreRegex.test(item.name);
          const ext = path.extname(item.name).toLowerCase();
          const isText = ['.md', '.txt', '.json', '.yaml', '.yml'].includes(ext) || !ext;

          let contentMatch = false;
          if (isText) {
            try {
              const text = fs.readFileSync(full, 'utf8');
              if (targetRegex.test(text) || targetUnderscoreRegex.test(text)) {
                contentMatch = true;
              }
            } catch {}
          }

          if (nameMatch || contentMatch) {
            fileMatches++;
            matchingFiles.push({ type: 'file', rel, nameMatch, contentMatch });
          }
        }
      }
    } catch {}
  }

  scan(vault);

  vaultReports.push({
    vaultPath: vault,
    fileMatches,
    matchingFiles,
  });
}

// Stampa report
vaultReports.forEach((r, idx) => {
  const hasMatches = r.fileMatches > 0;
  const statusColor = hasMatches ? '\x1b[31m' : '\x1b[32m';
  const statusIcon = hasMatches ? '⚠️' : '✓';

  console.log(`----------------------------------------------------------------`);
  console.log(`[VAULT #${idx + 1}] ${statusIcon} \x1b[1m${r.vaultPath}\x1b[0m`);
  console.log(`Stato referenze "${targetPhrase}": ${statusColor}${r.fileMatches} file con corrispondenze\x1b[0m`);

  if (hasMatches) {
    console.log(`File con occorrenze:`);
    r.matchingFiles.slice(0, 5).forEach((f) => {
      console.log(`  - \x1b[33m${f.rel}\x1b[0m`);
    });
    if (r.matchingFiles.length > 5) {
      console.log(`  - ... ed altri ${r.matchingFiles.length - 5} file.`);
    }

    console.log(`\nComando pronto per ripulire questo Vault:`);
    console.log(`  \x1b[36mnode scripts/clean_vault_references.mjs "${r.vaultPath}"\x1b[0m  (Simulazione)`);
    console.log(`  \x1b[32mnode scripts/clean_vault_references.mjs "${r.vaultPath}" --delete-files --execute\x1b[0m  (Eliminazione con backup automatico)`);
  }
  console.log();
});

console.log('================================================================');
console.log('                       RIEPILOGO FINALE');
console.log('================================================================');
const vaultsWithMatches = vaultReports.filter((r) => r.fileMatches > 0);
if (vaultsWithMatches.length === 0) {
  console.log(`\x1b[32m[OTTIMO] Nessun Vault tra quelli esaminati contiene referenze a "${targetPhrase}".\x1b[0m\n`);
} else {
  console.log(`\x1b[33mTrovati ${vaultsWithMatches.length} Vault con referenze a "${targetPhrase}".\x1b[0m`);
  console.log('Puoi eseguire i comandi sopra indicati per analizzarli o sanificarli in sicurezza.\n');
}
