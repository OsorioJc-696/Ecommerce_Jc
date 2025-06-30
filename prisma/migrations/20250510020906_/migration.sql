-- AlterTable
ALTER TABLE `favorite` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `Favorite_userId_idx` ON `Favorite`(`userId`);

-- RenameIndex
ALTER TABLE `favorite` RENAME INDEX `Favorite_productId_fkey` TO `Favorite_productId_idx`;
