# WF-001 — Configurazione Guidata al Primo Avvio (Setup Wizard)

### SCENARIO / A CHI SERVE
Serve all'utente che apre l'applicazione per la prima volta o che ha spostato/resettato la cartella del Vault o i modelli, e deve garantire che i 3 pilastri operativi (Cartella Vault, Motore AI Locale, Modalità/Chiave API) siano configurati e validati.

### OBIETTIVO
Completare con successo la verifica dei 3 requisiti e accedere alla schermata principale di LIMEN Vault con stato `Pronto`.

### RUOLO / PERMESSI
`vault-operator` (Utente locale).

### DOVE ANDARE
Schermata automatica di boot OPPURE Schermata di Benvenuto $\rightarrow$ Clic su **"CONFIGURAZIONE GUIDATA"** (icona bussola).

### PRIMA DI INIZIARE
- Avere a disposizione una cartella locale da usare come Vault (o utilizzare la cartella dimostrativa predefinita).
- Connessione a Internet attiva se si deve effettuare il primo download di un modello generativo locale GGUF (~2–5 GB).

### COME FARE
1. Osservare il pannello scuro sovrapposto con titolo **"CONFIGURAZIONE GUIDATA / GUIDED SETUP"**.
2. **Step 1 (Cartella Vault):** Cliccare sul pulsante **"SFOGLIA"** e selezionare la cartella del Vault dal file dialog di sistema. Verificare la comparsa della spunta verde `✓`.
3. **Step 2 (Motore AI Locale):** Verificare la RAM rilevata (es. `16 GB`). Selezionare uno dei modelli disponibili (es. `Ministral 3 8B Instruct`). Se non scaricato, cliccare su **"SCARICA ORA"** e attendere il completamento con verifica SHA-256. Verificare la spunta verde `✓`.
4. **Step 3 (Modalità e Chiave):** Selezionare **"Modalità 100% Solo Locale (Rete Zero)"** per operare senza chiavi cloud, oppure **"Modalità Ibrida OpenAI"** inserendo la propria chiave `sk-...`. Verificare la spunta verde `✓`.
5. Cliccare sul pulsante verde in basso **"ENTRA IN LIMEN VAULT"**.

### SE L'INTERFACCIA MOSTRA UN AVVISO DI RAM SOTTO I 16 GB
Il sistema mostra una pillola ambra di attenzione. Selezionare il modello compatto **Ministral 3 3B Instruct** (~2,06 GB) anziché modelli più pesanti per evitare rallentamenti o crash per memoria insufficiente.

### RISULTATO ATTESO
La finestra modale scompare con una transizione fluida e compare la schermata principale **Panoramica** con lo stato **Pronto** e il percorso del Vault attivo.

### CONTROLLO FINALE
Controllare che nel riquadro centrale la card "Stato Motore Semantico" indichi `Attivo` e che la sidebar permetta di cliccare su `Chiedi`.

### ERRORI E RECUPERO
- **Errore Cartella non scrivibile:** La cartella selezionata ha permessi di sola lettura.  
  *Recupero:* Scegliere una cartella all'interno della propria cartella Documenti (`~/Documents`).
- **Errore Chiave OpenAI non accettata:** Inserita una chiave errata o scaduta.  
  *Recupero:* Selezionare la "Modalità 100% Solo Locale" per entrare subito ed eventualmente riconfigurare la chiave in seguito da Impostazioni.

### PASSO SUCCESSIVO
Passare a **WF-002** (Conversazione Aumentata nel Vault) o **WF-004** (Caricamento Documenti).

### ATTENZIONE
Non cancellare la cartella del Vault dal Finder/Explorer mentre l'app è aperta.

### EVIDENZE
`EVD-001`, `EVD-002` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-001`, `SCR-002`.

### SCREENSHOT
`SHOT-002` (in `05_SCREENSHOTS/desktop/`).

### DIAGRAMMA MERMAID
`04_MERMAID/WF-001-setup-wizard.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0) su macOS Apple Silicon / Intel e Windows x64.
