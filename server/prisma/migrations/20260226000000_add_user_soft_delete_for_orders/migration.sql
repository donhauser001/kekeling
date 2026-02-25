-- Add user-side soft delete support for orders
ALTER TABLE "orders"
ADD COLUMN "user_deleted_at" TIMESTAMP(3);

-- Speed up user order queries (visible orders only)
CREATE INDEX "orders_user_id_user_deleted_at_idx"
ON "orders"("user_id", "user_deleted_at");
