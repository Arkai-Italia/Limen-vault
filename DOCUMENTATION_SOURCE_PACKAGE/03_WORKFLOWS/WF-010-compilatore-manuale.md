# WF-010 — Compilazione Manuale di Note da Testo Grezzo (Modulo M5)

### SCENARIO / A CHI SERVE
Serve all'utente che possiede appunti disordinati, email o trascrizioni audio in formato testo grezzo e desidera trasformarli rapidamente in note Markdown strutturate con formattazione automatica e metadati YAML conformi alle regole del Vault.

### OBIETTIVO
Inserire un testo non formattato, selezionare la categoria di destinazione e generare una nota strutturata pronta per l'approvazione o l'archiviazione.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Clic su **"⚙️ Avanzate"** $\rightarrow$ Sottomenu Superiore $\rightarrow$ Clic su **"Compilatore"**.

### PRIMA DI INIZIARE
Avere il testo sorgente copiato negli appunti.

### COME FARE
1. Cliccare su **"Avanzate"** e poi su **"Compilatore"**.
2. Incollare il testo grezzo nell'area centrale.
3. Assegnare un titolo indicativo alla nota.
4. Selezionare dal menu la categoria di destinazione (es. `07_MEETINGS`).
5. Cliccare sul pulsante **"COMPILA NOTA"**.
6. L'algoritmo analizza la struttura del testo, estrae data, partecipanti ed elenchi e genera la bozza formattata.
7. Cliccare su **"Salva nel Vault"**.

### RISULTATO ATTESO
Creazione della nota nella categoria selezionata con blocco Frontmatter YAML precompilato.

### EVIDENZE
`EVD-013` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-010`.

### SCREENSHOT
`SHOT-010`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-010-compilatore-manuale.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
