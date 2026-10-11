import React from 'react';
import type { PendingDestination } from './organization';
export function OrganizationReview({ items, folders, choices, onChange, disabled }: {
  items: PendingDestination[]; folders: string[]; choices: Record<string, string>;
  onChange: (id: string, destination: string) => void; disabled: boolean;
}) {
  if (!items.length) return null;
  return <section aria-label="Destinazioni da confermare" style={{ marginBottom: 16, maxHeight: 280, overflowY: 'auto' }}>
    <h4>Conferma le destinazioni</h4>
    <p>I documenti qui sotto restano in RAW finché scegli una cartella.</p>
    {items.length > 1 && <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
      Applica una cartella a tutti questi documenti
      <select aria-label="Destinazione per tutti" value="" disabled={disabled} onChange={e => { if (e.target.value) items.forEach(({ document: doc }) => onChange(doc.documentId, e.target.value)); }}>
        <option value="">Scegli una cartella per tutti…</option>
        {folders.map(folder => <option key={folder} value={folder}>{folder}</option>)}
      </select>
    </label>}
    {items.map(({ document: doc, reason }) => <div key={doc.documentId} style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
      <label style={{ display: 'grid', gap: 6 }}><strong>{doc.fileName}</strong>
        <select aria-label={`Destinazione per ${doc.fileName}`} value={choices[doc.documentId] || ''} disabled={disabled} onChange={e => onChange(doc.documentId, e.target.value)}>
          <option value="">Scegli una cartella…</option>
          {folders.map(folder => <option key={folder} value={folder}>{folder}</option>)}
        </select>
      </label>
      <small>{reason}</small>
    </div>)}
  </section>;
}
