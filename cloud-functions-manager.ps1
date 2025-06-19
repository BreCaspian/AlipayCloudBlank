# PowerShell Script: Alipay Mini Program Cloud Functions Manager
# This script combines the following features:
# - Check and create package.json files
# - Install dependencies for a single cloud function
# - Install dependencies for all cloud functions
# - Check cloud function status

param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("check", "create", "install", "install-single", "recreate", "help")]
    [string]$action = "help",
    
    [Parameter(Mandatory=$false)]
    [string]$functionName = ""
)

# Define cloud functions list
$cloudFunctions = @(
    "addToCart",
    "createOrder",
    "getCartList",
    "getCategory",
    "getOrder",
    "getProduct",
    "getSubCategory",
    "myPay",
    "removeCartItem",
    "updateCartItem",
    "updateOrder"
)

# Define cloud function descriptions
$functionDescriptions = @{
    "addToCart" = "Add product to cart"
    "createOrder" = "Create order"
    "getCartList" = "Get cart list"
    "getCategory" = "Get product categories"
    "getOrder" = "Get order details"
    "getProduct" = "Get product details"
    "getSubCategory" = "Get product subcategories"
    "myPay" = "Payment function"
    "removeCartItem" = "Remove item from cart"
    "updateCartItem" = "Update cart item"
    "updateOrder" = "Update order status"
}

# package.json template
$packageJsonTemplate = @"
{
  "name": "FUNCTION_NAME",
  "version": "1.0.0",
  "description": "FUNCTION_DESCRIPTION",
  "main": "index.js",
  "scripts": {},
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@alipay/faas-server-sdk": "latest"
  }
}
"@

# Check if running with admin privileges
function Check-AdminPrivileges {
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if (-not $isAdmin) {
        Write-Host "Warning: This script requires administrator privileges for proper dependency installation. Please right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
        return $false
    }
    return $true
}

# Check if cloud function directory exists
function Check-CloudFunctionExists {
    param (
        [string]$functionName
    )
    
    $path = "cloud/functions/$functionName"
    if (-not (Test-Path $path)) {
        Write-Host "Error: Cloud function '$functionName' does not exist" -ForegroundColor Red
        return $false
    }
    return $true
}

# Create package.json file
function Create-PackageJson {
    param (
        [string]$functionName,
        [bool]$force = $false
    )
    
    $path = "cloud/functions/$functionName"
    $packageJsonPath = "$path/package.json"
    
    # If force is true or package.json doesn't exist
    if ($force -or (-not (Test-Path $packageJsonPath))) {
        if ($force -and (Test-Path $packageJsonPath)) {
            Write-Host "  Recreating package.json..." -ForegroundColor Yellow
        } else {
            Write-Host "  Creating package.json..." -ForegroundColor Yellow
        }
        
        # Create package.json
        $description = if ($functionDescriptions[$functionName]) { $functionDescriptions[$functionName] } else { "$functionName function" }
        $content = $packageJsonTemplate.Replace("FUNCTION_NAME", $functionName).Replace("FUNCTION_DESCRIPTION", $description)
        
        try {
            $content | Out-File -FilePath $packageJsonPath -Encoding utf8 -Force
            Write-Host "  Created package.json successfully" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "  Failed to create package.json: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  package.json already exists" -ForegroundColor Green
        
        # Check if it contains required dependencies
        try {
            $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
            
            if (-not ($packageJson.dependencies.'@alipay/faas-server-sdk')) {
                Write-Host "  Warning: Missing @alipay/faas-server-sdk dependency, updating..." -ForegroundColor Yellow
                
                # Add dependency
                if (-not $packageJson.dependencies) {
                    $packageJson | Add-Member -MemberType NoteProperty -Name "dependencies" -Value @{"@alipay/faas-server-sdk" = "latest"}
                } else {
                    $packageJson.dependencies | Add-Member -MemberType NoteProperty -Name "@alipay/faas-server-sdk" -Value "latest" -Force
                }
                
                try {
                    $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $packageJsonPath -Encoding utf8
                    Write-Host "  Updated package.json" -ForegroundColor Green
                } catch {
                    Write-Host "  Failed to update package.json: $_" -ForegroundColor Red
                    return $false
                }
            }
            return $true
        } catch {
            Write-Host "  Failed to read package.json (possible encoding issue): $_" -ForegroundColor Red
            Write-Host "  Run 'recreate' action to fix this issue" -ForegroundColor Yellow
            return $false
        }
    }
}

# Install dependencies for a single cloud function
function Install-SingleFunction {
    param (
        [string]$functionName,
        [bool]$recreatePackageJson = $false
    )
    
    if (-not (Check-CloudFunctionExists $functionName)) {
        return $false
    }
    
    if ($recreatePackageJson) {
        if (-not (Create-PackageJson $functionName -force $true)) {
            return $false
        }
    } else {
        if (-not (Create-PackageJson $functionName)) {
            return $false
        }
    }
    
    $path = "cloud/functions/$functionName"
    Write-Host "Installing dependencies for '$functionName'..." -ForegroundColor Cyan
    
    try {
        # Save current directory
        $currentDir = Get-Location
        
        # Change to cloud function directory
        Set-Location $path
        
        # Install dependencies
        Write-Host "  Executing: npm install" -ForegroundColor Yellow
        $npmOutput = npm install 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Dependencies installed successfully!" -ForegroundColor Green
            $result = $true
        } else {
            Write-Host "  Failed to install dependencies, error code: $LASTEXITCODE" -ForegroundColor Red
            Write-Host "  Error message: $npmOutput" -ForegroundColor Red
            $result = $false
        }
        
        # Return to original directory
        Set-Location $currentDir
        return $result
    } catch {
        Write-Host "  Error occurred: $_" -ForegroundColor Red
        # Ensure return to original directory
        if ($currentDir) {
            Set-Location $currentDir
        }
        return $false
    }
}

# Check all cloud functions' package.json
function Check-AllPackageJson {
    $missingPackageJson = @()
    $updatedPackageJson = @()
    $errorPackageJson = @()
    
    foreach ($func in $cloudFunctions) {
        $path = "cloud/functions/$func"
        Write-Host "Checking: $func" -ForegroundColor Cyan
        
        if (-not (Test-Path $path)) {
            Write-Host "  Error: Cloud function directory does not exist" -ForegroundColor Red
            continue
        }
        
        $packageJsonPath = "$path/package.json"
        
        if (-not (Test-Path $packageJsonPath)) {
            $missingPackageJson += $func
            if (Create-PackageJson $func) {
                $updatedPackageJson += $func
            }
        } else {
            try {
                $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
                Write-Host "  package.json is valid" -ForegroundColor Green
            } catch {
                Write-Host "  Error: package.json has encoding issues" -ForegroundColor Red
                $errorPackageJson += $func
            }
        }
        
        Write-Host ""
    }
    
    Write-Host "Check completed!" -ForegroundColor Green
    Write-Host "Missing package.json: $($missingPackageJson.Count)" -ForegroundColor $(if ($missingPackageJson.Count -gt 0) { "Yellow" } else { "Green" })
    Write-Host "Error in package.json: $($errorPackageJson.Count)" -ForegroundColor $(if ($errorPackageJson.Count -gt 0) { "Red" } else { "Green" })
    
    if ($errorPackageJson.Count -gt 0) {
        Write-Host "`nTo fix package.json files with encoding issues, run:" -ForegroundColor Yellow
        Write-Host "  .\cloud-functions-manager.ps1 recreate" -ForegroundColor Yellow
    }
}

# Recreate all package.json files
function Recreate-AllPackageJson {
    $recreatedCount = 0
    $failedCount = 0
    
    foreach ($func in $cloudFunctions) {
        $path = "cloud/functions/$func"
        Write-Host "Processing: $func" -ForegroundColor Cyan
        
        if (-not (Test-Path $path)) {
            Write-Host "  Error: Cloud function directory does not exist" -ForegroundColor Red
            $failedCount++
            continue
        }
        
        if (Create-PackageJson $func -force $true) {
            $recreatedCount++
        } else {
            $failedCount++
        }
        
        Write-Host ""
    }
    
    Write-Host "Recreation completed!" -ForegroundColor Green
    Write-Host "Successfully recreated: $recreatedCount" -ForegroundColor Green
    Write-Host "Failed to recreate: $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })
}

# Install dependencies for all cloud functions
function Install-AllFunctions {
    param (
        [bool]$recreatePackageJson = $false
    )
    
    $isAdmin = Check-AdminPrivileges
    if (-not $isAdmin) {
        Write-Host "Press any key to continue installation attempt (may fail)..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    
    $successCount = 0
    $failCount = 0
    
    foreach ($func in $cloudFunctions) {
        $path = "cloud/functions/$func"
        Write-Host "Processing: $func" -ForegroundColor Cyan
        
        if (-not (Test-Path $path)) {
            Write-Host "  Error: Cloud function directory does not exist" -ForegroundColor Red
            $failCount++
            continue
        }
        
        if (Install-SingleFunction $func -recreatePackageJson $recreatePackageJson) {
            $successCount++
        } else {
            $failCount++
        }
        
        Write-Host ""
    }
    
    Write-Host "Installation summary:" -ForegroundColor Cyan
    Write-Host "  Success: $successCount" -ForegroundColor Green
    Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
    
    if ($failCount -gt 0) {
        Write-Host "`nIf installation failed, try these solutions:" -ForegroundColor Yellow
        Write-Host "1. Run PowerShell as Administrator" -ForegroundColor Yellow
        Write-Host "2. Clear npm cache: npm cache clean --force" -ForegroundColor Yellow
        Write-Host "3. Use Taobao mirror: npm config set registry https://registry.npmmirror.com" -ForegroundColor Yellow
        Write-Host "4. Manually enter each cloud function directory and run npm install" -ForegroundColor Yellow
    }
}

# Display help information
function Show-Help {
    Write-Host "Alipay Mini Program Cloud Functions Manager" -ForegroundColor Cyan
    Write-Host "Usage: .\cloud-functions-manager.ps1 [action] [functionName]" -ForegroundColor White
    Write-Host ""
    Write-Host "Available actions:" -ForegroundColor White
    Write-Host "  check              - Check all cloud functions' package.json files" -ForegroundColor White
    Write-Host "  create             - Create missing package.json files" -ForegroundColor White
    Write-Host "  recreate           - Recreate all package.json files (fixes encoding issues)" -ForegroundColor White
    Write-Host "  install            - Install dependencies for all cloud functions" -ForegroundColor White
    Write-Host "  install-single     - Install dependencies for a single cloud function (requires functionName)" -ForegroundColor White
    Write-Host "  help               - Display this help information" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\cloud-functions-manager.ps1 check" -ForegroundColor White
    Write-Host "  .\cloud-functions-manager.ps1 recreate" -ForegroundColor White
    Write-Host "  .\cloud-functions-manager.ps1 install" -ForegroundColor White
    Write-Host "  .\cloud-functions-manager.ps1 install-single getCategory" -ForegroundColor White
}

# Main logic
switch ($action) {
    "check" {
        Check-AllPackageJson
    }
    "create" {
        Check-AllPackageJson
    }
    "recreate" {
        Recreate-AllPackageJson
    }
    "install" {
        Install-AllFunctions
    }
    "install-single" {
        if (-not $functionName) {
            Write-Host "Error: Installing a single cloud function requires the functionName parameter" -ForegroundColor Red
            Write-Host "Usage: .\cloud-functions-manager.ps1 install-single functionName" -ForegroundColor Yellow
            Write-Host "Example: .\cloud-functions-manager.ps1 install-single getCategory" -ForegroundColor Yellow
            exit 1
        }
        
        if (-not ($cloudFunctions -contains $functionName)) {
            Write-Host "Error: Unknown cloud function '$functionName'" -ForegroundColor Red
            Write-Host "Available cloud functions: $($cloudFunctions -join ', ')" -ForegroundColor Yellow
            exit 1
        }
        
        Install-SingleFunction $functionName
    }
    default {
        Show-Help
    }
}

Write-Host "`nDone!" -ForegroundColor Green 