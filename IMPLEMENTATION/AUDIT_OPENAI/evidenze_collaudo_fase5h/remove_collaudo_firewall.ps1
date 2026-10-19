#Requires -RunAsAdministrator
$ErrorActionPreference='Stop'
$ruleAudit='LIMEN-COLLAUDO-20260924-6b04271'
$programAudit='E:\Projects\vault_memai_obsi_collaudo_6b04271\apps\desktop\src-tauri\target\release\limen-vault.exe'
if(@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe'"|Where-Object ExecutablePath -eq $programAudit).Count -gt 0){throw 'App di collaudo ancora attiva. Non rimuovo la protezione.'}
$existingAudit=Get-NetFirewallRule -Name $ruleAudit -ErrorAction SilentlyContinue
if($existingAudit){
 if(($existingAudit|Get-NetFirewallApplicationFilter).Program -ne $programAudit){throw 'Percorso della regola inatteso'}
 Remove-NetFirewallRule -Name $ruleAudit
}
[pscustomobject]@{At=(Get-Date -Format o);RemovedRule=$ruleAudit}|ConvertTo-Json|Tee-Object -FilePath 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5h\firewall_removed.json'
