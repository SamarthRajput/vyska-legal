-- AlterEnum
ALTER TYPE "BlogStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "rejectionReason" TEXT;
