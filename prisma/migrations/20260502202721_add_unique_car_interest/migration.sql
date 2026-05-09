/*
  Warnings:

  - A unique constraint covering the columns `[carId,email]` on the table `CarInterest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Car" ALTER COLUMN "newArrivalExpiresAt" SET DEFAULT now() + interval '7 days';

-- CreateIndex
CREATE UNIQUE INDEX "CarInterest_carId_email_key" ON "CarInterest"("carId", "email");
