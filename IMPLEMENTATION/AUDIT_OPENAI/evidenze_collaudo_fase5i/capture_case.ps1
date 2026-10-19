param([Parameter(Mandatory)][string]$Case,[Parameter(Mandatory)][string]$Phase,[switch]$FullModels)
$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i'
$destAudit=Join-Path $baseAudit ($Case+'_'+$Phase)
if(Test-Path -LiteralPath $destAudit){throw 'Snapshot esistente: usare nome nuovo'}
New-Item -ItemType Directory -Path $destAudit|Out-Null
$worktreeAudit='E:\Projects\vault_memai_obsi_collaudo_d8ddd86'
$exeAudit=Join-Path $worktreeAudit 'apps\desktop\src-tauri\target\release\limen-vault.exe'
$modelsAudit='C:\Users\user\LIMEN Vault\models'
$catalogAudit='E:\VAULT WIN TEST DEV\00_SYSTEM\VAULT_CATALOG.json'
function SharedHash([string]$p){
 $stream=[IO.File]::Open($p,[IO.FileMode]::Open,[IO.FileAccess]::Read,([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
 try{$algo=[Security.Cryptography.SHA256]::Create();try{[Convert]::ToHexString($algo.ComputeHash($stream))}finally{$algo.Dispose()}}finally{$stream.Dispose()}
}
function SharedCopy([string]$p,[string]$destination){
 $stream=[IO.File]::Open($p,[IO.FileMode]::Open,[IO.FileAccess]::Read,([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
 try{$target=[IO.File]::Create($destination);try{$stream.CopyTo($target)}finally{$target.Dispose()}}finally{$stream.Dispose()}
}
function FileRecord([string]$p){
 if(-not(Test-Path -LiteralPath $p)){return [pscustomobject]@{Path=$p;Exists=$false}}
 $f=Get-Item -LiteralPath $p
 [pscustomobject]@{Path=$f.FullName;Exists=$true;Length=$f.Length;Created=$f.CreationTime.ToString('o');Modified=$f.LastWriteTime.ToString('o');SHA256=(SharedHash $p)}
}
$stateAudit=[ordered]@{Started=(Get-Date -Format o);Case=$Case;Phase=$Phase;SHA=(git -C $worktreeAudit rev-parse HEAD);Exe=(FileRecord $exeAudit);Environment=@();Processes=@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe' OR name='llama-server.exe'"|Select-Object ProcessId,ParentProcessId,ExecutablePath,CreationDate,CommandLine);Shared=@();Models=@();Catalog=(FileRecord $catalogAudit)}
foreach($scopeAudit in 'Process','User','Machine'){$stateAudit.Environment+=@{Scope=$scopeAudit;LIMEN_MODELS_DIR=[Environment]::GetEnvironmentVariable('LIMEN_MODELS_DIR',$scopeAudit)}}
foreach($pathAudit in @("$modelsAudit\llama-server.pid","$modelsAudit\llama-server.port","$modelsAudit\llama-server.log",'C:\Users\user\.limen-vault\ask_timing.log','C:\Users\user\.limen-vault\local_model_timing.log','C:\Users\user\.limen-vault\ai_settings.json')){
 $stateAudit.Shared+=FileRecord $pathAudit
 if(Test-Path -LiteralPath $pathAudit){SharedCopy $pathAudit (Join-Path $destAudit (Split-Path $pathAudit -Leaf))}
}
if(Test-Path -LiteralPath "$modelsAudit\logs"){
 New-Item -ItemType Directory -Path "$destAudit\logs"|Out-Null
 Get-ChildItem -LiteralPath "$modelsAudit\logs" -File|ForEach-Object {SharedCopy $_.FullName (Join-Path "$destAudit\logs" $_.Name)}
}
Copy-Item -LiteralPath $catalogAudit -Destination "$destAudit\VAULT_CATALOG.json"
if($FullModels){$stateAudit.Models=@(Get-ChildItem -LiteralPath $modelsAudit -File -Recurse|ForEach-Object {FileRecord $_.FullName})}
$stateAudit.Completed=(Get-Date -Format o)
$stateAudit|ConvertTo-Json -Depth 10|Set-Content -LiteralPath "$destAudit\state.json"
'Captured '+$Case+' '+$Phase+' '+$stateAudit.Completed
