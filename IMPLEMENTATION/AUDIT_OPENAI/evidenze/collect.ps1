$ErrorActionPreference = 'Stop'
function git { & git.exe -c safe.directory=E:/Projects/vault_memai_obsi @args; if ($LASTEXITCODE -ne 0) { throw "git failed: $args" } }
$repo = 'E:\Projects\vault_memai_obsi'
$dest = $PSScriptRoot
$ev = Join-Path $dest 'evidenze'
New-Item -ItemType Directory -Force -Path $ev | Out-Null
Set-Location -LiteralPath $repo
& {
    Get-Date -Format o
    git status --short
    git branch --show-current
    git rev-parse HEAD
    git remote -v
    git show-ref refs/remotes/origin/windows-build
    foreach ($rev in @('d34f222','04bd7dd','efa0cef','ef2532c','e0afe10','c21cb10','67da90f')) {
        git merge-base --is-ancestor $rev 1037060
        "$rev ancestor_exit=$LASTEXITCODE"
    }
} *> (Join-Path $ev '01_preflight.txt')
& {
    Get-Date -Format o
    Get-Process -Name limen-vault,llama-server -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path,StartTime | Format-List
    foreach ($f in 'llama-server.pid','llama-server.port') {
        "FILE $f"
        $fp = Join-Path 'C:\Users\user\LIMEN Vault\models' $f
        if (Test-Path -LiteralPath $fp) { Get-Content -LiteralPath $fp } else { 'ABSENT at collection time' }
    }
    Get-Content -LiteralPath 'E:\VAULT WIN TEST DEV\00_SYSTEM\SYNC_PROFILE.json'
    Get-ChildItem -LiteralPath 'E:\VAULT WIN TEST DEV\00_SYSTEM' | Select-Object Name,Length,LastWriteTime | Format-Table
} *> (Join-Path $ev '02_processi_config.txt')
Copy-Item -LiteralPath 'C:\Users\user\.limen-vault\ask_timing.log' -Destination (Join-Path $ev 'ask_timing.snapshot.log')
Copy-Item -LiteralPath 'C:\Users\user\.limen-vault\local_model_timing.log' -Destination (Join-Path $ev 'local_model_timing.snapshot.log')
Copy-Item -LiteralPath 'C:\Users\user\LIMEN Vault\models\llama-server.log' -Destination (Join-Path $ev 'llama-server.snapshot.log')
$files = @('ai.rs','main.rs','llama.rs','embeddings.rs','search.rs','catalog.rs') | ForEach-Object { 'apps/desktop/src-tauri/src/' + $_ }
$files += @('apps/desktop/src/AiPanel.tsx','apps/desktop/src/ai-ipc.ts','apps/desktop/src/SemanticEngineSettings.tsx','apps/desktop/src-tauri/Cargo.toml','.agents/AGENTS.md','apps/desktop/src-tauri/src/bin/diagnose_fase3b2b.rs')
foreach ($file in $files) {
    $name = [IO.Path]::GetFileName($file)
    $lines = @(git show "67da90f:$file")
    $numbered = for($i=0;$i -lt $lines.Count;$i++) { '{0}: {1}' -f ($i+1),$lines[$i] }
    $numbered | Set-Content -Encoding utf8 (Join-Path $ev ('source_67da90f_' + $name + '.txt'))
}
& {
    foreach ($rev in @('efa0cef','ef2532c','e0afe10','67da90f','1037060')) {
        "REVISION $rev"
        foreach ($file in $files[0..8]) { "$file $(git rev-parse "${rev}:$file")" }
    }
    git diff efa0cef ef2532c -- apps/desktop/src-tauri/src/main.rs apps/desktop/src/AiPanel.tsx
    git diff efa0cef 67da90f -- apps/desktop/src-tauri/src/main.rs apps/desktop/src/AiPanel.tsx apps/desktop/src-tauri/src/llama.rs apps/desktop/src-tauri/src/embeddings.rs apps/desktop/src-tauri/src/search.rs
} *> (Join-Path $ev '03_revisioni_diff.txt')
'Evidence collected at ' + (Get-Date -Format o)
