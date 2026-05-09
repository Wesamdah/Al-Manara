/*
  Warnings:

  - You are about to drop the column `carId` on the `Review` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_carId_fkey";

-- DropIndex
DROP INDEX "Review_carId_idx";

-- AlterTable
ALTER TABLE "Car" ALTER COLUMN "newArrivalExpiresAt" SET DEFAULT now() + interval '7 days';

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "carId";
