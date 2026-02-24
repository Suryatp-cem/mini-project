/*
  Warnings:

  - You are about to drop the column `facultyComment` on the `application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "application" DROP COLUMN "facultyComment",
ADD COLUMN     "comment" TEXT;
