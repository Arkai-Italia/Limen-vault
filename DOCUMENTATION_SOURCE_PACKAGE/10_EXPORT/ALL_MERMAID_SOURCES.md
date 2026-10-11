# Raccolta Ufficiale di Tutti i Diagrammi Mermaid — LIMEN Vault v7Mini

Il presente documento raccoglie in un unico file esportabile tutti i 18 diagrammi Mermaid del pacchetto di documentazione, generati direttamente dai rispettivi file sorgente in `04_MERMAID/`.

---

## Indice dei Diagrammi

1. [**MMD-001:** Navigazione Globale e Topologia Interfaccia](#1-mmd-001-system_navigationmmd)
2. [**MMD-002:** Ciclo di Avvio, Controllo Requisiti e Setup Wizard](#2-mmd-002-auth_lifecyclemmd)
3. [**MMD-003:** WF-001 — Configurazione Iniziale (Setup Wizard)](#3-mmd-003-wf-001mmd)
4. [**MMD-004:** WF-002 — Chiedi al Vault (Ricerca RAG e Chat)](#4-mmd-004-wf-002mmd)
5. [**MMD-005:** WF-003 — Ispezione Fonti nel Lettore Documenti SHA-256](#5-mmd-005-wf-003mmd)
6. [**MMD-006:** WF-004 — Ingestione Documenti (Selettore Nativo / Drag-and-Drop)](#6-mmd-006-wf-004mmd)
7. [**MMD-007:** WF-005 — Esplorazione e Navigazione Memoria (01-10)](#7-mmd-007-wf-005mmd)
8. [**MMD-008:** WF-006 — Revisione e Approvazione Bozze (90_PROPOSALS)](#8-mmd-008-wf-006mmd)
9. [**MMD-009:** WF-007 — Gestione Snapshot e Ripristino Sicuro (Cartella RECUPERO)](#9-mmd-009-wf-007mmd)
10. [**MMD-010:** WF-008 — Gestione Catalogo Modelli LLM e llama.cpp](#10-mmd-010-wf-008mmd)
11. [**MMD-011:** WF-009 — Sincronizzazione Cloud S3/R2 (BYOB)](#11-mmd-011-wf-009mmd)
12. [**MMD-012:** WF-010 — Compilatore Fonti Testo da 20_RAW_SOURCES a 90_PROPOSALS](#12-mmd-012-wf-010mmd)
13. [**MMD-013:** WF-011 — Commutazione Istantanea Lingua (IT | EN)](#13-mmd-013-wf-011mmd)
14. [**MMD-014:** WF-012 — Apertura Diretta del Vault in Obsidian](#14-mmd-014-wf-012mmd)
15. [**MMD-015:** PIPE-001 — Ingestione ed Embedding Locale (bge-m3)](#15-mmd-015-pipe-001mmd)
16. [**MMD-016:** PIPE-002 — Routing della Risposta e Fallback RAG](#16-mmd-016-pipe-002mmd)
17. [**MMD-017:** PIPE-003 — Streaming Asincrono Token e Reasoning Trace](#17-mmd-017-pipe-003mmd)
18. [**MMD-018:** PIPE-004 — Catena di Integrità e Validazione SHA-256](#18-mmd-018-pipe-004mmd)

---

### 1. MMD-001: Navigazione Globale e Topologia Interfaccia
*File sorgente: `04_MERMAID/SYSTEM_NAVIGATION.mmd`*

```mermaid
graph TD
    classDef headerStyle fill:#ffffff,stroke:#cbd5e1,stroke-width:1.5px,color:#0f172a;
    classDef sidebarStyle fill:#f1f5f9,stroke:#cbd5e1,stroke-width:1px,color:#0f172a;
    classDef navStyle fill:#ffffff,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
    classDef areaStyle fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px,color:#0f172a;
    classDef modalStyle fill:#0f172a,stroke:#77f117,stroke-width:2px,color:#ffffff;
    classDef limeBtn fill:#c8ff00,stroke:#0f172a,stroke-width:1.5px,color:#0a0c10;

    subgraph TopHeader ["TOP HEADER BAR (52px)"]
        H1["Breadcrumb Sezione & Nome Vault"]:::headerStyle
        H2["Pulsante Centrale: Verifica (RotateCw)"]:::headerStyle
        H3["Commutatore Lingua: IT | EN"]:::headerStyle
        H4["Badge Stato: ● PRONTO"]:::headerStyle
    end

    subgraph Sidebar ["SIDEBAR SINISTRA (240px)"]
        S1["Logo Limen & Vault Name"]:::sidebarStyle
        S2["Pulsante Globale: CARICA DOCUMENTI"]:::limeBtn
        S3["Navigazione Principale: Chiedi / Documenti / Memoria / Avanzate"]:::sidebarStyle
        S4["Storico Conversazioni & Nuova Chat"]:::sidebarStyle
        S5["Fonti Citate (Collassabile)"]:::sidebarStyle
        S6["Pulsante: Apri in Obsidian"]:::sidebarStyle
    end

    subgraph Area1 ["1. CHIEDI (AiPanel - Chat RAG)"]
        A1_1["Toggle: Solo Locale (Mac) vs Ibrido OpenAI"]:::areaStyle
        A1_2["Reasoning Trace Espandibile (<think>)"]:::areaStyle
        A1_3["Risposta Streaming con Fonti Citate"]:::areaStyle
        A1_4["Input Prompt & Invio Domanda"]:::areaStyle
    end

    subgraph Area2 ["2. DOCUMENTI (20_RAW_SOURCES)"]
        A2_1["Tabella Documenti Sorgente (PDF, DOCX, XLSX, TXT)"]:::areaStyle
        A2_2["Stato Elaborazione & Passaggi Estratti"]:::areaStyle
        A2_3["Pulsante Apri Lettore Verificato"]:::areaStyle
    end

    subgraph Area3 ["3. MEMORIA (KnowledgePanel - 10 Categorie)"]
        A3_1["Pillole 10 Categorie: 01_CLIENTS ... 10_APPROVED_OUTPUTS"]:::areaStyle
        A3_2["Elenco Schede Note con Validazione Frontmatter YAML"]:::areaStyle
        A3_3["Anteprima Markdown con Link Wiki [[Nota]]"]:::areaStyle
    end

    subgraph Area4 ["4. AVANZATE (Subtab Operative)"]
        A4_1["Bozze e Proposte: 90_PROPOSALS (Approva / Modifica / Rifiuta)"]:::areaStyle
        A4_2["Copie Locali & Ripristino (Recupero in cartella separata)"]:::areaStyle
        A4_3["Collegamenti AI & Catalogo 6 Modelli LLM Locali GGUF"]:::areaStyle
        A4_4["Compilatore Markdown Manuale (COMPILA FONTI TESTO)"]:::areaStyle
        A4_5["Trasferimenti Cloud S3/R2"]:::areaStyle
        A4_6["Stato Sistema Locale & Diagnostica"]:::areaStyle
        A4_7["Guida Vault Integrata"]:::areaStyle
    end

    subgraph Overlays ["MODALI & VISTE SOVRAPPOSTE"]
        M1["SetupWizardModal: 3 Step (Cartella -> LLM -> Modalita) -> ENTRA IN LIMEN VAULT"]:::modalStyle
        M2["DocumentReaderModal: Lettore Verificato SHA-256 ed Evidenziazione"]:::modalStyle
        M3["NativeFileDialog: Selettore File di Sistema (Finder / Explorer)"]:::modalStyle
    end

    S2 -->|Clicca| M3
    M3 -->|File Selezionati| Area2
    S3 --> Area1
    S3 --> Area2
    S3 --> Area3
    S3 --> Area4

    A2_3 -->|Clicca Leggi| M2
    A1_3 -->|Clicca Fonte Citata| M2
    S1 -->|Mancano Requisiti di Boot| M1
```

---

### 2. MMD-002: Ciclo di Avvio, Controllo Requisiti e Setup Wizard
*File sorgente: `04_MERMAID/AUTH_LIFECYCLE.mmd`*

```mermaid
sequenceDiagram
    autonumber
    actor Utente
    participant App as Frontend (Tauri WebView)
    participant Core as Backend Rust (Core Engine)
    participant FS as Filesystem Locale
    participant Model as Storage Modelli GGUF

    Utente->>App: Avvio Applicazione LIMEN Vault
    App->>Core: get_app_version() & check_system_requirements()
    Core-->>App: Versione 0.7.0, Architettura (Metal/AVX2), RAM rilevata
    App->>Core: check_boot_requirements(vault, llm, key)

    alt Requisiti Incompleti (Primo Avvio o Reset)
        Core-->>App: Requisiti mancanti (openWizard: true)
        App->>Utente: Apertura SetupWizardModal (Step 1/3: Cartella del Vault)
        Utente->>App: "Sfoglia cartella", "Apri Vault Esistente" o "Crea Nuovo Vault"
        App->>Core: init_or_validate_vault_path(path)
        Core->>FS: Verifica / Creazione struttura (00_SYSTEM, 20_RAW_SOURCES, 90_PROPOSALS, 01-10)
        Core-->>App: Spunta verde Step 1 (Cartella Pronta)
        Utente->>App: Clicca "Avanti" (Step 2/3: Motore AI Locale)
        Utente->>App: Sceglie modello GGUF (es. Ministral 3B - 8 GB RAM)
        App->>Core: local_llm_download_or_activate(model_id)
        Core->>Model: Controllo presenza GGUF e verifica hash SHA-256
        Core-->>App: Spunta verde Step 2 (Modello Attivo)
        Utente->>App: Clicca "Avanti" (Step 3/3: Modalità Operativa & Chiave API)
        Utente->>App: Sceglie "100% Solo Locale" oppure "Ibrido OpenAI" con chiave sk-...
        Core-->>App: Spunta verde Step 3 (Modalità Pronta)
        Utente->>App: Clicca sul pulsante verde "ENTRA IN LIMEN VAULT"
        App->>Core: finalize_setup(vault_path, model_id, mode)
        Core-->>App: Setup completato con successo
    else Requisiti Soddisfatti
        Core-->>App: Vault e configurazione validi (openWizard: false)
    end

    App->>Core: start_llama_server_if_needed()
    Core-->>App: llama-server attivo su loopback 127.0.0.1
    App->>Utente: Visualizzazione Interfaccia Principale (Badge ● PRONTO)
```

---

### 3. MMD-003: WF-001 — Configurazione Iniziale (Setup Wizard)
*File sorgente: `04_MERMAID/WF-001.mmd`*

```mermaid
graph TD
    Start(["Avvio Setup Wizard (SCR-002)"]) --> Step1["Step 1: Cartella del Vault"]
    Step1 --> ChoosePath{"Azione Cartella Vault"}
    ChoosePath -->|Sfoglia Cartella| BrowseFolder["Selezione Cartella da File Dialog Nativo"]
    ChoosePath -->|Apri Esistente| OpenExisting["Validazione Struttura Directory Esistente"]
    ChoosePath -->|Crea Nuovo| CreateDirs["Creazione Struttura (00_SYSTEM, 20_RAW_SOURCES, 90_PROPOSALS, 01-10)"]

    BrowseFolder --> Step1Ready["Spunta Verde Step 1 (Cartella Pronta)"]
    OpenExisting --> Step1Ready
    CreateDirs --> Step1Ready

    Step1Ready --> Step2["Step 2: Motore AI Locale (Catalogo LLM GGUF)"]
    Step2 --> SelectModel{"Selezione Modello"}
    SelectModel -->|Ministral 3B (8 GB RAM)| CheckModel{"File GGUF Presente & SHA-256 Valido?"}
    SelectModel -->|Ministral 8B / Qwen / Llama / DeepSeek| CheckModel

    CheckModel -->|Sì| Step2Ready["Spunta Verde Step 2 (Modello Attivo)"]
    CheckModel -->|No| TriggerDownload["Download Streaming da Hugging Face con Barra Avanzamento"]
    TriggerDownload --> VerifyHash["Verifica Hash SHA-256 Integrità"]
    VerifyHash --> Step2Ready

    Step2Ready --> Step3["Step 3: Modalità Operativa e Chiave API"]
    Step3 --> SelectMode{"Scelta Modalità"}
    SelectMode -->|100% Solo Locale (Rete Zero)| LocalMode["Nessuna Chiave Richiesta - Calcolo On-Device"]
    SelectMode -->|Ibrida OpenAI| HybridMode["Inserimento Chiave sk-... Salvata nel Portachiavi"]

    LocalMode --> Step3Ready["Spunta Verde Step 3 (Modalità Configurate)"]
    HybridMode --> Step3Ready

    Step3Ready --> Finish["Clicca 'ENTRA IN LIMEN VAULT'"]
    Finish --> MainUI(["Apertura Interfaccia Principale (Badge ● PRONTO)"])
```

---

### 4. MMD-004: WF-002 — Chiedi al Vault (Ricerca RAG e Chat)
*File sorgente: `04_MERMAID/WF-002.mmd`*

```mermaid
graph TD
    Start(["Utente accede a 'Chiedi al Vault' (SCR-002)"]) --> InputPrompt["Digitazione domanda nel box di input"]
    InputPrompt --> Submit["Clicca 'Invia Domanda' o preme INVIO"]
    Submit --> Embed["Backend calcola embedding query con bge-m3 locale"]
    Embed --> VectorSearch["Ricerca vettoriale Top-K nel database SQLite"]
    VectorSearch --> ContextAssembly["Composizione prompt con frammenti di contesto"]
    
    ContextAssembly --> InferenceRouter{"Controllo Router Generativo"}
    InferenceRouter -->|Modello Locale| LocalLlama["llama-server locale (HTTP 127.0.0.1:8080)"]
    InferenceRouter -->|Modello Cloud| OpenAICloud["OpenAI API endpoint /v1/chat/completions"]

    LocalLlama --> StreamSSE["Streaming Server-Sent Events (PIPE-003)"]
    OpenAICloud --> StreamSSE

    StreamSSE --> CheckThink{"Token entro tag &lt;think&gt;?"}
    CheckThink -->|Sì| RenderThink["Render in pannello 'Pensiero del modello'"]
    CheckThink -->|No| RenderBody["Render progressivo nel corpo risposta Markdown"]

    RenderThink --> StreamSSE
    RenderBody --> CheckComplete{"Ricevuto evento fine stream [DONE]?"}
    CheckComplete -->|No| StreamSSE
    CheckComplete -->|Sì| RenderSources["Render badge fonti verificate (Nome file, Pagina, Score)"]
    RenderSources --> Done(["Risposta completa e interattiva"])
```

---

### 5. MMD-005: WF-003 — Ispezione Fonti nel Lettore Documenti SHA-256
*File sorgente: `04_MERMAID/WF-003.mmd`*

```mermaid
graph TD
    Trigger(["Trigger: Clic su pillola fonte citata o pulsante 'Leggi' in Documenti"]) --> OpenModal["Apertura DocumentReaderModal (SCR-003)"]
    OpenModal --> LoadFile["Backend legge file grezzo da cartella 20_RAW_SOURCES"]
    LoadFile --> ComputeHash["Calcolo a caldo hash crittografico SHA-256"]
    ComputeHash --> CompareHash{"Hash coincide con record nel Vault?"}
    
    CompareHash -->|Sì| BadgeValid["Badge Verde: Integrità SHA-256 Verificata"]
    CompareHash -->|No| BadgeAlert["Badge Rosso: Allarme Manomissione Rilevata"]

    BadgeValid --> DetectFormat{"Rilevamento Estensione File"}
    BadgeAlert --> DetectFormat

    DetectFormat -->|PDF| RenderPDF["Renderizzatore PDF nativo con impaginatore"]
    DetectFormat -->|Markdown / MD| RenderMD["Renderizzatore Markdown formattato"]
    DetectFormat -->|Testo Puro / TXT| RenderTXT["Visualizzatore testo monospazio"]

    RenderPDF --> JumpToCitation["Salto automatico al paragrafo o pagina della citazione"]
    RenderMD --> JumpToCitation
    RenderTXT --> JumpToCitation

    JumpToCitation --> UserActions{"Azioni Utente"}
    UserActions -->|Chiudi| CloseModal(["Chiusura Modale"])
    UserActions -->|Copia Hash| CopyClipboard["Copia hash SHA-256 negli appunti"]
    UserActions -->|Cerca nel testo| SearchInDoc["Evidenziazione occorrenze nel documento"]
```

---

### 6. MMD-006: WF-004 — Ingestione Documenti (Selettore Nativo / Drag-and-Drop)
*File sorgente: `04_MERMAID/WF-004.mmd`*

```mermaid
graph TD
    TriggerChoice{"Azione di Ingestione Documenti"}
    TriggerChoice -->|Clic su Pulsante| ClickBtn["Clic su 'Carica Documenti' (#c8ff00, CTL-001) in Sidebar"]
    TriggerChoice -->|Trascinamento Diretto| DragDrop["Trascinamento (Drag-and-Drop) di file sull'interfaccia"]

    ClickBtn --> CallChoose["Invocazione IPC automationChooseFiles(vaultPath)"]
    CallChoose --> NativePicker["Apertura Selettore File Nativo OS (blocking_pick_files)"]
    NativePicker --> SelectFiles["Selezione file supportati (PDF, Word, Excel, Testo, Immagini)"]

    DragDrop --> ExtractPaths["Cattura percorsi file da dataTransfer.files"]
    ExtractPaths --> CallImport["Invocazione IPC automationImportFiles(vaultPath, filePaths)"]

    SelectFiles --> StartPipeline["Avvio Automatico Pipeline Ingestione ed Estrazione"]
    CallImport --> StartPipeline

    StartPipeline --> ExecExtraction["Invocazione processPendingExtractions(vaultPath) (PIPE-001)"]
    ExecExtraction --> LoopFile["Elaborazione File per File"]

    LoopFile --> CopyRaw["Archiviazione documento originale in 20_RAW_SOURCES/"]
    CopyRaw --> HashCalc["Calcolo immediato impronta crittografica SHA-256"]
    HashCalc --> ExtractText["Estrazione testo con limen-extract / Apple Vision OCR"]
    ExtractText --> ChunkSplit["Frammentazione semantica in chunk da ~512 token"]
    ChunkSplit --> EmbedModel["Calcolo vettori semantici con modello locale bge-m3"]
    EmbedModel --> SaveDB["Salvataggio vettori e metadati in database SQLite locale"]

    SaveDB --> NextFile{"Altri file da elaborare?"}
    NextFile -->|Sì| LoopFile
    NextFile -->|No| RefreshState["refreshCatalog() & refreshCompiler()"]
    RefreshState --> UpdateUI(["Aggiornamento Tabella Documenti (SCR-004) con stato 'Pronto'"])
```

---

### 7. MMD-007: WF-005 — Esplorazione e Navigazione Memoria (01-10)
*File sorgente: `04_MERMAID/WF-005.mmd`*

```mermaid
graph TD
    Trigger(["Accesso a '3. Memoria' (SCR-005)"]) --> LoadCategories["Caricamento categorie del Vault"]
    LoadCategories --> PillBar["Barra orizzontale 10 Categorie Aziendali: 01_CLIENTS ... 10_APPROVED_OUTPUTS"]

    PillBar --> SelectCategory["Selezione Categoria Desiderata (es. 02_PROJECTS)"]
    SelectCategory --> FilterNotes["Filtro note della cartella selezionata"]
    FilterNotes --> ListCards["Elenco schede note con titolo, percorso e stato YAML"]

    ListCards --> SelectNote["Selezione di una nota dalla lista"]
    SelectNote --> KnowledgePreview["Anteprima formattata nel KnowledgePanel con link wiki"]

    KnowledgePreview --> NoteActions{"Azioni sulla Nota"}
    NoteActions -->|Leggi| FullReader["Visualizzazione a schermo intero"]
    NoteActions -->|Apri Esterno| ObsidianLink["Apertura diretta del Vault in Obsidian (WF-012)"]
```

---

### 8. MMD-008: WF-006 — Revisione e Approvazione Bozze (90_PROPOSALS)
*File sorgente: `04_MERMAID/WF-006.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Bozze e Proposte' (SCR-006)"]) --> ScanProposals["Scansione bozze e proposte in 90_PROPOSALS/"]
    ScanProposals --> CheckCount{"Ci sono bozze in attesa?"}

    CheckCount -->|Zero bozze| EmptyList["Stato vuoto: 'Nessuna proposta in attesa di revisione'"]
    CheckCount -->|Almeno 1 bozza| ListProposals["Visualizzazione elenco bozze con stato, revisione e categoria"]

    ListProposals --> SelectProposal["Selezione di una proposta specifica"]
    SelectProposal --> InspectProposal["Pannello di revisione: testo proposto, hash SHA-256 e fonti"]

    InspectProposal --> Decision{"Decisione dell'Utente"}

    Decision -->|Modifica Testo| EditRevision["Creazione nuova revisione (conserva lo storico precedente)"]
    EditRevision --> InspectProposal

    Decision -->|Approva Revisione| ApproveFlow["Indicazione percorso destinazione in categoria 01-10 & Spunta di verifica"]
    ApproveFlow --> ApproveAction["Pulsante 'APPROVA REVISIONE MOSTRATA': Scrittura nota consolidata"]
    ApproveAction --> UpdateStatus["Transizione stato: approved nel Vault"]
    UpdateStatus --> ToastSuccess["Notifica: 'Proposta approvata e archiviata'"]
    ToastSuccess --> ListProposals

    Decision -->|Rifiuta Revisione| RejectFlow["Compilazione obbligatoria 'Motivo del rifiuto'"]
    RejectFlow --> RejectAction["Pulsante 'RIFIUTA REVISIONE MOSTRATA': Registrazione decision {reject, reason}"]
    RejectAction --> AuditTrail["Conservazione bozza con decisione tracciata nell'audit log (Nessuna cancellazione distruttiva)"]
    AuditTrail --> ListProposals
```

---

### 9. MMD-009: WF-007 — Gestione Snapshot e Ripristino Sicuro (Cartella RECUPERO)
*File sorgente: `04_MERMAID/WF-007.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Copie Locali & Ripristino' (SCR-007)"]) --> FetchSnapshots["Lettura archivio snapshot locali"]
    FetchSnapshots --> DisplaySnapshots["Visualizzazione tabella snapshot con data, dimensione, hash"]

    DisplaySnapshots --> Choice{"Azione da Eseguire"}

    Choice -->|Crea Nuovo Snapshot| InputName["Inserimento etichetta descrittiva dello snapshot"]
    InputName --> PackVault["Compressione directory Vault (note 01-10, bozze 90, sorgenti 20) in archivio .tar.zst"]
    PackVault --> GenManifest["Generazione manifesto crittografico SHA-256 (PIPE-004)"]
    GenManifest --> SaveArchive["Salvataggio in archivio snapshots locale"]
    SaveArchive --> RefreshList["Aggiornamento tabella con nuovo snapshot"]

    Choice -->|Ripristina da Snapshot| SelectSnapshot["Selezione snapshot desiderato dalla tabella"]
    SelectSnapshot --> SafetyCheck["Verifica di Sicurezza Rust: Divieto Sovrascrittura Vault Attivo"]
    SafetyCheck --> CreateDestDir["Creazione Automatica Cartella Separata: {vault}_RECUPERO_{snapshot_id}"]
    CreateDestDir --> ExtractFiles["Estrazione File con Verifica SHA-256 su Ciascun File"]
    ExtractFiles --> VerifyHashes{"Tutti gli Hash Corrispondono a snapshot_manifest.json?"}
    VerifyHashes -->|Errore / Corruzione| AbortRestore["Blocco Ripristino per Corruzione Rilevata"]
    VerifyHashes -->|Integrità Verificata| GenRecuperoManifest["Generazione Nuovo VAULT_MANIFEST.json nella Cartella RECUPERO"]
    GenRecuperoManifest --> SuccessToast["Notifica: Snapshot recuperato in cartella separata senza toccare il Vault attivo"]
```

---

### 10. MMD-010: WF-008 — Gestione Catalogo Modelli LLM e llama.cpp
*File sorgente: `04_MERMAID/WF-008.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Modelli LLM & llama.cpp' (SCR-009)"]) --> QueryCatalog["Caricamento catalogo 6 modelli da llama_llm.rs"]
    QueryCatalog --> CheckDisk["Scansione cartella models/ per verificare file GGUF presenti"]
    CheckDisk --> RenderCards["Renderizzazione 6 schede modello con tag RAM consigliata"]

    RenderCards --> CardAction{"Azione su Scheda Modello"}

    CardAction -->|Scarica Nuovo Modello| CheckRAM{"RAM di sistema sufficiente?"}
    CheckRAM -->|Insufficiente| RAMWarning["Avviso: RAM inferiore al requisito consigliato"]
    CheckRAM -->|Sufficiente| StartDownload["Avvio download HTTP asincrono da Hugging Face"]
    RAMWarning --> StartDownload

    StartDownload --> ProgressDrawer["Apertura cassetto avanzamento (Percentuale, MB/s)"]
    ProgressDrawer --> StreamChunks["Ricezione chunk binari GGUF"]
    StreamChunks --> VerifyDownloadHash["Verifica checksum SHA-256 rispetto al catalogo"]
    
    VerifyDownloadHash -->|Non corrispondente| HashError["Errore: Checksum corrotto, file eliminato"]
    VerifyDownloadHash -->|Valido| MarkDownloaded["File salvato in models/ e stato 'Pronto'"]

    CardAction -->|Attiva Modello| CheckActive{"llama-server già in esecuzione?"}
    CheckActive -->|Sì| StopOld["Terminazione graceful vecchia istanza llama-server"]
    CheckActive -->|No| LaunchNew["Avvio nuovo processo llama-server con argomenti Metal/AVX2"]
    StopOld --> LaunchNew

    LaunchNew --> HealthCheck["Polling HTTP GET /health su porta 8080"]
    HealthCheck --> ServerReady["Badge verde: 'Modello Attivo su llama-server'"]
```

---

### 11. MMD-011: WF-009 — Sincronizzazione Cloud S3/R2 (BYOB)
*File sorgente: `04_MERMAID/WF-009.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Sincronizzazione Cloud' (SCR-008)"]) --> LoadConfig["Lettura parametri S3/R2 da configurazione"]
    LoadConfig --> CheckCreds{"Credenziali S3 configurate?"}

    CheckCreds -->|No| PromptInput["Inserimento Endpoint, Bucket, Access Key, Secret Key"]
    PromptInput --> SaveConfig["Salvataggio sicuro delle credenziali locali"]
    CheckCreds -->|Sì| ReadySync["Pannello pronto per la sincronizzazione"]
    SaveConfig --> ReadySync

    ReadySync --> UserSyncAction{"Azione di Sincronizzazione"}

    UserSyncAction -->|Carica su Cloud (Push)| ScanLocal["Scansione snapshot e note locali"]
    ScanLocal --> EncryptPayload["Cifratura opzionale del payload"]
    EncryptPayload --> UploadS3["Invio blocchi su bucket compatibile S3"]
    UploadS3 --> PushDone["Notifica: 'Backup remoto completato'"]

    UserSyncAction -->|Scarica da Cloud (Pull)| QueryRemote["Interrogazione lista oggetti su bucket S3"]
    QueryRemote --> SelectRemote["Selezione archivio da ripristinare"]
    SelectRemote --> DownloadS3["Scaricamento blocchi compressi"]
    DownloadS3 --> ApplyLocal["Integrazione nel Vault locale (previo consenso)"]
    ApplyLocal --> PullDone["Notifica: 'Sincronizzazione completata'"]
```

---

### 12. MMD-012: WF-010 — Compilatore Fonti Testo da 20_RAW_SOURCES a 90_PROPOSALS
*File sorgente: `04_MERMAID/WF-010.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Compilatore manuale' (SCR-010)"]) --> CheckVault["Verifica Vault Aperto e Percorso Attivo"]
    CheckVault --> RenderUI["Visualizzazione Scheda 'Compilatore Markdown Manuale'"]
    RenderUI --> Subtitle["Visualizza: 'Compila file di testo e Markdown in bozze 90_PROPOSALS/'"]

    Subtitle --> UserAction{"Azione dell'Utente"}
    UserAction -->|Clicca su| BtnCompile["Pulsante: 'COMPILA FONTI TESTO'"]

    BtnCompile --> TriggerBatch["Invocazione IPC: batch_compile_sources(vaultPath)"]
    TriggerBatch --> ScanRaw["Scansione file di testo in 20_RAW_SOURCES/"]
    ScanRaw --> ExtractStructure["Estrazione metadati, intestazioni e normalizzazione Markdown"]
    ExtractStructure --> WriteProposals["Scrittura bozze con frontmatter YAML in 90_PROPOSALS/"]

    WriteProposals --> UpdateCount["Aggiornamento contatore bozze e stato UI"]
    UpdateCount --> SuccessNotice["Bozze create pronte per revisione in WF-006 (Bozze e Proposte)"]
```

---

### 13. MMD-013: WF-011 — Commutazione Istantanea Lingua (IT | EN)
*File sorgente: `04_MERMAID/WF-011.mmd`*

```mermaid
graph TD
    Trigger(["Trigger: Clic su Selettore Lingua nell'header globale (NAV-005)"]) --> CurrentLang{"Lingua Attualmente Attiva"}
    
    CurrentLang -->|Attualmente IT| ClickEN["Utente clicca sul pulsante 'EN'"]
    CurrentLang -->|Attualmente EN| ClickIT["Utente clicca sul pulsante 'IT'"]

    ClickEN --> SetLocaleEN["React Context imposta locale: 'en-US'"]
    ClickIT --> SetLocaleIT["React Context imposta locale: 'it-IT'"]

    SetLocaleEN --> PersistStorage["Salvataggio preferenza in LocalStorage / config.json"]
    SetLocaleIT --> PersistStorage

    PersistStorage --> ReRender["Ricaricamento a caldo del dizionario i18n nell'interfaccia"]
    ReRender --> UpdateLabels["Aggiornamento istantaneo testi: Menu, Pulsanti, Badge, Modali"]
    UpdateLabels --> NoReload(["Interfaccia aggiornata senza ricaricamento di pagina"])
```

---

### 14. MMD-014: WF-012 — Apertura Diretta del Vault in Obsidian
*File sorgente: `04_MERMAID/WF-012.mmd`*

```mermaid
graph TD
    Trigger(["Trigger: Clic su 'Apri in Obsidian' nell'header (NAV-004)"]) --> ReadConfig["Lettura percorso filesystem del Vault attivo"]
    ReadConfig --> EncodeURI["Codifica URI secondo lo schema Obsidian: obsidian://open?path=..."]
    EncodeURI --> TauriOpener["Invocazione comando Tauri shell open / tauri-plugin-opener"]
    
    TauriOpener --> OSCheck{"Obsidian installato nel sistema operativo?"}
    OSCheck -->|Sì| OpenObsidian["Apertura istantanea di Obsidian con il Vault caricato"]
    OSCheck -->|No| FallbackOS["Apertura cartella Vault nel file manager (Finder / Explorer)"]

    OpenObsidian --> SyncWarning["Nota: Nessun conflitto sui file Markdown standard"]
    FallbackOS --> SyncWarning
    SyncWarning --> Done(["Completamento workflow senza interruzioni"])
```

---

### 15. MMD-015: PIPE-001 — Ingestione ed Embedding Locale (bge-m3)
*File sorgente: `04_MERMAID/PIPE-001.mmd`*

```mermaid
flowchart TD
    RawFile["File Grezzo (PDF / MD / TXT)"] --> Hashing["PIPE-004: Calcolo Hash SHA-256"]
    Hashing --> StoreRaw["Archiviazione in 20_RAW_SOURCES"]
    
    StoreRaw --> Parse{"Formato Documento"}
    Parse -->|PDF| PdfParser["Parser PDF Rust (Estrazione testo e coordinate pagina)"]
    Parse -->|MD / TXT| TextNormalizer["Normalizzatore UTF-8 e Frontmatter Parser"]
    
    PdfParser --> CleanText["Testo Normalizzato"]
    TextNormalizer --> CleanText

    CleanText --> Chunker["Semantic Chunker (~512 Token, Overlap 50 Token)"]
    Chunker --> ChunkList["Frammenti Semantici con Metadati"]

    ChunkList --> EmbedEngine["Modello Locale bge-m3 (Accelerazione Metal/AVX2)"]
    EmbedEngine --> DenseVectors["Vettori Densi a 1024 Dimensioni"]

    DenseVectors --> SQLiteVec["Database SQLite Locale (sqlite-vec / memai)"]
    SQLiteVec --> ReadyStatus["Stato Documento: INDEXED"]
```

---

### 16. MMD-016: PIPE-002 — Routing della Risposta e Fallback RAG
*File sorgente: `04_MERMAID/PIPE-002.mmd`*

```mermaid
flowchart TD
    UserQuery["Domanda Utente"] --> QueryEmbed["Embedding Query tramite bge-m3"]
    QueryEmbed --> TopK["Ricerca Vettoriale Top-K nel Database Locale"]
    TopK --> Assembly["Composizione Context Prompt RAG"]

    Assembly --> ModeCheck{"Configurazione Modalità Attiva"}
    
    ModeCheck -->|100% Locale| LocalCheck{"llama-server Attivo su 127.0.0.1:8080?"}
    ModeCheck -->|Ibrida (Cloud)| KeyCheck{"Chiave OPENAI_API_KEY Presente e Valida?"}

    KeyCheck -->|Sì| OpenAICall["Invocazione OpenAI API /v1/chat/completions"]
    KeyCheck -->|No| LocalCheck

    LocalCheck -->|Sì| LlamaCall["Invocazione HTTP POST 127.0.0.1:8080/v1/chat/completions"]
    LocalCheck -->|No| SpawnServer["Avvio Automatico Processo llama-server con Modello GGUF"]
    SpawnServer --> HealthWait["Attesa Risposta GET /health (Porta 8080)"]
    HealthWait --> LlamaCall

    OpenAICall --> StreamEvents["PIPE-003: Ricezione Stream Server-Sent Events"]
    LlamaCall --> StreamEvents
```

---

### 17. MMD-017: PIPE-003 — Streaming Asincrono Token e Reasoning Trace
*File sorgente: `04_MERMAID/PIPE-003.mmd`*

```mermaid
flowchart TD
    EngineStream["Stream HTTP SSE (da llama-server o OpenAI)"] --> RustReader["Lettore SSE Asincrono in Rust (Tauri Backend)"]
    RustReader --> TauriEmitter["Emissione Evento 'chat-stream-delta' su Loopback Locale"]
    
    TauriEmitter --> FrontendListener["React Hook: useChatStreamListener"]
    FrontendListener --> TokenParse{"Parsing Token Ricevuto"}

    TokenParse -->|Apertura tag &lt;think&gt;| StartThink["Attivazione Stato: isThinking = true"]
    StartThink --> RenderAccordion["Espansione Card 'Pensiero del modello (Reasoning)'"]

    TokenParse -->|Dentro &lt;think&gt;...&lt;/think&gt;| AppendThink["Scrittura Token nel Box Collapsabile di Ragionamento"]

    TokenParse -->|Chiusura tag &lt;/think&gt;| EndThink["Attivazione Stato: isThinking = false (Collassa Box)"]

    TokenParse -->|Testo Normale Fuori dai Tag| AppendBody["Scrittura Token nel Corpo Principale Markdown"]

    AppendThink --> NextChunk{"Fine Stream [DONE]?"}
    AppendBody --> NextChunk
    EndThink --> NextChunk

    NextChunk -->|No| RustReader
    NextChunk -->|Sì| Finalize["Emissione Evento 'chat-stream-complete' con Fonti Verificate"]
    Finalize --> RenderSources["Visualizzazione Pillole Cliccabili delle Fonti Utilizzate"]
```

---

### 18. MMD-018: PIPE-004 — Catena di Integrità e Validazione SHA-256
*File sorgente: `04_MERMAID/PIPE-004.mmd`*

```mermaid
flowchart TD
    subgraph RawDocHashing ["A. Ingestione Documentale Raw"]
        FileIn["File immesso nel Vault"] --> ComputeDocHash["Calcolo SHA-256 binario"]
        ComputeDocHash --> StoreDocHash["Salvataggio hash in database e metadati"]
        ViewerOpen["Apertura nel DocumentReader"] --> RecheckDocHash["Ricalcolo a caldo SHA-256"]
        RecheckDocHash --> CompareDoc{"Coincide con db?"}
        CompareDoc -->|Sì| BadgeGreen["Integrità Verificata"]
        CompareDoc -->|No| BadgeRed["Allarme Manomissione"]
    end

    subgraph ModelIntegrity ["B. Download Modelli GGUF"]
        ModelDL["Download Chunk GGUF da Hugging Face"] --> AssemblyFile["Composizione File Finale in models/"]
        AssemblyFile --> ComputeModelHash["Calcolo SHA-256 del Modello"]
        ComputeModelHash --> CompareCatalog{"Coincide con LLM_CATALOG in Rust?"}
        CompareCatalog -->|Sì| MarkReady["Stato: Pronto per Inferenza"]
        CompareCatalog -->|No| PurgeFile["Eliminazione Immediata File Corrotto"]
    end

    subgraph SnapshotHashing ["C. Generazione e Ripristino Snapshot"]
        SnapTrigger["Trigger Creazione Snapshot"] --> WalkTree["Scansione albero cartelle 00, 10, 20"]
        WalkTree --> GenManifest["Generazione Manifest SHA-256 complessivo"]
        GenManifest --> ZipVault["Creazione Archivio Cifrato / Compresso"]
        RestoreTrigger["Trigger Ripristino Snapshot"] --> VerifyZip["Verifica Integrità Manifest prima dell'estrazione"]
    end
```

---
