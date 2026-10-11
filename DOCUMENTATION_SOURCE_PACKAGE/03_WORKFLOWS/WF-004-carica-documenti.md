# WF-004 — Acquisizione e Indicizzazione Nuovi Documenti (20_RAW_SOURCES)

### SCENARIO / A CHI SERVE
Serve all'utente che deve alimentare il Vault con nuovi documenti operativi aziendali (relazioni, contratti, tabelle dati, presentazioni in formato PDF, DOCX, XLSX, PPTX, TXT) affinché diventino interrogabili dall'AI.

### OBIETTIVO
Importare uno o più file nella cartella `20_RAW_SOURCES/`, estrarre il testo completo, calcolare l'hash SHA-256 e generare i vettori semantici per il RAG locale.

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
Qualsiasi schermata dell'applicazione $\rightarrow$ Barra Laterale Sinistra $\rightarrow$ Pulsante superiore **"🟢 CARICA DOCUMENTI"** (o **"🟢 UPLOAD DOCUMENTS"**).

### PRIMA DI INIZIARE
Avere i file da importare accessibili dal file system del proprio computer.

### COME FARE
1. Cliccare in qualsiasi momento sul pulsante verde lime **"CARICA DOCUMENTI"** posizionato in cima alla barra laterale sinistra.
2. Nella finestra nativa di selezione file di sistema (Finder su macOS / Explorer su Windows), navigare e selezionare uno o più documenti.
3. Cliccare su **"Apri"** (o **"Open"**).
4. L'applicazione commuta automaticamente sulla vista **"Documenti"** e mostra una card di avanzamento del caricamento.
5. Il motore interno esegue la sequenza automatica:
   - Copia del file in `20_RAW_SOURCES/`;
   - Calcolo dell'impronta crittografica SHA-256;
   - Estrazione del testo con `limen-extract` nativo;
   - Scomposizione in passaggi (chunking) e memorizzazione vettoriale con `bge-m3`.
6. Osservare la comparsa del nuovo documento nella tabella con stato **`Pronto`** e il numero esatto di passaggi estratti (es. `24 passaggi`).

### SE L'INTERFACCIA MOSTRA LO STATO "PROTETTO" O "ERRORE ESTRAZIONE"
Se il file è un PDF cifrato da password utente, l'icona di stato diventa un lucchetto ambra con dicitura *Protetto*. Rimuovere la password dal file originale tramite l'applicazione di sistema e ricaricare il file.

### RISULTATO ATTESO
Inserimento del documento nella tabella ufficiale di `20_RAW_SOURCES` con metadati crittografici registrati e disponibilità immediata nella ricerca semantica.

### CONTROLLO FINALE
Andare in **Chiedi** e porre una domanda specifica su una frase contenuta nel documento appena caricato: la risposta citerà il documento appena importato.

### ERRORI E RECUPERO
- **Errore "Formato file non supportato":** Tentativo di caricare file binari non documentali (es. `.exe`, `.dmg`, `.zip`).  
  *Recupero:* Caricare esclusivamente documenti testuali o formati standard (PDF, Word, Excel, PowerPoint, Testo).

### PASSO SUCCESSIVO
Consultare il file nella tabella **Documenti** o porre domande in **Chiedi**.

### ATTENZIONE
I file originali copiati in `20_RAW_SOURCES/` non vengono mai alterati dal sistema; le note elaborate dall'AI vengono salvate separatamente in `80_AI_OUTPUTS/` o `90_PROPOSALS/`.

### EVIDENZE
`EVD-006` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-004`.

### SCREENSHOT
`SHOT-004`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-004-carica-documenti.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
