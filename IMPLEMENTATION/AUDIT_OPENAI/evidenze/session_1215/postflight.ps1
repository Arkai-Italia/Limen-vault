$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\session_1215'
$stageAudit='E:\Projects\MEMAI_V_PRO_WORKSPACE\audit_limen_20260924'
$processAudit=@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe' OR name='llama-server.exe'")
if($processAudit.Count -ne 0){throw 'App or service still active; inspect before cleanup'}
& (Join-Path $stageAudit 'capture_case.ps1') -Case SESSION -Phase after -Revision e0afe10
$fixtureHashAudit=(Get-FileHash (Join-Path $stageAudit 'invalid_embeddings.exe')).Hash
$removedAudit=@()
foreach($revisionAudit in @('e0afe10','ef2532c','efa0cef','67da90f')) {
 $fixturePathAudit='E:\Projects\vault_memai_obsi_audit_'+$revisionAudit+'\apps\desktop\src-tauri\target\release\llama-server.exe'
 if(Test-Path -LiteralPath $fixturePathAudit) {
  if((Get-FileHash -LiteralPath $fixturePathAudit).Hash -ne $fixtureHashAudit){throw ('Unexpected fixture hash: '+$fixturePathAudit)}
  Remove-Item -LiteralPath $fixturePathAudit
  $removedAudit+=$fixturePathAudit
 }
}
$identityAudit=[Security.Principal.WindowsIdentity]::GetCurrent()
$principalAudit=[Security.Principal.WindowsPrincipal]::new($identityAudit)
$isAdminAudit=$principalAudit.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$firewallErrorAudit=$null
try { & (Join-Path $stageAudit 'remove_audit_firewall.ps1') } catch { $firewallErrorAudit=$_.Exception.Message }
$rulesAudit=@(Get-NetFirewallRule -PolicyStore ActiveStore -Name 'LIMEN-AUDIT-20260924-*' -ErrorAction SilentlyContinue | ForEach-Object {$rAudit=$_;$pAudit=($rAudit|Get-NetFirewallApplicationFilter).Program;[pscustomobject]@{Name=$rAudit.Name;Enabled=[string]$rAudit.Enabled;Action=[string]$rAudit.Action;Direction=[string]$rAudit.Direction;Program=$pAudit}})
$modelAudit=Get-FileHash -LiteralPath 'C:\Users\user\LIMEN Vault\models\bge-m3-Q8_0.gguf'
$modelBeforeAudit=Get-FileHash -LiteralPath (Join-Path $baseAudit 'before\bge-m3-Q8_0.gguf')
$settingsAudit=Get-FileHash -LiteralPath 'C:\Users\user\.limen-vault\ai_settings.json'
$settingsBeforeAudit=Get-FileHash -LiteralPath (Join-Path $baseAudit 'before\ai_settings.json')
$gitAudit=@()
foreach($revisionAudit in @('e0afe10','ef2532c','efa0cef','67da90f')) {
 $worktreeAudit='E:\Projects\vault_memai_obsi_audit_'+$revisionAudit
 $gitAudit+=[pscustomobject]@{Revision=$revisionAudit;SHA=(git -C $worktreeAudit rev-parse HEAD);Status=@(git -C $worktreeAudit status --short);ContentDiff=@(git -C $worktreeAudit diff --numstat);ExeHash=(Get-FileHash (Join-Path $worktreeAudit 'apps\desktop\src-tauri\target\release\limen-vault.exe')).Hash}
}
[pscustomobject]@{At=(Get-Date -Format o);AppServiceCount=$processAudit.Count;RemovedFixturePaths=$removedAudit;ElevatedAdmin=$isAdminAudit;FirewallRemovalError=$firewallErrorAudit;RemainingFirewallRules=$rulesAudit;ModelSHA256=$modelAudit.Hash;ModelUnchanged=($modelAudit.Hash -eq $modelBeforeAudit.Hash);SettingsSHA256=$settingsAudit.Hash;SettingsUnchanged=($settingsAudit.Hash -eq $settingsBeforeAudit.Hash);Worktrees=$gitAudit;OperationalBranch=(git -C 'E:\Projects\vault_memai_obsi' branch --show-current);OperationalHEAD=(git -C 'E:\Projects\vault_memai_obsi' rev-parse HEAD);OperationalStatus=@(git -C 'E:\Projects\vault_memai_obsi' status --short)} | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $baseAudit 'postflight.json')
Get-ChildItem -LiteralPath $stageAudit -File | Where-Object {$_.Name -match '^(M\d\dR?|E\d\d)_.*\.(png|txt)$' -or $_.Name -in @('capture_case.ps1','dump_case.ps1','consolidate.ps1','postflight.ps1','invalid_embeddings.rs','invalid_embeddings.exe','SESSION_METHOD.md')} | Copy-Item -Destination $baseAudit
& (Join-Path $stageAudit 'consolidate.ps1')
Get-Content (Join-Path $baseAudit 'postflight.json')
