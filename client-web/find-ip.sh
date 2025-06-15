#!/bin/bash
# Script pour détecter l'IP du PC et mettre à jour la configuration client-web

# Détection de l'IP
if command -v ip &> /dev/null; then
    # Linux avec ip command
    HOST_IP=$(ip route get 1.1.1.1 | head -1 | awk '{print $7}')
elif command -v ifconfig &> /dev/null; then
    # macOS/Linux avec ifconfig
    HOST_IP=$(ifconfig | grep -E "inet.*broadcast" | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
else
    echo "Impossible de détecter l'IP automatiquement"
    echo "Veuillez l'entrer manuellement :"
    read -p "IP du PC : " HOST_IP
fi

if [ -z "$HOST_IP" ]; then
    echo "Erreur : Impossible de déterminer l'IP"
    exit 1
fi

echo "IP détectée : $HOST_IP"

# Mise à jour du .env
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Mise à jour des URLs
sed -i.bak "s|VITE_BACKEND_URL=.*|VITE_BACKEND_URL=http://$HOST_IP:3000|g" .env
sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=http://$HOST_IP:3000|g" .env
sed -i.bak "s|VITE_WEBSOCKET_URL=.*|VITE_WEBSOCKET_URL=http://$HOST_IP:3000|g" .env
sed -i.bak "s|VITE_GOOGLE_REDIRECT_URI=.*|VITE_GOOGLE_REDIRECT_URI=http://$HOST_IP:3000/api/auth/google/callback|g" .env
sed -i.bak "s|VITE_FACEBOOK_REDIRECT_URI=.*|VITE_FACEBOOK_REDIRECT_URI=http://$HOST_IP:3000/api/auth/facebook/callback|g" .env

echo "Configuration mise à jour avec l'IP : $HOST_IP"
echo "Fichier .env mis à jour"
echo ""
echo "IMPORTANT :"
echo "1. Assurez-vous que le serveur backend écoute sur 0.0.0.0:3000 et non localhost:3000"
echo "2. Mettez à jour la configuration OAuth sur Google/Facebook avec les nouvelles URLs de redirection"
echo "3. Redémarrez le serveur de développement : npm run dev"
