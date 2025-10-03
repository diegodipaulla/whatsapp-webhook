const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- Account Management ---
async function findOrCreateAccount(wppId, name) {
  try {
    const account = await prisma.whatsappAccount.upsert({
      where: { wppId },
      update: { name },
      create: { wppId, name },
    });
    await seedInitialSettings(account.id);
    return account;
  } catch (error) {
    console.error('Failed to find or create WhatsApp account:', error);
    throw error;
  }
}

// --- Settings Management (Per-Account) ---
async function seedInitialSettings(whatsappAccountId) {
  try {
    const webhookUrlSetting = await getSetting(whatsappAccountId, 'webhookUrl');
    if (webhookUrlSetting === null) {
      console.log(`Seeding initial webhookUrl for account ${whatsappAccountId}`);
      await updateSetting(whatsappAccountId, 'webhookUrl', '');
    }
  } catch (error) {
    console.error(`Failed to seed settings for account ${whatsappAccountId}:`, error);
  }
}

async function getSetting(whatsappAccountId, key) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key_whatsappAccountId: { key, whatsappAccountId } },
    });
    return setting ? setting.value : null;
  } catch (error) {
    console.error(`Failed to get setting '${key}' for account ${whatsappAccountId}:`, error);
    return null;
  }
}

async function getAllSettings(whatsappAccountId) {
  try {
    return await prisma.setting.findMany({ where: { whatsappAccountId } });
  } catch (error) {
    console.error(`Failed to get all settings for account ${whatsappAccountId}:`, error);
    return [];
  }
}

async function updateSetting(whatsappAccountId, key, value) {
  try {
    return await prisma.setting.upsert({
      where: { key_whatsappAccountId: { key, whatsappAccountId } },
      update: { value },
      create: { key, value, whatsappAccountId },
    });
  } catch (error) {
    console.error(`Failed to update setting '${key}' for account ${whatsappAccountId}:`, error);
    throw error;
  }
}

// --- Message Management (Per-Account) ---
async function logMessage(whatsappAccountId, message, downloadedMedia = null) {
  try {
    const contact = await prisma.contact.upsert({
      where: { chatId: message.from },
      update: { pushName: message._data.notifyName },
      create: { chatId: message.from, pushName: message._data.notifyName },
    });
    await prisma.message.create({
      data: {
        whatsappAccountId,
        contactId: contact.id,
        timestamp: message.timestamp,
        body: message.body,
        hasMedia: message.hasMedia,
        mediaMime: downloadedMedia ? downloadedMedia.mimetype : null,
        mediaFilename: downloadedMedia ? downloadedMedia.filename : null,
      },
    });
  } catch (error) {
    console.error(`Failed to log message for account ${whatsappAccountId}:`, error);
  }
}

async function getLatestMessages(whatsappAccountId, limit = 10) {
  try {
    return await prisma.message.findMany({
      where: { whatsappAccountId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { chat: true },
    });
  } catch (error) {
    console.error(`Failed to get latest messages for account ${whatsappAccountId}:`, error);
    return [];
  }
}

// --- Webhook Queue Management ---
async function createQueuedWebhook(whatsappAccountId, payload) {
  try {
    await prisma.webhookQueue.create({
      data: {
        whatsappAccountId,
        payload: JSON.stringify(payload),
      },
    });
    console.log(`Webhook queued for account ${whatsappAccountId}.`);
  } catch (error) {
    console.error(`Failed to queue webhook for account ${whatsappAccountId}:`, error);
  }
}

async function getQueuedWebhooks(whatsappAccountId) {
  try {
    return await prisma.webhookQueue.findMany({
      where: { whatsappAccountId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error(`Failed to get queued webhooks for account ${whatsappAccountId}:`, error);
    return [];
  }
}

async function deleteQueuedWebhook(whatsappAccountId, id) {
  try {
    await prisma.webhookQueue.deleteMany({
      where: { id, whatsappAccountId },
    });
  } catch (error) {
    console.error(`Failed to delete queued webhook ${id} for account ${whatsappAccountId}:`, error);
    throw error;
  }
}

async function getAllPendingWebhooks() {
    try {
        return await prisma.webhookQueue.findMany({ where: { status: 'PENDING' } });
    } catch (error) {
        console.error('Failed to get all pending webhooks:', error);
        return [];
    }
}

async function getQueuedItem(id) {
    try {
        return await prisma.webhookQueue.findUnique({ where: { id } });
    } catch (error) {
        console.error(`Failed to get queued item ${id}:`, error);
        return null;
    }
}

async function updateQueuedWebhook(id, data) {
  try {
    await prisma.webhookQueue.update({ where: { id }, data });
  } catch (error) {
    console.error(`Failed to update queued webhook ${id}:`, error);
  }
}

// --- Global (Non-Account-Specific) Functions ---
async function getGlobalSetting(key) {
    if (key === 'apiPort') return '3000';
    return null;
}

module.exports = {
  prisma,
  findOrCreateAccount,
  getSetting,
  getAllSettings,
  updateSetting,
  logMessage,
  getLatestMessages,
  createQueuedWebhook,
  getQueuedWebhooks,
  deleteQueuedWebhook,
  getAllPendingWebhooks,
  getQueuedItem,
  updateQueuedWebhook,
  getGlobalSetting,
};