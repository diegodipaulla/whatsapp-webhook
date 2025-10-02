const whatsappService = require('./services/whatsappService');
const apiServer = require('./api/server');
const db = require('./services/dbService');
const queueService = require('./services/queueService');

async function main() {
    try {
        // Garante que as configurações iniciais existam no DB
        await db.seedInitialSettings();

        // Inicia o servidor da API para receber respostas
        apiServer.startServer();

        // Inicia o processador da fila
        queueService.start();

        // Inicializa o cliente WhatsApp
        // A janela do Electron não é mais passada aqui
        await whatsappService.initialize(); 
        
    } catch (error) {
        console.error("Falha crítica ao inicializar a aplicação:", error);
    }
}

main();