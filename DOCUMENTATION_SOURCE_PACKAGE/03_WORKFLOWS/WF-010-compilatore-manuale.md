# WF-010 — Compilazione Markdown Manuale di Fonti di Testo (Compilatore)

### SCENARIO / A CHI SERVE
Serve all'utente e al Knowledge Manager che hanno caricato file di testo non strutturati o note grezze in `20_RAW_SOURCES/` e desiderano avviare la compilazione batch manuale per generare bozze strutturate con frontmatter YAML normalizzato nella cartella `90_PROPOSALS/`.

### OBIETTIVO
Eseguire il comando `batch_compile_sources` su richiesta tramite l'interfaccia, trasformando le fonti grezze in note proposte conformi alle convenzioni di LIMEN Vault senza attendere elaborazioni automatiche.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Barra Laterale Sinistra $\rightarrow$ Clic su **"⚙️ Avanzate"** $\rightarrow$ Barra orizzontale $\rightarrow$ Clic su **"Compilatore manuale"** (`advancedTab === 'compiler'`).

### PRIMA DI INIZIARE
- Vault aperto e caricato regolarmente;
- Almeno un file di testo o documento sorgente presente in `20_RAW_SOURCES/`.

### COME FARE
1. Accedere alla sezione **"Avanzate"** nella barra laterale sinistra.
2. Cliccare sulla scheda **"Compilatore manuale"** nel menu secondario superiore.
3. Osservare il pannello con intestazione **"Compilatore Markdown Manuale"** e sottotitolo *"Compila file di testo e Markdown in bozze 90_PROPOSALS/"*.
4. Cliccare sul pulsante **"COMPILA FONTI TESTO"**.
5. Durante l'elaborazione, il pulsante mostra lo stato attivo e il motore Rust legge le sorgenti grezze, estrae metadati e genera le corrispondenti note di proposta.
6. Al completamento, il contatore delle bozze in sospeso si aggiorna.

### RISULTATO ATTESO
Generazione di nuove bozze Markdown con frontmatter YAML standardizzato all'interno della cartella `90_PROPOSALS/`, pronte per la revisione formale.

### CONTROLLO FINALE
Spostarsi sulla scheda **"Bozze e Proposte"** in Avanzate (o verificare in Memoria) per riscontrare la presenza delle nuove note generate con le relative sorgenti tracciate.

### ERRORI E RECUPERO
- **Pulsante "COMPILA FONTI TESTO" disabilitato:** Nessun Vault aperto o elaborazione già in corso (`isProcessing === true`).  
  *Recupero:* Verificare che il Vault sia aperto e che il badge di stato nell'Header indichi `● PRONTO`.

### PASSO SUCCESSIVO
Passare a **WF-006** (Governance e Approvazione Bozze AI) per revisionare, modificare o approvare le note generate.

### EVIDENZE
`EVD-013` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-010`.

### SCREENSHOT
`SHOT-015` (in `05_SCREENSHOTS/desktop/`).

### DIAGRAMMA MERMAID
`04_MERMAID/WF-010.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
