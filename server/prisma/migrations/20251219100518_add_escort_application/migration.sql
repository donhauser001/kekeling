-- AlterTable
ALTER TABLE "services" ADD COLUMN     "content_type" TEXT NOT NULL DEFAULT 'richtext';

-- CreateTable
CREATE TABLE "escort_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "id_card" TEXT NOT NULL,
    "avatar" TEXT,
    "gender" TEXT NOT NULL DEFAULT 'unknown',
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "invite_code" TEXT,
    "inviter_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reject_reason" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "escort_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escort_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "escort_applications_escort_id_key" ON "escort_applications"("escort_id");

-- CreateIndex
CREATE INDEX "escort_applications_user_id_idx" ON "escort_applications"("user_id");

-- CreateIndex
CREATE INDEX "escort_applications_phone_idx" ON "escort_applications"("phone");

-- CreateIndex
CREATE INDEX "escort_applications_status_idx" ON "escort_applications"("status");

-- CreateIndex
CREATE INDEX "escort_applications_invite_code_idx" ON "escort_applications"("invite_code");

-- AddForeignKey
ALTER TABLE "escort_applications" ADD CONSTRAINT "escort_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escort_applications" ADD CONSTRAINT "escort_applications_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "escorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escort_applications" ADD CONSTRAINT "escort_applications_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
