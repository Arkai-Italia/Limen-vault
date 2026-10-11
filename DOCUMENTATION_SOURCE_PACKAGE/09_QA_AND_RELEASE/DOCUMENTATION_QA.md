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
- **Verifica Codice (`SetupWizard.tsx`):** La sequenza di configurazione al primo avvio si compone rigorosamente di 3 step lineari:
  1. *Step 1: Selezione Cartella Vault* — creazione o scelta della directory con convalida permessi.
  2. *Step 2: Scelta Motore LLM* — opzione tra "100% Locale" (Zero-Network) o "Modalità Ibrida" (connessione OpenAI).
  3. *Step 3: Modello Locale o Chiave API* — download con hash check del modello locale (`Ministral 3B` predefinito) o inserimento chiave `OPENAI_API_KEY`.
  4. *Conferma Finale:* Il pulsante finale di salvataggio e sblocco riporta l'etichetta esatta **"ENTRA IN LIMEN VAULT"**.
- **Riscontro:** Rimossi tutti i riferimenti alla sequenza errata Modalità -> Cartella -> Modello.

### 1.3 Topologia del Vault e Flusso di Governance Note
- **Verifica Codice:** La memoria permanente non utilizza un grafo concettuale astratto, bensì la visualizzazione gerarchica `KnowledgePanel` strutturata sulle 10 categorie standard del Vault (`01_CLIENTS` a `10_APPROVED_OUTPUTS`).
- **Cartella Bozze (`90_PROPOSALS/`):** Le note generate dall'assistente o dal compilatore risiedono in `90_PROPOSALS/` in attesa di revisione.
- **Decisioni di Revisione:**
  - *Approvazione:* Spostamento della nota nella categoria appropriata (01-10) con registrazione nell'audit log.
  - *Rifiuto Archiviato:* La nota rimane conservata nello storico delle decisioni con motivazione formale tracciata, senza cancellazione fisica del file.
  - *Eliminazione:* Rimozione permanente dal disco su comando esplicito di cancellazione.

### 1.4 Compilatore Markdown Manuale da Fonti Grezze
- **Verifica Codice (`batch_compile_sources`):** Funzionalità accessibile da `Avanzate > Compilatore Fonti Testo` (`SCR-010`). Non compila codice sorgente C++ o binari Tauri, bensì trasforma documenti grezzi presenti in `20_RAW_SOURCES/` in bozze Markdown strutturate salvate in `90_PROPOSALS/`.
- **Riscontro:** Capitolo 21 e `WF-010.mmd` completamente riscritti ed espunti da ogni riferimento a `cargo build` o `cmake`.

### 1.5 Ripristino Sicuro da Snapshot (Protezione Vault Attivo)
- **Verifica Codice (`crates/snapshot/`):** L'operazione di ripristino estrae l'archivio compresso `.tar.zst` in una cartella separata dedicata `{vault}_RECUPERO_{snapshot_id}`.
- **Riscontro:** È formalmente vietata e impedita a livello Rust la sovrascrittura diretta del Vault attivo. Ogni file estratto viene convalidato tramite hash SHA-256 rispetto al manifest crittografico dello snapshot.

### 1.6 Formati e Requisiti di Sistema
- **Formati Supportati:** Documenti Office (`.docx`, `.pptx`, `.odt`), Fogli di calcolo (`.xlsx`, `.xls`, `.ods`, `.csv`, `.tsv`), Testo (`.txt`, `.md`, `.json`, `.log`, `.html`), PDF con testo selezionabile, e immagini (`.png`, `.jpg`, `.jpeg`, `.webp`) tramite OCR Apple Vision nativo su macOS.
- **Limiti:** Max 32 MB per singolo file in ingresso; troncamento di sicurezza a 16 MB per il testo estratto.
- **Requisiti RAM e Modelli:** Distinti formalmente tra dimensione download del file GGUF, RAM minima di sistema e RAM raccomandata per tutti i 6 modelli catalogati.

---

## 2. Integrità Sintattica e Strutturale del Pacchetto

- **Diagrammi Mermaid:** Tutti i 18 sorgenti `.mmd` in `04_MERMAID/` e `10_EXPORT/ALL_MERMAID_SOURCES.md` sono stati convalidati; rimossi tutti i puntamenti errati con suffissi slug inesistenti.
- **File CSV:** 11 file CSV codificati in UTF-8 con delimitatore virgola `,`. Risolto il disallineamento a 10 colonne sulla riga `SHOT-009` del `SCREENSHOT_MANIFEST.csv` mediante standard RFC 4180.
- **Allineamento Identificatori:** Riconciliati univocamente tutti gli ID `SCR-###`, `ROU-###`, `NAV-###`, `CTL-###`, `ERR-###`, `EVD-###` e `WF-###` in ogni documento del pacchetto.

---

## 3. Problemi Residui, Limiti Noti e Blocchi Concreti

1. **BLOCCO: Cattura Screenshot Nativa non Disponibile nell'Ambiente di Esecuzione:**
   - I 16 screenshot previsti nel piano (`SHOT-001` - `SHOT-016`) risultano nello stato `NOT_CAPTURED`.
   - Sebbene i processi dell'applicazione siano attivi (`limen-vault` e `llama-server`), gli strumenti automatici di cattura a livello OS falliscono a causa delle restrizioni di sicurezza TCC (Transparency, Consent, and Control) di macOS che negano l'accesso alla registrazione schermo (`could not create image from display`, AppleScript `-25211`).
   - **Azione Richiesta:** Il pacchetto **NON È PRONTO PER LA STAMPA / PUBBLICAZIONE DEFINITIVA** finché l'operatore umano non acquisisce le 16 immagini PNG native dall'interfaccia reale e le deposita in `05_SCREENSHOTS/`.

2. **Limiti Intrinseci dei Modelli Linguistici (RAG):**
   - L'architettura RAG con recupero locale semantico riduce drasticamente il rischio di deviazioni fattuali, ma l'inferenza linguistica rimane un processo probabilistico. LIMEN Vault non può garantire l'assenza totale di imprecisioni nei testi generati; per questo motivo le note rimangono in `90_PROPOSALS/` fino a verifica umana.

3. **Confini di Privacy e Cifratura:**
   - La garanzia di riservatezza a zero-rete sussiste esclusivamente quando l'applicazione opera in modalità "100% Locale". L'eventuale attivazione della modalità Ibrida trasmette dati all'infrastruttura di OpenAI.
   - Il calcolo dell'hash SHA-256 verifica l'integrità del file locale su disco rispetto a modifiche accidentali o manomissioni, ma non costituisce attestazione probatoria o notarile avente valore legale automatico verso terzi.
