import React, { useState, useEffect, useMemo, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
  File,
  Eye,
  ExternalLink,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HardDrive,
  Info,
  ChevronRight,
  Database,
  ArrowRight,
  FolderTree,
} from 'lucide-react';

export interface VaultFileItem {
  name: string;
  relativePath: string;
  isDir: boolean;
  sizeBytes: number;
  modifiedMs: number;
  extension: string;
}

export interface VaultFolderReport {
  id?: string;
  name?: string;
  path?: string;
  exists: boolean;
  file_count?: number;
  fileCount?: number;
  is_standard?: boolean;
  isStandard?: boolean;
  error?: string | null;
}

export interface VaultFolderFilesReport {
  folder: string;
  exists: boolean;
  files: {
    name: string;
    relative_path?: string;
    relativePath?: string;
    is_dir?: boolean;
    isDir?: boolean;
    size_bytes?: number;
    sizeBytes?: number;
    modified_epoch_ms?: number;
    modifiedEpochMs?: number;
    modified_ms?: number;
    modifiedMs?: number;
    extension?: string;
  }[];
  error?: string | null;
}

export interface VaultFolderItem {
  id: string;
  label: string;
  description: string;
  kind: 'knowledge' | 'raw' | 'proposals' | 'outputs' | 'system' | 'custom';
  exists: boolean;
  fileCount: number;
}

const STATIC_METADATA: Record<string, { label: string; description: string; kind: VaultFolderItem['kind'] }> = {
  '20_RAW_SOURCES': { label: '20_RAW_SOURCES (Originali)', description: 'Documenti e file originali importati (PDF, Word, Excel, TXT, immagini)', kind: 'raw' },
  '01_CLIENTS': { label: '01_CLIENTS (Clienti)', description: 'Note di conoscenza strutturata sui clienti e committenti', kind: 'knowledge' },
  '02_PROJECTS': { label: '02_PROJECTS (Progetti)', description: 'Schede dei progetti, roadmap e avanzamento', kind: 'knowledge' },
  '03_BRANDS': { label: '03_BRANDS (Brand)', description: 'Identità di marca, linee guida e posizionamento brand', kind: 'knowledge' },
  '04_POSITIONING': { label: '04_POSITIONING (Posizionamento)', description: 'Strategie di mercato, target e valore distintivo', kind: 'knowledge' },
  '05_PACKAGING_KNOWLEDGE': { label: '05_PACKAGING_KNOWLEDGE', description: 'Specifiche, materiali e requisiti di confezionamento', kind: 'knowledge' },
  '06_METHODS': { label: '06_METHODS (Metodi)', description: 'Procedure operative, metodologie e standard', kind: 'knowledge' },
  '07_CASE_STUDIES': { label: '07_CASE_STUDIES (Casi Studio)', description: 'Studi di caso, risultati e benchmark', kind: 'knowledge' },
  '08_MARKET_RESEARCH': { label: '08_MARKET_RESEARCH', description: 'Analisi di mercato, report e statistiche di settore', kind: 'knowledge' },
  '09_COMPETITORS': { label: '09_COMPETITORS (Concorrenti)', description: 'Analisi competitiva e monitoraggio concorrenza', kind: 'knowledge' },
  '10_APPROVED_OUTPUTS': { label: '10_APPROVED_OUTPUTS', description: 'Documenti approvati per la consultazione aziendale', kind: 'knowledge' },
  '90_PROPOSALS': { label: '90_PROPOSALS (Proposte)', description: 'Bozze di note e proposte in attesa di revisione o approvazione', kind: 'proposals' },
  '80_AI_OUTPUTS': { label: '80_AI_OUTPUTS (Output AI)', description: 'Sintesi, report ed estratti generati dall’intelligenza artificiale', kind: 'outputs' },
  '00_SYSTEM': { label: '00_SYSTEM (Sistema)', description: 'Regole, manifest e file di configurazione del Vault', kind: 'system' },
  '99_ARCHIVE': { label: '99_ARCHIVE (Archivio)', description: 'Versioni storiche, note archiviate e documenti dismessi', kind: 'system' },
};

export interface VaultPanelProps {
  vaultPath: string;
  onOpenReader: (relativePath: string) => void;
  onRevealInFinder?: (relativePath: string) => Promise<void> | void;
  onNavigateToUpload?: () => void;
  onNavigateToAsk?: () => void;
}

export const VaultPanel: React.FC<VaultPanelProps> = ({
  vaultPath,
  onOpenReader,
  onRevealInFinder,
  onNavigateToUpload,
  onNavigateToAsk,
}) => {
  const fileRequest = useRef(0);
  const folderRequest = useRef(0);
  const [folders, setFolders] = useState<VaultFolderItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('20_RAW_SOURCES');
  const [files, setFiles] = useState<VaultFileItem[]>([]);
  const [folderExists, setFolderExists] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFolders, setLoadingFolders] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<{ path: string; text: string } | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  const previewFile = async (file: VaultFileItem) => {
    if (!['md', 'txt', 'json', 'csv', 'tsv', 'yaml', 'yml'].includes(file.extension)) { onOpenReader(file.relativePath); return; }
    try {
      const text = await invoke<string>('vault_read_text', { vaultPath, relativePath: file.relativePath });
      setTextPreview({ path: file.relativePath, text });
    } catch (e) { setError(String(e)); }
  };

  const loadFolders = async () => {
    if (!vaultPath) return;
    const ticket = ++folderRequest.current;
    setLoadingFolders(true);
    try {
      const reports = await invoke<VaultFolderReport[]>('vault_list_folders', { vaultPath });
      if (ticket !== folderRequest.current) return;
      const mapped: VaultFolderItem[] = reports.map((r) => {
        const folderId = r.id || r.name || '';
        const count = r.fileCount ?? r.file_count ?? 0;
        const meta = STATIC_METADATA[folderId] || {
          label: folderId,
          description: `Cartella ${folderId} sul disco del Vault`,
          kind: 'custom' as const,
        };
        return {
          id: folderId,
          label: meta.label,
          description: meta.description,
          kind: meta.kind,
          exists: r.exists,
          fileCount: count,
        };
      });
      setFolders(mapped);
    } catch (e: any) {
      if (ticket === folderRequest.current) {
        setFolders([]);
        setError(`Impossibile leggere le cartelle: ${String(e)}`);
      }
    } finally {
      if (ticket === folderRequest.current) setLoadingFolders(false);
    }
  };

  const loadFolderFiles = async (folderName: string) => {
    const ticket = ++fileRequest.current;
    setLoading(true);
    setError(null);
    setRevealError(null);
    try {
      const rep = await invoke<VaultFolderFilesReport>('vault_list_folder_files', {
        vaultPath,
        folder: folderName,
      });

      if (ticket !== fileRequest.current) return;
      setFolderExists(rep.exists);
      if (rep.error) {
        setError(`Errore durante l'accesso a ${folderName}: ${rep.error}`);
      }

      const formatted: VaultFileItem[] = (rep.files || []).map((it) => ({
        name: it.name,
        relativePath: it.relativePath || it.relative_path || it.name,
        isDir: Boolean(it.isDir ?? it.is_dir),
        sizeBytes: Number(it.sizeBytes ?? it.size_bytes ?? 0),
        modifiedMs: Number(it.modifiedMs ?? it.modified_ms ?? it.modifiedEpochMs ?? it.modified_epoch_ms ?? 0),
        extension: String(it.extension || (it.name ? it.name.split('.').pop() : '')).toLowerCase(),
      }));

      setFiles(formatted);
      // Aggiorna anche il conteggio nella lista cartelle se a livello radice
      if (!folderName.includes('/')) {
        setFolders((prev) =>
          prev.map((f) => (f.id === folderName ? { ...f, fileCount: formatted.length, exists: rep.exists } : f))
        );
      }
    } catch (e: any) {
      if (ticket !== fileRequest.current) return;
      setError(`Impossibile leggere la cartella ${folderName}: ${e?.message || String(e)}`);
      setFolderExists(false);
      setFiles([]);
    } finally {
      if (ticket === fileRequest.current) setLoading(false);
    }
  };

  // Caricamento cartelle all'avvio o cambio vault
  useEffect(() => {
    if (vaultPath) {
      void loadFolders();
    }
    return () => { folderRequest.current += 1; };
  }, [vaultPath]);

  // Caricamento file al cambio cartella
  useEffect(() => {
    if (vaultPath) {
      void loadFolderFiles(selectedFolder);
    }
    return () => { fileRequest.current += 1; };
  }, [vaultPath, selectedFolder]);

  const activeFolderMeta = useMemo(() => {
    const found = folders.find((f) => f.id === selectedFolder);
    if (found) return found;
    const staticMeta = STATIC_METADATA[selectedFolder] || {
      label: selectedFolder,
      description: `Cartella ${selectedFolder}`,
      kind: 'custom' as const,
    };
    return {
      id: selectedFolder,
      label: staticMeta.label,
      description: staticMeta.description,
      kind: staticMeta.kind,
      exists: folderExists,
      fileCount: files.length,
    };
  }, [selectedFolder, folders, folderExists, files.length]);

  const handleReveal = async (relPath: string) => {
    setRevealError(null);
    try {
      if (onRevealInFinder) {
        await onRevealInFinder(relPath);
      } else {
        await invoke('vault_reveal_path', { vaultPath, target: relPath });
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      setRevealError(`Impossibile mostrare nel Finder: ${msg}`);
    }
  };

  const filteredFiles = useMemo(() => {
    if (!filterQuery.trim()) return files;
    const q = filterQuery.toLowerCase();
    return files.filter(
      (f) => f.name.toLowerCase().includes(q) || f.relativePath.toLowerCase().includes(q)
    );
  }, [files, filterQuery]);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (ext: string, isDir?: boolean) => {
    if (isDir) {
      return <Folder size={18} color="#f59e0b" />;
    }
    switch (ext) {
      case 'md':
        return <FileCode size={18} color="#6366f1" />;
      case 'pdf':
        return <FileText size={18} color="#ef4444" />;
      case 'doc':
      case 'docx':
        return <FileText size={18} color="#2563eb" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet size={18} color="#16a34a" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return <FileImage size={18} color="#d97706" />;
      default:
        return <File size={18} color="#64748b" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {textPreview && <div role="dialog" aria-modal="true" aria-label="Anteprima file" style={{ position: 'fixed', inset: 30, zIndex: 10000, background: 'white', border: '1px solid #cbd5e1', borderRadius: 12, padding: 24, overflow: 'auto' }}>
        <button autoFocus onClick={() => setTextPreview(null)}>Chiudi anteprima</button>
        <h3>{textPreview.path}</h3>
        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{textPreview.text}</pre>
      </div>}
      {/* HEADER BANNER */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <FolderTree size={20} color="var(--limen-lime)" />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
              Esploratore Cartelle Vault
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
            Naviga nella struttura reale del Vault sul disco. Visualizza sia i documenti originali (RAW) sia le note Markdown categorizzate, le proposte e gli output dell’AI.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { void loadFolders(); void loadFolderFiles(selectedFolder); }}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCw size={14} className={loading ? 'spin' : ''} />
            <span>Aggiorna</span>
          </button>

          {onNavigateToUpload && (
            <button
              onClick={onNavigateToUpload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                backgroundColor: 'var(--limen-lime)',
                color: '#0f172a',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>+ Carica File</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN EXPLORER: SIDEBAR CARTELLE + TABELLA FILE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 16,
          minHeight: 520,
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--limen-border-light)',
          overflow: 'hidden',
        }}
      >
        {/* COLONNA SINISTRA: ELENCO CARTELLE REALI */}
        <div
          style={{
            borderRight: '1px solid var(--limen-border-light)',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '12px 8px',
          }}
        >
          <div style={{ padding: '4px 12px 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
            Cartelle del Vault
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {folders.map((f) => {
              const isSelected = selectedFolder === f.id;
              const count = f.fileCount;

              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolder(f.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? '#0f172a' : f.exists ? '#475569' : '#94a3b8',
                    boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    opacity: f.exists ? 1 : 0.75,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    {isSelected ? (
                      <FolderOpen size={16} color="var(--limen-lime-dark, #4d7c0f)" />
                    ) : (
                      <Folder size={16} color={f.exists ? '#94a3b8' : '#cbd5e1'} />
                    )}
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {f.id}
                    </span>
                    {!f.exists && (
                      <span
                        style={{
                          fontSize: 9.5,
                          padding: '1px 5px',
                          borderRadius: 4,
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        assente
                      </span>
                    )}
                  </div>

                  {f.exists && typeof count === 'number' && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 10,
                        backgroundColor: isSelected ? '#0f172a' : '#e2e8f0',
                        color: isSelected ? '#ffffff' : '#475569',
                        fontSize: 10.5,
                        fontWeight: 700,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* COLONNA DESTRA: CONTENUTO CARTELLA */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* BARRA INFORMATIVA CARTELLA SELEZIONATA + FILTRO */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--limen-border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {activeFolderMeta.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: activeFolderMeta.kind === 'raw' ? '#fef3c7' : activeFolderMeta.kind === 'knowledge' ? '#e0e7ff' : '#f1f5f9',
                    color: activeFolderMeta.kind === 'raw' ? '#92400e' : activeFolderMeta.kind === 'knowledge' ? '#3730a3' : '#334155',
                    fontWeight: 600,
                  }}
                >
                  {activeFolderMeta.kind === 'raw' ? 'Originali RAW' : activeFolderMeta.kind === 'knowledge' ? 'Note Conoscenza' : activeFolderMeta.kind === 'proposals' ? 'Proposte' : activeFolderMeta.kind === 'outputs' ? 'Output AI' : 'Cartella'}
                </span>
                {!folderExists && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      fontWeight: 700,
                    }}
                  >
                    Non presente sul disco
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {activeFolderMeta.description}
              </div>

              {/* Breadcrumb navigazione sottocartelle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 8, color: '#64748b', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Percorso:</span>
                {selectedFolder.split('/').map((crumb, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  const pathToCrumb = arr.slice(0, idx + 1).join('/');
                  return (
                    <React.Fragment key={pathToCrumb}>
                      {idx > 0 && <span style={{ color: '#cbd5e1' }}>/</span>}
                      {isLast ? (
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{crumb}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedFolder(pathToCrumb)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: '#3b82f6',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: 12,
                          }}
                        >
                          {crumb}
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
                {selectedFolder.includes('/') && (
                  <button
                    type="button"
                    onClick={() => {
                      const parts = selectedFolder.split('/');
                      setSelectedFolder(parts.slice(0, -1).join('/'));
                    }}
                    style={{
                      marginLeft: 8,
                      padding: '2px 8px',
                      borderRadius: 4,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9',
                      fontSize: 11,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    ← Livello superiore
                  </button>
                )}
              </div>
            </div>

            {/* FILTRO VELOCE */}
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
              <input
                type="text"
                placeholder="Filtra file..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* LISTA / TABELLA DEI FILE */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {revealError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  fontSize: 12.5,
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Info size={16} color="#d97706" />
                <span>{revealError}</span>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {!folderExists && !loading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  color: '#64748b',
                  backgroundColor: '#fef2f2',
                  borderRadius: 10,
                  border: '1px dashed #fca5a5',
                }}
              >
                <Folder size={36} color="#ef4444" style={{ marginBottom: 12 }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 700, color: '#991b1b' }}>
                  Cartella non presente su disco
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: '#7f1d1d', maxWidth: 460, marginInline: 'auto' }}>
                  La cartella <code>{selectedFolder}</code> non esiste attualmente all'interno del percorso del Vault selezionato. Verrà creata automaticamente non appena verranno salvati contenuti corrispondenti.
                </p>
              </div>
            )}

            {!error && folderExists && filteredFiles.length === 0 && !loading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  borderRadius: 10,
                  border: '1px dashed #cbd5e1',
                }}
              >
                <Folder size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {filterQuery ? 'Nessun file corrisponde al filtro' : 'Cartella vuota'}
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', maxWidth: 420, marginInline: 'auto' }}>
                  {activeFolderMeta.kind === 'raw'
                    ? 'Trascina o carica qui i documenti (PDF, Word, Excel, TXT) per iniziare a costruire la conoscenza del Vault.'
                    : 'Le note in questa cartella vengono prodotte dalla classificazione e compilazione delle fonti o scritte in formato Markdown.'}
                </p>
              </div>
            )}

            {filteredFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredFiles.map((file) => (
                  <div
                    key={file.relativePath}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      {getFileIcon(file.extension, file.isDir)}
                      <div
                        style={{ minWidth: 0, overflow: 'hidden', cursor: file.isDir ? 'pointer' : 'default' }}
                        onClick={() => file.isDir && setSelectedFolder(file.relativePath)}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: file.isDir ? 700 : 600,
                            color: file.isDir ? '#1d4ed8' : '#0f172a',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {file.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#64748b',
                            fontFamily: 'monospace',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {file.relativePath}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, marginLeft: 16 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {file.isDir ? 'Cartella' : formatBytes(file.sizeBytes)}
                      </span>

                      <div style={{ display: 'flex', gap: 6 }}>
                        {file.isDir ? (
                          <button
                            type="button"
                            onClick={() => setSelectedFolder(file.relativePath)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#f8fafc',
                              color: '#0f172a',
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Apri sottocartella"
                          >
                            <FolderOpen size={13} color="#f59e0b" />
                            <span>Apri</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void previewFile(file)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Apri nel lettore integrato"
                          >
                            <Eye size={13} />
                            <span>Anteprima</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void handleReveal(file.relativePath)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 8px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#64748b',
                            fontSize: 11.5,
                            cursor: 'pointer',
                          }}
                          title="Rivela nel Finder / File Explorer"
                        >
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultPanel;
