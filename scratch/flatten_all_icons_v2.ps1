$srcPath = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\src\assets"
$destPath = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\public\assets\diagram\system"

if (!(Test-Path $destPath)) { New-Item -ItemType Directory -Path $destPath -Force }

$files = Get-ChildItem -Path $srcPath -Recurse -Filter *.svg

foreach ($file in $files) {
    if ($file.FullName -like "*__MACOSX*") { continue }
    
    $newName = $file.Name.ToLower()
    $targetFile = Join-Path $destPath $newName
    
    # If file exists, append a counter to keep it unique
    $counter = 1
    while (Test-Path $targetFile) {
        $nameOnly = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToLower()
        $extension = $file.Extension.ToLower()
        $newName = "$nameOnly`_$counter$extension"
        $targetFile = Join-Path $destPath $newName
        $counter++
    }
    
    Copy-Item -Path $file.FullName -Destination $targetFile -Force
}

Write-Host "✅ Done! All $($files.Count) icons copied and flattened."
