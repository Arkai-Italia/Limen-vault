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
1. Cliccare su **"Avanzate"** e poi su **"Copie Locali & Ripristino"** (`advancedTab === 'snapshots'`).
2. **Creazione Copia Locale (Snapshot):**
   - Cliccare sul pulsante **"CREA COPIA LOCALE"**;
   - Il motore interno calcola l'hash crittografico SHA-256 di ciascun file del Vault e genera il manifesto crittografico `snapshot_manifest.json` in `00_SYSTEM/SNAPSHOTS/{snapshot_id}/`;
   - Al termine, compare una nuova riga nella tabella con identificativo data/ora, numero di file inclusi e dimensione complessiva.
3. **Ripristino Sicuro (Non-Distruttivo):**
   - Individuare la copia desiderata nella tabella storica;
   - Cliccare sul pulsante **"RIPRISTINA"**;
   - **Destinazione del ripristino:** Il motore Rust applica una regola di sicurezza tassativa: **il ripristino diretto sopra la cartella del Vault attivo è espressamente vietato** (`target_dest == vault_path` genera errore bloccante) per scongiurare qualsiasi perdita di dati;
   - I file vengono estratti in una directory separata creata automaticamente accanto al Vault con nome `{vault_name}_RECUPERO_{snapshot_id}`;
   - Durante l'estrazione, ogni singolo file viene ri-verificato crittograficamente con SHA-256 rispetto a `snapshot_manifest.json`; in caso di difformità il recupero viene interrotto per corruzione rilevata;
   - All'interno della cartella di recupero viene rigenerato un nuovo `00_SYSTEM/VAULT_MANIFEST.json` con data e stato aggiornati.

### RISULTATO ATTESO
Creazione di una cartella gemella integra `{vault_name}_RECUPERO_{snapshot_id}` contenente la ricostruzione fedele dello stato del Vault alla data dello snapshot, senza mai alterare né sovrascrivere il Vault di lavoro corrente.

### CONTROLLO FINALE
Aprire il Finder / Explorer, verificare la cartella `{vault_name}_RECUPERO_{snapshot_id}` e ispezionare i file recuperati prima di decidere se sostituire manualmente l'archivio o consultarlo separatamente.

### ERRORI E RECUPERO
- **Errore "Spazio disco insufficiente":** Il disco non ha spazio sufficiente per completare la copia o l'estrazione.  
  *Recupero:* Liberare spazio sul disco e rieseguire la procedura.
- **Errore "Copia locale corrotta o incompleta":** Uno dei file dello snapshot non corrisponde all'hash SHA-256 registrato nel manifesto.  
  *Recupero:* Utilizzare uno snapshot precedente temporalmente integro.

### EVIDENZE
`EVD-013` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-007`.

### SCREENSHOT
`SHOT-012` (in `05_SCREENSHOTS/desktop/`).

### DIAGRAMMA MERMAID
`04_MERMAID/WF-007.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
