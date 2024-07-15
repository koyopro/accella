-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordDigest" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
