import React from 'react';
import {
  Sparkles,
  Database,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  FileText,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { LimenAiIcon } from './LimenAiIcon';

export interface IndexingPromptModalProps {
  isOpen: boolean;
  filesCount: number;
  fileNames?: string[];
  isProcessing: boolean;
  progressStep?: string | null;
  progressPercent?: number;
  error?: string | null;
  children?: React.ReactNode;
  reviewing?: boolean;
  onProceed: () => void;
  onPostpone: () => void;
  onClose?: () => void;
}

export const IndexingPromptModal: React.FC<IndexingPromptModalProps> = ({
  isOpen,
  filesCount,
  fileNames = [],
  isProcessing,
  progressStep,
  progressPercent,
  error,
  children,
  reviewing = false,
  onProceed,
  onPostpone,
  onClose,
}) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) { event.preventDefault(); onPostpone(); }
      if (event.key !== 'Tab' || !dialog) return;
      const buttons = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), input:not([disabled])'));
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog?.addEventListener('keydown', keydown);
    return () => { dialog?.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [isOpen, isProcessing, onPostpone]);
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      ref={dialogRef}
      role="dialog"
      aria-label="Indicizzazione documenti"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          maxWidth: 540,
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LimenAiIcon size={22} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
              {reviewing ? 'Scegli le destinazioni' : 'Indicizza e organizza i documenti'}
            </h3>
          </div>

          {!isProcessing && onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
              {filesCount === 0 ? 'Elabora i documenti in attesa e completa gli indici del vault.' : filesCount === 1
                ? 'È stato importato 1 nuovo documento in 20_RAW_SOURCES.'
                : `Sono stati importati ${filesCount} nuovi documenti in 20_RAW_SOURCES.`}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              L’operazione comprende anche i documenti già in attesa in RAW. Limen estrae il testo, classifica con il modello locale e sposta gli originali nelle cartelle pertinenti, senza lasciare copie in RAW. Se la destinazione è incerta, ti chiede di sceglierla. Infine aggiorna la ricerca.
            </p>
          </div>

          {/* LISTA ANTEPRIMA FILE */}
          {fileNames.length > 0 && (
            <div
              style={{
                maxHeight: 90,
                overflowY: 'auto',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: '#475569',
                marginBottom: 16,
              }}
            >
              {fileNames.map((name, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                  <FileText size={13} color="#64748b" />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* GUIDA AI 4 LIVELLI DI CONOSCENZA */}
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 12,
              marginBottom: 20,
              color: '#166534',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={14} />
              <span>Pipeline di conoscenza trasparente:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
              <li><strong>Originale RAW:</strong> protetto in <code>20_RAW_SOURCES</code>, mai modificato.</li>
              <li><strong>Passaggi estratti:</strong> testo suddiviso per la ricerca locale (senza duplicare i file).</li>
              <li><strong>Note tematiche:</strong> le cartelle <code>01_CLIENTS</code>..<code>10</code> restano separate e vengono popolate solo tramite classificazione/compilazione assistita.</li>
            </ul>
          </div>

          {/* STATO AVANZAMENTO (SE IN ELABORAZIONE) */}
          {isProcessing && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={14} className="spin" />
                  <span>{progressStep || 'Indicizzazione in corso...'}</span>
                </span>
                {typeof progressPercent === 'number' && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                    {progressPercent}%
                  </span>
                )}
              </div>
              <div
                style={{
                  height: 6,
                  backgroundColor: '#e2e8f0',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--limen-lime-dark, #4d7c0f)',
                    width: `${typeof progressPercent === 'number' ? progressPercent : 100}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* ERRORE (SE PRESENTE) */}
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#991b1b',
                fontSize: 12.5,
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Errore durante l'elaborazione:</div>
              <div>{error}</div>
            </div>
          )}

          {children}
          {/* AZIONI */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={onPostpone}
              disabled={isProcessing}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: 13,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              Rimanda a dopo
            </button>

            <button
              onClick={onProceed}
              disabled={isProcessing}
              style={{
                padding: '9px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: isProcessing ? '#94a3b8' : 'var(--limen-lime)',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Elaborazione...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>{reviewing ? 'Conferma destinazioni e aggiorna indice' : 'Indicizza e organizza'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexingPromptModal;
