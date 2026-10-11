# Guida alla Risoluzione dei Problemi (Troubleshooting) — LIMEN Vault v7Mini

La presente guida illustra le procedure di diagnosi e risoluzione per tutte le condizioni di errore e gli avvisi catalogati in `02_UI_REFERENCE/VALIDATION_AND_ERROR_MESSAGES.csv`.

---

## Indice Rapido degli Errori

- [ERR-001: Motore Locale llama-server Non Raggiungibile](#err-001-motore-locale-llama-server-non-raggiungibile)
- [ERR-002: Formato File Non Supportato o Corrotto](#err-002-formato-file-non-supportato-o-corrotto)
- [ERR-003: Chiave API OpenAI Non Valida o Mancante](#err-003-chiave-api-openai-non-valida-o-mancante)
- [ERR-004: Obsidian Non Rilevato nel Sistema Operativo](#err-004-obsidian-non-rilevato-nel-sistema-operativo)
- [ERR-005: Memoria RAM Insufficiente per il Modello Selezionato](#err-005-memoria-ram-insufficiente-per-il-modello-selezionato)
- [ERR-006: Percorso Vault Non Valido o Permessi Negati](#err-006-percorso-vault-non-valido-o-permessi-negati)
- [ERR-007: Checksum SHA-256 Non Corrispondente al Download](#err-007-checksum-sha-256-non-corrispondente-al-download)
- [ERR-008: Errore di Connessione al Bucket S3/R2](#err-008-errore-di-connessione-al-bucket-s3r2)
- [ERR-009: Allarme Manomissione Integrità SHA-256 su File Locale](#err-009-allarme-manomissione-integrità-sha-256-su-file-locale)

---

### ERR-001: Motore Locale llama-server Non Raggiungibile
- **Sintomo Visivo:** Messaggio "Impossibile connettersi al motore locale (127.0.0.1:8080)" nella vista Chat.
- **Causa Primaria:** Il processo in background `llama-server` è stato terminato accidentalmente, è andato in timeout all'avvio o la porta 8080 è occupata da un altro servizio di sistema.
- **Procedura di Risoluzione:**
  1. Accedere ad `Avanzate > Modelli LLM & llama.cpp` (`SCR-008`).
  2. Verificare che il modello desiderato sia scaricato (presenza del file `.gguf` con spunta verde).
  3. Fare clic su **"Attiva Modello"**. Il backend avvia una nuova istanza di `llama-server` e attende la risposta `200 OK` dall'endpoint `/health`.
  4. Se l'errore persiste, verificare in `Avanzate > Diagnostica` se la porta 8080 è occupata e riavviare l'applicazione.

---

### ERR-002: Formato File Non Supportato o Corrotto
- **Sintomo Visivo:** Durante il caricamento nell'UploadDrawer, il file è contrassegnato con un'icona rossa di avviso.
- **Causa Primaria:** Il file ha un'estensione non ammessa (es. `.docx`, `.xlsx`, `.zip`) oppure il file PDF è protetto da cifratura a password o danneggiato.
- **Procedura di Risoluzione:**
  1. Caricare unicamente file nei formati standard: `.pdf`, `.md`, `.txt`.
  2. Per documenti Word (.docx) o fogli di calcolo, esportarli preventivamente in formato PDF con testo selezionabile o testo Markdown.
  3. Rimuovere eventuali password di apertura dai file PDF prima dell'ingestione.

---

### ERR-003: Chiave API OpenAI Non Valida o Mancante
- **Sintomo Visivo:** Toast rosso con messaggio "Errore di autenticazione API OpenAI (HTTP 401 Unauthorized)".
- **Causa Primaria:** La chiave inserita contiene errori di battitura, spazi all'inizio/fine, o è stata revocata sulla dashboard di OpenAI.
- **Procedura di Risoluzione:**
  1. Accedere ad `Avanzate > Configurazione`.
  2. Rimuovere la chiave memorizzata e incollare una nuova chiave valida generata su `platform.openai.com`.
  3. Se si desidera lavorare a zero-rete senza chiavi cloud, commutare la modalità su **"100% Locale"**.

---

### ERR-004: Obsidian Non Rilevato nel Sistema Operativo
- **Sintomo Visivo:** Cliccando su "Apri in Obsidian" compare il messaggio "Protocollo obsidian:// non registrato".
- **Causa Primaria:** L'applicazione desktop Obsidian non è installata oppure l'URI handler non è stato registrato nel registro di sistema / Launch Services.
- **Procedura di Risoluzione:**
  1. Scaricare e installare l'app ufficiale Obsidian da `https://obsidian.md`.
  2. Avviare Obsidian almeno una volta per consentire la registrazione dello schema URL `obsidian://`.
  3. In alternativa, aprire la cartella Vault manualmente tramite Finder (macOS) o Esplora Risorse (Windows).

---

### ERR-005: Memoria RAM Insufficiente per il Modello Selezionato
- **Sintomo Visivo:** Avviso "Memoria RAM inferiore al requisito consigliato" all'attivazione del modello.
- **Causa Primaria:** Si tenta di eseguire un modello pesante (es. DeepSeek-R1 14B) su una macchina con soli 8 o 16 GB di RAM.
- **Procedura di Risoluzione:**
  1. Chiudere le applicazioni superflue per liberare memoria.
  2. Selezionare un modello proporzionato alla dotazione fisica:
     - 8 GB RAM -> **Ministral 3B Instruct** (~2.4 GB).
     - 16 GB RAM -> **Ministral 8B**, **Qwen 2.5 7B** o **DeepSeek-R1 Distill 7B**.
     - 24+ GB RAM -> **DeepSeek-R1 Distill 14B**.

---

### ERR-006: Percorso Vault Non Valido o Permessi Negati
- **Sintomo Visivo:** Nel Setup Wizard o nelle impostazioni appare "Impossibile scrivere nella directory specificata".
- **Causa Primaria:** L'utente ha selezionato una cartella di sola lettura, un percorso protetto da permessi di amministratore di sistema (es. `/System` o `C:\Windows`) o un'unità rimovibile disconnessa.
- **Procedura di Risoluzione:**
  1. Selezionare una cartella all'interno della propria directory utente (es. `/Users/nome/Documents/LIMEN_Vault` o `C:\Users\nome\Documents\LIMEN_Vault`).
  2. Verificare che l'utente corrente disponga dei permessi di lettura e scrittura.

---

### ERR-007: Checksum SHA-256 Non Corrispondente al Download
- **Sintomo Visivo:** Notifica "Download non riuscito: l'impronta crittografica del modello non coincide".
- **Causa Primaria:** La connessione internet si è interrotta bruscamente durante il download da Hugging Face, producendo un file troncato.
- **Procedura di Risoluzione:**
  1. Il sistema elimina automaticamente il file parziale per motivi di sicurezza.
  2. Verificare la qualità della connessione di rete e fare clic nuovamente su "Scarica Modello".

---

### ERR-008: Errore di Connessione al Bucket S3/R2
- **Sintomo Visivo:** Errore "Impossibile stabilire la connessione con l'endpoint di storage remoto".
- **Causa Primaria:** Endpoint URL errato, nome del bucket inesistente o credenziali Access Key / Secret Key scadute.
- **Procedura di Risoluzione:**
  1. Verificare l'URL dell'endpoint (es. formato corretto per Cloudflare R2: `https://<account-id>.r2.cloudflarestorage.com`).
  2. Assicurarsi che il bucket sia stato creato sulla piattaforma cloud e che la policy IAM conceda permessi `s3:PutObject`, `s3:GetObject` e `s3:ListBucket`.

---

### ERR-009: Allarme Manomissione Integrità SHA-256 su File Locale
- **Sintomo Visivo:** Nel Lettore Documenti appare un **badge rosso** lampeggiante: "Allarme Manomissione: l'hash attuale non coincide con il record originale".
- **Causa Primaria:** Il file fisico memorizzato nella cartella `20_RAW_SOURCES` è stato aperto, modificato o sovrascritto da un'applicazione esterna al di fuori di LIMEN Vault.
- **Procedura di Risoluzione:**
  1. Se la modifica è legittima e voluta, accedere alla vista "Documenti" e selezionare **"Rigenera Indice"** per calcolare la nuova impronta crittografica.
  2. Se la modifica è sospetta o imprevista, ripristinare il file originale da uno snapshot certificato tramite la sezione `Avanzate > Snapshot e Ripristino` (`WF-007`).
