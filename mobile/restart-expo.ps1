# Script PowerShell pour redémarrer Expo proprement
Write-Host "🔄 REDÉMARRAGE EXPO AVEC CACHE VIDÉ" -ForegroundColor Yellow

Write-Host "🛑 Arrêt d'Expo..." -ForegroundColor Yellow
# Tuer les processus Expo
Get-Process | Where-Object {$_.ProcessName -like "*expo*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "🗑️ Nettoyage du cache..." -ForegroundColor Yellow
# Nettoyer les caches
if (Test-Path ".expo") { Remove-Item ".expo" -Recurse -Force }
if (Test-Path "node_modules\.cache") { Remove-Item "node_modules\.cache" -Recurse -Force }

Write-Host "📋 Vérification de la configuration .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Fichier .env trouvé" -ForegroundColor Green
    Write-Host "Contenu actuel:"
    Get-Content ".env" | Where-Object {$_ -like "EXPO_PUBLIC*"}
} else {
    Write-Host "❌ Fichier .env non trouvé" -ForegroundColor Red
}

Write-Host "🚀 Redémarrage d'Expo avec cache vidé..." -ForegroundColor Yellow
npx expo start --clear

Write-Host "✨ Processus terminé!" -ForegroundColor Green
Write-Host "📱 Scanne le nouveau QR code depuis ton iPhone" -ForegroundColor Yellow
