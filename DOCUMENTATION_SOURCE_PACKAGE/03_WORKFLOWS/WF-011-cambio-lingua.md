# WF-011 — Commutazione Istantanea della Lingua di Interfaccia (IT | EN)

### SCENARIO / A CHI SERVE
Serve all'utente che necessita di visualizzare o presentare l'applicazione in lingua inglese o italiana, commutando istantaneamente tutte le etichette, bottoni, card, modali e placeholder di testo.

### OBIETTIVO
Alternare la lingua attiva dell'interfaccia a caldo (senza riavvii dell'app e senza ricaricare la finestra).

### RUOLO / PERMESSI
`vault-operator`.

### DOVE ANDARE
In qualunque schermata dell'applicazione $\rightarrow$ Barra Superiore (Header) in alto a destra $\rightarrow$ Clic sul selettore **"IT | EN"**.

### PRIMA DI INIZIARE
Applicazione aperta e attiva.

### COME FARE
1. Individuare il componente compatto **"IT | EN"** nell'angolo in alto a destra dell'header (accanto al pulsante Aggiorna).
2. Notare quale lingua è attiva (evidenziata con fondo scuro e testo brillante).
3. Cliccare sulla sigla della lingua alternativa desiderata (es. cliccare su **`EN`** per passare all'inglese o su **`IT`** per l'italiano).
4. L'interfaccia aggiorna immediatamente tutte le stringhe visibili:
   - Sidebar: *Ask*, *Documents*, *Memory*, *Advanced*, *Upload*;
   - Breadcrumb: *Overview*, *Ask*, *Documents*, ecc.;
   - Controlli della chat: badge *100% Local Only* / *Hybrid OpenAI*, casella prompt, pulsanti;
   - Modali: stepper del Setup Wizard e schede del Document Reader.
5. La preferenza viene automaticamente registrata in locale per i successivi avvii.

### RISULTATO ATTESO
Interfaccia tradotta al 100% in tempo reale.

### CONTROLLO FINALE
Controllare che cliccando su un'altra voce della sidebar, le etichette mantengano la lingua appena selezionata.

### EVIDENZE
`EVD-011` (`CODE_VERIFIED`).

### SCHERMATE
`SCR-001`, `SCR-003`.

### SCREENSHOT
`SHOT-001`.

### DIAGRAMMA MERMAID
`04_MERMAID/WF-011-cambio-lingua.mmd`.

### RELEASE / VARIANTI
Valido per v7Mini (0.7.0).
