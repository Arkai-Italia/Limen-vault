# RELAZIONE TECNICA DI AUDIT E CONFORMITÀ DI RILASCIO

**Prodotto**: LIMEN Vault v6Mini  
**Versione**: `v0.6.0` (`dev.arkai.limenvault`)  
**Piattaforma Target**: Microsoft Windows 10/11 x64  
**Data Collaudo**: 01 Ottobre 2026  
**Identificativo Sessione E2E (Run ID)**: `phase6_collaudo_e2e_run_20261001_134134`  
**Stato Accettazione**: **ACCETTAZIONE FORMALMENTE APERTA; PROVE APPLICATIVE COMPLETATE**  

> [!IMPORTANT]
> **RETTIFICA METODOLOGICA VINCOLANTE**  
> Il superamento tecnico dei test automatizzati e il risultato positivo degli script di collaudo **non costituiscono accettazione ufficiale e non sostituiscono l’audit indipendente né l’accettazione finale di Cesare**.  
> L’accettazione di rilascio rimane formalmente aperta in attesa del riscontro finale di audit.

---

## 1. Tracciabilità Esatta del Codice e Integrità Crittografica della Build

Tutti i test e i collaudi sono stati eseguiti sul codice sorgente esattamente tracciato, includendo la patch integrale delle modifiche uncommitted e il pacchetto installer standalone rigenerato in data odierna:

| Componente | Percorso File / Identificatore | SHA-256 Checksum | Dimensione (Byte) |
| :--- | :--- | :--- | :--- |
| **Commit Git Repository (HEAD)** | `E:\Projects\vault_memai_obsi` | `193363c18ec8de9d81de1a73a640bc5bd0175ca9` | N/A |
| **Patch Modifiche Uncommitted** | `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/uncommitted_changes.patch` | `300e59dec821365488494c6e4b717eb4c1774ef353864ff663426da0fa6b4033` | 133.678 |
| **Pacchetto Setup NSIS Distribuibile** | `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe` | `07520a52970b6307fb4bf4f65811aa66f777950912c4803fefa89eb9f48f46c8` | 63.068.980 |
| **Eseguibile Applicativo Desktop** | `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe` | *Compilato 2026-10-01 13:39:00* | 23.714.816 |
| **Runtime Server LLM Locale** | `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\native\llama-server.exe` | `45438f026845b4611474e3a7a21b486cab83d3ac39ca60d591ceb88300d8ee4c` | 8.177.392 |
| **Modello Vettoriale Embeddings** | `C:\Users\user\LIMEN Vault\models\bge-m3-Q8_0.gguf` | *Verificato conforme (Q8_0)* | 634.553.760 |
| **Modello Generativo Locale** | `C:\Users\user\LIMEN Vault\models\Ministral-3-8B-Instruct-2512-Q5_K_M.gguf` | *Verificato conforme (Q5_K_M)* | 6.059.268.512 |

---

## 2. Risoluzione dei Rilievi di Concorrenza e Isolamento Diagnostico

### 2.1 Correzione del `finally` e Gestione Richieste Concorrenti in `AiPanel.tsx` e Backend Rust
- **Problema Rilevato**: Nelle sessioni asincrone, la terminazione o l'errore di una richiesta precedente poteva azzerare le variabili di stato (`isRunningRef`, `loadingStep`, `isStreaming`) o rimuovere i listener Tauri (`unlistenChunkRef`, `unlistenEndRef`) associati a una nuova richiesta avviata immediatamente dopo. Inoltre, nel backend Rust (`AiState::begin`), una richiesta precedente annullata ma non ancora terminata nel loop di streaming manteneva occupata la mappa `active`, bloccando con errore l'invio immediato della richiesta successiva.
- **Risoluzione Applicata**:
  1. In `AiPanel.tsx`, introdotta la guardia di sequenza `if (currentSeq === seq.current)` nel blocco `finally` di `executeAsk`. Se subentra una nuova richiesta (`seq.current` incrementato), la richiesta precedente conclude il suo ciclo senza alterare lo stato né staccare i canali della nuova richiesta.
  2. In `handleCancelActiveRequest`, il reset dell'interfaccia (`setIsStreaming(false)`, `setLoadingStep(null)`, `isRunningRef.current = false`) è stato reso sincrono e immediato, sbloccando la UI istantaneamente.
  3. In `apps/desktop/src-tauri/src/ai.rs`, metodo `AiState::begin`, aggiunta la pulizia preventiva delle richieste annullate: `active.retain(|_, entry| !entry.cancel.load(Ordering::SeqCst))`. Questo consente alla nuova richiesta di acquisire la guardia immediatamente senza attendere la chiusura asincrona del socket HTTP della richiesta annullata.

### 2.2 Isolamento e Limitazione dell'Aggancio Diagnostico `__limenAsk`
- **Classificazione**: `window.__limenAsk` è stato riclassificato formalmente come strumento diagnostico di test per ambienti di sviluppo/debug.
- **Rimozione nelle Build Distribuite**: L'esposizione di `window.__limenAsk` in `AiPanel.tsx` è stata vincolata a:
  ```ts
  if (typeof window !== 'undefined' && ((import.meta as any).env?.DEV || (window as any).__TAURI_DEBUG__))
  ```
  Nelle build di produzione e release distribuite all'utente, l'oggetto non viene mai registrato nel namespace globale `window`.
- **Esecuzione Test Reale**: Tutti i test della suite (incluso lo Scenario 8 da 20 domande) sono stati eseguiti **esclusivamente interagendo con i componenti reali del DOM** (popolamento della textarea tramite setter nativo `HTMLTextAreaElement.prototype.value` e click sul pulsante "Chiedi" effettivo).

---

## 3. Esiti delle Prove Applicative Richieste

### 3.1 Prova 1: Interruzione Effettiva sul Server e Nuova Domanda Immediata
- **Protocollo**:
  1. Invio Richiesta A: dissertazione enciclopedica su crittografia (oltre 3000 parole previste).
  2. Attesa emissione primi token in streaming attivo (>30 caratteri ricevuti a video).
  3. Clic su *"Annulla domanda"* e sottomissione **immediata** a $t=63\text{ ms}$ di Richiesta B: *"Dimmi in sole tre parole cosa è ARKAI."* tramite textarea e pulsante reali.
- **Risultato Misurato**:
  - Interruzione tempestiva del flusso di generazione e chiusura socket client-server.
  - Nessuna attesa della conclusione dei token di A (se A non fosse stata interrotta sul server, avrebbe continuato per oltre 100 secondi).
  - Richiesta B completata ed erogata in **7.7 secondi** con risposta pulita: *"Memoria aumentata"*.
  - Assenza totale di residui o frammenti di testo della Richiesta A.
  - Esito: **PASS** (file evidenza: [`evidence_server_interruption_immediate_ask.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/evidence_server_interruption_immediate_ask.json)).

### 3.2 Prova 2: Fallback Automatico dell'App dopo Errore GPU
- **Protocollo**:
  1. Simulazione di errore critico o mancata allocazione Vulkan GPU all'avvio del server (`-ngl 99` fallito).
  2. Verifica dell'attivazione del ripiego automatico gestito dal ciclo di vita nativo in `llama_llm.rs`.
- **Risultato Misurato**:
  - Il lifecycle ha intercettato l'errore GPU, ha registrato l'evento in `llama-llm.log` con la dicitura:  
    `[FALLBACK] Avvio GPU (-ngl 99) non riuscito... Esecuzione del ripiego controllato su CPU (-ngl 0)...`
  - Il processo CPU con `-ngl 0` è stato avviato e confermato operativo (`/health` OK) a $t=5\text{ secondi}$.
  - Risposta generativa erogata con successo ("Sì.").
  - Esito: **PASS** (file evidenza: [`evidence_automatic_gpu_fallback.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/evidence_automatic_gpu_fallback.json)).

### 3.3 Prova 3: Sessione Estesa di 20 Domande Consecutive (Scenario 8)
- **Protocollo e Regola di Classificazione**:
  - Tutte le 20 domande sono state sottomesse una dopo l'altra pilotando **esclusivamente la textarea reale e il pulsante "Chiedi" effettivo**.
  - **Regola vincolante sui timeout**: Qualsiasi turno interrotto per timeout con testo parziale è programmato per risultare rigorosamente come `INCOMPLETE` (e non può essere conteggiato come successo).
- **Risultato Misurato**:
  - **20 domande su 20 completate con successo** (`SUCCESS`, 0 `INCOMPLETE`, 0 `FAILED`).
  - Zero timeout riscontrati (tutti i turni conclusi tra 1.0s e 14.1s).
  - Zero caratteri anomali `#` e nessun loop generativo rilevato.
  - Differenziazione Q12 vs Q13 pienamente convalidata (`Q12_Q13_Identical: false`, testi con contenuti semantici completamente distinti: 723 caratteri per Obsidian Markdown plain-text vs 350 caratteri per le cartelle del Vault).
  - Esito: **PASS** (file evidenza: [`phase6_collaudo_e2e_run_20261001_134134/evidence_scenario_8_multi_questions_20.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20261001_134134/evidence_scenario_8_multi_questions_20.json)).

---

## 4. Matrice Completa dei Risultati E2E (Run `phase6_collaudo_e2e_run_20261001_134134`)

| Scenario | Descrizione Tecnica | Meccanismo di Verifica | Riscontro Applicativo | Esito |
| :---: | :--- | :--- | :--- | :---: |
| **S1** | Auto-Indicizzazione Vault | Apertura UI vault non indicizzato | Indice `SEARCH_INDEX.json` creato; UI "Indice: Pronto" | **PASS** |
| **S2** | Riapertura senza Rebuild | Riapertura stesso vault via UI | `mtime` invariato, ricerca operativa immediatamente | **PASS** |
| **S3** | Sincronizzazione Variazioni | Aggiunta, Modifica, Rimozione note | Rilevate tramite normale tasto "Aggiorna" in topbar | **PASS** |
| **S4** | Isolamento e Concorrenza Vault | Switch vault durante operazione | Architettura Single-Vault attiva; zero contaminazioni | **PASS** |
| **S5** | Domanda Fatti ARKAI (GPU) | 4 fatti sintetici estratti da note | Fatti estratti in 10.1s, 0 cancelletti `#`, 0 loop | **PASS** |
| **S6** | Annullamento & Interruzione Server | Stop pre/active-stream + follow-up | Reset UI ~105-109ms; risposta follow-up pulita a 7.7s | **PASS** |
| **S7** | Fallback Automatico GPU->CPU | Ripiego controllato e resilienza | Log `[FALLBACK]`, server CPU pronto a 5s, risposta erogata | **PASS** |
| **S8** | 20 Domande Consecutive (Real UI) | Textarea e pulsante reali nel DOM | 20/20 turni riusciti (0 timeout, Q12 e Q13 distinte) | **PASS** |

---

## 5. Conclusioni per l'Auditor Indipendente

1. **Integrità del Codice**: Tutte le modifiche applicate rispetto all'ultimo commit (`193363c`) sono tracciate integralmente nella patch `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/uncommitted_changes.patch` con hash SHA-256 verificabile.
2. **Accettazione Aperta**: Si conferma formalmente che le presenti evidenze tecniche documentano la conformità applicativa degli scenari eseguiti, ma **l'accettazione finale resta aperta e demandata alla revisione indipendente e all'approvazione finale di Cesare**.
