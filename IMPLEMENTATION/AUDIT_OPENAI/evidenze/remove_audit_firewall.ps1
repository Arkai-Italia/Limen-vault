# Audit LIMEN storico: rimuove esclusivamente le quattro regole create per l'audit.
# Eseguire a fine prove, dopo la chiusura degli eseguibili storici.
#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
foreach ($auditRevision in @('e0afe10','ef2532c','efa0cef','67da90f')) {
    $auditName = 'LIMEN-AUDIT-20260924-' + $auditRevision
    $auditProgram = 'E:\Projects\vault_memai_obsi_audit_' + $auditRevision + '\apps\desktop\src-tauri\target\release\limen-vault.exe'
    $auditRunning = @(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe'" | Where-Object ExecutablePath -eq $auditProgram)
    if ($auditRunning.Count -gt 0) { throw "Eseguibile audit ancora attivo: $auditProgram. Non rimuovo la sua protezione." }
    $auditRule = Get-NetFirewallRule -Name $auditName -ErrorAction SilentlyContinue
    if ($auditRule) {
        $auditFilter = $auditRule | Get-NetFirewallApplicationFilter
        if ($auditFilter.Program -ne $auditProgram) { throw "Percorso inatteso per $auditName" }
        Remove-NetFirewallRule -Name $auditName
    }
}
('Rimozione completata: ' + (Get-Date -Format o)) | Set-Content -LiteralPath 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\13_firewall_removed.txt' -Encoding utf8
