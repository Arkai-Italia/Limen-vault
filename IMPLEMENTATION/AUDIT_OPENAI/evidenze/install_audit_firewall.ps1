# Audit LIMEN storico: eseguire in PowerShell come amministratore.
# Non avvia app, non modifica codice, non contatta OpenAI.
# Blocca tutto il traffico in uscita dei soli quattro eseguibili indicati.
# Il comportamento delle connessioni loopback deve essere verificato prima
# di usare queste regole nelle prove semantiche: nessun PASS e' implicito.
#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
$auditEvidence = 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze'
$auditRevisions = @('e0afe10','ef2532c','efa0cef','67da90f')
$auditResults = @()
foreach ($auditRevision in $auditRevisions) {
    $auditName = 'LIMEN-AUDIT-20260924-' + $auditRevision
    $auditProgram = 'E:\Projects\vault_memai_obsi_audit_' + $auditRevision + '\apps\desktop\src-tauri\target\release\limen-vault.exe'
    $auditExisting = Get-NetFirewallRule -Name $auditName -ErrorAction SilentlyContinue
    if ($auditExisting) {
        $auditFilter = $auditExisting | Get-NetFirewallApplicationFilter
        if ($auditFilter.Program -ne $auditProgram -or $auditExisting.Action -ne 'Block' -or $auditExisting.Direction -ne 'Outbound' -or $auditExisting.Enabled -ne 'True') {
            throw "Regola esistente inattesa: $auditName. Nessuna modifica applicata a questa regola."
        }
    } else {
        New-NetFirewallRule -Name $auditName -DisplayName $auditName -Group 'LIMEN historical audit 20260924' -Program $auditProgram -Direction Outbound -Action Block -Enabled True -Profile Any -Protocol Any -RemoteAddress Any -PolicyStore PersistentStore | Out-Null
    }
    $auditActive = Get-NetFirewallRule -PolicyStore ActiveStore -Name $auditName
    $auditActiveFilter = $auditActive | Get-NetFirewallApplicationFilter
    $auditAddress = $auditActive | Get-NetFirewallAddressFilter
    $auditPort = $auditActive | Get-NetFirewallPortFilter
    if ($auditActive.Enabled -ne 'True' -or $auditActive.Action -ne 'Block' -or $auditActive.Direction -ne 'Outbound' -or $auditActive.Profile -ne 'Any' -or $auditActiveFilter.Program -ne $auditProgram -or [string]$auditAddress.RemoteAddress -ne 'Any' -or [string]$auditPort.Protocol -ne 'Any' -or [string]$auditPort.RemotePort -ne 'Any') {
        throw "Regola effettiva non conforme: $auditName. Non avviare le prove."
    }
    $auditResults += [pscustomobject]@{Name=$auditActive.Name; Enabled=[string]$auditActive.Enabled; Action=[string]$auditActive.Action; Direction=[string]$auditActive.Direction; Program=$auditActiveFilter.Program; Profile=[string]$auditActive.Profile}
}
$auditLog = [pscustomobject]@{At=(Get-Date -Format o); Rules=$auditResults; Profiles=@(Get-NetFirewallProfile | Select-Object Name,Enabled)}
$auditLog | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $auditEvidence '13_firewall_installed.json') -Encoding utf8
$auditResults | Format-List
Write-Host 'Regole installate. Non avviare ancora app o servizi: attendere il preflight dell auditor.'
