/*
  Warnings:

  - The primary key for the `cartitem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `items` on the `cartitem` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `cartitem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `userId` on the `cartitem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[userId,productId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `CartItem_userId_key` ON `cartitem`;

-- AlterTable
ALTER TABLE `cartitem` DROP PRIMARY KEY,
    DROP COLUMN `items`,
    ADD COLUMN `customizationDetails` VARCHAR(191) NULL,
    ADD COLUMN `giftWrap` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `productId` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE INDEX `CartItem_userId_idx` ON `CartItem`(`userId`);

-- CreateIndex
CREATE INDEX `CartItem_productId_idx` ON `CartItem`(`productId`);

-- CreateIndex
CREATE UNIQUE INDEX `CartItem_userId_productId_key` ON `CartItem`(`userId`, `productId`);

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
