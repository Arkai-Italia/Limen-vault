# WF-007 — Creazione e Ripristino di Copie di Sicurezza (Snapshot Crittografici)

### SCENARIO / A CHI SERVE
Serve all'amministratore del Vault o all'utente prima di effettuare modifiche massive o al termine di importanti sessioni di lavoro, per congelare lo stato dell'archivio in un archivio compresso certificato SHA-256 e garantire il ripristino istantaneo in caso di errore.

### OBIETTIVO
Creare un backup compresso `.tar.gz` completo di manifesto crittografico e consentire il ripristino sicuro in una cartella separata senza sovrascrivere dati attivi.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Clic su **"⚙️ Avanzate"** $\rightarrow$ Sottomenu Superiore $\rightarrow$ Clic su **"Copie Locali & Ripristino"**.

### PRIMA DI INIZIARE
Verificare di avere almeno 2 GB di spazio disco libero sul computer.

### COME FARE
1. Cliccare su **"Avanzate"** e poi su **"Copie Locali & Ripristino"**.
2. **Creazione Snapshot:**
   - Cliccare sul pulsante verde **"CREA COPIA LOCALE"**;
   - Il motore calcola l'hash crittografico SHA-256 di ciascun file del Vault, crea il file `manifest.json` e comprime l'archivio;
   - Al termine, compare una nuova riga nella tabella con identificativo data/ora, numero di file e impronta crittografica.
3. **Ripristino Snapshot:**
   - Selezionare una copia dalla tabella;
   - Cliccare sul pulsante **"RIPRISTINA"**;
   - Selezionare o confermare la cartella di destinazione del ripristino;
   - Il sistema decomprime i file ed esegue la verifica uno ad uno rispetto al manifesto originale.

### RISULTATO ATTESO
Copia di sicurezza creata e registrata nell'archivio storico, ripristinabile in qualsiasi momento.

### CONTROLLO FINALE
Verificare la presenza del file di backup con estensione `.tar.gz` nella directory di sistema del Vault.

### ERRORI E RECUPERO
- **Errore "Spazio disco insufficiente":** Il disco non ha spazio sufficiente per completare la compressione.  
  *Recupero:* Liberare spazio sul disco e rieseguire la procedura.

### EVIDENZE
`EVD-013` (`TEST_VERIFIED`).

### SCHERMATE
`SCR-007`.

### SCREENSHOT
`SHOT-007`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-007-snapshot-ripristino.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
