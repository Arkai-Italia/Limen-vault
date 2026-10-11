# Localizzazione e Gestione Bilingue (IT / EN) — LIMEN Vault v7Mini

## 1. Architettura del Motore di Traduzione (`i18n.tsx`)
LIMEN Vault v7Mini implementa un motore di internazionalizzazione nativo a zero dipendenze esterne:
- **`LanguageContext` & `LanguageProvider`**: context reattivo che distribuisce lingua e dizionario tipizzato a tutti i componenti React dell'applicazione.
- **Rilevamento Automatico della Lingua di Sistema**: al primo avvio su macOS o Windows, legge `navigator.language`. Se il sistema operativo è impostato su Inglese (o qualsiasi lingua diversa dall'italiano), l'app si apre automaticamente in **English**; se impostato su Italiano, parte in **Italiano**.
- **Persistenza Locale**: la scelta manuale dell'utente viene memorizzata in `localStorage.getItem('limen_language')` e preservata tra le sessioni.
- **Commutatore `LanguageToggle` (`IT | EN`)**: posizionato in alto a destra nell'header, consente il cambio lingua a caldo senza ricaricare l'app e senza interrompere chat o streaming in corso.

---

## 2. Dizionario Termini Chiave di Interfaccia

| Concetto Funzionale | Etichetta Italiana (IT) | Etichetta Inglese (EN) |
| :--- | :--- | :--- |
| Area Chat Primaria | **Chiedi** | **Ask** |
| Area Archivio Originali | **Documenti** | **Documents** |
| Area Conoscenza Wiki | **Memoria** | **Memory** |
| Gestione Tecnica | **Avanzate** | **Advanced** |
| Azione Globale Caricamento | **CARICA DOCUMENTI** | **UPLOAD DOCUMENTS** |
| Azione Nuova Chat | **Nuova chat** | **New chat** |
| Azione Ricarica Stato | **Aggiorna** | **Refresh** |
| Modalità 100% Offline | **100% Solo Locale** | **100% Local Only** |
| Modalità OpenAI | **Ibrido OpenAI** | **Hybrid OpenAI** |
| Conteggio Fonti | **N fonti citate** | **N cited sources** |
| Azione Apertura File | **Apri documento** | **Open document** |
| Scheda Passaggi Citati | **Passaggi** | **Passages** |
| Scheda Testo Completo | **Testo completo** | **Full text** |
| Scheda Metadati Hash | **Metadati** | **Metadata** |
| Verifica Crittografica | **Verificato (SHA-256)** | **Verified (SHA-256)** |
| Azione Approvazione Bozza | **Approva** | **Approve** |
| Azione Modifica Bozza | **Modifica** | **Revise** |
| Azione Rifiuto Bozza | **Rifiuta** | **Reject** |
| Azione Backup Crittografico | **CREA COPIA LOCALE** | **CREATE SNAPSHOT** |
| Azione Ripristino | **RIPRISTINA** | **RESTORE** |
| Stato Modello Server | **Attivo** / **Offline** | **Active** / **Offline** |
