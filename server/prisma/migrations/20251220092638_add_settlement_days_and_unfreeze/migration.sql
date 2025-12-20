-- AlterTable
ALTER TABLE "commission_configs" ADD COLUMN     "settlement_days" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "unfreeze_at" TIMESTAMP(3),
ADD COLUMN     "unfrozen" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "wallet_transactions_type_unfrozen_unfreeze_at_idx" ON "wallet_transactions"("type", "unfrozen", "unfreeze_at");
