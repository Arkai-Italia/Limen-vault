param([int]$AppPid,[string]$Case)
$ErrorActionPreference='Stop'
$pAudit=Get-Process -Id $AppPid
if($pAudit.Path -notlike 'E:\Projects\vault_memai_obsi_audit_*\apps\desktop\src-tauri\target\release\limen-vault.exe'){throw 'Not an audit process'}
$baseAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\session_1215'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class AuditDump {
 [DllImport("Dbghelp.dll",SetLastError=true)]
 public static extern bool MiniDumpWriteDump(IntPtr process,uint processId,IntPtr file,uint type,IntPtr exception,IntPtr stream,IntPtr callback);
}
'@
$pAudit.Threads | Select-Object Id,ThreadState,@{n='WaitReason';e={if($_.ThreadState -eq 'Wait'){$_.WaitReason}else{''}}},TotalProcessorTime | ConvertTo-Json | Set-Content (Join-Path $baseAudit ($Case+'_threads.json'))
$dumpAudit=Join-Path $baseAudit ($Case+'_process.dmp')
$fileAudit=[IO.File]::Open($dumpAudit,[IO.FileMode]::Create,[IO.FileAccess]::Write,[IO.FileShare]::None)
try{if(![AuditDump]::MiniDumpWriteDump($pAudit.Handle,[uint32]$AppPid,$fileAudit.SafeFileHandle.DangerousGetHandle(),0x1002,[IntPtr]::Zero,[IntPtr]::Zero,[IntPtr]::Zero)){throw ('Dump failed: '+[Runtime.InteropServices.Marshal]::GetLastWin32Error())}}finally{$fileAudit.Dispose()}
Get-Item $dumpAudit | Select-Object FullName,Length,LastWriteTime
