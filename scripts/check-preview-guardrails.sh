#!/bin/bash
# =============================================================================
# 终端预览器护栏检查脚本
# =============================================================================
#
# 用途: CI 守门，确保分销中心/工作台安全护栏不被绕过
# 运行: npm run lint:preview-guard 或 bash scripts/check-preview-guardrails.sh
#
# 检查项:
#   1. 分销中心页面必须使用 PermissionPrompt
#   2. 分销中心页面必须有 enabled: isEscort 条件
#   3. 分销 API 禁止使用 userRequest
#   4. 工作台页面必须检查 effectiveViewerRole
#   5. escortRequest 接口禁止出现在营销中心页面
#
# =============================================================================

set -e

PREVIEW_DIR="src/components/terminal-preview"
DISTRIBUTION_PAGES="$PREVIEW_DIR/components/pages/distribution"
WORKBENCH_PAGES="$PREVIEW_DIR/components/pages/workbench"
API_FILE="$PREVIEW_DIR/api.ts"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo ""
echo "========================================"
echo "🔒 终端预览器护栏检查"
echo "========================================"
echo ""

# -----------------------------------------------------------------------------
# 检查 1: 分销中心页面必须使用 PermissionPrompt
# -----------------------------------------------------------------------------
echo "📋 检查 1: 分销中心页面 PermissionPrompt 使用..."

if [ -d "$DISTRIBUTION_PAGES" ]; then
  DIST_FILES=$(find "$DISTRIBUTION_PAGES" -name "*.tsx" -type f 2>/dev/null)
  
  for file in $DIST_FILES; do
    filename=$(basename "$file")
    # 跳过 index.ts
    if [[ "$filename" == "index.ts" ]]; then
      continue
    fi
    
    if ! grep -q "PermissionPrompt" "$file" 2>/dev/null; then
      echo -e "${RED}❌ $file 缺少 PermissionPrompt 组件${NC}"
      ((ERRORS++))
    else
      echo -e "${GREEN}✓ $filename - PermissionPrompt${NC}"
    fi
  done
else
  echo -e "${YELLOW}⚠️ 分销中心页面目录不存在: $DISTRIBUTION_PAGES${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# 检查 2: 分销中心页面必须有 enabled: isEscort
# -----------------------------------------------------------------------------
echo "📋 检查 2: 分销中心页面 enabled: isEscort 条件..."

if [ -d "$DISTRIBUTION_PAGES" ]; then
  DIST_FILES=$(find "$DISTRIBUTION_PAGES" -name "*.tsx" -type f 2>/dev/null)
  
  for file in $DIST_FILES; do
    filename=$(basename "$file")
    if [[ "$filename" == "index.ts" ]]; then
      continue
    fi
    
    # 检查是否有 useQuery（有 API 调用的页面才需要检查）
    if grep -q "useQuery" "$file" 2>/dev/null; then
      if ! grep -q "enabled.*isEscort\|enabled: isEscort" "$file" 2>/dev/null; then
        echo -e "${RED}❌ $file 有 useQuery 但缺少 enabled: isEscort${NC}"
        ((ERRORS++))
      else
        echo -e "${GREEN}✓ $filename - enabled: isEscort${NC}"
      fi
    else
      echo -e "${GREEN}✓ $filename - 无 useQuery，跳过${NC}"
    fi
  done
else
  echo -e "${YELLOW}⚠️ 分销中心页面目录不存在${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# 检查 3: 分销 API 禁止使用 userRequest
# -----------------------------------------------------------------------------
echo "📋 检查 3: 分销 API 禁止使用 userRequest..."

if [ -f "$API_FILE" ]; then
  # 查找分销相关函数中是否误用 userRequest
  if grep -n "getDistribution.*userRequest\|userRequest.*distribution" "$API_FILE" 2>/dev/null; then
    echo -e "${RED}❌ 分销 API 不允许使用 userRequest，必须使用 escortRequest${NC}"
    ((ERRORS++))
  else
    echo -e "${GREEN}✓ 分销 API 未使用 userRequest${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ API 文件不存在: $API_FILE${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# 检查 4: 工作台页面必须检查 effectiveViewerRole
# -----------------------------------------------------------------------------
echo "📋 检查 4: 工作台页面视角检查..."

if [ -d "$WORKBENCH_PAGES" ]; then
  WORKBENCH_FILES=$(find "$WORKBENCH_PAGES" -name "*.tsx" -type f 2>/dev/null)
  
  for file in $WORKBENCH_FILES; do
    filename=$(basename "$file")
    if [[ "$filename" == "index.ts" ]]; then
      continue
    fi
    
    if ! grep -q "effectiveViewerRole" "$file" 2>/dev/null; then
      echo -e "${YELLOW}⚠️ $filename 可能缺少 effectiveViewerRole 检查${NC}"
      ((WARNINGS++))
    else
      echo -e "${GREEN}✓ $filename - effectiveViewerRole${NC}"
    fi
  done
else
  echo -e "${YELLOW}⚠️ 工作台页面目录不存在: $WORKBENCH_PAGES${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# 检查 5: escortRequest 禁止出现在营销中心页面
# -----------------------------------------------------------------------------
echo "📋 检查 5: 营销中心页面禁止 escortRequest..."

MARKETING_PAGES="$PREVIEW_DIR/components/pages/marketing"

if [ -d "$MARKETING_PAGES" ]; then
  MARKETING_FILES=$(find "$MARKETING_PAGES" -name "*.tsx" -type f 2>/dev/null)
  
  for file in $MARKETING_FILES; do
    filename=$(basename "$file")
    
    if grep -q "escortRequest" "$file" 2>/dev/null; then
      echo -e "${RED}❌ $filename 不应使用 escortRequest，营销中心应使用 userRequest${NC}"
      ((ERRORS++))
    fi
  done
  
  if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ 营销中心页面未使用 escortRequest${NC}"
  fi
else
  echo -e "${GREEN}✓ 营销中心页面目录检查通过${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# 检查 6: 禁止在真实请求中使用 mock- 前缀的 token
# -----------------------------------------------------------------------------
echo "📋 检查 6: 检查 mock token 使用规范..."

if [ -f "$API_FILE" ]; then
  # 检查是否有正确的 mock token 检测逻辑
  MOCK_CHECKS=$(grep -c "startsWith('mock-')" "$API_FILE" 2>/dev/null || echo "0")
  
  if [ "$MOCK_CHECKS" -gt 0 ]; then
    echo -e "${GREEN}✓ 发现 $MOCK_CHECKS 处 mock token 检测逻辑${NC}"
  else
    echo -e "${YELLOW}⚠️ 未发现 mock token 检测逻辑${NC}"
    ((WARNINGS++))
  fi
fi

echo ""

# -----------------------------------------------------------------------------
# 检查 7: PreviewPage 类型与 renderPageContent 一致性
# -----------------------------------------------------------------------------
echo "📋 检查 7: PreviewPage 类型与 renderPageContent 一致性..."

TYPES_FILE="$PREVIEW_DIR/types.ts"
INDEX_FILE="$PREVIEW_DIR/index.tsx"

if [ -f "$TYPES_FILE" ] && [ -f "$INDEX_FILE" ]; then
  # 提取 PreviewPage 类型中的 page keys（只取 PreviewPage 定义区块内的）
  # 使用 awk 提取 export type PreviewPage = 到下一个 export 之间的内容
  PAGE_KEYS=$(awk '/export type PreviewPage/,/^export/' "$TYPES_FILE" | grep -E "^\s*\| '" | sed "s/.*'\([^']*\)'.*/\1/" | sort)
  
  # 提取 renderPageContent 中的 case 语句
  CASE_KEYS=$(grep -E "case '[^']+'" "$INDEX_FILE" | sed "s/.*case '\([^']*\)'.*/\1/" | sort | uniq)
  
  # 检查是否有遗漏
  MISSING=0
  for key in $PAGE_KEYS; do
    # 跳过非页面类型的 key（如 logo-only 等 BrandLayout 类型）
    if [[ "$key" == logo-* ]] || [[ "$key" == name-* ]]; then
      continue
    fi
    
    if ! echo "$CASE_KEYS" | grep -q "^${key}$"; then
      echo -e "${YELLOW}⚠️ PreviewPage 类型中有 '$key' 但 renderPageContent 无对应 case${NC}"
      ((WARNINGS++))
      ((MISSING++))
    fi
  done
  
  if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ PreviewPage 类型与 renderPageContent 一致${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ 类型文件或索引文件不存在${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# 汇总
# -----------------------------------------------------------------------------
echo "========================================"
echo "📊 检查结果汇总"
echo "========================================"
echo ""

if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ 错误: $ERRORS 项${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️ 警告: $WARNINGS 项${NC}"
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ 所有检查通过！${NC}"
fi

echo ""

# 错误时返回非零退出码（CI 会失败）
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}护栏检查失败，请修复上述错误后重试${NC}"
  exit 1
fi

echo -e "${GREEN}护栏检查完成${NC}"
exit 0

