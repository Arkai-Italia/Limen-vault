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
1. Cliccare su **"Avanzate"** nella sidebar e selezionare la scheda **"Bozze e Proposte"** (`advancedTab === 'proposals'`).
2. Nella colonna sinistra, selezionare la proposta da revisionare dall'elenco (stato contrassegnato con badge *"In attesa"*).
3. Nel riquadro centrale, leggere il testo proposto, l'hash SHA-256 della revisione e la provenienza.
4. **Opzione A — Approva Revisione:**
   - Nel riquadro verde di approvazione, specificare il percorso relativo in **"Nuova destinazione (.md)"** all'interno di una delle 10 categorie (es. `02_PROJECTS/specifiche-progetto.md`). Le note esistenti non vengono mai sovrascritte;
   - Selezionare la casella di spunta obbligatoria: *"Ho verificato questa revisione e la destinazione indicata"*;
   - Cliccare sul pulsante verde **"APPROVA REVISIONE MOSTRATA"**;
   - La nota viene scritta nella categoria prescelta e la proposta transita a stato `approved`.
5. **Opzione B — Modifica prima dell'approvazione:**
   - Espandere l'accordion **"Modifica testo (Crea nuova revisione)"**;
   - Modificare il testo Markdown nella textarea ed eventualmente esaminare il confronto affiancato (*"Confronta testo attuale con la revisione proposta"*);
   - Cliccare su **"SALVA NUOVA REVISIONE (CONSERVA LA PRECEDENTE)"**. La cronologia delle revisioni viene incrementata senza perdere il testo storico.
6. **Opzione C — Rifiuta Revisione:**
   - Espandere l'accordion **"Rifiuta questa revisione"**;
   - Compilare obbligatoriamente il campo **"Motivo del rifiuto"**;
   - Cliccare sul pulsante rosso **"RIFIUTA REVISIONE MOSTRATA"**.

### RIFIUTO ARCHIVIATO VS CANCELLAZIONE DEFINITIVA
- **Rifiuto archiviato (Decisione di Governance):** Il rifiuto NON cancella fisicamente il file da disco. Registra una transizione formale `action: 'reject'` con motivazione esplicita e timestamp nell'audit trail della proposta (`decision`), preservando la memoria storica e la tracciabilità delle motivazioni per cui una sintesi AI non è stata promossa.
- **Cancellazione definitiva (Eliminazione File):** La rimozione fisica distrugge il file dal file system azzerando l'audit log. Il workflow di governance di LIMEN Vault adotta il principio di non-ripudio e conservazione delle decisioni, escludendo cancellazioni distruttive automatiche durante la revisione.

### RISULTATO ATTESO
La proposta approvata viene inserita nella cartella di categoria ufficiale del Vault con stato consolidato. La proposta rifiutata rimane tracciata con motivazione registrata.

### CONTROLLO FINALE
Andare nella schermata **Memoria**, selezionare la categoria di destinazione e verificare la presenza della nuova nota con anteprima e testo formattato.

### ERRORI E RECUPERO
- **Pulsante Approva disabilitato:** Manca la casella di spunta di conferma o il percorso di destinazione è vuoto.  
  *Recupero:* Inserire il percorso relativo della nota e selezionare la spunta di verifica.
- **Pulsante Rifiuta disabilitato:** Il campo "Motivo del rifiuto" è vuoto.  
  *Recupero:* Indicare la motivazione del rifiuto per sbloccare l'azione.

### PASSO SUCCESSIVO
Ritorno alla schermata di lavoro ordinaria.

### ATTENZIONE
L'approvazione è un atto di governance formale che rende il contenuto ricercabile e citabile nei futuri turni RAG del Vault.

### EVIDENZE
`EVD-008` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-006`.

### SCREENSHOT
`SHOT-011` (in `05_SCREENSHOTS/desktop/`).

### DIAGRAMMA MERMAID
`04_MERMAID/WF-006.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
