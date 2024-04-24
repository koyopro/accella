-- CreateTable
CREATE TABLE `ValidateSample` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accepted` BOOLEAN NOT NULL,
    `pattern` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `size` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
