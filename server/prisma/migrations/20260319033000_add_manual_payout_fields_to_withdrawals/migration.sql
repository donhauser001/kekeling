ALTER TABLE "withdrawals"
ADD COLUMN "payout_account" TEXT,
ADD COLUMN "payout_remark" TEXT,
ADD COLUMN "payout_proof_urls" JSONB,
ADD COLUMN "payout_operator_id" TEXT,
ADD COLUMN "payout_operator_name" TEXT;
