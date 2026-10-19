$ErrorActionPreference='Stop'
$rootAudit='E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI'
$sessionAudit=Join-Path $rootAudit 'evidenze\session_1215'
$missingAudit=@()
$countAudit=0
foreach($docAudit in @((Join-Path $rootAudit '2026-09-24_AUDIT_BLOCCO_PREPARAZIONE.md'),(Join-Path $sessionAudit 'CASE_INDEX.md'),(Join-Path $sessionAudit 'SESSION_METHOD.md'))) {
 $textAudit=Get-Content -LiteralPath $docAudit -Raw
 foreach($matchAudit in [regex]::Matches($textAudit,'\]\(([^)]+)\)')) {
  $linkAudit=$matchAudit.Groups[1].Value
  if($linkAudit -match '^https?://|^#'){continue}
  $linkAudit=($linkAudit -split '#')[0]
  $pathAudit=Join-Path (Split-Path $docAudit -Parent) $linkAudit
  $countAudit++
  if(!(Test-Path -LiteralPath $pathAudit)){$missingAudit+=[pscustomobject]@{Document=$docAudit;Link=$linkAudit}}
 }
}
$resultsAudit=Get-Content (Join-Path $sessionAudit 'results_native.json') -Raw|ConvertFrom-Json
$requiredAudit=@('M01','M02','M03','M04','M05','M06','M07','M08','M09','M10','M11','M12','M13','M14','M15','M16','E01','E02')
$missingCasesAudit=@($requiredAudit|Where-Object {$_ -notin $resultsAudit.Case})
$pngAudit=@()
Add-Type -AssemblyName System.Drawing
foreach($fileAudit in Get-ChildItem $sessionAudit -Filter '*.jpg') {
 $bytesAudit=[IO.File]::ReadAllBytes($fileAudit.FullName)
 $validAudit=($bytesAudit.Length -gt 24 -and $bytesAudit[0] -eq 255 -and $bytesAudit[1] -eq 216 -and $bytesAudit[2] -eq 255)
 $imageAudit=[Drawing.Image]::FromFile($fileAudit.FullName)
 try{$widthAudit=$imageAudit.Width;$heightAudit=$imageAudit.Height}finally{$imageAudit.Dispose()}
 $pngAudit+=[pscustomobject]@{File=$fileAudit.Name;ValidImage=$validAudit;Format='JPEG';Width=$widthAudit;Height=$heightAudit}
}
$dumpsAudit=@(Get-ChildItem $sessionAudit -Filter '*_process.dmp'|Select-Object Name,Length)
$timingAudit=@($resultsAudit|Where-Object {$_.Metrics}|ForEach-Object {$_.Metrics.timestamp})
$checksAudit=[pscustomobject]@{At=(Get-Date -Format o);RequiredCases=18;ObservedCases=$requiredAudit.Count-$missingCasesAudit.Count;ExtraReplay='M03R; M10_repeat_ui';MissingCases=$missingCasesAudit;LinksChecked=$countAudit;MissingLinks=$missingAudit;DumpCount=$dumpsAudit.Count;Dumps=$dumpsAudit;Screenshots=$pngAudit;UniqueLoggedTimingRecords=@($timingAudit|Select-Object -Unique).Count;CasesWithoutInternalMetrics=@($resultsAudit|Where-Object {!$_.Metrics}|Select-Object -ExpandProperty Case);SourceCodeContentDiffEmpty=((Get-Content (Join-Path $sessionAudit 'postflight.json') -Raw|ConvertFrom-Json).Worktrees|Where-Object {$_.ContentDiff.Count -gt 0}).Count -eq 0}
$checksAudit|ConvertTo-Json -Depth 8|Set-Content (Join-Path $sessionAudit 'delivery_checks.json')
if($missingAudit.Count -gt 0 -or $missingCasesAudit.Count -gt 0 -or $dumpsAudit.Count -ne 9 -or $pngAudit.Count -lt 18 -or @($pngAudit|Where-Object {!$_.ValidImage -or $_.Width -lt 800 -or $_.Height -lt 600}).Count -gt 0){$checksAudit|ConvertTo-Json -Depth 8;throw 'Delivery verification failed'}
Copy-Item -LiteralPath $PSCommandPath -Destination $sessionAudit
$checksAudit|Select-Object At,RequiredCases,ObservedCases,LinksChecked,DumpCount,UniqueLoggedTimingRecords,CasesWithoutInternalMetrics,SourceCodeContentDiffEmpty|ConvertTo-Json
