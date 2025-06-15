# Script PowerShell pour trouver l'IP et configurer l'environnement
Write-Host "🔍 DÉTECTION DE L'IP DE TON PC" -ForegroundColor Yellow

# Obtenir l'IP WiFi principale
$wifiAdapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up" -and $_.InterfaceDescription -like "*Wi-Fi*"}
if ($wifiAdapter) {
    $ip = (Get-NetIPAddress -InterfaceIndex $wifiAdapter.InterfaceIndex -AddressFamily IPv4).IPAddress
} else {
    # Fallback sur toute interface active
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -ne "127.0.0.1"})[0].IPAddress
}

if ($ip) {
    Write-Host "✅ IP trouvée: $ip" -ForegroundColor Green
    
    Write-Host "`n📝 Configuration suggérée pour .env:" -ForegroundColor Yellow
    Write-Host "EXPO_PUBLIC_HOST=$ip"
    Write-Host "EXPO_PUBLIC_API_URL=http://$ip:3000/api"
    Write-Host "EXPO_PUBLIC_WS_URL=ws://$ip:3000"
    
    Write-Host "`n🔧 Mise à jour automatique du .env..." -ForegroundColor Blue
    
    # Lire le fichier .env
    $envFile = ".\.env"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        
        # Remplacer les lignes
        $newContent = $content | ForEach-Object {
            if ($_ -match "^EXPO_PUBLIC_HOST=") {
                "EXPO_PUBLIC_HOST=$ip"
            } elseif ($_ -match "^EXPO_PUBLIC_API_URL=") {
                "EXPO_PUBLIC_API_URL=http://$ip:3000/api"
            } elseif ($_ -match "^EXPO_PUBLIC_WS_URL=") {
                "EXPO_PUBLIC_WS_URL=ws://$ip:3000"
            } else {
                $_
            }
        }
        
        # Sauvegarder
        $newContent | Set-Content $envFile
        Write-Host "✅ Fichier .env mis à jour!" -ForegroundColor Green
    } else {
        Write-Host "❌ Fichier .env non trouvé" -ForegroundColor Red
    }
    
    Write-Host "`n📱 Pour tester sur iPhone:" -ForegroundColor Yellow
    Write-Host "1. Assure-toi que ton iPhone et PC sont sur le même WiFi"
    Write-Host "2. Redémarre Expo avec: npx expo start -c"
    Write-Host "3. Scanne le QR code depuis ton iPhone"
    
} else {
    Write-Host "❌ Impossible de détecter l'IP automatiquement" -ForegroundColor Red
    Write-Host "Utilise 'ipconfig' manuellement" -ForegroundColor Yellow
}

Write-Host "`n✨ Script terminé!" -ForegroundColor Green
