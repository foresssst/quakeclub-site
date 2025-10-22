#!/bin/bash

# Script de limpieza para VPS
# Ejecuta este script ANTES de hacer el deployment para limpiar datos residuales

echo "🧹 Iniciando limpieza de datos residuales en VPS..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio del proyecto (ajusta según tu path en VPS)
PROJECT_DIR="${1:-/home/quakeclub/quakeclub-site}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Error: El directorio $PROJECT_DIR no existe${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

echo -e "${YELLOW}📂 Limpiando archivos JSON de datos...${NC}"

# Crear directorio data si no existe
mkdir -p data

# Limpiar archivos JSON (dejándolos como arrays vacíos)
echo "[]" > data/clans.json
echo "[]" > data/clan-invitations.json
echo "[]" > data/clan-join-requests.json

echo -e "${GREEN}✅ Archivos JSON limpiados${NC}"

# Limpiar PostgreSQL
echo -e "${YELLOW}🗄️  Limpiando base de datos PostgreSQL...${NC}"

# Verificar si psql está disponible
if command -v psql &> /dev/null; then
    # Extraer datos de conexión del .env
    if [ -f .env ]; then
        # Leer DATABASE_URL del .env
        DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2 | tr -d '"')

        if [ -n "$DB_URL" ]; then
            echo "Limpiando base de datos..."

            # Ejecutar limpieza usando Prisma
            if command -v pnpm &> /dev/null; then
                pnpm prisma db execute --stdin <<SQL
DELETE FROM "ClanInvitation";
DELETE FROM "ClanMember";
DELETE FROM "Clan";
SQL
                echo -e "${GREEN}✅ Base de datos PostgreSQL limpiada${NC}"
            else
                echo -e "${YELLOW}⚠️  pnpm no encontrado, saltando limpieza de PostgreSQL${NC}"
                echo -e "${YELLOW}   Ejecuta manualmente desde la aplicación: POST /api/admin/cleanup-clans${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  psql no disponible, saltando limpieza directa de PostgreSQL${NC}"
    echo -e "${YELLOW}   Ejecuta manualmente desde la aplicación: POST /api/admin/cleanup-clans${NC}"
fi

echo ""
echo -e "${GREEN}✨ Limpieza completada exitosamente${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "1. Verifica que la base de datos PostgreSQL esté corriendo"
echo "2. Ejecuta: pnpm prisma db push (para sincronizar el schema)"
echo "3. Reinicia la aplicación: pm2 restart quakeclub"
echo "4. Opcionalmente, ejecuta desde el navegador: POST /api/admin/cleanup-clans"
echo ""
