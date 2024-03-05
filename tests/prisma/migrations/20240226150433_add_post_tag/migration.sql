-- CreateTable
CREATE TABLE "PostTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PostToPostTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PostToPostTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PostToPostTag_B_fkey" FOREIGN KEY ("B") REFERENCES "PostTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_PostToPostTag_AB_unique" ON "_PostToPostTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PostToPostTag_B_index" ON "_PostToPostTag"("B");
