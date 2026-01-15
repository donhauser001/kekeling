-- AlterTable: 添加陪诊员申请新字段（#27 陪诊员注册字段补齐）
ALTER TABLE "escort_applications" ADD COLUMN IF NOT EXISTS "age" INTEGER;
ALTER TABLE "escort_applications" ADD COLUMN IF NOT EXISTS "hospitals" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "escort_applications" ADD COLUMN IF NOT EXISTS "departments" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "escort_applications" ADD COLUMN IF NOT EXISTS "specialties" TEXT;
ALTER TABLE "escort_applications" ADD COLUMN IF NOT EXISTS "service_areas" TEXT;
