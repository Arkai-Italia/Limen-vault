# TASK LIST — LIMEN Vault: archivio chat Codex, installatori e rilascio v6Mini

## Avanzamento versione Windows v6Mini — 1 ottobre 2026

Stato: **Prove applicative completate con successo; accettazione formalmente aperta.**  
*Nota metodologica vincolante*: Il risultato delle prove applicative e degli script di collaudo non sostituisce l'audit indipendente né l'accettazione finale di Cesare.

- Build di Riferimento: Git Commit HEAD `193363c18ec8de9d81de1a73a640bc5bd0175ca9`
- Patch Modifiche Uncommitted: `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/uncommitted_changes.patch` (SHA-256: `300e59dec821365488494c6e4b717eb4c1774ef353864ff663426da0fa6b4033`, 133.678 byte)
- Installer Distribuibile Generato: `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe` (63.068.980 byte, SHA-256: `07520a52970b6307fb4bf4f65811aa66f777950912c4803fefa89eb9f48f46c8`)

- [x] **Rettifica Documentale e Dismissione Attestazioni Invalidate**: rimossi "100%", "23 PASS" e formule di "accettazione ufficiale" preventiva; confermato che il superamento tecnico delle prove non vincola né anticipa l'audit indipendente di Codex né il benestare finale di Cesare.
- [x] **Core Rust, Libreria e Compilazione Release**:
  - [x] 250 unit test della libreria Rust superati con codice 0 (`cargo test --lib`).
  - [x] Lettura RAM Win32 (`GlobalMemoryStatusEx`) e gestione prudenziale modelli.
  - [x] Contratto estrazione `ExtractionOutput { text, is_partial, warnings }` integrato senza blocchi critici.
  - [x] Correzione `AiState::begin`: eliminazione automatica di richieste precedentemente annullate tramite `active.retain(|_, entry| !entry.cancel.load(Ordering::SeqCst))` per abilitare l'invio istantaneo di follow-up post-annullamento.
- [x] **Componenti Nativi OCR e Formati (Verifica di Componente)**:
  - [x] Libreria `pdfium.dll` (Chromium build 8066) integrata con singleton thread-safe.
  - [x] Tesseract 5.4.0 (con modelli `ita` ed `eng` in `tessdata`) eseguito con successo standalone da CLI su immagine PNG.
  - [x] Parser pure Rust per RTF (`rtf-parser` 0.3.0) e Word 97-2003 OLE2 DOC (`cfb` 0.7.3) implementati e testati a livello Rust.
  - [x] Spike su 7 fixture superato a livello test libreria (`win_ocr::tests`).
- [x] **Packaging NSIS Riproducibile**:
  - [x] Script `scripts/package-v6mini-windows.ps1` aggiornato con lockfile congelato, manifest binari e validazione fisica asset `dist/`.
  - [x] Installer standalone generato da 63.068.980 byte contenente runtime completo (`llama-server`, `pdfium`, `tesseract`).
- [x] **Collaudo Applicativo End-to-End dell'App Installata (8 Scenari Superati - Accettazione Aperta)**:
  - Esecuzione su istanza reale installata `limen-vault.exe` collegata via Chrome DevTools Protocol (CDP).
  - Tutti gli 8 Scenari superati tecnicamente (fascicolo `phase6_collaudo_e2e_run_20261001_134134/`).
  - **Scenario 8 (20 Domande Consecutive)**: pilotato **esclusivamente tramite textarea e pulsante reali** (`window.__limenAsk` rimosso/escluso dal percorso applicativo reale).
    - 20/20 turni completati con successo (0 timeout, 0 anomalie cancelletti `#`, 0 loop).
    - Differenziazione Q12 vs Q13 convalidata (`Q12_Q13_Identical: false`, testi distinti).
    - Regola di classificazione: eventuale timeout con testo parziale tassativamente classificato come `INCOMPLETE` (non computabile come `SUCCESS`).
  - **Scenario 6 (Annullamento & Interruzione Server)**:
    - Annullamento pre-stream e active-stream verificato con ripristino UI a ~105-109 ms.
    - Prova specifica di interruzione effettiva server e follow-up immediato a t=63ms completata con successo (`evidence_server_interruption_immediate_ask.json`: tempo risposta B = 7.7s, nessun residuo).
  - **Scenario 7 (Fallback Automatico GPU -> CPU dell'Applicazione)**:
    - Verificato fallback automatico su errore di allocazione GPU gestito da `llama_llm.rs` con ripiego su CPU `-ngl 0` e tracciamento in `llama-llm.log` (`evidence_automatic_gpu_fallback.json`: server CPU pronto a t=5s, risposta erogata con successo).
  - Sincronizzazione note modificate integrata e verificata nel normale percorso applicativo (pulsante "Aggiorna" topbar).
- [x] **Isolamento Vault Windows**: **VERIFICATO**.
  - Architettura Single-Vault rigorosa: nessun cambio in-sessione durante task; isolamento indici Vault A e Vault B confermato senza corruzioni cross-vault (`CrossPollutionDetected: false`).
- [x] **Verifica Modifiche Condivise con macOS**:
  - Ispezione differenziale codice completata: conditional compilation `#[cfg(target_os = "macos")]` vs `#[cfg(target_os = "windows")]` isolate.
  - Dichiarazione formale: **"Runtime Mac: NON VERIFICATO"** (in assenza di macchine fisiche Apple Silicon).
- [x] **Ricognizione Concreta Ambiente e Proposta VM Dedicata**:
  - Script di censimento `collaudo_e2e_isolated.ps1` vincolato a codici non zero (`exit 2` per prove non eseguite/bloccate) e verifica fisica 7/7 fixture.
  - Documentati percorsi effettivi dal codice sorgente (`USERPROFILE`/`HOME`, override `LIMEN_AI_SETTINGS_FILE`, limite WinCred).
  - Verificata assenza di alterazioni nel profilo `user` (file fermi al 25 settembre 2026).
  - Formalizzata richiesta amministrativa per VM Windows 11 pulita in `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/richiesta_amministrativa_ambiente_dedicato.md`.
- [x] **Diagnosi su Ministral 3 8B (Domanda ARKAI — Tempi misurati e ipotesi di lavoro)**:
  - Identificati binari, versioni e hash: `limen-vault.exe` (SHA-256 `9E21C34B...`), `llama-server.exe` Build 8477 (`45438F02...`), modello 8B (SHA-256 letto dalla cache `.verified.json` `7a545412...`, 6.059.268.512 byte).
  - Tempi CPU misurati dal log della richiesta Cesare: prompt eval 47.941 ms (~48s), generazione 91 token in 61.506 ms (~61s) a 1.48 tok/s, totale 109.448 ms (~1m49s).
  - Test isolati su fixture sintetica: **non hanno riprodotto il difetto dei `#`** (risposte fluide in italiano).
  - Classificazione formale: prompt lungo (~6k token), temperatura 0.2, assenza di repeat penalty e `thinking = 1` sono **ipotesi da verificare sperimentalmente**, non causa radice dimostrata.
  - Prestazioni GPU (NVIDIA RTX 3060 12GB rilevata) e confronto Mac classificate come **prestazioni da misurare**, non misure acquisite.
  - Funzione «Annulla»: **verificata mediante lettura del codice statico**, non ancora mediante prova applicativa live.
  - Rimossa l'affermazione che `repeat_penalty: 1.1` elimini categoricamente qualsiasi ripetizione.
- [x] **Verifiche Dirette del Server con Simulazione Trasformazione Testo (Fase 2)**:
  - Test diretti dell'endpoint `/v1/chat/completions` con simulazione PowerShell della sanitizzazione backend (`ai.rs`) e visualizzazione pre-wrap.
  - Prova 1 (senza documenti): TTFT SSE 19.098 ms, totale 79.279 ms, 209 chunk SSE, 0 caratteri `#`.
  - Prova 2 (breve fonte): TTFT SSE 17.090 ms, totale 61.053 ms, 146 chunk SSE, 0 caratteri `#`.
  - Prova 3 (contesto lungo 6.404 token): TTFT SSE 19.671 ms, totale 532.056 ms (~8m52s), 668 chunk SSE, emissione di `### Caratteristiche principali:`.
  - Distinzione qualitativa: `### Caratteristiche principali:` è un'intestazione Markdown H3 valida, non il loop anomalo di decine di `#` osservato da Cesare. Il controllo `#{3,}` rileva anche intestazioni lecite e non è usato da solo come indicatore del difetto.
  - Archiviati sia stdout (`llama_server_phase2_execution.log`) sia stderr (`llama_server_phase2_stderr.log`).
  - Salvataggio progressivo dello stream implementato e tracciamento separato di TTFT primo evento SSE e primo token con contenuto.
  - **La verifica del percorso applicativo reale (attraverso WebView2 / LIMEN) rimane riaperta nel piano per la prova live.**
- [x] **Verifica Template e Parametri prima delle modifiche (Fase 3)**:
  - `llama-server.exe`: supporta flag `-rea, --reasoning [on|off|auto]`.
  - Jinja template del GGUF: formato instruct puro senza token `<think>`, né tag DeepSeek.
  - Principio di isolamento: testare una singola modifica alla volta.
- [x] **Misurazione Sperimentale e Concorrenza GPU Vulkan Windows (Fase 4)**:
  - Hardware: NVIDIA GeForce RTX 3060 con 12 GB VRAM (driver 595.79, Vulkan 1.4.328).
  - Parser dei layer corretto: registrati **35/35 layer** offloadati su GPU (`load_tensors: offloaded 35/35 layers to GPU`).
  - VRAM dettagliata: `1.253 MiB` a riposo, `1.572 MiB` dopo bge-m3 (+319 MiB), `7.821 MiB` con entrambi attivi (incremento netto modelli: **`6.568 MiB`**, non attribuendo la VRAM a riposo ai modelli; headroom libera: **`4.290 MiB`**).
  - Concorrenza provata: richiesta embedding `bge-m3` eseguita *durante* la generazione streaming di Ministral (chunk 10); calcolata in **93 ms**, vettore conforme di **1.024 float** con norma L2 pari a 1,0 e nessun NaN/Inf; VRAM durante il carico: 7.700 MiB.
  - Confronto rigoroso motore sulla stessa fixture lunga (dichiarando il riutilizzo contesto/cache tra 6.404 e 6.538 token):
    - Prompt eval: **4.705,89 ms (1.389 tok/s)** su GPU vs **19.561,42 ms (327 tok/s)** su CPU (**4,16x più rapido**).
    - Generazione: **37,90 tok/s** su GPU vs **1,30 tok/s** su CPU (**29,15x più rapido**).
    - Tempo totale server: **21.382,20 ms (~21,4s)** su GPU vs **532.056,23 ms (~8m52s)** su CPU (**24,88x più rapido**).
    - TTFT: primo evento SSE a 4.858 ms, primo delta.content a 4.880 ms.
  - Dichiarazione formale: il miglioramento documenta la potenza del motore GPU Vulkan, ma **non costituisce ancora una misura della velocità dell’app installata**.
- [x] **Implementazione Codice (Commit `d99bf93` e `423bab7`)**:
  - *GPU e Fallback CPU (`llama_llm.rs`, `llama.rs`)*: `-ngl 99` di default, ripiego controllato a `-ngl 0` su CPU in caso di mancata GPU/OOM, log su `llama-llm.log`. 14 unit test Rust superati.
  - *Indicizzazione Automatica (`App.tsx`)*: verifica stato all'apertura/cambio vault o upload/compilazione, non bloccante per l'input dell'utente, isolamento race condition con ticket atomico.
  - *Bonifica UI e Tasto Annulla Prominente (`AiPanel.tsx` - Commit `423bab7`)*:
    - Neutralizzazione diciture Mac residue su Windows (Vulkan invece di Metal, PC invece di Mac).
    - Tasto "Chiedi" trasformato in pulsante rosso prominente `Annulla domanda` durante qualsiasi stato di occupazione (`isBusy`).
    - Pulsante `Annulla domanda` visibile anche nella bolla del prompt attivo e direttamente inline nel banner di errore ("C'è già una domanda in corso").
    - Handler `handleCancelActiveRequest` con ripristino istantaneo degli stati di streaming e step.
- [x] **Adeguamento Rigoroso Script ed Evidenze di Collaudo (Punti 1-5 Audit)**:
  - *Fase 2 Isolamento e Baseline Storica*: cartelle di esecuzione con timestamp univoco (`phase2_run_$Timestamp`), baseline CPU storica in `phase2_reproduce/` preservata integralmente.
  - *Evidenze Fisiche "simulated"*: generati in `phase2_reproduce/` i file `simulated_backend_sanitized_text.txt` e `simulated_frontend_text.txt` per tutte e 3 le prove storiche.
  - *Condizione di Completamento Stream Rigorosa*: tracciamento distinto di `ReceivedDoneSignal` (`[DONE]`), `FinishReason` (`stop`/`length`), `TransportErrorsCount`, `ParseErrorsCount`, `WasCancelled` e calcolo vincolante di `IsComplete`. Esito fallito con `exit 1` in caso di requisiti non soddisfatti.
  - *Dichiarazione Concorrenza Conforme*: sostituito "senza rallentamenti" con il fatto dimostrato (embedding completato durante richiesta di generazione aperta, successivamente conclusa regolarmente; documentata sospensione lettura stream durante attesa embedding e campionamento VRAM successivo).
  - *Rettifiche Tecniche*: cronometro avviato prima della trasmissione HTTP; nessuna ipotesi non provata su template; `.Kill()` descritto formalmente come terminazione forzata.
- [ ] **Collaudo Applicativo Reale nell'App LIMEN (Accettazione aperta — In corso di verifica)**:
  - Automazione E2E su applicazione installata (`C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe`) via WebView2 CDP (`--remote-debugging-port=9222`) su vault di test isolati (`Vault_A`, `Vault_B`).
  - **Stato ufficiale delle prove (Accettazione aperta — Sospeso per prosecuzione)**:
    - *Scenario 1 (Auto-indicizzazione)*: [VERIFICA PARZIALE] Indice creato sulla fixture, stato UI "Indice: Pronto". In attesa di accettazione finale Cesare.
    - *Scenario 2 (Riapertura senza rebuild superfluo)*: [VERIFICA ESEGUITA] Timestamp mtime indice identico (`1790757137657.776`), ricerca immediatamente disponibile.
    - *Scenario 3 (Aggiornamento variazioni documentali)*: [APERTO / AZIONE MANUALE] L'aggiornamento delle note in `01_CLIENTS/` richiede il pulsante manuale UI "Aggiorna indice" (non presente file-watcher continuo). Aperto per accettazione Cesare.
    - *Scenario 4 (Isolamento vault e gestione cambio attivo)*: [APERTO] Switch vault con operazione in corso aperto per accettazione Cesare.
    - *Scenario 5 (Verifica semantica fatti ed eliminazione '#')*: [VERIFICA ESEGUITA] Risposta locale Ministral 3 8B su GPU RTX 3060 con 0 caratteri `#`. Difetto non riprodotto su fixture strutturata conforme.
    - *Scenario 6 (Collaudo «Annulla» pre-stream e active-stream)*: [APERTO / DA CORREGGERE MISURE TEMPO] Riscontrati tempi impropri (69.974ms e 8.520ms) dovuti al calcolo post-richieste successive nello script. Da misurare: tempo reset UI immediato (`performance.now() - tClickCancel`) e separatamente interruzione richiesta server.
    - *Scenario 7 (Ripiego controllato CPU e resilienza UI)*: [APERTO / SEPARAZIONE MOTORE vs FALLBACK] La risposta CPU generata in 84.016s è evidenza del motore standalone (`llama-server.exe`), non prova del fallback automatico GPU->CPU integrato in LIMEN. Timeout del wrapper da diagnosticare.
    - *Scenario 8 (Sessione 20 domande consecutive)*: [APERTO / ANOMALIA Q12-Q13 DIAGNOSTICATA] Riscontrata identità testuale anomala tra risposta 12 e 13. Causa radice diagnosticata nel test runner: `submitQuestionAndTrackTurn` leggeva l'ultimo elemento `pre-wrap` prima del rendering del nuovo turno, catturando la risposta precedente. Richiesta riproduzione mirata Q12/Q13 con tracker puntuale del turno (`Turno X` + prompt effettivo), verifica eventuale bug app e riesecuzione sessione completa 20 domande.
  - Nessuna nuova prova conclusiva registrata con commit 193363c (archivio v2 storico).
- [x] **Packaging Installer Standalone e Verifica Hash**:
  - Installer generato: `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe` (63.062.230 byte, SHA-256 `8c9b1aa4b494e7d768f9384391c943d056d6cb58cac2c5ca5697efefc717e31b`).
  - Pacchetto verificato con installazione silenziosa e bundle nativo completo (`llama-server.exe`, `pdfium.dll`, `tesseract.exe`).
- [ ] **Accettazione Finale e Chiusura Parità Windows con Cesare (Aperto)**:
  - Stato formale rigorosamente mantenuto su **«accettazione aperta»**.
  - Ripresa programmata per la prossima sessione con test mirato Q12/Q13 e suite 20 domande aggiornata.


## Archivio chat Codex per Windows — 29 settembre 2026

Stato: completato, verificato e pubblicato su `origin/windows-build`; commit archivio `30d97ca`, push riuscito il 29 settembre 2026.

- [x] Individuate 7 chat locali associate alla cartella/remoto Git del progetto.
- [x] Esportati 565 messaggi utente/Codex in `CHAT_CODEX/`, con indice, manifest SHA-256 e script aggiornabile.
- [x] Verificati conteggi, integrità dei file e lettura dei database in sola lettura; nessun codice applicativo modificato.
- [x] Documentati limiti: fotografia temporale, allegati e log strumenti esclusi, nessuna importazione automatica nella sidebar Windows.
- [x] Pubblicato archivio su `origin/windows-build`; push confermato dal remoto (`603f8e6..30d97ca`).

## Istruzioni al coder per il rilascio Windows — 29 settembre 2026

Stato: documento completato e pubblicato su `origin/windows-build`; commit contenuti `970f649`, push riuscito il 29 settembre 2026. Implementazione Windows e installer non eseguiti in questa attività.

- [x] Verificati manifest Tauri, componenti Windows esistenti e handover storico.
- [x] Individuati punti da collaudare/correggere: RAM fissa fuori da macOS, estrazione PDF/OCR nel ramo Mac, helper e packaging per piattaforma.
- [x] Preparato `USER INSTALL/ISTRUZIONI_CODER_BUILD_WINDOWS.md` con fasi, comandi, vincoli, matrice di accettazione e consegna.
- [x] Verificati riferimenti ufficiali Tauri per prerequisiti, NSIS, WebView2 e firma.
- [ ] Implementazione, build e collaudo Windows da eseguire dal coder; non ereditare come verifiche della release corrente i risultati Windows storici.

## Installatori e credenziali locali — 29 settembre 2026

Stato: completato e pubblicato su `origin/windows-build`. Commit contenuti `fcdbc10`; push riuscito il 29 settembre 2026.

- [x] Rimosse dal `.gitignore` le esclusioni `USER INSTALL/` e `USER INSTALL WINDOWS/`.
- [x] Creata `/SECRETS_NO_GIT/`; su correzione esplicita dell’utente, cartella e contenuti includibili in Git tramite eccezioni alle regole dei segreti.
- [x] Copiati i file presenti `SECRETS.TXT` e `UTENTI PASSWORD.TXT`, mantenendo gli originali e le loro esclusioni; copie verificate byte per byte, senza esporre contenuti.
- [x] Verificato che copie in `SECRETS_NO_GIT/` e cartelle installatori non siano escluse; originali delle credenziali ancora ignorati.

Residui: `.env`, `.env.local`, `.env.production` non trovati nell’inventario del progetto; `USER INSTALL WINDOWS` non presente. Installatori e copie delle credenziali pubblicati sul branch `windows-build`; push verificato. Sicurezza gestita dall’utente come richiesto.

## FASE 8 — Correzioni Ministral Locale e Rilascio LIMEN Vault v6Mini 0.6.0 (25 settembre 2026)

Stato: completato e validato in locale con 4 integrazioni obbligatorie.
Consegna: commit unico su tag `fase8-ministral-fix` e DMG firmato e notarizzato `LIMEN-Vault-v6Mini.dmg` in `USER INSTALL/`; esclusione Git rimossa il 29 settembre 2026, file non ancora aggiunti.

- [x] Punto 1 (Bloccante): Modalità Solo Locale isolata al 100% da qualsiasi rete esterna. Se il motore semantico non è Locale ("local"), la ricerca si ferma prima di chiamate di rete con messaggio: "La modalità Solo Locale richiede il motore di ricerca Locale. Impostalo in Impostazioni > Motore semantico.". Se bge-m3 non pronto/spento: errore bloccante esplicito. Controllo implementato in backend Rust (ai.rs, main.rs) e frontend (AiPanel.tsx). Nessuna richiesta verso indirizzi diversi da 127.0.0.1.
- [x] Punto 2 (Integrazione 1): Risolto blocco di llama-server per pipe buffer pieno reindirizzando stderr su `llama-llm.log`. Eseguita prova obbligatoria di 20 domande consecutive in Solo Locale sul Mac di Cesare con il llama-server incluso nell'app: 20/20 completate, 0 errori, dimensione finale `llama-llm.log` = 20.921 byte.
- [x] Punto 3 (Integrazione 4): Costante unica `MINISTRAL_STARTUP_TIMEOUT_SECS = 90` applicata sia in `ensure_running()` sia nel loop `/health` di `start()`. Tempo reale di avvio misurato dai timestamp di log: ~6 secondi.
- [x] Punto 4: Spostata l'attesa di `llm.ensure_running()` in `tauri::async_runtime::spawn_blocking` in `ai_ask_stream` (main.rs) per non bloccare il runtime asincrono.
- [x] Punto 5: Fonti nel ramo locale non più contrassegnate artificialmente come tutte citate (`citedIndices` vuoto); visualizzazione corretta come "fonti consultate".
- [x] Punto 6 (Integrazione 3): Gestione rigorosa errori del server locale: status HTTP != 200, evento errore SSE o 0 token chiudono la richiesta categoricamente con `status: "error"` e messaggio del server (mai "completed"). Lettura di `choices[0].finish_reason`: se vale "length", risposta contrassegnata come `incomplete` con avviso: "Risposta interrotta per limite di lunghezza". Test Rust dedicati implementati e superati.
- [x] Punto 7 (Precisazione 7): Budget contesto 8192 token in `request_body_chat_completions` con potatura automatica fonti (`prune_sources_for_context`) e riserva garantita di almeno 1500 token.
- [x] Punto 8 & 9 (Integrazione 2): Gestione memoria Mac 8 GB e selezione modello: Ministral 3 8B eccede il working set Metal (5.3 GB) causando OOM; in base alla regola approvata da Cesare, per Mac < 16 GB si adotta Ministral 3 3B Instruct Q5_K_M (mistralai/Ministral-3-3B-Instruct-2512-GGUF, 2.474.178.720 byte, SHA-256 e23dd88b0e0951d3f5784d6d4092210cda2b006b251f33b226b283a6c9d1f6bb), offload fisso `-ngl 99` (27/27 layer), KV cache `-ctk q8_0 -ctv q8_0 -np 1` (442 MiB). Misurate 3 domande reali sul vault: TTFT medio 560 ms, velocità 24.9 tok/s.
- [x] Punto 10: Script di packaging `scripts/package-v6mini-macos.sh` tracciato nel repository git per piena riproducibilità.
- [x] Punto 11: Documentazione e tracciamento task (`TASK_LIST.md` e `TODO LIST.TXT`) aggiornati con lo stato della FASE 8 e 4 integrazioni.
- [x] Punto 12: Allineamento coerente a "LIMEN Vault v6Mini", versione `0.6.0`, identificativo `dev.arkai.limenvault` invariato su `tauri.conf.json`, `package.json`, `Cargo.toml`, codice interfaccia e manualistica.
- [x] Punto 13 (Precisazione 13): Creazione DMG unico `LIMEN-Vault-v6Mini.dmg` in `.local/limen-v6mini-release/` e copia in `USER INSTALL/LIMEN-Vault-v6Mini.dmg` (esclusione Git rimossa il 29 settembre 2026). Firmato Developer ID, notarizzato Apple e validato con Gatekeeper (spctl e stapler).

---

## Guida utente V5 A4 orizzontale — 25 settembre 2026

Stato corrente: completato e verificato in locale; non pubblicato su Google Drive. Guida di 42 pagine A4 orizzontali con 37 schede e 37 diagrammi Mermaid. Consegna: PDF, Word modificabile e sorgenti Mermaid in `output/guida_utente/`.

- [x] Letti i cinque file indicati; recuperato il modello CRM originale da Google Drive.
- [x] Verificati formato, carattere Inter, colori e struttura a schede del riferimento.
- [x] Riscontrati menu principali e comandi di ricerca nell’app nativa aperta.
- [x] Completati testi semplici e 37 diagrammi Mermaid, incluse diramazioni per scelte e interruzioni.
- [x] Generati Word e PDF A4 orizzontali: 42 pagine, Inter incorporato nel PDF, indice verificato; controllo visivo e geometrico senza overlap o testo fuori pagina. Stili, tema, numerazione e geometria del riferimento conservati.
- [x] File locali pronti; indice `MANUALE UTENTE.MD` e dipendenze aggiornati.

Verifiche e limiti: `output/guida_utente/FONTI_E_VERIFICHE.md`. Il comando di automazione delle vecchie guide non è esposto nella UI corrente e non è presentato come azione disponibile. Configurazione dei client esterni fuori dalle procedure LIMEN; nessuna operazione di pubblicazione o sui dati del Vault eseguita. Nessun residuo per la consegna documentale locale; nessun gate applicativo pregresso chiuso da questa attività.

## Stato applicativo preesistente

Aggiornamento: 19 settembre 2026. **Stato corrente: app/DMG consegnati da AG; accettazione funzionale riaperta dopo audit.** Notarizzazione dell’app consegnata verificata, ma gate A01…A16 ridefiniti nel report e difetti ancora presenti nel checkout. Rapporto: [audit AG](IMPLEMENTATION/2026-09-19_AUDIT_REPORT_AG.md). Le checkbox pregresse non oggetto di questo audit restano dichiarazioni AG, non nuove verifiche indipendenti.

Piano operativo: [IMP_PLAN_MEMORIA_AZIENDALE_UI_UX.MD](IMPL_PLANS/IMP_PLAN_MEMORIA_AZIENDALE_UI_UX.MD). Audit: [analisi codice reale](IMPLEMENTATION/2026-09-18_UX_MEMORIA_AZIENDALE.md). Dipendenze: [TODO LIST.TXT](TODO%20LIST.TXT). Le sezioni MA-* sono la checklist principale, non rilasci intermedi.

**Esito richiesto:** ogni originale acquisito apribile; testo estratto immediatamente ricercabile; classificazione e wiki asincrone; UI Chiedi/Documenti/Memoria; un’unica app v3 collaudata, firmata/notarizzata e consegnata.

## Coordinamento correttivo AG / audit Claude — 19 settembre 2026

Stato: correzioni R1…R6 verificate da Claude; nuova build release 0.3.0 firmata Developer ID, notarizzata da Apple (Accepted), graffettata con ticket validato e collaudata con Gatekeeper (spctl accepted Notarized Developer ID) su /Applications e USER INSTALL. Matrice A01…A16 riscritta con test reali al 100% e log grezzi allegati in `IMPLEMENTATION/V3_AUDIT_CLOSURE_EVIDENCE/`. Risolti locators pagina/slide, chunking >1200 caratteri con overlap 150 car., e documentato scostamento catalogo JSON vs SQLite. Report finale: `IMPLEMENTATION/2026-09-19_AUDIT_CLOSURE_REPORT_AG.md`.

- [x] Preparato [messaggio completo per AG](MESSAGGIO%20AG%20-%20CORREZIONI%20AUDIT%20LIMEN%20VAULT.md), con R1…R6, regressioni, criteri originali e consegna all’auditor.
- [x] Preparato [dossier operativo per Claude](CLAUDE%20AUDIT%20-%20LIMEN%20VAULT.md), con contesto, storia, codice, fonti, evidenze, matrice originale e procedura di audit.
- [x] R1: ripristinati i gate originali A01…A16 con nomi di test reali al 100% in `IMPLEMENTATION/2026-09-19_AUDIT_CLOSURE_REPORT_AG.md` e log grezzi allegati. A04 declassato a NON VERIFICATO (in attesa di set gold); A05 eseguito con semantica reale e fusione normalizzata Variant B (Recall@10 = 0.950, PASS, rilievo C8 risolto); A15 eseguito su scala 1.000 doc/11.000 passaggi (p95 calda 198.90 ms, PASS).
- [x] R2: integrati embeddings e ricerca ibrida RRF nei percorsi reali di App.tsx e ai.rs; lettura chiave dal Portachiavi macOS via `keychain::load()` nel backend Rust; fallback locale a latenza zero verificato.
- [x] R3: ammissibilità e filtri policy applicati prima del ranking e del top-k in `search_vault_filtered`; superata regressione con 55 bozze ad alto punteggio che non nascondono la fonte approvata.
- [x] R4: implementata verifica effettiva di documento, testo, passaggio e revisione (`DocumentVerificationReport`, `verify_document_passage_integrity`); badge di conformità e blocco sostituzione silenziosa nel lettore.
- [x] R5: eliminato limite di 50 documenti con lookup nativo diretto per percorso completo normalizzato (`get_document_by_path`); risoluzione oltre pagina 1 e disambiguazione omonimi verificata.
- [x] R6: separati `passageId` (identificatore per scroll ed evidenziazione) e `locator` (descrizione testuale) tramite DTO `CitationOpenRequest`; serializzazione passaggi corretta in `SEARCH_INDEX.json`.
- [x] Punti aperti: chunking riconosce intestazioni `## Pagina N` e `## Slide N`; paragrafi >1050 car. suddivisi con confini semantici; sovrapposizione 150 car. tra passaggi; documentato scostamento architetturale JSON vs SQLite.
- [x] Notarizzazione e Gatekeeper: sottomissione con `--wait` riuscita (`Accepted`), ticket graffettati su .app e .dmg; Gatekeeper verifica `accepted (source=Notarized Developer ID)` su `/Applications` e `USER INSTALL`. Checksum finali aggiornati.
- [x] Checkout congelato con commit e tag locale `v3.0.0-audit-closure`.


## Preparazione completata — solo documentazione

- [x] Audit diretto di UI, ingestion, lettori, retrieval, citazioni, indice e protezione.
- [x] Inventario storico verificato in sola lettura: 56 RAW, nessuna configurazione automazione; indice 58 documenti (57 proposte, una approved), una nota in Casi studio. Non trattare questi numeri come immutabili.
- [x] Piano MA-01…MA-12, contratti dati, dipendenze, migrazione/rollback e matrice A01…A16 definiti.
- [x] Separati lavoro locale parziale, verifiche pregresse e nuova consegna ancora da realizzare.
- [x] Checklist principale, dipendenze e handover per AG aggiornati; storico preservato.
- [x] Verifica documentale PASS: 12 pacchetti allineati, 16 criteri presenti, collegamenti locali validi; nessun gate implementativo segnato completo. Nessun test applicativo ripetuto per questa modifica solo documentale.

## MA-01 — Baseline e contratti

Stato: completato locale e verificato. Dipendenze: lettura piano e regole del progetto. Uscita: baseline riproducibile e contratti condivisi. Evidenza: [MA-01_BASELINE_CONTRATTI.md](IMPLEMENTATION/MEMORIA_AZIENDALE_EVIDENCE/MA-01_BASELINE_CONTRATTI.md).

- [x] Inventariare diff preesistenti, artefatti installati e test senza reset o sovrascritture.
- [x] Definire schema/versioni catalogo, documento/revisione, fasi e politica di ammissibilità.
- [x] Definire DTO IPC, snapshot/eventi e lettura di passaggi con locator/hash.
- [x] Preparare regressioni dei difetti osservati e corpus gold senza dati aziendali privati.
- [x] Registrare baseline effettivamente eseguita e decisioni tecniche nelle evidenze.

## MA-02 — Catalogo e migrazione conservativa

Stato: completato locale e verificato. Dipende MA-01. Uscita: documenti/revisioni coerenti e migrazione recuperabile. Evidenza: [MA-02_CATALOGO_MIGRAZIONE.md](IMPLEMENTATION/MEMORIA_AZIENDALE_EVIDENCE/MA-02_CATALOGO_MIGRAZIONE.md).

- [x] Implementare catalogo transazionale locale versionato con contenuti originali/Markdown indipendenti dal database.
- [x] Importare registri esistenti e note umane; conservare proposte legacy senza approvazioni fittizie.
- [x] Deduplicare stesso contenuto rinominato, preservare alias; separare revisioni da duplicati e titoli omonimi.
- [x] Allineare lettori Rust/TypeScript/MCP alla stessa autorità e ai controlli di provenienza.
- [x] Verificare staging atomico, doppia migrazione, crash intermedi e rollback su copie isolate (A09/A11).

## MA-03 — Ingestion locale e coda nativa

Stato: completato locale e verificato. Dipende MA-02. Uscita: senza API originali apribili e testo supportato ricercabile. Evidenza: [MA-03_INGESTION_CODA.md](IMPLEMENTATION/MEMORIA_AZIENDALE_EVIDENCE/MA-03_INGESTION_CODA.md).

- [x] Spostare scheduling in Rust/Tauri; scansione all’avvio, watcher/debounce e riconciliazione periodica.
- [x] Separare estrazione/OCR e indice locale da credenziali, classificazione, wiki e semantica.
- [x] Unificare selettore e drag-and-drop; ricevuta per file e inventario di tutti i formati, con limiti espliciti.
- [x] Conservare testo/numeri/tabelle e locator reali; gestire protetti/corrotti/non supportati senza falsa riuscita.
- [x] Gestire pausa, annullamento, recovery, concorrenza e backoff massimo tre tentativi senza loop.
- [x] Verificare originali byte-identici, AI assente/offline e errore isolato nel batch (A01/A02/A09/A10).

## MA-04 — Lettore unico e risultati apribili

Stato: accettazione riaperta dall’audit del 19 settembre; vedere R1…R6 in `IMPLEMENTATION/2026-09-19_AUDIT_REPORT_AG.md`. Implementazione/artefatti esistenti non rimossi.

- [x] Scheda unica originale/testo/sintesi/collegamenti/cronologia, con lettura progressiva dei testi lunghi.
- [x] Apertura originale e Reveal in Finder mediante ID e percorsi validati, anche per file non estraibili.
- [x] Collegare Documenti, Memoria, risultati e citazioni allo stesso lettore/passaggio/revisione (R4/R5/R6).
- [x] Evidenziazione coerente con token, accenti e Unicode, senza HTML attivo.
- [x] Tastiera/focus, posizione e query preservate; citazioni non risolte segnalate con banner, mai aperte sul file sbagliato (A03/A07/A12/A14).

## MA-05 — Ricerca locale incrementale

Stato: completato locale e verificato. Dipende MA-03. Uscita: ricerca completa per i testi supportati, senza reindicizzazione ordinaria manuale. Evidenza: [MA-05_RICERCA_INCREMENTALE.md](IMPLEMENTATION/MEMORIA_AZIENDALE_EVIDENCE/MA-05_RICERCA_INCREMENTALE.md).

- [x] Passaggi strutturati, locator, hash e versioni; copertura inizio/centro/fine e fogli/tabelle.
- [x] Indice incrementale con generazioni atomiche, rilevamento aggiunte/modifiche/rimozioni e freshness effettiva.
- [x] Query lessicale con termini, frasi, codici e ranking; risultati raggruppati per documento, paginazione corretta.
- [x] Isolare fonti obsolete/illeggibili restituendo risultati validi e stato parziale esplicito.
- [x] Aggiornare viste/eventi automaticamente e verificare parità Rust/TypeScript (A03/A04/A08).

## MA-06 — Retrieval ibrido e semantico

Stato: correzioni R2/R3 implementate e collaudate; evidenza in `IMPLEMENTATION/2026-09-19_AUDIT_CLOSURE_REPORT_AG.md`. Criterio A05 mantenuto aperto su scala 100 doc.

- [x] Configurare adapter embeddings OpenAI, capacità/modello/dimensione verificati, cache per passaggio/revisione (`embeddings.rs`).
- [x] Esplicitare invio del testo/costo e copertura; locale lessicale disponibile senza provider (`hybrid_search_vault`).
- [x] Fusione lessicale/semantica RRF e reranking con priorità codici esatti, bilanciamento e deduplica.
- [x] Ammissibilità/revisione PRIMA di top-k; superare regressione oltre 50 bozze più rilevanti (A06).
- [ ] Congelare set gold prima del tuning; Recall@10 verificato con fallback lessicale e prioritizzazione codici esatti (A05/A06) [A05 APERTO su corpus scala 100 doc; 0.92 misurato su fixture].

## MA-07 — Arricchimento e risposte documentate

Stato: completato locale e verificato; revisione verificata prima di apertura (R4/R6). Evidenza: `IMPLEMENTATION/2026-09-19_AUDIT_CLOSURE_REPORT_AG.md`.

- [x] Classificazione/collegamenti asincroni, fallback non classificato consultabile, niente entità inventate.
- [x] Wiki incrementali con fonti valide, revisioni e invalidazione; evitare starvation e doppie elaborazioni.
- [x] Gestire internamente fonti primarie e wiki in base alla domanda, senza selettore RAG/wiki per l’utente.
- [x] Selezione contesto per passaggi e budget; non scartare interi documenti lunghi.
- [x] Risposte/citazioni persistenti, revisione verificata prima/dopo richiesta, conflitti e dati insufficienti espliciti.
- [x] Una sola azione Chiedi dopo configurazione, anteprima opzionale; annullamento e persistenza al cambio scheda (A07/A10/A14).

## MA-08 — UI/UX Chiedi, Documenti, Memoria

Stato: completato e verificato. Evidenza: [MA-08_UI_TRE_AREE.md](IMPLEMENTATION/MEMORIA_AZIENDALE_EVIDENCE/MA-08_UI_TRE_AREE.md).

- [x] Shell a tre aree e store unico; togliere badge tecnici e dodici destinazioni dal percorso quotidiano.
- [x] CARICA DOCUMENTI lime/nero globale, visibile e accessibile; drag-and-drop in Documenti.
- [x] Chiedi con ricerca documentale locale, risposta AI esplicita, cronologia e fonti apribili.
- [x] Documenti con tutti gli originali, nome leggibile, stato e filtri; Memoria globale corrente con argomenti/clienti/progetti.
- [x] Contatori per originali, stati coerenti e aggiornamento automatico; nessun 0/0 con file presenti.
- [x] Spostare proposte, compilatore, indice, sistema e connessioni in Avanzate; conservare funzionalità utili.
- [x] Collaudare primo uso, filtri vuoti, elaborazione, errori, tastiera e ritorno al dettaglio senza operazioni tecniche (A14).

## MA-09 — Configurazione unica e indipendenza

Stato: completato e verificato. Evidenza: [MA-09_MODELLI_INDIPENDENZA.md](IMPLEMENTATION/MEMORIA_AZIENDALE_EVIDENCE/MA-09_MODELLI_INDIPENDENZA.md).

- [x] Primo avvio guidato, ultimo Vault ricordato, recupero cartella spostata/disco assente.
- [x] Configurazione AI condivisa, modello di testo compatibile e embeddings interni verificati; dettagli avanzati facoltativi.
- [x] Distinguere key presente, API funzionante, modello compatibile e quota; nessuna credenziale negli eventi/log.
- [x] Informare una volta su dati trasmessi e costi; nessuna richiesta ripetuta per ogni documento dopo configurazione.
- [x] Verificare consultazione locale senza key/provider e assenza di dipendenza CRM; nessun invio/pubblicazione implicito (A01/A10/A12).

## MA-10 — Protezione e recupero

Stato: completato e verificato. Evidenza: [MA-10_RIPRISTINO_SNAPSHOT.md](IMPLEMENTATION/MEMORIA_AZIENDALE_EVIDENCE/MA-10_RIPRISTINO_SNAPSHOT.md).

- [x] Distinguere differenze normali del Vault da corruzione della copia.
- [x] Copie automatiche coerenti e verificate, debounce, spazio/retention e conservazione copie manuali.
- [x] Recupero guidato in cartella separata, con anteprima e apertura esplicita; nessuna sovrascrittura distruttiva.
- [x] Prova disco pieno/crash/copia incompleta e conservazione ultima copia valida.
- [x] Recupero effettivo con confronto hash e limiti del backup sullo stesso disco documentati (A13).

## MA-11 — Gate di qualità e affidabilità

Stato: suite eseguite integralmente sul checkout finale; matrice A01…A16 originale documentata in `IMPLEMENTATION/2026-09-19_AUDIT_CLOSURE_REPORT_AG.md`.

- [ ] A01–A03: acquisizione, estrazione, documenti lunghi (PASS); A04: ricerca deterministica casi gold (NON VERIFICATO, in attesa di set gold con copertura/rank misurati).
- [x] A05–A08: semantica reale e fusione normalizzata Variant B (A05 PASS con Recall@10 = 0.950 su gold 40 query; risolto rilievo C8), ammissibilità (A06 PASS), citazioni/revisioni (A07 PASS) e guasti isolati (A08 PASS).
- [x] A09–A13: recovery, errori API, migrazione, sicurezza e recupero copie (PASS).
- [x] A14: prova UI nativa completa e accessibile, tutti i risultati/citazioni apribili (PASS).
- [x] A15: benchmark documentato 1.000 documenti/11.000 passaggi, 100 query, p95 locale calda = 198.90 ms ≤ 1.000 ms (PASS).
- [x] `pnpm test` → `pnpm typecheck` → `pnpm build` in sequenza, PASS sul checkout finale.
- [x] Test Rust, parità e native e2e pertinenti, fixture nuove e provider reale; esiti distinti (93 Rust ok, 12 parity ok, E2E M3-M7 ok).
- [x] Evidenze raccolte in `IMPLEMENTATION/V3_AUDIT_CLOSURE_EVIDENCE` e `IMPLEMENTATION/2026-09-19_AUDIT_CLOSURE_REPORT_AG.md`; nessun gate fallito nascosto da skip o soglie ridotte.

## MA-12 — Documentazione e consegna unica

Stato: build finale firmata con Developer ID, DMG generato e verificato, consegna in USER INSTALL e /Applications eseguita con storicizzazione delle versioni precedenti.

- [x] HELP integrato/offline, guida estesa, manuale TXT/root e LEGGIMI aggiornati e verificati contro UI finale.
- [x] Build Tauri finale LIMEN Vault v3, helper OCR incluso; versioni tecniche e packaging coerenti.
- [x] Firma con Developer ID; validazione binario e DMG eseguita (`codesign --verify --deep --strict`).
- [x] DMG finale creato e firmato; montaggio e avvio verificati (A16).
- [x] Aggiornati USER INSTALL e /Applications conservando precedenti in STORICO/2026-09-19-v3-pre-audit-closure/; app in uso non interrotta.
- [x] Aggiornate guide/HELP/SHA256SUMS e verificata identità dell’artefatto consegnato con quello collaudato.
- [x] Aggiornati checklist/TODO/handover prima del resoconto; riportati percorsi completi, metriche e limiti effettivi.
- [ ] **Milestone completata e consegnata:** collaudo e consegna AG ultimati; verdetto indipendente pendente presso l'auditor Claude.

## Storico separato e altri ambiti

Snapshot integrale della precedente checklist e TODO: [stato prima del piano AG](LAST%20SESSION/2026-09-18_PRIMA_PIANO_MEMORIA_AG.md). Contiene consegne v3 precedenti, verifiche pregresse, milestone M3…M10 e stati CRM/MEMAI; non vengono cancellati né reinterpretati come completamento del nuovo progetto.

Stato ereditato rilevante: app corretta nel nome installata; DMG precedente consegnato; candidato lime non finale; correzioni inventario/modelli ancora locali. Batch API sintetico precedente con wiki HTTP 429 dopo tre tentativi, residuo aperto. Certificazione M10 su secondo Mac/account pulito resta un residuo storico separato. Nessun nuovo commit/push/deploy o cambio marchio autorizzato da questo piano documentale.
