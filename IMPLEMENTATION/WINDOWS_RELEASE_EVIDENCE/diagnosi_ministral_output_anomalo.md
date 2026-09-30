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

## 6. Prestazioni da Misurare (Stime Non Verificate Sperimentalmente)

Le seguenti metriche relative all'uso della GPU e al confronto con Mac rappresentano **ipotesi prestazionali da misurare sperimentalmente**, non dati acquisiti:

| Parametro | CPU (Misurato) | GPU Vulkan RTX 3060 (Da Misurare) | Mac Metal (Da Misurare) |
|---|---|---|---|
| **Offload Layer Effettivo** | `0/35` | Da verificare con test reale | Da verificare su hardware Mac |
| **VRAM / Memoria Impegnata** | 5.770 MiB RAM host | Da quantificare con bge-m3 attivo | Da quantificare con bge-m3 attivo |
| **Tempo Elaborazione Prompt (~6k token)** | `47.941 ms` | Da cronometrare sperimentalmente | Da cronometrare sperimentalmente |
| **Velocità di Generazione** | `1.48 tok/s` | Da misurare sperimentalmente | Da misurare sperimentalmente |

---

## 7. Stato di «Annulla»

- **Verifica Eseguita**: l'interruzione è stata **verificata mediante lettura statica del codice sorgente** (`ai_cancel` imposta `cancel.store(true)`, il loop di `ai.rs` interrompe lo stream alla riga 3090 e invia `cancelled: true` a `AiPanel.tsx`).
- **Limite Dichiarato**: l'interruzione reale durante lo streaming e la capacità di sottomettere una nuova domanda senza blocchi residui **NON sono ancora state dimostrate mediante prova applicativa reale**.
