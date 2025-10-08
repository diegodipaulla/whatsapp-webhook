/*
  Warnings:

  - You are about to alter the column `payload` on the `WebhookQueue` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WebhookQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "whatsappAccountId" TEXT NOT NULL,
    CONSTRAINT "WebhookQueue_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "WhatsappAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WebhookQueue" ("createdAt", "id", "lastAttempt", "payload", "retryCount", "status", "updatedAt", "whatsappAccountId") SELECT "createdAt", "id", "lastAttempt", "payload", "retryCount", "status", "updatedAt", "whatsappAccountId" FROM "WebhookQueue";
DROP TABLE "WebhookQueue";
ALTER TABLE "new_WebhookQueue" RENAME TO "WebhookQueue";
CREATE TABLE "new_WhatsappAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wppId" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "WhatsappAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WhatsappAccount" ("createdAt", "id", "name", "updatedAt", "wppId") SELECT "createdAt", "id", "name", "updatedAt", "wppId" FROM "WhatsappAccount";
DROP TABLE "WhatsappAccount";
ALTER TABLE "new_WhatsappAccount" RENAME TO "WhatsappAccount";
CREATE UNIQUE INDEX "WhatsappAccount_wppId_key" ON "WhatsappAccount"("wppId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
