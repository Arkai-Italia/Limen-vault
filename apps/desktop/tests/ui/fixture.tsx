import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { VaultPanel } from '../../src/VaultPanel';
import { AiPanel } from '../../src/AiPanel';
import { IndexingPromptModal } from '../../src/IndexingPromptModal';
import { LanguageProvider } from '../../src/i18n';
(window as any).__TAURI_INTERNALS__ = {};
(window as any).__calls = [];
function Fixture() {
  const panel = new URLSearchParams(location.search).get('panel');
  const [section, setSection] = useState('');
  const [open, setOpen] = useState(true);
  const [manual, setManual] = useState(false);
  return <LanguageProvider><main style={{ height: '95vh', fontFamily: 'Arial', '--limen-lime': '#c8ff00' } as React.CSSProperties}>
    {panel === 'vault' ? <VaultPanel vaultPath="/fixture" onOpenReader={p => setSection(p)} onRevealInFinder={async p => { setSection(`Finder: ${p}`); }} /> :
      panel === 'import' ? <IndexingPromptModal isOpen={open} filesCount={2} fileNames={['Uno.txt', 'Due.txt']} isProcessing={false} onProceed={() => setSection('index-requested')} onPostpone={() => { setOpen(false); setSection('postponed'); }} /> :
      <AiPanel vaultPath="/fixture" showManualSearch={manual} onToggleManualSearch={() => setManual(v => !v)} onNavigateToSettings={s => setSection(s)} />}
    <output aria-label="Esito fixture">{section}</output>
  </main></LanguageProvider>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
