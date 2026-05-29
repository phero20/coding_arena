$src = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\src\assets"
$destBase = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\public\assets\diagram"
$destSystem = Join-Path $destBase "system"
$destBrands = Join-Path $destBase "brands"

# Create directories
if (!(Test-Path $destSystem)) { New-Item -ItemType Directory -Path $destSystem -Force }
if (!(Test-Path $destBrands)) { New-Item -ItemType Directory -Path $destBrands -Force }

Write-Host "Starting full icon flattening process..."

# Find all SVGs recursively
$allSvgs = Get-ChildItem -Path $src -Filter "*.svg" -Recurse

foreach ($file in $allSvgs) {
    $parentDir = $file.DirectoryName
    $targetDir = $destSystem # Default to system
    
    # Determine if it's a Brand or System icon
    if ($parentDir -like "*\icons*") {
        $targetDir = $destBrands
    }
    
    # Clean the name
    $newName = $file.Name
    $newName = $newName -replace "^Res_", ""
    $newName = $newName -replace "^Arch_", ""
    $newName = $newName -replace "^Icon_", ""
    $newName = $newName -replace "_48\.svg$", ".svg"
    $newName = $newName -replace "_64\.svg$", ".svg"
    $newName = $newName -replace "-Dark\.svg$", ".svg"
    $newName = $newName -replace "-Light\.svg$", ".svg"
    $newName = $newName -replace "^Amazon-", ""
    $newName = $newName -replace "^AWS-", ""
    $newName = $newName.ToLower()
    
    $targetPath = Join-Path $targetDir $newName
    Copy-Item $file.FullName $targetPath -Force
}

Write-Host "Flattening complete!"
