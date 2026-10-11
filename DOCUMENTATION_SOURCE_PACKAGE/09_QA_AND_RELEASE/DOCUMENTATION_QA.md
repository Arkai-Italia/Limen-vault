# Audit Report di Conformità e Qualità Documentale — LIMEN Vault v7Mini

- **Data Audit:** 11 Ottobre 2026  
- **Release Software Verificata:** LIMEN Vault v7Mini (0.7.0) — commit `677745c367d64de7d21eb66d111cac7558300f84`  
- **Commit Ispezione Sorgenti Documentali:** `373e34e7ae3a7a9f41acf2c8eecdaa8131c5d90a`  
- **Stato Audit:** **VERIFICATO SU CODICE E SINTASSI — BLOCCATO PER PUBBLICAZIONE GRAFICA DEFINITIVA (SCREENSHOT NATIVI MANCANTI PER LIMITAZIONI TCC DISPLAY)**  

---

## 1. Verifiche Eseguite sui Sorgenti e Riscontri Oggettivi

### 1.1 Architettura di Navigazione e Controlli Globali
- **Verifica UI:** L'interfaccia si suddivide in un Header superiore fisso (altezza 52px, fondo trasparente/blur con bordo `#e2e8f0`) contenente il logo, il pulsante centrale `Verifica` (`RotateCw`), il selettore di lingua `IT | EN` e il badge di stato rete `● PRONTO`.
- **Barra Laterale Sinistra (240px):** Ospita il pulsante primario d'azione `Carica Documenti` (colore lime `#c8ff00`, `CTL-001`), i 4 elementi di navigazione principale (`Chiedi al Vault`, `Documenti`, `Memoria`, `Avanzate`), l'elenco delle ultime note aperte e il pulsante inferiore `Apri in Obsidian` (`CTL-007`).
- **Riscontro:** Contraddizioni eliminate tra manuale, cataloghi CSV e diagrammi Mermaid.

### 1.2 Flusso di Setup Iniziale (Setup Wizard)
- **Verifica Codice (`apps/desktop/src/SetupWizardModal.tsx`):** Il componente reale importato da `App.tsx` è `apps/desktop/src/SetupWizardModal.tsx` (il percorso `packages/ui/src/SetupWizard.tsx` non esiste nel repository). Le etichette e le condizioni reali in `i18n.tsx` e nel componente sono:
  1. *Step 1: Cartella Vault (`step1Title`, `CTL-007`)* — selezione directory con "Sfoglia cartella…", "Apri cartella" o "Crea nuova cartella". Condizione: `isStep1Ready = isVaultLoaded && Boolean(currentVaultPath)`.
  2. *Step 2: Motore AI Locale (`step2Title`, `CTL-008`)* — rilevamento memoria RAM fisica del dispositivo, catalogo dei 6 modelli GGUF (Ministral 3B, Ministral 8B, Qwen 2.5 7B, Llama 3.1 8B, DeepSeek-R1 Distill 7B/14B), download in streaming con progress bar, convalida crittografica dell'hash SHA-256 e impostazione attivo. Condizione: `isStep2Ready = models.some(m => m.installed && m.sha256Ok)`.
  3. *Step 3: Modalità & Chiave API (`step3Title`, `CTL-009`)* — opzione tra "Modalità 100% Solo Locale (Rete Zero)" (nessuna chiamata remota, privacy garantita) oppure "Modalità Ibrida OpenAI" con inserimento chiave protetta `sk-...` nel portachiavi di sistema (`saveKey`). Condizione: `isStep3Ready = hasApiKey || isLocalOnlyMode`.
  4. *Conferma Finale:* Al soddisfacimento simultaneo dei 3 requisiti (`allStepsReady`), il pulsante in basso a destra **"ENTRA IN LIMEN VAULT"** (`CTL-010`) diventa attivo (verde lime `#77f117`) e al clic chiude la modale accedendo a `SCR-001`.

### 1.3 Acquisizione Documenti e Assenza UploadDrawer
- **Verifica Codice (`apps/desktop/src/App.tsx`, `crates/ui/src/main.rs`):** Cliccando su "Carica Documenti" (`CTL-002`, `#c8ff00`) nella barra laterale, `handleUploadDocuments` invoca l'IPC `automationChooseFiles(vaultPath)` che a livello host desktop Rust esegue `blocking_pick_files()`. Non esiste alcun cassetto o drawer intermedio "UploadDrawer": si apre direttamente la finestra nativa di selezione file del sistema operativo (Finder / File Explorer). Alla conferma ("Apri"), l'applicazione commuta automaticamente su Documenti (`SCR-004`) avviando la pipeline in background `PIPE-001` (copia in `20_RAW_SOURCES/`, calcolo SHA-256, estrazione testo con `limen-extract`, indicizzazione vettoriale `bge-m3`). Supportato anche il trascinamento diretto dei file nella finestra (Drag-and-Drop).

### 1.4 Topologia del Vault e Flusso di Governance Note
- **Verifica Codice:** La memoria permanente non utilizza un grafo concettuale astratto, bensì la visualizzazione gerarchica `KnowledgePanel` strutturata sulle 10 categorie standard del Vault (`01_CLIENTS` a `10_APPROVED_OUTPUTS`), l'archivio sorgenti in `20_RAW_SOURCES/` e le bozze in `90_PROPOSALS/`. Rimossi categoricamente tutti i residui di `00_INBOX` e `10_KNOWLEDGE`.
- **Decisioni di Revisione:**
  - *Approvazione:* Spostamento della nota nella categoria appropriata (01-10) con registrazione nell'audit log (`CTL-012`).
  - *Nuova Revisione:* Modifica e salvataggio conservando la stesura precedente (`CTL-013`).
  - *Rifiuto Archiviato:* La nota rimane conservata nello storico delle decisioni con motivazione formale tracciata, senza cancellazione fisica del file (`CTL-014`).
  - *Eliminazione:* Rimozione permanente dal disco su comando esplicito di cancellazione.

### 1.5 Compilatore Fonti Testo da 20_RAW_SOURCES a 90_PROPOSALS
- **Verifica Codice (`batch_compile_sources`):** Funzionalità accessibile da `Avanzate > Compilatore Fonti Testo` (`SCR-010`, `WF-010`, pulsante `CTL-020`). Non compila codice sorgente o binari Tauri, bensì trasforma documenti grezzi presenti in `20_RAW_SOURCES/` in bozze Markdown strutturate salvate in `90_PROPOSALS/`.

### 1.6 Ripristino Sicuro da Snapshot (Protezione Vault Attivo)
- **Verifica Codice (`crates/snapshot/`):** L'operazione di ripristino estrae l'archivio compresso `.tar.zst` in una cartella separata dedicata `{vault}_RECUPERO_{snapshot_id}` (`SCR-007`, `WF-007`). È formalmente vietata e impedita la sovrascrittura diretta del Vault attivo. Ciascun file estratto viene convalidato tramite hash SHA-256 rispetto al manifest crittografico dello snapshot.

### 1.7 Formati e Requisiti di Sistema
- **Formati Supportati:** Documenti Office (`.docx`, `.pptx`, `.odt`), Fogli di calcolo (`.xlsx`, `.xls`, `.ods`, `.csv`, `.tsv`), Testo (`.txt`, `.md`, `.json`, `.log`, `.html`), PDF con testo selezionabile, e immagini (`.png`, `.jpg`, `.jpeg`, `.webp`) tramite OCR Apple Vision nativo su macOS.
- **Limiti:** Max 32 MB per singolo file in ingresso; troncamento di sicurezza a 16 MB per il testo estratto.
- **Requisiti RAM e Modelli:** Distinti formalmente tra dimensione download del file GGUF, RAM minima di sistema e RAM raccomandata per tutti i 6 modelli catalogati.

---

## 2. Integrità Sintattica, Strutturale e Design System

- **Diagrammi Mermaid:** Tutti i 18 diagrammi `.mmd` in `04_MERMAID/` e `10_EXPORT/ALL_MERMAID_SOURCES.md` sono stati sincronizzati con parità esatta byte-per-byte (risolta divergenza in `WF-007.mmd` e allineati `WF-004.mmd`, `WF-008.mmd`, `WF-009.mmd`).
- **File CSV (19 file):** Esattamente 19 file CSV censiti nel pacchetto e validati RFC 4180. Superato il controllo delle colonne e corretti tutti i 12 percorsi Mermaid nel catalogo workflow.
- **Gate Design System Bibbia Manuali:** Completati in `08_DESIGN_SYSTEM_HANDOFF/`:
  - `design-system-manifest.yml` (stato `VERIFIED`, sorgenti CSS e commit `677745c`).
  - `design-to-document-map.yml` (stato `PROPOSED (HOLD)`, mapping token UI -> print A4 landscape).
  - `DESIGN_APPROVAL.md` (stato `HOLD`, checklist per Graphic Designer).
- **Allineamento Identificatori:** Riconciliati univocamente tutti gli ID: `SCR-001` (Panoramica), `SCR-002` (Setup Wizard Modal), `SCR-003` (Chiedi), `SCR-004` (Documenti), `SCR-005` (Memoria), `SCR-006` (Bozze), `SCR-007` (Snapshot), `SCR-008` (Cloud S3), `SCR-009` (Modelli LLM), `SCR-010` (Compilatore), `SCR-011` (Diagnostica), `SCR-012` (Guida Vault), `SCR-013` (Lettore Documenti), `SCR-014` (Cassetto Fonti).

---

## 3. Stato del Gate di Pubblicazione: ready_for_publication: false

Il pacchetto mantiene rigorosamente **`ready_for_publication: false`**. Il deposito degli screenshot nativi, da solo, non autorizza il passaggio a `true`. I vincoli aperti per la delibera finale sono:
1. **Acquisizione Screenshot Reali:** Acquisizione dei 16 screenshot nativi PNG (`SHOT-001` - `SHOT-016`) dall'interfaccia dell'applicazione compilata.
2. **Approvazione Formale del Design Gate:** Approvazione del mapping grafico e tipografico (`design-to-document-map.yml`) da parte del Graphic Designer (`DESIGN_APPROVAL.md` da HOLD ad APPROVED).
3. **Collaudo Impaginato Finale:** Verifica geometrica, assenza di overlap e conformità visiva del documento A4 orizzontale impaginato.
4. **Validazione Evidenze e Collaudo Funzionale:** Esecuzione e archiviazione dei log di esecuzione live per i workflow chiave.

2. **Limiti Intrinseci dei Modelli Linguistici (RAG):**
   - L'architettura RAG con recupero locale semantico riduce drasticamente il rischio di deviazioni fattuali, ma l'inferenza linguistica rimane un processo probabilistico. LIMEN Vault non può garantire l'assenza totale di imprecisioni nei testi generati; per questo motivo le note rimangono in `90_PROPOSALS/` fino a verifica umana.

3. **Confini di Privacy e Cifratura:**
   - La garanzia di riservatezza a zero-rete sussiste esclusivamente quando l'applicazione opera in modalità "100% Locale". L'eventuale attivazione della modalità Ibrida trasmette dati all'infrastruttura di OpenAI.
   - Il calcolo dell'hash SHA-256 verifica l'integrità del file locale su disco rispetto a modifiche accidentali o manomissioni, ma non costituisce attestazione probatoria o notarile avente valore legale automatico verso terzi.
