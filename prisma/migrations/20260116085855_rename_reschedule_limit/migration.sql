/*
  Warnings:

  - You are about to drop the column `noofrescheduled` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "noofrescheduled",
ADD COLUMN     "maxReschedules" INTEGER NOT NULL DEFAULT 2;
