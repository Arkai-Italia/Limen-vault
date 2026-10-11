import React, { useState, useEffect, useMemo } from 'react';
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

export interface VaultFolderItem {
  id: string;
  label: string;
  description: string;
  kind: 'knowledge' | 'raw' | 'proposals' | 'outputs' | 'system';
}

const VAULT_FOLDERS: VaultFolderItem[] = [
  { id: '20_RAW_SOURCES', label: '20_RAW_SOURCES (Originali)', description: 'Documenti e file originali importati (PDF, Word, Excel, TXT, immagini)', kind: 'raw' },
  { id: '01_CLIENTS', label: '01_CLIENTS (Clienti)', description: 'Note di conoscenza strutturata sui clienti e committenti', kind: 'knowledge' },
  { id: '02_PROJECTS', label: '02_PROJECTS (Progetti)', description: 'Schede dei progetti, roadmap e avanzamento', kind: 'knowledge' },
  { id: '03_BRANDS', label: '03_BRANDS (Brand)', description: 'Identità di marca, linee guida e posizionamento brand', kind: 'knowledge' },
  { id: '04_POSITIONING', label: '04_POSITIONING (Posizionamento)', description: 'Strategie di mercato, target e valore distintivo', kind: 'knowledge' },
  { id: '05_PACKAGING_KNOWLEDGE', label: '05_PACKAGING_KNOWLEDGE', description: 'Specifiche, materiali e requisiti di confezionamento', kind: 'knowledge' },
  { id: '06_METHODS', label: '06_METHODS (Metodi)', description: 'Procedure operative, metodologie e standard', kind: 'knowledge' },
  { id: '07_CASE_STUDIES', label: '07_CASE_STUDIES (Casi Studio)', description: 'Studi di caso, risultati e benchmark', kind: 'knowledge' },
  { id: '08_MARKET_RESEARCH', label: '08_MARKET_RESEARCH', description: 'Analisi di mercato, report e statistiche di settore', kind: 'knowledge' },
  { id: '09_COMPETITORS', label: '09_COMPETITORS (Concorrenti)', description: 'Analisi competitiva e monitoraggio concorrenza', kind: 'knowledge' },
  { id: '10_APPROVED_OUTPUTS', label: '10_APPROVED_OUTPUTS', description: 'Documenti approvati per la consultazione aziendale', kind: 'knowledge' },
  { id: '90_PROPOSALS', label: '90_PROPOSALS (Proposte)', description: 'Bozze di note e proposte in attesa di revisione o approvazione', kind: 'proposals' },
  { id: '80_AI_OUTPUTS', label: '80_AI_OUTPUTS (Output AI)', description: 'Sintesi, report ed estratti generati dall’intelligenza artificiale', kind: 'outputs' },
];

export interface VaultPanelProps {
  vaultPath: string;
  onOpenReader: (relativePath: string) => void;
  onRevealInFinder?: (relativePath: string) => void;
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
  const [selectedFolder, setSelectedFolder] = useState<string>('20_RAW_SOURCES');
  const [files, setFiles] = useState<VaultFileItem[]>([]);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  const loadFolderFiles = async (folderName: string) => {
    setLoading(true);
    setError(null);
    try {
      // Invocazione comando Tauri IPC o fallback a scansione compatibile
      const items = await invoke<any[]>('vault_list_folder_files', {
        vaultPath,
        folder: folderName,
      }).catch(async () => {
        // Fallback tramite catalog o knowledge se il nuovo comando è ancora in compilazione
        if (folderName === '20_RAW_SOURCES') {
          const raw = await invoke<any[]>('list_raw_sources', { vaultPath }).catch(() => []);
          return raw.map((r: any) => ({
            name: r.relative_path.split('/').pop() || r.relative_path,
            relativePath: r.relative_path,
            isDir: false,
            sizeBytes: r.size_bytes || 0,
            modifiedMs: r.modified_epoch_ms || 0,
            extension: (r.relative_path.split('.').pop() || '').toLowerCase(),
          }));
        } else {
          const kn = await invoke<any[]>('list_knowledge', { vaultPath, folder: folderName }).catch(() => []);
          return kn.map((k: any) => ({
            name: (k.relativePath || '').split('/').pop() || k.title,
            relativePath: k.relativePath,
            isDir: false,
            sizeBytes: (k.markdown || '').length,
            modifiedMs: Date.now(),
            extension: 'md',
          }));
        }
      });

      const formatted: VaultFileItem[] = (items || []).map((it: any) => ({
        name: it.name || it.relative_path || it.relativePath || '',
        relativePath: it.relative_path || it.relativePath || it.name || '',
        isDir: Boolean(it.is_dir || it.isDir),
        sizeBytes: Number(it.size_bytes || it.sizeBytes || 0),
        modifiedMs: Number(it.modified_ms || it.modifiedMs || 0),
        extension: String(it.extension || (it.name ? it.name.split('.').pop() : '')).toLowerCase(),
      }));

      setFiles(formatted);
      setFolderCounts((prev) => ({ ...prev, [folderName]: formatted.length }));
    } catch (e: any) {
      setError(`Impossibile leggere la cartella ${folderName}: ${e?.message || String(e)}`);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Caricamento iniziale e al cambio di cartella
  useEffect(() => {
    if (vaultPath && selectedFolder) {
      void loadFolderFiles(selectedFolder);
    }
  }, [vaultPath, selectedFolder]);

  // Aggiorna i conteggi di tutte le cartelle in background
  useEffect(() => {
    let cancelled = false;
    const fetchAllCounts = async () => {
      for (const f of VAULT_FOLDERS) {
        if (cancelled) break;
        try {
          if (f.id === '20_RAW_SOURCES') {
            const raw = await invoke<any[]>('list_raw_sources', { vaultPath }).catch(() => []);
            if (!cancelled) setFolderCounts((p) => ({ ...p, [f.id]: raw.length }));
          } else if (f.kind === 'knowledge') {
            const kn = await invoke<any[]>('list_knowledge', { vaultPath, folder: f.id }).catch(() => []);
            if (!cancelled) setFolderCounts((p) => ({ ...p, [f.id]: kn.length }));
          }
        } catch (_) {}
      }
    };
    if (vaultPath) void fetchAllCounts();
    return () => { cancelled = true; };
  }, [vaultPath]);

  const activeFolderMeta = useMemo(() => {
    return VAULT_FOLDERS.find((f) => f.id === selectedFolder) || VAULT_FOLDERS[0];
  }, [selectedFolder]);

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

  const getFileIcon = (ext: string) => {
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
            onClick={() => void loadFolderFiles(selectedFolder)}
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
            {VAULT_FOLDERS.map((f) => {
              const isSelected = selectedFolder === f.id;
              const count = folderCounts[f.id];

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
                    color: isSelected ? '#0f172a' : '#475569',
                    boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    {isSelected ? (
                      <FolderOpen size={16} color="var(--limen-lime-dark, #4d7c0f)" />
                    ) : (
                      <Folder size={16} color="#94a3b8" />
                    )}
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {f.id}
                    </span>
                  </div>

                  {typeof count === 'number' && (
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
                  {activeFolderMeta.kind === 'raw' ? 'Originali RAW' : activeFolderMeta.kind === 'knowledge' ? 'Note Conoscenza' : 'Bozze / Output'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {activeFolderMeta.description}
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

            {filteredFiles.length === 0 && !loading && (
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
                  Nessun file presente in questa cartella
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
                      {getFileIcon(file.extension)}
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#0f172a',
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
                        {formatBytes(file.sizeBytes)}
                      </span>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => onOpenReader(file.relativePath)}
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

                        {onRevealInFinder && (
                          <button
                            onClick={() => onRevealInFinder(file.relativePath)}
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
                        )}
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
