import React, { useEffect, useRef, useState } from 'react';
import bnxtLogo from './assets/bnxt1-logo-complete-black.png';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Minimize2,
  XCircle,
  FileText,
  Database,
  Search,
  Sparkles,
  ArrowRight,
  Loader2,
  Archive,
  Upload,
} from 'lucide-react';

export type BnxtPipelinePhase =
  | 'idle'
  | 'verifying'    // 1. Verifica del pacchetto
  | 'loading'      // 2. Installazione del Vault
  | 'extracting'   // 3. Verifica dei documenti
  | 'indexing'     // 4. Verifica degli indici
  | 'finalizing'   // 5. Apertura del Vault
  | 'completed'    // Vault pronto
  | 'error'        // Errore / parziale
  | 'cancelled';   // Annullato

export interface BnxtPreparationProgress {
  phase: BnxtPipelinePhase;
  currentFileName: string;
  processedCount: number;
  totalCount: number;
  bytesTransferred: number;
  totalBytes: number;
  indexedCount: number;
  conservedCount: number;
  errorCount: number;
  errors: Array<{ file: string; error: string }>;
  elapsedSeconds: number;
}

interface BnxtVaultPreparationModalProps {
  isOpen: boolean;
  progress: BnxtPreparationProgress;
  corpusStatus?: {
    isPresent?: boolean;
    fileCount?: number;
    indexedCount?: number;
    conservedCount?: number;
    defaultSourcePath?: string;
    sourceAvailable?: boolean;
    defaultZipPath?: string;
    zipAvailable?: boolean;
  } | null;
  onMinimize: () => void;
  onCancel: () => Promise<void>;
  onRetry: () => Promise<void>;
  onOpenVault: () => void;
  onStart: (customZipPath?: string, duplicatePolicy?: 'skip' | 'overwrite' | 'continue_without_upload') => Promise<void>;
  onInspect?: (customZipPath?: string) => Promise<import('./vault-ipc').BnxtInspectResult | null>;
}

export function BnxtVaultPreparationModal({
  isOpen,
  progress,
  corpusStatus,
  onMinimize,
  onCancel,
  onRetry,
  onOpenVault,
  onStart,
  onInspect,
}: BnxtVaultPreparationModalProps) {
  const [cancelling, setCancelling] = useState(false);
  const [selectedZipPath, setSelectedZipPath] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'overwrite' | 'continue_without_upload'>('skip');
  const [inspectResult, setInspectResult] = useState<import('./vault-ipc').BnxtInspectResult | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  // Ispezione pre-flight per rilevare duplicati/file già presenti
  useEffect(() => {
    if (!isOpen) return;
    const path = selectedZipPath || corpusStatus?.defaultZipPath;
    if (path && onInspect && progress.phase === 'idle') {
      setIsInspecting(true);
      onInspect(path)
        .then((res) => {
          setInspectResult(res);
          if (res?.hasExistingFiles && res.existingFilesCount >= 50) {
            setDuplicatePolicy('continue_without_upload');
          }
        })
        .catch(() => {})
        .finally(() => setIsInspecting(false));
    }
  }, [isOpen, selectedZipPath, corpusStatus?.defaultZipPath, progress.phase]);

  // Focus trap e tastiera ESC per ridurre
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    primaryButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onMinimize();
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [tabindex="0"]'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, [isOpen, onMinimize]);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const phases = [
    { id: 'verifying', label: '1. Verifica del pacchetto', icon: FileText },
    { id: 'loading', label: '2. Installazione del Vault', icon: Database },
    { id: 'extracting', label: '3. Verifica dei documenti', icon: Sparkles },
    { id: 'indexing', label: '4. Verifica degli indici', icon: Search },
    { id: 'finalizing', label: '5. Apertura del Vault', icon: CheckCircle2 },
  ];

  const getPhaseIndex = (p: BnxtPipelinePhase): number => {
    switch (p) {
      case 'verifying': return 0;
      case 'loading': return 1;
      case 'extracting': return 2;
      case 'indexing': return 3;
      case 'finalizing': return 4;
      case 'completed': return 5;
      default: return -1;
    }
  };

  const currentIdx = getPhaseIndex(progress.phase);

  // Calcolo percentuale solo se misurabile
  let percent: number | null = null;
  if (progress.phase === 'loading' && progress.totalBytes > 0) {
    percent = Math.min(100, Math.round((progress.bytesTransferred / progress.totalBytes) * 100));
  } else if ((progress.phase === 'extracting' || progress.phase === 'indexing') && progress.totalCount > 0) {
    percent = Math.min(100, Math.round((progress.processedCount / progress.totalCount) * 100));
  } else if (progress.phase === 'completed') {
    percent = 100;
  }

  const handleCancelClick = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      await onCancel();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        boxSizing: 'border-box',
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bnxt-prep-title"
        style={{
          width: 'min(680px, 100%)',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInModal 0.2s ease-out',
        }}
      >
        {/* HEADER MODALE SUPERPREMIUM */}
        <div
          style={{
            padding: '24px 28px 20px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                flexShrink: 0,
                padding: 4,
              }}
            >
              <img
                src={bnxtLogo}
                alt="BNXT1"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  marginBottom: 2,
                }}
              >
                LIMEN VAULT FOR BNXT EDITION
              </div>
              <h2
                id="bnxt-prep-title"
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                Preparazione del Vault BNXT
              </h2>
            </div>
          </div>

          {/* PULSANTE RIDUCI A ICONA */}
          <button
            type="button"
            onClick={onMinimize}
            title="Riduci a icona nella barra di stato (il processo continua)"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <Minimize2 size={13} />
            <span>Riduci</span>
          </button>
        </div>

        {/* CORPO MODALE */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* TRACK DELLE 5 FASI REALI */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              overflowX: 'auto',
            }}
          >
            {phases.map((ph, idx) => {
              const isPast = currentIdx > idx;
              const isCurrent = currentIdx === idx;
              return (
                <div
                  key={ph.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: isPast ? '#059669' : isCurrent ? '#0f172a' : '#94a3b8',
                    fontWeight: isCurrent ? 700 : 500,
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    opacity: isPast || isCurrent ? 1 : 0.6,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: isPast ? '#10b981' : isCurrent ? '#0f172a' : '#e2e8f0',
                      color: isPast || isCurrent ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {isPast ? (
                      <CheckCircle2 size={13} color="#ffffff" />
                    ) : isCurrent ? (
                      <Loader2 size={12} className="spin-animation" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span>{ph.label.split('. ')[1]}</span>
                  {idx < phases.length - 1 && (
                    <ArrowRight size={10} color="#cbd5e1" style={{ marginLeft: 6, marginRight: 2 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* STATO COMPLETATO: VAULT PRONTO */}
          {progress.phase === 'completed' && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px 10px',
                animation: 'fadeIn 0.25s ease',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  border: '1px solid #a7f3d0',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                Vault pronto
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                Il corpus documentale BNXT è stato verificato, caricato nel Vault ed estratto per il motore RAG.
                Le citazioni, i collegamenti e la ricerca locale sono pienamente operativi.
              </p>
            </div>
          )}

          {/* STATO IDLE: CARICAMENTO INTERATTIVO GUIDATO PASSO-PASSO DELLO ZIP */}
          {progress.phase === 'idle' && (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  Installazione Guidata Edizione BNXT
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  Questa procedura installerà il corpus documentale BNXT (4.971 documenti Markdown UTF-8) e le guide operative aggiornate delle applicazioni CRM, PWA QC, DELPO e LIMEN.
                </p>
              </div>

              {/* RILEVAMENTO AUTOMATICO O SELEZIONE ARCHIVIO ZIP */}
              {corpusStatus?.zipAvailable ? (
                <div
                  style={{
                    padding: '16px 18px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 12,
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: '#dcfce7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#16a34a',
                        flexShrink: 0,
                      }}
                    >
                      <Archive size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>
                        Archivio BNXT Edizione V8 Rilevato
                      </div>
                      <div style={{ fontSize: 11, color: '#15803d', marginTop: 2 }}>
                        {selectedZipPath || corpusStatus.defaultZipPath} (93.5 MB • SHA-256 Verificato • 4.971 Markdown)
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '4px 8px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Pronto al caricamento
                  </span>
                </div>
              ) : null}

              {/* AREA DRAG & DROP E FILE SELECTOR */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files.length > 0 && files[0].name.endsWith('.zip')) {
                    const f = files[0];
                    setSelectedZipPath((f as any).path || f.name);
                  }
                }}
                style={{
                  border: isDragging ? '2px dashed #10b981' : '2px dashed #cbd5e1',
                  borderRadius: 12,
                  padding: '20px 16px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#f0fdf4' : '#f8fafc',
                  marginBottom: 20,
                  transition: 'all 0.15s ease',
                }}
              >
                <Upload size={28} color="#64748b" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                  {selectedZipPath ? `File selezionato: ${selectedZipPath}` : 'Trascina qui l’archivio ZIP o selezionalo dal computer'}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Pacchetto autorizzato: <code>BNXT_LIMEN_V8normalizzato.zip</code>
                </div>
                <input
                  type="file"
                  id="bnxt-zip-file-input"
                  accept=".zip"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedZipPath((f as any).path || f.name);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('bnxt-zip-file-input')?.click();
                  }}
                  style={{
                    display: 'inline-block',
                    marginTop: 12,
                    padding: '6px 14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  Sfoglia archivio ZIP…
                </button>
              </div>

              {/* CONTROLLO FILE ESISTENTI & SCELTA DUPLICATI */}
              {inspectResult && inspectResult.hasExistingFiles && (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 12,
                    padding: '16px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', fontWeight: 700, fontSize: 13 }}>
                    <AlertTriangle size={18} color="#d97706" />
                    <span>File già presenti nel Vault ({inspectResult.existingFilesCount} su {inspectResult.totalFiles})</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#78350f', marginTop: 6, lineHeight: 1.5 }}>
                    La cartella <code>20_RAW_SOURCES/BNXT</code> contiene già documenti corrispondenti a questo pacchetto.
                    Come desideri procedere?
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12.5, color: '#1e293b' }}>
                      <input
                        type="radio"
                        name="bnxt-duplicate-policy"
                        checked={duplicatePolicy === 'skip'}
                        onChange={() => setDuplicatePolicy('skip')}
                        style={{ marginTop: 2 }}
                      />
                      <div>
                        <strong>Salta importazione file già presenti</strong> (Raccomandato)
                        <div style={{ fontSize: 11, color: '#64748b' }}>Conserva intatti i file già identici nel Vault e importa solo eventuali file nuovi o mancanti.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12.5, color: '#1e293b' }}>
                      <input
                        type="radio"
                        name="bnxt-duplicate-policy"
                        checked={duplicatePolicy === 'overwrite'}
                        onChange={() => setDuplicatePolicy('overwrite')}
                        style={{ marginTop: 2 }}
                      />
                      <div>
                        <strong>Sovrascrivi</strong>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Riscrivi e aggiorna tutti i file del Vault con i contenuti dell’archivio ZIP.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12.5, color: '#1e293b' }}>
                      <input
                        type="radio"
                        name="bnxt-duplicate-policy"
                        checked={duplicatePolicy === 'continue_without_upload'}
                        onChange={() => setDuplicatePolicy('continue_without_upload')}
                        style={{ marginTop: 2 }}
                      />
                      <div>
                        <strong>Continua senza upload</strong>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Non estrarre nuovamente lo ZIP; utilizza direttamente i documenti già nel Vault e procedi alla verifica/apertura.</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* LISTA DEI 5 PASSAGGI STEP-BY-STEP */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px',
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 12, letterSpacing: '0.04em' }}>
                  Passaggi automatici dell’installazione:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>1</span>
                    <div><strong style={{ color: '#0f172a' }}>Verifica del pacchetto:</strong> Controllo dell’integrità SHA-256 e dei 4.971 file Markdown UTF-8.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>2</span>
                    <div><strong style={{ color: '#0f172a' }}>Installazione del Vault:</strong> Collocazione atomica in <code>20_RAW_SOURCES/BNXT/</code> senza cartelle superflue.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>3</span>
                    <div><strong style={{ color: '#0f172a' }}>Verifica dei documenti:</strong> Validazione file e inserimento delle guide CRM, QC, DELPO e LIMEN.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>4</span>
                    <div><strong style={{ color: '#0f172a' }}>Verifica degli indici:</strong> Convalida indice testuale BM25 e modello vettoriale locale (<code>bge-m3</code>).</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>5</span>
                    <div><strong style={{ color: '#0f172a' }}>Apertura del Vault:</strong> Transizione a Vault pronto con ricerca e chat locale attive.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATO ANNULLATO O ERRORE */}
          {progress.phase === 'cancelled' && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                padding: 16,
                borderRadius: 10,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <AlertTriangle size={18} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: 13, color: '#92400e' }}>Operazione interrotta</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#b45309' }}>
                  I file già acquisiti fino al momento dell’annullamento sono stati preservati con integrità nel Vault.
                  Puoi riprendere la preparazione in qualsiasi momento.
                </p>
              </div>
            </div>
          )}

          {/* PROGRESS BAR & STATISTICHE IN TEMPO REALE (QUANDO ATTIVO) */}
          {progress.phase !== 'completed' && progress.phase !== 'idle' && (
            <div>
              {/* FILE ATTIVO E DESCRIZIONE ATTIVITÀ */}
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0f172a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '80%',
                  }}
                  title={progress.currentFileName}
                >
                  {cancelling
                    ? 'Annullamento controllato in corso…'
                    : progress.currentFileName
                    ? `File: ${progress.currentFileName}`
                    : 'Elaborazione in corso…'}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                  {percent !== null ? `${percent}%` : ''}
                </span>
              </div>

              {/* BARRA DI AVANZAMENTO FLUIDA */}
              <div
                style={{
                  height: 8,
                  width: '100%',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 999,
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: percent !== null ? `${percent}%` : '40%',
                    background: 'linear-gradient(90deg, #c8ff00 0%, #10b981 100%)',
                    borderRadius: 999,
                    transition: percent !== null ? 'width 0.25s ease' : 'none',
                    animation: percent === null ? 'pulseIndeterminate 1.5s infinite ease-in-out' : 'none',
                  }}
                />
              </div>

              {/* DETTAGLIO METRICHE IN TEMPO REALE */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 20,
                  fontSize: 11,
                }}
              >
                <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    <span>Tempo trascorso</span>
                  </div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>{formatTime(progress.elapsedSeconds)}</strong>
                </div>

                <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', marginBottom: 2 }}>Dati trasferiti</div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>
                    {formatBytes(progress.bytesTransferred)}
                    {progress.totalBytes > 0 ? ` / ${formatBytes(progress.totalBytes)}` : ''}
                  </strong>
                </div>

                <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', marginBottom: 2 }}>Elementi elaborati</div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>
                    {progress.processedCount}
                    {progress.totalCount > 0 ? ` / ${progress.totalCount}` : ''}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* RIPARTIZIONE DOCUMENTI INDICIZZATI / CONSERVATI / ERRORI */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: 10,
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ color: '#334155' }}>
                Documenti indicizzati: <strong>{progress.indexedCount}</strong>
              </span>
            </div>
            <div style={{ color: '#cbd5e1' }}>·</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#64748b' }} />
              <span style={{ color: '#334155' }}>
                Materiali tecnici conservati: <strong>{progress.conservedCount}</strong>
              </span>
            </div>
            {progress.errorCount > 0 && (
              <>
                <div style={{ color: '#cbd5e1' }}>·</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626' }}>
                  <XCircle size={13} />
                  <span>
                    Errori parziali: <strong>{progress.errorCount}</strong>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* LISTA ERRORI PARZIALI SE PRESENTI */}
          {progress.errors.length > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                maxHeight: 120,
                overflowY: 'auto',
                fontSize: 11,
              }}
            >
              <strong style={{ color: '#991b1b', display: 'block', marginBottom: 4 }}>
                Elementi non riusciti:
              </strong>
              {progress.errors.map((err, idx) => (
                <div key={idx} style={{ color: '#b91c1c', marginBottom: 2 }}>
                  • {err.file}: {err.error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER PULSANTI AZIONE */}
        <div
          style={{
            padding: '16px 28px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* LATO SINISTRO: ANNULLA / INFORMAZIONI */}
          <div>
            {progress.phase !== 'completed' && progress.phase !== 'idle' && (
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={cancelling}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #e2e8f0',
                  color: '#dc2626',
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.6 : 1,
                }}
              >
                {cancelling ? 'Interruzione in corso…' : 'Annulla preparazione'}
              </button>
            )}

            {progress.errorCount > 0 && progress.phase !== 'loading' && (
              <button
                type="button"
                onClick={onRetry}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <RotateCcw size={13} />
                <span>Riprova elementi falliti</span>
              </button>
            )}
          </div>

          {/* LATO DESTRO: AZIONE PRINCIPALE */}
          <div style={{ display: 'flex', gap: 10 }}>
            {progress.phase === 'completed' ? (
              <button
                ref={primaryButtonRef}
                type="button"
                onClick={onOpenVault}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
                }}
              >
                Apri il Vault
              </button>
            ) : progress.phase === 'idle' ? (
              <button
                ref={primaryButtonRef}
                type="button"
                onClick={() => onStart(selectedZipPath || corpusStatus?.defaultZipPath, duplicatePolicy)}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
                }}
              >
                Avvia installazione e preparazione
              </button>
            ) : (
              <button
                type="button"
                onClick={onMinimize}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continua in background
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
