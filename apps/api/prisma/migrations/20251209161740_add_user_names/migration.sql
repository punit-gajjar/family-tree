-- AlterTable
ALTER TABLE `members` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `contactNumber` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `nativePlace` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL;
