const axios = require('axios');
const db = require('./dbService');

const RETRY_INTERVAL = 60 * 1000; // 60 segundos
const MAX_RETRIES = 5;

/**
 * Tenta reenviar um único webhook da fila.
 * @param {import('@prisma/client').WebhookQueue} queuedItem
 */
async function processQueueItem(queuedItem) {
  const webhookUrl = await db.getSetting('webhookUrl');
  if (!webhookUrl) {
    console.warn('URL de webhook não configurada. Pausando a fila.');
    return;
  }

  try {
    console.log(`Retentativa de envio de webhook (ID: ${queuedItem.id})...`);
    const payload = JSON.parse(queuedItem.payload);
    await axios.post(webhookUrl, payload);

    // Sucesso! Atualiza o status no DB
    await db.updateQueuedWebhook(queuedItem.id, { status: 'SUCCESS' });
    console.log(`Webhook da fila (ID: ${queuedItem.id}) enviado com sucesso.`);

  } catch (error) {
    const newRetryCount = queuedItem.retryCount + 1;
    const status = newRetryCount >= MAX_RETRIES ? 'FAILED' : 'PENDING';

    console.error(`Falha na retentativa do webhook (ID: ${queuedItem.id}). Tentativa ${newRetryCount}/${MAX_RETRIES}.`);

    await db.updateQueuedWebhook(queuedItem.id, {
      status,
      retryCount: newRetryCount,
      lastAttempt: new Date(),
    });
  }
}

/**
 * Força a retentativa de um webhook específico pelo ID.
 * @param {string} id O ID do webhook na fila.
 */
async function retryWebhook(id) {
    const queuedItem = await db.prisma.webhookQueue.findUnique({ where: { id } });
    if (!queuedItem) {
        return { success: false, error: 'Item não encontrado na fila.' };
    }
    return await processQueueItem(queuedItem);
}

/**
 * Busca e processa todos os webhooks pendentes.
 */
async function checkQueue() {
  console.log('Verificando a fila de webhooks...');
  const pending = await db.getPendingWebhooks();

  if (pending.length === 0) {
    console.log('Fila de webhooks está vazia.');
    return;
  }

  console.log(`Encontrados ${pending.length} webhooks pendentes. Processando...`);
  for (const item of pending) {
    await processQueueItem(item);
  }
}

/**
 * Inicia o processador da fila em um intervalo de tempo.
 */
function start() {
  console.log('Iniciando serviço de fila de webhooks...');
  // Executa uma vez ao iniciar e depois a cada X segundos
  checkQueue();
  setInterval(checkQueue, RETRY_INTERVAL);
}

module.exports = { start, retryWebhook };
