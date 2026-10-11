# Glossario dei Termini di Interfaccia — LIMEN Vault v7Mini

- **Vault:** La cartella locale del computer che ospita le note Markdown, i file originali e i manifesti di sistema. Corrisponde a un Vault compatibile al 100% con Obsidian.
- **RAG (Retrieval-Augmented Generation):** Tecnica con cui l'intelligenza artificiale, prima di rispondere a una domanda, interroga l'archivio locale per estrarre i soli passaggi rilevanti, fornendo risposte motivate da prove documentali verificate.
- **Passaggio (Passage / Chunk):** Porzione di testo estratta da un documento originale (lunghezza controllata di 500-1000 caratteri) indicizzata con un vettore semantico a 1024 dimensioni e memorizzata con riferimento esatto di riga e pagina.
- **Modello Embedding (bge-m3):** Modello matematico eseguito localmente che converte testi in coordinate semantiche per consentire la ricerca per significato anziché per sola parola esatta.
- **Modello Generativo Locale (.gguf):** File di intelligenza artificiale eseguibile sul processore o GPU del computer senza inviare nulla in rete (es. Ministral, Qwen, Llama, DeepSeek).
- **Catena di Ragionamento (`<think>` CoT):** Processo logico sequenziale generato dai modelli DeepSeek-R1, racchiuso in un blocco dedicato visualizzabile a discrezione dell'utente.
- **Frontmatter YAML:** Intestazione testuale standard all'inizio di ogni file Markdown (racchiusa tra due linee `---`) contenente metadati strutturati come tag, data, categoria e autore.
- **Snapshot Crittografico:** Archivio compresso `.tar.gz` dell'intero Vault accompagnato da un manifesto `manifest.json` che elenca l'impronta crittografica SHA-256 di ogni singolo file.
