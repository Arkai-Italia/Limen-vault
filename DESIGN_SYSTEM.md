# LIMEN Vault — Design System UI

Stato: riferimento consolidato dal codice locale, 11 ottobre 2026. Non modifica la UI.
Ambito: applicazione desktop. Per la landing premium CHIARA richiesta dall’utente vedere STITCH_DESIGN.md.

## Fonti e precedenza

1. `packages/ui/src/styles.css`: token condivisi e classi dei componenti.
2. `apps/desktop/src/index.css`: accenti lime.
3. `apps/desktop/src/App.tsx`: composizione, sidebar, azione Carica Documenti.
4. `packages/ui/src/components/`: EmptyState, MetricCard, StatusBadge, VaultStatusBanner.
5. Pacchetto storico: `DOCUMENTATION_SOURCE_PACKAGE/08_DESIGN_SYSTEM_HANDOFF/`.

Il design system esisteva già come manifest, token YAML e documenti separati.
La guida storica VISUAL_UI_REFERENCE.md descrive un tema Dark-Glass; non coincide con
il tema principale Light Slate dei CSS attuali. In caso di conflitto prevale il codice.
Il manifest storico contiene un gate editoriale HOLD: questo documento non lo approva
né attesta un nuovo collaudo visivo della release. Le seguenti misure sono riscontri sul codice.

## Identità

LIMEN Vault trasforma documenti in conoscenza ricercabile: acquisizione, estrazione del
testo, note Markdown, indicizzazione, ricerca RAG e wiki tematiche automatiche.
Markdown è un formato di archiviazione, non un prerequisito per l'utente.
Obsidian è una compatibilità opzionale, non il posizionamento principale.

Logo sorgente: `apps/desktop/src/assets/limenvault-logo.png`.
Copia pubblica: `docs/assets/limenvault-logo.png`.
Icone app: `apps/desktop/src-tauri/icons/` (distinte dal wordmark e dalla copertina).
Preservare proporzioni e segni del logo; non ricomporlo con un font simile.

## Colori verificati

| Token CSS | Valore | Uso |
|---|---|---|
| --limen-bg-app | #f8fafc | Sfondo app |
| --limen-bg-surface | #ffffff | Superfici e card |
| --limen-bg-sidebar | #f1f5f9 | Navigazione laterale |
| --limen-bg-subtle | #f8fafc | Superfici secondarie |
| --limen-text-primary | #0f172a | Testo principale |
| --limen-text-secondary | #475569 | Testo secondario |
| --limen-text-muted | #94a3b8 | Testo attenuato; verificare contrasto prima di riuso |
| --limen-border-light | #e2e8f0 | Bordi leggeri |
| --limen-border-subtle | #cbd5e1 | Bordi enfatizzati |
| --limen-accent-primary | #0f172a | Azioni principali scure |
| --limen-accent-hover | #1e293b | Hover |
| --limen-lime | #77F117 | Accento brand |
| valore locale in App.tsx | #c8ff00 | Carica Documenti |
| --limen-status-ready-bg / text / border | #ecfdf5 / #047857 / #a7f3d0 | Pronto |
| --limen-status-warn-bg / text / border | #fffbeb / #b45309 / #fde68a | Avviso |
| --limen-status-off-bg / text / border | #f8fafc / #64748b / #cbd5e1 | Non connesso |

## Tipografia e geometria verificate

- Sans: -apple-system, BlinkMacSystemFont, SF Pro Display, SF Pro Text, Segoe UI,
  Roboto, Helvetica, Arial, sans-serif. Usare il font di sistema; non redistribuire font proprietari.
- Mono: SF Mono, SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, monospace.
- Sidebar: 240 px; padding 16 px 12 px 12 px.
- Card condivisa: fondo bianco, bordo 1 px, raggio 10 px.
- Badge: 11 px, peso 600, tracking .03em, padding 3 px 8 px, raggio 6 px, gap 6 px.
- EmptyState: titolo 16 px/600, corpo 13 px con interlinea 1.5, padding 48 px 24 px,
  larghezza massima 540 px. Azione 13 px/500, padding 8 px 16 px, raggio 6 px.
- Glass condiviso: bianco 85%, blur 12 px.
- Ombra piccola: 0 1px 2px rgb(0 0 0 / .05).
- Transizioni card: bordo e ombra 150 ms ease.

## Componenti e significato

- StatusBadge: READY → pronto; INITIALIZING/NO_VAULT/INVALID/STALE_SNAPSHOT → avviso;
  NOT_CONFIGURED/OFFLINE → stato neutro. Il colore non sostituisce il testo.
- EmptyState: spiegazione breve e una singola azione utile quando disponibile.
- MetricCard e VaultStatusBanner: riusare i componenti esistenti invece di inventare varianti.
- Carica Documenti: azione evidente per iniziare il percorso dai documenti originali.
- Distinguere originale, testo estratto, risposta generata e wiki; mantenere accessibili le fonti.

## Regole proposte per nuove superfici (non audit di conformità attuale)

- Focus da tastiera visibile; etichette reali per input e pulsanti.
- Contrasto minimo 4.5:1 per testo normale, 3:1 per testo grande; verificare ogni coppia.
- Non usare il lime come testo piccolo su bianco e non affidare uno stato solo al colore.
- Messaggi espliciti per estrazione fallita, elaborazione, assenza fonti e servizio non disponibile.
- Per il web usare corpo almeno 16 px e target interattivi almeno 44 × 44 px.
- Non estendere alla landing la densità di una sidebar desktop.

## Confini di prodotto da rispettare nel design

Ricerca locale e wiki automatiche non hanno gli stessi prerequisiti. La pipeline automatica
verificata in `apps/desktop/src-tauri/src/automation.rs` usa OpenAI per classificazione/wiki:
richiede configurazione, rete e chiave API. Non dichiarare che tutte le funzioni sono offline.
PDF/immagini OCR e DOC/RTF dipendono dalle implementazioni native macOS correnti.
Non promettere tutti i formati, latenza garantita, certificazioni o disponibilità Windows finale.

## Asset per la landing

La copertina `docs/assets/limen-vault-social-preview-rag-wiki-1280x640.png` è una
proposta marketing premium scura, NON il riferimento per la landing chiara. Non è uno screenshot né il logo ufficiale: il lettering
è stato reinterpretato dalla generazione. Per il logo del sito usare il sorgente ufficiale.
Gli screenshot `01_hero_hybrid_search.png`, `02_semantic_engine_active.png` e
`03_degraded_mode_banner.png` in docs/assets sono storici v3, 20 settembre 2026.
Etichettarli come tali; non presentarli come catture della v7Mini.
