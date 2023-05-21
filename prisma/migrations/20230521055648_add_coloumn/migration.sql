/*
  Warnings:

  - Added the required column `total_prompts` to the `gpt_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `gpt_logs` ADD COLUMN `total_prompts` TEXT NOT NULL;
