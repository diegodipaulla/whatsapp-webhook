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

    // --- Servir o Painel React ---
    const dashboardPath = path.join(__dirname, '..', 'dashboard', 'dist');
    app.use(express.static(dashboardPath));

    // --- Endpoints da API ---

    // Endpoint para o webhook da IA responder
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

    // Endpoints para o Painel
    app.get('/api/settings', async (req, res) => {
        try {
            const settings = await db.getAllSettings();
            res.status(200).json(settings);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/settings', async (req, res) => {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ success: false, error: 'Parâmetros "key" e "value" são obrigatórios.' });
        }
        try {
            const setting = await db.updateSetting(key, value);
            res.status(200).json({ success: true, setting });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/queue', async (req, res) => {
        try {
            const queue = await db.getQueuedWebhooks();
            res.status(200).json(queue);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/queue/retry/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await queueService.retryWebhook(id);
            if (result.success) {
                res.status(200).json({ success: true, message: `Webhook ${id} reenviado com sucesso.` });
            } else {
                res.status(400).json({ success: false, message: `Falha ao reenviar webhook ${id}: ${result.error}` });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.delete('/api/queue/:id', async (req, res) => {
        const { id } = req.params;
        try {
            await db.deleteQueuedWebhook(id);
            res.status(200).json({ success: true, message: `Webhook ${id} deletado da fila.` });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Rota catch-all para servir o index.html do React
    app.get('*', (req, res) => {
        res.sendFile(path.join(dashboardPath, 'index.html'));
    });

    const port = await db.getSetting('apiPort') || 3000;
    app.listen(port, () => {
        console.log(`Servidor de API e Painel rodando na porta ${port}`);
    });
}

module.exports = { startServer };