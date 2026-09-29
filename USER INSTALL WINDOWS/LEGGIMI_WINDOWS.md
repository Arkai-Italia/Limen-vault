# LIMEN Vault v6Mini — Istruzioni per Windows 11 x64

> **Versione**: 0.6.0 (`dev.arkai.limenvault`)  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Data di Rilascio**: 29 settembre 2026  
> **File Installer**: `LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`  
> **Checksum SHA-256**: `2e851af9f55d9f2e30a56cf956ddf17c24da417657afaa93d0bb144494b42092`  
> **File Checksum**: `SHA256SUMS.txt`

---

## 1. Requisiti di Sistema Effettivi

* **Sistema Operativo**: Windows 11 a 64 bit (o Windows 10 a 64 bit build 1809 o successiva).
* **WebView2 Runtime**: Microsoft Edge WebView2 Runtime preinstallato (incluso nativamente in Windows 11; versione minima verificata `153.0.4234.48`).
* **Memoria RAM**:
  - **Minima**: 8 GB RAM (attiva il profilo prudenziale per modelli compatti a 3B parametri).
  - **Consigliata**: 16 GB RAM o superiore (consente l'allocazione e l'inferenza con modelli 8B).
* **Spazio su Disco**:
  - Circa 200 MB per l'applicazione e le librerie native x64;
  - Da 2.5 GB a 5 GB di spazio aggiuntivo qualora si scelga di scaricare ed eseguire modelli linguistici locali GGUF (es. Ministral).
* **Hardware Video / Inferenza**:
  - Modalità predefinita sicura al 100%: esecuzione su **CPU locale** con set di istruzioni ottimizzate AVX/AVX2;
  - Accelerazione GPU Vulkan supportata tramite `ggml-vulkan.dll`; offload regolabile tramite variabile `LIMEN_GPU_NGL`.

---

## 2. Istruzioni di Installazione

1. **Download ed Esecuzione**:
   - Individuare il file di installazione `LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`.
   - Verificare facoltativamente l'integrità del file tramite PowerShell:
     ```powershell
     Get-FileHash .\LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe -Algorithm SHA256
     ```
     L'hash deve corrispondere esattamente a:
     `2e851af9f55d9f2e30a56cf956ddf17c24da417657afaa93d0bb144494b42092`.
2. **Procedura di Setup (NSIS per-utente)**:
   - Fare doppio clic sull'eseguibile di setup.
   - L'installazione opera in modalità `currentUser` (senza richiedere elevazione dei privilegi UAC di amministratore) e si posiziona in:
     `%LOCALAPPDATA%\Programs\dev.arkai.limenvault`
3. **Schermata Microsoft Defender SmartScreen**:
   - Poiché il pacchetto è fornito senza certificato commerciale di firma codice Windows (`NotSigned`), SmartScreen potrebbe mostrare l'avviso informativo *"PC protetto da Windows"*.
   - Per proseguire, fare clic su **"Ulteriori informazioni"** e quindi selezionare **"Esegui comunque"**.

---

## 3. Primo Avvio e Configurazione

* **Avvio**: Lanciare l'applicazione dalla nuova voce creata nel **Menu Start** (*LIMEN Vault v6Mini*) o dalla scorciatoia Desktop.
* **Creazione o Apertura Vault**:
  - Selezionare una cartella sul proprio disco fisso da utilizzare come Vault (o aprirne una esistente).
  - L'applicazione inizializzerà in automatico la sottocartella `.limen/` contenente catalogo, indici e metadati.
* **Isolamento dei Dati**:
  - I documenti originali e i file del Vault rimangono interamente sotto il controllo dell'utente nella cartella prescelta;
  - Nessuna informazione o credenziale viene salvata in chiaro nei file del Vault (le credenziali di sistema sono protette tramite il **Windows Credential Manager** nativo).

---

## 4. Modalità Solo Locale e Motori di Inferenza

* **Motori Inclusi**:
  - Server di inferenza x64 nativo (`llama-server.exe` Build 8477);
  - Motore di ricerca semantica locale (`bge-m3`);
  - Motore per risposte generative locali (*Ministral*).
* **Porte Dinamiche Loopback**:
  - I due servizi locali si avviano automaticamente su porte loopback dinamiche (interfaccia `127.0.0.1`) senza collisioni;
  - L'avvio avviene interamente in background senza alcuna finestra di terminale o prompt dei comandi visibile (`CREATE_NO_WINDOW`).
* **Garanzia di Riservatezza (Zero Egress)**:
  - Durante l'utilizzo della modalità *Solo Locale*, non viene inviato alcun pacchetto o dato all'esterno della macchina;
  - Nessuna connessione verso OpenAI, server cloud o API esterne.

---

## 5. Aggiornamento e Disinstallazione

* **Aggiornamento**:
  - L'installazione di una nuova versione sovrascrive i soli binari applicativi; tutti i Vault, le note, gli indici e i modelli scaricati rimangono inalterati e perfettamente accessibili.
* **Disinstallazione**:
  - Aprire *Impostazioni di Windows $\rightarrow$ App $\rightarrow$ App installate*;
  - Cercare `LIMEN Vault v6Mini` e selezionare *Disinstalla*;
  - L'uninstaller rimuoverà i binari dell'applicazione e le registrazioni di sistema in `%LOCALAPPDATA%`, lasciando intatti i documenti e i Vault creati dall'utente.

---

## 6. Limiti e Note Tecniche Accertate

1. **Stato della Firma Digitale**:
   - L'installer corrente non è firmato digitalmente con certificato Authenticode Microsoft (`NotSigned`), come documentato nei criteri di rilascio.
2. **Pipeline OCR e Formati Documentali**:
   - La lettura e l'estrazione parziale con conservazione del testo sono certificate per file TXT, Markdown, DOCX, PPTX, XLSX e PDF (vettoriali, scansionati e misti);
   - Le immagini e scansioni sono elaborate tramite OCR locale offline (specifica Tesseract 5 + PDFium);
   - Il supporto per formati Office legacy (`.doc`, `.rtf`) rimane aperto e pendente decisione formale di Cesare.
3. **Download dei Modelli GGUF**:
   - I modelli pesanti GGUF non sono inclusi nell'installer per preservare la leggerezza del pacchetto (~19 MB) e devono essere scaricati tramite l'apposita funzione dell'applicazione.
