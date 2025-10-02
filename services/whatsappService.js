const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const fs = require('fs');
const qrcode = require('qrcode');
const axios = require('axios');
const db = require('./dbService');

let client;

function findChromeOnWindows() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function initialize(win = null) {
    const chromePath = findChromeOnWindows();
    console.log('Usando navegador em:', chromePath || '(nenhum — usar Chromium empacotado)');

    client = new Client({
        authStrategy: new LocalAuth({ clientId: "whatsapp-session" }),
        puppeteer: {
            headless: true,
            executablePath: chromePath || undefined,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
    });

    // Handlers for UI communication
    client.on('qr', async (qr) => {
        console.log('QR recebido — escaneie com o WhatsApp:');
        qrcodeTerminal.generate(qr, { small: true });
        if (win) {
            try {
                const qrDataURL = await qrcode.toDataURL(qr);
                win.webContents.send('qr-code', qrDataURL);
            } catch (err) {
                console.error('Erro ao gerar DataURL do QR:', err);
            }
        }
    });

    client.on('ready', () => {
        console.log('Cliente pronto e conectado!');
        if (win) {
            win.webContents.send('connected');
            setTimeout(() => {
                if (win && !win.isDestroyed()) win.close();
            }, 3000);
        }
    });

    client.on('auth_failure', (msg) => {
        console.error('Falha de autenticação:', msg);
        if (win) win.webContents.send('auth-failure');
    });

    client.on('disconnected', (reason) => {
        console.log('Desconectado:', reason);
    });

    // === Webhook Logic ===
    client.on('message', async (message) => {
        if (message.body === null || message.body === '') return;
        
        // Salva a mensagem no banco de dados
        await db.logMessage(message);

        const payload = {
            chatId: message.from,
            timestamp: message.timestamp,
            body: message.body,
            hasMedia: message.hasMedia,
            media: null,
        };

        if (message.hasMedia) {
            try {
                const media = await message.downloadMedia();
                payload.media = {
                    mimetype: media.mimetype,
                    filename: media.filename,
                    data: media.data, // base64 encoded
                };
            } catch (error) {
                console.error('Falha ao baixar mídia:', error);
            }
        }

        try {
            const webhookUrl = await db.getSetting('webhookUrl');
            if (!webhookUrl) {
                console.warn('URL de webhook não configurada. Pulando envio.');
                return;
            }
            console.log('Enviando webhook para:', webhookUrl);
            await axios.post(webhookUrl, payload);
            console.log('Webhook enviado com sucesso.');
        } catch (error) {
            if (error.response) {
                // O servidor respondeu com um status de erro (4xx, 5xx)
                console.error(`Falha no webhook: Servidor respondeu com status ${error.response.status}`, error.response.data);
            } else if (error.request) {
                // A requisição foi feita mas não houve resposta (ex: ECONNREFUSED)
                console.error('Falha no webhook: Não foi possível conectar ao servidor. Adicionando à fila.', error.code);
                await db.createQueuedWebhook(payload);
            } else {
                // Erro ao configurar a requisição
                console.error('Falha no webhook: Erro ao configurar a requisição.', error.message);
            }
        }
    });

    try {
        console.log('Tentando inicializar o cliente WhatsApp...');
        await client.initialize();
        console.log('Cliente WhatsApp inicializado com sucesso.');
    } catch (error) {
        console.error('Falha CRÍTICA ao inicializar o cliente WhatsApp:', error);
        if (win) win.webContents.send('auth-failure');
    }
    
    return client;
}

async function sendMessage(chatId, message) {
    if (!client) {
        console.error('Erro: Cliente WhatsApp não inicializado.');
        throw new Error('WhatsApp client not ready.');
    }
    try {
        await client.sendMessage(chatId, message);
        console.log(`Mensagem de resposta enviada para ${chatId}`);
        return { success: true };
    } catch (error) {
        console.error(`Falha ao enviar mensagem para ${chatId}:`, error);
        throw new Error('Failed to send WhatsApp message.');
    }
}

module.exports = { initialize, sendMessage };