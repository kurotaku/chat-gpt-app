-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `chats_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `chats_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `subject_prompts` DROP FOREIGN KEY `subject_prompts_subject_id_fkey`;

-- AlterTable
ALTER TABLE `chats` MODIFY `user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_prompts` ADD CONSTRAINT `subject_prompts_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
