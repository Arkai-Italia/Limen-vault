param([int]$Minutes=110)
$ErrorActionPreference='Stop'
$evidenceAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i'
$catalogAudit='E:\VAULT WIN TEST DEV\00_SYSTEM\VAULT_CATALOG.json'
$outAudit="$evidenceAudit\monitor"
New-Item -ItemType Directory -Force -Path $outAudit|Out-Null
$deadlineAudit=(Get-Date).AddMinutes($Minutes)
$lastCatalogAudit='';$lastProcessesAudit='';$seqAudit=0
while((Get-Date) -lt $deadlineAudit -and -not(Test-Path "$outAudit\STOP")){
 $nowAudit=Get-Date -Format o
 $processesAudit=@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe' OR name='llama-server.exe'"|Select-Object ProcessId,ParentProcessId,ExecutablePath,CreationDate,CommandLine)
 $signatureAudit=($processesAudit|ConvertTo-Json -Compress -Depth 4)
 if($signatureAudit -ne $lastProcessesAudit){
  @{At=$nowAudit;Processes=$processesAudit}|ConvertTo-Json -Compress -Depth 5|Add-Content "$outAudit\process_changes.jsonl"
  $lastProcessesAudit=$signatureAudit
 }
 $fAudit=Get-Item -LiteralPath $catalogAudit
 $versionAudit=[string]$fAudit.LastWriteTimeUtc.Ticks+':'+$fAudit.Length
 if($versionAudit -ne $lastCatalogAudit){
  $seqAudit++;$copyAudit="$outAudit\catalog_$('{0:D3}' -f $seqAudit).json"
  Copy-Item -LiteralPath $catalogAudit -Destination $copyAudit
  @{At=$nowAudit;Modified=$fAudit.LastWriteTime.ToString('o');Length=$fAudit.Length;SHA256=(Get-FileHash $copyAudit).Hash;Copy=$copyAudit}|ConvertTo-Json -Compress|Add-Content "$outAudit\catalog_changes.jsonl"
  $lastCatalogAudit=$versionAudit
 }
 Start-Sleep -Milliseconds 200
}
@{Stopped=(Get-Date -Format o);PID=$PID}|ConvertTo-Json|Set-Content "$outAudit\stopped.json"
