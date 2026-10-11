import { useCatalogDocuments } from './useCatalogDocuments';
import { useNativeFileDrop } from './useNativeFileDrop';
import { runIndexing } from './indexing';
import {AutomationPanel,useAutomation} from './AutomationPanel';
import {labelIt, MessageIt} from './locale';
import {LanguageToggle, useTranslation} from './i18n';
import {KnowledgePanel} from './KnowledgePanel';
import {ProposalPanel} from './ProposalPanel';
import {SyncPanel} from './SyncPanel';
import {HelpPanel} from './HelpPanel';
import {normalizeVaultPath, getPlatformTerms} from './platform';
import {aiIpc, type AiSource} from './ai-ipc';
import {AiPanel, AiSettings, type ConversationTurnItem} from './AiPanel';
import { DocumentReaderModal } from './DocumentReaderModal';
import { SourceDetailsModal, type TechnicalDetails } from './SourceDetailsModal';
import { historyIpc, type HistoryEntry, type HistoryEntryHeader } from './history-ipc';
import { formatLocalDate } from './AiHistoryDrawer';
import { cleanTitle } from './source-utils';
import icLimenVault from './assets/ic-limenvault.png';
import limenWordmark from './assets/limenvault-logo.png';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LimenAiIcon } from './LimenAiIcon';
import { VaultPanel } from './VaultPanel';
import { IndexingPromptModal } from './IndexingPromptModal';
import { SetupWizardModal } from './SetupWizardModal';
import { createLatestRequest } from './latest-request';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import {
  createVaultIpc,
  type VaultIntegrityReportResponse,
  type SnapshotItemResponse,
  type RawSourceItem,
  type ProposalItem,
  type BatchCompilerReport,
  type SearchResultItem,
  type IndexStatusReport,
  type CatalogSummary,
  type DocumentRecord,
  type SnapshotRestoreReport,
  type EmbeddingsStatusReport,
} from './vault-ipc';
import {
  StatusBadge,
  MetricCard,
  EmptyState,
  VaultStatusBanner,
} from '@limen-vault/ui';
import {
  Home,
  MessageSquare,
  BookOpen,
  FolderArchive,
  Search,
  Sparkles,
  FileCheck,
  History,
  Activity,
  Settings,
  PlusCircle,
  FolderOpen,
  ExternalLink,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Cloud,
  ChevronRight,
  ChevronDown,
  RotateCw,
  HelpCircle,
  Upload,
  FileText,
  FileSpreadsheet,
  Layers,
  Sliders,
  Download,
  Check,
  Trash2,
  Lock,
  Compass,
  SlidersHorizontal,
  FolderTree,
  Info,
} from 'lucide-react';

type NavTab =
  | 'ask'
  | 'documents'
  | 'vault'
  | 'memory'
  | 'advanced'
  | 'home'
  | 'knowledge'
  | 'sources'
  | 'search'
  | 'outputs'
  | 'proposals'
  | 'snapshots'
  | 'transfers'
  | 'system'
  | 'help'
  | 'settings';

export default function App() {
  const { t, language } = useTranslation();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [vaultLoaded, setVaultLoaded] = useState<boolean>(false);
  const [vaultState, setVaultState] = useState<'READY' | 'INITIALIZING' | 'INVALID' | 'NO_VAULT' | 'NOT_ACCESSIBLE' | 'INCOMPLETE'>('NO_VAULT');
  const [customPathInput, setCustomPathInput] = useState<string>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem('limen_last_vault_path') || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const terms = getPlatformTerms();
  const [vaultPath, setVaultPath] = useState<string | null>(null);
  useEffect(() => { void aiIpc.mcpStop().catch(() => {}); void aiIpc.tunnelStop().catch(() => {}); }, [vaultPath]);
  const automation=useAutomation(vaultLoaded&&vaultState==='READY'?vaultPath:null);
  const [vaultName, setVaultName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [sourceCount, setSourceCount] = useState<number>(0);
  const [proposalCount, setProposalCount] = useState<number>(0);
  const [integrityStatus, setIntegrityStatus] = useState<'valid' | 'corrupted' | 'unverified'>('unverified');
  const [integrityReport, setIntegrityReport] = useState<VaultIntegrityReportResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [obsidianAvailable, setObsidianAvailable] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isTauriEnv, setIsTauriEnv] = useState<boolean>(false);
  const [setupWizardOpen, setSetupWizardOpen] = useState<boolean>(false);
  const [snapshotNoteInput, setSnapshotNoteInput] = useState<string>('');

  const [snapshotsList, setSnapshotsList] = useState<SnapshotItemResponse[]>([]);
  const [rawSourcesList, setRawSourcesList] = useState<RawSourceItem[]>([]);
  const [proposalsList, setProposalsList] = useState<ProposalItem[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalItem | null>(null);
  const [lastBatchReport, setLastBatchReport] = useState<BatchCompilerReport | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchClient,setSearchClient]=useState('');
  const [searchProject,setSearchProject]=useState('');
  const [searchTags,setSearchTags]=useState('');
  const [searchStatusFilter,setSearchStatusFilter]=useState('');
  const [searchLoading,setSearchLoading]=useState(false);
  const [searchRevision,setSearchRevision]=useState(0);
  const searchRequest=useRef(createLatestRequest<{status:IndexStatusReport,results:SearchResultItem[]}>()).current;
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchIndexStatus, setSearchIndexStatus] = useState<IndexStatusReport | null>(null);

  // Unified Catalog and 3-Area State
  const [catalogSummary, setCatalogSummary] = useState<CatalogSummary | null>(null);
  const [catalogRevision, setCatalogRevision] = useState(0);
  const [catalogFilterFormat, setCatalogFilterFormat] = useState<string>('all');
  const [catalogFilterStatus, setCatalogFilterStatus] = useState<string>('all');
  const [catalogSearchText, setCatalogSearchText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [advancedTab, setAdvancedTab] = useState<'proposals' | 'snapshots' | 'transfers' | 'settings' | 'system' | 'help' | 'compiler'>('settings');
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // Document Reader Modal state
  const [readerOpen, setReaderOpen] = useState<boolean>(false);
  const [readerTarget, setReaderTarget] = useState<string | null>(null);
  const [readerPassageId, setReaderPassageId] = useState<string | undefined>(undefined);
  const [readerExpectedRevision, setReaderExpectedRevision] = useState<number | undefined>(undefined);
  const [readerExpectedHash, setReaderExpectedHash] = useState<string | undefined>(undefined);
  const [readerQuery, setReaderQuery] = useState<string | undefined>(undefined);
  const [useSemanticSearch, setUseSemanticSearch] = useState<boolean>(true);
  const [searchDegraded, setSearchDegraded] = useState<boolean>(false);
  const [searchProvider, setSearchProvider] = useState<'local' | 'openai'>('local');
  const [localServerHealthy, setLocalServerHealthy] = useState<boolean | null>(null);

  // FASE 6b: Storico e Fonti integrati nella barra laterale sinistra
  const [historyEntries, setHistoryEntries] = useState<HistoryEntryHeader[]>([]);
  const [archivedConversation, setArchivedConversation] = useState<{
    conversationId: string;
    turns: ConversationTurnItem[];
  } | null>(null);
  const [selectedTurnIndex, setSelectedTurnIndex] = useState<number>(0);
  const [selectedTurnItem, setSelectedTurnItem] = useState<ConversationTurnItem | null>(null);
  const [sourcesSidebarOpen, setSourcesSidebarOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSingleSource, setModalSingleSource] = useState<AiSource | null>(null);
  const [newConversationTrigger, setNewConversationTrigger] = useState<number>(0);

  // Richieste UI/UX per AG: Chat pulita, auto-indicizzazione e navigazione contestuale
  const [showManualSearch, setShowManualSearch] = useState<boolean>(false);
  const [showIndexingPrompt, setShowIndexingPrompt] = useState<boolean>(false);
  const [importedFilesList, setImportedFilesList] = useState<string[]>([]);
  const [isAutoIndexing, setIsAutoIndexing] = useState<boolean>(false);
  const [autoIndexStep, setAutoIndexStep] = useState<string | null>(null);
  const [autoIndexPercent, setAutoIndexPercent] = useState<number>(0);
  const [hasPendingIndexing, setHasPendingIndexing] = useState<boolean>(false);
  const [settingsGuideMessage, setSettingsGuideMessage] = useState<string | null>(null);
  const [settingsTargetSection, setSettingsTargetSection] = useState<'local' | 'semantic' | 'llm' | 'keys' | 'models' | 'api' | 'general'>('general');

  const refreshHistory = async () => {
    if (!vaultPath) {
      setHistoryEntries([]);
      return;
    }
    try {
      const list = await historyIpc.list(vaultPath);
      setHistoryEntries(list);
    } catch (e) {
      console.error('Errore caricamento storico:', e);
    }
  };

  useEffect(() => {
    void refreshHistory();
  }, [vaultPath]);

  function historyEntryToTurnItem(entry: HistoryEntry): ConversationTurnItem {
    const sources: AiSource[] = (entry.sources || []).map(s => ({
      documentId: s.documentId,
      relativePath: s.relativePath,
      title: s.title,
      locator: s.locator,
      category: s.relativePath.startsWith('01_CLIENTS') ? 'client' :
                s.relativePath.startsWith('02_PROJECTS') ? 'project' :
                s.relativePath.startsWith('20_RAW_SOURCES') ? 'source' : 'note',
      revision: 1,
      sha256: s.docSha256,
      content: '',
      passageId: s.passages?.[0]?.passageId,
      passageHashes: s.passages?.map(p => [p.passageId, p.passageSha256]),
    }));

    const citations = (entry.sources || [])
      .filter(s => s.cited)
      .map(s => ({
        documentId: s.documentId,
        relativePath: s.relativePath,
        title: s.title,
        category: s.relativePath.startsWith('01_CLIENTS') ? 'client' :
                  s.relativePath.startsWith('02_PROJECTS') ? 'project' :
                  s.relativePath.startsWith('20_RAW_SOURCES') ? 'source' : 'note',
        sha256: s.docSha256,
        locator: s.locator,
        passageId: s.passages?.[0]?.passageId,
      }));

    return {
      id: entry.id,
      prompt: entry.prompt,
      answer: {
        answer: entry.answer,
        provider: 'OpenAI',
        model: entry.responseModel || entry.requestedModel,
        status: entry.status,
        citations,
        uiTotalMs: entry.durationMs,
        historyEntryId: entry.id,
        turnIndex: entry.turnIndex,
        conversationId: entry.conversationId,
      },
      previewData: {
        ticket: '',
        sources,
        contextBytes: 0,
        semanticUsed: true,
      },
      sourcesOpen: false,
      techDetailsOpen: false,
    };
  }

  const conversationGroups = useMemo(() => {
    const map = new Map<string, HistoryEntryHeader[]>();
    for (const entry of historyEntries) {
      const list = map.get(entry.conversationId) || [];
      list.push(entry);
      map.set(entry.conversationId, list);
    }
    const groups: { conversationId: string; latestCreatedAtUtc: string; turns: HistoryEntryHeader[] }[] = [];
    for (const [conversationId, turns] of map.entries()) {
      turns.sort((a, b) => a.turnIndex - b.turnIndex);
      const latest = turns.reduce(
        (max, t) => (t.createdAtUtc > max ? t.createdAtUtc : max),
        turns[0].createdAtUtc
      );
      groups.push({ conversationId, latestCreatedAtUtc: latest, turns });
    }
    groups.sort((a, b) => b.latestCreatedAtUtc.localeCompare(a.latestCreatedAtUtc));
    return groups;
  }, [historyEntries]);

  const handleSelectArchivedConversation = async (group: { conversationId: string; latestCreatedAtUtc: string; turns: HistoryEntryHeader[] }) => {
    if (!vaultPath) return;
    try {
      const turnsData = await Promise.all(
        group.turns.map(t => historyIpc.get(vaultPath, t.id))
      );
      const turnItems = turnsData.map(historyEntryToTurnItem);
      setArchivedConversation({
        conversationId: group.conversationId,
        turns: turnItems,
      });
      setCurrentTab('ask');
      setSelectedTurnIndex(turnItems.length - 1);
    } catch (err) {
      console.error('Errore apertura conversazione archiviata:', err);
    }
  };

  const handleNewConversation = () => {
    setArchivedConversation(null);
    setCurrentTab('ask');
    setNewConversationTrigger(Date.now());
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vaultPath) return;
    const group = conversationGroups.find(g => g.conversationId === conversationId);
    if (!group) return;
    try {
      await Promise.all(group.turns.map(t => historyIpc.delete(vaultPath, t.id)));
      if (archivedConversation?.conversationId === conversationId) {
        setArchivedConversation(null);
      }
      await refreshHistory();
    } catch (err) {
      console.error('Errore eliminazione conversazione:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!vaultPath) return;
    const confirmed = window.confirm('Sei sicuro di voler svuotare tutto lo storico delle domande di questo vault?');
    if (!confirmed) return;
    try {
      await historyIpc.clear(vaultPath);
      setArchivedConversation(null);
      await refreshHistory();
    } catch (err) {
      console.error('Errore svuotamento storico:', err);
    }
  };

  const selectedTurnSources = selectedTurnItem?.previewData?.sources || [];
  const selectedTurnCitedCount = useMemo(() => {
    if (!selectedTurnItem?.answer?.citations) return 0;
    return selectedTurnSources.filter(s =>
      selectedTurnItem.answer.citations.some(c => c.documentId === s.documentId || c.relativePath === s.relativePath)
    ).length;
  }, [selectedTurnItem, selectedTurnSources]);

  const selectedTechnicalDetails: TechnicalDetails | null = useMemo(() => {
    if (!selectedTurnItem) return null;
    return {
      uiTotalMs: selectedTurnItem.answer.uiTotalMs,
      tokensUsed: selectedTurnItem.answer.tokensUsed,
      tokensPrompt: selectedTurnItem.answer.tokensPrompt,
      tokensCompletion: selectedTurnItem.answer.tokensCompletion,
      tokensReasoning: selectedTurnItem.answer.tokensReasoning,
      model: selectedTurnItem.answer.model,
      provider: selectedTurnItem.answer.provider,
      status: selectedTurnItem.answer.status,
      incomplete: selectedTurnItem.answer.incomplete,
      incompleteReason: selectedTurnItem.answer.incompleteReason,
      semanticUsed: selectedTurnItem.answer.semanticUsed ?? selectedTurnItem.previewData?.semanticUsed,
      semanticFallbackReason: selectedTurnItem.answer.semanticFallbackReason ?? selectedTurnItem.previewData?.semanticFallbackReason,
      rawCitations: selectedTurnItem.answer.citations,
    };
  }, [selectedTurnItem]);

  useEffect(() => {
    let unlistenStatus: (() => void) | undefined;
    let unlistenNav: (() => void) | undefined;

    void listen<{ provider: 'local' | 'openai'; degraded: boolean; is_local: boolean }>('search_mode_status', (e) => {
      setSearchDegraded(e.payload.degraded);
      setSearchProvider(e.payload.provider);
    }).then((u) => {
      unlistenStatus = u;
    }).catch((err) => {
      // Errore visibile: un listener negato dal sistema di permessi lascerebbe il banner muto.
      console.error('[LIMEN] listen(search_mode_status) non registrato:', err);
    });

    void listen<string>('navigate_to_tab', (e) => {
      if (e.payload === 'help') {
        setCurrentTab('advanced');
        setAdvancedTab('help');
      }
    }).then((u) => {
      unlistenNav = u;
    }).catch((err) => {
      console.error('[LIMEN] listen(navigate_to_tab) non registrato:', err);
    });

    return () => {
      if (unlistenStatus) unlistenStatus();
      if (unlistenNav) unlistenNav();
    };
  }, []);

  useEffect(() => {
    if (currentTab === 'search' && vaultPath && isTauriEnv) {
      void aiIpc
        .embeddingsGetProvider(vaultPath)
        .then((p) => setSearchProvider(p.provider))
        .catch(() => {});
      void aiIpc
        .localServerStatus()
        .then((s) => setLocalServerHealthy(s.running && s.healthy))
        .catch(() => {});
    }
  }, [currentTab, vaultPath, isTauriEnv, searchRevision]);

  useEffect(() => {
    if ((currentTab === 'memory' || currentTab === 'knowledge') && vaultPath && isTauriEnv) {
      invoke<Record<string, number>>('count_knowledge_notes', { vaultPath })
        .then(counts => setCategoryCounts(counts || {}))
        .catch(err => console.error('Errore conteggio note per categoria:', err));
    }
  }, [currentTab, vaultPath, isTauriEnv]);

  const openReader = (target: string, passageId?: string, query?: string, revision?: number, hash?: string) => {
    setReaderTarget(target);
    setReaderPassageId(passageId);
    setReaderExpectedRevision(revision);
    setReaderExpectedHash(hash);
    setReaderQuery(query);
    setReaderOpen(true);
  };
  const busy = useRef(false);
  const generation = useRef(0);
  const ipc = useRef(createVaultIpc(invoke, () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window)).current;
  const { documents: catalogDocuments, loading: catalogLoading, error: catalogError } = useCatalogDocuments(
    ipc.listCatalogDocuments, vaultPath || '', isTauriEnv, catalogRevision,
    catalogFilterFormat, catalogFilterStatus, catalogSearchText,
  );
  useEffect(() => () => { generation.current++; }, []);
  const begin = () => { if (busy.current) return null; busy.current=true; setIsProcessing(true); return ++generation.current; };
  const finish = (ticket:number) => { if(ticket===generation.current) {busy.current=false;setIsProcessing(false);} };


  // Detect Tauri Environment
  useEffect(() => {
    let cancelled = false;
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    setIsTauriEnv(isTauri);

    if (isTauri) {
      invoke<boolean>('check_obsidian_installed')
        .then((installed) => {
          if(!cancelled) setObsidianAvailable(installed);
        })
        .catch(() => {
          if(!cancelled) setObsidianAvailable(false);
        });
    }
    return () => {cancelled=true;};
  }, []);

  // Controllo avvio: Vault, LLM Locale, Chiave API / Solo Locale
  useEffect(() => {
    let active = true;

    async function checkStartupRequirements() {
      let currentLoaded = vaultLoaded;
      let currentPath = vaultPath;

      // 1. Se presente un percorso precedente nel localStorage, prova auto-open
      const lastVault = typeof localStorage !== 'undefined' ? localStorage.getItem('limen_last_vault_path') : null;
      if (!currentLoaded && lastVault && isTauriEnv) {
        try {
          const success = await handleOpenVaultPath(lastVault);
          if (success) {
            currentLoaded = true;
            currentPath = lastVault;
          }
        } catch {
          // ignora errore se il percorso salvato non è più accessibile
        }
      }

      if (!active) return;

      // 2. Controllo LLM Locale (almeno 1 modello installato con hash valido)
      let hasLocalModel = false;
      try {
        const cat = await aiIpc.localLlmCatalog();
        hasLocalModel = cat.models.some((m) => m.installed && m.sha256Ok);
      } catch (e) {
        console.warn('Controllo catalogo modelli fallito all\'avvio:', e);
      }

      if (!active) return;

      // 3. Controllo Chiave API o Modalità Solo Locale
      let hasKeyOrLocal = false;
      try {
        const isLocalOnly = currentPath ? await aiIpc.aiGetMode(currentPath) === 'local_only' : false;
        if (isLocalOnly) {
          hasKeyOrLocal = true;
        } else {
          const hasKey = await aiIpc.status();
          hasKeyOrLocal = Boolean(hasKey);
        }
      } catch (e) {
        console.warn('Controllo stato chiave API fallito all\'avvio:', e);
      }

      if (!active) return;

      const isVaultValid = currentLoaded && Boolean(currentPath);

      // Se manca anche una sola delle 3 condizioni fondamentali -> apri Setup Wizard
      if (!isVaultValid || !hasLocalModel || !hasKeyOrLocal) {
        setSetupWizardOpen(true);
      }
    }

    const timer = setTimeout(() => {
      void checkStartupRequirements();
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isTauriEnv]);

  const refreshSnapshotsAndIntegrity = async (target: string, ticket: number) => {
    try {
      const {snapshots,integrity}=await ipc.inspect(target);
      if(ticket!==generation.current)return;
      setSnapshotsList(snapshots);setIntegrityReport(integrity);
      setIntegrityStatus(integrity.is_integrity_valid?'valid':integrity.errors.length?'unverified':'corrupted');
      if(integrity.errors.length)setActionError(integrity.errors.join('; '));

    } catch(e) {
      if(ticket!==generation.current)return;
      setSnapshotsList([]);setIntegrityReport(null);setIntegrityStatus('unverified');
      setActionError(`Aggiornamento integrità non riuscito: ${e instanceof Error?e.message:String(e)}`);
    }
  };
  const refreshCatalog = async (target: string, ticket: number) => {
    try {
      const summary = await ipc.syncCatalog(target);
      if (ticket !== generation.current) return;
      setCatalogSummary(summary);
      setCatalogRevision(v => v + 1);
      if (summary.totalRawSources > 0 || summary.totalDocuments > 0) {
        setSourceCount(summary.totalRawSources || summary.totalDocuments);
      }

      try {
        const indexing = await ipc.getIndexingStatus(target);
        if (ticket === generation.current) setHasPendingIndexing(!indexing.complete);
      } catch {
        if (ticket === generation.current) setHasPendingIndexing(true);
      }
    } catch (e) {
      console.error('refreshCatalog error:', e);
    }
  };

  const handleOneClickAutoIndex = async () => {
    if (!vaultPath) return;
    const ticket = begin();
    if (ticket === null) return;
    setIsAutoIndexing(true);
    setShowIndexingPrompt(true);
    setActionError(null);
    setRestoreMessage(null);
    try {
      const result = await runIndexing({
        extract: ipc.processPendingExtractions,
        index: ipc.indexVaultSearch,
        vectors: aiIpc.embeddingsSyncVault,
        status: ipc.getIndexingStatus,
      }, vaultPath, (phase, percent) => {
        if (ticket === generation.current) { setAutoIndexStep(phase); setAutoIndexPercent(percent); }
      });
      await refreshCatalog(vaultPath, ticket);
      await refreshCompiler(vaultPath, ticket);
      if (ticket !== generation.current) return;
      setSearchRevision(r => r + 1);
      setHasPendingIndexing(!result.complete);
      if (result.complete) {
        setShowIndexingPrompt(false);
        setRestoreMessage(`Indicizzazione completata: ${result.documents} documenti elaborati. Ricerca testuale e semantica aggiornate.`);
      } else {
        const st = result.status;
        setActionError([
          'Indicizzazione incompleta.',
          `${st.pendingDocuments} documenti in attesa; ${st.attentionDocuments} da controllare; ${st.missingPassages} passaggi semantici mancanti.`,
          !st.lexicalCurrent ? 'Indice testuale da aggiornare.' : '',
          ...result.errors,
        ].filter(Boolean).join(' '));
      }
    } catch (e) {
      if (ticket === generation.current) { setHasPendingIndexing(true); setActionError(`Indicizzazione non verificata: ${String(e)}`); }
    } finally {
      setIsAutoIndexing(false);
      setAutoIndexStep(null);
      finish(ticket);
    }
  };

  const handleUploadDocuments = async () => {
    if (!vaultPath) return;
    const ticket = begin();
    if (ticket === null) return;
    setActionError(null);
    try {
      const receipts = await ipc.automationChooseFiles(vaultPath);
      // Se l'utente ha annullato il selettore file o non ha selezionato alcun file:
      if (!receipts || receipts.length === 0) {
        return;
      }

      await refreshCatalog(vaultPath, ticket);
      await refreshCompiler(vaultPath, ticket);

      const imported = receipts.filter((r) => r.status === 'imported');
      const duplicates = receipts.filter((r) => r.status === 'duplicate');
      const errors = receipts.filter((r) => r.status === 'error');

      if (imported.length > 0) {
        const fileNames = imported.map((r) => {
          const raw = r.name || r.path || 'file';
          return raw.split(/[/\\]/).pop() || raw;
        });
        setImportedFilesList(fileNames);
        setShowIndexingPrompt(true);
        setHasPendingIndexing(true);

        if (duplicates.length > 0 || errors.length > 0) {
          const notes: string[] = [];
          if (duplicates.length > 0) notes.push(`${duplicates.length} duplicati ignorati`);
          if (errors.length > 0) notes.push(`${errors.length} errori: ${errors.map((e) => e.error || 'errore').join(', ')}`);
          setActionError(`Caricati ${imported.length} file (${notes.join(', ')}).`);
        }
      } else if (duplicates.length > 0 && errors.length === 0) {
        setActionError(`I ${duplicates.length} file selezionati sono già presenti nel Vault (duplicati ignorati). Nessun nuovo file da indicizzare.`);
      } else if (errors.length > 0) {
        setActionError(`Errore durante il caricamento: ${errors.map((e) => `${(e.name || e.path || 'file').split(/[/\\]/).pop()}: ${e.error || 'errore'}`).join(' · ')}`);
      }
    } catch (err) {
      setActionError(`Caricamento non riuscito: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      finish(ticket);
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (!vaultPath) return;
    const ticket = begin();
    if (ticket === null) return;
    setActionError(null);
    setRestoreMessage(null);
    try {
      const rep = await ipc.restoreSnapshot(vaultPath, snapshotId);
      setRestoreMessage(`Copia ripristinata con successo in: ${rep.destination_path} (${rep.files_restored} file verificati SHA-256)`);
    } catch (err) {
      setActionError(`Ripristino non riuscito: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      finish(ticket);
    }
  };

  const handleNativeDrop = async (filePaths: string[]) => {
    setIsDragging(false);
    if (!vaultPath) return;
    if (busy.current || showIndexingPrompt) {
      setActionError('Completa o rimanda l’operazione corrente prima di caricare altri file.');
      return;
    }
    setActionError(null);
    if (filePaths.length > 0) {
      const ticket = begin();
      if (ticket === null) return;
      try {
        const receipts = await ipc.automationImportFiles(vaultPath, filePaths);
        await refreshCatalog(vaultPath, ticket);
        await refreshCompiler(vaultPath, ticket);

        const imported = (receipts || []).filter((r) => r.status === 'imported');
        const duplicates = (receipts || []).filter((r) => r.status === 'duplicate');
        const errors = (receipts || []).filter((r) => r.status === 'error');

        if (imported.length > 0) {
          const names = imported.map((r) => {
            const raw = r.name || r.path || 'file';
            return raw.split(/[/\\]/).pop() || raw;
          });
          setImportedFilesList(names);
          setShowIndexingPrompt(true);
          setHasPendingIndexing(true);

          if (duplicates.length > 0 || errors.length > 0) {
            const notes: string[] = [];
            if (duplicates.length > 0) notes.push(`${duplicates.length} duplicati ignorati`);
            if (errors.length > 0) notes.push(`${errors.length} errori: ${errors.map((e) => e.error).join(', ')}`);
            setActionError(`Importati ${imported.length} file (${notes.join(', ')}).`);
          }
        } else if (duplicates.length > 0 && errors.length === 0) {
          setActionError(`Tutti i ${duplicates.length} file rilasciati sono già presenti nel Vault (duplicati ignorati). Nessun nuovo file da indicizzare.`);
        } else if (errors.length > 0) {
          setActionError(`Errore durante l'importazione: ${errors.map((e) => e.error).join(' · ')}`);
        }
      } catch (err) {
        setActionError(`Errore durante il caricamento: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        finish(ticket);
      }
    }
  };
  useNativeFileDrop(isTauriEnv && !!vaultPath, handleNativeDrop, setIsDragging, setActionError);

  const refreshCompiler = async (target:string,ticket:number) => {
    try {
      const sources=await ipc.listRawSources(target);
      const proposals=await ipc.listProposals(target);
      if(ticket!==generation.current)return;
      setRawSourcesList(sources);
      setProposalsList(proposals);setProposalCount(proposals.length);
    }catch(e){if(ticket===generation.current){setRawSourcesList([]);setProposalsList([]);setActionError(`Aggiornamento delle fonti non riuscito: ${String(e)}`);}}
  };
  const handleRecheck = async () => {
    if(!vaultPath)return;const ticket=begin();if(ticket===null)return;setActionError(null);
    try{
      await refreshSnapshotsAndIntegrity(vaultPath,ticket);
      await refreshCompiler(vaultPath,ticket);
      await refreshCatalog(vaultPath,ticket);
    }finally{finish(ticket);}
  };

  const handleBrowseFolder = async (): Promise<string | null> => {
    setActionError(null);
    if (!isTauriEnv) {
      setActionError('Serve l’applicazione nativa LIMEN. Questa è un’anteprima nel browser.');
      return null;
    }
    try {
      const selected = await ipc.selectVaultFolder();
      if (selected) {
        const normalized = normalizeVaultPath(selected);
        setCustomPathInput(normalized);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('limen_last_vault_path', normalized);
          } catch {}
        }
        return normalized;
      }
      return null;
    } catch (err) {
      setActionError(typeof err === 'string' ? err : (err as Error).message);
      return null;
    }
  };

  const handleOpenVaultPath = async (targetPath: string): Promise<boolean> => {
    setActionError(null);
    if (!isTauriEnv) {
      setActionError('Serve l’applicazione nativa LIMEN. Questa è un’anteprima nel browser.');
      return false;
    }

    const target = targetPath.trim();
    if (!target) return false;

    const ticket = begin();
    if (ticket === null) return false;
    setIntegrityReport(null);
    setSnapshotsList([]);
    setIntegrityStatus('unverified');
    setRawSourcesList([]);
    setProposalsList([]);
    setLastBatchReport(null);
    try {
      const res = await ipc.open(target);
      if (ticket !== generation.current) return false;

      setVaultPath(res.status.path);
      setVaultName(res.status.name);
      setVaultState(res.status.state);
      setPageCount(res.status.page_count);
      setSourceCount(res.status.source_count);
      setProposalCount(res.status.proposal_count);
      setValidationErrors(res.validation.errors || []);
      setValidationWarnings(res.validation.warnings || []);
      setVaultLoaded(res.validation.is_valid);

      if (res.status.path && res.validation.is_valid) {
        const normalized = normalizeVaultPath(res.status.path);
        setCustomPathInput(normalized);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('limen_last_vault_path', normalized);
          } catch {}
        }
        await refreshSnapshotsAndIntegrity(res.status.path, ticket);
        await refreshCompiler(res.status.path, ticket);
        await refreshCatalog(res.status.path, ticket);
        return true;
      }
      return false;
    } catch (err) {
      if (ticket !== generation.current) return false;
      setActionError(typeof err === 'string' ? err : (err as Error).message);
      setVaultLoaded(false);
      setVaultState('NOT_ACCESSIBLE');
      return false;
    } finally {
      finish(ticket);
    }
  };

  const handleCreateVaultPath = async (targetPath: string): Promise<boolean> => {
    setActionError(null);
    if (!isTauriEnv) {
      setActionError('Serve l’applicazione nativa LIMEN. Questa è un’anteprima nel browser.');
      return false;
    }

    const target = targetPath.trim();
    if (!target) return false;

    const ticket = begin();
    if (ticket === null) return false;
    setIntegrityReport(null);
    setSnapshotsList([]);
    setIntegrityStatus('unverified');
    setRawSourcesList([]);
    setProposalsList([]);
    setLastBatchReport(null);
    try {
      const res = await ipc.create(target);
      if (ticket !== generation.current) return false;

      setVaultPath(res.path);
      setVaultName(res.name);
      setVaultState(res.state);
      setPageCount(res.page_count);
      setSourceCount(res.source_count);
      setProposalCount(res.proposal_count);
      setValidationErrors([]);
      setValidationWarnings([]);
      const ok = res.state === 'READY';
      setVaultLoaded(ok);

      if (res.path && ok) {
        const normalized = normalizeVaultPath(res.path);
        setCustomPathInput(normalized);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('limen_last_vault_path', normalized);
          } catch {}
        }
        await refreshSnapshotsAndIntegrity(res.path, ticket);
        await refreshCompiler(res.path, ticket);
        await refreshCatalog(res.path, ticket);
        return true;
      }
      return false;
    } catch (err) {
      if (ticket !== generation.current) return false;
      setActionError(typeof err === 'string' ? err : (err as Error).message);
      setVaultLoaded(false);
      setVaultState('INVALID');
      return false;
    } finally {
      finish(ticket);
    }
  };

  const handleCreateVault = async () => {
    let target = customPathInput.trim();
    if (!target) {
      const selected = await handleBrowseFolder();
      if (!selected) return;
      target = selected;
    }
    await handleCreateVaultPath(target);
  };

  const handleOpenExistingVault = async () => {
    let target = customPathInput.trim();
    if (!target) {
      const selected = await handleBrowseFolder();
      if (!selected) return;
      target = selected;
    }
    await handleOpenVaultPath(target);
  };

  const handleCreateSnapshot = async () => {
    if (!vaultPath) return;
    setActionError(null);

    if (!isTauriEnv) {
      setActionError('Apri l’applicazione nativa LIMEN per creare copie locali.');
      return;
    }

    const ticket=begin(); if(ticket===null)return;
    try {
      await ipc.createSnapshot(vaultPath,snapshotNoteInput.trim() || undefined);
      if(ticket!==generation.current)return;
      setSnapshotNoteInput('');
      await refreshSnapshotsAndIntegrity(vaultPath,ticket);
    } catch (err) {
      if(ticket!==generation.current)return;
      setActionError(`Creazione della copia non riuscita: ${typeof err === 'string' ? err : (err as Error).message}`);
    } finally {
      finish(ticket);
    }
  };

  const handleCompileSingleSource = async (relPath: string) => {
    if (!vaultPath) return;
    setActionError(null);
    if (!isTauriEnv) {
      setActionError('Apri l’applicazione nativa LIMEN per compilare le fonti.');
      return;
    }
    const ticket = begin(); if (ticket === null) return;
    try {
      const res = await ipc.compileSource(vaultPath, relPath);
      if (ticket !== generation.current) return;
      if (res.status === 'error' || res.status === 'unsupported') {
        setActionError(`Compilazione non riuscita per ${relPath}: ${res.error}`);
      }
      await refreshSnapshotsAndIntegrity(vaultPath,ticket);
      await refreshCompiler(vaultPath,ticket);
    } catch (err) {
      if (ticket !== generation.current) return;
      setActionError(`Compilazione della fonte non riuscita: ${typeof err === 'string' ? err : (err as Error).message}`);
    } finally {
      finish(ticket);
    }
  };

  const handleBatchCompile = async () => {
    if (!vaultPath) return;
    setActionError(null);
    if (!isTauriEnv) {
      setActionError('Apri l’applicazione nativa LIMEN per compilare tutte le fonti.');
      return;
    }
    const ticket = begin(); if (ticket === null) return;
    try {
      const report = await ipc.batchCompileSources(vaultPath);
      if (ticket !== generation.current) return;
      setLastBatchReport(report);
      await refreshSnapshotsAndIntegrity(vaultPath,ticket);
      await refreshCompiler(vaultPath,ticket);
    } catch (err) {
      if (ticket !== generation.current) return;
      setActionError(`Compilazione delle fonti non riuscita: ${typeof err === 'string' ? err : (err as Error).message}`);
    } finally {
      finish(ticket);
    }
  };

  useEffect(()=>{
    searchRequest.invalidate();setSearchResults([]);setSearchIndexStatus(null);
    if(!vaultPath||!isTauriEnv||(currentTab!=='search' && currentTab!=='ask')){setSearchLoading(false);return;}
    setSearchLoading(true);setActionError(null);
    const timer=setTimeout(()=>{
      void searchRequest.run(async()=>{
        const status=await ipc.getSearchIndexStatus(vaultPath);
        const results=status.state==='ready'?await ipc.searchVaultHybrid(vaultPath,{term:searchTerm.trim()||undefined,category:searchCategory||undefined,client:searchClient.trim()||undefined,project:searchProject.trim()||undefined,tags:searchTags.split(',').map(t=>t.trim()).filter(Boolean),status:searchStatusFilter||undefined}, undefined, useSemanticSearch):[];
        return {status,results};
      },value=>{setSearchIndexStatus(value.status);setSearchResults(value.results);setSearchLoading(false);},error=>{setActionError(`Ricerca non riuscita: ${String(error)}`);setSearchLoading(false);});
    },180);
    return ()=>{clearTimeout(timer);searchRequest.invalidate();};
  },[vaultPath,isTauriEnv,currentTab,searchTerm,searchCategory,searchClient,searchProject,searchTags,searchStatusFilter,searchRevision,searchRequest,useSemanticSearch,ipc]);

  const handleReindexSearch = async () => {
    if (!vaultPath) return;
    setActionError(null);
    if (!isTauriEnv) {
      setActionError('Apri l’applicazione nativa LIMEN per creare l’indice di ricerca.');
      return;
    }
    const ticket = begin(); if (ticket === null) return;
    try {
      const statusReport = await ipc.indexVaultSearch(vaultPath);
      if (ticket !== generation.current) return;
      setSearchIndexStatus(statusReport);
      setSearchRevision(value=>value+1);
    } catch (err) {
      if (ticket !== generation.current) return;
      setActionError(`Indicizzazione non riuscita: ${typeof err === 'string' ? err : (err as Error).message}`);
    } finally {
      finish(ticket);
    }
  };

  const handleOpenObsidian = async () => {
    if (!vaultPath) return;
    setActionError(null);

    if (!isTauriEnv) {
      setActionError('Apri l’applicazione nativa LIMEN per avviare Obsidian.');
      return;
    }

    try {
      await ipc.obsidian(vaultPath);
    } catch (err) {
      setActionError(`Avvio di Obsidian non riuscito: ${typeof err === 'string' ? err : (err as Error).message}`);
    }
  };

  const isAskTab = currentTab === 'ask' || currentTab === 'search';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--limen-bg-app)' }}>
      {isDragging && <div role="status" style={{ position: 'fixed', inset: 12, zIndex: 10000, pointerEvents: 'none', border: '3px dashed #84cc16', borderRadius: 16, background: 'rgba(240,253,244,.92)', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700 }}>
        {isProcessing || showIndexingPrompt ? 'Completa o rimanda l’operazione corrente' : 'Rilascia file o cartelle per caricarli nel Vault'}
      </div>}
      {/* SIDEBAR NAVIGATION */}
      <aside
        style={{
          width: 240,
          height: '100vh',
          backgroundColor: 'var(--limen-bg-sidebar)',
          borderRight: '1px solid var(--limen-border-light)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px 12px 12px',
          userSelect: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* TOP: LOGO + CARICA DOCUMENTI + MENU NAVIGAZIONE (SEMPRE FERMO) */}
        <div style={{ flexShrink: 0 }}>
          {/* LOGO */}
          <div style={{ padding: '4px 8px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={icLimenVault}
              alt="Limen Logo"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                objectFit: 'cover',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <img
                  src={limenWordmark}
                  alt="Limen"
                  style={{
                    height: 16,
                    width: 'auto',
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--limen-text-primary)' }}>
                  Vault V5
                </span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--limen-text-muted)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 2,
                }}
                title={vaultLoaded && vaultName ? vaultName : 'Nessun Vault'}
              >
                {vaultLoaded && vaultName ? vaultName : 'Nessun Vault'}
              </div>
            </div>
          </div>

          {/* GLOBAL CARICA DOCUMENTI BUTTON */}
          {vaultPath && vaultLoaded && (
            <div style={{ marginBottom: 12 }}>
              <button
                id="btn-upload-documents-global"
                onClick={handleUploadDocuments}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: '#c8ff00',
                  color: '#0a0c10',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(200, 255, 0, 0.25)',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.02em',
                }}
              >
                <Upload size={15} />
                <span>{isProcessing ? t.nav.uploading : t.nav.upload}</span>
              </button>
            </div>
          )}

          {/* MAIN 4-AREA NAV LIST */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              {
                id: 'ask',
                label: t.nav.ask,
                icon: <LimenAiIcon size={16} />,
                active: currentTab === 'ask' || currentTab === 'search',
                badge: undefined,
              },
              {
                id: 'documents',
                label: t.nav.documents,
                icon: <FolderArchive size={16} color={currentTab === 'documents' || currentTab === 'sources' ? '#0f172a' : '#64748b'} />,
                active: currentTab === 'documents' || currentTab === 'sources',
                badge: String(catalogSummary?.totalRawSources ?? sourceCount),
              },
              {
                id: 'vault',
                label: 'Vault',
                icon: <FolderTree size={16} color={currentTab === 'vault' ? '#0f172a' : '#64748b'} />,
                active: currentTab === 'vault',
                badge: undefined,
              },
              {
                id: 'memory',
                label: t.nav.memory,
                icon: <BookOpen size={16} color={currentTab === 'memory' || currentTab === 'knowledge' ? '#0f172a' : '#64748b'} />,
                active: currentTab === 'memory' || currentTab === 'knowledge',
                badge: String(pageCount),
              },
            ].map((item) => {
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as NavTab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: item.active ? '1px solid #cbd5e1' : '1px solid transparent',
                    backgroundColor: item.active ? '#ffffff' : 'transparent',
                    color: item.active ? '#0f172a' : '#475569',
                    boxShadow: item.active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    fontWeight: item.active ? 600 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 10, backgroundColor: item.active ? '#e2e8f0' : '#f1f5f9', color: '#475569' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div style={{ margin: '4px 0', borderBottom: '1px solid var(--limen-border-light)' }} />

            {/* AVANZATE NAVIGATION */}
            <button
              onClick={() => {
                setCurrentTab('advanced');
                setAdvancedTab('settings');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 6,
                border: (currentTab === 'advanced' || ['proposals', 'outputs', 'snapshots', 'transfers', 'system', 'settings', 'help'].includes(currentTab)) ? '1px solid #cbd5e1' : '1px solid transparent',
                backgroundColor: (currentTab === 'advanced' || ['proposals', 'outputs', 'snapshots', 'transfers', 'system', 'settings', 'help'].includes(currentTab)) ? '#ffffff' : 'transparent',
                color: (currentTab === 'advanced' || ['proposals', 'outputs', 'snapshots', 'transfers', 'system', 'settings', 'help'].includes(currentTab)) ? '#0f172a' : '#64748b',
                boxShadow: (currentTab === 'advanced' || ['proposals', 'outputs', 'snapshots', 'transfers', 'system', 'settings', 'help'].includes(currentTab)) ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                fontWeight: (currentTab === 'advanced' || ['proposals', 'outputs', 'snapshots', 'transfers', 'system', 'settings', 'help'].includes(currentTab)) ? 600 : 500,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sliders size={16} />
                <span>{t.nav.advanced}</span>
              </div>
            </button>
          </nav>
        </div>

        {/* LINEA DIVISORIA SOTTO IL MENU */}
        <div style={{ height: 1, backgroundColor: 'var(--limen-border-light)', margin: '8px 0', flexShrink: 0 }} />

        {/* SEZIONE STORICO CONVERSAZIONI (VISIBILE IN TUTTE LE PAGINE, SCORRE AL PROPRIO INTERNO) */}
        <div style={{ flex: 1, minHeight: 90, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Intestazione Storico con pulsante Nuova conversazione e opzione Svuota */}
          <div
            style={{
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleNewConversation}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title={t.nav.newChat}
            >
              <PlusCircle size={13} color="#0f172a" />
              <span>{t.nav.newChat}</span>
            </button>

            {conversationGroups.length > 0 && (
              <button
                onClick={handleClearHistory}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 4,
                  borderRadius: 4,
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={t.nav.clearHistoryTitle}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* Elenco conversazioni scrollabile */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {conversationGroups.length === 0 ? (
              <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
                {t.nav.noConversations}
              </div>
            ) : (
              conversationGroups.map(group => {
                const isSelected = archivedConversation?.conversationId === group.conversationId;
                const firstPrompt = group.turns[0]?.prompt || t.nav.newChat;
                return (
                  <div
                    key={group.conversationId}
                    onClick={() => void handleSelectArchivedConversation(group)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: isSelected ? '1px solid #0f172a' : '1px solid transparent',
                      backgroundColor: isSelected ? '#ffffff' : 'transparent',
                      boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#0f172a' : '#334155',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          flex: 1,
                        }}
                        title={firstPrompt}
                      >
                        {firstPrompt}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => void handleDeleteConversation(group.conversationId, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 2,
                          color: '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                        title={t.common.delete}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#64748b' }}>
                      <span>{formatLocalDate(group.latestCreatedAtUtc)}</span>
                      <span>·</span>
                      <span>{group.turns.length} {group.turns.length === 1 ? t.nav.turn : t.nav.turns}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SEZIONE FONTI (VISIBILE SOLO IN CHIEDI QUANDO C'È UNA RISPOSTA SELEZIONATA, SCORRE AL PROPRIO INTERNO) */}
        {(currentTab === 'ask' || currentTab === 'search') && selectedTurnItem && selectedTurnSources.length > 0 && (
          <div
            style={{
              flexShrink: 0,
              maxHeight: '35%',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '1px solid var(--limen-border-light)',
              paddingTop: 6,
              overflow: 'hidden',
            }}
          >
            {/* Intestazione Sezione Fonti (chiusa di default con conteggio) */}
            <div
              onClick={() => setSourcesSidebarOpen(open => !open)}
              style={{
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderRadius: 6,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                {sourcesSidebarOpen ? <ChevronDown size={14} color="#0f172a" /> : <ChevronRight size={14} color="#0f172a" />}
                <FileText size={14} color="#0f172a" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  {t.nav.sources}: {selectedTurnCitedCount} {selectedTurnCitedCount === 1 ? t.nav.cited : t.nav.citedPlural} / {selectedTurnSources.length}
                </span>
              </div>
              {sourcesSidebarOpen && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalSingleSource(null);
                    setModalOpen(true);
                  }}
                  style={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                  title={t.nav.showAll}
                >
                  {t.nav.showAll}
                </button>
              )}
            </div>

            {/* Elenco Fonti compatto quando aperto */}
            {sourcesSidebarOpen && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px 2px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selectedTurnSources.map((source, sIdx) => {
                  const isCited = Boolean(
                    selectedTurnItem.answer.citations &&
                    selectedTurnItem.answer.citations.some(c => c.documentId === source.documentId || c.relativePath === source.relativePath)
                  );
                  const cleanName = cleanTitle(source.title, source.relativePath);
                  return (
                    <div
                      key={`${source.documentId}-${sIdx}`}
                      onClick={() => {
                        setModalSingleSource(source);
                        setModalOpen(true);
                      }}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 6,
                        backgroundColor: isCited ? '#f0fdf4' : '#ffffff',
                        border: isCited ? '1px solid #86efac' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                        transition: 'background-color 0.15s ease',
                      }}
                      title={cleanName}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                        <FileText size={12} color={isCited ? '#16a34a' : '#64748b'} style={{ flexShrink: 0 }} />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: isCited ? 700 : 500,
                            color: isCited ? '#14532d' : '#1e293b',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {cleanName}
                        </span>
                      </div>
                      {isCited && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '1px 4px',
                            borderRadius: 3,
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            flexShrink: 0,
                          }}
                        >
                          {t.nav.cited.toUpperCase()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM QUICK LAUNCHER (SEMPRE FERMO IN BASSO) */}
        <div style={{ flexShrink: 0, paddingTop: 10, borderTop: '1px solid var(--limen-border-light)' }}>
          <button
            onClick={handleOpenObsidian}
            disabled={!vaultLoaded || !obsidianAvailable || isProcessing}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--limen-border-light)',
              backgroundColor: vaultLoaded && obsidianAvailable ? '#ffffff' : '#f8fafc',
              color: vaultLoaded && obsidianAvailable ? '#0f172a' : '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: vaultLoaded && obsidianAvailable ? 'pointer' : 'not-allowed',
            }}
          >
            <ExternalLink size={14} />
            <span>{t.nav.openObsidian}</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT COLUMN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* TOP NAVBAR WITH REFRESH BUTTON IN CENTER */}
        <header
          style={{
            height: 52,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--limen-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            userSelect: 'none',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* LEFT: Current Section Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              {currentTab === 'home' && t.nav.overview}
              {(currentTab === 'ask' || currentTab === 'search') && t.nav.ask}
              {(currentTab === 'documents' || currentTab === 'sources') && t.nav.documents}
              {currentTab === 'vault' && 'Vault'}
              {(currentTab === 'memory' || currentTab === 'knowledge') && t.nav.memory}
              {(currentTab === 'advanced' || ['proposals', 'outputs', 'snapshots', 'transfers', 'system', 'help', 'settings'].includes(currentTab)) && t.nav.advanced}
            </span>
            {vaultPath && (
              <span style={{ fontSize: 11, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
                {vaultPath.split(/[/\\]/).filter(Boolean).pop()}
              </span>
            )}
          </div>

          {/* CENTER: REFRESH BUTTON (RICHIESTO DALL'UTENTE) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={handleRecheck}
              disabled={isProcessing || !vaultPath}
              title={t.nav.refresh}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 18px',
                borderRadius: 20,
                border: '1.5px solid #cbd5e1',
                backgroundColor: isProcessing ? '#f1f5f9' : '#ffffff',
                color: isProcessing ? '#94a3b8' : '#0f172a',
                fontSize: 13,
                fontWeight: 600,
                cursor: isProcessing || !vaultPath ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isProcessing && vaultPath) {
                  e.currentTarget.style.borderColor = '#0f172a';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing && vaultPath) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}
            >
              <RotateCw size={15} className={isProcessing ? 'spin' : ''} color={isProcessing ? '#94a3b8' : '#0f172a'} />
              <span>{isProcessing ? t.nav.refreshing : t.nav.refresh}</span>
            </button>
          </div>

          {/* RIGHT: Language Toggle + Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LanguageToggle />
            {vaultLoaded ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 12,
                  backgroundColor: vaultState === 'READY' ? '#dcfce7' : '#fee2e2',
                  color: vaultState === 'READY' ? '#15803d' : '#b91c1c',
                  border: '1px solid',
                  borderColor: vaultState === 'READY' ? '#bbf7d0' : '#fecaca',
                }}
              >
                ● {labelIt(vaultState, language)}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.nav.noVault}</span>
            )}
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, overflowY: isAskTab ? 'hidden' : 'auto', padding: isAskTab ? 0 : '24px 32px', display: 'flex', flexDirection: 'column' }}>
        {/* BROWSER WARNING BANNER */}
        {!isTauriEnv && (
          <div
            style={{
              backgroundColor: '#fffbe5',
              border: '1px solid #fef08a',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#854d0e',
              fontSize: 13,
            }}
          >
            <AlertTriangle size={18} color="#ca8a04" />
            <div>
              <strong>Modalità anteprima nel browser:</strong> Per usare i file locali, verificare le copie e aprire Obsidian serve l’applicazione nativa. Queste operazioni non sono disponibili nell’anteprima del browser.
            </div>
          </div>
        )}

        {/* ACTION ERROR DISPLAY */}
        {actionError && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              color: '#991b1b',
              fontSize: 13,
            }}
          >
            <strong>Errore:</strong> {<MessageIt value={actionError}/>}
          </div>
        )}

        {/* FIRST RUN UX BANNER IF NO VAULT */}
        {!vaultLoaded ? (
          currentTab === 'help' ? (
            <HelpPanel
              vaultPath={vaultPath}
              onOpenObsidian={handleOpenObsidian}
              onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
            />
          ) : (
            <div
              className="limen-card"
              style={{
                maxWidth: 600,
                margin: '60px auto',
                padding: 36,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                {t.home.welcomeTitle}
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 28px 0' }}>
                {t.home.welcomeSubtitle}
              </p>

              <div style={{ marginBottom: 20, textAlign: 'left' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                  {t.home.vaultFolder}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={customPathInput}
                    onChange={(e) => {
                      const val = normalizeVaultPath(e.target.value);
                      setCustomPathInput(val);
                      if (typeof localStorage !== 'undefined') {
                        try {
                          localStorage.setItem('limen_last_vault_path', val);
                        } catch {}
                      }
                    }}
                    placeholder={t.home.vaultFolder}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleBrowseFolder}
                    disabled={isProcessing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <FolderOpen size={16} />
                    <span>{t.home.browse}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleCreateVault}
                  disabled={isProcessing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: isProcessing ? '#94a3b8' : '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isProcessing ? <Loader2 size={16} className="spin" /> : <PlusCircle size={16} />}
                  <span>{t.home.createVault}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenExistingVault}
                  disabled={isProcessing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: isProcessing ? '#f1f5f9' : 'var(--limen-lime)',
                    color: '#0f172a',
                    border: '1px solid rgba(119, 241, 23, 0.6)',
                    borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  {isProcessing ? <Loader2 size={16} className="spin" /> : <FolderOpen size={16} />}
                  <span>{t.home.openVault}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupWizardOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(15, 23, 42, 0.05)',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Compass size={16} />
                  <span>{t.home.guidedSetup}</span>
                </button>
              </div>

            {/* VALIDATION ERRORS IN WELCOME CARD */}
            {validationErrors.length > 0 && (
              <div style={{ marginTop: 24, textAlign: 'left', backgroundColor: '#fef2f2', padding: 16, borderRadius: 8, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
                  Errori di validazione del Vault ({validationErrors.length})
                </div>
                <div style={{ fontSize: 12, color: '#7f1d1d', marginBottom: 8 }}>
                  Trovate {validationErrors.length} note con errori di schema o struttura.
                </div>
                <details style={{ marginTop: 6 }}>
                  <summary style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', cursor: 'pointer' }}>
                    Consulta il dettaglio tecnico…
                  </summary>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: 12, color: '#b91c1c', maxHeight: 180, overflowY: 'auto' }}>
                    {validationErrors.map((err, i) => (
                      <li key={i}>{<MessageIt value={err}/>}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
          )
        ) : (
          <>
            {/* VAULT BANNER */}
            <VaultStatusBanner
              status={vaultState === 'READY' ? 'READY' : 'INVALID'}
              vaultName={vaultName}
              vaultPath={vaultPath}
              pageCount={pageCount}
              onOpenObsidian={handleOpenObsidian}
              obsidianAvailable={obsidianAvailable}
            />

            {/* SCREEN RENDERER */}
            {currentTab === 'home' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                  <MetricCard title={t.home.metricsProcessedNotes} value={pageCount} subtitle={t.home.knowledgeDesc} />
                  <MetricCard title={t.home.metricsRawSources} value={sourceCount} subtitle={t.home.rawSourcesDesc} />
                  <MetricCard title={t.home.metricsProposals} value={proposalCount} subtitle={labelIt('proposal', language)} />
                  <MetricCard
                    title={t.home.metricsIntegrity}
                    value={integrityReport?.is_integrity_valid ? t.home.verified : integrityReport?.errors.length ? t.home.unverified : integrityReport ? t.home.diffDetected : t.home.unverified}
                    subtitle={
                      integrityReport?.is_integrity_valid
                        ? t.home.allFilesMatch
                        : integrityReport?.errors.length
                        ? t.home.checkFailed
                        : integrityReport
                        ? `${integrityReport.modified_files.length} mod, ${integrityReport.missing_files.length} miss, ${integrityReport.added_files.length} add`
                        : t.home.unverified
                    }
                  />
                </div>

                {/* SHA-256 DISCREPANCIES CARD IF ANY */}
                {integrityReport && !integrityReport.is_integrity_valid && integrityReport.errors.length === 0 && (() => {
                  const modCount = integrityReport.modified_files.length;
                  const misCount = integrityReport.missing_files.length;
                  const addCount = integrityReport.added_files.length;
                  const diffSummary = `${modCount} mod, ${misCount} miss, ${addCount} add`;
                  return (
                    <div style={{ marginBottom: 20, backgroundColor: '#fffbe5', padding: '10px 16px', borderRadius: 8, border: '1px solid #fef08a' }}>
                      <details>
                        <summary style={{ fontSize: 13, fontWeight: 700, color: '#854d0e', cursor: 'pointer' }}>
                          SHA-256 ({diffSummary})
                        </summary>
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {modCount > 0 && (
                            <div style={{ fontSize: 12, color: '#a16207' }}>
                              <strong>{language === 'en' ? 'Modified files' : 'File modificati'} ({modCount}):</strong> {integrityReport.modified_files.join(', ')}
                            </div>
                          )}
                          {misCount > 0 && (
                            <div style={{ fontSize: 12, color: '#a16207' }}>
                              <strong>{language === 'en' ? 'Missing files' : 'File mancanti'} ({misCount}):</strong> {integrityReport.missing_files.join(', ')}
                            </div>
                          )}
                          {addCount > 0 && (
                            <div style={{ fontSize: 12, color: '#a16207' }}>
                              <strong>{language === 'en' ? 'Added files' : 'File aggiunti'} ({addCount}):</strong> {integrityReport.added_files.join(', ')}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  );
                })()}

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                  <div className="limen-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{t.home.quickAccess}</h3>
                    </div>

                    {/* VAULT / RAW (20_RAW_SOURCES) CARD */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setCurrentTab('sources')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCurrentTab('sources'); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        backgroundColor: '#f1f5f9',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: 10,
                        cursor: 'pointer',
                        marginBottom: 16,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0f172a';
                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FolderArchive size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                              {t.home.rawSourcesTitle}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: 'monospace',
                                backgroundColor: '#e2e8f0',
                                padding: '1px 6px',
                                borderRadius: 4,
                                color: '#334155',
                                fontWeight: 600,
                              }}
                            >
                              20_RAW_SOURCES
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                            {t.home.rawSourcesDesc}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 12,
                            backgroundColor: sourceCount > 0 ? '#dbeafe' : '#f8fafc',
                            color: sourceCount > 0 ? '#1e40af' : '#64748b',
                            border: '1px solid',
                            borderColor: sourceCount > 0 ? '#bfdbfe' : '#e2e8f0',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {sourceCount} {sourceCount === 1 ? 'fonte' : 'fonti'}
                        </span>
                        <ChevronRight size={18} color="#64748b" />
                      </div>
                    </div>

                    {/* CARTELLE DELLA CONOSCENZA */}
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Cartelle della Conoscenza (Note Markdown)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {[
                        { id: 'clients', folder: '01_CLIENTS' },
                        { id: 'projects', folder: '02_PROJECTS' },
                        { id: 'brands', folder: '03_BRANDS' },
                        { id: 'positioning', folder: '04_POSITIONING' },
                        { id: 'packaging', folder: '05_PACKAGING_KNOWLEDGE' },
                        { id: 'methods', folder: '06_METHODS' },
                        { id: 'case_studies', folder: '07_CASE_STUDIES' },
                        { id: 'research', folder: '08_MARKET_RESEARCH' },
                        { id: 'competitors', folder: '09_COMPETITORS' },
                        { id: 'approved_outputs', folder: '10_APPROVED_OUTPUTS' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setCurrentTab('knowledge');
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '10px 14px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#94a3b8';
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                            {labelIt(cat.id, language)}
                          </span>
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b', marginTop: 2 }}>
                            {cat.folder}/
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="limen-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px 0' }}>AI</h3>
                    <button onClick={() => setCurrentTab('ask')} className="limen-btn-primary">{t.home.askVaultButton}</button>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginTop: 12 }}>
                      {language === 'en'
                        ? 'Query local documents with offline models or OpenAI hybrid search.'
                        : 'Interroga i documenti locali con modelli offline o connettiti a OpenAI.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 1. CHIEDI (CHAT CONTINUA PRESERVATA NEL DOM ANCHE QUANDO SI PASSA ALLE IMPOSTAZIONI O ALTRI TAB) */}
            <div
              style={{
                display: (currentTab === 'ask' || currentTab === 'search') ? 'flex' : 'none',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
              }}
            >
                {/* RICERCA MANUALE OPZIONALE (A SCOMPARSA SU RICHIESTA PER NON INTRALCIARE LA CHAT) */}
                {showManualSearch && (
                  <div style={{ flexShrink: 0, borderBottom: '1px solid var(--limen-border-light)', backgroundColor: '#f8fafc', padding: '12px 24px', maxHeight: '45vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                        <Search size={15} color="#0f172a" />
                        <span>Cerca passaggi nei documenti (ricerca ibrida manuale)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          onClick={handleReindexSearch}
                          disabled={isProcessing || !vaultPath}
                          title="Ricalcola cache e indicizza tutti i passaggi"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isProcessing || !vaultPath ? '#94a3b8' : '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 14px',
                            cursor: isProcessing || !vaultPath ? 'not-allowed' : 'pointer',
                            lineHeight: 1.2,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12 }}>
                            {isProcessing ? <Loader2 size={12} className="spin" /> : <RotateCw size={12} />}
                            <span>Indicizza</span>
                          </div>
                          <span style={{ fontSize: 9, opacity: 0.7, fontWeight: 400 }}>ricalcola cache</span>
                        </button>
                        <button
                          onClick={() => setShowManualSearch(false)}
                          aria-label="Chiudi ricerca manuale"
                          style={{
                            background: 'transparent',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: '#475569',
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          ✕ Chiudi
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                      Cerca nei passaggi estratti dei documenti e nelle note aziendali con ricerca ibrida locale, oppure invia la domanda a OpenAI con citazioni verificate.
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                        <input
                          type="text"
                          placeholder="Cerca parole chiave, contratti, clienti, passaggi di documenti..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 13,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                        }}
                      >
                        <option value="">Tutte le categorie</option>
                        <option value="client">Clienti (01_CLIENTS)</option>
                        <option value="project">Progetti (02_PROJECTS)</option>
                        <option value="brand">Marchi (03_BRANDS)</option>
                        <option value="source">Originali (20_RAW_SOURCES)</option>
                        <option value="approved_output">Approvati (10_APPROVED_OUTPUTS)</option>
                        <option value="proposal">Proposte (90_PROPOSALS)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      <input
                        aria-label="Filtra per cliente"
                        placeholder="Filtro cliente..."
                        value={searchClient}
                        onChange={(e) => setSearchClient(e.target.value)}
                        style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                      />
                      <input
                        aria-label="Filtra per progetto"
                        placeholder="Filtro progetto..."
                        value={searchProject}
                        onChange={(e) => setSearchProject(e.target.value)}
                        style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: 11, cursor: 'pointer' }}
                        >
                          Cancella ricerca
                        </button>
                      )}
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', cursor: 'pointer', marginLeft: 'auto' }}>
                        <input
                          type="checkbox"
                          checked={useSemanticSearch}
                          onChange={(e) => setUseSemanticSearch(e.target.checked)}
                        />
                        <span>Ricerca Ibrida (Semantica + Lessicale)</span>
                        {useSemanticSearch && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor:
                                searchProvider === 'local'
                                  ? searchDegraded || localServerHealthy === false
                                    ? '#fee2e2'
                                    : '#dcfce7'
                                  : '#e0e7ff',
                              color:
                                searchProvider === 'local'
                                  ? searchDegraded || localServerHealthy === false
                                    ? '#991b1b'
                                    : '#166534'
                                  : '#3730a3',
                            }}
                          >
                            {searchProvider === 'local'
                              ? searchDegraded || localServerHealthy === false
                                ? '⚠️ RAG LOCALE SPENTO (SOLO LESSICALE)'
                                : '🟢 RAG 100% LOCALE'
                              : '🌐 OPENAI (IN RETE)'}
                          </span>
                        )}
                      </label>
                    </div>

                    {searchLoading && <p style={{ fontSize: 12, color: '#64748b', margin: '10px 0 0 0' }}>Ricerca in corso…</p>}

                    {/* DEGRADED MODE WARNING BANNER IF LOCAL SERVICE DOWN */}
                    {useSemanticSearch && searchDegraded && (
                      <div
                        role="alert"
                        style={{
                          padding: '12px 16px',
                          borderRadius: 8,
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fef3c7',
                          color: '#92400e',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>⚠️</span>
                        <div>
                          <strong>Modalità degradata (solo ricerca lessicale):</strong> il servizio semantico locale non è
                          attivo o non ha risposto. I risultati sono calcolati esclusivamente tramite indice lessicale. Nessun
                          dato è uscito {terms.fromDeviceTerm}.
                        </div>
                      </div>
                    )}

                    {/* SEARCH RESULTS PREVIEW IF QUERY PRESENT */}
                    {searchTerm.trim() && searchResults.length > 0 && (
                      <div className="limen-card" style={{ padding: 20, marginTop: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                          {searchResults.length} risultati trovati per "{searchTerm}":
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {searchResults.slice(0, 5).map((item) => (
                            <div
                              key={item.relative_path}
                              onClick={() => openReader(item.id || item.relative_path, undefined, searchTerm, undefined, item.sha256)}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{item.title}</span>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  {item.matching_locator && (
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 4, backgroundColor: 'rgba(200,255,0,0.2)', color: '#4d7c0f', border: '1px solid rgba(200,255,0,0.4)' }}>
                                      {item.matching_locator}
                                    </span>
                                  )}
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, backgroundColor: '#e2e8f0', color: '#334155' }}>
                                    {labelIt(item.category)}
                                  </span>
                                </div>
                              </div>
                              {item.snippet && (
                                <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', margin: '4px 0' }}>
                                  "{item.snippet}"
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{item.relative_path}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#0284c7' }}>Apri nel lettore →</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Q&A CHAT COMPONENT A TUTTA ALTEZZA */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <AiPanel
                    key={vaultPath}
                    vaultPath={vaultPath!}
                    archivedConversation={archivedConversation}
                    onNewConversation={handleNewConversation}
                    onHistoryUpdated={refreshHistory}
                    onSelectedTurnChange={setSelectedTurnItem}
                    selectedTurnIndex={selectedTurnIndex}
                    onSelectTurnIndex={setSelectedTurnIndex}
                    onOpenSourcesSidebar={() => setSourcesSidebarOpen(true)}
                    newConversationTrigger={newConversationTrigger}
                    onOpenDocument={(req) => openReader(req.documentId, req.passageId, undefined, req.revision, req.sha256)}
                    showManualSearch={showManualSearch}
                    onToggleManualSearch={() => setShowManualSearch(!showManualSearch)}
                    hasPendingIndexing={hasPendingIndexing}
                    onTriggerAutoIndex={handleOneClickAutoIndex}
                    onNavigateToSettings={(section, guide) => {
                      setSettingsTargetSection(section || 'general');
                      setSettingsGuideMessage(guide || 'Configura le impostazioni per proseguire.');
                      setCurrentTab('advanced');
                      setAdvancedTab('settings');
                    }}
                  />
                </div>
              </div>

            {/* 2. DOCUMENTI (INVENTARIO COMPLETO ORIGINALI + ESTRAZIONE + CARICAMENTO LIME) */}
            {(currentTab === 'documents' || currentTab === 'sources') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* TOP STATS BANNER */}
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
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#ffffff' }}>{t.documents.title}</h2>
                    <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12 }}>
                      <span style={{ color: '#c8ff00', fontWeight: 600 }}>
                        {catalogSummary?.totalRawSources ?? catalogDocuments.length} {language === 'en' ? 'raw sources' : 'originali'}
                      </span>
                      <span style={{ color: '#86efac' }}>
                        {catalogSummary?.readyDocuments ?? 0} {language === 'en' ? 'ready' : 'pronti'}
                      </span>
                      {catalogSummary && catalogSummary.processingDocuments > 0 && (
                        <span style={{ color: '#fde047' }}>
                          {catalogSummary.processingDocuments} {language === 'en' ? 'extracting' : 'in estrazione'}
                        </span>
                      )}
                      <span style={{ color: '#cbd5e1' }}>
                        {catalogSummary?.totalPassages ?? 0} {language === 'en' ? 'passages' : 'passaggi'}
                      </span>
                    </div>
                  </div>
                  <button
                    id="btn-upload-documents-view"
                    onClick={handleUploadDocuments}
                    disabled={isProcessing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: '#c8ff00',
                      color: '#0a0c10',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 10px rgba(200, 255, 0, 0.3)',
                    }}
                  >
                    <Upload size={16} />
                    <span>{isProcessing ? t.nav.uploading : t.nav.upload}</span>
                  </button>
                </div>

                {/* DRAG AND DROP ZONE */}
                <div
                  onClick={handleUploadDocuments}
                  style={{
                    border: `2px dashed ${isDragging ? '#c8ff00' : '#cbd5e1'}`,
                    backgroundColor: isDragging ? 'rgba(200, 255, 0, 0.08)' : '#f8fafc',
                    borderRadius: 10,
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Upload size={28} style={{ margin: '0 auto 8px', color: isDragging ? '#c8ff00' : '#64748b' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    Trascina file o cartelle nella finestra, oppure clicca per selezionare {terms.fromDeviceTerm}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    PDF, Word (.docx), Excel (.xlsx), presentazioni, scansioni, note e testi. Massimo 32 MB per file.
                  </div>
                </div>

                {/* FILTERS TOOLBAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { id: 'all', label: t.documents.allFormats },
                      { id: 'pdf', label: 'PDF' },
                      { id: 'docx', label: 'Word (DOCX)' },
                      { id: 'xlsx', label: 'Excel' },
                      { id: 'txt', label: 'TXT' },
                      { id: 'md', label: 'Markdown' },
                      { id: 'csv', label: 'CSV' },
                      { id: 'pptx', label: 'PowerPoint' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        aria-pressed={catalogFilterFormat === f.id}
                        onClick={() => setCatalogFilterFormat(f.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid',
                          borderColor: catalogFilterFormat === f.id ? '#0f172a' : '#cbd5e1',
                          backgroundColor: catalogFilterFormat === f.id ? '#0f172a' : '#ffffff',
                          color: catalogFilterFormat === f.id ? '#ffffff' : '#334155',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder={language === 'en' ? 'Filter by name…' : 'Filtra per nome file...'}
                    value={catalogSearchText}
                    onChange={(e) => setCatalogSearchText(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 12,
                      width: 220,
                    }}
                  />
                </div>

                {/* DOCUMENTS TABLE */}
                <div className="limen-card" style={{ padding: 20 }}>
                  {catalogLoading ? <p role="status">Caricamento documenti…</p> : catalogError ? <p role="alert">{catalogError}</p> : catalogDocuments.length === 0 ? (
                    <EmptyState
                      title="Nessun documento trovato"
                      description={catalogSearchText || catalogFilterFormat !== 'all' ? 'Nessun file corrisponde ai filtri selezionati.' : 'Nessun file presente in 20_RAW_SOURCES. Clicca su CARICA DOCUMENTI per iniziare.'}
                      icon={<FolderArchive size={32} />}
                    />
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>{language === 'en' ? 'Document' : 'Documento'}</th>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>{language === 'en' ? 'Format' : 'Formato'}</th>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>{language === 'en' ? 'Size' : 'Dimensione'}</th>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>{language === 'en' ? 'Status' : 'Stato'}</th>
                          <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'right' }}>{language === 'en' ? 'Actions' : 'Azioni'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalogDocuments.map((doc) => {
                          const statusLabel =
                            doc.extractionStatus === 'ready'
                              ? 'Pronto per la ricerca'
                              : doc.extractionStatus === 'processing'
                              ? 'In estrazione'
                              : doc.extractionStatus === 'unsupported'
                              ? 'Non supportato'
                              : doc.extractionStatus === 'protected'
                              ? 'Protetto da password'
                              : 'In attesa';
                          const statusColor =
                            doc.extractionStatus === 'ready'
                              ? '#059669'
                              : doc.extractionStatus === 'processing'
                              ? '#d97706'
                              : doc.extractionStatus === 'failed'
                              ? '#dc2626'
                              : '#64748b';

                          return (
                            <tr key={doc.documentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 12px' }}>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{doc.fileName}</div>
                                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{doc.originalPath}</div>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                <span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#f1f5f9', color: '#334155' }}>
                                  {doc.extension || 'file'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {(doc.fileSize / 1024).toFixed(1)} KB
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: statusColor }} />
                                  {statusLabel}
                                </span>
                                {doc.passages && doc.passages.length > 0 && (
                                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                                    {doc.passages.length} passaggi estratti
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: 6 }}>
                                  <button
                                    onClick={() => openReader(doc.documentId, undefined, undefined, doc.revision, doc.contentHash)}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 4,
                                      border: '1px solid #cbd5e1',
                                      backgroundColor: '#f8fafc',
                                      fontSize: 11,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Leggi nel Vault
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!vaultPath) return;
                                      try {
                                        await ipc.openOriginal(vaultPath, doc.documentId);
                                      } catch (err) {
                                        setActionError(String(err));
                                      }
                                    }}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 4,
                                      border: '1px solid #cbd5e1',
                                      backgroundColor: '#ffffff',
                                      fontSize: 11,
                                      fontWeight: 500,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Apri originale
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!vaultPath) return;
                                      try {
                                        await ipc.revealInFinder(vaultPath, doc.documentId);
                                      } catch (err) {
                                        setActionError(String(err));
                                      }
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: 4,
                                      border: '1px solid #e2e8f0',
                                      backgroundColor: '#f8fafc',
                                      fontSize: 11,
                                      cursor: 'pointer',
                                    }}
                                    title={`Mostra in ${terms.fileManager}`}
                                  >
                                    {terms.fileManager}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* 2b. VAULT (ESPLORATORE REALE FILESYSTEM CON CARTELLE E ANTEPRIME) */}
            {currentTab === 'vault' && vaultPath && (
              <VaultPanel
                vaultPath={vaultPath}
                onOpenReader={(relPath) => openReader(relPath)}
                onRevealInFinder={async (relPath) => {
                  try {
                    await ipc.revealInFinder(vaultPath, relPath);
                  } catch (err: any) {
                    setActionError(`Impossibile mostrare nel Finder: ${err?.message || String(err)}`);
                    throw err;
                  }
                }}
                onNavigateToUpload={() => void handleUploadDocuments()}
                onNavigateToAsk={() => setCurrentTab('ask')}
              />
            )}

            {/* 3. MEMORIA (CATEGORIE AZIENDALI 01-10 + NOTE CONDIVISE) */}
            {(currentTab === 'memory' || currentTab === 'knowledge') && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                  {['clients', 'projects', 'brands', 'positioning', 'packaging', 'methods', 'case_studies', 'research', 'competitors', 'approved_outputs'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: selectedCategory === cat ? '#0f172a' : '#f1f5f9',
                        color: selectedCategory === cat ? '#ffffff' : '#475569',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {cat === 'all' ? 'Tutte le note' : `${labelIt(cat)} (${categoryCounts[cat] ?? 0})`}
                    </button>
                  ))}
                </div>

                <KnowledgePanel vaultPath={vaultPath!} category={selectedCategory} />
              </div>
            )}

            {/* 4. AVANZATE (PROPOSTE, SNAPSHOT & RECUPERO, TRASFERIMENTI, IMPOSTAZIONI, COMPILATORE, SISTEMA, GUIDA) */}
            {(currentTab === 'advanced' || ['proposals', 'outputs', 'snapshots', 'transfers', 'system', 'settings', 'help'].includes(currentTab)) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* SEGMENTED SUB-NAVIGATION */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
                  {[
                    { id: 'proposals', label: 'Bozze e Proposte' },
                    { id: 'snapshots', label: 'Copie locali e Ripristino' },
                    { id: 'transfers', label: 'Trasferimenti' },
                    { id: 'settings', label: 'Collegamenti AI & MCP' },
                    { id: 'compiler', label: 'Compilatore manuale' },
                    { id: 'system', label: 'Stato di Sistema' },
                    { id: 'help', label: 'Guida Vault' },
                  ].map((sub) => {
                    const isHelp = sub.id === 'help';
                    const active = (advancedTab === sub.id) || (currentTab === sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setAdvancedTab(sub.id as any);
                          setCurrentTab('advanced');
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: isHelp
                            ? active ? '2px solid #0f172a' : '1px solid rgba(119, 241, 23, 0.7)'
                            : active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          backgroundColor: isHelp
                            ? 'var(--limen-lime)'
                            : active ? '#0f172a' : '#ffffff',
                          color: isHelp
                            ? '#0f172a'
                            : active ? '#ffffff' : '#334155',
                          fontSize: 12,
                          fontWeight: isHelp ? 700 : 600,
                          cursor: 'pointer',
                          boxShadow: isHelp ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>

                {/* SUBTAB: PROPOSALS */}
                {(advancedTab === 'proposals' || currentTab === 'proposals' || currentTab === 'outputs') && vaultPath && (
                  <div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      <button
                        onClick={() => setCurrentTab('outputs')}
                        style={{ padding: '6px 12px', borderRadius: 6, backgroundColor: currentTab === 'outputs' ? '#0f172a' : '#f1f5f9', color: currentTab === 'outputs' ? '#fff' : '#334155', fontSize: 12, border: 'none', cursor: 'pointer' }}
                      >
                        Risposte AI salvate (80_AI_OUTPUTS)
                      </button>
                      <button
                        onClick={() => setCurrentTab('proposals')}
                        style={{ padding: '6px 12px', borderRadius: 6, backgroundColor: currentTab === 'proposals' || currentTab === 'advanced' ? '#0f172a' : '#f1f5f9', color: currentTab === 'proposals' || currentTab === 'advanced' ? '#fff' : '#334155', fontSize: 12, border: 'none', cursor: 'pointer' }}
                      >
                        Proposte manuali (90_PROPOSALS)
                      </button>
                    </div>
                    <ProposalPanel key={vaultPath + (currentTab === 'outputs' ? 'outputs' : 'proposals')} vaultPath={vaultPath} kind={currentTab === 'outputs' ? 'output' : 'proposal'} />
                  </div>
                )}

                {/* SUBTAB: SNAPSHOTS & RESTORE */}
                {(advancedTab === 'snapshots' || currentTab === 'snapshots') && (
                  <div className="limen-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>Copie locali e Ripristino guidato</h3>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Copie immutabili verificate SHA-256 in <code>00_SYSTEM/SNAPSHOTS/</code>. Il ripristino ricrea il Vault in una cartella separata senza sovrascritture distruttive.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Nota facoltativa..."
                          value={snapshotNoteInput}
                          onChange={(e) => setSnapshotNoteInput(e.target.value)}
                          disabled={isProcessing}
                          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, width: 200 }}
                        />
                        <button
                          onClick={handleCreateSnapshot}
                          disabled={isProcessing || !vaultPath}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: isProcessing || !vaultPath ? '#94a3b8' : '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 14px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: isProcessing || !vaultPath ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isProcessing ? <Loader2 size={14} className="spin" /> : <PlusCircle size={14} />}
                          <span>CREA COPIA LOCALE</span>
                        </button>
                      </div>
                    </div>

                    {restoreMessage && (
                      <div style={{ marginBottom: 16, backgroundColor: '#f0fdf4', padding: 12, borderRadius: 6, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534' }}>
                        {restoreMessage}
                      </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>ID copia</th>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>Data</th>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>Nota</th>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>File</th>
                          <th style={{ padding: '8px 12px', color: '#475569' }}>Integrità SHA-256</th>
                          <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'right' }}>Azione</th>
                        </tr>
                      </thead>
                      <tbody>
                        {snapshotsList.map((snap) => (
                          <tr key={snap.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, fontFamily: 'monospace' }}>{snap.id}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b' }}>
                              {snap.created_at ? new Date(snap.created_at).toLocaleString("it-IT") : 'N/A'}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#334155' }}>{snap.note || 'Copia locale'}</td>
                            <td style={{ padding: '10px 12px', color: '#475569' }}>{snap.manifest_file_count} file</td>
                            <td style={{ padding: '10px 12px' }}>
                              <StatusBadge
                                status={snap.integrity_status === 'valid' ? 'READY' : 'INVALID'}
                                label={snap.integrity_status === 'valid' ? 'Verificata (SHA-256)' : 'Incompleta'}
                              />
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleRestoreSnapshot(snap.id)}
                                disabled={isProcessing || snap.integrity_status !== 'valid'}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 4,
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#f8fafc',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: snap.integrity_status === 'valid' ? 'pointer' : 'not-allowed',
                                }}
                              >
                                RIPRISTINA IN CARTELLA SEPARATA
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB: TRANSFERS */}
                {(advancedTab === 'transfers' || currentTab === 'transfers') && <SyncPanel vaultPath={vaultPath!} />}

                {/* SUBTAB: SETTINGS */}
                {(advancedTab === 'settings' || currentTab === 'settings') && (
                  <>
                    {settingsGuideMessage && (
                      <div
                        style={{
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: 8,
                          padding: '12px 18px',
                          marginBottom: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e40af', fontSize: 13 }}>
                          <Info size={16} />
                          <span>{settingsGuideMessage}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSettingsGuideMessage(null);
                            setCurrentTab('ask');
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ← Torna a Chiedi a Limen
                        </button>
                      </div>
                    )}
                    <AiSettings key={vaultPath} vaultPath={vaultPath!} targetSection={settingsTargetSection} />
                    <div className="limen-card" style={{ padding: 24, maxWidth: 640 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>Impostazioni del Vault</h3>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                        Cartella locale del Vault
                      </label>
                      <input
                        type="text"
                        value={vaultPath || ''}
                        onChange={(e) => setVaultPath(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                      />
                    </div>
                  </>
                )}

                {/* SUBTAB: COMPILER */}
                {advancedTab === 'compiler' && (
                  <div className="limen-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Compilatore Markdown Manuale</h3>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Compila file di testo e Markdown in bozze <code>90_PROPOSALS/</code></div>
                      </div>
                      <button onClick={handleBatchCompile} disabled={isProcessing || !vaultPath} style={{ padding: '8px 14px', borderRadius: 6, backgroundColor: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        COMPILA FONTI TESTO
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBTAB: SYSTEM */}
                {(advancedTab === 'system' || currentTab === 'system') && (
                  <div className="limen-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>Stato del sistema locale</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 0', color: '#64748b' }}>Cartella del Vault</td>
                          <td style={{ padding: '10px 0', color: '#0f172a', fontWeight: 600 }}>{vaultPath}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 0', color: '#64748b' }}>Applicazione Obsidian</td>
                          <td style={{ padding: '10px 0', color: obsidianAvailable ? '#047857' : '#b91c1c', fontWeight: 600 }}>
                            {obsidianAvailable ? 'Rilevata e disponibile' : 'Non installata o non rilevata'}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 0', color: '#64748b' }}>Motore delle copie locali</td>
                          <td style={{ padding: '10px 0', color: '#047857', fontWeight: 600 }}>Attivo, con verifica SHA-256</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 0', color: '#64748b' }}>Ambiente di esecuzione</td>
                          <td style={{ padding: '10px 0', color: '#0f172a', fontWeight: 600 }}>{isTauriEnv ? `Applicazione nativa ${terms.osName}` : 'Anteprima nel browser'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB: HELP */}
                {(advancedTab === 'help' || currentTab === 'help') && (
                  <HelpPanel
                    vaultPath={vaultPath}
                    onOpenObsidian={handleOpenObsidian}
                    onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
      </div>

      <DocumentReaderModal
        isOpen={readerOpen}
        onClose={() => {
          setReaderOpen(false);
          setReaderTarget(null);
          setReaderPassageId(undefined);
          setReaderExpectedRevision(undefined);
          setReaderExpectedHash(undefined);
          setReaderQuery(undefined);
        }}
        vaultPath={vaultPath || ''}
        documentId={readerTarget}
        initialPassageId={readerPassageId}
        expectedRevision={readerExpectedRevision}
        expectedHash={readerExpectedHash}
        highlightQuery={readerQuery}
        ipc={ipc}
      />

      <SourceDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sources={selectedTurnSources}
        citations={selectedTurnItem?.answer?.citations || []}
        singleSource={modalSingleSource}
        technicalDetails={selectedTechnicalDetails}
        onOpenDocument={(req) => openReader(req.documentId, req.passageId, undefined, req.revision, req.sha256)}
      />

      <SetupWizardModal
        isOpen={setupWizardOpen}
        onClose={() => setSetupWizardOpen(false)}
        currentVaultPath={vaultPath}
        isVaultLoaded={vaultLoaded}
        vaultName={vaultName}
        onOpenVault={handleOpenVaultPath}
        onCreateVault={handleCreateVaultPath}
        onBrowseFolder={handleBrowseFolder}
        isTauriEnv={isTauriEnv}
      />

      <IndexingPromptModal
        isOpen={showIndexingPrompt}
        filesCount={importedFilesList.length || 1}
        fileNames={importedFilesList}
        isProcessing={isAutoIndexing}
        progressStep={autoIndexStep}
        progressPercent={autoIndexPercent}
        error={actionError}
        onProceed={handleOneClickAutoIndex}
        onPostpone={() => setShowIndexingPrompt(false)}
        onClose={() => setShowIndexingPrompt(false)}
      />
    </div>
  );
}
