import { VaultStatusBanner } from '../../../../packages/ui/src/components/VaultStatusBanner';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { VaultPanel } from '../../src/VaultPanel';
import { AiPanel } from '../../src/AiPanel';
import { IndexingPromptModal } from '../../src/IndexingPromptModal';
import { useCatalogDocuments } from '../../src/useCatalogDocuments';
import { useNativeFileDrop } from '../../src/useNativeFileDrop';
import type { CatalogListOptions, CatalogListResponse } from '../../src/vault-ipc';
import { LanguageProvider } from '../../src/i18n';
(window as any).__TAURI_INTERNALS__ = {};
(window as any).__calls = [];
const loadDocuments = async (_path: string, options: CatalogListOptions): Promise<CatalogListResponse> => {
  (window as any).__calls.push({ command: 'catalog_list_documents', options });
  if (options.format === 'pdf') await new Promise(r => setTimeout(r, 700));
  const documents = [{ fileName: 'uno.pdf', extension: 'pdf' }, { fileName: 'due.md', extension: 'md' }]
    .filter(d => !options.format || d.extension === options.format)
    .filter(d => !options.filter || d.fileName.includes(options.filter));
  return { documents, total: 2, filteredTotal: documents.length, catalogRevision: 1 } as CatalogListResponse;
};
function DocumentsFixture() {
  const [format, setFormat] = useState('all');
  const [query, setQuery] = useState('');
  const result = useCatalogDocuments(loadDocuments, '/fixture', true, 0, format, 'all', query);
  return <section>
    {['all', 'pdf', 'md', 'xlsx'].map(f => <button key={f} onClick={() => setFormat(f)}>{f}</button>)}
    <input aria-label="Nome file" value={query} onChange={e => setQuery(e.target.value)} />
    <output aria-label="Documenti">{result.loading ? 'Caricamento' : result.documents.map(d => d.fileName).join(',') || 'Nessun documento'}</output>
  </section>;
}
function DropFixture() {
  const [paths, setPaths] = useState<string[]>([]);
  const [hover, setHover] = useState(false);
  const [error, setError] = useState('');
  useNativeFileDrop(true, async p => { setPaths(p); }, setHover, setError);
  return <output aria-label="Trascinamento">{hover ? 'Rilascia' : paths.join(',') || error}</output>;
}
function Fixture() {
  const panel = new URLSearchParams(location.search).get('panel');
  const [section, setSection] = useState('');
  const [open, setOpen] = useState(true);
  const [manual, setManual] = useState(false);
  return <LanguageProvider><main style={{ height: '95vh', fontFamily: 'Arial', '--limen-lime': '#c8ff00' } as React.CSSProperties}>
    {panel === 'banner' ? <VaultStatusBanner status="READY" vaultPath="/fixture" vaultName="Vault test" dismissible onOpenObsidian={() => {}} /> : panel === 'documents' ? <DocumentsFixture /> : panel === 'drop' ? <DropFixture /> : panel === 'vault' ? <VaultPanel vaultPath="/fixture" onOpenReader={p => setSection(p)} onRevealInFinder={async p => { setSection(`Finder: ${p}`); }} /> :
      panel === 'import' ? <IndexingPromptModal isOpen={open} filesCount={2} fileNames={['Uno.txt', 'Due.txt']} isProcessing={false} onProceed={() => setSection('index-requested')} onPostpone={() => { setOpen(false); setSection('postponed'); }} /> :
      <AiPanel vaultPath="/fixture" showManualSearch={manual} onToggleManualSearch={() => setManual(v => !v)} onNavigateToSettings={s => setSection(s)} />}
    <output aria-label="Esito fixture">{section}</output>
  </main></LanguageProvider>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
