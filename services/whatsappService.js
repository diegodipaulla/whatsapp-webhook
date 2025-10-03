const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const axios = require('axios');
const db = require('./dbService');
const fs = require('fs');

let activeSession = {
  accountId: null,
  client: null,
  status: {
    connected: false,
    qrCode: null,
    message: 'Serviço inativo.'
  }
};

function _resetSessionState(message = 'Sessão encerrada.') {
    activeSession.client = null;
    activeSession.accountId = null;
    activeSession.status = { connected: false, qrCode: null, message };
}

function findChromeOnWindows() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function startSession() {
  if (activeSession.client) {
    console.log('Uma sessão já está ativa ou em processo de inicialização.');
    return;
  }

  console.log('Iniciando nova sessão de WhatsApp...');
  const clientId = 'principal';
  const client = new Client({
    authStrategy: new LocalAuth({ clientId }),
    puppeteer: {
      headless: true,
      executablePath: findChromeOnWindows() || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  activeSession.client = client;
  activeSession.status.message = 'Inicializando cliente...';

  setupEventHandlers(client, clientId);

  try {
    await client.initialize();
  } catch (error) {
    console.error(`Falha CRÍTICA ao inicializar o cliente para ${clientId}:`, error);
    _resetSessionState(`Erro crítico: ${error.message}`);
  }
}

function setupEventHandlers(client, clientId) {
  client.on('qr', (qr) => {
    console.log(`[${clientId}] QR recebido. Escaneie com o WhatsApp.`);
    qrcodeTerminal.generate(qr, { small: true });
    activeSession.status = { connected: false, qrCode: qr, message: 'Por favor, escaneie o QR Code.' };
  });

  client.on('ready', async () => {
    console.log(`[${clientId}] Cliente pronto e conectado!`);
    const account = await db.findOrCreateAccount(client.info.wid._serialized, client.info.pushname);
    activeSession.accountId = account.id;
    activeSession.status = { connected: true, qrCode: null, message: 'Cliente conectado com sucesso.' };
  });

  client.on('disconnected', (reason) => {
    console.log(`[${clientId}] Cliente desconectado:`, reason);
    // Only reset the state. Don't call logoutSession from here to avoid race conditions.
    _resetSessionState(`Desconectado: ${reason}`);
  });

  client.on('auth_failure', (msg) => {
    console.error(`[${clientId}] Falha de autenticação:`, msg);
    _resetSessionState(`Falha de autenticação: ${msg}`);
  });

  client.on('message', async (message) => {
    // Ignore messages that have no body and no media
    if (!message.body && !message.hasMedia) return;
    if (!activeSession.accountId) return;

    let downloadedMedia = null;
    if (message.hasMedia) {
        try {
            downloadedMedia = await message.downloadMedia();
        } catch (error) {
            console.error(`[${clientId}] Falha ao baixar mídia:`, error);
        }
    }

    // Log the message with the (potentially null) media object
    await db.logMessage(activeSession.accountId, message, downloadedMedia);

    // Construct the webhook payload
    const payload = {
        chatId: message.from,
        timestamp: message.timestamp,
        body: message.body,
        hasMedia: message.hasMedia,
        media: downloadedMedia ? {
            mimetype: downloadedMedia.mimetype,
            filename: downloadedMedia.filename,
            data: downloadedMedia.data, // base64 encoded
        } : null,
    };

    const webhookUrl = await db.getSetting(activeSession.accountId, 'webhookUrl');

    if (!webhookUrl || webhookUrl.trim() === '') {
      return;
    }

    try {
      console.log(`[${clientId}] Enviando webhook para: ${webhookUrl}`);
      await axios.post(webhookUrl, payload);
    } catch (error) {
      console.error(`[${clientId}] Falha ao enviar webhook. Adicionando à fila.`);
      await db.createQueuedWebhook(activeSession.accountId, payload);
    }
  });
}

async function logoutSession() {
    if (!activeSession.client) return;
    const clientToDestroy = activeSession.client;

    console.log('Fazendo logout da sessão atual...');
    try {
        await clientToDestroy.logout();
    } catch (error) {
        console.error('Erro durante o logout (pode ser ignorado se for seguido por destroy):', error.message);
    }

    try {
        await clientToDestroy.destroy();
        console.log('Cliente destruído com sucesso.');
    } catch (error) {
        console.error('Erro ao destruir o cliente:', error.message);
    }
    
    // If the disconnected event didn't fire for some reason, reset state here anyway.
    if (activeSession.client) {
        _resetSessionState();
    }
}

async function sendMessage(chatId, message) {
  if (!activeSession.client || !activeSession.status.connected) {
    throw new Error('Cliente WhatsApp não está pronto ou conectado.');
  }
  await activeSession.client.sendMessage(chatId, message);
}

function getStatus() {
  return activeSession.status;
}

function getActiveAccountId() {
  return activeSession.accountId;
}

// For testing purposes only
function _resetState() {
    _resetSessionState('Serviço inativo.');
}

module.exports = { startSession, logoutSession, sendMessage, getStatus, getActiveAccountId, _resetState };