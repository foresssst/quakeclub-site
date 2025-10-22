#!/bin/bash

# Script de deployment para VPS
# Automatiza todo el proceso de actualización del proyecto

echo "🚀 Iniciando deployment en VPS..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración (ajusta según tu VPS)
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-tu-servidor.com}"
VPS_PROJECT_DIR="${VPS_PROJECT_DIR:-/home/quakeclub/quakeclub-site}"
PM2_APP_NAME="${PM2_APP_NAME:-quakeclub}"

echo -e "${BLUE}📋 Configuración:${NC}"
echo "   Usuario VPS: $VPS_USER"
echo "   Host VPS: $VPS_HOST"
echo "   Directorio: $VPS_PROJECT_DIR"
echo "   App PM2: $PM2_APP_NAME"
echo ""

# Función para ejecutar comandos en VPS
run_remote() {
    ssh "$VPS_USER@$VPS_HOST" "$1"
}

# 1. Hacer backup del .env actual en VPS
echo -e "${YELLOW}📦 Haciendo backup de .env...${NC}"
run_remote "cd $VPS_PROJECT_DIR && cp .env .env.backup-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || true"

# 2. Pull de los últimos cambios
echo -e "${YELLOW}📥 Actualizando código desde Git...${NC}"
run_remote "cd $VPS_PROJECT_DIR && git pull origin main"

# 3. Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
run_remote "cd $VPS_PROJECT_DIR && pnpm install"

# 4. Limpiar datos residuales
echo -e "${YELLOW}🧹 Limpiando datos residuales...${NC}"
run_remote "cd $VPS_PROJECT_DIR && bash scripts/cleanup-vps.sh $VPS_PROJECT_DIR"

# 5. Sincronizar schema de Prisma
echo -e "${YELLOW}🗄️  Sincronizando schema de base de datos...${NC}"
run_remote "cd $VPS_PROJECT_DIR && pnpm prisma generate && pnpm prisma db push"

# 6. Build del proyecto
echo -e "${YELLOW}🔨 Compilando proyecto...${NC}"
run_remote "cd $VPS_PROJECT_DIR && pnpm build"

# 7. Reiniciar aplicación con PM2
echo -e "${YELLOW}🔄 Reiniciando aplicación...${NC}"
run_remote "pm2 restart $PM2_APP_NAME || pm2 start ecosystem.config.js"
run_remote "pm2 save"

# 8. Verificar estado
echo -e "${YELLOW}✅ Verificando estado...${NC}"
run_remote "pm2 status $PM2_APP_NAME"

echo ""
echo -e "${GREEN}✨ Deployment completado exitosamente!${NC}"
echo ""
echo -e "${BLUE}🔗 Próximos pasos:${NC}"
echo "1. Verifica que la aplicación esté corriendo: pm2 logs $PM2_APP_NAME"
echo "2. Accede a tu sitio y verifica que todo funcione"
echo "3. Si es necesario, limpia los datos manualmente:"
echo "   curl -X POST http://localhost:3000/api/admin/cleanup-clans"
echo ""
