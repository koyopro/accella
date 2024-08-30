-- CreateTable
CREATE TABLE "Author" (
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    PRIMARY KEY ("firstName", "lastName")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "authorFirstName" TEXT NOT NULL,
    "authorLastName" TEXT NOT NULL,
    CONSTRAINT "Book_authorFirstName_authorLastName_fkey" FOREIGN KEY ("authorFirstName", "authorLastName") REFERENCES "Author" ("firstName", "lastName") ON DELETE RESTRICT ON UPDATE CASCADE
);
