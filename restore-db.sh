#!/bin/bash

# 科科灵 - 数据库恢复脚本
# 用法: ./restore-db.sh <备份文件路径>

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
BACKUP_FILE="$1"

echo -e "${YELLOW}🔄 科科灵数据库恢复${NC}"
echo "================================"

# 检查参数
if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ 请指定备份文件路径${NC}"
    echo ""
    echo "用法: ./restore-db.sh <备份文件路径>"
    echo ""
    echo "可用的备份文件:"
    ls -lh ./backups/*.sql.gz 2>/dev/null || echo "  没有找到备份文件"
    exit 1
fi

# 检查文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ 备份文件不存在: $BACKUP_FILE${NC}"
    exit 1
fi

# 检查容器是否运行
if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo -e "${RED}❌ 数据库容器未运行${NC}"
    exit 1
fi

# 确认恢复
echo -e "${RED}⚠️  警告: 此操作将覆盖当前数据库中的所有数据！${NC}"
echo ""
read -p "确定要恢复吗? (输入 yes 确认): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}已取消恢复${NC}"
    exit 0
fi

# 执行恢复
echo ""
echo -e "${YELLOW}📦 正在恢复数据库...${NC}"

# 判断是否为 gzip 压缩文件
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME
else
    docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME < "$BACKUP_FILE"
fi

echo ""
echo -e "${GREEN}✅ 数据库恢复完成！${NC}"
