# Domande Frequenti (FAQ) — LIMEN Vault v7Mini (0.7.0)

Il presente documento raccoglie le risposte ufficiali e verificate sul codice ai quesiti più frequenti relativi all'utilizzo e all'architettura di LIMEN Vault v7Mini.

---

## 1. Architettura, Privacy e Modalità Operative

### D: I miei documenti o i miei prompt vengono trasmessi a server esterni?
**R:** No, purché sia attiva la modalità predefinita **100% Locale**. In tale configurazione, l'estrazione dei testi, la frammentazione semantica, il calcolo dei vettori di embedding (`bge-m3`) e la generazione della risposta (`llama-server`) avvengono esclusivamente sulla memoria e sulla CPU/GPU locale del dispositivo. Nessun dato o telemetria viene inviato all'esterno.

### D: Posso utilizzare LIMEN Vault senza connessione a internet?
**R:** Sì. Una volta scaricato il file del modello linguistico (file GGUF nella cartella dei modelli) o avendolo precaricato, LIMEN Vault opera in isolamento completo, anche in modalità aereo o con l'interfaccia di rete disattivata.

### D: Quando è utile la modalità Ibrida?
**R:** La modalità Ibrida è un'opzione facoltativa per utenti che desiderano interrogare modelli cloud (OpenAI GPT-4o) inserendo una propria chiave API personale. In questa modalità, il prompt e gli estratti contestuali pertinenti vengono trasmessi ai server di OpenAI per generare la risposta.

---

## 2. Gestione Documenti e Formati

### D: Quali formati di file posso caricare nel Vault?
**R:** LIMEN Vault supporta l'ingestione dei seguenti formati:
- **Documenti:** PDF (`.pdf`), Microsoft Word (`.docx`), Microsoft PowerPoint (`.pptx`), OpenDocument Text (`.odt`).
- **Fogli di Calcolo:** Microsoft Excel (`.xlsx`, `.xls`), OpenDocument Spreadsheet (`.ods`), file delimitati (`.csv`, `.tsv`).
- **Testo e Note:** Testo semplice (`.txt`), Markdown (`.md`), dati strutturati (`.json`), log di sistema (`.log`), report web (`.html`).
- **Immagini con Testo (solo macOS):** `.png`, `.jpg`, `.jpeg`, `.webp`, elaborate tramite il motore di riconoscimento ottico Apple Vision.

### D: Esistono limiti di dimensione per i file caricati?
**R:** Sì. Il limite massimo supportato per singolo file è di **32 MB**. Durante l'elaborazione, il motore applica un troncamento di sicurezza a **16 MB** di testo estratto per prevenire picchi anomali di consumo memoria.

### D: Come vengono gestiti i file PDF scansionati o composti da sole immagini?
**R:** Su **macOS**, il framework nativo Apple Vision analizza automaticamente le immagini e le pagine scansionate estraendo il testo presente. Su **Windows**, il modulo Vision non è disponibile: i documenti PDF privi di testo vettoriale selezionabile devono essere pre-trattati con un software OCR prima dell'ingestione.

### D: Cosa indica il badge verde "Integrità SHA-256 Verificata" nel Lettore Documenti?
**R:** Indica che LIMEN Vault ha ricalcolato l'impronta crittografica del file fisicamente presente sul disco e ha verificato che coincide esattamente con l'hash registrato al momento del caricamento. Questo conferma che il file non ha subito alterazioni esterne, sovrascritture accidentali o danneggiamenti dei dati.

---

## 3. Modelli LLM, Memoria e Prestazioni

### D: Quale modello locale conviene scegliere in base all'hardware?
**R:** 
- Su macchine con **8 GB di RAM / Memoria unificata**: selezionare **Ministral 3B Instruct** (file GGUF da 2.47 GB). È ottimizzato per operare fluidamente senza causare swap su disco.
- Su macchine con **16 GB di RAM**: è possibile utilizzare **Ministral 8B** (6.06 GB), **Qwen 2.5 7B** (4.68 GB), **Llama 3.1 8B** (4.92 GB) o **DeepSeek-R1 Distill 7B** (4.68 GB, che visualizza anche la traccia di ragionamento logico).
- Modelli da **14B** (come DeepSeek-R1 Distill 14B, file da 8.99 GB): richiedono almeno **20-24 GB di RAM libera** per evitare blocchi del sistema.

### D: Perché l'attivazione di un nuovo modello richiede alcuni secondi?
**R:** Il motore locale `llama-server` gestisce un modello alla volta. All'attivazione di un nuovo modello, il sistema arresta l'istanza precedente, libera la memoria occupata e carica in RAM i pesi del nuovo file GGUF, attendendo la risposta di stato positivo prima di consentire nuove interrogazioni.

---

## 4. Integrazione con Obsidian e Struttura Cartelle

### D: Qual è la struttura delle cartelle del Vault?
**R:** Il Vault gestito da LIMEN Vault è una directory di sistema standard organizzata nelle cartelle:
- `01_CLIENTS` ... `10_APPROVED_OUTPUTS`: le 10 categorie standard del Vault per le note e la memoria permanente.
- `20_RAW_SOURCES`: cartella in cui vengono archiviati i documenti originali caricati dall'utente.
- `90_PROPOSALS`: cartella dedicata alle bozze e alle note proposte generate dall'assistente o dal compilatore prima della revisione formale.
- `.limen`: directory di sistema contenente database, indici vettoriali e registri di audit.

### D: A cosa serve il pulsante "Apri in Obsidian"?
**R:** Situato nella barra laterale sinistra dell'applicazione, il pulsante richiama lo schema URL di sistema `obsidian://open?path=...`. Questo apre direttamente la cartella del Vault nell'applicazione Obsidian, consentendo all'utente di navigare le note, creare collegamenti bidirezionali e utilizzare i canvas grafici.
