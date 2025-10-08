/*
  Warnings:

  - Made the column `userId` on table `WhatsappAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WhatsappAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wppId" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "WhatsappAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WhatsappAccount" ("active", "createdAt", "id", "name", "updatedAt", "userId", "wppId") SELECT "active", "createdAt", "id", "name", "updatedAt", "userId", "wppId" FROM "WhatsappAccount";
DROP TABLE "WhatsappAccount";
ALTER TABLE "new_WhatsappAccount" RENAME TO "WhatsappAccount";
CREATE UNIQUE INDEX "WhatsappAccount_wppId_key" ON "WhatsappAccount"("wppId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
