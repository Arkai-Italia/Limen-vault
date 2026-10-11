# Decisioni Documentali (Doc Decisions) — LIMEN Vault v7Mini

1. **Standardizzazione Deliverable Principale:**
   - La fonte master di testo è denominata tassativamente `MANUALE_UTENTE.txt` (ASCII/UTF-8 leggibile con qualsiasi text editor, impaginata per capitoli con doppio indice), affiancata da `MANUALE_UTENTE.md` per rendering su GitHub e Obsidian.

2. **Isolamento dei Diagrammi Mermaid:**
   - Ciascun workflow possiede un file `.mmd` autonomo nella cartella `04_MERMAID/`, privo di stili CSS o colori aziendali hardcoded, per garantire la compatibilità con il render editoriale futuro.

3. **Censimento Bilingue dei Controlli:**
   - Tutte le etichette di interfaccia sono censite riportando sia il testo italiano che la variante inglese gestita da `i18n.tsx`.

4. **Tracciabilità delle Evidenze:**
   - Ogni dichiarazione tecnica e operativa fa capo a un `EVIDENCE_ID` certificato nel registro `EVIDENCE_LEDGER.csv`.
