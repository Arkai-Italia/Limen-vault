# WF-002 — Conversazione Aumentata nel Vault (Chat RAG e Fonti)

### SCENARIO / A CHI SERVE
Serve all'utente che deve interrogare l'archivio aziendale, ottenere sintesi basate sui documenti interni ed estrarre informazioni certificate con collegamenti alle fonti originali.

### OBIETTIVO
Ricevere una risposta formulata in streaming basata sui passaggi documentali indicizzati nel Vault, visualizzando il modello attivo e le fonti utilizzate.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Clic su **"✦ Chiedi"** (o **"✦ Ask"**).

### PRIMA DI INIZIARE
- Vault caricato con almeno alcuni documenti o note Markdown indicizzate.
- Servizio locale attivo (`bge-m3` pronto).

### COME FARE
1. Cliccare sulla voce **"Chiedi"** nella barra laterale sinistra.
2. Verificare lo stato del toggle in alto a destra nella chat:
   - Se attivo **"SOLO LOCALE (Mac)"** (verde lime), la risposta sarà generata al 100% offline dal modello locale attivo.
   - Se disattivato, la richiesta utilizzerà l'API OpenAI in modalità ibrida.
3. Selezionare l'opzione opzionale **"Genera bozza"** se si desidera salvare la risposta come nota provvisoria in `90_PROPOSALS/`.
4. Digitare la domanda nella casella in basso (es. *"Quali sono gli obiettivi concordati nel progetto?"*) e premere **Invio** o cliccare sull'icona Freccia.
5. Osservare la composizione in streaming del testo.
6. A fine risposta, notare il pulsante **"N fonti citate"** in calce alla risposta dell'assistente.

### SE L'INTERFACCIA UTILIZZA UN MODELLO DEEPSEEK-R1
Se il modello attivo è *DeepSeek-R1-Distill-Qwen*, in cima alla risposta compare un riquadro collassabile **"Catena di Ragionamento (`<think>`)"**. Cliccare sul riquadro per espandere e leggere il processo logico svolto dal modello prima della risposta finale.

### RISULTATO ATTESO
Comparsa della bolla utente (verde) seguita dalla risposta assistente (sfondo scuro/testo chiaro) con citazioni formattate e pulsante interattivo delle fonti.

### CONTROLLO FINALE
Cliccare su **"N fonti citate"**: si apre il cassetto laterale destro con l'elenco dei passaggi e i titoli dei documenti originali.

### ERRORI E RECUPERO
- **Errore "Servizio semantico locale non attivo":** Il motore `llama-server` è spento.  
  *Recupero:* Andare in *Avanzate $\rightarrow$ Collegamenti AI* e cliccare su *Avvia Servizio Locale*.
- **Errore "Nessun passaggio pertinente trovato":** La domanda usa termini troppo generici o assenti nei documenti.  
  *Recupero:* Riformulare la domanda con parole chiave presenti nei file o verificare in *Documenti* che i file siano stati estratti.

### PASSO SUCCESSIVO
Passare a **WF-003** per ispezionare il testo originale tramite il lettore integrato.

### ATTENZIONE
Nella modalità 100% Solo Locale la velocità di generazione dipende dal chip hardware (da ~15 a 45 token/secondo su Apple Silicon).

### EVIDENZE
`EVD-003`, `EVD-004` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-003`, `SCR-014`.

### SCREENSHOT
`SHOT-003`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-002-chiedi-al-vault.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
