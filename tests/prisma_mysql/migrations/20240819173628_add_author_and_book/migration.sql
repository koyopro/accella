-- CreateTable
CREATE TABLE `Author` (
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`firstName`, `lastName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `authorFirstName` VARCHAR(191) NOT NULL,
    `authorLastName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_authorFirstName_authorLastName_fkey` FOREIGN KEY (`authorFirstName`, `authorLastName`) REFERENCES `Author`(`firstName`, `lastName`) ON DELETE RESTRICT ON UPDATE CASCADE;
