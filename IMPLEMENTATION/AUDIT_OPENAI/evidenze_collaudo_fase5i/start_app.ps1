param([Parameter(Mandatory)][string]$Case)
$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i'
foreach($scopeAudit in 'Process','User','Machine'){if($null -ne [Environment]::GetEnvironmentVariable('LIMEN_MODELS_DIR',$scopeAudit)){throw 'Override modelli presente'}}
$ruleAudit=Get-NetFirewallRule -PolicyStore ActiveStore -Name 'LIMEN-COLLAUDO-20260924-d8ddd86'
$exeAudit='E:\Projects\vault_memai_obsi_collaudo_d8ddd86\apps\desktop\src-tauri\target\release\limen-vault.exe'
if($ruleAudit.Enabled -ne 'True' -or $ruleAudit.Action -ne 'Block' -or ($ruleAudit|Get-NetFirewallApplicationFilter).Program -ne $exeAudit){throw 'Firewall non conforme'}
foreach($proxyAudit in 'HTTP_PROXY','HTTPS_PROXY','ALL_PROXY'){Remove-Item "Env:$proxyAudit" -ErrorAction SilentlyContinue}
$env:NO_PROXY='*'
$pAudit=Start-Process -FilePath $exeAudit -PassThru -RedirectStandardOutput "$baseAudit\${Case}_stdout.log" -RedirectStandardError "$baseAudit\${Case}_stderr.log"
$pAudit|Select-Object Id,StartTime,Path|ConvertTo-Json|Tee-Object -FilePath "$baseAudit\${Case}_launch.json"
Wait-Process -Id $pAudit.Id
