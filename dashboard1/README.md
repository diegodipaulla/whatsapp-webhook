# WhatsApp Webhook Layout

Interface moderna para gerenciamento de webhooks do WhatsApp. Construído com Next.js, TypeScript e Tailwind CSS.

## Características

- **Interface Moderna**: Design limpo e responsivo inspirado no WhatsApp
- **Gerenciamento de Sessão**: Conecte via QR Code e gerencie sua sessão do WhatsApp
- **Fila de Webhooks**: Visualize e gerencie webhooks com retry automático
- **Configuração de Webhook**: Configure URLs de destino para receber mensagens
- **Mensagens em Tempo Real**: Visualize as últimas mensagens recebidas
- **Documentação Integrada**: Documentação completa da API

## Pré-requisitos

- Node.js 18+
- Backend WhatsApp rodando em `http://localhost:3001/api` (ou configure a variável `BACKEND_URL`)

## Instalação

1. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

2. Configure a URL do backend (opcional):
\`\`\`bash
# Crie um arquivo .env.local
echo "BACKEND_URL=http://localhost:3001/api" > .env.local
\`\`\`

3. Inicie o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

## Estrutura do Projeto

\`\`\`
├── app/
│   ├── api/proxy/              # Proxy para evitar CORS
│   ├── login/                  # Página de login
│   ├── dashboard/              # Dashboard principal
│   │   ├── page.tsx           # Configurações e status
│   │   ├── queue/             # Fila de webhooks
│   │   └── docs/              # Documentação
│   └── layout.tsx             # Layout principal
├── components/
│   └── formatted-whatsapp-text.tsx  # Formatação de texto WhatsApp
└── .env.local                 # Configurações locais
\`\`\`

## Uso

### 1. Login
- Acesse a página inicial
- Faça login (qualquer usuário/senha funciona no modo demo)

### 2. Conectar WhatsApp
- Na página de Configurações, clique em "Iniciar Nova Sessão"
- Escaneie o QR Code com seu WhatsApp
- Aguarde a conexão

### 3. Configurar Webhook
- Insira a URL do seu webhook
- Clique em "Salvar"
- As mensagens recebidas serão enviadas para essa URL

### 4. Gerenciar Fila
- Acesse a página "Fila"
- Visualize webhooks pendentes, com falha ou bem-sucedidos
- Reenvie ou delete webhooks conforme necessário

## API do Backend

O frontend espera que o backend tenha os seguintes endpoints:

### Status da Sessão
\`\`\`
GET /api/status
Response: { connected: boolean, qrCode: string | null, message: string }
\`\`\`

### Iniciar/Encerrar Sessão
\`\`\`
POST /api/session/start
POST /api/session/logout
\`\`\`

### Mensagens
\`\`\`
GET /api/messages/latest
Response: [{ id, body, contactId, createdAt, chat: { pushName } }]
\`\`\`

### Configurações
\`\`\`
GET /api/settings
Response: [{ key: string, value: string }]

POST /api/settings
Body: { key: string, value: string }
\`\`\`

### Fila de Webhooks
\`\`\`
GET /api/queue
Response: [{ id, status, retryCount, createdAt, payload }]

POST /api/queue/retry/:id
DELETE /api/queue/:id
\`\`\`

## Configuração do Backend

Para evitar problemas de CORS, o frontend usa rotas de proxy. Configure a variável de ambiente:

\`\`\`bash
# .env.local
BACKEND_URL=http://localhost:3001/api
\`\`\`

Se você estiver rodando o backend em outra porta ou domínio, atualize essa variável.

## Deploy

### Vercel

1. Faça push do código para o GitHub
2. Importe o projeto no Vercel
3. Configure a variável de ambiente `BACKEND_URL` apontando para seu backend
4. Deploy!

### Docker

\`\`\`bash
docker build -t whatsapp-webhook-layout .
docker run -p 3000:3000 -e BACKEND_URL=http://seu-backend:3001/api whatsapp-webhook-layout
\`\`\`

## Desenvolvimento

\`\`\`bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start
\`\`\`

## Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **QRCode.react** - Geração de QR Codes

## Licença

MIT License - use livremente para projetos pessoais ou comerciais.
