# Guida alla Risoluzione dei Problemi (Troubleshooting) — LIMEN Vault v7Mini

La presente guida illustra le procedure di diagnosi e risoluzione per tutte le condizioni di errore e gli avvisi catalogati in `02_UI_REFERENCE/VALIDATION_AND_ERROR_MESSAGES.csv`, basati sul comportamento verificato della release 0.7.0.

---

## Indice Rapido degli Errori

- [ERR-001: Motore Locale llama-server Non Raggiungibile](#err-001-motore-locale-llama-server-non-raggiungibile)
- [ERR-002: Formato File Non Supportato o Superamento Limite Dimensionale](#err-002-formato-file-non-supportato-o-superamento-limite-dimensionale)
- [ERR-003: Chiave API OpenAI Non Valida o Mancante](#err-003-chiave-api-openai-non-valida-o-mancante)
- [ERR-004: Obsidian Non Rilevato nel Sistema Operativo](#err-004-obsidian-non-rilevato-nel-sistema-operativo)
- [ERR-005: Memoria RAM Insufficiente per il Modello Selezionato](#err-005-memoria-ram-insufficiente-per-il-modello-selezionato)
- [ERR-006: Percorso Vault Non Valido o Permessi Negati](#err-006-percorso-vault-non-valido-o-permessi-negati)
- [ERR-007: Checksum SHA-256 Non Corrispondente al Download del Modello](#err-007-checksum-sha-256-non-corrispondente-al-download-del-modello)
- [ERR-008: Errore di Connessione al Bucket S3/R2](#err-008-errore-di-connessione-al-bucket-s3r2)
- [ERR-009: Allarme Manomissione o Discrepanza Hash SHA-256 su File Locale](#err-009-allarme-manomissione-o-discrepanza-hash-sha-256-su-file-locale)

---

### ERR-001: Motore Locale llama-server Non Raggiungibile
- **Sintomo Visivo:** Messaggio "Impossibile connettersi al motore locale (127.0.0.1:8080)" nella vista Chiedi al Vault.
- **Causa Primaria:** Il processo in background `llama-server` non è attivo, è andato in timeout all'avvio o la porta 8080 è occupata da un altro processo di sistema.
- **Procedura di Risoluzione:**
  1. Accedere ad `Avanzate > Modelli LLM & llama.cpp` (`SCR-008`).
  2. Verificare che il modello prescelto risulti scaricato su disco (file `.gguf` con spunta verde).
  3. Fare clic su **"Attiva Modello"**. Il backend avvia l'eseguibile `llama-server` e attende la risposta `200 OK` dall'endpoint `/health`.
  4. Se l'errore persiste, verificare in `Avanzate > Diagnostica` se la porta 8080 è occupata da un altro servizio e riavviare l'applicazione.

---

### ERR-002: Formato File Non Supportato o Superamento Limite Dimensionale
- **Sintomo Visivo:** Durante il caricamento nell'UploadDrawer, il file è contrassegnato con un'icona rossa di avviso o viene rifiutato.
- **Causa Primaria:** Il file presenta un'estensione non ammessa (es. archivi `.zip`, eseguibili binari `.exe`), supera la dimensione massima consentita di **32 MB**, oppure il file PDF è corrotto o protetto da crittografia a password.
- **Procedura di Risoluzione:**
  1. Verificare che il file rientri nei formati ammessi dal motore di ingestione:
     - Documenti: `.pdf`, `.docx`, `.pptx`, `.odt`
     - Tabelle e dati: `.xlsx`, `.xls`, `.ods`, `.csv`, `.tsv`
     - Testo e note: `.txt`, `.md`, `.json`, `.log`, `.html`
     - Immagini con testo (solo macOS): `.png`, `.jpg`, `.jpeg`, `.webp`
  2. Verificare che la dimensione del file non superi 32 MB. Per documenti voluminosi, suddividere il file in sezioni minori prima del caricamento.
  3. Per file PDF protetti da password, rimuovere la protezione tramite visualizzatore PDF prima dell'ingestione.

---

### ERR-003: Chiave API OpenAI Non Valida o Mancante
- **Sintomo Visivo:** Notifica toast rossa con messaggio "Errore di autenticazione API OpenAI (HTTP 401 Unauthorized)".
- **Causa Primaria:** La chiave API inserita nella modalità Ibrida è errata, contiene spazi spuri o è stata revocata su platform.openai.com.
- **Procedura di Risoluzione:**
  1. Accedere ad `Avanzate > Configurazione`.
  2. Inserire una chiave API valida (`sk-...`).
  3. Per evitare l'uso di chiavi cloud e lavorare a zero-rete, commutare la modalità su **"100% Locale"** disattivando le chiamate verso OpenAI.

---

### ERR-004: Obsidian Non Rilevato nel Sistema Operativo
- **Sintomo Visivo:** Cliccando su "Apri in Obsidian" nella sidebar compare il messaggio "Protocollo obsidian:// non registrato".
- **Causa Primaria:** L'applicazione desktop Obsidian non è installata nel sistema oppure il protocollo handler `obsidian://` non risulta associato a livello OS.
- **Procedura di Risoluzione:**
  1. Scaricare e installare l'applicazione desktop Obsidian da `https://obsidian.md`.
  2. Avviare Obsidian almeno una volta per consentire la registrazione dello schema URL `obsidian://` nel sistema operativo.
  3. In alternativa, accedere alla cartella del Vault direttamente tramite Finder (macOS) o Esplora File (Windows).

---

### ERR-005: Memoria RAM Insufficiente per il Modello Selezionato
- **Sintomo Visivo:** Avviso di allocazione memoria all'attivazione del modello o generazione estremamente lenta.
- **Causa Primaria:** Si tenta di caricare un modello che eccede la dotazione fisica di memoria del computer (es. modello da 14B su un sistema con 8 o 16 GB di RAM).
- **Procedura di Risoluzione:**
  1. Chiudere altre applicazioni ad alto consumo di memoria prima di avviare l'inferenza.
  2. Selezionare un modello GGUF adeguato alla RAM disponibile:
     - 8 GB RAM -> **Ministral 3B Instruct** (2.47 GB GGUF, leggero e fluido)
     - 16 GB RAM -> **Ministral 8B** (6.06 GB), **Qwen 2.5 7B** (4.68 GB) o **DeepSeek-R1 Distill 7B** (4.68 GB)
     - 24 GB o superiore -> **DeepSeek-R1 Distill 14B** (8.99 GB)

---

### ERR-006: Percorso Vault Non Valido o Permessi Negati
- **Sintomo Visivo:** Nel Setup Wizard o nella schermata impostazioni appare l'errore "Impossibile scrivere nella directory specificata".
- **Causa Primaria:** La cartella selezionata è protetta da permessi di sola lettura, risiede in percorsi di sistema riservati (`/System` o `C:\Windows`), o si trova su un'unità esterna non raggiungibile.
- **Procedura di Risoluzione:**
  1. Selezionare una cartella all'interno della directory utente standard (es. `/Users/nome/Documents/LIMEN_Vault` o `C:\Users\nome\Documents\LIMEN_Vault`).
  2. Verificare che l'utente corrente disponga dei diritti di lettura e scrittura sulla cartella.

---

### ERR-007: Checksum SHA-256 Non Corrispondente al Download del Modello
- **Sintomo Visivo:** Notifica "Download non riuscito: l'impronta crittografica del modello non coincide".
- **Causa Primaria:** La connessione internet si è interrotta durante il download da Hugging Face, producendo un file parziale o corrotto.
- **Procedura di Risoluzione:**
  1. Il sistema cancella automaticamente il file temporaneo non conforme.
  2. Verificare la stabilità della connessione di rete e avviare nuovamente il download da `Avanzate > Modelli LLM & llama.cpp`.

---

### ERR-008: Errore di Connessione al Bucket S3/R2
- **Sintomo Visivo:** Errore "Impossibile stabilire la connessione con l'endpoint di storage remoto".
- **Causa Primaria:** Endpoint URL errato, nome del bucket non esistente o credenziali IAM (Access Key / Secret Key) errate o prive dei permessi necessari.
- **Procedura di Risoluzione:**
  1. Verificare l'URL dell'endpoint (es. formato Cloudflare R2: `https://<account-id>.r2.cloudflarestorage.com`).
  2. Verificare che il bucket esista e che la policy IAM includa i permessi `s3:PutObject`, `s3:GetObject` e `s3:ListBucket`.

---

### ERR-009: Allarme Manomissione o Discrepanza Hash SHA-256 su File Locale
- **Sintomo Visivo:** Nel Lettore Documenti appare il badge rosso di allarme "Discrepanza Hash: l'impronta attuale differisce da quella registrata all'ingestione".
- **Causa Primaria:** Il file fisico in `20_RAW_SOURCES/` è stato modificato, sovrascritto o corrotto da un editor esterno o da un processo di sistema.
- **Procedura di Risoluzione:**
  1. Se la modifica esterna è intenzionale e voluta, utilizzare la funzione **"Rigenera Indice"** nella vista Documenti per aggiornare l'hash memorizzato e riallineare i chunk semantici.
  2. Se la modifica è accidentale o non autorizzata, ripristinare il file dallo snapshot di backup certificato tramite `Avanzate > Snapshot e Ripristino` (`WF-007`). I file recuperati verranno estratti in una directory separata protetta `{vault}_RECUPERO_{snapshot_id}` per consentire il confronto prima del riallineamento manuale.
