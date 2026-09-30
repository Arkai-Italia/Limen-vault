# Diagnosi Guidata dall'Evidenza: Analisi Lentezza e Rilievo Output Anomalo `#` su Ministral 3 8B

> **Data**: 29-30 settembre 2026  
> **Oggetto del Rilievo**: Domanda «COSA È ARKAI?» in Solo Locale con vault `E:\VAULT WIN TEST` ha prodotto una sequenza di `#` e un tempo di risposta di circa 109 secondi.  
> **Stato Indagine**: Tempi CPU documentati da log originale; **il difetto dei caratteri `#` non è stato riprodotto nei test isolati iniziali**; cause classificate come **ipotesi da verificare sperimentalmente**.

---

## 1. Identificazione Binari, Modello GGUF e Relativi Hash

### Processo e Applicazione Attiva
- **PID Rilevato in Esecuzione**: `33292` (`limen-vault.exe`), avviato il `29/09/2026 17:46:13`.
- **Percorso Eseguibile**: `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe`
- **SHA-256 Calcolato su Disco**: `9E21C34BFBD46BC0881A82543284EEBDF381D573C4ABA7A4515B2C713BD75EB0`  
  *(Corrisponde byte per byte al binario generato nel packaging dell'installer release NSIS)*.

### Runtime llama-server
- **Percorso Eseguibile**: `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\native\llama-server.exe`
- **SHA-256 Calcolato su Disco**: `45438F026845B4611474E3A7A21B486CAB83D3AC39CA60D591CEB88300D8EE4C`
- **Versione di Build**: `version: 1 (ec2b787) built with Clang 19.1.5 for Windows x86_64` (llama.cpp Build 8477).
- **Backend Rilevati all'Avvio**:
  - Vulkan (`ggml-vulkan.dll`): rilevata presenza di `NVIDIA GeForce RTX 3060` con **11.406 MiB liberi**.
  - CPU Haswell (`ggml-cpu-haswell.dll`).

### Modello GGUF Ministral 8B
- **Percorso**: `C:\Users\user\LIMEN Vault\models\Ministral-3-8B-Instruct-2512-Q5_K_M.gguf`
- **Dimensione**: `6.059.268.512 byte`
- **Hash SHA-256**: letto dal file cache `Ministral-3-8B-Instruct-2512-Q5_K_M.gguf.verified.json` come `7a5454127ec772e2389f0e71a77fedb88b83d4366d8a69facd0cfd0898f04d35` (`sha256_ok: true`). *(Nota: valore ricavato dal manifest di cache generato all'atto del download, non ricalcolato integralmente su disco durante questa sessione)*.

---

## 2. Risultati della Riproduzione Isolata Iniziale (Difetto `#` NON Riprodotto)

I test preliminari sono stati eseguiti isolando `llama-server.exe` su porta locale dedicata `59998`, con gli argomenti standard dell'app (`-ngl 0` su CPU, `-c 8192`, `-ctk q8_0`, `-ctv q8_0`, `-ub 512`, `-b 512`):

### Test A: Domanda Semplice Senza Recupero Documentale
- **Richiesta**: Prompt `DOMANDA DELL'UTENTE: COSA È ARKAI?\n\nRisposta:`, `temperature: 0.2`, `max_tokens: 60`, `stream: true`.
- **Risposta Grezza SSE Ricevuta**:
  ```text
  **ARKAI** è un **protocollo di sicurezza avanzato** sviluppato da **LIMEN Vault**, pensato per proteggere i dati sensibili e le informazioni critiche all'interno di ambienti aziendali, governi o organizzazioni che richiedono **massima conf
  ```
- **Esito**: Risposta in lingua italiana. **Nessun carattere `#` isolato o ripetuto.**
- **Tempi**: TTFT = `4.980 ms` (~5 secondi), tempo totale `21.783 ms` per 60 token generati (`3.54 tok/s`).

### Test B: Domanda CON Recupero Documentale da Breve Fixture
- **Richiesta**: Documento sintetico con intestazioni Markdown (`# MANUALE OPERATIVO ARKAI`, `## 1. DEFINIZIONE DI ARKAI`, `### 1.1 Architettura`, `### 1.2 Sicurezza`).
- **Risposta Grezza SSE Ricevuta**:
  ```text
  ARKAI è la **piattaforma proprietaria di intelligenza artificiale avanzata** sviluppata da LIMEN Vault, progettata per **automazione dei processi cognitivi**. Si tratta di un sistema che integra:

  - **Modelli di linguaggio locali** (come Mistral/Ministral) per l’analisi e la sintesi dei contenuti documentali.
  - **Embeddings semantici** (ad esempio bge-m3) per interpretare e correlare i dati archiviati.

  Un aspetto fondamentale di ARKAI è la **massima sicurezza dei dati**, poiché garantisce che i contenuti rimangano **confinati nel dispositivo locale**, senza alcuna trasmissione esterna.
  ```
- **Esito**: Risposta conforme alla fixture, **nessun carattere `#` isolato o ripetuto.**
- **Tempi**: TTFT = `1.622 ms`, tempo totale `45.881 ms` per 153 token generati (`3.45 tok/s`).

**Conclusione dei Test Preliminari**: i due test isolati **NON hanno riprodotto il difetto dei caratteri `#`**.

---

## 3. Dati Misurati nel Test Reale di Cesare (dal log `llama-llm.log`)

Dall'estrazione dei log grezzi di `llama-llm.log` relativi all'esecuzione reale sul vault `E:\VAULT WIN TEST`:
```text
slot update_slots: id 0 | task 0 | new prompt, n_ctx_slot = 8192, n_keep = 0, task.n_tokens = 5990
prompt eval time = 47941.96 ms / 5990 tokens ( 8.00 ms per token, 124.94 tokens per second)
       eval time = 61506.88 ms / 91 tokens ( 675.90 ms per token, 1.48 tokens per second)
      total time = 109448.84 ms / 6081 tokens
```

### Misure Effettive Documentate:
- **Dimensione Prompt Inviato**: `5.990 token` estratti dalla ricerca documentale nel vault reale.
- **Tempo Elaborazione Prompt su CPU**: **47.941 ms (~48 secondi)** di elaborazione a 124.94 tok/s prima dell'emissione del primo token.
- **Generazione Token**: `91 token` generati in **61.506 ms (~61 secondi)** a una velocità di **1.48 token al secondo** (675.90 ms per token).
- **Tempo Complessivo della Richiesta**: **109.448 ms (circa 1 minuto e 49 secondi)**.
- **Backend Utilizzato**: CPU Haswell (`0/35 layer` offloadati su GPU).
- **Memoria Mappata**: 5.770,55 MiB in RAM host.

---

## 4. Ipotesi da Verificare sulla Causa dei `#` Ripetuti

Poiché i test brevi non hanno manifestato l'anomalia, la causa non è dimostrata e viene classificata in quattro **ipotesi distinte da sottoporre a test mirati**:

1. **Ipotesi 1: Contesto Molto Lungo (~6.000 token)**: la presenza di un contesto massivo potrebbe alterare la distribuzione delle probabilità del modello in fase di generazione iniziale, inducendo loop su caratteri speciali.
2. **Ipotesi 2: Template e Modalità Reasoning (`thinking = 1`)**: il server ha rilevato `thinking = 1` dal template Jinja del modello. È da verificare se il modello tenti di emettere blocchi di pensiero Markdown non interpretati correttamente.
3. **Ipotesi 3: Parametri di Campionamento e Assenza di Penalità**: `temperature: 0.2` molto bassa combinata con l'assenza di `repeat_penalty` potrebbe favorire l'intrappolamento su token ripetuti.
4. **Ipotesi 4: Ricostruzione o Visualizzazione (Backend Rust / Frontend)**: è da verificare se i `#` fossero effettivamente emessi dal server o se derivino da un disallineamento nello streaming o nel rendering Markdown della UI.

---

## 5. Confronto Configurazioni Mac vs Windows

- **Differenze Rilevate a Livello di Codice**:
  - *Mac*: `build_llama_server_args` imposta `-ngl 99`, mirando all'offload completo su GPU Metal.
  - *Windows*: `get_default_ngl()` impostava `"0"`, vincolando l'esecuzione alla CPU per sicurezza contro OOM.
- **Etichette Residue nella UI**:
  - In `AiPanel.tsx`: presenti le diciture `'Generazione sul Mac con Ministral 3 8B…'` e `'Avviso memoria Mac'`, da rendere neutre per Windows.

---

---

## 6. Misure Sperimentali Acquisite su GPU Vulkan vs CPU (Fixture Lunga Isolata)

Le misure acquisite su `DESKTOP-DGJBALI` (NVIDIA GeForce RTX 3060 12GB, driver 595.79, Vulkan 1.4.328) mediante test diretti del motore sul medesimo testo sintetico lungo documentano le seguenti prestazioni reali del server:

| Metrica Server | CPU Haswell (`-ngl 0`), Fixture Lunga | GPU Vulkan (`-ngl 99`), Fixture Lunga | Guadagno Motore |
|---|---|---|---|
| **Layer Offloadati** | `0/35` | **35/35** (`offloaded 35/35 layers to GPU`) | Completo |
| **Token Prompt Elaborati** | `6.404 token` | `6.538 token` | — |
| **Tempo Elaborazione Prompt** | `19.561,42 ms` (327,38 tok/s) | **4.705,89 ms** (1.389,32 tok/s) | **4,16x più rapido** |
| **Token Generati** | `667 token` | `632 token` | — |
| **Velocità di Generazione** | `1,30 tok/s` (768,36 ms/tok) | **37,90 tok/s** (26,38 ms/tok) | **29,15x più rapido** |
| **Tempo Totale Server** | `532.056,23 ms` (~8m52s) | **21.382,20 ms` (~21,4s) | **24,88x più rapido** |
| **TTFT Primo Evento SSE** | `19.671 ms` | **4.858 ms** | **4,05x più rapido** |
| **TTFT Primo delta.content** | Non acquisito separatamente | **4.880 ms** | — |

> [!NOTE]
> **Dichiarazione su Contesto, Cache e App Installata**:
> 1. La discrepanza tra 6.404 token (CPU) e 6.538 token (GPU) riflette una diversa gestione iniziale dei token di intestazione/template e il riutilizzo della cache di contesto tra le richieste sequenziali.
> 2. Questa prova non è confrontabile direttamente con i 47.941 ms e 1,48 tok/s della vecchia richiesta reale di Cesare, che conteneva un prompt documentale differente (5.990 token) proveniente dal vault `E:\VAULT WIN TEST`.
> 3. Il consistente miglioramento misurato (~24,9x su server) documenta l'efficacia del motore di calcolo GPU Vulkan, ma **non costituisce ancora una misura della velocità dell'applicazione LIMEN installata**.

### Coesistenza VRAM e Concorrenza Sotto Carico
- **VRAM Iniziale (a riposo)**: `1.253 MiB`
- **VRAM dopo caricamento bge-m3 (`-ngl 99`)**: `1.572 MiB` (`+319 MiB`)
- **VRAM con entrambi i modelli attivi**: `7.821 MiB`
- **Incremento Netto per i due modelli**: **`6.568 MiB`** (i 7.821 MiB rappresentano la memoria complessiva allocata dal sistema GPU, non attribuibile per intero ai modelli)
- **Headroom VRAM Libera Residua**: **`4.290 MiB`** (margine di sicurezza abbondante contro OOM)
- **Concorrenza Sotto Carico**: durante la generazione attiva di Ministral (chunk 10), è stata inviata una richiesta di embedding a `bge-m3`. La richiesta concorrente è stata completata in **93 ms**, restituendo un vettore valido di **1.024 float** con norma L2 pari a 1,0 e totale assenza di valori non validi (NaN/Inf), con VRAM rilevata a 7.700 MiB.

---

## 7. Stato delle Implementazioni e Verifiche

1. **Test Fase 2 (Riproduzione `#`)**:
   - Classificati come **test diretti del server con simulazione della trasformazione del testo**.
   - I file di evidenza riportano la nomenclatura `simulated_backend_sanitized_text.txt` e `simulated_frontend_text.txt` (conservando gli originali per continuità).
   - L'emissione di `### Caratteristiche principali:` costituisce un'intestazione Markdown normale e non riproduce il loop anomalo continuo di decine di `#` visto da Cesare.
   - **La verifica del percorso applicativo reale rimane aperta nel piano.**

2. **Implementazione nel Codice (Commit `d99bf93`)**:
   - Configurazione GPU per default con fallback controllato a CPU (`-ngl 0`) in `llama_llm.rs` e `llama.rs`.
   - Indicizzazione automatica non bloccante con tracciamento ticket atomico in `App.tsx`.
   - Bonifica etichette piattaforma e messaggi di errore locali in `AiPanel.tsx`, `SemanticEngineSettings.tsx`, `VaultStatusBanner.tsx`.
   - Watcher asincrono `tokio::select!` per interruzione tempestiva in `ai.rs`.

3. **Distinzione Formale dei Livelli di Convalida**:
   - *Implementazione presente nel repository*: commit `d99bf93`.
   - *Controlli di compilazione e test unitari*: superati con codice 0 (`pnpm build`, `cargo check`, 14/14 test `llama_llm`).
   - *Obiettivo `<50 ms` per l'annullamento*: costituisce un obiettivo di progetto regolato dal polling del watcher; il tempo effettivo di interruzione del server deve essere verificato applicativamente.
   - *Collaudo applicativo dell'app LIMEN*: **aperto**, da eseguire con prova reale end-to-end.
   - *Audit indipendente*: **aperto**, affidato a Codex e Cesare.

