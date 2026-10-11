import React from 'react';
import { getPlatformTerms } from './platform';
import type { Language } from './i18n';

// Labels are presentation only: persisted metadata and IPC values stay unchanged.
const labelsIt: Record<string, string> = {
  clients: 'Clienti', client: 'Cliente', projects: 'Progetti', project: 'Progetto',
  brands: 'Marchi', brand: 'Marchio', positioning: 'Posizionamento', packaging: 'Confezionamento',
  methods: 'Metodi', method: 'Metodo', case_studies: 'Casi studio', case_study: 'Caso studio',
  research: 'Ricerca di mercato', competitors: 'Concorrenti', competitor: 'Concorrente',
  approved_outputs: 'Contenuti approvati', approved_output: 'Contenuto approvato',
  proposal: 'Proposta', ai_output: 'Risposta AI', output: 'Risposta AI',
  private: 'Privata', approved: 'Approvata', draft: 'Bozza', review: 'In revisione', archived: 'Archiviata',
  pending: 'Da revisionare', rejected: 'Rifiutata', unspecified: 'Non specificato',
  READY: 'Pronto', NOT_CONFIGURED: 'Non configurato', OFFLINE: 'Non connesso',
  DISABLED: 'Disattivato', VERIFYING: 'Verifica in corso', AUTH_REQUIRED: 'Autenticazione richiesta',
  TRANSFERRING: 'Trasferimento in corso', FAILED: 'Non riuscito', CONFLICT: 'Conflitto',
  CONNECTING: 'Collegamento in corso', EXPIRED: 'Scaduto', REVOKED: 'Revocato',
  COMPILED: 'Compilata', CHANGED: 'Modificata', NEW: 'Nuova', UNSUPPORTED: 'Non supportata',
  ERROR: 'Errore', UNCOMPILED: 'Da compilare', UNCHANGED: 'Invariata',
  compiled: 'Compilata', changed: 'Modificata', unsupported: 'Non supportata',
  ai: 'Intelligenza artificiale', compiler: 'Compilazione delle fonti',
};

const labelsEn: Record<string, string> = {
  clients: 'Clients', client: 'Client', projects: 'Projects', project: 'Project',
  brands: 'Brands', brand: 'Brand', positioning: 'Positioning', packaging: 'Packaging',
  methods: 'Methods', method: 'Method', case_studies: 'Case Studies', case_study: 'Case Study',
  research: 'Market Research', competitors: 'Competitors', competitor: 'Competitor',
  approved_outputs: 'Approved Content', approved_output: 'Approved Content',
  proposal: 'Proposal', ai_output: 'AI Output', output: 'AI Output',
  private: 'Private', approved: 'Approved', draft: 'Draft', review: 'In Review', archived: 'Archived',
  pending: 'Pending Review', rejected: 'Rejected', unspecified: 'Unspecified',
  READY: 'Ready', NOT_CONFIGURED: 'Not Configured', OFFLINE: 'Offline',
  DISABLED: 'Disabled', VERIFYING: 'Verifying', AUTH_REQUIRED: 'Auth Required',
  TRANSFERRING: 'Transferring', FAILED: 'Failed', CONFLICT: 'Conflict',
  CONNECTING: 'Connecting', EXPIRED: 'Expired', REVOKED: 'Revoked',
  COMPILED: 'Compiled', CHANGED: 'Modified', NEW: 'New', UNSUPPORTED: 'Unsupported',
  ERROR: 'Error', UNCOMPILED: 'Uncompiled', UNCHANGED: 'Unchanged',
  compiled: 'Compiled', changed: 'Modified', unsupported: 'Unsupported',
  ai: 'Artificial Intelligence', compiler: 'Source Compiler',
};

function getCurrentLang(): Language {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('limen_language');
      if (saved === 'it' || saved === 'en') return saved;
    } catch {}
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    if (navigator.language.toLowerCase().startsWith('it')) return 'it';
  }
  return 'en';
}

export function labelIt(value: string | null | undefined, lang?: Language): string {
  const activeLang = lang ?? getCurrentLang();
  const dict = activeLang === 'en' ? labelsEn : labelsIt;
  if (!value) return activeLang === 'en' ? 'Unspecified' : 'Non specificato';
  return dict[value] ?? labelsIt[value] ?? value;
}

function getMessages(lang: Language): Record<string, string> {
  const { keychainTerm } = getPlatformTerms();
  if (lang === 'en') {
    return {
      'Configure API key in Settings': 'Configure the API key in Settings.',
      'Select an API model': 'Select an API model available in your account.',
      'Invalid API key format': 'Invalid API key format.',
      'Keychain access denied or unavailable': `Access to ${keychainTerm} denied or unavailable.`,
      'Unable to remove Keychain entry': `Unable to remove key from ${keychainTerm}.`,
      'Invalid tunnel or organization ID': 'Invalid tunnel or organization ID.',
      'Configure a tunnel runtime key in Keychain': `Save the tunnel key in ${keychainTerm}.`,
      'Tunnel Keychain access denied': `Access to tunnel key in ${keychainTerm} denied.`,
      'Vault validation failed': 'Vault validation failed.',
      'Vault path is not a directory': 'Vault path is not a directory.',
      'Preview expired; select sources again': 'Preview expired; select sources again.',
      'Preview expired or no eligible sources': 'Preview expired or no eligible sources found.',
      'An AI request is already running': 'An AI request is already running.',
      'Source changed since preview': 'A source changed since preview. Please generate a new preview.',
      'Request cancelled': 'Request cancelled.',
      'Document access denied': 'Document access denied.',
      'Knowledge document changed during read': 'Note changed during read. Please refresh.',
      'Category preview exceeds 8 MiB': 'Category preview exceeds 8 MiB limit.',
    };
  }
  return {
    'Configure API key in Settings': 'Configura la chiave API nelle Impostazioni.',
    'Select an API model': 'Indica un modello API disponibile nel tuo account.',
    'Invalid API key format': 'Il formato della chiave API non è valido.',
    'Keychain access denied or unavailable': `Accesso al ${keychainTerm} negato o non disponibile.`,
    'Unable to remove Keychain entry': `Impossibile rimuovere la chiave dal ${keychainTerm}.`,
    'Invalid tunnel or organization ID': 'ID del tunnel o dell’organizzazione non valido.',
    'Configure a tunnel runtime key in Keychain': 'Salva la chiave del tunnel nelle Impostazioni.',
    'Tunnel Keychain access denied': `Accesso alla chiave del tunnel nel ${keychainTerm} negato.`,
    'Vault validation failed': 'Il Vault non ha superato la validazione.',
    'Vault path is not a directory': 'Il percorso del Vault non indica una cartella.',
    'Preview expired; select sources again': 'Anteprima scaduta. Seleziona nuovamente le fonti.',
    'Preview expired or no eligible sources': 'Anteprima scaduta o nessuna fonte utilizzabile. Aggiorna l’indice e controlla le note approvate.',
    'An AI request is already running': 'È già in corso una richiesta AI.',
    'Source changed since preview': 'Una fonte è cambiata dopo l’anteprima. Prepara una nuova anteprima.',
    'Request cancelled': 'Richiesta annullata.',
    'Document access denied': 'Accesso al documento negato.',
    'Knowledge document changed during read': 'La nota è cambiata durante la lettura. Aggiorna la schermata.',
    'Category preview exceeds 8 MiB': 'L’anteprima della categoria supera il limite di 8 MiB.',
  };
}

export function MessageIt({ value, lang }: { value: unknown; lang?: Language }) {
  const activeLang = lang ?? getCurrentLang();
  const raw = value instanceof Error ? value.message : String(value ?? '');
  const key = raw.replace(/^Error: /, '');
  const messages = getMessages(activeLang);
  if (messages[key]) return <>{messages[key]}</>;
  if (activeLang === 'it' && /[àèéìòù’]|\b(Errore|Impossibile|Nessun|Nessuna|non|Annullamento|Collegamento|Verifica|Pubblicazione|attendo|Salvata|Bozza)\b/i.test(key)) {
    return <>{key}</>;
  }
  if (activeLang === 'en') {
    return (
      <>
        <span>Operation could not be completed. Check technical details below.</span>
        <span style={{ display: 'block' }}>
          Original error: <code style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{raw}</code>
        </span>
      </>
    );
  }
  return (
    <>
      <span>Operazione non completata. Consulta il dettaglio tecnico per identificare la causa.</span>
      <span style={{ display: 'block' }}>
        Dettaglio tecnico originale: <code style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{raw}</code>
      </span>
    </>
  );
}
