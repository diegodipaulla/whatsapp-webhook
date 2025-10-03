// This solves the "Do not know how to serialize a BigInt" error from Prisma
BigInt.prototype.toJSON = function() { return this.toString(); };

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../services/dbService');
const whatsappService = require('../services/whatsappService');
const queueService = require('../services/queueService');

async function startServer() {
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));

    // --- Serve o Painel React ---
    const dashboardPath = path.join(__dirname, '..', 'dashboard', 'dist');
    app.use(express.static(dashboardPath));

    // --- Middleware to get active account ---
    const getActiveAccount = (req, res, next) => {
        const accountId = whatsappService.getActiveAccountId();
        if (!accountId) {
            return res.status(400).json([]); 
        }
        req.accountId = accountId;
        next();
    };

    // --- Endpoints da API ---

    app.post('/reply', async (req, res) => {
        const { chatId, message } = req.body;
        if (!chatId || !message) {
            return res.status(400).json({ success: false, error: 'Parâmetros "chatId" e "message" são obrigatórios.' });
        }
        try {
            await whatsappService.sendMessage(chatId, message);
            res.status(200).json({ success: true, message: 'Resposta enviada com sucesso.' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // --- Dashboard API Endpoints ---

    app.get('/api/status', (req, res) => {
        const status = whatsappService.getStatus();
        res.status(200).json(status);
    });

    app.post('/api/session/logout', async (req, res) => {
        try {
            await whatsappService.logoutSession();
            res.status(200).json({ success: true, message: 'Sessão encerrada com sucesso.' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/session/start', async (req, res) => {
        try {
            whatsappService.startSession();
            res.status(202).json({ success: true, message: 'A inicialização da sessão foi solicitada.' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/settings', getActiveAccount, async (req, res) => {
        try {
            const settings = await db.getAllSettings(req.accountId);
            res.status(200).json(settings);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/settings', getActiveAccount, async (req, res) => {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ success: false, error: 'Parâmetros "key" e "value" são obrigatórios.' });
        }
        try {
            const setting = await db.updateSetting(req.accountId, key, value);
            res.status(200).json({ success: true, setting });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/messages/latest', getActiveAccount, async (req, res) => {
        try {
            const messages = await db.getLatestMessages(req.accountId, 10);
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/queue', getActiveAccount, async (req, res) => {
        try {
            const queue = await db.getQueuedWebhooks(req.accountId);
            res.status(200).json(queue);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/queue/retry/:id', getActiveAccount, async (req, res) => {
        const { id } = req.params;
        try {
            const item = await db.getQueuedItem(id);
            if (!item || item.whatsappAccountId !== req.accountId) {
                return res.status(404).json({ success: false, error: 'Item da fila não encontrado ou não pertence a esta conta.' });
            }
            // Non-blocking call to process the item
            queueService.processQueueItem(item);
            res.status(202).json({ success: true, message: `Retentativa do webhook ${id} solicitada.` });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.delete('/api/queue/:id', getActiveAccount, async (req, res) => {
        const { id } = req.params;
        try {
            // The DB service function already ensures account scoping
            await db.deleteQueuedWebhook(req.accountId, id);
            res.status(200).json({ success: true, message: `Webhook ${id} deletado da fila.` });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Rota catch-all para servir o index.html do React
    app.get('*', (req, res) => {
        res.sendFile(path.join(dashboardPath, 'index.html'));
    });

    const port = await db.getGlobalSetting('apiPort') || 3000;
    app.listen(port, () => {
        console.log(`Servidor de API e Painel rodando na porta ${port}`);
    });
}

module.exports = { startServer };