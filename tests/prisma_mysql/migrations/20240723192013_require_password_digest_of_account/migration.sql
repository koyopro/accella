/*
  Warnings:

  - Made the column `passwordDigest` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Account` MODIFY `passwordDigest` VARCHAR(191) NOT NULL;
