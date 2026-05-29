$basePath = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\public\assets\diagram"
$manifestPath = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\src\constants\diagram-assets.ts"

function Get-Category ($name) {
    if ($name -like "*ec2*" -or $name -like "*lambda*" -or $name -like "*compute*" -or $name -like "*fargate*") { return "Compute" }
    if ($name -like "*s3*" -or $name -like "*ebs*" -or $name -like "*efs*" -or $name -like "*storage*") { return "Storage" }
    if ($name -like "*rds*" -or $name -like "*dynamodb*" -or $name -like "*database*" -or $name -like "*aurora*" -or $name -like "*redis*") { return "Database" }
    if ($name -like "*vpc*" -or $name -like "*route-53*" -or $name -like "*dns*" -or $name -like "*load-balancing*" -or $name -like "*networking*") { return "Networking" }
    if ($name -like "*iam*" -or $name -like "*kms*" -or $name -like "*shield*" -or $name -like "*security*" -or $name -like "*waf*") { return "Security" }
    if ($name -like "*sqs*" -or $name -like "*sns*" -or $name -like "*eventbridge*" -or $name -like "*integration*") { return "Integration" }
    return "General"
}

$systemIcons = Get-ChildItem -Path (Join-Path $basePath "system") -Filter "*.svg"
$brandIcons = Get-ChildItem -Path (Join-Path $basePath "brands") -Filter "*.svg"

$manifest = "export const DIAGRAM_CATEGORIES = ['Compute', 'Storage', 'Database', 'Networking', 'Security', 'Integration', 'Brands', 'General'] as const;

export interface DiagramAsset {
  id: string;
  name: string;
  category: string;
  path: string;
}

export const DIAGRAM_ASSETS: DiagramAsset[] = ["

foreach ($file in $systemIcons) {
    if ($file.Name -like "._*") { continue } # Skip mac junk
    $id = $file.BaseName
    $name = $id -replace "-", " "
    $name = (Get-Culture).TextInfo.ToTitleCase($name)
    $cat = Get-Category $id
    $manifest += "`n  { id: '$id', name: '$name', category: '$cat', path: '/assets/diagram/system/$($file.Name)' },"
}

foreach ($file in $brandIcons) {
    if ($file.Name -like "._*") { continue }
    $id = $file.BaseName
    $name = (Get-Culture).TextInfo.ToTitleCase($id)
    $manifest += "`n  { id: '$id', name: '$name', category: 'Brands', path: '/assets/diagram/brands/$($file.Name)' },"
}

$manifest += "`n];`n`nconsole.log('🚀 Loaded ' + DIAGRAM_ASSETS.length + ' system design icons.');"

Set-Content -Path $manifestPath -Value $manifest
Write-Host "✅ Manifest generated with $($systemIcons.Count + $brandIcons.Count) assets!"
