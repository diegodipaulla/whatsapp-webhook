const apiServer = require('./api/server');
const queueService = require('./services/queueService');

async function main() {
    try {
        // Inicia o servidor da API para receber respostas
        apiServer.startServer();

        // Inicia o processador da fila
        queueService.start();
        
    } catch (error) {
        console.error("Falha crítica ao inicializar a aplicação:", error);
    }
}

main();