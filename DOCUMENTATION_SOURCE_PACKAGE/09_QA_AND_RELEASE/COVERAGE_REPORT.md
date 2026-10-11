# Report di Copertura Documentale — LIMEN Vault v7Mini (0.7.0)

Data del report: 11 Ottobre 2026  
Versione applicazione: LIMEN Vault v7Mini (0.7.0)  
Commit di riferimento: `677745c` (branch `windows-build`)  
Standard applicato: **CODER DOCUMENTATION EXTRACTION OS (v1.0.0)**  

---

## 1. Sommario Esecutivo delle Metriche di Copertura

| Ambito di Copertura | Elementi Rilevati nel Codice | Elementi Censiti e Documentati | Percentuale di Copertura | Esito Audit |
| :--- | :--- | :--- | :--- | :--- |
| **Schermate e Superfici UI** | 14 (`SCR-001` - `SCR-014`) | 14 | **100.0%** | COMPLETO |
| **Route e Modali Tauri** | 14 (`ROU-001` - `ROU-014`) | 14 | **100.0%** | COMPLETO |
| **Voci di Navigazione e Menu** | 16 (`NAV-001` - `NAV-016`) | 16 | **100.0%** | COMPLETO |
| **Controlli UI e Campi Form** | 19 (`CTL-001` - `CTL-019`) | 19 | **100.0%** | COMPLETO |
| **Messaggi di Errore e Validazione** | 9 (`ERR-001` - `ERR-009`) | 9 | **100.0%** | COMPLETO |
| **Stati dell'Interfaccia** | 11 (`STATE-001` - `STATE-011`)| 11 | **100.0%** | COMPLETO |
| **Workflow Operativi Utente** | 12 (`WF-001` - `WF-012`) | 12 schede individuali complete | **100.0%** | COMPLETO |
| **Pipeline Tecniche Asincrone** | 4 (`PIPE-001` - `PIPE-004`) | 4 | **100.0%** | COMPLETO |
| **Diagrammi Mermaid Sorgenti** | 18 (`MMD-001` - `MMD-018`) | 18 file `.mmd` convalidati | **100.0%** | COMPLETO |
| **Capitoli del Manuale Master** | 25 capitoli + 3 appendici | 25 capitoli + 3 appendici | **100.0%** | COMPLETO |
| **Token del Design System** | Colori, font, spacing, blur | Censiti da `index.css` e `App.tsx`| **100.0%** | COMPLETO |

---

## 2. Dettaglio Copertura per Area Funzionale

### 2.1 Area Globale e Header (100%)
- Tracciati: Logo, badge di stato rete (100% Locale / Ibrido), selettore lingua `IT | EN`, pulsante `Apri in Obsidian`, pulsante primario `Carica`.
- File collegati: `01_PRODUCT_DISCOVERY/MENU_AND_NAV_ITEMS.csv`, `03_WORKFLOWS/WF-011-cambio-lingua.md`, `03_WORKFLOWS/WF-012-apri-in-obsidian.md`.

### 2.2 Setup Wizard e Primo Avvio (100%)
- Tracciati: Step 1 (Rete), Step 2 (Creazione/Validazione Vault `00_INBOX`, `10_KNOWLEDGE`, `20_RAW_SOURCES`), Step 3 (Catalogo LLM con download e hash check).
- File collegati: `01_PRODUCT_DISCOVERY/SCREEN_INVENTORY.csv` (`SCR-001`), `03_WORKFLOWS/WF-001-setup-wizard.md`, `04_MERMAID/AUTH_LIFECYCLE.mmd`, `04_MERMAID/WF-001.mmd`.

### 2.3 Chiedi al Vault & Chat RAG (100%)
- Tracciati: Input query, embedding bge-m3, Top-K semantico, routing OpenAI/llama-server, streaming SSE, visualizzazione Reasoning Trace con tag `<think>`, rendering Markdown e pillole fonti.
- File collegati: `SCR-002`, `WF-002-chiedi-al-vault.md`, `PIPE-002.mmd`, `PIPE-003.mmd`.

### 2.4 Lettore Documenti & Integrità SHA-256 (100%)
- Tracciati: Viewer modale per PDF/MD/TXT, calcolo hash a caldo, badge verde "Integrità Verificata", allarme manomissione, salto al paragrafo citato, copia hash.
- File collegati: `SCR-003`, `WF-003-lettore-documenti.md`, `PIPE-004.mmd`, `WF-003.mmd`.

### 2.5 Caricamento & Ingestione Documentale (100%)
- Tracciati: UploadDrawer, selezione file singoli, intera cartella, drag-and-drop, pipeline di estrazione e chunking (~512 token), salvataggio in SQLite.
- File collegati: `SCR-004`, `WF-004-carica-documenti.md`, `PIPE-001.mmd`, `WF-004.mmd`.

### 2.6 Memoria & Knowledge Graph (100%)
- Tracciati: Mappa tag, visualizzazione concettuale a grafo, elenco note in `10_KNOWLEDGE`.
- File collegati: `SCR-005`, `WF-005-esplora-memoria.md`, `WF-005.mmd`.

### 2.7 Sezioni Avanzate A-G (100%)
- A: Approvazione Note (Bozze `00_INBOX`) -> `WF-006`
- B: Snapshot e Ripristino -> `WF-007`
- C: Catalogo Modelli LLM & llama.cpp (6 modelli con matrice RAM) -> `WF-008`
- D: Sincronizzazione Cloud S3/R2 -> `WF-009`
- E: Compilazione Manuale Rete Zero -> `WF-010`
- F: Configurazione & Parametri di Sistema -> `SCR-011`
- G: Diagnostica & Log -> `SCR-012`

---

## 3. Conclusione dell'Audit
Tutti i componenti visibili e i contratti backend dell'applicazione **LIMEN Vault v7Mini (0.7.0)** risultano interamente coperti dalla documentazione prodotta. Nessuna funzionalità è stata omessa né inventata.
