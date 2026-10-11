# WF-006 — Governance e Approvazione Bozze AI (90_PROPOSALS)

### SCENARIO / A CHI SERVE
Serve al Knowledge Manager o all'operatore del Vault per revisionare formalmente le note provvisorie generate dall'assistente AI (salvate in `90_PROPOSALS/`) prima di promuoverle a memoria definitiva dell'organizzazione, evitando allucinazioni o dati imprecisi nell'archivio ufficiale.

### OBIETTIVO
Esaminare una bozza di proposta, approvarla con assegnazione a una categoria da 01 a 10, correggerla direttamente oppure rifiutarla con motivazione.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Clic su **"⚙️ Avanzate"** $\rightarrow$ Sottomenu Superiore $\rightarrow$ Clic su **"Bozze e Proposte"**.

### PRIMA DI INIZIARE
Avere almeno una proposta generata dalla chat (con casella *"Genera bozza"* attiva) o importata in `90_PROPOSALS/`.

### COME FARE
1. Cliccare su **"Avanzate"** e selezionare la scheda **"Bozze e Proposte"**.
2. Nella colonna sinistra, selezionare la proposta da revisionare dall'elenco (stato contrassegnato con badge giallo *"In attesa"*).
3. Nel riquadro centrale, leggere il testo proposto, i tag suggeriti e la provenienza delle fonti.
4. **Opzione A — Approva:**
   - Selezionare dal menu a tendina la categoria di destinazione (es. `04_PROJECTS`);
   - Cliccare sul pulsante verde **"Approva"**;
   - La nota viene automaticamente spostata nella cartella definitiva, il Frontmatter viene normalizzato con lo stato `status: approved` e scompare dalla coda di revisione.
5. **Opzione B — Modifica prima dell'approvazione:**
   - Cliccare sul pulsante **"Modifica"**;
   - Modificare il testo o i metadati nell'editor integrato;
   - Cliccare su **"Salva modifiche"** e procedere all'approvazione.
6. **Opzione C — Rifiuta:**
   - Cliccare su **"Rifiuta"** e confermare; la proposta viene archiviata con stato `status: rejected` senza inquinare la memoria attiva.

### RISULTATO ATTESO
La proposta esaminata viene rimossa dalla lista di attesa e integrata in modo permanente nella cartella ufficiale prescelta del Vault.

### CONTROLLO FINALE
Andare nella schermata **Memoria**, selezionare la categoria di destinazione e verificare che la nuova nota sia presente e contrassegnata con badge `YAML Valido`.

### ERRORI E RECUPERO
- **Errore "Categoria non selezionata":** Si è cliccato su Approva senza indicare dove archiviare la nota.  
  *Recupero:* Scegliere una cartella dal selettore (es. `01_CLIENTS`) e cliccare nuovamente su Approva.

### PASSO SUCCESSIVO
Ritorno alla schermata di lavoro ordinaria.

### ATTENZIONE
L'approvazione è un atto di governance formale che rende il contenuto ricercabile e citabile nei futuri turni RAG del Vault.

### EVIDENZE
`EVD-008` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-006`.

### SCREENSHOT
`SHOT-006`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-006-approvazione-bozze.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
