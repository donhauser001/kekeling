ALTER TABLE "orders"
  ALTER COLUMN "hospital_id" DROP NOT NULL;

ALTER TABLE "orders"
  ADD COLUMN "hospital_mode" TEXT NOT NULL DEFAULT 'catalog',
  ADD COLUMN "hospital_name" TEXT,
  ADD COLUMN "hospital_province" TEXT,
  ADD COLUMN "hospital_city" TEXT,
  ADD COLUMN "doctor_name" TEXT;

UPDATE "orders"
SET "hospital_name" = h."name"
FROM "hospitals" h
WHERE "orders"."hospital_id" = h."id"
  AND "orders"."hospital_name" IS NULL;
