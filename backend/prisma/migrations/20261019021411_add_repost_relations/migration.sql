/*
  Warnings:

  - A unique constraint covering the columns `[userId,pieceId]` on the table `Repost` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Repost_userId_pieceId_key` ON `Repost`(`userId`, `pieceId`);

-- AddForeignKey
ALTER TABLE `Repost` ADD CONSTRAINT `Repost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Repost` ADD CONSTRAINT `Repost_pieceId_fkey` FOREIGN KEY (`pieceId`) REFERENCES `Piece`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
