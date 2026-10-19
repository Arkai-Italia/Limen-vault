param([Parameter(Mandatory)][string]$Case,[Parameter(Mandatory)][string]$Phase,[Parameter(Mandatory)][string]$Revision)
$ErrorActionPreference='Stop'
$rootAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\session_1215'
$destAudit=Join-Path $rootAudit ($Case+'_'+$Phase)
New-Item -ItemType Directory -Path $destAudit -Force | Out-Null
$exeAudit='E:\Projects\vault_memai_obsi_audit_'+$Revision+'\apps\desktop\src-tauri\target\release\limen-vault.exe'
$infoAudit=[ordered]@{At=(Get-Date -Format o);Case=$Case;Phase=$Phase;Revision=$Revision;SHA=(git -C ('E:\Projects\vault_memai_obsi_audit_'+$Revision) rev-parse HEAD);Exe=$exeAudit;Hash=if(Test-Path $exeAudit){(Get-FileHash $exeAudit).Hash}else{'NOT_BUILT'};Processes=@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe' OR name='llama-server.exe'" | Select-Object ProcessId,ParentProcessId,ExecutablePath,CreationDate);Shared=@{}}
foreach($fileAudit in @('C:\Users\user\LIMEN Vault\models\llama-server.pid','C:\Users\user\LIMEN Vault\models\llama-server.port','C:\Users\user\LIMEN Vault\models\llama-server.log','C:\Users\user\.limen-vault\ask_timing.log','C:\Users\user\.limen-vault\local_model_timing.log','C:\Users\user\.limen-vault\ai_settings.json')) {
 if(Test-Path -LiteralPath $fileAudit){Copy-Item -LiteralPath $fileAudit -Destination $destAudit; $infoAudit.Shared[$fileAudit]=(Get-FileHash -LiteralPath (Join-Path $destAudit (Split-Path $fileAudit -Leaf))).Hash}else{$infoAudit.Shared[$fileAudit]='ABSENT'}
}
$infoAudit | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $destAudit 'state.json') -Encoding utf8
Write-Output ('Captured '+$Case+' '+$Phase+' '+$infoAudit.At)
