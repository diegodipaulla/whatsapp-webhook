const axios = require('axios');
const db = require('./dbService');

const RETRY_INTERVAL = 60 * 1000; // 60 segundos
const MAX_RETRIES = 5;

/**
 * Tenta reenviar um único webhook da fila.
 * Este item já contém o whatsappAccountId, então podemos usá-lo para buscar a configuração correta.
 * @param {import('@prisma/client').WebhookQueue} queuedItem
 */
async function processQueueItem(queuedItem) {
  const { id, payload, retryCount, whatsappAccountId } = queuedItem;

  const webhookUrl = await db.getSetting(whatsappAccountId, 'webhookUrl');
  if (!webhookUrl || webhookUrl.trim() === '') {
    console.warn(`[Queue] Webhook URL não configurada para a conta ${whatsappAccountId}. Item ${id} será marcado como FALHA.`);
    await db.updateQueuedWebhook(id, { status: 'FAILED' });
    return;
  }

  try {
    console.log(`[Queue] Retentativa de envio de webhook (ID: ${id})...`);
    const parsedPayload = JSON.parse(payload);
    await axios.post(webhookUrl, parsedPayload);

    await db.updateQueuedWebhook(id, { status: 'SUCCESS' });
    console.log(`[Queue] Webhook da fila (ID: ${id}) enviado com sucesso.`);

  } catch (error) {
    const newRetryCount = retryCount + 1;
    const status = newRetryCount >= MAX_RETRIES ? 'FAILED' : 'PENDING';

    console.error(`[Queue] Falha na retentativa do webhook (ID: ${id}). Tentativa ${newRetryCount}/${MAX_RETRIES}.`);

    await db.updateQueuedWebhook(id, {
      status,
      retryCount: newRetryCount,
      lastAttempt: new Date(),
    });
  }
}

/**
 * Busca e processa todos os webhooks pendentes de todas as contas.
 */
async function checkQueue() {
  console.log('[Queue] Verificando a fila de webhooks...');
  const pendingItems = await db.getAllPendingWebhooks();

  if (pendingItems.length === 0) {
    return; // Nada a fazer
  }

  console.log(`[Queue] Encontrados ${pendingItems.length} webhooks pendentes. Processando...`);
  for (const item of pendingItems) {
    await processQueueItem(item);
  }
}

/**
 * Inicia o processador da fila em um intervalo de tempo.
 */
function start() {
  console.log('[Queue] Iniciando serviço de fila de webhooks...');
  checkQueue();
  setInterval(checkQueue, RETRY_INTERVAL);
}

// A função retryWebhook foi removida daqui e sua lógica será movida para a camada da API.
module.exports = { start, processQueueItem };