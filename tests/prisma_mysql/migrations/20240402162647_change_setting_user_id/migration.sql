/*
  Warnings:

  - You are about to drop the column `userId` on the `Setting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Setting` DROP FOREIGN KEY `Setting_userId_fkey`;

-- AlterTable
ALTER TABLE `Setting` DROP COLUMN `userId`,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Setting_user_id_key` ON `Setting`(`user_id`);

-- AddForeignKey
ALTER TABLE `Setting` ADD CONSTRAINT `Setting_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
