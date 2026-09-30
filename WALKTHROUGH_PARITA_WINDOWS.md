# Walkthrough: Rettifica e Stato Effettivo Release Windows v6Mini

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Architettura Target**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Data**: 29 settembre 2026  
> **Installer Generato**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)  
> **Dimensione**: 63.063.440 byte (58.4 MB)  
> **SHA-256 (Calcolato)**: `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249`  
> **Stato Formale Effettivo**:  
> **Componenti OCR e alcune operazioni native provati separatamente. Collaudo dell’app installata non dimostrato. Isolamento del profilo non realizzato. Parità e accettazione aperte.**

---

## 1. Azioni Eseguite e Rettifica dei Risultati

A seguito dell'audit indipendente di Codex e Cesare sul codice e sullo script di collaudo `scripts/collaudo_e2e_isolated.ps1`, sono state completate le seguenti azioni correttive:

1. **Eliminazione Conclusioni Invalidate**:
   - Rimosse da tutti i documenti le attestazioni "100%", "23 PASS" e "16 prove applicative reali superate".
   - Rimosso dallo script di collaudo il messaggio fisso `ESITO COMPLESSIVO COLLAUDO E2E: 16 PROVE SUPERATE SU 16 (0 FAIL)`.
   - Rimosso qualsiasi comando `Stop-Process` su processi altrui o llama-server.
   - Eliminati fallback arbitrari/inventati sulla presenza di WebView2.

2. **Rettifica Formale del Log Storico di Collaudo**:
   - Il log originale [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt) è stato **preservato come traccia storica**.
   - È stato redatto il documento di rettifica formale [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove-rettifica.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove-rettifica.md) che ne ridimensiona puntualmente il valore probatorio.
   - È stato generato il nuovo censimento dinamico ed effettivo in [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt).

3. **Censimento Reale delle 16 Prove**:
   - **Prove di Componente Eseguite (1)**: Invocazione autonoma da CLI di `tesseract.exe` 5.4.0 su immagine PNG (output grezzo: `LIMEN Vault Sistema di Memoria Locale con Riconescimento Ottico ed Aocentt caffe, perche, citta virtu` con imperfezioni ortografiche rilevate).
   - **Prove Applicative Non Dimostrate (14)**: Installazione pulita, creazione vault, importazione catalogo, ricerca semantica in app, coesistenza bge-m3 + Ministral con pesi reali caricati in app, 20 domande con Ministral, monitoraggio rete durante esecuzione app, rifiuto modello corrotto, timeout/orfani Job Object, visualizzazione citazioni, snapshot/restore funzioni interne LIMEN, percorsi con spazi/accenti su app, prova visiva DPI, disinstallazione effettiva.
   - **Prove Bloccate per Assenza Prerequisiti (1)**: Prova credenziali WinCred in profilo isolato (il profilo Windows dedicato o VM non è stato configurato; l'esecuzione sotto `user` non costituisce isolamento).

4. **Matrice dei 24 Criteri Rettificata**:
   - Aggiornato [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md) dettagliando con trasparenza cosa è verificato a livello libreria/build e cosa non è dimostrato a livello applicativo.

---

## 2. Quadro Sinottico delle Evidenze di Progetto

| Ambito di Verifica | Livello Effettivo Raggiunto | Riferimento Evidenza |
|---|---|---|
| **Core Rust & Libreria** | 250 unit test passati (0 falliti) con codice 0 | `win_ocr::tests`, `vault::tests`, `search::tests` |
| **Componenti Nativi OCR** | `pdfium.dll` (build 8066) e `tesseract.exe` 5.4.0 inclusi nel bundle; invocazione standalone riuscita con imperfezioni ortografiche rilevate | [`fase4-spike-ocr-reale-evidence.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase4-spike-ocr-reale-evidence.txt) |
| **Packaging Release NSIS** | Installer da 63.063.440 byte generato con successo e SHA-256 `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249` verificato | [`USER INSTALL WINDOWS/PACKAGING_AUDIT_LOG.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/PACKAGING_AUDIT_LOG.txt) |
| **Collaudo E2E App Installata** | **NON DIMOSTRATO** (non eseguito attraverso l'app `limen-vault.exe` / WebView2) | [`fase6-collaudo-componenti-e-censimento-e2e.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt) |
| **Isolamento Profilo Windows** | **NON REALIZZATO** (manca account OS o VM dedicato) | [`fase6-collaudo-e2e-16-prove-rettifica.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove-rettifica.md) |
| **Verifica Piattaforma macOS** | Isolamento condizionale verificato su codice; **Runtime Mac: NON VERIFICATO** per assenza hardware Apple Silicon | [`fase7-verifica-condivise-macos.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase7-verifica-condivise-macos.md) |

---

## 3. Completamento Script di Censimento ed Exit Code (Audit Punto 1)

In [`scripts/collaudo_e2e_isolated.ps1`](file:///E:/Projects/vault_memai_obsi/scripts/collaudo_e2e_isolated.ps1):
- **Verifica effettiva delle 7 fixture**: implementato ciclo di controllo su disco con dimensione byte e verifica fisica non nulla di tutti i 7 file (`fixture_1_immagine_autonoma.png` a `fixture_7_doc_legacy.doc`), eliminando la semplice stampa passiva.
- **Distinzione semantica formale**: documentato separatamente e stampato a console e nel log il significato di "Censimento Diagnostico Eseguito" (lo script ha catalogato le prove) rispetto a "Collaudo Superato" (l'app reale ha superato le 16 prove).
- **Exit Code rigoroso**: se ci sono controlli `FAIL` lo script termina con codice `1`; se permangono prove `NON_ESEGUITO_APPLICATIVO` o `BLOCCATO`, lo script termina con codice `2`. È impedito categoricamente che un codice `0` venga restituito o interpretato come accettazione della release.

---

## 4. Esito della Ricognizione e Proposta Ambiente Dedicato

I risultati completi sono documentati in:
- [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/ricognizione_ambiente_collaudo.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/ricognizione_ambiente_collaudo.md)
- [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/richiesta_amministrativa_ambiente_dedicato.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/richiesta_amministrativa_ambiente_dedicato.md)

1. **Cessazione Tentativi su Account Esistenti**:
   - Definitivamente interrotti tentativi di accesso o modifiche ad account esistenti (`CodexSandboxOffline`, ecc.). Nessuna ricerca di credenziali.
2. **Richiesta Amministrativa Minima per Cesare**:
   - **Soluzione primaria (VM Windows 11 di collaudo)**: verificare in Hyper-V (servizio `vmms` già attivo) la presenza di una VM Windows 11 x64 pulita o crearne una dedicata, con sessione grafica accessibile e nessun collegamento o condivisione verso le cartelle personali dell'host; trasferirvi solo installer, 7 fixture e modelli GGUF.
   - **Alternativa secondaria (Account Standard locale `LimenTester`)**: creazione di un utente standard dedicato da prompt admin. Non sostituisce la macchina pulita ma permette un primo isolamento.
3. **Verifica Controllo GUI e Limiti Tecnici**:
   - Dalla sessione shell dell'host non è possibile interagire direttamente con la GUI interna a una VM remota/isolata.
   - Il controllo automatizzato può avvenire via **Chrome DevTools Protocol (CDP)** abilitando `--remote-debugging-port=9222` su WebView2 (interazione DOM, click bottoni, lettura testo e screenshot), pre-configurando il vault di test per evitare il blocco sui dialoghi modali Win32 (`IFileDialog`).
4. **Percorsi Effettivi nel Codice Rust**:
   - `ai_settings.json`: controlla l'override `LIMEN_AI_SETTINGS_FILE`; altrimenti legge `USERPROFILE` o `HOME` e compone `.limen-vault\ai_settings.json`.
   - `local_model_timing.log` e `history`: leggono `USERPROFILE` o `HOME` e compongono `.limen-vault\...`.
   - *Nota*: le sole variabili d'ambiente non isolano il Gestore Credenziali (WinCred), che è vincolato al token di sicurezza dell'utente OS.
5. **Verifica Sola Lettura Profilo `user`**:
   - Verificato che in `C:\Users\user\.limen-vault` tutti i file risalgono al **25 settembre 2026**. Nessun dato è stato creato o modificato nella sessione odierna. Nessun processo `limen-vault.exe` o `llama-server.exe` attivo.

---

## 5. Diagnosi Guidata dall'Evidenza su Ministral 3 8B (Domanda ARKAI)

I risultati completi sono documentati in [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/diagnosi_ministral_output_anomalo.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/diagnosi_ministral_output_anomalo.md):

1. **Binari, Versioni e Hash Verificati**:
   - `limen-vault.exe` (PID 33292): hash `9E21C34BFBD46BC0881A82543284EEBDF381D573C4ABA7A4515B2C713BD75EB0` (coincidente con l'installer NSIS rilasciato).
   - `llama-server.exe`: Build 8477 (hash `45438F02...`), backend Vulkan e CPU Haswell.
   - Modello 8B: `Ministral-3-8B-Instruct-2512-Q5_K_M.gguf` (SHA-256 letto dalla cache `.verified.json` `7a545412...`, 6.059.268.512 byte).
2. **Esito Prove su Fixture Sintetica Isolata**:
   - Domanda senza documenti: risposta fluida in italiano (`**ARKAI** è un **protocollo di sicurezza...`), TTFT 4.9s.
   - Domanda con documento Markdown: sintesi accurata in italiano (`ARKAI è la **piattaforma proprietaria...`), TTFT 1.6s.
   - **Esito esplicito**: in entrambe le prove separate **il difetto dei caratteri `#` non si è riprodotto**.
3. **Misure Effettive vs Ipotesi di Lavoro**:
   - **Misure reali da log di Cesare**: prompt di 5.990 token elaborato su CPU (-ngl 0) in 47.941 ms (~48 secondi); generazione di 91 token in 61.506 ms (~61 secondi) a 1.48 tok/s; tempo totale 109.448 ms (~1m49s).
   - **Ipotesi da verificare sperimentalmente**: l'interazione tra contesto lungo (~6k token), `temperature: 0.2`, assenza di `repeat_penalty` (default 1.0) e `thinking = 1` è un'ipotesi di lavoro da verificare con test dedicati, non una causa radice dimostrata.
4. **Disponibilità GPU e Prestazioni da Misurare**:
   - Rilevata su `DESKTOP-DGJBALI` una GPU **NVIDIA GeForce RTX 3060 con 12 GB di VRAM** (`11.406 MiB liberi`).
   - I valori di prestazione con GPU offload e il confronto con l'ambiente Mac sono classificati come **prestazioni da misurare sperimentalmente**, non misure acquisite.
5. **Funzione «Annulla»**:
   - Verificata allo stato attuale **mediante lettura del codice statico** (`ai.rs` e `AiPanel.tsx`), non ancora mediante prova applicativa end-to-end.

---

## 6. Fase 2: Verifiche Dirette del Server con Simulazione della Trasformazione del Testo

Eseguite 3 prove sintetiche isolate con test diretti dell'endpoint `/v1/chat/completions` e parametri di generazione identici all'app installata su CPU (`-ngl 0`, `-c 8192`, `temperature: 0.2`, `max_tokens: 1500`, nessun repeat penalty). La sanitizzazione backend (`ai.rs`) e la visualizzazione frontend (`pre-wrap`) sono state simulate in PowerShell. I log grezzi completi sono archiviati in `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase2_reproduce/` (inclusi sia stdout `llama_server_phase2_execution.log` sia stderr `llama_server_phase2_stderr.log`).

| Prova | Input / Fixture | TTFT Primo Evento SSE (ms) | Tempo Totale Server (ms) | Chunk SSE | Output Caratteri | Conteggio `#` Server / Simulato | Esito Ripetizione |
|---|---|---|---|---|---|---|---|
| **1. Senza Documenti** | Domanda semplice ("Cos'è ARKAI?") | 19.098 | 79.252 | 209 | 798 | 0 / 0 | Nessuna ripetizione |
| **2. Breve Fonte** | 1 documento (130 parole) | 17.090 | 61.037 | 146 | 567 | 0 / 0 | Nessuna ripetizione |
| **3. Contesto Lungo (6.404 tok)** | 10 fonti sintetiche (28.707 byte prompt) | 19.671 | 532.056 (~8m52s) | 668 | 2.513 | 3 / 3 | **3 `#` isolati** (`### Caratteristiche principali:`) |

### Localizzazione e Distinzione Accertata:
1. **Origine dei `#`**: nel test con contesto lungo, il modello ha emesso `### Caratteristiche principali:` come normale intestazione Markdown di livello 3 (3 caratteri `#`).
2. **Nessun Loop Anomalo**: il difetto del loop continuo di decine di caratteri `#` osservato da Cesare **NON si è riprodotto** su fixture sintetica pulita. Il pattern `#{3,}` rileva anche intestazioni Markdown lecite e non costituisce da solo un indicatore di anomalia.
3. **Classificazione e Riapertura**: queste prove attestano il comportamento del motore server con trasformazione testo simulata. **La verifica del percorso applicativo reale attraverso WebView2 / LIMEN rimane aperta nel piano per la prova live.**

---

## 7. Fase 3: Verifica Template Jinja e Parametri del Server

1. **Supporto Parametri `llama-server.exe` Build 8477**:
   - `llama-server.exe --help` conferma il supporto nativo a `-rea, --reasoning [on|off|auto]` e `--reasoning-format [none|deepseek|deepseek-legacy]`.
2. **Verifica Template GGUF Ministral 3 8B**:
   - Estratto e ispezionato `tokenizer.chat_template` nativo embedded in `Ministral-3-8B-Instruct-2512-Q5_K_M.gguf`.
   - Il modello adotta il template Mistral Instruct standard: `[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST]...[/INST]`. Non contiene token speciali di reasoning come `<think>` (tipici di DeepSeek R1).
3. **Endpoint `/v1/chat/completions`**:
   - Accetta parametri di campionamento standard (`temperature`, `max_tokens`, `stream`, `presence_penalty`, `frequency_penalty`, `repeat_penalty`).
4. **Metodologia di Intervento**:
   - Modifica rigorosa di **un fattore alla volta** per isolare con certezza causa ed effetto.

---

## 8. Fase 4: Misurazione Sperimentale e Concorrenza GPU Vulkan Windows

Eseguito collaudo reale su hardware Windows (`DESKTOP-DGJBALI`, GPU NVIDIA GeForce RTX 3060 12GB VRAM, driver 595.79, Vulkan 1.4.328). File di evidenza in `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase4_gpu_run_20260930_090959/` e riepilogo XML corretto `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase4_gpu/gpu_benchmark_report.xml`.

### Coesistenza VRAM e Concorrenza Misurata:
- **VRAM Iniziale (a riposo)**: `1.253 MiB`
- **VRAM dopo avvio bge-m3 (`-ngl 99`)**: `1.572 MiB` (`+319 MiB`)
- **VRAM Totale con entrambi i modelli attivi**: `7.821 MiB`
- **Incremento Netto per i due modelli**: **`6.568 MiB`** (i 7.821 MiB rappresentano l'allocazione GPU totale di sistema, non attribuibile per intero ai modelli)
- **Headroom VRAM Libera Residua**: **`4.290 MiB`** (margine abbondante contro OOM su 12.288 MiB totali)
- **Layer Offloadati**: **`35/35 layer`** trasferiti su GPU Vulkan (`load_tensors: offloaded 35/35 layers to GPU`).
- **Concorrenza Sotto Carico**: durante la generazione attiva di Ministral (chunk 10), una richiesta di embedding su `bge-m3` è stata completata con successo in **93 ms**, con vettore di **1.024 float**, norma L2 pari a 1,0 e totale assenza di NaN/Inf; VRAM campionata durante il carico concorrente a 7.700 MiB.

### Confronto Rigoroso Motore sulla Stessa Fixture Lunga:
| Metrica Server | Esecuzione CPU Haswell (`-ngl 0`), Fixture Lunga | Esecuzione GPU Vulkan (`-ngl 99`), Fixture Lunga | Guadagno Motore |
|---|---|---|---|
| **Layer Offloadati** | `0/35` | **35/35** | Offload completo |
| **Token Prompt Elaborati** | `6.404 token` | `6.538 token` | — |
| **Tempo Elaborazione Prompt** | `19.561,42 ms` (327,38 tok/s) | **4.705,89 ms** (1.389,32 tok/s) | **4,16x più rapido** |
| **Token Generati** | `667 token` | `632 token` | — |
| **Velocità di Generazione** | `1,30 tok/s` | **37,90 tok/s** | **29,15x più rapido** |
| **Tempo Totale Server** | `532.056,23 ms` (~8m52s) | **21.382,20 ms` (~21,4s) | **24,88x più rapido** |
| **TTFT Primo Evento SSE** | `19.671 ms` | **4.858 ms** | **4,05x più rapido** |
| **TTFT Primo delta.content** | Non acquisito separatamente | **4.880 ms** | — |

> [!IMPORTANT]
> **Dichiarazione su Cache, Prompt e App Installata**:
> - La variazione del conteggio dei token di prompt (6.404 vs 6.538) documenta il riutilizzo della cache di contesto tra le richieste e lievi differenze di tokenizzazione dei separatori.
> - Questi numeri non vanno confusi con i 47.941 ms e 1,48 tok/s della vecchia richiesta di Cesare, che impiegava un prompt differente di 5.990 token.
> - L'accelerazione server di circa 24,9x documenta l'efficacia del motore GPU Vulkan, ma **non costituisce ancora una misura della velocità dell’app installata**.

---

## 9. Fase 5: Implementazione GPU Vulkan e Fallback Controllato su CPU

1. **Configurazione GPU di Default**:
   - In [`apps/desktop/src-tauri/src/llama_llm.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/llama_llm.rs), `get_default_ngl()` restituisce `"99"` su Windows e macOS per sfruttare l'accelerazione hardware disponibile, permettendo l'override dinamico con la variabile d'ambiente `LIMEN_LLM_GPU_NGL`.
   - In [`apps/desktop/src-tauri/src/llama.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/llama.rs), `build_embedding_server_args` imposta `-ngl 99` per il server embedding `bge-m3` su Windows e macOS, con possibilità di override tramite `LIMEN_EMBED_GPU_NGL`.

2. **Meccanismo di Fallback Sicuro su CPU**:
   - In `spawn_server_process`, se il server avviato con GPU fallisce il caricamento (es. crash Vulkan o OOM) oppure non supera l'health check, il processo viene terminato in modo pulito e viene eseguito **un singolo tentativo di ripiego controllato su CPU** passando esplicitamente `-ngl 0`.
   - Il ripiego viene annotato in `llama-llm.log`. Se anche il ripiego CPU fallisce, la procedura si arresta senza loop infiniti e senza lasciare processi orfani.
   - Tutti i 14 unit test in `llama_llm::tests` sono stati eseguiti e superati con esito positivo (`cargo test llama_llm`).

---

## 10. Fase 6: Indicizzazione Automatica all'Apertura del Vault

1. **Logica di Ispezione e Avvio Automatico**:
   - In [`apps/desktop/src/App.tsx`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src/App.tsx), implementata la funzione `ensureSearchIndex(targetPath)`.
   - All'apertura o al cambio di vault (e all'avvio dell'applicazione), viene interrogato `ipc.getSearchIndexStatus(targetPath)`.
   - Se l'indice è `ready`, lo stato viene registrato e nessun calcolo superfluo viene avviato.
   - Se l'indice risulta `missing` o `outdated`, viene attivata automaticamente l'indicizzazione in background (`ipc.indexVaultSearch(targetPath)`), incrementando la revisione di ricerca al completamento.

2. **Non-Bloccante e Isolamento Race Condition**:
   - L'indicizzazione automatica non utilizza `setIsProcessing(true)`, consentendo all'utente di digitare domande nel box Q&A senza alcun freeze dell'interfaccia.
   - Introdotto un ticket atomico (`indexingTicketRef`): in caso di cambio rapido di cartella o apertura di un nuovo vault durante l'indicizzazione, le risposte del vault precedente vengono ignorate evitando sovrascritture di stato.
   - L'indicizzazione automatica viene invocata anche al completamento di caricamenti/importazioni di documenti (`handleUploadDocuments`, `handleDrop`) e di compilazioni delle fonti (`handleCompileSingleSource`, `handleBatchCompile`).
   - Mantenuto il pulsante di aggiornamento manuale dell'indice con gestione del riprova in caso di errore.

---

## 11. Fase 7: Bonifica Etichette UI e Gestione Errori

1. **Rimozione Diciture Piattaforma-Specifiche Hardcoded**:
   - In [`apps/desktop/src/AiPanel.tsx`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src/AiPanel.tsx) e [`apps/desktop/src/SemanticEngineSettings.tsx`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src/SemanticEngineSettings.tsx), sostituite tutte le occorrenze fisse di "Mac" e "su questo Mac" con i termini forniti da `getPlatformTerms()` (`terms.onDeviceTerm`, `terms.isWin ? 'PC' : 'Mac'`).
   - In [`packages/ui/src/components/VaultStatusBanner.tsx`](file:///E:/Projects/vault_memai_obsi/packages/ui/src/components/VaultStatusBanner.tsx), rimosso "su questo Mac" dal tooltip di Obsidian.

2. **Correzione Diagnostica degli Errori Locali**:
   - Quando si verifica un errore durante la ricerca locale o l'indicizzazione, la UI non indirizza più erroneamente l'utente a verificare le chiavi API o le quote di OpenAI, ma riporta il messaggio effettivo del motore locale.
   - Il banner di stato del Vault (`VaultStatusBanner`) visualizza ora con precisione il badge "Vault Aperto" distinto dallo stato specifico dell'indice (`Pronto (N doc)`, `In corso...`, `Mancante`, `Da aggiornare`).

---

## 12. Fase 8: Reattività Asincrona di «Annulla» (<50ms)

1. **Watcher Asincrono Immediato**:
   - In [`apps/desktop/src-tauri/src/ai.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/ai.rs), integrato un ciclo di controllo asincrono con `tokio::select!` che valuta `cancel.load(Ordering::SeqCst)` a intervalli di 50ms sia durante l'attesa iniziale dei byte di risposta HTTP da `llama-server` (`req_builder.send().await`), sia durante la lettura di ogni singolo chunk SSE (`response.chunk().await`).
   - In caso di annullamento da parte dell'utente, la connessione socket TCP verso il server locale viene abortita immediatamente (<50ms), liberando la coda di inferenza del server.

---

## 13. Quadro di Convalida e Stato di Avanzamento

- [x] **Rettifica Formale Relazione Diagnostica Ministral**: tempi CPU corretti, `#` non riprodotto su test sintetici, ipotesi distinte da fatti provati.
- [x] **Verifiche Dirette Server con Trasformazione Simulata (Fase 2)**: 3 livelli eseguiti, stream progressivo, TTFT primo evento SSE e primo delta.content separati, `### Caratteristiche` identificato come Markdown lecito (non loop anomalo).
- [x] **Ispezione Template Jinja e Parametri (Fase 3)**: modello instruct puro senza token speciali di reasoning.
- [x] **Benchmark e Concorrenza GPU Vulkan (Fase 4)**: 35/35 layer offloadati, embedding simultaneo a Ministral completato in 93 ms (vettore conforme 1.024 float, norma 1,0), VRAM 7.821 MiB (6.568 MiB netto modelli, 4.290 MiB headroom libera), accelerazione server di 24,9x documentata su stessa fixture lunga.
- [x] **Implementazione Codice (Commit `d99bf93`)**:
  - `llama_llm.rs` & `llama.rs`: GPU Vulkan default e fallback controllato a CPU (`-ngl 0`).
  - `App.tsx`: Auto-indicizzazione trasparente e non bloccante con isolamento race condition via ticket atomico.
  - `AiPanel.tsx`, `SemanticEngineSettings.tsx`, `VaultStatusBanner.tsx`: Bonifica etichette piattaforma e messaggi di errore locali.
  - `ai.rs`: Watcher asincrono `tokio::select!` per interruzione tempestiva.
- [x] **Controlli di Compilazione e Test Unitari**: TypeScript 0 errori (`pnpm build`), Rust 0 errori (`cargo check`, 14/14 test passati in `llama_llm`).
- [x] **Riscaldamento Cache Release Eseguito**: compilato con `npx pnpm --filter @limen-vault/desktop tauri dev --release` in 3m 13s, processo arrestato ordinatamente nella stessa sessione (PID `28292`).
- [ ] **Collaudo Applicativo Reale nell'App LIMEN (Aperto)**: selezione vault → indicizzazione automatica → domanda → risposta → annullamento → nuova domanda. Misura applicativa dell'annullamento (obiettivo `<50ms`).
- [ ] **Sessione di Prova 20 Domande e Packaging Installer NSIS (Aperto)**.
