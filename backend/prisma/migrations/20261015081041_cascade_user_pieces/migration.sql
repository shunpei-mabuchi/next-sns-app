-- DropForeignKey
ALTER TABLE `Piece` DROP FOREIGN KEY `Piece_authorId_fkey`;

-- DropIndex
DROP INDEX `Piece_authorId_fkey` ON `Piece`;

-- AddForeignKey
ALTER TABLE `Piece` ADD CONSTRAINT `Piece_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
