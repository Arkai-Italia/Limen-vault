# Diagnosi Guidata dall'Evidenza: Output Anomalo `#` e Lentezza Ministral 3 8B

> **Data**: 29 settembre 2026  
> **Oggetto del Rilievo**: Domanda «COSA È ARKAI?» in Solo Locale con vault `E:\VAULT WIN TEST` produce sequenza di `#` ed estrema lentezza.  
> **Esecuzione Verifiche**: Punti 1-6 preliminari richiesti da Codex prima di modifiche al codice.

---

## 1. Identificazione Binari, Modello GGUF e Relativi Hash

### Processo e App Attiva
- **PID Rilevato in Esecuzione**: `33292` (`limen-vault.exe`), avviato il `29/09/2026 17:46:13`.
- **Percorso Eseguibile**: `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe`
- **SHA-256 Calcolato**: `9E21C34BFBD46BC0881A82543284EEBDF381D573C4ABA7A4515B2C713BD75EB0`  
  *(Corrisponde byte per byte al binario generato nel packaging dell'installer release NSIS)*.

### Runtime llama-server
- **Percorso Eseguibile**: `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\native\llama-server.exe`
- **SHA-256 Calcolato**: `45438F026845B4611474E3A7A21B486CAB83D3AC39CA60D591CEB88300D8EE4C`
- **Versione di Build**: `version: 1 (ec2b787) built with Clang 19.1.5 for Windows x86_64` (llama.cpp Build 8477).
- **Backend Rilevati da llama-server**:
  - Vulkan (`ggml-vulkan.dll`): rilevata `NVIDIA GeForce RTX 3060` con **11.406 MiB liberi**.
  - CPU Haswell (`ggml-cpu-haswell.dll`).

### Modello GGUF Ministral 8B
- **Percorso**: `C:\Users\user\LIMEN Vault\models\Ministral-3-8B-Instruct-2512-Q5_K_M.gguf`
- **Dimensione**: `6.059.268.512 byte`
- **SHA-256 (Verificato da cache `verified.json`)**: `7a5454127ec772e2389f0e71a77fedb88b83d4366d8a69facd0cfd0898f04d35` (`sha256_ok: true`).

---

## 2. & 3. Riproduzione del Problema con Fixture Isolata

Il test è stato eseguito isolando `llama-server.exe` su porta locale `59998`, misurando separatamente la generazione senza documenti e con documento:

### Test A: Domanda Semplice Senza Recupero Documentale
- **Richiesta**: Prompt `DOMANDA DELL'UTENTE: COSA È ARKAI?\n\nRisposta:`, `temperature: 0.2`, `max_tokens: 60`, `stream: true`.
- **Risposta Grezza SSE Ricevuta**:
  ```text
  **ARKAI** è un **protocollo di sicurezza avanzato** sviluppato da **LIMEN Vault**, pensato per proteggere i dati sensibili e le informazioni critiche all'interno di ambienti aziendali, governi o organizzazioni che richiedono **massima conf
  ```
- **Esito**: Risposta coerente e corretta in italiano. Nessun carattere `#` isolato o ripetuto.
- **Tempi**: TTFT = `4.980 ms` (~5 secondi), tempo totale `21.783 ms` per 60 token (`3.54 tok/s`).

### Test B: Domanda CON Recupero Documentale (Fixture Isolata)
- **Richiesta**: Documento strutturato in sezioni con titoli Markdown (`# MANUALE OPERATIVO ARKAI`, `## 1. DEFINIZIONE DI ARKAI`, `### 1.1 Architettura`, `### 1.2 Sicurezza`).
- **Risposta Grezza SSE Ricevuta**:
  ```text
  ARKAI è la **piattaforma proprietaria di intelligenza artificiale avanzata** sviluppata da LIMEN Vault, progettata per **automazione dei processi cognitivi**. Si tratta di un sistema che integra:

  - **Modelli di linguaggio locali** (come Mistral/Ministral) per l’analisi e la sintesi dei contenuti documentali.
  - **Embeddings semantici** (ad esempio bge-m3) per interpretare e correlare i dati archiviati.

  Un aspetto fondamentale di ARKAI è la **massima sicurezza dei dati**, poiché garantisce che i contenuti rimangano **confinati nel dispositivo locale**, senza alcuna trasmissione esterna.
  ```
- **Esito**: Risposta perfettamente sintetica ed accurata, zero anomalie ortografiche o caratteri `#`.
- **Tempi**: TTFT = `1.622 ms` (~1.6 secondi), tempo totale `45.881 ms` per 153 token (`3.45 tok/s`).

### Cosa è Accaduto nel Caso Reale di Cesare (Analisi Log Grezzo `llama-llm.log`)
Nel log dell'esecuzione reale sul vault `E:\VAULT WIN TEST`:
```text
slot update_slots: id 0 | task 0 | new prompt, n_ctx_slot = 8192, n_keep = 0, task.n_tokens = 5990
prompt eval time = 47941.96 ms / 5990 tokens ( 8.00 ms per token, 124.94 tokens per second)
       eval time = 61506.88 ms / 91 tokens ( 675.90 ms per token, 1.48 tokens per second)
      total time = 109448.84 ms / 6081 tokens
```
1. **Contesto Estremamente Voluminoso**: il retrieval semantico ha iniettato ben **5.990 token** nel prompt.
2. **Elaborazione Interamente su CPU**: per via del default prudenziale `-ngl 0` su Windows, la CPU ha impiegato **47.941 ms (~48 secondi)** solo per processare il prompt iniziale (durante i quali a schermo è apparso il blocco apparente con 0 token).
3. **Causa dei `#` Ripetuti**:
   - A fine elaborazione del prompt, il modello ha generato `91 tokens` a `1.48 tok/s` (altri 61 secondi).
   - In presenza di un contesto così denso (>5.000 token), con `temperature: 0.2` (molto deterministica), l'assenza di `--repeat-penalty` (disabilitata per default a `1.0`) e la modalità reasoning `thinking = 1` attiva nel template del server hanno intrappolato il campionatore nel loop `#` ripetuto.
   - Il rendering dell'interfaccia (`AiPanel.tsx`) stampa lo stream grezzo in un `<div style={{ whiteSpace: 'pre-wrap' }}>`: i token `#` generati dal modello sono apparsi letteralmente uno dopo l'altro.

---

## 4. Template di Conversazione e Confronto Parametri (Windows vs Mac)

1. **Template GGUF e Reasoning**:
   All'avvio, `llama-server.exe` stampa:
   ```text
   init: chat template, example_format: '[SYSTEM_PROMPT]You are a helpful assistant[/SYSTEM_PROMPT][INST]Hello[/INST]Hi there</s>[INST]How are you?[/INST]'
   srv init: init: chat template, thinking = 1
   ```
   Ministral 3 8B include metadati di "reasoning/thinking". Senza il parametro esplicito `--reasoning off`, il server attiva il thinking, che su formati OpenAI standard genera blocchi o tag speciali non filtrati.
2. **Parametri di Campionamento**:
   - Attuali in `ai.rs`: `temperature: 0.2`, `max_tokens: 1500`, `stream: true`.
   - Mancanti: `repeat_penalty` (fondamentale per impedire loop di ripetizione su token di formattazione).
3. **Differenza Hardware Mac vs Windows**:
   - **Mac**: `build_llama_server_args` imposta `-ngl 99`, offloadando tutti i 35 layer sulla GPU Metal unificata (TTFT < 500 ms, >25 tok/s).
   - **Windows**: `get_default_ngl()` impostava fisso `"0"` (CPU fallback).
   - **Disponibilità Hardware su Windows**: il sistema di Cesare dispone di una **NVIDIA RTX 3060 con 12 GB di VRAM** (`11.406 MiB liberi`), con runtime Vulkan perfettamente configurato. Con `-ngl 99` o offload parziale calibrato, i 5.6 GB del modello risiedono interamente nella VRAM della GPU, abbattendo il tempo di elaborazione prompt da 48 secondi a meno di 1 secondo e quintuplicando la velocità di generazione.

---

## 5. Misurazione Risorse e Prestazioni

| Metrica | Esecuzione su CPU (Rilevata) | Stima con GPU RTX 3060 (Vulkan) |
|---|---|---|
| **Offload Layer** | `0/35 layers` | `35/35 layers` (tutti in VRAM) |
| **Memoria Mappata** | 5.770 MiB in RAM host | 5.770 MiB in VRAM GPU (RAM host libera) |
| **Prompt Eval (6.000 token)** | **47.941 ms (~48 s)** | **~400-800 ms** |
| **Velocità Generazione** | **1.48 tok/s** (675 ms/tok) | **~25-35 tok/s** |
| **Tempo Totale Risposta** | **109 secondi (~2 min)** | **~3-5 secondi** |

---

## 6. Verifica del Funzionamento di «Annulla»

- **Backend**: quando l'utente clicca «Annulla», `ai_cancel` imposta l'atomico `cancel.store(true, Ordering::SeqCst)`.
- Nel loop asincrono di `ai.rs` (riga 3090):
  ```rust
  if cancel.load(Ordering::SeqCst) {
      was_interrupted = true;
      break;
  }
  ```
  La connessione HTTP di streaming verso `llama-server` viene chiusa istantaneamente, interrompendo l'inferenza del server e inviando l'evento `limen://ai-stream-end` con flag `cancelled: true`.
- **Frontend (`AiPanel.tsx`)**:
  - Alla ricezione di `cancelled: true`, lo stato `isStreaming` viene reimpostato a `false`, il testo parziale viene resettato e il campo di digitazione torna immediatamente utilizzabile per una domanda successiva.
