# Registro delle Esclusioni — LIMEN Vault v7Mini

Il presente documento censisce in modo esplicito tutte le funzionalità, ambienti o flussi che **non** fanno parte del perimetro operativo della release corrente o che sono esclusi per architettura di progetto (evitando assenze silenziose):

1. **Gestione Multi-Utente / RBAC Cloud:**
   - *Stato:* `NOT_APPLICABLE`
   - *Motivo:* LIMEN Vault è un'applicazione desktop *standalone* e *local-first*. Tutti i dati risiedono sul file system locale dell'utente. Non esiste un database centrale condiviso con ruoli gerarchici utente/manager/admin. Il ruolo attivo è unificato (`vault-operator`).

2. **Fatturazione in-app / Checkout / Piani a pagamento:**
   - *Stato:* `NOT_APPLICABLE`
   - *Motivo:* L'applicazione è distribuita gratuitamente e non include carrelli, pagamenti Stripe, checkout o gestione fatture abbonamento. Il costo dei token OpenAI (se abilitato dall'utente) è gestito direttamente dall'utente sulla piattaforma OpenAI tramite propria API Key.

3. **Autenticazione Cloud / Login Social / MFA / Reset Password:**
   - *Stato:* `NOT_APPLICABLE`
   - *Motivo:* Non esiste un server di autenticazione proprietario. L'accesso è locale al file system. La protezione della chiave OpenAI è delegata al Portachiavi di sistema (macOS Keychain / Windows DPAPI).

4. **Webhooks Inbound da Servizi Esterni Pubblici:**
   - *Stato:* `NOT_APPLICABLE`
   - *Motivo:* Essendo un'app desktop locale, l'ascolto di webhook pubblici dall'esterno non è previsto, salvo l'uso opzionale di tunnel Cloudflare (sezione Diagnostica Avanzata).

5. **Interfaccia Mobile Nativa (iOS / Android):**
   - *Stato:* `EXCLUDED_FROM_DESKTOP_SCOPE`
   - *Motivo:* Questa release riguarda esclusivamente l'applicazione desktop macOS e Windows. La futura app mobile è gestita in repository/branch dedicati.
