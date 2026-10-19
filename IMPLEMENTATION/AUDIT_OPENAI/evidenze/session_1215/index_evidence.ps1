$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\session_1215'
$resultsAudit=Get-Content (Join-Path $baseAudit 'results_native.json') -Raw|ConvertFrom-Json
$linesAudit=[Collections.Generic.List[string]]::new()
$linesAudit.Add('# Indice delle prove native — 24 settembre 2026')
$linesAudit.Add('')
$linesAudit.Add('18 casi della matrice, ripetizione M03R e seconda esecuzione M10. Orari ISO con offset o UTC Z. I contenuti condivisi sono copie reali; i dump sono locali, acquisiti prima della terminazione del figlio. Le fonti dopo il rilascio di un blocco non erano visibili durante il blocco.')
$linesAudit.Add('')
$linesAudit.Add('[Metodo e comandi](SESSION_METHOD.md) · [Metriche JSON](results_native.json) · [Postflight](postflight.json)')
foreach($itemAudit in $resultsAudit) {
 $caseAudit=$itemAudit.Case
 $beforeAudit=Join-Path $baseAudit ($caseAudit+'_before')
 $afterAudit=Join-Path $baseAudit ($caseAudit+'_after')
 $linesAudit.Add('')
 $linesAudit.Add('## '+$caseAudit+' — '+$itemAudit.Revision)
 $linesAudit.Add('')
 $linesAudit.Add('SHA Git: `'+$itemAudit.SHA+'`; SHA256 exe: `'+$itemAudit.ExeHash+'`.')
 $linesAudit.Add('')
 $linesAudit.Add('[Stato prima]('+ $caseAudit+'_before/state.json) · [Stato dopo]('+ $caseAudit+'_after/state.json) · [UI testo]('+$caseAudit+'_ui.txt) · [UI immagine]('+$caseAudit+'_ui.jpg)')
 foreach($suffixAudit in @('_panel.txt','_recovered_ui.txt','_backend.json','_threads.json','_process.dmp')) {
  if(Test-Path (Join-Path $baseAudit ($caseAudit+$suffixAudit))){$linesAudit.Add('['+$caseAudit+$suffixAudit+']('+$caseAudit+$suffixAudit+')')}
 }
 if($caseAudit -eq 'M10'){$linesAudit.Add('[Seconda esecuzione UI](M10_repeat_ui.txt) · [Errore tecnico](M10_error_ui.txt)')}
 $linesAudit.Add('')
 $linesAudit.Add('| PID | Parent | Avvio | Percorso |')
 $linesAudit.Add('|---|---|---|---|')
 foreach($procAudit in $itemAudit.ProcessesBefore){$createdAudit=([datetimeoffset]$procAudit.CreationDate).ToString('o');$linesAudit.Add('| '+$procAudit.ProcessId+' | '+$procAudit.ParentProcessId+' | '+$createdAudit+' | `'+$procAudit.ExecutablePath+'` |')}
 $linesAudit.Add('')
 foreach($nameAudit in @('llama-server.pid','llama-server.port')) {
  $prePathAudit=Join-Path $beforeAudit $nameAudit
  $postPathAudit=Join-Path $afterAudit $nameAudit
  $preAudit=if(Test-Path $prePathAudit){(Get-Content $prePathAudit -Raw).Trim()}else{'ASSENTE'}
  $postAudit=if(Test-Path $postPathAudit){(Get-Content $postPathAudit -Raw).Trim()}else{'ASSENTE'}
  $linesAudit.Add('- `'+$nameAudit+'`: prima `'+$preAudit+'`; dopo `'+$postAudit+'`.')
 }
 $linesAudit.Add('- [Delta ask_timing]('+$caseAudit+'_ask_timing.log.delta.txt) · [Delta local_model_timing]('+$caseAudit+'_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.')
 $linesAudit.Add('')
 $linesAudit.Add('Fonti osservate: '+$itemAudit.UISourceCount+'. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:')
 $linesAudit.Add('')
 if($itemAudit.Metrics) {
  foreach($sourceAudit in $itemAudit.Metrics.sources){$linesAudit.Add('- `'+$sourceAudit.relative_path+'` — '+$sourceAudit.locator)}
 } else {
  $uiPathAudit=Join-Path $baseAudit ($caseAudit+'_recovered_ui.txt')
  if(!(Test-Path $uiPathAudit)){$uiPathAudit=Join-Path $baseAudit ($caseAudit+'_ui.txt')}
  $uiTextAudit=Get-Content $uiPathAudit -Raw
  $titlesAudit=[regex]::Matches($uiTextAudit,'(?m)^\s*\d+ text ([a-f0-9]{16}-[^\r\n]+)$')|ForEach-Object {$_.Groups[1].Value}|Select-Object -Unique
  foreach($titleAudit in $titlesAudit){$linesAudit.Add('- '+$titleAudit)}
  $linesAudit.Add('')
  $linesAudit.Add('Metriche interne ND: il ramo di errore rete di efa0cef non aggiunge righe al registro. Non usare la precedente riga storica come risultato di questo caso.')
 }
}
$linesAudit.Add('')
$linesAudit.Add('## Dump e integrità')
$linesAudit.Add('')
$linesAudit.Add('Nove dump: M03, M03R, M04, M07, M08, M11, M12, M15, M16. MiniDumpWriteDump 0x1002; nessuna analisi simbolica degli stack dichiarata. Gli hash di tutti gli allegati sono nel manifest ../SHA256SUMS.txt.')
$linesAudit|Set-Content (Join-Path $baseAudit 'CASE_INDEX.md') -Encoding utf8
Copy-Item -LiteralPath $PSCommandPath -Destination $baseAudit
Get-Item (Join-Path $baseAudit 'CASE_INDEX.md') | Select-Object FullName,Length
