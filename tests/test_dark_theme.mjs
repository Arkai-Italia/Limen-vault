import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- TEST COLLAUDO TEMA SCURO & SWITCH TOP NAVBAR ---');

const rootDir = process.cwd();

// 1. Verifica token CSS in packages/ui/src/styles.css
const stylesCssPath = path.join(rootDir, 'packages/ui/src/styles.css');
assert(fs.existsSync(stylesCssPath), 'File packages/ui/src/styles.css non trovato');
const stylesCss = fs.readFileSync(stylesCssPath, 'utf-8');

assert(stylesCss.includes('--limen-bg-app: #0e0e0e;'), 'Manca --limen-bg-app: #0e0e0e in styles.css');
assert(stylesCss.includes('--limen-lime: #8d632d;'), 'Manca accent #8d632d in styles.css');
assert(stylesCss.includes('--limen-chat-box-bg: #212121;'), 'Manca --limen-chat-box-bg: #212121 in styles.css');
console.log('✓ Token CSS dark verificati in packages/ui/src/styles.css');

// 2. Verifica token CSS in apps/desktop/src/index.css
const indexCssPath = path.join(rootDir, 'apps/desktop/src/index.css');
assert(fs.existsSync(indexCssPath), 'File apps/desktop/src/index.css non trovato');
const indexCss = fs.readFileSync(indexCssPath, 'utf-8');

assert(indexCss.includes('--limen-bg-app: #0e0e0e;'), 'Manca --limen-bg-app: #0e0e0e in index.css');
assert(indexCss.includes('--limen-lime: #8d632d;'), 'Manca accent #8d632d in index.css');
assert(indexCss.includes('--limen-chat-box-bg: #212121;'), 'Manca --limen-chat-box-bg: #212121 in index.css');
console.log('✓ Token CSS dark verificati in apps/desktop/src/index.css');

// 3. Verifica ThemeToggle.tsx
const themeTogglePath = path.join(rootDir, 'apps/desktop/src/ThemeToggle.tsx');
assert(fs.existsSync(themeTogglePath), 'File apps/desktop/src/ThemeToggle.tsx non trovato');
const themeToggle = fs.readFileSync(themeTogglePath, 'utf-8');

assert(themeToggle.includes('export const ThemeToggle'), 'ThemeToggle non esportato correttamente');
assert(themeToggle.includes('localStorage.setItem'), 'ThemeToggle non gestisce localStorage');
assert(themeToggle.includes("document.documentElement.setAttribute('data-theme', 'dark')"), 'ThemeToggle non imposta data-theme su documentElement');
assert(themeToggle.includes('#8d632d'), 'ThemeToggle non usa il colore accent per il pulsante attivo dark');
console.log('✓ Componente ThemeToggle.tsx verificato');

// 4. Verifica Top Navbar in App.tsx
const appTsxPath = path.join(rootDir, 'apps/desktop/src/App.tsx');
const appTsx = fs.readFileSync(appTsxPath, 'utf-8');

assert(appTsx.includes("import {ThemeToggle} from './ThemeToggle'"), 'Manca import ThemeToggle in App.tsx');
assert(appTsx.includes('<ThemeToggle />'), 'Manca <ThemeToggle /> nel JSX di App.tsx');
assert(appTsx.includes('var(--limen-bg-navbar'), 'Top navbar non usa variabile di tema per lo sfondo');
console.log('✓ Top Navbar in App.tsx include ThemeToggle e rispetta il tema');

// 5. Verifica Casella Chat in AiPanel.tsx
const aiPanelPath = path.join(rootDir, 'apps/desktop/src/AiPanel.tsx');
const aiPanel = fs.readFileSync(aiPanelPath, 'utf-8');

assert(aiPanel.includes('var(--limen-chat-box-bg'), 'AiPanel non usa var(--limen-chat-box-bg) sulla casella chat');
assert(aiPanel.includes('var(--limen-accent-primary'), 'AiPanel non usa var(--limen-accent-primary) sul pulsante Invia');
// 6. Verifica Aree Screenshot Evidenziate in Giallo
// Area 1: Top bar & pending indexing banner in AiPanel
assert(aiPanel.includes("backgroundColor: 'var(--limen-bg-navbar, #ffffff)'"), 'Toolbar superiore AiPanel non usa var(--limen-bg-navbar)');
assert(aiPanel.includes("backgroundColor: 'var(--limen-status-warn-bg, #fef3c7)'"), 'Banner indicizzazione pendente non usa var(--limen-status-warn-bg)');
console.log('✓ Area 1 (Toolbar superiore e Banner AiPanel) conforme al tema scuro');

// Area 2: Sidebar footer in App.tsx (pulsante fonti, logo BNXT1, pulsante Obsidian)
assert(appTsx.includes("backgroundColor: 'var(--limen-bg-surface, #ffffff)',\n                border: '1px solid var(--limen-border-light)'"), 'Pulsante Fonti in sidebar footer non usa var(--limen-bg-surface)');
assert(appTsx.includes("filter: 'var(--limen-logo-filter, none)'"), 'Logo BNXT1 / Limen non usa filter per la visibilità in tema scuro');
assert(appTsx.includes("backgroundColor: vaultLoaded && obsidianAvailable ? 'var(--limen-bg-surface, #ffffff)' : 'var(--limen-bg-subtle, #f8fafc)'"), 'Pulsante Apri con Obsidian non usa var(--limen-bg-surface)');
console.log('✓ Area 2 (Footer Sidebar: Fonti, Logo BNXT1, Apri con Obsidian) conforme al tema scuro');

// Area 3: Bottom chat container in AiPanel
assert(aiPanel.includes("backgroundColor: 'var(--limen-bg-navbar, #ffffff)',\n          boxShadow: 'var(--limen-shadow-sm"), 'Container fisso chat inferiore non usa var(--limen-bg-navbar)');
console.log('✓ Area 3 (Container inferiore fisso della chat) conforme al tema scuro');

console.log('--- TUTTI I CONTROLLI DEL TEMA SCURO E DELLE AREE SCREENSHOT SUPERATI CON SUCCESSO (0 ERRORI) ---');

