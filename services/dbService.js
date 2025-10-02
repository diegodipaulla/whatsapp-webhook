const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Valores padrão do config.json antigo
const defaultConfig = {
  webhookUrl: "http://localhost:5001/webhook",
  apiPort: 3000
};

/**
 * Garante que as configurações iniciais existam no banco de dados.
 */
async function seedInitialSettings() {
  try {
    const webhookUrlSetting = await prisma.setting.findUnique({
      where: { key: 'webhookUrl' },
    });

    if (!webhookUrlSetting) {
      console.log('Populando configuração inicial de webhookUrl no banco de dados...');
      await prisma.setting.create({
        data: { key: 'webhookUrl', value: defaultConfig.webhookUrl },
      });
    }

    const apiPortSetting = await prisma.setting.findUnique({
      where: { key: 'apiPort' },
    });

    if (!apiPortSetting) {
      console.log('Populando configuração inicial de apiPort no banco de dados...');
      await prisma.setting.create({
        data: { key: 'apiPort', value: String(defaultConfig.apiPort) },
      });
    }
  } catch (error) {
    console.error('Falha ao popular configurações iniciais:', error);
  }
}

/**
 * Busca uma configuração pelo seu nome (key).
 * @param {string} key A chave da configuração (ex: 'webhookUrl').
 * @returns {Promise<string | null>}
 */
async function getSetting(key) {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting ? setting.value : null;
  } catch (error) {
    console.error(`Falha ao buscar configuração '${key}':`, error);
    return null;
  }
}

/**
 * Busca todas as configurações.
 * @returns {Promise<import('@prisma/client').Setting[]>}
 */
async function getAllSettings() {
  try {
    return await prisma.setting.findMany();
  } catch (error) {
    console.error('Falha ao buscar todas as configurações:', error);
    return [];
  }
}

/**
 * Atualiza uma configuração.
 * @param {string} key A chave da configuração.
 * @param {string} value O novo valor.
 * @returns {Promise<import('@prisma/client').Setting>}
 */
async function updateSetting(key, value) {
  try {
    return await prisma.setting.update({ where: { key }, data: { value } });
  } catch (error) {
    console.error(`Falha ao atualizar a configuração '${key}':`, error);
    throw error;
  }
}

/**
 * Cria ou atualiza um contato e salva a mensagem recebida.
 * @param {object} message A mensagem recebida do whatsapp-web.js.
 */
async function logMessage(message) {
  try {
    const contact = await prisma.contact.upsert({
      where: { chatId: message.from },
      update: {},
      create: {
        chatId: message.from,
        pushName: message._data.notifyName,
      },
    });

    await prisma.message.create({
      data: {
        contactId: contact.id,
        timestamp: message.timestamp,
        body: message.body,
        hasMedia: message.hasMedia,
        mediaMime: message.hasMedia ? (await message.downloadMedia()).mimetype : null,
        // Não salvamos a mídia no DB, apenas metadados.
      },
    });
  } catch (error) {
    console.error('Falha ao salvar mensagem no banco de dados:', error);
  }
}

/**
 * Adiciona um webhook que falhou na fila para tentativa posterior.
 * @param {object} payload O corpo do webhook que falhou.
 */
async function createQueuedWebhook(payload) {
  try {
    await prisma.webhookQueue.create({
      data: {
        payload: JSON.stringify(payload),
      },
    });
    console.log('Webhook adicionado à fila de retentativas.');
  } catch (error) {
    console.error('Falha ao adicionar webhook na fila:', error);
  }
}

/**
 * Busca todos os webhooks na fila.
 * @returns {Promise<import('@prisma/client').WebhookQueue[]>}
 */
async function getQueuedWebhooks() {
  try {
    return await prisma.webhookQueue.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Falha ao buscar webhooks na fila:', error);
    return [];
  }
}


/**
 * Busca todos os webhooks com status PENDING.
 * @returns {Promise<import('@prisma/client').WebhookQueue[]>}
 */
async function getPendingWebhooks() {
  try {
    return await prisma.webhookQueue.findMany({
      where: { status: 'PENDING' },
    });
  } catch (error) {
    console.error('Falha ao buscar webhooks pendentes:', error);
    return [];
  }
}

/**
 * Deleta um webhook da fila.
 * @param {string} id O ID do item na fila.
 */
async function deleteQueuedWebhook(id) {
  try {
    await prisma.webhookQueue.delete({ where: { id } });
  } catch (error) {
    console.error(`Falha ao deletar o webhook da fila ${id}:`, error);
    throw error;
  }
}

/**
 * Atualiza o status de um item da fila de webhooks.
 * @param {string} id O ID do item na fila.
 * @param {object} data Os dados para atualizar (status, retryCount, lastAttempt).
 */
async function updateQueuedWebhook(id, data) {
  try {
    await prisma.webhookQueue.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error(`Falha ao atualizar item da fila ${id}:`, error);
  }
}

module.exports = {
  prisma,
  seedInitialSettings,
  getSetting,
  getAllSettings,
  updateSetting,
  logMessage,
  createQueuedWebhook,
  getQueuedWebhooks,
  getPendingWebhooks,
  deleteQueuedWebhook,
  updateQueuedWebhook,
};
