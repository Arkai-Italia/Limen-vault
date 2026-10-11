# WF-005 — Esplorazione e Navigazione delle Note di Memoria (01-10)

### SCENARIO / A CHI SERVE
Serve all'utente che vuole consultare, verificare e sfogliare l'albero delle note della memoria aziendale suddivise nelle 10 cartelle tematiche standard di LIMEN Vault.

### OBIETTIVO
Filtrare le note per categoria, verificare la validità del blocco Frontmatter YAML e visualizzare l'anteprima formattata del testo Markdown.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Clic su **"📚 Memoria"** (o **"📚 Memory"**).

### PRIMA DI INIZIARE
Vault aperto con note presenti nelle cartelle da `01_CLIENTS` a `10_APPROVED_OUTPUTS`.

### COME FARE
1. Cliccare sulla voce **"Memoria"** nella barra laterale sinistra.
2. In alto nella schermata, osservare la barra delle pillole orizzontali corrispondenti alle 10 categorie aziendali standard di LIMEN Vault:
   - `01_CLIENTS` (Schede e profili clienti)
   - `02_PROJECTS` (Documenti e avanzamento progetti)
   - `03_BRANDS` (Linee guida e identità di marca)
   - `04_POSITIONING` (Strategie di posizionamento)
   - `05_PACKAGING_KNOWLEDGE` (Competenze e specifiche packaging)
   - `06_METHODS` (Metodologie operative e framework)
   - `07_CASE_STUDIES` (Casi studio e applicazioni reali)
   - `08_MARKET_RESEARCH` (Ricerche di mercato e trend)
   - `09_COMPETITORS` (Analisi della concorrenza)
   - `10_APPROVED_OUTPUTS` (Deliverable finali approvati)
3. Cliccare sulla pillola desiderata (es. `02_PROJECTS`) per filtrare l'elenco delle note.
4. Nella colonna sinistra della vista comparirà l'elenco delle schede delle note con titolo, percorso relativo e stato.
5. Cliccare su una nota per visualizzarne l'anteprima formattata nel riquadro destro con `KnowledgePanel`.

### RISULTATO ATTESO
Visualizzazione immediata della nota formattata con tabelle, elenchi puntati e link wiki `[[Titolo Nota]]` interattivi.

### CONTROLLO FINALE
Controllare che cliccando su una categoria la griglia filtri istantaneamente le note pertinenti.

### ERRORI E RECUPERO
- **Nessuna nota visualizzata:** La cartella selezionata è vuota.  
  *Recupero:* Selezionare un'altra categoria o approvare una bozza destinandola a quella cartella.

### PASSO SUCCESSIVO
Utilizzare le informazioni per le proprie attività o aprire il Vault in Obsidian tramite **WF-012**.

### EVIDENZE
`EVD-007` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-005`.

### SCREENSHOT
`SHOT-010` (in `05_SCREENSHOTS/desktop/`).

### DIAGRAMMA MERMAID
`04_MERMAID/WF-005.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
