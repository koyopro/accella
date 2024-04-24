-- CreateTable
CREATE TABLE "ValidateSample" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accepted" BOOLEAN NOT NULL,
    "pattern" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "size" TEXT NOT NULL
);
