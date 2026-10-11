# Report di Copertura Documentale — LIMEN Vault v7Mini (0.7.0)

- **Data del Report:** 11 Ottobre 2026  
- **Versione Software:** LIMEN Vault v7Mini (0.7.0) — commit `677745c` (branch `windows-build`)  
- **Commit Ispezione Documenti:** `373e34e`  
- **Standard di Riferimento:** APP USER MANUAL OS v0.2.0 (Bibbia Manuali Utente)  

---

## 1. Sommario delle Metriche di Copertura

| Ambito di Copertura | Elementi Rilevati nel Codice | Elementi Censiti e Verificati | Percentuale Copertura | Stato Operativo |
| :--- | :--- | :--- | :--- | :--- |
| **Schermate e Superfici UI** | 14 (`SCR-001` - `SCR-014`) | 14 | **100.0%** | VERIFICATO SU CODICE |
| **Route e Viste Modali Tauri** | 14 (`ROU-001` - `ROU-014`) | 14 | **100.0%** | VERIFICATO SU CODICE |
| **Voci di Navigazione e Menu** | 16 (`NAV-001` - `NAV-016`) | 16 | **100.0%** | VERIFICATO SU CODICE |
| **Controlli UI e Campi Form** | 19 (`CTL-001` - `CTL-019`) | 19 | **100.0%** | VERIFICATO SU CODICE |
| **Messaggi di Errore e Avvisi** | 9 (`ERR-001` - `ERR-009`) | 9 | **100.0%** | VERIFICATO SU CODICE |
| **Stati dell'Interfaccia** | 11 (`STATE-001` - `STATE-011`) | 11 | **100.0%** | VERIFICATO SU CODICE |
| **Workflow Operativi Utente** | 12 (`WF-001` - `WF-012`) | 12 schede procedurali complete | **100.0%** | VERIFICATO SU CODICE |
| **Pipeline Tecniche Asincrone** | 4 (`PIPE-001` - `PIPE-004`) | 4 | **100.0%** | VERIFICATO SU CODICE |
| **Diagrammi Mermaid Sorgenti** | 18 (`MMD-001` - `MMD-018`) | 18 file `.mmd` convalidati | **100.0%** | VERIFICATO SU CODICE |
| **Capitoli del Manuale Master** | 25 capitoli + 3 appendici | 25 capitoli + 3 appendici | **100.0%** | VERIFICATO SU CODICE |
| **Token del Design System** | Palette Light Slate, Lime, Fonts | Estratti da `styles.css` e `App.tsx` | **100.0%** | VERIFICATO SU CODICE |
| **Screenshot Reali Applicazione** | 16 pianificati (`SHOT-001` - `SHOT-016`) | 0 acquisiti (tutti `NOT_CAPTURED`) | **0.0%** | **BLOCCATO (TCC Permissions)** |

---

## 2. Dettaglio Copertura per Area Funzionale

### 2.1 Navigazione Globale (Header e Sidebar)
- Tracciati: Header superiore 52px con logo, pulsante centrale `Verifica` (`RotateCw`), selettore lingua `IT | EN`, badge di stato rete `● PRONTO`.
- Sidebar sinistra 240px: pulsante primario `Carica Documenti` (`#c8ff00`), navigazione a 4 sezioni (`Chiedi al Vault`, `Documenti`, `Memoria`, `Avanzate`), note recenti e pulsante `Apri in Obsidian` (`CTL-007`).
- File collegati: `01_PRODUCT_DISCOVERY/MENU_AND_NAV_ITEMS.csv`, `03_WORKFLOWS/WF-011-cambio-lingua.md`, `03_WORKFLOWS/WF-012-apri-in-obsidian.md`.

### 2.2 Setup Wizard e Primo Avvio
- Sequenza verificata: Step 1 (Selezione Cartella Vault), Step 2 (Scelta Motore LLM: Locale vs Ibrido), Step 3 (Download Modello GGUF con hash check o Chiave API OpenAI), pulsante finale `ENTRA IN LIMEN VAULT`.
- File collegati: `SCR-001`, `WF-001-setup-wizard.md`, `04_MERMAID/AUTH_LIFECYCLE.mmd`, `04_MERMAID/WF-001.mmd`.

### 2.3 Chiedi al Vault & Chat RAG
- Tracciati: Input query, embedding bge-m3, Top-K semantico, routing OpenAI/llama-server, streaming SSE, visualizzazione Reasoning Trace con tag `<think>`, rendering Markdown e pillole fonti.
- File collegati: `SCR-002`, `WF-002-chiedi-al-vault.md`, `PIPE-002.mmd`, `PIPE-003.mmd`.

### 2.4 Lettore Documenti & Integrità SHA-256
- Tracciati: Visualizzatore modale per PDF/Office/Testo, calcolo hash a caldo, badge verde "Integrità Verificata", allarme discrepanza hash, salto al paragrafo citato, copia hash.
- File collegati: `SCR-003`, `WF-003-lettore-documenti.md`, `PIPE-004.mmd`, `WF-003.mmd`.

### 2.5 Caricamento & Ingestione Documentale
- Tracciati: UploadDrawer richiamato da pulsante sidebar `#c8ff00`, selezione file singoli, intera cartella, drag-and-drop, supporto formati Office/Excel/PDF/MD/TXT/Immagini Vision OCR, limite 32 MB per file, chunking (~512 token).
- File collegati: `SCR-004`, `WF-004-carica-documenti.md`, `PIPE-001.mmd`, `WF-004.mmd`.

### 2.6 Memoria & Struttura del Vault
- Tracciati: Navigatore gerarchico strutturato sulle 10 categorie standard del Vault (`01_CLIENTS` a `10_APPROVED_OUTPUTS`), anteprima markdown e visualizzazione note consolidate.
- File collegati: `SCR-005`, `WF-005-esplora-memoria.md`, `WF-005.mmd`.

### 2.7 Sezioni Avanzate A-G
- A: Approvazione Note (Bozze in `90_PROPOSALS/` con salvataggio, promozione in 01-10 o rifiuto archiviato tracciato) -> `WF-006`
- B: Snapshot e Ripristino (Archiviazione `.tar.zst`, recupero sicuro in directory separata `{vault}_RECUPERO_{snapshot_id}`) -> `WF-007`
- C: Catalogo Modelli LLM & llama.cpp (6 modelli con matrice RAM verificata) -> `WF-008`
- D: Sincronizzazione Cloud S3/R2 (BYOB - bucket proprietario con crittografia client-side) -> `WF-009`
- E: Compilatore Fonti Testo (Generazione in blocco di note Markdown da `20_RAW_SOURCES/` verso `90_PROPOSALS/`) -> `WF-010`
- F: Configurazione & Parametri di Sistema -> `SCR-011`
- G: Diagnostica & Log -> `SCR-012`

---

## 3. Conclusione e Condizione di Blocco
Tutti i testi tecnici, i diagrammi di flusso e le matrici di tracciabilità risultano verificati e conformi al codice al 100%.  
**Condizione di blocco per il rilascio finale:** Il pacchetto documentale non può essere considerato impaginabile per la pubblicazione definitiva fino a quando non verranno inseriti i file immagine degli screenshot reali pianificati in `05_SCREENSHOTS/`.
