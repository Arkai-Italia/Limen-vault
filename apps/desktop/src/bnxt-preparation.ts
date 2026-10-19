/**
 * Orchestratore della Pipeline di Preparazione del Vault per LIMEN VAULT FOR BNXT EDITION
 * Gestisce le 5 fasi reali:
 * 1. Verifica dei file (conteggio, integrità, dimensione totale)
 * 2. Caricamento nel Vault (copia atomica in 20_RAW_SOURCES/BNXT con byte trasferiti)
 * 3. Estrazione dei contenuti (estrazione streaming a memoria controllata)
 * 4. Indicizzazione per la ricerca (BM25 e vettoriale)
 * 5. Verifica finale (allineamento catalogo e stato completato)
 */

import { BnxtPreparationProgress, BnxtPipelinePhase } from './BnxtVaultPreparationModal';
import { BnxtCorpusStatus, BnxtInspectResult } from './vault-ipc';

export const INITIAL_BNXT_PROGRESS: BnxtPreparationProgress = {
  phase: 'idle',
  currentFileName: '',
  processedCount: 0,
  totalCount: 0,
  bytesTransferred: 0,
  totalBytes: 0,
  indexedCount: 0,
  conservedCount: 0,
  errorCount: 0,
  errors: [],
  elapsedSeconds: 0,
};

/**
 * Ascolta gli eventi in streaming della pipeline BNXT emessi dal backend Rust
 */
export async function listenBnxtProgress(
  onProgress: (progress: BnxtPreparationProgress) => void
): Promise<() => void> {
  try {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = await listen<any>('bnxt_progress', (event) => {
      const p = event.payload;
      if (!p) return;
      onProgress({
        phase: (p.phase as BnxtPipelinePhase) || 'idle',
        currentFileName: p.currentFileName || '',
        processedCount: p.processedCount || 0,
        totalCount: p.totalCount || 0,
        bytesTransferred: p.bytesTransferred || 0,
        totalBytes: p.totalBytes || 0,
        indexedCount: p.indexedCount || 0,
        conservedCount: p.conservedCount || 0,
        errorCount: p.errorCount || 0,
        errors: p.errors || [],
        elapsedSeconds: p.elapsedSeconds || 0,
      });
    });
    return unlisten;
  } catch {
    // In ambiente browser preview/mock, restituisce no-op
    return () => {};
  }
}

/**
 * Controlla lo stato di presenza del corpus BNXT all'interno del Vault
 */
export async function checkBnxtStatus(
  vaultPath: string,
  ipc: { bnxtCheckStatus?: (p: string) => Promise<BnxtCorpusStatus> }
): Promise<BnxtCorpusStatus> {
  if (typeof ipc.bnxtCheckStatus === 'function') {
    try {
      return await ipc.bnxtCheckStatus(vaultPath);
    } catch (e) {
      console.warn('Controllo stato BNXT fallito:', e);
    }
  }

  return {
    isPresent: false,
    fileCount: 0,
    indexedCount: 0,
    conservedCount: 0,
    defaultSourcePath: '/Users/cesare/Documents/bnxt_crm',
    sourceAvailable: false,
  };
}

/**
 * Ispeziona la sorgente per rilevare se ci sono già file presenti nel Vault
 */
export async function inspectBnxtSource(
  vaultPath: string,
  ipc: { bnxtInspectSource?: (p: string, src?: string) => Promise<BnxtInspectResult> },
  sourcePath?: string
): Promise<BnxtInspectResult | null> {
  if (typeof ipc.bnxtInspectSource === 'function') {
    try {
      return await ipc.bnxtInspectSource(vaultPath, sourcePath);
    } catch (e) {
      console.warn('Ispezione sorgente BNXT fallita:', e);
    }
  }
  return null;
}

/**
 * Avvia la preparazione completa del Vault per l'Edizione BNXT
 */
export async function runBnxtPreparation(
  vaultPath: string,
  ipc: {
    bnxtPrepareVault?: (p: string, src?: string, policy?: string) => Promise<BnxtCorpusStatus>;
    automationCancelImport?: () => Promise<void>;
  },
  onProgress?: (progress: BnxtPreparationProgress) => void,
  sourcePath?: string,
  duplicatePolicy?: 'skip' | 'overwrite' | 'continue_without_upload'
): Promise<BnxtCorpusStatus> {
  if (typeof ipc.bnxtPrepareVault === 'function') {
    return await ipc.bnxtPrepareVault(vaultPath, sourcePath, duplicatePolicy);
  }

  // Fallback per test o anteprima web
  throw new Error('Runtime nativo Tauri non disponibile per la preparazione BNXT');
}

/**
 * Annulla atomicamente la preparazione del Vault senza corrompere i file già acquisiti
 */
export async function cancelBnxtPreparation(ipc: {
  automationCancelImport?: () => Promise<void>;
}): Promise<void> {
  if (typeof ipc.automationCancelImport === 'function') {
    await ipc.automationCancelImport();
  }
}
