param([Parameter(Mandatory)][string]$Case,[switch]$NoWait)
$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5h'
foreach($proxyAudit in @('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY')){Remove-Item "Env:$proxyAudit" -ErrorAction SilentlyContinue}
$env:NO_PROXY='*'
$pAudit=Start-Process -FilePath 'E:\Projects\vault_memai_obsi_collaudo_6b04271\apps\desktop\src-tauri\target\release\limen-vault.exe' -PassThru -RedirectStandardOutput "$baseAudit\${Case}_stdout.log" -RedirectStandardError "$baseAudit\${Case}_stderr.log"
$pAudit|Select-Object Id,StartTime,Path|ConvertTo-Json|Tee-Object -FilePath "$baseAudit\${Case}_launch.json"
if(-not $NoWait){Wait-Process -Id $pAudit.Id}
