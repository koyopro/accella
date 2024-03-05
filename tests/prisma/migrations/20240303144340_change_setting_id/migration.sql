/*
  Warnings:

  - The primary key for the `Setting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Setting` table. All the data in the column will be lost.
  - Added the required column `settingId` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Setting" (
    "settingId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "threshold" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Setting" ("createdAt", "threshold", "userId") SELECT "createdAt", "threshold", "userId" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
CREATE UNIQUE INDEX "Setting_userId_key" ON "Setting"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
