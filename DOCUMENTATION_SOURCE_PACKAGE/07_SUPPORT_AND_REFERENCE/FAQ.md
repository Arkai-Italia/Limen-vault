# Domande Frequenti (FAQ) — LIMEN Vault v7Mini (0.7.0)

Il presente documento raccoglie le risposte ufficiali ai quesiti più frequenti posti dagli utenti, amministratori e auditor di LIMEN Vault v7Mini.

---

## 1. Architettura, Privacy e Modalità Rete

### D: I miei documenti vengono inviati su server cloud?
**R:** No. In modalità predefinita **100% Locale (Zero-Network)**, nessun byte di testo o metadato lascia il computer. L'estrazione del testo, la frammentazione (chunking), il calcolo dei vettori semantici (`bge-m3`) e la generazione linguistica (`llama-server`) avvengono esclusivamente sulla CPU, GPU o memoria unificata del dispositivo locale.

### D: Posso utilizzare LIMEN Vault senza connessione a internet?
**R:** Sì, assolutamente. Dopo aver scaricato una tantum il modello linguistico desiderato (o avendolo precaricato nella cartella `models/`), l'applicazione opera in isolamento totale anche con il Wi-Fi disattivato o in modalità aereo.

### D: Che cos'è la "Modalità Ibrida"?
**R:** È una modalità facoltativa attivabile nel Setup Wizard o nelle Impostazioni Avanzate. Consente di utilizzare un motore cloud avanzato (es. OpenAI GPT-4o) inserendo la propria chiave API personale (`OPENAI_API_KEY`). È utile per chi gestisce volumi enormi di documenti pubblici o richiede la massima velocità analitica, mantenendo comunque l'opzione di passare al motore locale per documenti riservati.

---

## 2. Gestione Documenti e Formati

### D: Quali formati di file posso caricare nel Vault?
**R:** LIMEN Vault v7Mini supporta nativamente:
- **PDF (.pdf):** Documenti con testo selezionabile (contratti, relazioni, dispense).
- **Markdown (.md):** File di testo formattato con intestazioni H1-H6, elenchi, grassetti e tabelle.
- **Testo Puro (.txt):** Trascrizioni, log e minute di riunione grezze.

### D: Perché un file PDF caricato non produce risultati nella ricerca semantica?
**R:** Se il PDF è costituito esclusivamente da scansioni fotografiche o immagini senza traccia vettoriale di testo (assenza di OCR), il motore di estrazione rileva 0 caratteri. È necessario convertire il file tramite un software di riconoscimento ottico dei caratteri (OCR) prima di immetterlo nel Vault.

### D: Cosa significa il badge verde "Integrità SHA-256 Verificata" nel Lettore Documenti?
**R:** Significa che all'apertura del visualizzatore, LIMEN Vault ha ricalcolato l'impronta crittografica del file presente sul disco fisso e ha verificato che corrisponde al 100% all'impronta calcolata al momento del caricamento. È la garanzia probatoria che il file non è stato manomesso esternamente.

---

## 3. Modelli LLM e Hardware

### D: Come scelgo tra Ministral 3B, Qwen 7B e DeepSeek-R1 7B?
**R:** 
- Scegli **Ministral 3B** se il tuo computer ha 8 GB di RAM: è ultra-veloce e leggerissimo.
- Scegli **Qwen 2.5 7B** o **Llama 3.1 8B** se hai 16 GB di RAM e desideri un'elevata precisione stilistica e linguistica.
- Scegli **DeepSeek-R1 Distill 7B** se necessiti di verificare il filo logico di deduzione (Reasoning Trace) per risolvere quesiti complessi o perizie.

### D: Posso utilizzare DeepSeek-R1 14B sul mio MacBook Air da 8 GB?
**R:** No. DeepSeek-R1 14B richiede circa 9.2 GB di memoria solo per caricare i pesi, oltre allo spazio per il sistema operativo. Su una macchina da 8 GB causerebbe un blocco per memoria esaurita (Out-Of-Memory) o un degrado drastico della velocità a causa dello swap su disco.

---

## 4. Integrazione con Obsidian

### D: Come funziona l'integrazione con Obsidian?
**R:** Il Vault di LIMEN Vault è una normale cartella di sistema organizzata secondo lo standard `00_INBOX`, `10_KNOWLEDGE`, `20_RAW_SOURCES`. Facendo clic sul pulsante **"Apri in Obsidian"** nell'header globale, LIMEN invia il comando di sistema `obsidian://open?path=...` che apre istantaneamente il vault dentro Obsidian, permettendoti di continuare a scrivere note, creare collegamenti wiki e canvas grafici.
