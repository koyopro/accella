-- AlterTable
ALTER TABLE "_PostToPostTag" ADD CONSTRAINT "_PostToPostTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PostToPostTag_AB_unique";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "avatarPath" TEXT;
