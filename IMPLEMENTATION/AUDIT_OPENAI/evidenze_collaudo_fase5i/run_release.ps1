$ErrorActionPreference='Stop'
$evidenceAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i'
foreach($scopeAudit in 'Process','User','Machine'){
 if($null -ne [Environment]::GetEnvironmentVariable('LIMEN_MODELS_DIR',$scopeAudit)){throw "LIMEN_MODELS_DIR impostata in $scopeAudit"}
}
$ruleAudit=Get-NetFirewallRule -PolicyStore ActiveStore -Name 'LIMEN-COLLAUDO-20260924-d8ddd86'
$expectedAudit='E:\Projects\vault_memai_obsi_collaudo_d8ddd86\apps\desktop\src-tauri\target\release\limen-vault.exe'
if($ruleAudit.Enabled -ne 'True' -or $ruleAudit.Action -ne 'Block' -or $ruleAudit.Direction -ne 'Outbound' -or ($ruleAudit|Get-NetFirewallApplicationFilter).Program -ne $expectedAudit){throw 'Firewall non conforme'}
if(@(Get-CimInstance Win32_Process -Filter "name='limen-vault.exe' OR name='llama-server.exe'").Count -ne 0){throw 'Processi preesistenti: non avvio'}
foreach($proxyAudit in 'HTTP_PROXY','HTTPS_PROXY','ALL_PROXY'){Remove-Item "Env:$proxyAudit" -ErrorAction SilentlyContinue}
$env:NO_PROXY='*'
Set-Location -LiteralPath 'E:\Projects\vault_memai_obsi_collaudo_d8ddd86'
& npx pnpm --filter @limen-vault/desktop tauri dev --release *> "$evidenceAudit\build_and_run_release.log"
exit $LASTEXITCODE
