$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5h'
$repoAudit='E:\Projects\vault_memai_obsi'
$worktreeAudit='E:\Projects\vault_memai_obsi_collaudo_6b04271'
$ruleAudit=Get-NetFirewallRule -PolicyStore ActiveStore -Name 'LIMEN-COLLAUDO-20260924-6b04271'
$recordAudit=[ordered]@{
 At=(Get-Date -Format o)
 Processes=@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe' OR name='llama-server.exe'"|Select-Object ProcessId,ParentProcessId,ExecutablePath,CreationDate)
 ViteListeners=@(Get-NetTCPConnection -State Listen -LocalPort 1420 -ErrorAction SilentlyContinue|Select-Object LocalAddress,LocalPort,OwningProcess)
 FixtureInWorktree=(Test-Path -LiteralPath (Join-Path $worktreeAudit 'apps\desktop\src-tauri\target\release\llama-server.exe'))
 RepoSHA=(git -C $repoAudit rev-parse HEAD)
 RepoBranch=(git -C $repoAudit branch --show-current)
 WorktreeSHA=(git -C $worktreeAudit rev-parse HEAD)
 RepoTrackedChanges=@(git -C $repoAudit status --short --untracked-files=no)
 WorktreeTrackedChanges=@(git -C $worktreeAudit status --short --untracked-files=no)
 ModelSHA256=(Get-FileHash 'C:\Users\user\LIMEN Vault\models\bge-m3-Q8_0.gguf').Hash
 ExeSHA256=(Get-FileHash (Join-Path $worktreeAudit 'apps\desktop\src-tauri\target\release\limen-vault.exe')).Hash
 AISettingsUnchanged=((Get-FileHash 'C:\Users\user\.limen-vault\ai_settings.json').Hash -eq (Get-FileHash (Join-Path $baseAudit 'SESSION_before\ai_settings.json')).Hash)
 VaultFilesWrittenSinceWindow=@(Get-ChildItem 'E:\VAULT WIN TEST DEV' -File -Recurse|Where-Object LastWriteTime -ge ([datetime]'2026-09-24T15:09:00')|Select-Object FullName,Length,LastWriteTime)
 OldFirewallRules=@(Get-NetFirewallRule -PolicyStore ActiveStore|Where-Object Group -eq 'LIMEN historical audit 20260924'|Select-Object Name,Enabled)
 Firewall=($ruleAudit|Select-Object Name,Enabled,Action,Direction,Profile)
 FirewallProgram=($ruleAudit|Get-NetFirewallApplicationFilter|Select-Object Program)
 FirewallAddress=($ruleAudit|Get-NetFirewallAddressFilter|Select-Object LocalAddress,RemoteAddress)
 FirewallPorts=($ruleAudit|Get-NetFirewallPortFilter|Select-Object Protocol,LocalPort,RemotePort)
 FirewallProfiles=@(Get-NetFirewallProfile|Select-Object Name,Enabled)
 SharedPID=if(Test-Path 'C:\Users\user\LIMEN Vault\models\llama-server.pid'){Get-Content 'C:\Users\user\LIMEN Vault\models\llama-server.pid'}else{'ABSENT'}
 SharedPort=if(Test-Path 'C:\Users\user\LIMEN Vault\models\llama-server.port'){Get-Content 'C:\Users\user\LIMEN Vault\models\llama-server.port'}else{'ABSENT'}
}
$recordAudit|ConvertTo-Json -Depth 7|Set-Content (Join-Path $baseAudit 'final_checks.json')
$recordAudit|ConvertTo-Json -Depth 7
foreach($relativeAudit in @('apps\desktop\src\SemanticEngineSettings.tsx','apps\desktop\src\AiPanel.tsx','apps\desktop\index.html')){
 $nAudit=0;Get-Content (Join-Path $worktreeAudit $relativeAudit)|ForEach-Object {$nAudit++;'{0}: {1}' -f $nAudit,$_}|Set-Content (Join-Path $baseAudit ('source_6b04271_'+(Split-Path $relativeAudit -Leaf)+'.txt'))
}
