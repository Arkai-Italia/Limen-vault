# WF-009 — Sincronizzazione e Trasferimento con Storage Cloud (S3 / R2)

### SCENARIO / A CHI SERVE
Serve all'utente o all'amministratore che desidera sincronizzare il proprio Vault locale o effettuare backup remoti su uno storage a oggetti crittografato (AWS S3, Wasabi o Cloudflare R2).

### OBIETTIVO
Configurare l'endpoint del bucket e avviare una sincronizzazione differenziale bidirezionale o unidirezionale verificata.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Clic su **"⚙️ Avanzate"** $\rightarrow$ Sottomenu Superiore $\rightarrow$ Clic su **"Trasferimenti"**.

### PRIMA DI INIZIARE
Avere a disposizione l'URL endpoint del bucket S3/R2, Access Key ID e Secret Access Key.

### COME FARE
1. Cliccare su **"Avanzate"** e poi su **"Trasferimenti"**.
2. Compilare i campi di configurazione:
   - Endpoint URL;
   - Nome del Bucket;
   - Chiavi di accesso (Access Key e Secret Key);
3. Cliccare su **"TEST CONNESSIONE"** per verificare che il server remoto risponda correttamente.
4. Cliccare su **"AVVIA SINCRONIZZAZIONE"**.
5. Monitorare l'avanzamento dei file trasferiti nella console di log.

### RISULTATO ATTESO
Sincronizzazione completata con successo con visualizzazione della data/ora di ultimo sync.

### EVIDENZE
`EVD-013` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-008`.

### SCREENSHOT
`SHOT-008`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-009-sincronizzazione-cloud.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
