import { useEffect, useRef, useState } from 'react';
import type { ImportChoice, ImportItem, ImportProgress } from './vault-ipc';

export function ImportDocumentsModal({ items, busy, progress, error, onConfirm, onClose, onCancel }: {
  items: ImportItem[]; busy: boolean; progress: ImportProgress | null;
  error?: string | null;
  onConfirm: (choices: ImportChoice[]) => void; onClose: () => void; onCancel: () => Promise<void>;
}) {
  const [selected, setSelected] = useState(() => items.map(i => !i.blockedReason));
  const [index, setIndex] = useState(() => items.map(i => i.index && i.canExtract));
  const [cancelling, setCancelling] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus();
    return () => previous?.focus();
  }, []);
  const chosen = items.flatMap((item, n) => selected[n] && !item.blockedReason ? [{ sourcePath: item.sourcePath, entryIndex: item.entryIndex, index: index[n] }] : []);
  const totalBytes = items.reduce((sum, item, n) => sum + (selected[n] ? item.sizeBytes : 0), 0);
  const percent = progress && progress.total > 0 ? Math.min(100, Math.round(progress.current / progress.total * 100)) : null;
  return <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#000a', display: 'grid', placeItems: 'center', padding: 20 }}>
    <div ref={container} role="dialog" aria-modal="true" aria-labelledby="import-review-title" style={{ width: 'min(1050px, 100%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', color: '#14202d', padding: 24, borderRadius: 12 }}
      onKeyDown={e => {
        if (e.key === 'Escape' && !busy) onClose();
        if (e.key === 'Tab') {
          const controls = container.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)');
          if (!controls?.length) return;
          const first = controls[0], last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }}>
      <h2 id="import-review-title">Controlla i file da importare</h2>
      <p>{chosen.length} file selezionati · {(totalBytes / 1_000_000).toFixed(1)} MB. La colonna Indicizza sceglie i documenti da elaborare dopo il consenso. Gli altri file selezionati vengono conservati come supporto.</p>
      <p>Originali fino a 2 GB per file. ZIP: massimo 10 GB decompressi, 10.000 elementi e 32 livelli di cartelle. Office, fogli di calcolo e OCR: massimo 16 MiB di testo estratto; PDF fino a 500 pagine. Un limite superato viene segnalato per documento e l’originale rimane conservato.</p>
      <div style={{ maxHeight: '45vh', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead><tr><th>Conserva</th><th>Indicizza</th><th>File e destinazione</th><th>Dimensione</th></tr></thead>
          <tbody>{items.map((item, n) => <tr key={`${item.sourcePath}:${item.entryIndex ?? 'file'}:${n}`}>
            <td><input type="checkbox" aria-label={`Conserva ${item.name}`} checked={selected[n]} disabled={busy || !!item.blockedReason} onChange={e => setSelected(s => s.map((v, k) => k === n ? e.target.checked : v))} /></td>
            <td><input type="checkbox" aria-label={`Indicizza ${item.name}`} checked={index[n]} disabled={busy || !selected[n] || !item.canExtract || !!item.blockedReason} onChange={e => setIndex(s => s.map((v, k) => k === n ? e.target.checked : v))} /></td>
            <td style={{ padding: 6, overflowWrap: 'anywhere' }}><strong>{item.name}</strong><br />{item.targetPath}{item.blockedReason && <p role="note" style={{ color: '#9b2626' }}>{item.blockedReason}</p>}</td>
            <td>{(item.sizeBytes / 1_000_000).toFixed(2)} MB</td>
          </tr>)}</tbody>
        </table>
      </div>
      {busy && <div role="status" aria-live="polite">
        <p>{cancelling ? 'Annullamento in corso…' : `Importazione: ${progress?.name || 'preparazione…'}`}</p>
        <progress aria-label="Avanzamento importazione" max={100} value={percent ?? undefined} /> {percent === null ? '' : `${percent}%`}
        <button disabled={cancelling} onClick={() => { setCancelling(true); void onCancel().catch(() => setCancelling(false)); }}>Annulla importazione</button>
      </div>}
      {error && <p role="alert">{error}</p>}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button ref={close} disabled={busy} onClick={onClose}>Indietro</button>
        <button disabled={busy || chosen.length === 0} onClick={() => onConfirm(chosen)}>Importa {chosen.length} file</button>
      </div>
    </div>
  </div>;
}
