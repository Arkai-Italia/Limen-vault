# Catalogo Dettagliato delle Schermate — LIMEN Vault v7Mini

Il catalogo descrive ciascuna delle 14 superfici di interfaccia con layout, scopo, controlli ed evidenze associate:

---

### SCR-001 — Panoramica / Overview
- **Route:** `app://overview`
- **Scopo:** Schermata iniziale che mostra lo stato di salute del Vault, le statistiche generali (note, documenti, passaggi indicizzati) e i collegamenti rapidi.
- **Componenti Principali:** Card metrica note, card metrica documenti, card stato RAG locale, pulsante Configurazione Guidata.
- **Evidenza:** `EVD-001`

---

### SCR-002 — Configurazione Guidata / Setup Wizard
- **Route:** `app://wizard` (Modal overlay dark-glass a schermo intero)
- **Scopo:** Onboarding bloccante opzionale per guidare l'utente alla configurazione dei 3 requisiti critici:
  1. Cartella Vault locale
  2. Motore AI locale (bge-m3 + modello generativo GGUF)
  3. Modalità AI (100% Solo Locale o Ibrido OpenAI con chiave API)
- **Componenti Principali:** Stepper a 3 pillole numerate con spunte `✓` dinamiche, rilevatore RAM, pulsante "ENTRA IN LIMEN VAULT".
- **Evidenza:** `EVD-002`

---

### SCR-003 — Chiedi al Vault / Ask Chat
- **Route:** `app://ask`
- **Scopo:** Ambiente primario di consultazione conversazionale con ricerca semantica RAG e citazione fonti.
- **Componenti Principali:** Feed messaggi (bolla verde utente, bolla bianca assistente), selettore toggle "SOLO LOCALE (Mac)", casella prompt inferiore fissa, pulsante "N fonti citate", visualizzatore catena CoT `<think>`.
- **Evidenza:** `EVD-003`, `EVD-004`

---

### SCR-004 — Documenti / Documents (20_RAW_SOURCES)
- **Route:** `app://documents`
- **Scopo:** Registro tabellare di tutti i file originali importati nel Vault (PDF, DOCX, XLSX, TXT) con conteggio passaggi estratti e stato indicizzazione.
- **Componenti Principali:** Tabella documenti con ordinamento, filtro per tipo file, anteprima testo grezzo estratto, pulsante globale "CARICA DOCUMENTI".
- **Evidenza:** `EVD-006`

---

### SCR-005 — Memoria / Memory (Note Wiki Categorie 01-10)
- **Route:** `app://memory`
- **Scopo:** Catalogo navigabile delle note Markdown strutturate del Vault suddivise nelle categorie da `01_CLIENTS` a `10_APPROVED_OUTPUTS`.
- **Componenti Principali:** Barra filtri categorie, griglia note con badge validità Frontmatter YAML, riquadro anteprima Markdown con rendering tabelle e link Obsidian.
- **Evidenza:** `EVD-007`

---

### SCR-006 — Bozze e Proposte / Proposals (90_PROPOSALS)
- **Route:** `app://advanced/proposals`
- **Scopo:** Governance e revisione formale delle note generate dall'AI prima dell'inclusione definitiva nella memoria aziendale.
- **Componenti Principali:** Elenco bozze in attesa, visualizzatore diff/anteprima, pulsanti "Approva", "Modifica", "Rifiuta", selettore categoria di destinazione.
- **Evidenza:** `EVD-008`

---

### SCR-007 — Copie Locali e Ripristino / Snapshots
- **Route:** `app://advanced/snapshots`
- **Scopo:** Gestione copie di sicurezza crittografiche del Vault con calcolo manifesto SHA-256 e ripristino sicuro in cartella separata.
- **Componenti Principali:** Pulsante "CREA COPIA LOCALE", tabella snapshot storici con hash e dimensione, pulsante "RIPRISTINA".
- **Evidenza:** `EVD-013`

---

### SCR-008 — Trasferimenti / Cloud Transfers (S3 / R2)
- **Route:** `app://advanced/transfers`
- **Scopo:** Sincronizzazione crittografata del Vault con bucket remoti compatibili S3 o Cloudflare R2.
- **Componenti Principali:** Form configurazione endpoint bucket, credenziali cifrate, barra progresso sincronizzazione.
- **Evidenza:** `EVD-013`

---

### SCR-009 — Collegamenti AI & Catalogo Modelli
- **Route:** `app://advanced/ai`
- **Scopo:** Monitoraggio stato modello embedding `bge-m3`, gestione e download dei 6 modelli LLM locali (Ministral 3B/8B, Qwen 2.5 7B, Llama 3.1 8B, DeepSeek-R1 7B/14B) e avvio/arresto server.
- **Componenti Principali:** Schede modelli con indicazione RAM minima/consigliata, pulsanti "Imposta come Attivo", barre download progressivo, indicatore stato server e porta loopback.
- **Evidenza:** `EVD-009`, `EVD-010`

---

### SCR-010 — Compilatore Manuale / Compiler
- **Route:** `app://advanced/compiler`
- **Scopo:** Generazione batch di note Markdown formattate a partire da blocchi di testo grezzo non strutturato, con categorizzazione guidata.
- **Componenti Principali:** Area di testo input grezzo, selettore categoria, anteprima frontmatter generato, pulsante compila.
- **Evidenza:** `EVD-013`

---

### SCR-011 — Stato Sistema & Diagnostica
- **Route:** `app://advanced/system`
- **Scopo:** Diagnostica in tempo reale delle risorse hardware (memoria RAM disponibile, supporto GPU Metal), stato tunnel Cloudflare e canali MCP.
- **Componenti Principali:** Indicatori di carico memoria, switch tunnel Cloudflare, log eventi diagnostici.
- **Evidenza:** `EVD-013`

---

### SCR-012 — Guida Vault & Manuale Integrato
- **Route:** `app://advanced/help`
- **Scopo:** Consultazione del manuale operativo integrato in-app con ricerca rapida e guide passo-passo.
- **Componenti Principali:** Campo ricerca argomenti, indice capitoli navigabile, visualizzatore guide con avvisi e FAQ.
- **Evidenza:** `EVD-013`

---

### SCR-013 — Lettore Documenti Verificato / Document Reader
- **Route:** `modal://reader` (Modal a schermo intero)
- **Scopo:** Lettura immersiva e verifica anti-manomissione di un file originale citato dall'AI.
- **Componenti Principali:** Barra superiore con nome file, badge "Verificato (SHA-256)", 3 tab ("Passaggi", "Testo completo", "Metadati"), scorrimento automatico al paragrafo evidenziato in giallo lime.
- **Evidenza:** `EVD-005`

---

### SCR-014 — Cassetto Fonti & Dettaglio Passaggi / Sources Drawer
- **Route:** `modal://source-detail` & `drawer://sources`
- **Scopo:** Colonna laterale destra scorrevole che mostra tutti i passaggi documentali citati nella risposta attiva.
- **Componenti Principali:** Elenco card frammenti con punteggio di rilevanza semantica (score % e rank BM25), pulsante "Apri documento" per lanciare il lettore.
- **Evidenza:** `EVD-005`
