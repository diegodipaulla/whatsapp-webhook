const whatsappService = require('./services/whatsappService');
const apiServer = require('./api/server');
const db = require('./services/dbService');
const queueService = require('./services/queueService');

async function main() {
    try {
        // Inicia o servidor da API para receber respostas
        apiServer.startServer();

        // Inicia o processador da fila
        queueService.start();

        // Inicializa a sessão principal do WhatsApp
        await whatsappService.startSession(); 
        
    } catch (error) {
        console.error("Falha crítica ao inicializar a aplicação:", error);
    }
}

main();