# WF-003 — Consultazione e Ispezione Documento Citato (Lettore Verificato SHA-256)

### SCENARIO / A CHI SERVE
Serve all'utente che vuole risalire alla fonte esatta di un'affermazione generata dall'AI, visualizzare il testo del documento nel suo contesto completo e verificarne l'integrità crittografica anti-manomissione.

### OBIETTIVO
Aprire il documento sorgente nel lettore integrato a schermo intero con verifica crittografica SHA-256 e scorrimento automatico al paragrafo citato.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Schermata **Chiedi** $\rightarrow$ Clic su **"N fonti citate"** $\rightarrow$ Colonna Fonti $\rightarrow$ Clic su **"Apri documento"**.

### PRIMA DI INIZIARE
Aver completato una richiesta in chat con fonti individuate (`WF-002`).

### COME FARE
1. In calce alla risposta dell'AI, cliccare sul pulsante **"N fonti citate"**.
2. Nel cassetto laterale destro, esaminare la card del passaggio con il punteggio di pertinenza (es. `Score: 89%`) e il nome del file (es. `Allegato_Tecnico.pdf`).
3. Cliccare sul pulsante **"Apri documento"** all'interno della card.
4. Osservare l'apertura immediata della finestra modale a schermo intero **`DocumentReaderModal`**.
5. Verificare nella barra superiore:
   - Il titolo del documento;
   - Il badge verde **"Verificato (SHA-256)"** che certifica la non manomissione del file su disco;
   - Le tre schede: **"Passaggi"**, **"Testo completo"**, **"Metadati"**.
6. Notare che la visualizzazione scorre automaticamente sul paragrafo citato, contrassegnato da una cornice verde lime e sfondo evidenziato.
7. Al termine della lettura, premere il tasto **`Esc`** o cliccare sull'icona **`X`** in alto a destra per tornare alla chat.

### SE L'INTERFACCIA MOSTRA L'ERRORE "HASH MISMATCH"
Se il file su disco è stato modificato esternamente dopo l'indicizzazione, compare un badge rosso di avviso. Il lettore permette comunque di consultare il testo, segnalando la discrepanza per trasparenza.

### RISULTATO ATTESO
Apertura fluida del visualizzatore con evidenziazione del testo e certificazione di corrispondenza crittografica.

### CONTROLLO FINALE
Controllare che il testo visualizzato nel riquadro centrale corrisponda esattamente alla citazione fornita dall'assistente.

### ERRORI E RECUPERO
- **Errore "File non trovato su disco":** Il file originale è stato eliminato dalla cartella `20_RAW_SOURCES/`.  
  *Recupero:* Reimportare il documento originale tramite il pulsante globale *CARICA DOCUMENTI*.

### PASSO SUCCESSIVO
Ritorno alla chat per proseguire la sessione di lavoro o esportare la risposta.

### ATTENZIONE
Il lettore è uno strumento di visualizzazione verificata; non consente la modifica diretta del file originale per preservarne l'integrità legale.

### EVIDENZE
`EVD-005` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-013`, `SCR-014`.

### SCREENSHOT
`SHOT-013`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-003-lettore-documenti.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
