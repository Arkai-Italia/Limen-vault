import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'it' | 'en';

export interface Translations {
  nav: {
    ask: string;
    documents: string;
    memory: string;
    advanced: string;
    upload: string;
    uploading: string;
    newChat: string;
    noConversations: string;
    clearHistoryTitle: string;
    sources: string;
    cited: string;
    citedPlural: string;
    showAll: string;
    openObsidian: string;
    overview: string;
    refresh: string;
    refreshing: string;
    noVault: string;
    turn: string;
    turns: string;
    language: string;
  };
  home: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    vaultFolder: string;
    browse: string;
    createVault: string;
    openVault: string;
    guidedSetup: string;
    metricsProcessedNotes: string;
    metricsRawSources: string;
    metricsProposals: string;
    metricsIntegrity: string;
    verified: string;
    unverified: string;
    diffDetected: string;
    allFilesMatch: string;
    checkFailed: string;
    quickAccess: string;
    rawSourcesTitle: string;
    rawSourcesDesc: string;
    knowledgeTitle: string;
    knowledgeDesc: string;
    askVaultButton: string;
  };
  ask: {
    placeholder: string;
    localMode: string;
    hybridMode: string;
    reasoning: string;
    citations: string;
    noCitations: string;
    searchFallback: string;
    send: string;
    clearHistory: string;
    switchModel: string;
    ready: string;
  };
  documents: {
    title: string;
    allFormats: string;
    markdown: string;
    pdf: string;
    text: string;
    spreadsheets: string;
    compileSources: string;
    refreshList: string;
    dragFiles: string;
    noDocuments: string;
  };
  memory: {
    title: string;
    allCategories: string;
    approved: string;
    drafts: string;
    pending: string;
    noNotes: string;
    refreshKnowledge: string;
  };
  wizard: {
    title: string;
    step1Title: string;
    step1Subtitle: string;
    step2Title: string;
    step2Subtitle: string;
    step3Title: string;
    step3Subtitle: string;
    enterApp: string;
    next: string;
    back: string;
    browseFolder: string;
    openFolder: string;
    createFolder: string;
    downloadModel: string;
    active: string;
    localOnlyTitle: string;
    localOnlyDesc: string;
    hybridTitle: string;
    hybridDesc: string;
    saveKey: string;
  };
  settings: {
    title: string;
    semanticEngine: string;
    localLlmCatalog: string;
    activeModel: string;
    setActive: string;
    download: string;
    installed: string;
    systemRam: string;
    minRam: string;
    recRam: string;
    statusHealthy: string;
    statusOffline: string;
    startService: string;
    stopService: string;
  };
  common: {
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    close: string;
    loading: string;
    copy: string;
    copied: string;
  };
}

export const translations: Record<Language, Translations> = {
  it: {
    nav: {
      ask: 'Chiedi',
      documents: 'Documenti',
      memory: 'Memoria',
      advanced: 'Avanzate',
      upload: 'CARICA',
      uploading: 'CARICAMENTO…',
      newChat: 'Nuova chat',
      noConversations: 'Nessuna conversazione',
      clearHistoryTitle: 'Svuota storico conversazioni',
      sources: 'Fonti',
      cited: 'citata',
      citedPlural: 'citate',
      showAll: 'Mostra tutte',
      openObsidian: 'Apri in Obsidian',
      overview: 'Panoramica',
      refresh: 'Aggiorna',
      refreshing: 'Aggiornamento…',
      noVault: 'Nessun Vault',
      turn: 'turno',
      turns: 'turni',
      language: 'Lingua',
    },
    home: {
      welcomeTitle: 'Benvenuto in LIMEN Vault',
      welcomeSubtitle: 'Ambiente di conoscenza locale, indipendente e riservato.',
      vaultFolder: 'Percorso della cartella Vault',
      browse: 'Sfoglia…',
      createVault: 'CREA VAULT',
      openVault: 'APRI VAULT',
      guidedSetup: 'CONFIGURAZIONE GUIDATA',
      metricsProcessedNotes: 'Note elaborate',
      metricsRawSources: 'Fonti originali',
      metricsProposals: 'Proposte',
      metricsIntegrity: 'Integrità SHA-256',
      verified: 'Verificata',
      unverified: 'Non verificata',
      diffDetected: 'Differenze rilevate',
      allFilesMatch: 'Tutti i file corrispondono alle impronte SHA-256',
      checkFailed: 'Verifica non completata',
      quickAccess: 'Accesso rapido',
      rawSourcesTitle: 'Vault / RAW',
      rawSourcesDesc: 'Note originali, brief e file sorgente',
      knowledgeTitle: 'Vault / Memoria',
      knowledgeDesc: 'Note strutturate e compilate',
      askVaultButton: 'Chiedi al Vault',
    },
    ask: {
      placeholder: 'Fai una domanda sulla tua conoscenza…',
      localMode: '100% Solo Locale',
      hybridMode: 'Ibrido OpenAI',
      reasoning: 'Ragionamento analitico',
      citations: 'Fonti citate',
      noCitations: 'Nessuna citazione richiesta',
      searchFallback: 'Ricerca semantica / lessicale',
      send: 'Invia',
      clearHistory: 'Nuova chat',
      switchModel: 'Cambia modello',
      ready: 'Pronto',
    },
    documents: {
      title: 'Documenti e Fonti',
      allFormats: 'Tutti i formati',
      markdown: 'Markdown',
      pdf: 'PDF',
      text: 'Testo',
      spreadsheets: 'Fogli di calcolo',
      compileSources: 'Compila fonti',
      refreshList: 'Aggiorna elenco',
      dragFiles: 'Trascina qui i tuoi documenti da importare nel Vault',
      noDocuments: 'Nessun documento trovato',
    },
    memory: {
      title: 'Memoria Aziendale',
      allCategories: 'Tutte le note',
      approved: 'Approvate',
      drafts: 'Bozze',
      pending: 'Da revisionare',
      noNotes: 'Nessuna nota presente in questa categoria.',
      refreshKnowledge: 'Aggiorna memoria',
    },
    wizard: {
      title: 'Configurazione Iniziale',
      step1Title: 'Cartella Vault',
      step1Subtitle: 'Seleziona o crea il Vault locale',
      step2Title: 'Motore AI Locale',
      step2Subtitle: 'Modello open-source per risposte offline',
      step3Title: 'Modalità & Chiave API',
      step3Subtitle: 'Scegli tra 100% Locale o Cloud Ibrido',
      enterApp: 'Entra in LIMEN Vault',
      next: 'Avanti',
      back: 'Indietro',
      browseFolder: 'Sfoglia cartella…',
      openFolder: 'Apri cartella',
      createFolder: 'Crea nuova cartella',
      downloadModel: 'Scarica modello',
      active: 'Attivo',
      localOnlyTitle: 'Modalità 100% Solo Locale',
      localOnlyDesc: 'Zero chiamate di rete. Riservatezza assoluta.',
      hybridTitle: 'Modalità Ibrida OpenAI',
      hybridDesc: 'Usa la tua chiave API per modelli cloud avanzati.',
      saveKey: 'Salva chiave',
    },
    settings: {
      title: 'Impostazioni',
      semanticEngine: 'Motore Semantico',
      localLlmCatalog: 'Catalogo LLM Locali (GGUF)',
      activeModel: 'Modello Attivo',
      setActive: 'Imposta come Attivo',
      download: 'Scarica',
      installed: 'Installato',
      systemRam: 'RAM di Sistema',
      minRam: 'Minimo',
      recRam: 'Consigliato',
      statusHealthy: 'In esecuzione',
      statusOffline: 'Non avviato',
      startService: 'Avvia servizio',
      stopService: 'Arresta servizio',
    },
    common: {
      error: 'Errore',
      success: 'Operazione completata con successo',
      cancel: 'Annulla',
      save: 'Salva',
      delete: 'Elimina',
      close: 'Chiudi',
      loading: 'Caricamento…',
      copy: 'Copia',
      copied: 'Copiato!',
    },
  },
  en: {
    nav: {
      ask: 'Ask',
      documents: 'Documents',
      memory: 'Memory',
      advanced: 'Advanced',
      upload: 'UPLOAD',
      uploading: 'UPLOADING…',
      newChat: 'New chat',
      noConversations: 'No conversations',
      clearHistoryTitle: 'Clear conversation history',
      sources: 'Sources',
      cited: 'cited',
      citedPlural: 'cited',
      showAll: 'Show all',
      openObsidian: 'Open in Obsidian',
      overview: 'Overview',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      noVault: 'No Vault',
      turn: 'turn',
      turns: 'turns',
      language: 'Language',
    },
    home: {
      welcomeTitle: 'Welcome to LIMEN Vault',
      welcomeSubtitle: 'Local, private, and independent knowledge base.',
      vaultFolder: 'Vault folder path',
      browse: 'Browse…',
      createVault: 'CREATE VAULT',
      openVault: 'OPEN VAULT',
      guidedSetup: 'SETUP WIZARD',
      metricsProcessedNotes: 'Processed Notes',
      metricsRawSources: 'Raw Sources',
      metricsProposals: 'Proposals',
      metricsIntegrity: 'SHA-256 Integrity',
      verified: 'Verified',
      unverified: 'Unverified',
      diffDetected: 'Differences detected',
      allFilesMatch: 'All files match SHA-256 checksums',
      checkFailed: 'Integrity check incomplete',
      quickAccess: 'Quick Access',
      rawSourcesTitle: 'Vault / RAW',
      rawSourcesDesc: 'Raw notes, briefs, and source files',
      knowledgeTitle: 'Vault / Memory',
      knowledgeDesc: 'Structured and compiled knowledge',
      askVaultButton: 'Ask the Vault',
    },
    ask: {
      placeholder: 'Ask a question about your knowledge…',
      localMode: '100% Local Only',
      hybridMode: 'Hybrid OpenAI',
      reasoning: 'Analytical Reasoning',
      citations: 'Cited sources',
      noCitations: 'No citations needed',
      searchFallback: 'Semantic / lexical search',
      send: 'Send',
      clearHistory: 'New chat',
      switchModel: 'Switch model',
      ready: 'Ready',
    },
    documents: {
      title: 'Documents & Sources',
      allFormats: 'All formats',
      markdown: 'Markdown',
      pdf: 'PDF',
      text: 'Text',
      spreadsheets: 'Spreadsheets',
      compileSources: 'Compile sources',
      refreshList: 'Refresh list',
      dragFiles: 'Drag and drop documents here to import into Vault',
      noDocuments: 'No documents found',
    },
    memory: {
      title: 'Company Memory',
      allCategories: 'All notes',
      approved: 'Approved',
      drafts: 'Drafts',
      pending: 'In review',
      noNotes: 'No notes found in this category.',
      refreshKnowledge: 'Refresh memory',
    },
    wizard: {
      title: 'Initial Setup',
      step1Title: 'Vault Folder',
      step1Subtitle: 'Select or create your local Vault',
      step2Title: 'Local AI Engine',
      step2Subtitle: 'Open-source model for offline queries',
      step3Title: 'Mode & API Key',
      step3Subtitle: 'Choose 100% Local or Hybrid Cloud',
      enterApp: 'Enter LIMEN Vault',
      next: 'Next',
      back: 'Back',
      browseFolder: 'Browse folder…',
      openFolder: 'Open folder',
      createFolder: 'Create new folder',
      downloadModel: 'Download model',
      active: 'Active',
      localOnlyTitle: '100% Local Only Mode',
      localOnlyDesc: 'Zero network calls. Total privacy guaranteed.',
      hybridTitle: 'OpenAI Hybrid Mode',
      hybridDesc: 'Use your API key for advanced cloud models.',
      saveKey: 'Save key',
    },
    settings: {
      title: 'Settings',
      semanticEngine: 'Semantic Engine',
      localLlmCatalog: 'Local LLM Catalog (GGUF)',
      activeModel: 'Active Model',
      setActive: 'Set as Active',
      download: 'Download',
      installed: 'Installed',
      systemRam: 'System RAM',
      minRam: 'Minimum',
      recRam: 'Recommended',
      statusHealthy: 'Running',
      statusOffline: 'Stopped',
      startService: 'Start service',
      stopService: 'Stop service',
    },
    common: {
      error: 'Error',
      success: 'Operation completed successfully',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      close: 'Close',
      loading: 'Loading…',
      copy: 'Copy',
      copied: 'Copied!',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'it',
  setLanguage: () => {},
  t: translations.it,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('limen_language');
        if (saved === 'it' || saved === 'en') return saved;
      } catch {}
    }
    // Rilevamento automatico lingua macOS
    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('it')) return 'it';
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('limen_language', lang);
      } catch {}
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation() {
  return useContext(LanguageContext);
}

/**
 * Componente switcher compatto IT | EN per la barra di navigazione
 */
export const LanguageToggle: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { language, setLanguage } = useTranslation();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
        padding: '2px',
        border: '1px solid #cbd5e1',
        fontSize: 11,
        fontWeight: 600,
        userSelect: 'none',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setLanguage('it')}
        style={{
          border: 'none',
          padding: '2px 7px',
          borderRadius: 12,
          backgroundColor: language === 'it' ? '#0f172a' : 'transparent',
          color: language === 'it' ? '#ffffff' : '#64748b',
          cursor: 'pointer',
          fontWeight: language === 'it' ? 700 : 500,
          transition: 'all 0.15s ease',
        }}
      >
        IT
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        style={{
          border: 'none',
          padding: '2px 7px',
          borderRadius: 12,
          backgroundColor: language === 'en' ? '#0f172a' : 'transparent',
          color: language === 'en' ? '#ffffff' : '#64748b',
          cursor: 'pointer',
          fontWeight: language === 'en' ? 700 : 500,
          transition: 'all 0.15s ease',
        }}
      >
        EN
      </button>
    </div>
  );
};
