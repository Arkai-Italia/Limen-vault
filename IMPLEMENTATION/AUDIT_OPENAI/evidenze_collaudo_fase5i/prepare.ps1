$ErrorActionPreference='Stop'
$repoAudit='E:\Projects\vault_memai_obsi'
$workAudit='E:\Projects\vault_memai_obsi_collaudo_d8ddd86'
$evidenceAudit="$repoAudit\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i"
Copy-Item -LiteralPath 'E:\Projects\MEMAI_V_PRO_WORKSPACE\collaudo_fase5i\capture_case.ps1','E:\Projects\MEMAI_V_PRO_WORKSPACE\collaudo_fase5i\prepare.ps1' -Destination $evidenceAudit
foreach($f in 'fase-5i.patch','fase-5i-bis.patch','fase-5i-rapporto.md','fase-5i-bis-rapporto.md','fase5i-bis-cartella-modello-prima.txt','fase5i-bis-cartella-modello-dopo.txt'){
 Copy-Item -LiteralPath "$repoAudit\IMPLEMENTATION\WINDOWS_BUILD_EVIDENCE\$f" -Destination $evidenceAudit
}
$recordAudit=[ordered]@{At=(Get-Date -Format o);Repo=$repoAudit;Branch=(git -C $repoAudit branch --show-current);HEAD=(git -C $repoAudit rev-parse HEAD);Remote=(git -C $repoAudit remote get-url origin);RemoteWindowsBuild=(git -C $repoAudit ls-remote origin refs/heads/windows-build);Target=(git -C $workAudit rev-parse HEAD);TrackedChanges=@(git -C $repoAudit status --short --untracked-files=no);Untracked=@(git -C $repoAudit ls-files --others --exclude-standard);DocumentationDelta=@(git -C $repoAudit diff --name-only d8ddd86 HEAD);PriorLogAlteration='User reports AG changes 17:05-17:47 before this audit; preserve as initial condition'}
$recordAudit|ConvertTo-Json -Depth 6|Set-Content "$evidenceAudit\preflight.json"
foreach($relativeAudit in 'apps\desktop\src-tauri\src\llama.rs','apps\desktop\src-tauri\src\main.rs','apps\desktop\src-tauri\src\automation.rs','apps\desktop\src-tauri\src\catalog.rs','apps\desktop\src\SemanticEngineSettings.tsx'){
 $nAudit=0;Get-Content "$workAudit\$relativeAudit"|ForEach-Object {$nAudit++;'{0}: {1}' -f $nAudit,$_}|Set-Content "$evidenceAudit\source_d8ddd86_$(Split-Path $relativeAudit -Leaf).txt"
}
& "$evidenceAudit\capture_case.ps1" -Case PREFLIGHT -Phase before -FullModels
