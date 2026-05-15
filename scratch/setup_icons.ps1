$baseSrc = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\src\assets"
$destSys = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\public\icons\system-design"
$destBrand = "c:\Feroz\MainProjects\coding-arena\new\coding_arena\web\public\icons\brands"

if (!(Test-Path $destSys)) { New-Item -ItemType Directory -Path $destSys }
if (!(Test-Path $destBrand)) { New-Item -ItemType Directory -Path $destBrand }

# AWS Mappings (System Design)
$awsBase = Join-Path $baseSrc "Resource-Icons_01302026"
$awsMappings = @{
    "Res_Compute\Res_Amazon-EC2_Instance_48.svg" = "server.svg"
    "Res_Compute\Res_AWS-Lambda_Lambda-Function_48.svg" = "lambda.svg"
    "Res_Compute\Res_Amazon-EC2_Auto-Scaling_48.svg" = "autoscaling.svg"
    "Res_Databases\Res_Amazon-RDS_Multi-AZ_48.svg" = "database.svg"
    "Res_Databases\Res_Amazon-ElastiCache_ElastiCache-for-Redis_48.svg" = "redis.svg"
    "Res_Databases\Res_Amazon-ElastiCache_ElastiCache-for-Valkey_48.svg" = "valkey.svg"
    "Res_Databases\Res_Amazon-DynamoDB_Table_48.svg" = "nosql.svg"
    "Res_Storage\Res_Amazon-Simple-Storage-Service_S3-Standard_48.svg" = "s3.svg"
    "Res_Networking-Content-Delivery\Res_Amazon-Route-53-Hosted-Zone_48.svg" = "dns.svg"
    "Res_Networking-Content-Delivery\Res_Elastic-Load-Balancing_Application-Load-Balancer_48.svg" = "load-balancer.svg"
    "Res_Networking-Content-Delivery\Res_Amazon-VPC_Virtual-private-cloud-VPC_48.svg" = "vpc.svg"
    "Res_Application-Integration\Res_Amazon-Simple-Queue-Service_Queue_48.svg" = "queue.svg"
    "Res_Application-Integration\Res_Amazon-Simple-Notification-Service_Topic_48.svg" = "notification.svg"
    "Res_Application-Integration\Res_Amazon-API-Gateway_Endpoint_48.svg" = "api-gateway.svg"
    "Res_Security-Identity\Res_AWS-Identity-and-Access-Management_IAM-Add-on_48.svg" = "security.svg"
}

foreach ($srcPath in $awsMappings.Keys) {
    $fullSrc = Join-Path $awsBase $srcPath
    $fullDest = Join-Path $destSys $awsMappings[$srcPath]
    if (Test-Path $fullSrc) {
        Copy-Item $fullSrc $fullDest -Force
    }
}

# Skill Icon Mappings (Brands)
$brandBase = Join-Path $baseSrc "icons"
$brandIcons = @(
    "Docker.svg", "MongoDB.svg", "Redis-Dark.svg", "Kafka.svg", "Nginx.svg", 
    "NodeJS-Dark.svg", "GoLang.svg", "React-Dark.svg", "NextJS-Dark.svg", 
    "Bun-Dark.svg", "PostgreSQL-Dark.svg", "MySQL-Dark.svg"
)

foreach ($icon in $brandIcons) {
    $fullSrc = Join-Path $brandBase $icon
    # Clean up the name (remove -Dark, lowercase)
    $cleanName = $icon.Replace("-Dark.svg", ".svg").ToLower()
    $fullDest = Join-Path $destBrand $cleanName
    if (Test-Path $fullSrc) {
        Copy-Item $fullSrc $fullDest -Force
        Write-Host "Copied $icon to $cleanName"
    }
}
