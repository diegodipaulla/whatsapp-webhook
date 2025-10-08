# WhatsApp Webhook & Painel de Gerenciamento

Este projeto fornece uma solução abrangente para interagir com o WhatsApp. Ele possui um serviço de backend que se conecta ao WhatsApp via `whatsapp-web.js`, expõe uma API de webhook e pode ser executado como uma aplicação de desktop independente usando Electron. Ele também inclui um painel de controle web moderno construído com Next.js para gerenciar o serviço.

## ✨ Funcionalidades

- **Integração com WhatsApp:** Envie e receba mensagens, gerencie contatos e muito mais.
- **API de Webhook:** Receba eventos em tempo real do WhatsApp (novas mensagens, mudanças de status, etc.).
- **Pronto para Múltiplas Contas:** Projetado para lidar com múltiplas instâncias do WhatsApp.
- **Painel Web:** Uma interface amigável (construída com Next.js e TypeScript) para monitorar o status, enviar mensagens e gerenciar configurações.
- **Aplicação de Desktop:** Pode ser executado como um aplicativo de desktop usando Electron.
- **Seguro:** Usa JWT para autenticação e bcrypt para hashing de senhas.

## 🛠️ Tecnologias & Arquitetura

- **Backend:**
  - **Framework:** Node.js, Express.js
  - **Integração com WhatsApp:** `whatsapp-web.js`
  - **ORM de Banco de Dados:** Prisma
  - **Banco de Dados:** SQLite (padrão)
  - **App de Desktop:** Electron
- **Frontend (Painel):**
  - **Framework:** Next.js, React
  - **Linguagem:** TypeScript
  - **Estilização:** Tailwind CSS
- **Ferramentas do Monorepo:**
  - `concurrently` para executar múltiplos serviços.
  - `npm` para o projeto raiz e painel legado.
  - `pnpm` para o painel principal em Next.js.

### Estrutura do Projeto

```
.
├── api/                # Lógica do servidor da API Express
├── dashboard1/         # Painel web principal em Next.js
├── prisma/             # Schema e migrações do Prisma
├── services/           # Lógica de negócios (WhatsApp, BD, Autenticação)
├── .gitignore          # Arquivos ignorados pelo Git
├── electron.js         # Arquivo principal para a aplicação Electron
├── index.js            # Ponto de entrada principal para o serviço de backend
└── package.json        # Dependências e scripts do projeto
```

## 🚀 Começando

Siga estas instruções para obter uma cópia do projeto em funcionamento na sua máquina local para fins de desenvolvimento e teste.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior recomendado)
- [pnpm](https://pnpm.io/installation)

```bash
npm install -g pnpm
```

### Instalação & Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/ronaldobonifacio/whatsapp-webhook.git
    cd whatsapp-webhook
    ```

2.  **Instale as dependências da raiz:**
    Isso instalará as dependências para o backend, Electron, e também acionará o script `postinstall` para o painel legado.
    ```bash
    npm install
    ```

3.  **Instale as dependências do painel Next.js:**
    Navegue até o diretório `dashboard1` e use `pnpm`.
    ```bash
    cd dashboard1
    pnpm install
    cd ..
    ```

4.  **Configure o banco de dados:**
    Este comando aplicará quaisquer migrações de banco de dados pendentes.
    ```bash
    npx prisma migrate deploy
    ```

5.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto. Ele deve conter as seguintes variáveis. Por segurança, `JWT_SECRET` deve ser uma string longa e aleatória.
    ```env
    # .env

    # Uma chave secreta para assinar JSON Web Tokens
    JWT_SECRET=sua-chave-jwt-super-secreta-e-longa

    # Opcional: Você pode sobrescrever o caminho padrão do banco de dados
    # DATABASE_URL="file:./prisma/dev.db"
    ```

### Executando a Aplicação

O projeto está configurado para executar todos os serviços simultaneamente com um único comando.

-   **Para executar o serviço de backend E o painel Next.js juntos:**
    ```bash
    npm start
    ```
    Isso irá:
    - Iniciar o bot de backend em `http://localhost:3000` (ou conforme configurado).
    - Iniciar o painel Next.js em `http://localhost:3002`.

-   **Para executar apenas o backend:**
    ```bash
    npm run start:bot
    ```

-   **Para executar apenas o painel Next.js:**
    ```bash
    npm run start:dashboard1
    ```

-   **Para executar a aplicação de desktop:**
    ```bash
    npm run start:electron
    ```

## 🤝 Contribuindo

Contribuições, issues e solicitações de funcionalidades são bem-vindas! Sinta-se à vontade para verificar a [página de issues](https://github.com/ronaldobonifacio/whatsapp-webhook/issues).

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

---

# WhatsApp Webhook & Management Dashboard

This project provides a comprehensive solution for interacting with WhatsApp. It features a backend service that connects to WhatsApp via `whatsapp-web.js`, exposes a webhook API, and can be run as a standalone desktop application using Electron. It also includes a modern web dashboard built with Next.js for managing the service.

## ✨ Features

- **WhatsApp Integration:** Send and receive messages, manage contacts, and more.
- **Webhook API:** Receive real-time events from WhatsApp (new messages, status changes, etc.).
- **Multi-Account Ready:** Designed to handle multiple WhatsApp instances.
- **Web Dashboard:** A user-friendly interface (built with Next.js and TypeScript) to monitor status, send messages, and manage settings.
- **Desktop Application:** Can be run as a desktop app using Electron.
- **Secure:** Uses JWT for authentication and bcrypt for password hashing.

## 🛠️ Tech Stack & Architecture

- **Backend:**
  - **Framework:** Node.js, Express.js
  - **WhatsApp Integration:** `whatsapp-web.js`
  - **Database ORM:** Prisma
  - **Database:** SQLite (default)
  - **Desktop App:** Electron
- **Frontend (Dashboard):**
  - **Framework:** Next.js, React
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS
- **Monorepo Tools:**
  - `concurrently` to run multiple services.
  - `npm` for the root project and legacy dashboard.
  - `pnpm` for the main Next.js dashboard.

### Project Structure

```
.
├── api/                # Express API server logic
├── dashboard1/         # Main Next.js web dashboard
├── prisma/             # Prisma schema and migrations
├── services/           # Business logic (WhatsApp, DB, Auth)
├── .gitignore          # Files ignored by Git
├── electron.js         # Main file for the Electron application
├── index.js            # Main entry point for the backend service
└── package.json        # Project dependencies and scripts
```

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/installation)

```bash
npm install -g pnpm
```

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ronaldobonifacio/whatsapp-webhook.git
    cd whatsapp-webhook
    ```

2.  **Install root dependencies:**
    This will install dependencies for the backend, Electron, and also trigger the `postinstall` script for the legacy dashboard.
    ```bash
    npm install
    ```

3.  **Install Next.js dashboard dependencies:**
    Navigate to the `dashboard1` directory and use `pnpm`.
    ```bash
    cd dashboard1
    pnpm install
    cd ..
    ```

4.  **Set up the database:**
    This command will apply any pending database migrations.
    ```bash
    npx prisma migrate deploy
    ```

5.  **Configure Environment Variables:**
    Create a file named `.env` in the root of the project. It should contain the following variables. For security, `JWT_SECRET` should be a long, random string.
    ```env
    # .env

    # A secret key for signing JSON Web Tokens
    JWT_SECRET=your-super-secret-and-long-jwt-key

    # Optional: You can override the default database path
    # DATABASE_URL="file:./prisma/dev.db"
    ```

### Running the Application

The project is configured to run all services concurrently with a single command.

-   **To run the backend service AND the Next.js dashboard together:**
    ```bash
    npm start
    ```
    This will:
    - Start the backend bot on `http://localhost:3000` (or as configured).
    - Start the Next.js dashboard on `http://localhost:3002`.

-   **To run only the backend:**
    ```bash
    npm run start:bot
    ```

-   **To run only the Next.js dashboard:**
    ```bash
    npm run start:dashboard1
    ```

-   **To run the desktop application:**
    ```bash
    npm run start:electron
    ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ronaldobonifacio/whatsapp-webhook/issues).

## 📄 License

This project is licensed under the MIT License.