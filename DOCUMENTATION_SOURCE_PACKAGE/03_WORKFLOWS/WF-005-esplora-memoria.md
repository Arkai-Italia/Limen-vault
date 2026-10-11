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
2. In alto nella schermata, osservare la barra delle pillole orizzontali corrispondenti alle 10 categorie standard del Vault:
   - `01_CLIENTS`, `02_PARTNERS`, `03_SUPPLIERS`, `04_PROJECTS`, `05_PRODUCTS`, `06_RESEARCH`, `07_MEETINGS`, `08_TEMPLATES`, `09_INTERNAL`, `10_APPROVED_OUTPUTS`.
3. Cliccare sulla pillola desiderata (es. `04_PROJECTS`) per filtrare l'elenco.
4. Nella colonna sinistra della vista comparirà l'elenco delle schede delle note con titolo, data di modifica e badge di validità Frontmatter:
   - Badge verde **`YAML Valido`**: la nota possiede tutti i metadati obbligatori conformi a Obsidian.
   - Badge giallo **`YAML Incompleto`**: uno o più campi raccomandati non sono presenti.
5. Cliccare su una nota per visualizzarne l'anteprima formattata nel riquadro destro.

### RISULTATO ATTESO
Visualizzazione immediata della nota formattata con tabelle, elenchi puntati e link wiki `[[Titolo Nota]]` interattivi.

### CONTROLLO FINALE
Controllare che cliccando su un link wiki interno, il visualizzatore apra la nota collegata.

### ERRORI E RECUPERO
- **Nessuna nota visualizzata:** La cartella selezionata è vuota.  
  *Recupero:* Selezionare un'altra categoria o importare/creare note in quella categoria.

### PASSO SUCCESSIVO
Utilizzare le informazioni per le proprie attività o aprire il Vault in Obsidian tramite **WF-012**.

### EVIDENZE
`EVD-007` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-005`.

### SCREENSHOT
`SHOT-005`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-005-esplora-memoria.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
