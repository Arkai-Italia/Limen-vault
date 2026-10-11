# WF-008 — Selezione, Download e Attivazione Modelli Generativi Locali (Catalogo 6 LLM)

### SCENARIO / A CHI SERVE
Serve all'utente che vuole personalizzare l'esperienza di intelligenza artificiale offline a rete zero, scegliendo il modello più adatto al proprio hardware o al tipo di attività (modello compatto ad alta velocità vs modello di ragionamento complesso con catena di pensiero CoT).

### OBIETTIVO
Scaricare da Hugging Face con verifica SHA-256 e impostare come attivo uno dei 6 modelli open-source supportati nel server locale `llama-server`.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Clic su **"⚙️ Avanzate"** $\rightarrow$ Sottomenu Superiore $\rightarrow$ Clic su **"Collegamenti AI & MCP"**.

### PRIMA DI INIZIARE
- Connessione a Internet attiva per il download (solo la prima volta per ciascun modello).
- Memoria RAM di sistema adeguata alla dimensione del modello prescelto:

| Modello | Dimensione | RAM Minima | RAM Consigliata | Caratteristiche |
| :--- | :--- | :--- | :--- | :--- |
| **Ministral 3 3B Instruct** | ~2,06 GB | 8 GB | 8–16 GB | Ultracompatto, bassissimo consumo di memoria |
| **Ministral 3 8B Instruct** | ~4,92 GB | 16 GB | 16–24 GB | Bilanciamento eccellente qualità/velocità in italiano |
| **Qwen 2.5 7B Instruct** | ~4,68 GB | 16 GB | 16–24 GB | Elevate capacità analitiche e precisione tecnica |
| **Meta Llama 3.1 8B Instruct**| ~4,92 GB | 16 GB | 16–24 GB | Modello di riferimento mondiale con ampio contesto |
| **DeepSeek-R1-Distill-Qwen-7B**| ~4,68 GB | 16 GB | 16–24 GB | Modello di ragionamento con catena CoT `<think>` |
| **DeepSeek-R1-Distill-Qwen-14B**| ~8,99 GB | 24 GB | 32 GB+ | Massima profondità di analisi logica e sintesi |

### COME FARE
1. Cliccare su **"Avanzate"** e poi su **"Collegamenti AI & MCP"**.
2. Scorrere alla **Sezione 4 — Catalogo Modelli Generativi Locali**.
3. Individuare la scheda del modello desiderato:
   - Se il modello indica **"Non installato"**: cliccare sul pulsante **"SCARICA ORA"**;
   - Monitorare la barra di avanzamento e attendere la verifica finale dell'hash SHA-256;
   - Al termine, lo stato diventa verde con la dicitura **"Installato (Verificato)"**.
4. Cliccare sul pulsante **"Imposta come Attivo"**.
5. Il sistema invia il comando Tauri `local_llm_set_active`, aggiorna la configurazione locale e riavvia automaticamente il processo `llama-server` caricando il nuovo file GGUF nella memoria GPU Metal/RAM.
6. La card del modello mostra ora il badge verde **`ATTIVO`**.

### RISULTATO ATTESO
Il modello selezionato diventa il motore predefinito per tutte le generazioni in modalità *100% Solo Locale*.

### CONTROLLO FINALE
Andare in **Chiedi**, inviare una domanda con il toggle "Solo Locale" attivo e verificare che in cima alla risposta compaia il nome del modello appena selezionato.

### ERRORI E RECUPERO
- **Errore "RAM insufficiente":** Si tenta di attivare un modello da 14B su un Mac con 8 o 16 GB di RAM.  
  *Recupero:* Selezionare un modello da 3B o 7B/8B compatibile con la memoria unificata disponibile.

### EVIDENZE
`EVD-009`, `EVD-010` (`CODE_VERIFIED`, `TEST_VERIFIED`).

### SCHERMATE
`SCR-009`.

### SCREENSHOT
`SHOT-009`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-008-catalogo-modelli-llm.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
