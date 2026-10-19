param([Parameter(Mandatory)][string]$Case,[Parameter(Mandatory)][string]$Phase)
$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5h'
$destAudit=Join-Path $baseAudit ($Case+'_'+$Phase)
New-Item -ItemType Directory -Path $destAudit -Force|Out-Null
$worktreeAudit='E:\Projects\vault_memai_obsi_collaudo_6b04271'
$exeAudit=Join-Path $worktreeAudit 'apps\desktop\src-tauri\target\release\limen-vault.exe'
$stateAudit=[ordered]@{At=(Get-Date -Format o);Case=$Case;Phase=$Phase;SHA=(git -C $worktreeAudit rev-parse HEAD);Exe=$exeAudit;ExeHash=if(Test-Path $exeAudit){(Get-FileHash $exeAudit).Hash}else{'NOT_BUILT'};Processes=@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe' OR name='llama-server.exe'"|Select-Object ProcessId,ParentProcessId,ExecutablePath,CreationDate);Shared=@{};PerRunLogs=@()}
foreach($pathAudit in @('C:\Users\user\LIMEN Vault\models\llama-server.pid','C:\Users\user\LIMEN Vault\models\llama-server.port','C:\Users\user\LIMEN Vault\models\llama-server.log','C:\Users\user\.limen-vault\ask_timing.log','C:\Users\user\.limen-vault\local_model_timing.log','C:\Users\user\.limen-vault\ai_settings.json')) {
 if(Test-Path -LiteralPath $pathAudit){Copy-Item -LiteralPath $pathAudit -Destination $destAudit;$stateAudit.Shared[$pathAudit]=(Get-FileHash (Join-Path $destAudit (Split-Path $pathAudit -Leaf))).Hash}else{$stateAudit.Shared[$pathAudit]='ABSENT'}
}
$logsAudit='C:\Users\user\LIMEN Vault\models\logs'
if(Test-Path -LiteralPath $logsAudit){Copy-Item -LiteralPath $logsAudit -Destination (Join-Path $destAudit 'logs') -Recurse; $stateAudit.PerRunLogs=@(Get-ChildItem (Join-Path $destAudit 'logs') -File -Recurse|ForEach-Object {[pscustomobject]@{Path=[IO.Path]::GetRelativePath($destAudit,$_.FullName);Length=$_.Length;SHA256=(Get-FileHash $_.FullName).Hash}})}
$stateAudit|ConvertTo-Json -Depth 8|Set-Content (Join-Path $destAudit 'state.json')
'Captured '+$Case+' '+$Phase+' '+$stateAudit.At
