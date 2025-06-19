#!/bin/bash

# Script pour basculer entre les configurations .env pour Docker et local

ENV_FILE=".env"
BACKUP_FILE=".env.local-backup"
DOCKER_CONFIG=$(cat << 'EOF'
# Variables modifiées pour Docker
VITE_BACKEND_URL=http://api:3000
VITE_API_URL=/api  
VITE_WEBSOCKET_URL=/socket.io
EXPO_PUBLIC_API_URL=http://api:3000/api
EXPO_PUBLIC_DEFAULT_HOST=api
EXPO_PUBLIC_DEFAULT_PORT=3000
EOF
)

case "$1" in
    "docker")
        echo "🐳 Configuration pour Docker..."
        # Sauvegarder les lignes actuelles
        grep "^VITE_BACKEND_URL\|^VITE_API_URL\|^VITE_WEBSOCKET_URL\|^EXPO_PUBLIC_API_URL\|^EXPO_PUBLIC_DEFAULT_HOST\|^EXPO_PUBLIC_DEFAULT_PORT" $ENV_FILE > $BACKUP_FILE 2>/dev/null || true
        
        # Remplacer les variables
        sed -i.bak \
            -e 's|^VITE_BACKEND_URL=.*|VITE_BACKEND_URL=http://api:3000|' \
            -e 's|^VITE_API_URL=.*|VITE_API_URL=/api|' \
            -e 's|^VITE_WEBSOCKET_URL=.*|VITE_WEBSOCKET_URL=/socket.io|' \
            -e 's|^EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://api:3000/api|' \
            -e 's|^EXPO_PUBLIC_DEFAULT_HOST=.*|EXPO_PUBLIC_DEFAULT_HOST=api|' \
            -e 's|^EXPO_PUBLIC_DEFAULT_PORT=.*|EXPO_PUBLIC_DEFAULT_PORT=3000|' \
            $ENV_FILE
        
        echo "✅ Configuration Docker appliquée"
        ;;
    "local")
        echo "🏠 Restauration configuration locale..."
        if [ -f $BACKUP_FILE ]; then
            # Restaurer depuis la sauvegarde
            while IFS= read -r line; do
                key=$(echo "$line" | cut -d'=' -f1)
                sed -i.bak "s|^$key=.*|$line|" $ENV_FILE
            done < $BACKUP_FILE
            rm $BACKUP_FILE
            echo "✅ Configuration locale restaurée"
        else
            echo "❌ Pas de sauvegarde trouvée"
        fi
        ;;
    *)
        echo "Usage: $0 {docker|local}"
        echo "  docker - Configure pour Docker"  
        echo "  local  - Restaure la configuration locale"
        exit 1
        ;;
esac
