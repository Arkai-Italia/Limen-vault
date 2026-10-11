# WF-012 — Apertura Diretta del Vault nell'Applicazione Obsidian Esterna

### SCENARIO / A CHI SERVE
Serve all'utente che desidera modificare grafi della conoscenza, visualizzare canvas o usare plugin specialistici di Obsidian sulla stessa identica cartella gestita da LIMEN Vault.

### OBIETTIVO
Lanciare l'applicazione Obsidian aprendo direttamente la cartella del Vault attivo con schema URI nativo `obsidian://open`.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Sezione Inferiore $\rightarrow$ Clic sul collegamento **"↗ Apri in Obsidian"** (o **"↗ Open in Obsidian"**).

### PRIMA DI INIZIARE
- Vault caricato in LIMEN Vault;
- Applicazione Obsidian installata sul Mac o su Windows.

### COME FARE
1. Localizzare il pulsante **"Apri in Obsidian"** posizionato nella parte inferiore della barra laterale sinistra.
2. Cliccare sul pulsante.
3. Il backend Tauri invia una chiamata allo schema URI di sistema del sistema operativo per aprire la cartella del Vault nell'applicazione Obsidian.
4. L'applicazione Obsidian viene portata in primo piano mostrando le cartelle e le note del Vault sincronizzate.

### RISULTATO ATTESO
Apertura immediata del Vault in Obsidian.

### ERRORI E RECUPERO
- **Obsidian non si apre:** L'applicazione Obsidian non è installata nel sistema.  
  *Recupero:* Scaricare e installare gratuitamente Obsidian da `obsidian.md` oppure aprire la cartella direttamente dal Finder/Explorer.

### EVIDENZE
`EVD-001` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-001`.

### SCREENSHOT
`SHOT-001`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-012-apri-in-obsidian.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
