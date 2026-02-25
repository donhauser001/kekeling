-- 为陪诊员钱包提现账户补充开户名、开户行字段
ALTER TABLE "escort_wallets"
ADD COLUMN IF NOT EXISTS "withdraw_account_name" TEXT;

ALTER TABLE "escort_wallets"
ADD COLUMN IF NOT EXISTS "withdraw_bank_name" TEXT;
