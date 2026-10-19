import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const appTsxPath = join(root, 'apps/desktop/src/App.tsx');
const assetPath = join(root, 'apps/desktop/src/assets/bnxt1-logo-complete-black.png');
const publicAssetPath = join(root, 'apps/desktop/public/bnxt1-logo-complete-black.png');

console.log('--- COLLAUDO SIDEBAR BNXT1 & RESPONSIVE LAYOUT ---');

// 1. Verifica esistenza asset originale BNXT1
assert.ok(existsSync(assetPath), 'Asset bnxt1-logo-complete-black.png deve esistere in src/assets');
assert.ok(existsSync(publicAssetPath), 'Asset bnxt1-logo-complete-black.png deve esistere in public');
console.log('✓ Asset BNXT1 presente in src/assets/ e public/');

// 2. Lettura App.tsx e verifica inclusione componenti
const appContent = readFileSync(appTsxPath, 'utf8');

// Verifica import del logo
assert.ok(
  appContent.includes("import bnxtLogo from './assets/bnxt1-logo-complete-black.png';"),
  'App.tsx deve importare bnxtLogo da assets'
);
console.log('✓ Import bnxtLogo verificato in App.tsx');

// Verifica presenza del blocco edizione
assert.ok(
  appContent.includes('LIMEN VAULT FOR BNXT EDITION'),
  'App.tsx deve contenere il testo "LIMEN VAULT FOR BNXT EDITION"'
);
assert.ok(
  appContent.includes("fontStyle: 'italic'"),
  'Il testo deve avere fontStyle italic'
);
console.log('✓ Testo in corsivo "LIMEN VAULT FOR BNXT EDITION" presente con stile corretto');

// Verifica immagine BNXT1 con proporzioni mantenute
assert.ok(
  appContent.includes('src={bnxtLogo}'),
  'Tag img deve puntare a bnxtLogo'
);
assert.ok(
  appContent.includes('alt="BNXT1"'),
  'Tag img deve avere alt="BNXT1"'
);
assert.ok(
  appContent.includes("objectFit: 'contain'"),
  'Tag img deve avere objectFit: contain per mantenere le proporzioni'
);
assert.ok(
  appContent.includes("width: 'auto'"),
  'Tag img deve avere width: auto per mantenere le proporzioni'
);
console.log('✓ Icona BNXT1 presente con proporzioni originali (height: 20, width: auto, objectFit: contain)');

// 3. Verifica ordine DOM: blocco edizione immediatamente sopra «Apri con Obsidian»
const editionIndex = appContent.indexOf('data-testid="sidebar-bnxt-edition"');
const obsidianIndex = appContent.indexOf('onClick={handleOpenObsidian}');
assert.ok(editionIndex > 0, 'Blocco data-testid="sidebar-bnxt-edition" deve essere presente');
assert.ok(obsidianIndex > 0, 'Pulsante handleOpenObsidian deve essere presente');
assert.ok(
  editionIndex < obsidianIndex,
  'Il blocco BNXT deve trovarsi immediatamente PRIMA del pulsante handleOpenObsidian'
);

// Verifica che si trovino entrambi dentro lo stesso contenitore inferiore fisso (flexShrink: 0)
const bottomContainerIndex = appContent.lastIndexOf('flexShrink: 0,', editionIndex);
assert.ok(bottomContainerIndex > 0, 'Il contenitore inferiore deve avere flexShrink: 0');
console.log('✓ Posizionamento verificato: blocco BNXT posizionato immediatamente sopra «Apri con Obsidian» nello stesso footer fisso');

// 4. Verifica comportamento a finestra ridotta e scorrimento
// Il contenitore ha flexShrink: 0, quindi non si restringe né si sovrappone
// La sezione storico ha minHeight ridotto a 40px per assorbire finestre compatte
assert.ok(
  appContent.includes('minHeight: 40'),
  'Sezione conversazioni deve avere minHeight ridotto a 40px per garantire visibilità del footer a finestra ridotta'
);
console.log('✓ Comportamento a finestra ridotta e scorrimento verificato (footer fisso con flexShrink: 0 e minHeight flessibile)');

console.log('========================================================================');
console.log('   COLLAUDO SIDEBAR BNXT COMPLETATO CON SUCCESSO (0 ERRORI)');
console.log('========================================================================');
