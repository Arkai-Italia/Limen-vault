# Panoramica del Prodotto — LIMEN Vault v7Mini

## 1. Che cos'è LIMEN Vault v7Mini
**LIMEN Vault v7Mini** è un'applicazione desktop *local-first* standalone per macOS e Windows concepita per la gestione, l'indicizzazione semantica, la consultazione e la salvaguardia sovrana della memoria aziendale e professionale.

L'applicazione consente a professionisti, studi legali, consulenti e organizzazioni di:
1. **Conservare la piena sovranità dei dati**: note e documenti rimangono esclusivamente salvati su disco in cartelle standard Markdown compatibili con Obsidian.
2. **Effettuare ricerca semantica vettoriale 100% locale**: grazie al modello embedding multilingue `BAAI/bge-m3` e a un motore di ricerca ibrido (BM25 lessicale + vettoriale con Reciprocal Rank Fusion) eseguito sul computer tramite `llama-server`.
3. **Conversare con la propria conoscenza in due modalità**:
   - **Modalità 100% Solo Locale (Rete Zero)**: generazione di risposte tramite inferenza su GPU Metal / CPU con uno dei 6 modelli open-source del catalogo (Ministral 3B/8B, Qwen 2.5 7B, Meta Llama 3.1 8B, DeepSeek-R1 7B/14B). Zero byte escono dal dispositivo.
   - **Modalità Ibrida OpenAI**: invio mirato dei soli passaggi estratti al modello OpenAI (`gpt-4o`, `gpt-4o-mini`), protetto da consenso esplicito e memorizzazione sicura della chiave nel Portachiavi di sistema.
4. **Acquisire documenti aziendali multiformato**: importazione e chunking automatico di file PDF, DOCX, XLSX, PPTX e TXT in `20_RAW_SOURCES/` con verifica crittografica SHA-256 e visualizzazione con lettore integrato.
5. **Governare il ciclo di vita della conoscenza**: gestione di bozze e proposte generate dall'AI in `90_PROPOSALS/` (approvazione/modifica/rifiuto), compilazione manuale da testo grezzo e creazione di snapshot crittografici per backup e ripristino sicuro.
6. **Supporto Bilingue Nativo**: interfaccia immediatamente commutabile a caldo tra Italiano e Inglese (`IT | EN`), con rilevamento automatico della lingua di sistema al primo avvio.

---

## 2. Principi Guida Architetturali
- **Local-First & Rete Zero**: la conoscenza aziendale non deve risiedere su cloud di terzi per essere interrogabile.
- **Integrità Crittografica**: ogni file originale, snapshot e frammento è tracciato con impronta SHA-256.
- **Interfaccia Dark-Glass Premium**: design minimal, privo di ridondanze, basato su ardesia scura `#0f172a` e accenti verde lime `#c8ff00` / `#77f117`.
- **Nessuna Scatola Chiusa**: piena compatibilità con Obsidian ed editor di testo standard.
