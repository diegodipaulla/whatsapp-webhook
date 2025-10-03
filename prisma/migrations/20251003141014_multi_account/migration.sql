/*
  Warnings:

  - Added the required column `whatsappAccountId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsappAccountId` to the `Setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsappAccountId` to the `WebhookQueue` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "WhatsappAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wppId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" BIGINT NOT NULL,
    "body" TEXT,
    "hasMedia" BOOLEAN NOT NULL,
    "mediaUrl" TEXT,
    "mediaMime" TEXT,
    "mediaFilename" TEXT,
    "isQueued" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "whatsappAccountId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    CONSTRAINT "Message_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "WhatsappAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("body", "contactId", "createdAt", "hasMedia", "id", "isQueued", "mediaFilename", "mediaMime", "mediaUrl", "timestamp") SELECT "body", "contactId", "createdAt", "hasMedia", "id", "isQueued", "mediaFilename", "mediaMime", "mediaUrl", "timestamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE TABLE "new_Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "whatsappAccountId" TEXT NOT NULL,
    CONSTRAINT "Setting_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "WhatsappAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Setting" ("createdAt", "id", "key", "updatedAt", "value") SELECT "createdAt", "id", "key", "updatedAt", "value" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
CREATE UNIQUE INDEX "Setting_key_whatsappAccountId_key" ON "Setting"("key", "whatsappAccountId");
CREATE TABLE "new_WebhookQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "whatsappAccountId" TEXT NOT NULL,
    CONSTRAINT "WebhookQueue_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "WhatsappAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WebhookQueue" ("createdAt", "id", "lastAttempt", "payload", "retryCount", "status", "updatedAt") SELECT "createdAt", "id", "lastAttempt", "payload", "retryCount", "status", "updatedAt" FROM "WebhookQueue";
DROP TABLE "WebhookQueue";
ALTER TABLE "new_WebhookQueue" RENAME TO "WebhookQueue";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappAccount_wppId_key" ON "WhatsappAccount"("wppId");
