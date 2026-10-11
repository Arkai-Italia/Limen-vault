# Ipotesi e Lacune (Assumptions & Gaps) — LIMEN Vault v7Mini

## Registro dei Gap Documentali

```text
GAP-ID: GAP-001
SEVERITY: LOW
AREA: SCR-011 (Trasferimenti Cloud S3/R2)
PROBLEM: La sincronizzazione remota richiede un bucket S3/R2 configurato e credenziali attive dell'utente, che non sono preconfigurate di default nel vault template.
EVIDENCE: apps/desktop/src/SyncPanel.tsx, apps/desktop/src-tauri/src/sync.rs
IMPACT_ON_MANUAL: La procedura deve essere documentata evidenziando la precondizione di inserimento delle credenziali bucket.
REQUESTED_ACTION: Documentare con etichetta CODE_VERIFIED e guida alla configurazione prerequisiti.
STATUS: RESOLVED

GAP-ID: GAP-002
SEVERITY: LOW
AREA: SCR-006 (Catalogo Modelli LLM Locali)
PROBLEM: I modelli da 14B (DeepSeek-R1-14B) richiedono almeno 24-32 GB di RAM fisica di sistema e non possono essere eseguiti su macchine base con 8-16 GB.
EVIDENCE: apps/desktop/src-tauri/src/llama_llm.rs (hardware RAM detector)
IMPACT_ON_MANUAL: È fondamentale esporre la tabella comparativa dei vincoli di memoria RAM in modo evidente.
REQUESTED_ACTION: Inclusa tabella vincoli RAM in MANUALE_UTENTE.txt e nella scheda WF-008.
STATUS: RESOLVED
```
