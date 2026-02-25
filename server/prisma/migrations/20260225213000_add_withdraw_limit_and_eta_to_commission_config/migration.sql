-- 结算配置新增：单笔最高提现金额、预计到账时间（小时）
ALTER TABLE "commission_configs"
ADD COLUMN IF NOT EXISTS "max_withdraw_amount" DECIMAL(10,2) NOT NULL DEFAULT 50000;

ALTER TABLE "commission_configs"
ADD COLUMN IF NOT EXISTS "withdraw_estimated_hours" INTEGER NOT NULL DEFAULT 24;
