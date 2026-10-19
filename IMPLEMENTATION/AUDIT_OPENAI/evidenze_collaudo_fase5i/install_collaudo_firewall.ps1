#Requires -RunAsAdministrator
$ErrorActionPreference='Stop'
$ruleAudit='LIMEN-COLLAUDO-20260924-d8ddd86'
$programAudit='E:\Projects\vault_memai_obsi_collaudo_d8ddd86\apps\desktop\src-tauri\target\release\limen-vault.exe'
$evidenceAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i'
$existingAudit=Get-NetFirewallRule -Name $ruleAudit -ErrorAction SilentlyContinue
if($existingAudit){
 if(($existingAudit|Get-NetFirewallApplicationFilter).Program -ne $programAudit){throw 'Percorso della regola inatteso'}
}else{
 New-NetFirewallRule -Name $ruleAudit -DisplayName $ruleAudit -Group 'LIMEN collaudo fase5i 20260924' -Program $programAudit -Direction Outbound -Action Block -Enabled True -Profile Any -Protocol Any -RemoteAddress Any -PolicyStore PersistentStore|Out-Null
}
$activeAudit=Get-NetFirewallRule -PolicyStore ActiveStore -Name $ruleAudit
$appAudit=$activeAudit|Get-NetFirewallApplicationFilter
$addressAudit=$activeAudit|Get-NetFirewallAddressFilter
$portAudit=$activeAudit|Get-NetFirewallPortFilter
if($activeAudit.Enabled -ne 'True' -or $activeAudit.Action -ne 'Block' -or $activeAudit.Direction -ne 'Outbound' -or $activeAudit.Profile -ne 'Any' -or $appAudit.Program -ne $programAudit -or [string]$addressAudit.RemoteAddress -ne 'Any' -or [string]$portAudit.Protocol -ne 'Any'){throw 'Regola effettiva non conforme'}
$profilesAudit=@(Get-NetFirewallProfile|Select-Object Name,Enabled)
if(@($profilesAudit|Where-Object {!$_.Enabled}).Count -gt 0){throw 'Profilo firewall disabilitato'}
[pscustomobject]@{At=(Get-Date -Format o);Name=$ruleAudit;Program=$appAudit.Program;Enabled=[string]$activeAudit.Enabled;Action=[string]$activeAudit.Action;Direction=[string]$activeAudit.Direction;Profile=[string]$activeAudit.Profile;Profiles=$profilesAudit}|ConvertTo-Json -Depth 5|Tee-Object -FilePath (Join-Path $evidenceAudit 'firewall_installed.json')
Write-Host 'Regola pronta. Attendere il preflight prima di avviare app o servizi.'
