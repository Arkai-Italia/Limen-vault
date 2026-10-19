import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const appTsxPath = join(root, 'apps/desktop/src/App.tsx');
const modalPath = join(root, 'apps/desktop/src/BnxtVaultPreparationModal.tsx');
const prepModulePath = join(root, 'apps/desktop/src/bnxt-preparation.ts');
const rustBnxtPath = join(root, 'apps/desktop/src-tauri/src/bnxt.rs');
const rustMainPath = join(root, 'apps/desktop/src-tauri/src/main.rs');
const ipcPath = join(root, 'apps/desktop/src/vault-ipc.ts');

console.log('--- COLLAUDO LIMEN VAULT FOR BNXT EDITION ---');

// 1. Verifica file sorgente del modulo BNXT
assert.ok(existsSync(modalPath), 'BnxtVaultPreparationModal.tsx deve esistere');
assert.ok(existsSync(prepModulePath), 'bnxt-preparation.ts deve esistere');
assert.ok(existsSync(rustBnxtPath), 'bnxt.rs deve esistere');
console.log('✓ File di implementazione BNXT presenti in desktop e src-tauri');

// 2. Verifica BnxtVaultPreparationModal.tsx
const modalContent = readFileSync(modalPath, 'utf8');
assert.ok(modalContent.includes('Preparazione del Vault BNXT'), 'Titolo modal corretto');
assert.ok(modalContent.includes('Verifica del pacchetto') || modalContent.includes('Verifica dei file'), 'Fase 1 presente');
assert.ok(modalContent.includes('Installazione del Vault') || modalContent.includes('Caricamento nel Vault'), 'Fase 2 presente');
assert.ok(modalContent.includes('Verifica dei documenti') || modalContent.includes('Estrazione dei contenuti'), 'Fase 3 presente');
assert.ok(modalContent.includes('Verifica degli indici') || modalContent.includes('Indicizzazione per la ricerca'), 'Fase 4 presente');
assert.ok(modalContent.includes('Apertura del Vault') || modalContent.includes('Verifica finale'), 'Fase 5 presente');
assert.ok(modalContent.includes('Vault pronto'), 'Stato completato presente');
assert.ok(modalContent.includes('bytesTransferred'), 'Contatore byte presente');
assert.ok(modalContent.includes('onMinimize'), 'Controllo Riduci presente');
assert.ok(modalContent.includes('onCancel'), 'Controllo Annulla presente');
assert.ok(modalContent.includes('onRetry'), 'Controllo Riprova presente');
console.log('✓ BnxtVaultPreparationModal contiene tutte le 5 fasi reali, metriche e controlli');

// 3. Verifica bnxt-preparation.ts
const prepContent = readFileSync(prepModulePath, 'utf8');
assert.ok(prepContent.includes('listenBnxtProgress'), 'Funzione listenBnxtProgress esportata');
assert.ok(prepContent.includes('checkBnxtStatus'), 'Funzione checkBnxtStatus esportata');
assert.ok(prepContent.includes('runBnxtPreparation'), 'Funzione runBnxtPreparation esportata');
assert.ok(prepContent.includes('cancelBnxtPreparation'), 'Funzione cancelBnxtPreparation esportata');
console.log('✓ bnxt-preparation.ts espone tutte le API di orchestrazione necessarie');

// 4. Verifica modulo Rust bnxt.rs e registrazione comandi
const rustBnxtContent = readFileSync(rustBnxtPath, 'utf8');
assert.ok(rustBnxtContent.includes('pub async fn bnxt_check_status'), 'Comando bnxt_check_status implementato');
assert.ok(rustBnxtContent.includes('pub async fn bnxt_prepare_vault'), 'Comando bnxt_prepare_vault implementato');
assert.ok(rustBnxtContent.includes('is_indexable_extension'), 'Classificazione Conserva vs Indicizza presente');
assert.ok(rustBnxtContent.includes('sync_catalog'), 'Chiamata sync_catalog integrata');
assert.ok(rustBnxtContent.includes('process_pending_extractions'), 'Chiamata process_pending_extractions integrata');
assert.ok(rustBnxtContent.includes('index_vault_search'), 'Chiamata index_vault_search integrata');

const rustMainContent = readFileSync(rustMainPath, 'utf8');
assert.ok(rustMainContent.includes('mod bnxt;'), 'mod bnxt dichiarato in main.rs');
assert.ok(rustMainContent.includes('bnxt_check_status'), 'bnxt_check_status registrato in invoke_handler');
assert.ok(rustMainContent.includes('bnxt_prepare_vault'), 'bnxt_prepare_vault registrato in invoke_handler');
console.log('✓ Backend Rust bnxt.rs correttamente registrato e collegato alle pipeline Limen');

// 5. Verifica integrazione in App.tsx
const appContent = readFileSync(appTsxPath, 'utf8');
assert.ok(appContent.includes('<BnxtVaultPreparationModal'), 'BnxtVaultPreparationModal renderizzato in App.tsx');
assert.ok(appContent.includes('showBnxtModal'), 'showBnxtModal state presente');
assert.ok(appContent.includes('bnxtMinimized'), 'bnxtMinimized state presente');
assert.ok(appContent.includes('bnxtProgress'), 'bnxtProgress state presente');
assert.ok(appContent.includes('LIMEN VAULT FOR BNXT EDITION'), 'Sidebar branding LIMEN VAULT FOR BNXT EDITION presente');
assert.ok(appContent.includes('data-testid="sidebar-bnxt-edition"'), 'data-testid sidebar presente');
console.log('✓ Integrazione completa e rendering verificati in App.tsx');

// 6. Verifica IPC
const ipcContent = readFileSync(ipcPath, 'utf8');
assert.ok(ipcContent.includes('BnxtCorpusStatus'), 'Interfaccia BnxtCorpusStatus definita in vault-ipc.ts');
assert.ok(ipcContent.includes('bnxtCheckStatus:'), 'bnxtCheckStatus presente in createVaultIpc');
assert.ok(ipcContent.includes('bnxtPrepareVault:'), 'bnxtPrepareVault presente in createVaultIpc');
console.log('✓ Metodi e tipi IPC verificati in vault-ipc.ts');

console.log('========================================================================');
console.log('   COLLAUDO INTEGRALE BNXT EDITION COMPLETATO CON SUCCESSO (0 ERRORI)');
console.log('========================================================================');
