$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\session_1215'
$resultsAudit=@()
foreach($caseAudit in @('E01','M01','M02','M03','M03R','M04','M05','M06','M07','M08','M09','M10','M11','M12','E02','M13','M14','M15','M16')) {
 $afterAudit=Join-Path $baseAudit ($caseAudit+'_after')
 $beforeAudit=Join-Path $baseAudit ($caseAudit+'_before')
 if(!(Test-Path $afterAudit)){continue}
 $beforeTextAudit=[IO.File]::ReadAllText((Join-Path $beforeAudit 'ask_timing.log'))
 $afterTextAudit=[IO.File]::ReadAllText((Join-Path $afterAudit 'ask_timing.log'))
 $deltaTextAudit=if($afterTextAudit.StartsWith($beforeTextAudit)){$afterTextAudit.Substring($beforeTextAudit.Length)}else{throw ('Log not append-only: '+$caseAudit)}
 $lineAudit=$deltaTextAudit -split '\r?\n' | Where-Object {$_ -like 'JSON: *'} | Select-Object -Last 1
 $metricAudit=if($lineAudit){$lineAudit.Substring(6)|ConvertFrom-Json}else{$null}
 $stateAudit=Get-Content (Join-Path $beforeAudit 'state.json') -Raw|ConvertFrom-Json
 $uiPathAudit=Join-Path 'E:\Projects\MEMAI_V_PRO_WORKSPACE\audit_limen_20260924' ($caseAudit+'_ui.txt')
 $uiAudit=$null
 if(Test-Path $uiPathAudit){$firstAudit=Get-Content $uiPathAudit -First 1; if($firstAudit.StartsWith('{')){$uiAudit=$firstAudit|ConvertFrom-Json}}
 $sourceUIAudit=$uiPathAudit
 $recoveryAudit=Join-Path 'E:\Projects\MEMAI_V_PRO_WORKSPACE\audit_limen_20260924' ($caseAudit+'_recovered_ui.txt')
 if(Test-Path $recoveryAudit){$sourceUIAudit=$recoveryAudit}
 $sourcesAudit=$null
 if(Test-Path $sourceUIAudit){$textUIAudit=Get-Content $sourceUIAudit -Raw; $matchUIAudit=[regex]::Match($textUIAudit,'Fonti consultate dal Vault per questa domanda \((\d+)\)'); if($matchUIAudit.Success){$sourcesAudit=[int]$matchUIAudit.Groups[1].Value}}
 $resultsAudit+=[pscustomobject]@{Case=$caseAudit;Revision=$stateAudit.Revision;SHA=$stateAudit.SHA;ExeHash=$stateAudit.Hash;ProcessesBefore=$stateAudit.Processes;UIObservation=$uiAudit;UISourceCount=$sourcesAudit;Metrics=$metricAudit;AskLogDeltaEmpty=($deltaTextAudit.Length -eq 0)}
 foreach($logAudit in @('ask_timing.log','local_model_timing.log')) {
  $preAudit=[IO.File]::ReadAllText((Join-Path $beforeAudit $logAudit))
  $postAudit=[IO.File]::ReadAllText((Join-Path $afterAudit $logAudit))
  if($postAudit.StartsWith($preAudit)){[IO.File]::WriteAllText((Join-Path $baseAudit ($caseAudit+'_'+$logAudit+'.delta.txt')),$postAudit.Substring($preAudit.Length))}
 }
}
$resultsAudit|ConvertTo-Json -Depth 15|Set-Content (Join-Path $baseAudit 'results_native.json')
$resultsAudit|Select-Object Case,Revision,@{n='Preview_ms';e={$_.Metrics.preview.total_ms}},@{n='UI_ms';e={$_.Metrics.t_ui_total_ms}},@{n='Embed_ms';e={$_.Metrics.preview.embed_ms}},@{n='Sem_ms';e={$_.Metrics.preview.search_sem_ms}},UISourceCount,@{n='Observed_ms';e={$_.UIObservation.elapsedMs}}|Format-Table -AutoSize
