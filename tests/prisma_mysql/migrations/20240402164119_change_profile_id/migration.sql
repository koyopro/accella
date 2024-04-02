/*
  Warnings:

  - The primary key for the `profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `_id` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `profiles` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`_id`);
