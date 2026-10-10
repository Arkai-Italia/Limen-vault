# LIMEN Vault v6Mini — Manuale Utente
Edizione italiana · Ottobre 2026 · Versione 0.6.0 (macOS / Windows)

---

## Architettura e Moduli Recenti di Sistema

Di seguito l'elenco dei file e dei moduli che costituiscono il nucleo operativo dell'applicazione:

1. [apps/desktop/src-tauri/src/llama_llm.rs](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src-tauri/src/llama_llm.rs)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/apps/desktop/src-tauri/src/llama_llm.rs`  
   *Descrizione:* Modulo Rust per la gestione del catalogo multi-modello generativo locale (6 modelli: Ministral 3B/8B, Qwen 2.5 7B, Llama 3.1 8B, DeepSeek-R1 7B/14B), rilevamento RAM fisica di sistema, downloader streaming con verifica crittografica SHA-256 e istanza dedicata di `llama-server` su GPU Metal.

2. [apps/desktop/src-tauri/src/ai.rs](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src-tauri/src/ai.rs)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/apps/desktop/src-tauri/src/ai.rs`  
   *Descrizione:* Router di generazione unificato a doppio binario: dispatch verso OpenAI Responses API o Chat Completions su `llama-server` locale, con eventi SSE unificati ed estrazione del modello attivo.

3. [apps/desktop/src-tauri/src/main.rs](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src-tauri/src/main.rs)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/apps/desktop/src-tauri/src/main.rs`  
   *Descrizione:* Inizializzazione `LlamaLlmServerState`, registrazione comandi Tauri `local_llm_*` (catalogo, set active, download, verify) e chiusura pulita dei processi alla terminazione dell'app.

4. [apps/desktop/src/SetupWizardModal.tsx](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/SetupWizardModal.tsx)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/apps/desktop/src/SetupWizardModal.tsx`  
   *Descrizione:* Pop-up di configurazione guidata (onboarding a 3 step) con grafica dark-glass minimal & premium, verifica automatica all'avvio, rilevamento RAM di sistema e spunte dinamiche `✓`.

5. [apps/desktop/src/App.tsx](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/App.tsx)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/apps/desktop/src/App.tsx`  
   *Descrizione:* Architettura applicativa a 3 aree funzionali (Chiedi, Documenti, Memoria), controllo automatico delle 3 condizioni fondamentali all'avvio (Vault, LLM locale, Chiave API / Solo Locale), storico conversazioni persistente sul Mac e pulsante globale "CARICA DOCUMENTI".

6. [apps/desktop/src/ai-ipc.ts](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/ai-ipc.ts)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/apps/desktop/src/ai-ipc.ts`  
   *Descrizione:* Interfaccia TypeScript, tipi (`LocalModelCatalogEntry`, `LocalCatalogReport`) e metodi IPC per il catalogo modelli e il controllo del server locale.

7. [apps/desktop/src/AiPanel.tsx](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/AiPanel.tsx)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/apps/desktop/src/AiPanel.tsx`  
   *Descrizione:* Interfaccia di chat continua aumentata, toggle Verde Lime ("SOLO LOCALE (Mac)"), modale di download modelli, badge di generazione offline e isolamento della catena di ragionamento `<think>` per modelli DeepSeek-R1.

8. [apps/desktop/src/SemanticEngineSettings.tsx](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/SemanticEngineSettings.tsx)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/apps/desktop/src/SemanticEngineSettings.tsx`  
   *Descrizione:* Sezione 4 per la consultazione del catalogo dei 6 modelli locali (informazioni RAM, badge hardware, download streaming e switch a caldo del modello attivo).

9. [scripts/clean_vault_references.mjs](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/scripts/clean_vault_references.mjs)  
   *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/scripts/clean_vault_references.mjs`  
   *Descrizione:* Script Node.js per scansionare il Vault locale e rimuovere riferimenti o file specificati con modalità simulazione di sicurezza (`--dry-run`) e backup automatico preventivo.

10. [manuale UI utente.txt](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/manuale%20UI%20utente.txt)  
    *Percorso assoluto:* `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN/manuale UI utente.txt`  
    *Descrizione:* Manuale operativo integrale dell'interfaccia utente con diagrammi di flusso Mermaid e procedure passo-passo.

---

## Guida Rapida Operativa

### 1. Avvio e Configurazione Guidata (Setup Wizard)
All'avvio, LIMEN Vault verifica che:
- Sia aperto un Vault valido;
- Sia presente almeno un modello generativo locale scaricato e integro;
- Sia presente la chiave API OpenAI nel Portachiavi o sia stata selezionata la modalità *100% Solo Locale*.

Se anche una sola condizione manca, si apre il **Pop-up di Configurazione Guidata (Setup Wizard)** a 3 step con grafica dark-glass minimal & premium. È possibile riaprirlo in ogni momento cliccando su **"CONFIGURAZIONE GUIDATA"** nella schermata iniziale o in Avanzate.

### 2. Scelta del Modello Locale in Base all'Hardware (RAM)
Nel Passaggio 2 del Wizard (o in **Avanzate → Collegamenti AI & MCP → Catalogo Modelli**), il sistema rileva la RAM fisica:
- **Mac con 8 GB di RAM**: Selezionare **Ministral 3 3B Instruct** (`ministral-3b`, ~2,06 GB). Leggero, veloce e a basso consumo.
- **Mac con 16 GB - 24 GB di RAM**: È possibile scegliere tra **Ministral 3 8B Instruct** (`ministral-8b`, ~4,92 GB), **Qwen 2.5 7B Instruct** (`qwen-2.5-7b`, ~4,68 GB), **Llama 3.1 8B Instruct** (`llama-3.1-8b`, ~4,92 GB) e **DeepSeek-R1-Distill-Qwen-7B** (`deepseek-r1-7b`, ~4,68 GB con ragionamento profondo).
- **Mac con 32 GB o superiore**: È consigliato anche **DeepSeek-R1-Distill-Qwen-14B** (`deepseek-r1-14b`, ~8,99 GB) per la massima potenza analitica locale.

### 3. Motore Semantico RAG Locale (`bge-m3`)
In **Avanzate → Collegamenti AI & MCP → Motore semantico**:
- Cliccare su **SCARICA MODELLO (635 MB)** per installare il modello vettoriale `bge-m3-Q8_0.gguf`. Lo stato passa a verde: `INSTALLATO (SHA-256 OK)`.
- Il servizio `llama-server` parte in automatico all'apertura dell'app (`ATTIVO`).
- Il pulsante **RICALCOLA CACHE** consente di aggiornare l'indice vettoriale dei documenti in qualsiasi momento.

### 4. Consultazione Aumentata ("Chiedi al Vault")
- **Modalità Solo Locale**: Attivando il toggle verde lime **"SOLO LOCALE (Mac)"**, sia la ricerca vettoriale che la risposta sono elaborate al 100% sul computer a rete zero. Le risposte mostrano il badge `Generato sul Mac · [Modello] (Offline)`.
- **Modelli con Ragionamento DeepSeek (`<think>`)**: Quando si utilizza DeepSeek-R1, i passaggi di pensiero intermedi vengono raccolti in un blocco collassabile separato dalla risposta finale.
- **Citazione Trasparente delle Fonti**: Ciascuna risposta espone il pulsante **"N fonti citate"** che evidenzia nel cassetto laterale i documenti originali consultati. Dal pop-up del passaggio è possibile cliccare su **"Apri documento"** per consultare il file integrale nel lettore interno (`DocumentReaderModal`).

### 5. Acquisizione Rapida dei Documenti
Il pulsante verde **"CARICA DOCUMENTI"** nella barra laterale sinistra permette di importare in qualsiasi momento nuovi documenti in `20_RAW_SOURCES/` con estrazione automatica dei passaggi per la ricerca lessicale e semantica.

---

## Documentazione Dettagliata Collegata

- [Manuale dell’Interfaccia Utente Completo (con grafici Mermaid)](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/manuale%20UI%20utente.txt)
- [Guida per i Tester Mac](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/IMPLEMENTATION/ISTRUZIONI_TESTER_MAC.md)
- [Documentazione HELP di Sistema](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/HELP/00_INDICE.md)
