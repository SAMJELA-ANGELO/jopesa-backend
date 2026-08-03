-- AlterTable
ALTER TABLE "EventRegistration"
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';

ALTER TABLE "EventRegistration"
ADD COLUMN IF NOT EXISTS "paidAmount" DOUBLE PRECISION;

ALTER TABLE "EventRegistration"
ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT;

ALTER TABLE "EventRegistration"
ADD COLUMN IF NOT EXISTS "paymentHistory" JSONB;
