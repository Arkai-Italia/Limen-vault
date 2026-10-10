# LIMEN Vault v6Mini — Manuale Utente & Guida Operativa
Edizione italiana · Ottobre 2026 · Versione 0.6.0 (macOS / Windows)

---

## 1. Mappa di Navigazione dei Menu e Struttura dell'Interfaccia

LIMEN Vault è articolato attorno a **3 aree funzionali principali** sempre accessibili dalla barra laterale sinistra, più un pannello di gestione tecnica avanzata:

```mermaid
graph TD
    subgraph Sidebar["Barra Laterale Sinistra (Sempre Presente)"]
        UploadGlobal["🟢 PULSANTE 'CARICA DOCUMENTI' (Verde Lime)"]
        NavAsk["✦ 1. CHIEDI (Chat Continua & Ricerca Semantica)"]
        NavDocs["📁 2. DOCUMENTI (Archivio 20_RAW_SOURCES)"]
        NavMemory["📚 3. MEMORIA (Note Wiki Categorie 01-10)"]
        NavAdvanced["⚙️ 4. AVANZATE (Governance & Impostazioni)"]
        HistoryList["🕒 STORICO CONVERSAZIONI (Sessioni archiviate per data)"]
        ObsidianBtn["↗ 'Apri in Obsidian' (Apre la cartella nell'editor esterno)"]
    end

    subgraph AreaAsk["Area 1: CHIEDI"]
        ChatFeed["Feed Conversazione (Bolla Utente Verde / Assistente Bianca)"]
        ToggleLocal["Pulsante Toggle: 'SOLO LOCALE (Mac)'"]
        BarInput["Casella di Scrittura Fissa in Basso"]
        SourcesDrawer["Cassetto Laterale Destro: Fonti Citate"]
        DocReaderModal["Modal Lettore Documenti (Verifica SHA-256 e Paragrafo)"]
    end

    subgraph AreaDocs["Area 2: DOCUMENTI"]
        RawList["Tabella Documenti Grezzi (PDF, DOCX, XLSX, TXT)"]
        ExtractionStatus["Stato Estrazione & Conteggio Passaggi"]
        DocPreview["Visualizzatore Anteprima Testuale"]
    end

    subgraph AreaMemory["Area 3: MEMORIA"]
        CategoryNav["Filtro Categorie (01_CLIENTS ... 10_APPROVED)"]
        NotesGrid["Elenco Note Markdown & Validazione Frontmatter YAML"]
    end

    subgraph AreaAdvanced["Area 4: AVANZATE (Sottomenu Superiore Orizzontale)"]
        SubProposals["Bozze e Proposte (90_PROPOSALS/ - Approvazione Note)"]
        SubSnapshots["Copie Locali & Ripristino (Manifesto SHA-256 e Restore)"]
        SubTransfers["Trasferimenti (Sincronizzazione Cloud S3 / R2)"]
        SubAI["Collegamenti AI & Catalogo Modelli (bge-m3 + 6 LLM Locali)"]
        SubCompiler["Compilatore Manuale (Batch Markdown da Testo Grezzo)"]
        SubSystem["Stato di Sistema (Memoria RAM, Metal GPU, Diagnostic)"]
        SubHelp["Guida Vault (Documentazione Tecnica Integrata)"]
    end

    UploadGlobal -->|Apre il file picker nativo e porta in| AreaDocs
    NavAsk --> AreaAsk
    NavDocs --> AreaDocs
    NavMemory --> AreaMemory
    NavAdvanced --> AreaAdvanced

    ChatFeed -->|Clic su 'N fonti citate'| SourcesDrawer
    SourcesDrawer -->|Clic su 'Apri documento'| DocReaderModal
    AreaAdvanced --> SubProposals
    AreaAdvanced --> SubSnapshots
    AreaAdvanced --> SubTransfers
    AreaAdvanced --> SubAI
    AreaAdvanced --> SubCompiler
    AreaAdvanced --> SubSystem
    AreaAdvanced --> SubHelp
```

---

## 2. Come Operativamente ci si Muove nei Menu (Guida Passo-Passo)

```mermaid
sequenceDiagram
    autonumber
    actor Utente
    participant Sidebar as Barra Laterale Sinistra
    participant MainView as Area di Lavoro Principale
    participant Drawer as Cassetto Laterale / Modal

    Utente->>Sidebar: Clic su "Chiedi"
    Sidebar-->>MainView: Si apre la Chat (Feed messaggi e barra fissa in basso)
    Utente->>MainView: Digita la domanda e preme Invio (o clic su "Chiedi")
    MainView-->>Utente: Riceve risposta in streaming con pulsante "N fonti citate"
    Utente->>MainView: Clic su "N fonti citate"
    MainView-->>Drawer: Si apre la colonna delle Fonti sulla destra
    Utente->>Drawer: Clic su un passaggio citato -> Pop-up dettagli
    Utente->>Drawer: Clic su "Apri documento"
    Drawer-->>MainView: Apertura a schermo intero del lettore integrato verificato SHA-256
    Utente->>MainView: Chiude il lettore (tasto Esc o pulsante X) -> Ritorno immediato alla chat
    Utente->>Sidebar: Clic su "Avanzate"
    Sidebar-->>MainView: Comparsa della barra superiore orizzontale
    Utente->>MainView: Clic su "Collegamenti AI & MCP"
    MainView-->>Utente: Visualizza lo stato di bge-m3 e il catalogo dei 6 modelli locali
```

### Regole Operative di Navigazione:
1. **Passaggio Istantaneo tra le Aree**: È sufficiente un clic sulle icone della barra laterale sinistra (**Chiedi**, **Documenti**, **Memoria**, **Avanzate**). Il passaggio non cancella il testo digitato né interrompe le risposte in streaming.
2. **Navigazione nei Sottomenu di Avanzate**: Entrando in **Avanzate**, la barra orizzontale in alto espone le 7 sezioni di governance. Un clic su ciascuna scheda apre immediatamente i relativi controlli (es. *Collegamenti AI* per scaricare modelli, *Copie locali* per creare snapshot).
3. **Cassetto Fonti e Lettore Integrato**: Cliccando su *"N fonti citate"* in calce a una risposta, la colonna destra mostra i documenti di provenienza. Cliccando su una fonte si apre il dettaglio con il testo del passaggio; cliccando su *"Apri documento"* si accede al file originale con evidenziazione del paragrafo e verifica SHA-256.
4. **Storico Conversazioni Persistente**: In fondo alla barra sinistra compare l'elenco dei thread passati. Cliccando su un titolo, l'intera conversazione viene ricaricata con tutte le sue fonti e citazioni originali.
5. **Caricamento Globale dei Documenti**: Il pulsante verde lime **"CARICA DOCUMENTI"** in alto a sinistra è sempre visibile. Permette di selezionare file da Finder/Explorer e avviare in tempo reale l'estrazione e l'indicizzazione semantica.

---

## 3. Workflow Operativi con Diagrammi Mermaid

### WORKFLOW 1: Configurazione Guidata al Primo Avvio (Setup Wizard)

```mermaid
graph TD
    Start([Avvio LIMEN Vault]) --> Check{"Controllo Requisiti:
    1. Vault Aperto?
    2. LLM Locale Installato?
    3. Chiave API o Solo Locale?"}
    Check -->|Tutte e 3 Soddisfatte| Ready[Schermata Operativa del Vault]
    Check -->|Almeno 1 Mancante| Wizard["Pop-up Setup Wizard Onboarding (Dark-Glass Minimal)"]
    
    subgraph Steps["3 Passaggi Guidati"]
        S1["Step 1: Cartella Vault (Sfoglia o Crea Nuovo)"]
        S2["Step 2: Motore AI Locale (Rilevamento RAM e Scelta Modello)"]
        S3["Step 3: Modalità AI (Scelta Solo Locale o Chiave OpenAI)"]
        S1 --> S2 --> S3
    end
    
    Wizard --> Steps
    Steps --> Done["Clic su 'Entra in LIMEN Vault'"]
    Done --> Ready
```

---

### WORKFLOW 2: Interrogazione Aumentata, Citazione Fonti e Lettore Documenti

```mermaid
graph TD
    Ask1[Apri scheda 'Chiedi'] --> Ask2[Digita domanda nella barra fissa in basso]
    Ask2 --> Ask3{Modalità Attiva?}
    Ask3 -->|SOLO LOCALE| LocalGen[Generazione 100% Offline su GPU Metal con Modello Selezionato]
    Ask3 -->|IBRIDA OPENAI| CloudGen[Ricerca Locale bge-m3 + Invio passaggi a OpenAI]
    LocalGen --> StreamResp[Risposta in streaming con badge offline]
    CloudGen --> StreamResp
    StreamResp --> CiteBtn[Clic su pulsante 'N fonti citate']
    CiteBtn --> SideDrawer[Apertura cassetto Fonti nella barra laterale]
    SideDrawer --> ViewPassage[Clic sul passaggio desiderato -> Pop-up dettagli]
    ViewPassage --> OpenDoc[Clic su 'Apri documento' -> DocumentReaderModal verificato SHA-256]
```

---

### WORKFLOW 3: Acquisizione Documenti e Ricalcolo Cache Semantica

```mermaid
graph TD
    U1[Clic su 'CARICA DOCUMENTI' in barra laterale] --> U2[Selezione file: PDF, DOCX, XLSX, TXT]
    U2 --> U3[Archiviazione immutabile in 20_RAW_SOURCES/]
    U3 --> U4[Estrazione nativa testo e segmentazione in passaggi]
    U4 --> U5[Aggiornamento automatico indice lessicale BM25]
    U5 --> U6[Avanzate -> Collegamenti AI -> RICALCOLA CACHE]
    U6 --> U7[Generazione transitoria in .staging.json]
    U7 --> U8[Promozione a 100%: Indice Semantico Allineato]
```

---

### WORKFLOW 4: Gestione Snapshot Immutabili e Ripristino di Sicurezza

```mermaid
graph TD
    S1[Avanzate -> Copie locali e Ripristino] --> S2[Inserimento nota descrittiva opzionale]
    S2 --> S3[Clic su 'CREA COPIA LOCALE']
    S3 --> S4[Generazione snapshot crittografico SHA-256 in 00_SYSTEM/SNAPSHOTS/]
    S4 --> S5{Necessità Ripristino?}
    S5 -->|Sì| S6[Clic su 'RIPRISTINA IN CARTELLA SEPARATA']
    S6 --> S7[Ricostruzione sicura del Vault in percorso isolato]
    S5 -->|No| S8[Operatività regolare preservata]
```

---

## 4. Catalogo Multi-Modello Locale e Vincoli Hardware (RAM)

LIMEN Vault supporta **6 modelli open-source instruction-tuned e reasoning** in formato GGUF (quantizzazione efficiente `Q4_K_M`):

| ID Modello | Nome Visualizzato | Peso GGUF | Context | RAM Minima | RAM Consigliata | Specializzazione |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ministral-3b` | **Ministral 3 3B Instruct** | ~2,06 GB | 32k | **8 GB** | 8–16 GB | Ultra-leggero e rapido; ideale per MacBook Air e macchine da 8 GB. |
| `ministral-8b` | **Ministral 3 8B Instruct** | ~4,92 GB | 32k | **16 GB** | 16–24 GB | Bilanciamento ottimale tra velocità su Metal GPU e ricchezza espressiva in italiano. |
| `qwen-2.5-7b` | **Qwen 2.5 7B Instruct** | ~4,68 GB | 32k | **16 GB** | 16–24 GB | Rigorosa aderenza alle istruzioni, estrazione tabelle e formattazione Markdown. |
| `llama-3.1-8b` | **Llama 3.1 8B Instruct (Meta)** | ~4,92 GB | 32k | **16 GB** | 16–24 GB | Standard industriale per sintesi esecutive, tone of voice e compiti generativi. |
| `deepseek-r1-7b` | **DeepSeek-R1-Distill-Qwen-7B** | ~4,68 GB | 32k | **16 GB** | 16–24 GB | **Ragionamento Profondo**: genera catena di pensiero (*Chain of Thought*) con blocco collassabile `<think>`. |
| `deepseek-r1-14b`| **DeepSeek-R1-Distill-Qwen-14B**| ~8,99 GB | 32k | **24 GB** | 32 GB+ | Massima potenza deduttiva locale per audit documentali e correlazioni complesse. |

---

## 5. Script di Utilità e Manutenzione Vault

All'interno del workspace sono disponibili due script Node.js collaudati ed eseguibili:

1. **Scanner e Rilevatore Automatico dei Vault:**
   ```bash
   node scripts/find_and_verify_vaults.mjs
   ```
   *Rileva in automatico tutti i Vault presenti sul Mac e verifica lo stato delle referenze.*

2. **Sanitizzatore Diretto Unico (Zero File di Backup):**
   ```bash
   # Sanitizza tutti i Vault rilevati sul sistema:
   node scripts/sanitize_vault.mjs

   # Oppure sanitizza uno specifico Vault:
   node scripts/sanitize_vault.mjs "tests/scratch/vault_collaudo_local_rag_v2"
   ```
   *Sostituisce le menzioni con `[RIFERIMENTO_RISERVATO]` preservando i file e senza generare copie di backup.*

---

## 6. Risoluzione Problemi Rapida

| Problema | Causa | Soluzione |
| :--- | :--- | :--- |
| **All'avvio si apre sempre il Setup Wizard** | Vault non aperto, o nessun modello scaricato, o chiave API mancante | Completa i 3 passaggi del Wizard: le impostazioni vengono salvate e l'onboarding non ricomparirà. |
| **Pulsante Chiedi non invia la domanda** | Consenso OpenAI disattivato in modalità cloud | Vai in **Avanzate → Collegamenti AI** e spunta il consenso, oppure attiva **"SOLO LOCALE (Mac)"**. |
| **Memoria GPU satura o rallentamenti su Mac 8 GB** | Selezionato modello troppo grande | Seleziona **Ministral 3 3B Instruct** (`ministral-3b`) progettato appositamente per configurazioni da 8 GB. |
| **Stato motore semantico: Non installato** | Modello bge-m3 non presente | In **Avanzate → Collegamenti AI**, clicca su **SCARICA MODELLO (635 MB)**. |
