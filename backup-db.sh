#!/bin/bash

# 科科灵 - 数据库备份脚本
# 用法: ./backup-db.sh [备份目录]

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
CONTAINER_NAME="kekeling-postgres-dev"
DB_USER="kekeling"
DB_NAME="kekeling"
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/kekeling_backup_$TIMESTAMP.sql"

echo -e "${YELLOW}🗄️  科科灵数据库备份${NC}"
echo "================================"

# 检查容器是否运行
if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo -e "${RED}❌ 数据库容器未运行${NC}"
    exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 执行备份
echo -e "${YELLOW}📦 正在备份数据库...${NC}"
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE"

# 压缩备份
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# 获取文件大小
SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')

echo -e "${GREEN}✅ 备份完成！${NC}"
echo ""
echo -e "   📁 备份文件: $BACKUP_FILE"
echo -e "   📊 文件大小: $SIZE"
echo ""

# 清理旧备份（保留最近 10 个）
echo -e "${YELLOW}🧹 清理旧备份（保留最近 10 个）...${NC}"
cd "$BACKUP_DIR"
ls -t kekeling_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
BACKUP_COUNT=$(ls -1 kekeling_backup_*.sql.gz 2>/dev/null | wc -l)
echo -e "${GREEN}   当前共有 $BACKUP_COUNT 个备份文件${NC}"

echo ""
echo -e "${GREEN}💡 恢复命令: gunzip -c $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME${NC}"
