/*
  Warnings:

  - You are about to drop the column `uploadedById` on the `Research` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Research` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Research` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Research" DROP CONSTRAINT "Research_userId_fkey";

-- AlterTable
ALTER TABLE "Research" DROP COLUMN "uploadedById",
DROP COLUMN "userId",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT,
ALTER COLUMN "fileUrl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
