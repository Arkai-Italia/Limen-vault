# Limiti Noti e Confini Operativi — LIMEN Vault v7Mini (0.7.0)

Il presente documento descrive in modo rigoroso e verificato i confini tecnologici, i requisiti di sistema hardware/software e le esclusioni funzionali di LIMEN Vault v7Mini (release 0.7.0, commit `677745c`).

---

## 1. Vincoli Hardware, Piattaforme OS e Selezione Modelli

L'esecuzione locale di modelli linguistici quantizzati su architettura GGUF (`llama-server`) e dell'estrattore di embedding (`bge-m3`) dipende direttamente dalla memoria fisica (RAM o memoria unificata Apple Silicon) e dal sottosistema di calcolo del computer.

### 1.1 Requisiti di Sistema Operativo
- **macOS:** macOS 13.0 (Ventura) o superiore (raccomandato macOS 14.0+ Sonoma). Supporto nativo per architetture Apple Silicon (M1/M2/M3/M4) con accelerazione GPU Metal e Intel x86_64.
- **Windows:** Windows 10 a 64-bit (build 19041+) o Windows 11 a 64-bit. Supporto per set di istruzioni CPU AVX2.

### 1.2 Matrice Modelli LLM, Download e Requisiti RAM
La seguente tabella distingue rigorosamente la dimensione di download/disco del file GGUF, la memoria RAM minima di sistema per consentire l'esecuzione e la RAM raccomandata per garantire fluidità operativa:

| Modello LLM | Formato & Quantizzazione | Dimensione File GGUF (Download/Disco) | RAM Minima Sistema | RAM Consigliata | Comportamento se la RAM è Insufficiente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ministral 3B Instruct** | GGUF Q5_K_M | **2.47 GB** | 8 GB | 8 GB | Esecuzione fluida e reattiva anche su macchine entry-level |
| **Ministral 8B Instruct** | GGUF Q5_K_M | **6.06 GB** | 12 GB | 16 GB | Rallentamenti moderati su macchine da 8 GB per swap su disco |
| **Qwen 2.5 7B Instruct** | GGUF Q4_K_M | **4.68 GB** | 12 GB | 16 GB | Prestazioni ottimali e stabili da 16 GB in su |
| **Llama 3.1 8B Instruct** | GGUF Q4_K_M | **4.92 GB** | 12 GB | 16 GB | Elevata qualità sintattica, sconsigliato su configurazioni a 8 GB |
| **DeepSeek-R1 Distill Qwen 7B**| GGUF Q4_K_M | **4.68 GB** | 12 GB | 16 GB | Generazione fluida della traccia di ragionamento (`<think>`) su 16 GB |
| **DeepSeek-R1 Distill Qwen 14B**| GGUF Q4_K_M | **8.99 GB** | 20 GB | 24 - 32 GB | **Rischio blocco per Out-Of-Memory** o swap intensivo su 8/16 GB |

> [!WARNING]
> L'allocazione di modelli da 14B su sistemi dotati di soli 8 o 16 GB di RAM provoca un intenso ricorso alla memoria virtuale su disco SSD (swap), con conseguente rallentamento del sistema operativo e tempi di risposta degradati. Si raccomanda di utilizzare Ministral 3B su sistemi con 8 GB di RAM.

---

## 2. Modello di Concorrenza dell'Inferenza Locale (Single-Model)

- L'istanza locale di `llama-server` gestisce **un singolo modello linguistico alla volta**.
- Quando l'utente attiva un modello differente dalla schermata `Avanzate > Modelli LLM & llama.cpp`, il backend arresta il processo precedente e rilascia la memoria RAM prima di inizializzare il nuovo file GGUF.
- Non è supportata l'inferenza simultanea o concorrente di due modelli locali distinti da sessioni parallele.

---

## 3. Formati Documentali Supportati e Limiti Dimensionali

LIMEN Vault implementa un motore di ingestione multi-formato (`crates/ingestion/`) con regole di parsing dedicate:

### Formati Supportati:
- **Documenti PDF (.pdf):** Documenti con testo nativo selezionabile; su macOS è integrato il riconoscimento ottico tramite framework Apple Vision per documenti scansionati.
- **Documenti Microsoft Office & OpenDocument:** `.docx` (Microsoft Word), `.pptx` (Microsoft PowerPoint), `.odt` (OpenDocument Text).
- **Fogli di Calcolo e Dati Tabellari:** `.xlsx`, `.xls` (Microsoft Excel), `.ods` (OpenDocument Spreadsheet), `.csv` (Comma-Separated Values), `.tsv` (Tab-Separated Values).
- **Testo e Codice Sorgente:** `.txt` (Plain text UTF-8), `.md` (Markdown Obsidian), `.json` (strutture dati JSON), `.log` (file di log), `.html` (pagine web e report testuali).
- **Immagini con Testo (Esclusivo macOS):** `.png`, `.jpg`, `.jpeg`, `.webp` elaborate tramite modulo nativo OCR Apple Vision (`vision_ocr.rs`).

### Limiti Dimensionali e di Elaborazione:
- **Dimensione Massima per Singolo File:** 32 MB per singolo file in ingresso.
- **Troncamento Testo di Sicurezza:** L'estrattore applica un limite di sicurezza di 16 MB sul testo grezzo estratto da un singolo file per prevenire saturazioni della memoria.
- **Frammentazione Semantica (Chunking):** Il testo viene segmentato in blocchi semantici di circa 512 token (~1.500 caratteri) con sovrapposizione contestuale di 50-100 token prima del calcolo dei vettori `bge-m3`.

### Esclusioni Esplicite:
- **File Binari e Non Testuali:** File eseguibili (`.exe`, `.dll`, `.dmg`), archivi compressi (`.zip`, `.tar.gz`, `.7z` non preventivamente estratti dall'utente), flussi audio/video multimediali.
- **PDF Cifrati:** Documenti PDF protetti da password o cifratura DRM proprietaria (la protezione deve essere rimossa prima dell'importazione).
- **Scansioni Immagine su Windows:** Su piattaforma Windows, i PDF privi di testo vettoriale selezionabile richiedono un pre-trattamento con OCR esterno, poiché il modulo Apple Vision è disponibile unicamente su macOS.

---

## 4. Confini Architetturali e di Sicurezza

1. **Local-First Predefinito e Privacy dei Dati:**
   - In modalità "100% Locale", l'elaborazione dei documenti, la vettorizzazione e l'inferenza avvengono interamente sul dispositivo senza connessioni verso server esterni.
   - La modalità Ibrida opzionale invia prompt ed estratti testuali verso le API di OpenAI unicamente se l'utente configura esplicitamente una chiave API personale.
2. **Nessun Sistema di Autenticazione Utente Multi-Tenant:**
   - LIMEN Vault è un'applicazione desktop monoutente. L'isolamento e la protezione dei dati poggiano sui meccanismi di autenticazione del sistema operativo host (es. FileVault su macOS o BitLocker su Windows).
3. **Storage Remoto S3 (BYOB - Bring Your Own Bucket):**
   - La sincronizzazione crittografata remota non include server o storage forniti da LIMEN. L'utente o l'organizzazione deve configurare il proprio bucket compatibile S3 o Cloudflare R2 inserendo le relative credenziali.
4. **Verifica di Integrità SHA-256:**
   - Il calcolo dell'hash SHA-256 certifica che il contenuto del file su disco non ha subito alterazioni o corruzioni rispetto al momento dell'ingestione; tale controllo non costituisce una certificazione legale o probatoria notarile di terze parti.
