-- Migration: add Payment and Contribution related schema

-- CreateEnum PaymentStatus if not exists
DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'SUCCESSFUL', 'FAILED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum ContributionType if not exists
DO $$ BEGIN
    CREATE TYPE "ContributionType" AS ENUM ('EVENT_REGISTRATION', 'ANNUAL_FEE', 'GENERAL', 'PROJECT', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT NOT NULL,
        "transId" TEXT,
        "amount" INTEGER NOT NULL,
        "currency" TEXT DEFAULT 'XAF',
        "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
        "userId" TEXT,
        "email" TEXT,
        "externalId" TEXT,
        "reason" TEXT,
        "metadata" JSONB,
        "rawPayload" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_transId_key" ON "Payment"("transId");
CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");

-- Create Contribution and related tables
CREATE TABLE IF NOT EXISTS "Contribution" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ContributionType" NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContributionOption" (
    "id" TEXT NOT NULL,
    "contributionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "label" TEXT,
    CONSTRAINT "ContributionOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContributionPayment" (
    "id" TEXT NOT NULL,
    "contributionId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "payerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContributionPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContributionOption_contributionId_idx" ON "ContributionOption"("contributionId");
CREATE INDEX IF NOT EXISTS "ContributionPayment_contributionId_idx" ON "ContributionPayment"("contributionId");
CREATE INDEX IF NOT EXISTS "ContributionPayment_paymentId_idx" ON "ContributionPayment"("paymentId");

-- Add foreign keys safely
DO $$ BEGIN
    ALTER TABLE "ContributionOption" ADD CONSTRAINT "ContributionOption_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ContributionPayment" ADD CONSTRAINT "ContributionPayment_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "ContributionPayment" ADD CONSTRAINT "ContributionPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- End of migration