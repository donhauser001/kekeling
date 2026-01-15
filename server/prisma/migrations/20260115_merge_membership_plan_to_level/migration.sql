-- 会员体系简化：合并 MembershipPlan 到 MembershipLevel
-- 设计说明：
--   - 会员卡类型 = 可直接购买的商品
--   - 一个用户只能持有一种会员卡，不可叠加
--   - 升级会员时折算剩余时长费用

-- =====================================================
-- 1. 为 MembershipLevel 添加新字段
-- =====================================================

-- 价格和时长
ALTER TABLE "membership_levels" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE "membership_levels" ADD COLUMN IF NOT EXISTS "original_price" DECIMAL(10, 2);
ALTER TABLE "membership_levels" ADD COLUMN IF NOT EXISTS "duration" INTEGER DEFAULT 30;

-- 展示相关
ALTER TABLE "membership_levels" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "membership_levels" ADD COLUMN IF NOT EXISTS "recommended" BOOLEAN DEFAULT false;

-- 将 benefits 改为可选（如果之前是必填的话）
-- ALTER TABLE "membership_levels" ALTER COLUMN "benefits" DROP NOT NULL;

-- =====================================================
-- 2. 从 MembershipPlan 迁移数据到 MembershipLevel
-- =====================================================

-- 如果有现有的 Plan 数据，可以选择性地迁移
-- 这里创建新的 Level 记录，每个 Plan 对应一条
-- INSERT INTO "membership_levels" (
--   id, name, code, price, original_price, duration, 
--   discount, description, recommended, sort, status,
--   icon, color, benefits, overtime_fee_waiver
-- )
-- SELECT 
--   gen_random_uuid(),
--   p.name,
--   CONCAT(l.code, '_', p.code),
--   p.price,
--   p.original_price,
--   p.duration,
--   l.discount,
--   p.description,
--   p.recommended,
--   p.sort,
--   p.status,
--   l.icon,
--   l.color,
--   l.benefits,
--   l.overtime_fee_waiver
-- FROM "membership_plans" p
-- JOIN "membership_levels" l ON p.level_id = l.id
-- WHERE NOT EXISTS (
--   SELECT 1 FROM "membership_levels" 
--   WHERE code = CONCAT(l.code, '_', p.code)
-- );

-- =====================================================
-- 3. 为 UserMembership 添加新字段
-- =====================================================

ALTER TABLE "user_memberships" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE "user_memberships" ADD COLUMN IF NOT EXISTS "duration" INTEGER DEFAULT 0;
ALTER TABLE "user_memberships" ADD COLUMN IF NOT EXISTS "upgrade_from" TEXT;
ALTER TABLE "user_memberships" ADD COLUMN IF NOT EXISTS "upgrade_credit" DECIMAL(10, 2) DEFAULT 0;

-- =====================================================
-- 4. 为 MembershipOrder 添加新字段
-- =====================================================

-- 新字段
ALTER TABLE "membership_orders" ADD COLUMN IF NOT EXISTS "level_name" TEXT DEFAULT '';
ALTER TABLE "membership_orders" ADD COLUMN IF NOT EXISTS "level_price" DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE "membership_orders" ADD COLUMN IF NOT EXISTS "upgrade_from_level_id" TEXT;
ALTER TABLE "membership_orders" ADD COLUMN IF NOT EXISTS "upgrade_from_level_name" TEXT;
ALTER TABLE "membership_orders" ADD COLUMN IF NOT EXISTS "upgrade_credit" DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE "membership_orders" ADD COLUMN IF NOT EXISTS "upgrade_remaining_days" INTEGER DEFAULT 0;

-- 将 plan_id 改为可选
ALTER TABLE "membership_orders" ALTER COLUMN "plan_id" DROP NOT NULL;

-- 迁移旧数据：将 plan_name/plan_price 复制到新字段
UPDATE "membership_orders" 
SET level_name = COALESCE(plan_name, ''),
    level_price = COALESCE(plan_price, 0)
WHERE level_name = '' OR level_name IS NULL;

-- =====================================================
-- 5. 更新现有 Level 数据（如果需要）
-- =====================================================

-- 为没有价格的 Level 设置默认值（防止显示异常）
UPDATE "membership_levels" 
SET price = 0, duration = 30 
WHERE price IS NULL OR price = 0;
