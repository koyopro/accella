-- CreateTable
CREATE TABLE "Author" (
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("firstName","lastName")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "authorFirstName" TEXT NOT NULL,
    "authorLastName" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_authorFirstName_authorLastName_fkey" FOREIGN KEY ("authorFirstName", "authorLastName") REFERENCES "Author"("firstName", "lastName") ON DELETE RESTRICT ON UPDATE CASCADE;
