param([string]$Case='C02')
$ErrorActionPreference='Stop'
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5h'
$binaryAudit='E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\native\llama-server.exe'
$listenerAudit=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,0)
$listenerAudit.Start(); $portAudit=$listenerAudit.LocalEndpoint.Port; $listenerAudit.Stop()
foreach($proxyAudit in @('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY')){Remove-Item "Env:$proxyAudit" -ErrorAction SilentlyContinue}
$env:NO_PROXY='*'
$pAudit=Start-Process -FilePath $binaryAudit -ArgumentList @('-m','"C:\Users\user\LIMEN Vault\models\bge-m3-Q8_0.gguf"','--embedding','--host','127.0.0.1','--port',"$portAudit",'-ub','2048','-b','2048') -WindowStyle Hidden -PassThru -RedirectStandardError "$baseAudit\${Case}_foreign_stderr.log" -RedirectStandardOutput "$baseAudit\${Case}_foreign_stdout.log"
$recordAudit=[ordered]@{At=(Get-Date -Format o);PID=$pAudit.Id;Port=$portAudit;Path=$binaryAudit;SHA256=(Get-FileHash $binaryAudit).Hash;StartTime=$pAudit.StartTime;ParentPID=$PID}
$recordAudit|ConvertTo-Json|Set-Content "$baseAudit\${Case}_foreign.json"
$recordAudit|ConvertTo-Json
Wait-Process -Id $pAudit.Id
