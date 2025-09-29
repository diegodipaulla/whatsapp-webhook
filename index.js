// index.js
const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const puppeteer = require("puppeteer"); // Puppeteer completo

const app = express();
app.use(express.json());

let lastMessage = null;

// Configuração do WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "dremassist" }),
    puppeteer: {
        headless: true, // roda em background
        executablePath: puppeteer.executablePath(), // Chromium embutido
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

// Recebendo mensagens (texto, imagem ou áudio)
client.on("message", async msg => {
    console.log(`📩 Nova mensagem de ${msg.from}: ${msg.body || '[sem texto]'}`);

    let messageData = {
        from: msg.from,
        body: msg.body,
        timestamp: msg.timestamp,
        type: msg.type
    };

    // Se a mensagem contém mídia
    if (msg.hasMedia) {
        try {
            const media = await msg.downloadMedia();

            messageData.media = {
                mimetype: media.mimetype,
                filename: media.filename || 'sem-nome',
                size: Buffer.from(media.data, 'base64').length
            };

            // Validação básica
            if (media.mimetype.startsWith("image/")) {
                console.log("🖼️ Imagem recebida válida!");
            } else if (media.mimetype.startsWith("audio/")) {
                console.log("🎵 Áudio recebido válido!");
            } else {
                console.log(`📦 Outro tipo de mídia recebido: ${media.mimetype}`);
            }

        } catch (err) {
            console.error("❌ Erro ao processar mídia:", err);
        }
    }

    lastMessage = messageData;
});

// Endpoint para n8n
app.get("/webhook", (req, res) => {
    if (!lastMessage) return res.json({ status: "ok", message: "Nenhuma mensagem recebida ainda." });
    res.json(lastMessage);
});

// Inicia servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

// Inicializa o cliente WhatsApp
client.initialize();
