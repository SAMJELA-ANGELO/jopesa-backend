-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_batchId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "batchIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "registrationForm" JSONB,
ADD COLUMN     "targetAllBatches" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "batchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
