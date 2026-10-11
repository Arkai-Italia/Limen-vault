# Pipeline Tecniche e Automazioni Asincrone — LIMEN Vault v7Mini

Il presente documento descrive le quattro pipeline tecniche fondamentali del backend Rust/Tauri di LIMEN Vault (0.7.0). Queste automazioni orchestrano l'elaborazione dei documenti, il calcolo degli embedding vettoriali, il routing generativo tra modelli locali e cloud, e la verifica crittografica di integrità.

---

## Indice delle Pipeline

| ID Pipeline | Denominazione Pipeline | Componenti Coinvolti | Latenza Tipica | Modalità Rete |
| :--- | :--- | :--- | :--- | :--- |
| **`PIPE-001`** | Ingestione Documentale, Chunking ed Embedding `bge-m3` | Ingestion Engine, bge-m3, SQLite Vector | 1-5s per documento | 100% Locale / Offline |
| **`PIPE-002`** | Generazione Risposte & Routing Ibrido (OpenAI / llama-server) | Generation Router, llama.cpp, OpenAI Client | 200ms - 4s (TTFT) | Offline o Ibrido |
| **`PIPE-003`** | Streaming Server-Sent Events (SSE) e Reasoning Trace | SSE Emitter, Tauri Event Loop, Chat UI | <50ms per token | Locale / Socket loopback |
| **`PIPE-004`** | Integrità Crittografica SHA-256 e Watcher Filesystem | Hashing Engine, Model Downloader, Raw Viewer | <100ms per file | 100% Locale |

---

## 1. PIPE-001: Ingestione Documentale, Chunking ed Embedding bge-m3

### 1.1 Scopo e Trigger
Elaborare file non strutturati (PDF, Markdown, TXT) caricati dall'utente nella cartella di staging o tramite pulsante globale **Carica**, convertirli in testo normalizzato, suddividerli in frammenti semantici (*chunk*) e calcolare i vettori densi ad alta dimensionalità mediante il modello locale `bge-m3`.

### 1.2 Fasi Esecutive
1. **Rilevamento File:**
   - L'utente seleziona uno o più file tramite `open_document_picker` oppure deposita file nella cartella `20_RAW_SOURCES`.
   - Il demone locale calcola immediatamente l'hash crittografico **SHA-256** del file binario grezzo (PIPE-004).
2. **Estrazione e Normalizzazione Testuale:**
   - I file PDF vengono processati tramite parser nativo Rust (estrazione testo, filtri caratteri non stampabili).
   - I file Markdown e TXT vengono letti preservando intestazioni H1-H6 e metadati YAML frontmatter.
3. **Chunking Semantico:**
   - Dimensione finestra: ~512 token (~1.500-2.000 caratteri) con sovrapposizione (*overlap*) di 50-100 token per preservare il contesto ai confini dei paragrafi.
   - Ogni chunk eredita i metadati: `source_path`, `source_hash`, `chunk_index`, `page_number` (per PDF).
4. **Calcolo Embedding Vettoriale (`bge-m3`):**
   - Esecuzione tramite libreria locale accelerata (Metal su macOS, AVX2 su Windows).
   - Generazione di vettori densi a **1024 dimensioni**.
   - Nessun dato testuale o numerico transita mai su reti esterne.
5. **Persistenza e Indicizzazione:**
   - Inserimento nel database relazionale/vettoriale SQLite locale (`sqlite-vec`).
   - Aggiornamento della tabella di stato: il documento passa da `PROCESSING` a `INDEXED`.

### 1.3 Gestione Errori e Casi Limite
- **PDF Scansionato (Solo Immagini):** Rilevamento di 0 caratteri estratti; notifica all'utente di testo non rilevato (OCR non attivo di default).
- **File Superiore a 50 MB:** Elaborazione segmentata in streaming per evitare picchi di memoria RAM.

---

## 2. PIPE-002: Generazione Risposte & Routing Ibrido (OpenAI / llama-server)

### 2.1 Scopo e Trigger
Orchestrare la sintesi generativa delle risposte alle domande dell'utente poste nell'interfaccia **Chiedi al Vault**, selezionando automaticamente e in modo trasparente il motore di inferenza corretto tra:
- **Motore Locale:** `llama-server` (processo binario nativo compilato con Metal/AVX2).
- **Motore Cloud Ibrido:** OpenAI API (usando la chiave personale dell'utente `OPENAI_API_KEY`).

### 2.2 Logica di Routing e Priorità
```
                       [ Prompt Utente ]
                               |
                               v
            [ È configurata una API Key OpenAI valida? ]
                       /               \
                    Sì                  No
                   /                      \
      [ Modalità Ibrida attiva? ]          v
            /           \          [ Usa llama-server Locale ]
          Sì             No                    |
          /               \                    |
         v                 v                   v
  [ Invia ad OpenAI ]   [ Usa llama-server Locale ]
         |                         |
         +-------------------------+
                     |
                     v
       [ PIPE-003: Streaming SSE ]
```

1. **Controllo Disponibilità Locale:**
   - All'avvio dell'inferenza locale, il backend invia una richiesta HTTP `GET http://127.0.0.1:8080/health`.
   - Se il server risponde `200 OK`, la richiesta di completamento viene instradata via HTTP POST `/v1/chat/completions`.
   - Se non è attivo, il backend chiama `start_llama_server` passando il modello GGUF selezionato (es. `ministral-3b-instruct-q4_k_m.gguf`).
2. **Context Assembly (RAG):**
   - Vengono estratti i Top-K chunk (default K=5) più pertinenti dal database vettoriale mediante somiglianza coseno.
   - Viene composto il System Prompt con le direttive di ancoraggio fattuale alle fonti fornite.
3. **Esecuzione Generazione:**
   - Parametri standard: `temperature: 0.2`, `top_p: 0.95`, `max_tokens: 2048`.
   - Per modelli *reasoning* (es. `deepseek-r1-distill-qwen-7b`), la pipeline intercetta i tag `<think>...</think>` per separarli dalla risposta finale.

---

## 3. PIPE-003: Streaming Server-Sent Events (SSE) e Reasoning Trace

### 3.1 Scopo e Trigger
Fornire un riscontro immediato e a bassissima latenza all'utente durante la formulazione della risposta, visualizzando i token generati in tempo reale e mostrando visivamente la fase di "ragionamento" dei modelli DeepSeek-R1 prima della risposta definitiva.

### 3.2 Meccanica di Trasmissione
1. Il motore (OpenAI o `llama-server`) emette chunk SSE nel formato:
   `data: {"choices":[{"delta":{"content":"parola"}}]}\n\n`
2. Il layer Tauri intercetta lo stream HTTP in Rust e genera un evento Tauri sul canale interno `chat-stream-delta`.
3. Il frontend React/TypeScript riceve l'evento e appende immediatamente il token al buffer del messaggio corrente:
   - Se il token si trova all'interno di un blocco `<think>`, viene renderizzato nel pannello collassabile **"Pensiero del modello (Reasoning Trace)"** con stile corsivo e badge ardesia.
   - Alla chiusura del tag `</think>`, il pannello si contrae automaticamente e i token successivi confluiscono nel corpo primario del messaggio Markdown.
4. **Completamento e Fonti:**
   - All'emissione del chunk `data: [DONE]`, il backend invia un evento finale `chat-stream-complete` contenente la lista strutturata dei documenti e chunk citati (`source_name`, `page`, `similarity_score`, `raw_file_id`).
   - L'interfaccia renderizza i pulsanti cliccabili delle fonti verificate.

---

## 4. PIPE-004: Integrità Crittografica SHA-256 e Watcher Filesystem

### 4.1 Scopo e Trigger
Garantire l'assoluta conformità e anti-manomissione dei dati archiviati nel Vault e dei modelli di intelligenza artificiale eseguiti sul dispositivo.

### 4.2 Ambiti di Controllo
1. **File Documentali Originali (`20_RAW_SOURCES`):**
   - Ogni documento immesso nel Vault viene immediatamente sottoposto a hashing `SHA-256`.
   - L'impronta esadecimale (es. `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`) viene registrata nel database del Vault e associata permanentemente ad ogni citazione estratta.
   - Quando l'utente apre il visualizzatore `DocumentReaderModal`, l'applicazione ricalcola a caldo l'hash del file su disco. Se coincide, mostra il badge verde **"Integrità SHA-256 Verificata"**. Se il file su disco è stato alterato, mostra un allarme rosso di manomissione.
2. **Download Modelli GGUF da Hugging Face:**
   - Il catalogo `LLM_CATALOG` in `llama_llm.rs` definisce gli hash SHA-256 ufficiali dei file GGUF quantizzati.
   - Al completamento del download progressivo, il downloader calcola l'hash del file salvato in `models/`.
   - Se l'hash non corrisponde al byte, il file parziale o corrotto viene scartato con errore `DOWNLOAD_INTEGRITY_MISMATCH`, proteggendo l'utente da esecuzioni arbitrarie di codice o pesi compromessi.
3. **Generazione Snapshot:**
   - La creazione di un punto di ripristino calcola l'albero di integrità di tutte le cartelle (`00_INBOX`, `10_KNOWLEDGE`, `20_RAW_SOURCES`) memorizzando il manifesto all'interno del file zip / tar compresso.
