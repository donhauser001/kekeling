-- CreateTable
CREATE TABLE "withdraw_logs" (
    "id" TEXT NOT NULL,
    "withdraw_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "operator_id" TEXT,
    "operator_name" TEXT,
    "message" TEXT,
    "old_status" TEXT,
    "new_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdraw_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT,
    "admin_name" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_id" TEXT,
    "target_type" TEXT,
    "detail" TEXT,
    "filters" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "withdraw_logs_withdraw_id_created_at_idx" ON "withdraw_logs"("withdraw_id", "created_at");

-- CreateIndex
CREATE INDEX "admin_audit_logs_module_action_created_at_idx" ON "admin_audit_logs"("module", "action", "created_at");

-- CreateIndex
CREATE INDEX "admin_audit_logs_admin_id_created_at_idx" ON "admin_audit_logs"("admin_id", "created_at");

-- AddForeignKey
ALTER TABLE "withdraw_logs" ADD CONSTRAINT "withdraw_logs_withdraw_id_fkey" FOREIGN KEY ("withdraw_id") REFERENCES "withdrawals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
