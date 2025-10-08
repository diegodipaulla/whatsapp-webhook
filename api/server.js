// This solves the "Do not know how to serialize a BigInt" error from Prisma
BigInt.prototype.toJSON = function() { return this.toString(); };

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../services/dbService');
const whatsappService = require('../services/whatsappService');
const queueService = require('../services/queueService');
const { router: authRouter, authenticateToken } = require('./auth');

async function startServer() {
    const app = express();

    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3002',
      'http://192.168.0.12:3002',
      'https://v0.app',
      'https://js.stripe.com',
      /^https:\/\/preview-.*\.vusercontent\.net$/
    ];

    app.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        for (let i = 0; i < allowedOrigins.length; i++) {
          const allowedOrigin = allowedOrigins[i];
          if (typeof allowedOrigin === 'string' && allowedOrigin === origin) {
            return callback(null, true);
          }
          if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
            return callback(null, true);
          }
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    }));

    app.use(express.json({ limit: '50mb' }));

    // --- Auth Routes ---
    app.use('/api/auth', authRouter);

    // --- Serve o Painel React ---
    const dashboardPath = path.join(__dirname, '..', 'dashboard', 'dist');
    app.use(express.static(dashboardPath));

    // --- Middleware to get active whatsapp account ---
    const getActiveWhatsappAccount = async (req, res, next) => {
        const user = req.user;
        const activeAccount = await db.getActiveWhatsappAccount(user.id);
        if (!activeAccount) {
            return res.status(400).json({ error: 'No active WhatsApp account found.' }); 
        }
        req.accountId = activeAccount.id;
        next();
    };

    // --- API Endpoints ---

    app.post('/reply', authenticateToken, getActiveWhatsappAccount, async (req, res) => {
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

    app.get('/api/status', authenticateToken, getActiveWhatsappAccount, (req, res) => {
        const status = whatsappService.getStatus();
        res.status(200).json(status);
    });

    app.post('/api/session/logout', authenticateToken, async (req, res) => {
        try {
            await whatsappService.logoutSession();
            res.status(200).json({ success: true, message: 'Sessão encerrada com sucesso.' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/session/start', authenticateToken, async (req, res) => {
        try {
            whatsappService.startSession(req.user.id);
            res.status(202).json({ success: true, message: 'A inicialização da sessão foi solicitada.' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/whatsapp-accounts', authenticateToken, async (req, res) => {
        try {
            const accounts = await db.getWhatsappAccounts(req.user.id);
            res.status(200).json(accounts);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/whatsapp-accounts/:id/active', authenticateToken, async (req, res) => {
        try {
            await db.setActiveWhatsappAccount(req.user.id, req.params.id);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/settings', authenticateToken, getActiveWhatsappAccount, async (req, res) => {
        try {
            const settings = await db.getAllSettings(req.accountId);
            res.status(200).json(settings);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/settings', authenticateToken, getActiveWhatsappAccount, async (req, res) => {
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

    app.get('/api/messages/latest', authenticateToken, getActiveWhatsappAccount, async (req, res) => {
        try {
            const messages = await db.getLatestMessages(req.accountId, 10);
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/queue', authenticateToken, getActiveWhatsappAccount, async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const queue = await db.getQueuedWebhooks(req.accountId, page, pageSize);
            res.status(200).json(queue);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/queue/retry/:id', authenticateToken, getActiveWhatsappAccount, async (req, res) => {
        const { id } = req.params;
        try {
            const item = await db.getQueuedItem(id);
            if (!item || item.whatsappAccountId !== req.accountId) {
                return res.status(404).json({ success: false, error: 'Item da fila não encontrado ou não pertence a esta conta.' });
            }
            queueService.processQueueItem(item);
            res.status(202).json({ success: true, message: `Retentativa do webhook ${id} solicitada.` });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.delete('/api/queue/:id', authenticateToken, getActiveWhatsappAccount, async (req, res) => {
        const { id } = req.params;
        try {
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