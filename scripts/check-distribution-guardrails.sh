#!/bin/bash
# 分销中心护栏检查脚本
# 用于 CI 或本地一键检查分销中心代码规范
set -e

echo "🔍 检查分销中心护栏..."
echo ""

ERRORS=0

# 1. 禁用路径检查
echo "  [1/4] 检查禁用路径..."

# 检查 escort/distribution（缺少 -app 后缀）
if grep -r "escort/distribution" --include="*.ts" --include="*.tsx" src/ 2>/dev/null; then
  echo "❌ 发现禁用路径: escort/distribution（应为 escort-app/distribution）"
  ERRORS=$((ERRORS + 1))
fi

# 检查 escort-app/team
if grep -r "escort-app/team" --include="*.ts" --include="*.tsx" src/ 2>/dev/null; then
  echo "❌ 发现禁用路径: escort-app/team"
  ERRORS=$((ERRORS + 1))
fi

# 检查 distribution/team-members
if grep -r "distribution/team-members" --include="*.ts" --include="*.tsx" src/ 2>/dev/null; then
  echo "❌ 发现禁用路径: distribution/team-members（应为 distribution/members）"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "  ✅ 禁用路径检查通过"
fi

# 2. 通道检查
echo "  [2/4] 检查 userRequest 误用..."
CHANNEL_ERRORS=0

# 检查 distribution 相关文件中的 userRequest
if grep -r "userRequest" --include="*distribution*.ts" --include="*Distribution*.tsx" src/ 2>/dev/null; then
  echo "❌ 分销相关文件中发现 userRequest（应为 escortRequest）"
  CHANNEL_ERRORS=$((CHANNEL_ERRORS + 1))
fi

if [ $CHANNEL_ERRORS -eq 0 ]; then
  echo "  ✅ 通道检查通过"
else
  ERRORS=$((ERRORS + CHANNEL_ERRORS))
fi

# 3. promotionProgress 误用检查
echo "  [3/4] 检查 promotionProgress 误用..."
PROGRESS_ERRORS=0

# 检查 !promotionProgress 误用（0 会被当 falsy）
if grep -r "!promotionProgress" --include="*.tsx" src/ 2>/dev/null; then
  echo "❌ 发现 !promotionProgress 误用（0 会被当 falsy）"
  PROGRESS_ERRORS=$((PROGRESS_ERRORS + 1))
fi

if [ $PROGRESS_ERRORS -eq 0 ]; then
  echo "  ✅ promotionProgress 检查通过"
else
  ERRORS=$((ERRORS + PROGRESS_ERRORS))
fi

# 4. PermissionPrompt 一致性（仅提示，不阻断）
echo "  [4/4] 检查 PermissionPrompt 使用情况..."
PERMISSION_COUNT=$(grep -r "PermissionPrompt" --include="*Distribution*.tsx" src/ 2>/dev/null | wc -l || echo "0")
if [ "$PERMISSION_COUNT" -gt 0 ]; then
  echo "  ✅ 发现 $PERMISSION_COUNT 处 PermissionPrompt 使用"
else
  echo "  ⚠️ 未找到 PermissionPrompt 使用（分销页面创建后需检查）"
fi

echo ""

# 总结
if [ $ERRORS -gt 0 ]; then
  echo "❌ 护栏检查失败！发现 $ERRORS 个问题"
  exit 1
else
  echo "✅ 所有护栏检查通过！"
  exit 0
fi
