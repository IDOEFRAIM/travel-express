/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `University` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "University" DROP COLUMN "imageUrl",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "summary" TEXT;
