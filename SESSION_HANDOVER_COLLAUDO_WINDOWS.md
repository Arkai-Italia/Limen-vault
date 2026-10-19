# SESSION HANDOVER — Collaudo Release Windows LIMEN Vault v6Mini

> **Data**: 30 settembre 2026  
> **Target**: Windows 11 x64 (`dev.arkai.limenvault`, v0.6.0)  
> **Branch Git**: `windows-build`  
> **Stato Formale**: **ACCETTAZIONE APERTA**  
> *(Nessuna prova conclusiva è costituita dal commit `193363c`, che ha solo archiviato l'esecuzione v2 storica).*

---

## 1. Stato Attuale e Sintesi Direttive

In conformità alle direttive di Cesare e ai rilievi di audit, lo stato della release rimane rigorosamente su **«accettazione aperta»**.  
La sessione è sospesa su richiesta dell'utente e riprenderà domani con le attività già diagnosticate e preparate.

### Quadro delle Priorità e Riscontri Diagnostici

| Priorità | Aspetto Oggetto di Audit | Diagnosi Effettuata & Stato | Azione Immediata alla Ripresa |
|:---:|:---|:---|:---|
| **1 (Critica)** | **Correlazione Domanda-Risposta (Q12 vs Q13)**: riscontrato stesso identico testo (1.427 char) in entrambe le risposte nel run v2. | **Causa radice individuata nel test runner**: la funzione `submitQuestionAndTrackTurn` controllava l'ultimo elemento `div[style*="white-space: pre-wrap"]` della pagina. All'invio della domanda 13, la risposta della 12 era ancora presente nel DOM; a $t \approx 4\text{s}$, prima dell'inizio dello stream del nuovo turno, il runner ha letto il testo della 12 ritenendo la domanda conclusa. | Eseguire lo script isolato mirato `scratch/test_q12_q13_live.mjs` con il nuovo tracker puntuale del turno (`Turno X` + match prompt). Confrontare eventi di richiesta e testo renderizzato per escludere difetti nell'app. Successivamente ripetere la sessione completa da 20 domande. |
| **2 (Critica)** | **Tempi di Annullamento Richiesta**: presenti nel JSON v2 valori anomali di 69.974ms e 8.520ms. | **Causa radice individuata nel test runner**: il tempo `UIResetTimeMs` veniva calcolato come differenza a fine blocco test dopo aver eseguito altre richieste successive, anziché essere registrato all'istante del ripristino UI (~105ms). | Misurare il reset UI immediatamente: `const uiResetTimeMs = Math.round(performance.now() - tClickCancel)` non appena il pulsante "Annulla domanda" torna a "Chiedi". Misurare separatamente l'interruzione della richiesta/socket verso il server. Non dichiarare l'annullamento concluso basandosi solo sul pulsante. |
| **3** | **Separazione Motore CPU Standalone vs Fallback Automatico LIMEN**: chiarita classificazione prova a 84.016s. | **Classificazione rettificata**: l'esecuzione da 84s documenta la capacità del motore `llama-server.exe` standalone con flag `-ngl 0`, **NON** costituisce prova della logica di fallback automatico GPU->CPU integrata nel backend Rust di LIMEN. | Mantenere la distinzione formale; diagnosticare separatamente il timeout del wrapper a 90s. |
| **4** | **Punti Aperti per Accettazione Cesare**: sincronizzazione note e switch vault. | - L'aggiornamento dell'indice per modifiche a file esistenti in `01_CLIENTS/` richiede il comando manuale da UI "Aggiorna indice" (non è presente un file-watcher continuo).<br>- Switch di vault con operazione attiva in corso. | Lasciati aperti per valutazione e accettazione finale di Cesare. |

---

## 2. Nuova Logica di Tracciamento del Turno (Anti-Disallineamento DOM)

Per evitare l'errore di lettura dell'ultimo `pre-wrap` globale, è stata definita l'ispezione gerarchica del DOM di `AiPanel.tsx`:

```javascript
// Estrazione esatta dei turni completati associando Badge -> Prompt -> Risposta
function getCompletedTurns() {
  const spans = Array.from(document.querySelectorAll('span'))
    .filter(s => s.innerText && s.innerText.trim().startsWith('Turno '));

  return spans.map(s => {
    const badge = s.innerText.trim();
    let container = s.parentElement;
    while (container && !container.querySelector('.limen-card')) {
      container = container.parentElement;
    }
    const promptEl = container ? container.querySelector('div[style*="font-weight: 600"]') : null;
    const promptText = promptEl ? promptEl.innerText.trim() : '';
    const card = container ? container.querySelector('.limen-card') : null;
    const answerEl = card ? card.querySelector('div[style*="white-space: pre-wrap"]') : null;
    const answerText = answerEl ? answerEl.innerText.trim() : '';
    return { badge, prompt: promptText, answer: answerText, hasAnswer: answerText.length > 0 };
  });
}
```

**Condizione di attesa turno**:
Il runner non dichiara concluso il turno fino a quando:
1. `!isBusy` (lo stream è terminato);
2. Il pulsante "Chiedi" è tornato abilitato;
3. `getCompletedTurns().find(t => t.prompt.includes(cleanPrompt) && t.hasAnswer)` restituisce il turno specifico con la risposta associata alla domanda appena inviata.

---

## 3. Guida Operativa Step-by-Step per Domani

Al riavvio della sessione, eseguire i seguenti passi nell'ordine indicato:

### Passo 1: Verifica preliminare processi
Verificare che nessun processo orfano sia rimasto attivo:
```powershell
Get-Process | Where-Object { $_.ProcessName -match "limen-vault|llama-server" }
```
*(Deve risultare vuoto).*

### Passo 2: Avvio applicazione con porta di debug CDP
Avviare l'applicazione release installata esponendo la porta CDP:
```powershell
Start-Process -FilePath "C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe" -ArgumentList "--remote-debugging-port=9222"
```

### Passo 3: Esecuzione test mirato Q12 vs Q13
Eseguire lo script diagnostico:
```powershell
node E:\Projects\vault_memai_obsi\scratch\test_q12_q13_live.mjs
```
*Verifica attesa*:
* Domanda 12 ("Come vengono trattati i file Obsidian?") e Domanda 13 ("Quali categorie di note sono previste?") devono produrre testi diversi e pertinenti.
* Se i testi differiscono, l'anomalia è confermata come un difetto di campionamento del vecchio test harness.
* Se i testi fossero identici anche nel rendering DOM reale dell'app, si procederà a diagnosticare l'app backend.

### Passo 4: Esecuzione suite completa E2E aggiornata
Aggiornare `run_phase6_collaudo_e2e_v2.mjs` con il nuovo tracker e le misure di annullamento immediate, quindi lanciare la sessione completa:
* Generazione di una nuova cartella di evidenze con timestamp: `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_YYYYMMDD_HHMMSS/`;
* Salvataggio log grezzi, cattura eventi CDP e JSON di riepilogo.

---

## 4. Stato dei Binari e dell'Ambiente

* **App Installata**: `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe`  
  SHA-256: `154778aba8607638355b835b4ee26358443174bb30ffd0f0ee700288551987a6`
* **Llama Server Nativo**: `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\native\llama-server.exe`  
  SHA-256: `45438f026845b4611474e3a7a21b486cab83d3ac39ca60d591ceb88300d8ee4c`
* **Setup Installer**: `USER INSTALL WINDOWS\LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`  
  SHA-256: `8c9b1aa4b494e7d768f9384391c943d056d6cb58cac2c5ca5697efefc717e31b`
* **Modello LLM**: `Ministral-3-8B-Instruct-2410-Q5_K_M.gguf` (6.059.268.512 byte)
* **Modello Embedding**: `bge-m3-q8_0.gguf` (606.877.088 byte)
* **GPU**: NVIDIA GeForce RTX 3060 12GB (Driver 595.79, Vulkan 1.4.328)
* **Processi attivi**: 0 processi orfani.
