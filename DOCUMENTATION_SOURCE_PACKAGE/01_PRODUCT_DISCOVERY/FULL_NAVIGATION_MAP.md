# Mappa Completa di Navigazione — LIMEN Vault v7Mini

L'interfaccia di LIMEN Vault v7Mini è progettata attorno a una **struttura a 3 colonne / 4 aree funzionali**, con un Header di stato superiore e due pannelli estraibili (Cassetto Fonti e Storico Chat).

```text
+----------------------------------------------------------------------------------------------------+
| HEADER SUPERIORE: [Icona Prodotto] Breadcrumb (Ask / Docs / Memory / Adv) | [Refresh] [IT | EN]   |
+-------------------+----------------------------------------------------+---------------------------+
| SIDEBAR SINISTRA  | AREA CENTRALE DI LAVORO                            | PANNELLO DESTRO (Opz.)    |
|                   |                                                    |                           |
| [CARICA DOCS] 🟢  | Vista attiva in base alla selezione della Sidebar: | • Cassetto Fonti Citate   |
|                   |                                                    |   (si apre da risposta)   |
| • ✦ Chiedi (Ask)  | 1. CHIEDI (Chat feed, toggle locale, prompt input) |                           |
| • 📁 Documenti    | 2. DOCUMENTI (Tabella raw sources, passaggi, preview)                          |
| • 📚 Memoria      | 3. MEMORIA (Filtro categorie 01-10, note, YAML)   | • Storico Conversazioni   |
| • ⚙️ Avanzate     | 4. AVANZATE (Barra secondaria orizzontale):       |   (in basso a sinistra)   |
|                   |    - Bozze & Proposte (90_PROPOSALS)               |                           |
| ───────────────── |    - Copie locali & Ripristino (Snapshot SHA-256)  | • Modali a Schermo Intero |
| [Apri in Obsidian]|    - Trasferimenti (Cloud S3/R2)                   |   - Setup Wizard (boot)   |
| [Storico Chat 🕒] |    - Collegamenti AI & 6 Modelli LLM Locali        |   - Lettore Documenti     |
|                   |    - Compilatore Manuale (M5)                      |   - Dettaglio Passaggio   |
|                   |    - Stato Sistema (Diagnostica RAM/Metal)         |                           |
|                   |    - Guida Vault (Manuale Integrato)               |                           |
+-------------------+----------------------------------------------------+---------------------------+
```

---

## Livelli di Navigazione

1. **Livello 0 — Boot & Setup Wizard (Modale Bloccante Opzionale):**
   - Se all'avvio mancano uno dei 3 prerequisiti fondamentali (Cartella Vault, Modello Locale integro, Chiave OpenAI o Solo Locale attivo), si apre automaticamente il modale a 3 step `SetupWizardModal.tsx`.
   - Il wizard può essere riaperto in qualsiasi momento dalla schermata di benvenuto o dalle impostazioni.

2. **Livello 1 — Barra di Navigazione Principale (Sidebar Sinistra):**
   - **Pulsante Globale "CARICA DOCUMENTI"**: accessibile ovunque per importare file in `20_RAW_SOURCES/`.
   - **Chiedi (`/ask`)**: chat conversazionale con RAG vettoriale e citazione fonti.
   - **Documenti (`/docs`)**: registro dei file grezzi originali e conteggio passaggi estratti.
   - **Memoria (`/knowledge`)**: note Markdown nelle 10 categorie standard del Vault.
   - **Avanzate (`/advanced`)**: amministrazione tecnica e governance.
   - **Apri in Obsidian**: avvia il Vault direttamente nell'editor Obsidian esterno.

3. **Livello 2 — Sottomenu Orizzontale "Avanzate":**
   - 7 sezioni di governance selezionabili con un clic: *Bozze*, *Copie Locali*, *Trasferimenti*, *Collegamenti AI*, *Compilatore*, *Stato Sistema*, *Guida Vault*.

4. **Livello 3 — Superfici Sovrapposte e Modali:**
   - **Cassetto Fonti Destro (`AiSourceDrawer.tsx`)**: aperto cliccando su *"N fonti citate"*.
   - **Modale Lettore Documenti (`DocumentReaderModal.tsx`)**: visualizzatore verificato SHA-256 a schermo intero con evidenziazione del paragrafo esatto.
   - **Modale Dettagli Passaggio (`SourceDetailsModal.tsx`)**: estratto del testo citato con score semantico.
