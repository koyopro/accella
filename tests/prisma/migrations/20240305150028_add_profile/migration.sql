-- CreateTable
CREATE TABLE "profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "description" TEXT DEFAULT 'I''m a Prisma user!',
    "point" INTEGER NOT NULL DEFAULT 100,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");
