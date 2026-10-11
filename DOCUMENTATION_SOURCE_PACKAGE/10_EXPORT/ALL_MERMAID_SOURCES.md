# Raccolta Completa Sorgenti Mermaid — LIMEN Vault v7Mini

Il presente documento raccoglie tutti i **18 diagrammi Mermaid** del pacchetto di documentazione di LIMEN Vault (0.7.0).  
Ogni diagramma è racchiuso in un blocco di codice fenced (` ```mermaid `) ed è immediatamente renderizzabile all'interno di Obsidian, GitHub, GitLab o visualizzatori Markdown compatibili.

---

## Indice dei Diagrammi

1. [MMD-001: Mappa di Navigazione Completa del Sistema](#1-mmd-001-mappa-di-navigazione-completa-del-sistema)
2. [MMD-002: Ciclo di Avvio, Verifica Requisiti e Setup Wizard](#2-mmd-002-ciclo-di-avvio-verifica-requisiti-e-setup-wizard)
3. [MMD-003: WF-001 — Configurazione Iniziale e Setup Wizard](#3-mmd-003-wf-001--configurazione-iniziale-e-setup-wizard)
4. [MMD-004: WF-002 — Chiedi al Vault (Ricerca RAG e Chat)](#4-mmd-004-wf-002--chiedi-al-vault-ricerca-rag-e-chat)
5. [MMD-005: WF-003 — Ispezione Fonti nel Lettore Documenti](#5-mmd-005-wf-003--ispezione-fonti-nel-lettore-documenti)
6. [MMD-006: WF-004 — Caricamento e Ingestione Documenti](#6-mmd-006-wf-004--caricamento-e-ingestione-documenti)
7. [MMD-007: WF-005 — Esplorazione e Navigazione Memoria](#7-mmd-007-wf-005--esplorazione-e-navigazione-memoria)
8. [MMD-008: WF-006 — Revisione e Approvazione Bozze Note](#8-mmd-008-wf-006--revisione-e-approvazione-bozze-note)
9. [MMD-009: WF-007 — Gestione Snapshot e Ripristino Vault](#9-mmd-009-wf-007--gestione-snapshot-e-ripristino-vault)
10. [MMD-010: WF-008 — Gestione Catalogo Modelli LLM e llama.cpp](#10-mmd-010-wf-008--gestione-catalogo-modelli-llm-e-llamacpp)
11. [MMD-011: WF-009 — Sincronizzazione Cloud S3/R2](#11-mmd-011-wf-009--sincronizzazione-cloud-s3r2)
12. [MMD-012: WF-010 — Compilazione Manuale Rete Zero](#12-mmd-012-wf-010--compilazione-manuale-rete-zero)
13. [MMD-013: WF-011 — Commutazione Lingua Interfaccia (IT / EN)](#13-mmd-013-wf-011--commutazione-lingua-interfaccia-it--en)
14. [MMD-014: WF-012 — Apertura Diretta del Vault in Obsidian](#14-mmd-014-wf-012--apertura-diretta-del-vault-in-obsidian)
15. [MMD-015: PIPE-001 — Ingestione, Chunking ed Embedding bge-m3](#15-mmd-015-pipe-001--ingestione-chunking-ed-embedding-bge-m3)
16. [MMD-016: PIPE-002 — Generazione Risposte e Routing Ibrido](#16-mmd-016-pipe-002--generazione-risposte-e-routing-ibrido)
17. [MMD-017: PIPE-003 — Streaming SSE e Reasoning Trace](#17-mmd-017-pipe-003--streaming-sse-e-reasoning-trace)
18. [MMD-018: PIPE-004 — Integrità Crittografica SHA-256](#18-mmd-018-pipe-004--integrità-crittografica-sha-256)

---

### 1. MMD-001: Mappa di Navigazione Completa del Sistema
*File sorgente: `04_MERMAID/SYSTEM_NAVIGATION.mmd`*

```mermaid
graph TD
    classDef headerStyle fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef navStyle fill:#1e293b,stroke:#64748b,stroke-width:1px,color:#f8fafc;
    classDef areaStyle fill:#0f172a,stroke:#334155,stroke-width:1px,color:#94a3b8;
    classDef modalStyle fill:#1e293b,stroke:#c8ff00,stroke-width:2px,color:#f8fafc;
    classDef drawerStyle fill:#1e293b,stroke:#eab308,stroke-width:1px,color:#f8fafc;

    subgraph Header ["BARRA SUPERIORE (GLOBAL HEADER)"]
        H1["Logo LIMEN Vault & Badge 0.7.0"]:::headerStyle
        H2["Stato Rete: 100% Locale / Ibrido"]:::headerStyle
        H3["Pulsante Apri in Obsidian"]:::headerStyle
        H4["Selettore Lingua: IT / EN"]:::headerStyle
        H5["Pulsante Globale: Carica Documenti"]:::headerStyle
    end

    subgraph NavArea ["BARRA DI NAVIGAZIONE PRINCIPALE"]
        N1["1. Chiedi al Vault"]:::navStyle
        N2["2. Documenti"]:::navStyle
        N3["3. Memoria"]:::navStyle
        N4["4. Avanzate"]:::navStyle
    end

    subgraph Area1 ["1. CHIEDI AL VAULT (Chat RAG)"]
        A1_1["Thread Storico Conversazioni"]:::areaStyle
        A1_2["Pannello Reasoning Trace (DeepSeek-R1)"]:::areaStyle
        A1_3["Output Risposta con Fonti Verificate"]:::areaStyle
        A1_4["Input Prompt con Invio e Modello"]:::areaStyle
    end

    subgraph Area2 ["2. DOCUMENTI"]
        A2_1["Filtro Ricerca Testuale & Ordinamento"]:::areaStyle
        A2_2["Tabella File: Nome, Tipo, Data, Hash"]:::areaStyle
        A2_3["Pulsante Leggi (Apre Lettore)"]:::areaStyle
    end

    subgraph Area3 ["3. MEMORIA"]
        A3_1["Tag Cloud & Categorie Semantiche"]:::areaStyle
        A3_2["Mappa Concettuale / Grafo di Memoria"]:::areaStyle
        A3_3["Elenco Note Consolidate del Vault"]:::areaStyle
    end

    subgraph Area4 ["4. SEZIONI AVANZATE"]
        A4_1["A. Approvazione Note (Bozze 00_INBOX)"]:::areaStyle
        A4_2["B. Snapshot e Ripristino"]:::areaStyle
        A4_3["C. Catalogo Modelli LLM & llama.cpp"]:::areaStyle
        A4_4["D. Sincronizzazione Cloud S3/R2"]:::areaStyle
        A4_5["E. Compilazione Manuale Rete Zero"]:::areaStyle
        A4_6["F. Configurazione e Impostazioni"]:::areaStyle
        A4_7["G. Diagnostica e Log di Sistema"]:::areaStyle
    end

    subgraph Overlays ["MODALI E CASSETTI CONTESTUALI"]
        M1["SetupWizardModal: Configurazione Vault e LLM"]:::modalStyle
        M2["DocumentReaderModal: Viewer TXT/MD/PDF con Hash SHA-256"]:::modalStyle
        D1["UploadDrawer: Caricamento File e Directory"]:::drawerStyle
        D2["ModelDownloadDrawer: Avanzamento Download GGUF"]:::drawerStyle
    end

    H5 -->|Clicca| D1
    N1 --> Area1
    N2 --> Area2
    N3 --> Area3
    N4 --> Area4

    A2_3 -->|Clicca| M2
    A1_3 -->|Clicca Fonte| M2
    A4_3 -->|Download Modello| D2
    H1 -->|Primo Avvio o Reset| M1
```

---

### 2. MMD-002: Ciclo di Avvio, Verifica Requisiti e Setup Wizard
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
    Core-->>App: Versione 0.7.0, Architettura rilevata (Metal/AVX2), RAM disponibile
    App->>Core: check_vault_exists()
    Core->>FS: Verifica cartella Vault e file di configurazione

    alt Vault NON configurato (Primo Avvio)
        Core-->>App: Vault non trovato (isConfigured: false)
        App->>Utente: Apertura automatica Setup Wizard (Step 1/3: Modalità Rete)
        Utente->>App: Selezione "100% Locale" o "Ibrida (Cloud + Locale)"
        Utente->>App: Clicca "Avanti" (Step 2/3: Selezione/Creazione Vault)
        Utente->>App: Clicca "Sfoglia cartella" o inserisce percorso
        App->>Core: init_or_validate_vault_path(path)
        Core->>FS: Creazione struttura cartelle (00_INBOX, 10_KNOWLEDGE, 20_RAW_SOURCES)
        Core-->>App: Percorso Vault validato con successo
        Utente->>App: Clicca "Avanti" (Step 3/3: Selezione Modello LLM)
        Utente->>App: Sceglie modello (es. Ministral 3B) e clicca "Scarica / Configura"
        App->>Core: download_or_verify_model(model_id)
        Core->>Model: Controllo presenza GGUF e verifica SHA-256
        Core-->>App: Modello pronto
        Utente->>App: Clicca "Completa Configurazione"
        App->>Core: save_configuration(vault_path, mode, model_id)
        Core-->>App: Configurazione salvata
    else Vault GIÀ configurato
        Core-->>App: Vault valido rilevato (isConfigured: true)
    end

    App->>Core: start_llama_server_if_needed()
    Core-->>App: llama-server attivo su porta locale 8080
    App->>Utente: Visualizzazione Schermata Principale (1. Chiedi al Vault)
```

---

### 3. MMD-003: WF-001 — Configurazione Iniziale e Setup Wizard
*File sorgente: `04_MERMAID/WF-001.mmd`*

```mermaid
graph TD
    Start(["Avvio Setup Wizard (SCR-001)"]) --> Step1["Step 1: Scelta Modalità Operativa"]
    Step1 -->|Opzione A| ModeLocal["Modalità 100% Locale (Zero-Rete)"]
    Step1 -->|Opzione B| ModeHybrid["Modalità Ibrida (Cloud OpenAI + Locale)"]
    
    ModeHybrid --> InputKey["Inserimento Chiave OPENAI_API_KEY"]
    InputKey --> Step2["Step 2: Configurazione Percorso Vault"]
    ModeLocal --> Step2

    Step2 --> ChoosePath{"Scelta Percorso Cartella"}
    ChoosePath -->|Nuovo Vault| CreateDirs["Creazione Struttura (00_INBOX, 10_KNOWLEDGE, 20_RAW_SOURCES)"]
    ChoosePath -->|Vault Esistente| ValidateDirs["Validazione Struttura Directory Esistente"]

    CreateDirs --> Step3["Step 3: Selezione Modello LLM Predefinito"]
    ValidateDirs --> Step3

    Step3 --> SelectModel{"Modello Selezionato"}
    SelectModel -->|Ministral 3B / Qwen 7B| CheckModel{"File GGUF Presente?"}
    SelectModel -->|OpenAI Cloud (Se Ibrido)| SkipDownload["Verifica Connessione API"]

    CheckModel -->|Sì| Ready["Stato Pronto"]
    CheckModel -->|No| TriggerDownload["Download Asincrono con Barra Avanzamento"]
    TriggerDownload --> VerifyHash["Verifica Hash SHA-256 Integrità"]
    VerifyHash --> Ready

    SkipDownload --> Ready
    Ready --> Finish["Clicca 'Completa Configurazione'"]
    Finish --> MainUI(["Apertura Interfaccia Principale (SCR-002)"])
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

### 5. MMD-005: WF-003 — Ispezione Fonti nel Lettore Documenti
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

### 6. MMD-006: WF-004 — Caricamento e Ingestione Documenti
*File sorgente: `04_MERMAID/WF-004.mmd`*

```mermaid
graph TD
    Trigger(["Trigger: Clic su pulsante globale 'Carica' (NAV-006)"]) --> OpenDrawer["Apertura UploadDrawer (SCR-004)"]
    OpenDrawer --> ChooseMethod{"Metodo di Caricamento"}
    
    ChooseMethod -->|Singoli File| PickFiles["Finestra selezione file di sistema (PDF, MD, TXT)"]
    ChooseMethod -->|Intera Cartella| PickFolder["Finestra selezione directory di sistema"]
    ChooseMethod -->|Drag and Drop| DropArea["Trascina file nell'area tratteggiata"]

    PickFiles --> StagingList["Popolamento coda documenti da elaborare"]
    PickFolder --> StagingList
    DropArea --> StagingList

    StagingList --> StartIngest["Clicca 'Avvia Indicizzazione'"]
    StartIngest --> LoopFile["Per ogni file nella coda (PIPE-001)"]
    
    LoopFile --> CopyRaw["Archiviazione in 20_RAW_SOURCES"]
    CopyRaw --> HashCalc["Calcolo hash SHA-256 e registrazione"]
    HashCalc --> ExtractText["Estrazione testo e pulizia caratteri"]
    ExtractText --> ChunkSplit["Suddivisione in frammenti di ~512 token"]
    ChunkSplit --> EmbedModel["Calcolo vettori semantici con bge-m3 locale"]
    EmbedModel --> SaveDB["Salvataggio chunk e vettori in database SQLite"]

    SaveDB --> NextFile{"Altri file in coda?"}
    NextFile -->|Sì| LoopFile
    NextFile -->|No| CompleteNotification["Notifica successo: X file indicizzati"]
    CompleteNotification --> RefreshDocList(["Aggiornamento vista 'Documenti' (SCR-002)"])
```

---

### 7. MMD-007: WF-005 — Esplorazione e Navigazione Memoria
*File sorgente: `04_MERMAID/WF-005.mmd`*

```mermaid
graph TD
    Trigger(["Accesso a '3. Memoria' (SCR-005)"]) --> LoadIndex["Caricamento indice concetti e note del Vault"]
    LoadIndex --> ViewLayout{"Selezione Modalità di Visualizzazione"}
    
    ViewLayout -->|Tag e Categorie| TagView["Pannello Tag Cloud e Categorie Semantiche"]
    ViewLayout -->|Grafo Relazionale| GraphView["Mappa concettuale interattiva dei collegamenti"]
    ViewLayout -->|Elenco Note| ListView["Tabella note consolidate in 10_KNOWLEDGE"]

    TagView --> SelectTag["Filtro note per tag selezionato"]
    GraphView --> ClickNode["Clic su nodo concettuale e apertura note correlate"]
    ListView --> SearchNotes["Digitazione parole chiave nella barra di filtro"]

    SelectTag --> DetailCard["Apertura scheda anteprima nota di memoria"]
    ClickNode --> DetailCard
    SearchNotes --> DetailCard

    DetailCard --> NoteActions{"Azioni sulla Nota"}
    NoteActions -->|Leggi| FullReader["Apertura visualizzatore completo"]
    NoteActions -->|Apri Esterno| ObsidianLink["Apertura della nota in Obsidian Markdown"]
    NoteActions -->|Rigenera| ReEmbed["Ricalcolo embedding semantico per la nota"]
```

---

### 8. MMD-008: WF-006 — Revisione e Approvazione Bozze Note
*File sorgente: `04_MERMAID/WF-006.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Approvazione Note (Bozze)' (SCR-006)"]) --> ScanInbox["Scansione cartella 00_INBOX del Vault"]
    ScanInbox --> CheckCount{"Ci sono note in bozza?"}
    
    CheckCount -->|Zero note| EmptyInbox["Stato vuoto: 'Nessuna bozza in attesa'"]
    CheckCount -->|Almeno 1 nota| ListDrafts["Visualizzazione elenco bozze con titolo e anteprima"]

    ListDrafts --> SelectDraft["Selezione di una bozza specifica"]
    SelectDraft --> InspectDraft["Pannello di revisione: testo proposto, fonti, tag"]
    
    InspectDraft --> Decision{"Decisione dell'Utente"}
    
    Decision -->|Modifica| EditMode["Editing inline di titolo, tag o corpo testo"]
    EditMode --> Decision

    Decision -->|Approva e Promuovi| ApproveAction["Spostamento file da 00_INBOX a 10_KNOWLEDGE"]
    ApproveAction --> UpdateDB["Aggiornamento indice: stato NOTA_CONSOLIDATA"]
    UpdateDB --> ToastSuccess["Notifica verde: 'Nota approvata e consolidata'"]
    ToastSuccess --> ListDrafts

    Decision -->|Scarta / Elimina| RejectAction["Rimozione file dalla cartella 00_INBOX"]
    RejectAction --> ToastDeleted["Notifica: 'Bozza scartata definitivamente'"]
    ToastDeleted --> ListDrafts
```

---

### 9. MMD-009: WF-007 — Gestione Snapshot e Ripristino Vault
*File sorgente: `04_MERMAID/WF-007.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Snapshot e Ripristino' (SCR-007)"]) --> FetchSnapshots["Lettura archivio snapshot locali"]
    FetchSnapshots --> DisplaySnapshots["Visualizzazione tabella snapshot con data, dimensione, hash"]

    DisplaySnapshots --> Choice{"Azione da Eseguire"}

    Choice -->|Crea Nuovo Snapshot| InputName["Inserimento etichetta descrittiva dello snapshot"]
    InputName --> PackVault["Compressione directory Vault (00, 10, 20) in archivio"]
    PackVault --> GenManifest["Generazione manifesto crittografico SHA-256 (PIPE-004)"]
    GenManifest --> SaveArchive["Salvataggio in archivio snapshots locale"]
    SaveArchive --> RefreshList["Aggiornamento tabella con nuovo snapshot"]

    Choice -->|Ripristina da Snapshot| SelectSnapshot["Selezione snapshot desiderato dalla lista"]
    SelectSnapshot --> WarningModal["Modale di conferma con avviso di sovrascrittura"]
    WarningModal --> Confirm{"Conferma ripristino?"}
    Confirm -->|Annulla| DisplaySnapshots
    Confirm -->|Procedi| ExtractArchive["Estrazione sicura e sovrascrittura cartelle Vault"]
    ExtractArchive --> Reindex["Ricalcolo automatico indici vettoriali"]
    Reindex --> SuccessToast["Notifica: 'Vault ripristinato con successo'"]
```

---

### 10. MMD-010: WF-008 — Gestione Catalogo Modelli LLM e llama.cpp
*File sorgente: `04_MERMAID/WF-008.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Modelli LLM & llama.cpp' (SCR-008)"]) --> QueryCatalog["Caricamento catalogo 6 modelli da llama_llm.rs"]
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

### 11. MMD-011: WF-009 — Sincronizzazione Cloud S3/R2
*File sorgente: `04_MERMAID/WF-009.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Sincronizzazione Cloud' (SCR-009)"]) --> LoadConfig["Lettura parametri S3/R2 da configurazione"]
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

### 12. MMD-012: WF-010 — Compilazione Manuale Rete Zero
*File sorgente: `04_MERMAID/WF-010.mmd`*

```mermaid
graph TD
    Trigger(["Accesso ad 'Avanzate > Compilazione Manuale' (SCR-010)"]) --> CheckEnv["Rilevamento toolchain di sistema (Node.js, Rust/Cargo, CMake)"]
    CheckEnv --> CheckMetal["Rilevamento supporto accelerazione hardware (Metal / AVX2)"]
    CheckMetal --> RenderCommands["Visualizzazione comandi ufficiali di compilazione offline"]

    RenderCommands --> CopyCommand{"Azione dell'Utente"}

    CopyCommand -->|Copia Comando Desktop| CopyDesktop["Copia negli appunti: pnpm --filter @limen-vault/desktop tauri dev --release"]
    CopyCommand -->|Copia Comando llama.cpp| CopyLlama["Copia flag di build: cmake -B build -DGGML_METAL=ON"]
    CopyCommand -->|Verifica Cache| ViewCacheStatus["Ispezione stato cache compilatore cargo/pnpm"]

    CopyDesktop --> PasteTerminal["Incolla ed esecuzione nel terminale di sistema"]
    CopyLlama --> PasteTerminal
    ViewCacheStatus --> PasteTerminal

    PasteTerminal --> BinaryOutput["Generazione binario nativo standalone privo di dipendenze esterne"]
```

---

### 13. MMD-013: WF-011 — Commutazione Lingua Interfaccia (IT / EN)
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

### 15. MMD-015: PIPE-001 — Ingestione, Chunking ed Embedding bge-m3
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

### 16. MMD-016: PIPE-002 — Generazione Risposte e Routing Ibrido
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

### 17. MMD-017: PIPE-003 — Streaming SSE e Reasoning Trace
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

### 18. MMD-018: PIPE-004 — Integrità Crittografica SHA-256
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
