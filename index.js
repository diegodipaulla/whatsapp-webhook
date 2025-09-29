require('dotenv').config(); // carrega variáveis do .env

const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

let lastMessage = null;

// HOST e PORT do .env
const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || 3000;

// Cliente WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "dremassist" }),
    puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu"
        ]
    }
});

// QR Code no terminal
client.on("qr", qr => {
    console.log("📲 Escaneie o QR Code abaixo para conectar no WhatsApp:");
    qrcode.generate(qr, { small: true });
});

// WhatsApp pronto
client.on("ready", () => {
    console.log("✅ WhatsApp conectado e pronto!");
});

// Recebendo mensagens
client.on("message", async msg => {
    console.log(`📩 Nova mensagem de ${msg.from}: ${msg.body || '[sem texto]'}`);

    const messageData = {
        typeWebhook: "incomingMessageReceived",
        instanceData: {
            idInstance: 1234567890, // substitua pelo seu ID real
            wid: msg.from,
            typeInstance: "whatsapp"
        },
        timestamp: msg.timestamp,
        idMessage: msg.id._serialized,
        senderData: {
            chatId: msg.from,
            chatName: "",
            sender: msg.from,
            senderName: msg._data.notifyName || msg.from,
            senderContactName: msg._data.notifyName || msg.from
        },
        messageData: {}
    };

    // Texto
    if (msg.type === "chat" || msg.type === "extendedTextMessage") {
        messageData.messageData = {
            typeMessage: "extendedTextMessage",
            extendedTextMessageData: {
                text: msg.body,
                description: "",
                title: "",
                previewType: "None",
                jpegThumbnail: "",
                forwardingScore: 0,
                isForwarded: false
            }
        };
    }

    // Mídia
    if (msg.hasMedia) {
        try {
            const media = await msg.downloadMedia();

            let typeMessage = "imageMessage";
            if (media.mimetype.startsWith("audio/")) typeMessage = "audioMessage";
            if (media.mimetype.startsWith("video/")) typeMessage = "videoMessage";
            if (media.mimetype.startsWith("application/")) typeMessage = "documentMessage";

            messageData.messageData = {
                typeMessage,
                mediaData: {
                    mimetype: media.mimetype,
                    filename: media.filename || "",
                    data: media.data
                }
            };
        } catch (err) {
            console.error("❌ Erro ao processar mídia:", err);
        }
    }

    lastMessage = messageData;
});

// Endpoint Webhook
app.get("/webhook", (req, res) => {
    if (!lastMessage) return res.json([]);

    const response = [
        {
            headers: req.headers,
            params: req.params,
            query: req.query,
            body: lastMessage,
            webhookUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
            executionMode: "test"
        }
    ];

    res.json(response);
});

// Inicia servidor usando HOST e PORT do .env
app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});

client.initialize();
