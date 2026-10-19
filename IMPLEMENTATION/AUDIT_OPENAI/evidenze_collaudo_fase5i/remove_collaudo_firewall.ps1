#Requires -RunAsAdministrator
$ErrorActionPreference='Stop'
$ruleAudit='LIMEN-COLLAUDO-20260924-d8ddd86'
$programAudit='E:\Projects\vault_memai_obsi_collaudo_d8ddd86\apps\desktop\src-tauri\target\release\limen-vault.exe'
if(@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe'"|Where-Object ExecutablePath -eq $programAudit).Count -gt 0){throw 'App di collaudo attiva: protezione mantenuta'}
$existingAudit=Get-NetFirewallRule -Name $ruleAudit -ErrorAction SilentlyContinue
if($existingAudit){
 if(($existingAudit|Get-NetFirewallApplicationFilter).Program -ne $programAudit){throw 'Percorso inatteso'}
 Remove-NetFirewallRule -Name $ruleAudit
}
if(Get-NetFirewallRule -PolicyStore ActiveStore -Name $ruleAudit -ErrorAction SilentlyContinue){throw 'Regola ancora attiva'}
[pscustomobject]@{At=(Get-Date -Format o);RemovedRule=$ruleAudit}|ConvertTo-Json|Tee-Object -FilePath 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i\firewall_removed.json'
