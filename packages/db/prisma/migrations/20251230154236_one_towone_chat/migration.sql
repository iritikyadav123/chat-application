/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chatId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Chat` table. All the data in the column will be lost.
  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adminId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Room` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `UserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `avtar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `RoomMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userAId,userBId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Chat` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `senderId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Room` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userAId` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userBId` to the `Room` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_adminId_fkey";

-- DropForeignKey
ALTER TABLE "RoomMember" DROP CONSTRAINT "RoomMember_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomMember" DROP CONSTRAINT "RoomMember_userId_fkey";

-- DropIndex
DROP INDEX "Chat_userId_idx";

-- DropIndex
DROP INDEX "Room_slug_key";

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
DROP COLUMN "chatId",
DROP COLUMN "userId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
DROP COLUMN "adminId",
DROP COLUMN "roomId",
DROP COLUMN "slug",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "userAId" TEXT NOT NULL,
ADD COLUMN     "userBId" TEXT NOT NULL,
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "UserId",
DROP COLUMN "avtar",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "RoomMember";

-- CreateIndex
CREATE INDEX "Chat_senderId_idx" ON "Chat"("senderId");

-- CreateIndex
CREATE INDEX "Room_userAId_idx" ON "Room"("userAId");

-- CreateIndex
CREATE INDEX "Room_userBId_idx" ON "Room"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_userAId_userBId_key" ON "Room"("userAId", "userBId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
