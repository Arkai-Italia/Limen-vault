# Limiti Noti e Confini Operativi — LIMEN Vault v7Mini (0.7.0)

Il presente documento descrive in modo rigoroso e trasparente i confini tecnologici, i requisiti di sistema invalicabili e le esclusioni funzionali di LIMEN Vault nella versione 0.7.0.

---

## 1. Vincoli di Memoria RAM e Selezione Modelli

L'esecuzione locale di modelli linguistici quantizzati su architettura GGUF dipende direttamente dalla quantità di memoria fisica (RAM/VRAM unificata) disponibile sul computer. L'applicazione non consente di superare le soglie di sicurezza hardware:

| Modello LLM | Dimensione File GGUF | RAM Minima Richiesta | RAM Consigliata | Comportamento se la RAM è Insufficiente |
| :--- | :--- | :--- | :--- | :--- |
| **Ministral 3B Instruct** | ~2.4 GB | 8 GB | 8 GB | Pienamente fluido su qualsiasi configurazione |
| **Ministral 8B Instruct** | ~5.5 GB | 12 GB | 16 GB | Rallentamenti moderati su 8 GB per swap disco |
| **Qwen 2.5 7B Instruct** | ~4.9 GB | 12 GB | 16 GB | Prestazioni ottimali da 16 GB in su |
| **Llama 3.1 8B Instruct** | ~5.4 GB | 12 GB | 16 GB | Elevata precisione, sconsigliato su 8 GB |
| **DeepSeek-R1 Distill 7B**| ~4.9 GB | 12 GB | 16 GB | Generazione fluida del reasoning trace su 16 GB |
| **DeepSeek-R1 Distill 14B**| ~9.2 GB | 20 GB | 24 - 32 GB | **ERRORE OOM o Blocco Sistema** se eseguito su 8/16 GB |

> [!WARNING]
> Non tentare di avviare il modello da 14B su computer dotati di soli 8 o 16 GB di RAM. Il sistema operativo tenterà di allocare memoria virtuale su SSD, causando un blocco temporaneo dell'interfaccia e tempi di generazione inaccettabili (>60 secondi per token).

---

## 2. Modello di Esecuzione Singolo (Single-Model Concurrency)

- Il motore locale `llama-server` esegue **un solo modello linguistico alla volta**.
- Quando l'utente seleziona "Attiva Modello" su una nuova scheda in `Avanzate > Modelli LLM`, il sistema arresta la precedente istanza e libera la RAM prima di caricare il nuovo file GGUF.
- Non è possibile interrogare contemporaneamente due modelli locali diversi da due finestre separate.

---

## 3. Formati Documentali Ammessi ed Esclusioni

### Formati Supportati al 100%:
- **PDF (.pdf):** Documenti con testo nativo selezionabile (fino a 50 MB per file consigliati).
- **Markdown (.md):** File di testo con sintassi Markdown standard Obsidian.
- **Testo (.txt):** Documenti in codifica UTF-8.

### Formati Non Supportati Direttamente (Esclusioni):
- **Documenti Microsoft Office (.docx, .xlsx, .pptx):** Devono essere convertiti in PDF o esportati in Markdown prima del caricamento.
- **PDF Scansionati (Sole Immagini):** LIMEN Vault v7Mini non include un modulo OCR a bordo. I documenti privi di traccia testo risulteranno vuoti (0 caratteri estratti).
- **Archivi Compressi (.zip, .tar.gz):** Non possono essere trascinati direttamente nell'UploadDrawer; i file devono essere preventivamente decompressi.

---

## 4. Confini Architetturali e di Piattaforma

1. **Assenza di Autenticazione Cloud o Multi-Tenant:**
   - LIMEN Vault non richiede registrazione, account utente o login con email/password. La sicurezza dell'accesso coincide con la sicurezza dell'account del sistema operativo (macOS FileVault o Windows BitLocker).
2. **Nessun Modulo di Billing o Pagamenti In-App:**
   - L'applicazione desktop standalone non contiene acquisti in-app, abbonamenti o funzionalità con licenza a consumo.
3. **Piattaforme Mobile Non Incluse:**
   - La release 0.7.0 è destinata esclusivamente a computer desktop macOS (Apple Silicon e Intel) e Microsoft Windows (x64). Le versioni iOS e Android sono sviluppate separatamente e non fanno parte di questo pacchetto documentale.
4. **Sincronizzazione Cloud S3 Non Proprietaria:**
   - La funzione di sincronizzazione remota richiede che l'utente o l'azienda dispongano già di un proprio bucket e credenziali S3/R2. LIMEN Vault non fornisce hosting cloud gestito.
