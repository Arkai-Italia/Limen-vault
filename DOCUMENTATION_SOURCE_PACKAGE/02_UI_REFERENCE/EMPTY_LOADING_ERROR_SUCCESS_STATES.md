# Stati di Interfaccia: Empty, Loading, Error, Success — LIMEN Vault v7Mini

## 1. Stati Vuoti (Empty States)
- **Chat Feed Vuoto (SCR-003):** Mostra il messaggio guida sintetico *"Fai una domanda sui tuoi documenti o sulle note del Vault"*, con 3 esempi di prompt cliccabili.
- **Nessun Documento in 20_RAW_SOURCES (SCR-004):** Card scura con messaggio *"Nessun documento importato"* e pulsante visibile *"Carica il tuo primo documento"*.
- **Categoria Memoria Vuota (SCR-005):** Messaggio minimal *"Nessuna nota in questa categoria"*.
- **Nessuna Proposta in Revisione (SCR-006):** Badge *"Tutte le proposte sono state esaminate"*.

## 2. Stati di Caricamento (Loading States)
- **Streaming Risposta Chat (SCR-003):** Cursore pulsante lime `#77f117`, pulsante invio temporaneamente disabilitato, testo composto progressivamente via SSE (Server-Sent Events).
- **Download Modello GGUF (SCR-009):** Barra di avanzamento verde fluida con indicazione dei megabyte scaricati rispetto al totale (es. `1.24 GB / 4.68 GB (26%)`) e stima velocità.
- **Ricalcolo Cache Embedding:** Spinner rotante su pulsante *"Ricalcola Cache"* con disabilitazione interazioni concorrenti.

## 3. Stati di Successo (Success States)
- **Documento Importato & Indicizzato:** Notifica toast verde lime con nome del file e conteggio passaggi (es. *"Contratto.pdf indicizzato con successo: 14 passaggi estratti"*).
- **Snapshot Creato:** Badge verde con hash SHA-256 sintetico e data/ora locale di generazione.
- **Bozza Approvata:** Animazione di transizione con spostamento del file dalla vista proposte alla griglia memoria.

## 4. Stati di Errore (Error States)
- Banner d'errore color rosso ardesia (`#ef4444`) con bordo semitrasparente e azione di ripristino contestuale (es. *"Riprova"* o *"Verifica stato"*).
