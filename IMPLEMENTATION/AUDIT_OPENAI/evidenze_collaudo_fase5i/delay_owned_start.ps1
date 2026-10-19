param([Parameter(Mandatory)][int]$AppPid,[int]$DelaySeconds=12,[string]$Label='N2_induced_delay')
$ErrorActionPreference='Stop'
$rootAudit='E:\Projects\vault_memai_obsi_collaudo_d8ddd86'
$evidenceAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i'
$appAudit=Get-CimInstance Win32_Process -Filter "ProcessId=$AppPid"
if($appAudit.ExecutablePath -ne "$rootAudit\apps\desktop\src-tauri\target\release\limen-vault.exe"){throw 'App non di collaudo'}
if(Get-CimInstance Win32_Process -Filter "name='llama-server.exe' AND ParentProcessId=$AppPid"){throw 'Servizio proprio gia attivo: non sospendo'}
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class AuditProcessDelay {
 [DllImport("kernel32.dll", SetLastError=true)] public static extern IntPtr OpenProcess(uint access, bool inherit, uint id);
 [DllImport("ntdll.dll")] public static extern int NtSuspendProcess(IntPtr handle);
 [DllImport("ntdll.dll")] public static extern int NtResumeProcess(IntPtr handle);
 [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr handle);
}
'@
$deadlineAudit=(Get-Date).AddSeconds(90)
$childAudit=$null
while((Get-Date) -lt $deadlineAudit){
 $childAudit=Get-CimInstance Win32_Process -Filter "name='llama-server.exe' AND ParentProcessId=$AppPid"|Where-Object ExecutablePath -eq "$rootAudit\apps\desktop\src-tauri\target\release\native\llama-server.exe"|Select-Object -First 1
 if($childAudit){break};Start-Sleep -Milliseconds 30
}
if(-not $childAudit){throw 'Nessun nuovo figlio nel periodo osservato'}
$handleAudit=[AuditProcessDelay]::OpenProcess(0x0800,$false,[uint32]$childAudit.ProcessId)
if($handleAudit -eq [IntPtr]::Zero){throw 'OpenProcess fallito'}
$recordAudit=[ordered]@{Method='Induced delay via NtSuspendProcess on own newly spawned real service; no product changes';Child=$childAudit|Select-Object ProcessId,ParentProcessId,ExecutablePath,CreationDate;RequestedSeconds=$DelaySeconds}
try{
 $recordAudit.SuspendAt=Get-Date -Format o
 $recordAudit.SuspendStatus=[AuditProcessDelay]::NtSuspendProcess($handleAudit)
 $recordAudit|ConvertTo-Json -Depth 5|Set-Content "$evidenceAudit\$Label.json"
 if($recordAudit.SuspendStatus -ne 0){throw 'Sospensione fallita'}
 Start-Sleep -Seconds $DelaySeconds
}finally{
 $recordAudit.ResumeStatus=[AuditProcessDelay]::NtResumeProcess($handleAudit)
 $recordAudit.ResumeAt=Get-Date -Format o
 [void][AuditProcessDelay]::CloseHandle($handleAudit)
 $recordAudit|ConvertTo-Json -Depth 5|Set-Content "$evidenceAudit\$Label.json"
}
$recordAudit|ConvertTo-Json -Depth 5
