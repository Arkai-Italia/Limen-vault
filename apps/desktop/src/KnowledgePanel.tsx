import React, { useEffect, useState } from 'react';
import { labelIt, MessageIt } from './locale';
import { useTranslation } from './i18n';
import { invoke } from '@tauri-apps/api/core';

const folders: Record<string, string> = {
  all: 'all',
  clients: '01_CLIENTS',
  projects: '02_PROJECTS',
  brands: '03_BRANDS',
  positioning: '04_POSITIONING',
  packaging: '05_PACKAGING_KNOWLEDGE',
  methods: '06_METHODS',
  case_studies: '07_CASE_STUDIES',
  research: '08_MARKET_RESEARCH',
  competitors: '09_COMPETITORS',
  approved_outputs: '10_APPROVED_OUTPUTS',
};

interface Note {
  metadataWarning?: string | null;
  automationKind?: string;
  relativePath: string;
  title: string;
  status: string;
  sha256: string;
  markdown: string;
}

export function KnowledgePanel({ vaultPath, category }: { vaultPath: string; category: string }) {
  const { t, language } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let live = true;
    setBusy(true);
    setError('');
    setNotes([]);
    void invoke<Note[]>('list_knowledge', { vaultPath, folder: folders[category] })
      .then((r) => {
        if (live) setNotes(r);
      })
      .catch((e) => {
        if (live) setError(String(e));
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [vaultPath, category, refresh]);

  return (
    <div className="limen-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            {category === 'all' ? t.memory.allCategories : labelIt(category, language)}
          </h3>
          {category !== 'all' && (
            <code style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'inline-block' }}>
              {folders[category]}
            </code>
          )}
        </div>
        <button
          disabled={busy}
          onClick={() => setRefresh((n) => n + 1)}
          className="limen-btn-secondary"
          style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer' }}
        >
          {t.memory.refreshKnowledge}
        </button>
      </div>

      {busy ? (
        <p role="status" style={{ fontSize: 13, color: '#64748b' }}>
          {t.common.loading}
        </p>
      ) : error ? (
        <p role="alert" style={{ fontSize: 13, color: '#b91c1c' }}>
          <MessageIt value={error} lang={language} />
        </p>
      ) : notes.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: 13, backgroundColor: '#f8fafc', borderRadius: 8 }}>
          {t.memory.noNotes}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map((n) => (
            <details
              key={n.relativePath}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                {n.title} · {labelIt(n.status, language)} · <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{n.relativePath}</span>
              </summary>
              {n.metadataWarning && <p role="status" style={{ fontSize: 12, color: '#92400e' }}>
                {language === 'it' ? 'Metadati della nota non validi. Il contenuto è disponibile e non è stato modificato.' : 'Invalid note metadata. The content is available and has not been changed.'}
                <br /><span>{n.metadataWarning}</span>
              </p>}
              <div style={{ marginTop: 10, fontSize: 11, color: '#64748b', wordBreak: 'break-all' }}>
                SHA-256: <code>{n.sha256}</code>
              </div>
              <pre
                style={{
                  marginTop: 10,
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f8fafc',
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                {n.markdown}
              </pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
