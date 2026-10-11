import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge.js';

export interface VaultStatusBannerProps {
  status: 'READY' | 'INITIALIZING' | 'INVALID' | 'NO_VAULT' | 'STALE_SNAPSHOT';
  vaultName?: string | null;
  vaultPath?: string | null;
  pageCount?: number;
  onOpenObsidian?: () => void;
  obsidianAvailable?: boolean;
  dismissible?: boolean;
}

export const VaultStatusBanner: React.FC<VaultStatusBannerProps> = ({
  status,
  vaultName,
  vaultPath,
  pageCount = 0,
  onOpenObsidian,
  obsidianAvailable = true,
  dismissible = false,
}) => {
  const storageKey = `limen.vault-banner-hidden.v1:${vaultPath || ''}`;
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(storageKey) === 'true'; } catch { return false; }
  });
  if (dismissible && hidden) return null;
  return (
    <div
      className="limen-card"
      style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <StatusBadge status={status} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--limen-text-primary)' }}>
            {vaultName || 'Nessun Vault aperto'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--limen-text-muted)', marginTop: 2 }}>
            {vaultPath ? vaultPath : 'Seleziona o crea una cartella Vault locale'} • {pageCount} File Markdown
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {onOpenObsidian && (
        <button
          onClick={onOpenObsidian}
          disabled={!obsidianAvailable || status === 'NO_VAULT'}
          title={!obsidianAvailable ? 'Obsidian non rilevato su questo Mac' : 'Apri il Vault in Obsidian'}
          style={{
            backgroundColor: 'transparent',
            color: obsidianAvailable ? 'var(--limen-text-primary)' : 'var(--limen-text-muted)',
            border: '1px solid var(--limen-border-light)',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            cursor: obsidianAvailable ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>Apri in Obsidian</span>
          {!obsidianAvailable && <span style={{ fontSize: 10, color: '#e11d48' }}>(Non disponibile)</span>}
        </button>
      )}
      {dismissible && <button type="button" aria-label="Nascondi informazioni Vault" title="Nascondi informazioni Vault"
        onClick={() => {
          setHidden(true);
          try { localStorage.setItem(storageKey, 'true'); } catch { /* Session-only when storage is unavailable. */ }
        }}
        style={{ border: 0, background: 'transparent', color: 'var(--limen-text-muted)', fontSize: 24, cursor: 'pointer', padding: '4px 8px' }}>×</button>}
      </div>
    </div>
  );
};
