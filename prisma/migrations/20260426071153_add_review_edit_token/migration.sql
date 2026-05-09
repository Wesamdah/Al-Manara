/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `CarImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `CarImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "logoPublicId" TEXT;

-- AlterTable
ALTER TABLE "Car" ALTER COLUMN "newArrivalExpiresAt" SET DEFAULT now() + interval '7 days';

-- AlterTable
ALTER TABLE "CarImage" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "editTokenHash" VARCHAR(255),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CarImage_publicId_key" ON "CarImage"("publicId");
