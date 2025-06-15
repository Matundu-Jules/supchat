# Script PowerShell pour détecter l'IP du PC et mettre à jour la configuration client-web

# Détection de l'IP
try {
    $HostIP = (Get-NetRoute -DestinationPrefix "0.0.0.0/0" | Get-NetIPAddress | Where-Object { $_.AddressFamily -eq "IPv4" -and $_.IPAddress -notlike "127.*" } | Select-Object -First 1).IPAddress
    
    if (-not $HostIP) {
        throw "IP non détectée automatiquement"
    }
} catch {
    Write-Host "Impossible de détecter l'IP automatiquement"
    $HostIP = Read-Host "Veuillez entrer l'IP du PC"
}

if (-not $HostIP) {
    Write-Host "Erreur : Impossible de déterminer l'IP" -ForegroundColor Red
    exit 1
}

Write-Host "IP détectée : $HostIP" -ForegroundColor Green

# Mise à jour du .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

# Lecture du contenu du .env
$envContent = Get-Content ".env"

# Mise à jour des URLs
$envContent = $envContent -replace "VITE_BACKEND_URL=.*", "VITE_BACKEND_URL=http://$HostIP:3000"
$envContent = $envContent -replace "VITE_API_URL=.*", "VITE_API_URL=http://$HostIP:3000"
$envContent = $envContent -replace "VITE_WEBSOCKET_URL=.*", "VITE_WEBSOCKET_URL=http://$HostIP:3000"
$envContent = $envContent -replace "VITE_GOOGLE_REDIRECT_URI=.*", "VITE_GOOGLE_REDIRECT_URI=http://$HostIP:3000/api/auth/google/callback"
$envContent = $envContent -replace "VITE_FACEBOOK_REDIRECT_URI=.*", "VITE_FACEBOOK_REDIRECT_URI=http://$HostIP:3000/api/auth/facebook/callback"

# Sauvegarde du fichier
$envContent | Set-Content ".env"

Write-Host "Configuration mise à jour avec l'IP : $HostIP" -ForegroundColor Green
Write-Host "Fichier .env mis à jour" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT :" -ForegroundColor Yellow
Write-Host "1. Assurez-vous que le serveur backend écoute sur 0.0.0.0:3000 et non localhost:3000"
Write-Host "2. Mettez à jour la configuration OAuth sur Google/Facebook avec les nouvelles URLs de redirection"
Write-Host "3. Redémarrez le serveur de développement : npm run dev"
